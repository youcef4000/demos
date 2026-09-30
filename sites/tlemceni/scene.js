// Tlemceni — scène 3D : éclairage studio, ombre portée et caméra pilotée par le scroll.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createSneaker } from './sneaker.js';

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function createScene(canvas, { mobile = false, reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  const maxDpr = mobile ? 1.6 : 2;
  let dpr = Math.min(devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.6;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);

  // --- lumières : une douche principale, un contre-jour rouge (couleur de la marque)
  const key = new THREE.DirectionalLight(0xfff4e6, 2.4);
  key.position.set(-2.2, 5.5, 3.6);
  key.castShadow = true;
  key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  key.shadow.camera.left = -2.8;
  key.shadow.camera.right = 2.8;
  key.shadow.camera.top = 2.8;
  key.shadow.camera.bottom = -2.8;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 14;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.012;
  key.shadow.radius = 4;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xff2a36, 1.2);
  rim.position.set(1.5, 2.6, -5.5);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.45);
  fill.position.set(4, 1.2, 3);
  scene.add(fill);

  // --- sol : ombre douce de contact + ombre portée de la lumière principale
  const stage = new THREE.Group();
  scene.add(stage);
  const contactTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 64, 4, 128, 64, 124);
    g.addColorStop(0, 'rgba(0,0,0,0.75)');
    g.addColorStop(0.45, 'rgba(0,0,0,0.35)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.setTransform(1, 0, 0, 0.5, 0, 32);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 1.6),
    new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false, opacity: 0.85 }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.002;
  stage.add(contact);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.32 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  stage.add(floor);

  // --- la basket
  const sneaker = createSneaker({ quality: mobile ? 0.5 : 1 });
  const holder = new THREE.Group(); // position/rotation globale (vol, rotation de présentation)
  const pivot = new THREE.Group(); // centre de rotation au milieu de la chaussure
  pivot.position.set(0, -0.45, 0);
  holder.add(pivot);
  pivot.add(sneaker.root);
  sneaker.root.position.set(0, 0, 0);
  scene.add(holder);

  // --- état piloté de l'extérieur (GSAP)
  const state = {
    explode: { laces: 0, tongue: 0, heel: 0, toe: 0, badge: 0, upper: 0, insole: 0, midsole: 0, outsole: 0 },
    dim: { laces: 0, tongue: 0, heel: 0, toe: 0, badge: 0, upper: 0, insole: 0, midsole: 0, outsole: 0 },
    flip: 0,
    xray: 0,
    squash: 0,
  };
  // vue : rotation de la chaussure, caméra en coordonnées sphériques autour d'une cible
  const view = {
    ry: -0.5, rx: 0, rz: 0, lift: 0.45, // chaussure
    azim: 0.32, elev: 0.28, dist: 7.2, tx: 0, ty: 0.42, tz: 0, // caméra
    sx: 0, sy: 0, // décalage à l'écran (fraction de la largeur / hauteur)
    shadow: 1, spin: 0,
    ilift: 0, iry: 0, // décalages de l'animation d'entrée
  };
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

  let W = 1, H = 1;
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }
  resize();

  // Distance de caméra qui garde la chaussure entière, quel que soit le format d'écran.
  function fitDistance(d) {
    const a = camera.aspect;
    const k = mobile ? 0.95 : 1.45;
    return a < k ? d * Math.pow(k / a, 0.92) : d;
  }

  let time = 0;
  const target = V3();
  function place(dt) {
    time += dt;
    pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 3);
    pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 3);
    const bob = reducedMotion ? 0 : Math.sin(time * 1.3) * 0.03 * view.spin;
    holder.position.set(0, view.lift + view.ilift + bob, 0);
    holder.rotation.set(view.rx + pointer.sy * 0.06, view.ry + view.iry + pointer.sx * 0.14 + (reducedMotion ? 0 : Math.sin(time * 0.5) * 0.08 * view.spin), view.rz);
    sneaker.update(state);
    const d = fitDistance(view.dist);
    target.set(view.tx, view.ty, view.tz);
    camera.position.set(
      target.x + d * Math.cos(view.elev) * Math.sin(view.azim),
      target.y + d * Math.sin(view.elev),
      target.z + d * Math.cos(view.elev) * Math.cos(view.azim),
    );
    camera.lookAt(target);
    if (view.sx || view.sy) camera.setViewOffset(W, H, -view.sx * W, view.sy * H, W, H);
    else camera.clearViewOffset();
    contact.material.opacity = 0.85 * view.shadow;
    floor.material.opacity = 0.32 * view.shadow;
    contact.scale.setScalar(1 + (1 - view.shadow) * 0.4);
  }

  function render(dt = 0.016) {
    place(dt);
    renderer.render(scene, camera);
  }

  // projection d'un point de la chaussure à l'écran (pixels CSS)
  const tmp = V3();
  function project(name, local = null) {
    sneaker.anchorWorld(name, tmp, local);
    tmp.project(camera);
    return { x: (tmp.x * 0.5 + 0.5) * W, y: (-tmp.y * 0.5 + 0.5) * H, z: tmp.z };
  }

  // qualité adaptative : on baisse la résolution si les images sont trop lentes
  let slow = 0;
  function adapt(ms) {
    if (ms > 34) slow++;
    else slow = Math.max(0, slow - 1);
    if (slow > 40 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.25);
      renderer.setPixelRatio(dpr);
      resize();
      slow = 0;
    }
  }

  async function warm() {
    place(0);
    renderer.compile(scene, camera);
    renderer.render(scene, camera);
  }

  return {
    renderer, scene, camera, sneaker, state, view, pointer,
    render, resize, project, adapt, warm,
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    setColorway(name) {
      sneaker.setColorway(name);
    },
  };
}
