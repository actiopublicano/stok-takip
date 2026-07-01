// Dükkan ekranı - toplu satın alma + sıralama

import { useState } from 'react';
import { useOyun } from '../../context/GameContext.jsx';
import { CICEKLER, nadirlikRengi } from '../../game/data/flowers.js';
import { GUBRETLER, ILACLAR, SERA_YUKSELTMELERI, EKSTRA_YUKSELTMELER } from '../../game/data/items.js';
import { ses } from '../../game/systems/soundSystem.js';

const SEKMELER = [
  { id: 'tohumlar',  label: '🌱 Tohumlar' },
  { id: 'gubreler',  label: '⚡ Gübreler' },
  { id: 'ilaclar',   label: '💊 İlaçlar' },
  { id: 'sera',      label: '🏠 Sera' },
];

const SIRALAMA = [
  { id: 'uygun',  label: '💰 Uygun' },
  { id: 'nadir',  label: '⭐ Nadir' },
  { id: 'hizli',  label: '⏱ Hızlı' },
];

const NADIRLIK_SIRALAMA = { yaygın: 0, nadir: 1, egzotik: 2, efsanevi: 3 };

const sureYaz = (ms) => {
  const saat = Math.floor(ms / 3600000);
  const dakika = Math.floor((ms % 3600000) / 60000);
  if (saat >= 24) return `${Math.floor(saat / 24)}g ${saat % 24}s`;
  if (saat > 0) return `${saat}s ${dakika > 0 ? dakika + 'dk' : ''}`;
  return `${dakika}dk`;
};

const MIKTARLAR = [1, 5, 10];

export default function ShopScreen() {
  const { durum, esya_satin_al, sera_yukselt, ozellik_satin_al } = useOyun();
  const [aktifSekme, setAktifSekme] = useState('tohumlar');
  const [siralama, setSiralama] = useState('uygun');
  const [miktar, setMiktar] = useState(1);
  const { oyuncu, sera, envanter, ui, pazar } = durum;

  const indirimCarpani = ui.indirimAktif ? ui.indirimCarpani : 1.0;
  const indirimAktif = ui.indirimAktif;
  const gunlukCicekId = pazar?.gunlukCicek ?? null;

  const erisimTohumlar = CICEKLER.filter(c => c.kilidAcLevel <= oyuncu.seviye);

  const siraliTohumlar = [...erisimTohumlar].sort((a, b) => {
    if (siralama === 'uygun') return (a.tohumFiyati * miktar) - (b.tohumFiyati * miktar);
    if (siralama === 'nadir') return (NADIRLIK_SIRALAMA[b.nadirlik] ?? 0) - (NADIRLIK_SIRALAMA[a.nadirlik] ?? 0);
    if (siralama === 'hizli') return a.buyumeZamani - b.buyumeZamani;
    return 0;
  });

  const mevsimUyumlu = (cicek) => {
    const simdi = durum.mevsim.mevcut;
    return cicek.mevsimler.includes(simdi) || cicek.mevsimler.includes('tümü');
  };

  const handleSatinAl = (kategori, id, birimFiyat) => {
    const toplamFiyat = Math.round(birimFiyat * miktar * indirimCarpani);
    esya_satin_al(kategori, id, birimFiyat, miktar);
    ses.satin();
  };

  return (
    <div className="dukkan-ekrani">
      <div className="dukkan-baslik">
        <span>🛒 Dükkan</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {indirimAktif && <span className="dukkan-indirim-rozet">🏷️ -%30</span>}
          <span className="dukkan-para">💰 {oyuncu.para.toLocaleString('tr-TR')}</span>
        </div>
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

      {/* Tohumlar: miktar seçici + sıralama */}
      {aktifSekme === 'tohumlar' && (
        <div className="dukkan-ararac-bar">
          {/* Miktar seçici */}
          <div className="dukkan-miktar-sec">
            {MIKTARLAR.map(m => (
              <button
                key={m}
                className={`dukkan-miktar-btn ${miktar === m ? 'aktif' : ''}`}
                onClick={() => setMiktar(m)}
              >
                ×{m}
              </button>
            ))}
          </div>
          {/* Sıralama */}
          <div className="dukkan-siralama-sec">
            {SIRALAMA.map(s => (
              <button
                key={s.id}
                className={`dukkan-siralama-btn ${siralama === s.id ? 'aktif' : ''}`}
                onClick={() => setSiralama(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gübre/İlaç: miktar seçici */}
      {(aktifSekme === 'gubreler' || aktifSekme === 'ilaclar') && (
        <div className="dukkan-ararac-bar">
          <div className="dukkan-miktar-sec">
            {MIKTARLAR.map(m => (
              <button
                key={m}
                className={`dukkan-miktar-btn ${miktar === m ? 'aktif' : ''}`}
                onClick={() => setMiktar(m)}
              >
                ×{m}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="dukkan-icerik">

        {/* TOHUMLAR */}
        {aktifSekme === 'tohumlar' && (
          <div className="dukkan-liste">
            {gunlukCicekId && (
              <div className="dukkan-gunun-cicegi-banner">
                🔥 Günün Çiçeği: {CICEKLER.find(c => c.id === gunlukCicekId)?.emoji} {CICEKLER.find(c => c.id === gunlukCicekId)?.name} — 2× Satış Fiyatı!
              </div>
            )}
            {siraliTohumlar.map(cicek => {
              const stok = envanter.tohumlar[cicek.id] ?? 0;
              const uygun = mevsimUyumlu(cicek);
              const toplamFiyat = Math.round(cicek.tohumFiyati * miktar * indirimCarpani);
              const yetersizPara = oyuncu.para < toplamFiyat;
              const pazarSecili = cicek.id === gunlukCicekId;
              return (
                <div key={cicek.id} className={`dukkan-urun-kart ${!uygun ? 'dukkan-urun-mevsim-dis' : ''} ${pazarSecili ? 'dukkan-urun-pazar' : ''}`}>
                  <div className="dukkan-urun-sol">
                    <span className="dukkan-urun-emoji">{cicek.emoji}</span>
                    <div className="dukkan-urun-bilgi">
                      <div className="dukkan-urun-ad">
                        {cicek.name}
                        {pazarSecili && <span className="dukkan-pazar-rozet">🔥 2×</span>}
                        <span
                          className="dukkan-nadirlik"
                          style={{ backgroundColor: nadirlikRengi[cicek.nadirlik] }}
                        >
                          {cicek.nadirlik}
                        </span>
                      </div>
                      <div className="dukkan-urun-detay">
                        ⏱{sureYaz(cicek.buyumeZamani)} • 💰satış:{pazarSecili ? cicek.satisFiyati * 2 : cicek.satisFiyati}
                        {!uygun && <span className="dukkan-mevsim-uyari"> ❄️ Mevsim dışı</span>}
                      </div>
                      <div className="dukkan-stok">
                        Stokta: ×{stok}
                        {indirimAktif && (
                          <span className="dukkan-indirimli-fiyat"> • birim: {cicek.tohumFiyati}→{Math.round(cicek.tohumFiyati * indirimCarpani)}💰</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`dukkan-satin-al-btn ${yetersizPara ? 'devre-disi' : ''}`}
                    onClick={() => !yetersizPara && handleSatinAl('tohum', cicek.id, cicek.tohumFiyati)}
                    disabled={yetersizPara}
                  >
                    {toplamFiyat} 💰
                    {miktar > 1 && <span style={{ fontSize: 10, display: 'block', opacity: 0.8 }}>×{miktar}</span>}
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
              const toplamFiyat = Math.round(gubre.fiyat * miktar * indirimCarpani);
              return (
                <div key={gubre.id} className="dukkan-urun-kart">
                  <div className="dukkan-urun-sol">
                    <span className="dukkan-urun-emoji">{gubre.emoji}</span>
                    <div className="dukkan-urun-bilgi">
                      <div className="dukkan-urun-ad">{gubre.name}</div>
                      <div className="dukkan-urun-detay">{gubre.aciklama}</div>
                      <div className="dukkan-stok">Stokta: ×{stok}</div>
                    </div>
                  </div>
                  <button
                    className={`dukkan-satin-al-btn ${oyuncu.para < toplamFiyat ? 'devre-disi' : ''}`}
                    onClick={() => oyuncu.para >= toplamFiyat && handleSatinAl('gubre', gubre.id, gubre.fiyat)}
                    disabled={oyuncu.para < toplamFiyat}
                  >
                    {toplamFiyat} 💰
                    {miktar > 1 && <span style={{ fontSize: 10, display: 'block', opacity: 0.8 }}>×{miktar}</span>}
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
              const toplamFiyat = Math.round(ilac.fiyat * miktar * indirimCarpani);
              return (
                <div key={ilac.id} className="dukkan-urun-kart">
                  <div className="dukkan-urun-sol">
                    <span className="dukkan-urun-emoji">{ilac.emoji}</span>
                    <div className="dukkan-urun-bilgi">
                      <div className="dukkan-urun-ad">{ilac.name}</div>
                      <div className="dukkan-urun-detay">{ilac.aciklama}</div>
                      <div className="dukkan-stok">Stokta: ×{stok}</div>
                    </div>
                  </div>
                  <button
                    className={`dukkan-satin-al-btn ${oyuncu.para < toplamFiyat ? 'devre-disi' : ''}`}
                    onClick={() => oyuncu.para >= toplamFiyat && handleSatinAl('ilac', ilac.id, ilac.fiyat)}
                    disabled={oyuncu.para < toplamFiyat}
                  >
                    {toplamFiyat} 💰
                    {miktar > 1 && <span style={{ fontSize: 10, display: 'block', opacity: 0.8 }}>×{miktar}</span>}
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
                      onClick={() => sonraki && oyuncu.para >= s.fiyat && sera_yukselt(s.id)}
                      disabled={!sonraki || oyuncu.para < s.fiyat}
                    >
                      {sonraki ? `${s.fiyat} 💰` : '🔒'}
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
                      onClick={() => yeterliSera && oyuncu.para >= e.fiyat && ozellik_satin_al(e.id, e.fiyat)}
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
