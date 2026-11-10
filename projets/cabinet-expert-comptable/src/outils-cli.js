// Outils en ligne de commande.
//   npm run demo                          → charge les données fictives de démonstration dans une base vide
//   npm run compte -- associe a@b.dz "Nom" → crée un compte (mot de passe provisoire affiché une fois)
//   npm run compte -- client  c@d.dz "Nom" <id-dossier>
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { ouvrirBase } from './base.js';
import { preparerMotDePasse } from './securite.js';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = join(RACINE, '.env');
if (existsSync(env)) for (const l of readFileSync(env, 'utf8').split('\n')) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(l);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}
const DONNEES = process.env.DONNEES || join(RACINE, 'donnees');
mkdirSync(DONNEES, { recursive: true });
const base = ouvrirBase(join(DONNEES, 'cabinet.sqlite'));
const [commande, ...args] = process.argv.slice(2);

if (commande === 'demo') {
  if (!base.vide() && !args.includes('--forcer')) {
    console.error('La base contient déjà des comptes : rien chargé. (--forcer pour ajouter quand même les données de démonstration)');
    process.exit(1);
  }
  const { genererDonneesDemo, COMPTES_DEMO } = await import(join(RACINE, 'public/app/js/demo-donnees.js'));
  const g = genererDonneesDemo();
  for (const u of g.collections.utilisateurs) Object.assign(u, await preparerMotDePasse(COMPTES_DEMO.find((c) => c.id === u.id).motDePasse));
  base.importer({ collections: g.collections, parametres: { demo: { disponibles: g.disponibles } } });
  console.log('Données de démonstration chargées (entreprises et montants fictifs). Comptes :');
  for (const c of COMPTES_DEMO) console.log(`  ${c.role.padEnd(13)} ${c.email.padEnd(28)} ${c.motDePasse}`);
  console.log('Changer ces mots de passe avant toute mise en ligne (Comptes → Mot de passe).');
} else if (commande === 'compte') {
  const [role, email, nom, dossierId] = args;
  if (!['associe', 'collaborateur', 'client'].includes(role) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '')) {
    console.error('Usage : npm run compte -- <associe|collaborateur|client> <email> "<Nom>" [id-dossier pour un client]');
    process.exit(1);
  }
  if (base.tous('utilisateurs').some((u) => u.email === email.toLowerCase())) {
    console.error('Cette adresse a déjà un compte.');
    process.exit(1);
  }
  if (role === 'client' && !base.lire('dossiers', dossierId)) {
    console.error('Dossier introuvable : donner l’identifiant du dossier du client.');
    process.exit(1);
  }
  const mdp = randomBytes(9).toString('base64url');
  base.ecrire('utilisateurs', { id: `u${Date.now().toString(36)}`, email: email.toLowerCase(), nom: nom || email, role, dossierId: role === 'client' ? dossierId : null, actif: true, creeLe: new Date().toISOString(), ...(await preparerMotDePasse(mdp)) });
  console.log(`Compte ${role} créé pour ${email}. Mot de passe provisoire (affiché une seule fois) : ${mdp}`);
} else {
  console.log('Commandes : demo | compte');
}
