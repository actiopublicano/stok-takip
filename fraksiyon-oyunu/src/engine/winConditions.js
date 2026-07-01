import { FACTIONS } from '../data/factions.js'
import { clamp, getFaction } from './helpers.js'

const HALK_UNEMPLOYMENT_TARGET = 0.08
const HALK_WELFARE_TARGET = 65
const HALK_STREAK_NEEDED = 3

const SIRKET_MARKET_SHARE_TARGET = 0.45

const DEVLET_INFLATION_MIN = 4
const DEVLET_INFLATION_MAX = 7
const DEVLET_UNEMPLOYMENT_TARGET = 0.10
const DEVLET_STREAK_NEEDED = 4

const FINANS_MULTIPLIER_TARGET = 4

export function evaluateWinConditions(draft, log) {
  const halk = getFaction(draft, 'halk')
  const sirket = getFaction(draft, 'sirket')
  const devlet = getFaction(draft, 'devlet')
  const finans = getFaction(draft, 'finans')

  // Halk Kolektifi
  const halkMet = draft.global.nationalUnemployment < HALK_UNEMPLOYMENT_TARGET && halk.welfareIndex > HALK_WELFARE_TARGET
  halk.streakTurns = halkMet ? (halk.streakTurns || 0) + 1 : 0
  halk.powerIndex = Math.round(
    Math.min(
      clamp((HALK_UNEMPLOYMENT_TARGET / Math.max(0.001, draft.global.nationalUnemployment)) * 100, 0, 100),
      clamp((halk.welfareIndex / HALK_WELFARE_TARGET) * 100, 0, 100),
    ) * (0.7 + 0.1 * Math.min(halk.streakTurns, 3)),
  )

  // Serbest Girişim Konsorsiyumu
  sirket.powerIndex = Math.round(clamp(((sirket.tradeValueShare || 0) / SIRKET_MARKET_SHARE_TARGET) * 100, 0, 100))

  // Devlet Bürokrasisi
  const devletInflationOk = draft.global.inflation >= DEVLET_INFLATION_MIN && draft.global.inflation <= DEVLET_INFLATION_MAX
  const devletUnemploymentOk = draft.global.nationalUnemployment < DEVLET_UNEMPLOYMENT_TARGET
  const devletMet = devletInflationOk && devletUnemploymentOk
  devlet.streakTurns = devletMet ? (devlet.streakTurns || 0) + 1 : 0
  const inflationDistance = Math.abs(draft.global.inflation - 5.5) / 5.5
  devlet.powerIndex = Math.round(
    clamp(100 - inflationDistance * 60, 0, 100) * 0.5 +
      clamp((DEVLET_UNEMPLOYMENT_TARGET / Math.max(0.001, draft.global.nationalUnemployment)) * 100, 0, 100) * 0.5,
  )

  // Küresel Finans Ağı
  const finansStart = FACTIONS.finans.startResources.capital
  const finansTarget = finansStart * FINANS_MULTIPLIER_TARGET
  finans.powerIndex = Math.round(clamp(((finans.portfolio || 0) / finansTarget) * 100, 0, 100))

  let winnerId = null
  let winnerReason = null

  if (sirket.tradeValueShare >= SIRKET_MARKET_SHARE_TARGET) {
    winnerId = 'sirket'
    winnerReason = `Pazar Hakimiyeti: Ticaret Değeri'nin %${Math.round(sirket.tradeValueShare * 100)}'ini kontrol ediyor.`
  } else if ((finans.portfolio || 0) >= finansTarget) {
    winnerId = 'finans'
    winnerReason = `Portföy Zaferi: Portföy değeri başlangıcın ${FINANS_MULTIPLIER_TARGET} katına ulaştı.`
  } else if (halk.streakTurns >= HALK_STREAK_NEEDED) {
    winnerId = 'halk'
    winnerReason = `Halk Refahı Zaferi: ${HALK_STREAK_NEEDED} tur üst üste düşük işsizlik ve yüksek refah sağlandı.`
  } else if (devlet.streakTurns >= DEVLET_STREAK_NEEDED) {
    winnerId = 'devlet'
    winnerReason = `İstikrar Zaferi: ${DEVLET_STREAK_NEEDED} tur üst üste enflasyon ve işsizlik hedef bandında tutuldu.`
  }

  if (winnerId) {
    draft.winner = winnerId
    draft.winnerReason = winnerReason
    log.push(`${winnerId.toUpperCase()} KAZANDI: ${winnerReason}`)
  }

  return winnerId
}

export function evaluateStalemateWinner(draft) {
  const scored = Object.values(draft.factions).map((f) => ({ id: f.id, powerIndex: f.powerIndex || 0 }))
  scored.sort((a, b) => b.powerIndex - a.powerIndex)
  return scored[0]
}
