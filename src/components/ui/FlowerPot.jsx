// Tekil saksı bileşeni - sera ızgarasında gösterilir

import { useOyun } from '../../context/GameContext.jsx';
import { cicekBul } from '../../game/data/flowers.js';
import { ASAMA } from '../../game/core/constants.js';
import { ses } from '../../game/systems/soundSystem.js';

// Aşamaya göre emoji
const ASAMA_EMOJI = {
  [ASAMA.BOS]: '⬜',
  [ASAMA.TOHUM]: '🌱',
  [ASAMA.FILIZ]: '🌿',
  [ASAMA.BUYUYOR]: '🌿',
  [ASAMA.CICEK]: null,
  [ASAMA.HAZIR]: null,
  [ASAMA.SOLUYOR]: '🥀',
  [ASAMA.OLDU]: '💀',
};

// Su seviyesi rengi
const suRengi = (s) => {
  if (s >= 60) return '#4fc3f7';
  if (s >= 30) return '#ffb74d';
  if (s >= 10) return '#ef5350';
  return '#bdbdbd';
};

// Kalan süreyi okunabilir metne dönüştür
const kalanMetin = (ilerleme, buyumeZamani) => {
  if (!buyumeZamani || ilerleme >= 100) return null;
  const kalanMs = buyumeZamani * (1 - ilerleme / 100);
  if (kalanMs <= 0) return null;
  const saat = Math.floor(kalanMs / 3600000);
  const dakika = Math.floor((kalanMs % 3600000) / 60000);
  if (saat >= 24) {
    const gun = Math.floor(saat / 24);
    return `${gun}g ${saat % 24}s`;
  }
  if (saat > 0) return `${saat}s ${dakika}dk`;
  if (dakika > 0) return `${dakika}dk`;
  return '<1dk';
};

export default function FlowerPot({ saksi }) {
  const { saksi_sec } = useOyun();
  const cicek = saksi.cicekId ? cicekBul(saksi.cicekId) : null;

  const gorunumEmoji = ASAMA_EMOJI[saksi.asama] ?? (cicek?.emoji ?? '🌸');

  const hazir = saksi.asama === ASAMA.HAZIR;
  const olu = saksi.asama === ASAMA.OLDU;
  const bos = saksi.asama === ASAMA.BOS;
  const soluyor = saksi.asama === ASAMA.SOLUYOR;
  const hastalik = !!saksi.hastalik;

  const kalan = cicek ? kalanMetin(saksi.ilerleme, cicek.buyumeZamani) : null;

  const tikla = () => {
    if (!bos) ses.bildirim();
    saksi_sec(saksi.id);
  };

  return (
    <div
      className={[
        'saksi-kart',
        hazir ? 'saksi-hazir' : '',
        olu ? 'saksi-olu' : '',
        hastalik ? 'saksi-hasta' : '',
        soluyor ? 'saksi-soluyor' : '',
        bos ? 'saksi-bos' : '',
      ].filter(Boolean).join(' ')}
      onClick={tikla}
    >
      {/* Çiçek görseli */}
      <div className="saksi-cicek">
        <span className={`saksi-emoji ${hazir ? 'saksi-emoji-hazir' : soluyor ? 'saksi-emoji-soluyor' : ''}`}>
          {gorunumEmoji}
        </span>
        {hastalik && <span className="saksi-hastalik-ikon">🦠</span>}
        {hazir && <span className="saksi-hazir-ikon">✨</span>}
        {soluyor && <span className="saksi-soluyor-ikon">💦</span>}
      </div>

      {/* Çiçek adı */}
      {cicek && (
        <div className="saksi-cicek-adi">{cicek.name}</div>
      )}

      {/* Su barı */}
      {!bos && !olu && (
        <div className="saksi-su-bar">
          <span style={{ fontSize: '9px' }}>💧</span>
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

      {/* Büyüme barı */}
      {!bos && !olu && (
        <div className="saksi-ilerleme-bar">
          <div
            className="saksi-ilerleme-dolu"
            style={{ width: `${Math.round(saksi.ilerleme)}%` }}
          />
        </div>
      )}

      {/* Durum / kalan süre */}
      <div className="saksi-durum">
        {bos && <span className="saksi-durum-bos">+ Ek</span>}
        {olu && <span className="saksi-durum-olu">💀 Öldü</span>}
        {hazir && <span className="saksi-durum-hazir">Hasat!</span>}
        {soluyor && <span className="saksi-durum-susuyor">Su gerek!</span>}
        {!bos && !olu && !hazir && !soluyor && kalan && (
          <span className="saksi-durum-normal">⏱ {kalan}</span>
        )}
        {!bos && !olu && !hazir && !soluyor && !kalan && (
          <span className="saksi-durum-normal">%{Math.round(saksi.ilerleme)}</span>
        )}
      </div>
    </div>
  );
}
