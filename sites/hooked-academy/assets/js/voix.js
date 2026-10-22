// Voix off d'une leçon à partir d'une prise (mémo vocal du téléphone ou enregistrement du studio), dans le navigateur :
// 1. decode()  : le fichier (m4a, mp3, wav, webm…) devient un signal mono à 44,1 kHz ;
// 2. autoCuts(): une coupe entre chaque scène, dans la pause la plus proche de la fin attendue (au prorata du texte) ;
// 3. build()   : chaque scène garde sa parole (silences rognés), un souffle avant, une respiration après, et au moins
//                la durée de son animation ; filtre, compresseur, volume calé (≈ −16 LUFS), crête sous −1,5 dB ;
// 4. mp3()     : encodage MP3 96 kb/s (assets/vendor/lame.min.js), prêt à déposer sur le serveur.
// Même méthode que tools/hooked-academy/voix-off.py, sans rien installer.

export const SR = 44100;
const LEAD = 0.35;
const TAIL = 0.45;

/** Fichier audio → { x: Float32Array mono, sr }. */
export async function decode(blob) {
  const buf = await blob.arrayBuffer();
  const ctx = new OfflineAudioContext(1, 1, SR);
  const ab = await ctx.decodeAudioData(buf);
  const x = new Float32Array(ab.length);
  for (let c = 0; c < ab.numberOfChannels; c++) {
    const ch = ab.getChannelData(c);
    for (let i = 0; i < ch.length; i++) x[i] += ch[i] / ab.numberOfChannels;
  }
  return { x, sr: ab.sampleRate };
}

/** Niveau (dB) par fenêtre de 20 ms. */
export function levels(x, sr, win = 0.02) {
  const n = Math.max(1, Math.round(sr * win));
  const out = new Float32Array(Math.floor(x.length / n));
  for (let k = 0; k < out.length; k++) {
    let s = 0;
    for (let i = k * n; i < (k + 1) * n; i++) s += x[i] * x[i];
    out[k] = 20 * Math.log10(Math.sqrt(s / n) + 1e-9);
  }
  return { db: out, win };
}
const pct = (arr, p) => {
  const a = Array.from(arr).sort((u, v) => u - v);
  return a[Math.min(a.length - 1, Math.max(0, Math.floor((p / 100) * a.length)))] ?? -90;
};

/** Plages de silence [[début, fin], …] en secondes. */
export function silences(x, sr, minLen = 0.16) {
  const { db, win } = levels(x, sr);
  const floor = Math.max(-38, pct(db, 95) - 34);
  const out = [];
  let start = -1;
  for (let i = 0; i <= db.length; i++) {
    const q = i < db.length && db[i] < floor;
    if (q && start < 0) start = i;
    if (!q && start >= 0) {
      if ((i - start) * win >= minLen) out.push([start * win, i * win]);
      start = -1;
    }
  }
  return out;
}

/** Début et fin de la parole d'un extrait (secondes). */
export function speech(x, sr) {
  const { db, win } = levels(x, sr);
  const th = Math.max(-45, pct(db, 95) - 36);
  let a = -1;
  let b = -1;
  for (let i = 0; i < db.length; i++)
    if (db[i] > th) {
      if (a < 0) a = i;
      b = i;
    }
  if (a < 0) return [0, x.length / sr];
  return [Math.max(0, a * win - 0.05), Math.min(x.length / sr, (b + 1) * win + 0.12)];
}

/**
 * Coupes entre les scènes (n − 1 instants, en secondes) : dans la pause la plus proche de la fin attendue de chaque
 * scène (au prorata de la longueur de son texte). Sans pause assez proche : à l'instant attendu.
 */
export function autoCuts(x, sr, weights) {
  const n = weights.length;
  if (n < 2) return [];
  const sil = silences(x, sr);
  const [head, tail] = speech(x, sr);
  const w = weights.map((v) => Math.max(1, v));
  const tot = w.reduce((s, v) => s + v, 0);
  const cuts = [];
  let prev = head;
  let acc = 0;
  for (let k = 0; k < n - 1; k++) {
    acc += w[k];
    const e = head + (acc / tot) * (tail - head);
    const span = Math.max(2.5, 0.12 * (tail - head));
    const cand = sil.filter(([a, b]) => (a + b) / 2 > prev + 0.6 && (a + b) / 2 < tail - 0.3 && Math.abs((a + b) / 2 - e) < span);
    let c = e;
    if (cand.length) {
      const best = cand.reduce((m, s) => (Math.abs((s[0] + s[1]) / 2 - e) - 1.5 * (s[1] - s[0]) < Math.abs((m[0] + m[1]) / 2 - e) - 1.5 * (m[1] - m[0]) ? s : m));
      c = (best[0] + best[1]) / 2;
    }
    c = Math.max(prev + 0.3, c);
    cuts.push(+c.toFixed(2));
    prev = c;
  }
  return cuts;
}

/** Segments [début, fin] de chaque scène à partir des coupes. */
export const segments = (dur, cuts) => [0, ...cuts].map((a, i) => [a, i < cuts.length ? cuts[i] : dur]);

/**
 * Piste finale : un bloc par scène (souffle, parole, respiration, durée minimale de l'animation), puis la finition.
 * mins : durée minimale de chaque scène (animation). Renvoie { pcm: Float32Array, d: [durées], sr }.
 */
export async function build(x, sr, cuts, mins) {
  const segs = segments(x.length / sr, cuts);
  const parts = [];
  const d = [];
  segs.forEach(([a, b], i) => {
    let seg = x.subarray(Math.floor(a * sr), Math.ceil(b * sr));
    const [s0, s1] = speech(seg, sr);
    seg = seg.slice(Math.floor(s0 * sr), Math.ceil(s1 * sr));
    const fade = Math.min(Math.floor(0.012 * sr), Math.floor(seg.length / 2));
    for (let k = 0; k < fade; k++) {
      seg[k] *= k / fade;
      seg[seg.length - 1 - k] *= k / fade;
    }
    const dur = Math.round(Math.max(LEAD + seg.length / sr + TAIL, mins[i] || 4) * 100) / 100;
    const pad = new Float32Array(Math.round(dur * sr));
    pad.set(seg.subarray(0, pad.length - Math.round(LEAD * sr)), Math.round(LEAD * sr));
    parts.push(pad);
    d.push(dur);
  });
  const raw = new Float32Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    raw.set(p, o);
    o += p.length;
  }
  return { pcm: await finish(raw, sr), d, sr };
}

/** Finition : coupe-bas, égalisation douce, compresseur, puis volume et crête. */
async function finish(raw, sr) {
  const ctx = new OfflineAudioContext(1, raw.length, sr);
  const src = ctx.createBufferSource();
  const ab = ctx.createBuffer(1, raw.length, sr);
  ab.copyToChannel(raw, 0);
  src.buffer = ab;
  const hp = Object.assign(ctx.createBiquadFilter(), { type: 'highpass' });
  hp.frequency.value = 75;
  const lo = Object.assign(ctx.createBiquadFilter(), { type: 'peaking' });
  lo.frequency.value = 250;
  lo.Q.value = 1.2;
  lo.gain.value = -2;
  const pr = Object.assign(ctx.createBiquadFilter(), { type: 'peaking' });
  pr.frequency.value = 3200;
  pr.Q.value = 1;
  pr.gain.value = 2;
  const cp = ctx.createDynamicsCompressor();
  cp.threshold.value = -21;
  cp.knee.value = 6;
  cp.ratio.value = 2.8;
  cp.attack.value = 0.006;
  cp.release.value = 0.09;
  src.connect(hp).connect(lo).connect(pr).connect(cp).connect(ctx.destination);
  src.start();
  const y = (await ctx.startRendering()).getChannelData(0).slice();
  // Volume : la parole (fenêtres au-dessus du bruit) amenée vers −18 dBFS efficaces (≈ −16 LUFS pour la voix)
  const { db } = levels(y, sr);
  const th = pct(db, 95) - 30;
  const voiced = Array.from(db).filter((v) => v > th);
  const rms = voiced.length ? 10 * Math.log10(voiced.reduce((s, v) => s + 10 ** (v / 10), 0) / voiced.length) : -30;
  let gain = 10 ** ((-18 - rms) / 20);
  let peak = 0;
  for (let i = 0; i < y.length; i++) peak = Math.max(peak, Math.abs(y[i]));
  const ceil = 10 ** (-1.5 / 20);
  if (peak * gain > ceil) gain = ceil / Math.max(peak, 1e-6);
  for (let i = 0; i < y.length; i++) y[i] *= gain;
  return y;
}

let lame = null;
function loadLame() {
  if (window.lamejs) return Promise.resolve(window.lamejs);
  lame ||= new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = new URL('../vendor/lame.min.js', import.meta.url).href;
    s.onload = () => (window.lamejs ? ok(window.lamejs) : ko(new Error('lamejs')));
    s.onerror = () => ko(new Error('lamejs'));
    document.head.append(s);
  });
  return lame;
}

/** Encodage MP3 (mono, 96 kb/s). onProgress(0 → 1). */
export async function mp3(pcm, sr, onProgress) {
  const L = await loadLame();
  const enc = new L.Mp3Encoder(1, sr, 96);
  const out = [];
  const block = 1152 * 20;
  const i16 = new Int16Array(block);
  for (let i = 0; i < pcm.length; i += block) {
    const n = Math.min(block, pcm.length - i);
    for (let k = 0; k < n; k++) i16[k] = Math.max(-32768, Math.min(32767, Math.round(pcm[i + k] * 32767)));
    const b = enc.encodeBuffer(i16.subarray(0, n));
    if (b.length) out.push(new Uint8Array(b.buffer, b.byteOffset, b.length).slice());
    if ((i / block) % 20 === 0) {
      onProgress?.(i / pcm.length);
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  const f = enc.flush();
  if (f.length) out.push(new Uint8Array(f.buffer, f.byteOffset, f.length).slice());
  onProgress?.(1);
  return new Blob(out, { type: 'audio/mpeg' });
}

/** WAV 16 bits (aperçu instantané avec l'animation, avant l'encodage MP3). */
export function wav(pcm, sr) {
  const b = new DataView(new ArrayBuffer(44 + pcm.length * 2));
  const w = (o, s) => [...s].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF');
  b.setUint32(4, 36 + pcm.length * 2, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  b.setUint32(16, 16, true);
  b.setUint16(20, 1, true);
  b.setUint16(22, 1, true);
  b.setUint32(24, sr, true);
  b.setUint32(28, sr * 2, true);
  b.setUint16(32, 2, true);
  b.setUint16(34, 16, true);
  w(36, 'data');
  b.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i++) b.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, Math.round(pcm[i] * 32767))), true);
  return new Blob([b], { type: 'audio/wav' });
}

/** Forme d'onde (pics) pour l'affichage : n colonnes. */
export function peaks(x, n) {
  const out = new Float32Array(n);
  const step = x.length / n;
  for (let k = 0; k < n; k++) {
    let m = 0;
    const a = Math.floor(k * step);
    const b = Math.min(x.length, Math.floor((k + 1) * step));
    for (let i = a; i < b; i += 4) m = Math.max(m, Math.abs(x[i]));
    out[k] = m;
  }
  return out;
}
