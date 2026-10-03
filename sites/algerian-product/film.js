// Le film d'introduction : un survol de l'Algérie en relief, région par région, façon documentaire.
// Three.js pour le relief (calculé par terrain-worker.js), caméra « drone » pilotée par GSAP.
// Sans WebGL : une carte plate en SVG qui zoome sur chaque région, même interface.
import { BOX, LAND, ALGERIA } from './geo.js';

const KX = Math.cos((28 * Math.PI) / 180);
const CX = (BOX.w + BOX.e) / 2;
const CY = (BOX.s + BOX.n) / 2;
const W = (BOX.e - BOX.w) * KX;
const D = BOX.n - BOX.s;
const EXAG = 19;
const HS = EXAG / 111000; // unités de scène par mètre
const DEG = Math.PI / 180;

export const toWorld = (lon, lat) => ({ x: (lon - CX) * KX, z: -(lat - CY) });
export const toLonLat = (x, z) => ({ lon: x / KX + CX, lat: -z + CY });

// Remplit des contours [lon, lat, …] dans un canevas carré N×N (règle pair-impair)
function rasterize(rings, N) {
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, N, N);
  g.fillStyle = '#fff';
  g.beginPath();
  for (const r of rings) {
    for (let k = 0; k < r.length; k += 2) {
      const x = ((r[k] - BOX.w) / (BOX.e - BOX.w)) * N;
      const y = ((BOX.n - r[k + 1]) / (BOX.n - BOX.s)) * N;
      if (k === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
  }
  g.fill('evenodd');
  return c;
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch {
    return false;
  }
}

/* ===================================================================== */
/* Version 3D                                                             */
/* ===================================================================== */
export async function createFilm({ mount, onProgress = () => {}, reduced = false }) {
  const THREE = await import('three');
  const small = Math.min(innerWidth, innerHeight) < 700 || (navigator.hardwareConcurrency || 4) <= 4;
  const N = small ? 1024 : 2048;
  const M = small ? 256 : 480;

  // 1. Relief dans le worker
  const landCanvas = rasterize(LAND, N);
  const dzCanvas = rasterize(ALGERIA, N);
  const landData = landCanvas.getContext('2d').getImageData(0, 0, N, N).data;
  const land = new Uint8ClampedArray(N * N);
  for (let i = 0; i < N * N; i++) land[i] = landData[i * 4];
  const result = await new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./terrain-worker.js', import.meta.url));
    worker.onmessage = (e) => {
      if (e.data.progress != null) onProgress(e.data.progress);
      if (e.data.done) {
        worker.terminate();
        resolve(e.data);
      }
    };
    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
    worker.postMessage({ N, M, box: BOX, land }, [land.buffer]);
  });
  onProgress(1);

  // 2. Scène
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.setClearColor(0x161d1b, 1);
  mount.appendChild(renderer.domElement);
  renderer.domElement.className = 'film__canvas';
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.02, 140);

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = colorCanvas.height = N;
  colorCanvas.getContext('2d').putImageData(new ImageData(result.color, N, N), 0, 0);
  const tex = (cv, mip = true) => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.NoColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.generateMipmaps = mip;
    t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    return t;
  };
  const uMap = tex(colorCanvas);
  const uLand = tex(landCanvas, false);
  const uDz = tex(dzCanvas, false);

  const geo = new THREE.PlaneGeometry(W, D, M, M);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const aH = new Float32Array(pos.count);
  const heights = result.mesh;
  for (let i = 0; i < pos.count; i++) {
    const h = heights[i];
    aH[i] = h;
    pos.setY(i, h > 0 ? h * HS : -0.006 + h * HS * 0.02);
  }
  geo.setAttribute('aH', new THREE.BufferAttribute(aH, 1));
  geo.computeVertexNormals();

  const uniforms = {
    uMap: { value: uMap },
    uLand: { value: uLand },
    uDz: { value: uDz },
    uTime: { value: 0 },
    uIsolate: { value: 0 },
    uBorder: { value: 1 },
    uContour: { value: 1 },
    uGrat: { value: 1 },
    uFocus: { value: new THREE.Vector2(0, 0) },
    uFocusAmt: { value: 0 },
    uCam: { value: new THREE.Vector3() },
    uFog: { value: new THREE.Color(0x161d1b) },
    uFogDen: { value: 0.026 },
    uIvory: { value: new THREE.Color(0xf4efe4) },
    uAccent: { value: new THREE.Color(0xf4efe4) },
    uBox: { value: new THREE.Vector4(BOX.w, BOX.e, BOX.s, BOX.n) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    extensions: { derivatives: true },
    vertexShader: /* glsl */ `
      attribute float aH;
      varying vec2 vUv;
      varying float vH;
      varying vec3 vW;
      varying vec3 vN;
      void main() {
        vUv = uv;
        vH = aH;
        vN = normal;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap, uLand, uDz;
      uniform float uTime, uIsolate, uBorder, uContour, uGrat, uFocusAmt, uFogDen;
      uniform vec2 uFocus;
      uniform vec3 uCam, uFog, uIvory, uAccent;
      uniform vec4 uBox;
      varying vec2 vUv;
      varying float vH;
      varying vec3 vW;
      varying vec3 vN;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float gridLine(float v, float w) {
        float d = abs(fract(v - 0.5) - 0.5);
        return 1.0 - smoothstep(0.0, max(fwidth(v) * w, 1e-5), d);
      }
      void main() {
        vec3 col = texture2D(uMap, vUv).rgb;
        float land = texture2D(uLand, vUv).r;
        float dz = texture2D(uDz, vUv).r;
        float dist = length(vW - uCam);

        // micro-relief pour les plans rapprochés
        float near = clamp(1.6 - dist / 3.5, 0.0, 1.0) * land;
        float mn = vnoise(vW.xz * 90.0) * 0.6 + vnoise(vW.xz * 210.0) * 0.4;
        col *= 1.0 + (mn - 0.5) * 0.16 * near;

        // ombres de nuages qui passent
        vec2 cp = vW.xz * 0.42 + vec2(uTime * 0.016, uTime * 0.006);
        float cl = vnoise(cp) * 0.58 + vnoise(cp * 2.3 + 5.0) * 0.3 + vnoise(cp * 5.1 - 2.0) * 0.12;
        col *= 1.0 - 0.26 * smoothstep(0.56, 0.8, cl) * land;

        // mer : reflets lents
        float sea = 1.0 - smoothstep(0.3, 0.6, land);
        float sh = vnoise(vW.xz * 7.0 + vec2(uTime * 0.06, -uTime * 0.04)) * vnoise(vW.xz * 3.0 - uTime * 0.02);
        col += sea * vec3(0.05, 0.08, 0.09) * smoothstep(0.35, 0.8, sh);

        // l'Algérie en pleine lumière, le reste en retrait
        float outside = (1.0 - smoothstep(0.3, 0.7, dz)) * smoothstep(0.3, 0.6, land);
        float lum = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(col, vec3(lum) * vec3(0.6, 0.6, 0.58), uIsolate * outside * 0.82);

        // courbes de niveau (tous les 200 m), visibles de près
        float cfade = clamp(1.25 - dist / 8.0, 0.0, 1.0);
        float c = gridLine(vH / 200.0, 1.1) * step(40.0, vH) * land;
        col = mix(col, uIvory, c * 0.13 * uContour * cfade);

        // méridiens et parallèles
        float lon = mix(uBox.x, uBox.y, vUv.x);
        float lat = mix(uBox.z, uBox.w, vUv.y);
        float g = max(gridLine(lon, 1.0), gridLine(lat, 1.0));
        col = mix(col, uIvory, g * 0.06 * uGrat);

        // frontière et côte, nettes à toutes les distances
        float fdz = max(fwidth(dz), 1e-4);
        float border = 1.0 - smoothstep(0.0, fdz * 1.7, abs(dz - 0.5));
        float glow = (1.0 - smoothstep(0.0, fdz * 9.0, abs(dz - 0.5))) * 0.35;
        col = mix(col, uIvory, clamp(border * 0.9 + glow * 0.3, 0.0, 1.0) * uBorder);
        float coast = 1.0 - smoothstep(0.0, max(fwidth(land), 1e-4) * 1.3, abs(land - 0.5));
        col = mix(col, uIvory, coast * 0.22);

        // repère de la région : onde qui s'élargit et cercle fin
        float d = distance(vW.xz, uFocus);
        float p = fract(uTime * 0.33);
        float ring = exp(-pow((d - 0.06 - p * 0.75) / 0.018, 2.0)) * (1.0 - p);
        float ring2 = exp(-pow((d - 0.26) / 0.007, 2.0));
        col = mix(col, uAccent, clamp(ring * 0.75 + ring2 * 0.6, 0.0, 1.0) * uFocusAmt);
        col *= 1.0 + 0.1 * uFocusAmt * (1.0 - smoothstep(0.0, 0.9, d));

        // brume de distance
        float fog = 1.0 - exp(-pow(dist * uFogDen, 2.0));
        vec2 e = min(vUv, 1.0 - vUv);
        fog = max(fog, 1.0 - smoothstep(0.0, 0.07, min(e.x, e.y)));
        col = mix(col, uFog, fog);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const terrain = new THREE.Mesh(geo, material);
  scene.add(terrain);

  // Ciel : du ton de la brume à l'horizon vers la nuit, avec une lueur du côté du soleil (nord-ouest)
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(100, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { uFog: uniforms.uFog },
      vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 uFog; varying vec3 vD;
        void main(){
          float h = clamp(vD.y, -0.2, 1.0);
          vec3 top = vec3(0.035, 0.05, 0.05);
          vec3 col = mix(uFog, top, smoothstep(0.0, 0.45, h));
          float sun = pow(max(0.0, dot(normalize(vD), normalize(vec3(-0.6, 0.18, -0.6)))), 6.0);
          col += vec3(0.16, 0.12, 0.08) * sun * (1.0 - smoothstep(0.0, 0.5, h));
          gl_FragColor = vec4(col, 1.0);
        }`,
    })
  );
  sky.renderOrder = -1;
  scene.add(sky);

  // Altitude du terrain en un point (unités de scène)
  const heightAt = (x, z) => {
    const fx = ((x + W / 2) / W) * M;
    const fz = ((z + D / 2) / D) * M;
    const x0 = Math.max(0, Math.min(M - 1, Math.floor(fx)));
    const z0 = Math.max(0, Math.min(M - 1, Math.floor(fz)));
    const tx = Math.min(1, Math.max(0, fx - x0));
    const tz = Math.min(1, Math.max(0, fz - z0));
    const h = (ix, iz) => Math.max(0, heights[iz * (M + 1) + ix]) * HS;
    return (h(x0, z0) * (1 - tx) + h(x0 + 1, z0) * tx) * (1 - tz) + (h(x0, z0 + 1) * (1 - tx) + h(x0 + 1, z0 + 1) * tx) * tz;
  };

  // 3. Caméra : cible (x, z), distance, inclinaison, cap
  const portrait = () => innerWidth / innerHeight < 0.9;
  const cam = { x: 0, z: 0, dist: 30, pitch: 58 * DEG, yaw: 0, ty: 0 };
  const drift = { yaw: 0, dist: 0, on: false };
  const v3 = new THREE.Vector3();
  function placeCamera(dt) {
    if (drift.on && !reduced) {
      drift.yaw += dt * 0.035;
      drift.dist = Math.max(drift.dist - dt * 0.05, -0.6);
    }
    const yaw = cam.yaw + drift.yaw;
    const dist = Math.max(0.6, cam.dist + drift.dist);
    const ground = heightAt(cam.x, cam.z);
    cam.ty += (ground - cam.ty) * Math.min(1, dt * 3);
    camera.position.set(
      cam.x + dist * Math.cos(cam.pitch) * Math.sin(yaw),
      cam.ty + dist * Math.sin(cam.pitch),
      cam.z + dist * Math.cos(cam.pitch) * Math.cos(yaw)
    );
    camera.lookAt(cam.x, cam.ty, cam.z);
    uniforms.uCam.value.copy(camera.position);
    // brume plus dense pour les plans rasants, légère pour la vue d'ensemble
    uniforms.uFogDen.value = Math.min(0.06, Math.max(0.013, 0.11 / Math.sqrt(dist + 1)));
    sky.position.copy(camera.position);
  }
  const fold = () => {
    cam.yaw += drift.yaw;
    cam.dist = Math.max(0.6, cam.dist + drift.dist);
    drift.yaw = 0;
    drift.dist = 0;
  };

  let tween = null;
  const gsap = window.gsap;
  // Vol vers un point : léger arc vertical, durée selon la distance
  function flyTo(target, { duration, instant = false, focus = null, isolate = null } = {}) {
    fold();
    drift.on = false;
    tween?.kill();
    const from = { ...cam };
    const travel = Math.hypot(target.x - cam.x, target.z - cam.z);
    let dyaw = (target.yaw ?? cam.yaw) - cam.yaw;
    dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
    const bump = Math.min(travel * 0.55, 10);
    const dur = duration ?? Math.min(4.6, Math.max(2.2, 1.9 + travel * 0.12));
    if (focus) uniforms.uFocus.value.set(focus.x, focus.z);
    if (instant || reduced || !gsap) {
      Object.assign(cam, { x: target.x, z: target.z, dist: target.dist, pitch: target.pitch, yaw: from.yaw + dyaw });
      uniforms.uFocusAmt.value = focus ? 1 : 0;
      if (isolate != null) uniforms.uIsolate.value = isolate;
      drift.on = !!focus;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const p = { t: 0 };
      gsap.to(uniforms.uFocusAmt, { value: 0, duration: 0.4, overwrite: true });
      if (isolate != null) gsap.to(uniforms.uIsolate, { value: isolate, duration: dur, ease: 'sine.inOut', overwrite: true });
      tween = gsap.to(p, {
        t: 1,
        duration: dur,
        ease: 'power2.inOut',
        onUpdate() {
          const e = p.t;
          cam.x = from.x + (target.x - from.x) * e;
          cam.z = from.z + (target.z - from.z) * e;
          cam.dist = from.dist + (target.dist - from.dist) * e + bump * Math.sin(Math.PI * e);
          cam.pitch = from.pitch + (target.pitch - from.pitch) * e + 0.12 * Math.sin(Math.PI * e) * (bump > 1 ? 1 : 0);
          cam.yaw = from.yaw + dyaw * e;
        },
        onComplete() {
          if (focus) {
            gsap.to(uniforms.uFocusAmt, { value: 1, duration: 0.8, overwrite: true });
            drift.on = true;
          }
          resolve();
        },
      });
    });
  }

  // Plans du film
  const shots = {
    opening: () => {
      const a = toWorld(3.06, 36.2);
      return { x: a.x, z: a.z, dist: portrait() ? 4.6 : 3.6, pitch: 15 * DEG, yaw: Math.PI };
    },
    overview: () => {
      const a = toWorld(2.6, 28.6);
      return { x: a.x, z: a.z, dist: portrait() ? 44 : 31, pitch: 62 * DEG, yaw: 0 };
    },
    region: (r) => {
      const a = toWorld(r.lon, r.lat);
      // la cible est décalée vers le bas de l'écran pour laisser la place au titre
      return { x: a.x, z: a.z + (portrait() ? 0.5 : 0.15), dist: portrait() ? 4.6 : 3.4, pitch: 36 * DEG, yaw: (r.heading || 0) * DEG };
    },
  };
  Object.assign(cam, shots.opening());

  // 4. Projection d'un point lon/lat à l'écran (pour les repères HTML)
  const rect = { w: 1, h: 1 };
  function project(lon, lat, lift = 0) {
    const p = toWorld(lon, lat);
    v3.set(p.x, heightAt(p.x, p.z) + lift, p.z).project(camera);
    return { x: (v3.x * 0.5 + 0.5) * rect.w, y: (-v3.y * 0.5 + 0.5) * rect.h, visible: v3.z < 1 && Math.abs(v3.x) < 1.15 && Math.abs(v3.y) < 1.15 };
  }

  function resize() {
    const w = mount.clientWidth || innerWidth;
    const h = mount.clientHeight || innerHeight;
    rect.w = w;
    rect.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 44 : 32;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  // 5. Boucle de rendu (arrêtée quand le film n'est pas à l'écran)
  let running = false;
  let last = performance.now();
  const listeners = new Set();
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    uniforms.uTime.value += reduced ? 0 : dt;
    placeCamera(dt);
    renderer.render(scene, camera);
    const ll = toLonLat(cam.x, cam.z);
    const alt = camera.position.y * 111000; // à l'échelle horizontale de la carte, en mètres
    for (const fn of listeners) fn({ lon: ll.lon, lat: ll.lat, alt, dt });
    requestAnimationFrame(frame);
  }
  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  }
  setRunning(true);

  // Plans nommés : ouverture (depuis la mer), vue d'ensemble, région
  function show(kind, r, opts = {}) {
    const target = shots[kind](r);
    if (kind === 'region') return flyTo(target, { ...opts, focus: toWorld(r.lon, r.lat), isolate: 0.82 });
    return flyTo(target, { ...opts, isolate: kind === 'overview' ? 0.82 : 0 });
  }

  return {
    kind: '3d',
    ms: result.ms,
    flyTo,
    show,
    shots,
    toWorld,
    project,
    onFrame: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    setRunning,
    setIsolate: (v) => (uniforms.uIsolate.value = v),
    focus: (lon, lat) => {
      const p = toWorld(lon, lat);
      uniforms.uFocus.value.set(p.x, p.z);
    },
    canvas: renderer.domElement,
    material,
  };
}

/* ===================================================================== */
/* Repli sans WebGL : carte plate qui zoome                               */
/* ===================================================================== */
export function createFlatFilm({ mount }) {
  const VW = 1000;
  const VH = Math.round((VW * D) / W);
  const px = (lon) => ((lon - BOX.w) / (BOX.e - BOX.w)) * VW;
  const py = (lat) => ((BOX.n - lat) / (BOX.n - BOX.s)) * VH;
  const path = (rings) =>
    rings
      .map((r) => {
        let d = '';
        for (let k = 0; k < r.length; k += 2) d += `${k ? 'L' : 'M'}${px(r[k]).toFixed(1)} ${py(r[k + 1]).toFixed(1)}`;
        return d + 'Z';
      })
      .join('');
  const wrap = document.createElement('div');
  wrap.className = 'film__flat';
  wrap.innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path class="flat__land" d="${path(LAND)}" fill-rule="evenodd"/>
    <path class="flat__dz" d="${path(ALGERIA)}"/>
  </svg>`;
  mount.appendChild(wrap);
  const svg = wrap.querySelector('svg');
  const view = { cx: px(2.6), cy: py(30), scale: 1 };
  const apply = (instant) => {
    svg.style.transition = instant ? 'none' : 'transform 2.4s cubic-bezier(.65,0,.35,1)';
    const r = wrap.getBoundingClientRect();
    const s = Math.max(r.width / VW, r.height / VH) * view.scale;
    const tx = r.width / 2 - view.cx * s;
    const ty = r.height / 2 - view.cy * s;
    svg.style.transformOrigin = '0 0';
    svg.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    svg.style.width = `${VW}px`;
    svg.style.height = `${VH}px`;
  };
  addEventListener('resize', () => apply(true));
  apply(true);
  const shots = {
    opening: () => ({ lon: 3, lat: 31, scale: 1.05 }),
    overview: () => ({ lon: 2.6, lat: 28.4, scale: 1.05 }),
    region: (r) => ({ lon: r.lon, lat: r.lat - 0.6, scale: 3.6 }),
  };
  const listeners = new Set();
  return {
    kind: 'flat',
    shots,
    show(kind, r, opts = {}) {
      return this.flyTo(shots[kind](r), opts);
    },
    flyTo(target, { instant } = {}) {
      view.cx = px(target.lon);
      view.cy = py(target.lat);
      view.scale = target.scale;
      apply(instant);
      const ll = { lon: target.lon, lat: target.lat, alt: 0 };
      for (const fn of listeners) fn(ll);
      return new Promise((r) => setTimeout(r, instant ? 0 : 2400));
    },
    project(lon, lat) {
      const r = wrap.getBoundingClientRect();
      const s = Math.max(r.width / VW, r.height / VH) * view.scale;
      return { x: r.width / 2 + (px(lon) - view.cx) * s, y: r.height / 2 + (py(lat) - view.cy) * s, visible: true };
    },
    onFrame: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    setRunning() {},
    setIsolate() {},
    focus() {},
  };
}
