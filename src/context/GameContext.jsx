// React Context - oyun durumu ve dispatch fonksiyonunu sağlar

import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { oyunReducer } from '../game/core/gameReducer.js';
import { baslangicDurumu } from '../game/core/initialState.js';
import { kaydet, yukle } from '../game/core/saveManager.js';
import { TICK_ARALIK, ASAMA } from '../game/core/constants.js';
import { bildirimGonder } from '../game/systems/notificationSystem.js';

const OyunContext = createContext(null);

export const OyunSaglayici = ({ children }) => {
  const baslangic = () => {
    const kayitliDurum = yukle();
    return kayitliDurum ?? baslangicDurumu;
  };

  const [durum, dispatch] = useReducer(oyunReducer, null, baslangic);
  const oncekiSaksilar = useRef(null);

  // Oyun başlangıcında offline senkron + günlük giriş bonusu
  useEffect(() => {
    const simdi = Date.now();
    if (yukle()) {
      dispatch({ tip: 'OFFLINE_SENKRON', simdi });
    }
    dispatch({ tip: 'GUNLUK_GIRIS', simdi });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Oyun döngüsü - her 5 saniyede bir tick
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ tip: 'TICK' });
    }, TICK_ARALIK);
    return () => clearInterval(interval);
  }, []);

  // Otomatik kayıt - her 30 saniyede bir
  useEffect(() => {
    const kayitInterval = setInterval(() => {
      kaydet(durum);
    }, 30000);
    return () => clearInterval(kayitInterval);
  }, [durum]);

  // Uygulama kapanırken kaydet
  useEffect(() => {
    const kapanirken = () => kaydet(durum);
    window.addEventListener('beforeunload', kapanirken);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) kaydet(durum);
    });
    return () => {
      window.removeEventListener('beforeunload', kapanirken);
    };
  }, [durum]);

  // Tarayıcı bildirimleri: hasat/hastalık/olay değişimlerini izle
  useEffect(() => {
    const onceki = oncekiSaksilar.current;
    if (!onceki) {
      oncekiSaksilar.current = durum.saksilar;
      return;
    }

    durum.saksilar.forEach(saksi => {
      const eski = onceki.find(s => s.id === saksi.id);
      if (!eski) return;

      if (eski.asama !== ASAMA.HAZIR && saksi.asama === ASAMA.HAZIR) {
        bildirimGonder('🌸 Çiçek Hazır!', `${saksi.cicekId} hasat edilmeye hazır.`);
      }
      if (!eski.hastalik && saksi.hastalik) {
        bildirimGonder('🦠 Hastalık Uyarısı!', 'Bir çiçeğin hastalandı, ilaç uygula!');
      }
    });

    oncekiSaksilar.current = durum.saksilar;
  }, [durum.saksilar]);

  // Kolaylık fonksiyonları
  const tohumu_ek = useCallback((saksiId, cicekId) =>
    dispatch({ tip: 'TOHUM_EK', saksiId, cicekId }), []);

  const sula = useCallback((saksiId) =>
    dispatch({ tip: 'SULA', saksiId }), []);

  const gubre_uygula = useCallback((saksiId, gubreId) =>
    dispatch({ tip: 'GUBRE_UYGULA', saksiId, gubreId }), []);

  const hasat = useCallback((saksiId) =>
    dispatch({ tip: 'HASAT', saksiId }), []);

  const toplu_hasat = useCallback(() =>
    dispatch({ tip: 'TOPLU_HASAT' }), []);

  const hastalik_tedavi = useCallback((saksiId, ilacId) =>
    dispatch({ tip: 'HASTALIK_TEDAVI', saksiId, ilacId }), []);

  const esya_satin_al = useCallback((kategori, id, fiyat, miktar) =>
    dispatch({ tip: 'ESYA_SATIN_AL', kategori, id, fiyat, miktar }), []);

  const sera_yukselt = useCallback((seraId) =>
    dispatch({ tip: 'SERA_YUKSELT', seraId }), []);

  const ozellik_satin_al = useCallback((ozellikId, fiyat) =>
    dispatch({ tip: 'OZELLIK_SATIN_AL', ozellikId, fiyat }), []);

  const ekran_degistir = useCallback((ekran) =>
    dispatch({ tip: 'EKRAN_DEGISTIR', ekran }), []);

  const saksi_sec = useCallback((saksiId) =>
    dispatch({ tip: 'SAKSI_SEC', saksiId }), []);

  const modal_kapat = useCallback(() =>
    dispatch({ tip: 'MODAL_KAPAT' }), []);

  const bildirim_kaldir = useCallback((id) =>
    dispatch({ tip: 'BILDIRIM_KALDIR', id }), []);

  const manuelKaydet = useCallback(() => {
    const sonuc = kaydet(durum);
    if (sonuc) {
      dispatch({ tip: 'BILDIRIM_EKLE', mesaj: '💾 Oyun kaydedildi!', bildirimTipi: 'basari' });
    }
  }, [durum]);

  const deger = {
    durum,
    dispatch,
    tohumu_ek,
    sula,
    gubre_uygula,
    hasat,
    toplu_hasat,
    hastalik_tedavi,
    esya_satin_al,
    sera_yukselt,
    ozellik_satin_al,
    ekran_degistir,
    saksi_sec,
    modal_kapat,
    bildirim_kaldir,
    manuelKaydet,
  };

  return (
    <OyunContext.Provider value={deger}>
      {children}
    </OyunContext.Provider>
  );
};

export const useOyun = () => {
  const context = useContext(OyunContext);
  if (!context) throw new Error('useOyun, OyunSaglayici içinde kullanılmalı');
  return context;
};
