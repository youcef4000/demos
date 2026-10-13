// Labo IA de la landing : une scène 3D (three.js) qui se construit au rythme du prompt.
// setStep(s) : 0 = vide, 1 = flacon, 2 = bouchon, 3 = marbre, 4 = lumière, 5 = cadrage, 6 = style final.
// Tout est interpolé en continu : on peut remonter le scroll, la scène se défait.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (v) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
const back = (v) => {
  const x = clamp01(v);
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
const mix = (a, b, t) => a + (b - a) * t;

function marbleTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#0d0c10';
  g.fillRect(0, 0, 512, 512);
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 26; k++) {
    g.beginPath();
    let x = r() * 512;
    let y = r() * 512;
    g.moveTo(x, y);
    for (let i = 0; i < 8; i++) {
      x += (r() - 0.3) * 120;
      y += (r() - 0.5) * 90;
      g.quadraticCurveTo(x - 40, y + 30, x, y);
    }
    const gold = k % 5 === 0;
    g.strokeStyle = gold ? `rgba(201,162,39,${0.35 + r() * 0.3})` : `rgba(220,215,225,${0.05 + r() * 0.12})`;
    g.lineWidth = gold ? 1.2 : 0.6 + r() * 2.4;
    g.filter = `blur(${gold ? 0.4 : 1.2}px)`;
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function labelTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 300;
  const g = c.getContext('2d');
  g.fillStyle = '#0b0a0d';
  g.fillRect(0, 0, 512, 300);
  g.strokeStyle = 'rgba(242,223,160,.6)';
  g.lineWidth = 4;
  g.strokeRect(16, 16, 480, 268);
  g.fillStyle = '#f2dfa0';
  g.font = '800 92px Archivo, Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('N O O R', 256, 132);
  g.font = '500 30px Figtree, Arial, sans-serif';
  g.fillStyle = 'rgba(242,223,160,.7)';
  g.fillText('EAU DE PARFUM', 256, 214);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function initLab(canvas, { onFail, manualCamera = false, step: step0 = 0 } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    onFail?.(err);
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const bgA = new THREE.Color('#3a3540');
  const bgB = new THREE.Color('#07060a');
  scene.background = bgA.clone();
  scene.fog = new THREE.Fog(scene.background, 9, 22);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const look = new THREE.Vector3(0, 1.15, 0);

  // Flacon
  const bottle = new THREE.Group();
  scene.add(bottle);
  // Verre « simulé » (transparence + reflets) : même rendu sur tous les téléphones, sans passe de transmission
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xfff4e2,
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    opacity: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.6,
    depthWrite: false,
  });
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.85, 0.78, 6, 0.2), glass);
  body.position.y = 0.95;
  body.castShadow = true;
  body.renderOrder = 2;
  bottle.add(body);
  const liquid = new THREE.Mesh(
    new RoundedBoxGeometry(1.26, 1.4, 0.56, 4, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xeaa040, roughness: 0.15, emissive: 0x6a3400, emissiveIntensity: 0.5 }),
  );
  liquid.position.y = 0.8;
  bottle.add(liquid);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.5), new THREE.MeshStandardMaterial({ map: labelTexture(), roughness: 0.5 }));
  label.position.set(0, 0.9, 0.395);
  bottle.add(label);

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd9b24a, metalness: 1, roughness: 0.22, envMapIntensity: 1.4 });
  const cap = new THREE.Group();
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 32), goldMat);
  neck.position.y = 0.11;
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.6, 48), goldMat);
  top.position.y = 0.5;
  top.castShadow = true;
  cap.add(neck, top);
  scene.add(cap);

  // Socle en marbre
  const marble = marbleTexture();
  const pedMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: marble, roughness: 0.25, metalness: 0.1 });
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.78, 0.42, 64), pedMat);
  ped.position.y = -0.21;
  ped.receiveShadow = true;
  ped.castShadow = true;
  scene.add(ped);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.35 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.42;
  floor.receiveShadow = true;
  scene.add(floor);

  // Lumières
  const hemi = new THREE.HemisphereLight(0xfff4e0, 0x1a1720, 0.55);
  scene.add(hemi);
  const key = new THREE.SpotLight(0xfff0d8, 60, 30, 0.55, 0.85, 1.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0005;
  key.target.position.set(0, 0.9, 0);
  scene.add(key, key.target);
  const rim = new THREE.PointLight(0xe0be55, 0, 12, 1.6);
  rim.position.set(-1.5, 2.6, -2.4);
  scene.add(rim);
  const rim2 = new THREE.PointLight(0xec7a45, 0, 10, 1.6);
  rim2.position.set(2.2, 1.4, -2);
  scene.add(rim2);

  let step = step0;
  let w = 0;
  let h = 0;
  let running = false;
  let raf = 0;
  const t0 = performance.now();

  function apply(time) {
    const s = step;
    const a1 = back(s - 0.15); // flacon
    const a2 = smooth((s - 1) * 1.3); // bouchon
    const a3 = smooth(s - 2); // marbre
    const a4 = smooth(s - 3); // lumière
    const a5 = smooth(s - 4); // cadrage
    const a6 = smooth(s - 5); // style

    bottle.scale.setScalar(Math.max(0.0001, a1));
    bottle.visible = a1 > 0.002;
    cap.visible = a2 > 0.002;
    cap.position.y = mix(4.6, 1.87, back(a2));
    cap.scale.setScalar(Math.max(0.0001, Math.min(1, a2 * 1.4)));

    ped.position.y = mix(-1.6, -0.21, a3);
    ped.scale.set(mix(0.4, 1, a3), 1, mix(0.4, 1, a3));
    ped.visible = a3 > 0.002;
    scene.background.copy(bgA).lerp(bgB, Math.max(a3 * 0.8, a6));
    scene.fog.color.copy(scene.background);

    // Lumière : de face/droite et dure → douce venant de la gauche
    key.position.set(mix(3.6, -4.2, a4), mix(5.5, 3.6, a4), mix(4.5, 2.4, a4));
    key.penumbra = mix(0.25, 0.95, a4);
    key.angle = mix(0.4, 0.62, a4);
    hemi.intensity = mix(0.65, 0.32, a4) + a6 * 0.05;

    // Cadrage : plan rapproché en légère contre-plongée
    if (!manualCamera) {
      const cx = mix(0, 0.55, a5);
      const cy = mix(2.1, 0.55, a5);
      const cz = mix(8.4, 5.4, a5);
      camera.position.set(cx, cy, cz);
      look.set(0, mix(1.05, 1.3, a5), 0);
    }
    camera.lookAt(look);

    // Style : lumières de contour or et cuivre, rotation lente
    rim.intensity = a6 * 26;
    rim2.intensity = a6 * 12;
    renderer.toneMappingExposure = mix(1.05, 1.2, a6);
    const spin = Math.sin((time - t0) / 2600) * 0.32 + (time - t0) / 9000;
    const ry = mix(-0.5, 0.35, a1) + spin * (0.4 + a6 * 0.6);
    bottle.rotation.y = ry;
    cap.rotation.y = ry;
  }

  function frame(now) {
    apply(now);
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || (r.width === w && r.height === h)) return;
    w = r.width;
    h = r.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(() => {
    resize();
    if (!running) frame(performance.now());
  }).observe(canvas);

  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    },
    { rootMargin: '120px' },
  );
  io.observe(canvas);
  frame(performance.now());

  if (manualCamera) {
    camera.position.set(0, 1.6, 7.4);
    look.set(0, 1.1, 0);
  }
  return {
    camera,
    look,
    render: () => {
      if (!running) frame(performance.now());
    },
    setStep(s) {
      step = Math.max(0, Math.min(6, s));
      if (!running) frame(performance.now());
    },
  };
}
