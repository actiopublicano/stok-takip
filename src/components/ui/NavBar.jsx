// Alt gezinme çubuğu - rozetli

import { useOyun } from '../../context/GameContext.jsx';
import { ASAMA } from '../../game/core/constants.js';

export default function NavBar() {
  const { durum, ekran_degistir } = useOyun();
  const aktif = durum.ui.aktifEkran;
  const { saksilar, gorevler, basarimlar } = durum;

  // Sera: hasat veya hasta sayısı
  const hasatSayisi = saksilar.filter(s => s.asama === ASAMA.HAZIR).length;
  const hastaSayisi = saksilar.filter(s => s.hastalik).length;
  const seraBadge = hasatSayisi + hastaSayisi;

  // Profil: tamamlanan ama bildirim gösterilmemiş görevler
  const tamamlananGorev = (gorevler.gunluk ?? []).filter(
    g => g.tamamlandi && !g.odulVerildi
  ).length;

  const rozetler = {
    sera: seraBadge,
    profil: tamamlananGorev,
  };

  const SEKMELER = [
    { id: 'sera',      label: 'Sera',      ikon: '🏠' },
    { id: 'dukkan',    label: 'Dükkan',    ikon: '🛒' },
    { id: 'koleksiyon',label: 'Koleksiyon',ikon: '📚' },
    { id: 'basarimlar',label: 'Başarımlar',ikon: '🏆' },
    { id: 'profil',    label: 'Profil',    ikon: '👤' },
  ];

  return (
    <nav className="navbar">
      {SEKMELER.map(sekme => {
        const rozet = rozetler[sekme.id] ?? 0;
        return (
          <button
            key={sekme.id}
            className={`nav-btn ${aktif === sekme.id ? 'nav-btn-aktif' : ''}`}
            onClick={() => ekran_degistir(sekme.id)}
          >
            <span className="nav-ikon-kap">
              <span className="nav-ikon">{sekme.ikon}</span>
              {rozet > 0 && (
                <span className="nav-rozet">{rozet > 9 ? '9+' : rozet}</span>
              )}
            </span>
            <span className="nav-label">{sekme.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
