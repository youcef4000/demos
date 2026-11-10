// Tests du noyau métier (règles fixes) : formats, contrôles, écritures, G50, résultat, échéancier, relances, Excel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const N = '../public/app/noyau/';
const { da, lireMontant, dateFr, lireDate, periodeFr, decalerPeriode, remplir } = await import(`${N}format.js`);
const { sensFacture, controler, totaux, normaliserFiche, bloquante } = await import(`${N}pieces.js`);
const { genererEcritures, imputerLigne, equilibre } = await import(`${N}ecritures.js`);
const { calculerG50, periodeExigibilite, lignesG50 } = await import(`${N}g50.js`);
const { resultatPeriode } = await import(`${N}resultat.js`);
const { echeancesDuMois, ECHEANCIER_DEFAUT } = await import(`${N}echeancier.js`);
const { piecesAttendues, valeursModele, brouillon, MODELES_DEFAUT, lienWhatsApp } = await import(`${N}relances.js`);
const { exportPCCompta, lignesExport, EXPORT_DEFAUT } = await import(`${N}export.js`);
const { SCHEMAS_DEFAUT } = await import(`${N}scf.js`);

const DOSSIER = { id: 'd1', raisonSociale: 'SARL Test Négoce', nif: '000016099999001', regime: 'reel', impot: 'IBS', salaries: 4, caisse: true };
const facture = (o = {}) => ({
  typeDoc: 'facture_achat',
  numero: 'F-101',
  date: '2026-10-08',
  emetteur: { nom: 'EURL Fournisseur', nif: '000016099999777' },
  destinataire: { nom: DOSSIER.raisonSociale, nif: DOSSIER.nif },
  nature: 'marchandises',
  lignes: [{ libelle: 'Huile 5 L', montantHT: 10000000, tauxTVA: 19 }],
  totalHT: 10000000,
  totalTVA: 1900000,
  timbre: 0,
  totalTTC: 11900000,
  modePaiement: 'virement',
  ...o,
});

test('formats : montants en DA, dates JJ/MM/AAAA', () => {
  assert.equal(da(123456789), '1 234 567,89 DA');
  assert.equal(da(-5000), '−50,00 DA');
  assert.equal(lireMontant('12 500,50'), 1250050);
  assert.equal(lireMontant('1.234.567'), 123456700);
  assert.equal(lireMontant('12500.5 DA'), 1250050);
  assert.equal(dateFr('2026-11-20'), '20/11/2026');
  assert.equal(lireDate('5/9/2026'), '2026-09-05');
  assert.equal(lireDate('31/02/2026'), null);
  assert.equal(periodeFr('2026-10'), 'octobre 2026');
  assert.equal(decalerPeriode('2026-01', -1), '2025-12');
  assert.equal(remplir('Bonjour {{contact}} {{inconnu}}', { contact: 'M. Amrani' }), 'Bonjour M. Amrani {{inconnu}}');
});

test('W1 : achat ou vente selon le NIF de l’émetteur', () => {
  assert.equal(sensFacture(facture(), DOSSIER), 'achat');
  assert.equal(sensFacture(facture({ emetteur: { nif: DOSSIER.nif }, destinataire: { nif: '1' } }), DOSSIER), 'vente');
  const f = normaliserFiche({ ...facture({ emetteur: { nom: DOSSIER.raisonSociale, nif: '0000 1609 9999 001' } }), typeDoc: 'facture_achat' }, DOSSIER);
  assert.equal(f.sens, 'vente');
  assert.equal(f.typeDoc, 'facture_vente');
});

test('W2 : contrôles arithmétiques, NIF, doublon', () => {
  const ok = normaliserFiche(facture(), DOSSIER);
  assert.deepEqual(controler(ok, { dossier: DOSSIER, periode: '2026-10' }).filter((c) => c.niveau === 'erreur'), []);
  const faux = normaliserFiche(facture({ totalTTC: 12000000 }), DOSSIER);
  assert.ok(controler(faux, { dossier: DOSSIER }).some((c) => c.code === 'ttc'));
  const sansNif = normaliserFiche(facture({ emetteur: { nom: 'X' } }), DOSSIER);
  assert.ok(controler(sansNif, { dossier: DOSSIER }).some((c) => c.code === 'nif' && c.niveau === 'alerte'));
  const taux = normaliserFiche(facture({ lignes: [{ libelle: 'x', montantHT: 100, tauxTVA: 7 }] }), DOSSIER);
  assert.ok(bloquante(controler(taux, { dossier: DOSSIER })));
  const autre = { id: 'p0', statut: 'validee', fiche: normaliserFiche(facture(), DOSSIER) };
  const doublon = { ...normaliserFiche(facture(), DOSSIER), pieceId: 'p1' };
  assert.ok(controler(doublon, { dossier: DOSSIER, autresPieces: [autre] }).some((c) => c.code === 'doublon'));
  const t = totaux(normaliserFiche(facture({ lignes: [{ montantHT: 100000, tauxTVA: 19 }, { montantHT: 50000, tauxTVA: 9 }], timbre: 1000 }), DOSSIER));
  assert.deepEqual([t.ht, t.tva, t.ttc], [150000, 23500, 174500]);
});

test('W3 + W4 : achat de marchandises réglé en espèces → journal des achats et journal de caisse', () => {
  const fiche = normaliserFiche(facture({ modePaiement: 'especes', timbre: 119000, totalTTC: 12019000 }), DOSSIER);
  const { ecritures, manquantes } = genererEcritures({ id: 'p1', dossierId: 'd1', periode: '2026-10', fiche }, DOSSIER);
  assert.deepEqual(manquantes, []);
  assert.deepEqual(ecritures.map((e) => e.journal), ['AC', 'CA']);
  for (const e of ecritures) assert.ok(equilibre(e.lignes).ok, `${e.journal} équilibrée`);
  const ac = ecritures[0].lignes;
  assert.equal(ac.find((l) => l.compte === '600').debit, 10000000);
  assert.equal(ac.find((l) => l.compte === '4456').debit, 1900000);
  assert.equal(ac.find((l) => l.compte === '645').debit, 119000);
  assert.equal(ac.find((l) => l.compte === '401').credit, 12019000);
  assert.equal(ecritures[1].lignes.find((l) => l.compte === '53').credit, 12019000);
});

test('W4 : vente de prestation par virement, avoir, paie', () => {
  const vente = normaliserFiche(facture({ emetteur: { nom: DOSSIER.raisonSociale, nif: DOSSIER.nif }, destinataire: { nom: 'SPA Client', nif: '000016099999888' }, nature: 'prestation', lignes: [{ libelle: 'Étude', montantHT: 20000000, tauxTVA: 19 }], totalHT: 20000000, totalTVA: 3800000, totalTTC: 23800000 }), DOSSIER);
  const { ecritures } = genererEcritures({ id: 'p2', dossierId: 'd1', periode: '2026-10', fiche: vente }, DOSSIER);
  assert.deepEqual(ecritures.map((e) => e.journal), ['VT', 'BQ']);
  assert.equal(ecritures[0].lignes.find((l) => l.compte === '706').credit, 20000000);
  assert.equal(ecritures[0].lignes.find((l) => l.compte === '4457').credit, 3800000);
  assert.equal(ecritures[0].lignes.find((l) => l.compte === '411').debit, 23800000);

  const avoir = normaliserFiche({ ...facture({ modePaiement: 'a_terme' }), typeDoc: 'avoir' }, DOSSIER);
  const ea = genererEcritures({ id: 'p3', dossierId: 'd1', periode: '2026-10', fiche: avoir }, DOSSIER).ecritures;
  assert.equal(ea.length, 1);
  assert.equal(ea[0].lignes.find((l) => l.compte === '600').credit, 10000000);
  assert.ok(equilibre(ea[0].lignes).ok);

  const paie = { typeDoc: 'etat_paie', date: '2026-10-31', paie: { brut: 30000000, cotisationsSalariales: 2700000, irg: 2850000, net: 24450000, cotisationsPatronales: 7800000 } };
  const ep = genererEcritures({ id: 'p4', dossierId: 'd1', periode: '2026-10', fiche: paie }, DOSSIER).ecritures;
  assert.equal(ep[0].journal, 'PA');
  assert.ok(equilibre(ep[0].lignes).ok);
  assert.equal(ep[0].lignes.find((l) => l.compte === '442').credit, 2850000);
});

test('Imputation : manuel > historique > mots-clés > schéma > agent', () => {
  const f = normaliserFiche(facture({ nature: 'frais', emetteur: { nom: 'Télécom', nif: '000016099999555' }, lignes: [{ libelle: 'Forfait internet octobre', montantHT: 500000, tauxTVA: 19 }] }), DOSSIER);
  assert.equal(imputerLigne(f.lignes[0], f).compte, '626');
  assert.equal(imputerLigne(f.lignes[0], f, { historique: [{ nif: '000016099999555', nature: 'frais', compte: '6261' }] }).source, 'historique');
  assert.equal(imputerLigne({ ...f.lignes[0], compte: '628' }, f).source, 'manuel');
  const g = normaliserFiche(facture({ nature: 'frais', lignes: [{ libelle: 'Divers', montantHT: 100, tauxTVA: 19 }] }), DOSSIER);
  assert.equal(imputerLigne(g.lignes[0], g, { schemas: { ...SCHEMAS_DEFAUT, achats: { ...SCHEMAS_DEFAUT.achats, frais: undefined } } }).source, 'a_proposer');
});

test('W6 : G50 — exigibilité, précompte, crédit, IRG, timbre', () => {
  const p = (id, fiche, periode = '2026-10') => ({ id, dossierId: 'd1', periode, statut: 'validee', fiche: normaliserFiche(fiche, DOSSIER) });
  const venteMarch = { ...facture({ emetteur: { nom: 'moi', nif: DOSSIER.nif }, destinataire: { nom: 'C1' }, modePaiement: 'especes', timbre: 100000, totalTTC: 12000000 }) };
  const prestaNonPayee = { ...facture({ numero: 'V2', emetteur: { nom: 'moi', nif: DOSSIER.nif }, destinataire: { nom: 'C2' }, nature: 'prestation', modePaiement: 'a_terme', lignes: [{ montantHT: 5000000, tauxTVA: 19 }], totalHT: 5000000, totalTVA: 950000, totalTTC: 5950000 }) };
  const prestaPayeeOct = { ...facture({ numero: 'V0', date: '2026-09-25', emetteur: { nom: 'moi', nif: DOSSIER.nif }, destinataire: { nom: 'C3' }, nature: 'prestation', modePaiement: 'virement', datePaiement: '2026-10-05', lignes: [{ montantHT: 1000000, tauxTVA: 9 }], totalHT: 1000000, totalTVA: 90000, totalTTC: 1090000 }) };
  const achat = facture({ numero: 'A1', lignes: [{ montantHT: 4000000, tauxTVA: 19 }], totalHT: 4000000, totalTVA: 760000, totalTTC: 4760000 });
  const immo = facture({ numero: 'A2', nature: 'immobilisation', lignes: [{ montantHT: 2000000, tauxTVA: 19 }], totalHT: 2000000, totalTVA: 380000, totalTTC: 2380000 });
  const paie = { typeDoc: 'etat_paie', date: '2026-10-31', paie: { brut: 30000000, cotisationsSalariales: 2700000, irg: 2850000, net: 24450000 } };
  const pieces = [p('v1', venteMarch), p('v2', prestaNonPayee), p('v0', prestaPayeeOct, '2026-09'), p('a1', achat), p('a2', immo), p('e1', paie)];
  assert.equal(periodeExigibilite(pieces[1].fiche, DOSSIER), null);
  assert.equal(periodeExigibilite(pieces[2].fiche, DOSSIER), '2026-10');

  const c = calculerG50({ dossier: DOSSIER, periode: '2026-10', pieces, precedente: { calcul: { tva: { creditAReporter: 50000 } } } });
  assert.equal(c.tva.caParTaux[19], 10000000);
  assert.equal(c.tva.caParTaux[9], 1000000);
  assert.equal(c.tva.totalCollectee, 1900000 + 90000);
  assert.equal(c.tva.deductibleBiensServices, 760000);
  assert.equal(c.tva.deductibleImmobilisations, 380000);
  assert.equal(c.tva.precompte, 50000);
  assert.equal(c.tva.tvaNette, 1990000 - 1140000 - 50000);
  assert.equal(c.irg.montant, 2850000);
  assert.equal(c.timbre, 100000);
  assert.equal(c.total, 800000 + 2850000 + 100000);
  assert.equal(c.enAttente.length, 1);
  assert.equal(c.dateLimite, '2026-11-20');
  assert.equal(lignesG50(c).at(-1).montant, c.total);

  const credit = calculerG50({ dossier: DOSSIER, periode: '2026-10', pieces: [p('a1', achat)] });
  assert.equal(credit.tva.tvaNette, 0);
  assert.equal(credit.tva.creditAReporter, 760000);
  assert.ok(credit.alertes.some((a) => a.includes('État de paie')));
  const force = calculerG50({ dossier: DOSSIER, periode: '2026-10', pieces, saisies: { precompte: 0, irg: 100, autres: [{ libelle: 'Acompte IBS', montant: 500000 }] } });
  assert.equal(force.total, 850000 + 100 + 100000 + 500000);
});

test('W7 : résultat du mois sur les écritures validées seulement', () => {
  const e = (journal, lignes, statut = 'validee') => ({ periode: '2026-10', journal, statut, lignes });
  const r = resultatPeriode([
    e('VT', [{ compte: '411', debit: 11900, credit: 0 }, { compte: '700', debit: 0, credit: 10000 }, { compte: '4457', debit: 0, credit: 1900 }]),
    e('AC', [{ compte: '600', debit: 6000, credit: 0 }, { compte: '401', debit: 0, credit: 6000 }]),
    e('PA', [{ compte: '631', debit: 2000, credit: 0 }, { compte: '421', debit: 0, credit: 2000 }]),
    e('AC', [{ compte: '600', debit: 999999, credit: 0 }, { compte: '401', debit: 0, credit: 999999 }], 'proposee'),
  ], '2026-10');
  assert.equal(r.produits, 10000);
  assert.equal(r.charges, 8000);
  assert.equal(r.resultat, 2000);
});

test('W8 : échéancier de novembre 2026', () => {
  const ech = echeancesDuMois({ mois: '2026-11', dossiers: [DOSSIER, { ...DOSSIER, id: 'd2', raisonSociale: 'EURL Sans salarié', salaries: 0, impot: 'IRG', casnos: true }], regles: ECHEANCIER_DEFAUT, aujourdhui: '2026-11-10' });
  const g50 = ech.filter((e) => e.regleId === 'g50');
  assert.equal(g50.length, 2);
  assert.equal(g50[0].date, '2026-11-20');
  assert.equal(g50[0].periodeConcernee, '2026-10');
  assert.match(g50[0].avertissement, /vendredi/);
  assert.ok(ech.some((e) => e.regleId === 'ibs-acompte' && e.dossierId === 'd1'));
  assert.ok(!ech.some((e) => e.regleId === 'ibs-acompte' && e.dossierId === 'd2'));
  assert.ok(ech.some((e) => e.regleId === 'cnas-mois') === false); // 4 salariés : régime trimestriel
  const jan = echeancesDuMois({ mois: '2027-01', dossiers: [DOSSIER], regles: ECHEANCIER_DEFAUT });
  assert.ok(jan.some((e) => e.regleId === 'cnas-trimestre' && e.periodeConcernee === 'T4 2026'));
  assert.ok(jan.some((e) => e.regleId === 'das' && e.periodeConcernee === '2026'));
});

test('W9 : pièces attendues et brouillon de relance', () => {
  const pieces = [{ dossierId: 'd1', periode: '2026-10', type: 'facture_achat', statut: 'recue' }];
  const att = piecesAttendues({ dossier: DOSSIER, periode: '2026-10', pieces, neant: ['piece_caisse'] });
  assert.deepEqual(att.filter((a) => a.manquante).map((a) => a.type), ['facture_vente', 'releve_bancaire', 'etat_paie']);
  const v = valeursModele({ dossier: { ...DOSSIER, contact: { nom: 'M. Haddad', email: 'gerant@exemple.dz' } }, periode: '2026-10', cabinet: { nom: 'Cabinet Mizane', signature: 'Cabinet Mizane' }, manquantes: att.filter((a) => a.manquante), dateLimite: '2026-11-20' });
  const b = brouillon(MODELES_DEFAUT[0], v, { contact: { email: 'gerant@exemple.dz' } });
  assert.match(b.objet, /octobre 2026/);
  assert.match(b.corps, /20\/11\/2026/);
  assert.match(b.corps, /• Factures de vente du mois/);
  assert.doesNotMatch(b.corps, /\{\{/);
  assert.equal(lienWhatsApp('0550 12 34 56', 'Bonjour'), 'https://wa.me/213550123456?text=Bonjour');
});

test('W5 : export PC Compta — fichier .xlsx lisible', () => {
  const fiche = normaliserFiche(facture(), DOSSIER);
  const { ecritures } = genererEcritures({ id: 'p1', dossierId: 'd1', periode: '2026-10', fiche }, DOSSIER);
  const lignes = lignesExport(ecritures);
  assert.deepEqual(lignes[0].slice(0, 4), ['AC', '2026-10-08', 'F-101', '600']);
  const f = exportPCCompta(ecritures, DOSSIER, '2026-10', EXPORT_DEFAUT);
  assert.equal(f.nom, 'PCCOMPTA_SARL_TEST_NEGOCE_202610.xlsx');
  const dir = mkdtempSync(join(tmpdir(), 'xlsx-'));
  const chemin = join(dir, f.nom);
  writeFileSync(chemin, f.octets);
  const test = execFileSync('unzip', ['-t', chemin]).toString();
  assert.match(test, /No errors detected/);
  const feuille = execFileSync('unzip', ['-p', chemin, 'xl/worksheets/sheet1.xml']).toString();
  assert.match(feuille, /<v>100000.00<\/v>/);
  assert.match(feuille, /Huile 5 L/);
});

test('La démo et le serveur exécutent le même code (public/ = sites/cabinet-expert-comptable/)', () => {
  const a = join(ici, '../../../sites/cabinet-expert-comptable');
  const b = join(ici, '../public');
  const lister = (d) => readdirSync(d, { recursive: true }).filter((f) => statSync(join(d, f)).isFile()).sort();
  const fa = lister(a);
  assert.deepEqual(lister(b), fa, 'Lancer « npm run front » pour recopier la démo');
  for (const f of fa) assert.ok(readFileSync(join(a, f)).equals(readFileSync(join(b, f))), `${relative(a, join(a, f))} diffère : npm run front`);
});
