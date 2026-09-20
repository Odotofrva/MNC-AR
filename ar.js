import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';

const qs = new URLSearchParams(location.search);
let exp;
try { exp = JSON.parse(decodeURIComponent(qs.get('experience') || '')); } catch {}

const fatal = (message) => {
  document.getElementById('fatalMessage').textContent = message;
  document.getElementById('fatal').hidden = false;
};
if (!exp) fatal('No AR experience was selected. Return to the gallery and choose an artwork.');

document.getElementById('arTitle').textContent = exp?.title?.toUpperCase() || 'AR SCAN';
document.getElementById('targetImage').src = exp?.demoTargetImage || exp?.artwork || '';
document.getElementById('exitBtn').addEventListener('click', () => location.href = 'index.html');
document.getElementById('helpBtn').addEventListener('click', () => document.getElementById('targetModal').hidden = false);
document.getElementById('targetClose').addEventListener('click', () => document.getElementById('targetModal').hidden = true);

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load target image: ${src}`));
    img.src = src;
  });
}

async function compileTargetFromImage(src, onProgress) {
  const Compiler = window.MINDAR?.IMAGE?.Compiler || window.MINDAR?.Compiler;
  if (!Compiler) throw new Error('MindAR target compiler failed to load. Check your internet connection and reload.');

  const img = await loadImage(src);
  const compiler = new Compiler();
  await compiler.compileImageTargets([img], progress => onProgress?.(progress));
  const exportedBuffer = await compiler.exportData();
  const blob = new Blob([exportedBuffer], { type: 'application/octet-stream' });
  return URL.createObjectURL(blob);
}

async function resolveTargetSource(statusLabel, statusTitle, statusHelp) {
  if (exp.targetMode !== 'runtime') return exp.target;

  const progressWrap = document.getElementById('compileProgress');
  const progressBar = document.getElementById('compileProgressBar');
  progressWrap.hidden = false;
  statusLabel.textContent = 'PREPARING TARGET';
  statusTitle.textContent = 'Learning this artwork';
  statusHelp.textContent = 'The first scan may take a moment while the image target is prepared in your browser.';

  const url = await compileTargetFromImage(exp.targetSourceImage || exp.artwork, progress => {
    const pct = Math.max(0, Math.min(100, Number(progress) || 0));
    progressBar.style.width = `${pct}%`;
    statusLabel.textContent = `PREPARING TARGET · ${pct.toFixed(0)}%`;
  });
  progressBar.style.width = '100%';
  setTimeout(() => { progressWrap.hidden = true; }, 350);
  return url;
}

async function start() {
  if (!exp) return;
  if (!window.isSecureContext && location.hostname !== 'localhost') {
    fatal('Camera access requires HTTPS (or localhost). Host this project on an HTTPS-enabled service before testing on a phone.');
    return;
  }

  const statusLabel = document.getElementById('statusLabel');
  const statusTitle = document.getElementById('statusTitle');
  const statusHelp = document.getElementById('statusHelp');
  let compiledTargetUrl = null;

  try {
    statusLabel.textContent = 'CAMERA PERMISSION';
    statusTitle.textContent = 'Allow camera access';
    statusHelp.textContent = 'Your camera feed stays in the browser and is used to recognize the selected artwork.';

    const preflight = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    preflight.getTracks().forEach(t => t.stop());

    compiledTargetUrl = await resolveTargetSource(statusLabel, statusTitle, statusHelp);

    const root = document.getElementById('arRoot');
    const mindarThree = new MindARThree({
      container: root,
      imageTargetSrc: compiledTargetUrl,
      maxTrack: 1,
      filterMinCF: 0.0001,
      filterBeta: 0.001
    });
    const { renderer, scene, camera } = mindarThree;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.3));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(1, 2, 2);
    scene.add(key);

    const anchor = mindarThree.addAnchor(0);
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(exp.model);
    const model = gltf.scene;
    const s = Number(exp.modelScale || 0.5);
    model.scale.setScalar(s);
    model.position.set(0, Number(exp.modelY || 0), Number(exp.modelZ || 0.05));
    anchor.group.add(model);

    let mixer = null;
    if (gltf.animations?.length) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach(clip => mixer.clipAction(clip).play());
    }

    anchor.onTargetFound = () => {
      statusLabel.textContent = 'SIGNAL FOUND';
      statusTitle.textContent = 'Experience unlocked';
      statusHelp.textContent = 'Keep the artwork in view. Move your phone slightly to explore the object.';
      document.querySelector('.scan-frame').style.opacity = '.22';
    };
    anchor.onTargetLost = () => {
      statusLabel.textContent = 'SEARCHING';
      statusTitle.textContent = 'Find the artwork again';
      statusHelp.textContent = 'Center the complete design inside the frame with good lighting.';
      document.querySelector('.scan-frame').style.opacity = '1';
    };

    statusLabel.textContent = 'SEARCHING';
    statusTitle.textContent = 'Point at the selected artwork';
    statusHelp.textContent = 'Keep the full design visible, flat, and well lit.';
    await mindarThree.start();

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      if (!gltf.animations?.length) model.rotation.y += delta * 0.42;
      renderer.render(scene, camera);
    });

    document.getElementById('exitBtn').addEventListener('click', async () => {
      renderer.setAnimationLoop(null);
      try { mindarThree.stop(); } catch {}
      if (compiledTargetUrl?.startsWith('blob:')) URL.revokeObjectURL(compiledTargetUrl);
    }, { once:true });
  } catch (err) {
    console.error(err);
    if (compiledTargetUrl?.startsWith('blob:')) URL.revokeObjectURL(compiledTargetUrl);
    const reason = err?.name === 'NotAllowedError'
      ? 'Camera permission was denied. Enable camera access for this site and try again.'
      : `Could not start the AR scanner: ${err?.message || 'Unknown error'}`;
    fatal(reason);
  }
}
start();
