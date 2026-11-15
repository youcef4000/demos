// Données de l'analyse SEO (mesurées le 15/11/2026) : [terme, occurrences site actuel, pages site actuel, occurrences démo, pages démo].
const PAGES = { actuel: 54, demo: 50 };
const MOTS = [
  ['grossiste', 0, 0, 194, 50], ['revendeur(s)', 0, 0, 627, 50], ['en gros / vente en gros', 0, 0, 758, 50],
  ['prix revendeur', 0, 0, 180, 50], ['prix public conseillé', 0, 0, 334, 49], ['palette(s)', 0, 0, 483, 50],
  ['marge', 0, 0, 159, 50], ['déstockage', 0, 0, 214, 50], ['export', 0, 0, 212, 50], ['matériel CHR', 14, 12, 100, 50],
  ['professionnel(le)(s)', 2378, 54, 264, 50], ['restauration', 231, 54, 66, 50], ['petit prix', 3, 1, 0, 0], ['occasion', 3, 1, 0, 0],
  ['Picardie', 13, 3, 0, 0], ['ville du siège', 70, 54, 0, 0], ['Lille', 58, 54, 0, 0], ['favorite / border (texte d’icône)', 3042, 54, 0, 0],
];
const fr = (n) => new Intl.NumberFormat('fr-FR').format(n);
const pct = (n, t) => Math.round((n / t) * 100);
document.getElementById('barres').innerHTML = MOTS.map(([m, , pa, , pd]) => {
  const a = pct(pa, PAGES.actuel), d = pct(pd, PAGES.demo);
  return `<div class="barre-ligne"><span class="barre-nom">${m}</span><div class="barre-paire">
    <div class="barre" title="Site actuel : ${pa} pages sur ${PAGES.actuel}"><i class="avant" style="width:${Math.max(a, .6)}%"></i><b>${a} %</b></div>
    <div class="barre" title="Démo : ${pd} pages sur ${PAGES.demo}"><i class="apres" style="width:${Math.max(d, .6)}%"></i><b>${d} %</b></div>
  </div></div>`;
}).join('');
document.getElementById('tableau-mots').innerHTML = `<thead><tr><th>Terme</th><th class="num">Site actuel : occurrences</th><th class="num">Pages (sur ${PAGES.actuel})</th><th class="num">Démo : occurrences</th><th class="num">Pages (sur ${PAGES.demo})</th></tr></thead><tbody>${MOTS.map(([m, oa, pa, od, pd]) => `<tr><td>${m}</td><td class="num">${fr(oa)}</td><td class="num">${pa}</td><td class="num">${fr(od)}</td><td class="num">${pd}</td></tr>`).join('')}</tbody>`;
