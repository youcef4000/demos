// Noyau du cabinet — résultat du mois (workflow W7).
// Mémo 2 : « les comptes, on les déroule sur le résultat ; nous, on donne le résultat du mois ».
// Résultat indicatif = produits (classe 7) − charges (classe 6) des écritures VALIDÉES de la période.
// Sans inventaire de fin de mois ni amortissements (hypothèse H11) : c'est un résultat de gestion, pas un bilan.

const GROUPES = [
  { cle: 'ventes', libelle: "Chiffre d'affaires", test: (c) => /^70/.test(c), sens: 1 },
  { cle: 'autresProduits', libelle: 'Autres produits', test: (c) => /^7[1-9]/.test(c), sens: 1 },
  { cle: 'achats', libelle: 'Achats consommés', test: (c) => /^60/.test(c), sens: -1 },
  { cle: 'services', libelle: 'Services extérieurs et autres', test: (c) => /^6[12]/.test(c), sens: -1 },
  { cle: 'personnel', libelle: 'Charges de personnel', test: (c) => /^63/.test(c), sens: -1 },
  { cle: 'impots', libelle: 'Impôts et taxes', test: (c) => /^64/.test(c), sens: -1 },
  { cle: 'autresCharges', libelle: 'Autres charges', test: (c) => /^6[5-9]/.test(c), sens: -1 },
];

export function resultatPeriode(ecritures, periode) {
  const g = Object.fromEntries(GROUPES.map((x) => [x.cle, 0]));
  let n = 0;
  for (const e of ecritures) {
    if (e.periode !== periode || (e.statut !== 'validee' && e.statut !== 'exportee')) continue;
    n++;
    for (const l of e.lignes) {
      const grp = GROUPES.find((x) => x.test(String(l.compte)));
      if (!grp) continue;
      g[grp.cle] += grp.sens > 0 ? (l.credit || 0) - (l.debit || 0) : (l.debit || 0) - (l.credit || 0);
    }
  }
  const produits = g.ventes + g.autresProduits;
  const charges = g.achats + g.services + g.personnel + g.impots + g.autresCharges;
  return { periode, groupes: g, produits, charges, resultat: produits - charges, nbEcritures: n, marge: produits ? Math.round(((produits - charges) / produits) * 1000) / 10 : 0 };
}

export function libellesGroupes() {
  return GROUPES.map(({ cle, libelle, sens }) => ({ cle, libelle, sens }));
}

/** Résultats mois par mois d'un exercice (année civile par défaut) jusqu'à la période donnée incluse. */
export function resultatsExercice(ecritures, jusqua, debut = `${jusqua.slice(0, 4)}-01`) {
  const out = [];
  let [a, m] = debut.split('-').map(Number);
  for (;;) {
    const p = `${a}-${String(m).padStart(2, '0')}`;
    if (p > jusqua) break;
    out.push(resultatPeriode(ecritures, p));
    m++;
    if (m > 12) {
      m = 1;
      a++;
    }
  }
  const cumul = out.reduce((s, r) => ({ produits: s.produits + r.produits, charges: s.charges + r.charges, resultat: s.resultat + r.resultat }), { produits: 0, charges: 0, resultat: 0 });
  return { mois: out, cumul };
}
