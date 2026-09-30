// Tlemceni — la basket « Trail 13 », modélisée pièce par pièce dans le code, d'après les
// photos du modèle vendu en boutique (fentes de mesh, contrefort zébré, crampons en Y).
// Aucun fichier 3D à télécharger : semelles, tige, languette, lacets et renforts sont des
// géométries calculées, habillées de textures dessinées sur canvas. Chaque pièce vit dans son
// propre groupe pour pouvoir être écartée des autres (vue éclatée) au fil du scroll.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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
const X_BACK = -1.36, X_THROAT = 0.7, X_RIDGE_END = 1.3;
const RIM = 0.045; // épaisseur du rebord de la semelle intermédiaire
// épaisseur de la semelle extérieure (hors crampons) : elle remonte sur la pointe et un peu au talon
const outT = (x) => 0.06 + 0.2 * smooth(1.1, 1.47, x) + 0.04 * smooth(-1.2, -1.45, x);
const LUG = 0.045; // hauteur des crampons

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
const footbed = (x) => lerp(0.37, 0.24, smooth(-0.95, 0.65, x)); // 13 mm de drop
const RIM_L = curve1([[-1.45, 0.15], [-1.2, 0.12], [-1.0, 0.1], [-0.8, 0.088], [-0.6, 0.089], [-0.3, 0.1], [-0.1, 0.088], [0.1, 0.074], [0.3, 0.061], [0.5, 0.055], [0.7, 0.05], [1.0, 0.043], [1.1, 0.045], [1.2, 0.058], [1.3, 0.087], [1.38, 0.128], [1.45, 0.16]]);
const RIM_M = curve1([[-1.45, 0.15], [-1.2, 0.12], [-1.0, 0.1], [-0.8, 0.09], [-0.6, 0.096], [-0.3, 0.108], [-0.1, 0.095], [0.1, 0.08], [0.3, 0.064], [0.5, 0.056], [0.7, 0.05], [1.0, 0.043], [1.1, 0.045], [1.2, 0.058], [1.3, 0.087], [1.38, 0.128], [1.45, 0.16]]);
const rimY = (x, side) => footbed(x) + (side > 0 ? RIM_L(x) : RIM_M(x));

// ouverture du chaussant : demi-largeur, hauteur du bord ; arête du dessus de pied.
// Hauteurs relevées sur la photo de profil du modèle (col haut au talon, laçage long).
const OW = curve1([[-1.36, 0.25], [-1.1, 0.27], [-0.85, 0.262], [-0.6, 0.205], [-0.4, 0.155], [0, 0.138], [0.3, 0.128], [0.52, 0.12], [0.7, 0.112]]);
const OY = curve1([[-1.36, 1.2], [-1.3, 1.225], [-1.25, 1.155], [-1.2, 1.08], [-1.1, 0.993], [-1.0, 0.957], [-0.9, 0.953], [-0.8, 0.97], [-0.7, 1.018], [-0.6, 1.13], [-0.52, 1.2], [-0.45, 1.222], [-0.3, 1.186], [-0.1, 1.085], [0.1, 1.008], [0.3, 0.921], [0.5, 0.849], [0.7, 0.785]]);
const RY = curve1([[0.7, 0.785], [0.8, 0.753], [0.9, 0.728], [1.0, 0.7], [1.1, 0.665], [1.2, 0.618], [1.3, 0.565]]);
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

// Sangle plate le long d'une courbe : largeur selon `across`, épaisseur perpendiculaire.
function ribbon(curve, segs, width, thick, across = V3(0, 0, 1)) {
  const pos = [], uv = [], idx = [];
  const RAD = 16;
  const p = V3(), T = V3(), N = V3();
  const len = curve.getLength();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    curve.getPointAt(t, p);
    curve.getTangentAt(t, T);
    N.crossVectors(T, across).normalize();
    for (let j = 0; j <= RAD; j++) {
      const a = (j / RAD) * PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      // superellipse : section rectangulaire aux bords arrondis
      const cx = (Math.sign(c) * Math.abs(c) ** 0.3 * width) / 2, sy = (Math.sign(s) * Math.abs(s) ** 0.3 * thick) / 2;
      pos.push(p.x + across.x * cx + N.x * sy, p.y + across.y * cx + N.y * sy, p.z + across.z * cx + N.z * sy);
      uv.push(t * len * 6, j / RAD);
    }
  }
  gridIndex(segs, RAD, 0, true, idx);
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
  const bulge = lerp(0.028, 0.05, f) + 0.05 * smooth(0.95, 1.4, x) + 0.035 * smooth(-1.1, -1.4, x);
  const K1 = V3(B1.x + n.x * bulge, B1.y + dy * 0.45, B1.z + n.z * bulge);
  const dp = V3(B1.x - T.x, 0, B1.z - T.z);
  const hl = dp.length();
  if (hl > 1e-5) dp.divideScalar(hl);
  else dp.copy(n);
  const K2 = V3(0, -dy * 0.42, 0).lerp(dp.multiplyScalar(Math.max(hl, 0.1) * 0.62), f).add(T);
  return { x, side, B, B1, K1, K2, T, f };
}
const T0 = 0.1; // part de la colonne cachée dans le rebord
const tv = (v) => T0 + v * (1 - T0); // hauteur visible (0 au ras du rebord, 1 au bord) -> t
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

// Maille technique vue de près : filet clair percé d'alvéoles en quinconce (raccordable).
function netTile(step, base, hole) {
  const w = Math.max(4, Math.round(step)), h = Math.max(4, Math.round(step * 0.86));
  const c = makeCanvas(w, h), ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = hole;
  for (const [cx, cy] of [[0, 0], [w, 0], [0, h], [w, h], [w / 2, h / 2]]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.34);
    ctx.lineTo(cx + w * 0.34, cy);
    ctx.lineTo(cx, cy + h * 0.34);
    ctx.lineTo(cx - w * 0.34, cy);
    ctx.closePath();
    ctx.fill();
  }
  return c;
}
// Sangle tissée : côtes fines dans le sens de la longueur.
function webTile(size) {
  const c = makeCanvas(size, size), ctx = c.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  const n = 8, step = size / n;
  for (let i = 0; i < n; i++) {
    const g = ctx.createLinearGradient(0, i * step, 0, (i + 1) * step);
    g.addColorStop(0, '#404040');
    g.addColorStop(0.5, '#d0d0d0');
    g.addColorStop(1, '#404040');
    ctx.fillStyle = g;
    ctx.fillRect(0, i * step, size, step);
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
/* Coloris : 8 couleurs de base (modifiables dans l'espace admin),       */
/* toutes les autres teintes en découlent.                             */
/* ------------------------------------------------------------------ */
export const PALETTE_KEYS = ['mesh', 'skin', 'line', 'accent', 'midsole', 'outsole', 'laces', 'lining'];
export const COLORWAYS = {
  trail: { mesh: '#abaca9', skin: '#bcbdba', line: '#4b4d52', accent: '#e07650', midsole: '#4a4c51', outsole: '#df7a55', laces: '#bebebb', lining: '#45474c' },
  blanc: { mesh: '#e4e0d8', skin: '#f6f3ed', line: '#17171a', accent: '#c8102e', midsole: '#f3f0e8', outsole: '#1c1c1f', laces: '#f4f1ea', lining: '#9e1320' },
  noir: { mesh: '#2d2e31', skin: '#1e1f21', line: '#0e0e0f', accent: '#c8102e', midsole: '#1f1f22', outsole: '#121214', laces: '#1a1a1c', lining: '#18181a' },
  sable: { mesh: '#c9b28c', skin: '#dbc8a3', line: '#6b4a2c', accent: '#8a5a33', midsole: '#efe6d3', outsole: '#a4642c', laces: '#efe6d4', lining: '#6d4a2e' },
};
function shadeHex(hex, k) {
  const c = new THREE.Color(hex);
  if (k > 0) c.lerp(new THREE.Color('#ffffff'), k);
  else c.multiplyScalar(1 + k);
  return `#${c.getHexString()}`;
}
function mixHex(a, b, k) {
  return `#${new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString()}`;
}
const lum = (hex) => {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
};
function derive(p) {
  const P = { ...COLORWAYS.trail, ...p };
  const dark = (hex, k) => shadeHex(hex, lum(hex) > 0.3 ? -k : k * 0.8);
  const insole = shadeHex(P.lining, lum(P.lining) > 0.25 ? -0.72 : -0.5);
  return {
    ...P,
    perf: dark(P.mesh, 0.55), // trous de la maille
    thread: dark(P.skin, 0.22), // piqûres ton sur ton
    piping: shadeHex(P.skin, 0.5),
    counter: P.line, toe: P.line, collar: P.line, tab: P.line,
    eyelet: dark(P.skin, 0.5),
    patch: mixHex(P.line, P.skin, 0.3), // pastille au sommet des oeillets
    web: shadeHex(P.line, 0.14), // sangles : tirette de languette, passants
    mark: '#ffffff', label: P.line, ink: shadeHex(P.line, -0.6), // lignes noires imprimées
    tongue: P.mesh, insole, insoleInk: lum(insole) > 0.45 ? '#141414' : '#f4f4f1',
    midLine: shadeHex(P.midsole, lum(P.midsole) > 0.3 ? -0.14 : 0.16),
    window: shadeHex(P.midsole, lum(P.midsole) > 0.3 ? -0.08 : 0.06), // fenêtres sous la semelle
  };
}

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

  const body = new THREE.Group(); // tout est posé sur les crampons
  body.position.y = LUG;
  root.add(body);
  function part(name, anchor, offset, extra = {}) {
    const g = new THREE.Group();
    g.name = name;
    body.add(g);
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
  const foamN = keep(toTex(heightToNormal(noiseTile(256, 3, 70, 0.8), 1.2), false, [10, 7]));
  const meshN = keep(toTex(heightToNormal(meshTile(128), 3), false, [60, 8]));
  const braidN = keep(toTex(heightToNormal(braidTile(64), 4), false, [60, 1]));
  const webN = keep(toTex(heightToNormal(webTile(64), 3), false, [12, 2]));
  const shellGrainN = keep(toTex(heightToNormal(grainH, 1.6), false, [5, 1.4])); // grain fin des renforts

  /* ---------------- tige : textures couleur / rugosité / relief ---------------- */
  const upperColor = makeCanvas(TW, TH);
  const upperRough = makeCanvas(TW, TH);
  const upperHeight = makeCanvas(TW, TH);
  // (x le long du pied, v en hauteur : 0 au ras de la semelle, 1 au bord du chaussant) -> pixels
  const px = (x, side, v) => [arcU(thetaAt(x, side)) * TW, (1 - tv(v)) * TH];
  const unit = TW / ARC.total; // pixels par unité le long du pied
  const toPx = (side, pts) => pts.map(([x, v]) => px(x, side, v));

  // Relevé sur les photos du modèle : fenêtres de maille sous les renforts lisses.
  // Côté extérieur : grande fenêtre sous le col, cinq fentes arrondies en éventail, avant-pied en maille.
  const REAR_L = [[-1.4, 0.87], [-1.22, 0.74], [-0.99, 0.8], [-0.8, 0.71], [-0.67, 0.69], [-0.56, 0.68], [-0.5, 1.04], [-1.4, 1.04]];
  const SLOTS_L = [
    [[-0.693, 0.479], [-0.682, 0.514], [-0.264, 0.652], [-0.259, 0.565]],
    [[-0.165, 0.624], [-0.071, 0.724], [-0.189, 0.256], [-0.306, 0.235]],
    [[0.082, 0.586], [0.176, 0.624], [0.181, 0.261], [-0.089, 0.177]],
    [[0.258, 0.751], [0.364, 0.804], [0.388, 0.423], [0.294, 0.396]],
    [[0.488, 0.771], [0.552, 0.788], [0.663, 0.395], [0.563, 0.379]],
  ];
  // Côté intérieur : fenêtres en triangle et trapèze, soulignées de lignes noires « circuit ».
  const REAR_M = [[-1.22, 0.62], [-0.68, 0.55], [-0.57, 0.62], [-0.54, 1.04], [-1.22, 1.04]];
  const WINS_M = [
    [[-0.33, 0.53], [-0.2, 0.75], [0.07, 0.77], [-0.1, 0.51]],
    [[-0.1, 0.3], [0.18, 0.62], [0.18, 0.2]],
    [[0.33, 0.74], [0.42, 0.76], [0.47, 0.29], [0.36, 0.29]],
    [[0.55, 0.79], [0.62, 0.8], [0.73, 0.25], [0.63, 0.23]],
  ];
  const LINES_M = [
    { w: 1, pts: [[-0.47, 0.45], [-0.19, 0.32], [0.126, 0.75], [0.286, 0.68], [0.286, 0.2], [0.52, 0.22]] },
    { w: 1, pts: [[-0.6, 0.7], [-0.4, 0.62], [-0.27, 0.86], [0.2, 0.88]] },
    { w: 1, dash: true, pts: [[-0.66, 0.54], [-0.5, 0.465]] },
    { w: 1, dash: true, pts: [[0.51, 0.28], [0.51, 0.66]] },
    { w: 0.4, pts: [[-0.62, 0.36], [-0.22, 0.17], [0.22, 0.17], [0.25, 0.11], [0.95, 0.11]] },
  ];
  const VAMP = [[0.74, 1.04], [0.77, 0.74], [0.88, 0.52], [1.42, 0.46], [1.42, 1.04]];
  const PATCH = [[-0.52, 0.83], [-0.33, 0.85], [-0.33, 0.96], [-0.52, 0.95]]; // pastille du dernier oeillet

  // polygone (pixels) décalé de d vers l'extérieur
  function offsetPoly(P, d) {
    let area = 0;
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      area += a[0] * b[1] - b[0] * a[1];
    }
    const sg = area > 0 ? 1 : -1;
    return P.map((c, i) => {
      const a = P[(i + P.length - 1) % P.length], b = P[(i + 1) % P.length];
      const l1 = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1, l2 = Math.hypot(b[0] - c[0], b[1] - c[1]) || 1;
      const n1 = [(sg * (c[1] - a[1])) / l1, (-sg * (c[0] - a[0])) / l1];
      const n2 = [(sg * (b[1] - c[1])) / l2, (-sg * (b[0] - c[0])) / l2];
      let m = [n1[0] + n2[0], n1[1] + n2[1]];
      const lm = Math.hypot(m[0], m[1]) || 1;
      m = [m[0] / lm, m[1] / lm];
      const k = d / Math.max(0.35, m[0] * n1[0] + m[1] * n1[1]);
      return [c[0] + m[0] * k, c[1] + m[1] * k];
    });
  }
  // contour à coins arrondis
  function roundPath(ctx, P, r) {
    const n = P.length;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = P[(i + n - 1) % n], c = P[i], b = P[(i + 1) % n];
      const la = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1, lb = Math.hypot(b[0] - c[0], b[1] - c[1]) || 1;
      const rr = Math.min(r, la * 0.45, lb * 0.45);
      const p0 = [c[0] + ((a[0] - c[0]) / la) * rr, c[1] + ((a[1] - c[1]) / la) * rr];
      const p1 = [c[0] + ((b[0] - c[0]) / lb) * rr, c[1] + ((b[1] - c[1]) / lb) * rr];
      if (i) ctx.lineTo(p0[0], p0[1]);
      else ctx.moveTo(p0[0], p0[1]);
      ctx.quadraticCurveTo(c[0], c[1], p1[0], p1[1]);
    }
    ctx.closePath();
  }
  function linePath(ctx, side, pts) {
    ctx.beginPath();
    toPx(side, pts).forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)));
  }
  function curvePath(ctx, side, x0, x1, vFn) {
    ctx.beginPath();
    for (let x = x0, i = 0; x <= x1 + 1e-6; x += 0.015, i++) {
      const [a, b] = px(x, side, vFn(x));
      i ? ctx.lineTo(a, b) : ctx.moveTo(a, b);
    }
  }
  // piqûre : sillon dans le relief, fil en pointillé dans la couleur
  function stitch(ctx, layer, pathFn, color, sw, dash) {
    ctx.save();
    pathFn();
    if (layer === 'height') {
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = sw * 2.6;
      ctx.stroke();
    }
    ctx.setLineDash([dash, dash * 0.75]);
    ctx.strokeStyle = layer === 'color' ? color : layer === 'rough' ? '#cfcfcf' : '#ffffff';
    ctx.lineWidth = sw;
    ctx.stroke();
    ctx.restore();
  }

  function drawUpper(cw, layer) {
    const ctx = (layer === 'color' ? upperColor : layer === 'rough' ? upperRough : upperHeight).getContext('2d');
    const W = TW, H = TH;
    const C = layer === 'color', R = layer === 'rough', Hh = layer === 'height';
    const pick = (color, rough, height) => (C ? color : R ? rough : height);
    const sw = Math.max(1.2, unit * 0.0045); // fil des piqûres
    const dash = unit * 0.016;
    const rad = unit * 0.035; // arrondi des fenêtres
    const net = ctx.createPattern(netTile(unit * 0.026, pick(cw.mesh, '#e2e2e2', '#6a6a6a'), pick(cw.perf, '#ffffff', '#161616')), 'repeat');
    ctx.save();
    ctx.setLineDash([]);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    // peau synthétique de base (renforts lisses)
    if (Hh) {
      ctx.fillStyle = ctx.createPattern(grainH, 'repeat');
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(128,128,128,0.6)';
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = pick(cw.skin, '#b8b8b8');
      ctx.fillRect(0, 0, W, H);
    }
    const opening = (P) => {
      roundPath(ctx, P, rad);
      ctx.fillStyle = net;
      ctx.fill();
      if (!R) {
        // ombre portée du bord du renfort sur la maille
        ctx.save();
        ctx.clip();
        roundPath(ctx, P, rad);
        ctx.strokeStyle = Hh ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.13)';
        ctx.lineWidth = unit * 0.012;
        ctx.stroke();
        ctx.restore();
      }
      stitch(ctx, layer, () => roundPath(ctx, offsetPoly(P, unit * 0.011), rad * 1.3), cw.thread, sw, dash);
    };
    for (const side of [1, -1]) {
      const lat = side > 0;
      // avant-pied en maille, sous le pare-pierre
      opening(toPx(side, VAMP));
      opening(toPx(side, lat ? REAR_L : REAR_M));
      for (const pts of lat ? SLOTS_L : WINS_M) opening(toPx(side, pts));
      // lignes noires imprimées (côté intérieur)
      if (!lat) {
        for (const l of LINES_M) {
          ctx.save();
          linePath(ctx, side, l.pts);
          ctx.lineCap = l.dash ? 'butt' : 'round';
          if (l.dash) ctx.setLineDash([unit * 0.05, unit * 0.028]);
          ctx.strokeStyle = pick(cw.ink, '#5a5a5a', 'rgba(255,255,255,0.35)');
          ctx.lineWidth = unit * 0.02 * l.w;
          ctx.stroke();
          ctx.restore();
        }
      }
      // pastille au sommet des oeillets
      roundPath(ctx, toPx(side, PATCH), unit * 0.008);
      ctx.fillStyle = pick(cw.patch, '#7a7a7a', '#a8a8a8');
      ctx.fill();
      // passepoil clair le long des oeillets et du col
      ctx.save();
      curvePath(ctx, side, -1.36, X_THROAT, () => 0.992);
      ctx.strokeStyle = pick(cw.piping, '#9a9a9a', '#b8b8b8');
      ctx.lineWidth = unit * 0.009;
      ctx.stroke();
      ctx.restore();
      // piqûres des oeillets
      stitch(ctx, layer, () => curvePath(ctx, side, -0.5, X_THROAT - 0.02, () => 0.9), cw.thread, sw, dash);
    }
    if (C) {
      // ombre de contact au ras de la semelle
      const g = ctx.createLinearGradient(0, H, 0, H * 0.72);
      g.addColorStop(0, 'rgba(0,0,0,0.36)');
      g.addColorStop(0.35, 'rgba(0,0,0,0.1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
    }
    ctx.restore();
  }

  drawUpper(derive(COLORWAYS.trail), 'height');
  drawUpper(derive(COLORWAYS.trail), 'rough');
  const upperMap = keep(toTex(upperColor, true));
  const upperNormalT = keep(toTex(heightToNormal(upperHeight, 2.4, false), false));
  const upperRoughT = keep(toTex(upperRough, false));

  const matUpper = new THREE.MeshPhysicalMaterial({
    map: upperMap, normalMap: upperNormalT, normalScale: new THREE.Vector2(0.9, 0.9), roughnessMap: upperRoughT, roughness: 0.78,
    clearcoat: 0.05, clearcoatRoughness: 0.6, sheen: 0.12, sheenRoughness: 0.8,
  });
  const matLining = new THREE.MeshPhysicalMaterial({ color: '#45474c', normalMap: meshN, roughness: 0.85, sheen: 1, sheenRoughness: 0.5, side: THREE.DoubleSide });
  const matCollar = new THREE.MeshPhysicalMaterial({ color: '#1b1b1e', normalMap: meshN, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.8, sheen: 0.8, sheenRoughness: 0.6 });
  // oeillets : simples trous gansés dans le renfort, pas d'anneau métallique
  const matEyelet = new THREE.MeshStandardMaterial({ color: '#8d8d8a', metalness: 0, roughness: 0.7 });
  // sangles tissées : boucle du talon, tirette de languette, passants de lacet
  const matTab = new THREE.MeshPhysicalMaterial({ color: '#4b4d52', normalMap: webN, normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.7, sheen: 0.6, sheenRoughness: 0.5, side: THREE.DoubleSide });
  const matWeb = new THREE.MeshPhysicalMaterial({ color: '#616369', normalMap: webN, normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.7, sheen: 0.6, sheenRoughness: 0.5, side: THREE.DoubleSide });
  const matLaces = new THREE.MeshPhysicalMaterial({ color: '#d9d9d6', normalMap: braidN, normalScale: new THREE.Vector2(0.8, 0.8), roughness: 0.8, sheen: 0.7, sheenRoughness: 0.6 });

  /* ---------------- tige ---------------- */
  const pUpper = part('upper', V3(-0.3, 0.72, 0.4), V3(0, 0, 0));
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
      return 0.012 + 0.042 * smooth(-0.3, -0.75, p2.x) * (1 - 0.45 * smooth(-1.1, -1.36, p2.x));
    };
    const cg = tube(curve, hi ? 260 : 160, hi ? 14 : 10, rAt);
    // on descend légèrement le bourrelet pour qu'il chevauche le bord
    const cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) cp.setY(i, cp.getY(i) - 0.008);
    cg.computeVertexNormals();
    add(pUpper, cg, matCollar, { dim: false });
    pUpper.collarMat = matCollar;
    // boucle du talon : sangle tissée repliée, penchée vers l'arrière
    const n0 = upperNormal(0, 0.8);
    const top = openPt(X_BACK, 1);
    const loop = new THREE.CatmullRomCurve3([
      upperPoint(0, 0.74).addScaledVector(n0, 0.012),
      upperPoint(0, 0.95).addScaledVector(n0, 0.016),
      top.clone().add(V3(-0.11, 0.11, 0)),
      top.clone().add(V3(-0.15, 0.19, 0)),
      top.clone().add(V3(-0.085, 0.19, 0)),
      top.clone().add(V3(-0.03, 0.085, 0)),
      top.clone().add(V3(0.02, -0.03, 0)),
    ], false, 'centripetal');
    add(pUpper, ribbon(loop, hi ? 80 : 50, 0.08, 0.014), matTab, { dim: false });
    pUpper.tabMat = matTab;
  }

  /* ---------------- oeillets & lacets ---------------- */
  const EYE = 6;
  const eyelets = { 1: [], [-1]: [] };
  for (const side of [1, -1]) {
    for (let i = 0; i < EYE; i++) {
      const x = lerp(0.55, -0.35, i / (EYE - 1));
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
    // trou gansé : bourrelet discret et fond sombre
    const tg = new THREE.TorusGeometry(0.0165, 0.0042, 8, hi ? 20 : 14);
    const m = new THREE.InstancedMesh(keep(tg), matEyelet, EYE * 2);
    const hg = new THREE.CircleGeometry(0.0145, hi ? 18 : 12);
    const matHole = new THREE.MeshBasicMaterial({ color: '#141416' });
    const h = new THREE.InstancedMesh(keep(hg), matHole, EYE * 2);
    const o = new THREE.Object3D();
    let k = 0;
    for (const side of [1, -1]) {
      for (const e of eyelets[side]) {
        o.position.copy(e.p).addScaledVector(e.n, 0.0035);
        o.quaternion.setFromUnitVectors(V3(0, 0, 1), e.n);
        o.updateMatrix();
        m.setMatrixAt(k, o.matrix);
        o.position.copy(e.p).addScaledVector(e.n, 0.0015);
        o.updateMatrix();
        h.setMatrixAt(k++, o.matrix);
      }
    }
    pUpper.group.add(m, h);
    pUpper.eyeletMat = matEyelet;
  }

  const pLaces = part('laces', V3(-0.2, 1.25, 0.1), V3(0, 0.82, 0));
  {
    const R = 0.019;
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
  const tongueN = keep(toTex(heightToNormal(meshTile(128), 3), false, [3, 6]));
  const matTongue = new THREE.MeshPhysicalMaterial({ map: keep(toTex(tongueColor, true)), normalMap: tongueN, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 0.8, sheen: 0.5, sheenRoughness: 0.6 });
  const pTongue = part('tongue', V3(-0.47, 1.28, 0), V3(-0.1, 0.48, 0));
  const tongueCurve = new THREE.CatmullRomCurve3([
    V3(0.9, RY(0.9) + spring(0.9) - 0.05, 0),
    V3(0.63, OY(0.63) + spring(0.63) - 0.012, 0),
    V3(0.2, OY(0.2) + spring(0.2) - 0.004, 0),
    V3(-0.26, OY(-0.26) + 0.004, 0),
    V3(-0.42, OY(-0.42) + 0.045, 0),
    V3(-0.52, OY(-0.52) + 0.12, 0),
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
    // passants de lacet (sangle cousue à plat) et tirette en haut de la languette
    const onTop = (a, h) => {
      const c = tongueCurve.getPointAt(a), tg = tongueCurve.getTangentAt(a);
      const n = V3(-tg.y, tg.x, 0).normalize();
      if (n.y < 0) n.negate();
      return { p: c.addScaledVector(n, thick(a, 0.5) + h), tg, n };
    };
    const kg = new RoundedBoxGeometry(0.1, 0.012, 0.052, 2, 0.005);
    for (const a of [0.2, 0.55]) {
      const { p, tg } = onTop(a, 0.004);
      const m = add(pTongue, kg.clone(), matWeb);
      m.position.copy(p);
      m.rotation.z = Math.atan2(tg.y, tg.x);
    }
    keep(kg);
    const t0 = onTop(0.86, 0.002), t1 = onTop(0.97, 0.004);
    const pull = new THREE.CatmullRomCurve3([
      t0.p,
      t1.p,
      t1.p.clone().addScaledVector(t1.tg, 0.05).addScaledVector(t1.n, 0.02),
      t1.p.clone().addScaledVector(t1.tg, 0.035).addScaledVector(t1.n, 0.045),
      t1.p.clone().addScaledVector(t1.tg, -0.01).addScaledVector(t1.n, 0.022),
      t0.p.clone().addScaledVector(t0.n, 0.012),
    ], false, 'centripetal');
    add(pTongue, ribbon(pull, hi ? 50 : 32, 0.07, 0.009), matWeb);
  }

  // --- semelle intérieure (anatomique, amovible)
  const insoleColor = makeCanvas(1024, 384);
  const matInsole = new THREE.MeshPhysicalMaterial({ map: keep(toTex(insoleColor, true)), normalMap: foamN, normalScale: new THREE.Vector2(0.4, 0.4), roughness: 0.92, sheen: 0.5, sheenRoughness: 0.7 });
  const pInsole = part('insole', V3(-0.9, 0.5, 0), V3(0, -0.44, 0));
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
  const midColor = makeCanvas(1024, 512);
  const midHeight = makeCanvas(1024, 512);
  const matMid = new THREE.MeshPhysicalMaterial({ map: keep(toTex(midColor, true)), roughness: 0.66, sheen: 0.2 });
  const pMid = part('midsole', V3(-0.95, 0.3, 0.37), V3(0, -0.84, 0));
  let midMarks;
  {
    const K = [];
    const sect = (x) => {
      const wl = halfW(x, 1), wm = halfW(x, -1);
      const yb = bevel(x) + outT(x), yf = footbed(x), rl = rimY(x, 1), rm = rimY(x, -1);
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
    // relief : grain de mousse + lignes moulées sur les parois
    const ctx = midHeight.getContext('2d');
    ctx.fillStyle = ctx.createPattern(noiseTile(256, 9, 22, 0.9), 'repeat');
    ctx.fillRect(0, 0, 1024, 512);
    midLines(ctx, 1024, 512, (c) => {
      c.strokeStyle = 'rgba(20,20,20,0.9)';
      c.lineWidth = 512 * 0.016;
    });
    matMid.normalMap = keep(toTex(heightToNormal(midHeight, 3, false), false));
    matMid.normalScale = new THREE.Vector2(0.9, 0.9);
  }
  // Lignes moulées relevées sur le modèle : un éventail de trois nervures au talon,
  // de longues rainures vers l'avant (deux côté extérieur, cinq côté intérieur).
  function midLines(ctx, W, H, style) {
    const [k0, k1, k2, k3] = midMarks;
    const wall = (side, f) => (side > 0 ? lerp(k0, k1, f) : lerp(k3, k2, f));
    const P = (side, u, f) => [u * W, H * (1 - wall(side, f))];
    const poly = (side, pts) => {
      ctx.beginPath();
      pts.forEach(([u, f], i) => {
        const [a, b] = P(side, u, f);
        i ? ctx.lineTo(a, b) : ctx.moveTo(a, b);
      });
      ctx.stroke();
    };
    for (const side of [1, -1]) {
      ctx.save();
      style(ctx);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 0; i < 3; i++) {
        poly(side, [[0.004, 0.8 - 0.2 * i], [0.19 - 0.025 * i, 0.72 - 0.21 * i], [0.31 - 0.03 * i, 0.4 - 0.13 * i], [0.415 - 0.03 * i, 0.07]]);
      }
      const n = side > 0 ? 2 : 5;
      for (let j = 0; j < n; j++) {
        const f = side > 0 ? 0.3 + 0.28 * j : 0.16 + 0.13 * j;
        poly(side, [[0.43 + 0.012 * j, 0.1 + 0.04 * j], [0.55, f], [0.8, f + 0.02], [0.95 - 0.015 * j, f + 0.04]]);
      }
      ctx.restore();
    }
  }

  const outColor = makeCanvas(2048, 848);
  const matOut = new THREE.MeshPhysicalMaterial({ map: keep(toTex(outColor, true)), roughness: 0.9 });
  const pOut = part('outsole', V3(0.1, 0.0, 0), V3(0, -1.24, 0), { flip: -1.15 });
  {
    const sect = (x) => {
      const wl = halfW(x, 1) * 1.012, wm = halfW(x, -1) * 1.012;
      const yb = bevel(x), yt = yb + outT(x);
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
  // Crampons relevés sur la semelle du modèle : barres en chevron au talon, crampons en Y,
  // triangles au médio-pied, crampons de bord qui remontent sur le flanc. Les deux fenêtres
  // (talon, avant-pied) restent lisses : la semelle intermédiaire y apparaît.
  // Placement en (u le long du pied, w en fraction de la demi-largeur, signe = côté).
  const LUGS = [];
  for (const sg of [1, -1]) {
    for (let i = 0; i < 4; i++) LUGS.push({ type: 'bar', u: 0.05 + 0.042 * i, w: sg * 0.53, rot: sg * 0.62 });
    for (const [u, w, r] of [[0.255, 0.6, 0.3], [0.36, 0.36, -0.2], [0.715, 0.5, 0.5], [0.83, 0.58, 0.1], [0.945, 0.36, 0.9]]) {
      LUGS.push({ type: 'y', u, w: sg * w, rot: sg * r });
    }
    for (const [u, w, r] of [[0.425, 0.14, 0], [0.425, 0.55, 1], [0.475, 0.34, 2], [0.475, 0.74, 0.5], [0.53, 0.14, 1.5], [0.53, 0.54, 0.2],
      [0.58, 0.32, 2.4], [0.585, 0.73, 1.2], [0.635, 0.52, 0.3], [0.66, 0.26, 1.8], [0.765, 0.34, 0.9], [0.78, 0.74, 2.2], [0.885, 0.38, 0.4]]) {
      LUGS.push({ type: 'tri', u, w: sg * w, rot: sg * r });
    }
  }
  LUGS.push({ type: 'tri', u: 0.975, w: 0, rot: PI / 2 });
  {
    const matLug = new THREE.MeshPhysicalMaterial({ color: '#df7a55', roughness: 0.82, sheen: 0.15 });
    pOut.lugMat = matLug;
    pOut.mats.push(matLug);
    const bottomY = (x) => bevel(x) + spring(x);
    const slope = (x) => Math.atan2(bottomY(x + 0.01) - bottomY(x - 0.01), 0.02);
    // forme 2D (plan x, z) extrudée vers le bas sur la hauteur d'un crampon
    const ext = (shape) => {
      const g = new THREE.ExtrudeGeometry(shape, { depth: LUG - 0.004, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.006, bevelSegments: 2, curveSegments: 6 });
      g.rotateX(PI / 2);
      return keep(g);
    };
    const star = (n, fn) => {
      const pts = [];
      for (let k = 0; k < 3; k++) {
        const a = PI / 2 + (k * 2 * PI) / 3;
        const d = [Math.cos(a), Math.sin(a)], q = [-d[1], d[0]];
        pts.push(...fn(d, q, a));
      }
      const s = n ? new THREE.Path() : new THREE.Shape();
      pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
      s.closePath();
      return s;
    };
    const RL = 0.08; // crampon en Y : trois bras épais, rainure en Y au centre
    const yShape = star(0, (d, q, a) => [
      [d[0] * RL - q[0] * RL * 0.5, d[1] * RL - q[1] * RL * 0.5],
      [d[0] * RL + q[0] * RL * 0.5, d[1] * RL + q[1] * RL * 0.5],
      [Math.cos(a + PI / 3) * RL * 0.45, Math.sin(a + PI / 3) * RL * 0.45],
    ]);
    const g = RL * 0.16, lg = RL * 0.64;
    yShape.holes.push(star(1, (d, q, a) => [
      [d[0] * lg - q[0] * g, d[1] * lg - q[1] * g],
      [d[0] * lg + q[0] * g, d[1] * lg + q[1] * g],
      [Math.cos(a + PI / 3) * g * 1.2, Math.sin(a + PI / 3) * g * 1.2],
    ]));
    const triShape = star(0, (d) => [[d[0] * 0.058, d[1] * 0.058]]);
    const barShape = new THREE.Shape();
    barShape.moveTo(-0.095, -0.018);
    barShape.lineTo(0.095, -0.018);
    barShape.lineTo(0.095, 0.018);
    barShape.lineTo(-0.095, 0.018);
    barShape.closePath();
    const geos = { y: ext(yShape), tri: ext(triShape), bar: ext(barShape) };
    const o = new THREE.Object3D();
    pOut.bottomLugs = [];
    for (const type of Object.keys(geos)) {
      const list = LUGS.filter((l) => l.type === type);
      const m = new THREE.InstancedMesh(geos[type], matLug, list.length);
      list.forEach((l, i) => {
        const x = X0 + l.u * L;
        o.position.set(x, bottomY(x) + 0.001, l.w * halfW(x, l.w >= 0 ? 1 : -1));
        o.rotation.set(0, l.rot, slope(x), 'ZYX');
        o.scale.set(1, 1, 1);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
      });
      m.castShadow = true;
      m.receiveShadow = true;
      pOut.group.add(m);
      pOut.bottomLugs.push(m);
    }
    // crampons de bord, à pas régulier le long du contour
    const ring = [];
    const N = 480;
    for (let i = 0; i < N; i++) {
      const th = i / N;
      const lat = th <= 0.5;
      const sN = lat ? th * 2 : 2 - th * 2;
      const x = X0 + ((1 - Math.cos(PI * sN)) / 2) * L;
      ring.push(V3(x, 0, (lat ? 1 : -1) * halfW(x, lat ? 1 : -1) * 1.012));
    }
    const edge = [];
    let acc = 0.09;
    for (let i = 0; i < N; i++) {
      const p = ring[i], q = ring[(i + 1) % N];
      acc += p.distanceTo(q);
      if (acc < 0.185) continue;
      acc = 0;
      const prev = ring[(i + N - 1) % N];
      const tx = q.x - prev.x, tz = q.z - prev.z, l = Math.hypot(tx, tz) || 1;
      const nx = -tz / l, nz = tx / l; // normale extérieure
      const arch = p.z < 0 && p.x > -0.62 && p.x < -0.08 ? 0.75 : 1;
      // part du crampon qui remonte sur le flanc : davantage au talon et à la pointe
      const up = 0.018 + 0.05 * Math.max(smooth(-0.9, -1.4, p.x), smooth(0.9, 1.4, p.x));
      edge.push({ x: p.x - nx * 0.006, y: bottomY(p.x) - LUG + (LUG + up) / 2, z: p.z - nz * 0.006, ry: -Math.atan2(tz, tx), s: [0.158 * arch, LUG + up, 0.05] });
    }
    const geo = keep(new RoundedBoxGeometry(1, 1, 1, 2, 0.2));
    const m = new THREE.InstancedMesh(geo, matLug, edge.length);
    edge.forEach((l, i) => {
      o.position.set(l.x, l.y, l.z);
      o.rotation.set(0, l.ry, 0);
      o.scale.set(...l.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.castShadow = true;
    m.receiveShadow = true;
    pOut.group.add(m);
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

  // Les renforts gardent le repère de la tige : u = position autour du pied, v = t.
  // Leurs textures se dessinent donc avec les mêmes coordonnées (x, côté, v) que la tige.
  const signedU = (theta) => (theta >= 0 ? arcU(theta) : arcU(1 + theta) - 1);

  // --- contrefort de talon : coque anthracite au bord en diagonale, bande orange zébrée
  // bord haut et bas de la bande orange, relevés sur la photo (v : 0 au ras de la semelle, 1 au bord)
  const XF_H = -0.28; // pointe avant du contrefort, au ras de la semelle
  const hTop = curve1([[-1.42, 0.6], [-1.27, 0.58], [-1.1, 0.62], [-0.93, 0.55], [-0.75, 0.37], [-0.58, 0.18], [-0.41, 0.065], [XF_H, 0]]);
  const hBand = curve1([[-1.42, 0.4], [-1.23, 0.33], [-1.04, 0.3], [-0.78, 0.156], [-0.58, 0.057], [-0.41, 0]]);
  const TH_HL = thetaAt(XF_H, 1), TH_HM = 1 - thetaAt(XF_H, -1);
  const heelFn = (a, b) => {
    const s = a * 2 - 1; // -1 intérieur, 1 extérieur
    const theta = s >= 0 ? s * TH_HL : s * TH_HM;
    const { x } = perim(theta);
    return { theta, t: lerp(0.02, Math.max(0.03, tv(hTop(x))), b) };
  };
  const UH0 = signedU(-TH_HM) - 0.01, UH1 = signedU(TH_HL) + 0.01;
  const heelUV = (a, b) => {
    const { theta, t } = heelFn(a, b);
    return [(signedU(theta) - UH0) / (UH1 - UH0), t];
  };
  const hpx = (c, x, side, v) => [((signedU(side > 0 ? thetaAt(x, 1) : thetaAt(x, -1) - 1) - UH0) / (UH1 - UH0)) * c.width, (1 - tv(v)) * c.height];
  const counterColor = makeCanvas(hi ? 2048 : 1024, hi ? 512 : 256);
  const matCounter = new THREE.MeshPhysicalMaterial({ map: keep(toTex(counterColor, true)), normalMap: shellGrainN, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.52, clearcoat: 0.25, clearcoatRoughness: 0.4 });
  const pHeel = part('heel', V3(-1.52, 0.8, 0), V3(-0.55, 0.06, 0));
  add(pHeel, shell(heelFn, hi ? 110 : 70, hi ? 18 : 12, 0.004, 0.024, heelUV), matCounter);
  function drawCounter(c, cw) {
    const ctx = c.getContext('2d'), W = c.width, H = c.height;
    const k = W / 2048;
    const P = (x, side, v) => hpx(c, x, side, v);
    const path = (side, x0, x1, vFn) => {
      ctx.beginPath();
      for (let x = x0, i = 0; x <= x1 + 1e-6; x += 0.01, i++) {
        const [a, b] = P(x, side, vFn(x));
        i ? ctx.lineTo(a, b) : ctx.moveTo(a, b);
      }
    };
    ctx.fillStyle = cw.counter;
    ctx.fillRect(0, 0, W, H);
    for (const side of [1, -1]) {
      // bande orange entre deux diagonales
      path(side, -1.42, XF_H, (x) => hTop(x) + 0.04);
      for (let x = XF_H; x >= -1.42 - 1e-6; x -= 0.01) {
        const [a, b] = P(x, side, x > -0.46 ? -0.06 : hBand(x));
        ctx.lineTo(a, b);
      }
      ctx.closePath();
      ctx.fillStyle = cw.accent;
      ctx.fill();
      // deux traits anthracite dans la bande
      const mid = (x) => lerp(hBand(x), hTop(x), 0.6);
      for (const [xa, xb] of [[-1.13, -0.95], [-0.74, -0.57]]) {
        ctx.beginPath();
        [[xa, hBand(xa) - 0.01], [xb, hBand(xb) - 0.01], [xb + 0.08, mid(xb + 0.08)], [xa + 0.08, mid(xa + 0.08)]].forEach(([x, v], i) => {
          const [a, b] = P(x, side, v);
          i ? ctx.lineTo(a, b) : ctx.moveTo(a, b);
        });
        ctx.closePath();
        ctx.fillStyle = cw.counter;
        ctx.fill();
      }
      // piqûres : bord haut du contrefort et bas de la bande
      for (const [x1, vFn] of [[XF_H - 0.04, (x) => hTop(x) - 0.035], [-0.51, (x) => hBand(x) + 0.03]]) {
        ctx.save();
        path(side, -1.42, x1, vFn);
        ctx.setLineDash([16 * k, 11 * k]);
        ctx.strokeStyle = shadeHex(cw.accent, -0.3);
        ctx.lineWidth = 2.6 * k;
        ctx.stroke();
        ctx.restore();
      }
    }
    // petit monogramme blanc à l'arrière de la bande, côté extérieur
    const [a, b] = P(-1.2, 1, lerp(hBand(-1.2), hTop(-1.2), 0.5));
    ctx.save();
    ctx.translate(a, b);
    ctx.fillStyle = cw.mark;
    ctx.globalAlpha = 0.9;
    crownPath(ctx, 0, -H * 0.045, H * 0.045);
    ctx.fill();
    ctx.font = `800 ${Math.round(H * 0.07)}px Archivo, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('13', 0, H * 0.02);
    ctx.restore();
  }

  // --- pare-pierre : bout anthracite perforé, bord festonné
  const XF_T = 0.745;
  const TOE_EDGE = curve1([[XF_T, 0], [0.786, 0.27], [0.832, 0.51], [0.9, 0.64], [0.98, 0.71], [1.1, 0.8], [1.156, 0.88], [1.2, 0.93], [1.45, 0.95]]);
  const tTop = (x) => clamp(TOE_EDGE(x) + 0.02 * Math.sin((x - 1.0) * 30) * smooth(1.0, 1.08, x) * (1 - smooth(1.2, 1.3, x)));
  const TH_TL = 0.5 - thetaAt(XF_T, 1), TH_TM = thetaAt(XF_T, -1) - 0.5;
  const toeFn = (a, b) => {
    const s = a * 2 - 1; // -1 extérieur, 1 intérieur
    const theta = 0.5 + (s < 0 ? s * TH_TL : s * TH_TM);
    const { x } = perim(theta);
    return { theta, t: lerp(0.02, Math.max(0.03, tv(tTop(x))), b) };
  };
  const UT0 = arcU(0.5 - TH_TL) - 0.01, UT1 = arcU(0.5 + TH_TM) + 0.01;
  const toeUV = (a, b) => {
    const { theta, t } = toeFn(a, b);
    return [(arcU(theta) - UT0) / (UT1 - UT0), t];
  };
  const tpx = (c, x, side, v) => [((arcU(thetaAt(x, side)) - UT0) / (UT1 - UT0)) * c.width, (1 - tv(v)) * c.height];
  const toeColor = makeCanvas(hi ? 2048 : 1024, hi ? 512 : 256);
  const matToe = new THREE.MeshPhysicalMaterial({ map: keep(toTex(toeColor, true)), normalMap: shellGrainN, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.45 });
  const pToe = part('toe', V3(1.56, 0.36, 0), V3(0.52, 0.02, 0));
  add(pToe, shell(toeFn, hi ? 90 : 60, hi ? 16 : 10, 0.004, 0.02, toeUV), matToe);
  function drawToe(cw) {
    const c = toeColor, ctx = c.getContext('2d'), W = c.width, H = c.height;
    const k = W / 2048;
    const P = (x, side, v) => tpx(c, x, side, v);
    ctx.fillStyle = cw.toe;
    ctx.fillRect(0, 0, W, H);
    for (const side of [1, -1]) {
      // double piqûre le long du bord festonné
      for (const dv of [0.035, 0.07]) {
        ctx.save();
        ctx.beginPath();
        for (let x = XF_T + 0.05, i = 0; x <= 1.42; x += 0.006, i++) {
          const [a, b] = P(x, side, tTop(x) - dv);
          i ? ctx.lineTo(a, b) : ctx.moveTo(a, b);
        }
        ctx.setLineDash([14 * k, 10 * k]);
        ctx.strokeStyle = shadeHex(cw.toe, lum(cw.toe) > 0.3 ? -0.3 : 0.3);
        ctx.lineWidth = 2.4 * k;
        ctx.stroke();
        ctx.restore();
      }
      // perforations d'aération sur le flanc du bout
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          const [a, b] = P(1.1 + i * 0.05 + j * 0.025, side, 0.42 + j * 0.13);
          ctx.beginPath();
          ctx.arc(a, b, 6.5 * k, 0, PI * 2);
          ctx.fillStyle = '#0b0b0c';
          ctx.fill();
          ctx.strokeStyle = shadeHex(cw.toe, 0.18);
          ctx.lineWidth = 2 * k;
          ctx.stroke();
        }
      }
    }
  }

  /* ---------------- décor des textures selon le coloris ---------------- */
  // `logos` : logos de la marque relevés sur les photos (coloris photo), sinon monogramme dessiné
  function drawTongue(cw, logos = null) {
    const c = tongueColor, ctx = c.getContext('2d'), W = c.width, H = c.height;
    // maille respirante (u = travers, v = long ; le haut de la languette est en haut du canvas)
    ctx.fillStyle = ctx.createPattern(netTile(W * 0.05, cw.tongue, cw.perf), 'repeat');
    ctx.fillRect(0, 0, W, H);
    // bords gansés
    ctx.fillStyle = cw.skin;
    ctx.fillRect(0, 0, W * 0.05, H);
    ctx.fillRect(W * 0.95, 0, W * 0.05, H);
    // renfort lisse en haut de la languette, porte le monogramme
    const y1 = H * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, y1 - H * 0.04);
    ctx.quadraticCurveTo(W / 2, y1 + H * 0.05, 0, y1 - H * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.setLineDash([9, 7]);
    ctx.strokeStyle = cw.thread;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, y1 - H * 0.055);
    ctx.quadraticCurveTo(W / 2, y1 + H * 0.035, W, y1 - H * 0.055);
    ctx.stroke();
    ctx.strokeRect(W * 0.07, H * 0.01, W * 0.86, H * 0.97);
    ctx.restore();
    ctx.save();
    ctx.translate(W / 2, H * 0.19);
    if (logos) {
      // kangourou gris foncé, comme sur la languette du modèle
      const img = tint(logos.tongue, shadeHex(cw.line, -0.2));
      ctx.scale(-1, 1);
      ctx.drawImage(img, -W * 0.23, -H * 0.042, W * 0.46, H * 0.084);
    } else {
      ctx.rotate(PI);
      ctx.fillStyle = cw.label;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      crownPath(ctx, 0, -H * 0.03, W * 0.1);
      ctx.fill();
      ctx.font = `800 ${Math.round(W * 0.09)}px Archivo, Arial, sans-serif`;
      ctx.fillText('13', 0, H * 0.018);
    }
    ctx.restore();
  }
  // logo (blanc sur transparent) recoloré
  function tint(img, color) {
    const c = makeCanvas(img.width, img.height), x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }
  function drawInsole(cw, logos = null) {
    const c = insoleColor, ctx = c.getContext('2d'), W = c.width, H = c.height;
    ctx.fillStyle = cw.insole;
    ctx.fillRect(0, 0, W, H);
    // tissu de propreté : fines côtes
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1.5);
    if (logos) {
      // marquage du modèle : KANGAROO et la pointure, en blanc, côté talon
      ctx.save();
      ctx.translate(W * 0.205, H * 0.5);
      ctx.scale(-1, 1);
      ctx.drawImage(tint(logos.insole, cw.insoleInk), -W * 0.126, -H * 0.1, W * 0.252, H * 0.2);
      ctx.restore();
      return;
    }
    // marquage blanc, lisible depuis le dessus, pointe vers la droite
    ctx.save();
    ctx.translate(W * 0.34, H * 0.5);
    ctx.scale(1, -1);
    ctx.fillStyle = cw.insoleInk;
    ctx.strokeStyle = cw.insoleInk;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `400 ${Math.round(H * 0.2)}px "Aref Ruqaa", serif`;
    ctx.fillText('التلمساني', 0, -H * 0.1);
    ctx.font = `800 ${Math.round(H * 0.075)}px Archivo, Arial, sans-serif`;
    ctx.fillText('TLEMCENI', 0, H * 0.1);
    // pointure dans un cercle, comme sur le modèle
    ctx.translate(W * 0.13, 0);
    ctx.lineWidth = H * 0.012;
    ctx.beginPath();
    ctx.arc(0, 0, H * 0.075, 0, PI * 2);
    ctx.stroke();
    ctx.font = `700 ${Math.round(H * 0.075)}px Archivo, Arial, sans-serif`;
    ctx.fillText('40', 0, H * 0.004);
    ctx.restore();
  }
  function drawMidsole(cw) {
    const c = midColor, ctx = c.getContext('2d'), W = c.width, H = c.height;
    ctx.fillStyle = cw.midsole;
    ctx.fillRect(0, 0, W, H);
    midLines(ctx, W, H, (x) => {
      x.strokeStyle = cw.midLine;
      x.lineWidth = H * 0.009;
    });
  }
  // fenêtres lisses sous la semelle, en (u, w) comme les crampons
  const HEEL_WIN = [[-0.02, 0.17], [0.17, 0.15], [0.24, 0.33], [0.35, 0], [0.24, -0.33], [0.17, -0.15], [-0.02, -0.17]];
  const FORE_WIN = [[0.51, 0], [0.87, 0.28], [0.945, 0], [0.87, -0.28]];
  function drawOutsole(cw) {
    const c = outColor, ctx = c.getContext('2d'), W = c.width, H = c.height;
    ctx.fillStyle = cw.outsole;
    ctx.fillRect(0, 0, W, H);
    const UW = (u, w) => {
      const x = X0 + u * L;
      return [((x - X0) / L) * W, ((w * halfW(x, w >= 0 ? 1 : -1) + 0.6) / 1.2) * H];
    };
    const poly = (pts) => {
      ctx.beginPath();
      pts.forEach(([u, w], i) => {
        const [a, b] = UW(u, w);
        i ? ctx.lineTo(a, b) : ctx.moveTo(a, b);
      });
      ctx.closePath();
    };
    // grain de la gomme
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    const r = rng(5);
    for (let i = 0; i < 6000; i++) ctx.fillRect(r() * W, r() * H, 2, 2);
    // rainures de flexion
    ctx.strokeStyle = shade(cw.outsole, -0.2);
    ctx.lineWidth = W * 0.0035;
    for (const u of [0.405, 0.625, 0.9]) {
      ctx.beginPath();
      for (let w = -1, i = 0; w <= 1.001; w += 0.05, i++) {
        const [a, b] = UW(u + 0.025 * (1 - w * w), w);
        i ? ctx.lineTo(a, b) : ctx.moveTo(a, b);
      }
      ctx.stroke();
    }
    // fenêtres : la semelle intermédiaire apparaît, avec une facette plus claire
    for (const win of [HEEL_WIN, FORE_WIN]) {
      poly(win);
      ctx.fillStyle = cw.window;
      ctx.fill();
      ctx.strokeStyle = shade(cw.outsole, -0.35);
      ctx.lineWidth = W * 0.004;
      ctx.stroke();
      const cu = win.reduce((s, p) => s + p[0], 0) / win.length;
      poly(win.map(([u, w]) => [cu + (u - cu) * 0.55, w * 0.45]));
      ctx.fillStyle = shade(cw.window, 0.08);
      ctx.fill();
    }
    // marquage discret dans la fenêtre avant
    const [a, b] = UW(0.8, 0);
    ctx.save();
    ctx.translate(a, b);
    ctx.fillStyle = shade(cw.window, 0.2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${Math.round(H * 0.045)}px Archivo, Arial, sans-serif`;
    ctx.fillText('TLEMCENI', 0, 0);
    ctx.restore();
  }
  function shade(hex, k) {
    const c = new THREE.Color(hex);
    if (k > 0) c.lerp(new THREE.Color('#ffffff'), k);
    else c.multiplyScalar(1 + k);
    return `#${c.getHexString()}`;
  }

  /* ---------------- textures photo (le modèle réel) ---------------- */
  // Les photos du modèle en boutique, projetées sur chaque pièce par un outil de préparation
  // hors ligne, remplacent les textures dessinées quand le coloris le demande (`photo: true`).
  const PHOTO_MAPS = { upper: 'tige', counter: 'talon', toe: 'bout', midsole: 'semelle-inter', outsole: 'dessous' };
  const photoMats = { upper: matUpper, counter: matCounter, toe: matToe, midsole: matMid, outsole: matOut };
  const drawnMaps = Object.fromEntries(Object.entries(photoMats).map(([k, m]) => [k, m.map]));
  let photoMaps = null;
  function loadPhotoMaps() {
    if (!photoMaps) {
      const loader = new THREE.TextureLoader();
      const img = async (f) => {
        const im = new Image();
        im.src = new URL(`./img/tex/${f}.webp`, import.meta.url).href;
        await im.decode();
        return im;
      };
      photoMaps = Promise.all([
        ...Object.entries(PHOTO_MAPS).map(async ([k, f]) => {
          const t = await loader.loadAsync(new URL(`./img/tex/${f}${hi ? '' : '-m'}.webp`, import.meta.url).href);
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 8;
          return [k, keep(t)];
        }),
        Promise.all([img('logo-languette'), img('logo-semelle')]).then(([tongue, insole]) => ['logos', { tongue, insole }]),
      ]).then(Object.fromEntries);
    }
    return photoMaps;
  }
  function usePhoto(maps) {
    for (const [k, m] of Object.entries(photoMats)) m.map = maps ? maps[k] : drawnMaps[k];
    // logos de la marque (Kangaroo) sur la languette et la semelle intérieure
    drawTongue(lastCw, maps && maps.logos);
    matTongue.map.needsUpdate = true;
    drawInsole(lastCw, maps && maps.logos);
    matInsole.map.needsUpdate = true;
    // relief des crampons tiré de la photo du dessous (le rouge est clair sur la gomme, sombre dans les creux)
    matOut.bumpMap = maps ? maps.outsole : null;
    matOut.bumpScale = 3;
    matOut.needsUpdate = true;
    pOut.bottomLugs.forEach((m) => (m.visible = !maps)); // les crampons sont dans la photo du dessous
  }
  let colorSeq = 0;
  let lastCw = null;

  // `which` : nom d'un coloris intégré, ou palette { mesh, skin, line, accent, ... } venue de l'admin.
  // Avec `photo`, les pièces prennent les textures photo une fois chargées (promesse renvoyée).
  const xrayTint = new THREE.Color();
  function setColorway(which, { photo = false } = {}) {
    const base = typeof which === 'string' ? COLORWAYS[which] || COLORWAYS.trail : which || COLORWAYS.trail;
    const cw = derive(base);
    lastCw = cw;
    drawUpper(cw, 'color');
    upperMap.needsUpdate = true;
    drawCounter(counterColor, cw);
    matCounter.map.needsUpdate = true;
    drawToe(cw);
    matToe.map.needsUpdate = true;
    drawTongue(cw);
    matTongue.map.needsUpdate = true;
    drawInsole(cw);
    matInsole.map.needsUpdate = true;
    drawMidsole(cw);
    matMid.map.needsUpdate = true;
    drawOutsole(cw);
    matOut.map.needsUpdate = true;
    pOut.lugMat.color.set(cw.outsole);
    matLining.color.set(cw.lining);
    matCollar.color.set(cw.collar);
    matLaces.color.set(cw.laces);
    matEyelet.color.set(cw.eyelet);
    matTab.color.set(cw.tab);
    matWeb.color.set(cw.web);
    xrayTint.set(cw.accent);
    parts.laces.agletMat.color.set(shade(cw.laces, -0.12));
    for (const p of Object.values(parts)) for (const m of p.mats) m.userData.base = m.color.clone();
    for (const p of Object.values(parts)) p.group.userData.dim = -1; // force la réapplication de l'atténuation
    current = typeof which === 'string' ? which : 'custom';
    const seq = ++colorSeq;
    if (!photo) {
      usePhoto(null);
      return Promise.resolve(false);
    }
    return loadPhotoMaps().then(
      (maps) => {
        if (seq === colorSeq) usePhoto(maps);
        return true;
      },
      (err) => {
        console.warn('Textures photo indisponibles : textures dessinées à la place.', err);
        return false;
      },
    );
  }
  let current = 'trail';
  setColorway('trail');

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
    matLining.emissive.copy(xrayTint).multiplyScalar(x * 0.5);
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
    // pour l'outil de préparation des textures photo : géométrie des pièces et textures dessinées
    get bake() {
      return {
        column, colPoint, perim, arcU, halfW, rimY, spring, OY, RY, openPt, X_THROAT, X_BACK, X_RIDGE_END, X0, L, T0, midMarks,
        UH: [UH0, UH1], UT: [UT0, UT1], XF_H, XF_T, hTop, tTop,
        canvases: { upper: upperColor, counter: counterColor, toe: toeColor, midsole: midColor, outsole: outColor },
      };
    },
    dispose() {
      disposables.forEach((d) => d.dispose && d.dispose());
    },
  };
}
