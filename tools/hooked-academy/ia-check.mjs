// Contrôle des textes de la landing Formation IA (sites/hooked-academy/ia/) :
// chaque clé utilisée dans index.html existe en français, anglais et arabe, et le français écrit dans
// la page (affiché sans JavaScript) est identique au dictionnaire.
//   node tools/hooked-academy/ia-check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../sites/hooked-academy/ia');
const src = fs.readFileSync(path.join(ROOT, 'ia-i18n.js'), 'utf8');
// Le dictionnaire est un appel add({ fr: {…}, en: {…}, ar: {…} }) : on l'évalue sans le module i18n
let D;
new Function('add', src.replace(/^import .*$/gm, ''))((d) => (D = d));
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'ia.js'), 'utf8');
const norm = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/[  ]/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
let bad = 0;
const err = (m) => (bad++, console.log('✗', m));
const used = new Set();
for (const m of html.matchAll(/data-(k|h|list)="([^"]+)"[^>]*>([\s\S]*?)<\/(\w+)>/g)) {
  const [, kind, key, inner] = m;
  used.add(key);
  if (kind === 'k' && D.fr[key] != null && norm(inner) !== norm(D.fr[key])) err(`texte français différent pour ${key} : « ${norm(inner)} » / « ${norm(D.fr[key])} »`);
}
for (const m of html.matchAll(/data-ka="([^"]+)"/g)) m[1].split(';').forEach((p) => used.add(p.split(':')[1]));
for (const m of js.matchAll(/t\(\s*'(ia\.[\w.]+)'/g)) used.add(m[1]);
for (const m of js.matchAll(/'(ia\.(?:dev|gen|f|cat)\.[\w.]+)'/g)) used.add(m[1]);
for (const k of used) for (const l of ['fr', 'en', 'ar']) if (D[l]?.[k] == null) err(`clé ${k} absente en ${l}`);
for (const l of ['en', 'ar']) for (const k of Object.keys(D.fr)) if (D[l][k] == null) err(`clé ${k} absente en ${l}`);
for (const k of Object.keys(D.fr))
  for (const l of ['en', 'ar']) {
    const vars = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join();
    if (vars(D.fr[k]) !== vars(D[l][k])) err(`variables différentes pour ${k} en ${l}`);
    if (D.fr[k].split('|').length !== D[l][k].split('|').length) err(`listes de longueur différente pour ${k} en ${l}`);
  }
console.log(bad ? `${bad} problème(s)` : `✓ landing IA : ${used.size} clés utilisées, ${Object.keys(D.fr).length} clés en fr/en/ar`);
process.exit(bad ? 1 : 0);
