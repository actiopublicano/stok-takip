// AI kişilikleri: fayda fonksiyonu ağırlıkları. Yeni bir kişilik eklemek için
// buraya yeni bir ağırlık seti eklemek yeterlidir - başka hiçbir yeri değiştirmeye gerek yoktur.
// weight yorumu: utility = self*w.self - |inflationDelta|*w.inflation - |unemploymentDelta|*w.unemployment + risk*w.risk

export const PERSONALITIES = {
  agresif: {
    label: 'Agresif',
    description: 'Kendi kazanma metriğini maksimize eder, yan etkileri önemsemez, riskten kaçmaz.',
    weights: { self: 2.2, inflation: 0.2, unemployment: 0.2, risk: 0.8 },
  },
  dengeli: {
    label: 'Dengeli',
    description: 'Kendi hedefiyle küresel göstergeleri dengede tutar, aşırı uçlardan kaçınır.',
    weights: { self: 1.4, inflation: 0.9, unemployment: 0.9, risk: -0.3 },
  },
  krizYoneticisi: {
    label: 'Kriz Yöneticisi',
    description: 'Normalde savunmacı oynar; kendi göstergeleri kötüleştiğinde agresifleşip krize odaklanır.',
    weights: { self: 1.1, inflation: 1.3, unemployment: 1.3, risk: -0.6 },
    crisisWeights: { self: 2.4, inflation: 0.5, unemployment: 0.5, risk: 0.6 },
  },
}

export function getWeights(personalityKey, { inCrisis } = {}) {
  const personality = PERSONALITIES[personalityKey] || PERSONALITIES.dengeli
  if (inCrisis && personality.crisisWeights) return personality.crisisWeights
  return personality.weights
}
