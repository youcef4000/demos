// Sarraf — calculs du carnet : bénéfice de chaque mémo, devises en caisse, prix moyen, soldes des contacts.
// Fonctions pures (aucun accès au DOM ni à la base) : tout est recalculé à partir des mémos à chaque changement.
//
// Chaque mémo se passe dans un pays et ses prix sont dits dans une monnaie (DA en Algérie, DT en Tunisie…).
// Une opération échange une devise contre cette monnaie, au taux « monnaie pour 1 unité de devise ».
// Caisse, prix moyen et bénéfice sont tenus séparément pour chaque paire devise / monnaie (€ contre DA,
// € contre DT…) : on n'additionne jamais des dinars et des dirhams.
//
// Bénéfice d'un mémo, devise par devise :
// - achat et vente dans le même mémo (opération adossée) : la quantité commune rapporte (taux de vente − taux d'achat) ;
// - ce qui reste d'achat entre en caisse au taux payé (prix moyen pondéré, PMP) ;
// - ce qui reste de vente sort de la caisse : bénéfice = (taux de vente − PMP) ;
// - vendre plus que la caisse (à découvert) : le bénéfice sera compté au rachat ;
// - les frais (samsar, transport) sont retirés du bénéfice du mémo.

/** Monnaies et devises : code ISO → symbole et nom. */
export const MONNAIES = {
  DZD: { sym: 'DA', nom: 'dinar algérien' },
  EUR: { sym: '€', nom: 'euro' },
  USD: { sym: '$', nom: 'dollar américain' },
  GBP: { sym: '£', nom: 'livre sterling' },
  CAD: { sym: '$ CA', nom: 'dollar canadien' },
  CHF: { sym: 'CHF', nom: 'franc suisse' },
  TND: { sym: 'DT', nom: 'dinar tunisien' },
  MAD: { sym: 'DH', nom: 'dirham marocain' },
  LYD: { sym: 'LD', nom: 'dinar libyen' },
  EGP: { sym: 'E£', nom: 'livre égyptienne' },
  TRY: { sym: 'TL', nom: 'livre turque' },
  AED: { sym: 'AED', nom: 'dirham des Émirats' },
  SAR: { sym: 'SAR', nom: 'riyal saoudien' },
  QAR: { sym: 'QAR', nom: 'riyal qatari' },
  CNY: { sym: '¥', nom: 'yuan' },
};

/** Pays où il travaille : code ISO → nom, drapeau, monnaie des prix (même liste que server/sarraf.js). */
export const PAYS = {
  DZ: { nom: 'Algérie', drapeau: '🇩🇿', monnaie: 'DZD' },
  TN: { nom: 'Tunisie', drapeau: '🇹🇳', monnaie: 'TND' },
  MA: { nom: 'Maroc', drapeau: '🇲🇦', monnaie: 'MAD' },
  LY: { nom: 'Libye', drapeau: '🇱🇾', monnaie: 'LYD' },
  EG: { nom: 'Égypte', drapeau: '🇪🇬', monnaie: 'EGP' },
  FR: { nom: 'France', drapeau: '🇫🇷', monnaie: 'EUR' },
  ES: { nom: 'Espagne', drapeau: '🇪🇸', monnaie: 'EUR' },
  IT: { nom: 'Italie', drapeau: '🇮🇹', monnaie: 'EUR' },
  BE: { nom: 'Belgique', drapeau: '🇧🇪', monnaie: 'EUR' },
  DE: { nom: 'Allemagne', drapeau: '🇩🇪', monnaie: 'EUR' },
  GB: { nom: 'Royaume-Uni', drapeau: '🇬🇧', monnaie: 'GBP' },
  CH: { nom: 'Suisse', drapeau: '🇨🇭', monnaie: 'CHF' },
  CA: { nom: 'Canada', drapeau: '🇨🇦', monnaie: 'CAD' },
  US: { nom: 'États-Unis', drapeau: '🇺🇸', monnaie: 'USD' },
  TR: { nom: 'Turquie', drapeau: '🇹🇷', monnaie: 'TRY' },
  AE: { nom: 'Émirats arabes unis', drapeau: '🇦🇪', monnaie: 'AED' },
  SA: { nom: 'Arabie saoudite', drapeau: '🇸🇦', monnaie: 'SAR' },
  QA: { nom: 'Qatar', drapeau: '🇶🇦', monnaie: 'QAR' },
  CN: { nom: 'Chine', drapeau: '🇨🇳', monnaie: 'CNY' },
};

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

/**
 * Complète un mémo enregistré avant l'arrivée des pays (tout était en Algérie, en dinars) ;
 * mêmes règles pour un règlement. Modifie l'objet et le renvoie.
 */
export function normaliser(m) {
  if (!PAYS[m.pays]) m.pays = 'DZ';
  if (!MONNAIES[m.monnaie]) m.monnaie = PAYS[m.pays].monnaie;
  if (m.frais == null && m.frais_da != null) m.frais = m.frais_da;
  delete m.frais_da;
  for (const op of m.operations || []) {
    if (!MONNAIES[op.devise]) op.devise = 'EUR';
    if (op.reste_unite === 'DA') op.reste_unite = 'MONNAIE';
  }
  return m;
}
export function normaliserPaiement(p) {
  if (p.unite === 'DA' || !p.unite) p.unite = 'DZD';
  return p;
}

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

/** Unité (code de monnaie) et sens d'un reste à régler : + il me doit, − je lui dois. */
export function dette(op, monnaie = 'DZD') {
  if (!(op.reste > 0)) return null;
  const enDevise = op.reste_unite === 'DEVISE';
  const unite = enDevise ? op.devise || 'EUR' : monnaie;
  // La monnaie va de l'acheteur de devises au vendeur, les devises du vendeur à l'acheteur
  const moiCreancier = (op.sens === 'vente') !== enDevise;
  return { unite, montant: moiCreancier ? op.reste : -op.reste };
}

/** Clé d'une caisse : devise contre monnaie (« EUR/DZD »). */
export const paire = (devise, monnaie) => `${devise}/${monnaie}`;

/**
 * Recalcule tout le carnet.
 * @returns {{ memos: Map, positions: object, contacts: Map }}
 *   memos : id → { profit, monnaie, frais, lignes: [explications], incomplet }
 *   positions : « EUR/DZD » → { devise, monnaie, q, p } (quantité en caisse, prix moyen ; q < 0 = vendu à découvert)
 *   contacts : clé → { nom, ops, paiements, achete, vendu, soldes: { DZD, EUR… }, dernier }
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
    const mon = m.monnaie || 'DZD';
    const r = { profit: 0, monnaie: mon, frais: Number(m.frais) || 0, lignes: [], incomplet: false };
    const parDevise = {};
    for (const op of m.operations || []) {
      const c = op.contact ? contact(op.contact, m.date) : null;
      if (c) c.ops.push({ memo: m, op });
      const d = dette(op, mon);
      if (c && d) c.soldes[d.unite] = (c.soldes[d.unite] || 0) + d.montant;
      if (!complete(op) || op.devise === mon) {
        r.incomplet = true;
        continue;
      }
      const dev = op.devise || 'EUR';
      const g = (parDevise[dev] ||= { B: 0, CB: 0, S: 0, PS: 0 });
      if (op.sens === 'achat') {
        g.B += op.montant;
        g.CB += op.montant * op.taux;
        if (c) cumul(c.achete, paire(dev, mon), op);
      } else {
        g.S += op.montant;
        g.PS += op.montant * op.taux;
        if (c) cumul(c.vendu, paire(dev, mon), op);
      }
    }
    for (const [dev, g] of Object.entries(parDevise)) {
      const pos = (res.positions[paire(dev, mon)] ||= { devise: dev, monnaie: mon, q: 0, p: 0 });
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
    const u = p.unite || 'DZD';
    // « recu » : il m'a payé (ce qu'il me doit baisse) ; « donne » : je lui ai payé (ce que je lui dois baisse)
    c.soldes[u] = (c.soldes[u] || 0) + (p.sens === 'recu' ? -p.montant : p.montant);
  }
  for (const c of res.contacts.values()) for (const u of Object.keys(c.soldes)) c.soldes[u] = arrondi(c.soldes[u]);
  return res;
}

function cumul(t, cleCaisse, op) {
  const x = (t[cleCaisse] ||= { qte: 0, total: 0, n: 0 });
  x.qte += op.montant;
  x.total += op.montant * op.taux;
  x.n += 1;
}

/**
 * Statistiques d'une période [debut, fin[ (dates AAAA-MM-JJ, heure locale du mémo), éventuellement pour un seul pays.
 * Bénéfices et frais par monnaie ; achats et ventes par paire devise / monnaie ; jours : AAAA-MM-JJ → { monnaie: bénéfice }.
 */
export function bilan(memos, calcul, debut, fin, pays = null) {
  const b = { profits: {}, frais: {}, ops: 0, memos: 0, achats: {}, ventes: {}, jours: new Map(), nonVerifies: 0, pays: new Set() };
  for (const m of memos) {
    if (!compte(m)) continue;
    const j = jourLocal(m.date);
    if ((debut && j < debut) || (fin && j >= fin)) continue;
    if (pays && m.pays !== pays) continue;
    const r = calcul.memos.get(m.id);
    if (!r) continue;
    b.memos += 1;
    b.pays.add(m.pays);
    if (m.statut !== 'verifie') b.nonVerifies += 1;
    b.profits[r.monnaie] = (b.profits[r.monnaie] || 0) + r.profit;
    if (r.frais) b.frais[r.monnaie] = (b.frais[r.monnaie] || 0) + r.frais;
    const jour = b.jours.get(j) || {};
    jour[r.monnaie] = (jour[r.monnaie] || 0) + r.profit;
    b.jours.set(j, jour);
    for (const op of m.operations || []) {
      if (!complete(op) || op.devise === r.monnaie) continue;
      b.ops += 1;
      cumul(op.sens === 'achat' ? b.achats : b.ventes, paire(op.devise || 'EUR', r.monnaie), op);
    }
  }
  for (const k of Object.keys(b.profits)) b.profits[k] = arrondi(b.profits[k]);
  return b;
}

/** AAAA-MM-JJ dans le fuseau du téléphone. */
export function jourLocal(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
