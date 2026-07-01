// Oyunun başlangıç durumu

import { BASLANGIC_PARASI } from './constants.js';
import { AY_MEVSIM, HAVA } from './constants.js';
import { gunlukGorevlerSec } from '../data/quests.js';

const bugun = new Date();
const mevsim = AY_MEVSIM[bugun.getMonth()];

// 6 boş saksı oluştur
const bosSaksiler = (sayi) =>
  Array.from({ length: sayi }, (_, i) => ({
    id: i,
    cicekId: null,
    asama: 'bos',
    ekildiZaman: null,
    sonSulamaZamani: null,
    suSeviyesi: 0,
    gubre: null,      // { id, uygulamaZamani }
    hastalik: null,   // { id, baslangicZamani }
    ilerleme: 0,      // 0-100
    kalite: 1.0,
  }));

export const baslangicDurumu = {
  // Oyuncu
  oyuncu: {
    ad: 'Çiçekçi',
    para: BASLANGIC_PARASI,
    seviye: 1,
    xp: 0,
  },

  // Sera
  sera: {
    seviye: 1,
    slotSayisi: 6,
    ozellikler: {
      otomatikSulama: false,
      hastalikSensoru: false,
      gubreDeposu: false,
      havakontrol: false,
    },
  },

  // Saksılar
  saksilar: bosSaksiler(6),

  // Envanter
  envanter: {
    tohumlar: { lale: 3, papatya: 3 },   // başlangıç tohumları
    gubreler: {},
    ilaclar: {},
  },

  // Koleksiyon (yetiştirilmiş çiçekler)
  koleksiyon: {},
  // Yapı: { cicekId: { sayi: 0, enIyiKalite: 0, ilkZaman: null } }

  // Başarımlar
  basarimlar: {},
  // Yapı: { basarimId: { acilisZamani: timestamp } }

  // Günlük görevler
  gorevler: {
    gunluk: gunlukGorevlerSec(),
    sonYenileme: Date.now(),
  },

  // Aktif rastgele olaylar
  aktifOlaylar: [],

  // Hava durumu
  hava: {
    mevcut: HAVA.GUNES,
    baslangicZamani: Date.now(),
    sure: 3 * 3600000, // 3 saat
  },

  // Mevsim
  mevsim: {
    mevcut: mevsim,
  },

  // İstatistikler
  istatistikler: {
    toplamEkim: 0,
    toplamSatis: 0,
    toplamSulama: 0,
    toplamGubre: 0,
    toplamYetistirme: 0,
    toplamKazanc: 0,
    toplamHarcama: 0,
    toplamIyilestirme: 0,
    toplamGorev: 0,
    toplamGun: 1,
    ardisikCanlıGun: 0,
    seraLevel: 1,
    nadirYetistirme: 0,
    egzotikYetistirme: 0,
    efsaneviYetistirme: 0,
    sonOyunGunu: new Date().toDateString(),
  },

  // Bildirimler kuyruğu
  bildirimler: [],

  // UI durumu
  ui: {
    aktifEkran: 'sera',
    seciliSaksiId: null,
    modalAcik: false,
    modalTipi: null,
    indirimAktif: false,
    indirimCarpani: 1.0,
    indirimBitiZamani: null,
    ariBonusBitis: null,
  },

  // Meta bilgi
  meta: {
    ilkOyunTarihi: Date.now(),
    sonKayitZamani: Date.now(),
    sonAcilisZamani: Date.now(),
    sonTickZamani: Date.now(),
    surum: '1.0.0',
  },
};

// Saksı oluşturucu (sera yükseltmelerinde kullanılır)
export const saksiOlustur = (id) => ({
  id,
  cicekId: null,
  asama: 'bos',
  ekildiZaman: null,
  sonSulamaZamani: null,
  suSeviyesi: 0,
  gubre: null,
  hastalik: null,
  ilerleme: 0,
  kalite: 1.0,
});
