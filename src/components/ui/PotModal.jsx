// Saksı etkileşim modalı

import { useOyun } from '../../context/GameContext.jsx';
import { cicekBul, nadirlikRengi } from '../../game/data/flowers.js';
import { gubreBul, ilacBul, GUBRETLER, ILACLAR, hastalikBul } from '../../game/data/items.js';
import { ASAMA } from '../../game/core/constants.js';
import { satisFiyatiHesapla } from '../../game/systems/growthSystem.js';
import { ses } from '../../game/systems/soundSystem.js';

const sureYaz = (ms) => {
  if (!ms || ms <= 0) return '-';
  const saat = Math.floor(ms / 3600000);
  const dakika = Math.floor((ms % 3600000) / 60000);
  if (saat >= 24) return `${Math.floor(saat / 24)} gün ${saat % 24}s`;
  if (saat > 0) return `${saat}s ${dakika > 0 ? dakika + 'dk' : ''}`;
  if (dakika > 0) return `${dakika} dakika`;
  return '<1 dk';
};

const kalanSure = (ilerleme, buyumeZamani) => {
  if (!buyumeZamani || ilerleme >= 100) return 0;
  return Math.max(0, buyumeZamani * (1 - ilerleme / 100));
};

// Su seviyesi rengi
const suRengi = (s) => {
  if (s >= 60) return '#4fc3f7';
  if (s >= 30) return '#ffb74d';
  return '#ef5350';
};

export default function PotModal() {
  const { durum, dispatch, modal_kapat, tohumu_ek, sula, gubre_uygula, hasat, hastalik_tedavi } = useOyun();
  const { ui, envanter } = durum;

  if (!ui.modalAcik || ui.modalTipi !== 'saksi') return null;

  const saksi = durum.saksilar.find(s => s.id === ui.seciliSaksiId);
  if (!saksi) return null;

  const cicek = saksi.cicekId ? cicekBul(saksi.cicekId) : null;
  const hastalik = saksi.hastalik ? hastalikBul(saksi.hastalik.id) : null;
  const satisF = cicek ? satisFiyatiHesapla(cicek, saksi.kalite, 1.0) : 0;
  const kalan = cicek ? kalanSure(saksi.ilerleme, cicek.buyumeZamani) : 0;

  const tohumlar = Object.entries(envanter.tohumlar)
    .filter(([, sayi]) => sayi > 0)
    .map(([id, sayi]) => ({ id, sayi, cicek: cicekBul(id) }))
    .filter(t => t.cicek);

  const handleSula = () => {
    sula(saksi.id);
    ses.sulama();
    modal_kapat();
  };

  const handleHasat = () => {
    hasat(saksi.id);
    ses.hasat();
    modal_kapat();
  };

  const handleEkim = (cicekId) => {
    tohumu_ek(saksi.id, cicekId);
    ses.ekim();
    modal_kapat();
  };

  const handleGubre = (gubreId) => {
    gubre_uygula(saksi.id, gubreId);
    ses.gubre();
    modal_kapat();
  };

  const handleTedavi = (ilacId) => {
    hastalik_tedavi(saksi.id, ilacId);
    ses.bildirim();
    modal_kapat();
  };

  const handleTemizle = () => {
    dispatch({ tip: 'SAKSI_TEMIZLE', saksiId: saksi.id });
    modal_kapat();
  };

  return (
    <div className="modal-overlay" onClick={modal_kapat}>
      <div className="modal-kart" onClick={e => e.stopPropagation()}>
        {/* Başlık */}
        <div className="modal-baslik">
          <div>
            {cicek ? (
              <span>
                {cicek.emoji} {cicek.name}
                <span
                  className="modal-nadirlik-rozet"
                  style={{ backgroundColor: nadirlikRengi[cicek.nadirlik], marginLeft: 8 }}
                >
                  {cicek.nadirlik}
                </span>
              </span>
            ) : (
              <span>🪴 Boş Saksı</span>
            )}
          </div>
          <button className="modal-kapat-btn" onClick={modal_kapat}>✕</button>
        </div>

        <div className="modal-icerik">

          {/* BOŞ SAKSI */}
          {saksi.asama === ASAMA.BOS && (
            <div>
              <p className="modal-alt-baslik">Hangi tohumu ekmek istersin?</p>
              {tohumlar.length === 0 ? (
                <div className="modal-bos-mesaj">
                  📦 Envanterde tohum yok.<br />
                  <span style={{ color: '#4CAF50' }}>Dükkan</span>'dan tohum satın al!
                </div>
              ) : (
                <div className="modal-tohum-listesi">
                  {tohumlar.map(t => (
                    <button
                      key={t.id}
                      className="modal-tohum-btn"
                      onClick={() => handleEkim(t.id)}
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

              {/* Bilgi ızgarası */}
              <div className="modal-info-grid">
                <div className="modal-info-kart">
                  <span>💧 Su</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ flex: 1, height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${saksi.suSeviyesi}%`, height: '100%', background: suRengi(saksi.suSeviyesi), borderRadius: 3 }} />
                    </div>
                    <span className="modal-info-deger" style={{ fontSize: 12 }}>{saksi.suSeviyesi}%</span>
                  </div>
                </div>
                <div className="modal-info-kart">
                  <span>📈 Büyüme</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ flex: 1, height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round(saksi.ilerleme)}%`, height: '100%', background: '#4CAF50', borderRadius: 3 }} />
                    </div>
                    <span className="modal-info-deger" style={{ fontSize: 12 }}>%{Math.round(saksi.ilerleme)}</span>
                  </div>
                </div>
                <div className="modal-info-kart">
                  <span>⭐ Kalite</span>
                  <span className="modal-info-deger">×{(saksi.kalite ?? 1).toFixed(1)}</span>
                </div>
                <div className="modal-info-kart">
                  <span>⏱ Kalan</span>
                  <span className="modal-info-deger" style={{ fontSize: 12 }}>
                    {saksi.asama === ASAMA.HAZIR ? '✅ Hazır!' : sureYaz(kalan)}
                  </span>
                </div>
              </div>

              {/* Satış tahmini */}
              {cicek && (
                <div className="modal-satis-tahmini">
                  <span>Tahmini satış:</span>
                  <span className="modal-satis-fiyat">💰 {satisF}</span>
                </div>
              )}

              {/* Aktif gübre */}
              {saksi.gubre && (
                <div className="modal-aktif-gubre">
                  ⚡ Gübre aktif: {gubreBul(saksi.gubre.id)?.name}
                </div>
              )}

              {/* Hastalık uyarısı */}
              {hastalik && (
                <div className="modal-hastalik-uyari">
                  <div style={{ fontWeight: 700 }}>{hastalik.emoji} {hastalik.name} Hastalığı</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>{hastalik.aciklama}</div>
                  <div className="modal-alt-baslik" style={{ marginTop: 8 }}>İlaç seç:</div>
                  <div className="modal-ilac-listesi">
                    {ILACLAR.map(ilac => {
                      const stok = envanter.ilaclar[ilac.id] ?? 0;
                      const uygun = ilac.hedef === 'tumu' || ilac.hedef === hastalik.id;
                      return (
                        <button
                          key={ilac.id}
                          className={`modal-ilac-btn ${!uygun || stok === 0 ? 'devre-disi' : ''}`}
                          onClick={() => uygun && stok > 0 && handleTedavi(ilac.id)}
                          disabled={!uygun || stok === 0}
                        >
                          {ilac.emoji} {ilac.name} (×{stok}) {!uygun && '- Uyumsuz'}
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
                  onClick={handleSula}
                >
                  💧 Sula
                  {saksi.suSeviyesi < 30 && <span className="modal-acil">!</span>}
                </button>
              )}

              {/* Gübre butonları */}
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
                          onClick={() => stok > 0 && handleGubre(gubre.id)}
                          disabled={stok === 0}
                          title={gubre.aciklama}
                        >
                          <span>{gubre.emoji}</span>
                          <span className="modal-gubre-ad">{gubre.name}</span>
                          <span style={{ fontSize: 11, color: '#9e9e9e' }}>×{stok}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hasat butonu */}
              {saksi.asama === ASAMA.HAZIR && (
                <button className="modal-eylem-btn modal-hasat-btn" onClick={handleHasat}>
                  ✂️ Hasat Et! +{satisF} 💰
                </button>
              )}
            </div>
          )}

          {/* ÖLÜ SAKSI */}
          {saksi.asama === ASAMA.OLDU && (
            <div className="modal-olu">
              <div style={{ fontSize: 40 }}>💀</div>
              <p>Bu çiçek maalesef öldü. Saksıyı temizle ve yeniden başla.</p>
              <button className="modal-eylem-btn modal-temizle-btn" onClick={handleTemizle}>
                🗑️ Saksıyı Temizle
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
