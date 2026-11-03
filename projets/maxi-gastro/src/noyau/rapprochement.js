// Noyau « Le Passe » — rapprochement des produits (zéro doublon).
// Partagé entre la démo (navigateur) et le moteur (Node). Aucune dépendance.
//
// Un même article peut arriver par deux fournisseurs (ex. Combisteel et Ecofrost),
// ou exister déjà dans Shopify avec une référence mal saisie (« 15844.0 » au lieu de « 15844 »).
// On calcule une clé stable par produit, on regroupe les offres, puis on garde la meilleure.

/** Vérifie la clé de contrôle d'un GTIN (EAN-8, UPC-12, EAN-13, GTIN-14). */
export function eanValide(code) {
  const s = String(code ?? '').replace(/\s/g, '');
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(s)) return false;
  const chiffres = s.split('').map(Number);
  const controle = chiffres.pop();
  const somme = chiffres.reverse().reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (somme % 10)) % 10 === controle;
}

/**
 * Référence comparable : majuscules, espaces retirés, annotation retirée (« VRX1500380 vitré »),
 * et la trace d'Excel « 15844.0 » → « 15844 ».
 * On garde les points significatifs (« 7223.0505 » chez Combisteel reste tel quel).
 */
export function normaliserRef(ref) {
  let s = String(ref ?? '').trim();
  // Annotation en minuscules après la référence (« VRX1500380 vitré ») : on la retire.
  const mots = s.split(/\s+/);
  if (mots.length > 1 && !/[a-zà-ÿ]/.test(mots[0])) {
    const i = mots.findIndex((m, k) => k > 0 && /[a-zà-ÿ]/.test(m));
    if (i > 0) s = mots.slice(0, i).join(' ');
  }
  s = s.toUpperCase().replace(/\s+/g, '');
  if (/^\d+\.0+$/.test(s)) s = s.replace(/\.0+$/, '');
  return s;
}

const slug = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

/** Clé produit : l'EAN s'il est valide, sinon marque + référence normalisée. */
export function cleProduit({ ean, marque, ref }) {
  if (ean && eanValide(ean)) return `ean:${String(ean).replace(/\s/g, '').padStart(14, '0')}`;
  return `ref:${slug(marque) || 'sans-marque'}:${normaliserRef(ref)}`;
}

/** Score d'une offre : en stock d'abord, puis coût, puis délai. Plus petit = meilleur. */
function rang(o) {
  const dispo = o.statutStock === 'en-stock' || (o.stock ?? 0) > 0 ? 0 : o.statutStock === 'sur-commande' ? 1 : 2;
  const prix = Number.isFinite(o.prixAchatHT) ? o.prixAchatHT : 1e12;
  const delai = Number.isFinite(o.delaiJours) ? o.delaiJours : 999;
  return [dispo, prix, delai];
}

function comparer(a, b) {
  const ra = rang(a);
  const rb = rang(b);
  for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] - rb[i];
  return 0;
}

/**
 * Regroupe les offres de tous les fournisseurs par produit.
 * Renvoie [{ cle, offres: [...], retenue, doublon: bool }].
 */
export function regrouperOffres(offres) {
  const groupes = new Map();
  for (const o of offres) {
    const cle = cleProduit(o);
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle).push(o);
  }
  return [...groupes.entries()].map(([cle, liste]) => {
    const triees = [...liste].sort(comparer);
    return { cle, offres: triees, retenue: triees[0], doublon: liste.length > 1 };
  });
}

/**
 * Relie les produits déjà présents dans Shopify aux offres fournisseurs.
 * shopify = [{ id, sku, barcode, vendor }]. Renvoie { lies: Map(cle → id), orphelins: [...] }.
 */
export function relierShopify(groupes, shopify) {
  const parEan = new Map();
  const parRef = new Map();
  for (const p of shopify) {
    if (p.barcode && eanValide(p.barcode)) parEan.set(cleProduit({ ean: p.barcode }), p);
    if (p.sku) parRef.set(normaliserRef(p.sku), p);
  }
  const lies = new Map();
  const nouveaux = [];
  for (const g of groupes) {
    const trouve = parEan.get(g.cle) || g.offres.map((o) => parRef.get(normaliserRef(o.ref))).find(Boolean);
    if (trouve) lies.set(g.cle, trouve.id);
    else nouveaux.push(g);
  }
  const idsLies = new Set(lies.values());
  const orphelins = shopify.filter((p) => !idsLies.has(p.id));
  return { lies, nouveaux, orphelins };
}
