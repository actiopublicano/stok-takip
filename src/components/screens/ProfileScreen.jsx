// Profil ekranı - istatistikler, günlük görevler, kayıt

import { useOyun } from '../../context/GameContext.jsx';
import { kaydet, sil } from '../../game/core/saveManager.js';

const sureYaz = (ms) => {
  if (!ms) return '0dk';
  const saat = Math.floor(ms / 3600000);
  const dakika = Math.floor((ms % 3600000) / 60000);
  if (saat > 0) return `${saat}s ${dakika}dk`;
  return `${dakika}dk`;
};

export default function ProfileScreen() {
  const { durum, dispatch, manuelKaydet } = useOyun();
  const { oyuncu, istatistikler, gorevler, hava, mevsim } = durum;

  const gunlukGorevler = gorevler.gunluk ?? [];

  const gorevKalanSure = () => {
    const gece = new Date();
    gece.setHours(24, 0, 0, 0);
    const ms = gece.getTime() - Date.now();
    const saat = Math.floor(ms / 3600000);
    const dakika = Math.floor((ms % 3600000) / 60000);
    return saat > 0 ? `${saat}sa ${dakika}dk` : `${dakika}dk`;
  };

  const sifirla = () => {
    if (window.confirm('Tüm oyun verilerini silmek istediğinden emin misin?')) {
      sil();
      window.location.reload();
    }
  };

  return (
    <div className="profil-ekrani">
      {/* Oyuncu Bilgisi */}
      <div className="profil-kart">
        <div className="profil-avatar">🌷</div>
        <div className="profil-bilgi">
          <div className="profil-ad">{oyuncu.ad}</div>
          <div className="profil-seviye">Seviye {oyuncu.seviye}</div>
          <div className="profil-xp">{oyuncu.xp} XP</div>
        </div>
        <div className="profil-para">💰 {oyuncu.para.toLocaleString('tr-TR')}</div>
      </div>

      {/* Günlük Görevler */}
      <div className="profil-bolum">
        <div className="profil-bolum-baslik" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📋 Günlük Görevler</span>
          <span className="gorev-yenileme">⏰ {gorevKalanSure()}'da yenilenir</span>
        </div>
        {gunlukGorevler.map((gorev, i) => (
          <div key={i} className={`gorev-kart ${gorev.tamamlandi ? 'gorev-tamam' : ''}`}>
            <span className="gorev-emoji">{gorev.emoji}</span>
            <div className="gorev-bilgi">
              <div className="gorev-metin">{gorev.metin}</div>
              <div className="gorev-ilerleme-yazi">
                {gorev.mevcut}/{gorev.hedefMiktar}
                {gorev.tamamlandi && ' ✅'}
              </div>
              <div className="gorev-ilerleme-bg">
                <div
                  className="gorev-ilerleme-dolu"
                  style={{ width: `${Math.min(100, (gorev.mevcut / gorev.hedefMiktar) * 100)}%` }}
                />
              </div>
            </div>
            <div className="gorev-odul">+{gorev.odul} 💰</div>
          </div>
        ))}
      </div>

      {/* İstatistikler */}
      <div className="profil-bolum">
        <div className="profil-bolum-baslik">📊 İstatistikler</div>
        <div className="istat-grid">
          <div className="istat-kart">
            <div className="istat-deger">{istatistikler.toplamYetistirme}</div>
            <div className="istat-etiket">Çiçek Yetiştirildi</div>
          </div>
          <div className="istat-kart">
            <div className="istat-deger">{istatistikler.toplamSatis}</div>
            <div className="istat-etiket">Çiçek Satıldı</div>
          </div>
          <div className="istat-kart">
            <div className="istat-deger">{istatistikler.toplamSulama}</div>
            <div className="istat-etiket">Sulama</div>
          </div>
          <div className="istat-kart">
            <div className="istat-deger">{istatistikler.toplamKazanc.toLocaleString('tr-TR')}</div>
            <div className="istat-etiket">Toplam Kazanç 💰</div>
          </div>
          <div className="istat-kart">
            <div className="istat-deger">{istatistikler.toplamGun}</div>
            <div className="istat-etiket">Oynanan Gün</div>
          </div>
          <div className="istat-kart">
            <div className="istat-deger">{istatistikler.toplamGorev}</div>
            <div className="istat-etiket">Görev Tamamlandı</div>
          </div>
          <div className="istat-kart">
            <div className="istat-deger">{istatistikler.toplamIyilestirme}</div>
            <div className="istat-etiket">Hastalık İyileştirildi</div>
          </div>
          <div className="istat-kart">
            <div className="istat-deger">{Object.keys(durum.koleksiyon).length}</div>
            <div className="istat-etiket">Keşfedilen Çiçek</div>
          </div>
        </div>
      </div>

      {/* Hava ve Mevsim Bilgisi */}
      <div className="profil-bolum">
        <div className="profil-bolum-baslik">🌍 Ortam</div>
        <div className="ortam-bilgi">
          <div>Hava: {hava.mevcut}</div>
          <div>Mevsim: {mevsim.mevcut}</div>
          <div>Sera: Seviye {durum.sera.seviye}</div>
        </div>
      </div>

      {/* Kayıt Butonları */}
      <div className="profil-bolum">
        <div className="profil-bolum-baslik">💾 Kayıt</div>
        <div className="kayit-butonlar">
          <button className="kayit-btn kayit-kaydet-btn" onClick={manuelKaydet}>
            💾 Kaydet
          </button>
          <button className="kayit-btn kayit-sifirla-btn" onClick={sifirla}>
            🗑️ Sıfırla
          </button>
        </div>
      </div>

      {/* Sürüm Bilgisi */}
      <div className="profil-surum">
        Çiçek Serası v1.0 • 🌸 Nostaljik Çiçek Oyunu
      </div>
    </div>
  );
}
