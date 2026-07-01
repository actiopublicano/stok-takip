// Ana uygulama - çiçek yetiştirme oyunu

import { useState } from 'react';
import { OyunSaglayici } from './context/GameContext.jsx';
import { useOyun } from './context/GameContext.jsx';
import HUD from './components/ui/HUD.jsx';
import NavBar from './components/ui/NavBar.jsx';
import Bildirimler from './components/ui/Notification.jsx';
import TutorialOverlay from './components/ui/TutorialOverlay.jsx';
import GreenhouseScreen from './components/screens/GreenhouseScreen.jsx';
import ShopScreen from './components/screens/ShopScreen.jsx';
import CollectionScreen from './components/screens/CollectionScreen.jsx';
import AchievementsScreen from './components/screens/AchievementsScreen.jsx';
import ProfileScreen from './components/screens/ProfileScreen.jsx';
import { kayitVarMi } from './game/core/saveManager.js';

function OyunIcerigi() {
  const { durum } = useOyun();
  const aktifEkran = durum.ui.aktifEkran;
  const [tutorialAcik, setTutorialAcik] = useState(() => !kayitVarMi());

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
      {tutorialAcik && <TutorialOverlay onKapat={() => setTutorialAcik(false)} />}
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
