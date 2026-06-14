import { useState, useEffect } from 'react'
import { getUrunler, getKategoriler, getMevcutStok, saveKontrol } from '../data/store'

export default function HaftalikKontrol({ onDone }) {
  const [urunler, setUrunler] = useState([])
  const [kategoriler, setKategoriler] = useState([])
  const [adetler, setAdetler] = useState({})
  const [kaydedildi, setKaydedildi] = useState(false)

  useEffect(() => {
    const u = getUrunler()
    const k = getKategoriler()
    setUrunler(u)
    setKategoriler(k)
    const baslangic = {}
    u.forEach(ur => { baslangic[ur.id] = getMevcutStok(ur.id) ?? 0 })
    setAdetler(baslangic)
  }, [])

  function kaydet() {
    const tarih = new Date().toISOString()
    urunler.forEach(u => {
      const adet = parseInt(adetler[u.id]) || 0
      saveKontrol(u.id, adet, tarih)
    })
    setKaydedildi(true)
    setTimeout(onDone, 1200)
  }

  if (kaydedildi) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <p className="text-lg font-semibold text-slate-800">Kontrol kaydedildi!</p>
        <p className="text-sm text-slate-500 mt-1">Ana sayfaya dönülüyor...</p>
      </div>
    )
  }

  if (urunler.length === 0) {
    return (
      <div className="p-4 text-center py-16">
        <p className="text-slate-400">Henüz ürün eklenmemiş.</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-slate-800">Haftalık Kontrol</h1>
        <span className="text-xs text-slate-500">{new Date().toLocaleDateString('tr-TR')}</span>
      </div>

      <p className="text-sm text-slate-500">Her ürün için mevcut adedi gir.</p>

      {kategoriler.map(k => {
        const kUrunler = urunler.filter(u => u.kategoriId === k.id)
        if (kUrunler.length === 0) return null
        return (
          <div key={k.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{k.ad}</span>
            </div>
            {kUrunler.map(u => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
                <label className="text-sm font-medium text-slate-700 flex-1">{u.ad}</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdetler(a => ({ ...a, [u.id]: Math.max(0, (parseInt(a[u.id]) || 0) - 1) }))}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-lg flex items-center justify-center"
                  >−</button>
                  <input
                    type="number"
                    value={adetler[u.id] ?? 0}
                    onChange={e => setAdetler(a => ({ ...a, [u.id]: e.target.value }))}
                    className="w-14 text-center border border-slate-200 rounded-lg py-1 text-sm font-semibold"
                    min="0"
                  />
                  <button
                    onClick={() => setAdetler(a => ({ ...a, [u.id]: (parseInt(a[u.id]) || 0) + 1 }))}
                    className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-lg flex items-center justify-center"
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        )
      })}

      <button
        onClick={kaydet}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-sm mt-2"
      >
        Kontrolü Kaydet
      </button>
    </div>
  )
}
