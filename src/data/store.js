const KEYS = {
  kategoriler: 'stok_kategoriler',
  urunler: 'stok_urunler',
  kontroller: 'stok_kontroller',
  tuketimler: 'stok_tuketimler',
}

function get(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch {
    return []
  }
}

function set(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// Kategoriler
export function getKategoriler() { return get(KEYS.kategoriler) }
export function addKategori(ad) {
  const list = getKategoriler()
  const item = { id: uid(), ad }
  list.push(item)
  set(KEYS.kategoriler, list)
  return item
}
export function updateKategori(id, ad) {
  const list = getKategoriler().map(k => k.id === id ? { ...k, ad } : k)
  set(KEYS.kategoriler, list)
}
export function deleteKategori(id) {
  set(KEYS.kategoriler, getKategoriler().filter(k => k.id !== id))
  set(KEYS.urunler, getUrunler().filter(u => u.kategoriId !== id))
}

// Ürünler
export function getUrunler() { return get(KEYS.urunler) }
export function addUrun(data) {
  const list = getUrunler()
  const item = { id: uid(), ...data, manuelEsik: null }
  list.push(item)
  set(KEYS.urunler, list)
  return item
}
export function updateUrun(id, data) {
  const list = getUrunler().map(u => u.id === id ? { ...u, ...data } : u)
  set(KEYS.urunler, list)
}
export function deleteUrun(id) {
  set(KEYS.urunler, getUrunler().filter(u => u.id !== id))
}

// Stok kontrolleri
export function getKontroller() { return get(KEYS.kontroller) }
export function saveKontrol(urunId, adet, tarih) {
  const list = getKontroller()
  const item = { id: uid(), urunId, adet, tarih }
  list.push(item)
  set(KEYS.kontroller, list)
  hesaplaTuketim(urunId, tarih, adet)
  return item
}

// Tüketimler
export function getTuketimler() { return get(KEYS.tuketimler) }
function hesaplaTuketim(urunId, tarih, yeniAdet) {
  const kontroller = getKontroller()
    .filter(k => k.urunId === urunId)
    .sort((a, b) => new Date(a.tarih) - new Date(b.tarih))

  if (kontroller.length < 2) return

  const onceki = kontroller[kontroller.length - 2]
  const tuketilen = onceki.adet - yeniAdet
  if (tuketilen <= 0) return

  const list = getTuketimler()
  list.push({ id: uid(), urunId, tarih, tuketilen })
  set(KEYS.tuketimler, list)

  otomatikEsikGuncelle(urunId)
}

// Ortalama tüketim hesapla (son 8 kontrol)
export function getOrtalamaTuketim(urunId) {
  const tuketimler = getTuketimler()
    .filter(t => t.urunId === urunId)
    .slice(-8)
  if (tuketimler.length === 0) return 0
  const toplam = tuketimler.reduce((s, t) => s + t.tuketilen, 0)
  return toplam / tuketimler.length
}

function otomatikEsikGuncelle(urunId) {
  const tuketimler = getTuketimler().filter(t => t.urunId === urunId)
  if (tuketimler.length < 4) return // 4 veri yok, henüz öneri yapma

  const ort = getOrtalamaTuketim(urunId)
  const urun = getUrunler().find(u => u.id === urunId)
  if (!urun || urun.manuelEsik !== null) return // manuel varsa dokunma

  // Eşik = 2 haftanın tüketimi
  const yeniEsik = Math.ceil(ort * 2)
  updateUrun(urunId, { otomatikEsik: yeniEsik, esikOnerisi: yeniEsik })
}

export function manuelEsikGuncelle(urunId, esik) {
  updateUrun(urunId, { manuelEsik: esik })
}

export function esikOnerisiKabul(urunId) {
  const urun = getUrunler().find(u => u.id === urunId)
  if (urun?.esikOnerisi) {
    updateUrun(urunId, { otomatikEsik: urun.esikOnerisi, esikOnerisi: null })
  }
}

export function esikOnerisiReddet(urunId) {
  updateUrun(urunId, { esikOnerisi: null })
}

// Aktif eşik değeri
export function getEsik(urun) {
  return urun.manuelEsik ?? urun.otomatikEsik ?? null
}

// Mevcut stok
export function getMevcutStok(urunId) {
  const kontroller = getKontroller()
    .filter(k => k.urunId === urunId)
    .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
  return kontroller[0]?.adet ?? null
}

// Alışveriş listesi
export function getAlisverisListesi() {
  const urunler = getUrunler()
  const liste = []
  for (const urun of urunler) {
    const esik = getEsik(urun)
    if (esik === null) continue
    const mevcut = getMevcutStok(urun.id)
    if (mevcut === null) continue
    if (mevcut < esik) {
      const hedef = Math.ceil(esik * 2)
      liste.push({ urun, mevcut, esik, alAdet: hedef - mevcut })
    }
  }
  return liste
}

// Export/Import
export function exportData() {
  return JSON.stringify({
    kategoriler: getKategoriler(),
    urunler: getUrunler(),
    kontroller: getKontroller(),
    tuketimler: getTuketimler(),
  }, null, 2)
}

export function importData(json) {
  const data = JSON.parse(json)
  set(KEYS.kategoriler, data.kategoriler || [])
  set(KEYS.urunler, data.urunler || [])
  set(KEYS.kontroller, data.kontroller || [])
  set(KEYS.tuketimler, data.tuketimler || [])
}

// Demo veri
export function demoVeriyiYukle() {
  if (getKategoriler().length > 0) return

  const temizlik = { id: uid(), ad: 'Temizlik' }
  const mutfak = { id: uid(), ad: 'Mutfak' }
  const banyo = { id: uid(), ad: 'Banyo' }
  set(KEYS.kategoriler, [temizlik, mutfak, banyo])

  const urunler = [
    { id: uid(), kategoriId: temizlik.id, ad: 'Deterjan', manuelEsik: null, otomatikEsik: 2, esikOnerisi: null },
    { id: uid(), kategoriId: temizlik.id, ad: 'Çamaşır Suyu', manuelEsik: null, otomatikEsik: 1, esikOnerisi: null },
    { id: uid(), kategoriId: mutfak.id, ad: 'Bulaşık Deterjanı', manuelEsik: null, otomatikEsik: 2, esikOnerisi: null },
    { id: uid(), kategoriId: mutfak.id, ad: 'Kağıt Havlu', manuelEsik: null, otomatikEsik: 3, esikOnerisi: null },
    { id: uid(), kategoriId: banyo.id, ad: 'Şampuan', manuelEsik: null, otomatikEsik: 1, esikOnerisi: null },
  ]
  set(KEYS.urunler, urunler)
}
