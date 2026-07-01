// Politika kartları: ortak havuz + fraksiyona özel havuzlar.
// effect(draft, factionId) -> draft state'i doğrudan mutasyona uğratır (engine/turn.js içinde
// yapılan structuredClone kopyası üzerinde çalışır, orijinal state'e dokunmaz).
// scoreHints -> AI'ın kartı simüle etmeden değerlendirmesi için kaba etki tahmini (-2..2 arası).
//   self: kartı oynayan fraksiyonun kendi kazanma metriğine etkisi
//   inflation / unemployment: küresel göstergelere etkisi
//   risk: sonucun ne kadar oynak/riskli olduğu (yüksek risk = agresif AI'lar tercih eder)

import { clamp, getFaction, getRegionsOfType } from '../engine/helpers.js'

export const COMMON_POLICY_CARDS = [
  {
    id: 'asgari-ucret',
    pool: 'common',
    name: 'Asgari Ücret Artışı',
    description: 'Tüm bölgelerde taban ücret yükselir. Halk\'ın refahı artar, Şirket\'in işçilik maliyeti büyür.',
    scoreHints: { halk: { self: 2, inflation: 0.3, unemployment: 0.1, risk: 0.3 }, sirket: { self: -1, inflation: 0.3, unemployment: 0.1, risk: 0.3 }, devlet: { self: 0.3, inflation: 0.3, unemployment: 0.1, risk: 0.3 }, finans: { self: -0.2, inflation: 0.3, unemployment: 0.1, risk: 0.3 } },
    effect(draft) {
      const halk = getFaction(draft, 'halk')
      const sirket = getFaction(draft, 'sirket')
      halk.welfareIndex = clamp(halk.welfareIndex + 6, 0, 100)
      sirket.resources.capital = Math.max(0, sirket.resources.capital - sirket.employedLabor * 0.15)
      draft.global.inflation = clamp(draft.global.inflation + 0.4, 0, 60)
    },
  },
  {
    id: 'vergi-reformu',
    pool: 'common',
    name: 'Vergi Reformu',
    description: 'Ulusal vergi oranı 2 tur boyunca %3 düşer. Devlet geliri azalır, Şirket ve Finans nakit akışı rahatlar.',
    scoreHints: { halk: { self: 0, inflation: 0, unemployment: -0.1, risk: 0.2 }, sirket: { self: 1.2, inflation: 0.1, unemployment: -0.1, risk: 0.2 }, devlet: { self: -0.8, inflation: 0, unemployment: 0, risk: 0.3 }, finans: { self: 0.8, inflation: 0.1, unemployment: 0, risk: 0.2 } },
    effect(draft) {
      draft.global.taxDiscountTurns = (draft.global.taxDiscountTurns || 0) + 2
    },
  },
  {
    id: 'kamu-yatirimi',
    pool: 'common',
    name: 'Kamu Yatırımı',
    description: 'Devlet, kırsal bölgelerin üretim kapasitesine yatırım yapar (Devlet sermayesi harcanır).',
    scoreHints: { halk: { self: 0.6, inflation: 0.1, unemployment: -0.4, risk: 0.2 }, sirket: { self: 0.2, inflation: 0.1, unemployment: -0.4, risk: 0.2 }, devlet: { self: 0.5, inflation: 0.1, unemployment: -0.4, risk: 0.2 }, finans: { self: 0, inflation: 0.1, unemployment: -0.4, risk: 0.2 } },
    effect(draft) {
      const devlet = getFaction(draft, 'devlet')
      const cost = 8
      if (devlet.resources.capital < cost) return
      devlet.resources.capital -= cost
      for (const r of getRegionsOfType(draft, 'kirsal')) {
        r.prodCapacity = clamp(r.prodCapacity + 0.4, 0, 15)
        r.unemployment = clamp(r.unemployment - 0.02, 0, 0.9)
      }
    },
  },
  {
    id: 'serbest-ticaret',
    pool: 'common',
    name: 'Serbest Ticaret Anlaşması',
    description: 'Sınır ötesi ticaret kolaylaşır: Şirket ve Finans büyüme oranı artar, enflasyon hafif yükselir.',
    scoreHints: { halk: { self: -0.4, inflation: 0.3, unemployment: 0.1, risk: 0.4 }, sirket: { self: 1.4, inflation: 0.3, unemployment: 0.1, risk: 0.4 }, devlet: { self: 0.2, inflation: 0.3, unemployment: 0.1, risk: 0.4 }, finans: { self: 1.2, inflation: 0.3, unemployment: 0.1, risk: 0.4 } },
    effect(draft) {
      const sirket = getFaction(draft, 'sirket')
      const finans = getFaction(draft, 'finans')
      sirket.growthBonus = (sirket.growthBonus || 0) + 0.04
      finans.growthBonus = (finans.growthBonus || 0) + 0.04
      draft.global.inflation = clamp(draft.global.inflation + 0.5, 0, 60)
    },
  },
  {
    id: 'grev-hakki',
    pool: 'common',
    name: 'Grev Hakkı Genişletme',
    description: 'Halk\'ın eylem puanı bir sonraki tur artar; Şirket\'in üretim verimliliği hafif düşer.',
    scoreHints: { halk: { self: 1.6, inflation: 0, unemployment: 0, risk: 0.3 }, sirket: { self: -1, inflation: 0, unemployment: 0.1, risk: 0.3 }, devlet: { self: 0, inflation: 0, unemployment: 0, risk: 0.2 }, finans: { self: -0.2, inflation: 0, unemployment: 0, risk: 0.2 } },
    effect(draft) {
      const halk = getFaction(draft, 'halk')
      const sirket = getFaction(draft, 'sirket')
      halk.bonusActionPoints = (halk.bonusActionPoints || 0) + 1
      sirket.efficiencyPenalty = (sirket.efficiencyPenalty || 0) + 0.05
    },
  },
  {
    id: 'sinir-otesi-tesvik',
    pool: 'common',
    name: 'Sınır Ötesi Yatırım Teşviki',
    description: 'Finans\'ın portföy büyüme oranı artar; enflasyon hafif yükselir.',
    scoreHints: { halk: { self: -0.2, inflation: 0.2, unemployment: 0, risk: 0.3 }, sirket: { self: 0.3, inflation: 0.2, unemployment: 0, risk: 0.3 }, devlet: { self: -0.1, inflation: 0.2, unemployment: 0, risk: 0.3 }, finans: { self: 1.8, inflation: 0.2, unemployment: 0, risk: 0.3 } },
    effect(draft) {
      const finans = getFaction(draft, 'finans')
      finans.growthBonus = (finans.growthBonus || 0) + 0.06
      draft.global.inflation = clamp(draft.global.inflation + 0.3, 0, 60)
    },
  },
]

export const FACTION_POLICY_CARDS = {
  halk: [
    {
      id: 'kolektif-fabrika',
      pool: 'halk',
      name: 'Kolektif Fabrika Kur',
      description: 'İşgücünün üretime dönüşüm verimliliği kalıcı olarak artar.',
      scoreHints: { halk: { self: 1.8, inflation: 0, unemployment: -0.2, risk: 0.3 } },
      effect(draft) {
        const halk = getFaction(draft, 'halk')
        const cost = 10
        if (halk.resources.capital < cost) return
        halk.resources.capital -= cost
        halk.laborEfficiency = (halk.laborEfficiency || 1) + 0.08
      },
    },
    {
      id: 'dayanisma-agi',
      pool: 'halk',
      name: 'Dayanışma Ağı',
      description: 'Dayanışma puanı artar; krizlere karşı Halk Refahı direnci yükselir.',
      scoreHints: { halk: { self: 1.4, inflation: 0, unemployment: 0, risk: 0.1 } },
      effect(draft) {
        const halk = getFaction(draft, 'halk')
        halk.dayanisma = clamp((halk.dayanisma || 0) + 8, 0, 100)
      },
    },
  ],
  sirket: [
    {
      id: 'otomasyon-yatirimi',
      pool: 'sirket',
      name: 'Otomasyon Yatırımı',
      description: 'Sermaye->Üretim verimliliği artar ama istihdam edilen işgücü azalır (işsizlik yükselir).',
      scoreHints: { sirket: { self: 1.6, inflation: 0, unemployment: 0.5, risk: 0.5 } },
      effect(draft) {
        const sirket = getFaction(draft, 'sirket')
        const cost = 12
        if (sirket.resources.capital < cost) return
        sirket.resources.capital -= cost
        sirket.capitalEfficiency = (sirket.capitalEfficiency || 1) + 0.1
        sirket.automationUnemploymentPush = (sirket.automationUnemploymentPush || 0) + 0.02
      },
    },
    {
      id: 'duzenleyici-lobi',
      pool: 'sirket',
      name: 'Düzenleyici Lobi',
      description: 'Nüfuz kazanılır; Devlet\'in nüfuzundan bir miktar çalınır.',
      scoreHints: { sirket: { self: 1, inflation: 0, unemployment: 0, risk: 0.4 } },
      effect(draft) {
        const sirket = getFaction(draft, 'sirket')
        const devlet = getFaction(draft, 'devlet')
        const cost = 6
        if (sirket.resources.capital < cost) return
        sirket.resources.capital -= cost
        sirket.resources.influence += 4
        devlet.resources.influence = Math.max(0, devlet.resources.influence - 2)
      },
    },
  ],
  devlet: [
    {
      id: 'zorunlu-denetim',
      pool: 'devlet',
      name: 'Zorunlu Denetim',
      description: 'Vergi tahsilat verimliliği artar; Şirket\'e uyum maliyeti yansır.',
      scoreHints: { devlet: { self: 1.2, inflation: -0.1, unemployment: 0, risk: 0.2 } },
      effect(draft) {
        const devlet = getFaction(draft, 'devlet')
        const sirket = getFaction(draft, 'sirket')
        devlet.taxEfficiency = (devlet.taxEfficiency || 1) + 0.1
        sirket.resources.capital = Math.max(0, sirket.resources.capital - 3)
        devlet.resources.influence += 2
      },
    },
    {
      id: 'para-basma',
      pool: 'devlet',
      name: 'Para Basma',
      description: 'Devlet anında sermaye kazanır ama enflasyon belirgin şekilde yükselir.',
      scoreHints: { devlet: { self: 1.4, inflation: 1.6, unemployment: 0, risk: 0.9 } },
      effect(draft) {
        const devlet = getFaction(draft, 'devlet')
        devlet.resources.capital += 14
        draft.global.inflation = clamp(draft.global.inflation + 2.2, 0, 60)
      },
    },
  ],
  finans: [
    {
      id: 'riskli-kredi-paketi',
      pool: 'finans',
      name: 'Riskli Kredi Paketi',
      description: 'Bu turdan itibaren verilen kredilerin faiz oranı yükselir (daha yüksek getiri, daha yüksek batık riski).',
      scoreHints: { finans: { self: 1.4, inflation: 0, unemployment: 0, risk: 0.7 } },
      effect(draft) {
        const finans = getFaction(draft, 'finans')
        finans.interestRateBonus = (finans.interestRateBonus || 0) + 0.03
      },
    },
    {
      id: 'kisa-satis-hazirligi',
      pool: 'finans',
      name: 'Kısa Satış Pozisyonu Hazırlığı',
      description: 'Bu tur açılacak pozisyonların çarpanı artar.',
      scoreHints: { finans: { self: 1.2, inflation: 0, unemployment: 0, risk: 0.6 } },
      effect(draft) {
        const finans = getFaction(draft, 'finans')
        finans.positionMultiplierBonus = (finans.positionMultiplierBonus || 0) + 0.25
      },
    },
  ],
}

export function getHandPool(factionId) {
  return [...COMMON_POLICY_CARDS, ...FACTION_POLICY_CARDS[factionId]]
}

export function getCardById(cardId) {
  const all = [...COMMON_POLICY_CARDS, ...Object.values(FACTION_POLICY_CARDS).flat()]
  return all.find((c) => c.id === cardId)
}
