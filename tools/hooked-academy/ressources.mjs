// Ressources de l'équipe Hooked Academy : génère sites/hooked-academy/ressources/manifest.json à partir
// des fichiers déposés leçon par leçon dans sites/hooked-academy/ressources/<leçon>/ (ex. ressources/ia1-l2/).
// L'espace étudiant (onglets PDF, Prompts et Ressources de la leçon, page Ressources) et l'espace équipe
// (#/ressources) lisent ce manifeste. Lancé par l'action « Ressources hooked-academy » à chaque dépôt.
//
//   node tools/hooked-academy/ressources.mjs           écrit le manifeste s'il a changé
//   node tools/hooked-academy/ressources.mjs --check   n'écrit rien ; code de sortie 1 s'il n'est pas à jour
//
// Formats (voir sites/hooked-academy/ressources/LISEZMOI.md) :
//   .pdf                     → PDF (guides, fiches)
//   .txt, .md                → un prompt par fichier ; une première ligne « # Titre » donne le titre
//   liens.txt (ou links.txt) → une ligne par lien : « Titre | https://… » (lignes vides et « # … » ignorées)
//   .png .jpg .webp .gif …   → image (aperçu)
//   autre                    → fichier à télécharger (zip, modèle, preset…)
// Langue : « guide.ar.pdf », « prompt.en.txt », « liens.fr.txt » → la ressource ne s'affiche que dans
// cette langue (fr, en, ar) ; sans code, elle s'affiche dans les trois.
// Titre : tiré du nom du fichier (« 01-guide-des-hooks.pdf » → « Guide des hooks ») ; le préfixe
// numérique sert seulement à ordonner.
// Prudence : seuls les dossiers dont le nom est une leçon du programme sont lus (les autres sont signalés),
// pas de sous-dossiers ni de liens symboliques, fichiers cachés ignorés, texte des prompts plafonné,
// fichiers de plus de 25 Mo écartés (limite d'un fichier servi par Cloudflare et d'un dépôt par le web).
// Sans dépendance : Node 18 ou plus.

import { readdir, readFile, writeFile, lstat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../sites/hooked-academy');
const DIR = path.join(SITE, 'ressources');
const OUT = path.join(DIR, 'manifest.json');
const CHECK = process.argv.includes('--check');

const LANGS = ['fr', 'en', 'ar'];
const KIND_ORDER = ['pdf', 'prompt', 'link', 'image', 'file'];
const IMAGES = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'svg']);
const PROMPTS = new Set(['txt', 'md']);
const LINK_FILES = new Set(['liens', 'lien', 'links', 'link']);
const IGNORED = new Set(['lisezmoi.md', 'readme.md', 'manifest.json', 'thumbs.db', 'desktop.ini']);
const MAX_TEXT = 20000; // caractères d'un prompt
const MAX_TITLE = 140;
const MAX_LINKS = 200; // lignes lues dans un liens.txt
const MAX_SIZE = 25 * 1024 * 1024;

const GH = !!process.env.GITHUB_ACTIONS;
const warnings = [];
function warn(msg) {
  warnings.push(msg);
  // Annotation GitHub (visible dans le résumé de l'action) : % et retours à la ligne s'échappent
  const esc = (s) => s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  console.warn(GH ? `::warning title=Ressources hooked-academy::${esc(msg)}` : `⚠ ${msg}`);
}

/** Identifiants des leçons, dans l'ordre du programme. */
async function lessonIds() {
  if (typeof globalThis.localStorage === 'undefined') {
    // Le programme lit la langue choisie dans le navigateur : en Node, on reste sur le français
    globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  }
  try {
    const { allLessons } = await import(pathToFileURL(path.join(SITE, 'data/programme.js')).href);
    const ids = allLessons().map((l) => l.id);
    if (ids.length) return ids;
  } catch (e) {
    warn(`programme illisible (${e.message}) : identifiants lus directement dans data/`);
  }
  const ids = [];
  for (const f of ['programme.js', 'programme-ia.js']) {
    const src = await readFile(path.join(SITE, 'data', f), 'utf8').catch(() => '');
    for (const m of src.matchAll(/\bid:\s*'((?:m|ia)\d+-l\d+)'/g)) if (!ids.includes(m[1])) ids.push(m[1]);
  }
  if (!ids.length) throw new Error('aucune leçon trouvée dans data/programme.js');
  return ids;
}

const clean = (s) => String(s).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
const cut = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** « 01-guide-des-hooks » → « Guide des hooks » ; « Prompt UGC (avatar) » reste tel quel. */
function titleOf(base) {
  let s = base.normalize('NFC').replace(/^\d{1,3}(?:\s*[-_.)]\s*|\s+)(?=\S)/, '');
  s = s.replace(/_+/g, ' ');
  if (!/\s/.test(s)) s = s.replace(/-+/g, ' ');
  s = clean(s);
  return cut(s.charAt(0).toLocaleUpperCase('fr') + s.slice(1), MAX_TITLE);
}

/** Nom → { base, lang, ext } : « guide.ar.pdf » → { base: 'guide', lang: 'ar', ext: 'pdf' }. */
function parseName(name) {
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
  let base = dot > 0 ? name.slice(0, dot) : name;
  let lang = null;
  const m = base.match(/^(.+)\.(fr|en|ar)$/i);
  if (m) {
    base = m[1];
    lang = m[2].toLowerCase();
  }
  return { base, lang, ext };
}

const readText = async (f) => (await readFile(f, 'utf8')).replace(/^﻿/, '').replace(/\r\n?/g, '\n');

/** Un prompt : le texte du fichier (première ligne « # Titre » facultative). */
async function promptItem(file, abs, base) {
  let text = (await readText(abs)).trim();
  let title = titleOf(base);
  const head = text.match(/^#{1,3}[ \t]+(.+)\n?/);
  if (head) {
    title = cut(clean(head[1]), MAX_TITLE) || title;
    text = text.slice(head[0].length).trim();
  }
  if (!text) return warn(`${file} : prompt vide, ignoré`);
  if (text.length > MAX_TEXT) {
    warn(`${file} : prompt de ${text.length} caractères, coupé à ${MAX_TEXT}`);
    text = `${text.slice(0, MAX_TEXT).trimEnd()}\n…`;
  }
  return { kind: 'prompt', title, text };
}

/** liens.txt : une ligne par lien, « Titre | https://… » (le titre est facultatif). */
async function linkItems(file, abs) {
  const out = [];
  const lines = (await readText(abs)).split('\n');
  for (const [i, raw] of lines.entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    if (out.length >= MAX_LINKS) {
      warn(`${file} : plus de ${MAX_LINKS} liens, la suite est ignorée`);
      break;
    }
    const m = line.match(/(https?:\/\/\S+)$/i);
    let url = null;
    try {
      url = m && new URL(m[1]);
    } catch {}
    if (!url || !/^https?:$/.test(url.protocol)) {
      warn(`${file}, ligne ${i + 1} : pas d'adresse https://… en fin de ligne (« ${cut(line, 60)} »)`);
      continue;
    }
    const before = clean(line.slice(0, m.index).replace(/[\s|:—–-]+$/, ''));
    const title = cut(before, MAX_TITLE) || cut(`${url.hostname.replace(/^www\./, '')}${url.pathname === '/' ? '' : url.pathname}`, MAX_TITLE);
    out.push({ kind: 'link', title, url: url.href });
  }
  if (!out.length) warn(`${file} : aucun lien valide`);
  return out;
}

async function lessonItems(id) {
  const dir = path.join(DIR, id);
  const items = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const name = e.name;
    const rel = `${id}/${name}`;
    if (name.startsWith('.') || IGNORED.has(name.toLowerCase())) continue;
    if (e.isSymbolicLink()) {
      warn(`${rel} : lien symbolique ignoré`);
      continue;
    }
    if (e.isDirectory()) {
      warn(`${rel}/ : sous-dossier ignoré (dépose les fichiers directement dans ressources/${id}/)`);
      continue;
    }
    if (!e.isFile()) continue;
    // Le nom sert d'adresse : ces caractères casseraient le lien sur le site
    if (/[#?%\\<>"|*:\u0000-\u001f\u007f]/.test(name) || name.normalize('NFC') !== name.normalize('NFC').trim()) {
      warn(`${rel} : nom de fichier à éviter (# ? % \\ < > " | * : ou espaces au bord), fichier ignoré — renomme-le`);
      continue;
    }
    const abs = path.join(dir, name);
    const st = await lstat(abs);
    if (!st.size) {
      warn(`${rel} : fichier vide, ignoré`);
      continue;
    }
    if (st.size > MAX_SIZE) {
      warn(`${rel} : ${(st.size / 1048576).toFixed(1)} Mo, au-delà des 25 Mo qu'accepte le site — mets-le sur Drive et ajoute son lien dans liens.txt`);
      continue;
    }
    const { base, lang, ext } = parseName(name);
    const common = { file: name, ...(lang ? { lang } : {}) };
    const at = `ressources/${id}/${name}`;
    if (PROMPTS.has(ext) && LINK_FILES.has(base.toLowerCase())) {
      for (const l of await linkItems(rel, abs)) items.push({ ...l, ...common });
    } else if (PROMPTS.has(ext)) {
      if (st.size > MAX_TEXT * 4 + 1024) warn(`${rel} : fichier texte très long, seul le début sert de prompt`);
      const p = await promptItem(rel, abs, base);
      if (p) items.push({ kind: p.kind, title: p.title, ...common, path: at, size: st.size, text: p.text });
    } else {
      const kind = ext === 'pdf' ? 'pdf' : IMAGES.has(ext) ? 'image' : 'file';
      items.push({ kind, title: titleOf(base), ...common, path: at, size: st.size });
    }
  }
  // PDF, prompts, liens, images, fichiers ; puis par nom (« 02 » avant « 10 ») ; les liens gardent leur ordre
  const coll = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });
  return items
    .map((it, i) => ({ it, i }))
    .sort((a, b) => KIND_ORDER.indexOf(a.it.kind) - KIND_ORDER.indexOf(b.it.kind) || coll.compare(a.it.file, b.it.file) || a.i - b.i)
    .map(({ it }) => it);
}

const ids = await lessonIds();
const known = new Set(ids);
const found = new Map();
const top = await readdir(DIR, { withFileTypes: true }).catch(() => []);
for (const e of top) {
  if (e.name.startsWith('.') || !e.isDirectory()) continue; // LISEZMOI.md, manifest.json, .gitkeep…
  if (!known.has(e.name)) {
    warn(`ressources/${e.name}/ : ce n'est pas un identifiant de leçon (ex. m1-l1, ia2-l3), dossier ignoré`);
    continue;
  }
  const items = await lessonItems(e.name);
  if (items.length) found.set(e.name, items);
}
const lessons = Object.fromEntries(ids.filter((id) => found.has(id)).map((id) => [id, found.get(id)]));

let old = null;
try {
  old = JSON.parse(await readFile(OUT, 'utf8'));
} catch {}
const same = old && JSON.stringify(old.lessons) === JSON.stringify(lessons);

const n = Object.values(lessons).reduce((s, l) => s + l.length, 0);
for (const [id, list] of Object.entries(lessons)) {
  const c = KIND_ORDER.map((k) => [k, list.filter((x) => x.kind === k).length]).filter(([, v]) => v);
  console.log(`${id} : ${c.map(([k, v]) => `${v} ${k}`).join(', ')}`);
}
console.log(`${n} ressource(s) dans ${Object.keys(lessons).length} leçon(s)${warnings.length ? `, ${warnings.length} avertissement(s)` : ''}.`);

if (same) {
  console.log('Manifeste déjà à jour.');
} else if (CHECK) {
  console.log('Manifeste à régénérer : node tools/hooked-academy/ressources.mjs');
  process.exitCode = 1;
} else {
  await mkdir(DIR, { recursive: true });
  await writeFile(OUT, `${JSON.stringify({ generated: new Date().toISOString(), lessons }, null, 2)}\n`);
  console.log(`Manifeste écrit : ${path.relative(path.resolve(SITE, '../..'), OUT)}`);
}
