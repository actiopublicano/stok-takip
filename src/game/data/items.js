// Oyun içi satın alınabilir eşyalar: gübreler, ilaçlar, sera yükseltmeleri

export const GUBRETLER = [
  {
    id: 'hiz_gubresi',
    name: 'Hız Gübresi',
    emoji: '⚡',
    fiyat: 20,
    aciklama: 'Büyüme hızını 2 saat boyunca %50 artırır.',
    etki: { tur: 'hiz', carpan: 1.5, sure: 7200000 },
  },
  {
    id: 'kalite_gubresi',
    name: 'Kalite Gübresi',
    emoji: '⭐',
    fiyat: 35,
    aciklama: 'Çiçeğin kalitesini artırarak satış fiyatını yükseltir.',
    etki: { tur: 'kalite', carpan: 1.3, sure: null },
  },
  {
    id: 'hastalik_onleyici',
    name: 'Hastalık Önleyici',
    emoji: '🛡️',
    fiyat: 25,
    aciklama: '24 saat boyunca hastalık oluşumunu engeller.',
    etki: { tur: 'koruma', carpan: 0, sure: 86400000 },
  },
  {
    id: 'premium_gubre',
    name: 'Premium Gübre',
    emoji: '💎',
    fiyat: 75,
    aciklama: 'Hem hızı artırır hem kaliteyi yükseltir hem de hastalıktan korur.',
    etki: { tur: 'premium', carpan: 1.8, sure: 14400000 },
  },
  {
    id: 'nem_gubresi',
    name: 'Nem Gübresi',
    emoji: '💧',
    fiyat: 15,
    aciklama: 'Sulama aralığını uzatır, çiçek daha az su ister.',
    etki: { tur: 'nem', carpan: 0.5, sure: 43200000 },
  },
];

export const ILACLAR = [
  {
    id: 'fungusit',
    name: 'Fungusit',
    emoji: '🧪',
    fiyat: 30,
    aciklama: 'Mantar hastalığını tedavi eder.',
    hedef: 'mantar',
  },
  {
    id: 'bocek_ilaci',
    name: 'Böcek İlacı',
    emoji: '🐛',
    fiyat: 25,
    aciklama: 'Böcek istilasını yok eder.',
    hedef: 'bocek',
  },
  {
    id: 'kuf_ilaci',
    name: 'Küf İlacı',
    emoji: '🌿',
    fiyat: 28,
    aciklama: 'Küf oluşumunu tedavi eder.',
    hedef: 'kuf',
  },
  {
    id: 'evrensel_ilac',
    name: 'Evrensel İlaç',
    emoji: '💊',
    fiyat: 60,
    aciklama: 'Her tür hastalığı iyileştirir.',
    hedef: 'tumu',
  },
];

export const HASTALIKLAR = [
  {
    id: 'mantar',
    name: 'Mantar',
    emoji: '🍄',
    aciklama: 'Beyaz lekeler yapraklara yayılıyor.',
    olumHizi: 0.002, // büyüme yüzdesi azalma/dakika
    ilac: 'fungusit',
  },
  {
    id: 'bocek',
    name: 'Böcek İstilası',
    emoji: '🐛',
    aciklama: 'Küçük böcekler yaprakları yiyor.',
    olumHizi: 0.003,
    ilac: 'bocek_ilaci',
  },
  {
    id: 'kuf',
    name: 'Küf',
    emoji: '😷',
    aciklama: 'Gri küf yapraklara yayılmaya başladı.',
    olumHizi: 0.0015,
    ilac: 'kuf_ilaci',
  },
];

export const SERA_YUKSELTMELERI = [
  {
    id: 'kucuk_sera',
    ad: 'Küçük Sera',
    emoji: '🏠',
    aciklama: 'Başlangıç serası. 6 saksı kapasitesi.',
    fiyat: 0,
    slotSayisi: 6,
    level: 1,
    aktif: true,
  },
  {
    id: 'orta_sera',
    ad: 'Orta Sera',
    emoji: '🏡',
    aciklama: '9 saksı kapasiteli orta boy sera.',
    fiyat: 500,
    slotSayisi: 9,
    level: 2,
    aktif: false,
  },
  {
    id: 'buyuk_sera',
    ad: 'Büyük Sera',
    emoji: '🏗️',
    aciklama: '12 saksı kapasiteli büyük sera.',
    fiyat: 1500,
    slotSayisi: 12,
    level: 3,
    aktif: false,
  },
  {
    id: 'akilli_sera',
    ad: 'Akıllı Sera',
    emoji: '🤖',
    aciklama: '18 saksı. Sensörler aktif, otomatik sulama mevcut.',
    fiyat: 5000,
    slotSayisi: 18,
    level: 4,
    aktif: false,
  },
  {
    id: 'premium_sera',
    ad: 'Premium Sera',
    emoji: '🌟',
    aciklama: '24 saksı. Her özellik en üst seviyede.',
    fiyat: 15000,
    slotSayisi: 24,
    level: 5,
    aktif: false,
  },
];

export const EKSTRA_YUKSELTMELER = [
  {
    id: 'oto_sulama',
    ad: 'Otomatik Sulama',
    emoji: '🚿',
    aciklama: 'Her 2 saatte bir tüm çiçekleri otomatik sular.',
    fiyat: 2000,
    gerekliSeraLevel: 4,
  },
  {
    id: 'hastalik_sensoru',
    ad: 'Hastalık Sensörü',
    emoji: '🔬',
    aciklama: 'Hastalık başladığında anında bildirim gönderir.',
    fiyat: 1500,
    gerekliSeraLevel: 3,
  },
  {
    id: 'gubre_deposu',
    ad: 'Gübre Deposu',
    emoji: '🗄️',
    aciklama: 'Gübre envanteri kapasitesini 2 katına çıkarır.',
    fiyat: 800,
    gerekliSeraLevel: 2,
  },
  {
    id: 'hava_kontrolu',
    ad: 'Hava Kontrol Sistemi',
    emoji: '🌡️',
    aciklama: 'Hava koşullarının olumsuz etkilerini %50 azaltır.',
    fiyat: 3000,
    gerekliSeraLevel: 3,
  },
];

// ID ile gübre bul
export const gubreBul = (id) => GUBRETLER.find(g => g.id === id);

// ID ile ilaç bul
export const ilacBul = (id) => ILACLAR.find(i => i.id === id);

// ID ile hastalık bul
export const hastalikBul = (id) => HASTALIKLAR.find(h => h.id === id);
