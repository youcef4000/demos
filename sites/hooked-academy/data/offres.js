// Tarifs des formations, en dinars algériens : billets de la landing et choix du formulaire d'inscription.
// Prix de base ci-dessous ; l'équipe peut les changer dans l'espace équipe (Réglages), le serveur les publie.
// L'économie d'un pack est calculée (somme des formations du pack − prix du pack).
// « both » = Créative + IA ; « dev » = Formation Sites & Apps (novembre 2026) ; « all » = les trois formations.
import { PUB } from './serveur.js';

const BASE = { creative: 20000, ia: 25000, both: 35000, dev: 30000, all: 50000 };
const SET = PUB?.settings?.offres || {};
export const OFFRES = Object.fromEntries(Object.entries(BASE).map(([k, v]) => [k, Number.isFinite(SET[k]) && SET[k] > 0 ? SET[k] : v]));
