// Üst bilgi çubuğu - para, seviye, hava, mevsim

import { useOyun } from '../../context/GameContext.jsx';
import { HAVA_IKONU, MEVSIM_IKONU } from '../../game/systems/weatherSystem.js';
import { SEVIYE_XP } from '../../game/core/constants.js';

export default function HUD() {
  const { durum } = useOyun();
  const { oyuncu, hava, mevsim } = durum;

  const seviyeXP = SEVIYE_XP[oyuncu.seviye] ?? SEVIYE_XP[SEVIYE_XP.length - 1];
  const xpYuzde = Math.min(100, (oyuncu.xp / seviyeXP) * 100);
  const havaIkon = HAVA_IKONU[hava.mevcut] ?? '☀️';
  const mevsimIkon = MEVSIM_IKONU[mevsim.mevcut] ?? '🌸';

  return (
    <div className="hud">
      <div className="hud-row">
        {/* Para */}
        <div className="hud-chip">
          <span className="hud-icon">💰</span>
          <span className="hud-value">{oyuncu.para.toLocaleString('tr-TR')}</span>
        </div>

        {/* Oyun Adı */}
        <div className="hud-title">🌸 Çiçek Serası</div>

        {/* Hava + Mevsim */}
        <div className="hud-chip">
          <span>{havaIkon}</span>
          <span>{mevsimIkon}</span>
        </div>
      </div>

      {/* Seviye ve XP Çubuğu */}
      <div className="hud-xp-row">
        <span className="hud-level">Sv.{oyuncu.seviye}</span>
        <div className="hud-xp-bar-bg">
          <div
            className="hud-xp-bar-fill"
            style={{ width: `${xpYuzde}%` }}
          />
        </div>
        <span className="hud-xp-text">{oyuncu.xp}/{seviyeXP} XP</span>
      </div>
    </div>
  );
}
