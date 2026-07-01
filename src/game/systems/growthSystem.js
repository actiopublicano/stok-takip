// Büyüme ve su hesaplamaları - saf fonksiyonlar

import {
  ASAMA, SAAT, SU,
  HAVA_CARPANI, HAVA_SU_CARPANI, MEVSIM_CARPANI,
  HASTALIK_SANCES, HAVA_HASTALIK_CARPANI,
} from '../core/constants.js';
import { cicekBul } from '../data/flowers.js';
import { hastalikBul, HASTALIKLAR } from '../data/items.js';

// Şu anki su seviyesini hesapla (0-100)
export const suSeviyesiHesapla = (sonSulamaZamani, sulamaAraligi, havaDurumu, simdi) => {
  if (!sonSulamaZamani) return 0;
  const suTuketimCarpani = HAVA_SU_CARPANI[havaDurumu] ?? 1.0;
  const etkinAralik = sulamaAraligi / suTuketimCarpani;
  const gecenZaman = simdi - sonSulamaZamani;
  const seviye = 100 - (gecenZaman / etkinAralik) * 100;
  return Math.max(0, Math.min(100, seviye));
};

// Su seviyesine göre büyüme çarpanı
export const suBuyumeCarpani = (suSeviyesi) => {
  if (suSeviyesi >= SU.AZ) return 1.0;
  if (suSeviyesi >= SU.KRITIK) return 0.5;
  if (suSeviyesi > SU.BOS) return 0.1;
  return 0;
};

// Aşamayı ilerleme yüzdesinden hesapla
export const ilerlemedenAsama = (ilerleme, suSeviyesi) => {
  if (ilerleme >= 100) return ASAMA.HAZIR;
  if (suSeviyesi <= 0 && ilerleme > 0) return ASAMA.SOLUYOR;
  if (ilerleme < 15) return ASAMA.TOHUM;
  if (ilerleme < 40) return ASAMA.FILIZ;
  if (ilerleme < 75) return ASAMA.BUYUYOR;
  return ASAMA.CICEK;
};

// Belirli süre için büyüme miktarını hesapla
export const buyumeMiktariHesapla = ({
  gecenZaman,
  buyumeZamani,
  suSeviyesi,
  gubreTipi,
  havaDurumu,
  mevsim,
  olayBonusu = 1.0,
}) => {
  if (gecenZaman <= 0 || buyumeZamani <= 0) return 0;

  let carpan = 1.0;

  // Su etkisi
  carpan *= suBuyumeCarpani(suSeviyesi);

  // Gübre etkisi
  if (gubreTipi === 'hiz' || gubreTipi === 'premium') {
    carpan *= 1.5;
  }

  // Hava etkisi
  carpan *= HAVA_CARPANI[havaDurumu] ?? 1.0;

  // Mevsim etkisi
  carpan *= MEVSIM_CARPANI[mevsim] ?? 1.0;

  // Arı/olay büyüme bonusu
  carpan *= olayBonusu;

  return (gecenZaman / buyumeZamani) * 100 * carpan;
};

// Kalite hesapla (0.5 - 2.0 arası)
export const kaliteHesapla = (suGecmisi, gubreKalite, hastalikYasandi) => {
  let kalite = 1.0;
  if (gubreKalite) kalite *= 1.3;
  if (hastalikYasandi) kalite *= 0.8;
  return Math.max(0.5, Math.min(2.0, kalite));
};

// Satış fiyatı hesapla
export const satisFiyatiHesapla = (cicek, kalite, indirimCarpani = 1.0) => {
  return Math.round(cicek.satisFiyati * kalite * indirimCarpani);
};

// Hastalık oluşup oluşmayacağını kontrol et
export const hastalikOlusabilir = (gecenZaman, havaDurumu, gubreTipi) => {
  if (gubreTipi === 'koruma' || gubreTipi === 'premium') return false;

  const saatSayisi = gecenZaman / SAAT;
  const hastalikCarpani = HAVA_HASTALIK_CARPANI[havaDurumu] ?? 1.0;
  const olasilik = HASTALIK_SANCES * saatSayisi * hastalikCarpani;

  return Math.random() < olasilik;
};

// Rastgele hastalık seç
export const rastgeleHastalik = () => {
  const idx = Math.floor(Math.random() * HASTALIKLAR.length);
  return {
    id: HASTALIKLAR[idx].id,
    baslangicZamani: Date.now(),
  };
};

// Hastalığın ölüm katkısını hesapla (büyüme yüzdesinden düşülecek)
export const hastalikZarariHesapla = (hastalik, gecenZaman) => {
  if (!hastalik) return 0;
  const h = hastalikBul(hastalik.id);
  if (!h) return 0;
  // Dakika başına zarar * geçen dakika
  const dakika = gecenZaman / 60000;
  return h.olumHizi * dakika;
};

// Tek saksıyı verilen süre için güncelle
export const saksiGuncelle = (saksi, gecenZaman, havaDurumu, mevsim, olayBonusu = 1.0) => {
  if (saksi.asama === ASAMA.BOS || saksi.asama === ASAMA.OLDU) return saksi;

  const cicek = cicekBul(saksi.cicekId);
  if (!cicek) return saksi;

  const simdi = Date.now();

  // Su seviyesini güncelle
  const suSeviyesi = saksi.sonSulamaZamani
    ? suSeviyesiHesapla(saksi.sonSulamaZamani, cicek.sulamaAraligi, havaDurumu, simdi)
    : 0;

  // Gübre tipi aktif mi?
  const gubreAktif = saksi.gubre && (simdi - saksi.gubre.uygulamaZamani) < (saksi.gubre.sure ?? 0)
    ? saksi.gubre.tur
    : null;

  // Büyüme miktarı
  let yeniBuyume = buyumeMiktariHesapla({
    gecenZaman,
    buyumeZamani: cicek.buyumeZamani,
    suSeviyesi,
    gubreTipi: gubreAktif,
    havaDurumu,
    mevsim,
    olayBonusu,
  });

  // Hastalık zararı
  const hastalikZarar = hastalikZarariHesapla(saksi.hastalik, gecenZaman);
  yeniBuyume -= hastalikZarar;

  let yeniIlerleme = Math.max(0, Math.min(100, saksi.ilerleme + yeniBuyume));

  // Hastalık oluşabilir mi?
  let hastalik = saksi.hastalik;
  if (!hastalik && saksi.asama !== ASAMA.HAZIR && yeniIlerleme > 5) {
    if (hastalikOlusabilir(gecenZaman, havaDurumu, gubreAktif)) {
      hastalik = rastgeleHastalik();
    }
  }

  // Ölüm kontrolü: hastalık veya su sıfırsa
  let asama;
  if (suSeviyesi <= 0 && saksi.asama !== ASAMA.HAZIR) {
    const kurumaSuresi = simdi - saksi.sonSulamaZamani;
    const maksSure = cicek.sulamaAraligi * 3;
    if (kurumaSuresi > maksSure) {
      return { ...saksi, asama: ASAMA.OLDU, suSeviyesi: 0, hastalik };
    }
    asama = ASAMA.SOLUYOR;
  } else if (hastalik) {
    const hastalikSuresi = simdi - hastalik.baslangicZamani;
    const maksHastalikSure = 12 * 3600000; // 12 saatte hastalık öldürür
    if (hastalikSuresi > maksHastalikSure) {
      return { ...saksi, asama: ASAMA.OLDU, suSeviyesi, hastalik };
    }
    asama = ilerlemedenAsama(yeniIlerleme, suSeviyesi);
  } else {
    asama = ilerlemedenAsama(yeniIlerleme, suSeviyesi);
  }

  return {
    ...saksi,
    suSeviyesi: Math.round(suSeviyesi),
    ilerleme: yeniIlerleme,
    asama,
    hastalik,
  };
};

// Offline senkronizasyon - kapalıyken olan değişiklikler
export const offlineSenkron = (durum, simdi) => {
  const { saksilar, hava, mevsim, meta } = durum;
  const gecenZaman = Math.min(simdi - meta.sonAcilisZamani, 24 * 3600000);

  if (gecenZaman < 1000) return durum; // 1 saniyeden az, güncelleme yok

  const yeniSaksilar = saksilar.map(s =>
    saksiGuncelle(s, gecenZaman, hava.mevcut, mevsim.mevcut)
  );

  return {
    ...durum,
    saksilar: yeniSaksilar,
    meta: { ...meta, sonAcilisZamani: simdi, sonTickZamani: simdi },
  };
};
