// Sarraf — calculs du carnet : bénéfice de chaque mémo, devises en caisse, prix moyen, soldes des contacts.
// Fonctions pures (aucun accès au DOM ni à la base) : tout est recalculé à partir des mémos à chaque changement.
//
// Bénéfice d'un mémo, devise par devise :
// - achat et vente dans le même mémo (opération adossée) : la quantité commune rapporte (taux de vente − taux d'achat) ;
// - ce qui reste d'achat entre en caisse au taux payé (prix moyen pondéré, PMP) ;
// - ce qui reste de vente sort de la caisse : bénéfice = (taux de vente − PMP) ;
// - vendre plus que la caisse (à découvert) : le bénéfice sera compté au rachat ;
// - les frais (samsar, transport) sont retirés du bénéfice du mémo.

export const DEVISES = { EUR: '€', USD: '$', GBP: '£', CAD: '$ CA', CHF: 'CHF', TRY: 'TL', AED: 'AED', SAR: 'SAR', CNY: '¥' };

const EPS = 0.005;
const arrondi = (n) => Math.round(n * 100) / 100;

/** Clé d'un contact : sans accents, sans casse, espaces réduits (« Karim », « karim » et « KARIM » sont la même personne). */
export const cle = (nom) =>
  String(nom || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Mémos qui comptent : analysés (vérifiés ou non), pas en attente ni en erreur. */
export const compte = (m) => m.statut === 'verifie' || m.statut === 'a_verifier';

/** Une ligne est utilisable quand son montant et son taux sont des nombres positifs. */
export const complete = (op) => op.montant > 0 && op.taux > 0;

export const ordre = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.cree < b.cree ? -1 : a.cree > b.cree ? 1 : 0);

function acheter(pos, x, r) {
  let profit = 0;
  let couvert = 0;
  if (pos.q < -EPS) {
    couvert = Math.min(x, -pos.q);
    profit += couvert * (pos.p - r);
    pos.q += couvert;
    x -= couvert;
    if (Math.abs(pos.q) < EPS) pos.q = pos.p = 0;
  }
  if (x > EPS) {
    pos.p = (pos.q * pos.p + x * r) / (pos.q + x);
    pos.q += x;
  }
  return { profit, couvert };
}

function vendre(pos, x, r) {
  let profit = 0;
  let sorti = 0;
  const pmp = pos.p;
  if (pos.q > EPS) {
    sorti = Math.min(x, pos.q);
    profit += sorti * (r - pos.p);
    pos.q -= sorti;
    x -= sorti;
    if (Math.abs(pos.q) < EPS) pos.q = pos.p = 0;
  }
  if (x > EPS) {
    pos.p = (-pos.q * pos.p + x * r) / (-pos.q + x);
    pos.q -= x;
  }
  return { profit, sorti, pmp, decouvert: x > EPS ? x : 0 };
}

/** Unité et sens d'un reste à régler : + il me doit, − je lui dois. */
export function dette(op) {
  if (!(op.reste > 0)) return null;
  const unite = op.reste_unite === 'DEVISE' ? op.devise || 'EUR' : 'DA';
  // Les dinars vont de l'acheteur au vendeur, les devises du vendeur à l'acheteur
  const moiCreancier = (op.sens === 'vente') === (unite === 'DA');
  return { unite, montant: moiCreancier ? op.reste : -op.reste };
}

/**
 * Recalcule tout le carnet.
 * @returns {{ memos: Map, positions: object, contacts: Map }}
 *   memos : id → { profit, frais, lignes: [explications], incomplet }
 *   positions : devise → { q, p } (quantité en caisse, prix moyen ; q < 0 = vendu à découvert)
 *   contacts : clé → { nom, ops, paiements, achete, vendu, soldes: { DA, EUR… }, dernier }
 */
export function calculer(memos, paiements = []) {
  const res = { memos: new Map(), positions: {}, contacts: new Map() };
  const contact = (nom, date) => {
    const k = cle(nom);
    if (!k) return null;
    let c = res.contacts.get(k);
    if (!c) {
      c = { cle: k, nom: String(nom).trim(), ops: [], paiements: [], achete: {}, vendu: {}, soldes: {}, dernier: '' };
      res.contacts.set(k, c);
    }
    if (date >= c.dernier) {
      c.dernier = date;
      // Une saisie tout en minuscules ne remplace pas une orthographe soignée
      const n = String(nom).trim();
      if (n !== n.toLowerCase() || c.nom === c.nom.toLowerCase()) c.nom = n;
    }
    return c;
  };

  for (const m of [...memos].filter(compte).sort(ordre)) {
    const r = { profit: 0, frais: Number(m.frais_da) || 0, lignes: [], incomplet: false };
    const parDevise = {};
    for (const op of m.operations || []) {
      const c = op.contact ? contact(op.contact, m.date) : null;
      if (c) c.ops.push({ memo: m, op });
      const d = dette(op);
      if (c && d) c.soldes[d.unite] = (c.soldes[d.unite] || 0) + d.montant;
      if (!complete(op)) {
        r.incomplet = true;
        continue;
      }
      const dev = op.devise || 'EUR';
      const g = (parDevise[dev] ||= { B: 0, CB: 0, S: 0, PS: 0 });
      if (op.sens === 'achat') {
        g.B += op.montant;
        g.CB += op.montant * op.taux;
        if (c) cumul(c.achete, dev, op);
      } else {
        g.S += op.montant;
        g.PS += op.montant * op.taux;
        if (c) cumul(c.vendu, dev, op);
      }
    }
    for (const [dev, g] of Object.entries(parDevise)) {
      const pos = (res.positions[dev] ||= { q: 0, p: 0 });
      const commun = Math.min(g.B, g.S);
      const rb = g.B ? g.CB / g.B : 0;
      const rs = g.S ? g.PS / g.S : 0;
      if (commun > EPS) {
        const p = commun * (rs - rb);
        r.profit += p;
        r.lignes.push({ type: 'adosse', devise: dev, qte: commun, achat: rb, vente: rs, profit: p });
      }
      if (g.B - commun > EPS) {
        const a = acheter(pos, g.B - commun, rb);
        if (a.couvert > EPS) {
          r.profit += a.profit;
          r.lignes.push({ type: 'rachat', devise: dev, qte: a.couvert, achat: rb, profit: a.profit });
        }
        if (g.B - commun - a.couvert > EPS) r.lignes.push({ type: 'caisse', devise: dev, qte: g.B - commun - a.couvert, achat: rb });
      }
      if (g.S - commun > EPS) {
        const v = vendre(pos, g.S - commun, rs);
        if (v.sorti > EPS) {
          r.profit += v.profit;
          r.lignes.push({ type: 'stock', devise: dev, qte: v.sorti, vente: rs, pmp: v.pmp, profit: v.profit });
        }
        if (v.decouvert > EPS) r.lignes.push({ type: 'decouvert', devise: dev, qte: v.decouvert, vente: rs });
      }
      pos.q = arrondi(pos.q);
    }
    r.profit -= r.frais;
    r.profit = arrondi(r.profit);
    res.memos.set(m.id, r);
  }

  for (const p of [...paiements].sort((a, b) => (a.date < b.date ? -1 : 1))) {
    const c = contact(p.contact, p.date);
    if (!c) continue;
    c.paiements.push(p);
    const u = p.unite || 'DA';
    // « recu » : il m'a payé (ce qu'il me doit baisse) ; « donne » : je lui ai payé (ce que je lui dois baisse)
    c.soldes[u] = (c.soldes[u] || 0) + (p.sens === 'recu' ? -p.montant : p.montant);
  }
  for (const c of res.contacts.values()) for (const u of Object.keys(c.soldes)) c.soldes[u] = arrondi(c.soldes[u]);
  return res;
}

function cumul(t, dev, op) {
  const x = (t[dev] ||= { qte: 0, da: 0, n: 0 });
  x.qte += op.montant;
  x.da += op.montant * op.taux;
  x.n += 1;
}

/** Statistiques d'une période [debut, fin[ (dates ISO AAAA-MM-JJ, heure locale du mémo). */
export function bilan(memos, calcul, debut, fin) {
  const b = { profit: 0, frais: 0, ops: 0, memos: 0, achats: {}, ventes: {}, jours: new Map(), nonVerifies: 0 };
  for (const m of memos) {
    if (!compte(m)) continue;
    const j = jourLocal(m.date);
    if ((debut && j < debut) || (fin && j >= fin)) continue;
    const r = calcul.memos.get(m.id);
    if (!r) continue;
    b.memos += 1;
    if (m.statut !== 'verifie') b.nonVerifies += 1;
    b.profit += r.profit;
    b.frais += r.frais;
    b.jours.set(j, (b.jours.get(j) || 0) + r.profit);
    for (const op of m.operations || []) {
      if (!complete(op)) continue;
      b.ops += 1;
      cumul(op.sens === 'achat' ? b.achats : b.ventes, op.devise || 'EUR', op);
    }
  }
  b.profit = arrondi(b.profit);
  return b;
}

/** AAAA-MM-JJ dans le fuseau du téléphone. */
export function jourLocal(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
