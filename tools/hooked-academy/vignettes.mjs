// Miniatures des leçons (cartes du parcours, façon « classroom ») : une image JPG 640×360 par leçon,
// tirée de sa vidéo animée (2ᵉ scène, aux trois quarts : la plus parlante après le titre).
//
//   node tools/hooked-academy/vignettes.mjs              leçons sans miniature
//   node tools/hooked-academy/vignettes.mjs --toutes     toutes les leçons
//   node tools/hooked-academy/vignettes.mjs m2-l7 ia1-l9 leçons choisies
//   … --lang=en | --lang=ar | --lang=tout       version anglaise, arabe, ou les trois langues
//
// Sortie : sites/hooked-academy/video/vignettes/<leçon>.jpg en français, vignettes/en/ et vignettes/ar/ pour
// les autres langues (la plateforme prend celle de la langue de l'interface, sinon la française).
// Prérequis : Node 20+, ffmpeg, `npm i playwright` puis `npx playwright install chromium` (ou CHROMIUM=…).
// HA_CDN_LOCAL=<node_modules> sert gsap sans réseau ; HA_FONTS_ROUTE=<module> permet de router les polices.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, access, writeFile, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../sites');
const VIGN = path.join(ROOT, 'hooked-academy/video/vignettes');
const args = process.argv.slice(2);
const ALL = args.includes('--toutes');
const only = args.filter((a) => !a.startsWith('--'));
const langArg = (args.find((a) => a.startsWith('--lang=')) || '--lang=fr').slice(7);
const LANGS = langArg === 'tout' ? ['fr', 'en', 'ar'] : [langArg];
if (!LANGS.every((l) => ['fr', 'en', 'ar'].includes(l))) throw new Error(`langue inconnue : ${langArg}`);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT)) throw new Error('hors du site');
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(await readFile(f));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/hooked-academy`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
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
if (process.env.HA_FONTS_ROUTE) await (await import(pathToFileURL(process.env.HA_FONTS_ROUTE).href)).routeFonts(ctx);

const page = await ctx.newPage();
await page.goto(`${BASE}/motion/player.html?id=m1-l1&render=1`);
const lessons = await page.evaluate(async () => (await import('../data/programme.js')).allLessons().map((l) => l.id));
const exists = (f) => access(f).then(() => true, () => false);
const ffmpeg = (a) => new Promise((ok, ko) => spawn('ffmpeg', ['-nostdin', '-v', 'error', '-y', ...a], { stdio: 'inherit' }).on('close', (c) => (c ? ko(new Error(`ffmpeg ${c}`)) : ok())));

let n = 0;
for (const lang of LANGS) for (const id of lessons) {
  const OUT = lang === 'fr' ? VIGN : path.join(VIGN, lang);
  await mkdir(OUT, { recursive: true });
  const out = path.join(OUT, `${id}.jpg`);
  if (only.length ? !only.includes(id) : !ALL && (await exists(out))) continue;
  await page.goto(`${BASE}/motion/player.html?id=${id}&render=1&lang=${lang}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
  const at = await page.evaluate(async (id) => {
    const { findLesson } = await import('../data/programme.js');
    const { plan } = await import('./engine.js');
    const p = plan(findLesson(id).lesson);
    const s = p[Math.min(1, p.length - 1)];
    return s.t + s.d * 0.75;
  }, id);
  await page.evaluate((t) => window.__seek(t), at);
  await page.waitForTimeout(120);
  const png = path.join(OUT, `${id}.png`);
  await page.screenshot({ path: png });
  await ffmpeg(['-i', png, '-vf', 'scale=640:360:flags=lanczos', '-q:v', '5', out]);
  await unlink(png);
  n++;
  process.stdout.write(`✓ ${lang} ${id}\n`);
}
await browser.close();
server.close();
await writeFile(path.join(VIGN, 'LISEZMOI.md'), '# Miniatures des leçons\n\nGénérées par `tools/hooked-academy/vignettes.mjs` (une image par leçon, tirée de sa vidéo animée) :\nfrançais ici, anglais dans `en/`, arabe dans `ar/`.\nNe pas modifier à la main : relancer le script après avoir ajouté ou changé une leçon.\n');
console.log(`${n} miniature(s) écrite(s) dans ${path.relative(process.cwd(), VIGN)}`);
