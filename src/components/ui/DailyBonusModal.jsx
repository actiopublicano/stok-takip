// Günlük giriş bonusu modalı

import { useOyun } from '../../context/GameContext.jsx';
import { ses } from '../../game/systems/soundSystem.js';

const STREAK_RENK = (streak) => {
  if (streak >= 30) return '#9c27b0';
  if (streak >= 14) return '#e65100';
  if (streak >= 7)  return '#f57f17';
  if (streak >= 3)  return '#388e3c';
  return '#1976d2';
};

const yildizSayisi = (streak) => {
  if (streak >= 30) return 5;
  if (streak >= 14) return 4;
  if (streak >= 7)  return 3;
  if (streak >= 3)  return 2;
  return 1;
};

export default function DailyBonusModal() {
  const { durum, dispatch } = useOyun();
  const bilgi = durum.ui.gunlukBonusBilgisi;

  if (!bilgi) return null;

  const kapat = () => {
    ses.basarim();
    dispatch({ tip: 'BONUS_KAPAT' });
  };

  const renk = STREAK_RENK(bilgi.streak);
  const yildizlar = '⭐'.repeat(yildizSayisi(bilgi.streak));

  return (
    <div className="bonus-overlay" onClick={kapat}>
      <div className="bonus-kart" onClick={e => e.stopPropagation()}>
        {/* Seri sayacı */}
        <div className="bonus-seri" style={{ backgroundColor: renk }}>
          🔥 {bilgi.streak}. Gün Serisi!
        </div>

        {/* Yıldızlar */}
        <div className="bonus-yildizlar">{yildizlar}</div>

        {/* Mesaj */}
        <h2 className="bonus-baslik">{bilgi.mesaj}</h2>

        {/* Ödüller */}
        <div className="bonus-odul-kap">
          <div className="bonus-odul-kart">
            <span className="bonus-odul-ikon">💰</span>
            <span className="bonus-odul-deger">+{bilgi.para}</span>
            <span className="bonus-odul-etiket">Bozuk Para</span>
          </div>
          {bilgi.tohumAdi && (
            <div className="bonus-odul-kart">
              <span className="bonus-odul-ikon">{bilgi.tohumEmoji}</span>
              <span className="bonus-odul-deger">×1</span>
              <span className="bonus-odul-etiket">{bilgi.tohumAdi} Tohumu</span>
            </div>
          )}
        </div>

        {/* Seri bozulma uyarısı */}
        <p className="bonus-uyari">
          💡 Seriyi koru — yarın da gel!
        </p>

        <button className="bonus-btn" onClick={kapat} style={{ backgroundColor: renk }}>
          Harika! 🌸
        </button>
      </div>
    </div>
  );
}
