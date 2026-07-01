// Saksı etkileşim modalı

import { useOyun } from '../../context/GameContext.jsx';
import { cicekBul, nadirlikRengi } from '../../game/data/flowers.js';
import { gubreBul, ilacBul, GUBRETLER, ILACLAR, hastalikBul } from '../../game/data/items.js';
import { ASAMA } from '../../game/core/constants.js';
import { satisFiyatiHesapla } from '../../game/systems/growthSystem.js';

// Süreyi okunabilir formata çevir
const sureYaz = (ms) => {
  if (!ms) return '-';
  const saat = Math.floor(ms / 3600000);
  const dakika = Math.floor((ms % 3600000) / 60000);
  if (saat > 0) return `${saat}s ${dakika}dk`;
  return `${dakika} dakika`;
};

// Kalan süreyi hesapla
const kalanSure = (ekildiZaman, buyumeZamani, ilerleme) => {
  if (!ekildiZaman || !buyumeZamani || ilerleme >= 100) return 0;
  const kalan = buyumeZamani * (1 - ilerleme / 100);
  return Math.max(0, kalan);
};

export default function PotModal() {
  const { durum, modal_kapat, tohumu_ek, sula, gubre_uygula, hasat, hastalik_tedavi } = useOyun();
  const { ui, envanter } = durum;

  if (!ui.modalAcik || ui.modalTipi !== 'saksi') return null;

  const saksi = durum.saksilar.find(s => s.id === ui.seciliSaksiId);
  if (!saksi) return null;

  const cicek = saksi.cicekId ? cicekBul(saksi.cicekId) : null;
  const hastalik = saksi.hastalik ? hastalikBul(saksi.hastalik.id) : null;

  const satisF = cicek ? satisFiyatiHesapla(cicek, saksi.kalite, durum.ui.indirimAktif ? durum.ui.indirimCarpani : 1.0) : 0;
  const kalan = cicek ? kalanSure(saksi.ekildiZaman, cicek.buyumeZamani, saksi.ilerleme) : 0;

  // Tohum listesi (boş saksı için)
  const tohumlar = Object.entries(envanter.tohumlar)
    .filter(([, sayi]) => sayi > 0)
    .map(([id, sayi]) => ({ id, sayi, cicek: cicekBul(id) }))
    .filter(t => t.cicek);

  return (
    <div className="modal-overlay" onClick={modal_kapat}>
      <div className="modal-kart" onClick={e => e.stopPropagation()}>
        {/* Başlık */}
        <div className="modal-baslik">
          <span>{cicek ? `${cicek.emoji} ${cicek.name}` : '🪴 Saksı'}</span>
          <button className="modal-kapat-btn" onClick={modal_kapat}>✕</button>
        </div>

        <div className="modal-icerik">

          {/* BOŞ SAKSI */}
          {saksi.asama === ASAMA.BOS && (
            <div>
              <p className="modal-alt-baslik">Hangi tohumu ekmek istersin?</p>
              {tohumlar.length === 0 ? (
                <div className="modal-bos-mesaj">
                  Envanterde tohum yok. Dükkandan satın al!
                </div>
              ) : (
                <div className="modal-tohum-listesi">
                  {tohumlar.map(t => (
                    <button
                      key={t.id}
                      className="modal-tohum-btn"
                      onClick={() => { tohumu_ek(saksi.id, t.id); modal_kapat(); }}
                    >
                      <span className="modal-tohum-emoji">{t.cicek.emoji}</span>
                      <div className="modal-tohum-bilgi">
                        <span className="modal-tohum-ad">{t.cicek.name}</span>
                        <span className="modal-tohum-detail">
                          ×{t.sayi} • ⏱{sureYaz(t.cicek.buyumeZamani)} • 💰{t.cicek.satisFiyati}
                        </span>
                      </div>
                      <span
                        className="modal-nadirlik-rozet"
                        style={{ backgroundColor: nadirlikRengi[t.cicek.nadirlik] }}
                      >
                        {t.cicek.nadirlik}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AKTİF SAKSI */}
          {saksi.asama !== ASAMA.BOS && saksi.asama !== ASAMA.OLDU && (
            <div className="modal-aktif">
              {/* Bilgi Kartları */}
              <div className="modal-info-grid">
                <div className="modal-info-kart">
                  <span>💧 Su</span>
                  <span className="modal-info-deger">{saksi.suSeviyesi}%</span>
                </div>
                <div className="modal-info-kart">
                  <span>📈 Büyüme</span>
                  <span className="modal-info-deger">%{Math.round(saksi.ilerleme)}</span>
                </div>
                <div className="modal-info-kart">
                  <span>⭐ Kalite</span>
                  <span className="modal-info-deger">×{saksi.kalite?.toFixed(1)}</span>
                </div>
                <div className="modal-info-kart">
                  <span>⏱ Kalan</span>
                  <span className="modal-info-deger">{sureYaz(kalan)}</span>
                </div>
              </div>

              {/* Hastalık uyarısı */}
              {hastalik && (
                <div className="modal-hastalik-uyari">
                  <span>{hastalik.emoji} {hastalik.name}</span>
                  <span>{hastalik.aciklama}</span>
                  <div className="modal-ilac-listesi">
                    {ILACLAR.map(ilac => {
                      const stok = envanter.ilaclar[ilac.id] ?? 0;
                      const uygun = ilac.hedef === 'tumu' || ilac.hedef === hastalik.id;
                      return (
                        <button
                          key={ilac.id}
                          className={`modal-ilac-btn ${!uygun || stok === 0 ? 'devre-disi' : ''}`}
                          onClick={() => { hastalik_tedavi(saksi.id, ilac.id); modal_kapat(); }}
                          disabled={!uygun || stok === 0}
                        >
                          {ilac.emoji} {ilac.name} (×{stok})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sulama butonu */}
              {saksi.asama !== ASAMA.HAZIR && (
                <button
                  className="modal-eylem-btn modal-su-btn"
                  onClick={() => { sula(saksi.id); modal_kapat(); }}
                >
                  💧 Sula
                  {saksi.suSeviyesi < 30 && <span className="modal-acil">!</span>}
                </button>
              )}

              {/* Gübre listesi */}
              {saksi.asama !== ASAMA.HAZIR && (
                <div>
                  <p className="modal-alt-baslik">Gübre Kullan</p>
                  <div className="modal-gubre-listesi">
                    {GUBRETLER.map(gubre => {
                      const stok = envanter.gubreler[gubre.id] ?? 0;
                      return (
                        <button
                          key={gubre.id}
                          className={`modal-gubre-btn ${stok === 0 ? 'devre-disi' : ''}`}
                          onClick={() => { gubre_uygula(saksi.id, gubre.id); modal_kapat(); }}
                          disabled={stok === 0}
                        >
                          <span>{gubre.emoji}</span>
                          <span className="modal-gubre-ad">{gubre.name}</span>
                          <span>×{stok}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hasat butonu */}
              {saksi.asama === ASAMA.HAZIR && (
                <button
                  className="modal-eylem-btn modal-hasat-btn"
                  onClick={() => { hasat(saksi.id); modal_kapat(); }}
                >
                  ✂️ Hasat Et! +{satisF} 💰
                </button>
              )}
            </div>
          )}

          {/* ÖLÜ SAKSI */}
          {saksi.asama === ASAMA.OLDU && (
            <div className="modal-olu">
              <p>💀 Bu çiçek öldü. Saksıyı temizlemek için dokunun.</p>
              <button
                className="modal-eylem-btn modal-temizle-btn"
                onClick={() => {
                  // Ölü saksıyı temizle
                  window.dispatchEvent(new CustomEvent('temizle-saksi', { detail: { id: saksi.id } }));
                  modal_kapat();
                }}
              >
                🗑️ Temizle
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
