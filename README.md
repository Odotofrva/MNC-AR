# MENOCLONE AR — updated artwork-scanning prototype

This version includes the two supplied MENOCLONE scan designs:

- `assets/images/menoclone-wordmark.png`
- `assets/images/mnc-ufo.png`

The gallery now presents those two designs directly. Selecting one opens its detail view and **SCAN THIS DESIGN** starts the camera-based AR scanner.

## No local Three.js install required

This build uses CDN-hosted Three.js and MindAR, so there is no `npm install` step for the current static prototype. You only need to serve the folder over HTTPS or localhost.

## New: runtime target compilation

This build can compile the selected PNG into a MindAR image target directly in the user's browser on first scan. This means the two supplied images can be tested immediately without manually generating `.mind` files first.

The first scan may take a little longer because MindAR analyzes the image and builds the tracking data. A progress bar is shown while this happens.

For a production deployment with many visitors, precompiled `.mind` targets are still recommended because they load faster. MindAR's official compiler can export those files from the same PNG/JPG artwork.

## GLB files

The two experiences currently use the existing prototype GLB models:

- MENOCLONE Wordmark → `assets/models/signal-01.glb`
- MNC UFO → `assets/models/signal-03.glb`

Replace those files or update the `model` property in `app.js` when your final GLB experiences are ready.

Example:

```js
{
  id: 'mnc-ufo',
  title: 'MNC UFO',
  artwork: './assets/images/mnc-ufo.png',
  model: './assets/models/mnc-ufo-experience.glb',
  targetMode: 'runtime',
  targetSourceImage: './assets/images/mnc-ufo.png',
  demoTargetImage: './assets/images/mnc-ufo.png',
  modelScale: 0.5,
  modelY: 0.05,
  modelZ: 0.06
}
```

## Run locally

Camera access requires **HTTPS** or `localhost`.

From inside the project folder:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

For phone testing, deploy to an HTTPS host such as GitHub Pages, Netlify, Vercel, or your normal web host.

## Important marker-quality note

Image tracking works best when a design has many distinct local visual features, edges, contrast changes, and non-repeating details. Logos can work, but a highly symmetrical or minimal logo may track less reliably than a detailed poster. Test both supplied markers under real lighting and printed sizes before mass deployment.

## Production target option

If you switch to precompiled `.mind` targets later, change an experience from:

```js
targetMode: 'runtime',
targetSourceImage: './assets/images/mnc-ufo.png'
```

to:

```js
targetMode: 'precompiled',
target: './assets/targets/mnc-ufo.mind'
```

The scanner already supports both modes.

## Visual + sound effects update
This build adds a centered MENOCLONE logo in the main navigation and AR scanner, animated splash/logo reveal, ambient background motion, card hover/reveal effects, animated scan lines, AR target-found flash, a Three.js particle/ring effect around the GLB, and lightweight synthesized UI/scan sound effects using the Web Audio API. No audio files or additional npm packages are required. Sound can be toggled with the music-note button.


## GitHub Pages scanner fix

This build imports both `mindar-image` and `mindar-image-three` as ES modules through the import map. MindAR 1.2.5 builds `mindar-image.prod.js` as an ES module, so it must not be included as a classic `<script src=...>` tag. The scanner now imports `Compiler` directly from `mindar-image`, which fixes the false "internet connection" error that occurred when the compiler was undefined.

After replacing files on GitHub Pages, allow the deployment to finish and then hard-refresh the page or open it in a new private/incognito tab so the old `ar.js` is not served from browser cache.


## Updated model mapping
- `MENOCLONE Wordmark` now uses `./assets/models/menoclone-wordmark.glb`.
- `MNC UFO` now uses `./assets/models/mnc-ufo.glb`.


## Draco-compressed GLB support
The scanner now imports Three.js `DRACOLoader`, attaches it to `GLTFLoader`, and loads the Draco WebAssembly decoder from the Three.js CDN. This is required for the included `menoclone-wordmark.glb` and `mnc-ufo.glb`, which use `KHR_draco_mesh_compression`.


## Added experience
- **MENOCLONE City Card** uses `assets/images/menoclone-city-card.png` as the scan target and `assets/models/skyline-specter.glb` as the AR model.
- The model is positioned lower on the target (`modelY: -0.18`) and slightly above the artwork (`modelZ: 0.09`) so it appears to stand below the central MENOCLONE logo, over the city scene.
- `ar.js` now supports an optional `modelX` property for per-experience horizontal positioning.


## Replaced city-card experience
- The previous **MENOCLONE City Card** option has been replaced with **MENOCLONE Figure Pile**.
- Scan target: `assets/images/figure-pile-target.png`
- Model path: `assets/models/figure-pile.glb`
- The AR transform is tuned to appear approximately like the pile in the scan target, but about **2x larger** (`modelScale: 0.7`).
- A placeholder file currently exists at `assets/models/figure-pile.glb` so the app structure stays intact. Replace that file with your final custom `.glb` when ready.


## Figure pile reach-out update
- **MENOCLONE Figure Pile** now loads `assets/models/menoclone-street-runner.glb`.
- The figure is tuned to appear approximately **3 inches tall** in AR.
- Added per-experience support for `modelRotX`, `modelRotY`, `modelRotZ`, `idleSpin`, and `popOut`.
- For the figure pile experience, `popOut: true` creates a short emerge-forward animation when the image is recognized so the character feels like it is reaching out from the artwork toward the user.
