import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, rmSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ouvrirBase } from '../src/base.js';
import { synchroniser, trancher, envoyer } from '../src/synchro.js';
import { creerConnecteurEquipme, normaliserProduit } from '../src/connecteurs/equipme.js';
import { creerConnecteurFluxXml } from '../src/connecteurs/flux-xml.js';
import { creerConnecteurFichier } from '../src/connecteurs/csv.js';
import { creerShopify, construireProduit } from '../src/shopify.js';
import { page, BLENDER, PIECE, ARRETE } from './fixtures/equipme-page.js';

const ici = dirname(fileURLToPath(import.meta.url));
const REGLES = JSON.parse(readFileSync(join(ici, '../config/regles.json'), 'utf8'));
const reponse = (corps, statut = 200) => ({ ok: statut < 400, status: statut, json: async () => corps, text: async () => JSON.stringify(corps) });

function faux(offres) {
  return { id: 'test', nom: 'test', async *lire() { for (const o of offres) yield o; } };
}

test('equip.me : paramètres envoyés, pagination, pièces détachées écartées, unités converties', async () => {
  const appels = [];
  const fetch = async (url) => {
    appels.push(new URL(url));
    const n = Number(new URL(url).searchParams.get('page'));
    return reponse(n === 1 ? page(1, 2, [BLENDER, PIECE]) : page(2, 2, [ARRETE]));
  };
  const c = creerConnecteurEquipme({ cle: 'cle-test', fetch, attente: async () => {} });
  const lues = [];
  for await (const o of c.lire({ depuis: '2026-11-01T08:00:00.000Z' })) lues.push(o);
  assert.equal(appels.length, 2);
  const p = appels[0].searchParams;
  assert.equal(appels[0].origin + appels[0].pathname, 'https://api.equip.me/v1/dealer/products');
  assert.equal(p.get('apikey'), 'cle-test');
  assert.equal(p.get('catalog_type'), '1');
  assert.equal(p.get('unit'), 'metric');
  assert.equal(p.get('change_from'), '2026-11-01T08:00:00');
  assert.equal(lues.length, 2, 'la pièce détachée est ignorée');
  const b = lues[0];
  assert.equal(b.ref, '129888');
  assert.equal(b.prixAchatHT, 210);
  assert.equal(b.prixConseilleHT, 349);
  assert.equal(b.stock, 10);
  assert.equal(b.poidsKg, 5);
  assert.equal(b.dimensions, '203 × 229 × 508 mm');
  assert.equal(b.notice, 'https://exemple.invalid/notice.pdf');
  assert.equal(lues[1].statutStock, 'rupture', 'livraisons arrêtées = rupture');
});

test('equip.me : filtre d\'entrepôts et clé refusée', async () => {
  assert.equal(normaliserProduit(BLENDER, { entrepots: ['EU1'] }).stock, 3);
  const c = creerConnecteurEquipme({ cle: 'x', fetch: async () => reponse({}, 401), attente: async () => {} });
  await assert.rejects(async () => { for await (const _ of c.lire()) { /* vide */ } }, /clé refusée/);
});

test('flux XML : lecture d\'un flux à plat', async () => {
  const xml = '<?xml version="1.0"?><products><product><ItemNumber>15844</ItemNumber><Name><![CDATA[Arrière-bar BA30S-3]]></Name><Stock>0</Stock><GrossWeight>113</GrossWeight></product></products>';
  const c = creerConnecteurFluxXml({ url: 'https://exemple.invalid/flux.xml', fetch: async () => ({ ok: true, text: async () => xml }) });
  const lues = [];
  for await (const o of c.lire()) lues.push(o);
  assert.equal(lues.length, 1);
  assert.equal(lues[0].ref, '15844');
  assert.equal(lues[0].designation, 'Arrière-bar BA30S-3');
  assert.equal(lues[0].stock, 0);
  assert.equal(lues[0].statutStock, 'rupture');
  assert.equal(lues[0].poidsKg, 113);
});

test('bout en bout : nouveau produit → passe ; stock auto ; petit prix auto ; gros prix au passe ; verrou respecté', async () => {
  const base = ouvrirBase(':memory:');
  const offre = { fournisseur: 'tefcold', ref: '15844', marque: 'Tefcold', designation: 'Arrière-bar vitré', prixAchatHT: 1000, stock: 12, statutStock: 'en-stock' };

  let r = await synchroniser({ base, connecteur: faux([offre]), regles: REGLES });
  assert.equal(r.nouvelles, 1);
  assert.equal(r.auPasse, 1);
  const [nouveau] = base.fileEnAttente();
  assert.equal(nouveau.type, 'nouveau');
  assert.equal(nouveau.apres.prixVenteHT, 1380.9); // 1000 × 1,38 arrondi à ,90

  // Le produit est relié à Shopify (comme après « relier ») avec son prix actuel.
  base.majProduit(nouveau.cle, { shopify_produit: 'gid://shopify/Product/1', shopify_variante: 'gid://shopify/ProductVariant/1', shopify_inventaire: 'gid://shopify/InventoryItem/1', prix_vente: 1380.9, stock_publie: 12, statut: 'publie' });
  base.trancher(nouveau.id, 'accepte');

  r = await synchroniser({ base, connecteur: faux([{ ...offre, stock: 3, prixAchatHT: 1020 }]), regles: REGLES });
  assert.equal(r.stock, 1);
  assert.equal(r.prix, 1, '+2 % : appliqué seul');
  const envois = base.envoisAFaire('shopify');
  assert.deepEqual(envois.map((e) => e.action).sort(), ['prix', 'stock']);
  assert.equal(envois.find((e) => e.action === 'stock').charge.quantite, 3);
  assert.equal(envois.find((e) => e.action === 'stock').charge.precedente, 12);

  r = await synchroniser({ base, connecteur: faux([{ ...offre, stock: 3, prixAchatHT: 1150 }]), regles: REGLES });
  assert.equal(r.auPasse, 1, '+12,7 % : au passe');
  const prix = base.fileEnAttente().find((i) => i.type === 'prix');
  trancher(base, prix.id, true);
  assert.equal(base.produit(prix.cle).prix_vente, prix.apres.prixVenteHT);

  base.verrouillerPrix(prix.cle, true);
  r = await synchroniser({ base, connecteur: faux([{ ...offre, stock: 3, prixAchatHT: 1300 }]), regles: REGLES });
  assert.equal(r.verrous, 1);
  assert.equal(base.produit(prix.cle).prix_vente, prix.apres.prixVenteHT, 'prix verrouillé intact');

  r = await synchroniser({ base, connecteur: faux([{ ...offre, stock: 0, statutStock: 'rupture', prixAchatHT: 1300 }]), regles: REGLES });
  assert.equal(r.stock, 1);
  assert.equal(base.produit(prix.cle).stock_publie, 0);
  assert.equal(base.prixLePlusBas(prix.cle) > 0, true);
  base.fermer();
});

test('exclusions : les pièces détachées n\'entrent jamais dans le catalogue', async () => {
  const base = ouvrirBase(':memory:');
  const r = await synchroniser({ base, connecteur: faux([{ fournisseur: 'combisteel', ref: 'J-1', designation: 'Joint de porte (pièce détachée)', prixAchatHT: 12, stock: 50, statutStock: 'en-stock' }]), regles: REGLES });
  assert.equal(r.exclues, 1);
  assert.equal(base.fileEnAttente().length, 0);
  base.fermer();
});

test('fichier Cuistance : import complet, puis fichier méconnaissable refusé', async () => {
  const base = ouvrirBase(':memory:');
  const profil = JSON.parse(readFileSync(join(ici, '../config/profils-csv/cuistance.json'), 'utf8'));
  const c = await creerConnecteurFichier({ profil, chemin: join(ici, 'fixtures/exemple-cuistance.csv') });
  const r = await synchroniser({ base, connecteur: c, regles: REGLES, depuis: null });
  assert.equal(r.lues, 10);
  assert.equal(r.erreurs.length, 0);
  const inconnu = await creerConnecteurFichier({ profil, texte: 'a;b;c\n1;2;3\n' });
  const r2 = await synchroniser({ base, connecteur: inconnu, regles: REGLES, depuis: null });
  assert.match(r2.erreurs[0], /non reconnu/);
  base.fermer();
});

test('Shopify à blanc : rien n\'est envoyé, les mutations sont écrites pour relecture', async () => {
  const dossier = mkdtempSync(join(tmpdir(), 'passe-'));
  const base = ouvrirBase(':memory:');
  base.preparerEnvoi({ cle: 'k', canal: 'shopify', action: 'stock', charge: { inventoryItemId: 'gid://shopify/InventoryItem/1', quantite: 3, precedente: 12 } });
  base.preparerEnvoi({ cle: 'k', canal: 'shopify', action: 'prix', charge: { produitId: 'gid://shopify/Product/1', varianteId: 'gid://shopify/ProductVariant/1', prixHT: 1408.9 } });
  let appels = 0;
  const shopify = creerShopify({ aBlanc: true, sortie: dossier, fetch: async () => { appels++; } });
  const r = await envoyer({ base, shopify });
  assert.equal(r.envoyes, 2);
  assert.equal(appels, 0);
  const lignes = readFileSync(join(dossier, 'shopify-a-blanc.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  const stock = lignes.find((l) => l.query.includes('Stock'));
  assert.equal(stock.variables.input.quantities[0].changeFromQuantity, 12);
  assert.ok(stock.variables.cleIdempotence);
  assert.equal(lignes.find((l) => l.query.includes('Prix')).variables.variantes[0].price, '1408.90');
  assert.equal(base.envoisAFaire('shopify').length, 2, 'à blanc, les envois restent en attente');
  base.fermer();
  if (existsSync(dossier)) rmSync(dossier, { recursive: true, force: true });
});

test('Shopify : produit créé en brouillon, avec coût, poids, EAN et références fournisseur', () => {
  const p = construireProduit({
    offre: { fournisseur: 'tefcold', ref: '15844', marque: 'Tefcold', designation: 'Arrière-bar', prix_achat: 965.47, poids_kg: 113, ean: '4015613671123', images: '["https://exemple.invalid/a.jpg"]', stock: 3 },
    fiche: { titre: 'Arrière-bar vitré 3 portes 288 L – Tefcold BA30S-3', description_html: '<p>…</p>', meta_title: 'Arrière-bar', meta_description: '…', categorie_proposee: 'Froid > Arrières-bars > Arrière-bar vitré' },
    prixHT: 1342.9,
    emplacement: 'gid://shopify/Location/1',
  });
  assert.equal(p.status, 'DRAFT');
  assert.equal(p.productType, 'Arrière-bar vitré');
  const v = p.variants[0];
  assert.equal(v.price, '1342.90');
  assert.equal(v.inventoryItem.cost, '965.47');
  assert.deepEqual(v.inventoryItem.measurement.weight, { unit: 'KILOGRAMS', value: 113 });
  assert.deepEqual(v.barcodes, [{ value: '4015613671123' }]);
  assert.equal(v.inventoryQuantities[0].quantity, 3);
  assert.equal(p.files.length, 1);
  assert.ok(p.metafields.some((m) => m.key === 'ref_fournisseur' && m.value === '15844'));
});
