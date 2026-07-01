// Yeni oyuncu tutorial ekranı

import { useState } from 'react';

const ADIMLAR = [
  {
    baslik: '🌸 Çiçek Serası\'na Hoş Geldin!',
    icerik: 'Kendi çiçek seranı kur, nadirden efsaneviye 105 farklı çiçek yetiştir ve para kazan!',
    ikon: '🏡',
  },
  {
    baslik: '🌱 Çiçek Yetiştirmek',
    icerik: 'Boş bir saksıya dokun → Tohum seç → Ek. Çiçekler gerçek zamanlı büyür — oyunu kapatsanda büyümeye devam eder!',
    ikon: '🪴',
  },
  {
    baslik: '💧 Sulama',
    icerik: 'Çiçeklerin suya ihtiyacı var! Su barı kırmızıya döndüğünde saksıya dokun ve sula. Az ya da çok sulama zarar verir.',
    ikon: '💧',
  },
  {
    baslik: '✂️ Hasat & Satış',
    icerik: 'Çiçek hazır olduğunda saksı parlar. Dokun ve "Hasat Et" butonuna bas. Para otomatik hesaba geçer.',
    ikon: '💰',
  },
  {
    baslik: '🛒 Dükkan',
    icerik: 'Alt menüden Dükkan\'a git. Tohum, gübre ve ilaç satın al. Yeterli para biriktirince seranı büyüt!',
    ikon: '🛒',
  },
  {
    baslik: '⚡ İpuçları',
    icerik: '• Gübre büyümeyi hızlandırır\n• Hastalık varsa ilaç kullan\n• Günlük görevler ekstra para kazandırır\n• Her gün koleksiyona yeni çiçek ekle!',
    ikon: '💡',
  },
];

export default function TutorialOverlay({ onKapat }) {
  const [adim, setAdim] = useState(0);
  const mevcutAdim = ADIMLAR[adim];
  const sonAdim = adim === ADIMLAR.length - 1;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-kart">
        {/* İkon */}
        <div className="tutorial-ikon">{mevcutAdim.ikon}</div>

        {/* Başlık */}
        <h2 className="tutorial-baslik">{mevcutAdim.baslik}</h2>

        {/* İçerik */}
        <p className="tutorial-icerik">{mevcutAdim.icerik}</p>

        {/* Adım noktaları */}
        <div className="tutorial-noktalar">
          {ADIMLAR.map((_, i) => (
            <div
              key={i}
              className={`tutorial-nokta ${i === adim ? 'aktif' : i < adim ? 'gecmis' : ''}`}
              onClick={() => setAdim(i)}
            />
          ))}
        </div>

        {/* Butonlar */}
        <div className="tutorial-butonlar">
          {adim > 0 && (
            <button className="tutorial-geri-btn" onClick={() => setAdim(a => a - 1)}>
              ← Geri
            </button>
          )}
          {!sonAdim ? (
            <button className="tutorial-ileri-btn" onClick={() => setAdim(a => a + 1)}>
              İleri →
            </button>
          ) : (
            <button className="tutorial-baslat-btn" onClick={onKapat}>
              🌱 Oynamaya Başla!
            </button>
          )}
        </div>

        {/* Atla */}
        {!sonAdim && (
          <button className="tutorial-atla-btn" onClick={onKapat}>
            Atla
          </button>
        )}
      </div>
    </div>
  );
}
