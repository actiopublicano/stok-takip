// Sera ana ekranı

import { useState } from 'react';
import { useOyun } from '../../context/GameContext.jsx';
import FlowerPot from '../ui/FlowerPot.jsx';
import PotModal from '../ui/PotModal.jsx';
import QuickActions from '../ui/QuickActions.jsx';
import { HAVA_IKONU, MEVSIM_IKONU } from '../../game/systems/weatherSystem.js';
import { ASAMA, HAVA_CARPANI, HAVA_SU_CARPANI, HAVA_HASTALIK_CARPANI, MEVSIM_CARPANI } from '../../game/core/constants.js';
import { cicekBul } from '../../game/data/flowers.js';
import { ses } from '../../game/systems/soundSystem.js';

const kalanSureYaz = (bitiZamani) => {
  if (!bitiZamani) return '';
  const kalan = bitiZamani - Date.now();
  if (kalan <= 0) return '';
  const dk = Math.ceil(kalan / 60000);
  if (dk >= 60) return `${Math.floor(dk / 60)}s ${dk % 60}dk`;
  return `${dk}dk`;
};

// Çarpan → metin (+30%, Normal, -10%)
const carpanYaz = (c) => {
  const p = Math.round((c - 1) * 100);
  if (p === 0) return 'Normal';
  return p > 0 ? `+${p}%` : `${p}%`;
};

// Büyüme/iyi şey: yüksek = iyi → yeşil
const buyumeRenk = (c) => c > 1 ? '#66bb6a' : c < 1 ? '#ef5350' : '#9e9e9e';
// Su/hastalık/kötü şey: düşük = iyi → yeşil
const riskRenk   = (c) => c < 1 ? '#66bb6a' : c > 1 ? '#ef5350' : '#9e9e9e';

export default function GreenhouseScreen() {
  const { durum, toplu_hasat } = useOyun();
  const { saksilar, hava, mevsim, aktifOlaylar, ui, pazar } = durum;
  const [havaDetay, setHavaDetay] = useState(false);

  const dolu = saksilar.filter(s => s.asama !== ASAMA.BOS).length;
  const kapasit = saksilar.length;
  const hasatSayisi = saksilar.filter(s => s.asama === ASAMA.HAZIR).length;

  const gunlukCicek = pazar?.gunlukCicek ? cicekBul(pazar.gunlukCicek) : null;

  const handleTopluHasat = () => {
    toplu_hasat();
    ses.hasat?.();
  };

  const indirimKalan = ui.indirimAktif ? kalanSureYaz(ui.indirimBitiZamani) : null;
  const ariKalan = ui.ariBonusBitis && Date.now() < ui.ariBonusBitis ? kalanSureYaz(ui.ariBonusBitis) : null;
  const bonusAktif = indirimKalan || ariKalan;

  // Güncel hava/mevsim çarpanları
  const havaBuyume   = HAVA_CARPANI[hava.mevcut]          ?? 1.0;
  const havaSu       = HAVA_SU_CARPANI[hava.mevcut]       ?? 1.0;
  const havaHastalik = HAVA_HASTALIK_CARPANI[hava.mevcut] ?? 1.0;
  const mevsimBuyume = MEVSIM_CARPANI[mevsim.mevcut]      ?? 1.0;

  return (
    <div className="sera-ekrani">
      {/* Hava/Mevsim banner — tıklanabilir */}
      <div className="sera-hava-banner sera-hava-banner-tikla" onClick={() => setHavaDetay(d => !d)}>
        <span>{HAVA_IKONU[hava.mevcut] ?? '☀️'} {hava.mevcut}</span>
        <span>•</span>
        <span>{MEVSIM_IKONU[mevsim.mevcut] ?? '🌸'} {mevsim.mevcut}</span>
        <span className="sera-kapasite">🪴 {dolu}/{kapasit}</span>
        <span className="sera-hava-detay-toggle">{havaDetay ? '▴' : 'ℹ️'}</span>
      </div>

      {/* Hava efektleri paneli */}
      {havaDetay && (
        <div className="sera-hava-detay-panel">
          <div className="sera-hava-detay-baslik">Şu anki etki:</div>
          <div className="sera-hava-detay-satir">
            <span>🌱 Büyüme hızı</span>
            <span style={{ color: buyumeRenk(havaBuyume) }}>{carpanYaz(havaBuyume)}</span>
          </div>
          <div className="sera-hava-detay-satir">
            <span>🌿 Mevsim büyüme</span>
            <span style={{ color: buyumeRenk(mevsimBuyume) }}>{carpanYaz(mevsimBuyume)}</span>
          </div>
          <div className="sera-hava-detay-satir">
            <span>💧 Su tüketimi</span>
            <span style={{ color: riskRenk(havaSu) }}>
              {carpanYaz(havaSu)}
              {havaSu > 1 && <span className="sera-hava-detay-ipucu"> daha sık sula</span>}
              {havaSu < 1 && <span className="sera-hava-detay-ipucu"> daha az sula</span>}
            </span>
          </div>
          <div className="sera-hava-detay-satir">
            <span>🦠 Hastalık riski</span>
            <span style={{ color: riskRenk(havaHastalik) }}>{carpanYaz(havaHastalik)}</span>
          </div>
        </div>
      )}

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

      {/* Günün çiçeği */}
      {gunlukCicek && (
        <div className="sera-gunun-cicegi">
          🔥 Günün Çiçeği: {gunlukCicek.emoji} {gunlukCicek.name} — 2× Satış Fiyatı!
        </div>
      )}

      {/* Toplu hasat butonu */}
      {hasatSayisi > 0 && (
        <button className="sera-toplu-hasat" onClick={handleTopluHasat}>
          🌾 Tümünü Hasat Et ({hasatSayisi})
        </button>
      )}

      {/* Hızlı eylemler */}
      <QuickActions />

      {/* Saksı ızgarası */}
      <div
        className="sera-izgara"
        style={{ gridTemplateColumns: `repeat(${saksilar.length <= 9 ? 3 : 4}, 1fr)` }}
      >
        {saksilar.map(saksi => (
          <FlowerPot key={saksi.id} saksi={saksi} />
        ))}
      </div>

      {/* Modal */}
      <PotModal />
    </div>
  );
}
