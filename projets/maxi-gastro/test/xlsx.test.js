import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireXlsx, choisirTableau, estXlsx } from '../src/noyau/xlsx.js';
import { lignesVersOffres } from '../src/noyau/csv.js';
import { creerConnecteurFichier } from '../src/connecteurs/csv.js';
import { ouvrirBase } from '../src/base.js';
import { synchroniser } from '../src/synchro.js';

// tarif-exemple.xlsx est SYNTHÉTIQUE (références EX-…, prix inventés) : il reproduit la forme d'une liste de prix
// fournisseur réelle (titre au-dessus de l'en-tête, ancien tarif à droite non aligné, annotation, observation, doublon).
const ici = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(ici, 'fixtures/tarif-exemple.xlsx');
const REGLES = JSON.parse(readFileSync(join(ici, '../config/regles.json'), 'utf8'));
const PROFIL = JSON.parse(readFileSync(join(ici, '../config/profils-csv/cuistance-tarif.json'), 'utf8'));

test('xlsx : feuilles, textes partagés, en-tête trouvé sous son titre', async () => {
  const o = new Uint8Array(readFileSync(FIXTURE));
  assert.equal(estXlsx(o), true);
  const feuilles = await lireXlsx(o, (u) => inflateRawSync(u));
  assert.deepEqual(feuilles.map((f) => f.nom), ['Sheet1', 'Feuil1']);
  const t = choisirTableau(feuilles);
  assert.equal(t.feuille, 'Sheet1', 'la feuille la plus riche gagne (elle a l\'ancien tarif)');
  assert.equal(t.ligneEntete, 2);
  assert.deepEqual(t.mapping, { ref: 0, codeFournisseur: 1, prixAchat: 2, refPrecedente: 7, prixAchatPrecedent: 9, observation: 12 });
});

test('xlsx : ancien prix retrouvé par référence, pas par ligne', async () => {
  const t = choisirTableau(await lireXlsx(new Uint8Array(readFileSync(FIXTURE)), (u) => inflateRawSync(u)));
  const { offres } = lignesVersOffres(t, t.mapping, { fournisseur: 'cuistance' });
  const par = Object.fromEntries(offres.map((o) => [o.ref, o]));
  assert.equal(par['EX-100'].prixAchatPrecedentHT, 487, 'EX-100 est sur la ligne 2 de l\'ancien bloc');
  assert.equal(par['EX-200'].prixAchatPrecedentHT, 100);
  assert.equal(par['EX-300 vitré'].prixAchatPrecedentHT, 75.5, 'annotation « vitré » ignorée pour le rapprochement');
  assert.equal(par['EX-400'].prixAchatPrecedentHT, null, 'nouvelle référence');
  assert.equal(par['EX-400'].observation, "50,00 pour l'achat de 10 pieces");
  assert.equal(par['EX-100'].codeFournisseur, '900100');
  assert.equal(par['EX-100'].statutStock, 'inconnu');
});

test('liste de prix : import par le connecteur, doublon ignoré, stock connu conservé', async () => {
  const base = ouvrirBase(':memory:');
  // 1. Un fichier de stock a donné 7 unités pour EX-100.
  const stock = { id: 'cuistance', async *lire() { yield { fournisseur: 'cuistance', ref: 'EX-100', marque: 'Cuistance', prixAchatHT: 487, stock: 7, statutStock: 'en-stock' }; } };
  await synchroniser({ base, connecteur: stock, regles: REGLES, depuis: null });
  // 2. La liste de prix arrive.
  const c = await creerConnecteurFichier({ profil: PROFIL, chemin: FIXTURE });
  assert.equal(c.analyse.format, 'xlsx');
  assert.equal(c.analyse.confiance, 1);
  const r = await synchroniser({ base, connecteur: c, regles: REGLES, depuis: null });
  assert.equal(r.lues, 5, '6 lignes, EX-100 en double');
  assert.equal(r.erreurs.length, 0);
  const o = base.offre('cuistance', 'EX-100');
  assert.equal(o.prix_achat, 492, 'la première ligne fait foi');
  assert.equal(o.stock, 7, 'la liste de prix n\'efface pas le stock');
  assert.equal(o.statut_stock, 'en-stock');
  assert.equal(JSON.parse(o.brut).prixAchatPrecedentHT, 487);
  base.fermer();
});
