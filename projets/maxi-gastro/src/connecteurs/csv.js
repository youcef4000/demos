// Connecteur « fichier » — pour Cuistance et tout fournisseur sans API.
// Accepte un CSV (stock envoyé par mail) ou un classeur Excel .xlsx (liste de prix).
// Le fichier arrive par mail (n8n récupère la pièce jointe) ou est déposé à la main.
// Les colonnes sont reconnues par leur nom ; un profil force celles qui comptent.
// Si le fichier ne ressemble à rien de connu, on refuse l'import et on demande une validation humaine.
import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { lireCSV, detecterColonnes, lignesVersOffres } from '../noyau/csv.js';
import { lireXlsx, choisirTableau, estXlsx } from '../noyau/xlsx.js';

/** Texte d'un fichier : UTF-8 si valide, sinon Windows-1252 (exports Excel français). */
export function decoderFichier(octets) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(octets);
  } catch {
    return new TextDecoder('windows-1252').decode(octets);
  }
}

/** Lit le fichier et prépare le connecteur. Asynchrone (décompression des .xlsx). */
export async function creerConnecteurFichier({ profil, texte, chemin, octets }) {
  let o = octets ?? (chemin ? readFileSync(chemin) : null);
  if (o && !(o instanceof Uint8Array)) o = new Uint8Array(o);
  let tableau;
  if (texte === undefined && o && estXlsx(o)) {
    const t = choisirTableau(await lireXlsx(o, (u) => inflateRawSync(u)), profil.colonnes || {});
    tableau = { format: 'xlsx', feuille: t.feuille, ligneEntete: t.ligneEntete, entetes: t.entetes, lignes: t.lignes, mapping: t.mapping, inconnues: t.inconnues, confiance: t.confiance };
  } else {
    const lu = lireCSV(texte ?? decoderFichier(o));
    const det = detecterColonnes(lu.entetes, profil.colonnes || {});
    tableau = { format: 'csv', separateur: lu.separateur, entetes: lu.entetes, lignes: lu.lignes, ...det };
  }
  // Une liste de prix n'a pas de stock : on ne l'exige pas, et l'offre gardera son stock connu.
  const essentiels = profil.type === 'tarif' ? ['ref', 'prixAchat'] : ['ref', 'stock', 'prixAchat'];
  const confiance = essentiels.filter((c) => c in tableau.mapping).length / essentiels.length;
  const { lignes, ...sansLignes } = tableau;
  const analyse = { ...sansLignes, lignesLues: lignes.length, confiance };

  return {
    id: profil.fournisseur,
    nom: profil.fournisseur,
    analyse,
    erreurs: [],
    async *lire() {
      if (confiance < (profil.confianceMinimale ?? 0.67)) {
        const err = new Error(`Fichier ${profil.fournisseur} non reconnu (colonnes : ${tableau.entetes.filter(Boolean).join(', ')}). Import suspendu, validation demandée.`);
        err.code = 'FICHIER_INCONNU';
        err.analyse = analyse;
        throw err;
      }
      const { offres, erreurs } = lignesVersOffres({ entetes: tableau.entetes, lignes }, tableau.mapping, { fournisseur: profil.fournisseur, marqueParDefaut: profil.marqueParDefaut });
      this.erreurs = erreurs;
      const vues = new Set();
      for (const o of offres) {
        if (vues.has(o.ref)) continue; // référence en double dans le fichier : la première ligne fait foi
        vues.add(o.ref);
        const jours = /^\d+$/.test(o.delai || '') ? Number(o.delai) : null;
        yield {
          ...o,
          delaiJours: jours,
          images: o.image ? [o.image] : [],
          brut: { codeFournisseur: o.codeFournisseur, prixAchatPrecedentHT: o.prixAchatPrecedentHT, observation: o.observation, ligne: o.ligne },
        };
      }
    },
  };
}
