// Hızlı eylem butonları - sera ekranı üst kısmında

import { useOyun } from '../../context/GameContext.jsx';
import { ASAMA } from '../../game/core/constants.js';
import { ses } from '../../game/systems/soundSystem.js';

export default function QuickActions() {
  const { durum, dispatch } = useOyun();
  const { saksilar } = durum;

  // Sulamaya ihtiyaç duyan saksı sayısı
  const sulamaSayisi = saksilar.filter(
    s => s.asama !== ASAMA.BOS && s.asama !== ASAMA.OLDU && s.suSeviyesi < 50
  ).length;

  // Hasat bekleyen sayı
  const hasatSayisi = saksilar.filter(s => s.asama === ASAMA.HAZIR).length;

  // Hasta saksı sayısı
  const hastaSayisi = saksilar.filter(s => s.hastalik).length;

  const hepsiSula = () => {
    dispatch({ tip: 'TUMU_SULA' });
    ses.sulama();
  };

  const hepsiHasat = () => {
    // Hazır tüm saksıları hasat et
    const hazirlar = saksilar.filter(s => s.asama === ASAMA.HAZIR);
    hazirlar.forEach(s => dispatch({ tip: 'HASAT', saksiId: s.id }));
    if (hazirlar.length > 0) ses.hasat();
  };

  if (sulamaSayisi === 0 && hasatSayisi === 0 && hastaSayisi === 0) return null;

  return (
    <div className="hizli-eylemler">
      {sulamaSayisi > 0 && (
        <button className="hizli-btn hizli-sula-btn" onClick={hepsiSula}>
          💧 Hepsini Sula ({sulamaSayisi})
        </button>
      )}
      {hasatSayisi > 0 && (
        <button className="hizli-btn hizli-hasat-btn" onClick={hepsiHasat}>
          ✂️ Hepsini Hasat Et ({hasatSayisi})
        </button>
      )}
      {hastaSayisi > 0 && (
        <button className="hizli-btn hizli-hasta-btn" onClick={() =>
          dispatch({ tip: 'EKRAN_DEGISTIR', ekran: 'dukkan' })
        }>
          🦠 {hastaSayisi} Hasta
        </button>
      )}
    </div>
  );
}
