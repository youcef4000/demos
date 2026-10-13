// Rendu MP4 des vidéos Hooked Academy, image par image, depuis les compositions du site.
//
//   node tools/hooked-academy/render.mjs m1-l1 m1-l2        leçons choisies
//   node tools/hooked-academy/render.mjs --all              toutes les leçons
//   node tools/hooked-academy/render.mjs --voix             toutes les leçons qui ont une voix off
//   options : --out <dossier> (défaut : sites/hooked-academy/video) --fps 30 --hauteur 1080
//
// Voix off : champ `audio` de la leçon, sinon un fichier video/voix/<id>.(m4a|mp3|wav|webm|ogg)
// enregistré dans le studio de l'admin (calé sur l'animation). Elle est nettoyée, normalisée et
// ajoutée au MP4 ; video/manifest.json est mis à jour pour que la plateforme lise ce MP4.
// Sans voix, la vidéo est muette : prête à recevoir la voix off en darija dans CapCut.
// Prérequis : Node 20+, ffmpeg, `npm i playwright` puis `npx playwright install chromium`
// (ou CHROMIUM=/chemin/vers/chrome). HA_CDN_LOCAL=<node_modules> sert gsap sans réseau.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../sites');
const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const FPS = +opt('--fps', 30);
const H = +opt('--hauteur', 1080);
const OUT = path.resolve(opt('--out', path.join(ROOT, 'hooked-academy/video')));
const ids = args.filter((a, i) => !a.startsWith('--') && !['--fps', '--out', '--hauteur'].includes(args[i - 1]));

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.m4a': 'audio/mp4', '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT)) throw new Error('hors du site');
    const body = await readFile(f);
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/hooked-academy`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: H / 1080 });
if (process.env.HA_CDN_LOCAL) {
  await ctx.route('https://cdn.jsdelivr.net/npm/**', async (route) => {
    const m = new URL(route.request().url()).pathname.match(/^\/npm\/(@?[^@/]+(?:\/[^@/]+)?)@[^/]+\/(.*)$/);
    try {
      return route.fulfill({ status: 200, body: await readFile(path.join(process.env.HA_CDN_LOCAL, m[1], m[2])), headers: { 'content-type': 'text/javascript' } });
    } catch {
      return route.fulfill({ status: 404, body: '' });
    }
  });
}

// Liste des leçons : lue dans le programme du site
const page0 = await ctx.newPage();
await page0.goto(`${BASE}/motion/player.html?id=m1-l1&render=1`);
const lessons = await page0.evaluate(async () => {
  const m = await import('../data/programme.js');
  return m.allLessons().map((l) => ({ id: l.id, audio: l.audio || null, posterAt: l.posterAt ?? null, title: l.title }));
});
await page0.close();
// Voix déposées dans video/voix/ par l'équipe (studio de l'admin)
const VOIX = path.join(ROOT, 'hooked-academy/video/voix');
const voiceFiles = await readdir(VOIX).catch(() => []);
for (const l of lessons) {
  if (l.audio) continue;
  const f = ['m4a', 'mp3', 'wav', 'webm', 'ogg'].map((e) => `${l.id}.${e}`).find((n) => voiceFiles.includes(n)) || voiceFiles.find((n) => n.startsWith(`${l.id}-voix`));
  if (f) {
    l.audio = `video/voix/${f}`;
    l.raw = true; // prise brute du studio : on la nettoie au rendu
  }
}
const todo = args.includes('--all') ? lessons : args.includes('--voix') ? lessons.filter((l) => l.audio) : lessons.filter((l) => ids.includes(l.id));
if (!todo.length) {
  console.error('Aucune leçon à rendre. Exemple : node tools/hooked-academy/render.mjs m1-l1');
  process.exit(1);
}
await mkdir(OUT, { recursive: true });
const voiced = [];

for (const L of todo) {
  const t0 = Date.now();
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`  [${L.id}] erreur page :`, e.message));
  await page.goto(`${BASE}/motion/player.html?id=${L.id}&render=1`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const dur = await page.evaluate(() => window.__duration);
  const frames = Math.ceil(dur * FPS);
  const file = path.join(OUT, `${L.id}.mp4`);
  let audio = null;
  if (L.audio) {
    const a = path.join(ROOT, 'hooked-academy', L.audio);
    if (await stat(a).catch(() => null)) audio = a;
  }
  const ff = spawn(
    'ffmpeg',
    [
      '-v', 'error', '-y',
      '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      ...(audio ? ['-i', audio] : []),
      '-map', '0:v',
      ...(audio ? ['-map', '1:a', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-af', !L.raw ? 'apad' : 'highpass=f=75,afftdn=nf=-30,acompressor=threshold=-24dB:ratio=3:attack=8:release=120:makeup=3,loudnorm=I=-16:TP=-1.5:LRA=9,apad'] : []),
      '-t', dur.toFixed(3),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-tune', 'animation', '-pix_fmt', 'yuv420p',
      '-profile:v', 'high', '-g', String(FPS * 2), '-movflags', '+faststart',
      file,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  const done = new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error(`ffmpeg ${c}`)))));
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.__seek(t), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % (FPS * 10) === 0) process.stdout.write(`  ${L.id} ${Math.round((i / frames) * 100)} %\r`);
  }
  ff.stdin.end();
  await done;
  // Affiche : une image claire de la vidéo, en 1280 px
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.evaluate((t) => window.__seek(t), L.posterAt ?? Math.min(dur - 0.5, 2.2));
  await page.screenshot({ path: path.join(OUT, `${L.id}.jpg`), type: 'jpeg', quality: 82, scale: 'css', clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  await page.close();
  console.log(`✓ ${L.id} — ${dur.toFixed(1)} s, ${frames} images${audio ? ', voix off' : ', muette'} (${Math.round((Date.now() - t0) / 1000)} s)`);
  if (audio) voiced.push(L.id);
}

// Manifeste lu par la plateforme : leçons dont le MP4 avec voix off est publié
if (voiced.length) {
  const mf = path.join(OUT, 'manifest.json');
  const cur = JSON.parse(await readFile(mf, 'utf8').catch(() => '{}'));
  for (const id of voiced) cur[id] = { video: `video/${id}.mp4`, poster: `video/${id}.jpg`, voice: true };
  await writeFile(mf, `${JSON.stringify(cur, null, 2)}\n`);
  console.log('manifest.json mis à jour :', voiced.join(', '));
}

await browser.close();
server.close();
