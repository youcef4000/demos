// Serveur réel de bout en bout : connexion de chaque rôle, cookies, CSRF, fichiers, en-têtes, fichiers statiques.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'cabinet-'));
process.env.DONNEES = dir;
const { demarrerServeur } = await import('../src/serveur.js');
const { preparerMotDePasse } = await import('../src/securite.js');
const { genererDonneesDemo, COMPTES_DEMO } = await import('../public/app/js/demo-donnees.js');
let srv;
let B;

before(async () => {
  srv = await demarrerServeur({ port: 0, donnees: dir, agents: 'simulation', secure: false, journal: false });
  const g = genererDonneesDemo();
  for (const u of g.collections.utilisateurs) Object.assign(u, await preparerMotDePasse(COMPTES_DEMO.find((c) => c.id === u.id).motDePasse));
  srv.base.importer({ collections: g.collections });
  B = `http://127.0.0.1:${srv.port}`;
});
after(async () => {
  await srv.fermer();
  rmSync(dir, { recursive: true, force: true });
});

async function connecter(email, motDePasse) {
  const r = await fetch(`${B}/api/connexion`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-cabinet': '1' }, body: JSON.stringify({ email, motDePasse }) });
  const cookie = (r.headers.get('set-cookie') || '').split(';')[0];
  return { r, cookie, appel: (m, chemin, corps, h = {}) => fetch(`${B}/api${chemin}`, { method: m, headers: { cookie, 'x-cabinet': '1', 'content-type': 'application/json', ...h }, body: corps === undefined ? undefined : typeof corps === 'string' || corps instanceof Uint8Array ? corps : JSON.stringify(corps) }) };
}

test('Pages internes et API fermées sans connexion ; site et configuration publics', async () => {
  assert.equal((await fetch(`${B}/api/tableau`)).status, 401);
  assert.equal((await fetch(`${B}/api/session`)).status, 401);
  assert.equal((await fetch(`${B}/api/public/site`)).status, 200);
  assert.deepEqual(await (await fetch(`${B}/app/config.json`)).json(), { mode: 'serveur' });
  const page = await fetch(`${B}/`);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(page.headers.get('x-frame-options'), 'DENY');
  assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
  assert.equal((await fetch(`${B}/app/`)).status, 200);
  assert.notEqual((await fetch(`${B}/..%2f..%2fpackage.json`)).status, 200);
  assert.equal((await fetch(`${B}/app/noyau/../../../package.json`)).status, 404);
});

test('Chaque compte de démonstration se connecte, avec les droits de son rôle', async () => {
  const mauvais = await connecter('associe@cabinet.demo', 'faux');
  assert.equal(mauvais.r.status, 401);
  const a = await connecter('associe@cabinet.demo', 'Associe-2026');
  assert.equal(a.r.status, 200);
  assert.match(a.r.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  assert.equal((await (await a.appel('GET', '/session')).json()).utilisateur.role, 'associe');
  assert.equal((await (await a.appel('GET', '/dossiers')).json()).dossiers.length, 6);
  const c = await connecter('collaborateur@cabinet.demo', 'Collab-2026');
  assert.equal((await (await c.appel('GET', '/dossiers')).json()).dossiers.length, 3, 'portefeuille du collaborateur');
  assert.equal((await c.appel('GET', '/parametres')).status, 403);
  const cl = await connecter('client@atlas.demo', 'Client-2026');
  assert.equal((await cl.appel('GET', '/tableau')).status, 403);
  assert.equal((await cl.appel('GET', '/dossiers/d-sahel')).status, 403);
  assert.equal((await (await cl.appel('GET', '/client/accueil')).json()).dossier.id, 'd-atlas');
  const sansEntete = await fetch(`${B}/api/messages`, { method: 'POST', headers: { cookie: cl.cookie, 'content-type': 'application/json' }, body: '{"texte":"x"}' });
  assert.equal(sansEntete.status, 403, 'écriture sans en-tête x-cabinet refusée (CSRF)');
  await a.appel('POST', '/deconnexion', {});
  assert.equal((await a.appel('GET', '/session')).status, 401, 'session fermée');
});

test('Fichiers : dépôt, lecture réservée au dossier, formats contrôlés', async () => {
  const cl = await connecter('client@atlas.demo', 'Client-2026');
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
  assert.equal((await cl.appel('POST', '/fichiers', png, { 'content-type': 'text/html' })).status, 415);
  const f = await (await cl.appel('POST', '/fichiers', png, { 'content-type': 'image/png', 'x-nom': 'facture.png' })).json();
  assert.ok(f.ref);
  const p = await (await cl.appel('POST', '/pieces', { periode: '2026-10', type: 'facture_achat', fichier: f, attendreLecture: true })).json();
  assert.equal(p.statut, 'a_valider');
  assert.equal((await cl.appel('GET', `/fichiers/${f.ref}`)).status, 200);
  const autre = await connecter('client@sahel.demo', 'Client-2026');
  assert.equal((await autre.appel('GET', `/fichiers/${f.ref}`)).status, 404, 'un autre client ne voit pas la pièce');
  const lina = await connecter('lina@cabinet.demo', 'Collab-2026');
  assert.equal((await lina.appel('GET', `/fichiers/${f.ref}`)).status, 404, 'hors portefeuille');
  const amine = await connecter('collaborateur@cabinet.demo', 'Collab-2026');
  assert.equal((await amine.appel('GET', `/fichiers/${f.ref}`)).status, 200);
  const ex = srv.base.tous('pieces').find((x) => x.dossierId === 'd-atlas' && x.exemple);
  const svg = await amine.appel('GET', `/fichiers/${encodeURIComponent(ex.fichier.ref)}`);
  assert.equal(svg.headers.get('content-type'), 'image/svg+xml');
});

test('Export PC Compta téléchargé en .xlsx ; un message ne part qu’après validation', async () => {
  const a = await connecter('associe@cabinet.demo', 'Associe-2026');
  const x = await a.appel('GET', '/export/pccompta?dossierId=d-numidia&periode=2026-10');
  assert.equal(x.status, 200);
  assert.match(x.headers.get('content-disposition'), /PCCOMPTA_SPA_NUMIDIA_PLAST_202610\.xlsx/);
  const octets = new Uint8Array(await x.arrayBuffer());
  assert.deepEqual([...octets.slice(0, 2)], [0x50, 0x4b], 'archive ZIP (xlsx)');
  const { envois } = await (await a.appel('GET', '/envois?statut=a_valider')).json();
  assert.ok(envois.length >= 2);
  const r = await a.appel('POST', `/envois/${envois.find((e) => e.canal === 'email').id}/valider`);
  assert.equal(r.status, 502, 'messagerie non configurée : refus explicite, rien n’est marqué envoyé');
  assert.match((await r.json()).erreur, /messagerie du cabinet non configurée/);
});

test('Trop d’échecs de connexion : blocage temporaire', async () => {
  for (let i = 0; i < 5; i++) await connecter('lina@cabinet.demo', 'mauvais');
  assert.equal((await connecter('lina@cabinet.demo', 'Collab-2026')).r.status, 429);
});
