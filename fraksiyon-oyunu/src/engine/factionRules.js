// Fraksiyona özgü aksiyon ekonomisi: her fraksiyonun "büyük mekaniği" burada tanımlıdır.
// Her aksiyon: apply(draft, params) ile draft state'i mutasyona uğratır,
// scoreHint(state, params) ile AI'ın kabaca değerlendirmesi için bir etki tahmini döner.

import { clamp, getFaction, getRegion } from './helpers.js'

export const ACTION_BUDGET = { halk: 3, sirket: 2, devlet: 1, finans: 2 }

export const FACTION_ACTIONS = {
  halk: {
    orgutlenme: {
      id: 'orgutlenme',
      label: 'Örgütlenme',
      description: 'Seçilen bölgede istihdamı ve refahı artırır.',
      needsRegion: true,
      apply(draft, { regionId }) {
        const region = getRegion(draft, regionId)
        const halk = getFaction(draft, 'halk')
        region.unemployment = clamp(region.unemployment - 0.03, 0.01, 0.9)
        halk.resources.labor += 3
        halk.welfareIndex = clamp(halk.welfareIndex + 1.5, 0, 100)
      },
      scoreHint() {
        return { self: 1.4, inflation: 0, unemployment: -0.3, risk: 0.1 }
      },
    },
    grev: {
      id: 'grev',
      label: 'Grev',
      description: 'Seçilen bölgede üretim durur; ücret baskısı ve dayanışma artar, Şirket zarar görür.',
      needsRegion: true,
      apply(draft, { regionId }) {
        const region = getRegion(draft, regionId)
        const halk = getFaction(draft, 'halk')
        const sirket = getFaction(draft, 'sirket')
        region.strikeActive = true
        region.consecutiveStrikes = (region.consecutiveStrikes || 0) + 1
        halk.welfareIndex = clamp(halk.welfareIndex + 2.5, 0, 100)
        halk.dayanisma = clamp((halk.dayanisma || 0) + 4, 0, 100)
        sirket.resources.capital = Math.max(0, sirket.resources.capital - region.prodCapacity * 0.6)
      },
      scoreHint() {
        return { self: 1.0, inflation: 0.1, unemployment: 0.15, risk: 0.5 }
      },
    },
    yatirim: {
      id: 'yatirim',
      label: 'Kolektif Yatırım',
      description: 'Halk sermayesiyle seçilen bölgenin üretim kapasitesini artırır.',
      needsRegion: true,
      cost: 5,
      apply(draft, { regionId }) {
        const region = getRegion(draft, regionId)
        const halk = getFaction(draft, 'halk')
        if (halk.resources.capital < 5) return
        halk.resources.capital -= 5
        region.prodCapacity = clamp(region.prodCapacity + 0.5, 0, 15)
      },
      scoreHint() {
        return { self: 1, inflation: 0, unemployment: -0.1, risk: 0.2 }
      },
    },
  },

  sirket: {
    fabrikaKur: {
      id: 'fabrikaKur',
      label: 'Fabrika Kur',
      description: 'Seçilen bölgede üretim kapasitesi büyür, bölge Şirket etkisine girer.',
      needsRegion: true,
      cost: 18,
      apply(draft, { regionId }) {
        const region = getRegion(draft, regionId)
        const sirket = getFaction(draft, 'sirket')
        if (sirket.resources.capital < 18) return
        sirket.resources.capital -= 18
        region.prodCapacity = clamp(region.prodCapacity + 1.2, 0, 20)
        region.dominantFaction = 'sirket'
      },
      scoreHint() {
        return { self: 1.6, inflation: 0.1, unemployment: -0.1, risk: 0.4 }
      },
    },
    otomasyonaGec: {
      id: 'otomasyonaGec',
      label: 'Otomasyona Geç',
      description: 'Seçilen bölgede verimlilik artar ama istihdam düşer.',
      needsRegion: true,
      cost: 10,
      apply(draft, { regionId }) {
        const region = getRegion(draft, regionId)
        const sirket = getFaction(draft, 'sirket')
        if (sirket.resources.capital < 10) return
        sirket.resources.capital -= 10
        sirket.capitalEfficiency = (sirket.capitalEfficiency || 1) + 0.04
        region.unemployment = clamp(region.unemployment + 0.03, 0.01, 0.9)
      },
      scoreHint() {
        return { self: 1.3, inflation: 0, unemployment: 0.3, risk: 0.4 }
      },
    },
    lobi: {
      id: 'lobi',
      label: 'Lobi Faaliyeti',
      description: 'Nüfuz kazanılır.',
      needsRegion: false,
      cost: 8,
      apply(draft) {
        const sirket = getFaction(draft, 'sirket')
        if (sirket.resources.capital < 8) return
        sirket.resources.capital -= 8
        sirket.resources.influence += 5
      },
      scoreHint() {
        return { self: 0.7, inflation: 0, unemployment: 0, risk: 0.1 }
      },
    },
  },

  devlet: {
    vergiArtir: {
      id: 'vergiArtir',
      label: 'Vergiyi Artır',
      description: 'Vergi oranı 1 tur sonra %3 artar.',
      needsRegion: false,
      queued: true,
      apply(draft) {
        const devlet = getFaction(draft, 'devlet')
        devlet.taxRate = clamp(devlet.taxRate + 0.03, 0.02, 0.5)
      },
      scoreHint() {
        return { self: 0.6, inflation: -0.2, unemployment: 0.1, risk: 0.3 }
      },
    },
    vergiAzalt: {
      id: 'vergiAzalt',
      label: 'Vergiyi Azalt',
      description: 'Vergi oranı 1 tur sonra %3 azalır.',
      needsRegion: false,
      queued: true,
      apply(draft) {
        const devlet = getFaction(draft, 'devlet')
        devlet.taxRate = clamp(devlet.taxRate - 0.03, 0.02, 0.5)
      },
      scoreHint() {
        return { self: -0.4, inflation: -0.1, unemployment: -0.1, risk: 0.2 }
      },
    },
    subvansiyon: {
      id: 'subvansiyon',
      label: 'Bölgesel Sübvansiyon',
      description: 'Seçilen bölgenin üretim kapasitesi 1 tur sonra artar.',
      needsRegion: true,
      queued: true,
      cost: 6,
      apply(draft, { regionId }) {
        const region = getRegion(draft, regionId)
        const devlet = getFaction(draft, 'devlet')
        if (devlet.resources.capital < 6) return
        devlet.resources.capital -= 6
        region.prodCapacity = clamp(region.prodCapacity + 0.6, 0, 15)
        region.unemployment = clamp(region.unemployment - 0.02, 0.01, 0.9)
      },
      scoreHint() {
        return { self: 0.8, inflation: 0.1, unemployment: -0.3, risk: 0.2 }
      },
    },
  },

  finans: {
    krediVer: {
      id: 'krediVer',
      label: 'Kredi Ver',
      description: 'Hedef fraksiyona anında sermaye aktarılır; 3 tur boyunca faiziyle geri tahsil edilir.',
      needsTarget: true,
      cost: 15,
      apply(draft, { targetFactionId }) {
        const finans = getFaction(draft, 'finans')
        const target = getFaction(draft, targetFactionId)
        if (finans.resources.capital < 15) return
        finans.resources.capital -= 15
        target.resources.capital += 15
        finans.loans.push({
          targetFactionId,
          principal: 15,
          remainingPrincipal: 15,
          interestRate: 0.07 + (finans.interestRateBonus || 0),
          turnsRemaining: 3,
        })
      },
      scoreHint() {
        return { self: 1.1, inflation: 0, unemployment: 0, risk: 0.5 }
      },
    },
    pozisyonAc: {
      id: 'pozisyonAc',
      label: 'Pozisyon Aç',
      description: 'Bir bölgenin üretiminin artacağına/azalacağına bahis oyna; 2 tur sonra sonuçlanır.',
      needsRegion: true,
      needsDirection: true,
      cost: 10,
      apply(draft, { regionId, direction }) {
        const region = getRegion(draft, regionId)
        const finans = getFaction(draft, 'finans')
        if (finans.resources.capital < 10) return
        finans.resources.capital -= 10
        finans.positions.push({
          regionId,
          direction,
          stake: 10 * (1 + (finans.positionMultiplierBonus || 0)),
          baselineProduction: region.production,
          turnsRemaining: 2,
        })
      },
      scoreHint() {
        return { self: 1.2, inflation: 0, unemployment: 0, risk: 0.7 }
      },
    },
  },
}

export function getActionDef(factionId, actionKey) {
  return FACTION_ACTIONS[factionId]?.[actionKey]
}

export function applyFactionAction(draft, factionId, actionKey, params = {}) {
  const def = getActionDef(factionId, actionKey)
  if (!def) return
  def.apply(draft, params)
}
