# LineUp Ocean — gerçek kaynak koda göre (v3) baştan kuruldu

Bu sürüm önceki ikisinden temelden farklı: artık **gerçek `Experience.jsx`,
`App.jsx`, `LoadingScreen.jsx` ve modül (`UpBlock`/`LineHouse`/`Rague`)
dosyalarının birebir mimarisini** kullanıyor. En önemli değişiklik: özel
GSAP scroll sistemim tamamen kaldırıldı, yerine **drei'nin gerçek
`<ScrollControls>` + `useScroll()`** sistemi geldi — siteyi nasıl
kurduysan öyle.

## Kurulum

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
```

## "Hiçbir şey gözükmüyor" sorunu hakkında

Bir önceki sürümde `Suspense` sınırı eksikti; bu sürümde `App.jsx` gerçek
koddaki gibi **tek bir `<Suspense fallback={null}>` ile `<Experience/>`'ı
sarmalıyor**, tıpkı senin verdiğin orijinal `App.jsx`'teki gibi. Ayrıca artık
bir **LoadingScreen** var (gerçek site de öyle): sayfa açılır açılmaz koyu
lacivert bir yükleme ekranı görürsün, ilerleme çubuğu %100'e ulaşıp GPU
tespiti bitince "Start" butonu aktif olur. Butona basınca 3D sahne görünür
hale gelir (sahne aslında arkada zaten render oluyor, LoadingScreen sadece
üstte bir katman). **Eğer buton hiç aktif olmuyorsa** konsolu aç, GPU tespiti
veya bir asset yüklemesi takılmış olabilir — bana o hata mesajını gönder.

Ayrıca bir `SceneErrorBoundary` ekledim: WebGL/React tarafında bir çökme
olursa artık sessiz mavi ekran yerine ekranda kırmızı bir hata mesajı
göreceksin.

## Mimari — artık gerçek dosya yollarıyla birebir

```
src/
  App.jsx                 gerçek kök: Canvas + Suspense(Experience) + LoadingScreen + dil/logo butonları
  Experience.jsx           gerçek: ScrollControls + PerformanceDetector + CameraPath + Decors + modüller + Content + ışıklar
  Decors.jsx                gerçek: EnvMap, Water, Rays, Phyto, Floor, Rocks, Algues, SchoolFishes
  LoadingScreen.jsx         gerçek: useProgress tabanlı yükleme ekranı
  WaveControler.jsx         gerçek: uBigWavesAmplitude animasyonu (start/target/lerp)
  i18n.js                   gerçek: i18next + react-i18next + LanguageDetector
  locale/en.json, fr.json   çeviri sözlükleri (gerçek JSON dosyaları elimde yoktu, ben yazdım)

  decors/                  Water, Rays, Floor, Rocks, Algues, Phyto, EnvMap, SchoolFishes
  effect/caustic/          CausticMaterial, CausticMesh, InstancedCausticMesh, InstancedAlgaeCausticMesh
  materials/               RaysMaterial, proceduralTextures, raysMaskTexture
  shaders/water/, shaders/rays/   gerçek GLSL, birebir

  modules/                 UpBlock.jsx, LineHouse.jsx, Rague.jsx — GERÇEK KOORDİNATLARDA
                            (senin verdiğin position/rotation değerleri birebir kullanıldı,
                            sadece gerçek .glb yerine kendi prosedürel geometrilerimiz var)
  components/               ReefLattice, ReefLineHouse, ReefTierStack (yukarıdaki modüllerin
                            kullandığı prosedürel yer tutucu geometriler)

  content/                  Content.jsx, TextUpblock, TextLineHouse, TextRague (gerçek pozisyonlar)
  content/props/            FadingHtml.jsx (gerçek, distance-squared fade), icons.js (SVG yer tutucular)
  content/PointInteret.jsx  gerçek: scroll-aralığına göre görünen ikon + popup (video'daki
                            balık/deniz otu/dalga ikonları buydu — şimdi UpBlock bölümünde var)

  utils/CameraPath.jsx      useScroll().offset ile gerçek koordinatlar arasında key-frame kamera
  utils/performance/        PerformanceDetector.jsx (detect-gpu)
  utils/store/              performanceDetectorStore, waveStore (zustand)
```

## Senin attığın koddan BİREBİR portladıklarım

- `Experience.jsx`, `App.jsx`, `LoadingScreen.jsx`, `WaveControler.jsx`,
  `Decors.jsx` — satır satır.
- `modules/UpBlock.jsx`, `LineHouse.jsx`, `Rague.jsx` — **gerçek
  position/rotation/scale değerleri** (derece→radyan çevirileri dahil).
- `content/TextLineHouse.jsx`, `TextRague.jsx`, `content/props/FadingHtml.jsx`,
  `content/PointInteret.jsx` — gerçek kod.
- `shaders/water/*`, `shaders/rays/*`, `materials/RaysMaterial.js`,
  `effect/caustic/*` — gerçek GLSL/JS, birebir.
- `i18n.js` (yapı), `utils/store/*`, `utils/performance/PerformanceDetector.jsx`.

## Değiştirmek zorunda kaldıklarım (gerçek binary asset'ler / kodlar elimde yok)

| Orijinal | Bende yerine geçen |
|---|---|
| `UpBlock.glb`, `LineHouse.glb`, `rague.glb`, `moduleTexture.webp` | `components/ReefLattice.jsx`, `ReefLineHouse.jsx`, `ReefTierStack.jsx` — **gerçek koordinatlarda** yerleştirilmiş prosedürel geometriler |
| `cubeMap/*.webp` | canvas ile üretilen basit degrade cubemap |
| `sol.glb`, `solTexture.webp` | prosedürel dalgalı plane + canvas kum dokusu (koridorun tamamını kapsayacak şekilde) |
| `rock.glb` (gerçek dosya farklı), `rockTexture.webp`, `dummiesRocksPositions.glb` | kendi zip'indeki kaya modeli + canvas doku + rastgele dummy matrisler |
| `herbier-position.glb`, `plantes-herbier.glb` | sentetik şerit yüzey + `MeshSurfaceSampler` + canvas çim dokusu |
| `phytoSurface.glb`, `phyto1.png` | rastgele hacimsel dağılım + canvas nokta dokusu |
| `raysmask.jpg` | canvas ile üretilen ışın maskesi |
| `assets/img/logo.png`, `logo-icon.png` | metin tabanlı "L∪O" rozet |
| `locale/fr.json`, `en.json` (gerçek dosyalar) | kendi yazdığım çeviri sözlükleri (aynı key'ler, farklı olabilecek metin) |
| `PointInteret` ikonları (gerçek görseller) | `content/props/icons.js` — inline SVG (balık/flask/dalga) |
| `InstancedFishSchool` + `SchoolFishMaterial` (GPU-instanced shader flocking) | `decors/SchoolFishes.jsx` — CPU tabanlı, daha basit ama çalışan sürüm |
| `ConcretionUpBlock` / `UpBlockConcretion` (performans seviyesine göre ek detay katmanı) | **eklenmedi** — gerçek `.glb` olmadan güvenilir bir şekilde tahmin edemedim |

**Gerçek asset dosyalarını (glb/webp/jpg/json) atarsan**, tabloda solda
yazan yerlere koyup ilgili component'te `useGLTF`/`useTexture` çağrısına
çevirmek hızlı bir iş — mimari zaten seninkiyle birebir.

## Scroll sistemi artık gerçek

`<ScrollControls pages={isMobile ? 30 : 10} damping={0.3} eps={0.0001}>` —
drei bunun için otomatik bir HTML scroll alanı oluşturuyor, ekstra hiçbir
şey yapmana gerek yok. `CameraPath.jsx` içindeki `useScroll().offset`
(0→1) değeri, senin gerçek `TextLineHouse`/`TextRague`/modül
koordinatlarına göre ayarlanmış key-frame'ler arasında kamerayı taşıyor.
