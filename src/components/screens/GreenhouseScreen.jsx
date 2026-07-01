// Sera ana ekranı

import { useOyun } from '../../context/GameContext.jsx';
import FlowerPot from '../ui/FlowerPot.jsx';
import PotModal from '../ui/PotModal.jsx';
import QuickActions from '../ui/QuickActions.jsx';
import { HAVA_IKONU, MEVSIM_IKONU } from '../../game/systems/weatherSystem.js';
import { ASAMA } from '../../game/core/constants.js';

export default function GreenhouseScreen() {
  const { durum } = useOyun();
  const { saksilar, hava, mevsim, aktifOlaylar } = durum;

  const dolu = saksilar.filter(s => s.asama !== ASAMA.BOS).length;
  const kapasit = saksilar.length;

  return (
    <div className="sera-ekrani">
      {/* Hava/Mevsim banner */}
      <div className="sera-hava-banner">
        <span>{HAVA_IKONU[hava.mevcut] ?? '☀️'} {hava.mevcut}</span>
        <span>•</span>
        <span>{MEVSIM_IKONU[mevsim.mevcut] ?? '🌸'} {mevsim.mevcut}</span>
        <span className="sera-kapasite">🪴 {dolu}/{kapasit}</span>
      </div>

      {/* Aktif olaylar */}
      {aktifOlaylar.length > 0 && (
        <div className="sera-olaylar">
          {aktifOlaylar.slice(-2).map(olay => (
            <div key={olay.baslangic} className="sera-olay-chip">
              {olay.emoji} {olay.ad}
            </div>
          ))}
        </div>
      )}

      {/* Hızlı eylemler */}
      <QuickActions />

      {/* Saksı ızgarası */}
      <div className="sera-izgara">
        {saksilar.map(saksi => (
          <FlowerPot key={saksi.id} saksi={saksi} />
        ))}
      </div>

      {/* Modal */}
      <PotModal />
    </div>
  );
}
