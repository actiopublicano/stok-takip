// Web Notification API - tarayıcı bildirimleri

const IKON = '/stok-takip/icon-192.png';

export const izinIste = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const sonuc = await Notification.requestPermission();
  return sonuc === 'granted';
};

export const izinDurumu = () => {
  if (!('Notification' in window)) return 'desteklenmiyor';
  return Notification.permission; // 'default' | 'granted' | 'denied'
};

export const bildirimGonder = (baslik, metin) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(baslik, { body: metin, icon: IKON, badge: IKON });
  } catch {
    // service worker kontekstinde olmayabilir, sessizce geç
  }
};
