// Günlük görev havuzu

export const GOREV_HAVUZU = [
  {
    id: 'gv_lale_yes',
    metin: '3 adet lale yetiştir.',
    emoji: '🌷',
    tip: 'yetistir',
    hedefCicek: 'lale',
    hedefMiktar: 3,
    odul: 40,
  },
  {
    id: 'gv_gul_sat',
    metin: '2 adet gül sat.',
    emoji: '🌹',
    tip: 'sat',
    hedefCicek: 'gul',
    hedefMiktar: 2,
    odul: 60,
  },
  {
    id: 'gv_sulama',
    metin: '10 kez sula.',
    emoji: '💧',
    tip: 'sula',
    hedefCicek: null,
    hedefMiktar: 10,
    odul: 30,
  },
  {
    id: 'gv_gubre',
    metin: '3 kez gübre kullan.',
    emoji: '⚡',
    tip: 'gubre',
    hedefCicek: null,
    hedefMiktar: 3,
    odul: 45,
  },
  {
    id: 'gv_papatya_yes',
    metin: '5 adet papatya yetiştir.',
    emoji: '🌼',
    tip: 'yetistir',
    hedefCicek: 'papatya',
    hedefMiktar: 5,
    odul: 35,
  },
  {
    id: 'gv_100_para',
    metin: '100 bozuk para kazan.',
    emoji: '💰',
    tip: 'kazan',
    hedefCicek: null,
    hedefMiktar: 100,
    odul: 25,
  },
  {
    id: 'gv_hastalik',
    metin: '1 hastalığı iyileştir.',
    emoji: '💊',
    tip: 'iyilestir',
    hedefCicek: null,
    hedefMiktar: 1,
    odul: 50,
  },
  {
    id: 'gv_5_sat',
    metin: '5 çiçek sat.',
    emoji: '🛒',
    tip: 'sat',
    hedefCicek: null,
    hedefMiktar: 5,
    odul: 55,
  },
  {
    id: 'gv_orkide_yes',
    metin: '1 adet orkide yetiştir.',
    emoji: '🌸',
    tip: 'yetistir',
    hedefCicek: 'orkide',
    hedefMiktar: 1,
    odul: 80,
  },
  {
    id: 'gv_nadir_yes',
    metin: '1 nadir çiçek yetiştir.',
    emoji: '⭐',
    tip: 'yetistir_nadirlik',
    hedefNadirlik: 'nadir',
    hedefMiktar: 1,
    odul: 100,
  },
  {
    id: 'gv_ayci_yes',
    metin: '2 ayçiçeği yetiştir.',
    emoji: '🌻',
    tip: 'yetistir',
    hedefCicek: 'aycicegi',
    hedefMiktar: 2,
    odul: 40,
  },
  {
    id: 'gv_20_sulama',
    metin: '20 kez sula.',
    emoji: '🚿',
    tip: 'sula',
    hedefCicek: null,
    hedefMiktar: 20,
    odul: 50,
  },
  {
    id: 'gv_lavanta_yes',
    metin: '1 lavanta yetiştir.',
    emoji: '💜',
    tip: 'yetistir',
    hedefCicek: 'lavanta',
    hedefMiktar: 1,
    odul: 45,
  },
  {
    id: 'gv_3_tohum',
    metin: '3 çeşit tohum satın al.',
    emoji: '🛒',
    tip: 'satin_al_tohum',
    hedefCicek: null,
    hedefMiktar: 3,
    odul: 30,
  },
  {
    id: 'gv_kasimpa_yes',
    metin: '2 kasımpatı yetiştir.',
    emoji: '🌼',
    tip: 'yetistir',
    hedefCicek: 'kasimp',
    hedefMiktar: 2,
    odul: 55,
  },
];

// Günlük görevler için rastgele seç (3 görev)
export const gunlukGorevlerSec = () => {
  const karistir = [...GOREV_HAVUZU].sort(() => Math.random() - 0.5);
  return karistir.slice(0, 3).map(g => ({
    ...g,
    mevcut: 0,
    tamamlandi: false,
    odulVerildi: false,
  }));
};

export const HAFTALIK_GOREV_HAVUZU = [
  { id: 'hg_10_yetistir', metin: '10 çiçek yetiştir.', emoji: '🌸', tip: 'yetistir', hedefCicek: null, hedefMiktar: 10, odul: 200 },
  { id: 'hg_20_sat',      metin: '20 çiçek sat.',       emoji: '🛒', tip: 'sat',      hedefCicek: null, hedefMiktar: 20, odul: 250 },
  { id: 'hg_500_para',    metin: '500 bozuk para kazan.', emoji: '💰', tip: 'kazan',  hedefCicek: null, hedefMiktar: 500, odul: 150 },
  { id: 'hg_50_sulama',   metin: '50 kez sula.',         emoji: '💧', tip: 'sula',    hedefCicek: null, hedefMiktar: 50,  odul: 100 },
  { id: 'hg_3_hastalik',  metin: '3 hastalığı iyileştir.', emoji: '💊', tip: 'iyilestir', hedefCicek: null, hedefMiktar: 3, odul: 180 },
  { id: 'hg_10_gubre',    metin: '10 kez gübre kullan.', emoji: '⚡', tip: 'gubre',   hedefCicek: null, hedefMiktar: 10, odul: 120 },
  { id: 'hg_5_nadir',     metin: '5 nadir çiçek yetiştir.', emoji: '⭐', tip: 'yetistir_nadirlik', hedefNadirlik: 'nadir', hedefMiktar: 5, odul: 500 },
  { id: 'hg_egzotik',     metin: '1 egzotik çiçek yetiştir.', emoji: '🌟', tip: 'yetistir_nadirlik', hedefNadirlik: 'egzotik', hedefMiktar: 1, odul: 350 },
];

export const haftalikGorevlerSec = () => {
  const karistir = [...HAFTALIK_GOREV_HAVUZU].sort(() => Math.random() - 0.5);
  return karistir.slice(0, 3).map(g => ({
    ...g,
    mevcut: 0,
    tamamlandi: false,
    odulVerildi: false,
  }));
};
