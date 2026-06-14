import { useState, useEffect } from 'react'
import {
  getKategoriler, addKategori, updateKategori, deleteKategori,
  getUrunler, addUrun, updateUrun, deleteUrun,
  getMevcutStok, getEsik, manuelEsikGuncelle, getOrtalamaTuketim
} from '../data/store'

export default function Kategoriler() {
  const [kategoriler, setKategoriler] = useState([])
  const [urunler, setUrunler] = useState([])
  const [acikKategori, setAcikKategori] = useState(null)
  const [modal, setModal] = useState(null) // {tip: 'kategori'|'urun', data?, urunKategoriId?}
  const [formAd, setFormAd] = useState('')
  const [formEsik, setFormEsik] = useState('')
  const [detayUrun, setDetayUrun] = useState(null)

  function yukle() {
    setKategoriler(getKategoriler())
    setUrunler(getUrunler())
  }

  useEffect(() => { yukle() }, [])

  function modalAc(tip, data = null, urunKategoriId = null) {
    setModal({ tip, data, urunKategoriId })
    setFormAd(data?.ad || '')
    setFormEsik(data ? (data.manuelEsik ?? '') : '')
  }

  function kaydet() {
    if (!formAd.trim()) return
    if (modal.tip === 'kategori') {
      if (modal.data) updateKategori(modal.data.id, formAd.trim())
      else addKategori(formAd.trim())
    } else {
      if (modal.data) {
        updateUrun(modal.data.id, { ad: formAd.trim() })
      } else {
        addUrun({ kategoriId: modal.urunKategoriId, ad: formAd.trim() })
      }
    }
    setModal(null)
    yukle()
  }

  function sil(tip, id) {
    if (!confirm(`Silmek istediğine emin misin?`)) return
    if (tip === 'kategori') deleteKategori(id)
    else deleteUrun(id)
    setModal(null)
    setDetayUrun(null)
    yukle()
  }

  if (detayUrun) {
    const urun = urunler.find(u => u.id === detayUrun)
    if (!urun) { setDetayUrun(null); return null }
    const mevcut = getMevcutStok(urun.id)
    const esik = getEsik(urun)
    const ort = getOrtalamaTuketim(urun.id)

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setDetayUrun(null)} className="text-blue-600 text-sm">← Geri</button>
          <h1 className="text-lg font-bold text-slate-800 flex-1">{urun.ad}</h1>
          <button onClick={() => sil('urun', urun.id)} className="text-red-500 text-sm">Sil</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
            <div className="text-2xl font-bold text-slate-800">{mevcut ?? '—'}</div>
            <div className="text-xs text-slate-500 mt-1">Mevcut Stok</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
            <div className={`text-2xl font-bold ${esik !== null && mevcut !== null && mevcut < esik ? 'text-red-500' : 'text-green-500'}`}>
              {esik ?? '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">Eşik</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 space-y-2">
          <p className="text-sm text-slate-600">Haftalık ort. tüketim: <strong>{ort.toFixed(1)} adet</strong></p>
          <p className="text-xs text-slate-400">
            {urun.manuelEsik !== null ? 'Eşik: Manuel' : urun.otomatikEsik ? 'Eşik: Otomatik' : 'Eşik: Henüz belirlenmedi (4 kontrol gerekli)'}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm font-medium text-slate-700 mb-2">Manuel Eşik Belirle</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Eşik adedi"
              defaultValue={urun.manuelEsik ?? ''}
              id="manuelEsikInput"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              min="0"
            />
            <button
              onClick={() => {
                const val = parseInt(document.getElementById('manuelEsikInput').value)
                if (!isNaN(val)) { manuelEsikGuncelle(urun.id, val); yukle(); setDetayUrun(null) }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Kaydet
            </button>
          </div>
          {urun.manuelEsik !== null && (
            <button
              onClick={() => { manuelEsikGuncelle(urun.id, null); yukle(); setDetayUrun(null) }}
              className="mt-2 text-xs text-slate-400 underline"
            >
              Manuel eşiği kaldır (otomatiğe geç)
            </button>
          )}
        </div>

        <button
          onClick={() => modalAc('urun', urun)}
          className="w-full border border-slate-200 rounded-xl py-3 text-sm text-slate-600"
        >
          ✏️ Adı Düzenle
        </button>

        {modal && (
          <Modal
            baslik="Ürün Adını Düzenle"
            formAd={formAd}
            setFormAd={setFormAd}
            onKaydet={kaydet}
            onKapat={() => setModal(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-slate-800">Ürünler</h1>
        <button
          onClick={() => modalAc('kategori')}
          className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg"
        >
          + Kategori
        </button>
      </div>

      {kategoriler.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">Henüz kategori yok.</p>
      )}

      {kategoriler.map(k => {
        const kUrunler = urunler.filter(u => u.kategoriId === k.id)
        const acik = acikKategori === k.id
        return (
          <div key={k.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              onClick={() => setAcikKategori(acik ? null : k.id)}
            >
              <span className="font-medium text-slate-800">{k.ad}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{kUrunler.length} ürün</span>
                <span className="text-slate-400">{acik ? '▲' : '▼'}</span>
              </div>
            </div>

            {acik && (
              <div className="border-t border-slate-100">
                {kUrunler.map(u => {
                  const mevcut = getMevcutStok(u.id)
                  const esik = getEsik(u)
                  const kritik = esik !== null && mevcut !== null && mevcut < esik
                  return (
                    <div
                      key={u.id}
                      onClick={() => setDetayUrun(u.id)}
                      className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700">{u.ad}</p>
                        <p className="text-xs text-slate-400">
                          {mevcut !== null ? `${mevcut} adet` : 'Stok girilmedi'}
                          {esik !== null ? ` / Eşik: ${esik}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {kritik && <span className="text-red-400 text-sm">⚠️</span>}
                        <span className="text-slate-300">›</span>
                      </div>
                    </div>
                  )
                })}
                <div className="flex border-t border-slate-100">
                  <button
                    onClick={() => modalAc('urun', null, k.id)}
                    className="flex-1 py-2.5 text-sm text-blue-600 font-medium"
                  >
                    + Ürün Ekle
                  </button>
                  <button
                    onClick={() => modalAc('kategori', k)}
                    className="px-4 py-2.5 text-sm text-slate-500"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => sil('kategori', k.id)}
                    className="px-4 py-2.5 text-sm text-red-400"
                  >
                    🗑
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {modal && (
        <Modal
          baslik={modal.tip === 'kategori' ? (modal.data ? 'Kategori Düzenle' : 'Yeni Kategori') : (modal.data ? 'Ürün Düzenle' : 'Yeni Ürün')}
          formAd={formAd}
          setFormAd={setFormAd}
          onKaydet={kaydet}
          onKapat={() => setModal(null)}
        />
      )}
    </div>
  )
}

function Modal({ baslik, formAd, setFormAd, onKaydet, onKapat }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 max-w-[480px] mx-auto">
      <div className="bg-white w-full rounded-t-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">{baslik}</h2>
          <button onClick={onKapat} className="text-slate-400 text-lg">✕</button>
        </div>
        <input
          autoFocus
          type="text"
          value={formAd}
          onChange={e => setFormAd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onKaydet()}
          placeholder="Ad gir..."
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm"
        />
        <button
          onClick={onKaydet}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm"
        >
          Kaydet
        </button>
      </div>
    </div>
  )
}
