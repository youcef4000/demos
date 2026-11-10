// Parcours complet sur les routes du noyau, avec les droits de chaque rôle et des agents simulés.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const N = '../public/app/noyau/';
const { creerApi } = await import(`${N}api.js`);
const { creerBaseMemoire } = await import(`${N}base-memoire.js`);

const ASSOCIE = { id: 'u1', nom: 'Associé', role: 'associe', actif: true };
const COLLAB = { id: 'u2', nom: 'Collaboratrice', role: 'collaborateur', actif: true };
const AUTRE_COLLAB = { id: 'u4', nom: 'Autre', role: 'collaborateur', actif: true };
const CLIENT = { id: 'u3', nom: 'Gérant', role: 'client', dossierId: 'd1', actif: true };

function monter({ lecture } = {}) {
  const base = creerBaseMemoire({
    collections: {
      utilisateurs: [ASSOCIE, COLLAB, AUTRE_COLLAB, CLIENT],
      dossiers: [
        { id: 'd1', raisonSociale: 'SARL Atlas Test', nif: '999016000000001', regime: 'reel', impot: 'IBS', salaries: 3, collaborateurId: 'u2', contact: { nom: 'M. Gérant', email: 'gerant@exemple.dz', telephone: '0550000000' } },
        { id: 'd2', raisonSociale: 'EURL Autre', nif: '999016000000002', regime: 'reel', impot: 'IBS', salaries: 0, collaborateurId: 'u4' },
      ],
    },
  });
  const envoyes = [];
  const moteurs = {
    lirePiece: async ({ piece }) =>
      lecture?.(piece) ?? {
        confiance: 0.93,
        fiche: {
          typeDoc: 'facture_achat',
          numero: 'FA-77',
          date: '2026-10-12',
          emetteur: { nom: 'EURL Hodna Services', nif: '999016000000777' },
          destinataire: { nom: 'SARL Atlas Test', nif: '999016000000001' },
          nature: 'frais',
          lignes: [{ libelle: 'Réparation climatiseur', montantHT: 3000000, tauxTVA: 19 }, { libelle: 'Article inclassable', montantHT: 1000000, tauxTVA: 19 }],
          totalHT: 4000000,
          totalTVA: 760000,
          timbre: 0,
          totalTTC: 4760000,
          modePaiement: 'cheque',
        },
      },
    imputer: async () => ({ compte: '607', justification: 'Petite fourniture non stockée.', confiance: 0.7 }),
    envoyer: async (e) => {
      envoyes.push(e);
      return { ok: true };
    },
  };
  const api = creerApi({ base, moteurs, horloge: () => new Date('2026-11-10T09:00:00Z'), securite: { preparerMotDePasse: async () => ({ empreinte: 'x', sel: 'y' }) } });
  const appel = async (u, m, chemin, corps, q) => api.traiter(u, m, chemin, { corps, q: q || Object.fromEntries(new URL(`http://x${chemin}`).searchParams) });
  return { api, base, appel, envoyes };
}

test('Connexion obligatoire et cloisonnement des dossiers', async () => {
  const { appel } = monter();
  assert.equal((await appel(null, 'GET', '/tableau')).statut, 401);
  assert.equal((await appel(null, 'GET', '/public/site')).statut, 200);
  assert.equal((await appel(CLIENT, 'GET', '/tableau')).statut, 403);
  assert.equal((await appel(CLIENT, 'GET', '/dossiers/d2')).statut, 403);
  assert.equal((await appel(COLLAB, 'GET', '/dossiers/d2')).statut, 403);
  assert.equal((await appel(COLLAB, 'GET', '/dossiers')).json.dossiers.length, 1);
  assert.equal((await appel(ASSOCIE, 'GET', '/dossiers')).json.dossiers.length, 2);
  assert.equal((await appel(COLLAB, 'PUT', '/parametres/modeles', { valeur: [] })).statut, 403);
  assert.equal((await appel(CLIENT, 'GET', '/pieces?dossierId=d2')).statut, 403);
});

test('Parcours : dépôt client → lecture agent → validation → écritures → export → G50 → message validé', async () => {
  const { appel, envoyes } = monter();
  // Le client dépose une facture
  const dep = await appel(CLIENT, 'POST', '/pieces', { periode: '2026-10', type: 'facture_achat', fichier: { nom: 'facture.jpg', ref: 'f1', mime: 'image/jpeg' }, attendreLecture: true });
  assert.equal(dep.statut, 200);
  assert.equal(dep.json.statut, 'a_valider');
  assert.equal(dep.json.fiche.sens, 'achat');
  const id = dep.json.id;
  // Le client ne peut pas valider
  assert.equal((await appel(CLIENT, 'POST', `/pieces/${id}/valider`)).statut, 403);
  // Le collaborateur valide : la 2e ligne n'a pas de règle → agent d'imputation
  const val = await appel(COLLAB, 'POST', `/pieces/${id}/valider`);
  assert.equal(val.statut, 200, JSON.stringify(val.json));
  const ecr = val.json.ecritures;
  assert.deepEqual(ecr.map((e) => e.journal), ['AC', 'BQ']);
  assert.ok(ecr.every((e) => e.statut === 'proposee'), 'les écritures restent proposées');
  const ac = ecr[0];
  assert.equal(ac.source, 'agent');
  assert.ok(ac.lignes.some((l) => l.compte === '615'), 'mot-clé réparation → 615');
  assert.ok(ac.lignes.some((l) => l.compte === '607'), 'compte proposé par l’agent');
  // Export impossible tant que rien n'est validé
  assert.equal((await appel(COLLAB, 'GET', '/export/pccompta?dossierId=d1&periode=2026-10')).statut, 400);
  assert.equal((await appel(COLLAB, 'POST', '/ecritures/valider', { ids: ecr.map((e) => e.id) })).json.validees, 2);
  const exp = await appel(COLLAB, 'GET', '/export/pccompta?dossierId=d1&periode=2026-10');
  assert.equal(exp.statut, 200);
  assert.ok(exp.fichier.octets.length > 1000);
  // G50 : préparée par le collaborateur, validée par l'associé seulement
  const g = await appel(COLLAB, 'POST', '/declarations/g50', { dossierId: 'd1', periode: '2026-10' });
  assert.equal(g.json.statut, 'preparee');
  assert.equal(g.json.calcul.tva.deductibleBiensServices, 760000);
  assert.equal(g.json.calcul.tva.creditAReporter, 760000);
  assert.equal((await appel(COLLAB, 'POST', `/declarations/${g.json.id}/valider`)).statut, 403);
  assert.equal((await appel(CLIENT, 'GET', '/declarations')).json.declarations.length, 0, 'le client ne voit pas une G50 non validée');
  const v = await appel(ASSOCIE, 'POST', `/declarations/${g.json.id}/valider`);
  assert.equal(v.json.statut, 'validee');
  assert.equal((await appel(CLIENT, 'GET', '/declarations')).json.declarations.length, 1);
  // Un message au client a été préparé, rien n'est parti
  const boite = await appel(COLLAB, 'GET', '/envois?statut=a_valider');
  assert.equal(boite.json.envois.length, 1);
  assert.equal(envoyes.length, 0);
  const env = boite.json.envois[0];
  assert.match(env.objet, /G50 de octobre 2026/);
  const ok = await appel(COLLAB, 'POST', `/envois/${env.id}/valider`);
  assert.equal(ok.json.statut, 'envoye');
  assert.equal(envoyes.length, 1, 'envoyé une seule fois, après validation');
  assert.equal((await appel(COLLAB, 'POST', `/envois/${env.id}/valider`)).statut, 400);
  assert.equal((await appel(CLIENT, 'GET', '/messages')).json.messages.length, 1);
  // Dépôt : seulement après validation
  const dep2 = await appel(COLLAB, 'POST', `/declarations/${g.json.id}/deposee`, { reference: 'JIB-123' });
  assert.equal(dep2.json.statut, 'deposee');
});

test('Relances : brouillons pour les dossiers incomplets, jamais envoyés seuls', async () => {
  const { appel, api, envoyes } = monter();
  const r = await appel(ASSOCIE, 'POST', '/relances/preparer', { periode: '2026-10' });
  assert.equal(r.json.preparees, 2);
  assert.ok(r.json.envois.every((e) => e.statut === 'a_valider'));
  assert.equal((await appel(ASSOCIE, 'POST', '/relances/preparer', { periode: '2026-10' })).json.preparees, 0, 'pas de doublon de brouillon');
  assert.equal(envoyes.length, 0);
  const sans = r.json.envois.find((e) => e.dossierId === 'd2');
  assert.equal((await appel(ASSOCIE, 'POST', `/envois/${sans.id}/valider`)).statut, 400, 'pas d’adresse → refus');
  // Tâche du matin : uniquement les jours choisis
  assert.deepEqual(await api.tachesDuJour(), { relances: 0 });
});

test('Fiche fausse : la validation est bloquée tant que les erreurs ne sont pas corrigées', async () => {
  const { appel } = monter({ lecture: () => ({ confiance: 0.55, fiche: { typeDoc: 'facture_achat', numero: 'X1', date: '2026-10-02', emetteur: { nom: 'F', nif: '999016000000888' }, nature: 'marchandises', lignes: [{ libelle: 'Lot', montantHT: 100000, tauxTVA: 19 }], totalHT: 100000, totalTVA: 19000, totalTTC: 150000, modePaiement: 'especes' } }) });
  const dep = await appel(COLLAB, 'POST', '/pieces', { dossierId: 'd1', periode: '2026-10', type: 'facture_achat', fichier: { nom: 'x.pdf', ref: 'r' }, attendreLecture: true });
  assert.ok(dep.json.controles.some((c) => c.code === 'confiance'));
  assert.ok(dep.json.controles.some((c) => c.code === 'ttc'));
  assert.equal((await appel(COLLAB, 'POST', `/pieces/${dep.json.id}/valider`)).statut, 400);
  const fiche = { ...dep.json.fiche, totalTTC: 119000 };
  const corr = await appel(COLLAB, 'PUT', `/pieces/${dep.json.id}`, { fiche });
  assert.ok(!corr.json.controles.some((c) => c.niveau === 'erreur'));
  assert.equal((await appel(COLLAB, 'POST', `/pieces/${dep.json.id}/valider`)).statut, 200);
});

test('Paramètres éditables par l’associé, contrôlés', async () => {
  const { appel } = monter();
  const m = await appel(ASSOCIE, 'GET', '/parametres/echeancier');
  const regles = m.json.valeur;
  regles[0].jour = 19;
  assert.equal((await appel(ASSOCIE, 'PUT', '/parametres/echeancier', { valeur: regles })).statut, 200);
  assert.equal((await appel(ASSOCIE, 'GET', '/echeances?mois=2026-11')).json.echeances.find((e) => e.regleId === 'g50').date, '2026-11-19');
  regles[0].jour = 45;
  assert.equal((await appel(ASSOCIE, 'PUT', '/parametres/echeancier', { valeur: regles })).statut, 400);
  const site = (await appel(ASSOCIE, 'GET', '/parametres/site')).json.valeur;
  site.titre = 'Nouveau titre';
  await appel(ASSOCIE, 'PUT', '/parametres/site', { valeur: site });
  assert.equal((await appel(null, 'GET', '/public/site')).json.site.titre, 'Nouveau titre');
  assert.equal((await appel(ASSOCIE, 'POST', '/parametres/site/reinitialiser')).json.valeur.titre.startsWith('Votre comptabilité'), true);
});
