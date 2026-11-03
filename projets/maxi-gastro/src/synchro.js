// Le cœur du Passe : lire un fournisseur, comparer, décider, préparer les envois.
// Rien n'est envoyé à Shopify ici : les envois sont mis en file (table « envois ») puis exécutés par envoyer(),
// ce qui permet un mode « à blanc » et une reprise propre après une coupure.
import { cleProduit, regrouperOffres } from './noyau/rapprochement.js';
import { regleApplicable, calculerPrixVente, decisionPrix } from './noyau/prix.js';

const MOTS_FAMILLES = [
  ['pieces-detachees', ['pièce détachée', 'piece detachee', 'pièces détachées', 'spare part', 'joint de porte', 'thermostat de rechange', 'résistance de rechange']],
  ['ventilation', ['filtre à air', 'hotte', 'ventil', 'extracteur']],
  ['laverie', ['lave-vaisselle', 'lave vaisselle', 'lave-verres', 'lave verres', 'plonge']],
  ['cuisson', ['friteuse', 'four', 'plaque', 'grill', 'plancha', 'bain-marie', 'bain marie', 'chauffe', 'cuiseur', 'snack', 'crêpière']],
  ['preparation', ['blender', 'mixeur', 'coupe-légumes', 'coupe légumes', 'batteur', 'trancheuse']],
  ['inox', ['étagère', 'etagère', 'etagere', 'chariot', 'table inox', 'évier']],
  ['froid', ['réfrig', 'refrig', 'congél', 'congel', 'vitrine', 'arrière', 'arriere', 'armoire', 'saladette', 'comptoir', 'cave', 'cellule']],
];

export function devinerFamille(o) {
  const t = `${o.designation ?? ''} ${o.categorie ?? ''}`.toLowerCase();
  for (const [famille, mots] of MOTS_FAMILLES) if (mots.some((m) => t.includes(m))) return famille;
  return null;
}

function estExclue(o, regles) {
  const ex = Array.isArray(regles.exclusions) ? regles.exclusions : Object.entries(regles.exclusions || {}).filter(([, v]) => v).map(([k]) => k);
  return Boolean(o.famille && ex.includes(o.famille));
}

const versOffre = (r) => ({
  // stock et statut relus depuis la base : une liste de prix ne les a pas effacés
  fournisseur: r.fournisseur, ref: r.ref, ean: r.ean, marque: r.marque, designation: r.designation, famille: r.famille,
  prixAchatHT: r.prix_achat, stock: r.stock, statutStock: r.statut_stock, delaiJours: r.delai_jours,
});

/**
 * Synchronise un fournisseur. Renvoie un rapport lisible.
 * depuis : date de la dernière synchro réussie (les connecteurs qui le permettent ne lisent que les changements).
 * decision : false pour la toute première lecture (on remplit la base, puis « relier » rattache l'existant Shopify).
 */
export async function synchroniser({ base, connecteur, regles, depuis = base.derniereSynchroReussie(connecteur.id), decision = true }) {
  const idSynchro = base.debutSynchro(connecteur.id);
  const rapport = { fournisseur: connecteur.id, lues: 0, nouvelles: 0, exclues: 0, stock: 0, prix: 0, auPasse: 0, verrous: 0, erreurs: [] };
  const touchees = new Set();
  try {
    for await (const brute of connecteur.lire({ depuis })) {
      rapport.lues++;
      const o = { ...brute };
      o.famille = o.famille ?? devinerFamille(o);
      o.cle = cleProduit(o);
      o.exclue = estExclue(o, regles);
      const avant = base.offre(o.fournisseur, o.ref);
      base.enregistrerOffre(o);
      if (o.exclue) {
        rapport.exclues++;
        continue;
      }
      if (!avant) rapport.nouvelles++;
      const stockConnu = o.statutStock && o.statutStock !== 'inconnu';
      if (!avant || (stockConnu && (avant.stock !== (o.stock ?? null) || avant.statut_stock !== o.statutStock)) || (o.prixAchatHT && avant.prix_achat !== o.prixAchatHT)) touchees.add(o.cle);
    }
  } catch (err) {
    rapport.erreurs.push(err.message);
    base.noter('erreur', `Synchro ${connecteur.id} interrompue : ${err.message}`, { type: 'synchro', details: err.analyse });
  }
  for (const cle of decision ? touchees : []) {
    try {
      base.transaction(() => decider(base, cle, regles, rapport, connecteur.id));
    } catch (err) {
      rapport.erreurs.push(`${cle} : ${err.message}`);
    }
  }
  const changements = rapport.stock + rapport.prix + rapport.auPasse;
  base.finSynchro(idSynchro, { lues: rapport.lues, changements, erreurs: rapport.erreurs.length, statut: rapport.erreurs.length && !rapport.lues ? 'erreur' : 'ok' });
  base.noter(rapport.erreurs.length ? 'alerte' : 'info', `Synchro ${connecteur.id} : ${rapport.lues} lues, ${rapport.stock} stocks, ${rapport.prix} prix, ${rapport.auPasse} au passe`, { type: 'synchro', details: rapport });
  return rapport;
}

/** Décide pour un produit : stock, prix, ou validation humaine. */
export function decider(base, cle, regles, rapport, source) {
  const offres = base.offresDuProduit(cle).map(versOffre);
  if (!offres.length) return;
  const [groupe] = regrouperOffres(offres);
  const o = groupe.retenue;
  const regle = regleApplicable(regles, { cle, fournisseur: o.fournisseur, categorie: o.famille });
  const calc = o.prixAchatHT > 0 ? calculerPrixVente(o.prixAchatHT, regle) : null;
  const p = base.produit(cle);

  if (!p) {
    base.enregistrerProduit({ cle, fournisseur: o.fournisseur, ref: o.ref, titre: o.designation, statut: 'nouveau' });
    base.ajouterAuPasse({
      cle,
      type: 'nouveau',
      apres: { fournisseur: o.fournisseur, ref: o.ref, designation: o.designation, prixAchatHT: o.prixAchatHT, prixVenteHT: calc?.prixHT ?? null, stock: o.stock },
      raison: 'Nouveau produit fournisseur : fiche à rédiger (Claude), puis à valider avant création dans Shopify.',
    });
    rapport.auPasse++;
    return;
  }

  // Stock : jamais de validation, il part tout de suite.
  const stock = o.statutStock === 'rupture' ? 0 : o.stock;
  if (Number.isFinite(stock) && stock !== p.stock_publie) {
    if (p.shopify_inventaire) {
      base.preparerEnvoi({ cle, canal: 'shopify', action: 'stock', charge: { inventoryItemId: p.shopify_inventaire, quantite: stock, precedente: p.stock_publie } });
    }
    base.majProduit(cle, { stock_publie: stock });
    rapport.stock++;
  }

  // Prix : règles, seuil, verrou.
  if (!calc) return;
  const d = decisionPrix({ ancienHT: p.prix_vente, nouveauHT: calc.prixHT, verrouille: Boolean(p.prix_verrouille), seuilAutoPct: regles.seuilAutoPct });
  if (d.action === 'appliquer') {
    if (p.shopify_variante) base.preparerEnvoi({ cle, canal: 'shopify', action: 'prix', charge: { produitId: p.shopify_produit, varianteId: p.shopify_variante, prixHT: calc.prixHT } });
    base.majProduit(cle, { prix_vente: calc.prixHT });
    base.noterPrix(cle, o.prixAchatHT, calc.prixHT, source);
    rapport.prix++;
  } else if (d.action === 'valider') {
    base.ajouterAuPasse({ cle, type: 'prix', avant: { prixVenteHT: p.prix_vente }, apres: { prixVenteHT: calc.prixHT, prixAchatHT: o.prixAchatHT, regle: regle.niveau, coef: regle.valeur }, raison: d.raison });
    rapport.auPasse++;
  } else if (d.action === 'ignorer-verrou') {
    base.noterPrix(cle, o.prixAchatHT, p.prix_vente, `${source} (verrou)`);
    rapport.verrous++;
  }
}

/** Validation humaine d'un élément du passe. */
export function trancher(base, id, accepte) {
  const item = base.elementDuPasse(id);
  if (!item || item.statut !== 'attente') throw new Error(`Élément ${id} introuvable ou déjà traité`);
  if (!accepte) {
    base.trancher(id, 'refuse');
    base.noter('info', `Passe #${id} renvoyé en cuisine`, { type: item.type, cle: item.cle });
    return { id, statut: 'refuse' };
  }
  base.transaction(() => {
    const p = item.cle ? base.produit(item.cle) : null;
    if (item.type === 'prix' && p) {
      if (p.shopify_variante) base.preparerEnvoi({ cle: item.cle, canal: 'shopify', action: 'prix', charge: { produitId: p.shopify_produit, varianteId: p.shopify_variante, prixHT: item.apres.prixVenteHT } });
      base.majProduit(item.cle, { prix_vente: item.apres.prixVenteHT });
      base.noterPrix(item.cle, item.apres.prixAchatHT, item.apres.prixVenteHT, 'passe');
    }
    if (item.type === 'nouveau' || item.type === 'fiche') {
      const fiche = p?.fiche_ia ? JSON.parse(p.fiche_ia) : null;
      const offre = base.offresDuProduit(item.cle)[0];
      base.preparerEnvoi({ cle: item.cle, canal: 'shopify', action: p?.shopify_produit ? 'contenu' : 'creer', charge: { produitId: p?.shopify_produit ?? null, offre, fiche, prixHT: item.apres?.prixVenteHT ?? p?.prix_vente } });
      if (item.apres?.prixVenteHT) base.majProduit(item.cle, { prix_vente: item.apres.prixVenteHT, statut: 'valide' });
      else base.majProduit(item.cle, { statut: 'valide' });
    }
    base.trancher(id, 'accepte');
  });
  base.noter('info', `Passe #${id} envoyé`, { type: item.type, cle: item.cle });
  return { id, statut: 'accepte' };
}

/** Exécute les envois en attente vers Shopify (ou les écrit seulement, en mode à blanc). */
export async function envoyer({ base, shopify, limite = 500 }) {
  const res = { envoyes: 0, erreurs: 0 };
  for (const e of base.envoisAFaire('shopify', limite)) {
    try {
      const r = await shopify.executer(e.action, e.charge);
      res.envoyes++;
      if (shopify.aBlanc) continue; // à blanc : la requête est écrite dans sortie/, l'envoi reste en attente
      if (r?.produitId && e.cle) base.majProduit(e.cle, { shopify_produit: r.produitId, shopify_variante: r.varianteId ?? null, shopify_inventaire: r.inventaireId ?? null, statut: 'publie' });
      base.marquerEnvoi(e.id, 'envoye');
    } catch (err) {
      base.marquerEnvoi(e.id, 'erreur', err.message);
      base.noter('erreur', `Envoi Shopify ${e.action} : ${err.message}`, { type: 'envoi', cle: e.cle });
      res.erreurs++;
    }
  }
  return res;
}
