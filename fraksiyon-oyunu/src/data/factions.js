// Fraksiyon meta verisi: kimlik, görsel, kazanma şartı açıklaması, başlangıç kaynakları.
// Kural/aksiyon mantığı engine/factionRules.js içindedir - bu dosya yalnızca veridir.

export const FACTION_IDS = ['halk', 'sirket', 'devlet', 'finans']

export const FACTIONS = {
  halk: {
    id: 'halk',
    name: 'Halk Kolektifi',
    shortName: 'Halk',
    icon: '\u{1F477}', // 👷
    color: '#dc2626',
    tagline: 'Kolektif ekonomi, dağınık karar',
    winConditionText: 'Ulusal İşsizlik < %8 ve Ücret Endeksi hedef üstü, 3 tur üst üste',
    actionEconomyText: 'Her tur 3 eylem puanını bölgelere dağıt (Örgütlenme / Grev / Kolektif Yatırım)',
    startResources: { labor: 60, production: 10, capital: 20, influence: 10 },
  },
  sirket: {
    id: 'sirket',
    name: 'Serbest Girişim Konsorsiyumu',
    shortName: 'Şirket',
    icon: '\u{1F4BC}', // 💼
    color: '#2563eb',
    tagline: 'Sermaye büyütme, az ama güçlü kararlar',
    winConditionText: 'Toplam Ticaret Değeri\'nin %45\'ini kontrol et',
    actionEconomyText: 'Her tur en fazla 2 büyük yönetim kurulu kararı al',
    startResources: { labor: 5, production: 5, capital: 60, influence: 8 },
  },
  devlet: {
    id: 'devlet',
    name: 'Devlet Bürokrasisi',
    shortName: 'Devlet',
    icon: '\u{1F3DB}\u{FE0F}', // 🏛️
    color: '#059669',
    tagline: 'Gecikmeli ama haritayı bütünüyle etkileyen kararlar',
    winConditionText: 'Enflasyon %4-7 ve Ulusal İşsizlik < %10, 4 tur üst üste',
    actionEconomyText: 'Her tur 1 bütçe kararı seç; kararlar 1 tur sonra yürürlüğe girer',
    startResources: { labor: 5, production: 5, capital: 30, influence: 40 },
  },
  finans: {
    id: 'finans',
    name: 'Küresel Finans Ağı',
    shortName: 'Finans',
    icon: '\u{1F310}', // 🌐
    color: '#7c3aed',
    tagline: 'Üretmez, kredi ve pozisyonla kazanır',
    winConditionText: 'Portföy Değeri, başlangıç sermayesinin 4 katına ulaşsın',
    actionEconomyText: 'Her tur en fazla 2 sözleşme aç (kredi ver / pozisyon aç)',
    startResources: { labor: 0, production: 0, capital: 50, influence: 12 },
  },
}
