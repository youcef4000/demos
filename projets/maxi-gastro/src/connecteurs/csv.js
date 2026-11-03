// Connecteur « fichier » — pour Cuistance et tout fournisseur sans API.
// Le fichier arrive par mail (n8n récupère la pièce jointe) ou est déposé à la main.
// Les colonnes sont reconnues par leur nom ; un profil force celles qui comptent.
// Si le fichier ne ressemble à rien de connu, on refuse l'import et on demande une validation humaine.
import { readFileSync } from 'node:fs';
import { lireCSV, detecterColonnes, lignesVersOffres } from '../noyau/csv.js';

/** Texte d'un fichier : UTF-8 si valide, sinon Windows-1252 (exports Excel français). */
export function decoderFichier(octets) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(octets);
  } catch {
    return new TextDecoder('windows-1252').decode(octets);
  }
}

export function creerConnecteurFichier({ profil, texte, chemin }) {
  const contenu = texte ?? decoderFichier(readFileSync(chemin));
  const lu = lireCSV(contenu);
  const det = detecterColonnes(lu.entetes, profil.colonnes || {});
  return {
    id: profil.fournisseur,
    nom: profil.fournisseur,
    analyse: { separateur: lu.separateur, lignes: lu.lignes.length, colonnes: lu.entetes, mapping: det.mapping, inconnues: det.inconnues, confiance: det.confiance },
    async *lire() {
      if (det.confiance < (profil.confianceMinimale ?? 0.67)) {
        const err = new Error(`Fichier ${profil.fournisseur} non reconnu (colonnes : ${lu.entetes.join(', ')}). Import suspendu, validation demandée.`);
        err.code = 'FICHIER_INCONNU';
        err.analyse = this.analyse;
        throw err;
      }
      const { offres, erreurs } = lignesVersOffres(lu, det.mapping, { fournisseur: profil.fournisseur, marqueParDefaut: profil.marqueParDefaut });
      this.erreurs = erreurs;
      for (const o of offres) {
        const jours = /^\d+$/.test(o.delai || '') ? Number(o.delai) : null;
        yield { ...o, delaiJours: jours, images: o.image ? [o.image] : [] };
      }
    },
  };
}
