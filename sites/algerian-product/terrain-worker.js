// Relief de l'Algérie, calculé dans un worker pour ne pas bloquer la page.
// Pas de modèle numérique de terrain : les reliefs connus (Atlas tellien, Djurdjura, Aurès, Atlas
// saharien, Hoggar, Tassili, ergs, chotts) sont placés à leurs coordonnées puis texturés par du bruit.
// Sortie : une image couleur (relief ombré, comme une carte) et les altitudes du maillage 3D.

/* Bruit simplex 2D --------------------------------------------------- */
const perm = new Uint8Array(512);
(function seed(s) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
})(20261003);
const GX = new Float32Array([1, -1, 1, -1, 1, -1, 0, 0]);
const GY = new Float32Array([1, 1, -1, -1, 0, 0, 1, -1]);
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
function simplex(x, y) {
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const t = (i + j) * G2;
  const x0 = x - (i - t);
  const y0 = y - (j - t);
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = 1 - i1;
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;
  const ii = i & 255;
  const jj = j & 255;
  let n = 0;
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 > 0) {
    const g = perm[ii + perm[jj]] & 7;
    t0 *= t0;
    n += t0 * t0 * (GX[g] * x0 + GY[g] * y0);
  }
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 > 0) {
    const g = perm[ii + i1 + perm[jj + j1]] & 7;
    t1 *= t1;
    n += t1 * t1 * (GX[g] * x1 + GY[g] * y1);
  }
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 > 0) {
    const g = perm[ii + 1 + perm[jj + 1]] & 7;
    t2 *= t2;
    n += t2 * t2 * (GX[g] * x2 + GY[g] * y2);
  }
  return 70 * n; // ≈ -1..1
}
function fbm(x, y, oct) {
  let a = 0.5;
  let f = 1;
  let s = 0;
  for (let o = 0; o < oct; o++) {
    s += a * simplex(x * f, y * f);
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}
function ridged(x, y, oct) {
  let a = 0.5;
  let f = 1;
  let s = 0;
  let w = 1;
  for (let o = 0; o < oct; o++) {
    let n = 1 - Math.abs(simplex(x * f, y * f));
    n *= n * w;
    w = Math.min(1, n * 2);
    s += a * n;
    f *= 2.1;
    a *= 0.5;
  }
  return s; // ≈ 0..1
}

/* Reliefs connus ----------------------------------------------------- */
const KX = Math.cos((28 * Math.PI) / 180);
// [points lon/lat], hauteur (m), largeur (°), forme
const RANGES = [
  [[[-2.2, 34.9], [-1.3, 34.75], [-0.3, 35.1], [0.6, 35.5], [1.5, 35.9], [2.5, 36.25], [3.2, 36.35]], 820, 0.34],
  [[[2.4, 36.42], [3.1, 36.4], [3.6, 36.45]], 900, 0.18],
  [[[3.75, 36.43], [4.15, 36.46], [4.6, 36.48]], 1750, 0.16],
  [[[3.6, 36.78], [4.4, 36.82], [5.0, 36.72]], 650, 0.18],
  [[[4.9, 36.5], [5.4, 36.56], [5.9, 36.62]], 1350, 0.19],
  [[[3.8, 36.05], [4.4, 35.95], [5.0, 35.75], [5.6, 35.62]], 850, 0.24],
  [[[6.2, 36.72], [7.0, 36.84], [7.7, 36.92]], 700, 0.2],
  [[[6.3, 36.32], [7.3, 36.28], [8.3, 36.4]], 760, 0.3],
  [[[5.6, 35.15], [6.2, 35.3], [6.7, 35.36], [7.2, 35.28]], 1550, 0.3],
  [[[7.3, 35.2], [8.2, 35.3], [8.6, 35.0]], 900, 0.3],
  [[[-1.8, 32.6], [-0.8, 32.9], [0.4, 33.3], [1.6, 33.7], [2.7, 34.2], [3.6, 34.6], [4.6, 34.9], [5.4, 35.0]], 1150, 0.36],
  [[[8.4, 35.3], [9.3, 35.8], [10.2, 36.3]], 900, 0.3],
  [[[-9.5, 30.8], [-8, 31.2], [-6.5, 31.7], [-5, 32.2], [-4, 32.6]], 2600, 0.45],
  [[[-5.5, 33], [-4.5, 33.5], [-3.8, 34]], 1600, 0.35],
  [[[-5.6, 35.1], [-4.5, 35.0], [-3.8, 35.0]], 1500, 0.25],
  [[[-9.5, 29.6], [-8, 30.2], [-6.5, 30.6]], 1300, 0.4],
  [[[-4.6, 37.0], [-3.3, 37.06], [-2.5, 37.12]], 2200, 0.24],
  [[[-6, 37.6], [-4, 37.7], [-2, 37.9], [-0.5, 38.5]], 950, 0.5],
  [[[6.6, 26.6], [7.6, 26.2], [8.7, 25.6], [9.8, 24.8], [10.8, 24.3]], 900, 0.45, 'mesa'],
  [[[1.2, 27.4], [2.4, 28.2], [3.4, 28.9]], 320, 1.0, 'mesa'],
];
// [lon, lat, hauteur, rayon (°), forme]
const DOMES = [
  [5.6, 23.3, 1700, 1.25, 'hoggar'],
  [8.6, 18.4, 1200, 0.9],
  [9.0, 40.1, 900, 0.55],
  [-1.6, 21.4, 250, 2.2],
];
// Chotts : [lon, lat, profondeur, rx, ry]
const CHOTTS = [
  [6.3, 34.1, 380, 0.5, 0.28],
  [4.75, 35.4, 360, 0.42, 0.17],
  [0.3, 34.15, 300, 1.1, 0.22],
  [8.4, 33.75, 350, 0.55, 0.2],
  [2.9, 34.95, 200, 0.4, 0.12],
];
// Ergs : [lon, lat, rx, ry, angle des cordons]
const ERGS = [
  [0.4, 30.4, 2.3, 1.15, 0.5],
  [7.5, 30.3, 2.1, 1.8, 0.9],
  [-2.6, 25.6, 2.6, 1.5, 0.35],
  [-5.6, 26.8, 2.6, 0.8, 0.25],
  [7.8, 27.15, 1.1, 0.45, 1.1],
  [9.1, 24.35, 0.8, 0.35, 0.7],
  [-1.4, 28.9, 0.9, 0.5, 0.45],
];

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  const qx = ax + t * dx - px;
  const qy = ay + t * dy - py;
  return Math.sqrt(qx * qx + qy * qy);
}
const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

// Flou en boîte séparable (n passes), en place
function blur(src, N, r, passes = 2) {
  let a = src;
  let b = new Float32Array(N * N);
  const k = 1 / (2 * r + 1);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < N; y++) {
      const row = y * N;
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += a[row + Math.min(N - 1, Math.max(0, x))];
      for (let x = 0; x < N; x++) {
        b[row + x] = acc * k;
        acc += a[row + Math.min(N - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < N; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += b[Math.min(N - 1, Math.max(0, y)) * N + x];
      for (let y = 0; y < N; y++) {
        a[y * N + x] = acc * k;
        acc += b[Math.min(N - 1, y + r + 1) * N + x] - b[Math.max(0, y - r) * N + x];
      }
    }
  }
  return a;
}

self.onmessage = (e) => {
  const { N, M, box, land } = e.data;
  const t0 = performance.now();
  const post = (p) => self.postMessage({ progress: p });
  const lonOf = (x, n) => box.w + ((x + 0.5) / n) * (box.e - box.w);
  const latOf = (y, n) => box.n - ((y + 0.5) / n) * (box.n - box.s);

  // 1. Masque terre/mer adouci, et version très floue pour la profondeur de la mer
  const coast = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) coast[i] = land[i] / 255;
  const far = blur(Float32Array.from(coast), N, Math.max(2, Math.round(N * 0.018)), 2);
  blur(coast, N, Math.max(1, Math.round(N * 0.0025)), 2);
  post(0.15);

  // 2. Grandes formes sur une grille réduite (chaînes, dômes, chotts, ergs), contours déformés
  const Lr = Math.max(64, N >> 2);
  const RNG = new Float32Array(Lr * Lr);
  const MESA = new Float32Array(Lr * Lr);
  const HOG = new Float32Array(Lr * Lr);
  const DEP = new Float32Array(Lr * Lr);
  const SALT = new Float32Array(Lr * Lr);
  const ERG = new Float32Array(Lr * Lr);
  const ERGA = new Float32Array(Lr * Lr);
  const LOW = new Float32Array(Lr * Lr);
  const TONE = new Float32Array(Lr * Lr);
  for (let y = 0; y < Lr; y++) {
    const lat0 = latOf(y, Lr);
    for (let x = 0; x < Lr; x++) {
      const lon0 = lonOf(x, Lr);
      const i = y * Lr + x;
      // déformation douce des coordonnées : aucune forme n'est géométrique
      const wx = fbm(lon0 * 0.55 + 7.7, lat0 * 0.55 + 1.3, 3) * 0.42;
      const wy = fbm(lon0 * 0.55 - 3.1, lat0 * 0.55 + 8.2, 3) * 0.42;
      const lon = lon0 + wx;
      const lat = lat0 + wy;
      const px = lon * KX;
      LOW[i] = fbm(lon0 * 0.3 + 11.3, lat0 * 0.3 - 4.1, 4);
      TONE[i] = fbm(lon0 * 0.16 - 21.3, lat0 * 0.16 + 5.1, 3);
      let r = 0;
      let mesa = 0;
      for (const [pts, Hh, sw, kind] of RANGES) {
        let d = 1e9;
        for (let k = 0; k < pts.length - 1; k++) {
          d = Math.min(d, segDist(px, lat, pts[k][0] * KX, pts[k][1], pts[k + 1][0] * KX, pts[k + 1][1]));
        }
        if (d > sw * 3) continue;
        const g = Math.exp(-(d * d) / (sw * sw));
        const along = 0.65 + 0.35 * simplex(px * 1.4 + Hh * 0.01, lat * 1.4);
        if (kind === 'mesa') mesa += Hh * smooth(0.22, 0.55, g * (0.8 + 0.3 * along));
        else r += Hh * g * along;
      }
      let hog = 0;
      for (const [lo, la, Hh, rad, kind] of DOMES) {
        const dx = (lon - lo) * KX;
        const dy = lat - la;
        const dd = Math.sqrt(dx * dx + dy * dy);
        if (dd > rad * 3.2) continue;
        const g = Math.exp(-(dd * dd) / (rad * rad));
        if (kind === 'hoggar') {
          hog += g;
          r += Hh * g * (0.7 + 0.3 * simplex(dx * 1.6, dy * 1.6));
          // arc irrégulier des Tassili du Hoggar
          const dr = dd - rad * (1.7 + 0.25 * simplex(Math.atan2(dy, dx) * 1.3, 4.2));
          const arc = smooth(-0.2, 0.5, simplex(Math.atan2(dy, dx) * 0.9 + 2, 1.1));
          mesa += 480 * arc * smooth(0.25, 0.65, Math.exp(-(dr * dr) / 0.1));
        } else r += Hh * g;
      }
      let dep = 0;
      let salt = 0;
      for (const [lo, la, D, rx, ry] of CHOTTS) {
        const dx = (lon - lo) / rx;
        const dy = (lat - la) / ry;
        const d2 = dx * dx + dy * dy;
        if (d2 > 6) continue;
        const g = Math.exp(-d2 * 1.4);
        dep -= D * g;
        salt = Math.max(salt, smooth(0.35, 0.75, g));
      }
      let erg = 0;
      let ang = 0;
      for (const [lo, la, rx, ry, a] of ERGS) {
        const dx = (lon - lo) / rx;
        const dy = (lat - la) / ry;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.22 * simplex(lon0 * 1.1 + lo, lat0 * 1.1 + la);
        const m = 1 - smooth(0.6, 1.05, d);
        if (m > erg) {
          erg = m;
          ang = a;
        }
      }
      RNG[i] = r;
      MESA[i] = mesa;
      HOG[i] = hog;
      DEP[i] = dep;
      SALT[i] = salt;
      ERG[i] = erg;
      ERGA[i] = ang;
    }
  }
  post(0.35);

  const sampleL = (A, fx, fy) => {
    const x = Math.max(0, Math.min(Lr - 1.001, fx));
    const y = Math.max(0, Math.min(Lr - 1.001, fy));
    const x0 = x | 0;
    const y0 = y | 0;
    const tx = x - x0;
    const ty = y - y0;
    const i = y0 * Lr + x0;
    return lerp(lerp(A[i], A[i + 1], tx), lerp(A[i + Lr], A[i + Lr + 1], tx), ty);
  };

  // 3. Altitudes pleine résolution + couleurs de base
  const H = new Float32Array(N * N);
  const alb = new Float32Array(N * N * 3);
  const sc = Lr / N;
  for (let y = 0; y < N; y++) {
    const lat = latOf(y, N);
    const fy = (y + 0.5) * sc - 0.5;
    for (let x = 0; x < N; x++) {
      const i = y * N + x;
      const lon = lonOf(x, N);
      const fx = (x + 0.5) * sc - 0.5;
      const c = coast[i];
      const n1 = sampleL(LOW, fx, fy);
      const tone = sampleL(TONE, fx, fy);
      let h;
      let erg = 0;
      let salt = 0;
      let rng = 0;
      let hog = 0;
      let mesa = 0;
      if (c > 0.02) {
        rng = sampleL(RNG, fx, fy);
        mesa = sampleL(MESA, fx, fy);
        hog = sampleL(HOG, fx, fy);
        const dep = sampleL(DEP, fx, fy);
        salt = sampleL(SALT, fx, fy);
        erg = sampleL(ERG, fx, fy);
        const plateau = 620 * smooth(33.9, 34.6, lat) * (1 - smooth(35.7, 36.4, lat)) * smooth(-2.5, -1, lon) * (1 - smooth(7, 8.5, lon));
        // crêtes allongées : plis SO-NE de l'Atlas, NO-SE au Tassili
        const south = lat < 28 ? 1 : 0;
        const ca = south ? 0.82 : 0.91;
        const sa = south ? -0.57 : 0.42;
        const u = lon * KX * ca + lat * sa;
        const v = -lon * KX * sa + lat * ca;
        const rid = rng > 40 || hog > 0.05 ? ridged(u * 0.95 + 3.7, v * 2.7 + 9.1, 5) : 0.45;
        const det = simplex(lon * 7.1, lat * 7.1) * 0.6 + simplex(lon * 15.3, lat * 15.3) * 0.4;
        const canyon = mesa > 60 ? 1 - 0.5 * Math.pow(1 - ridged(u * 1.6 + 1.7, v * 4.2 - 6.3, 3), 4) : 1;
        h = 330 + 200 * n1 + plateau + rng * (0.2 + 1.15 * rid) + mesa * canyon + dep + det * (30 + rng * 0.08) + hog * 900 * Math.pow(rid, 3);
        if (erg > 0.01) {
          const a = sampleL(ERGA, fx, fy);
          const warp = fbm(lon * 0.9 + 5, lat * 0.9 - 2, 2) * 2.2;
          const u = (lon * KX * Math.cos(a) + lat * Math.sin(a)) * 26 + warp * 6;
          const v = (lon * KX * Math.cos(a + 1.3) + lat * Math.sin(a + 1.3)) * 17 + warp * 4;
          const d1 = 1 - Math.abs(Math.sin(u));
          const d2 = 1 - Math.abs(Math.sin(v));
          const dune = Math.pow(d1, 2.2) * 0.7 + Math.pow(d2, 3) * 0.45;
          h += erg * (40 + 230 * dune * (0.65 + 0.35 * simplex(lon * 1.7, lat * 1.7)));
        }
      } else h = 0;
      const depth = -140 - 2700 * smooth(0.05, 0.6, 1 - far[i] * 1.6);
      const t = smooth(0.42, 0.58, c);
      H[i] = lerp(depth, Math.max(4, h), t);

      // Couleurs (0..1), sobres et chaudes
      let r = 0.77;
      let g = 0.63;
      let b = 0.47;
      const ham = smooth(-0.1, 0.5, tone) * 0.55 + smooth(0.2, 0.6, n1) * 0.2;
      r = lerp(r, 0.58, ham);
      g = lerp(g, 0.47, ham);
      b = lerp(b, 0.38, ham);
      const steppe = smooth(33.6, 34.4, lat);
      r = lerp(r, 0.66, steppe * 0.7);
      g = lerp(g, 0.6, steppe * 0.7);
      b = lerp(b, 0.44, steppe * 0.7);
      const north = smooth(35.2, 36.4, lat) * (lat < 37.6 ? 1 : 0.6);
      const green = north * (0.55 + 0.45 * smooth(200, 1200, h));
      r = lerp(r, 0.47, green * 0.78);
      g = lerp(g, 0.47, green * 0.78);
      b = lerp(b, 0.32, green * 0.78);
      if (erg > 0) {
        r = lerp(r, 0.85, erg * 0.85);
        g = lerp(g, 0.62, erg * 0.85);
        b = lerp(b, 0.39, erg * 0.85);
      }
      const rock = smooth(0.15, 0.7, hog) + smooth(500, 1400, rng) * (1 - north) * 0.6;
      r = lerp(r, 0.36, rock * 0.75);
      g = lerp(g, 0.3, rock * 0.75);
      b = lerp(b, 0.27, rock * 0.75);
      if (mesa > 50) {
        const m = smooth(100, 600, mesa) * (1 - north);
        r = lerp(r, 0.5, m * 0.55);
        g = lerp(g, 0.38, m * 0.55);
        b = lerp(b, 0.3, m * 0.55);
      }
      if (salt > 0) {
        r = lerp(r, 0.9, salt * 0.85);
        g = lerp(g, 0.87, salt * 0.85);
        b = lerp(b, 0.81, salt * 0.85);
      }
      const cn = 1 + 0.035 * simplex(lon * 2.1 + 40, lat * 2.1);
      // Mer : du turquoise sombre près des côtes au bleu nuit au large
      const sd = smooth(-2800, -120, H[i]);
      const sr = lerp(0.03, 0.09, sd);
      const sg = lerp(0.08, 0.2, sd);
      const sb = lerp(0.12, 0.25, sd);
      alb[i * 3] = lerp(sr, r * cn, t);
      alb[i * 3 + 1] = lerp(sg, g * cn, t);
      alb[i * 3 + 2] = lerp(sb, b * cn, t);
    }
    if ((y & 63) === 0) post(0.35 + (0.45 * y) / N);
  }

  // 4. Ombrage du relief (lumière du nord-ouest, comme une carte) et image finale
  const HB = blur(Float32Array.from(H), N, Math.max(2, Math.round(N * 0.006)), 2);
  const color = new Uint8ClampedArray(N * N * 4);
  const cellX = ((box.e - box.w) / N) * 111000 * KX;
  const cellY = ((box.n - box.s) / N) * 111000;
  const Z = 9;
  const alt = (38 * Math.PI) / 180;
  const Lx = -Math.cos(alt) * Math.SQRT1_2;
  const Ly = -Math.cos(alt) * Math.SQRT1_2;
  const Lz = Math.sin(alt);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = y * N + x;
      const hl = H[y * N + Math.max(0, x - 1)];
      const hr = H[y * N + Math.min(N - 1, x + 1)];
      const hu = H[Math.max(0, y - 1) * N + x];
      const hd = H[Math.min(N - 1, y + 1) * N + x];
      const land = H[i] > 0 ? 1 : 0.25;
      const dx = ((hr - hl) / (2 * cellX)) * Z * land;
      const dy = ((hd - hu) / (2 * cellY)) * Z * land;
      const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const s = Math.max(0, (-dx * Lx - dy * Ly + Lz) * inv) / Lz;
      const ao = H[i] > 0 ? Math.max(0.72, Math.min(1.12, 1 + (H[i] - HB[i]) / 900)) : 1;
      const k = (0.3 + 0.74 * Math.min(1.6, s)) * ao;
      const o = i * 4;
      color[o] = Math.min(255, alb[i * 3] * k * 255);
      color[o + 1] = Math.min(255, alb[i * 3 + 1] * k * 255);
      color[o + 2] = Math.min(255, alb[i * 3 + 2] * k * 255);
      color[o + 3] = 255;
    }
  }
  post(0.92);

  // 5. Altitudes du maillage (M+1 × M+1 sommets)
  const mesh = new Float32Array((M + 1) * (M + 1));
  for (let y = 0; y <= M; y++) {
    for (let x = 0; x <= M; x++) {
      const fx = Math.min(N - 1.001, (x / M) * (N - 1));
      const fy = Math.min(N - 1.001, (y / M) * (N - 1));
      const x0 = fx | 0;
      const y0 = fy | 0;
      const tx = fx - x0;
      const ty = fy - y0;
      const i = y0 * N + x0;
      mesh[y * (M + 1) + x] = lerp(lerp(H[i], H[i + 1], tx), lerp(H[i + N], H[i + N + 1], tx), ty);
    }
  }
  self.postMessage({ done: true, color, mesh, ms: Math.round(performance.now() - t0) }, [color.buffer, mesh.buffer]);
};
