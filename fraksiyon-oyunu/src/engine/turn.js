import { getCardById } from '../data/policyCards.js'
import { applyFactionAction } from './factionRules.js'
import { runEconomyStep } from './economy.js'
import { checkCrisis } from './crisis.js'
import { evaluateWinConditions, evaluateStalemateWinner } from './winConditions.js'
import { decideCard, decideActions } from '../ai/decide.js'
import { dealHand } from './state.js'
import { createRng } from './helpers.js'
import { FACTION_IDS, FACTIONS } from '../data/factions.js'

const FACTION_NAMES = Object.fromEntries(FACTION_IDS.map((id) => [id, FACTIONS[id].shortName]))

export function resolveTurn(state) {
  const draft = structuredClone(state)
  const log = []

  for (const id of FACTION_IDS) {
    const f = draft.factions[id]
    if (f.isAI) {
      f.selectedCardId = decideCard(state, id)
      f.pendingAction = decideActions(state, id)
    }
  }

  // Bir önceki turdan devralınan eylem puanı bonusu bu turun bütçesi için zaten kullanıldı
  // (UI/AI pendingAction'ı bu değere göre oluşturdu) - şimdi tüketildi sayılır.
  // "Grev Hakkı Genişletme" kartı bu turda oynanırsa aşağıdaki kart etkisi bir SONRAKİ tur için yeniden ayarlar.
  draft.factions.halk.bonusActionPoints = 0

  const devlet = draft.factions.devlet
  if (devlet.queuedAction && devlet.queuedAction.length > 0) {
    for (const act of devlet.queuedAction) {
      applyFactionAction(draft, 'devlet', act.actionKey, act.params)
    }
    log.push(`${FACTION_NAMES.devlet}: geçen turun bütçe kararı yürürlüğe girdi.`)
  }
  devlet.queuedAction = null

  for (const id of FACTION_IDS) {
    const f = draft.factions[id]
    if (!f.selectedCardId) continue
    const card = getCardById(f.selectedCardId)
    if (card) {
      card.effect(draft, id)
      log.push(`${FACTION_NAMES[id]}: "${card.name}" kartını oynadı.`)
    }
  }

  for (const id of FACTION_IDS) {
    const f = draft.factions[id]
    if (!f.pendingAction || f.pendingAction.length === 0) continue
    if (id === 'devlet') {
      draft.factions.devlet.queuedAction = f.pendingAction
      log.push(`${FACTION_NAMES.devlet}: yeni bütçe kararı kuyruğa alındı (gelecek tur uygulanacak).`)
      continue
    }
    for (const act of f.pendingAction) {
      applyFactionAction(draft, id, act.actionKey, act.params)
    }
    log.push(`${FACTION_NAMES[id]}: ${f.pendingAction.length} aksiyon uyguladı.`)
  }

  runEconomyStep(draft, log)
  checkCrisis(draft, log)
  evaluateWinConditions(draft, log)

  if (!draft.winner && draft.turn >= draft.maxTurns) {
    const top = evaluateStalemateWinner(draft)
    draft.winner = top.id
    draft.winnerReason = `Stratejik Üstünlük: ${draft.maxTurns} tur sonunda en yüksek Güç Endeksi'ne (${top.powerIndex}) sahip.`
    log.push(`${FACTION_NAMES[top.id]} STRATEJİK ÜSTÜNLÜKLE KAZANDI.`)
  }

  draft.lastTurnLog = log
  draft.turnLog = [...log, ...draft.turnLog].slice(0, 80)

  if (draft.winner) {
    draft.phase = 'game-over'
  } else {
    draft.turn += 1
    draft.rngCursor += 1
    for (const id of FACTION_IDS) {
      const f = draft.factions[id]
      f.selectedCardId = null
      f.pendingAction = null
      f.hand = dealHand(id, createRng(draft.seed + draft.rngCursor * 1000 + id.length))
    }
    draft.phase = 'card-select'
  }

  return draft
}
