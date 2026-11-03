// Noyau « Le Passe » — lecture des fichiers fournisseurs (CSV / export Excel).
import { normaliserRef } from './rapprochement.js';
// Partagé entre la démo (navigateur) et le moteur (Node). Aucune dépendance.
// Pensé pour les fichiers de stock envoyés par mail (Cuistance, etc.) :
// séparateur deviné, guillemets, nombres « à la française », colonnes reconnues par leur nom.

/** Champs standard du Passe et noms de colonnes qu'on reconnaît (FR / EN, avec ou sans accents). */
export const CHAMPS = {
  ref: ['ref', 'reference', 'référence', 'ref fournisseur', 'code article', 'article', 'code', 'sku', 'item', 'item number', 'item no', 'art nr', 'artikel', 'code produit', 'modele', 'modèle', 'model'],
  ean: ['ean', 'ean13', 'gtin', 'code barre', 'code-barre', 'code barres', 'barcode', 'upc'],
  codeFournisseur: ['code', 'code fournisseur', 'code interne', 'code ebp', 'code erp'],
  designation: ['designation', 'désignation', 'libelle', 'libellé', 'nom', 'nom produit', 'produit', 'description courte', 'name', 'title', 'titre'],
  marque: ['marque', 'brand', 'fabricant', 'manufacturer'],
  prixAchat: ['prix achat', "prix d'achat", 'prix net', 'prix revendeur', 'prix ht', 'tarif', 'tarif net', 'net price', 'dealer price', 'cost', 'prix', 'price', 'pa ht', 'prix achat ht'],
  prixConseille: ['prix public', 'ppc', 'prix conseille', 'prix conseillé', 'pvc', 'rrp', 'msrp', 'prix de vente conseille'],
  stock: ['stock', 'qte', 'qté', 'quantite', 'quantité', 'qty', 'quantity', 'stock dispo', 'disponible', 'stock disponible', 'qte dispo'],
  disponibilite: ['disponibilite', 'disponibilité', 'statut', 'etat', 'état', 'availability', 'status'],
  delai: ['delai', 'délai', 'delai livraison', 'délai de livraison', 'lead time', 'delivery time', 'date dispo', 'date de disponibilite', 'arrivage'],
  poids: ['poids', 'poids net', 'poids brut', 'weight', 'net weight', 'gross weight', 'poids kg'],
  dimensions: ['dimensions', 'dimension', 'l x p x h', 'lxpxh', 'encombrement', 'size'],
  categorie: ['categorie', 'catégorie', 'famille', 'gamme', 'category', 'rayon', 'sous famille', 'sous-famille'],
  image: ['image', 'photo', 'url image', 'image url', 'visuel', 'picture'],
  notice: ['notice', 'fiche technique', 'pdf', 'documentation', 'datasheet', 'manuel'],
  observation: ['observation', 'obsevation', 'observations', 'commentaire', 'remarque', 'remarques', 'note'],
};

// Reconnus aussi grâce au titre placé au-dessus de l'en-tête (cellules fusionnées d'Excel).
const ANCIEN = /\b(ancien|ancienne|precedent|precedente|old|previous)\b/;
const PRIX = /\b(prix|tarif|price|net)\b/;

const sansAccent = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
const cleNom = (s) => sansAccent(s).toLowerCase().replace(/[_\-.:/()]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Devine le séparateur à partir des premières lignes (le plus régulier gagne). */
export function devinerSeparateur(texte) {
  const lignes = texte.split(/\r?\n/).filter((l) => l.trim()).slice(0, 10);
  let meilleur = ';';
  let score = -1;
  for (const sep of [';', ',', '\t', '|']) {
    const comptes = lignes.map((l) => decouperLigne(l, sep).length);
    if (comptes[0] < 2) continue;
    const reguliers = comptes.filter((c) => c === comptes[0]).length;
    const s = reguliers * 100 + comptes[0];
    if (s > score) {
      score = s;
      meilleur = sep;
    }
  }
  return meilleur;
}

function decouperLigne(ligne, sep) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < ligne.length; i++) {
    const ch = ligne[i];
    if (q) {
      if (ch === '"' && ligne[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/** Lit un CSV complet (guillemets et retours à la ligne dans les cellules gérés). */
export function lireCSV(texte, separateur) {
  const t = String(texte).replace(/^﻿/, '');
  const sep = separateur || devinerSeparateur(t);
  const lignes = [];
  let ligne = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) {
      if (ch === '"' && t[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') q = false;
      else cur += ch;
      continue;
    }
    if (ch === '"') q = true;
    else if (ch === sep) {
      ligne.push(cur);
      cur = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && t[i + 1] === '\n') i++;
      ligne.push(cur);
      cur = '';
      if (ligne.some((c) => c.trim() !== '')) lignes.push(ligne);
      ligne = [];
    } else cur += ch;
  }
  ligne.push(cur);
  if (ligne.some((c) => c.trim() !== '')) lignes.push(ligne);
  if (!lignes.length) return { separateur: sep, entetes: [], lignes: [] };
  const entetes = lignes[0].map((h) => h.trim());
  return { separateur: sep, entetes, lignes: lignes.slice(1) };
}

/**
 * Associe chaque colonne du fichier à un champ du Passe.
 * Renvoie { mapping: { ref: 0, stock: 3, … }, inconnues: ['Colonne X'], confiance: 0..1 }.
 * Un profil enregistré (ex. cuistance.json) peut forcer certaines colonnes.
 */
export function detecterColonnes(entetes, profil = {}, { titres = [] } = {}) {
  const mapping = {};
  const pris = new Set();
  for (const [champ, nomColonne] of Object.entries(profil)) {
    const idx = entetes.findIndex((h) => cleNom(h) === cleNom(nomColonne));
    if (idx >= 0) {
      mapping[champ] = idx;
      pris.add(idx);
    }
  }
  // 1er passage : égalité exacte ; 2e passage : le nom de colonne contient un synonyme.
  for (const exact of [true, false]) {
    for (const [champ, synonymes] of Object.entries(CHAMPS)) {
      if (champ in mapping) continue;
      const syn = synonymes.map(cleNom).sort((a, b) => b.length - a.length);
      const idx = entetes.findIndex((h, i) => {
        if (pris.has(i)) return false;
        const n = cleNom(h);
        return exact ? syn.includes(n) : syn.some((s) => s.length > 2 && (` ${n} `).includes(` ${s} `));
      });
      if (idx >= 0) {
        mapping[champ] = idx;
        pris.add(idx);
      }
    }
  }
  // Ancien tarif placé à côté du nouveau (deux blocs) : sa propre colonne référence, sous un titre « ancien… ».
  if (!('refPrecedente' in mapping)) {
    const syn = CHAMPS.ref.map(cleNom);
    const idx = entetes.findIndex((h, i) => !pris.has(i) && ANCIEN.test(cleNom(`${titres[i] || ''} ${h}`)) && syn.includes(cleNom(h)));
    if (idx >= 0) {
      mapping.refPrecedente = idx;
      pris.add(idx);
    }
  }
  // Ancien prix : titre ou en-tête « ancien… », et l'en-tête lui-même parle de prix.
  if (!('prixAchatPrecedent' in mapping)) {
    const idx = entetes.findIndex((h, i) => !pris.has(i) && ANCIEN.test(cleNom(`${titres[i] || ''} ${h}`)) && PRIX.test(cleNom(h)));
    if (idx >= 0) {
      mapping.prixAchatPrecedent = idx;
      pris.add(idx);
    }
  }
  if (!('observation' in mapping)) {
    const syn = CHAMPS.observation.map(cleNom);
    const idx = entetes.findIndex((h, i) => !pris.has(i) && !cleNom(h) && syn.includes(cleNom(titres[i] || '')));
    if (idx >= 0) {
      mapping.observation = idx;
      pris.add(idx);
    }
  }
  const inconnues = entetes.filter((h, i) => h && !pris.has(i));
  const essentiels = ['ref', 'stock', 'prixAchat'];
  const confiance = essentiels.filter((c) => c in mapping).length / essentiels.length;
  return { mapping, inconnues, confiance };
}

/** « 1 234,56 € » → 1234.56 ; « 1.234,56 » → 1234.56 ; « 12.5 » → 12.5 ; vide → null */
export function lireNombre(v) {
  if (v === null || v === undefined) return null;
  let s = String(v).replace(/[\s  €$]/g, '').replace(/[a-zA-Z]+$/g, '');
  if (!s) return null;
  if (s.includes(',') && s.includes('.')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (s.includes(',')) s = s.replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Stock lisible : nombre, ou « en stock » / « rupture » / « sur commande ». */
export function lireStock(quantite, disponibilite) {
  const n = lireNombre(quantite);
  if (n !== null) return { quantite: Math.max(0, Math.floor(n)), statut: n > 0 ? 'en-stock' : 'rupture' };
  const d = cleNom(disponibilite || quantite || '');
  if (/(rupture|epuise|indisponible|out of stock|0 dispo)/.test(d)) return { quantite: 0, statut: 'rupture' };
  if (/(sur commande|on order|a commander|arrivage|backorder)/.test(d)) return { quantite: 0, statut: 'sur-commande' };
  if (/(en stock|disponible|in stock|oui|yes)/.test(d)) return { quantite: null, statut: 'en-stock' };
  return { quantite: null, statut: 'inconnu' };
}

/** Transforme les lignes en offres fournisseur normalisées. */
export function lignesVersOffres({ entetes, lignes }, mapping, { fournisseur, marqueParDefaut } = {}) {
  const get = (l, champ) => (champ in mapping ? String(l[mapping[champ]] ?? '').trim() : '');
  const offres = [];
  const erreurs = [];
  // Deux blocs côte à côte (ancien / nouveau tarif) ne sont pas forcément alignés ligne à ligne :
  // l'ancien prix se retrouve par sa référence, jamais par sa position.
  let anciens = null;
  if ('refPrecedente' in mapping && 'prixAchatPrecedent' in mapping) {
    anciens = new Map();
    for (const l of lignes) {
      const r = normaliserRef(get(l, 'refPrecedente'));
      const prix = lireNombre(get(l, 'prixAchatPrecedent'));
      if (r && prix !== null && !anciens.has(r)) anciens.set(r, prix);
    }
  }
  lignes.forEach((l, i) => {
    const ref = get(l, 'ref');
    if (!ref) {
      erreurs.push({ ligne: i + 2, message: 'référence vide' });
      return;
    }
    const stock = lireStock(get(l, 'stock'), get(l, 'disponibilite'));
    offres.push({
      fournisseur,
      ref,
      ean: get(l, 'ean') || null,
      designation: get(l, 'designation') || null,
      marque: get(l, 'marque') || marqueParDefaut || null,
      prixAchatHT: lireNombre(get(l, 'prixAchat')),
      prixConseilleHT: lireNombre(get(l, 'prixConseille')),
      prixAchatPrecedentHT: anciens ? anciens.get(normaliserRef(ref)) ?? null : lireNombre(get(l, 'prixAchatPrecedent')),
      codeFournisseur: get(l, 'codeFournisseur') || null,
      observation: get(l, 'observation') || null,
      stock: stock.quantite,
      statutStock: stock.statut,
      delai: get(l, 'delai') || null,
      poidsKg: lireNombre(get(l, 'poids')),
      dimensions: get(l, 'dimensions') || null,
      categorie: get(l, 'categorie') || null,
      image: get(l, 'image') || null,
      notice: get(l, 'notice') || null,
      ligne: i + 2,
    });
  });
  return { offres, erreurs, colonnes: entetes.length };
}
