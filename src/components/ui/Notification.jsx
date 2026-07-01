// Toast bildirimleri

import { useEffect } from 'react';
import { useOyun } from '../../context/GameContext.jsx';

const BILDIRIM_RENK = {
  bilgi: 'bildirim-bilgi',
  basari: 'bildirim-basari',
  hata: 'bildirim-hata',
  olay: 'bildirim-olay',
  basarim: 'bildirim-basarim',
  seviye: 'bildirim-seviye',
};

function Bildirim({ bildirim }) {
  const { bildirim_kaldir } = useOyun();
  const renk = BILDIRIM_RENK[bildirim.tip] ?? 'bildirim-bilgi';

  useEffect(() => {
    const zaman = bildirim.tip === 'basarim' || bildirim.tip === 'seviye' ? 4000 : 3000;
    const timer = setTimeout(() => bildirim_kaldir(bildirim.id), zaman);
    return () => clearTimeout(timer);
  }, [bildirim.id, bildirim.tip, bildirim_kaldir]);

  return (
    <div
      className={`bildirim ${renk}`}
      onClick={() => bildirim_kaldir(bildirim.id)}
    >
      {bildirim.mesaj}
    </div>
  );
}

export default function Bildirimler() {
  const { durum } = useOyun();
  const { bildirimler } = durum;

  if (!bildirimler.length) return null;

  return (
    <div className="bildirim-konteyner">
      {bildirimler.slice(-4).map(b => (
        <Bildirim key={b.id} bildirim={b} />
      ))}
    </div>
  );
}
