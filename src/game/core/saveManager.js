// LocalStorage kayıt/yükleme sistemi

const KAYIT_ANAHTARI = 'cicek_oyunu_v1';
const YEDEK_ANAHTARI = 'cicek_oyunu_yedek_v1';

// Kaydet
export const kaydet = (durum) => {
  try {
    const veri = JSON.stringify({
      ...durum,
      meta: {
        ...durum.meta,
        sonKayitZamani: Date.now(),
      },
    });
    localStorage.setItem(KAYIT_ANAHTARI, veri);
    // Her 5 kayıtta bir yedek al
    if (Math.random() < 0.2) {
      localStorage.setItem(YEDEK_ANAHTARI, veri);
    }
    return true;
  } catch (e) {
    console.error('Kaydetme hatası:', e);
    return false;
  }
};

// Yükle
export const yukle = () => {
  try {
    const veri = localStorage.getItem(KAYIT_ANAHTARI);
    if (!veri) return null;
    return JSON.parse(veri);
  } catch (e) {
    console.error('Yükleme hatası:', e);
    // Yedekten yükle
    try {
      const yedek = localStorage.getItem(YEDEK_ANAHTARI);
      if (yedek) return JSON.parse(yedek);
    } catch {}
    return null;
  }
};

// Yedekten yükle
export const yedektenYukle = () => {
  try {
    const veri = localStorage.getItem(YEDEK_ANAHTARI);
    if (!veri) return null;
    return JSON.parse(veri);
  } catch (e) {
    return null;
  }
};

// Sil (sıfırla)
export const sil = () => {
  localStorage.removeItem(KAYIT_ANAHTARI);
  localStorage.removeItem(YEDEK_ANAHTARI);
};

// Kayıt var mı?
export const kayitVarMi = () => {
  return !!localStorage.getItem(KAYIT_ANAHTARI);
};
