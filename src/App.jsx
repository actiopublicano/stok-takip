// Ana uygulama - çiçek yetiştirme oyunu

import { useEffect } from 'react';
import { OyunSaglayici, useOyun } from './context/GameContext.jsx';
import HUD from './components/ui/HUD.jsx';
import NavBar from './components/ui/NavBar.jsx';
import Bildirimler from './components/ui/Notification.jsx';
import GreenhouseScreen from './components/screens/GreenhouseScreen.jsx';
import ShopScreen from './components/screens/ShopScreen.jsx';
import CollectionScreen from './components/screens/CollectionScreen.jsx';
import AchievementsScreen from './components/screens/AchievementsScreen.jsx';
import ProfileScreen from './components/screens/ProfileScreen.jsx';

function OyunIcerigi() {
  const { durum, dispatch } = useOyun();
  const aktifEkran = durum.ui.aktifEkran;

  // Ölü saksı temizleme eventi
  useEffect(() => {
    const temizle = (e) => {
      dispatch({ tip: 'SAKSI_TEMIZLE', saksiId: e.detail.id });
    };
    window.addEventListener('temizle-saksi', temizle);
    return () => window.removeEventListener('temizle-saksi', temizle);
  }, [dispatch]);

  const ekranlar = {
    sera: <GreenhouseScreen />,
    dukkan: <ShopScreen />,
    koleksiyon: <CollectionScreen />,
    basarimlar: <AchievementsScreen />,
    profil: <ProfileScreen />,
  };

  return (
    <div className="oyun-kap">
      <HUD />
      <main className="oyun-ana">
        {ekranlar[aktifEkran] ?? <GreenhouseScreen />}
      </main>
      <NavBar />
      <Bildirimler />
    </div>
  );
}

export default function App() {
  return (
    <OyunSaglayici>
      <OyunIcerigi />
    </OyunSaglayici>
  );
}
