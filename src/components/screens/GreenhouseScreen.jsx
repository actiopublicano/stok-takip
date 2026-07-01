// Sera ana ekranı - saksı ızgarası ve oyun olayları

import { useEffect } from 'react';
import { useOyun } from '../../context/GameContext.jsx';
import FlowerPot from '../ui/FlowerPot.jsx';
import PotModal from '../ui/PotModal.jsx';
import { HAVA_IKONU, MEVSIM_IKONU } from '../../game/systems/weatherSystem.js';
import { ASAMA } from '../../game/core/constants.js';

export default function GreenhouseScreen() {
  const { durum, dispatch } = useOyun();
  const { saksilar, hava, mevsim, aktifOlaylar } = durum;

  // Ölü saksı temizleme (custom event)
  useEffect(() => {
    const temizle = (e) => {
      dispatch({
        tip: 'SAKSI_TEMIZLE',
        saksiId: e.detail.id,
      });
    };
    window.addEventListener('temizle-saksi', temizle);
    return () => window.removeEventListener('temizle-saksi', temizle);
  }, [dispatch]);

  const hazirSayisi = saksilar.filter(s => s.asama === ASAMA.HAZIR).length;
  const hastalikSayisi = saksilar.filter(s => s.hastalik).length;

  return (
    <div className="sera-ekrani">
      {/* Hava bilgisi */}
      <div className="sera-hava-banner">
        <span>{HAVA_IKONU[hava.mevcut] ?? '☀️'} {hava.mevcut}</span>
        <span>•</span>
        <span>{MEVSIM_IKONU[mevsim.mevcut] ?? '🌸'} {mevsim.mevcut}</span>
        {hazirSayisi > 0 && (
          <span className="sera-uyari-chip">✂️ {hazirSayisi} hasat bekliyor</span>
        )}
        {hastalikSayisi > 0 && (
          <span className="sera-hata-chip">🦠 {hastalikSayisi} hasta</span>
        )}
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

      {/* Saksı ızgarası */}
      <div className="sera-izgara">
        {saksilar.map(saksi => (
          <FlowerPot key={saksi.id} saksi={saksi} />
        ))}
      </div>

      {/* Bilgi */}
      <div className="sera-alt-bilgi">
        <span>🌱 Saksı: {saksilar.filter(s => s.asama !== ASAMA.BOS).length}/{saksilar.length}</span>
      </div>

      {/* Modal */}
      <PotModal />
    </div>
  );
}
