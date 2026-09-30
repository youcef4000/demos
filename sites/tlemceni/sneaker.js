// Tlemceni — la basket « Runner 13 », modélisée pièce par pièce dans le code.
// Aucun fichier 3D à télécharger : semelles, tige, languette, lacets et renforts sont des
// géométries calculées, habillées de textures dessinées sur canvas. Chaque pièce vit dans son
// propre groupe pour pouvoir être écartée des autres (vue éclatée) au fil du scroll.
import * as THREE from 'three';

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Interpolation cubique (Hermite) à travers des points [x, y] triés par x.
function curve1(pts) {
  const n = pts.length;
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const d = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  const m = ys.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : (d[i - 1] + d[i]) / 2));
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

/* ------------------------------------------------------------------ */
/* Gabarit : 1 unité = 10 cm. Talon en x négatif, pointe en x positif,  */
/* côté extérieur (latéral) en z positif, sol en y = 0.                */
/* ------------------------------------------------------------------ */
const L = 2.9, X0 = -1.45, X1 = 1.45;
const X_BACK = -1.36, X_THROAT = 0.52, X_RIDGE_END = 1.3;
const RIM = 0.045; // épaisseur du rebord de la semelle intermédiaire
const OUT_T = 0.055; // épaisseur de la semelle extérieure

// demi-largeurs de la semelle (avant arrondi du talon et de la pointe)
const WL = curve1([[-1.45, 0.35], [-1.1, 0.36], [-0.6, 0.35], [-0.2, 0.37], [0.2, 0.42], [0.55, 0.455], [0.85, 0.44], [1.1, 0.39], [1.3, 0.33], [1.45, 0.28]]);
const WM = curve1([[-1.45, 0.35], [-1.1, 0.355], [-0.6, 0.315], [-0.2, 0.305], [0.2, 0.4], [0.55, 0.5], [0.85, 0.5], [1.1, 0.46], [1.3, 0.4], [1.45, 0.34]]);

function halfW(x, side, inset = 0) {
  const a = X0 + inset, b = X1 - inset;
  if (x <= a || x >= b) return 0;
  // extrémités en demi-ellipse : le contour arrive perpendiculaire à l'axe (pas de pointe)
  const rh = 0.34 - inset * 0.6, rt = 0.44 - inset * 0.6;
  let k = 1;
  if (x < a + rh) {
    const q = 1 - (x - a) / rh;
    k *= Math.sqrt(1 - q * q);
  }
  if (x > b - rt) {
    const q = 1 - (b - x) / rt;
    k *= Math.sqrt(1 - q * q);
  }
  return Math.max(0, (side > 0 ? WL(x) : WM(x)) - inset) * k;
}

const spring = (x) => 0.14 * smooth(0.25, 1.45, x) ** 2; // la pointe se relève
const bevel = (x) => 0.05 * smooth(-1.05, -1.45, x) ** 2; // biseau du talon
const footbed = (x) => lerp(0.265, 0.162, smooth(-0.95, 0.65, x)); // 10 mm de drop
const RIM_L = curve1([[-1.45, 0.08], [-1.0, 0.068], [-0.5, 0.045], [0, 0.036], [0.6, 0.036], [1.1, 0.045], [1.45, 0.062]]);
const RIM_M = curve1([[-1.45, 0.08], [-1.0, 0.072], [-0.5, 0.07], [-0.1, 0.064], [0.4, 0.042], [1.1, 0.045], [1.45, 0.062]]);
const rimY = (x, side) => footbed(x) + (side > 0 ? RIM_L(x) : RIM_M(x));

// ouverture du chaussant : demi-largeur, hauteur du bord ; arête du dessus de pied
const OW = curve1([[-1.36, 0.25], [-1.1, 0.27], [-0.85, 0.262], [-0.6, 0.205], [-0.4, 0.155], [0, 0.138], [0.3, 0.128], [0.52, 0.12]]);
const OY = curve1([[-1.36, 0.9], [-1.25, 0.865], [-1.0, 0.79], [-0.78, 0.81], [-0.6, 0.86], [-0.42, 0.88], [-0.1, 0.8], [0.25, 0.71], [0.52, 0.635]]);
const RY = curve1([[0.52, 0.635], [0.8, 0.58], [1.05, 0.525], [1.2, 0.49], [1.3, 0.462]]);
function openW(x) {
  const a = X_BACK, b = X_THROAT;
  if (x <= a || x >= b) return 0;
  let k = 1;
  if (x < a + 0.2) {
    const q = 1 - (x - a) / 0.2;
    k *= Math.sqrt(1 - q * q);
  }
  if (x > b - 0.1) {
    const q = 1 - (b - x) / 0.1;
    k *= Math.sqrt(1 - q * q);
  }
  return OW(x) * k;
}
const openPt = (xe, side, out = V3()) => out.set(xe, OY(xe) + spring(xe), side * openW(xe));

/* ------------------------------------------------------------------ */
/* Outils de géométrie                                                 */
/* ------------------------------------------------------------------ */
function pathBuilder() {
  const pts = [];
  const api = {
    pts,
    line(z0, y0, z1, y1, n, first = false) {
      for (let i = first ? 0 : 1; i <= n; i++) pts.push([lerp(z0, z1, i / n), lerp(y0, y1, i / n)]);
      return api;
    },
    arc(cz, cy, r, a0, a1, n) {
      for (let i = 1; i <= n; i++) {
        const a = lerp(a0, a1, i / n);
        pts.push([cz + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return api;
    },
  };
  return api;
}

// Indices d'une grille (nu+1) x (nv+1), rangée par u puis v.
function gridIndex(nu, nv, offset, flip, out) {
  const row = nv + 1;
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const a = offset + i * row + j, b = a + 1, c = a + row, d = c + 1;
      if (flip) out.push(a, b, c, b, d, c);
      else out.push(a, c, b, b, c, d);
    }
  }
}

// Normale géométrique du premier triangle non dégénéré trouvé près d'une cellule.
function faceNormal(pos, idx, start) {
  const a = V3(), b = V3(), c = V3();
  for (let k = start; k < idx.length; k += 3) {
    a.fromArray(pos, idx[k] * 3);
    b.fromArray(pos, idx[k + 1] * 3);
    c.fromArray(pos, idx[k + 2] * 3);
    const n = b.sub(a).cross(c.sub(a));
    if (n.lengthSq() > 1e-12) return n.normalize();
  }
  return V3(0, 1, 0);
}

function makeGeometry(pos, uv, idx) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Moyenne des normales des sommets confondus (coutures d'une grille refermée sur elle-même).
function weldNormals(g) {
  const p = g.attributes.position, n = g.attributes.normal;
  const map = new Map();
  for (let i = 0; i < p.count; i++) {
    const k = `${Math.round(p.getX(i) * 1e4)}|${Math.round(p.getY(i) * 1e4)}|${Math.round(p.getZ(i) * 1e4)}`;
    let e = map.get(k);
    if (!e) map.set(k, (e = []));
    e.push(i);
  }
  const s = V3();
  for (const list of map.values()) {
    if (list.length < 2) continue;
    s.set(0, 0, 0);
    for (const i of list) s.x += n.getX(i), s.y += n.getY(i), s.z += n.getZ(i);
    s.normalize();
    for (const i of list) n.setXYZ(i, s.x, s.y, s.z);
  }
  n.needsUpdate = true;
}

// Section après section le long du pied (pas resserré au talon et à la pointe).
function loft(sectionFn, nu, { uvV = 'index' } = {}) {
  const pos = [], uv = [], idx = [];
  let K = 0;
  for (let i = 0; i <= nu; i++) {
    const u = (1 - Math.cos((PI * i) / nu)) / 2;
    const x = X0 + u * L;
    const pts = sectionFn(x);
    K = pts.length;
    const ys = spring(x);
    for (let k = 0; k <= K; k++) {
      const p = pts[k % K];
      pos.push(x, p[1] + ys, p[0]);
      uv.push(u, uvV === 'index' ? k / K : 0);
    }
  }
  const row = K + 1;
  for (let i = 0; i < nu; i++) {
    for (let k = 0; k < K; k++) {
      const a = i * row + k, b = a + 1, c = a + row, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  // orientation : la normale du dessous, au milieu, doit pointer vers le bas
  const mid = Math.floor(nu / 2) * K * 6 + 6;
  if (faceNormal(pos, idx, mid).y > 0) for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
  const g = makeGeometry(pos, uv, idx);
  weldNormals(g);
  return g;
}

// Tube de rayon variable le long d'une courbe.
function tube(curve, segs, radial, rFn, closed = false) {
  const frames = curve.computeFrenetFrames(segs, closed);
  const pos = [], uv = [], idx = [];
  const p = V3();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    curve.getPointAt(t, p);
    const r = rFn(t);
    const N = frames.normals[i], B = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * PI * 2;
      const cx = Math.cos(a), sy = Math.sin(a);
      pos.push(p.x + r * (cx * N.x + sy * B.x), p.y + r * (cx * N.y + sy * B.y), p.z + r * (cx * N.z + sy * B.z));
      uv.push(t, j / radial);
    }
  }
  gridIndex(segs, radial, 0, true, idx);
  return makeGeometry(pos, uv, idx);
}

/* ------------------------------------------------------------------ */
/* Tige : surface paramétrée (θ autour du pied, t du bas vers le haut)  */
/* ------------------------------------------------------------------ */
const IN = RIM + 0.004; // la tige sort de l'intérieur du rebord
const XI0 = X0 + IN, XI1 = X1 - IN;

function perim(theta) {
  const th = ((theta % 1) + 1) % 1;
  const lat = th <= 0.5;
  const s = lat ? th * 2 : 2 - th * 2;
  const u = (1 - Math.cos(PI * s)) / 2;
  return { x: XI0 + u * (XI1 - XI0), side: lat ? 1 : -1 };
}
export function thetaAt(x, side) {
  const u = clamp((x - XI0) / (XI1 - XI0));
  const s = Math.acos(1 - 2 * u) / PI;
  return side > 0 ? s / 2 : 1 - s / 2;
}
function basePt(theta, out = V3()) {
  const { x, side } = perim(theta);
  return out.set(x, 0, side * halfW(x, side, IN));
}
function planNormal(theta) {
  const a = basePt(theta - 1e-3), b = basePt(theta + 1e-3);
  const tx = b.x - a.x, tz = b.z - a.z, l = Math.hypot(tx, tz) || 1;
  return V3(-tz / l, 0, tx / l);
}

function column(theta) {
  const { x, side } = perim(theta);
  const ys = spring(x);
  const w = halfW(x, side, IN);
  const B = V3(x, footbed(x) + ys - 0.012, side * w);
  const B1 = V3(x, rimY(x, side) + ys + 0.004, side * w);
  let T, f;
  if (x >= X_THROAT) {
    const xr = Math.min(x, X_RIDGE_END);
    T = V3(xr, RY(xr) + spring(xr), 0);
    f = 1;
  } else {
    const xe = X_BACK + ((x - XI0) / (X_THROAT - XI0)) * (X_THROAT - X_BACK);
    T = openPt(xe, side);
    f = smooth(-1.0, -0.3, xe);
  }
  const n = planNormal(theta);
  const dy = T.y - B1.y;
  const bulge = lerp(0.028, 0.05, f) + 0.035 * smooth(1.0, 1.4, x) + 0.035 * smooth(-1.1, -1.4, x);
  const K1 = V3(B1.x + n.x * bulge, B1.y + dy * 0.45, B1.z + n.z * bulge);
  const dp = V3(B1.x - T.x, 0, B1.z - T.z);
  const hl = dp.length();
  if (hl > 1e-5) dp.divideScalar(hl);
  else dp.copy(n);
  const K2 = V3(0, -dy * 0.42, 0).lerp(dp.multiplyScalar(Math.max(hl, 0.1) * 0.62), f).add(T);
  return { x, side, B, B1, K1, K2, T, f };
}
const T0 = 0.1; // part de la colonne cachée dans le rebord
function colPoint(c, t, out = V3()) {
  if (t <= T0) return out.copy(c.B).lerp(c.B1, t / T0);
  const s = (t - T0) / (1 - T0), r = 1 - s;
  return out.set(0, 0, 0).addScaledVector(c.B1, r * r * r).addScaledVector(c.K1, 3 * r * r * s).addScaledVector(c.K2, 3 * r * s * s).addScaledVector(c.T, s * s * s);
}
const upperPoint = (theta, t, out) => colPoint(column(theta), t, out);
function upperNormal(theta, t) {
  const e = 1e-3;
  const p0 = upperPoint(theta - e, t), p1 = upperPoint(theta + e, t);
  const q0 = upperPoint(theta, clamp(t - e)), q1 = upperPoint(theta, clamp(t + e));
  return p1.sub(p0).cross(q1.sub(q0)).normalize();
}

// longueur d'arc autour du pied (pour dessiner les textures à l'échelle)
const ARC_N = 400;
const ARC = (() => {
  const a = [0];
  const p = V3(), q = V3();
  upperPoint(0, 0.35, p);
  for (let i = 1; i <= ARC_N; i++) {
    upperPoint(i / ARC_N, 0.35, q);
    a.push(a[i - 1] + q.distanceTo(p));
    p.copy(q);
  }
  const total = a[ARC_N];
  return { arr: a.map((v) => v / total), total };
})();
function arcU(theta) {
  const f = clamp(theta) * ARC_N, i = Math.min(ARC_N - 1, Math.floor(f));
  return lerp(ARC.arr[i], ARC.arr[i + 1], f - i);
}

/* ------------------------------------------------------------------ */
/* Textures dessinées                                                  */
/* ------------------------------------------------------------------ */
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
function toTex(c, srgb, repeat) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}
function rng(seed) {
  let s = (seed * 9301 + 49297) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
// Carte de hauteur (canal rouge) -> carte de normales (convention OpenGL de three.js).
function heightToNormal(src, strength, wrap = true) {
  const w = src.width, h = src.height;
  const s = src.getContext('2d').getImageData(0, 0, w, h).data;
  const out = makeCanvas(w, h);
  const ctx = out.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const H = (x, y) => {
    if (wrap) {
      x = (x + w) % w;
      y = (y + h) % h;
    } else {
      x = Math.min(w - 1, Math.max(0, x));
      y = Math.min(h - 1, Math.max(0, y));
    }
    return s[(y * w + x) * 4];
  };
  const k = strength / 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (H(x - 1, y) - H(x + 1, y)) * k, dy = (H(x, y + 1) - H(x, y - 1)) * k;
      const l = Math.sqrt(dx * dx + dy * dy + 1), i = (y * w + x) * 4;
      d[i] = (dx / l) * 127.5 + 127.5;
      d[i + 1] = (dy / l) * 127.5 + 127.5;
      d[i + 2] = (1 / l) * 127.5 + 127.5;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

// Grain de cuir raccordable (hauteur).
function grainTile(size, seed, cell = 7) {
  const c = makeCanvas(size, size), ctx = c.getContext('2d');
  const r = rng(seed);
  ctx.fillStyle = '#6e6e6e';
  ctx.fillRect(0, 0, size, size);
  const n = Math.round((size * size) / (cell * cell * 0.9));
  for (let i = 0; i < n; i++) {
    const x = r() * size, y = r() * size, rad = cell * (0.45 + r() * 0.6);
    const v = 120 + Math.round(r() * 70);
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const cx = x + ox, cy = y + oy;
        if (cx < -rad || cy < -rad || cx > size + rad || cy > size + rad) continue;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, `rgb(${v},${v},${v})`);
        g.addColorStop(0.7, `rgba(${v},${v},${v},0.6)`);
        g.addColorStop(1, 'rgba(90,90,90,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rad, rad * (0.7 + r() * 0.5), r() * PI, 0, PI * 2);
        ctx.fill();
      }
    }
  }
  return c;
}
function noiseTile(size, seed, amp = 60, blur = 0.6) {
  const c = makeCanvas(size, size), ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size), d = img.data, r = rng(seed);
  for (let i = 0; i < d.length; i += 4) {
    const v = 128 + (r() - 0.5) * amp;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  if (blur) {
    const c2 = makeCanvas(size, size), x2 = c2.getContext('2d');
    x2.filter = `blur(${blur}px)`;
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) x2.drawImage(c, ox, oy);
    return c2;
  }
  return c;
}
// Maille « air mesh » (doublure) : alvéoles hexagonales.
function meshTile(size) {
  const c = makeCanvas(size, size), ctx = c.getContext('2d');
  ctx.fillStyle = '#909090';
  ctx.fillRect(0, 0, size, size);
  const s = size / 8, h = s * Math.sqrt(3) / 2;
  ctx.fillStyle = '#2a2a2a';
  for (let row = -1; row <= 10; row++) {
    for (let col = -1; col <= 9; col++) {
      const x = col * s + (row % 2 ? s / 2 : 0), y = row * h;
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.3, s * 0.26, 0, 0, PI * 2);
      ctx.fill();
    }
  }
  return c;
}
// Tresse des lacets : chevrons en diagonale.
function braidTile(size) {
  const c = makeCanvas(size, size), ctx = c.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  const n = 8, step = size / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < 4; j++) {
      const x = i * step, y = (j * size) / 4;
      const g = ctx.createLinearGradient(x, y, x + step, y + size / 4);
      g.addColorStop(0, '#3a3a3a');
      g.addColorStop(0.5, '#d0d0d0');
      g.addColorStop(1, '#3a3a3a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + step, y + size / 8);
      ctx.lineTo(x + step, y + size / 4);
      ctx.lineTo(x, y + size / 8);
      ctx.closePath();
      ctx.fill();
    }
  }
  return c;
}

function crownPath(ctx, cx, cy, w) {
  // couronne à trois pointes (clin d'œil au logo de la marque)
  const h = w * 0.62;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy - h * 0.1);
  ctx.lineTo(cx - w * 0.25, cy + h * 0.12);
  ctx.lineTo(cx, cy - h / 2);
  ctx.lineTo(cx + w * 0.25, cy + h * 0.12);
  ctx.lineTo(cx + w / 2, cy - h * 0.1);
  ctx.lineTo(cx + w / 2, cy + h / 2);
  ctx.closePath();
}

/* ------------------------------------------------------------------ */
/* Coloris                                                             */
/* ------------------------------------------------------------------ */
export const COLORWAYS = {
  blanc: {
    upper: '#f1eee8', suede: '#cbc6bc', eyestay: '#17171a', perf: '#b9b3a9', thread: '#c7c1b6', threadAccent: '#c8102e',
    counter: '#c8102e', toe: '#cbc6bc', badge: '#c8102e', badgeInk: '#fbf7ef', lining: '#9e1320', collar: '#1b1b1e',
    tongue: '#f1eee8', label: '#c8102e', laces: '#f4f1ea', eyelet: '#2b2b2f', midsole: '#f3f0e8', midAccent: '#c8102e',
    outsole: '#1c1c1f', insole: '#141416', insoleInk: '#d8b56a', tab: '#c8102e',
  },
  noir: {
    upper: '#1c1c1e', suede: '#2a2a2d', eyestay: '#0d0d0e', perf: '#0a0a0b', thread: '#3a3a3d', threadAccent: '#c8102e',
    counter: '#111113', toe: '#232326', badge: '#c8102e', badgeInk: '#f5f1ea', lining: '#161618', collar: '#101012',
    tongue: '#1c1c1e', label: '#c8102e', laces: '#141416', eyelet: '#c8102e', midsole: '#1f1f22', midAccent: '#c8102e',
    outsole: '#0e0e10', insole: '#101012', insoleInk: '#c8102e', tab: '#c8102e',
  },
  sable: {
    upper: '#d8c6a4', suede: '#c7ae86', eyestay: '#6b4a2c', perf: '#a8916d', thread: '#efe4cf', threadAccent: '#efe4cf',
    counter: '#8a5a33', toe: '#cdb690', badge: '#6b4a2c', badgeInk: '#f1e6cf', lining: '#6d4a2e', collar: '#5a3d25',
    tongue: '#d8c6a4', label: '#6b4a2c', laces: '#efe6d4', eyelet: '#6b4a2c', midsole: '#efe6d3', midAccent: '#8a5a33',
    outsole: '#a4642c', insole: '#5a3d25', insoleInk: '#efe0bf', tab: '#8a5a33',
  },
  corail: {
    upper: '#cfd2d4', suede: '#f3f3f1', eyestay: '#3b3f45', perf: '#9ea3a8', thread: '#f7f7f5', threadAccent: '#f06449',
    counter: '#f06449', toe: '#f3f3f1', badge: '#f06449', badgeInk: '#ffffff', lining: '#e2553d', collar: '#3b3f45',
    tongue: '#e9eaeb', label: '#f06449', laces: '#f7f7f5', eyelet: '#3b3f45', midsole: '#f6f5f2', midAccent: '#f06449',
    outsole: '#484c52', insole: '#2d3035', insoleInk: '#f06449', tab: '#f06449',
  },
};

/* ------------------------------------------------------------------ */
/* Construction                                                        */
/* ------------------------------------------------------------------ */
export function createSneaker({ quality = 1 } = {}) {
  const hi = quality >= 1;
  const TW = hi ? 4096 : 2048, TH = hi ? 512 : 256; // texture de la tige
  const root = new THREE.Group();
  root.name = 'sneaker';
  const parts = {};
  const disposables = [];
  const keep = (x) => (disposables.push(x), x);

  function part(name, anchor, offset, extra = {}) {
    const g = new THREE.Group();
    g.name = name;
    root.add(g);
    parts[name] = { group: g, anchor, offset, mats: [], ...extra };
    return parts[name];
  }
  function add(p, geo, mat, { dim = true, cast = true, receive = true } = {}) {
    const m = new THREE.Mesh(keep(geo), mat);
    m.castShadow = cast;
    m.receiveShadow = receive;
    p.group.add(m);
    if (dim && !p.mats.includes(mat)) p.mats.push(mat);
    return m;
  }

  // --- tuiles de détail partagées
  const grainH = grainTile(hi ? 512 : 256, 7, hi ? 6 : 3.5);
  const grainN = keep(toTex(heightToNormal(grainH, 2.2), false, [1, 1]));
  const foamN = keep(toTex(heightToNormal(noiseTile(256, 3, 70, 0.8), 1.2), false, [10, 7]));
  const meshN = keep(toTex(heightToNormal(meshTile(128), 3), false, [60, 8]));
  const braidN = keep(toTex(heightToNormal(braidTile(64), 4), false, [60, 1]));

  /* ---------------- tige : textures couleur / rugosité / relief ---------------- */
  const upperColor = makeCanvas(TW, TH);
  const upperRough = makeCanvas(TW, TH);
  const upperHeight = makeCanvas(TW, TH);
  const px = (x, side, t) => [arcU(thetaAt(x, side)) * TW, (1 - t) * TH];
  const unit = TW / ARC.total; // pixels par unité le long du pied

  // zones (en coordonnées x du pied, t de la colonne), dessinées pour chaque côté
  function eyestayPath(ctx, side) {
    ctx.beginPath();
    const xs = [];
    for (let x = -0.56; x <= X_THROAT - 0.01; x += 0.02) xs.push(x);
    const low = (x) => 0.8 - 0.06 * smooth(0.1, X_THROAT, x) + 0.18 * smooth(-0.4, -0.56, x);
    xs.forEach((x, i) => {
      const [a, b] = px(x, side, 1.001);
      i ? ctx.lineTo(a, b) : ctx.moveTo(a, b);
    });
    for (let i = xs.length - 1; i >= 0; i--) {
      const [a, b] = px(xs[i], side, low(xs[i]));
      ctx.lineTo(a, b);
    }
    ctx.closePath();
    return low;
  }
  function saddlePath(ctx, side) {
    // pièce de selle : bande inclinée du laçage vers la semelle
    const top = [[-0.3, 0.8], [0.18, 0.78]], bot = [[0.46, 0.06], [-0.02, 0.06]];
    const [a0, b0] = px(top[0][0], side, top[0][1]);
    const [a1, b1] = px(top[1][0], side, top[1][1]);
    const [a2, b2] = px(bot[0][0], side, bot[0][1]);
    const [a3, b3] = px(bot[1][0], side, bot[1][1]);
    const [m0, n0] = px(0.38, side, 0.45);
    const [m1, n1] = px(-0.2, side, 0.4);
    ctx.beginPath();
    ctx.moveTo(a0, b0);
    ctx.lineTo(a1, b1);
    ctx.quadraticCurveTo(m0, n0, a2, b2);
    ctx.lineTo(a3, b3);
    ctx.quadraticCurveTo(m1, n1, a0, b0);
    ctx.closePath();
  }
  function collarPath(ctx, side) {
    // col rembourré, en haut à l'arrière
    ctx.beginPath();
    const xs = [];
    for (let x = XI0; x <= -0.52; x += 0.02) xs.push(x);
    xs.forEach((x, i) => {
      const [a, b] = px(x, side, 1.001);
      i ? ctx.lineTo(a, b) : ctx.moveTo(a, b);
    });
    for (let i = xs.length - 1; i >= 0; i--) {
      const x = xs[i];
      const t = 0.8 + 0.2 * smooth(-0.7, -0.52, x);
      const [a, b] = px(x, side, t);
      ctx.lineTo(a, b);
    }
    ctx.closePath();
  }
  function stitch(ctx, pts, color, width, dash, layer) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.beginPath();
    pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)));
    if (layer === 'height') {
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = width * 2.4;
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
    } else if (layer === 'rough') {
      ctx.strokeStyle = '#d0d0d0';
    } else ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash([dash, dash * 0.7]);
    ctx.stroke();
    ctx.restore();
  }
  function edgePts(fnPts, n) {
    const out = [];
    for (let i = 0; i <= n; i++) out.push(fnPts(i / n));
    return out;
  }

  function drawUpper(cw, layer) {
    const ctx = (layer === 'color' ? upperColor : layer === 'rough' ? upperRough : upperHeight).getContext('2d');
    const W = TW, H = TH;
    const fill = (c) => {
      ctx.fillStyle = c;
    };
    // base
    if (layer === 'height') {
      ctx.fillStyle = ctx.createPattern(grainH, 'repeat');
      ctx.fillRect(0, 0, W, H);
    } else {
      fill(layer === 'color' ? cw.upper : '#8c8c8c');
      ctx.fillRect(0, 0, W, H);
    }
    const ao = () => {
      if (layer !== 'color') return;
      // ombre de contact au ras de la semelle
      const g = ctx.createLinearGradient(0, H, 0, H * 0.72);
      g.addColorStop(0, 'rgba(0,0,0,0.38)');
      g.addColorStop(0.35, 'rgba(0,0,0,0.12)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
    };
    const sw = Math.max(1.2, unit * 0.0065); // épaisseur du fil
    const dash = unit * 0.022;
    for (const side of [1, -1]) {
      // perforations du bout
      const r = rng(side > 0 ? 11 : 12);
      for (let x = 0.74; x <= 1.24; x += 0.042) {
        for (let t = 0.6, row = 0; t <= 0.985; t += 0.055, row++) {
          const xx = x + (row % 2 ? 0.021 : 0);
          if (xx > 1.24) continue;
          const [a, b] = px(xx, side, t);
          const rad = unit * 0.0085 * (0.9 + r() * 0.2);
          ctx.beginPath();
          ctx.arc(a, b, rad, 0, PI * 2);
          fill(layer === 'color' ? cw.perf : layer === 'rough' ? '#ffffff' : '#101010');
          ctx.fill();
        }
      }
      // col
      collarPath(ctx, side);
      if (layer === 'height') {
        ctx.save();
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      } else {
        fill(layer === 'color' ? cw.upper : '#909090');
        ctx.fill();
      }
      // selle
      saddlePath(ctx, side);
      if (layer === 'height') {
        ctx.save();
        ctx.clip();
        ctx.fillStyle = ctx.createPattern(noiseTile(128, 5, 40, 0.5), 'repeat');
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        saddlePath(ctx, side);
        ctx.strokeStyle = 'rgba(40,40,40,0.9)';
        ctx.lineWidth = sw * 1.4;
        ctx.stroke();
      } else {
        fill(layer === 'color' ? cw.suede : '#f0f0f0');
        ctx.fill();
      }
      // oeillets : renfort de laçage
      const low = eyestayPath(ctx, side);
      if (layer === 'height') {
        ctx.save();
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        eyestayPath(ctx, side);
        ctx.strokeStyle = 'rgba(30,30,30,0.9)';
        ctx.lineWidth = sw * 1.4;
        ctx.stroke();
      } else {
        fill(layer === 'color' ? cw.eyestay : '#707070');
        ctx.fill();
      }
      // piqûres
      const col = cw.thread;
      stitch(ctx, edgePts((s) => px(lerp(-0.5, X_THROAT - 0.03, s), side, low(lerp(-0.5, X_THROAT - 0.03, s)) + 0.035), 60), cw.threadAccent, sw, dash, layer);
      stitch(ctx, edgePts((s) => px(lerp(XI0 + 0.02, -0.58, s), side, 0.93), 50), col, sw, dash, layer);
      stitch(ctx, edgePts((s) => px(lerp(-0.27, 0.16, s), side, 0.74), 30), col, sw, dash, layer);
      stitch(ctx, edgePts((s) => px(lerp(0.0, 0.44, s), side, 0.1), 30), col, sw, dash, layer);
      // double piqûre de la selle (côtés inclinés)
      const [a0, b0] = px(0.18, side, 0.78), [a2, b2] = px(0.46, side, 0.06), [m0, n0] = px(0.38, side, 0.45);
      const [a1, b1] = px(-0.3, side, 0.8), [a3, b3] = px(-0.02, side, 0.06), [m1, n1] = px(-0.2, side, 0.4);
      const q = (p0, p1, p2, s, inset) => [(1 - s) * (1 - s) * p0[0] + 2 * s * (1 - s) * p1[0] + s * s * p2[0] - inset, (1 - s) * (1 - s) * p0[1] + 2 * s * (1 - s) * p1[1] + s * s * p2[1]];
      const off = unit * 0.02 * (side > 0 ? 1 : -1);
      stitch(ctx, edgePts((s) => q([a0, b0], [m0, n0], [a2, b2], s, off), 40), col, sw, dash, layer);
      stitch(ctx, edgePts((s) => q([a1, b1], [m1, n1], [a3, b3], s, -off), 40), col, sw, dash, layer);
      if (side < 0) ao();
      // marquage latéral discret : TLEMCENI sur le col intérieur
      if (side < 0 && layer !== 'rough') {
        const [a, b] = px(-0.95, side, 0.6);
        ctx.save();
        ctx.translate(a, b);
        ctx.scale(-1, 1);
        ctx.font = `700 ${Math.round(unit * 0.05)}px Archivo, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = layer === 'color' ? cw.perf : '#9a9a9a';
        ctx.fillText('TLEMCENI · 13', 0, 0);
        ctx.restore();
      }
    }
  }

  drawUpper(COLORWAYS.blanc, 'height');
  drawUpper(COLORWAYS.blanc, 'rough');
  const upperMap = keep(toTex(upperColor, true));
  const upperNormalT = keep(toTex(heightToNormal(upperHeight, 2.4, false), false));
  const upperRoughT = keep(toTex(upperRough, false));

  const matUpper = new THREE.MeshPhysicalMaterial({
    map: upperMap, normalMap: upperNormalT, normalScale: new THREE.Vector2(0.9, 0.9), roughnessMap: upperRoughT, roughness: 0.78,
    clearcoat: 0.12, clearcoatRoughness: 0.55, sheen: 0.25, sheenRoughness: 0.8,
  });
  const matLining = new THREE.MeshPhysicalMaterial({ color: '#9e1320', normalMap: meshN, roughness: 0.85, sheen: 1, sheenRoughness: 0.5, side: THREE.DoubleSide });
  const matCollar = new THREE.MeshPhysicalMaterial({ color: '#1b1b1e', normalMap: meshN, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.8, sheen: 0.8, sheenRoughness: 0.6 });
  const matEyelet = new THREE.MeshStandardMaterial({ color: '#2b2b2f', metalness: 0.9, roughness: 0.32 });
  const matTab = new THREE.MeshPhysicalMaterial({ color: '#c8102e', roughness: 0.6, sheen: 0.6 });
  const matLaces = new THREE.MeshPhysicalMaterial({ color: '#f4f1ea', normalMap: braidN, normalScale: new THREE.Vector2(0.8, 0.8), roughness: 0.8, sheen: 0.7, sheenRoughness: 0.6 });

  /* ---------------- tige ---------------- */
  const pUpper = part('upper', V3(-0.35, 0.62, 0.36), V3(0, 0, 0));
  {
    const NT = hi ? 220 : 150, NV = hi ? 40 : 28;
    const cols = [];
    for (let j = 0; j <= NT; j++) cols.push(column(j / NT));
    const pos = [], uv = [], idx = [];
    const p = V3();
    for (let j = 0; j <= NT; j++) {
      const U = j === NT ? 1 : arcU(j / NT);
      for (let k = 0; k <= NV; k++) {
        const t = k / NV;
        colPoint(cols[j], t, p);
        pos.push(p.x, p.y, p.z);
        uv.push(U, t);
      }
    }
    gridIndex(NT, NV, 0, false, idx);
    // orientation : côté latéral (z > 0) vers l'extérieur
    const test = Math.round(NT * 0.2) * NV * 6 + Math.round(NV * 0.5) * 6;
    if (faceNormal(pos, idx, test).z < 0) for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
    const g = makeGeometry(pos, uv, idx);
    weldNormals(g);
    add(pUpper, g, matUpper);
    // doublure : même surface, légèrement à l'intérieur
    const lg = g.clone();
    const lp = lg.attributes.position, ln = lg.attributes.normal;
    for (let i = 0; i < lp.count; i++) lp.setXYZ(i, lp.getX(i) - ln.getX(i) * 0.014, lp.getY(i) - ln.getY(i) * 0.014, lp.getZ(i) - ln.getZ(i) * 0.014);
    lg.computeVertexNormals();
    weldNormals(lg);
    const lining = add(pUpper, lg, matLining, { dim: false });
    lining.name = 'lining';
    pUpper.lining = lining;
    // col rembourré le long de l'ouverture
    const pts = [];
    const n = 90;
    for (let i = 0; i <= n; i++) {
      const phi = i / n;
      const side = phi < 0.5 ? 1 : -1;
      const s = phi < 0.5 ? phi * 2 : (1 - phi) * 2; // 0 à la gorge, 1 au talon
      const u = (1 - Math.cos(PI * (1 - s))) / 2; // resserré aux deux bouts
      const xe = X_THROAT - 0.012 + u * (X_BACK - X_THROAT + 0.012);
      pts.push(openPt(xe, side));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const rAt = (t) => {
      const p2 = curve.getPointAt(t);
      return 0.012 + 0.034 * smooth(-0.25, -0.75, p2.x);
    };
    const cg = tube(curve, hi ? 260 : 160, hi ? 14 : 10, rAt);
    // on descend légèrement le bourrelet pour qu'il chevauche le bord
    const cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) cp.setY(i, cp.getY(i) - 0.008);
    cg.computeVertexNormals();
    add(pUpper, cg, matCollar, { dim: false });
    pUpper.collarMat = matCollar;
    // tirette du talon
    const shape = new THREE.Shape();
    const rr = (s, w, h, r) => {
      s.moveTo(-w / 2 + r, -h / 2);
      s.lineTo(w / 2 - r, -h / 2);
      s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      s.lineTo(w / 2, h / 2 - r);
      s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      s.lineTo(-w / 2 + r, h / 2);
      s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      s.lineTo(-w / 2, -h / 2 + r);
      s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      return s;
    };
    rr(shape, 0.13, 0.22, 0.04);
    const hole = new THREE.Path();
    rr(hole, 0.07, 0.07, 0.025);
    hole.curves.forEach((c) => {
      if (c.v0) c.v0.y += 0.04;
      if (c.v1) c.v1.y += 0.04;
      if (c.v2) c.v2.y += 0.04;
    });
    shape.holes.push(hole);
    const tg = new THREE.ExtrudeGeometry(shape, { depth: 0.014, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2, curveSegments: 8 });
    const tab = add(pUpper, tg, matTab, { dim: false });
    const top = openPt(X_BACK, 1);
    tab.position.set(top.x - 0.045, top.y - 0.02, 0);
    tab.rotation.set(0, -PI / 2, 0);
    tab.rotateX(-0.22);
    pUpper.tabMat = matTab;
  }

  /* ---------------- oeillets & lacets ---------------- */
  const EYE = 6;
  const eyelets = { 1: [], [-1]: [] };
  for (const side of [1, -1]) {
    for (let i = 0; i < EYE; i++) {
      const x = lerp(0.38, -0.34, i / (EYE - 1));
      const th = thetaAt(x, side);
      const T = upperPoint(th, 1);
      let t = 1, p = V3();
      while (t > 0.5) {
        upperPoint(th, t, p);
        if (p.distanceTo(T) >= 0.058) break;
        t -= 0.005;
      }
      const n = upperNormal(th, t);
      eyelets[side].push({ p: p.clone(), n, t, x });
    }
  }
  {
    const tg = new THREE.TorusGeometry(0.02, 0.0065, 8, hi ? 20 : 14);
    const m = new THREE.InstancedMesh(keep(tg), matEyelet, EYE * 2);
    const o = new THREE.Object3D();
    let k = 0;
    for (const side of [1, -1]) {
      for (const e of eyelets[side]) {
        o.position.copy(e.p).addScaledVector(e.n, 0.004);
        o.quaternion.setFromUnitVectors(V3(0, 0, 1), e.n);
        o.updateMatrix();
        m.setMatrixAt(k++, o.matrix);
      }
    }
    m.castShadow = true;
    pUpper.group.add(m);
    pUpper.eyeletMat = matEyelet;
  }

  const pLaces = part('laces', V3(-0.5, 1.02, 0.1), V3(0, 0.95, 0));
  {
    const R = 0.0165;
    const lift = (e, h) => e.p.clone().addScaledVector(e.n, h);
    const topAt = (x) => OY(clamp(x, -0.9, X_THROAT)) + spring(x) + 0.05;
    const segs = [];
    const L0 = eyelets[1], M0 = eyelets[-1];
    // barre du bas
    segs.push([lift(L0[0], 0.008), lift(L0[0], 0.02), V3(L0[0].x, topAt(L0[0].x) - 0.005, 0), lift(M0[0], 0.02), lift(M0[0], 0.008)]);
    for (let i = 0; i < EYE - 1; i++) {
      const up = i % 2 ? 0.03 : 0;
      const xm = (L0[i].x + L0[i + 1].x) / 2;
      segs.push([lift(L0[i], 0.008), lift(L0[i], 0.022), V3(xm, topAt(xm) + up, 0), lift(M0[i + 1], 0.022), lift(M0[i + 1], 0.008)]);
      segs.push([lift(M0[i], 0.008), lift(M0[i], 0.022), V3(xm, topAt(xm) + 0.03 - up, 0), lift(L0[i + 1], 0.022), lift(L0[i + 1], 0.008)]);
    }
    // noeud et boucles
    const last = EYE - 1;
    const kx = L0[last].x - 0.03;
    const knot = V3(kx, topAt(kx) + 0.035, 0);
    segs.push([lift(L0[last], 0.008), lift(L0[last], 0.025), knot.clone().add(V3(0.01, -0.01, 0.03)), knot]);
    segs.push([lift(M0[last], 0.008), lift(M0[last], 0.025), knot.clone().add(V3(0.01, -0.01, -0.03)), knot]);
    const K = (dx, dy, dz) => knot.clone().add(V3(dx, dy, dz));
    // boucles (vers l'avant et sur les côtés)
    segs.push([knot, K(0.05, 0.03, 0.08), K(0.2, 0.05, 0.2), K(0.3, 0.0, 0.14), K(0.16, 0.0, 0.03), K(0.02, 0.0, 0.0)]);
    segs.push([knot, K(0.04, 0.035, -0.07), K(0.18, 0.06, -0.19), K(0.28, 0.01, -0.15), K(0.15, 0.0, -0.03), K(0.02, 0.0, 0.0)]);
    // brins qui retombent
    segs.push([knot, K(0.02, 0.0, 0.07), K(0.0, -0.06, 0.2), K(-0.04, -0.16, 0.33), K(-0.02, -0.28, 0.4)]);
    segs.push([knot, K(0.03, 0.0, -0.06), K(0.06, -0.05, -0.19), K(0.08, -0.14, -0.31), K(0.12, -0.24, -0.37)]);
    for (const s of segs) {
      const c = new THREE.CatmullRomCurve3(s, false, 'centripetal');
      const n = Math.max(12, Math.round(c.getLength() * (hi ? 90 : 60)));
      const g = tube(c, n, hi ? 8 : 6, () => R);
      g.attributes.uv.array.forEach((v, i, a) => {
        if (i % 2 === 0) a[i] = v * c.getLength() * 12;
      });
      add(pLaces, g, matLaces);
    }
    // embouts
    const aglet = new THREE.CylinderGeometry(R * 1.05, R * 1.05, 0.06, 10);
    const matAglet = new THREE.MeshStandardMaterial({ color: '#d7d3cb', roughness: 0.3, metalness: 0.1 });
    for (const s of [segs[segs.length - 2], segs[segs.length - 1]]) {
      const a = s[s.length - 1], b = s[s.length - 2];
      const m = add(pLaces, aglet.clone(), matAglet);
      m.position.copy(a);
      m.quaternion.setFromUnitVectors(V3(0, 1, 0), a.clone().sub(b).normalize());
    }
    pLaces.agletMat = matAglet;
  }

  /* ---------------- coussins : languette & semelle intérieure ---------------- */
  // Surface médiane + épaisseur qui s'annule sur les bords : forme « coussin » fermée.
  function pillow(mid, na, nb, thick, uvFn) {
    const pos = [], uv = [], idx = [];
    const P = [], N = [];
    const e = 1e-3;
    for (let i = 0; i <= na; i++) {
      for (let j = 0; j <= nb; j++) {
        const a = i / na, b = j / nb;
        const p = mid(a, b);
        const du = mid(Math.min(1, a + e), b).sub(mid(Math.max(0, a - e), b));
        const dv = mid(a, Math.min(1, b + e)).sub(mid(a, Math.max(0, b - e)));
        let n = du.cross(dv);
        if (n.lengthSq() < 1e-14) n = V3(0, 1, 0);
        n.normalize();
        if (n.y < 0) n.negate();
        P.push(p);
        N.push(n);
      }
    }
    for (const sgn of [1, -1]) {
      for (let i = 0; i <= na; i++) {
        for (let j = 0; j <= nb; j++) {
          const k = i * (nb + 1) + j, a = i / na, b = j / nb;
          const h = thick(a, b) * sgn;
          pos.push(P[k].x + N[k].x * h, P[k].y + N[k].y * h, P[k].z + N[k].z * h);
          const [u, v] = uvFn(a, b);
          uv.push(u, v);
        }
      }
    }
    gridIndex(na, nb, 0, false, idx);
    gridIndex(na, nb, (na + 1) * (nb + 1), true, idx);
    // la face du dessus doit regarder vers le haut
    const c = Math.floor(na / 2) * nb * 6 + Math.floor(nb / 2) * 6;
    if (faceNormal(pos, idx, c).y < 0) for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
    return makeGeometry(pos, uv, idx);
  }

  // --- languette
  const tongueColor = makeCanvas(512, 1024);
  const matTongue = new THREE.MeshPhysicalMaterial({ map: keep(toTex(tongueColor, true)), normalMap: grainN, roughness: 0.75, sheen: 0.4, sheenRoughness: 0.7 });
  const pTongue = part('tongue', V3(-0.47, 0.99, 0), V3(-0.12, 0.55, 0));
  const tongueCurve = new THREE.CatmullRomCurve3([
    V3(0.72, RY(0.72) + spring(0.72) - 0.05, 0),
    V3(0.45, OY(0.45) + spring(0.45) - 0.012, 0),
    V3(0.1, OY(0.1) + spring(0.1) - 0.004, 0),
    V3(-0.26, OY(-0.26) + 0.004, 0),
    V3(-0.42, 0.915, 0),
    V3(-0.52, 1.0, 0),
  ], false, 'centripetal');
  const tongueLen = tongueCurve.getLength();
  {
    const width = (a) => {
      const s = a * tongueLen;
      let w = lerp(0.17, 0.235, smooth(0, 0.35, a));
      const rEnd = 0.19;
      if (s > tongueLen - rEnd) {
        const q = 1 - (tongueLen - s) / rEnd;
        w *= Math.sqrt(Math.max(0, 1 - q * q));
      }
      return w;
    };
    const mid = (a, b) => {
      const c = tongueCurve.getPointAt(a);
      const bb = b * 2 - 1;
      const w = width(a);
      const drop = lerp(0.075, 0.05, smooth(0.6, 1, a));
      return V3(c.x, c.y - drop * bb * bb * (w / 0.235), bb * w);
    };
    const thick = (a, b) => {
      const bb = Math.abs(b * 2 - 1);
      const prof = Math.pow(Math.max(0, 1 - Math.pow(bb, 3)), 0.5);
      return (0.012 + 0.018 * smooth(0.55, 0.95, a)) * prof * (a >= 0.999 ? 0 : 1);
    };
    const g = pillow(mid, hi ? 60 : 40, hi ? 24 : 16, thick, (a, b) => [b, a]);
    add(pTongue, g, matTongue);
  }

  // --- semelle intérieure (anatomique, amovible)
  const insoleColor = makeCanvas(1024, 384);
  const matInsole = new THREE.MeshPhysicalMaterial({ map: keep(toTex(insoleColor, true)), normalMap: foamN, normalScale: new THREE.Vector2(0.4, 0.4), roughness: 0.92, sheen: 0.5, sheenRoughness: 0.7 });
  const pInsole = part('insole', V3(-0.9, 0.42, 0), V3(0, -0.48, 0));
  {
    const ins = IN + 0.004;
    const mid = (a, b) => {
      const u = (1 - Math.cos(PI * a)) / 2;
      const x = XI0 + 0.004 + u * (XI1 - XI0 - 0.008);
      const wl = halfW(x, 1, ins), wm = halfW(x, -1, ins);
      const z = lerp(-wm, wl, b);
      const bb = b * 2 - 1;
      const arch = 0.055 * Math.exp(-(((x + 0.2) / 0.38) ** 2)) * smooth(0.1, -0.9, bb); // voûte, côté intérieur
      const cup = 0.03 * smooth(-0.5, -1.35, x) * bb * bb; // cuvette du talon
      return V3(x, footbed(x) + spring(x) + 0.013 + arch + cup, z);
    };
    const thick = (a, b) => {
      const bb = Math.abs(b * 2 - 1);
      const aa = Math.abs(a * 2 - 1);
      return 0.012 * Math.pow(Math.max(0, 1 - Math.pow(bb, 4)), 0.5) * Math.pow(Math.max(0, 1 - Math.pow(aa, 8)), 0.5);
    };
    const g = pillow(mid, hi ? 90 : 60, hi ? 24 : 16, thick, (a, b) => [(1 - Math.cos(PI * a)) / 2, b]);
    add(pInsole, g, matInsole);
  }

  /* ---------------- semelles ---------------- */
  const midColor = makeCanvas(1024, 256);
  const matMid = new THREE.MeshPhysicalMaterial({ map: keep(toTex(midColor, true)), normalMap: foamN, normalScale: new THREE.Vector2(0.35, 0.35), roughness: 0.72, sheen: 0.2 });
  const pMid = part('midsole', V3(-0.95, 0.26, 0.37), V3(0, -0.92, 0));
  let midMarks;
  {
    const K = [];
    const sect = (x) => {
      const wl = halfW(x, 1), wm = halfW(x, -1);
      const yb = bevel(x) + OUT_T, yf = footbed(x), rl = rimY(x, 1), rm = rimY(x, -1);
      const tl = Math.min(RIM, wl * 0.45), tm = Math.min(RIM, wm * 0.45);
      const rbl = Math.min(0.03, wl * 0.5), rbm = Math.min(0.03, wm * 0.5);
      const rfl = Math.min(0.014, (wl - tl) * 0.5), rfm = Math.min(0.014, (wm - tm) * 0.5);
      const P = pathBuilder();
      P.line(0, yb, wl - rbl, yb, 6, true);
      P.arc(wl - rbl, yb + rbl, rbl, -PI / 2, 0, 4);
      K[0] = P.pts.length;
      P.line(wl, yb + rbl, wl, rl - tl / 2, 8);
      K[1] = P.pts.length;
      P.arc(wl - tl / 2, rl - tl / 2, tl / 2, 0, PI, 7);
      P.line(wl - tl, rl - tl / 2, wl - tl, yf + rfl, 3);
      P.arc(wl - tl - rfl, yf + rfl, rfl, 0, -PI / 2, 3);
      P.line(wl - tl - rfl, yf, -(wm - tm - rfm), yf, 12);
      P.arc(-(wm - tm - rfm), yf + rfm, rfm, -PI / 2, -PI, 3);
      P.line(-(wm - tm), yf + rfm, -(wm - tm), rm - tm / 2, 3);
      P.arc(-(wm - tm / 2), rm - tm / 2, tm / 2, 0, PI, 7);
      K[2] = P.pts.length;
      P.line(-wm, rm - tm / 2, -wm, yb + rbm, 8);
      K[3] = P.pts.length;
      P.arc(-(wm - rbm), yb + rbm, rbm, PI, 1.5 * PI, 4);
      P.line(-(wm - rbm), yb, 0, yb, 6);
      P.pts.pop();
      K[4] = P.pts.length;
      return P.pts;
    };
    const g = loft(sect, hi ? 140 : 90);
    midMarks = K.map((k) => k / K[4]);
    add(pMid, g, matMid);
  }

  const outColor = makeCanvas(2048, 848);
  const matOut = new THREE.MeshPhysicalMaterial({ map: keep(toTex(outColor, true)), roughness: 0.9 });
  const pOut = part('outsole', V3(0.1, 0.0, 0), V3(0, -1.36, 0), { flip: -1.15 });
  {
    const sect = (x) => {
      const wl = halfW(x, 1) * 1.012, wm = halfW(x, -1) * 1.012;
      const yb = bevel(x), yt = yb + OUT_T;
      const rbl = Math.min(0.022, wl * 0.5), rbm = Math.min(0.022, wm * 0.5);
      const rtl = Math.min(0.008, wl * 0.3), rtm = Math.min(0.008, wm * 0.3);
      const P = pathBuilder();
      P.line(0, yb, wl - rbl, yb, 8, true)
        .arc(wl - rbl, yb + rbl, rbl, -PI / 2, 0, 4)
        .line(wl, yb + rbl, wl, yt - rtl, 3)
        .arc(wl - rtl, yt - rtl, rtl, 0, PI / 2, 2)
        .line(wl - rtl, yt, -(wm - rtm), yt, 10)
        .arc(-(wm - rtm), yt - rtm, rtm, PI / 2, PI, 2)
        .line(-wm, yt - rtm, -wm, yb + rbm, 3)
        .arc(-(wm - rbm), yb + rbm, rbm, PI, 1.5 * PI, 4)
        .line(-(wm - rbm), yb, 0, yb, 8);
      P.pts.pop();
      return P.pts;
    };
    const g = loft(sect, hi ? 140 : 90, { uvV: 'none' });
    // projection à plat (vue de dessous) pour la gravure de la semelle
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - X0) / L, (p.getZ(i) + 0.6) / 1.2);
    const o = add(pOut, g, matOut);
    o.name = 'outsole';
    // la semelle pivote autour de son centre quand on la retourne
    pOut.pivot = V3(0, 0.03, 0);
  }

  /* ---------------- renforts (coques posées sur la tige) ---------------- */
  // fn(a, b) -> { theta, t } ; b = 0 en bas, 1 en haut. Coque d'épaisseur t1 - t0.
  function shell(fn, na, nb, t0, t1, uvFn, edges = [true, true, true, true]) {
    const S = [], N = [];
    for (let i = 0; i <= na; i++) {
      for (let j = 0; j <= nb; j++) {
        const { theta, t } = fn(i / na, j / nb);
        S.push(upperPoint(theta, t));
        N.push(upperNormal(theta, t));
      }
    }
    const pos = [], uv = [], idx = [];
    const row = nb + 1, cnt = (na + 1) * row;
    for (const off of [t1, t0]) {
      for (let k = 0; k < cnt; k++) {
        pos.push(S[k].x + N[k].x * off, S[k].y + N[k].y * off, S[k].z + N[k].z * off);
        const i = Math.floor(k / row), j = k % row;
        const [u, v] = uvFn(i / na, j / nb);
        uv.push(u, v);
      }
    }
    gridIndex(na, nb, 0, false, idx);
    const outerTest = Math.floor(na / 2) * nb * 6 + Math.floor(nb / 2) * 6;
    const kc = Math.floor(na / 2) * row + Math.floor(nb / 2);
    const flipOuter = faceNormal(pos, idx, outerTest).dot(N[kc]) < 0;
    if (flipOuter) for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
    gridIndex(na, nb, cnt, !flipOuter, idx);
    // bords : bandes entre la face externe et la face interne
    const strip = (list) => {
      const base = pos.length / 3;
      for (const k of list) {
        pos.push(S[k].x + N[k].x * t1, S[k].y + N[k].y * t1, S[k].z + N[k].z * t1);
        pos.push(S[k].x + N[k].x * t0, S[k].y + N[k].y * t0, S[k].z + N[k].z * t0);
        uv.push(0, 0, 0, 0);
      }
      const start = idx.length;
      for (let q = 0; q < list.length - 1; q++) {
        const a = base + q * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      // orientation : vers l'extérieur de la pièce
      const mid = list[Math.floor(list.length / 2)];
      const fnrm = faceNormal(pos, idx, start + Math.floor((list.length - 1) / 2) * 6);
      const ctr = S[kc];
      const out = S[mid].clone().sub(ctr);
      if (fnrm.dot(out) < 0) for (let t = start; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
    };
    const at = (i, j) => i * row + j;
    if (edges[0]) strip(Array.from({ length: na + 1 }, (_, i) => at(i, 0)));
    if (edges[1]) strip(Array.from({ length: na + 1 }, (_, i) => at(i, nb)));
    if (edges[2]) strip(Array.from({ length: nb + 1 }, (_, j) => at(0, j)));
    if (edges[3]) strip(Array.from({ length: nb + 1 }, (_, j) => at(na, j)));
    return makeGeometry(pos, uv, idx);
  }

  // --- contrefort de talon
  const counterColor = makeCanvas(1024, 256);
  const counterHeight = makeCanvas(1024, 256);
  const matCounter = new THREE.MeshPhysicalMaterial({ map: keep(toTex(counterColor, true)), normalMap: keep(toTex(heightToNormal(drawCounterHeight(), 2.5, false), false)), roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35 });
  const pHeel = part('heel', V3(-1.52, 0.66, 0), V3(-0.55, 0.06, 0));
  const TH_H = thetaAt(-0.78, 1); // étendue du contrefort de chaque côté
  const heelFn = (a, b) => {
    const s = a * 2 - 1; // -1 intérieur, 1 extérieur
    const theta = s * TH_H;
    const e = 1 - Math.abs(s);
    const top = 0.18 + 0.62 * Math.pow(Math.sin((PI / 2) * Math.min(1, e / 0.95)), 0.8) - 0.06 * Math.abs(s);
    const bot = 0.02;
    return { theta, t: lerp(bot, Math.max(bot + 0.02, top), b) };
  };
  add(pHeel, shell(heelFn, hi ? 90 : 60, hi ? 18 : 12, 0.004, 0.026, (a, b) => [a, b]), matCounter);
  function drawCounterHeight() {
    const c = counterHeight, ctx = c.getContext('2d');
    ctx.fillStyle = ctx.createPattern(grainH, 'repeat');
    ctx.fillRect(0, 0, c.width, c.height);
    // piqûre le long du bord haut
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, c.height * 0.1);
    ctx.lineTo(c.width, c.height * 0.1);
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([10, 7]);
    ctx.stroke();
    ctx.restore();
    // 13 en relief au centre du talon
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.round(c.height * 0.36)}px Archivo, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(c.width / 2, c.height * 0.5);
    ctx.scale(0.75, 1);
    ctx.fillText('13', 0, 0);
    ctx.restore();
    crownPath(ctx, c.width / 2, c.height * 0.22, c.height * 0.12);
    ctx.fill();
    return c;
  }
  function drawCounterColor(cw) {
    const c = counterColor, ctx = c.getContext('2d');
    ctx.fillStyle = cw.counter;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.strokeStyle = cw.thread;
    ctx.lineWidth = 2.2;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.moveTo(0, c.height * 0.1);
    ctx.lineTo(c.width, c.height * 0.1);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.font = `800 ${Math.round(c.height * 0.36)}px Archivo, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(c.width / 2, c.height * 0.5);
    ctx.scale(0.75, 1);
    ctx.fillText('13', 0, 0);
    ctx.restore();
    crownPath(ctx, c.width / 2, c.height * 0.22, c.height * 0.12);
    ctx.fill();
    // TLEMCENI sur le côté extérieur
    ctx.save();
    ctx.translate(c.width * 0.8, c.height * 0.52);
    ctx.fillStyle = cw.badgeInk;
    ctx.globalAlpha = 0.9;
    ctx.font = `700 ${Math.round(c.height * 0.1)}px Archivo, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('TLEMCENI', 0, 0);
    ctx.restore();
  }

  // --- bout renforcé (pare-pierre)
  const toeColor = makeCanvas(1024, 256);
  const matToe = new THREE.MeshPhysicalMaterial({ map: keep(toTex(toeColor, true)), normalMap: grainN, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 0.6, clearcoat: 0.15, clearcoatRoughness: 0.5 });
  const pToe = part('toe', V3(1.56, 0.36, 0), V3(0.52, 0.02, 0));
  const TH_T = 0.5 - thetaAt(0.78, 1);
  const toeFn = (a, b) => {
    const s = a * 2 - 1;
    const theta = 0.5 + s * TH_T;
    const e = 1 - Math.abs(s);
    const top = 0.14 + 0.3 * Math.pow(Math.sin((PI / 2) * Math.min(1, e / 0.9)), 1.2);
    return { theta, t: lerp(0.02, top, b) };
  };
  add(pToe, shell(toeFn, hi ? 80 : 50, hi ? 12 : 8, 0.004, 0.02, (a, b) => [a, b]), matToe);
  function drawToe(cw) {
    const c = toeColor, ctx = c.getContext('2d');
    ctx.fillStyle = cw.toe;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.strokeStyle = cw.thread;
    ctx.lineWidth = 2.2;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.moveTo(0, c.height * 0.12);
    ctx.lineTo(c.width, c.height * 0.12);
    ctx.stroke();
    ctx.restore();
  }

  // --- badge « 13 » (côté extérieur)
  const badgeColor = makeCanvas(512, 512);
  const badgeHeight = makeCanvas(256, 256);
  const matBadge = new THREE.MeshPhysicalMaterial({ map: keep(toTex(badgeColor, true)), roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const pBadge = part('badge', V3(-0.62, 0.62, 0.47), V3(0.05, 0.12, 0.55));
  {
    const thC = thetaAt(-0.62, 1), tC = 0.47;
    const pc = upperPoint(thC, tC);
    const dth = (0.13 / upperPoint(thC + 0.01, tC).distanceTo(pc)) * 0.01;
    const dt = (0.13 / upperPoint(thC, tC + 0.02).distanceTo(pc)) * 0.02;
    const fn = (a, b) => ({ theta: thC + Math.cos(a * PI * 2) * b * dth, t: tC + Math.sin(a * PI * 2) * b * dt });
    const uvFn = (a, b) => [0.5 + 0.5 * b * Math.cos(a * PI * 2), 0.5 + 0.5 * b * Math.sin(a * PI * 2)];
    const g = shell(fn, hi ? 48 : 32, hi ? 10 : 6, 0.006, 0.03, uvFn, [false, true, false, false]);
    add(pBadge, g, matBadge);
    const ctx = badgeHeight.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 256, 256);
    matBadge.normalMap = keep(toTex(heightToNormal(drawBadge(badgeHeight, { badge: '#000', badgeInk: '#fff' }, true), 3, false), false));
  }
  function drawBadge(c, cw, height = false) {
    const ctx = c.getContext('2d'), s = c.width;
    ctx.fillStyle = cw.badge;
    ctx.fillRect(0, 0, s, s);
    // le badge est vu depuis l'extérieur : texte dans le bon sens côté latéral
    ctx.save();
    ctx.translate(s / 2, s / 2);
    ctx.scale(1, -1);
    ctx.rotate(0);
    ctx.strokeStyle = cw.badgeInk;
    ctx.lineWidth = s * 0.03;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.4, 0, PI * 2);
    ctx.stroke();
    ctx.fillStyle = cw.badgeInk;
    ctx.font = `800 ${Math.round(s * 0.36)}px Archivo, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.scale(-1, 1);
    ctx.scale(-1, -1);
    ctx.save();
    ctx.scale(0.82, 1);
    ctx.fillText('13', 0, s * 0.06);
    ctx.restore();
    crownPath(ctx, 0, -s * 0.2, s * 0.17);
    ctx.fill();
    ctx.restore();
    if (height) {
      const blur = makeCanvas(s, s), b = blur.getContext('2d');
      b.filter = 'blur(1.2px)';
      b.drawImage(c, 0, 0);
      return blur;
    }
    return c;
  }

  /* ---------------- décor des textures selon le coloris ---------------- */
  function drawTongue(cw) {
    const c = tongueColor, ctx = c.getContext('2d'), W = c.width, H = c.height;
    ctx.fillStyle = cw.tongue;
    ctx.fillRect(0, 0, W, H);
    // étiquette tissée en haut de la languette (u = travers, v = long)
    const y0 = H * (1 - 0.93), y1 = H * (1 - 0.78);
    ctx.fillStyle = cw.label;
    ctx.fillRect(W * 0.3, y0, W * 0.4, y1 - y0);
    ctx.save();
    ctx.translate(W / 2, (y0 + y1) / 2);
    ctx.rotate(PI);
    ctx.fillStyle = cw.badgeInk;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `400 ${Math.round(W * 0.085)}px "Aref Ruqaa", serif`;
    ctx.fillText('التلمساني', 0, -H * 0.018);
    ctx.font = `800 ${Math.round(W * 0.04)}px Archivo, Arial, sans-serif`;
    ctx.fillText('TLEMCENI · 13', 0, H * 0.04);
    ctx.restore();
    // bord surpiqué
    ctx.save();
    ctx.strokeStyle = cw.thread;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(W * 0.06, H * 0.02, W * 0.88, H * 0.9);
    ctx.restore();
  }
  function drawInsole(cw) {
    const c = insoleColor, ctx = c.getContext('2d'), W = c.width, H = c.height;
    ctx.fillStyle = cw.insole;
    ctx.fillRect(0, 0, W, H);
    // zones anatomiques discrètes
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 26; i++) {
      for (let j = 0; j < 9; j++) {
        const x = W * (0.45 + i * 0.02), y = H * (0.12 + j * 0.095) + (i % 2 ? H * 0.045 : 0);
        ctx.beginPath();
        ctx.arc(x, y, W * 0.0045, 0, PI * 2);
        ctx.fill();
      }
    }
    // logo au talon : lisible depuis le dessus, pointe vers la droite
    ctx.save();
    ctx.translate(W * 0.2, H * 0.5);
    ctx.scale(1, -1);
    ctx.fillStyle = cw.insoleInk;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `400 ${Math.round(H * 0.3)}px "Aref Ruqaa", serif`;
    ctx.fillText('التلمساني', 0, -H * 0.06);
    ctx.font = `800 ${Math.round(H * 0.1)}px Archivo, Arial, sans-serif`;
    ctx.fillText('TLEMCENI · 13', 0, H * 0.2);
    ctx.restore();
  }
  function drawMidsole(cw) {
    const c = midColor, ctx = c.getContext('2d'), W = c.width, H = c.height;
    ctx.fillStyle = cw.midsole;
    ctx.fillRect(0, 0, W, H);
    // filet de couleur sur la paroi extérieure (côté latéral puis intérieur)
    const [k0, k1, k2, k3] = midMarks;
    const band = (a, b) => {
      const y = H * (1 - lerp(a, b, 0.42));
      ctx.fillStyle = cw.midAccent;
      ctx.fillRect(W * 0.02, y - H * 0.006, W * 0.3, H * 0.012);
    };
    band(k0, k1);
    band(k2, k3);
  }
  function drawOutsole(cw) {
    const c = outColor, ctx = c.getContext('2d'), W = c.width, H = c.height;
    ctx.fillStyle = cw.outsole;
    ctx.fillRect(0, 0, W, H);
    const X = (x) => ((x - X0) / L) * W, Z = (z) => ((z + 0.6) / 1.2) * H;
    // contour de la semelle (vue de dessous)
    const outline = () => {
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const x = X0 + (i / 120) * L;
        const z = halfW(x, 1) - 0.035;
        i ? ctx.lineTo(X(x), Z(z)) : ctx.moveTo(X(x), Z(Math.max(0, z)));
      }
      for (let i = 120; i >= 0; i--) {
        const x = X0 + (i / 120) * L;
        ctx.lineTo(X(x), Z(-(halfW(x, -1) - 0.035)));
      }
      ctx.closePath();
    };
    ctx.save();
    outline();
    ctx.clip();
    const light = shade(cw.outsole, 0.22), dark = shade(cw.outsole, -0.35);
    // crampons en chevrons
    ctx.strokeStyle = dark;
    ctx.lineWidth = W * 0.006;
    for (let x = -1.45; x < 1.5; x += 0.075) {
      if (x > -0.62 && x < -0.05) continue;
      ctx.beginPath();
      ctx.moveTo(X(x - 0.05), Z(-0.6));
      ctx.lineTo(X(x + 0.03), Z(0));
      ctx.lineTo(X(x - 0.05), Z(0.6));
      ctx.stroke();
    }
    // lignes de flexion
    ctx.strokeStyle = shade(cw.outsole, -0.5);
    ctx.lineWidth = W * 0.004;
    for (const x of [0.45, 0.72, 0.98]) {
      ctx.beginPath();
      ctx.moveTo(X(x), Z(-0.6));
      ctx.lineTo(X(x + 0.04), Z(0.6));
      ctx.stroke();
    }
    // zone centrale lisse avec logo
    ctx.fillStyle = shade(cw.outsole, 0.06);
    ctx.beginPath();
    ctx.ellipse(X(-0.34), Z(0.02), W * 0.11, H * 0.3, 0, 0, PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(X(-0.34), Z(0.02));
    ctx.fillStyle = light;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${Math.round(H * 0.24)}px Archivo, Arial, sans-serif`;
    ctx.fillText('13', 0, H * 0.03);
    crownPath(ctx, 0, -H * 0.15, H * 0.1);
    ctx.fill();
    ctx.font = `700 ${Math.round(H * 0.045)}px Archivo, Arial, sans-serif`;
    ctx.fillText('TLEMCENI', 0, H * 0.19);
    ctx.restore();
    ctx.restore();
  }
  function shade(hex, k) {
    const c = new THREE.Color(hex);
    if (k > 0) c.lerp(new THREE.Color('#ffffff'), k);
    else c.multiplyScalar(1 + k);
    return `#${c.getHexString()}`;
  }

  function setColorway(name) {
    const cw = COLORWAYS[name] || COLORWAYS.blanc;
    drawUpper(cw, 'color');
    upperMap.needsUpdate = true;
    drawCounterColor(cw);
    matCounter.map.needsUpdate = true;
    drawToe(cw);
    matToe.map.needsUpdate = true;
    drawBadge(badgeColor, cw);
    matBadge.map.needsUpdate = true;
    drawTongue(cw);
    matTongue.map.needsUpdate = true;
    drawInsole(cw);
    matInsole.map.needsUpdate = true;
    drawMidsole(cw);
    matMid.map.needsUpdate = true;
    drawOutsole(cw);
    matOut.map.needsUpdate = true;
    matLining.color.set(cw.lining);
    matCollar.color.set(cw.collar);
    matLaces.color.set(cw.laces);
    matEyelet.color.set(cw.eyelet);
    matTab.color.set(cw.tab);
    parts.laces.agletMat.color.set(shade(cw.laces, -0.12));
    for (const p of Object.values(parts)) for (const m of p.mats) m.userData.base = m.color.clone();
    current = name;
  }
  let current = 'blanc';
  setColorway('blanc');

  // Mémorise la couleur de base (multiplicateur) de chaque matériau pour l'atténuation.
  for (const p of Object.values(parts)) {
    for (const m of p.mats) m.userData.base = m.color.clone();
    p.group.userData.dim = 0;
  }

  /* ---------------- état de la vue éclatée ---------------- */
  // explode[name] ∈ [0, 1] ; dim[name] ∈ [0, 1] ; flip ∈ [0, 1] ; xray ∈ [0, 1]
  const tmpQ = new THREE.Quaternion();
  function update(state) {
    for (const [name, p] of Object.entries(parts)) {
      const e = state.explode[name] ?? 0;
      p.group.position.copy(p.offset).multiplyScalar(e);
      if (name === 'outsole') {
        const f = state.flip ?? 0;
        // rotation autour du centre de la semelle
        p.group.rotation.set(p.flip * f, 0, 0);
        const c = p.pivot.clone();
        const rc = c.clone().applyQuaternion(tmpQ.setFromEuler(p.group.rotation));
        p.group.position.add(c.sub(rc));
      }
      const d = state.dim[name] ?? 0;
      if (p.group.userData.dim !== d) {
        p.group.userData.dim = d;
        for (const m of p.mats) m.color.copy(m.userData.base).multiplyScalar(1 - d * 0.62);
      }
    }
    const x = state.xray ?? 0;
    const up = parts.upper;
    const tr = x > 0.001;
    for (const m of [matUpper, matToe, matCounter]) {
      if (m.transparent !== tr) {
        m.transparent = tr;
        m.depthWrite = !tr;
        m.needsUpdate = true;
      }
      m.opacity = 1 - x * 0.86;
    }
    matLining.emissive.set(matLining.color).multiplyScalar(x * 0.35);
    up.lining.renderOrder = tr ? -1 : 0;
  }

  const anchorWorld = (name, out = V3(), local = null) => {
    const p = parts[name];
    return out.copy(local || p.anchor).applyMatrix4(p.group.matrixWorld);
  };

  return {
    root,
    parts,
    update,
    setColorway,
    get colorway() {
      return current;
    },
    anchorWorld,
    dispose() {
      disposables.forEach((d) => d.dispose && d.dispose());
    },
  };
}
