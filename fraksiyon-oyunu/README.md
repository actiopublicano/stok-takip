# KIRILMA — Fraksiyon Oyunu

Asimetrik ekonomi + politika + kaynak yönetimi strateji oyunu. Mobil öncelikli, offline çalışan bir PWA prototipi.

Bu, **stok-takip** deposundaki envanter uygulamasından tamamen bağımsız bir alt-projedir: kendi `package.json`, kendi bağımlılıkları, kendi derleme süreci vardır. Ortak hiçbir kod veya bağımlılık paylaşılmaz.

Tam oyun tasarımı için [`GAME_DESIGN.md`](./GAME_DESIGN.md) dosyasına bakın.

## Kurulum ve Çalıştırma

```bash
cd fraksiyon-oyunu
npm install
npm run dev       # geliştirme sunucusu
npm run build     # üretim derlemesi (dist/)
npm run preview   # üretim derlemesini yerelde önizleme
```

`npm run build` sonrası `dist/` klasörü statik bir PWA'dır; herhangi bir statik dosya sunucusuyla (Netlify, Vercel, GitHub Pages, `npx serve dist`) yayınlanabilir. Servis worker sayesinde ilk yüklemeden sonra **tamamen offline** çalışır.

## Mimari

```
src/
  data/             veri katmanı (kural içermez, salt veri)
    factions.js       4 fraksiyonun kimliği, kazanma şartı metni, başlangıç kaynakları
    regionsData.js     10 bölgeli Anakara haritası + bağlantı grafiği
    policyCards.js     ortak + fraksiyona özel politika kartları (id, açıklama, effect(), scoreHints)

  engine/           oyun motoru — React'tan tamamen bağımsız, saf JS, UI'sız test edilebilir
    state.js           createInitialState() — yeni oyun state'i üretir
    helpers.js         clamp, getFaction/getRegion, seeded RNG (mulberry32)
    factionRules.js    4 fraksiyonun aksiyon ekonomisi (FACTION_ACTIONS, ACTION_BUDGET)
    economy.js         üretim zinciri, vergi, enflasyon, işsizlik sürüklenmesi, kredi/pozisyon çözümü
    crisis.js          ulusal kriz eşik kontrolü
    winConditions.js   4 farklı kazanma şartının değerlendirilmesi + Güç Endeksi
    turn.js            resolveTurn(state) → yeni state. Tüm turu tek fonksiyonda orkestre eder.

  ai/               yapay zeka karar sistemi
    personalities.js   3 kişilik (Agresif / Dengeli / Kriz Yöneticisi) — ağırlık vektörleri
    decide.js          decideCard() ve decideActions() — fayda fonksiyonuyla en iyi seçimi bulur

  state/useGame.js  React hook — engine'i React state'ine bağlar, localStorage'a otomatik kaydeder

  screens/          React ekranları (yalnızca sunum; kural içermez)
  components/ui.jsx küçük tekrar kullanılabilir UI parçaları (Badge, Button, Card, ProgressBar)
```

### Neden bu ayrım?

`engine/` klasörü hiçbir yerde React import etmez. Bu bilinçli bir tercih:

- **Test edilebilirlik:** Motor fonksiyonları saf girdi/çıktı fonksiyonlarıdır (`resolveTurn(state) → newState`), UI olmadan Node içinde test edilebilir.
- **Taşınabilirlik:** Aynı motor ileride React Native'e taşınırsa hiç değişmeden çalışır. Unity/Godot gibi tamamen farklı bir istemciye geçilirse, motor bir servis/WASM/worker olarak sarmalanıp yeniden kullanılabilir.
- **Genişletilebilirlik:**
  - **Yeni fraksiyon eklemek** → `data/factions.js`'e bir kayıt + `engine/factionRules.js`'e o fraksiyonun aksiyon tanımları + `engine/winConditions.js`'e kazanma şartı eklemek yeterlidir. UI tarafında `PlayScreen.jsx`'teki `ACTION_COMPONENTS` map'ine yeni bir seçici bileşen eklenir.
  - **Yeni politika kartı eklemek** → `data/policyCards.js`'e `{id, name, description, effect(draft, factionId), scoreHints}` eklemek yeterlidir; motor ve AI otomatik olarak bunu devreye alır.
  - **Yeni AI kişiliği eklemek** → `ai/personalities.js`'e yeni bir ağırlık seti eklemek yeterlidir.
  - **Haritayı büyütmek/değiştirmek** → `data/regionsData.js`'teki bölge listesini düzenlemek yeterlidir (id/connections tutarlı olduğu sürece motor otomatik uyum sağlar).

## Oyun Döngüsü (özet)

1. `SetupScreen` — oyuncu fraksiyonunu ve rakip AI kişiliklerini seçer → `createInitialState()`.
2. `PlayScreen` — oyuncu elindeki 3 karttan birini seçer (`selectCard`) ve fraksiyonuna özgü aksiyonunu kurar (`setPlayerAction`).
3. `Turu Bitir` → `resolveTurn(state)` çağrılır: AI'lar kendi kart/aksiyonlarını `ai/decide.js` ile seçer, tüm kartlar+aksiyonlar uygulanır, `economy.js` ekonomik simülasyonu çalıştırır, kriz ve kazanma şartları kontrol edilir.
4. Sonuç `TurnSummaryModal`'da özetlenir, harita/panel güncellenir, yeni tur başlar.
5. Bir fraksiyon kazanma şartını sağlarsa veya 14. tur biterse `GameOverScreen` gösterilir.

## Android'e Paketleme (sonraki adım, opsiyonel)

Bu proje şu an bir PWA'dır (Android'de "Ana Ekrana Ekle" ile offline çalışan native benzeri bir uygulama olarak kurulabilir). Gerçek bir `.apk` / Play Store paketi gerekirse, kod tabanı değiştirilmeden [Capacitor](https://capacitorjs.com/) ile sarmalanabilir:

```bash
npm install @capacitor/core @capacitor/android
npx cap init "Kırılma" "com.example.kirilma"
npm run build
npx cap add android
npx cap copy android
npx cap open android   # Android Studio'da açar, oradan derlenir
```

`engine/`, `ai/` ve `data/` klasörleri UI'dan bağımsız olduğu için bu geçişte hiçbir oyun mantığı kodu değişmez.

## Kapsam Notu

Bu bir **prototiptir** — GDD'nin "Kapsam Dışı" bölümünde belirtildiği gibi çok oyunculu ağ modu, prosedürel harita üretimi ve bulut kayıt v1'de yoktur. Motor katmanı bu özellikler eklenmeden önce sağlam bir temel oluşturacak şekilde tasarlanmıştır.
