// Fiches produits rédigées par Claude, par lots de nuit (−50 %) ou une par une.
// Les fiches ne sont jamais publiées directement : elles rejoignent l'élément du passe correspondant,
// avec le résultat des contrôles (chiffres sans source, longueurs SEO).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { lancerLot, recupererLot, rediger } from './claude.js';
import { RACINE } from './contexte.js';

/** Mots-clés Search Console exportés en CSV (requête;clics;impressions…), facultatif : config/mots-cles.csv */
function motsClesPour(designation, liste) {
  if (!designation || !liste.length) return [];
  const mots = designation.toLowerCase().split(/[^a-zà-ÿ0-9]+/).filter((m) => m.length > 3);
  return liste.filter((q) => mots.some((m) => q.includes(m))).slice(0, 12);
}
function chargerMotsCles() {
  const f = join(RACINE, 'config/mots-cles.csv');
  if (!existsSync(f)) return [];
  return readFileSync(f, 'utf8').split(/\r?\n/).slice(1).map((l) => l.split(/[;,\t]/)[0].trim().toLowerCase()).filter(Boolean);
}

function demandesEnAttente(base, limite) {
  const items = base.fileEnAttente().filter((i) => i.type === 'nouveau' && i.cle);
  const liste = chargerMotsCles();
  const demandes = [];
  for (const i of items) {
    const p = base.produit(i.cle);
    if (p?.fiche_ia) continue;
    const offre = base.offresDuProduit(i.cle)[0];
    if (!offre) continue;
    const brut = offre.brut ? JSON.parse(offre.brut) : {};
    const donnees = { fournisseur: offre.fournisseur, reference: offre.ref, designation: offre.designation, marque: offre.marque, ean: offre.ean, poids_kg: offre.poids_kg, dimensions: offre.dimensions, ...nettoyer(brut) };
    demandes.push({ cle: i.cle, idPasse: i.id, donnees, motsCles: motsClesPour(offre.designation, liste), ficheActuelle: '' });
    if (demandes.length >= limite) break;
  }
  return demandes;
}

/** On n'envoie à Claude que des données utiles (pas d'URL d'image ni d'identifiants internes). */
function nettoyer(brut) {
  const out = {};
  for (const [k, v] of Object.entries(brut || {})) {
    if (v === null || v === '' || /image|photo|url|link|apikey/i.test(k)) continue;
    out[k] = v;
  }
  return out;
}

export async function lancerLotFiches(base, { limite = 300 } = {}) {
  const demandes = demandesEnAttente(base, limite);
  if (!demandes.length) return { lance: false, raison: 'aucune fiche à rédiger' };
  const lot = await lancerLot(demandes);
  base.db.prepare('INSERT INTO lots_claude (id, cree_le, statut, nb) VALUES (?, ?, ?, ?)').run(lot.id, new Date().toISOString(), lot.statut, lot.nb);
  base.noter('info', `Lot Claude ${lot.id} lancé (${lot.nb} fiches)`, { type: 'claude' });
  return { lance: true, ...lot };
}

export async function recupererLots(base) {
  const lots = base.db.prepare("SELECT id FROM lots_claude WHERE recupere_le IS NULL").all();
  const bilan = [];
  for (const { id } of lots) {
    const demandes = demandesEnAttente(base, 100000);
    const parCle = new Map(demandes.map((d) => [d.cle, d.donnees]));
    const r = await recupererLot(id, parCle);
    if (!r.termine) {
      bilan.push({ id, termine: false, statut: r.statut });
      continue;
    }
    base.transaction(() => {
      for (const f of r.fiches) enregistrerFiche(base, f.cle, f);
      base.db.prepare('UPDATE lots_claude SET recupere_le = ?, statut = ? WHERE id = ?').run(new Date().toISOString(), 'recupere', id);
    });
    bilan.push({ id, termine: true, fiches: r.fiches.length, erreurs: r.erreurs });
  }
  return bilan;
}

export async function redigerUne(base, cle) {
  const d = demandesEnAttente(base, 100000).find((x) => x.cle === cle);
  if (!d) throw new Error(`Aucun produit en attente de fiche pour ${cle}`);
  const r = await rediger(d);
  enregistrerFiche(base, cle, r);
  return r;
}

function enregistrerFiche(base, cle, { fiche, controles }) {
  base.majProduit(cle, { fiche_ia: JSON.stringify(fiche), titre: fiche.titre });
  const item = base.fileEnAttente().find((i) => i.cle === cle && i.type === 'nouveau');
  const note = controles.publiable
    ? `Fiche rédigée par Claude (confiance ${fiche.confiance}), contrôles OK. À valider.`
    : `Fiche rédigée par Claude, À VÉRIFIER : ${[...controles.orphelins.map((n) => `chiffre sans source « ${n} »`), ...controles.longueurs].join(', ') || `confiance ${fiche.confiance}`}.`;
  if (item) base.ajouterAuPasse({ cle, type: 'nouveau', avant: item.avant, apres: item.apres, raison: `${note} Manque : ${fiche.champs_manquants.map((m) => m.champ).join(', ') || 'rien'}.` });
}
