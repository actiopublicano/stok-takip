// Tekil saksı bileşeni - sera ızgarasında gösterilir

import { useOyun } from '../../context/GameContext.jsx';
import { cicekBul } from '../../game/data/flowers.js';
import { hastalikBul } from '../../game/data/items.js';
import { ASAMA } from '../../game/core/constants.js';

// Aşamaya göre emoji
const ASAMA_EMOJI = {
  [ASAMA.BOS]: '⬜',
  [ASAMA.TOHUM]: '🌱',
  [ASAMA.FILIZ]: '🌿',
  [ASAMA.BUYUYOR]: '🌿',
  [ASAMA.CICEK]: null, // çiçeğin emojisi kullanılacak
  [ASAMA.HAZIR]: null,
  [ASAMA.SOLUYOR]: '🥀',
  [ASAMA.OLDU]: '💀',
};

// Su seviyesi rengi
const suRengi = (seviye) => {
  if (seviye >= 60) return '#4fc3f7';
  if (seviye >= 30) return '#ffb74d';
  if (seviye >= 10) return '#ef5350';
  return '#bdbdbd';
};

// Su seviyesi ikonu
const suIkonu = (seviye) => {
  if (seviye >= 60) return '💧';
  if (seviye >= 30) return '💧';
  if (seviye > 0) return '🏜️';
  return '🏜️';
};

export default function FlowerPot({ saksi }) {
  const { saksi_sec } = useOyun();
  const cicek = saksi.cicekId ? cicekBul(saksi.cicekId) : null;

  const gorunumEmoji = ASAMA_EMOJI[saksi.asama] ?? (cicek?.emoji ?? '🌸');

  const hastalikVar = !!saksi.hastalik;
  const hazir = saksi.asama === ASAMA.HAZIR;
  const olu = saksi.asama === ASAMA.OLDU;
  const bos = saksi.asama === ASAMA.BOS;

  const buyumeYuzde = Math.round(saksi.ilerleme);

  return (
    <div
      className={`saksi-kart ${hazir ? 'saksi-hazir' : ''} ${olu ? 'saksi-olu' : ''} ${hastalikVar ? 'saksi-hasta' : ''}`}
      onClick={() => saksi_sec(saksi.id)}
    >
      {/* Çiçek görseli */}
      <div className="saksi-cicek">
        <span className={`saksi-emoji ${hazir ? 'saksi-emoji-hazir' : ''}`}>
          {gorunumEmoji}
        </span>
        {hastalikVar && (
          <span className="saksi-hastalik-ikon">🦠</span>
        )}
        {hazir && (
          <span className="saksi-hazir-ikon">✨</span>
        )}
      </div>

      {/* Çiçek adı */}
      {cicek && (
        <div className="saksi-cicek-adi">
          {cicek.name}
        </div>
      )}

      {/* Su seviyesi çubuğu */}
      {!bos && !olu && (
        <div className="saksi-su-bar">
          <span style={{ fontSize: '10px' }}>{suIkonu(saksi.suSeviyesi)}</span>
          <div className="saksi-su-bg">
            <div
              className="saksi-su-dolu"
              style={{
                width: `${saksi.suSeviyesi}%`,
                backgroundColor: suRengi(saksi.suSeviyesi),
              }}
            />
          </div>
        </div>
      )}

      {/* Büyüme yüzdesi */}
      {!bos && !olu && (
        <div className="saksi-ilerleme-bar">
          <div
            className="saksi-ilerleme-dolu"
            style={{ width: `${buyumeYuzde}%` }}
          />
        </div>
      )}

      {/* Durum yazısı */}
      <div className="saksi-durum">
        {bos && <span className="saksi-durum-bos">+ Ek</span>}
        {olu && <span className="saksi-durum-olu">💀 Öldü</span>}
        {hazir && <span className="saksi-durum-hazir">Hasat Et!</span>}
        {!bos && !olu && !hazir && (
          <span className="saksi-durum-normal">%{buyumeYuzde}</span>
        )}
      </div>
    </div>
  );
}
