// Registre des connecteurs. Ajouter un fournisseur = écrire un traducteur vers l'offre normalisée :
// { fournisseur, ref, ean, designation, marque, categorie, prixAchatHT, prixConseilleHT,
//   stock, statutStock ('en-stock' | 'rupture' | 'sur-commande' | 'inconnu'), delaiJours,
//   poidsKg, dimensions, images[], notice, description, brut }
import { creerConnecteurEquipme } from './equipme.js';
import { creerConnecteurFluxXml } from './flux-xml.js';

export function connecteur(id, options = {}) {
  switch (id) {
    case 'equipme':
      return creerConnecteurEquipme(options);
    case 'tefcold':
      return creerConnecteurFluxXml({ id: 'tefcold', nom: 'Tefcold', url: process.env.TEFCOLD_FLUX_XML, ...options });
    case 'combisteel':
    case 'diamond':
      return enAttenteDeDocumentation(id);
    default:
      throw new Error(`Fournisseur inconnu : ${id}`);
  }
}

/** Combisteel et Diamond : la clé existe, la documentation n'est pas publique. Le connecteur s'écrira sur ce modèle. */
function enAttenteDeDocumentation(id) {
  return {
    id,
    nom: id,
    // eslint-disable-next-line require-yield
    async *lire() {
      throw new Error(`Connecteur ${id} : documentation de l'API à récupérer dans l'espace pro avant de l'écrire (prix net, stock, délai, EAN, limite d'appels).`);
    },
  };
}
