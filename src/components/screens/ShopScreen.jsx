// Dükkan ekranı

import { useState } from 'react';
import { useOyun } from '../../context/GameContext.jsx';
import { CICEKLER, nadirlikRengi } from '../../game/data/flowers.js';
import { GUBRETLER, ILACLAR, SERA_YUKSELTMELERI, EKSTRA_YUKSELTMELER } from '../../game/data/items.js';

const SEKMELER = [
  { id: 'tohumlar', label: '🌱 Tohumlar' },
  { id: 'gubreler', label: '⚡ Gübreler' },
  { id: 'ilaclar', label: '💊 İlaçlar' },
  { id: 'sera', label: '🏠 Sera' },
];

const sureYaz = (ms) => {
  const saat = Math.floor(ms / 3600000);
  const dakika = Math.floor((ms % 3600000) / 60000);
  if (saat >= 24) return `${Math.floor(saat / 24)}g ${saat % 24}s`;
  if (saat > 0) return `${saat}s ${dakika > 0 ? dakika + 'dk' : ''}`;
  return `${dakika}dk`;
};

export default function ShopScreen() {
  const { durum, esya_satin_al, sera_yukselt, ozellik_satin_al } = useOyun();
  const [aktifSekme, setAktifSekme] = useState('tohumlar');
  const { oyuncu, sera, envanter } = durum;

  // Seviyeye göre erişilebilir tohumları filtrele
  const erisimTohumlar = CICEKLER.filter(c => c.kilidAcLevel <= oyuncu.seviye);

  const mevsimuyumlu = (cicek) => {
    const simdi = durum.mevsim.mevcut;
    return cicek.mevsimler.includes(simdi) || cicek.mevsimler.includes('tümü');
  };

  return (
    <div className="dukkan-ekrani">
      <div className="dukkan-baslik">
        <span>🛒 Dükkan</span>
        <span className="dukkan-para">💰 {oyuncu.para.toLocaleString('tr-TR')}</span>
      </div>

      {/* Sekme Menüsü */}
      <div className="dukkan-sekmeler">
        {SEKMELER.map(s => (
          <button
            key={s.id}
            className={`dukkan-sekme-btn ${aktifSekme === s.id ? 'aktif' : ''}`}
            onClick={() => setAktifSekme(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="dukkan-icerik">

        {/* TOHUMLAR */}
        {aktifSekme === 'tohumlar' && (
          <div className="dukkan-liste">
            {erisimTohumlar.map(cicek => {
              const stok = envanter.tohumlar[cicek.id] ?? 0;
              const mevsimUygun = mevsimuyumlu(cicek);
              return (
                <div key={cicek.id} className={`dukkan-urun-kart ${!mevsimUygun ? 'dukkan-urun-mevsim-dis' : ''}`}>
                  <div className="dukkan-urun-sol">
                    <span className="dukkan-urun-emoji">{cicek.emoji}</span>
                    <div className="dukkan-urun-bilgi">
                      <div className="dukkan-urun-ad">
                        {cicek.name}
                        <span
                          className="dukkan-nadirlik"
                          style={{ backgroundColor: nadirlikRengi[cicek.nadirlik] }}
                        >
                          {cicek.nadirlik}
                        </span>
                      </div>
                      <div className="dukkan-urun-detay">
                        ⏱{sureYaz(cicek.buyumeZamani)} • 💰satış:{cicek.satisFiyati}
                        {!mevsimUygun && <span className="dukkan-mevsim-uyari"> ❄️ Mevsim dışı</span>}
                      </div>
                      <div className="dukkan-stok">Stok: ×{stok}</div>
                    </div>
                  </div>
                  <button
                    className={`dukkan-satin-al-btn ${oyuncu.para < cicek.tohumFiyati ? 'devre-disi' : ''}`}
                    onClick={() => esya_satin_al('tohum', cicek.id, cicek.tohumFiyati, 1)}
                    disabled={oyuncu.para < cicek.tohumFiyati}
                  >
                    {cicek.tohumFiyati} 💰
                  </button>
                </div>
              );
            })}
            {CICEKLER.filter(c => c.kilidAcLevel > oyuncu.seviye).length > 0 && (
              <div className="dukkan-kilitli-bilgi">
                🔒 {CICEKLER.filter(c => c.kilidAcLevel > oyuncu.seviye).length} çiçek daha yüksek seviyede açılır
              </div>
            )}
          </div>
        )}

        {/* GÜBRELER */}
        {aktifSekme === 'gubreler' && (
          <div className="dukkan-liste">
            {GUBRETLER.map(gubre => {
              const stok = envanter.gubreler[gubre.id] ?? 0;
              return (
                <div key={gubre.id} className="dukkan-urun-kart">
                  <div className="dukkan-urun-sol">
                    <span className="dukkan-urun-emoji">{gubre.emoji}</span>
                    <div className="dukkan-urun-bilgi">
                      <div className="dukkan-urun-ad">{gubre.name}</div>
                      <div className="dukkan-urun-detay">{gubre.aciklama}</div>
                      <div className="dukkan-stok">Stok: ×{stok}</div>
                    </div>
                  </div>
                  <button
                    className={`dukkan-satin-al-btn ${oyuncu.para < gubre.fiyat ? 'devre-disi' : ''}`}
                    onClick={() => esya_satin_al('gubre', gubre.id, gubre.fiyat, 1)}
                    disabled={oyuncu.para < gubre.fiyat}
                  >
                    {gubre.fiyat} 💰
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* İLAÇLAR */}
        {aktifSekme === 'ilaclar' && (
          <div className="dukkan-liste">
            {ILACLAR.map(ilac => {
              const stok = envanter.ilaclar[ilac.id] ?? 0;
              return (
                <div key={ilac.id} className="dukkan-urun-kart">
                  <div className="dukkan-urun-sol">
                    <span className="dukkan-urun-emoji">{ilac.emoji}</span>
                    <div className="dukkan-urun-bilgi">
                      <div className="dukkan-urun-ad">{ilac.name}</div>
                      <div className="dukkan-urun-detay">{ilac.aciklama}</div>
                      <div className="dukkan-stok">Stok: ×{stok}</div>
                    </div>
                  </div>
                  <button
                    className={`dukkan-satin-al-btn ${oyuncu.para < ilac.fiyat ? 'devre-disi' : ''}`}
                    onClick={() => esya_satin_al('ilac', ilac.id, ilac.fiyat, 1)}
                    disabled={oyuncu.para < ilac.fiyat}
                  >
                    {ilac.fiyat} 💰
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* SERA */}
        {aktifSekme === 'sera' && (
          <div className="dukkan-liste">
            <p className="dukkan-sera-baslik">Sera Yükseltmeleri</p>
            {SERA_YUKSELTMELERI.map(s => {
              const aktif = s.level <= sera.seviye;
              const sonraki = s.level === sera.seviye + 1;
              return (
                <div key={s.id} className={`dukkan-urun-kart ${aktif ? 'dukkan-aktif' : ''}`}>
                  <div className="dukkan-urun-sol">
                    <span className="dukkan-urun-emoji">{s.emoji}</span>
                    <div className="dukkan-urun-bilgi">
                      <div className="dukkan-urun-ad">
                        {s.ad}
                        {aktif && <span className="dukkan-aktif-rozet">✅ Aktif</span>}
                      </div>
                      <div className="dukkan-urun-detay">{s.aciklama}</div>
                      <div className="dukkan-stok">🪴 {s.slotSayisi} saksı</div>
                    </div>
                  </div>
                  {!aktif && (
                    <button
                      className={`dukkan-satin-al-btn ${!sonraki || oyuncu.para < s.fiyat ? 'devre-disi' : 'dukkan-yukselt-btn'}`}
                      onClick={() => sera_yukselt(s.id)}
                      disabled={!sonraki || oyuncu.para < s.fiyat}
                    >
                      {sonraki ? `${s.fiyat} 💰` : '🔒 Kilitle'}
                    </button>
                  )}
                </div>
              );
            })}

            <p className="dukkan-sera-baslik">Ekstra Yükseltmeler</p>
            {EKSTRA_YUKSELTMELER.map(e => {
              const aktif = sera.ozellikler?.[e.id];
              const yeterliSera = sera.seviye >= e.gerekliSeraLevel;
              return (
                <div key={e.id} className={`dukkan-urun-kart ${aktif ? 'dukkan-aktif' : ''}`}>
                  <div className="dukkan-urun-sol">
                    <span className="dukkan-urun-emoji">{e.emoji}</span>
                    <div className="dukkan-urun-bilgi">
                      <div className="dukkan-urun-ad">
                        {e.ad}
                        {aktif && <span className="dukkan-aktif-rozet">✅</span>}
                      </div>
                      <div className="dukkan-urun-detay">{e.aciklama}</div>
                      {!yeterliSera && (
                        <div className="dukkan-stok">Gerekli: Sera Sv.{e.gerekliSeraLevel}</div>
                      )}
                    </div>
                  </div>
                  {!aktif && (
                    <button
                      className={`dukkan-satin-al-btn ${!yeterliSera || oyuncu.para < e.fiyat ? 'devre-disi' : ''}`}
                      onClick={() => ozellik_satin_al(e.id, e.fiyat)}
                      disabled={!yeterliSera || oyuncu.para < e.fiyat}
                    >
                      {e.fiyat} 💰
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
