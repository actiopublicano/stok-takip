// Anakara haritası: 10 bölge, basit bağlantı grafiği.
// type: 'sanayi' (üretim ağırlıklı) | 'finans' (sermaye/nüfuz ağırlıklı) | 'kirsal' (işgücü fazlası)
// x/y: harita üzerindeki konum (0-100 yüzde), UI tarafından kullanılır.

export const REGIONS = [
  { id: 'baskent', name: 'Başkent', type: 'finans', population: 80, prodCapacity: 5, unemployment: 0.10, x: 50, y: 12, connections: ['demirkoy', 'serbestbolge', 'sahilseridi'] },
  { id: 'demirkoy', name: 'Demirköy', type: 'sanayi', population: 70, prodCapacity: 9, unemployment: 0.12, x: 25, y: 28, connections: ['baskent', 'vadikasabalari', 'madenbolgesi'] },
  { id: 'serbestbolge', name: 'Serbest Bölge', type: 'finans', population: 40, prodCapacity: 4, unemployment: 0.08, x: 75, y: 28, connections: ['baskent', 'sahilseridi', 'guneysahili'] },
  { id: 'sahilseridi', name: 'Sahil Şeridi', type: 'sanayi', population: 55, prodCapacity: 7, unemployment: 0.11, x: 60, y: 42, connections: ['baskent', 'serbestbolge', 'guneysahili', 'ickyaylalar'] },
  { id: 'vadikasabalari', name: 'Vadi Kasabaları', type: 'kirsal', population: 60, prodCapacity: 3, unemployment: 0.15, x: 10, y: 45, connections: ['demirkoy', 'madenbolgesi', 'dogovalari'] },
  { id: 'madenbolgesi', name: 'Maden Bölgesi', type: 'sanayi', population: 45, prodCapacity: 8, unemployment: 0.14, x: 25, y: 60, connections: ['demirkoy', 'vadikasabalari', 'ickyaylalar'] },
  { id: 'guneysahili', name: 'Güney Sahili', type: 'finans', population: 35, prodCapacity: 4, unemployment: 0.09, x: 78, y: 55, connections: ['serbestbolge', 'sahilseridi', 'dogovalari'] },
  { id: 'ickyaylalar', name: 'İç Yaylalar', type: 'kirsal', population: 65, prodCapacity: 3, unemployment: 0.16, x: 45, y: 65, connections: ['sahilseridi', 'madenbolgesi', 'dogovalari', 'guneydogu'] },
  { id: 'dogovalari', name: 'Doğu Ovaları', type: 'kirsal', population: 58, prodCapacity: 3, unemployment: 0.17, x: 62, y: 78, connections: ['vadikasabalari', 'guneysahili', 'ickyaylalar', 'guneydogu'] },
  { id: 'guneydogu', name: 'Güneydoğu Yerleşimi', type: 'sanayi', population: 42, prodCapacity: 6, unemployment: 0.13, x: 48, y: 92, connections: ['ickyaylalar', 'dogovalari'] },
]

export const REGION_TYPE_LABEL = {
  sanayi: 'Sanayi Bölgesi',
  finans: 'Finans Merkezi',
  kirsal: 'Kırsal Bölge',
}
