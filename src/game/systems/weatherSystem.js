// Hava durumu ve mevsim sistemi

import { HAVA, AY_MEVSIM, HAVA_DEGISIM_ARALIK } from '../core/constants.js';

const HAVA_LISTESI = Object.values(HAVA);

// Hava ağırlıkları (bazı havalar daha yaygın)
const HAVA_AGIRLIKLARI = {
  güneşli: 35,
  bulutlu: 25,
  yağmurlu: 15,
  sıcak: 12,
  soğuk: 8,
  rüzgarlı: 5,
};

// Mevsime göre hava ağırlıkları
const MEVSIM_HAVA = {
  ilkbahar: { güneşli: 30, bulutlu: 25, yağmurlu: 25, sıcak: 10, soğuk: 5, rüzgarlı: 5 },
  yaz:      { güneşli: 45, bulutlu: 15, yağmurlu: 10, sıcak: 20, soğuk: 2, rüzgarlı: 8 },
  sonbahar: { güneşli: 20, bulutlu: 30, yağmurlu: 30, sıcak: 5, soğuk: 10, rüzgarlı: 5 },
  kış:      { güneşli: 15, bulutlu: 30, yağmurlu: 20, sıcak: 2, soğuk: 28, rüzgarlı: 5 },
};

// Ağırlıklı rastgele seçim
const agirlikliSec = (agirliklar) => {
  const toplam = Object.values(agirliklar).reduce((a, b) => a + b, 0);
  let rastgele = Math.random() * toplam;
  for (const [key, agirlik] of Object.entries(agirliklar)) {
    rastgele -= agirlik;
    if (rastgele <= 0) return key;
  }
  return Object.keys(agirliklar)[0];
};

// Yeni hava durumu üret
export const yeniHavaUret = (mevsim) => {
  const agirliklar = MEVSIM_HAVA[mevsim] ?? HAVA_AGIRLIKLARI;
  const { min, maks } = HAVA_DEGISIM_ARALIK;
  const sure = min + Math.random() * (maks - min);

  return {
    mevcut: agirlikliSec(agirliklar),
    baslangicZamani: Date.now(),
    sure: Math.round(sure),
  };
};

// Gerçek takvime göre mevsimleri al
export const mevsimiBul = () => {
  const ay = new Date().getMonth();
  return AY_MEVSIM[ay];
};

// Hava durumu ikonları
export const HAVA_IKONU = {
  güneşli: '☀️',
  bulutlu: '⛅',
  yağmurlu: '🌧️',
  sıcak: '🌡️',
  soğuk: '❄️',
  rüzgarlı: '💨',
};

// Mevsim ikonları
export const MEVSIM_IKONU = {
  ilkbahar: '🌸',
  yaz: '☀️',
  sonbahar: '🍂',
  kış: '❄️',
};

// Hava güncellemesi gerekiyor mu?
export const havaDegistirilmeli = (hava) => {
  if (!hava?.baslangicZamani || !hava?.sure) return true;
  return Date.now() - hava.baslangicZamani > hava.sure;
};
