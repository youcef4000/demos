import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { arrondir, regleApplicable, calculerPrixVente, decisionPrix, prixPlancher, margeNette, strategieBuyBox } from '../src/noyau/prix.js';
import { lireCSV, detecterColonnes, lireNombre, lireStock, lignesVersOffres } from '../src/noyau/csv.js';
import { eanValide, normaliserRef, cleProduit, regrouperOffres, relierShopify } from '../src/noyau/rapprochement.js';
import { evaluerFiche } from '../src/noyau/qualite.js';
import { chiffresOrphelins, controlerLongueurs, SCHEMA_FICHE } from '../src/noyau/prompt-fiche.js';
import { decoderFichier } from '../src/connecteurs/csv.js';

const ici = dirname(fileURLToPath(import.meta.url));

test('arrondis', () => {
  assert.equal(arrondir(1342.1, 'x90'), 1342.9);
  assert.equal(arrondir(1342.95, 'x90'), 1343.9);
  assert.equal(arrondir(1342.1, 'x9'), 1349);
  assert.equal(arrondir(1349.5, 'x9'), 1359);
  assert.equal(arrondir(10.001, 'centime'), 10.01);
  assert.equal(arrondir(10.2, 'euro'), 11);
});

test('priorité des règles : produit > croisée > catégorie > fournisseur > défaut', () => {
  const r = {
    defaut: { type: 'coef', valeur: 1.4 },
    fournisseurs: { tefcold: { type: 'coef', valeur: 1.38 } },
    categories: { ventilation: { type: 'coef', valeur: 1.45 } },
    croisees: { 'tefcold|froid': { type: 'coef', valeur: 1.3 } },
    produits: { X: { type: 'coef', valeur: 2 } },
  };
  assert.equal(regleApplicable(r, { cle: 'X', fournisseur: 'tefcold', categorie: 'froid' }).valeur, 2);
  assert.equal(regleApplicable(r, { fournisseur: 'tefcold', categorie: 'froid' }).valeur, 1.3);
  assert.equal(regleApplicable(r, { fournisseur: 'tefcold', categorie: 'ventilation' }).valeur, 1.45);
  assert.equal(regleApplicable(r, { fournisseur: 'tefcold', categorie: 'cuisson' }).valeur, 1.38);
  assert.equal(regleApplicable(r, { fournisseur: 'inconnu' }).niveau, 'défaut');
});

test('prix de vente : coefficient et taux de marque', () => {
  assert.deepEqual(calculerPrixVente(100, { type: 'coef', valeur: 1.5, arrondi: 'centime' }).prixHT, 150);
  const m = calculerPrixVente(100, { type: 'marge', valeur: 0.25, arrondi: 'centime' });
  assert.equal(m.prixHT, 133.34);
  assert.ok(Math.abs(m.margePct - 0.25) < 0.001);
  assert.equal(calculerPrixVente(0, { type: 'coef', valeur: 1.5 }), null);
  assert.throws(() => calculerPrixVente(100, { type: 'marge', valeur: 1 }));
});

test('décision de prix : seuil, verrou, nouveau produit', () => {
  assert.equal(decisionPrix({ ancienHT: 100, nouveauHT: 103, seuilAutoPct: 0.05 }).action, 'appliquer');
  assert.equal(decisionPrix({ ancienHT: 100, nouveauHT: 109, seuilAutoPct: 0.05 }).action, 'valider');
  assert.equal(decisionPrix({ ancienHT: 100, nouveauHT: 91, seuilAutoPct: 0.05 }).action, 'valider');
  assert.equal(decisionPrix({ ancienHT: 100, nouveauHT: 130, verrouille: true }).action, 'ignorer-verrou');
  assert.equal(decisionPrix({ ancienHT: 100, nouveauHT: 100 }).action, 'rien');
  assert.equal(decisionPrix({ ancienHT: null, nouveauHT: 120 }).action, 'appliquer');
});

test('prix plancher : au plancher, la marge nette vaut exactement le minimum', () => {
  const p = { prixAchatHT: 552.78, commissionPct: 0.12, fraisPortHT: 35, margeMinPct: 0.12 };
  const plancher = prixPlancher(p);
  const net = margeNette({ prixHT: plancher, prixAchatHT: p.prixAchatHT, commissionPct: 0.12, fraisPortHT: 35 });
  assert.ok(net.pct >= 0.12 && net.pct < 0.1205, `marge nette ${net.pct}`);
  assert.equal(prixPlancher({ prixAchatHT: 100, commissionPct: 0.8, margeMinPct: 0.2 }), Infinity);
});

test('Buy Box : on suit le concurrent sans jamais franchir le plancher', () => {
  assert.equal(strategieBuyBox({ plancherHT: 800, prixConcurrentHT: 900, pasHT: 1 }).prixHT, 899);
  const s = strategieBuyBox({ plancherHT: 800, prixConcurrentHT: 750 });
  assert.equal(s.statut, 'plancher');
  assert.equal(s.prixHT, 800);
  assert.equal(strategieBuyBox({ plancherHT: 800, prixConcurrentHT: 750, delaiJours: 3, delaiConcurrentJours: 8 }).statut, 'delai');
});

test('EAN : clé de contrôle (les 27 références Bartscher de la boutique sont des EAN valides)', () => {
  assert.equal(eanValide('4015613671123'), true);
  assert.equal(eanValide('4015613610931'), true);
  assert.equal(eanValide('4015613671124'), false);
  assert.equal(eanValide('15844'), false);
  assert.equal(eanValide(''), false);
});

test('références : la trace Excel « .0 » disparaît, les points utiles restent', () => {
  assert.equal(normaliserRef('15844.0'), '15844');
  assert.equal(normaliserRef(' 7223.0505 '), '7223.0505');
  assert.equal(normaliserRef('fe 61/13 elt'), 'FE61/13ELT');
  assert.equal(cleProduit({ marque: 'TEFCOLD', ref: '15844.0' }), cleProduit({ marque: 'Tefcold', ref: '15844' }));
  assert.equal(cleProduit({ ean: '4015613671123', ref: 'x' }), 'ean:04015613671123');
});

test('zéro doublon : même EAN chez deux fournisseurs → une fiche, la meilleure offre retenue', () => {
  const groupes = regrouperOffres([
    { fournisseur: 'combisteel', ref: '7950.5005', ean: '4015613671123', prixAchatHT: 700, stock: 0, statutStock: 'rupture' },
    { fournisseur: 'ecofrost', ref: 'EF-1', ean: '4015613671123', prixAchatHT: 740, stock: 4, statutStock: 'en-stock' },
    { fournisseur: 'tefcold', ref: '15844', marque: 'Tefcold', prixAchatHT: 900, stock: 2, statutStock: 'en-stock' },
  ]);
  assert.equal(groupes.length, 2);
  const g = groupes.find((x) => x.doublon);
  assert.equal(g.retenue.fournisseur, 'ecofrost', 'en stock passe avant moins cher');
  const { lies, nouveaux } = relierShopify(groupes, [{ id: 'gid://shopify/Product/1', sku: '15844.0' }]);
  assert.equal(lies.size, 1);
  assert.equal(nouveaux.length, 1);
});

test('CSV : séparateur deviné, guillemets, retours à la ligne dans une cellule', () => {
  const lu = lireCSV('Réf,Désignation,Stock\r\nA1,"Table ""inox"", 2 portes",3\r\nB2,"Ligne\nsur deux",0\r\n');
  assert.equal(lu.separateur, ',');
  assert.deepEqual(lu.lignes[0], ['A1', 'Table "inox", 2 portes', '3']);
  assert.equal(lu.lignes[1][1], 'Ligne\nsur deux');
});

test('nombres et stocks à la française', () => {
  assert.equal(lireNombre('1 234,56 €'), 1234.56);
  assert.equal(lireNombre('1.234,56'), 1234.56);
  assert.equal(lireNombre('1,234.56'), 1234.56);
  assert.equal(lireNombre(''), null);
  assert.deepEqual(lireStock('Rupture'), { quantite: 0, statut: 'rupture' });
  assert.equal(lireStock('Sur commande').statut, 'sur-commande');
  assert.deepEqual(lireStock('12'), { quantite: 12, statut: 'en-stock' });
});

test('fichier Cuistance d\'exemple (Windows-1252) : colonnes reconnues, erreurs signalées', () => {
  const texte = decoderFichier(readFileSync(join(ici, 'fixtures/exemple-cuistance.csv')));
  assert.ok(texte.startsWith('Référence;'), 'accents relus correctement');
  const lu = lireCSV(texte);
  const { mapping, confiance } = detecterColonnes(lu.entetes);
  assert.equal(confiance, 1);
  assert.deepEqual(Object.keys(mapping).sort(), ['delai', 'designation', 'prixAchat', 'ref', 'stock'].sort());
  const { offres, erreurs } = lignesVersOffres(lu, mapping, { fournisseur: 'cuistance' });
  assert.equal(offres.length, 10);
  assert.equal(erreurs.length, 1);
  assert.equal(offres.find((o) => o.ref === 'S903SSTOP').statutStock, 'rupture');
  assert.equal(offres.find((o) => o.ref === 'TP16L').statutStock, 'sur-commande');
});

test('qualité : ce qui bloque METRO', () => {
  const e = evaluerFiche({ ean: null, poidsKg: 0, prixAchatHT: 10, statutStock: 'en-stock', categorie: '7223.0505', ref: '7223.0505' });
  assert.ok(e.bloque.includes('metro'));
  assert.ok(e.manquants.some((m) => m.cle === 'categorie'));
});

test('garde-fou Claude : un chiffre inventé est repéré', () => {
  const donnees = { puissance: '320 W', dimensions_ext_mm: '1355 x 515 x 900' };
  const fiche = { titre: 'Arrière-bar', meta_description: '', accroche: 'Garantie 24 mois', description_html: '<p>320 W, 1 355 mm</p>', points_forts: [], caracteristiques: [], faq: [] };
  assert.deepEqual(chiffresOrphelins(fiche, donnees), ['24']);
  assert.deepEqual(controlerLongueurs({ titre: 'x'.repeat(71), meta_title: 'ok', meta_description: 'ok' }), ['titre trop long (71/70)']);
});

test('schéma de sortie compatible avec les sorties structurées (objets fermés, champs requis)', () => {
  const verifier = (s) => {
    if (s.type === 'object') {
      assert.equal(s.additionalProperties, false);
      assert.deepEqual([...s.required].sort(), Object.keys(s.properties).sort());
      Object.values(s.properties).forEach(verifier);
    }
    if (s.type === 'array') verifier(s.items);
    for (const interdit of ['minimum', 'maximum', 'minLength', 'maxLength']) assert.ok(!(interdit in s), interdit);
  };
  verifier(SCHEMA_FICHE);
});

test('le noyau du moteur est identique à celui de la démo', () => {
  const demo = join(ici, '../../../sites/maxi-gastro-le-passe/app/noyau');
  if (!existsSync(demo)) return;
  for (const f of ['prix.js', 'csv.js', 'rapprochement.js', 'qualite.js', 'prompt-fiche.js']) {
    assert.equal(readFileSync(join(ici, '../src/noyau', f), 'utf8'), readFileSync(join(demo, f), 'utf8'), `${f} diffère : lancer npm run noyau`);
  }
});
