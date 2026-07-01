import { REGIONS } from '../data/regionsData.js'
import { FACTIONS, FACTION_IDS } from '../data/factions.js'
import { getHandPool } from '../data/policyCards.js'
import { createRng, pickN } from './helpers.js'

export const MAX_TURNS = 14
export const HAND_SIZE = 3

export function dealHand(factionId, rng) {
  const pool = getHandPool(factionId)
  return pickN(pool, HAND_SIZE, rng).map((c) => c.id)
}

export function createInitialState({ playerFactionId, aiPersonalities, seed = Date.now() }) {
  const rng = createRng(seed)

  const regions = REGIONS.map((r) => ({
    ...r,
    connections: [...r.connections],
    employedLabor: Math.round(r.population * (1 - r.unemployment)),
    production: 0,
    dominantFaction: null,
  }))

  const factions = {}
  for (const id of FACTION_IDS) {
    const base = FACTIONS[id]
    factions[id] = {
      id,
      resources: { ...base.startResources },
      hand: dealHand(id, rng),
      selectedCardId: null,
      pendingAction: null,
      pendingDecision: null,
      employedLabor: 0,
      welfareIndex: id === 'halk' ? 50 : undefined,
      dayanisma: id === 'halk' ? 20 : undefined,
      laborEfficiency: 1,
      capitalEfficiency: 1,
      growthBonus: 0,
      efficiencyPenalty: 0,
      automationUnemploymentPush: 0,
      bonusActionPoints: 0,
      taxEfficiency: id === 'devlet' ? 1 : undefined,
      taxRate: id === 'devlet' ? 0.15 : undefined,
      portfolio: id === 'finans' ? base.startResources.capital : undefined,
      loans: id === 'finans' ? [] : undefined,
      positions: id === 'finans' ? [] : undefined,
      interestRateBonus: 0,
      positionMultiplierBonus: 0,
      debts: [],
      streakTurns: 0,
      powerIndex: 0,
      isAI: id !== playerFactionId,
      personality: id === playerFactionId ? null : aiPersonalities[id],
    }
  }

  return {
    turn: 1,
    maxTurns: MAX_TURNS,
    phase: 'card-select',
    seed,
    rngCursor: 0,
    regions,
    global: {
      inflation: 5,
      nationalUnemployment: computeNationalUnemployment(regions),
      crisisActive: false,
      crisisLog: [],
      taxDiscountTurns: 0,
      tradeValueHistory: [],
    },
    factions,
    playerFactionId,
    winner: null,
    winnerReason: null,
    turnLog: [],
  }
}

export function computeNationalUnemployment(regions) {
  const totalPop = regions.reduce((s, r) => s + r.population, 0)
  const weighted = regions.reduce((s, r) => s + r.population * r.unemployment, 0)
  return totalPop === 0 ? 0 : weighted / totalPop
}
