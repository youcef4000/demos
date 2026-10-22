// Tarifs des formations, en dinars algériens : billets de la landing et choix du formulaire d'inscription.
// Prix de base ci-dessous ; l'équipe peut les changer dans l'espace équipe (Réglages), le serveur les publie.
// L'économie du pack est calculée (somme des deux formations − pack).
import { PUB } from './serveur.js';

const BASE = { creative: 14900, ia: 24900, both: 32900 };
const SET = PUB?.settings?.offres || {};
export const OFFRES = Object.fromEntries(Object.entries(BASE).map(([k, v]) => [k, Number.isFinite(SET[k]) && SET[k] > 0 ? SET[k] : v]));
