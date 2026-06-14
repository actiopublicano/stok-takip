import { useState, useEffect } from 'react'
import Dashboard from './screens/Dashboard'
import Kategoriler from './screens/Kategoriler'
import HaftalikKontrol from './screens/HaftalikKontrol'
import AlisverisListesi from './screens/AlisverisListesi'
import { demoVeriyiYukle } from './data/store'

const TABS = [
  { id: 'dashboard', label: 'Ana Sayfa', icon: '🏠' },
  { id: 'kategoriler', label: 'Ürünler', icon: '📦' },
  { id: 'kontrol', label: 'Kontrol', icon: '✅' },
  { id: 'alisveris', label: 'Alışveriş', icon: '🛒' },
]

export default function App() {
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    demoVeriyiYukle()
  }, [])

  return (
    <div className="flex flex-col min-h-svh bg-slate-50">
      <div className="flex-1 overflow-auto pb-20">
        {tab === 'dashboard' && <Dashboard onTabChange={setTab} />}
        {tab === 'kategoriler' && <Kategoriler />}
        {tab === 'kontrol' && <HaftalikKontrol onDone={() => setTab('dashboard')} />}
        {tab === 'alisveris' && <AlisverisListesi />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-slate-200 flex">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
              tab === t.id ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
