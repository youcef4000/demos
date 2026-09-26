// Dar Nour — appartement témoin en 3D temps réel.
// Tout est construit dans le code (géométries + textures dessinées sur canvas) :
// aucun modèle ni photo à télécharger. La caméra suit un chemin piloté par le scroll.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const H = 3.2; // hauteur sous plafond

/* ------------------------------------------------------------------ */
/* Aléatoire déterministe                                              */
/* ------------------------------------------------------------------ */
function rng(seed) {
  let s = (seed * 9301 + 49297) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Textures dessinées                                                  */
/* ------------------------------------------------------------------ */
function canvasTex(w, h, draw, { srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
}

// Parquet en point de Hongrie (chevron), raccordable.
function parquetTex() {
  return canvasTex(1024, 1024, (ctx, W, Hh) => {
    const C = 128, P = 64, N = Hh / P;
    const tones = ['#b08a62', '#a48059', '#ba946b', '#9a7652', '#b38d65', '#c09c74', '#a7835c'];
    ctx.fillStyle = '#5a3d25';
    ctx.fillRect(0, 0, W, Hh);
    for (let c = 0; c < W / C; c++) {
      const x0 = c * C, s = c % 2 === 0 ? 1 : -1;
      for (let row = -3; row < N + 3; row++) {
        const rmod = ((row % N) + N) % N;
        const r = rng(c * 131 + rmod * 7 + 3);
        const yL = row * P + (s > 0 ? 0 : C);
        const yR = row * P + (s > 0 ? C : 0);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x0, yL);
        ctx.lineTo(x0 + C, yR);
        ctx.lineTo(x0 + C, yR + P);
        ctx.lineTo(x0, yL + P);
        ctx.closePath();
        ctx.fillStyle = tones[Math.floor(r() * tones.length)];
        ctx.fill();
        ctx.clip();
        // veinage parallèle à la lame
        ctx.translate(x0, yL);
        ctx.rotate(s * Math.PI / 4);
        for (let i = 0; i < 16; i++) {
          const off = r() * P * 0.72;
          ctx.strokeStyle = r() > 0.5 ? 'rgba(70,40,20,0.16)' : 'rgba(255,230,190,0.10)';
          ctx.lineWidth = 0.6 + r() * 1.6;
          ctx.beginPath();
          const ph = r() * 6;
          for (let x = -20; x <= 220; x += 10) {
            const y = off + Math.sin(x * 0.03 + ph) * 1.6;
            x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        // léger dégradé par lame
        const g = ctx.createLinearGradient(0, 0, 181, 0);
        g.addColorStop(0, 'rgba(0,0,0,0.05)');
        g.addColorStop(1, 'rgba(255,255,255,0.04)');
        ctx.fillStyle = g;
        ctx.fillRect(-10, -10, 220, 80);
        ctx.restore();
        // joint
        ctx.strokeStyle = 'rgba(45,28,15,0.55)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x0, yL);
        ctx.lineTo(x0 + C, yR);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(45,28,15,0.45)';
      ctx.beginPath();
      ctx.moveTo(x0 + 0.5, 0);
      ctx.lineTo(x0 + 0.5, Hh);
      ctx.stroke();
    }
  });
}

// Marbre (Calacatta par défaut, Nero Marquina en variante sombre).
function marbleTex(seed = 3, { dark = false, tiles = 0, soft = false } = {}) {
  return canvasTex(1024, 1024, (ctx, W, Hh) => {
    const r = rng(seed);
    const g = ctx.createLinearGradient(0, 0, W, Hh);
    if (dark) {
      g.addColorStop(0, '#1d1c1b');
      g.addColorStop(1, '#141312');
    } else {
      g.addColorStop(0, '#f6f2ec');
      g.addColorStop(1, '#ebe5db');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, Hh);
    for (let i = 0; i < 70; i++) {
      const x = r() * W, y = r() * Hh, rad = 40 + r() * 180;
      const gg = ctx.createRadialGradient(x, y, 0, x, y, rad);
      const c = dark ? '60,58,55' : '196,188,176';
      gg.addColorStop(0, `rgba(${c},${dark ? 0.18 : 0.12})`);
      gg.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = gg;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    const vein = (x, y, a, steps, width, alpha, col) => {
      const pts = [[x, y]];
      for (let s = 0; s < steps; s++) {
        a += (r() - 0.5) * 0.55;
        x += Math.cos(a) * 9;
        y += Math.sin(a) * 9;
        pts.push([x, y]);
      }
      const passes = [[7, 0.06], [3, 0.16], [1, 0.8]];
      for (const [wm, am] of passes) {
        ctx.strokeStyle = col;
        ctx.globalAlpha = alpha * am;
        ctx.lineWidth = width * wm;
        ctx.lineCap = ctx.lineJoin = 'round';
        ctx.beginPath();
        pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      return pts;
    };
    const main = dark ? '#e9e4dc' : '#7b7266';
    const gold = dark ? '#c9b9a0' : '#b39b77';
    const k = soft ? 0.45 : 1;
    for (let i = 0; i < (soft ? 3 : 6); i++) {
      const pts = vein(r() * W * 0.3 - 100, r() * Hh, -0.5 + r() * 0.4, 150, (1.4 + r() * 2.2) * k, dark ? 0.55 : 0.6 * (soft ? 0.7 : 1), i % 3 === 0 ? gold : main);
      for (let b = 0; b < (soft ? 2 : 4); b++) {
        const p = pts[Math.floor(r() * pts.length)];
        vein(p[0], p[1], -0.5 + (r() - 0.5) * 2, 30 + r() * 40, 0.5 + r() * 0.8, 0.45, main);
      }
    }
    for (let i = 0; i < (soft ? 10 : 26); i++) vein(r() * W, r() * Hh, r() * 6.28, 20 + r() * 60, 0.4 + r() * 0.6, soft ? 0.18 : 0.3, main);
    if (tiles) {
      ctx.strokeStyle = dark ? 'rgba(0,0,0,0.6)' : 'rgba(150,140,128,0.55)';
      ctx.lineWidth = 2;
      for (let i = 0; i <= tiles; i++) {
        const p = (i * W) / tiles;
        ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, Hh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(W, p); ctx.stroke();
      }
    }
  });
}

// Bois (noyer ou teck), veinage vertical.
function woodTex(seed, base, { planks = 0, w = 512, h = 1024 } = {}) {
  return canvasTex(w, h, (ctx, W, Hh) => {
    const r = rng(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, Hh);
    const pw = planks ? W / planks : W;
    for (let p = 0; p < (planks || 1); p++) {
      const shade = (r() - 0.5) * 0.14;
      ctx.fillStyle = shade > 0 ? `rgba(255,235,200,${shade})` : `rgba(30,15,5,${-shade})`;
      ctx.fillRect(p * pw, 0, pw, Hh);
    }
    for (let i = 0; i < 260; i++) {
      const x = r() * W;
      ctx.strokeStyle = r() > 0.55 ? `rgba(35,18,8,${0.08 + r() * 0.2})` : `rgba(255,225,180,${0.04 + r() * 0.08})`;
      ctx.lineWidth = 0.5 + r() * 2.2;
      ctx.beginPath();
      const ph = r() * 6, amp = 1 + r() * 4, fr = 0.004 + r() * 0.01;
      for (let y = 0; y <= Hh; y += 16) {
        const xx = x + Math.sin(y * fr + ph) * amp;
        y === 0 ? ctx.moveTo(xx, y) : ctx.lineTo(xx, y);
      }
      ctx.stroke();
    }
    if (planks) {
      ctx.fillStyle = 'rgba(25,14,6,0.7)';
      for (let p = 0; p <= planks; p++) ctx.fillRect(p * pw - 1.5, 0, 3, Hh);
      for (let p = 0; p < planks; p++) {
        const y = r() * Hh;
        ctx.fillRect(p * pw, y, pw, 2);
      }
    }
  });
}

// Normal map cannelée (bois cannelé, verre cannelé, tête de lit).
function flutedNormal(count = 8) {
  return canvasTex(512, 4, (ctx, W, Hh) => {
    const img = ctx.createImageData(W, Hh);
    const fw = W / count;
    for (let x = 0; x < W; x++) {
      const t = (x % fw) / fw;
      const nx = (t * 2 - 1) * 0.9;
      const nz = Math.sqrt(1 - nx * nx);
      for (let y = 0; y < Hh; y++) {
        const i = (y * W + x) * 4;
        img.data[i] = (nx * 0.5 + 0.5) * 255;
        img.data[i + 1] = 128;
        img.data[i + 2] = (nz * 0.5 + 0.5) * 255;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, { srgb: false });
}

// Rides de l'eau de la piscine (normal map raccordable).
function rippleNormal() {
  return canvasTex(256, 256, (ctx, W, Hh) => {
    const img = ctx.createImageData(W, Hh);
    const waves = [[1, 2, 0.8, 0.3], [3, -1, 0.5, 1.7], [-2, 3, 0.4, 2.4], [5, 4, 0.18, 0.6], [-6, 5, 0.14, 4.1]];
    for (let y = 0; y < Hh; y++) {
      for (let x = 0; x < W; x++) {
        let dx = 0, dy = 0;
        for (const [kx, ky, a, p] of waves) {
          const ph = ((kx * x + ky * y) / W) * Math.PI * 2 + p;
          const c = Math.cos(ph) * a;
          dx += c * kx;
          dy += c * ky;
        }
        const n = new THREE.Vector3(-dx * 0.12, -dy * 0.12, 1).normalize();
        const i = (y * W + x) * 4;
        img.data[i] = (n.x * 0.5 + 0.5) * 255;
        img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
        img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, { srgb: false });
}

// Tapis berbère : laine écrue, losanges fins couleur charbon.
function rugTex(seed = 5) {
  return canvasTex(1024, 1024, (ctx, W, Hh) => {
    const r = rng(seed);
    ctx.fillStyle = '#ece4d6';
    ctx.fillRect(0, 0, W, Hh);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(150,130,105,0.16)';
      ctx.fillRect(r() * W, r() * Hh, 2 + r() * 3, 2 + r() * 3);
    }
    ctx.strokeStyle = 'rgba(48,42,38,0.75)';
    ctx.lineWidth = 5;
    const m = 70;
    ctx.strokeRect(m, m, W - m * 2, Hh - m * 2);
    ctx.lineWidth = 3;
    ctx.strokeRect(m + 26, m + 26, W - (m + 26) * 2, Hh - (m + 26) * 2);
    // frise de losanges
    const band = (x0, y0, x1, y1) => {
      const len = Math.hypot(x1 - x0, y1 - y0), n = Math.floor(len / 34);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 9); ctx.lineTo(cx + 9, cy); ctx.lineTo(cx, cy + 9); ctx.lineTo(cx - 9, cy); ctx.closePath();
        ctx.stroke();
      }
    };
    ctx.lineWidth = 2.4;
    const b = m + 13;
    band(b, b, W - b, b); band(b, Hh - b, W - b, Hh - b); band(b, b, b, Hh - b); band(W - b, b, W - b, Hh - b);
    // grands losanges au centre
    ctx.lineWidth = 4;
    for (let i = -1; i <= 1; i++) {
      const cx = W / 2, cy = Hh / 2 + i * 230;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 100); ctx.lineTo(cx + 70, cy); ctx.lineTo(cx, cy + 100); ctx.lineTo(cx - 70, cy); ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 50); ctx.lineTo(cx + 35, cy); ctx.lineTo(cx, cy + 50); ctx.lineTo(cx - 35, cy); ctx.closePath();
      ctx.stroke();
    }
  });
}

// Œuvres d'art (abstraites, faites maison).
function artTex(kind) {
  return canvasTex(768, 768, (ctx, W, Hh) => {
    const r = rng(kind.length * 17);
    const grain = (a = 0.06) => {
      for (let i = 0; i < 12000; i++) {
        ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
        ctx.fillRect(r() * W, r() * Hh, 1.5, 1.5);
      }
    };
    if (kind === 'arches') {
      ctx.fillStyle = '#e7d9c4'; ctx.fillRect(0, 0, W, Hh);
      ctx.fillStyle = '#b5613c';
      ctx.beginPath(); ctx.moveTo(150, Hh); ctx.lineTo(150, 380); ctx.arc(384, 380, 234, Math.PI, 0); ctx.lineTo(618, Hh); ctx.fill();
      ctx.fillStyle = '#e3ae55';
      ctx.beginPath(); ctx.arc(384, 400, 110, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5f6440';
      ctx.beginPath(); ctx.moveTo(0, 610);
      for (let x = 0; x <= W; x += 32) ctx.lineTo(x, 600 + Math.sin(x * 0.012) * 26);
      ctx.lineTo(W, Hh); ctx.lineTo(0, Hh); ctx.fill();
      grain();
    } else if (kind === 'casbah') {
      const g = ctx.createLinearGradient(0, 0, 0, Hh);
      g.addColorStop(0, '#1e2b47'); g.addColorStop(1, '#2f4a6b');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);
      for (let i = 0; i < 140; i++) {
        const y = 300 + r() * 470, spread = (y - 280) * 0.9;
        const x = W / 2 + (r() - 0.5) * spread * 1.4;
        const w = 30 + r() * 50, h = 22 + r() * 34;
        const l = 225 + Math.floor(r() * 30);
        ctx.fillStyle = `rgb(${l},${l - 4},${l - 12})`;
        ctx.fillRect(x - w / 2, y - h, w, h);
        ctx.fillStyle = 'rgba(30,43,71,0.55)';
        ctx.fillRect(x - w / 2 + w * 0.6, y - h * 0.7, w * 0.14, h * 0.3);
      }
      ctx.fillStyle = '#f2d9a6';
      ctx.beginPath(); ctx.arc(560, 150, 38, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1f2c48';
      ctx.beginPath(); ctx.arc(576, 140, 34, 0, Math.PI * 2); ctx.fill();
      grain(0.05);
    } else if (kind === 'horizon') {
      const g = ctx.createLinearGradient(0, 0, 0, Hh);
      g.addColorStop(0, '#d9d2c6'); g.addColorStop(0.52, '#efd3b4'); g.addColorStop(0.53, '#9aa5a4'); g.addColorStop(1, '#6f7f84');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);
      ctx.fillStyle = 'rgba(245,190,140,0.8)';
      ctx.beginPath(); ctx.arc(W * 0.66, Hh * 0.47, 48, Math.PI, 0); ctx.fill();
      grain(0.05);
    } else {
      ctx.fillStyle = '#efe7da'; ctx.fillRect(0, 0, W, Hh);
      const cols = ['#b5613c', '#c9a15a', '#5f6440', '#2b3a55'];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = cols[i];
        ctx.beginPath();
        ctx.arc(200 + i * 120, 380 + (i % 2) * 60, 120 - i * 12, 0, Math.PI * 2);
        ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
      }
      grain();
    }
  });
}

function glowTex() {
  return canvasTex(128, 128, (ctx, W) => {
    const g = ctx.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.12)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, W);
  });
}

function blobTex() {
  return canvasTex(128, 128, (ctx, W) => {
    const g = ctx.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
    g.addColorStop(0, 'rgba(0,0,0,0.8)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.35)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, W);
  });
}

function numberTex(text) {
  return canvasTex(256, 128, (ctx, W, Hh) => {
    ctx.clearRect(0, 0, W, Hh);
    ctx.fillStyle = '#ffffff';
    ctx.font = '300 92px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, Hh / 2 + 4);
  });
}

/* ------------------------------------------------------------------ */
/* Ciel et mer                                                         */
/* ------------------------------------------------------------------ */
const SKY_GLSL = /* glsl */ `
  uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHor; uniform vec3 uLow;
  uniform vec3 uSun; uniform vec3 uSunCol; uniform vec3 uCloud;
  float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x){
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }
  vec3 skyCol(vec3 d){
    float h = d.y;
    vec3 c = mix(uHor, uMid, smoothstep(0.0, 0.2, h));
    c = mix(c, uTop, smoothstep(0.16, 0.72, h));
    c = mix(c, uLow, smoothstep(0.0, -0.06, h));
    float s = max(dot(d, uSun), 0.0);
    float band = smoothstep(0.012, 0.05, h) * (1.0 - smoothstep(0.07, 0.24, h));
    float n = fbm(d * vec3(5.0, 38.0, 5.0));
    float cl = band * smoothstep(0.5, 0.78, n);
    c = mix(c, uCloud + uSunCol * pow(s, 4.0) * 0.6, cl * 0.75);
    c += uSunCol * (pow(s, 1400.0) * 9.0 * (1.0 - cl) + pow(s, 70.0) * 0.5 + pow(s, 6.0) * 0.22);
    c += uSunCol * 0.22 * pow(s, 2.0) * (1.0 - smoothstep(0.0, 0.28, abs(h)));
    return c;
  }
`;

function makeSky(u) {
  const mat = new THREE.ShaderMaterial({
    uniforms: u,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize((modelMatrix * vec4(position, 1.0)).xyz - cameraPosition); gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `${SKY_GLSL}
      varying vec3 vDir;
      void main(){ gl_FragColor = vec4(skyCol(normalize(vDir)), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(9000, 48, 24), mat);
  m.frustumCulled = false;
  m.renderOrder = -10;
  return m;
}

function makeSea(u) {
  const mat = new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `${SKY_GLSL}
      uniform float uTime; uniform vec3 uDeep;
      varying vec3 vW;
      void main(){
        vec3 V = normalize(vW - cameraPosition);
        float dist = length(vW - cameraPosition);
        vec2 p = vW.xz; float t = uTime;
        vec2 g = vec2(0.0);
        g += 0.050 * vec2(0.8, 0.6) * cos(dot(vec2(0.8, 0.6), p) * 0.045 + t * 0.9);
        g += 0.040 * vec2(-0.5, 0.86) * cos(dot(vec2(-0.5, 0.86), p) * 0.07 + t * 1.1);
        g += 0.030 * vec2(0.3, -0.95) * cos(dot(vec2(0.3, -0.95), p) * 0.13 + t * 1.5);
        g += 0.020 * vec2(-0.9, -0.4) * cos(dot(vec2(-0.9, -0.4), p) * 0.23 + t * 1.9);
        g *= 1.0 - smoothstep(600.0, 4000.0, dist) * 0.8;
        vec3 N = normalize(vec3(-g.x * 6.0, 1.0, -g.y * 6.0));
        vec3 R = reflect(V, N); R.y = abs(R.y);
        float F = 0.02 + 0.98 * pow(1.0 - max(dot(N, -V), 0.0), 5.0);
        vec3 col = mix(uDeep, skyCol(R), clamp(F, 0.0, 1.0));
        float s = max(dot(R, uSun), 0.0);
        col += uSunCol * (pow(s, 380.0) * 5.0 + pow(s, 40.0) * 0.35);
        col = mix(col, uHor * 0.92 + uLow * 0.08, smoothstep(1500.0, 8500.0, dist) * 0.85);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), mat);
  m.rotation.x = -Math.PI / 2;
  m.frustumCulled = false;
  return m;
}

// Eau de la piscine : turquoise vu d'en haut, reflète le couchant en rasant.
function makePoolWater(u) {
  const mat = new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `${SKY_GLSL}
      uniform float uTime;
      varying vec3 vW;
      void main(){
        vec3 V = normalize(vW - cameraPosition);
        vec2 p = vW.xz; float t = uTime;
        vec2 g = vec2(0.0);
        g += 0.020 * vec2(0.8, 0.6) * cos(dot(vec2(0.8, 0.6), p) * 3.1 + t * 1.3);
        g += 0.016 * vec2(-0.5, 0.86) * cos(dot(vec2(-0.5, 0.86), p) * 4.7 + t * 1.7);
        g += 0.010 * vec2(0.3, -0.95) * cos(dot(vec2(0.3, -0.95), p) * 8.3 + t * 2.1);
        vec3 N = normalize(vec3(-g.x * 3.0, 1.0, -g.y * 3.0));
        vec3 R = reflect(V, N); R.y = abs(R.y);
        float F = 0.02 + 0.98 * pow(1.0 - max(dot(N, -V), 0.0), 5.0);
        float caust = 0.5 + 0.5 * sin(p.x * 6.0 + sin(p.y * 5.0 + t) * 1.5 + t * 0.8) * sin(p.y * 7.0 - t * 0.6);
        vec3 body = mix(vec3(0.03, 0.30, 0.36), vec3(0.10, 0.55, 0.58), caust * 0.35);
        vec3 col = mix(body, skyCol(R) * 0.9, clamp(F * 1.1, 0.0, 1.0));
        float s = max(dot(R, uSun), 0.0);
        col += uSunCol * (pow(s, 500.0) * 4.0 + pow(s, 60.0) * 0.25);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  return mat;
}

// Ville en contrebas : îlots sombres, rues ponctuées de lampadaires, fenêtres allumées.
function cityTex() {
  const t = canvasTex(1024, 1024, (ctx, W, Hh) => {
    const r = rng(77);
    ctx.fillStyle = '#17171e';
    ctx.fillRect(0, 0, W, Hh);
    const cell = 32;
    for (let y = 0; y < Hh; y += cell) {
      for (let x = 0; x < W; x += cell) {
        if (r() < 0.1) continue;
        const l = 26 + Math.floor(r() * 16);
        ctx.fillStyle = `rgb(${l},${l},${l + 7})`;
        const m = 3 + r() * 4;
        ctx.fillRect(x + m, y + m, cell - m * 2, cell - m * 2);
        for (let k = 0; k < 4; k++) {
          if (r() > 0.6) {
            ctx.fillStyle = r() > 0.5 ? 'rgba(255,205,140,0.9)' : 'rgba(255,230,190,0.7)';
            ctx.fillRect(x + m + r() * (cell - m * 2 - 2), y + m + r() * (cell - m * 2 - 2), 1.6, 1.6);
          }
        }
      }
    }
    ctx.fillStyle = 'rgba(255,180,100,0.3)';
    for (let i = 0; i < W; i += cell * 8) {
      for (let j = 0; j < Hh; j += 13) {
        ctx.fillRect(i - 1, j, 2, 2);
        ctx.fillRect(j, i - 1, 2, 2);
      }
    }
  });
  t.center.set(0.5, 0.5);
  t.rotation = 0.32;
  return t;
}

// Façade de la tour : dalles blanches, vitrages sombres, quelques fenêtres allumées.
// Une tuile = 12 m de large × 8 étages (26,4 m).
function facadeTex() {
  const r = rng(11);
  const lit = [];
  const cols = 6, floors = 8;
  for (let j = 0; j < floors; j++) for (let i = 0; i < cols; i++) lit.push(r() > 0.84 ? (r() > 0.5 ? 1 : 2) : 0);
  const draw = (glowOnly) => (ctx, W, Hh) => {
    ctx.fillStyle = glowOnly ? '#000' : '#272c36';
    ctx.fillRect(0, 0, W, Hh);
    const fh = Hh / floors, cw = W / cols;
    for (let j = 0; j < floors; j++) {
      for (let i = 0; i < cols; i++) {
        const L = lit[j * cols + i];
        if (L) {
          ctx.fillStyle = glowOnly ? (L === 1 ? '#e8a868' : '#b8804e') : (L === 1 ? '#8f6a47' : '#7a5a3e');
          ctx.fillRect(i * cw + 6, j * fh + 26, cw - 12, fh - 30);
        }
      }
      if (!glowOnly) {
        ctx.fillStyle = '#e6dfd3';
        ctx.fillRect(0, j * fh, W, 22);
        ctx.fillStyle = 'rgba(230,223,211,0.55)';
        ctx.fillRect(0, j * fh + fh - 44, W, 3);
      }
    }
    if (!glowOnly) {
      ctx.fillStyle = '#e6dfd3';
      for (let i = 0; i <= cols; i++) ctx.fillRect(i * cw - 5, 0, 10, Hh);
    }
  };
  return { map: canvasTex(512, 1024, draw(false)), glow: canvasTex(512, 1024, draw(true)) };
}

/* ------------------------------------------------------------------ */
/* Scène                                                               */
/* ------------------------------------------------------------------ */
export function createApartment(canvas, opts = {}) {
  const mobile = !!opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.capture });
  const maxDpr = mobile ? 1.6 : 2;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a2033');
  scene.fog = new THREE.FogExp2(new THREE.Color('#9d7f86'), 0.0015);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 20000);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.26;
  pmrem.dispose();

  const root = new THREE.Group();
  scene.add(root);
  const ceilings = new THREE.Group();
  scene.add(ceilings);

  /* ---------------- matériaux ---------------- */
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const tex = {
    parquet: parquetTex(),
    marble: marbleTex(3),
    marbleTiles: marbleTex(9, { tiles: 2 }),
    nero: marbleTex(21, { dark: true }),
    walnut: woodTex(4, '#5c3d27'),
    teak: woodTex(8, '#94694a', { planks: 8, w: 512, h: 1024 }),
    marbleSoft: marbleTex(14, { soft: true }),
    city: cityTex(),
    fluted: flutedNormal(10),
    flutedWide: flutedNormal(5),
    ripple: rippleNormal(),
    rug: rugTex(),
    glow: glowTex(),
    blob: blobTex(),
    facade: facadeTex(),
  };
  const repeat = (t, x, y) => {
    const c = t.clone();
    c.repeat.set(x, y);
    c.needsUpdate = true;
    return c;
  };

  const M = {
    plaster: std({ color: '#ebe3d6', roughness: 0.94 }),
    ceiling: std({ color: '#f3eee6', roughness: 1 }),
    landingWall: std({ color: '#4a4039', roughness: 0.8 }),
    landingCeil: std({ color: '#2a2521', roughness: 1 }),
    landingFloor: std({ map: repeat(tex.nero, 1.2, 1.2), roughness: 0.22, metalness: 0.05 }),
    parquet: std({ map: tex.parquet, roughness: 0.55, metalness: 0 }),
    marbleFloor: std({ map: tex.marbleTiles, roughness: 0.16 }),
    marble: std({ map: tex.marble, roughness: 0.14 }),
    nero: std({ map: tex.nero, roughness: 0.12 }),
    walnut: std({ map: tex.walnut, roughness: 0.5 }),
    walnutFluted: std({ map: repeat(tex.walnut, 3, 1), normalMap: repeat(tex.fluted, 14, 1), normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.55 }),
    teak: std({ map: repeat(tex.teak, 1, 1), roughness: 0.75 }),
    boucle: std({ color: '#ece4d7', roughness: 1 }),
    linen: std({ color: '#d8ccb8', roughness: 0.97 }),
    sand: std({ color: '#cdb899', roughness: 0.97 }),
    terracotta: std({ color: '#b3603b', roughness: 0.9 }),
    rust: std({ color: '#9c4f30', roughness: 0.92 }),
    sage: std({ color: '#8f9a7a', roughness: 0.93 }),
    olive: std({ color: '#3f4a3d', roughness: 0.55 }),
    cream: std({ color: '#f5f1ea', roughness: 0.9 }),
    white: std({ color: '#f7f5f1', roughness: 0.18 }),
    ceramic: std({ color: '#d9cbb6', roughness: 0.55 }),
    ceramicDark: std({ color: '#2f2a26', roughness: 0.45 }),
    travertine: std({ color: '#d8c7ab', roughness: 0.7 }),
    brass: std({ color: '#c8a15c', metalness: 1, roughness: 0.28 }),
    black: std({ color: '#161514', metalness: 0.5, roughness: 0.45 }),
    darkGlass: std({ color: '#0d0e10', metalness: 0.3, roughness: 0.08 }),
    leaf: std({ color: '#6f7d57', roughness: 0.85 }),
    leafDark: std({ color: '#4b5a3a', roughness: 0.85 }),
    bark: std({ color: '#5b4a3a', roughness: 1 }),
    soil: std({ color: '#2f2620', roughness: 1 }),
    pampas: std({ color: '#e6d6b8', roughness: 1 }),
    rug: std({ map: tex.rug, roughness: 1 }),
    headboard: std({ color: '#cbb89c', roughness: 0.95, normalMap: repeat(tex.flutedWide, 9, 1), normalScale: new THREE.Vector2(1.2, 1.2) }),
    duvet: std({ color: '#f4f0e8', roughness: 0.98 }),
    glass: std({ color: '#a9bcc6', roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.12, depthWrite: false }),
    reeded: std({ color: '#dfe7e6', roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.42, depthWrite: false, normalMap: repeat(tex.fluted, 40, 1), normalScale: new THREE.Vector2(1.5, 1.5) }),
    mirror: std({ color: '#d5d8da', metalness: 1, roughness: 0.04 }),
    poolTile: std({ color: '#7cc3c4', roughness: 0.4, emissive: '#3aa7b0', emissiveIntensity: 0.35 }),
    marbleWall: std({ map: tex.marbleSoft, roughness: 0.12 }),
    facade: std({ map: tex.facade.map, emissiveMap: tex.facade.glow, emissive: '#ffffff', emissiveIntensity: 0.0, roughness: 0.8 }),
    slabWhite: std({ color: '#f1ece3', roughness: 0.85 }),
    cushionA: std({ color: '#b7653f', roughness: 0.95 }),
    cushionB: std({ color: '#d7c6a6', roughness: 0.95 }),
    cushionC: std({ color: '#7f8a6c', roughness: 0.95 }),
    outdoorFabric: std({ color: '#e9e2d4', roughness: 1 }),
    books: [std({ color: '#b25d38', roughness: 0.8 }), std({ color: '#d9ccb5', roughness: 0.8 }), std({ color: '#39465c', roughness: 0.8 }), std({ color: '#7f8a6c', roughness: 0.8 }), std({ color: '#efe8dc', roughness: 0.8 })],
  };
  const emissive = (color, intensity = 1) => new THREE.MeshStandardMaterial({ color: '#000000', emissive: color, emissiveIntensity: intensity, roughness: 1 });
  M.bulb = emissive('#ffd9a8', 2.2);
  M.opal = std({ color: '#fff4e4', emissive: '#ffd6a0', emissiveIntensity: 1.4, roughness: 0.6 });
  M.paper = std({ color: '#fff2dc', emissive: '#ffc98a', emissiveIntensity: 1.15, roughness: 1, side: THREE.DoubleSide });
  M.shade = std({ color: '#efe3cd', emissive: '#ffcf93', emissiveIntensity: 0.75, roughness: 1, side: THREE.DoubleSide });
  M.led = emissive('#ffd7a3', 3.2);
  M.ledCool = emissive('#fff1dc', 2.2);
  M.ledWarm = emissive('#ffae63', 1.1);
  M.flame = new THREE.MeshBasicMaterial({ color: '#ff9a3c', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  M.doorGap = emissive('#ffc98a', 4);

  /* ---------------- helpers géométrie ---------------- */
  const geoCache = new Map();
  function rbox(w, h, d, r = 0.02, seg = 3) {
    const k = [w, h, d, r, seg].join('|');
    if (!geoCache.has(k)) geoCache.set(k, new RoundedBoxGeometry(w, h, d, seg, Math.max(0.001, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001))));
    return geoCache.get(k);
  }
  function mesh(geo, mat, x = 0, y = 0, z = 0, o = {}) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    if (o.s) Array.isArray(o.s) ? m.scale.set(...o.s) : m.scale.setScalar(o.s);
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.recv !== false;
    (o.parent || root).add(m);
    return m;
  }
  // boîte arrondie posée (y = bas de l'objet)
  const B = (w, h, d, mat, x, y, z, o = {}) => mesh(rbox(w, h, d, o.r ?? 0.015, o.seg ?? 2), mat, x, y + h / 2, z, o);
  // bloc par ses bornes (murs, dalles)
  function slab(x0, x1, y0, y1, z0, z1, mat, o = {}) {
    return mesh(new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, o);
  }
  const cyl = (rt, rb, h, mat, x, y, z, o = {}) => mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg || 32), mat, x, y + h / 2, z, o);
  function lathe(profile, mat, x, y, z, o = {}) {
    const g = new THREE.LatheGeometry(profile.map(([a, b]) => new THREE.Vector2(a, b)), o.seg || 40);
    return mesh(g, mat, x, y, z, o);
  }
  function tube(points, r, mat, o = {}) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return mesh(new THREE.TubeGeometry(curve, o.seg || 48, r, 10, false), mat, 0, 0, 0, o);
  }
  // sol horizontal avec UV en coordonnées monde (texture continue d'une pièce à l'autre)
  function floor(x0, x1, z0, z1, mat, scale, y = 0, parent = root) {
    const w = x1 - x0, d = Math.abs(z1 - z0);
    const g = new THREE.PlaneGeometry(w, d);
    g.rotateX(-Math.PI / 2);
    g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / scale, -p.getZ(i) / scale);
    const m = new THREE.Mesh(g, mat);
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function ceiling(x0, x1, z0, z1, mat = M.ceiling, y = H) {
    const g = new THREE.PlaneGeometry(x1 - x0, Math.abs(z1 - z0));
    g.rotateX(Math.PI / 2);
    g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
    const m = new THREE.Mesh(g, mat);
    m.receiveShadow = true;
    m.castShadow = true;
    ceilings.add(m);
    return m;
  }
  // panneau vertical (tableau, miroir, placage) : normal vers +x, -x, +z ou -z
  function panel(w, h, mat, x, y, z, facing, o = {}) {
    const g = new THREE.PlaneGeometry(w, h);
    const ry = { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }[facing];
    return mesh(g, mat, x, y, z, { ry, cast: false, ...o });
  }
  const sprites = [];
  function glow(x, y, z, size, color = '#ffcf94', opacity = 0.5) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    s.position.set(x, y, z);
    s.scale.setScalar(size);
    root.add(s);
    sprites.push(s);
    return s;
  }
  function contact(x, z, w, d, opacity = 0.45, ry = 0, y = 0.004) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex.blob, transparent: true, opacity, depthWrite: false }));
    m.rotation.set(-Math.PI / 2, 0, ry);
    m.position.set(x, y, z);
    m.renderOrder = 1;
    root.add(m);
    return m;
  }

  /* ---------------- éclairage ---------------- */
  // Le soleil « visible » est bas sur l'horizon ; la lumière qu'il projette est un peu plus haute
  // pour faire entrer des taches de soleil sur le parquet.
  const sunSky = new THREE.Vector3(0.6, 0.065, 0.8).normalize();
  const sunDir = new THREE.Vector3(0.78, 0.4, 0.5).normalize();
  const hemi = new THREE.HemisphereLight('#a9b6d8', '#6e5040', 0.6);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffae74', 4.4);
  sun.castShadow = true;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  // éclairages ponctuels : un petit « pool » de lumières réaffectées aux luminaires les plus proches
  const fixtures = [];
  const fixture = (x, y, z, intensity, color = '#ffc88f', distance = 7) => fixtures.push({ p: new THREE.Vector3(x, y, z), intensity, color: new THREE.Color(color), distance });
  const POOL = mobile ? 5 : 7;
  const pool = [];
  for (let i = 0; i < POOL; i++) {
    const l = new THREE.PointLight('#ffc88f', 0, 7, 2);
    scene.add(l);
    pool.push(l);
  }

  /* ---------------- sky / mer / ville ---------------- */
  const U = {
    uTop: { value: new THREE.Color('#1b2544') },
    uMid: { value: new THREE.Color('#6a6f93') },
    uHor: { value: new THREE.Color('#f0a46e') },
    uLow: { value: new THREE.Color('#b77f6c') },
    uCloud: { value: new THREE.Color('#c77d78') },
    uSun: { value: sunSky },
    uSunCol: { value: new THREE.Color('#ffb070') },
    uDeep: { value: new THREE.Color('#0f2536') },
    uTime: { value: 0 },
  };
  M.water = makePoolWater(U);
  const sky = makeSky(U);
  scene.add(sky);
  const GROUND = -58;
  const sea = makeSea(U);
  sea.position.y = GROUND - 0.5;
  scene.add(sea);

  // sol de la ville (côté terre), côte ondulée
  const coast = (z) => 430 + Math.sin(z / 260) * 70 + Math.sin(z / 90 + 1) * 18;
  {
    const shape = new THREE.Shape();
    shape.moveTo(-6000, -6000);
    for (let z = -6000; z <= 6000; z += 60) shape.lineTo(coast(z), z);
    shape.lineTo(-6000, 6000);
    const g = new THREE.ShapeGeometry(shape);
    g.rotateX(Math.PI / 2);
    // ShapeGeometry est dans le plan XY : après rotation, y -> z
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 380, p.getZ(i) / 380);
    const land = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex.city, color: '#b9b4c4', side: THREE.DoubleSide }));
    land.position.y = GROUND;
    scene.add(land);
  }
  {
    const r = rng(42);
    const pts = [], cols = [];
    const warm = [new THREE.Color('#ffc27a'), new THREE.Color('#ffd9a0'), new THREE.Color('#fff0d6'), new THREE.Color('#ffab5c')];
    const add = (x, y, z, c, k = 1) => { pts.push(x, y, z); cols.push(c.r * k, c.g * k, c.b * k); };
    for (let i = 0; i < (mobile ? 7000 : 12000); i++) {
      const z = (r() - 0.5) * 5200;
      const x = coast(z) - Math.pow(r(), 1.6) * 2600 + 20;
      if (x > -60 && x < 60 && z > -80 && z < 40) continue;
      add(x, GROUND + 0.5 + r() * 2, z, warm[Math.floor(r() * 4)], 0.5 + r() * 0.9);
    }
    // front de mer : collier de lampadaires
    for (let z = -2600; z < 2600; z += 9) add(coast(z) - 12, GROUND + 1, z, warm[0], 1.4);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const lights = new THREE.Points(g, new THREE.PointsMaterial({ size: 7, map: tex.glow, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    scene.add(lights);
    // côte d'en face : pas de brouillard (sinon elle disparaît)
    const fp = [], fc = [];
    for (let i = 0; i < 1600; i++) {
      const a = -0.35 + r() * 0.9, d = 5200 + r() * 900 + Math.sin(a * 9) * 300;
      const c = warm[Math.floor(r() * 4)], k = 0.5 + r() * 0.7;
      fp.push(Math.cos(a) * d, GROUND + 2 + r() * 16, Math.sin(a) * d);
      fc.push(c.r * k, c.g * k, c.b * k);
    }
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
    fg.setAttribute('color', new THREE.Float32BufferAttribute(fc, 3));
    scene.add(new THREE.Points(fg, new THREE.PointsMaterial({ size: 26, map: tex.glow, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));
  }
  // Maqam Echahid (silhouette illuminée, au loin)
  {
    const g = new THREE.Group();
    const leafShape = new THREE.Shape();
    leafShape.moveTo(-9, 0);
    leafShape.quadraticCurveTo(-7, 60, 0, 92);
    leafShape.quadraticCurveTo(3, 60, 9, 0);
    leafShape.lineTo(-9, 0);
    const lg = new THREE.ExtrudeGeometry(leafShape, { depth: 3, bevelEnabled: false });
    const lm = new THREE.MeshBasicMaterial({ color: '#f3e3c8', fog: true });
    for (let i = 0; i < 3; i++) {
      const piv = new THREE.Group();
      piv.rotation.y = (i * Math.PI * 2) / 3;
      const leaf = new THREE.Mesh(lg, lm);
      leaf.position.set(0, 0, 11);
      leaf.rotation.x = -0.09;
      piv.add(leaf);
      g.add(piv);
    }
    g.position.set(430, GROUND + 22, -380);
    g.scale.setScalar(0.95);
    scene.add(g);
    const hill = new THREE.Mesh(new THREE.SphereGeometry(160, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#1b1a20' }));
    hill.scale.set(1, 0.16, 1);
    hill.position.set(430, GROUND, -380);
    scene.add(hill);
  }

  /* ---------------- immeuble ---------------- */
  // masse sous l'appartement (vue d'ensemble finale)
  {
    const X0 = -5.45, X1 = 10.45, Z0 = 7.3, Z1 = -32.4, top = -0.32, hgt = top - GROUND;
    const face = (w, cx, cz, ry) => {
      const g = new THREE.PlaneGeometry(w, hgt);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (w / 12), 1 - (1 - uv.getY(i)) * (hgt / 26.4));
      mesh(g, M.facade, cx, (GROUND + top) / 2, cz, { ry, cast: false });
    };
    face(X1 - X0, (X0 + X1) / 2, Z0, 0);
    face(X1 - X0, (X0 + X1) / 2, Z1, Math.PI);
    face(Z0 - Z1, X1, (Z0 + Z1) / 2, Math.PI / 2);
    face(Z0 - Z1, X0, (Z0 + Z1) / 2, -Math.PI / 2);
  }
  slab(-5.45, 10.45, -0.32, -0.02, -32.4, 7.3, M.slabWhite, { cast: false });

  /* ================================================================== */
  /* PALIER                                                             */
  /* ================================================================== */
  const LH = 3.0;
  floor(-1.8, 1.8, 0.12, 7.2, M.landingFloor, 3.6, 0.001);
  slab(-2.0, -1.8, 0, LH, 0.12, 7.2, M.landingWall);
  slab(1.8, 2.0, 0, LH, 0.12, 7.2, M.landingWall);
  slab(-2.0, 2.0, 0, LH + 0.2, 7.2, 7.4, M.landingWall);
  slab(-2.0, 2.0, LH + 0.02, H + 0.02, 0.12, 7.4, M.slabWhite, { cast: false });
  slab(-5.25, -2.4, 0, H + 0.02, -3.5, 0.12, M.slabWhite);
  slab(2.4, 5.05, 0, H + 0.02, -3.5, 0.12, M.slabWhite);
  slab(-5.45, -2.0, 0, H + 0.02, 0.12, 7.3, M.slabWhite, { cast: false });
  slab(2.0, 10.45, 0, H + 0.02, 0.12, 7.3, M.slabWhite, { cast: false });
  slab(5.05, 10.45, 0, H + 0.02, -3.5, 0.12, M.slabWhite, { cast: false });
  ceiling(-1.8, 1.8, 0.12, 7.2, M.landingCeil, LH);
  // ligne lumineuse au plafond
  mesh(new THREE.BoxGeometry(0.025, 0.012, 6.6), M.ledCool, 0, LH - 0.006, 3.8, { cast: false, parent: ceilings });
  for (const sx of [-1.79, 1.79]) {
    mesh(new THREE.BoxGeometry(0.012, 0.008, 6.9), M.ledWarm, sx, 0.012, 3.65, { cast: false });
    for (let z = 0.8; z < 7; z += 1.6) glow(sx * 0.96, 0.05, z, 0.8, '#ff9f55', 0.16);
  }
  // mur d'entrée (face palier sombre, face entrée claire)
  const doorW = 1.3, doorH = 2.8;
  const wallMats = [M.plaster, M.plaster, M.plaster, M.plaster, M.landingWall, M.plaster];
  slab(-2.4, -doorW / 2, 0, H, -0.12, 0.12, wallMats);
  slab(doorW / 2, 2.4, 0, H, -0.12, 0.12, wallMats);
  slab(-doorW / 2, doorW / 2, doorH, H, -0.12, 0.12, wallMats);
  // encadrement laiton
  slab(-doorW / 2 - 0.04, -doorW / 2, 0, doorH + 0.04, 0.1, 0.14, M.brass);
  slab(doorW / 2, doorW / 2 + 0.04, 0, doorH + 0.04, 0.1, 0.14, M.brass);
  slab(-doorW / 2 - 0.04, doorW / 2 + 0.04, doorH, doorH + 0.04, 0.1, 0.14, M.brass);
  // porte pivot en noyer
  const door = new THREE.Group();
  const pivotX = -doorW / 2 + 0.22;
  door.position.set(pivotX, 0, 0);
  root.add(door);
  {
    mesh(new THREE.BoxGeometry(doorW - 0.02, doorH - 0.01, 0.07), [M.walnut, M.walnut, M.walnut, M.walnut, M.walnutFluted, M.walnut], doorW / 2 - 0.22, doorH / 2, 0, { parent: door, cast: false });
    const handleX = doorW - 0.22 - 0.16;
    for (const side of [1, -1]) {
      mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.3, 16), M.brass, handleX, 1.2, side * 0.1, { parent: door, cast: false });
      for (const hy of [0.62, 1.78]) mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.07, 8), M.brass, handleX, hy, side * 0.065, { rx: Math.PI / 2, parent: door, cast: false });
    }
  }
  // lumière sous la porte
  mesh(new THREE.BoxGeometry(doorW - 0.06, 0.012, 0.02), M.doorGap, 0, 0.006, 0.05, { cast: false });
  const doorGlow = glow(0, 0.05, 0.4, 1.4, '#ffb970', 0.35);
  // numéro d'appartement
  mesh(new THREE.PlaneGeometry(0.44, 0.22), new THREE.MeshStandardMaterial({ map: numberTex('PH'), transparent: true, color: '#d9b574', metalness: 0.9, roughness: 0.3 }), 1.05, 1.62, 0.13, { cast: false });
  // console + vase + pampas
  B(1.3, 0.1, 0.34, M.walnut, -1.63, 0.84, 3.3, { r: 0.02 });
  B(0.03, 0.96, 0.76, M.brass, -1.79, 1.24, 3.3, { r: 0.004, cast: false });
  panel(0.7, 0.9, std({ map: artTex('circles'), roughness: 0.9 }), -1.77, 1.72, 3.3, '+x');
  lathe([[0, 0], [0.09, 0], [0.12, 0.08], [0.1, 0.22], [0.05, 0.3], [0.045, 0.34]], M.ceramic, -1.63, 0.94, 3.0);
  lathe([[0, 0], [0.13, 0], [0.16, 0.12], [0.14, 0.3], [0.07, 0.5], [0.06, 0.62]], M.ceramicDark, 1.35, 0, 1.4);
  {
    const r = rng(3);
    for (let i = 0; i < 9; i++) {
      const a = r() * 6.28, lean = 0.08 + r() * 0.18, len = 0.9 + r() * 0.6;
      const tip = [1.35 + Math.cos(a) * lean * len, 0.62 + len, 1.4 + Math.sin(a) * lean * len];
      tube([[1.35, 0.6, 1.4], [(1.35 + tip[0]) / 2, 0.62 + len * 0.55, (1.4 + tip[2]) / 2], tip], 0.006, M.bark, { seg: 8, cast: false });
      mesh(new THREE.SphereGeometry(0.07, 10, 8), M.pampas, tip[0], tip[1] + 0.12, tip[2], { s: [0.55, 2.6, 0.55], cast: false });
    }
  }
  glow(-1.62, 2.4, 3.3, 1.2, '#ffc27d', 0.25);
  fixture(0, 1.9, 1.3, 6, '#ffc58a', 6);
  fixture(0, 1.2, 4.4, 3, '#ffc58a', 5);

  /* ================================================================== */
  /* ENTRÉE                                                             */
  /* ================================================================== */
  floor(-2.2, 2.2, -0.12, -3.6, M.marbleFloor, 1.6);
  slab(-2.4, -2.2, 0, H, -0.12, -3.5, M.plaster);
  slab(2.2, 2.4, 0, H, -0.12, -3.5, M.plaster);
  ceiling(-2.2, 2.2, -0.12, -3.5);
  // console en noyer + plateau marbre, miroir rond
  B(0.42, 0.78, 1.6, M.walnut, -1.99, 0, -1.8, { r: 0.02 });
  B(0.46, 0.04, 1.66, M.marble, -1.99, 0.78, -1.8, { r: 0.01 });
  contact(-1.95, -1.8, 0.9, 2.0, 0.35);
  mesh(new THREE.CircleGeometry(0.46, 48), M.mirror, -2.19, 1.62, -1.8, { ry: Math.PI / 2, cast: false });
  mesh(new THREE.TorusGeometry(0.47, 0.018, 12, 64), M.brass, -2.18, 1.62, -1.8, { ry: Math.PI / 2, cast: false });
  lathe([[0, 0], [0.06, 0], [0.11, 0.1], [0.09, 0.28], [0.04, 0.36], [0.05, 0.4]], M.ceramicDark, -2.0, 0.82, -1.25);
  lathe([[0, 0], [0.12, 0], [0.18, 0.06], [0.2, 0.09]], M.ceramic, -2.0, 0.82, -2.2);
  // tableau Casbah
  B(0.94, 1.28, 0.04, M.black, 2.18, 1.0, -1.8, { ry: Math.PI / 2, r: 0.005 });
  panel(0.86, 1.2, std({ map: artTex('casbah'), roughness: 0.9 }), 2.155, 1.64, -1.8, '-x');
  glow(2.05, 2.5, -1.8, 1.0, '#ffd4a0', 0.18);
  // suspension anneau
  mesh(new THREE.TorusGeometry(0.42, 0.02, 12, 72), M.brass, 0, 2.55, -1.8, { rx: Math.PI / 2, cast: false });
  mesh(new THREE.TorusGeometry(0.405, 0.01, 8, 72), M.led, 0, 2.54, -1.8, { rx: Math.PI / 2, cast: false });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.65, 4), M.black, Math.cos(a) * 0.42, 2.55 + 0.325, -1.8 + Math.sin(a) * 0.42, { cast: false });
  }
  glow(0, 2.5, -1.8, 1.6, '#ffcf94', 0.3);
  fixture(0, 2.3, -1.8, 9, '#ffcc90', 7);

  /* ================================================================== */
  /* MUR À ARCHE (entrée → séjour)                                      */
  /* ================================================================== */
  {
    const aw = 1.25, spring = 1.85;
    const s = new THREE.Shape();
    s.moveTo(-5, 0);
    s.lineTo(-aw, 0);
    s.lineTo(-aw, spring);
    s.absarc(0, spring, aw, Math.PI, 0, true);
    s.lineTo(aw, 0);
    s.lineTo(5, 0);
    s.lineTo(5, H);
    s.lineTo(-5, H);
    s.lineTo(-5, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: false, curveSegments: 32 });
    mesh(g, M.plaster, 0, 0, -3.7);
    // étagère-niche côté séjour
    const nx0 = -4.8, nx1 = -2.4;
    for (let i = 0; i < 4; i++) B(nx1 - nx0, 0.035, 0.32, M.walnut, (nx0 + nx1) / 2, 0.55 + i * 0.52, -3.88, { r: 0.005 });
    const r = rng(9);
    for (let i = 0; i < 4; i++) {
      let x = nx0 + 0.1;
      while (x < nx1 - 0.3) {
        if (r() > 0.72) {
          lathe([[0, 0], [0.05, 0], [0.08, 0.1], [0.05, 0.22], [0.03, 0.26]], r() > 0.5 ? M.ceramic : M.ceramicDark, x + 0.1, 0.585 + i * 0.52, -3.88, { cast: false });
          x += 0.3;
        } else {
          const n = 3 + Math.floor(r() * 6);
          for (let k = 0; k < n; k++) {
            const bh = 0.2 + r() * 0.12;
            B(0.03, bh, 0.2, M.books[Math.floor(r() * 5)], x, 0.585 + i * 0.52, -3.86, { r: 0.003, seg: 1, cast: false });
            x += 0.034;
          }
          x += 0.12;
        }
      }
    }
    glow(-3.6, 2.9, -3.9, 1.5, '#ffd09a', 0.15);
  }

  /* ================================================================== */
  /* SÉJOUR + CUISINE (grand volume ouvert)                             */
  /* ================================================================== */
  floor(-5, 5, -3.7, -19, M.parquet, 2.05);
  slab(-5.25, -5, 0, H, -3.5, -32.2, M.plaster); // mur mitoyen gauche
  ceiling(-5, 5, -3.7, -19);
  // gorges lumineuses le long des murs
  mesh(new THREE.BoxGeometry(0.03, 0.03, 15), M.led, -4.95, H - 0.06, -11.3, { cast: false, parent: ceilings });
  // spots encastrés
  {
    const spotG = new THREE.CircleGeometry(0.045, 16);
    spotG.rotateX(Math.PI / 2);
    const spots = new THREE.InstancedMesh(spotG, M.ledCool, 40);
    let k = 0;
    const m4 = new THREE.Matrix4();
    for (const z of [-4.6, -10.6, -12.2, -18.2, -20.2, -25.6, -27.6, -31.2]) for (const x of [-3.6, -1.2, 1.2, 3.6]) m4.setPosition(x, H - 0.002, z), spots.setMatrixAt(k++, m4);
    spots.count = k;
    ceilings.add(spots);
  }

  // Baie vitrée toute hauteur (côté mer) : montants noirs + verre
  function glazing(z0, z1, step = 1.6, slider = null) {
    const n = Math.max(1, Math.round((z0 - z1) / step));
    const pitch = (z0 - z1) / n;
    for (let i = 0; i <= n; i++) slab(4.97, 5.05, 0, H, z0 - i * pitch - 0.035, z0 - i * pitch + 0.035, M.black);
    slab(4.95, 5.07, 0, 0.05, z0, z1, M.black);
    slab(4.95, 5.07, H - 0.12, H, z0, z1, M.black);
    for (let i = 0; i < n; i++) {
      const za = z0 - i * pitch, zb = za - pitch;
      if (slider && za > slider.z1 && zb < slider.z0) continue;
      panel(pitch - 0.07, H - 0.17, M.glass, 5.01, (H - 0.07) / 2 + 0.03, (za + zb) / 2, '+x', { recv: false });
    }
  }
  glazing(-3.7, -19, 1.53);
  slab(4.95, 5.07, 0, H, -18.92, -19.2, M.plaster);
  // voilages
  function curtain(z, w, x = 4.82, seed = 1) {
    const g = new THREE.PlaneGeometry(w, H - 0.16, 60, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i);
      p.setZ(i, Math.sin(u * 22 + seed) * 0.035 + Math.sin(u * 7 + seed * 2) * 0.02);
    }
    g.computeVertexNormals();
    const m = mesh(g, new THREE.MeshStandardMaterial({ color: '#f4efe6', roughness: 1, transparent: true, opacity: 0.7, side: THREE.DoubleSide, emissive: '#ffe2c0', emissiveIntensity: 0.18, depthWrite: false }), x, (H - 0.16) / 2 + 0.02, z, { ry: -Math.PI / 2, cast: false });
    mesh(new THREE.BoxGeometry(0.03, 0.03, w + 0.2), M.black, x, H - 0.1, z, { cast: false });
    return m;
  }
  curtain(-4.55, 1.3, 4.8, 1);
  curtain(-17.9, 1.6, 4.8, 3);

  // --- mur cannelé en noyer + cheminée en Nero Marquina
  B(0.06, H - 0.02, 5.6, M.walnutFluted, -4.97, 0, -7.5, { r: 0.005, seg: 1 });
  B(0.5, 0.46, 4.4, M.nero, -4.72, 0, -7.5, { r: 0.012 });
  slab(-4.95, -4.5, 0.12, 0.4, -6.9, -8.1, M.black, { cast: false });
  const flames = [];
  for (let i = 0; i < 9; i++) {
    const f = mesh(new THREE.ConeGeometry(0.05, 0.3, 8, 1, true), M.flame, -4.72, 0.28, -6.98 - i * 0.13, { cast: false, recv: false });
    f.userData.base = 0.8 + ((i * 37) % 10) / 20;
    flames.push(f);
  }
  const fireGlow = glow(-4.5, 0.32, -7.5, 1.6, '#ff8a3c', 0.6);
  fixture(-4.3, 0.5, -7.5, 3.2, '#ff8a3c', 4.5);
  // tableau au-dessus
  B(1.66, 1.16, 0.035, M.brass, -4.91, 1.32, -7.5, { ry: Math.PI / 2, r: 0.004, cast: false });
  panel(1.6, 1.1, std({ map: artTex('arches'), roughness: 0.9 }), -4.886, 1.9, -7.5, '+x');
  glow(-4.6, 2.75, -7.5, 1.8, '#ffd09a', 0.14);

  // --- tapis berbère
  B(4.0, 0.012, 4.6, M.rug, -1.0, 0.002, -7.5, { r: 0.004, seg: 1, cast: false });

  // --- canapé en L (face à la cheminée, dos à la baie)
  function sofa(x, z, len, depth, mat, ry = 0, { chaise = 0, pillows = [M.cushionA, M.cushionB, M.cushionC] } = {}) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    root.add(g);
    const o = { parent: g };
    B(len - 0.16, 0.07, depth - 0.16, M.black, 0, 0.0, 0, { ...o, r: 0.01 });
    B(len, 0.26, depth, mat, 0, 0.07, 0, { ...o, r: 0.06, seg: 3 });
    B(len, 0.5, 0.26, mat, 0, 0.26, -depth / 2 + 0.13, { ...o, r: 0.11, seg: 4 });
    B(0.24, 0.36, depth, mat, -len / 2 + 0.12, 0.26, 0, { ...o, r: 0.1, seg: 4 });
    B(0.24, 0.36, depth, mat, len / 2 - 0.12, 0.26, 0, { ...o, r: 0.1, seg: 4 });
    const seats = Math.max(2, Math.round((len - 0.48) / 0.95));
    const sw = (len - 0.5) / seats;
    for (let i = 0; i < seats; i++) B(sw - 0.02, 0.14, depth - 0.3, mat, -len / 2 + 0.25 + sw * (i + 0.5), 0.32, 0.11, { ...o, r: 0.06, seg: 3 });
    if (chaise) {
      B(0.95, 0.26, chaise, mat, len / 2 - 0.24 - 0.48, 0.07, depth / 2 + chaise / 2 - 0.02, { ...o, r: 0.06, seg: 3 });
      B(0.8, 0.07, chaise - 0.16, M.black, len / 2 - 0.24 - 0.48, 0, depth / 2 + chaise / 2 - 0.02, { ...o, r: 0.01 });
      B(0.93, 0.14, chaise - 0.05, mat, len / 2 - 0.24 - 0.48, 0.32, depth / 2 + chaise / 2 - 0.02, { ...o, r: 0.06, seg: 3 });
    }
    pillows.forEach((pm, i) => {
      const px = -len / 2 + 0.55 + i * 0.5;
      B(0.46, 0.42, 0.14, pm, px, 0.44, -depth / 2 + 0.33, { ...o, r: 0.07, seg: 3, rx: -0.2, rz: (i % 2 ? 0.08 : -0.06) });
    });
    return g;
  }
  sofa(1.15, -7.3, 3.5, 1.05, M.boucle, -Math.PI / 2, { chaise: 0.9 });
  contact(1.15, -7.3, 1.8, 4.2, 0.5);
  // table basse travertin + table d'appoint laiton
  cyl(0.64, 0.64, 0.05, M.travertine, -1.05, 0.3, -7.2, { seg: 64 });
  cyl(0.5, 0.52, 0.3, M.travertine, -1.05, 0, -7.2, { seg: 64 });
  contact(-1.05, -7.2, 1.7, 1.7, 0.4);
  lathe([[0, 0], [0.07, 0], [0.09, 0.05], [0.06, 0.18], [0.03, 0.24]], M.ceramicDark, -1.25, 0.35, -7.05);
  B(0.26, 0.05, 0.34, M.books[0], -0.8, 0.35, -7.4, { ry: 0.3, r: 0.005 });
  B(0.24, 0.04, 0.3, M.books[4], -0.8, 0.4, -7.4, { ry: 0.5, r: 0.005 });
  cyl(0.26, 0.26, 0.02, M.brass, -0.2, 0.52, -9.55);
  cyl(0.02, 0.02, 0.52, M.brass, -0.2, 0, -9.55);
  cyl(0.2, 0.2, 0.02, M.brass, -0.2, 0, -9.55);
  // fauteuils (bouclé + terracotta)
  function armchair(x, z, ry, mat) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    root.add(g);
    const o = { parent: g };
    B(0.86, 0.42, 0.82, mat, 0, 0.0, 0, { ...o, r: 0.16, seg: 4 });
    const back = new THREE.CylinderGeometry(0.44, 0.44, 0.42, 32, 1, true, -Math.PI * 0.75, Math.PI * 1.5);
    const m = mesh(back, mat, 0, 0.62, 0.02, { ...o });
    m.material = mat.clone();
    m.material.side = THREE.DoubleSide;
    mesh(new THREE.TorusGeometry(0.44, 0.085, 12, 40, Math.PI * 1.5), mat, 0, 0.83, 0.02, { ...o, rx: Math.PI / 2, rz: Math.PI * 0.75 });
    B(0.7, 0.12, 0.6, mat, 0, 0.42, 0.08, { ...o, r: 0.05, seg: 3 });
    contact(x, z, 1.2, 1.2, 0.4);
    return g;
  }
  armchair(-3.05, -5.85, Math.PI / 2 + 0.5, M.cushionA);
  armchair(-3.05, -9.1, Math.PI / 2 - 0.5, M.boucle);
  // lampadaire arc
  {
    B(0.36, 0.08, 0.36, M.nero, 2.55, 0, -9.6, { r: 0.02 });
    tube([[2.55, 0.08, -9.6], [2.55, 1.6, -9.6], [2.3, 2.35, -9.15], [1.5, 2.45, -8.3], [1.1, 2.2, -7.9]], 0.014, M.brass, { seg: 64 });
    lathe([[0.0, 0.14], [0.14, 0.12], [0.2, 0.02], [0.21, 0]], M.brass, 1.1, 2.05, -7.9, { cast: false });
    mesh(new THREE.SphereGeometry(0.05, 12, 8), M.bulb, 1.1, 2.04, -7.9, { cast: false });
    glow(1.1, 1.95, -7.9, 1.4, '#ffc98a', 0.35);
    fixture(1.1, 1.85, -7.9, 5, '#ffcb8e', 5);
  }
  // suspension anneau XXL au-dessus de la table basse
  mesh(new THREE.TorusGeometry(0.62, 0.022, 12, 90), M.brass, -1.05, 2.45, -7.2, { rx: Math.PI / 2, cast: false });
  mesh(new THREE.TorusGeometry(0.6, 0.012, 8, 90), M.led, -1.05, 2.44, -7.2, { rx: Math.PI / 2, cast: false });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.75, 4), M.black, -1.05 + Math.cos(a) * 0.62, 2.45 + 0.375, -7.2 + Math.sin(a) * 0.62, { cast: false });
  }
  glow(-1.05, 2.4, -7.2, 2.2, '#ffcf94', 0.22);
  fixture(-1.05, 2.3, -7.2, 8, '#ffcb8e', 7);

  // olivier en pot
  function olive(x, z, scale = 1, potMat = M.terracotta, seed = 1) {
    const r = rng(seed);
    lathe([[0, 0], [0.3 * scale, 0], [0.36 * scale, 0.1], [0.4 * scale, 0.55 * scale], [0.38 * scale, 0.6 * scale], [0, 0.58 * scale]], potMat, x, 0, z);
    const top = 0.58 * scale;
    tube([[x, top - 0.1, z], [x + 0.06 * scale, top + 0.5 * scale, z - 0.03], [x - 0.05 * scale, top + 1.1 * scale, z + 0.05], [x + 0.03, top + 1.5 * scale, z]], 0.045 * scale, M.bark, { seg: 16 });
    for (let i = 0; i < 16; i++) {
      const a = r() * 6.28, rad = (0.25 + r() * 0.5) * scale;
      const cx = x + Math.cos(a) * rad, cz = z + Math.sin(a) * rad, cy = top + (1.35 + r() * 0.8) * scale;
      mesh(new THREE.IcosahedronGeometry((0.2 + r() * 0.16) * scale, 1), r() > 0.4 ? M.leaf : M.leafDark, cx, cy, cz, { s: [1, 0.72, 1] });
    }
    contact(x, z, 1.2 * scale, 1.2 * scale, 0.45);
  }
  olive(4.1, -5.0, 1.05, M.terracotta, 2);

  // --- claustra en noyer entre séjour et cuisine
  {
    const n = 22, x0 = -5, x1 = -2.7;
    const g = new THREE.BoxGeometry(0.045, H, 0.1);
    const inst = new THREE.InstancedMesh(g, M.walnut, n);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) inst.setMatrixAt(i, m4.makeTranslation(x0 + 0.06 + (i * (x1 - x0 - 0.1)) / (n - 1), H / 2, -11.1));
    inst.castShadow = inst.receiveShadow = true;
    root.add(inst);
  }

  // --- cuisine : colonnes vert olive, plan et crédence en marbre
  {
    const X = -5, d = 0.64;
    B(d, H - 0.02, 1.8, M.olive, X + d / 2, 0, -12.7, { r: 0.008 }); // colonne frigo
    B(d, H - 0.02, 1.9, M.olive, X + d / 2, 0, -17.85, { r: 0.008 }); // colonne fours
    // fours
    B(0.02, 0.6, 0.62, M.darkGlass, X + d + 0.005, 0.95, -17.85, { r: 0.004, cast: false });
    B(0.02, 0.46, 0.62, M.darkGlass, X + d + 0.005, 1.62, -17.85, { r: 0.004, cast: false });
    // bas + plan de travail
    B(d, 0.86, 3.3, M.olive, X + d / 2, 0.06, -15.25, { r: 0.008 });
    slab(X, X + d, 0, 0.06, -13.6, -16.9, M.black, { cast: false });
    B(d + 0.04, 0.04, 3.3, M.marble, X + d / 2 + 0.02, 0.92, -15.25, { r: 0.004 });
    panel(3.3, 1.14, M.marble, X + 0.005, 1.53, -15.25, '+x');
    // étagère éclairée
    B(0.28, 0.04, 3.3, M.walnut, X + 0.14, 2.1, -15.25, { r: 0.004 });
    mesh(new THREE.BoxGeometry(0.02, 0.01, 3.2), M.led, X + 0.22, 2.095, -15.25, { cast: false });
    glow(X + 0.3, 1.2, -14.4, 1.3, '#ffd29c', 0.2);
    glow(X + 0.3, 1.2, -16.1, 1.3, '#ffd29c', 0.2);
    const r = rng(5);
    for (let i = 0; i < 7; i++) {
      const z = -13.9 - i * 0.42;
      if (r() > 0.45) lathe([[0, 0], [0.06, 0], [0.08, 0.06], [0.07, 0.16], [0.04, 0.2]], r() > 0.5 ? M.ceramic : M.cream, X + 0.14, 2.14, z, { cast: false });
      else B(0.2, 0.012, 0.2, M.ceramic, X + 0.14, 2.14, z, { r: 0.004, cast: false });
    }
    // poignées laiton
    for (const z of [-12.05, -17.2]) mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 12), M.brass, X + d + 0.03, 1.3, z, { cast: false });
    for (const z of [-14.0, -15.25, -16.5]) mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.34, 12), M.brass, X + d + 0.03, 0.8, z, { rx: Math.PI / 2, cast: false });
    // robinet
    tube([[X + 0.12, 0.94, -14.4], [X + 0.12, 1.28, -14.4], [X + 0.28, 1.34, -14.4], [X + 0.36, 1.22, -14.4]], 0.014, M.brass, { seg: 24, cast: false });
    B(0.4, 0.01, 0.5, M.darkGlass, X + 0.34, 0.955, -14.4, { r: 0.004, cast: false });
    // plaque
    B(0.52, 0.006, 0.6, M.darkGlass, X + 0.33, 0.96, -16.2, { r: 0.004, cast: false });
  }
  // îlot en marbre (retombées « waterfall »)
  {
    const ix = -2.35, iz = -15.0, L = 3.8, W = 1.1;
    B(W, 0.05, L, M.marble, ix, 0.88, iz, { r: 0.008 });
    B(W, 0.88, 0.05, M.marble, ix, 0, iz - L / 2 + 0.025, { r: 0.008 });
    B(W, 0.88, 0.05, M.marble, ix, 0, iz + L / 2 - 0.025, { r: 0.008 });
    B(W - 0.35, 0.8, L - 0.12, M.olive, ix - 0.15, 0, iz, { r: 0.006 });
    contact(ix, iz, 1.7, 4.3, 0.45);
    lathe([[0, 0], [0.18, 0], [0.22, 0.03], [0.24, 0.07]], M.ceramic, ix + 0.1, 0.93, iz + 0.9);
    for (let i = 0; i < 3; i++) mesh(new THREE.SphereGeometry(0.045, 12, 10), M.cushionA, ix + 0.08 + (i - 1) * 0.07, 0.99, iz + 0.9 + (i % 2) * 0.05);
    // tabourets
    for (const dz of [-1.15, 0, 1.15]) {
      const sx = ix + 0.95, sz = iz + dz;
      cyl(0.2, 0.19, 0.08, M.cushionB, sx, 0.66, sz, { seg: 24 });
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2 + Math.PI / 4;
        tube([[sx + Math.cos(a) * 0.17, 0, sz + Math.sin(a) * 0.17], [sx + Math.cos(a) * 0.13, 0.66, sz + Math.sin(a) * 0.13]], 0.011, M.brass, { seg: 2, cast: false });
      }
      mesh(new THREE.TorusGeometry(0.15, 0.008, 8, 32), M.brass, sx, 0.3, sz, { rx: Math.PI / 2, cast: false });
      contact(sx, sz, 0.6, 0.6, 0.35);
    }
    // 3 globes opalins
    for (const dz of [-1.2, 0, 1.2]) {
      mesh(new THREE.SphereGeometry(0.15, 24, 16), M.opal, ix, 2.12, iz + dz, { cast: false });
      mesh(new THREE.CylinderGeometry(0.004, 0.004, H - 2.27, 4), M.brass, ix, (H + 2.27) / 2, iz + dz, { cast: false });
      mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.05, 16), M.brass, ix, 2.27, iz + dz, { cast: false });
      glow(ix, 2.12, iz + dz, 1.1, '#ffd29c', 0.35);
    }
    fixture(ix, 2.0, iz, 9, '#ffcf94', 7);
  }
  // salle à manger : table ovale en noyer, 8 chaises, 2 lanternes papier
  {
    const tx = 2.55, tz = -15.1;
    const top = new THREE.CylinderGeometry(1, 1, 0.05, 64);
    mesh(top, M.walnut, tx, 0.74, tz, { s: [0.62, 1, 1.45] });
    cyl(0.2, 0.26, 0.72, M.travertine, tx, 0, tz - 0.62, { seg: 32 });
    cyl(0.2, 0.26, 0.72, M.travertine, tx, 0, tz + 0.62, { seg: 32 });
    contact(tx, tz, 2.4, 3.6, 0.4);
    function chair(x, z, ry) {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = ry;
      root.add(g);
      const o = { parent: g };
      B(0.5, 0.08, 0.48, M.linen, 0, 0.42, 0, { ...o, r: 0.035, seg: 3 });
      const back = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 24, 1, true, -Math.PI * 0.4 + Math.PI, Math.PI * 0.8);
      const bm = mesh(back, M.walnut, 0, 0.82, 0.08, o);
      bm.material = M.walnut.clone();
      bm.material.side = THREE.DoubleSide;
      for (const [lx, lz] of [[-0.21, -0.19], [0.21, -0.19], [-0.21, 0.19], [0.21, 0.19]]) mesh(new THREE.CylinderGeometry(0.016, 0.013, 0.42, 8), M.walnut, lx, 0.21, lz, o);
      contact(x, z, 0.7, 0.7, 0.3);
    }
    for (const dz of [-0.9, 0, 0.9]) {
      chair(tx - 0.78, tz + dz, Math.PI / 2);
      chair(tx + 0.78, tz + dz, -Math.PI / 2);
    }
    chair(tx, tz - 1.72, 0);
    chair(tx, tz + 1.72, Math.PI);
    for (const dz of [-0.6, 0.6]) {
      mesh(new THREE.SphereGeometry(0.26, 32, 20), M.paper, tx, 2.16, tz + dz, { s: [1, 0.86, 1], cast: false });
      mesh(new THREE.CylinderGeometry(0.004, 0.004, H - 2.37, 4), M.black, tx, (H + 2.37) / 2, tz + dz, { cast: false });
      glow(tx, 2.12, tz + dz, 1.7, '#ffc27a', 0.35);
    }
    fixture(tx, 1.7, tz, 9, '#ffc485', 7);
    // coupe + bougeoirs
    lathe([[0, 0], [0.08, 0], [0.22, 0.08], [0.25, 0.1]], M.ceramic, tx, 0.765, tz);
    for (const dz of [-0.45, 0.45]) {
      cyl(0.03, 0.035, 0.14, M.brass, tx + 0.1, 0.765, tz + dz, { seg: 12 });
      mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), M.cream, tx + 0.1, 0.99, tz + dz, { cast: false });
    }
  }
  // buffet + tableau (mur du fond du séjour)
  B(2.4, 0.72, 0.46, M.walnut, 2.6, 0.12, -18.7, { r: 0.012 });
  slab(1.6, 3.6, 0, 0.12, -18.55, -18.85, M.black, { cast: false });
  B(2.44, 0.03, 0.5, M.nero, 2.6, 0.84, -18.7, { r: 0.004 });
  panel(1.9, 1.3, std({ map: artTex('circles'), roughness: 0.9 }), 2.6, 1.95, -18.975, '+z');
  B(1.96, 1.36, 0.02, M.black, 2.6, 1.27, -18.995, { r: 0.004, cast: false });
  lathe([[0, 0], [0.1, 0], [0.14, 0.12], [0.1, 0.36], [0.05, 0.46], [0.06, 0.5]], M.terracotta, 1.9, 0.87, -18.7);
  olive(4.2, -17.6, 0.9, M.ceramicDark, 7);

  /* ================================================================== */
  /* MUR SÉJOUR → SUITE (porte ouverte)                                 */
  /* ================================================================== */
  const dW = 0.72;
  slab(-5, -dW, 0, H, -19, -19.22, M.plaster);
  slab(dW, 4.97, 0, H, -19, -19.22, M.plaster);
  slab(-dW, dW, 2.8, H, -19, -19.22, M.plaster);
  slab(-dW, -dW + 0.04, 0, 2.8, -18.98, -19.24, M.walnut);
  slab(dW - 0.04, dW, 0, 2.8, -18.98, -19.24, M.walnut);
  slab(-dW, dW, 2.76, 2.8, -18.98, -19.24, M.walnut);

  /* ================================================================== */
  /* SUITE PARENTALE                                                    */
  /* ================================================================== */
  floor(-5, 5, -19.22, -26.5, M.parquet, 2.05);
  ceiling(-5, 5, -19.22, -32);
  glazing(-19.22, -32, 1.6, { z0: -27.25, z1: -28.95 });
  mesh(new THREE.BoxGeometry(0.03, 0.03, 12.4), M.led, -4.95, H - 0.06, -25.6, { cast: false, parent: ceilings });
  curtain(-19.9, 1.3, 4.8, 5);
  curtain(-25.3, 1.4, 4.8, 7);
  {
    const bz = -22.8;
    // tête de lit capitonnée pleine largeur
    B(0.12, 1.5, 3.9, M.headboard, -4.93, 0, bz, { r: 0.04, seg: 3 });
    // lit
    B(2.2, 0.3, 2.1, M.sand, -3.8, 0.04, bz, { r: 0.05, seg: 3 });
    slab(-4.8, -2.8, 0, 0.05, bz - 0.95, bz + 0.95, M.black, { cast: false });
    B(2.05, 0.24, 1.96, M.cream, -3.82, 0.34, bz, { r: 0.08, seg: 3 });
    B(1.7, 0.1, 2.08, M.duvet, -3.45, 0.54, bz, { r: 0.05, seg: 3 });
    B(0.5, 0.06, 2.12, M.rust, -2.9, 0.6, bz, { r: 0.03, seg: 3 });
    for (const dz of [-0.5, 0.5]) B(0.22, 0.34, 0.8, M.cream, -4.68, 0.58, bz + dz, { r: 0.08, seg: 3, rz: -0.25 });
    for (const dz of [-0.45, 0.45]) B(0.16, 0.3, 0.52, dz < 0 ? M.cushionC : M.sand, -4.5, 0.58, bz + dz, { r: 0.07, seg: 3, rz: -0.2 });
    contact(-3.8, bz, 2.8, 2.8, 0.5);
    // tapis
    B(3.2, 0.012, 3.4, M.rug, -3.4, 0.002, bz, { r: 0.004, seg: 1, cast: false });
    // chevets + lampes
    for (const s of [-1, 1]) {
      const z = bz + s * 1.45;
      B(0.46, 0.5, 0.5, M.walnut, -4.62, 0, z, { r: 0.02 });
      mesh(new THREE.SphereGeometry(0.1, 24, 16), M.ceramic, -4.62, 0.6, z);
      mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.2, 32, 1, true), M.shade, -4.62, 0.84, z, { cast: false });
      glow(-4.62, 0.84, z, 1.2, '#ffc98a', 0.4);
    }
    fixture(-4.2, 1.1, bz - 1.45, 4, '#ffc485', 5);
    fixture(-4.2, 1.1, bz + 1.45, 4, '#ffc485', 5);
    // banc au pied du lit
    B(0.45, 0.42, 1.5, M.cushionB, -2.35, 0.0, bz, { r: 0.06, seg: 3 });
    // tableau horizon
    panel(2.0, 0.9, std({ map: artTex('horizon'), roughness: 0.9 }), -4.86, 2.2, bz, '+x');
    B(0.03, 0.96, 2.06, M.black, -4.88, 1.72, bz, { r: 0.004, cast: false });
    // fauteuil lecture face à la mer
    armchair(3.7, -20.9, -Math.PI / 2 - 0.4, M.cushionC);
    cyl(0.22, 0.22, 0.02, M.travertine, 3.1, 0.48, -21.8);
    cyl(0.16, 0.2, 0.48, M.travertine, 3.1, 0, -21.8);
    olive(4.3, -24.4, 0.8, M.cream, 11);
  }

  /* ================================================================== */
  /* SALLE DE BAIN                                                      */
  /* ================================================================== */
  floor(-5, 5, -26.5, -32, M.marbleFloor, 1.6);
  // cloison verre cannelé, cadre noir, passage
  {
    const z = -26.5, open0 = -1.75, open1 = 0.1;
    const segs = [[-5, open0], [open1, 4.97]];
    for (const [a, b] of segs) {
      const n = Math.max(1, Math.round((b - a) / 0.9));
      for (let i = 0; i < n; i++) {
        const za = a + ((b - a) * i) / n, zb = a + ((b - a) * (i + 1)) / n;
        panel(zb - za - 0.04, H - 0.1, M.reeded, (za + zb) / 2, H / 2, z, '+z', { recv: false });
        slab(za - 0.02, za + 0.02, 0, H, z - 0.03, z + 0.03, M.black);
      }
      slab(b - 0.02, b + 0.02, 0, H, z - 0.03, z + 0.03, M.black);
      slab(a, b, 0, 0.04, z - 0.03, z + 0.03, M.black);
    }
    slab(-5, 4.97, H - 0.06, H, z - 0.03, z + 0.03, M.black);
  }
  // marbre mural
  panel(5.4, H, M.marbleWall, -4.99, H / 2, -29.25, '+x');
  panel(9.9, H, M.marbleWall, 0, H / 2, -31.99, '+z');
  slab(-5.25, 10.4, 0, H, -32, -32.25, M.plaster);
  // double vasque suspendue
  {
    const X = -5, vz = -28.3;
    B(0.52, 0.42, 2.8, M.walnut, X + 0.26, 0.46, vz, { r: 0.01 });
    B(0.56, 0.035, 2.84, M.marble, X + 0.28, 0.88, vz, { r: 0.004 });
    for (const dz of [-0.7, 0.7]) {
      lathe([[0, 0], [0.12, 0], [0.19, 0.06], [0.2, 0.14], [0.19, 0.14], [0.17, 0.07], [0.0, 0.03]], M.white, X + 0.3, 0.915, vz + dz, { seg: 40 });
      tube([[X + 0.01, 1.2, vz + dz], [X + 0.12, 1.2, vz + dz], [X + 0.2, 1.17, vz + dz]], 0.012, M.brass, { seg: 8, cast: false });
      mesh(new THREE.TorusGeometry(0.42, 0.03, 10, 60), M.ledCool, X + 0.015, 1.7, vz + dz, { ry: Math.PI / 2, cast: false });
      mesh(new THREE.CircleGeometry(0.4, 48), M.mirror, X + 0.04, 1.7, vz + dz, { ry: Math.PI / 2, cast: false });
      glow(X + 0.1, 1.7, vz + dz, 1.5, '#fff0da', 0.22);
    }
    fixture(X + 0.8, 1.8, vz, 6, '#ffe0b8', 5);
  }
  // douche à l'italienne
  {
    slab(-2.85, -2.8, 0, H - 0.4, -30.05, -32, M.black);
    panel(1.9, H - 0.45, M.glass, -2.825, (H - 0.45) / 2 + 0.02, -31.02, '+x', { recv: false });
    slab(-5, -2.85, H - 0.45, H - 0.4, -30.02, -30.08, M.black);
    cyl(0.16, 0.16, 0.012, M.brass, -3.9, H - 0.36, -31.0, { seg: 32 });
    tube([[-3.9, H - 0.36, -31.0], [-3.9, H - 0.36, -31.9]], 0.01, M.brass, { seg: 2, cast: false });
    B(1.8, 0.4, 0.14, M.marble, -3.9, 0, -31.9, { r: 0.01 });
  }
  // baignoire îlot face à la mer
  const tubPos = new THREE.Vector3(2.9, 0, -29.6);
  {
    const prof = [[0, 0], [0.5, 0], [0.62, 0.08], [0.72, 0.3], [0.78, 0.55], [0.76, 0.58], [0.68, 0.56], [0.6, 0.34], [0.5, 0.2], [0, 0.18]];
    lathe(prof, M.white, tubPos.x, 0, tubPos.z, { s: [0.55, 1, 1.18], seg: 64 });
    const water = mesh(new THREE.CircleGeometry(0.64, 48), std({ color: '#a8d4d8', roughness: 0.02, transparent: true, opacity: 0.8 }), tubPos.x, 0.46, tubPos.z, { rx: -Math.PI / 2, s: [0.55, 1.18, 1], cast: false });
    water.renderOrder = 2;
    contact(tubPos.x, tubPos.z, 1.5, 2.4, 0.4);
    tube([[tubPos.x - 0.6, 0, tubPos.z - 0.95], [tubPos.x - 0.6, 0.9, tubPos.z - 0.95], [tubPos.x - 0.45, 1.0, tubPos.z - 0.95], [tubPos.x - 0.35, 0.9, tubPos.z - 0.95]], 0.016, M.brass, { seg: 24 });
    // tabouret + bougies + bouquet
    cyl(0.2, 0.2, 0.45, M.travertine, tubPos.x - 1.05, 0, tubPos.z + 0.7, { seg: 32 });
    for (const [dx, dz, h] of [[-0.06, 0.02, 0.12], [0.07, -0.05, 0.08]]) {
      cyl(0.035, 0.035, h, M.cream, tubPos.x - 1.05 + dx, 0.45, tubPos.z + 0.7 + dz, { seg: 16, cast: false });
      mesh(new THREE.SphereGeometry(0.012, 8, 6), M.bulb, tubPos.x - 1.05 + dx, 0.47 + h, tubPos.z + 0.7 + dz, { s: [1, 1.8, 1], cast: false });
      glow(tubPos.x - 1.05 + dx, 0.5 + h, tubPos.z + 0.7 + dz, 0.35, '#ffb766', 0.6);
    }
  }
  fixture(1.5, 2.6, -29.2, 6, '#ffe3c0', 7);
  // coulissant vers la terrasse
  const slider = new THREE.Group();
  root.add(slider);
  {
    const z0 = -27.25, z1 = -28.95;
    panel(z0 - z1 - 0.06, H - 0.2, M.glass, 5.1, H / 2 - 0.04, (z0 + z1) / 2, '+x', { parent: slider, recv: false });
    slab(5.07, 5.13, 0.05, H - 0.12, z0 - 0.02, z0 - 0.06, M.black, { parent: slider, cast: false });
    slab(5.07, 5.13, 0.05, H - 0.12, z1 + 0.02, z1 + 0.06, M.black, { parent: slider, cast: false });
  }

  /* ================================================================== */
  /* TERRASSE + PISCINE                                                 */
  /* ================================================================== */
  const TX = 10.2, poolX0 = 7.55, poolX1 = 9.95, poolZ0 = -17.8, poolZ1 = -31.4;
  floor(5.05, TX, -3.7, poolZ0, M.teak, 2.4);
  floor(5.05, poolX0, poolZ0, -32, M.teak, 2.4);
  floor(poolX1, TX, poolZ0, -32, M.teak, 2.4);
  floor(poolX0, poolX1, poolZ1, -32, M.teak, 2.4);
  // murs d'extrémité
  slab(5.05, TX + 0.2, 0, H, -3.5, -3.7, M.plaster);
  // piscine
  {
    const depth = 1.25;
    const inner = [
      [poolX0, poolX0 + 0.02, -depth, 0, poolZ0, poolZ1],
      [poolX1 - 0.02, poolX1, -depth, 0, poolZ0, poolZ1],
      [poolX0, poolX1, -depth, 0, poolZ0 - 0.02, poolZ0],
      [poolX0, poolX1, -depth, 0, poolZ1, poolZ1 + 0.02],
      [poolX0, poolX1, -depth - 0.02, -depth, poolZ0, poolZ1],
    ];
    for (const b of inner) slab(...b, M.poolTile, { cast: false });
    floor(poolX0, poolX1, poolZ0, poolZ1, M.water, 3, -0.008);
    fixture((poolX0 + poolX1) / 2, -0.3, -24.5, 5, '#6fd6e0', 9);
    // margelle
    slab(poolX0 - 0.3, poolX0, 0, 0.03, poolZ0, poolZ1, M.travertine, { cast: false });
  }
  // garde-corps verre + main courante laiton
  for (let z = -3.7; z > -32; z -= 1.9) panel(1.86, 1.1, M.glass, TX, 0.55, z - 0.95, '+x', { recv: false });
  mesh(new THREE.CylinderGeometry(0.022, 0.022, 28.3, 12), M.brass, TX, 1.1, -17.85, { rx: Math.PI / 2 });
  slab(TX, TX + 0.25, -0.32, 0.06, -3.5, -32.25, M.slabWhite);
  // pergola
  {
    const n = 30, z0 = -4.4, z1 = -13.6;
    const g = new THREE.BoxGeometry(5.1, 0.16, 0.05);
    const inst = new THREE.InstancedMesh(g, M.slabWhite, n);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) inst.setMatrixAt(i, m4.makeTranslation(7.62, H - 0.1, z0 + ((z1 - z0) * i) / (n - 1)));
    inst.castShadow = inst.receiveShadow = true;
    root.add(inst);
    for (const z of [z0 - 0.1, z1 + 0.1]) slab(TX - 0.15, TX, 0, H, z - 0.07, z + 0.07, M.slabWhite);
    slab(TX - 0.15, TX, H - 0.2, H, z1, z0, M.slabWhite);
  }
  // salon extérieur sous la pergola
  sofa(8.9, -9.0, 3.0, 0.95, M.outdoorFabric, -Math.PI / 2, { pillows: [M.cushionC, M.cushionA, M.cushionB] });
  contact(8.9, -9.0, 1.6, 3.6, 0.45);
  B(1.0, 0.32, 1.0, M.teak, 7.2, 0, -9.0, { r: 0.02 });
  lathe([[0, 0], [0.1, 0], [0.16, 0.1], [0.12, 0.3], [0.06, 0.42], [0.07, 0.46]], M.terracotta, 7.25, 0.32, -9.1);
  armchair(6.1, -7.4, Math.PI / 2 - 0.5, M.outdoorFabric);
  armchair(6.1, -10.6, Math.PI / 2 + 0.5, M.outdoorFabric);
  // transats
  for (const z of [-20.2, -22.4, -24.6]) {
    const g = new THREE.Group();
    g.position.set(6.3, 0, z);
    root.add(g);
    B(1.9, 0.26, 0.72, M.teak, 0, 0, 0, { parent: g, r: 0.02 });
    B(1.25, 0.08, 0.66, M.outdoorFabric, 0.3, 0.26, 0, { parent: g, r: 0.03, seg: 3 });
    B(0.7, 0.08, 0.66, M.outdoorFabric, -0.55, 0.42, 0, { parent: g, r: 0.03, seg: 3, rz: -0.55 });
    contact(6.3, z, 2.3, 1.0, 0.4);
  }
  // bacs de plantes
  for (const [z, s] of [[-4.6, 1.1], [-15.8, 1.0], [-31.2, 0.95]]) olive(9.5, z, s, M.slabWhite, Math.round(-z));
  {
    B(0.5, 0.5, 5.5, M.slabWhite, 5.35, 0, -16.2, { r: 0.02 });
    const r = rng(17);
    for (let i = 0; i < 60; i++) {
      const z = -13.6 - r() * 5.2;
      mesh(new THREE.ConeGeometry(0.03, 0.4 + r() * 0.3, 5), r() > 0.3 ? M.leaf : M.sage, 5.2 + r() * 0.3, 0.7 + r() * 0.1, z, { cast: false, rz: (r() - 0.5) * 0.5 });
      if (r() > 0.5) mesh(new THREE.SphereGeometry(0.03, 6, 4), std({ color: '#8f7fb6', roughness: 1 }), 5.2 + r() * 0.3, 0.95 + r() * 0.15, z, { cast: false, s: [1, 2.4, 1] });
    }
  }
  // appliques
  for (const z of [-15.2, -19.6, -24.0, -29.2]) {
    B(0.06, 0.24, 0.1, M.black, 5.12, 2.0, z, { r: 0.01, cast: false });
    glow(5.2, 2.12, z, 0.9, '#ffc27a', 0.35);
  }
  fixture(7.2, 2.4, -9.0, 5, '#ffc485', 7);

  /* ---------------- ombres : calage du soleil sur la maquette ---------------- */
  {
    const center = new THREE.Vector3(2.5, 1.5, -16);
    sun.position.copy(center).addScaledVector(sunDir, 60);
    sun.target.position.copy(center);
    sun.updateMatrixWorld();
    sun.target.updateMatrixWorld();
    const f = center.clone().sub(sun.position).normalize();
    const right = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, f);
    const mn = new THREE.Vector3(Infinity, Infinity, Infinity), mx = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (const x of [-5.3, 10.5]) for (const y of [0, H + 0.1]) for (const z of [-32.3, 7.4]) {
      const p = new THREE.Vector3(x, y, z).sub(sun.position);
      const v = new THREE.Vector3(p.dot(right), p.dot(up), p.dot(f));
      mn.min(v);
      mx.max(v);
    }
    const c = sun.shadow.camera;
    c.left = mn.x - 0.5; c.right = mx.x + 0.5; c.bottom = mn.y - 0.5; c.top = mx.y + 0.5;
    c.near = Math.max(0.1, mn.z - 2); c.far = mx.z + 2;
    c.updateProjectionMatrix();
    const budget = mobile ? 2048 * 2048 : 3072 * 3072;
    const aspect = (c.right - c.left) / (c.top - c.bottom);
    const cap = mobile ? 4096 : 8192;
    let w = Math.min(cap, Math.sqrt(budget * aspect)), h = budget / w;
    const p2 = (v) => Math.pow(2, Math.round(Math.log2(v)));
    sun.shadow.mapSize.set(p2(w), Math.min(cap, p2(h)));
  }

  /* ---------------- chemin de caméra ---------------- */
  const path = [
    { p: [0, 1.62, 6.6], l: [0, 1.45, 0], stop: 'accueil' },
    { p: [0, 1.62, 2.6], l: [0, 1.5, -2.5] },
    { p: [0.25, 1.62, -0.7], l: [0.7, 1.35, -7.0], stop: 'entree' },
    { p: [-0.35, 1.6, -3.6], l: [1.0, 1.2, -8.4] },
    { p: [-3.2, 1.5, -4.7], l: [1.3, 0.95, -9.4], stop: 'sejour' },
    { p: [-0.6, 1.62, -9.4], l: [-2.3, 1.0, -15.5] },
    { p: [3.4, 1.72, -11.1], l: [-2.3, 0.8, -16.5], stop: 'cuisine' },
    { p: [0.1, 1.62, -16.9], l: [0, 1.45, -22] },
    { p: [0.05, 1.6, -19.1], l: [-1.2, 1.3, -23.2] },
    { p: [2.4, 1.52, -20.5], l: [-3.6, 0.6, -23.5], stop: 'suite' },
    { p: [-0.5, 1.6, -25.9], l: [1.8, 1.0, -30.0] },
    { p: [-1.3, 1.58, -27.4], l: [3.1, 0.62, -30.2], stop: 'bain' },
    { p: [3.9, 1.6, -28.2], l: [11, 1.2, -26.5] },
    { p: [5.9, 1.62, -28.3], l: [14, 0.8, -22] },
    { p: [6.4, 1.65, -31.0], l: [12.5, 0.5, -19], stop: 'terrasse' },
    { p: [15, 8, -27], l: [3, 0, -18] },
    { p: [27, 20, 3], l: [1.0, -3.0, -16], stop: 'vue' },
  ];
  const posCurve = new THREE.CatmullRomCurve3(path.map((k) => new THREE.Vector3(...k.p)), false, 'centripetal');
  const lookCurve = new THREE.CatmullRomCurve3(path.map((k) => new THREE.Vector3(...k.l)), false, 'centripetal');
  const stops = path.map((k, i) => (k.stop ? { id: k.stop, knot: i } : null)).filter(Boolean);
  const knots = path.length - 1;

  const state = { u: 0, door: 0, slide: 0, pull: 0 };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  /* ---------------- rendu ---------------- */
  const camPos = new THREE.Vector3(), look = new THREE.Vector3(), tmp = new THREE.Vector3();
  let width = 1, height = 1, portrait = 0;
  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // cadrage plus large en portrait (téléphone)
    camera.fov = camera.aspect < 0.62 ? 72 : camera.aspect < 0.9 ? 64 : camera.aspect < 1.3 ? 56 : 48;
    portrait = THREE.MathUtils.clamp((1.1 - camera.aspect) / 0.6, 0, 1);
    camera.updateProjectionMatrix();
  }
  resize();

  let shadowDirty = true;
  function updateLights() {
    // luminaires les plus proches de la caméra
    const sorted = fixtures.map((f) => ({ f, d: f.p.distanceTo(camPos) })).sort((a, b) => a.d - b.d);
    for (let i = 0; i < POOL; i++) {
      const l = pool[i], s = sorted[i];
      if (!s) { l.intensity = 0; continue; }
      const fade = 1 - THREE.MathUtils.smoothstep(s.d, 11, 15);
      l.position.copy(s.f.p);
      l.color.copy(s.f.color);
      l.distance = s.f.distance;
      l.intensity = s.f.intensity * fade;
    }
  }

  let time = 0;
  function render(dt = 1 / 60) {
    time += dt;
    const t = THREE.MathUtils.clamp(state.u / knots, 0, 1);
    posCurve.getPoint(t, camPos);
    lookCurve.getPoint(t, look);
    // respiration + parallaxe au pointeur
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    const breathe = opts.reducedMotion ? 0 : 1;
    camPos.y += Math.sin(time * 0.7) * 0.012 * breathe;
    // en portrait le champ vertical est large : on baisse un peu le regard (moins de plafond)
    if (camPos.y < H) look.y -= portrait * 0.14 * look.distanceTo(camPos);
    tmp.subVectors(look, camPos).normalize();
    if (state.pull) camPos.addScaledVector(tmp, -state.pull);
    const side = new THREE.Vector3().crossVectors(tmp, camera.up).normalize();
    look.addScaledVector(side, pointer.x * 0.35).y += -pointer.y * 0.2;
    camera.position.copy(camPos);
    camera.lookAt(look);

    // porte, coulissant
    door.rotation.y = state.door * 1.72;
    doorGlow.material.opacity = 0.35 * (1 - state.door);
    slider.position.z = -state.slide * 1.62;
    slider.position.x = state.slide * 0.06;
    ceilings.visible = camPos.y < H - 0.05;
    // bâtiment : fenêtres qui s'allument en vue d'ensemble
    M.facade.emissiveIntensity = THREE.MathUtils.smoothstep(camPos.y, 4, 16) * 0.4;

    // feu de cheminée
    for (let i = 0; i < flames.length; i++) {
      const f = flames[i];
      const k = f.userData.base * (0.75 + 0.25 * Math.sin(time * 7 + i * 1.7) + 0.12 * Math.sin(time * 13 + i));
      f.scale.set(1, k, 1);
      f.position.y = 0.2 + 0.15 * k;
    }
    fireGlow.material.opacity = 0.5 + 0.1 * Math.sin(time * 9);
    U.uTime.value = time;
    sky.position.copy(camPos);

    updateLights();
    if (shadowDirty) {
      renderer.shadowMap.needsUpdate = true;
      shadowDirty = false;
    }
    renderer.render(scene, camera);
  }

  // qualité adaptative : si le téléphone peine, on baisse la résolution
  let frames = 0, acc = 0;
  function adapt(dtMs) {
    if (frames > 200) return;
    frames++;
    if (frames < 20) return;
    acc += dtMs;
    if (frames % 60 === 0) {
      const avg = acc / 60;
      acc = 0;
      if (avg > 26 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.35);
        renderer.setPixelRatio(dpr);
        resize();
      }
    }
  }

  return {
    state,
    stops,
    knots,
    render,
    resize,
    adapt,
    pointer,
    renderer,
    camera,
    // compile les shaders avant l'affichage (évite l'à-coup de la première image)
    async warm() {
      render(0);
      if (renderer.compileAsync) await renderer.compileAsync(scene, camera);
      render(0);
    },
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
    },
    snapshot(stopId) {
      const s = stops.find((k) => k.id === stopId);
      if (s) state.u = s.knot;
      render(0);
      return canvas.toDataURL('image/webp', 0.86);
    },
  };
}
