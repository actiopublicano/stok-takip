// Alt gezinme çubuğu

import { useOyun } from '../../context/GameContext.jsx';

const SEKMELER = [
  { id: 'sera', label: 'Sera', ikon: '🏠' },
  { id: 'dukkan', label: 'Dükkan', ikon: '🛒' },
  { id: 'koleksiyon', label: 'Koleksiyon', ikon: '📚' },
  { id: 'basarimlar', label: 'Başarımlar', ikon: '🏆' },
  { id: 'profil', label: 'Profil', ikon: '👤' },
];

export default function NavBar() {
  const { durum, ekran_degistir } = useOyun();
  const aktif = durum.ui.aktifEkran;

  return (
    <nav className="navbar">
      {SEKMELER.map(sekme => (
        <button
          key={sekme.id}
          className={`nav-btn ${aktif === sekme.id ? 'nav-btn-aktif' : ''}`}
          onClick={() => ekran_degistir(sekme.id)}
        >
          <span className="nav-ikon">{sekme.ikon}</span>
          <span className="nav-label">{sekme.label}</span>
        </button>
      ))}
    </nav>
  );
}
