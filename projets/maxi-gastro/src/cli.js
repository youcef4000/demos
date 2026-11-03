#!/usr/bin/env node
// Ligne de commande du Passe.
//   npm run passe -- synchro tefcold --lecture-seule   1re fois : remplit la base sans rien décider (puis « relier »)
//   npm run passe -- synchro equipme            lit equip.me, décide, met les envois en file
//   npm run passe -- synchro equipme --envoyer   … puis les envoie à Shopify
//   npm run passe -- import cuistance stock.csv  lit un fichier fournisseur
//   npm run passe -- relier                      relie les produits Shopify existants aux références fournisseurs
//   npm run passe -- envoyer [--a-blanc]         exécute les envois en attente (à blanc : écrit sortie/shopify-a-blanc.jsonl)
//   npm run passe -- passe                       liste ce qui attend une décision
//   npm run passe -- passe valider 12 | refuser 12
//   npm run passe -- verrou <cle> [off]          verrouille (ou déverrouille) un prix
//   npm run passe -- fiches lancer --limite=300   lot Claude de nuit (−50 %) ; fiches recuperer ; fiches une <cle>
//   npm run passe -- rapport
import { contexte } from './contexte.js';
import { synchroniser, trancher, envoyer } from './synchro.js';
import { regrouperOffres, relierShopify } from './noyau/rapprochement.js';
import { lancerLotFiches, recupererLots, redigerUne } from './fiches.js';

const [commande, ...args] = process.argv.slice(2);
const drapeau = (d) => args.includes(d);
const positionnels = args.filter((a) => !a.startsWith('--'));
const aBlanc = drapeau('--a-blanc');
const ctx = contexte({ aBlanc });
const afficher = (o) => console.log(JSON.stringify(o, null, 2));

try {
  switch (commande) {
    case 'synchro': {
      const id = positionnels[0];
      if (!id) throw new Error('Préciser le fournisseur : equipme, tefcold, combisteel, diamond');
      afficher(await synchroniser({ base: ctx.base, connecteur: ctx.connecteur(id), regles: ctx.regles, depuis: drapeau('--complet') || drapeau('--lecture-seule') ? null : undefined, decision: !drapeau('--lecture-seule') }));
      if (drapeau('--envoyer')) afficher(await envoyer({ base: ctx.base, shopify: ctx.shopify() }));
      break;
    }
    case 'import': {
      const [profil, chemin] = positionnels;
      if (!profil || !chemin) throw new Error('Usage : import <profil> <fichier.csv>');
      const c = ctx.fichier(profil, { chemin });
      console.error(`Colonnes reconnues : ${JSON.stringify(c.analyse.mapping)} (confiance ${Math.round(c.analyse.confiance * 100)} %)`);
      afficher(await synchroniser({ base: ctx.base, connecteur: c, regles: ctx.regles, depuis: null }));
      if (drapeau('--envoyer')) afficher(await envoyer({ base: ctx.base, shopify: ctx.shopify() }));
      break;
    }
    case 'relier': {
      const shopify = ctx.shopify();
      const existants = await shopify.lireProduits();
      const offres = ctx.base.db.prepare('SELECT fournisseur, ref, ean, marque, prix_achat AS prixAchatHT, stock, statut_stock AS statutStock FROM offres WHERE exclue = 0').all();
      const groupes = regrouperOffres(offres);
      const parCle = new Map(groupes.map((g) => [g.cle, g.retenue]));
      const { lies, nouveaux, orphelins } = relierShopify(groupes, existants);
      const parId = new Map(existants.map((p) => [p.id, p]));
      ctx.base.transaction(() => {
        for (const [cle, id] of lies) {
          const s = parId.get(id);
          const o = parCle.get(cle);
          ctx.base.enregistrerProduit({ cle, fournisseur: o.fournisseur, ref: o.ref, shopifyProduit: s.id, shopifyVariante: s.varianteId, shopifyInventaire: s.inventaireId, titre: s.titre, prixVente: s.prix, stockPublie: s.stock, statut: 'publie' });
        }
      });
      afficher({ produitsShopify: existants.length, relies: lies.size, offresSansProduitShopify: nouveaux.length, produitsShopifySansFournisseur: orphelins.length });
      break;
    }
    case 'envoyer':
      afficher(await envoyer({ base: ctx.base, shopify: ctx.shopify() }));
      break;
    case 'passe': {
      const [action, id] = positionnels;
      if (action === 'valider' || action === 'refuser') afficher(trancher(ctx.base, Number(id), action === 'valider'));
      else afficher(ctx.base.fileEnAttente());
      break;
    }
    case 'verrou': {
      const [cle, etat] = positionnels;
      ctx.base.verrouillerPrix(cle, etat !== 'off');
      afficher({ cle, verrouille: etat !== 'off' });
      break;
    }
    case 'fiches': {
      const [action, cle] = positionnels;
      const limite = Number((args.find((a) => a.startsWith('--limite=')) || '--limite=300').split('=')[1]);
      if (action === 'lancer') afficher(await lancerLotFiches(ctx.base, { limite }));
      else if (action === 'recuperer') afficher(await recupererLots(ctx.base));
      else if (action === 'une') afficher(await redigerUne(ctx.base, cle));
      else throw new Error('Usage : fiches lancer [--limite=300] | fiches recuperer | fiches une <cle>');
      break;
    }
    case 'rapport':
      afficher(ctx.base.rapport());
      break;
    default:
      console.log('Commandes : synchro <fournisseur> [--envoyer] [--complet] · import <profil> <fichier> [--envoyer] · relier · envoyer [--a-blanc] · passe [valider|refuser <id>] · verrou <cle> [off] · fiches lancer|recuperer|une · rapport');
  }
} catch (err) {
  console.error(`Erreur : ${err.message}`);
  process.exitCode = 1;
} finally {
  ctx.base.fermer();
}
