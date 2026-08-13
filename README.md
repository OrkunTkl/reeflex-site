# REEFLEX

An underwater 3D scroll experience built with React Three Fiber. You scroll, the camera swims through a coral reef along a scripted path, and a handful of structural "modules" (reef lattice, a line of reef housing, tiered reef stacks) appear along the way with contextual text and point-of-interest popups.

## Stack

- **React 19** + **Vite**
- **@react-three/fiber** + **@react-three/drei** — Canvas, `ScrollControls` / `useScroll()` for the scroll-driven camera, `useGLTF` for the reef/fish/rock models
- **three** / **three-stdlib**
- **zustand** — small stores for performance tier and wave animation state
- **detect-gpu** — picks a performance tier so effects scale down on weaker devices
- **i18next** + **react-i18next** (with browser language detection) — EN / FR content
- **Custom GLSL** — water surface and light-ray shaders, plus a caustics effect layered onto the floor and reef pieces

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
```

## How it's structured

```
src/
  App.jsx                  Canvas setup, Suspense boundary, loading screen, error boundary, logo
  Experience.jsx            ScrollControls + PerformanceDetector + CameraPath + Decors + modules + Content + lights
  Decors.jsx                 Assembles EnvMap, Water, Rays, Phyto, Floor, Rocks, Algues, SchoolFishes
  LoadingScreen.jsx           Progress-based loading screen (useProgress), gates the scene behind a Start button
  SceneErrorBoundary.jsx      Catches WebGL/render crashes and shows a fallback instead of a blank canvas
  WaveControler.jsx           Animates the water's wave amplitude (start → target, lerped)
  i18n.js                     i18next + react-i18next + language detector setup
  locale/en.json, fr.json     Translation strings

  decors/                    Water, Rays, Floor, Rocks, Algues, Phyto, EnvMap, SchoolFishes
  effect/caustic/             CausticMaterial, CausticMesh, InstancedCausticMesh, InstancedAlgaeCausticMesh
  materials/                  RaysMaterial, procedural textures, rays mask texture
  shaders/water/, shaders/rays/  GLSL for the water surface and light rays

  modules/                   UpBlock.jsx, LineHouse.jsx, Rague.jsx — the three structural "stops" along the scroll path
  components/                 ReefLattice, ReefLineHouse, ReefTierStack, ReefGrowth — the procedural/GLTF-backed geometry each module renders

  content/                    Content.jsx + TextUpblock, TextLineHouse, TextRague — text blocks positioned in 3D space alongside each module
  content/props/               FadingHtml.jsx (distance-based fade for in-scene HTML), icons.js (inline SVG icons)
  content/PointInteret.jsx     Point-of-interest markers that appear within a scroll range, with an icon + popup

  utils/CameraPath.jsx        Keyframes the camera position/rotation against useScroll().offset (0 → 1)
  utils/corridor.js            Helper geometry/logic for the swim corridor
  utils/performance/           PerformanceDetector.jsx (detect-gpu)
  utils/store/                 zustand stores: performanceDetectorStore, waveStore

public/
  models/                     GLTF/GLB assets — coral pieces, rock formations, fish (herring, school, tropical, tuna)
  textures/                    webp/jpg textures used by the shaders and materials
```

## Scroll system

`<ScrollControls pages={isMobile ? 30 : 10} damping={0.3} eps={0.0001}>` from drei drives everything — it creates the scrollable HTML region automatically. `CameraPath.jsx` reads `useScroll().offset` (0 → 1) and interpolates the camera between keyframes that line up with where each module and text block sits.

## Loading & error handling

On load you get a loading screen while assets fetch and GPU detection runs; once progress hits 100% the Start button becomes active and reveals the already-rendered scene. `SceneErrorBoundary` wraps the canvas so a WebGL or render error surfaces as a visible message instead of a blank screen.

## Performance tiering

`PerformanceDetector` (via `detect-gpu`) classifies the device and feeds that into `performanceDetectorStore`, which components can read to decide how much detail (instance counts, effect quality) to render.
