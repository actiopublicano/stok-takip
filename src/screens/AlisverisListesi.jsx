import { useState, useEffect } from 'react'
import { getAlisverisListesi, getKategoriler, exportData, importData } from '../data/store'

export default function AlisverisListesi() {
  const [liste, setListe] = useState([])
  const [kategoriler, setKategoriler] = useState([])
  const [tamamlandi, setTamamlandi] = useState(new Set())

  useEffect(() => {
    setListe(getAlisverisListesi())
    setKategoriler(getKategoriler())
  }, [])

  function toggle(urunId) {
    setTamamlandi(prev => {
      const next = new Set(prev)
      next.has(urunId) ? next.delete(urunId) : next.add(urunId)
      return next
    })
  }

  function exportYap() {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stok-yedek-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importYap() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = e => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = ev => {
        try {
          importData(ev.target.result)
          alert('Veri yüklendi! Sayfa yenilenecek.')
          window.location.reload()
        } catch {
          alert('Dosya hatalı.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const bekleyenler = liste.filter(i => !tamamlandi.has(i.urun.id))
  const bitenler = liste.filter(i => tamamlandi.has(i.urun.id))

  const kategoriGrup = (items) => {
    const grups = {}
    items.forEach(item => {
      const kId = item.urun.kategoriId
      if (!grups[kId]) grups[kId] = []
      grups[kId].push(item)
    })
    return grups
  }

  const KategoriListesi = ({ items }) => {
    const grups = kategoriGrup(items)
    return Object.entries(grups).map(([kId, kItems]) => {
      const kat = kategoriler.find(k => k.id === kId)
      return (
        <div key={kId} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{kat?.ad}</span>
          </div>
          {kItems.map(item => (
            <div
              key={item.urun.id}
              onClick={() => toggle(item.urun.id)}
              className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 cursor-pointer"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                tamamlandi.has(item.urun.id) ? 'bg-green-500 border-green-500' : 'border-slate-300'
              }`}>
                {tamamlandi.has(item.urun.id) && <span className="text-white text-xs">✓</span>}
              </div>
              <div className={`flex-1 ${tamamlandi.has(item.urun.id) ? 'line-through text-slate-400' : ''}`}>
                <p className="text-sm font-medium text-slate-700">{item.urun.ad}</p>
                <p className="text-xs text-slate-400">
                  {item.alAdet} adet al (mevcut: {item.mevcut}, eşik: {item.esik})
                </p>
              </div>
              <span className={`text-sm font-bold ${tamamlandi.has(item.urun.id) ? 'text-green-500' : 'text-blue-600'}`}>
                {item.alAdet} adet
              </span>
            </div>
          ))}
        </div>
      )
    })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-slate-800">Alışveriş Listesi</h1>
        <span className="text-xs text-slate-500">
          {tamamlandi.size}/{liste.length} tamamlandı
        </span>
      </div>

      {liste.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-slate-600 font-medium">Her şey tamam!</p>
          <p className="text-sm text-slate-400 mt-1">Tüm stoklar yeterli.</p>
        </div>
      ) : (
        <>
          {bekleyenler.length > 0 && (
            <div className="space-y-2">
              <KategoriListesi items={bekleyenler} />
            </div>
          )}

          {bitenler.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tamamlandı</h2>
              <KategoriListesi items={bitenler} />
            </div>
          )}
        </>
      )}

      <div className="border-t border-slate-200 pt-4 space-y-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Veri Yedek</h2>
        <div className="flex gap-2">
          <button onClick={exportYap} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600">
            📤 Dışa Aktar
          </button>
          <button onClick={importYap} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600">
            📥 İçe Aktar
          </button>
        </div>
      </div>
    </div>
  )
}
