// Oyun state reducer - tüm oyun mantığı burada

import { ASAMA, XP_KAZAN, SEVIYE_XP, TICK_ARALIK, RASTGELE_OLAY_SANS, RASTGELE_OLAYLAR, SAAT } from './constants.js';
import { saksiOlustur } from './initialState.js';
import { cicekBul, NADIRLIK, CICEKLER } from '../data/flowers.js';
import { gubreBul, ilacBul, hastalikBul, SERA_YUKSELTMELERI } from '../data/items.js';
import { BASARIMLAR } from '../data/achievements.js';
import { gunlukGorevlerSec } from '../data/quests.js';
import { saksiGuncelle, satisFiyatiHesapla } from '../systems/growthSystem.js';
import { yeniHavaUret, havaDegistirilmeli, mevsimiBul } from '../systems/weatherSystem.js';

// XP'ye göre seviye hesapla
const seviyeHesapla = (xp) => {
  for (let i = SEVIYE_XP.length - 1; i >= 0; i--) {
    if (xp >= SEVIYE_XP[i]) return i + 1;
  }
  return 1;
};

// Bildirim ekle
const bildirimEkle = (durum, mesaj, tip = 'bilgi') => ({
  ...durum,
  bildirimler: [
    ...durum.bildirimler,
    { id: Date.now() + Math.random(), mesaj, tip, zaman: Date.now() },
  ],
});

// İstatistik güncelle
const istatGuncelle = (durum, guncellemeler) => ({
  ...durum,
  istatistikler: { ...durum.istatistikler, ...guncellemeler },
});

// Başarım kontrol ve açma
const basarimlariKontrolEt = (durum) => {
  let yeniDurum = { ...durum };
  for (const basarim of BASARIMLAR) {
    if (yeniDurum.basarimlar[basarim.id]) continue; // Zaten açık
    const acildi = basarim.kontrol(yeniDurum.istatistikler, yeniDurum.koleksiyon);
    if (acildi) {
      yeniDurum = {
        ...yeniDurum,
        basarimlar: {
          ...yeniDurum.basarimlar,
          [basarim.id]: { acilisZamani: Date.now() },
        },
        oyuncu: {
          ...yeniDurum.oyuncu,
          para: yeniDurum.oyuncu.para + basarim.odul,
        },
      };
      yeniDurum = bildirimEkle(
        yeniDurum,
        `🏆 Başarım: ${basarim.ad} (+${basarim.odul} 💰)`,
        'basarim'
      );
    }
  }
  return yeniDurum;
};

// Günlük görev ilerlemesini güncelle
const gorevleriGuncelle = (durum, tip, cicekId, nadirlik, miktar = 1) => {
  const simdi = Date.now();
  const gunluk = durum.gorevler.gunluk.map(gorev => {
    if (gorev.tamamlandi) return gorev;

    let eslesme = false;
    if (gorev.tip === tip) {
      if (!gorev.hedefCicek && !gorev.hedefNadirlik) eslesme = true;
      else if (gorev.hedefCicek && gorev.hedefCicek === cicekId) eslesme = true;
      else if (gorev.hedefNadirlik && gorev.hedefNadirlik === nadirlik) eslesme = true;
    }

    if (!eslesme) return gorev;

    const yeniMevcut = gorev.mevcut + miktar;
    const tamamlandi = yeniMevcut >= gorev.hedefMiktar;
    return { ...gorev, mevcut: yeniMevcut, tamamlandi };
  });

  return { ...durum, gorevler: { ...durum.gorevler, gunluk } };
};

// Görev ödüllerini ver
const gorevOdulleriVer = (durum) => {
  let para = 0;
  let gorevSayisi = 0;
  const gunluk = durum.gorevler.gunluk.map(g => {
    if (g.tamamlandi && !g.odulVerildi) {
      para += g.odul;
      gorevSayisi++;
      return { ...g, odulVerildi: true };
    }
    return g;
  });

  if (gorevSayisi === 0) return durum;

  let yeniDurum = {
    ...durum,
    gorevler: { ...durum.gorevler, gunluk },
    oyuncu: { ...durum.oyuncu, para: durum.oyuncu.para + para },
  };
  yeniDurum = istatGuncelle(yeniDurum, {
    toplamGorev: durum.istatistikler.toplamGorev + gorevSayisi,
  });
  if (para > 0) {
    yeniDurum = bildirimEkle(yeniDurum, `📋 Görev tamamlandı! +${para} 💰`, 'basari');
  }
  return yeniDurum;
};

// XP ekle ve seviye kontrolü
const xpEkle = (durum, miktar) => {
  const yeniXP = durum.oyuncu.xp + miktar;
  const yeniSeviye = seviyeHesapla(yeniXP);
  let yeniDurum = {
    ...durum,
    oyuncu: { ...durum.oyuncu, xp: yeniXP, seviye: yeniSeviye },
  };
  if (yeniSeviye > durum.oyuncu.seviye) {
    yeniDurum = bildirimEkle(yeniDurum, `⭐ Seviye ${yeniSeviye}! Tebrikler!`, 'seviye');
    yeniDurum = istatGuncelle(yeniDurum, { seraLevel: yeniDurum.sera.seviye });
  }
  return yeniDurum;
};

// ─── REDUCER ─────────────────────────────────────────────────────────────────

export const oyunReducer = (durum, eylem) => {
  switch (eylem.tip) {

    // ── TOHUM EK ────────────────────────────────────────────────
    case 'TOHUM_EK': {
      const { saksiId, cicekId } = eylem;
      const cicek = cicekBul(cicekId);
      if (!cicek) return durum;

      const tohumSayisi = durum.envanter.tohumlar[cicekId] ?? 0;
      if (tohumSayisi <= 0) return durum;

      const yeniSaksilar = durum.saksilar.map(s =>
        s.id === saksiId ? {
          ...s,
          cicekId,
          asama: ASAMA.TOHUM,
          ekildiZaman: Date.now(),
          sonSulamaZamani: Date.now(),
          suSeviyesi: 100,
          ilerleme: 0,
          hastalik: null,
          gubre: null,
          kalite: 1.0,
        } : s
      );

      let yeniDurum = {
        ...durum,
        saksilar: yeniSaksilar,
        envanter: {
          ...durum.envanter,
          tohumlar: {
            ...durum.envanter.tohumlar,
            [cicekId]: tohumSayisi - 1,
          },
        },
      };

      yeniDurum = istatGuncelle(yeniDurum, {
        toplamEkim: durum.istatistikler.toplamEkim + 1,
      });
      yeniDurum = xpEkle(yeniDurum, XP_KAZAN.cicekYetistir);
      yeniDurum = gorevleriGuncelle(yeniDurum, 'yetistir', cicekId, cicek.nadirlik);
      yeniDurum = gorevleriGuncelle(yeniDurum, 'yetistir_nadirlik', cicekId, cicek.nadirlik);
      yeniDurum = gorevOdulleriVer(yeniDurum);
      yeniDurum = bildirimEkle(yeniDurum, `🌱 ${cicek.name} ekildi!`, 'bilgi');
      return basarimlariKontrolEt(yeniDurum);
    }

    // ── SULA ─────────────────────────────────────────────────────
    case 'SULA': {
      const { saksiId } = eylem;
      const saksi = durum.saksilar.find(s => s.id === saksiId);
      if (!saksi || saksi.asama === ASAMA.BOS || saksi.asama === ASAMA.OLDU) return durum;

      const yeniSaksilar = durum.saksilar.map(s =>
        s.id === saksiId ? {
          ...s,
          sonSulamaZamani: Date.now(),
          suSeviyesi: 100,
          asama: s.asama === ASAMA.SOLUYOR ? ASAMA.BUYUYOR : s.asama,
        } : s
      );

      let yeniDurum = { ...durum, saksilar: yeniSaksilar };
      yeniDurum = istatGuncelle(yeniDurum, {
        toplamSulama: durum.istatistikler.toplamSulama + 1,
      });
      yeniDurum = xpEkle(yeniDurum, XP_KAZAN.sulama);
      yeniDurum = gorevleriGuncelle(yeniDurum, 'sula', null, null);
      yeniDurum = gorevOdulleriVer(yeniDurum);
      return basarimlariKontrolEt(yeniDurum);
    }

    // ── TÜMÜNÜ SULA ───────────────────────────────────────────────
    case 'TUMU_SULA': {
      const yeniSaksilar = durum.saksilar.map(s => {
        if (s.asama === ASAMA.BOS || s.asama === ASAMA.OLDU) return s;
        return { ...s, sonSulamaZamani: Date.now(), suSeviyesi: 100 };
      });
      const sulananSayisi = yeniSaksilar.filter(s => s.asama !== ASAMA.BOS && s.asama !== ASAMA.OLDU).length;
      let yeniDurum = { ...durum, saksilar: yeniSaksilar };
      yeniDurum = istatGuncelle(yeniDurum, {
        toplamSulama: durum.istatistikler.toplamSulama + sulananSayisi,
      });
      return yeniDurum;
    }

    // ── GÜBRE UYGULA ─────────────────────────────────────────────
    case 'GUBRE_UYGULA': {
      const { saksiId, gubreId } = eylem;
      const saksi = durum.saksilar.find(s => s.id === saksiId);
      if (!saksi || saksi.asama === ASAMA.BOS || saksi.asama === ASAMA.OLDU) return durum;

      const gubreSayisi = durum.envanter.gubreler[gubreId] ?? 0;
      if (gubreSayisi <= 0) return durum;

      const gubre = gubreBul(gubreId);
      if (!gubre) return durum;

      const yeniSaksilar = durum.saksilar.map(s =>
        s.id === saksiId ? {
          ...s,
          gubre: {
            id: gubreId,
            tur: gubre.etki.tur,
            uygulamaZamani: Date.now(),
            sure: gubre.etki.sure,
            kaliteEtkisi: gubre.etki.tur === 'kalite' || gubre.etki.tur === 'premium',
          },
          kalite: (gubre.etki.tur === 'kalite' || gubre.etki.tur === 'premium')
            ? Math.min(2.0, (s.kalite || 1.0) * (gubre.etki.carpan || 1.3))
            : s.kalite,
        } : s
      );

      let yeniDurum = {
        ...durum,
        saksilar: yeniSaksilar,
        envanter: {
          ...durum.envanter,
          gubreler: {
            ...durum.envanter.gubreler,
            [gubreId]: gubreSayisi - 1,
          },
        },
      };
      yeniDurum = istatGuncelle(yeniDurum, {
        toplamGubre: durum.istatistikler.toplamGubre + 1,
      });
      yeniDurum = xpEkle(yeniDurum, XP_KAZAN.gubre);
      yeniDurum = gorevleriGuncelle(yeniDurum, 'gubre', null, null);
      yeniDurum = gorevOdulleriVer(yeniDurum);
      yeniDurum = bildirimEkle(yeniDurum, `${gubre.emoji} ${gubre.name} uygulandı!`, 'bilgi');
      return basarimlariKontrolEt(yeniDurum);
    }

    // ── HASAT ────────────────────────────────────────────────────
    case 'HASAT': {
      const { saksiId } = eylem;
      const saksi = durum.saksilar.find(s => s.id === saksiId);
      if (!saksi || saksi.asama !== ASAMA.HAZIR) return durum;

      const cicek = cicekBul(saksi.cicekId);
      if (!cicek) return durum;

      const fiyat = satisFiyatiHesapla(
        cicek,
        saksi.kalite,
        durum.ui.indirimAktif ? durum.ui.indirimCarpani : 1.0
      );

      const yeniKoleksiyon = {
        ...durum.koleksiyon,
        [saksi.cicekId]: {
          sayi: ((durum.koleksiyon[saksi.cicekId]?.sayi) ?? 0) + 1,
          enIyiKalite: Math.max(durum.koleksiyon[saksi.cicekId]?.enIyiKalite ?? 0, saksi.kalite),
          ilkZaman: durum.koleksiyon[saksi.cicekId]?.ilkZaman ?? Date.now(),
        },
      };

      const yeniSaksilar = durum.saksilar.map(s =>
        s.id === saksiId ? {
          ...saksiOlustur(s.id),
        } : s
      );

      let yeniDurum = {
        ...durum,
        saksilar: yeniSaksilar,
        oyuncu: { ...durum.oyuncu, para: durum.oyuncu.para + fiyat },
        koleksiyon: yeniKoleksiyon,
      };

      const nadirlikIstatGuncelle = {};
      if (cicek.nadirlik === NADIRLIK.NADIR) nadirlikIstatGuncelle.nadirYetistirme = (durum.istatistikler.nadirYetistirme ?? 0) + 1;
      if (cicek.nadirlik === NADIRLIK.EGZOTIK) nadirlikIstatGuncelle.egzotikYetistirme = (durum.istatistikler.egzotikYetistirme ?? 0) + 1;
      if (cicek.nadirlik === NADIRLIK.EFSANEVI) nadirlikIstatGuncelle.efsaneviYetistirme = (durum.istatistikler.efsaneviYetistirme ?? 0) + 1;

      yeniDurum = istatGuncelle(yeniDurum, {
        toplamSatis: durum.istatistikler.toplamSatis + 1,
        toplamYetistirme: durum.istatistikler.toplamYetistirme + 1,
        toplamKazanc: durum.istatistikler.toplamKazanc + fiyat,
        ...nadirlikIstatGuncelle,
      });
      yeniDurum = xpEkle(yeniDurum, XP_KAZAN.cicekSat + XP_KAZAN.cicekYetistir);
      yeniDurum = gorevleriGuncelle(yeniDurum, 'sat', cicek.id, cicek.nadirlik);
      yeniDurum = gorevleriGuncelle(yeniDurum, 'yetistir', cicek.id, cicek.nadirlik);
      yeniDurum = gorevleriGuncelle(yeniDurum, 'yetistir_nadirlik', cicek.id, cicek.nadirlik);
      yeniDurum = gorevleriGuncelle(yeniDurum, 'kazan', null, null, fiyat);
      yeniDurum = gorevOdulleriVer(yeniDurum);
      yeniDurum = bildirimEkle(yeniDurum, `${cicek.emoji} ${cicek.name} hasat edildi! +${fiyat} 💰`, 'basari');
      return basarimlariKontrolEt(yeniDurum);
    }

    // ── HASTALIK TEDAVİ ───────────────────────────────────────────
    case 'HASTALIK_TEDAVI': {
      const { saksiId, ilacId } = eylem;
      const saksi = durum.saksilar.find(s => s.id === saksiId);
      if (!saksi || !saksi.hastalik) return durum;

      const ilacSayisi = durum.envanter.ilaclar[ilacId] ?? 0;
      if (ilacSayisi <= 0) return durum;

      const ilac = ilacBul(ilacId);
      if (!ilac) return durum;

      const hastalik = hastalikBul(saksi.hastalik.id);
      if (ilac.hedef !== 'tumu' && ilac.hedef !== hastalik?.id) {
        return bildirimEkle(durum, `Bu ilaç bu hastalığa uygun değil!`, 'hata');
      }

      const yeniSaksilar = durum.saksilar.map(s =>
        s.id === saksiId ? { ...s, hastalik: null } : s
      );

      let yeniDurum = {
        ...durum,
        saksilar: yeniSaksilar,
        envanter: {
          ...durum.envanter,
          ilaclar: {
            ...durum.envanter.ilaclar,
            [ilacId]: ilacSayisi - 1,
          },
        },
      };
      yeniDurum = istatGuncelle(yeniDurum, {
        toplamIyilestirme: durum.istatistikler.toplamIyilestirme + 1,
      });
      yeniDurum = xpEkle(yeniDurum, XP_KAZAN.hastalikIyilest);
      yeniDurum = gorevleriGuncelle(yeniDurum, 'iyilestir', null, null);
      yeniDurum = gorevOdulleriVer(yeniDurum);
      yeniDurum = bildirimEkle(yeniDurum, `💊 Hastalık iyileştirildi!`, 'basari');
      return basarimlariKontrolEt(yeniDurum);
    }

    // ── EŞYA SATIN AL ─────────────────────────────────────────────
    case 'ESYA_SATIN_AL': {
      const { kategori, id, fiyat, miktar = 1 } = eylem;
      const etkinFiyat = durum.ui.indirimAktif
        ? Math.round(fiyat * durum.ui.indirimCarpani)
        : fiyat;

      if (durum.oyuncu.para < etkinFiyat) {
        return bildirimEkle(durum, `Yeterli para yok! Gerekli: ${etkinFiyat} 💰`, 'hata');
      }

      let yeniEnvanter = { ...durum.envanter };
      if (kategori === 'tohum') {
        yeniEnvanter = {
          ...yeniEnvanter,
          tohumlar: {
            ...yeniEnvanter.tohumlar,
            [id]: (yeniEnvanter.tohumlar[id] ?? 0) + miktar,
          },
        };
      } else if (kategori === 'gubre') {
        yeniEnvanter = {
          ...yeniEnvanter,
          gubreler: {
            ...yeniEnvanter.gubreler,
            [id]: (yeniEnvanter.gubreler[id] ?? 0) + miktar,
          },
        };
      } else if (kategori === 'ilac') {
        yeniEnvanter = {
          ...yeniEnvanter,
          ilaclar: {
            ...yeniEnvanter.ilaclar,
            [id]: (yeniEnvanter.ilaclar[id] ?? 0) + miktar,
          },
        };
      }

      let yeniDurum = {
        ...durum,
        oyuncu: { ...durum.oyuncu, para: durum.oyuncu.para - etkinFiyat },
        envanter: yeniEnvanter,
      };
      yeniDurum = istatGuncelle(yeniDurum, {
        toplamHarcama: durum.istatistikler.toplamHarcama + etkinFiyat,
      });
      if (kategori === 'tohum') {
        yeniDurum = gorevleriGuncelle(yeniDurum, 'satin_al_tohum', id, null);
        yeniDurum = gorevOdulleriVer(yeniDurum);
      }
      return yeniDurum;
    }

    // ── SERA YÜKSELT ──────────────────────────────────────────────
    case 'SERA_YUKSELT': {
      const { seraId } = eylem;
      const seraYuks = SERA_YUKSELTMELERI.find(s => s.id === seraId);
      if (!seraYuks) return durum;

      if (durum.oyuncu.para < seraYuks.fiyat) {
        return bildirimEkle(durum, `Yeterli para yok! Gerekli: ${seraYuks.fiyat} 💰`, 'hata');
      }
      if (seraYuks.level <= durum.sera.seviye) {
        return bildirimEkle(durum, `Bu sera zaten aktif!`, 'hata');
      }

      // Yeni slotları ekle
      const mevcutSaksilar = [...durum.saksilar];
      const eklenecek = seraYuks.slotSayisi - mevcutSaksilar.length;
      for (let i = 0; i < eklenecek; i++) {
        mevcutSaksilar.push(saksiOlustur(mevcutSaksilar.length));
      }

      let yeniDurum = {
        ...durum,
        saksilar: mevcutSaksilar,
        sera: { ...durum.sera, seviye: seraYuks.level, slotSayisi: seraYuks.slotSayisi },
        oyuncu: { ...durum.oyuncu, para: durum.oyuncu.para - seraYuks.fiyat },
      };
      yeniDurum = istatGuncelle(yeniDurum, { seraLevel: seraYuks.level });
      yeniDurum = bildirimEkle(yeniDurum, `🏡 ${seraYuks.ad} satın alındı!`, 'basari');
      return basarimlariKontrolEt(yeniDurum);
    }

    // ── ÖZEL ÖZELLİK SATIN AL ─────────────────────────────────────
    case 'OZELLIK_SATIN_AL': {
      const { ozellikId, fiyat } = eylem;
      if (durum.oyuncu.para < fiyat) {
        return bildirimEkle(durum, `Yeterli para yok!`, 'hata');
      }
      const yeniDurum = {
        ...durum,
        sera: {
          ...durum.sera,
          ozellikler: { ...durum.sera.ozellikler, [ozellikId]: true },
        },
        oyuncu: { ...durum.oyuncu, para: durum.oyuncu.para - fiyat },
      };
      return bildirimEkle(yeniDurum, `✅ Özellik aktifleştirildi!`, 'basari');
    }

    // ── OYUN DÖNGÜSÜ (TICK) ───────────────────────────────────────
    case 'TICK': {
      const simdi = Date.now();
      const gecenZaman = simdi - durum.meta.sonTickZamani;

      if (gecenZaman < TICK_ARALIK * 0.8) return durum; // Çok erken

      // Arı bonusu aktif mi?
      const ariBonusu = durum.ui.ariBonusBitis && simdi < durum.ui.ariBonusBitis ? 1.3 : 1.0;

      // Saksıları güncelle
      const yeniSaksilar = durum.saksilar.map(s =>
        saksiGuncelle(s, gecenZaman, durum.hava.mevcut, durum.mevsim.mevcut, ariBonusu)
      );

      // Hava güncellemesi
      let yeniHava = durum.hava;
      if (havaDegistirilmeli(durum.hava)) {
        yeniHava = yeniHavaUret(durum.mevsim.mevcut);
      }

      // Mevsim güncelleme
      const yeniMevsim = { mevcut: mevsimiBul() };

      // Otomatik sulama
      let postSaksilar = yeniSaksilar;
      if (durum.sera.ozellikler.otomatikSulama) {
        const otomatikAralik = 2 * 3600000;
        postSaksilar = yeniSaksilar.map(s => {
          if (s.asama === ASAMA.BOS || s.asama === ASAMA.OLDU) return s;
          if (s.suSeviyesi < 30) {
            return { ...s, sonSulamaZamani: simdi, suSeviyesi: 100 };
          }
          return s;
        });
      }

      // Gün sayacı güncelle
      const bugunStr = new Date().toDateString();
      let yeniIstat = durum.istatistikler;
      if (bugunStr !== durum.istatistikler.sonOyunGunu) {
        yeniIstat = {
          ...yeniIstat,
          toplamGun: yeniIstat.toplamGun + 1,
          sonOyunGunu: bugunStr,
        };
      }

      // Günlük görev yenileme (gece yarısı)
      let yeniGorevler = durum.gorevler;
      const suanGece = new Date(simdi).toDateString();
      const sonYenilemeGun = new Date(durum.gorevler.sonYenileme).toDateString();
      if (suanGece !== sonYenilemeGun) {
        yeniGorevler = {
          gunluk: gunlukGorevlerSec(),
          sonYenileme: simdi,
        };
      }

      // İndirim / Arı bonusu süresi doldu mu?
      let yeniUI = { ...durum.ui };
      if (yeniUI.indirimAktif && yeniUI.indirimBitiZamani && simdi > yeniUI.indirimBitiZamani) {
        yeniUI = { ...yeniUI, indirimAktif: false, indirimCarpani: 1.0, indirimBitiZamani: null };
      }
      if (yeniUI.ariBonusBitis && simdi > yeniUI.ariBonusBitis) {
        yeniUI = { ...yeniUI, ariBonusBitis: null };
      }

      let yeniDurum = {
        ...durum,
        saksilar: postSaksilar,
        hava: yeniHava,
        mevsim: yeniMevsim,
        istatistikler: yeniIstat,
        gorevler: yeniGorevler,
        ui: yeniUI,
        meta: { ...durum.meta, sonTickZamani: simdi },
      };

      // Rastgele olay
      const saatlikTickSayisi = 3600000 / TICK_ARALIK;
      if (Math.random() < RASTGELE_OLAY_SANS / saatlikTickSayisi) {
        const olay = RASTGELE_OLAYLAR[Math.floor(Math.random() * RASTGELE_OLAYLAR.length)];
        yeniDurum = bildirimEkle(yeniDurum, `${olay.emoji} ${olay.ad}: ${olay.aciklama}`, 'olay');
        yeniDurum = {
          ...yeniDurum,
          aktifOlaylar: [
            ...yeniDurum.aktifOlaylar,
            { ...olay, baslangic: simdi },
          ].slice(-3),
        };

        // Olay efektlerini uygula
        if (olay.etki === 'bedava_sulama') {
          yeniDurum = {
            ...yeniDurum,
            saksilar: yeniDurum.saksilar.map(s =>
              s.asama === ASAMA.BOS || s.asama === ASAMA.OLDU ? s
                : { ...s, sonSulamaZamani: simdi, suSeviyesi: 100 }
            ),
          };
        } else if (olay.etki === 'nadir_tohum') {
          const nadirler = CICEKLER.filter(c => c.nadirlik === NADIRLIK.NADIR);
          const sec = nadirler[Math.floor(Math.random() * nadirler.length)];
          if (sec) {
            yeniDurum = {
              ...yeniDurum,
              envanter: {
                ...yeniDurum.envanter,
                tohumlar: {
                  ...yeniDurum.envanter.tohumlar,
                  [sec.id]: (yeniDurum.envanter.tohumlar[sec.id] ?? 0) + 1,
                },
              },
            };
          }
        } else if (olay.etki === 'efsanevi_tohum') {
          const egzotikler = CICEKLER.filter(c =>
            c.nadirlik === NADIRLIK.EGZOTIK || c.nadirlik === NADIRLIK.EFSANEVI
          );
          const sec = egzotikler[Math.floor(Math.random() * egzotikler.length)];
          if (sec) {
            yeniDurum = {
              ...yeniDurum,
              envanter: {
                ...yeniDurum.envanter,
                tohumlar: {
                  ...yeniDurum.envanter.tohumlar,
                  [sec.id]: (yeniDurum.envanter.tohumlar[sec.id] ?? 0) + 1,
                },
              },
            };
          }
        } else if (olay.etki === 'indirim') {
          yeniDurum = {
            ...yeniDurum,
            ui: {
              ...yeniDurum.ui,
              indirimAktif: true,
              indirimCarpani: 0.7,
              indirimBitiZamani: simdi + 2 * SAAT,
            },
          };
        } else if (olay.etki === 'buyume_hizi') {
          yeniDurum = {
            ...yeniDurum,
            ui: { ...yeniDurum.ui, ariBonusBitis: simdi + 2 * SAAT },
          };
        } else if (olay.etki === 'gubre_bonus') {
          yeniDurum = {
            ...yeniDurum,
            saksilar: yeniDurum.saksilar.map(s =>
              s.asama === ASAMA.BOS || s.asama === ASAMA.OLDU ? s
                : { ...s, kalite: Math.min(2.0, (s.kalite ?? 1.0) * 1.2) }
            ),
          };
        }
      }

      return yeniDurum;
    }

    // ── OFFLİNE SENKRON ───────────────────────────────────────────
    case 'OFFLINE_SENKRON': {
      const { simdi } = eylem;
      const sonAcilis = durum.meta.sonAcilisZamani;
      const gecenZaman = Math.min(simdi - sonAcilis, 24 * 3600000);

      if (gecenZaman < 5000) return durum;

      const yeniSaksilar = durum.saksilar.map(s =>
        saksiGuncelle(s, gecenZaman, durum.hava.mevcut, durum.mevsim.mevcut, 1.0)
      );

      const saat = Math.floor(gecenZaman / 3600000);
      const dakika = Math.floor((gecenZaman % 3600000) / 60000);
      const mesaj = saat > 0
        ? `Hoş geldin! ${saat} saat ${dakika} dakika geçti.`
        : `Hoş geldin! ${dakika} dakika geçti.`;

      let yeniDurum = {
        ...durum,
        saksilar: yeniSaksilar,
        mevsim: { mevcut: mevsimiBul() },
        meta: { ...durum.meta, sonAcilisZamani: simdi, sonTickZamani: simdi },
      };
      return bildirimEkle(yeniDurum, `🌱 ${mesaj}`, 'bilgi');
    }

    // ── BİLDİRİM EKLE ────────────────────────────────────────────
    case 'BILDIRIM_EKLE': {
      return bildirimEkle(durum, eylem.mesaj, eylem.bildirimTipi ?? 'bilgi');
    }

    // ── BİLDİRİM KALDIR ──────────────────────────────────────────
    case 'BILDIRIM_KALDIR': {
      return {
        ...durum,
        bildirimler: durum.bildirimler.filter(b => b.id !== eylem.id),
      };
    }

    // ── EKRAN DEĞİŞTİR ────────────────────────────────────────────
    case 'EKRAN_DEGISTIR': {
      return {
        ...durum,
        ui: { ...durum.ui, aktifEkran: eylem.ekran },
      };
    }

    // ── SAKSI SEÇ / MODAL ─────────────────────────────────────────
    case 'SAKSI_SEC': {
      return {
        ...durum,
        ui: {
          ...durum.ui,
          seciliSaksiId: eylem.saksiId,
          modalAcik: eylem.saksiId !== null,
          modalTipi: 'saksi',
        },
      };
    }

    case 'MODAL_KAPAT': {
      return {
        ...durum,
        ui: { ...durum.ui, modalAcik: false, seciliSaksiId: null, modalTipi: null },
      };
    }

    // ── ÖLÜ SAKSI TEMİZLE ─────────────────────────────────────────
    case 'SAKSI_TEMIZLE': {
      const { saksiId } = eylem;
      const yeniSaksilar = durum.saksilar.map(s =>
        s.id === saksiId ? saksiOlustur(s.id) : s
      );
      return { ...durum, saksilar: yeniSaksilar };
    }

    // ── OYUN SIFIRLA ──────────────────────────────────────────────
    case 'OYUN_SIFIRLA': {
      const { baslangicDurumu } = eylem;
      return baslangicDurumu;
    }

    // ── GÜNLÜK GİRİŞ BONUSU ───────────────────────────────────────
    case 'GUNLUK_GIRIS': {
      const simdi = Date.now();
      const bugunStr = new Date(simdi).toDateString();
      const sonGirisStr = durum.istatistikler.sonGirisTarihi ?? '';

      if (bugunStr === sonGirisStr) return durum; // Bugün zaten giriş yapıldı

      const oncekiMs = sonGirisStr ? new Date(sonGirisStr).getTime() : 0;
      const farkGun = oncekiMs > 0 ? Math.floor((simdi - oncekiMs) / 86400000) : 999;
      const eskiStreak = durum.istatistikler.girisStreak ?? 0;
      const yeniStreak = farkGun <= 2 ? eskiStreak + 1 : 1;

      // Streak'e göre ödül
      let odul = 50;
      let odulTohumId = null;
      let mesaj = `Gün ${yeniStreak} — Her gün gel!`;

      if (yeniStreak >= 30) {
        odul = 1000;
        const nadirler = CICEKLER.filter(c => c.nadirlik === NADIRLIK.NADIR);
        odulTohumId = nadirler[Math.floor(Math.random() * nadirler.length)]?.id;
        mesaj = `🔥 ${yeniStreak} gün serisi! Efsane!`;
      } else if (yeniStreak >= 14) {
        odul = 400;
        const nadirler = CICEKLER.filter(c => c.nadirlik === NADIRLIK.NADIR);
        odulTohumId = nadirler[Math.floor(Math.random() * nadirler.length)]?.id;
        mesaj = `🔥 ${yeniStreak} gün serisi! Muhteşem!`;
      } else if (yeniStreak >= 7) {
        odul = 200;
        const yaygInlar = CICEKLER.filter(c => c.nadirlik === NADIRLIK.YAYGIN);
        odulTohumId = yaygInlar[Math.floor(Math.random() * yaygInlar.length)]?.id;
        mesaj = `🔥 ${yeniStreak} gün serisi! Harika!`;
      } else if (yeniStreak >= 3) {
        odul = 100;
        mesaj = `🔥 ${yeniStreak} gün serisi! Süper!`;
      }

      let yeniEnvanter = durum.envanter;
      if (odulTohumId) {
        yeniEnvanter = {
          ...yeniEnvanter,
          tohumlar: {
            ...yeniEnvanter.tohumlar,
            [odulTohumId]: (yeniEnvanter.tohumlar[odulTohumId] ?? 0) + 1,
          },
        };
      }

      const odulCicek = odulTohumId ? cicekBul(odulTohumId) : null;

      return {
        ...durum,
        oyuncu: { ...durum.oyuncu, para: durum.oyuncu.para + odul },
        envanter: yeniEnvanter,
        istatistikler: {
          ...durum.istatistikler,
          sonGirisTarihi: bugunStr,
          girisStreak: yeniStreak,
        },
        ui: {
          ...durum.ui,
          gunlukBonusBilgisi: {
            streak: yeniStreak,
            para: odul,
            tohumAdi: odulCicek?.name ?? null,
            tohumEmoji: odulCicek?.emoji ?? null,
            mesaj,
          },
        },
      };
    }

    // ── GÜNLÜK BONUS KAPAT ─────────────────────────────────────────
    case 'BONUS_KAPAT': {
      return {
        ...durum,
        ui: { ...durum.ui, gunlukBonusBilgisi: null },
      };
    }

    default:
      return durum;
  }
};
