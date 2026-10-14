// Vérifie les traductions du programme (data/i18n/<langue>/<module>.js) contre l'original français.
//   node tools/hooked-academy/i18n-check.mjs              toutes les langues, tous les modules
//   node tools/hooked-academy/i18n-check.mjs ar ia1 ia2    une langue, des modules précis
// Contrôles : chaque chemin traduit existe dans l'original avec un texte ; les tableaux ne sont pas plus
// longs ; aucune clé technique traduite (type, d, at, say…) ; marqueurs *or* ~jade~ ^cta^ _souligné_
// équilibrés ; textes vides ; et taux de couverture (textes traduisibles laissés en français).
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../sites/hooked-academy');
globalThis.localStorage = { getItem: () => null, setItem: () => {} }; // le français : programme d'origine
const { MODULES } = await import(pathToFileURL(path.join(ROOT, 'data/programme.js')).href);

/** Clés jamais traduites (structure, temps, prompteur du formateur, ligne arabe secondaire, médias). */
export const SKIP = new Set(['id', 'n', 'type', 'd', 'at', 'say', 'ar', 'c', 'icon', 'bg', 'art', 'mode', 'align', 'tone', 'kind', 'widget', 'voice', 'video', 'audio', 'poster', 'ok', 'color', 'handle', 'app', 'k', 'w', 'x', 'y', 'from', 'to', 'cps', 'part', 'track', 'dim', 'safe', 'explode', 'hookBg', 'bodyBg', 'ctaBg', 'hookIndex', 'flick', 'scrollAt', 'scrollDur', 'swipeAt', 'swipe', 'stampAt', 'noteAt', 'barAt', 'frAt', 'arAt', 'resultAt', 'ringDur', 'countDur', 'ring', 'clipsAt', 'clipStep', 'playEnd', 'step', 'cols', 'pick', 'pickAt', 'posterAt', 'pts', 'value', 'decimals', 'suffix', 'from', 'speed', 'total', 'lang', 'dir', 'ringReverse', 'count', 'shot', 'r']);
/** `cols` : nombre de colonnes (grille, à ignorer) ou en-têtes d'un tableau (texte, à traduire). */
export const skipKey = (k, v) => SKIP.has(k) && !(k === 'cols' && Array.isArray(v));

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const MARK = /(\*[^*]+\*|~[^~]+~|\^[^^]+\^|_[^_]+_)/g;
const marks = (s) => (String(s).match(MARK) || []).map((m) => m[0]).join('');

function walk(base, ov, at, out) {
  if (ov == null) return;
  if (Array.isArray(base)) {
    if (!Array.isArray(ov)) return out.err.push(`${at} : tableau attendu`);
    if (ov.length > base.length) out.err.push(`${at} : ${ov.length} éléments pour ${base.length} dans l'original`);
    ov.forEach((o, i) => walk(base[i], o, `${at}[${i}]`, out));
    return;
  }
  if (isObj(base)) {
    if (!isObj(ov)) return out.err.push(`${at} : objet attendu`);
    for (const k of Object.keys(ov)) {
      if (skipKey(k, base[k])) {
        out.err.push(`${at}.${k} : clé technique, ne pas traduire`);
        continue;
      }
      if (!(k in base)) {
        out.err.push(`${at}.${k} : n'existe pas dans l'original`);
        continue;
      }
      walk(base[k], ov[k], `${at}.${k}`, out);
    }
    return;
  }
  if (typeof base === 'string') {
    if (typeof ov !== 'string') return out.err.push(`${at} : texte attendu`);
    if (!ov.trim()) out.err.push(`${at} : texte vide`);
    if (marks(base).replace(/[^*~^_]/g, '') !== marks(ov).replace(/[^*~^_]/g, '')) out.warn.push(`${at} : marqueurs différents (« ${base} » → « ${ov} »)`);
    out.done++;
    return;
  }
  out.err.push(`${at} : valeur non textuelle dans la traduction`);
}

function countStrings(v, key = '') {
  if (skipKey(key, v)) return 0;
  if (typeof v === 'string') return v.trim() ? 1 : 0;
  if (Array.isArray(v)) return v.reduce((s, x) => s + countStrings(x), 0);
  if (isObj(v)) return Object.entries(v).reduce((s, [k, x]) => s + countStrings(x, k), 0);
  return 0;
}

const args = process.argv.slice(2);
const langs = args.filter((a) => ['en', 'ar'].includes(a));
const mods = args.filter((a) => !['en', 'ar'].includes(a));
let failed = false;
for (const lang of langs.length ? langs : ['en', 'ar']) {
  for (const m of MODULES.filter((x) => !mods.length || mods.includes(x.id))) {
    const f = path.join(ROOT, `data/i18n/${lang}/${m.id}.js`);
    if (!existsSync(f)) {
      console.log(`✗ ${lang}/${m.id} : fichier manquant`);
      failed = true;
      continue;
    }
    const ov = (await import(pathToFileURL(f).href + `?t=${Date.now()}`)).default || {};
    const out = { err: [], warn: [], done: 0 };
    const mo = ov.modules?.[m.id] || {};
    for (const k of Object.keys(mo)) if (!['title', 'pitch'].includes(k)) out.err.push(`modules.${m.id}.${k} : seuls title et pitch`);
    let total = countStrings({ title: m.title, pitch: m.pitch });
    out.done += ['title', 'pitch'].filter((k) => typeof mo[k] === 'string' && mo[k].trim()).length;
    for (const k of Object.keys(ov.lessons || {})) if (!m.lessons.some((l) => l.id === k)) out.err.push(`lessons.${k} : leçon inconnue dans ${m.id}`);
    for (const l of m.lessons) {
      total += countStrings(l);
      walk(l, ov.lessons?.[l.id], l.id, out);
    }
    const pct = total ? Math.round((out.done / total) * 100) : 100;
    const ok = !out.err.length;
    if (!ok) failed = true;
    console.log(`${ok ? '✓' : '✗'} ${lang}/${m.id} : ${out.done}/${total} textes (${pct} %)${out.err.length ? `, ${out.err.length} erreur(s)` : ''}${out.warn.length ? `, ${out.warn.length} avertissement(s)` : ''}`);
    out.err.slice(0, 30).forEach((e) => console.log(`   erreur : ${e}`));
    out.warn.slice(0, 15).forEach((e) => console.log(`   attention : ${e}`));
  }
}
process.exit(failed ? 1 : 0);
