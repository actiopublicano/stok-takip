export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function getFaction(draft, factionId) {
  return draft.factions[factionId]
}

export function getRegion(draft, regionId) {
  return draft.regions.find((r) => r.id === regionId)
}

export function getRegionsOfType(draft, type) {
  return draft.regions.filter((r) => r.type === type)
}

// Basit, tekrarlanabilir bir sözde-rastgele üretici (mulberry32).
// Aynı seed her zaman aynı diziyi üretir - test edilebilirlik ve adil AI davranışı için.
export function createRng(seed) {
  let a = seed >>> 0
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickN(array, n, rng) {
  const pool = [...array]
  const result = []
  while (result.length < n && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result
}
