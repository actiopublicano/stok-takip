// Sera ana ekranı

import { useOyun } from '../../context/GameContext.jsx';
import FlowerPot from '../ui/FlowerPot.jsx';
import PotModal from '../ui/PotModal.jsx';
import QuickActions from '../ui/QuickActions.jsx';
import { HAVA_IKONU, MEVSIM_IKONU } from '../../game/systems/weatherSystem.js';
import { ASAMA } from '../../game/core/constants.js';

const kalanSureYaz = (bitiZamani) => {
  if (!bitiZamani) return '';
  const kalan = bitiZamani - Date.now();
  if (kalan <= 0) return '';
  const dk = Math.ceil(kalan / 60000);
  if (dk >= 60) return `${Math.floor(dk / 60)}s ${dk % 60}dk`;
  return `${dk}dk`;
};

export default function GreenhouseScreen() {
  const { durum } = useOyun();
  const { saksilar, hava, mevsim, aktifOlaylar, ui } = durum;

  const dolu = saksilar.filter(s => s.asama !== ASAMA.BOS).length;
  const kapasit = saksilar.length;

  const indirimKalan = ui.indirimAktif ? kalanSureYaz(ui.indirimBitiZamani) : null;
  const ariKalan = ui.ariBonusBitis && Date.now() < ui.ariBonusBitis ? kalanSureYaz(ui.ariBonusBitis) : null;
  const bonusAktif = indirimKalan || ariKalan;

  return (
    <div className="sera-ekrani">
      {/* Hava/Mevsim banner */}
      <div className="sera-hava-banner">
        <span>{HAVA_IKONU[hava.mevcut] ?? '☀️'} {hava.mevcut}</span>
        <span>•</span>
        <span>{MEVSIM_IKONU[mevsim.mevcut] ?? '🌸'} {mevsim.mevcut}</span>
        <span className="sera-kapasite">🪴 {dolu}/{kapasit}</span>
      </div>

      {/* Aktif bonus efektler */}
      {bonusAktif && (
        <div className="sera-olaylar">
          {indirimKalan && (
            <div className="sera-olay-chip sera-olay-indirim">
              🏷️ %30 İndirim {indirimKalan && `(${indirimKalan})`}
            </div>
          )}
          {ariKalan && (
            <div className="sera-olay-chip sera-olay-ari">
              🐝 Büyüme +30% {ariKalan && `(${ariKalan})`}
            </div>
          )}
        </div>
      )}

      {/* Geçmiş olaylar */}
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
