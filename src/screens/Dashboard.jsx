import { useState, useEffect } from 'react'
import {
  getUrunler, getKategoriler, getAlisverisListesi,
  getMevcutStok, getEsik, getKontroller,
  esikOnerisiKabul, esikOnerisiReddet
} from '../data/store'

export default function Dashboard({ onTabChange }) {
  const [data, setData] = useState({ urunler: [], kategoriler: [], alisveris: [], oneriler: [] })

  function yukle() {
    const urunler = getUrunler()
    const kategoriler = getKategoriler()
    const alisveris = getAlisverisListesi()
    const oneriler = urunler.filter(u => u.esikOnerisi !== null && u.esikOnerisi !== undefined)
    setData({ urunler, kategoriler, alisveris, oneriler })
  }

  useEffect(() => { yukle() }, [])

  const sonKontrol = getKontroller()
    .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))[0]

  const kritikUrunler = data.urunler.filter(u => {
    const esik = getEsik(u)
    const mevcut = getMevcutStok(u.id)
    return esik !== null && mevcut !== null && mevcut < esik
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-slate-800">Stok Takip</h1>
        <span className="text-xs text-slate-500">
          {sonKontrol ? `Son kontrol: ${new Date(sonKontrol.tarih).toLocaleDateString('tr-TR')}` : 'Henüz kontrol yok'}
        </span>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-slate-800">{data.urunler.length}</div>
          <div className="text-xs text-slate-500 mt-1">Ürün</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-slate-100">
          <div className={`text-2xl font-bold ${kritikUrunler.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {kritikUrunler.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Kritik</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-blue-600">{data.alisveris.length}</div>
          <div className="text-xs text-slate-500 mt-1">Alınacak</div>
        </div>
      </div>

      {/* Eşik önerileri */}
      {data.oneriler.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-600">Eşik Önerileri</h2>
          {data.oneriler.map(u => (
            <div key={u.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-sm font-medium text-amber-800">
                {u.ad} — eşiği <strong>{u.esikOnerisi} adet</strong> olarak güncelleyeyim mi?
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { esikOnerisiKabul(u.id); yukle() }}
                  className="flex-1 bg-amber-500 text-white text-sm py-1.5 rounded-lg font-medium"
                >
                  Kabul Et
                </button>
                <button
                  onClick={() => { esikOnerisiReddet(u.id); yukle() }}
                  className="flex-1 bg-white text-amber-700 text-sm py-1.5 rounded-lg border border-amber-300"
                >
                  Reddet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kritik stoklar */}
      {kritikUrunler.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-600">Kritik Stok</h2>
          {kritikUrunler.map(u => {
            const mevcut = getMevcutStok(u.id)
            const esik = getEsik(u)
            return (
              <div key={u.id} className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">{u.ad}</p>
                  <p className="text-xs text-red-500">Mevcut: {mevcut} / Eşik: {esik}</p>
                </div>
                <span className="text-2xl">⚠️</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Hızlı erişim butonları */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => onTabChange('kontrol')}
          className="bg-blue-600 text-white rounded-xl p-4 text-left shadow-sm"
        >
          <div className="text-2xl mb-1">✅</div>
          <div className="text-sm font-semibold">Haftalık Kontrol</div>
          <div className="text-xs opacity-80 mt-0.5">Stokları güncelle</div>
        </button>
        <button
          onClick={() => onTabChange('alisveris')}
          className="bg-green-600 text-white rounded-xl p-4 text-left shadow-sm"
        >
          <div className="text-2xl mb-1">🛒</div>
          <div className="text-sm font-semibold">Alışveriş Listesi</div>
          <div className="text-xs opacity-80 mt-0.5">{data.alisveris.length} ürün bekliyor</div>
        </button>
      </div>
    </div>
  )
}
