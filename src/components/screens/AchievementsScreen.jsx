// Başarımlar ekranı

import { useOyun } from '../../context/GameContext.jsx';
import { BASARIMLAR } from '../../game/data/achievements.js';

const KATEGORI_IKON = {
  başlangıç: '🌱',
  yetiştirme: '🌸',
  sulama: '💧',
  ekonomi: '💰',
  koleksiyon: '📚',
  sera: '🏠',
  bakım: '💚',
  özel: '✨',
  günlük: '📋',
  süre: '📅',
};

export default function AchievementsScreen() {
  const { durum } = useOyun();
  const { basarimlar, istatistikler, koleksiyon } = durum;

  const acikSayisi = Object.keys(basarimlar).length;
  const toplamSayi = BASARIMLAR.length;

  // Kategoriye göre grupla
  const kategoriler = {};
  for (const b of BASARIMLAR) {
    if (!kategoriler[b.kategori]) kategoriler[b.kategori] = [];
    kategoriler[b.kategori].push(b);
  }

  return (
    <div className="basarim-ekrani">
      <div className="basarim-baslik">
        <span>🏆 Başarımlar</span>
        <span className="basarim-sayac">{acikSayisi}/{toplamSayi}</span>
      </div>

      {/* İlerleme */}
      <div className="basarim-ilerleme-bg">
        <div
          className="basarim-ilerleme-dolu"
          style={{ width: `${(acikSayisi / toplamSayi) * 100}%` }}
        />
      </div>
      <div className="basarim-yuzde">{Math.round((acikSayisi / toplamSayi) * 100)}% tamamlandı</div>

      {/* Kategoriler */}
      {Object.entries(kategoriler).map(([kat, liste]) => (
        <div key={kat} className="basarim-kategori">
          <div className="basarim-kat-baslik">
            {KATEGORI_IKON[kat] ?? '🎯'} {kat.charAt(0).toUpperCase() + kat.slice(1)}
          </div>
          <div className="basarim-liste">
            {liste.map(b => {
              const acik = !!basarimlar[b.id];
              const ilerleme = acik ? 100 : 0; // TODO: gerçek ilerleme
              return (
                <div
                  key={b.id}
                  className={`basarim-kart ${acik ? 'basarim-acik' : 'basarim-kilitli'}`}
                >
                  <span className="basarim-emoji">{acik ? b.emoji : '🔒'}</span>
                  <div className="basarim-bilgi">
                    <div className="basarim-ad">{acik ? b.ad : '???'}</div>
                    <div className="basarim-aciklama">
                      {acik ? b.aciklama : 'Henüz açılmadı'}
                    </div>
                    {acik && (
                      <div className="basarim-odul">+{b.odul} 💰</div>
                    )}
                  </div>
                  {acik && (
                    <span className="basarim-tik">✅</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
