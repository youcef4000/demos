// Chargement commun : .env, règles, base, connecteurs, Shopify.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ouvrirBase } from './base.js';
import { connecteur } from './connecteurs/index.js';
import { creerConnecteurFichier, decoderFichier } from './connecteurs/csv.js';
import { creerShopify } from './shopify.js';

export const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');

export function chargerEnvironnement() {
  const env = join(RACINE, '.env');
  if (existsSync(env)) process.loadEnvFile(env);
}

export function chargerRegles() {
  return JSON.parse(readFileSync(join(RACINE, 'config/regles.json'), 'utf8'));
}

export function chargerProfil(nom) {
  if (!/^[a-z0-9-]+$/.test(nom)) throw new Error('Nom de profil invalide');
  const chemin = join(RACINE, 'config/profils-csv', `${nom}.json`);
  if (!existsSync(chemin)) throw new Error(`Profil CSV inconnu : ${nom}`);
  return JSON.parse(readFileSync(chemin, 'utf8'));
}

export function contexte({ aBlanc = false } = {}) {
  chargerEnvironnement();
  return {
    base: ouvrirBase(process.env.PASSE_BASE || join(RACINE, 'donnees/passe.sqlite')),
    regles: chargerRegles(),
    connecteur,
    fichier: (profil, { texte, chemin, octets }) => creerConnecteurFichier({ profil: chargerProfil(profil), texte: texte ?? (octets ? decoderFichier(octets) : undefined), chemin }),
    shopify: () => creerShopify({ aBlanc, sortie: join(RACINE, 'sortie') }),
  };
}
