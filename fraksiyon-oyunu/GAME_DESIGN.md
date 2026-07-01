# KIRILMA — Oyun Tasarım Dokümanı (GDD)

**Tür:** Asimetrik ekonomi + politika + kaynak yönetimi strateji oyunu
**Platform:** Mobil (Android öncelikli), PWA — offline çalışır
**Oyuncu sayısı:** 1 insan + 1-3 yapay zeka fraksiyonu (aynı cihazda "pass & play" da desteklenir)
**Oturum süresi:** ~20-40 dakika (10-16 tur)
**Orijinallik notu:** Aşağıdaki tüm fraksiyonlar, kartlar, formüller ve isimler bu doküman için özgün olarak tasarlanmıştır. Herhangi bir ticari oyunun mekanik kopyası değildir; yalnızca "asimetrik ekonomi stratejisi" türünden ilham alınmıştır.

---

## 1. Konsept ve Tema

**KIRILMA**, kurgusal bir ülkenin (10 bölgeden oluşan "Anakara") ekonomik ve politik geleceğini şekillendiren 4 gücün mücadelesini anlatır. Her fraksiyon aynı haritayı, aynı 10 turu paylaşır ama tamamen farklı bir oyun oynar: biri fabrika işgal eder, biri hisse alır, biri kanun çıkarır, biri borç verir. Kimse birbirinin "aynı" hamlesini yapamaz — herkes kendi ekonomisini kendi kurallarıyla büyütürken, aynı paylaşılan haritayı (istemeden de olsa) birbirinin altını oyarak etkiler.

**Ana gerilim:** Hiçbir fraksiyon tek başına oynamıyor gibi hissettirmemeli. Devlet'in vergi kararı Şirket'in kârını, Şirket'in fabrika kapatması Halk'ın işsizliğini, Halk'ın grevi Finans'ın risk primini, Finans'ın faiz kararı ise Devlet'in borç yükünü etkiler. Kimse izole değildir; kimse simetrik değildir.

---

## 2. Harita: Anakara

- 10 **Bölge** (node-graph, altıgen değil, basit bağlantılı grafik — mobilde parmakla kolay dokunulabilir büyük düğümler).
- Her bölgenin özellikleri:
  - **Nüfus** (10-100 birim) — İşgücü kaynağının üst sınırı.
  - **Üretim Kapasitesi** (0-10) — bölgenin üretebileceği maksimum Üretim.
  - **İşsizlik Oranı** (%) — bölgesel, Halk Refahı'nı ve huzursuzluğu etkiler.
  - **Baskın Etki** — o bölgede en çok "Nüfuz" biriktirmiş fraksiyon (görsel olarak renklenir).
  - **Bağlantılar** — komşu bölgeler; bazı etkiler (grev, kriz, ticaret) yalnızca komşu bölgelere yayılır.
- Bölgeler 3 tipte gelir: **Sanayi Bölgesi** (Üretim ağırlıklı), **Finans Merkezi** (Sermaye/Nüfuz ağırlıklı), **Kırsal Bölge** (İşgücü fazlası, düşük üretim kapasitesi). Bu tipler fraksiyonların stratejik önceliklerini belirler.

---

## 3. Ortak Kaynaklar (herkes farklı üretir/kullanır)

| Kaynak | Sembol | Anlamı |
|---|---|---|
| **İşgücü** | 👷 | Emek arzı; üretime dönüştürülür veya grevle geri çekilir |
| **Üretim** | ⚙️ | Mal/hizmet çıktısı; Ticaret Değeri'ne çevrilir, vergilendirilir |
| **Sermaye** | 💰 | Yatırım/harcama gücü; enflasyondan aşınır |
| **Siyasi Etki (Nüfuz)** | 🏛️ | Bölge kontrolü, kart gücü ve yasa çıkarma kapasitesi |

Ayrıca iki **küresel gösterge** tüm fraksiyonları aynı anda etkiler:
- **Enflasyon (%)** — para arzı arttıkça yükselir, Sermaye'nin gerçek değerini düşürür.
- **Ulusal İşsizlik (%)** — bölgesel işsizliklerin ağırlıklı ortalaması; Halk Kolektifi'nin can damarı, diğerleri için risk göstergesi.

---

## 4. Fraksiyonlar

Her fraksiyon 4 eksende farklıdır: **kaynak üretimi, aksiyon ekonomisi, kazanma şartı, kartlar.**

### 4.1 Halk Kolektifi 👷 (kolektif ekonomi)

- **Üretim mantığı:** İşgücü'nü doğrudan Üretim'e çevirir (fabrika sahipliği yok, "Kolektif Atölye" var). Sermaye üretimi çok düşüktür; ana gücü **Dayanışma** puanıdır (bölgeler arası ortak hareket ettikçe artar).
- **Aksiyon ekonomisi — "Dağınık Karar":** Her tur 10 bölgenin her biri ayrı ayrı oy kullanır gibi davranır: oyuncu 3-5 küçük eylemi (Örgütlenme, Grev, Kolektif Yatırım, Dayanışma Kampanyası) birden fazla bölgeye dağıtabilir, ama tek bir eylem tek başına zayıftır — güç, eylemlerin birlikte (komşu bölgelerde aynı anda) uygulanmasından gelir.
- **Kazanma şartı — Halk Refahı Eşiği:** Ulusal İşsizlik %8'in altına, ortalama ücret endeksi hedefin üstüne çıkıp **3 tur üst üste** bu durum korunursa Halk Kolektifi kazanır.
- **Riski:** Sermaye biriktiremediği için Finans'ın borç tuzaklarına ve Devlet'in vergi baskısına karşı kırılgandır.

### 4.2 Serbest Girişim Konsorsiyumu 💼 (serbest piyasa şirketi)

- **Üretim mantığı:** Sermaye'yi doğrudan fabrika/otomasyon satın alarak Üretim'e çevirir; bileşik büyüme (her tur elindeki Sermaye'nin %8-15'i kadar faizsiz getiri) en güçlü yanıdır.
- **Aksiyon ekonomisi — "Yönetim Kurulu Kararı":** Merkezi ve güçlü: her tur yalnızca **2 büyük karar** alınır (ör. "Fabrika Kur", "Lobi Faaliyeti", "Otomasyona Geç") ama her biri tüm haritayı etkileyecek ölçekte güçlüdür. Az ama vurucu.
- **Kazanma şartı — Pazar Hakimiyeti:** Anakara'daki toplam Ticaret Değeri'nin **%45'ini** tek başına kontrol ederse (Üretim × bölge sayısı ağırlıklı) kazanır.
- **Riski:** Yüksek Sermaye stoku enflasyondan en çok zarar gören taraf; Halk'ın grevleri üretim hattını doğrudan durdurabilir.

### 4.3 Devlet Bürokrasisi 🏛️ (devlet/bürokrasi)

- **Üretim mantığı:** Doğrudan üretmez; Vergi (tüm fraksiyonların Üretim/Sermaye hareketinden **%** kesinti) ve para basma yoluyla Sermaye biriktirir. Ana kaynağı Nüfuz'dur.
- **Aksiyon ekonomisi — "Bütçe Onay Süreci":** Kararlar (vergi oranı, asgari ücret, sübvansiyon, ihracat kısıtı) verildiği turdan **1 tur sonra** yürürlüğe girer — yavaş ama harita genelinde eş zamanlı etki yaratır. Oyuncu geleceği öngörerek oynamak zorundadır.
- **Kazanma şartı — İstikrar Zaferi:** Enflasyon %4-%7 bandında VE Ulusal İşsizlik %10'un altında **4 tur üst üste** kalırsa Devlet kazanır (yönetememe krizi = kaybetme riski de var: enflasyon %20'yi geçerse veya işsizlik %25'i geçerse Devlet **kriz kaybı** yaşar).
- **Riski:** Etkisi gecikmeli olduğu için ani krizlere anında müdahale edemez; diğer 3 fraksiyonun ortak baskısı bütçeyi kilitleyebilir.

### 4.4 Küresel Finans Ağı 🌐 (küresel yatırımcı/finans)

- **Üretim mantığı:** Hiçbir bölgede fiziksel üretim yapmaz. Diğer fraksiyonlara **kredi** verir (faizle geri öder) ve bölgelere **spekülatif pozisyon** açar (bir bölgenin Üretim artışına/düşüşüne "bahis" oynar). Kazancı tamamen başkalarının ekonomik hareketinden gelir.
- **Aksiyon ekonomisi — "Sözleşme Ağı":** Her tur sınırsız sayıda küçük sözleşme (kredi teklifi, pozisyon açma, faiz güncelleme) açabilir ama her sözleşme yalnızca ilgili taraf **kabul ederse** (AI/insan) devreye girer — pasif-agresif, dolaylı bir aksiyon ekonomisi.
- **Kazanma şartı — Portföy Zaferi:** Toplam Portföy Değeri (nakit + açık kredilerin faiz getirisi + pozisyon kârı) belirli bir eşiğe (başlangıç sermayesinin **4 katı**) ulaşırsa kazanır.
- **Riski:** Bir fraksiyon iflas ederse (Sermaye 0'ın altına düşerse) o fraksiyona açılan krediler **batık** sayılır ve Finans büyük kayıp yaşar — risk yönetimi zorunludur.

---

## 5. Ekonomik Sistemler (paylaşılan simülasyon katmanı)

Bunlar hiçbir fraksiyona ait değildir; her turun sonunda **motor** tarafından tüm haritaya uygulanır.

1. **Üretim Zinciri:** `İşgücü + Sermaye Girdisi → Üretim → Ticaret Değeri (Üretim × Bölge Talep Katsayısı)`. Ticaret Değeri, Pazar Hakimiyeti kazanma şartının ve genel Sermaye üretiminin temelidir.
2. **Enflasyon:** `Enflasyon += (toplam yeni basılan/yaratılan Sermaye / toplam Sermaye) × katsayı − Üretim büyüme oranı`. Yüksek enflasyon tüm fraksiyonların elindeki Sermaye'nin "gerçek" gücünü tur sonunda küçültür.
3. **İşsizlik:** Her bölgede `İşsizlik = 1 − (istihdam edilen İşgücü / Nüfus)`. Fabrika kapatma, otomasyon kararları ve grevler bunu değiştirir.
4. **Vergi:** Devlet'in belirlediği oran, her fraksiyonun o tur ürettiği Üretim/Sermaye artışından kesilir ve Devlet'in Sermaye'sine eklenir.
5. **Kriz Eşikleri:** Enflasyon > %20, Ulusal İşsizlik > %25 veya herhangi bir fraksiyonun Sermaye'si art arda 2 tur negatif kalması **Ulusal Kriz** tetikler — bu turda tüm fraksiyonlara geçici ceza/fırsat kartı dağıtılır (kriz kartları), oyunu dramatik biçimde değiştirir.

---

## 6. Politika Kartları

Her tur, her fraksiyon (insan veya AI) elindeki 3 karttan **1 tanesini** seçer (bazı güçlü kartlar 2 kaynak gerektirir). Kartlar iki havuzdan gelir:

- **Ortak Havuz** (herkes çekebilir, ama etkisi fraksiyona göre farklı yorumlanır): *Asgari Ücret Artışı, Serbest Ticaret Anlaşması, Sınır Ötesi Yatırım Teşviki, Kamu Yatırımı, Grev Hakkı Genişletme, Vergi Reformu...*
- **Fraksiyona Özel Havuz:** Halk için *Kolektif Fabrika Kur, Dayanışma Ağı*; Şirket için *Otomasyon Yatırımı, Düzenleyici Lobi*; Devlet için *Zorunlu Denetim, Para Basma*; Finans için *Riskli Kredi Paketi, Kısa Satış Pozisyonu*.

Her kart en az bir **trade-off** içerir (ör. *Asgari Ücret Artışı*: Halk Refahı +, Şirket üretim verimliliği −, Enflasyon hafif +). Kartlar veri dosyasında (`policyCards.js`) tanımlıdır, böylece yeni kart eklemek kod değişikliği gerektirmez.

---

## 7. Tur Akışı

1. **Kart Seçimi** — tüm fraksiyonlar (insan + AI) elindeki karttan birini gizlice seçer.
2. **Fraksiyon Aksiyonları** — her fraksiyon kendi aksiyon ekonomisine göre hamlelerini yapar (Halk: dağınık eylemler / Şirket: 2 büyük karar / Devlet: gecikmeli bütçe kuyruğu / Finans: sözleşme teklifleri).
3. **Motor Çözümlemesi** — kartlar + aksiyonlar birleşip uygulanır; üretim zinciri, enflasyon, işsizlik, vergi hesaplanır.
4. **Kriz Kontrolü** — eşikler aşıldıysa Ulusal Kriz tetiklenir.
5. **Kazanma Kontrolü** — her fraksiyonun kazanma şartı kontrol edilir.
6. **Tur Özeti** — oyuncuya değişim raporu gösterilir, harita güncellenir, sıradaki tura geçilir.

Varsayılan oyun **14 tur** sürer; hiçbir fraksiyon kazanamazsa en yüksek "Güç Endeksi" (kendi kazanma şartına yakınlık yüzdesi) olan fraksiyon **stratejik üstünlük** ile kazanır.

---

## 8. Yapay Zeka Kişilikleri

Her AI fraksiyonu, kart/aksiyon seçimini bir **fayda fonksiyonu (utility function)** ile yapar. Kişilikler bu fonksiyonun ağırlıklarını değiştirir:

| Kişilik | Davranış |
|---|---|
| **Agresif** | Kendi kazanma metriğini maksimize eder, yan etkileri (enflasyon, başka fraksiyona zarar) önemsemez. Riskli, yüksek varyans kartları tercih eder. |
| **Dengeli** | Kendi metriğiyle birlikte küresel göstergeleri (enflasyon, ulusal işsizlik) de ağırlıklandırır; orta riskli kartlar seçer, aşırı uçlardan kaçınır. |
| **Kriz Yöneticisi** | Varsayılan olarak pasif/savunmacı oynar; yalnızca bir eşik (kendi Sermaye'si düşüyor, bölgesi kaybediliyor, ulusal kriz yaklaşıyor) tetiklendiğinde agresifleşir ve o krize doğrudan çözüm üreten kartı seçer. |

Her fraksiyona oyun kurulumunda bir kişilik atanır (varsayılan veya oyuncu seçimiyle). Fayda fonksiyonu `engine/ai/personalities.js` içinde ağırlık vektörü olarak tanımlıdır — yeni bir kişilik eklemek yalnızca yeni bir ağırlık seti eklemek demektir.

---

## 9. Mobil Uygulama Yaklaşımı

- **Teknoloji:** React + Vite + Tailwind CSS + `vite-plugin-pwa`. Bu proje reposundaki mevcut stok-takip uygulamasıyla aynı teknoloji ailesini kullanır ama **tamamen bağımsız bir alt-proje**dir (kendi `package.json`, kendi derlemesi).
- **Neden PWA:** Tek kod tabanıyla hem tarayıcıda hem "Ana Ekrana Ekle" ile Android'de native benzeri, **offline** çalışan bir uygulama elde edilir (service worker + local state persistence, sunucu gerektirmez — tüm oyun mantığı istemci tarafında çalışır).
- **Android'e native paketleme (opsiyonel sonraki adım):** Aynı kod tabanı, ek bir adım olarak **Capacitor** ile sarmalanıp gerçek bir `.apk`/Play Store paketine dönüştürülebilir; oyun motoru UI'dan tamamen ayrıştırıldığı için (bkz. Bölüm 10) bu geçiş kod mimarisini değiştirmez.
- **UI prensibi:** Büyük dokunma alanları, tek elle kullanım (alt gezinme çubuğu), kart seçimi için yatay kaydırmalı liste, harita için basit grid/graph görünümü — karmaşık 3D/animasyon yok, okunabilirlik öncelikli.

---

## 10. Genişletilebilir Mimari (özet — detay için README)

Oyun motoru (kurallar, state, AI) **React'tan tamamen bağımsız, saf JavaScript** olarak yazılır:

```
src/
  engine/     → kurallar, state reducer, ekonomi hesaplamaları (UI'sız, test edilebilir)
  data/       → fraksiyonlar, bölgeler, politika kartları (JSON benzeri veri, kod değişikliği gerektirmeden genişletilebilir)
  ai/         → kişilik ağırlıkları + karar fonksiyonları
  screens/    → React ekranları (Kurulum, Harita, Panel, Kart Seçimi, Tur Özeti, Oyun Sonu)
  components/ → küçük tekrar kullanılabilir UI parçaları
```

Bu ayrım sayesinde:
- Yeni bir fraksiyon eklemek → `data/factions.js`'e bir kayıt + `engine/factions/`'a bir kural modülü eklemek yeterlidir.
- Motoru React Native'e veya Unity/Godot'a taşımak istenirse, `engine/` klasörü UI'dan bağımsız olduğu için doğrudan taşınabilir veya bir servis/worker olarak sarmalanabilir.
- AI kişiliği eklemek → `ai/personalities.js`'e yeni bir ağırlık seti eklemek yeterlidir.

---

## 11. Kapsam Dışı (v1 prototipte yok, sonraki sürüm)

- Çok oyunculu ağ üzerinden (online) mod — v1 yalnızca tek cihaz (insan + AI veya pass&play).
- Sesli/animasyonlu efektler.
- Prosedürel harita üretimi — v1 sabit 10 bölgeli Anakara haritası kullanır.
- Kalıcı bulut kayıt — v1 yalnızca `localStorage` ile yerel kayıt yapar (offline gereksinimiyle uyumlu).
