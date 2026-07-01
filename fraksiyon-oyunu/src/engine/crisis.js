import { FACTION_IDS } from '../data/factions.js'

const INFLATION_CRISIS = 20
const UNEMPLOYMENT_CRISIS = 0.25

export function checkCrisis(draft, log) {
  let triggered = false
  const reasons = []

  if (draft.global.inflation > INFLATION_CRISIS) {
    triggered = true
    reasons.push('Hiperenflasyon')
  }
  if (draft.global.nationalUnemployment > UNEMPLOYMENT_CRISIS) {
    triggered = true
    reasons.push('Kitlesel işsizlik')
  }

  for (const id of FACTION_IDS) {
    const f = draft.factions[id]
    f.zeroCapitalStreak = f.resources.capital <= 0.01 ? (f.zeroCapitalStreak || 0) + 1 : 0
    if (f.zeroCapitalStreak >= 2) {
      triggered = true
      reasons.push(`${id} iflasın eşiğinde`)
    }
  }

  draft.global.crisisActive = triggered
  if (triggered) {
    const label = reasons.join(', ')
    draft.global.crisisLog.push({ turn: draft.turn, label })
    log.push(`ULUSAL KRİZ: ${label}. Tüm fraksiyonlar sermayelerinin %8'ini kaybetti.`)
    for (const id of FACTION_IDS) {
      const f = draft.factions[id]
      f.resources.capital = Math.max(0, f.resources.capital * 0.92)
    }
  }

  return triggered
}
