// Koleksiyon ekranı - tüm keşfedilen çiçekler

import { useState } from 'react';
import { useOyun } from '../../context/GameContext.jsx';
import { CICEKLER, nadirlikRengi, NADIRLIK } from '../../game/data/flowers.js';

const FILTRE_SEKMELER = [
  { id: 'tumu', label: '🌸 Tümü' },
  { id: 'yaygın', label: '🌿 Yaygın' },
  { id: 'nadir', label: '⭐ Nadir' },
  { id: 'egzotik', label: '🌺 Egzotik' },
  { id: 'efsanevi', label: '✨ Efsanevi' },
];

export default function CollectionScreen() {
  const { durum } = useOyun();
  const [filtre, setFiltre] = useState('tumu');
  const { koleksiyon } = durum;

  const filtrelenmis = CICEKLER.filter(c => {
    if (filtre !== 'tumu' && c.nadirlik !== filtre) return false;
    return true;
  });

  const kesfedilen = filtrelenmis.filter(c => koleksiyon[c.id]);
  const kilitli = filtrelenmis.filter(c => !koleksiyon[c.id]);

  const toplamKesif = Object.keys(koleksiyon).length;

  return (
    <div className="koleksiyon-ekrani">
      <div className="koleksiyon-baslik">
        <span>📚 Koleksiyon</span>
        <span className="koleksiyon-sayac">{toplamKesif}/{CICEKLER.length}</span>
      </div>

      {/* İlerleme çubuğu */}
      <div className="koleksiyon-ilerleme-bg">
        <div
          className="koleksiyon-ilerleme-dolu"
          style={{ width: `${(toplamKesif / CICEKLER.length) * 100}%` }}
        />
      </div>

      {/* Filtre sekmeler */}
      <div className="koleksiyon-filtreler">
        {FILTRE_SEKMELER.map(s => (
          <button
            key={s.id}
            className={`koleksiyon-filtre-btn ${filtre === s.id ? 'aktif' : ''}`}
            onClick={() => setFiltre(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Keşfedilen Çiçekler */}
      {kesfedilen.length > 0 && (
        <div>
          <p className="koleksiyon-alt-baslik">✅ Keşfedilen ({kesfedilen.length})</p>
          <div className="koleksiyon-izgara">
            {kesfedilen.map(cicek => {
              const veri = koleksiyon[cicek.id];
              return (
                <div key={cicek.id} className="koleksiyon-kart koleksiyon-kart-acik">
                  <div
                    className="koleksiyon-kart-ust"
                    style={{ backgroundColor: nadirlikRengi[cicek.nadirlik] + '22' }}
                  >
                    <span className="koleksiyon-emoji">{cicek.emoji}</span>
                    <span
                      className="koleksiyon-nadirlik-dot"
                      style={{ backgroundColor: nadirlikRengi[cicek.nadirlik] }}
                    />
                  </div>
                  <div className="koleksiyon-kart-alt">
                    <div className="koleksiyon-cicek-adi">{cicek.name}</div>
                    <div className="koleksiyon-detay">
                      <span>×{veri.sayi}</span>
                      <span>⭐×{veri.enIyiKalite?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Keşfedilmeyenler */}
      {kilitli.length > 0 && (
        <div>
          <p className="koleksiyon-alt-baslik">🔒 Keşfedilmemiş ({kilitli.length})</p>
          <div className="koleksiyon-izgara">
            {kilitli.map(cicek => (
              <div key={cicek.id} className="koleksiyon-kart koleksiyon-kart-kilitli">
                <div className="koleksiyon-kart-ust koleksiyon-kart-kilitli-ust">
                  <span className="koleksiyon-emoji-kilitli">❓</span>
                </div>
                <div className="koleksiyon-kart-alt">
                  <div className="koleksiyon-cicek-adi koleksiyon-kilitli-ad">
                    <span
                      style={{ color: nadirlikRengi[cicek.nadirlik], fontSize: '10px' }}
                    >
                      {cicek.nadirlik}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtrelenmis.length === 0 && (
        <div className="koleksiyon-bos">
          Bu kategoride çiçek bulunamadı.
        </div>
      )}
    </div>
  );
}
