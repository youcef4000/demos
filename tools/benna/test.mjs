// Vérifie les données et les calculs de Benna : node tools/benna/test.mjs
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { RECETTES, PAR_ID, INGREDIENTS, PAYS, GESTES, SOS, PARCOURS, ASTUCES, REMPLACEMENTS } from '../../sites/benna/js/data/index.js';
import * as c from '../../sites/benna/js/core.js';

const LANGUES = ['fr', 'ar', 'en'];
const UNITES = ['g', 'ml', 'cs', 'cc', 'pincee', ...c.UNITES_COMPTEES];
const racine = new URL('../../sites/benna/', import.meta.url);
let erreurs = 0;
const dire = (m) => { erreurs += 1; console.error('✗', m); };
const trois = (o, ou) => { for (const l of LANGUES) if (!o || typeof o[l] !== 'string' || !o[l].trim()) dire(`${ou} : texte « ${l} » manquant`); };

// Données
const ids = new Set();
const groupes = new Set();
for (const r of RECETTES) {
  if (ids.has(r.id)) dire(`recette en double : ${r.id}`);
  ids.add(r.id);
  trois(r.t, `${r.id} titre`); trois(r.d, `${r.id} description`);
  if (!PAYS[r.c]) dire(`${r.id} : pays inconnu ${r.c}`);
  if (!['sale', 'sucre'].includes(r.kind)) dire(`${r.id} : kind`);
  for (const k of ['prep', 'cook', 'diff', 'serves']) if (typeof r[k] !== 'number') dire(`${r.id} : ${k} manquant`);
  for (const [id, q, u] of r.ing) {
    if (id === '#') { groupes.add(q); continue; }
    if (!INGREDIENTS[id]) dire(`${r.id} : ingrédient inconnu ${id}`);
    if (q != null && !UNITES.includes(u)) dire(`${r.id} : unité inconnue ${u} pour ${id}`);
    if (q != null && c.UNITES_COMPTEES.includes(u) && INGREDIENTS[id] && !INGREDIENTS[id].w && INGREDIENTS[id].per !== 'pc') dire(`${r.id} : ${id} compté sans poids unitaire`);
  }
  r.steps.forEach((s, i) => {
    trois(s, `${r.id} étape ${i + 1}`);
    if (s.tip) trois(s.tip, `${r.id} astuce ${i + 1}`);
    if (s.g && !GESTES.find((g) => g.id === s.g)) dire(`${r.id} : geste inconnu ${s.g}`);
  });
  if (!existsSync(new URL(`img/r/${r.id}.webp`, racine))) dire(`${r.id} : image manquante`);
  const cp = c.coutParPart(r, 'DZD');
  if (!(cp > 0)) dire(`${r.id} : coût nul`);
}
for (const i of Object.values(INGREDIENTS)) trois(i.n, `ingrédient ${i.id}`);
for (const g of GESTES) { trois(g.t, `geste ${g.id}`); g.pts.forEach((p) => trois(p, `geste ${g.id} repère`)); }
for (const s of SOS) for (const k of ['t', 'why', 'now', 'next']) trois(s[k], `sos ${s.id} ${k}`);
for (const p of PARCOURS) {
  trois(p.t, `parcours ${p.id}`); trois(p.d, `parcours ${p.id}`);
  for (const [type, id] of p.etapes) if (type === 'r' ? !PAR_ID[id] : !GESTES.find((g) => g.id === id)) dire(`parcours ${p.id} : ${type} ${id} inconnu`);
}
ASTUCES.forEach((a, i) => trois(a, `astuce ${i}`));
for (const [id, r] of Object.entries(REMPLACEMENTS)) { if (!INGREDIENTS[id]) dire(`remplacement : ${id} inconnu`); trois(r, `remplacement ${id}`); }

// Calculs
const u = (x) => x;
assert.equal(c.fraction(1.5), '1 ½');
assert.equal(c.fraction(0.33), '⅓');
assert.equal(c.fraction(2), '2');
assert.equal(c.fraction(0.9), '1');
assert.equal(c.ecrire('farine', 110, 'g', 'maison', 'fr', u).principal, '1 verre');
assert.equal(c.ecrire('farine', 250, 'g', 'maison', 'fr', u).principal, '2 ¼ verre');
assert.equal(c.ecrire('farine', 250, 'g', 'maison', 'fr', u).secondaire, '250 g');
assert.equal(c.ecrire('farine', 250, 'g', 'metric', 'fr', u).principal, '250 g');
assert.equal(c.ecrire('sucre', 170, 'g', 'maison', 'fr', u).principal, '1 verre');
assert.equal(c.ecrire('eau', 1500, 'ml', 'metric', 'fr', u).principal, '1,5 l');
assert.equal(c.ecrire('eau', 1500, 'ml', 'metric', 'en', u).principal, '1.5 l');
assert.equal(c.ecrire('beurre', 200, 'g', 'maison', 'fr', u).principal, '200 g'); // pas de conversion pour le beurre
assert.equal(c.ecrire('oeuf', 3, 'pc', 'maison', 'fr', u).principal, '3');
assert.equal(c.ecrire('maizena', 5, 'g', 'maison', 'fr', u).principal, '2 cc');
const chorba = PAR_ID['chorba-frik'];
assert.equal(c.lignes(chorba, 6).find((l) => l.id === 'agneau').q, 400);
assert.equal(c.lignes(chorba, 12).find((l) => l.id === 'agneau').q, 800);
assert.equal(c.lignes(chorba, 3).find((l) => l.id === 'agneau').q, 200);
assert.equal(c.lignes(PAR_ID.genoise, 4).find((l) => l.id === 'oeuf').q, 2);
assert.equal(c.cout('oeuf', 4, 'pc', 'DZD'), 72);
assert.equal(c.cout('farine', 500, 'g', 'DZD'), 35);
assert.equal(Math.round(c.cout('huile', 2, 'cs', 'DZD') * 100) / 100, 4.05);
assert.equal(c.cout('oeuf', 4, 'pc', 'DZD', { DZD: { oeuf: 20 } }), 80);
const liste = c.listeCourses([{ recette: chorba, parts: 6 }, { recette: PAR_ID['bourek-viande'], parts: 12 }], 'DZD');
const tous = liste.rayons.flatMap((g) => g.items);
assert.equal(tous.find((i) => i.id === 'oignon').q, 2);
assert.equal(tous.find((i) => i.id === 'oignon').de.length, 2);
assert.ok(tous.find((i) => i.id === 'huile').q >= 300); // la friture reste dans la liste
assert.ok(liste.placard.find((i) => i.id === 'sel'));
assert.ok(!tous.find((i) => i.id === 'eau'));
assert.ok(liste.total > 0);
const f = c.selonFrigo(RECETTES, ['pois-chiches-cuits', 'tahini', 'citron', 'ail', 'cumin', 'huile-olive', 'paprika']);
assert.equal(f[0].recette.id, 'houmous');
assert.equal(f[0].score, 1);
const soir = c.ceSoir(RECETTES, { minutes: 30, budget: 1, envie: 'sale', devise: 'DZD' }, () => 0.5);
assert.ok(soir.length > 0 && soir.every((x) => c.tempsTotal(x.recette) <= 30 && x.recette.kind === 'sale'));
const pr = c.prixDeRevient({ matieres: 3000, pieces: 30, emballage: 10, frais: 300, heures: 2, taux: 500, marge: 40 });
assert.equal(pr.revient, 153.33333333333334);
assert.equal(Math.round(pr.vente), 215);
assert.equal(c.chercher(RECETTES, 'شوربة', 'ar')[0].id, 'chorba-frik');
assert.ok(c.chercher(RECETTES, 'chocolat', 'fr').length >= 2);
assert.equal(c.chercher(RECETTES, 'genoise', 'fr')[0].id, 'genoise');

console.log(`${RECETTES.length} recettes, ${Object.keys(INGREDIENTS).length} ingrédients, ${GESTES.length} gestes, ${SOS.length} fiches SOS, ${PARCOURS.length} parcours, ${ASTUCES.length} astuces`);
console.log('groupes :', [...groupes].join(', '));
const couts = RECETTES.map((r) => [r.id, Math.round(c.coutParPart(r, 'DZD')), c.coutParPart(r, 'EUR').toFixed(2), c.tempsTotal(r)]);
console.log(couts.map((x) => x.join(' ')).join(' | '));
if (erreurs) { console.error(`${erreurs} erreur(s)`); process.exit(1); }
console.log('Tout est bon.');
