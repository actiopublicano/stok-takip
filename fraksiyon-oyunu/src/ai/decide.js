import { getCardById } from '../data/policyCards.js'
import { FACTION_ACTIONS, ACTION_BUDGET } from '../engine/factionRules.js'
import { getWeights } from './personalities.js'
import { clamp } from '../engine/helpers.js'

function utility(hint, weights) {
  if (!hint) return -Infinity
  return (
    hint.self * weights.self -
    Math.abs(hint.inflation || 0) * weights.inflation -
    Math.abs(hint.unemployment || 0) * weights.unemployment +
    (hint.risk || 0) * weights.risk
  )
}

function isInCrisis(state, factionId) {
  if (state.global.crisisActive) return true
  const f = state.factions[factionId]
  if (factionId === 'halk') return f.welfareIndex < 35 || state.global.nationalUnemployment > 0.18
  if (factionId === 'sirket') return f.resources.capital < 15
  if (factionId === 'devlet') return state.global.inflation > 12 || state.global.nationalUnemployment > 0.18
  if (factionId === 'finans') return f.resources.capital < 15
  return false
}

export function decideCard(state, factionId) {
  const faction = state.factions[factionId]
  const weights = getWeights(faction.personality, { inCrisis: isInCrisis(state, factionId) })
  const handCards = faction.hand.map((id) => getCardById(id)).filter(Boolean)

  let best = null
  let bestScore = -Infinity
  for (const card of handCards) {
    const hint = card.scoreHints[factionId] || card.scoreHints
    const score = utility(hint, weights)
    if (score > bestScore) {
      bestScore = score
      best = card
    }
  }
  return best ? best.id : handCards[0]?.id || null
}

function regionBonus(actionKey, region) {
  switch (actionKey) {
    case 'orgutlenme':
      return region.unemployment * 3
    case 'grev':
      return region.dominantFaction === 'sirket' ? 1.5 : 0.3
    case 'yatirim':
      return 1 / (region.prodCapacity + 1)
    case 'fabrikaKur':
      return region.type === 'sanayi' && region.dominantFaction !== 'sirket' ? 1.2 : 0.4
    case 'otomasyonaGec':
      return region.dominantFaction === 'sirket' ? 1 : 0.2
    case 'subvansiyon':
      return region.unemployment * 2.5
    default:
      return 0
  }
}

function predictDirection(region) {
  const structural = clamp(0.25 - (region.prodCapacity / Math.max(1, region.population)) * 0.5, 0.03, 0.35)
  return structural < region.unemployment ? 'artis' : 'azalis'
}

function buildCandidates(state, factionId) {
  const regions = state.regions
  const candidates = []

  if (factionId === 'halk') {
    for (const region of regions) {
      for (const key of ['orgutlenme', 'grev', 'yatirim']) {
        const def = FACTION_ACTIONS.halk[key]
        candidates.push({
          actionKey: key,
          params: { regionId: region.id },
          def,
          bonus: regionBonus(key, region),
        })
      }
    }
  } else if (factionId === 'sirket') {
    for (const region of regions) {
      for (const key of ['fabrikaKur', 'otomasyonaGec']) {
        const def = FACTION_ACTIONS.sirket[key]
        candidates.push({ actionKey: key, params: { regionId: region.id }, def, bonus: regionBonus(key, region) })
      }
    }
    candidates.push({ actionKey: 'lobi', params: {}, def: FACTION_ACTIONS.sirket.lobi, bonus: 0 })
  } else if (factionId === 'devlet') {
    candidates.push({ actionKey: 'vergiArtir', params: {}, def: FACTION_ACTIONS.devlet.vergiArtir, bonus: 0 })
    candidates.push({ actionKey: 'vergiAzalt', params: {}, def: FACTION_ACTIONS.devlet.vergiAzalt, bonus: 0 })
    for (const region of regions) {
      candidates.push({
        actionKey: 'subvansiyon',
        params: { regionId: region.id },
        def: FACTION_ACTIONS.devlet.subvansiyon,
        bonus: regionBonus('subvansiyon', region),
      })
    }
  } else if (factionId === 'finans') {
    for (const targetId of ['halk', 'sirket', 'devlet']) {
      const target = state.factions[targetId]
      candidates.push({
        actionKey: 'krediVer',
        params: { targetFactionId: targetId },
        def: FACTION_ACTIONS.finans.krediVer,
        bonus: target.resources.capital < 20 ? 1 : 0.2,
      })
    }
    for (const region of regions) {
      candidates.push({
        actionKey: 'pozisyonAc',
        params: { regionId: region.id, direction: predictDirection(region) },
        def: FACTION_ACTIONS.finans.pozisyonAc,
        bonus: 0.3,
      })
    }
  }

  return candidates
}

export function decideActions(state, factionId) {
  const faction = state.factions[factionId]
  const weights = getWeights(faction.personality, { inCrisis: isInCrisis(state, factionId) })
  const candidates = buildCandidates(state, factionId)

  const scored = candidates
    .map((c) => ({ ...c, score: utility(c.def.scoreHint(), weights) + c.bonus }))
    .sort((a, b) => b.score - a.score)

  const budget = ACTION_BUDGET[factionId] + (factionId === 'halk' ? faction.bonusActionPoints || 0 : 0)
  let remainingCapital = faction.resources.capital
  const usedRegions = new Set()
  const chosen = []

  for (const c of scored) {
    if (chosen.length >= budget) break
    if (c.score <= 0 && factionId !== 'devlet') continue
    const regionId = c.params.regionId
    if (regionId && usedRegions.has(regionId)) continue
    const cost = c.def.cost || 0
    if (cost > remainingCapital) continue
    remainingCapital -= cost
    if (regionId) usedRegions.add(regionId)
    chosen.push({ actionKey: c.actionKey, params: c.params })
  }

  return chosen
}
