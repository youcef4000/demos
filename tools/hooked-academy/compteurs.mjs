// Nombres de leçons et de modules écrits dans le HTML des pages publiques (landing et /ia/).
// La source est le programme (data/programme.js, sans le module de bienvenue) : les pages recalculent les nombres
// au chargement, et ce script écrit les mêmes valeurs dans le HTML, pour que rien ne reste vide (« — », « 0 »)
// avant le JavaScript ou quand il ne tourne pas (navigateur intégré de Facebook / Instagram, aperçu d'un lien).
//
//   node tools/hooked-academy/compteurs.mjs           met le HTML à jour
//   node tools/hooked-academy/compteurs.mjs --check   vérifie seulement (code 1 si un nombre est faux)
//
// À relancer après avoir ajouté ou retiré une leçon ou un module.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../sites/hooked-academy');
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
const { TRACKS, allLessons, coreModulesOf } = await import(pathToFileURL(path.join(SITE, 'data/programme.js')).href);

const LESSONS = allLessons().filter((l) => !l.module.intro);
const C = Object.fromEntries(TRACKS.map((t) => [t.id, { lessons: LESSONS.filter((l) => l.module.track === t.id).length, mods: coreModulesOf(t.id).length }]));
const ALL = { lessons: LESSONS.length, mods: TRACKS.reduce((s, t) => s + C[t.id].mods, 0) };
const nL = (n) => `${n} ${n > 1 ? 'leçons' : 'leçon'}`;
const nM = (n) => `${n} ${n > 1 ? 'modules' : 'module'}`;
// Remplacement entre les deux groupes du motif (fonction : un chiffre collé à « $1 » ne serait pas lu comme un groupe)
const w = (text) => (_, a, b) => `${a}${text}${b}`;

// [fichier, motif, remplacement] : le texte français de départ, identique à ce qu'écrit le JavaScript
const RULES = [
  ...TRACKS.map((t) => ['index.html', new RegExp(`(<span class="duo-n" id="duo-n-${t.id}">)[^<]*(</span>)`), w(`${nL(C[t.id].lessons)} · ${nM(C[t.id].mods)} · projet final`)]),
  ['index.html', /(id="coach-lessons">)[^<]*(<)/, w(`${ALL.lessons}`)],
  ['index.html', /(<h3 id="count-t">)[^<]*(<\/h3>)/, w(`${nL(ALL.lessons)}, ${nM(ALL.mods)}, un projet final par formation`)],
  ...[
    ['ia-lessons', C.ia.lessons],
    ['ia-mods', C.ia.mods],
    ['crea-lessons', C.creative.lessons],
    ['crea-mods', C.creative.mods],
    ['dev-lessons', C.dev.lessons],
    ['dev-mods', C.dev.mods],
  ].map(([k, n]) => ['ia/index.html', new RegExp(`(data-count="${k}">)[^<]*(<)`, 'g'), w(`${n}`)]),
];

const check = process.argv.includes('--check');
const files = {};
let wrong = 0;
for (const [f, re, to] of RULES) {
  files[f] ??= await readFile(path.join(SITE, f), 'utf8');
  const src = files[f];
  if (!re.test(src)) {
    console.error(`✗ ${f} : élément introuvable (${re.source})`);
    wrong++;
    continue;
  }
  re.lastIndex = 0;
  const out = src.replace(re, to);
  if (out !== src) {
    wrong++;
    if (check) console.error(`✗ ${f} : nombre à mettre à jour (${re.source.slice(0, 50)}…)`);
  }
  files[f] = out;
}
if (!check) for (const [f, s] of Object.entries(files)) await writeFile(path.join(SITE, f), s);
console.log(TRACKS.map((t) => `${t.id} : ${nL(C[t.id].lessons)} / ${nM(C[t.id].mods)}`).join(' · '), `· total ${nL(ALL.lessons)}`);
if (check && wrong) process.exit(1);
console.log(check ? 'HTML à jour.' : wrong ? 'HTML mis à jour.' : 'HTML déjà à jour.');
