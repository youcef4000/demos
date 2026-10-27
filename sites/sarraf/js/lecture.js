// Sarraf — lecture simple d'un mémo écrit, sans serveur (secours quand l'analyse n'est pas joignable).
// Comprend les phrases courtes du type « acheté 5000 € à 258 chez Karim, vendu à Samir à 261, reste 30 millions ».
// Le résultat est toujours présenté « à vérifier » : l'analyse par Claude (worker/sarraf.js) reste la référence.

import { cle } from './calcul.js';

const ACHAT = /\b(achet\w*|achat\w*|chrit|ch'rit|chrite?|chrina|acquis|r[ée]cup[ée]r[ée])\b|شريت|شرينا|شرا/i;
const VENTE = /\b(vend\w*|vente\w*|revend\w*|bi3t|ba3t|bi3na|c[ée]d[ée])\b|بعت|بعنا|باع/i;
const DEVISE = [
  [/(€|\beuros?\b|\beur\b|\bdouro\b|أورو|الأورو)/i, 'EUR'],
  [/(\$|\bdollars?\b|\busd\b|دولار)/i, 'USD'],
  [/(£|\blivres?\b|\bgbp\b)/i, 'GBP'],
];
const MOTS = new Set(
  'je j ai et puis le la les un une des du de à a au aux chez avec pour par m3a l b taux prix reste doit il elle lui moi mon ma mes son sa ses ce cette euro euros dinars da millions million mille alf ba9i credit crédit tout payé paye réglé regle demain ghodwa aujourd hui'.split(
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
  const re = /(\d+(?:[\s  ]\d{3})*(?:[.,]\d+)?)\s*(k\b|mille\b|millions?\b|melyoun\b|mlayen\b|milliards?\b|€|euros?\b|eur\b|\$|dollars?\b|da\b|dinars?\b|dzd\b)?/gi;
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

const enDinars = (n) =>
  /^milliard/.test(n.u) ? n.v * 10_000_000 : /^(million|melyoun|mlayen)/.test(n.u) ? n.v * 10_000 : n.v;

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
 * @returns analyse au même format que le serveur
 */
export function lireTexte(texte, connus = []) {
  const doutes = ['Lecture automatique simple (sans serveur) : vérifie chaque ligne.'];
  const ops = [];
  let frais = null;
  const segments = String(texte)
    .split(/[\n.;]+|,(?=\s*(?:et\s+)?(?:j'?ai\s+|on\s+a\s+)?(?:achet|vend|revend|chrit|bi3t|ba3t|frais|commission))|\bpuis\b|\bet\s+(?=(?:j'?ai\s+|on\s+a\s+)?(?:achet|vend|revend|re-?vendu|chrit|bi3t|ba3t))/i)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const seg of segments) {
    const fm = seg.match(/(frais|commission|samsar|transport)\D{0,20}(\d[\d\s.,]*)\s*(millions?|melyoun|da|dinars?)?/i);
    if (fm) {
      const n = nombres(fm[0]).at(0);
      if (n) frais = (frais || 0) + enDinars(n);
    }
    const sens = ACHAT.test(seg) ? 'achat' : VENTE.test(seg) ? 'vente' : null;
    if (!sens) continue;
    const devise = (DEVISE.find(([re]) => re.test(seg)) || [, null])[1];
    const ns = nombres(seg);
    let montant = null;
    let taux = null;
    let reste = null;
    let resteUnite = null;
    const rm = seg.match(/(reste|ba9i|baqi|doit|cr[ée]dit|avance)/i);
    const prec = ops.at(-1);
    for (const n of ns) {
      const avant = seg.slice(Math.max(0, n.i - 14), n.i).toLowerCase();
      if (rm && n.i > rm.index) {
        if (reste == null) {
          const dev = /€|euro|eur|\$|dollar/.test(n.u);
          reste = dev ? n.v : enDinars(n);
          resteUnite = dev ? 'DEVISE' : 'DA';
        }
        continue;
      }
      if (montant == null && /€|euro|eur|\$|dollar/.test(n.u)) {
        montant = n.v;
        continue;
      }
      const sansUnite = !n.u || /da|dinar/.test(n.u);
      const plausible = (n.v >= 80 && n.v <= 1000) || (n.v >= 5000 && n.v <= 100000);
      if (taux == null && sansUnite && plausible && (/(^|\s)(à|a|b|au|taux|prix|@)\s*$/.test(avant) || montant != null || prec?.montant)) {
        taux = n.v >= 5000 && n.v <= 100000 ? n.v / 100 : n.v;
        if (n.v >= 5000) doutes.push(`Taux ${n.brut} compris comme le prix de 100 unités : ${String(taux).replace('.', ',')} DA l’unité.`);
        continue;
      }
      if (montant == null && n.v >= 10 && !/da|dinar|million|melyoun/.test(n.u)) montant = n.v;
    }
    if (montant == null && prec && prec.sens !== sens) {
      montant = prec.montant;
      doutes.push(`Somme de la ${sens} reprise de la ligne précédente (${montant}).`);
    }
    ops.push({
      sens,
      devise: devise || prec?.devise || 'EUR',
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
    frais_da: frais,
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
