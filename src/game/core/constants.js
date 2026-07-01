// Oyun sabitleri

export const DAKIKA = 60000;
export const SAAT = 3600000;
export const GUN = 86400000;

// Büyüme aşamaları
export const ASAMA = {
  BOS: 'bos',
  TOHUM: 'tohum',     // 0-15%
  FILIZ: 'filiz',     // 15-40%
  BUYUYOR: 'buyuyor', // 40-75%
  CICEK: 'cicek',     // 75-99%
  HAZIR: 'hazir',     // 100%
  SOLUYOR: 'soluyor', // su yetersiz
  OLDU: 'oldu',       // öldü
};

// Hava durumu
export const HAVA = {
  GUNES: 'güneşli',
  BULUTLU: 'bulutlu',
  YAGMURLU: 'yağmurlu',
  SICAK: 'sıcak',
  SOGUK: 'soğuk',
  RUZGARLI: 'rüzgarlı',
};

// Hava büyüme çarpanları
export const HAVA_CARPANI = {
  güneşli: 1.0,
  bulutlu: 0.9,
  yağmurlu: 1.3,
  sıcak: 1.1,
  soğuk: 0.7,
  rüzgarlı: 1.0,
};

// Hava su tüketim çarpanları (1 = normal)
export const HAVA_SU_CARPANI = {
  güneşli: 1.0,
  bulutlu: 0.8,
  yağmurlu: 0.5,  // yağmurda az su gerekir
  sıcak: 1.5,
  soğuk: 0.6,
  rüzgarlı: 1.2,
};

// Hava hastalık olasılığı çarpanları
export const HAVA_HASTALIK_CARPANI = {
  güneşli: 1.0,
  bulutlu: 1.0,
  yağmurlu: 2.5,  // yağmurda mantar riski artar
  sıcak: 1.0,
  soğuk: 1.0,
  rüzgarlı: 1.3,
};

// Mevsimler
export const MEVSIM = {
  ILKBAHAR: 'ilkbahar',
  YAZ: 'yaz',
  SONBAHAR: 'sonbahar',
  KIS: 'kış',
};

// Ay → Mevsim (Gerçek takvim)
export const AY_MEVSIM = {
  0: 'kış',      // Ocak
  1: 'kış',      // Şubat
  2: 'ilkbahar', // Mart
  3: 'ilkbahar', // Nisan
  4: 'ilkbahar', // Mayıs
  5: 'yaz',      // Haziran
  6: 'yaz',      // Temmuz
  7: 'yaz',      // Ağustos
  8: 'sonbahar', // Eylül
  9: 'sonbahar', // Ekim
  10: 'sonbahar',// Kasım
  11: 'kış',     // Aralık
};

// Mevsim büyüme çarpanı
export const MEVSIM_CARPANI = {
  ilkbahar: 1.2,
  yaz: 1.0,
  sonbahar: 0.9,
  kış: 0.7,
};

// Su seviyesi eşikleri
export const SU = {
  DOLU: 100,
  IDARELI: 60,
  AZ: 30,
  KRITIK: 10,
  BOS: 0,
};

// Büyüme yavaşlama eşikleri (su seviyesine göre)
export const SU_BUYUME_CARPANI = {
  yeterli: 1.0,   // >= 30
  az: 0.5,        // 10-30
  kritik: 0.1,    // 1-10
  yok: 0,         // 0
};

// Hastalık oluşma şansı (saatte bir tick için)
export const HASTALIK_SANCES = 0.008; // %0.8/saat

// Hava değişim aralığı
export const HAVA_DEGISIM_ARALIK = { min: 1 * SAAT, maks: 4 * SAAT };

// Oyuncu seviyeleme
export const SEVIYE_XP = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, // 1-10
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15200, 17600, 20200, // 11-20
];

// XP kazanma miktarları
export const XP_KAZAN = {
  cicekYetistir: 10,
  cicekSat: 5,
  sulama: 1,
  gubre: 3,
  hastalikIyilest: 8,
  gorevTamamla: 20,
  basarimAc: 15,
};

// Oyun döngüsü tick aralığı (ms)
export const TICK_ARALIK = 5000; // 5 saniye

// Maks offline süre (bu süreden fazlasını hesaplamıyoruz)
export const MAKS_OFFLINE_SURE = 24 * SAAT;

// Başlangıç parası
export const BASLANGIC_PARASI = 150;

// Rastgele olay olasılıkları (her saat başı)
export const RASTGELE_OLAY_SANS = 0.05; // %5

export const RASTGELE_OLAYLAR = [
  { id: 'kelebek', ad: 'Kelebek Ziyareti', emoji: '🦋', aciklama: 'Kelebekler gübreyi %20 artırdı!', etki: 'gubre_bonus' },
  { id: 'ari', ad: 'Arı Kolonisi', emoji: '🐝', aciklama: 'Arılar tüm bitkilerin büyümesini hızlandırdı!', etki: 'buyume_hizi' },
  { id: 'altin_tohum', ad: 'Altın Tohum', emoji: '✨', aciklama: 'Nadir bir tohum buldun!', etki: 'nadir_tohum' },
  { id: 'indirim', ad: 'İndirim Günü', emoji: '🏷️', aciklama: 'Dükkan 2 saat boyunca %30 indirimli!', etki: 'indirim' },
  { id: 'nadir_satici', ad: 'Nadir Satıcı', emoji: '🧙', aciklama: 'Gezici satıcı efsanevi tohum getirdi!', etki: 'efsanevi_tohum' },
  { id: 'yagmur', ad: 'Bereketli Yağmur', emoji: '🌧️', aciklama: 'Bereketli yağmur tüm çiçekleri suladı!', etki: 'bedava_sulama' },
];
