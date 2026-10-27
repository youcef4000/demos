// Sarraf — lecture d'un mémo écrit, dans le téléphone, sans serveur.
// Comprend les phrases courtes du type « acheté 5000 € à 258 chez Karim, vendu à Samir à 261, reste 30 millions ».
// Le résultat est toujours présenté « à vérifier » : il relit la fiche avant de la valider.

import { cle } from './calcul.js';

const ACHAT = /\b(achet\w*|achat\w*|chrit|ch'rit|chrite?|chrina|acquis|r[ée]cup[ée]r[ée])\b|شريت|شرينا|شرا/i;
const VENTE = /\b(vend\w*|vente\w*|revend\w*|bi3t|ba3t|bi3na|c[ée]d[ée])\b|بعت|بعنا|باع/i;
const DEVISE = [
  [/(€|\beuros?\b|\beur\b|\bdouro\b|أورو|الأورو)/i, 'EUR'],
  [/(\$|\bdollars?\b|\busd\b|دولار)/i, 'USD'],
  [/(£|\blivres?\b|\bgbp\b)/i, 'GBP'],
];
const MOT_DEVISE = /€|euro|eur|\$|dollar|usd|£|livre|gbp/;
const MOT_MONNAIE = /^(da|dinars?|dzd|dt|tnd|dh|dirhams?|mad|tl|lires?)$/;
const MOTS = new Set(
  'je j ai et puis le la les un une des du de à a au aux chez avec pour par m3a l b taux prix reste doit il elle lui moi mon ma mes son sa ses ce cette euro euros dinars da dt dh millions million mille alf ba9i credit crédit tout payé paye réglé regle demain ghodwa aujourd hui'.split(
    ' ',
  ),
);

const nombre = (s) => {
  const t = String(s).replace(/[\s  ]/g, '');
  // « 258,5 » ou « 258.5 » : virgule décimale ; « 5.000 » ou « 5,000 » : séparateur de milliers
  if (/^\d{1,3}([.,]\d{3})+$/.test(t)) return Number(t.replace(/[.,]/g, ''));
  return Number(t.replace(',', '.'));
};

/** Nombres d'un segment, avec le mot qui suit (unité). */
function nombres(seg) {
  const out = [];
  const re = /(\d+(?:[\s  ]\d{3})*(?:[.,]\d+)?)\s*(k\b|mille\b|millions?\b|melyoun\b|mlayen\b|milliards?\b|€|euros?\b|eur\b|\$|dollars?\b|£|da\b|dinars?\b|dzd\b|dt\b|tnd\b|dh\b|dirhams?\b|mad\b)?/gi;
  let m;
  while ((m = re.exec(seg))) {
    let v = nombre(m[1]);
    const u = (m[2] || '').toLowerCase();
    if (!Number.isFinite(v)) continue;
    if (u === 'k' || u === 'mille') v *= 1000;
    out.push({ v, u, i: m.index, fin: re.lastIndex, brut: m[0].trim() });
  }
  return out;
}

/** « 30 millions » : centimes en Algérie et au Maroc (10 000 DA ou DH), millimes en Tunisie (1 000 DT). */
function enMonnaie(n, monnaie) {
  const parMillion = monnaie === 'TND' ? 1000 : monnaie === 'DZD' || monnaie === 'MAD' ? 10_000 : 1_000_000;
  if (/^milliard/.test(n.u)) return n.v * parMillion * 1000;
  if (/^(million|melyoun|mlayen)/.test(n.u)) return n.v * parMillion;
  return n.v;
}

function trouverContact(seg, connus) {
  const bas = cle(seg);
  for (const nom of connus) {
    const k = cle(nom);
    if (k && new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(bas)) return nom;
  }
  const m = seg.match(/(?:chez|avec|m3a|pour|à|a|de|l|عند|مع)\s+([A-ZÀ-Ýء-ي][\wÀ-ÿ'ء-ي-]+)/u);
  if (m && !MOTS.has(m[1].toLowerCase())) return m[1].charAt(0).toUpperCase() + m[1].slice(1);
  return null;
}

/**
 * @param {string} texte
 * @param {string[]} connus noms des contacts déjà dans le carnet
 * @param {string} monnaie monnaie des prix du mémo (DZD, TND, EUR…)
 * @returns analyse au même format que le serveur
 */
export function lireTexte(texte, connus = [], monnaie = 'DZD') {
  const doutes = ['Fiche remplie automatiquement d’après le texte : vérifie chaque ligne.'];
  const ops = [];
  let frais = null;
  const segments = String(texte)
    .split(/[\n.;]+|,(?=\s*(?:et\s+)?(?:j'?ai\s+|on\s+a\s+)?(?:achet|vend|revend|chrit|bi3t|ba3t|frais|commission))|\bpuis\b|\bet\s+(?=(?:j'?ai\s+|on\s+a\s+)?(?:achet|vend|revend|re-?vendu|chrit|bi3t|ba3t))/i)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const seg of segments) {
    const fm = seg.match(/(frais|commission|samsar|transport)\D{0,20}(\d[\d\s.,]*)\s*(millions?|melyoun|da|dinars?|dt|dh)?/i);
    if (fm) {
      const n = nombres(fm[0]).at(0);
      if (n) frais = (frais || 0) + enMonnaie(n, monnaie);
    }
    const sens = ACHAT.test(seg) ? 'achat' : VENTE.test(seg) ? 'vente' : null;
    if (!sens) continue;
    const prec = ops.at(-1);
    const devise = (DEVISE.find(([re, code]) => code !== monnaie && re.test(seg)) || [, null])[1];
    const ns = nombres(seg);
    let montant = null;
    let taux = null;
    let reste = null;
    let resteUnite = null;
    const rm = seg.match(/(reste|ba9i|baqi|doit|cr[ée]dit|avance)/i);
    for (const n of ns) {
      const avant = seg.slice(Math.max(0, n.i - 14), n.i).toLowerCase();
      if (rm && n.i > rm.index) {
        if (reste == null) {
          const enDevise = MOT_DEVISE.test(n.u);
          reste = enDevise ? n.v : enMonnaie(n, monnaie);
          resteUnite = enDevise ? 'DEVISE' : 'MONNAIE';
        }
        continue;
      }
      if (montant == null && MOT_DEVISE.test(n.u)) {
        montant = n.v;
        continue;
      }
      const sansUnite = !n.u || MOT_MONNAIE.test(n.u);
      const marque = /(^|\s)(à|a|b|au|taux|prix|@)\s*$/.test(avant);
      // En dinars algériens, un taux se dit pour 1 € (≈ 100 à 1 000) ou pour 100 € (≈ 5 000 à 100 000)
      const plausible = monnaie !== 'DZD' || (n.v >= 80 && n.v <= 1000) || (n.v >= 5000 && n.v <= 100000);
      if (taux == null && sansUnite && plausible && (marque || montant != null || prec?.montant)) {
        taux = monnaie === 'DZD' && n.v >= 5000 ? n.v / 100 : n.v;
        if (taux !== n.v) doutes.push(`Taux ${n.brut} compris comme le prix de 100 unités : ${String(taux).replace('.', ',')} pour 1.`);
        continue;
      }
      if (montant == null && n.v >= 10 && !/da|dinar|dt|dh|dirham|million|melyoun/.test(n.u)) montant = n.v;
    }
    if (montant == null && prec && prec.sens !== sens) {
      montant = prec.montant;
      doutes.push(`Somme de la ${sens} reprise de la ligne précédente (${montant}).`);
    }
    ops.push({
      sens,
      devise: devise || prec?.devise || (monnaie === 'EUR' ? 'DZD' : 'EUR'),
      montant,
      taux,
      contact: trouverContact(seg, connus),
      reste,
      reste_unite: resteUnite,
      entendu: seg,
      remarque: null,
    });
  }
  if (!ops.length) doutes.push('Aucune opération reconnue : remplis la fiche à la main.');
  return {
    operations: ops,
    frais,
    frais_note: null,
    echeance: /\b(demain|ghodwa|ghedwa)\b|غدوة/i.test(texte) ? demain() : null,
    resume: '',
    texte_fr: '',
    a_verifier: doutes,
  };
}

function demain() {
  const d = new Date(Date.now() + 86400000);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
