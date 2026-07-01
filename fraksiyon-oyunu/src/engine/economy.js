import { clamp, getFaction } from './helpers.js'
import { computeNationalUnemployment } from './state.js'

const DEMAND_COEFFICIENT = 2

export function runEconomyStep(draft, log = []) {
  runProduction(draft)
  const totals = computeTotals(draft)
  runTax(draft, totals)
  runGrowth(draft, totals)
  runInflation(draft, totals)
  runUnemploymentDrift(draft)
  runLoans(draft, log)
  runPositions(draft, log)
  runWelfareDrift(draft)

  draft.global.nationalUnemployment = computeNationalUnemployment(draft.regions)
  for (const r of draft.regions) {
    if (!r.strikeActive) r.consecutiveStrikes = 0
    r.strikeActive = false
  }
}

function runProduction(draft) {
  for (const region of draft.regions) {
    region.employedLabor = Math.round(region.population * (1 - region.unemployment))
    if (region.strikeActive) {
      region.production = 0
    } else {
      const laborFactor = region.employedLabor / Math.max(1, region.population)
      region.production = region.prodCapacity * laborFactor
    }
    region.tradeValue = region.production * DEMAND_COEFFICIENT
  }
}

function computeTotals(draft) {
  const totalTradeValue = draft.regions.reduce((s, r) => s + r.tradeValue, 0)
  const sirketTradeValue = draft.regions
    .filter((r) => r.dominantFaction === 'sirket')
    .reduce((s, r) => s + r.tradeValue, 0)
  const halkTradeValue = draft.regions
    .filter((r) => r.dominantFaction === 'halk' || r.dominantFaction === null)
    .reduce((s, r) => s + r.tradeValue, 0)
  const totalCapital = Object.values(draft.factions).reduce((s, f) => s + (f.resources?.capital || 0), 0)
  return { totalTradeValue, sirketTradeValue, halkTradeValue, totalCapital }
}

function runTax(draft, totals) {
  const devlet = getFaction(draft, 'devlet')
  const sirket = getFaction(draft, 'sirket')
  let effectiveRate = devlet.taxRate
  if (draft.global.taxDiscountTurns > 0) {
    effectiveRate = clamp(effectiveRate - 0.03, 0.01, 0.5)
    draft.global.taxDiscountTurns -= 1
  }
  const taxCollected = totals.sirketTradeValue * effectiveRate * (devlet.taxEfficiency || 1)
  sirket.resources.capital = Math.max(0, sirket.resources.capital - taxCollected)
  devlet.resources.capital += taxCollected
  draft.global.lastTaxCollected = taxCollected
  draft.global.lastEffectiveTaxRate = effectiveRate
}

function runGrowth(draft, totals) {
  const sirket = getFaction(draft, 'sirket')
  const finans = getFaction(draft, 'finans')
  const halk = getFaction(draft, 'halk')

  const sirketRate = clamp(0.06 + (sirket.growthBonus || 0) - (sirket.efficiencyPenalty || 0), -0.2, 0.4)
  const sirketGain = sirket.resources.capital * sirketRate + totals.sirketTradeValue * 0.2 * (sirket.capitalEfficiency || 1)
  sirket.resources.capital = Math.max(0, sirket.resources.capital + sirketGain)
  sirket.resources.production = totals.sirketTradeValue
  sirket.tradeValueShare = totals.totalTradeValue > 0 ? totals.sirketTradeValue / totals.totalTradeValue : 0

  const finansRate = clamp(0.015 + (finans.growthBonus || 0), -0.2, 0.3)
  finans.resources.capital = Math.max(0, finans.resources.capital + finans.resources.capital * finansRate)
  finans.portfolio = finans.resources.capital + finans.loans.reduce((s, l) => s + (l.remainingPrincipal ?? l.principal), 0)

  halk.resources.production = halk.resources.labor * (halk.laborEfficiency || 1) * 0.15
  halk.resources.labor = Math.max(0, halk.resources.labor * 0.7)

  draft.global.lastCapitalGain = sirketGain + finans.resources.capital * finansRate
}

function runInflation(draft, totals) {
  const history = draft.global.tradeValueHistory
  const previous = history.length > 0 ? history[history.length - 1] : totals.totalTradeValue
  const productionGrowthRate = previous > 0 ? totals.totalTradeValue / previous - 1 : 0
  const moneyGrowthRate = totals.totalCapital > 0 ? (draft.global.lastCapitalGain || 0) / totals.totalCapital : 0

  const drift = (moneyGrowthRate - Math.max(0, productionGrowthRate)) * 8 - 0.15
  draft.global.inflation = clamp(draft.global.inflation + drift, 0, 60)

  history.push(totals.totalTradeValue)
  if (history.length > 10) history.shift()
}

function runUnemploymentDrift(draft) {
  for (const region of draft.regions) {
    const structural = clamp(0.25 - (region.prodCapacity / Math.max(1, region.population)) * 0.5, 0.03, 0.35)
    region.unemployment = clamp(region.unemployment + (structural - region.unemployment) * 0.08, 0.01, 0.9)
  }
}

function runLoans(draft, log) {
  const finans = getFaction(draft, 'finans')
  const remaining = []
  for (const loan of finans.loans) {
    const target = getFaction(draft, loan.targetFactionId)
    const principalDue = loan.principal / 3
    const interestDue = loan.principal * loan.interestRate
    const installment = principalDue + interestDue
    const paid = Math.min(installment, target.resources.capital)
    target.resources.capital -= paid
    finans.resources.capital += paid
    const principalPaid = Math.min(principalDue, paid)
    loan.remainingPrincipal = Math.max(0, (loan.remainingPrincipal ?? loan.principal) - principalPaid)
    if (paid < installment) {
      log.push(`${loan.targetFactionId} kredi taksitini tam ödeyemedi, Finans zarar yazdı.`)
    }
    loan.turnsRemaining -= 1
    if (loan.turnsRemaining > 0) remaining.push(loan)
  }
  finans.loans = remaining
}

function runPositions(draft, log) {
  const finans = getFaction(draft, 'finans')
  const remaining = []
  for (const position of finans.positions) {
    position.turnsRemaining -= 1
    if (position.turnsRemaining <= 0) {
      const region = draft.regions.find((r) => r.id === position.regionId)
      const rose = region.production > position.baselineProduction
      const won = (position.direction === 'artis' && rose) || (position.direction === 'azalis' && !rose)
      if (won) {
        finans.resources.capital += position.stake * 1.4
        log.push(`Finans, ${region.name} pozisyonunu kazandı.`)
      } else {
        log.push(`Finans, ${region.name} pozisyonunu kaybetti.`)
      }
    } else {
      remaining.push(position)
    }
  }
  finans.positions = remaining
}

function runWelfareDrift(draft) {
  const halk = getFaction(draft, 'halk')
  const target = clamp(100 - draft.global.nationalUnemployment * 300, 0, 100)
  halk.welfareIndex = clamp(halk.welfareIndex + (target - halk.welfareIndex) * 0.2, 0, 100)
  halk.dayanisma = clamp((halk.dayanisma || 0) - 0.5, 0, 100)
}
