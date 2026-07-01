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

const sureYaz = (ms) => {
  const saat = Math.floor(ms / 3600000);
  const dakika = Math.floor((ms % 3600000) / 60000);
  if (saat >= 24) return `${Math.floor(saat / 24)} gün`;
  if (saat > 0) return `${saat}s ${dakika > 0 ? dakika + 'dk' : ''}`;
  return `${dakika}dk`;
};

const tarihYaz = (ts) => {
  if (!ts) return '-';
  return new Date(ts).toLocaleDateString('tr-TR');
};

export default function CollectionScreen() {
  const { durum } = useOyun();
  const [filtre, setFiltre] = useState('tumu');
  const [secili, setSecili] = useState(null);
  const { koleksiyon } = durum;

  const filtrelenmis = CICEKLER.filter(c =>
    filtre === 'tumu' || c.nadirlik === filtre
  );

  const kesfedilen = filtrelenmis.filter(c => koleksiyon[c.id]);
  const kilitli = filtrelenmis.filter(c => !koleksiyon[c.id]);
  const toplamKesif = Object.keys(koleksiyon).length;

  const seciliVeri = secili ? koleksiyon[secili.id] : null;

  return (
    <div className="koleksiyon-ekrani">
      <div className="koleksiyon-baslik">
        <span>📚 Koleksiyon</span>
        <span className="koleksiyon-sayac">{toplamKesif}/{CICEKLER.length}</span>
      </div>

      <div className="koleksiyon-ilerleme-bg">
        <div
          className="koleksiyon-ilerleme-dolu"
          style={{ width: `${(toplamKesif / CICEKLER.length) * 100}%` }}
        />
      </div>

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
                <div
                  key={cicek.id}
                  className="koleksiyon-kart koleksiyon-kart-acik"
                  onClick={() => setSecili(cicek)}
                >
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
                      <span>⭐{veri.enIyiKalite?.toFixed(1)}</span>
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
                    <span style={{ color: nadirlikRengi[cicek.nadirlik], fontSize: '10px' }}>
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
        <div className="koleksiyon-bos">Bu kategoride çiçek bulunamadı.</div>
      )}

      {/* Çiçek Detay Modalı */}
      {secili && seciliVeri && (
        <div className="modal-overlay" onClick={() => setSecili(null)}>
          <div className="modal-kart kol-detay-modal" onClick={e => e.stopPropagation()}>
            <div
              className="modal-baslik"
              style={{ background: `linear-gradient(135deg, ${nadirlikRengi[secili.nadirlik]}cc, ${nadirlikRengi[secili.nadirlik]})` }}
            >
              <div>
                <span style={{ marginRight: 8, fontSize: 20 }}>{secili.emoji}</span>
                {secili.name}
                <span
                  className="modal-nadirlik-rozet"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)', marginLeft: 8 }}
                >
                  {secili.nadirlik}
                </span>
              </div>
              <button className="modal-kapat-btn" onClick={() => setSecili(null)}>✕</button>
            </div>

            <div className="modal-icerik kol-detay-icerik">
              {/* Büyük emoji */}
              <div style={{ textAlign: 'center', fontSize: 64, lineHeight: 1, margin: '8px 0' }}>
                {secili.emoji}
              </div>

              {/* Açıklama */}
              <p className="kol-detay-aciklama">{secili.aciklama}</p>

              {/* İstatistik ızgarası */}
              <div className="modal-info-grid">
                <div className="modal-info-kart">
                  <span>🌱 Hasat Sayısı</span>
                  <span className="modal-info-deger">×{seciliVeri.sayi}</span>
                </div>
                <div className="modal-info-kart">
                  <span>⭐ En İyi Kalite</span>
                  <span className="modal-info-deger">×{(seciliVeri.enIyiKalite ?? 1).toFixed(2)}</span>
                </div>
                <div className="modal-info-kart">
                  <span>⏱ Büyüme Süresi</span>
                  <span className="modal-info-deger" style={{ fontSize: 13 }}>{sureYaz(secili.buyumeZamani)}</span>
                </div>
                <div className="modal-info-kart">
                  <span>💰 Taban Fiyatı</span>
                  <span className="modal-info-deger">{secili.satisFiyati}</span>
                </div>
                <div className="modal-info-kart">
                  <span>💧 Sulama Aralığı</span>
                  <span className="modal-info-deger" style={{ fontSize: 13 }}>{sureYaz(secili.sulamaAraligi)}</span>
                </div>
                <div className="modal-info-kart">
                  <span>📅 İlk Keşif</span>
                  <span className="modal-info-deger" style={{ fontSize: 12 }}>{tarihYaz(seciliVeri.ilkZaman)}</span>
                </div>
              </div>

              {/* Mevsimler */}
              <div className="kol-detay-mevsimler">
                <span className="modal-alt-baslik">En iyi mevsim:</span>
                <div className="kol-detay-mevsim-liste">
                  {(secili.mevsimler.includes('tümü') ? ['ilkbahar','yaz','sonbahar','kış'] : secili.mevsimler).map(m => (
                    <span key={m} className="kol-detay-mevsim-chip">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
