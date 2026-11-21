// Données de l'analyse (mesurées le 21/11/2026) : [terme, occurrences site actuel, pages site actuel, occurrences démo, pages démo].
// Site actuel : accueil + 214 pages de catégories de discounthoreca.be. Démo : 78 pages rendues.
const PAGES = { actuel: 215, demo: 78 };
const MOTS = [
  ['HTVA / TVAC', 0, 0, 1793, 78], ['Bruxelles', 0, 0, 91, 78], ['friterie', 1, 1, 273, 78], ['Bancontact', 0, 0, 81, 78],
  ['devis', 0, 0, 8, 5], ['Belgique / belge', 61, 19, 379, 78], ['horeca', 391, 215, 625, 78], ['livraison', 232, 215, 404, 78],
  ['showroom', 219, 215, 413, 78], ['made in Belgium', 934, 215, 320, 78], ['promo / promotion', 1863, 191, 308, 78],
  ['HT / TTC (vocabulaire français)', 4472, 203, 0, 0], ['« Aperçu rapide » (texte de bouton)', 2236, 203, 0, 0],
];
const fr = (n) => new Intl.NumberFormat('fr-BE').format(n);
const pct = (n, t) => Math.round((n / t) * 100);
document.getElementById('barres').innerHTML = MOTS.map(([m, , pa, , pd]) => {
  const a = pct(pa, PAGES.actuel), d = pct(pd, PAGES.demo);
  return `<div class="barre-ligne"><span class="barre-nom">${m}</span><div class="barre-paire">
    <div class="barre" title="Site actuel : ${pa} pages sur ${PAGES.actuel}"><i class="avant" style="width:${Math.max(a, .6)}%"></i><b>${a} %</b></div>
    <div class="barre" title="Démo : ${pd} pages sur ${PAGES.demo}"><i class="apres" style="width:${Math.max(d, .6)}%"></i><b>${d} %</b></div>
  </div></div>`;
}).join('');
document.getElementById('tableau-mots').innerHTML = `<thead><tr><th>Terme</th><th class="num">Site actuel : occurrences</th><th class="num">Pages (sur ${PAGES.actuel})</th><th class="num">Démo : occurrences</th><th class="num">Pages (sur ${PAGES.demo})</th></tr></thead><tbody>${MOTS.map(([m, oa, pa, od, pd]) => `<tr><td>${m}</td><td class="num">${fr(oa)}</td><td class="num">${pa}</td><td class="num">${fr(od)}</td><td class="num">${pd}</td></tr>`).join('')}</tbody>`;
