// MC France CHR — plateforme de vente en gros pour revendeurs (application d'une page, routes #/…).
import * as S from './store.js';
import { UNIVERS, FAQ_GROS, ETAPES_GROS } from './univers.js';
import { eur, esc, ic, src, toast, modale, documentCommercial, dateCourte, dateLongue, nombre } from './ui.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const vue = $('#vue');
const BASE = 'https://demos.bornzstudio.com/mc-france-chr/';
const ANIM = 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches;
if (ANIM) document.documentElement.classList.add('anim');

function pref(cle, valeur) {
  try {
    if (valeur === undefined) return localStorage.getItem('mcf.v2.pref.' + cle);
    localStorage.setItem('mcf.v2.pref.' + cle, valeur);
  } catch { /* stockage indisponible */ }
  return valeur;
}

/* ---------- Univers : couleurs, photos, textes ---------- */
function U(slug) {
  const f = S.famille(slug);
  return UNIVERS[slug] || { couleur: '#1a8cd8', pastel: '#e8f3fc', pastille: `Tout l’univers ${f?.nom || ''}`, titre: [f?.nom || '', 'en vente en gros'], intro: f?.description || '', seo: [], faq: [], sous: {} };
}
const styleU = (slug) => `--c:${U(slug).couleur};--p:${U(slug).pastel}`;
const photoU = (slug, petit = false) => (UNIVERS[slug] ? `img/univers/${slug}${petit ? '-640' : ''}.webp` : S.famille(slug)?.image || '');
const produitsDe = (fam, sous) => S.produits().filter((p) => p.famille === fam && (!sous || p.sous === sous));
const nbMarques = (ps) => new Set(ps.map((p) => p.marque).filter(Boolean)).size;
const prixMin = (ps) => (ps.length ? Math.min(...ps.map((p) => (S.prixVisibles() ? S.prixRevendeur(p) : S.ppc(p)))) : 0);
const libellePrixMin = () => (S.prixVisibles() ? 'HT revendeur' : 'HT prix public');

/* ---------- SEO par page ---------- */
function seo({ titre, description, ld }) {
  document.title = titre;
  let d = description || '';
  if (d.length > 155) d = d.slice(0, d.lastIndexOf(' ', 150)) + '…';
  $('meta[name=description]').setAttribute('content', d);
  $('#jsonld-page').textContent = ld ? JSON.stringify({ '@context': 'https://schema.org', ...ld }) : '';
}
function titreSeo(...variantes) { return variantes.find((t) => t.length <= 62) || variantes[variantes.length - 1]; }
function fil(liens) {
  const ld = { '@type': 'BreadcrumbList', itemListElement: [['Accueil', '#/'], ...liens].map(([n, h], i) => ({ '@type': 'ListItem', position: i + 1, name: n, ...(h ? { item: BASE + h } : {}) })) };
  return {
    html: `<nav class="fil" aria-label="Fil d'Ariane"><a href="#/">Accueil</a>${liens.map(([t, h]) => `${ic('right')}${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}`).join('')}</nav>`,
    ld,
  };
}
const faqLd = (liste) => ({ '@type': 'FAQPage', mainEntity: liste.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) });

/* ---------- Petits morceaux d'interface ---------- */
function dispo(p) {
  const arr = S.arrivage(p);
  if (p.stock >= S.colisage(p) * 3) return `<span class="stock stock-ok">En stock · ${p.stock} u. à Roubaix</span>`;
  if (p.stock > 0) return `<span class="stock stock-bas">Stock limité · ${p.stock} u.</span>`;
  return `<span class="stock stock-non">Arrivage le ${dateCourte(arr).slice(0, 5)} · réservable</span>`;
}
function conditionnement(p) {
  const c = S.colisage(p);
  return `<div class="carte-conditionnement"><span>${c > 1 ? `Lot de ${c}` : 'À l’unité'}</span><span>Palette : ${S.parPalette(p)} u.</span></div>`;
}
function badges(p) {
  const r = S.remiseDestockage(p);
  return `<div class="carte-badges">${p.etat === 'second-choix' ? '<span class="pastille p-sc">Second choix</span>' : ''}${r ? `<span class="pastille p-promo">Déstockage −${r} %</span>` : ''}${p.nouveau ? '<span class="pastille p-nouveau">Nouveau</span>' : ''}${p.stock <= 0 ? '<span class="pastille p-bleu">Arrivage</span>' : ''}</div>`;
}
function qteHtml(p, valeur, cle = '') {
  const c = S.colisage(p);
  return `<div class="qte"><button type="button" data-moins aria-label="Un lot de moins">${ic('minus')}</button><input name="qte" type="number" inputmode="numeric" min="${c}" step="${c}" max="9999" value="${valeur ?? c}" data-pas="${c}" aria-label="Quantité en unités" ${cle ? `data-cle="${cle}"` : ''}><button type="button" data-plus aria-label="Un lot de plus">${ic('plus')}</button></div>`;
}
function carte(p, i = 0) {
  const vis = S.prixVisibles();
  const favs = S.favoris();
  const c = S.colisage(p);
  let prix;
  if (vis) {
    const pu = S.prixUnitaire(p, c);
    const barre = S.prixRevendeurBarre(p);
    const m = S.marge(p, pu.unit);
    prix = `<div class="carte-prix">
        <div class="carte-prix-l"><strong class="prix">${eur(pu.unit)}<small>HT</small></strong>${barre ? `<s>${eur(barre)}</s>` : ''}</div>
        <div class="carte-prix-sous"><span>PPC ${eur(S.ppc(p))}</span><span>Marge <b>${m.taux} %</b></span></div>
      </div>
      <div class="carte-achat" data-achat>${qteHtml(p)}<button class="btn btn-plein" type="button" data-ajouter="${p.id}" aria-label="Ajouter ${esc(p.nom)} au panier">${ic('cart')}<span>Ajouter</span></button></div>`;
  } else {
    prix = `<div class="carte-verrou">
        <p class="carte-verrou-ppc">Prix public conseillé<br><strong>${eur(S.ppc(p))}</strong> HT</p>
        <p class="carte-verrou-flou">${ic('lock')}Votre prix : compte pro</p>
        <button class="btn btn-sombre" type="button" data-voir-prix>${ic('unlock')}Voir mon prix</button>
      </div>`;
  }
  return `<article class="carte rv" style="--i:${i % 8}">
    <a class="carte-img" href="#/p/${p.id}" tabindex="-1" aria-hidden="true"><img src="${src(p.images[0])}" alt="" loading="lazy" width="300" height="300"></a>
    ${badges(p)}
    <button class="carte-fav" type="button" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}" aria-label="Ajouter aux favoris">${ic('heart')}</button>
    <div class="carte-corps">
      <p class="carte-marque">${esc(p.marque || '')}</p>
      <h3 class="carte-nom"><a href="#/p/${p.id}">${esc(p.nom)}</a></h3>
      <p class="carte-ref">Réf. ${esc(p.ref)}</p>
      ${conditionnement(p)}
      ${p.etat === 'second-choix' ? `<p class="carte-sc">${esc(p.defaut || '')}</p>` : dispo(p)}
      ${prix}
    </div>
  </article>`;
}
function jauges(t) {
  const r = S.reglages();
  const pctMin = Math.min(100, (t.ht / r.minimumCommande) * 100);
  const pctFranco = Math.min(100, (t.ht / r.francoPalette) * 100);
  return `<div class="jauge ${t.manqueMinimum > 0 ? 'alerte' : 'ok'}"><p>${t.manqueMinimum > 0 ? `Minimum de commande : encore <strong>${eur(t.manqueMinimum)} HT</strong>` : `<strong>Minimum de commande atteint</strong> (${eur(r.minimumCommande)} HT)`}</p><div class="jauge-barre"><i style="width:${pctMin.toFixed(1)}%"></i></div></div>
    <div class="jauge ${t.resteFranco <= 0 ? 'ok' : ''}"><p>${t.resteFranco > 0 ? `Livraison offerte dans <strong>${eur(t.resteFranco)} HT</strong>` : `<strong>Livraison offerte</strong> : franco de ${eur(r.francoPalette)} HT atteint`}</p><div class="jauge-barre"><i style="width:${pctFranco.toFixed(1)}%"></i></div></div>`;
}
function palierSuivant(p, qte) {
  const pal = S.paliersDe(p).find((x) => x.min > qte);
  if (!pal) return '';
  const u = S.prixUnitaire(p, pal.min).unit;
  return `<div class="info-bulle">${ic('tag')}<span>Passez à <strong>${pal.min} unités</strong> (${pal.libelle}) : <strong>${eur(u)} HT</strong> l'unité (−${pal.remise} %).</span></div>`;
}
function rendre(html) { vue.innerHTML = html; }
function imprimer(html) { $('#zone-impression').innerHTML = html; window.print(); }

/* ---------- Animations ---------- */
let io = null;
function animer() {
  const cibles = $$('.rv:not(.vu), .rv-zoom:not(.vu), [data-compte]:not([data-fait])', vue);
  if (!ANIM) { cibles.forEach((el) => { el.classList.add('vu'); if (el.dataset.compte) { el.textContent = nombre(+el.dataset.compte) + (el.dataset.suffixe || ''); el.dataset.fait = 1; } }); return; }
  io = io || new IntersectionObserver((entrees) => entrees.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    io.unobserve(el);
    el.classList.add('vu');
    if (el.dataset.compte && !el.dataset.fait) compter(el);
  }), { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  cibles.forEach((el) => io.observe(el));
}
function compter(el) {
  el.dataset.fait = 1;
  const fin = +el.dataset.compte, suff = el.dataset.suffixe || '', t0 = performance.now(), d = 1200;
  const pas = (t) => {
    const k = Math.min(1, (t - t0) / d);
    el.textContent = nombre(Math.round(fin * (1 - Math.pow(1 - k, 3)))) + suff;
    if (k < 1) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}
function voler(img) {
  const cible = matchMedia('(max-width: 1080px)').matches ? $('#barre-onglets [data-onglet=panier]') : $('#lien-panier');
  if (!ANIM || !img || !cible) return;
  const a = img.getBoundingClientRect(), b = cible.getBoundingClientRect();
  if (!a.width) return;
  const c = img.cloneNode();
  Object.assign(c.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', zIndex: 95, pointerEvents: 'none', objectFit: 'contain', borderRadius: '16px', background: '#fff' });
  document.body.append(c);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  c.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: .4 }], { duration: 700, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => c.remove();
}

/* ---------- En-tête, navigation, pied ---------- */
function construireNavigation() {
  const fams = S.familles();
  $('#nav-familles').innerHTML = fams.map((f) => {
    const ps = produitsDe(f.slug);
    return `<div class="nav-fam" style="${styleU(f.slug)}">
      <a href="#/c/${f.slug}">${ic(f.icone)}${esc(f.court || f.nom)}</a>
      <div class="nav-mega"><div class="conteneur nav-mega-l">
        <div class="nav-mega-photo"><img src="${src(photoU(f.slug, true))}" alt="" loading="lazy" width="320" height="230"><h3>${esc(f.nom)}</h3><p>${ps.length} références · ${f.sous.length} catégories</p><a class="btn btn-petit" href="#/c/${f.slug}">Tout l’univers ${ic('arrow')}</a></div>
        <div class="nav-mega-sous">${f.sous.map((s) => `<a href="#/c/${f.slug}/${s.slug}"><img src="${src(s.image || f.image)}" alt="" loading="lazy" width="150" height="112">${esc(s.nom)}<small>${produitsDe(f.slug, s.slug).length} réf.</small></a>`).join('')}</div>
      </div></div>
    </div>`;
  }).join('') + `<div class="nav-speciaux"><a class="nav-destock" href="#/destockage">Déstockage</a><a class="nav-revendeur" href="#/revendeurs">Devenir revendeur</a></div>`;
  $('#tiroir-corps').innerHTML = fams.map((f) => `<details>
      <summary><img src="${src(photoU(f.slug, true))}" alt="" width="44" height="44" loading="lazy">${esc(f.nom)}${ic('down')}</summary>
      <div class="tiroir-sous"><a href="#/c/${f.slug}"><strong>Tout l’univers</strong></a>${f.sous.map((s) => `<a href="#/c/${f.slug}/${s.slug}">${esc(s.nom)}</a>`).join('')}</div>
    </details>`).join('') + `<div class="tiroir-liens">
      <a href="#/catalogue">${ic('grid')}Tout le catalogue</a>
      <a href="#/revendeurs">${ic('tag')}Devenir revendeur</a>
      <a href="#/destockage">${ic('percent')}Déstockage et second choix</a>
      <a href="#/commande-rapide">${ic('zap')}Commande rapide</a>
      <a href="#/suivi">${ic('truck')}Suivre une commande</a>
      <a href="admin/" target="_blank" rel="noopener">${ic('settings')}Espace admin (démo)</a>
      <a href="analyse-seo.html">${ic('chart')}Analyse SEO</a>
    </div>`;
  $('#pied-familles').innerHTML = fams.map((f) => `<li><a href="#/c/${f.slug}">${esc(f.nom)} en gros</a></li>`).join('');
  $('#pied-reassurance').innerHTML = reassurance().map(([i, t, d]) => `<div>${ic(i)}<p><strong>${t}</strong><span>${d}</span></p></div>`).join('');
  const nbSous = fams.reduce((s, f) => s + f.sous.length, 0);
  const cat = $('.action-catalogue small'); if (cat) cat.textContent = `${nbSous} catégories`;
}
function reassurance() {
  const r = S.reglages();
  return [
    ['euro', 'Prix revendeur + PPC', 'Votre marge affichée sur chaque fiche'],
    ['pallet', 'Lots et palettes', `−${r.remise3lots} % dès 3 lots, −${r.remisePalette} % à la palette`],
    ['label', 'Livraison directe', 'Chez votre client, sous étiquette neutre'],
    ['globe', 'France, Belgique, export', `Franco dès ${nombre(r.francoPalette)} € HT`],
  ];
}
function majEntete() {
  const n = S.nbLignes();
  [$('#panier-nb'), $('#panier-nb-mobile')].forEach((b) => { b.hidden = n === 0; b.textContent = n; });
  const t = S.calculer(S.panier());
  $('#panier-total').textContent = n && S.prixVisibles() ? eur(t.ht) : 'Panier';
  const c = S.clientConnecte();
  $('#libelle-compte').innerHTML = c ? `${esc(c.societe.length > 18 ? c.societe.slice(0, 17) + '…' : c.societe)}<small>${c.statut === 'valide' ? `Niveau ${S.niveau(c).nom}` : 'Compte en validation'}</small>` : 'Espace revendeur<small>Se connecter</small>';
  $('#bandeau-msg').textContent = S.reglages().bandeau;
}
function majOnglets(chemin) {
  const seg = chemin.split('/')[0];
  const actif = { '': '', catalogue: 'catalogue', c: 'catalogue', p: 'catalogue', compte: 'compte', panier: 'panier', commande: 'panier' }[seg];
  $$('#barre-onglets [data-onglet]').forEach((a) => (a.dataset.onglet === actif ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
}

/* ---------- Accès aux prix ---------- */
async function ouvrirAcces() {
  const r = await modale({
    titre: 'Prix revendeur : accès pro',
    corps: `<div class="acces-demo"><strong>${ic('sparkle')} Démo : compte revendeur en un clic</strong><span class="petit">« Nordéquip Pro », grossiste à Lille, compte validé niveau Gold (−5 %), paiement à 30 jours.</span></div>
      <label class="champ"><span>Déjà revendeur ? Votre e-mail</span><input name="email" type="email" autocomplete="email" placeholder="vous@societe.fr"></label>
      <p class="petit muet">Pas encore de compte ? L’ouverture prend deux minutes ; nous validons sous 24 h ouvrées.</p>`,
    actions: [{ id: 'inscription', libelle: 'Ouvrir un compte' }, { id: 'login', libelle: 'Se connecter' }, { id: 'demo', libelle: 'Accès démo', classe: 'btn-plein' }],
  });
  if (r.action === 'demo') { S.connecter('demo'); toast(`${ic('unlock')} Prix revendeur affichés · Nordéquip Pro (Gold)`); }
  else if (r.action === 'login') {
    const cl = S.clients().find((x) => S.norm(x.email) === S.norm(r.donnees.email));
    if (!cl) { toast('Aucun compte avec cet e-mail. Essayez demo@exemple.fr.', 'erreur'); return; }
    S.connecter(cl.id); toast(`${ic('check')} Connecté : ${esc(cl.societe)}`);
  } else if (r.action === 'inscription') location.hash = '#/compte?inscription=1';
}

/* ---------- Recherche instantanée ---------- */
let suggActif = -1;
function suggestions(q, boite) {
  const bureau = boite.id === 'suggestions';
  if (q.trim().length < 2) { boite.hidden = bureau; boite.innerHTML = bureau ? '' : suggestionsVides(); return; }
  const res = S.rechercher(q, 6);
  const n = S.norm(q);
  const cats = [];
  S.familles().forEach((f) => { if (S.norm(f.nom).includes(n)) cats.push([f.nom, `#/c/${f.slug}`]); f.sous.forEach((s) => { if (S.norm(s.nom).includes(n)) cats.push([s.nom, `#/c/${f.slug}/${s.slug}`]); }); });
  const vis = S.prixVisibles();
  boite.innerHTML = (cats.length ? `<p class="sugg-titre">Catégories</p><div class="sugg-cat">${cats.slice(0, 6).map(([t, h]) => `<a href="${h}">${esc(t)}</a>`).join('')}</div>` : '')
    + (res.length ? `<p class="sugg-titre">Produits</p>${res.map((p) => `<a class="sugg-prod" href="#/p/${p.id}"><img src="${src(p.images[0])}" alt="" width="52" height="52"><span>${esc(p.nom)}<small>Réf. ${esc(p.ref)} · ${esc(p.marque || '')}</small></span><strong>${vis ? eur(S.prixUnitaire(p).unit) : 'PPC ' + eur(S.ppc(p))}</strong></a>`).join('')}<a class="sugg-tout" href="#/recherche/${encodeURIComponent(q)}">Voir tous les résultats pour « ${esc(q)} »</a>`
      : `<p class="sugg-vide">Aucun produit pour « ${esc(q)} ». Essayez une référence ou appelez le 03 20 77 59 04.</p>`);
  boite.hidden = false;
  suggActif = -1;
}
function suggestionsVides() {
  return `<p class="sugg-titre">Univers</p><div class="sugg-cat">${S.familles().map((f) => `<a href="#/c/${f.slug}">${esc(f.nom)}</a>`).join('')}</div>`;
}

/* ---------- Panier volant ---------- */
let dernierFocus = null;
function ouvrirVolant(id) {
  const p = S.produit(id);
  const t = S.calculer(S.panier());
  const l = t.lignes.find((x) => x.id === id);
  if (!p || !l) return;
  $('#volant-boite').innerHTML = `
    <header class="volant-tete"><h2 id="volant-titre">${ic('check')}Ajouté au panier</h2><button class="btn-icone" type="button" data-fermer-volant aria-label="Fermer">${ic('x')}</button></header>
    <div class="volant-produit"><img src="${src(p.images[0])}" alt="" width="88" height="88"><div>
      <h3>${esc(p.nom)}</h3>
      <p class="petit muet">Réf. ${esc(p.ref)} · ${l.qte} unités dans le panier</p>
      <p class="petit"><strong>${eur(l.unit)} HT</strong> l'unité · PPC ${eur(l.ppc)} ${l.remisePalier ? `<span class="pastille p-vert">−${l.remisePalier} % volume</span>` : ''}</p>
    </div></div>
    <div class="volant-corps">${jauges(t)}${palierSuivant(p, l.qte)}
      <div class="info-bulle vert">${ic('trend')}<span>Marge estimée sur ce panier, au prix public conseillé : <strong>${eur(t.margeEstimee)} HT</strong>.</span></div>
    </div>
    <footer class="volant-pied">
      <div class="volant-ligne"><span>Panier · ${S.nbLignes()} référence${S.nbLignes() > 1 ? 's' : ''}</span><strong>${eur(t.ht)} HT</strong></div>
      <a class="btn btn-orange btn-grand" href="#/panier" data-fermer-volant>Voir le panier</a>
      <button class="btn" type="button" data-fermer-volant>Continuer mes achats</button>
    </footer>`;
  const v = $('#volant');
  if (v.hidden) dernierFocus = document.activeElement;
  v.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#volant-boite [data-fermer-volant]').focus();
}
function fermerVolant() { if ($('#volant').hidden) return; $('#volant').hidden = true; document.body.style.overflow = ''; dernierFocus?.focus?.(); }

/* ---------- Métiers (packs) ---------- */
const METIERS = [
  { slug: 'pizzeria', nom: 'Pack pizzeria', icone: 'pizza', desc: 'Four, pétrin, saladette, façonneuse.', sous: ['fours-a-pizza', 'petrins', 'saladettes-a-pizza', 'faconneuses'] },
  { slug: 'snack', nom: 'Pack snack', icone: 'burger', desc: 'Friteuse, chauffe-frites, kebab, salamandre.', sous: ['friteuses', 'chauffe-frites', 'kebab', 'grills-salamandres'] },
  { slug: 'boulangerie', nom: 'Pack boulangerie', icone: 'store', desc: 'Pétrin, vitrine, batteur, plonge.', sous: ['petrins', 'vitrines-refrigerees', 'batteurs-blenders', 'plonges'] },
  { slug: 'bar', nom: 'Pack bar & café', icone: 'cup', desc: 'Lave-verres, glaçons, armoire, granita.', sous: ['lave-verres', 'machines-a-glacons', 'armoires-refrigerees', 'machines-a-granita'] },
];
function packDe(m) {
  return m.sous.map((s) => S.produits().filter((p) => p.sous === s && p.etat === 'neuf' && p.stock > 0).sort((a, b) => a.prixHT - b.prixHT)[0]).filter(Boolean);
}

/* ---------- Accueil ---------- */
function vueAccueil() {
  const ps = S.produits();
  const fams = S.familles();
  const r = S.reglages();
  const vis = S.prixVisibles();
  const vedette = S.produit('7950-5320') || ps.find((p) => p.stock > 0);
  const destock = ps.filter((p) => S.remiseDestockage(p) > 0).sort((a, b) => S.remiseDestockage(b) - S.remiseDestockage(a));
  const sc = ps.filter((p) => p.etat === 'second-choix');
  const nouveaux = ps.filter((p) => p.nouveau && p.etat === 'neuf');
  const nbSous = fams.reduce((s, f) => s + f.sous.length, 0);
  const marques = S.marques();
  const simu = ['7950-5320', 'gasxl3l', '7062-0100', 'ibm10', '7487-0120', 'wr-lb40-mc', '7487-0125', '7085-0035'].map(S.produit).filter(Boolean);
  const simuListe = simu.length >= 4 ? simu : ps.filter((p) => p.stock > 0 && p.etat === 'neuf').slice(0, 8);
  const pv = vedette ? S.prixUnitaire(vedette, S.colisage(vedette)) : null;
  seo({
    titre: 'Grossiste matériel CHR pour revendeurs | MC France CHR',
    description: 'Grossiste en matériel CHR depuis 2013 : froid, cuisson, pizza, inox, laverie. Prix revendeur, prix public conseillé, lots et palettes, France et export.',
    ld: { '@graph': [faqLd(FAQ_GROS)] },
  });
  rendre(`
  <section class="hero">
    <div class="conteneur hero-l">
      <div>
        <span class="pill rv" style="--c:var(--orange)">Plateforme de vente en gros · réservée aux pros</span>
        <h1 class="rv" style="--i:1">Le grossiste du matériel CHR <span class="surligne" style="--c:#1a8cd8">pour les revendeurs</span></h1>
        <p class="hero-chapo rv" style="--i:2">Froid, cuisson, pizza, inox, laverie : ${ps.length} références prêtes à revendre, avec le <strong>prix revendeur</strong>, le <strong>prix public conseillé</strong> et <strong>votre marge</strong> sur chaque fiche. Lots, palettes, livraison directe chez vos clients sous étiquette neutre.</p>
        <div class="hero-actions rv" style="--i:3">
          <a class="btn btn-orange btn-grand" href="#/compte?inscription=1">Ouvrir un compte revendeur ${ic('arrow')}</a>
          <a class="btn btn-grand" href="#/catalogue">${ic('grid')}Voir le catalogue</a>
        </div>
        ${vis ? `<p class="hero-demo rv" style="--i:4">${ic('unlock')}Prix revendeur affichés pour <strong>${esc(S.clientConnecte().societe)}</strong>.</p>` : `<p class="hero-demo rv" style="--i:4">${ic('lock')}Prix revendeur réservés aux comptes validés. <button type="button" data-voir-prix>Accès démo en un clic</button></p>`}
      </div>
      <div class="hero-visuel rv-zoom">
        <div class="hero-photo"><img src="img/univers/accueil.webp" alt="Entrepôt de matériel de cuisine professionnelle, palettes prêtes à partir" width="1344" height="752" fetchpriority="high"></div>
        ${vedette ? `<a class="flottante flottante-prix" href="#/p/${vedette.id}"><img src="${src(vedette.images[0])}" alt="" width="58" height="58"><small>${vis ? 'Votre prix revendeur' : 'Prix public conseillé'}</small><strong>${eur(vis ? pv.unit : S.ppc(vedette))} HT</strong><span>${vis ? `PPC ${eur(S.ppc(vedette))}` : 'Prix revendeur : compte pro'}</span></a>` : ''}
        <div class="flottante flottante-marge"><small>Marge revendeur</small><strong>${r.remiseRevendeur} %</strong><span class="petit muet">sur le prix public conseillé</span></div>
        <div class="flottante flottante-etiquette">${ic('label')}<span>Livraison directe<br>sous étiquette neutre</span></div>
      </div>
    </div>
    <div class="conteneur" style="padding-bottom:56px">
      <div class="stats" style="margin-top:0">
        <div class="stat rv"><strong data-compte="${ps.length}">${ps.length}</strong><span>Références en vente en gros</span></div>
        <div class="stat rv" style="--i:1;--c:#1a8cd8"><strong data-compte="${nbSous}">${nbSous}</strong><span>Catégories, 9 univers</span></div>
        <div class="stat rv" style="--i:2;--c:#138a4f"><strong data-compte="${marques.length}">${marques.length}</strong><span>Marques professionnelles</span></div>
        <div class="stat rv" style="--i:3;--c:#7a5af8"><strong>2013</strong><span>Au service des pros du CHR</span></div>
      </div>
    </div>
  </section>

  <div class="marques" aria-label="Marques du catalogue"><div class="marques-l">${[...marques, ...marques].map((m, i) => `<span ${i >= marques.length ? 'aria-hidden="true"' : ''}>${esc(m)}</span>`).join('')}</div></div>

  <section class="section conteneur" id="univers">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--bleu)">Le catalogue en gros</span><h2 class="rv" style="margin-top:14px">Neuf univers, <span class="surligne">${nbSous} catégories</span></h2><p class="rv">Chaque univers a sa sélection, ses prix dégressifs et ses fiches techniques complètes.</p></div><a class="rv" href="#/catalogue">Tout le catalogue ${ic('arrow')}</a></div>
    <div class="univers-grille">
      ${fams.map((f, i) => { const pf = produitsDe(f.slug); return `<a class="carte-univers rv" href="#/c/${f.slug}" style="${styleU(f.slug)};--i:${i % 3}">
        <div class="carte-univers-photo"><img src="${src(photoU(f.slug, true))}" alt="" loading="lazy" width="640" height="358"><span class="carte-univers-nb">${pf.length} réf. · dès ${eur(prixMin(pf))}</span><span class="carte-univers-fleche">${ic('arrow')}</span></div>
        <div class="carte-univers-txt"><h3>${esc(f.nom)}</h3><div class="carte-univers-sous">${f.sous.slice(0, 4).map((s) => `<span>${esc(s.nom)}</span>`).join('')}${f.sous.length > 4 ? `<span>+${f.sous.length - 4}</span>` : ''}</div></div>
      </a>`; }).join('')}
    </div>
  </section>

  <section class="section conteneur" style="padding-top:0">
    <div class="section-titre"><div><span class="pill rv">Pourquoi MC France CHR</span><h2 class="rv" style="margin-top:14px">Pensé pour <span class="surligne" style="--c:var(--orange)">ceux qui revendent</span></h2></div></div>
    <div class="atouts">
      ${[['euro', '#1a8cd8', '#e8f3fc', 'Prix revendeur et PPC', `Le prix revendeur, le prix public conseillé et votre marge sur chaque fiche. Base : ${r.remiseRevendeur} % sous le prix public, plus la remise de votre niveau.`],
    ['pallet', '#f0612a', '#fdeee6', 'Lots, palettes, conteneurs', `Colisage clair par référence, −${r.remise3lots} % dès 3 lots et −${r.remisePalette} % à la palette. Conteneurs export sur devis.`],
    ['label', '#138a4f', '#e2f5ea', 'Livraison chez votre client', 'Expédition directe sous étiquette neutre, sans prix ni document MC France : vous gardez la relation client.'],
    ['download', '#7a5af8', '#efebfe', 'Fiches et photos à reprendre', 'Exportez références, caractéristiques et photos pour alimenter votre boutique en ligne en quelques minutes.']]
    .map(([i, c, p, t, d], k) => `<div class="atout rv" style="--c:${c};--p:${p};--i:${k}">${ic(i)}<h3>${t}</h3><p>${d}</p></div>`).join('')}
    </div>
  </section>

  <section class="section conteneur" style="padding-top:0">
    <div class="simulateur rv-zoom" id="simulateur">
      <div class="simu-gauche">
        <span class="pill" style="--c:var(--jaune)">Simulateur de marge</span>
        <h2>Combien gagnez-vous sur chaque vente ?</h2>
        <p>Choisissez un produit et une quantité : prix revendeur, palier de volume et marge au prix public conseillé, calculés en direct.</p>
        <label class="champ"><span>Produit</span><select class="saisie" id="simu-produit">${simuListe.map((p) => `<option value="${p.id}">${esc(p.nom)}</option>`).join('')}</select></label>
        <label class="champ"><span id="simu-qte-l">Quantité</span><input type="range" id="simu-qte" min="1" max="20" value="3"></label>
      </div>
      <div class="simu-droite" id="simu-resultat"></div>
    </div>
  </section>

  <section class="section conteneur" style="padding-top:0">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--vert)">Comment ça marche</span><h2 class="rv" style="margin-top:14px">De l’ouverture du compte à la palette</h2></div><a class="rv" href="#/revendeurs">Conditions revendeurs ${ic('arrow')}</a></div>
    <div class="etapes">${ETAPES_GROS.map(([t, d], i) => `<div class="etape-gros rv" style="--i:${i};--c:${['#1a8cd8', '#138a4f', '#f0612a', '#7a5af8'][i]}"><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
  </section>

  ${destock.length || sc.length ? `<section class="section conteneur" style="padding-top:0">
    <div class="destock rv-zoom">
      <div>
        <span class="pill">Tout l’univers du déstockage</span>
        <h2>Revendez malin avec le <span class="surligne" style="--c:var(--orange)">déstockage</span></h2>
        <p>Fins de série, prix publics en baisse et second choix contrôlé : les meilleures affaires du catalogue, en quantités limitées.</p>
        <div class="stats">
          <div class="stat"><strong data-compte="${destock.length + sc.length}">${destock.length + sc.length}</strong><span>Références en déstockage</span></div>
          <div class="stat" style="--c:#138a4f"><strong>−${destock.length ? S.remiseDestockage(destock[0]) : 25}<small> %</small></strong><span>Jusqu’à, sur le prix habituel</span></div>
        </div>
        <a class="btn btn-sombre" href="#/destockage">Voir le déstockage ${ic('arrow')}</a>
      </div>
      <div class="rangee">${[...destock.slice(0, 6), ...sc.slice(0, 3)].map(carte).join('')}</div>
    </div>
  </section>` : ''}

  <section class="section conteneur" style="padding-top:0">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--bleu)">Packs prêts à revendre</span><h2 class="rv" style="margin-top:14px">Équiper un métier en une commande</h2><p class="rv">Une pièce par poste, la moins chère en stock : idéal pour répondre vite à un client qui ouvre.</p></div></div>
    <div class="metiers">${METIERS.map((m, i) => { const pk = packDe(m); const tot = pk.reduce((s, p) => s + (vis ? S.prixRevendeur(p) : S.ppc(p)), 0); return `<article class="metier rv" style="--i:${i}">
      <div class="metier-tete">${ic(m.icone)}<div><h3>${esc(m.nom)}</h3><p>${esc(m.desc)}</p></div></div>
      <div class="metier-imgs">${pk.map((p) => `<img src="${src(p.images[0])}" alt="${esc(p.nom)}" loading="lazy" width="80" height="80">`).join('')}</div>
      <p class="petit">${pk.length} équipements · <strong>${eur(tot)} HT</strong> ${vis ? 'revendeur' : 'prix public'}</p>
      <a class="btn" href="#/metier/${m.slug}">Voir le pack ${ic('arrow')}</a>
    </article>`; }).join('')}</div>
  </section>

  <section class="engagement">
    <div class="conteneur engagement-l">
      <figure class="engagement-photo rv-zoom"><img src="img/univers/entrepot.webp" alt="Chariot élévateur chargeant une palette de matériel de cuisine dans un camion" loading="lazy" width="896" height="1120"><figcaption>Entrepôt de Roubaix</figcaption></figure>
      <div>
        <div class="guillemets rv" aria-hidden="true">”</div>
        <blockquote class="rv">Choisir MC France CHR, c’est opter pour <em>la qualité et l’expertise</em> : des marques reconnues, une équipe qui vous conseille et un service après-vente réactif.</blockquote>
        <cite class="rv">MC France CHR, Roubaix — extrait de la présentation de l’entreprise</cite>
        <div class="stats">
          <div class="stat rv"><strong>2013</strong><span>Création</span></div>
          <div class="stat rv" style="--i:1;--c:var(--jaune)"><strong>1–3 j</strong><span>Expédition du stock</span></div>
          <div class="stat rv" style="--i:2;--c:#7ff0b3"><strong>FR · BE</strong><span>+ export sur devis</span></div>
          <div class="stat rv" style="--i:3;--c:#9cc9ff"><strong>SAV</strong><span>Pièces et réparation</span></div>
        </div>
      </div>
    </div>
  </section>

  ${nouveaux.length ? `<section class="section conteneur">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--bleu)">Arrivages</span><h2 class="rv" style="margin-top:14px">Nouveautés du catalogue</h2></div><a class="rv" href="#/catalogue">Tout voir ${ic('arrow')}</a></div>
    <div class="rangee">${nouveaux.slice(0, 10).map(carte).join('')}</div>
  </section>` : ''}

  <section class="section conteneur">
    <div class="texte-seo">
      <div class="texte-seo-corps rv">
        <span class="pill" style="--c:var(--bleu)">Grossiste CHR à Roubaix</span>
        <h2>Grossiste en matériel CHR pour les revendeurs, installateurs et distributeurs</h2>
        <p>MC France CHR est un grossiste en matériel de restauration professionnelle installé à Roubaix depuis 2013. Nous fournissons en gros les revendeurs en magasin, les e-commerçants, les cuisinistes et installateurs, les centrales d’achat et les clients export : froid commercial, cuisson, pizza et boulangerie, préparation et boucherie, snack, café et bar, laverie, mobilier inox et ventilation.</p>
        <p>Chaque référence est proposée au <strong>prix revendeur HT</strong>, avec le <strong>prix public conseillé</strong> pour calculer votre marge, un colisage par lot et un prix dégressif à la palette. La livraison se fait en France, en Belgique et à l’export, chez vous ou directement chez votre client final sous étiquette neutre.</p>
      </div>
      <div class="faq rv">${FAQ_GROS.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    </div>
  </section>

  <section class="conteneur" style="padding-bottom:20px">
    <div class="appel rv-zoom"><div><h2>Prêt à revendre le catalogue MC France ?</h2><p>Compte revendeur en deux minutes, validation sous 24 h ouvrées, prix revendeur sur tout le catalogue.</p></div><a class="btn btn-jaune btn-grand" href="#/compte?inscription=1">Ouvrir mon compte ${ic('arrow')}</a></div>
  </section>`);
  brancherSimulateur();
}
function brancherSimulateur() {
  const sel = $('#simu-produit'), rg = $('#simu-qte');
  if (!sel) return;
  const maj = () => {
    const p = S.produit(sel.value);
    const c = S.colisage(p);
    rg.max = Math.max(3, Math.ceil(S.parPalette(p) / c));
    const lots = Math.min(+rg.value, +rg.max);
    const q = lots * c;
    $('#simu-qte-l').textContent = `Quantité : ${lots} lot${lots > 1 ? 's' : ''} de ${c} = ${q} unités`;
    const vis = S.prixVisibles();
    const pu = S.prixUnitaire(p, q, vis ? undefined : { statut: 'valide', niveau: 'revendeur' });
    const m = S.marge(p, pu.unit);
    const cache = (v) => (vis ? v : '•••');
    $('#simu-resultat').innerHTML = `<div class="simu-produit"><img src="${src(p.images[0])}" alt="" width="84" height="84"><div><strong>${esc(p.nom)}</strong><span class="petit" style="color:#9fb0c3">Réf. ${esc(p.ref)} · palette de ${S.parPalette(p)}</span></div></div>
      <div class="simu-chiffres">
        <div><span>Prix revendeur unitaire</span><strong>${cache(eur(pu.unit))}</strong></div>
        <div><span>Prix public conseillé</span><strong>${eur(S.ppc(p))}</strong></div>
        <div><span>Palier de volume</span><strong>${pu.remisePalier ? `−${pu.remisePalier} %` : '—'}</strong></div>
        <div><span>Coefficient</span><strong>× ${m.coef.toLocaleString('fr-FR')}</strong></div>
        <div class="grand"><span>Votre marge sur ${q} unités (${m.taux} %)</span><strong>${cache(eur(m.montant * q))}</strong></div>
      </div>
      ${vis ? `<a class="btn btn-jaune" href="#/p/${p.id}">Voir la fiche ${ic('arrow')}</a>` : `<button class="btn btn-jaune" type="button" data-voir-prix>${ic('unlock')}Voir les montants avec l’accès démo</button>`}`;
  };
  sel.addEventListener('change', maj);
  rg.addEventListener('input', maj);
  maj();
}

/* ---------- Catalogue (liste des univers) ---------- */
function vueCatalogue() {
  const fams = S.familles();
  const f0 = fil([['Catalogue']]);
  seo({ titre: 'Catalogue matériel CHR en gros | MC France CHR', description: `Tout le catalogue en gros : ${fams.map((f) => f.nom.toLowerCase()).join(', ')}. Prix revendeur HT, lots et palettes.`, ld: f0.ld });
  rendre(`<div class="conteneur">${f0.html}
    <header class="section-titre" style="margin-top:8px"><div><span class="pill rv">Tout le catalogue</span><h1 class="page-titre rv" style="margin:14px 0 0">Le catalogue <span class="surligne">en gros</span></h1><p class="rv">${S.produits().length} références dans ${fams.reduce((s, f) => s + f.sous.length, 0)} catégories, au prix revendeur.</p></div></header>
    <div class="cat-liste">${fams.map((f, i) => { const pf = produitsDe(f.slug); return `<section class="cat-carte rv" style="${styleU(f.slug)};--i:${i % 2}">
      <a class="cat-carte-tete" href="#/c/${f.slug}"><img src="${src(photoU(f.slug, true))}" alt="" width="74" height="74" loading="lazy"><div><h2>${esc(f.nom)}</h2><p>${pf.length} références · ${nbMarques(pf)} marques</p></div>${ic('arrow')}</a>
      <ul>${f.sous.map((s) => `<li><a href="#/c/${f.slug}/${s.slug}"><span>${esc(s.nom)}</span><small>${produitsDe(f.slug, s.slug).length} réf. ${ic('right')}</small></a></li>`).join('')}</ul>
    </section>`; }).join('')}</div></div>`);
}

/* ---------- Listes avec filtres ---------- */
let filtres = null, cleFiltres = '';
function monterListe(el, { cle, base, sousFamilles = null, titre = '' }) {
  if (cleFiltres !== cle) {
    filtres = { marques: new Set(), sous: new Set(), min: '', max: '', stock: false, destock: false, sc: false, tri: pref('tri') || 'pertinence', limite: 24 };
    cleFiltres = cle;
  }
  const modeVue = pref('vue') === 'liste' ? 'liste' : 'grille';
  const marques = [...new Set(base.map((p) => p.marque).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  const compte = (f) => base.filter(f).length;
  const prixDe = (p) => (S.prixVisibles() ? S.prixUnitaire(p).unit : S.ppc(p));
  el.innerHTML = `${titre}
  <div class="catalogue">
    <aside class="filtres" id="filtres" aria-label="Filtres">
      <div class="filtres-tete"><h2>Filtrer</h2><button class="btn-icone" type="button" data-fermer-filtres aria-label="Fermer">${ic('x')}</button></div>
      ${sousFamilles && sousFamilles.length > 1 ? `<div class="filtre"><h3>Catégorie</h3>${sousFamilles.map((s) => `<label class="case"><input type="checkbox" name="sous" value="${s.slug}" ${filtres.sous.has(s.slug) ? 'checked' : ''}><span>${esc(s.nom)}</span><small>${compte((p) => p.sous === s.slug)}</small></label>`).join('')}</div>` : ''}
      <div class="filtre"><h3>Disponibilité et offres</h3>
        <label class="case"><input type="checkbox" name="stock" ${filtres.stock ? 'checked' : ''}><span>En stock à Roubaix</span><small>${compte((p) => p.stock > 0)}</small></label>
        <label class="case"><input type="checkbox" name="destock" ${filtres.destock ? 'checked' : ''}><span>Déstockage</span><small>${compte((p) => S.remiseDestockage(p) > 0)}</small></label>
        <label class="case"><input type="checkbox" name="sc" ${filtres.sc ? 'checked' : ''}><span>Second choix</span><small>${compte((p) => p.etat === 'second-choix')}</small></label>
      </div>
      <div class="filtre"><h3>${S.prixVisibles() ? 'Prix revendeur HT' : 'Prix public HT'}</h3>
        <div class="filtre-prix"><input class="saisie" type="number" name="min" min="0" placeholder="Min" value="${filtres.min}" inputmode="numeric" aria-label="Prix minimum"><span>–</span><input class="saisie" type="number" name="max" min="0" placeholder="Max" value="${filtres.max}" inputmode="numeric" aria-label="Prix maximum"></div>
      </div>
      ${marques.length > 1 ? `<div class="filtre"><h3>Marque</h3>${marques.map((m) => `<label class="case"><input type="checkbox" name="marque" value="${esc(m)}" ${filtres.marques.has(m) ? 'checked' : ''}><span>${esc(m)}</span><small>${compte((p) => p.marque === m)}</small></label>`).join('')}</div>` : ''}
      <button class="btn btn-plein btn-grand filtres-valider" type="button" data-fermer-filtres id="filtres-valider">Voir les produits</button>
    </aside>
    <div>
      <div class="barre-outils">
        <p class="nb" id="liste-nb"></p>
        <button class="btn btn-filtres" type="button" data-ouvrir-filtres>${ic('filter')}Filtrer</button>
        <label class="sr" for="tri">Trier</label>
        <select id="tri">${[['pertinence', 'Pertinence'], ['prix-asc', 'Prix croissant'], ['prix-desc', 'Prix décroissant'], ['marge', 'Meilleure marge'], ['destock', 'Plus forte baisse'], ['nouveau', 'Nouveautés'], ['nom', 'Nom A → Z']].map(([v, t]) => `<option value="${v}" ${filtres.tri === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <div class="vue-bascule" role="group" aria-label="Affichage"><button type="button" data-vue="grille" aria-pressed="${modeVue === 'grille'}" aria-label="Grille">${ic('grid')}</button><button type="button" data-vue="liste" aria-pressed="${modeVue === 'liste'}" aria-label="Liste">${ic('list')}</button></div>
      </div>
      <div class="filtres-actifs" id="filtres-actifs"></div>
      <div class="grille-produits ${modeVue === 'liste' ? 'en-liste' : ''}" id="liste"></div>
      <div class="voir-plus" id="voir-plus"></div>
    </div>
  </div>`;
  const majListe = () => {
    let l = base.filter((p) => (!filtres.sous.size || filtres.sous.has(p.sous)) && (!filtres.marques.size || filtres.marques.has(p.marque))
      && (!filtres.stock || p.stock > 0) && (!filtres.destock || S.remiseDestockage(p) > 0) && (!filtres.sc || p.etat === 'second-choix')
      && (filtres.min === '' || prixDe(p) >= +filtres.min) && (filtres.max === '' || prixDe(p) <= +filtres.max));
    const tri = {
      'prix-asc': (a, b) => prixDe(a) - prixDe(b), 'prix-desc': (a, b) => prixDe(b) - prixDe(a),
      marge: (a, b) => S.ppc(b) - S.prixUnitaire(b).unit - (S.ppc(a) - S.prixUnitaire(a).unit),
      destock: (a, b) => S.remiseDestockage(b) - S.remiseDestockage(a), nouveau: (a, b) => (b.ajoute || '').localeCompare(a.ajoute || ''), nom: (a, b) => a.nom.localeCompare(b.nom, 'fr'),
    }[filtres.tri];
    l = l.slice().sort(tri || ((a, b) => (b.stock > 0) - (a.stock > 0)));
    $('#liste-nb', el).textContent = `${l.length} produit${l.length > 1 ? 's' : ''}`;
    $('#filtres-valider', el).textContent = `Voir les ${l.length} produits`;
    $('#liste', el).innerHTML = l.length ? l.slice(0, filtres.limite).map(carte).join('') : `<div class="vide" style="grid-column:1/-1">${ic('search')}<h2>Aucun produit avec ces filtres</h2><p class="muet">Retirez un filtre ou appelez-nous : d’autres références sont disponibles sur demande.</p><button class="btn" type="button" data-effacer-filtres>Effacer les filtres</button></div>`;
    $('#voir-plus', el).innerHTML = l.length > filtres.limite ? `<button class="btn btn-sombre" type="button" data-voir-plus>Voir plus (${l.length - filtres.limite} restants)</button>` : '';
    const actifs = [
      ...[...filtres.sous].map((s) => [`sous:${s}`, sousFamilles?.find((x) => x.slug === s)?.nom || s]), ...[...filtres.marques].map((m) => [`marque:${m}`, m]),
      ...(filtres.stock ? [['stock', 'En stock']] : []), ...(filtres.destock ? [['destock', 'Déstockage']] : []), ...(filtres.sc ? [['sc', 'Second choix']] : []),
      ...(filtres.min !== '' ? [['min', `Dès ${eur(filtres.min)}`]] : []), ...(filtres.max !== '' ? [['max', `Jusqu’à ${eur(filtres.max)}`]] : []),
    ];
    $('#filtres-actifs', el).innerHTML = actifs.map(([k, t]) => `<button type="button" data-retirer="${esc(k)}">${esc(t)}${ic('x')}</button>`).join('');
    animer();
  };
  const f = $('#filtres', el);
  f.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'marque') t.checked ? filtres.marques.add(t.value) : filtres.marques.delete(t.value);
    else if (t.name === 'sous') t.checked ? filtres.sous.add(t.value) : filtres.sous.delete(t.value);
    else if (['stock', 'destock', 'sc'].includes(t.name)) filtres[t.name] = t.checked;
    else if (['min', 'max'].includes(t.name)) filtres[t.name] = t.value;
    filtres.limite = 24;
    majListe();
  });
  f.addEventListener('input', (e) => { if (['min', 'max'].includes(e.target.name)) { filtres[e.target.name] = e.target.value; majListe(); } });
  $('#tri', el).addEventListener('change', (e) => { filtres.tri = e.target.value; pref('tri', e.target.value); majListe(); });
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-vue],[data-voir-plus],[data-retirer],[data-effacer-filtres],[data-ouvrir-filtres],[data-fermer-filtres]');
    if (!b) return;
    if (b.dataset.vue) { pref('vue', b.dataset.vue); $$('[data-vue]', el).forEach((x) => x.setAttribute('aria-pressed', x === b)); $('#liste', el).classList.toggle('en-liste', b.dataset.vue === 'liste'); }
    if (b.hasAttribute('data-voir-plus')) { filtres.limite += 24; majListe(); }
    if (b.hasAttribute('data-ouvrir-filtres')) f.classList.add('ouvert');
    if (b.hasAttribute('data-fermer-filtres')) f.classList.remove('ouvert');
    if (b.hasAttribute('data-effacer-filtres')) { cleFiltres = ''; router(); }
    if (b.dataset.retirer) {
      const [k, v] = b.dataset.retirer.split(/:(.*)/s);
      if (k === 'marque') filtres.marques.delete(v); else if (k === 'sous') filtres.sous.delete(v); else if (k === 'min' || k === 'max') filtres[k] = ''; else filtres[k] = false;
      const champ = k === 'marque' || k === 'sous' ? f.querySelector(`input[name="${k}"][value="${CSS.escape(v)}"]`) : f.querySelector(`input[name="${k}"]`);
      if (champ) { if (champ.type === 'checkbox') champ.checked = false; else champ.value = ''; }
      majListe();
    }
  });
  majListe();
}

/* ---------- Univers ---------- */
function vueUnivers(fam) {
  const f = S.famille(fam);
  if (!f) return vueIntrouvable();
  const u = U(fam);
  const ps = produitsDe(fam);
  const f0 = fil([['Catalogue', '#/catalogue'], [f.nom]]);
  seo({
    titre: titreSeo(`${f.nom} en gros pour revendeurs | MC France CHR`, `${f.nom} en gros | MC France CHR`, `${f.court} en gros | MC France CHR`),
    description: u.intro,
    ld: { '@graph': [f0.ld, { '@type': 'CollectionPage', name: `${f.nom} en gros`, description: u.intro, url: `${BASE}#/c/${fam}` }, ...(u.faq.length ? [faqLd(u.faq)] : [])] },
  });
  rendre(`<section class="hero-univers" style="${styleU(fam)}">
      <div class="conteneur">${f0.html}</div>
      <div class="conteneur hero-univers-l">
        <div>
          <span class="pill rv" style="--c:${u.couleur}">${esc(u.pastille)}</span>
          <h1 class="rv" style="--i:1">${esc(u.titre[0])}<br><span class="surligne" style="--c:${u.couleur}">${esc(u.titre[1])}</span></h1>
          <p class="hero-univers-intro rv" style="--i:2">${esc(u.intro)}</p>
          <div class="stats">
            <div class="stat rv" style="--c:${u.couleur}"><strong data-compte="${f.sous.length}">${f.sous.length}</strong><span>Sous-catégories</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:1"><strong data-compte="${ps.length}">${ps.length}</strong><span>Références</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:2"><strong data-compte="${nbMarques(ps)}">${nbMarques(ps)}</strong><span>Marques expertes</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:3"><strong>${eur(prixMin(ps)).replace(/,00\s€/, ' €')}</strong><span>Dès, ${libellePrixMin()}</span></div>
          </div>
        </div>
        <figure class="hero-univers-photo rv-zoom"><img src="${src(photoU(fam))}" alt="${esc(f.nom)} : équipement de cuisine professionnelle" width="1344" height="752"><figcaption>Illustration</figcaption></figure>
      </div>
    </section>
    <section class="section conteneur" style="${styleU(fam)}">
      <div class="section-titre"><div><span class="pill rv" style="--c:${u.couleur}">${f.sous.length} catégories</span><h2 class="rv" style="margin-top:14px">Choisissez votre <span class="surligne" style="--c:${u.couleur}">catégorie</span></h2></div></div>
      <div class="sous-grille">${f.sous.map((s, i) => { const pss = produitsDe(fam, s.slug); return `<a class="carte-sous rv" href="#/c/${fam}/${s.slug}" style="--i:${i % 3};--p:${i % 2 ? u.pastel : `color-mix(in srgb, ${u.couleur} 16%, #fff)`}">
        <span class="carte-sous-num">${String(i + 1).padStart(2, '0')}</span><span class="carte-sous-fleche">${ic('arrow')}</span>
        <span class="carte-sous-img"><img src="${src(s.image || f.image)}" alt="" loading="lazy" width="220" height="160"></span>
        <span><h3>${esc(s.nom)}</h3><p><b>${pss.length} réf.</b> · dès ${eur(prixMin(pss))} ${S.prixVisibles() ? 'HT' : 'PPC'}</p></span>
      </a>`; }).join('')}</div>
    </section>
    <section class="conteneur" id="zone-liste"></section>
    <section class="section conteneur">
      <div class="texte-seo">
        <div class="texte-seo-corps rv"><h2>${esc(f.nom)} en gros : le matériel CHR au prix revendeur</h2>${u.seo.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        <div class="faq rv">${[...u.faq, ...FAQ_GROS.slice(1, 3)].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      </div>
    </section>`);
  monterListe($('#zone-liste'), { cle: 'u/' + fam, base: ps, sousFamilles: f.sous, titre: `<div class="section-titre"><div><span class="pill rv" style="--c:${u.couleur}">La sélection</span><h2 class="rv" style="margin-top:14px">Tous les produits ${esc(f.nom.toLowerCase())}</h2></div></div>` });
}
function vueSous(fam, sous) {
  const f = S.famille(fam);
  const sf = f?.sous.find((s) => s.slug === sous);
  if (!sf) return vueIntrouvable();
  const u = U(fam);
  const ps = produitsDe(fam, sous);
  const texte = u.sous[sous] || `${sf.nom} en vente en gros pour les revendeurs, au prix revendeur HT.`;
  const f0 = fil([['Catalogue', '#/catalogue'], [f.nom, `#/c/${fam}`], [sf.nom]]);
  const vitrine = ps.slice().sort((a, b) => b.images.length - a.images.length || b.prixHT - a.prixHT)[0];
  seo({
    titre: titreSeo(`${sf.nom} en gros, prix revendeur | MC France CHR`, `${sf.nom} en gros | MC France CHR`, `${sf.nom} | Grossiste MC France CHR`),
    description: texte,
    ld: { '@graph': [f0.ld, { '@type': 'CollectionPage', name: `${sf.nom} en gros`, description: texte, url: `${BASE}#/c/${fam}/${sous}`, mainEntity: { '@type': 'ItemList', numberOfItems: ps.length, itemListElement: ps.slice(0, 20).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${BASE}#/p/${p.id}`, name: p.nom })) } }] },
  });
  rendre(`<section class="hero-univers" style="${styleU(fam)}">
      <div class="conteneur">${f0.html}</div>
      <div class="conteneur hero-univers-l" style="padding-bottom:30px">
        <div>
          <span class="pill rv" style="--c:${u.couleur}">${esc(f.nom)}</span>
          <h1 class="rv" style="--i:1">${esc(sf.nom)} <span class="surligne" style="--c:${u.couleur}">en gros</span></h1>
          <p class="hero-univers-intro rv" style="--i:2">${esc(texte)} Colisage, prix dégressifs et marge indiqués sur chaque fiche.</p>
          <div class="stats">
            <div class="stat rv" style="--c:${u.couleur}"><strong data-compte="${ps.length}">${ps.length}</strong><span>Références</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:1"><strong data-compte="${nbMarques(ps)}">${nbMarques(ps)}</strong><span>Marques</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:2"><strong>${eur(prixMin(ps)).replace(/,00\s€/, ' €')}</strong><span>Dès, ${libellePrixMin()}</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:3"><strong data-compte="${ps.filter((p) => p.stock > 0).length}">${ps.filter((p) => p.stock > 0).length}</strong><span>En stock à Roubaix</span></div>
          </div>
        </div>
        ${vitrine ? `<div class="hero-sous-photo rv-zoom"><img src="${src(vitrine.images[0])}" alt="${esc(sf.nom)} professionnel en gros" width="520" height="520"></div>` : ''}
      </div>
      <div class="conteneur"><nav class="mini-sous" aria-label="Autres catégories ${esc(f.nom)}">${f.sous.map((s, i) => `<a href="#/c/${fam}/${s.slug}" ${s.slug === sous ? 'aria-current="page"' : ''}><img src="${src(s.image || f.image)}" alt="" width="44" height="44" loading="lazy"><b>${String(i + 1).padStart(2, '0')}</b>${esc(s.nom)}</a>`).join('')}</nav></div>
    </section>
    <section class="conteneur" id="zone-liste" style="padding-top:28px"></section>
    <section class="section conteneur">
      <div class="texte-seo">
        <div class="texte-seo-corps rv"><h2>${esc(sf.nom)} : matériel CHR en vente en gros</h2><p>${esc(texte)}</p>${u.seo.slice(0, 1).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        <div class="faq rv">${[...u.faq, FAQ_GROS[2]].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      </div>
    </section>`);
  monterListe($('#zone-liste'), { cle: `s/${fam}/${sous}`, base: ps });
}
function vueRecherche(q) {
  const res = S.rechercher(q, 500);
  $('#q').value = q;
  const fams = [...new Set(res.map((p) => p.famille))];
  seo({ titre: `« ${q} » en gros | MC France CHR`, description: `Résultats pour ${q} : prix revendeur, colisage et stock.` });
  rendre(`<div class="conteneur">${fil([['Recherche'], [q]]).html}<h1 class="page-titre">« ${esc(q)} » <span class="muet" style="font-size:.5em">${res.length} résultat${res.length > 1 ? 's' : ''}</span></h1></div><section class="conteneur" id="zone-liste"></section>`);
  monterListe($('#zone-liste'), { cle: 'r/' + q, base: res, sousFamilles: fams.length === 1 ? S.famille(fams[0]).sous : null });
}
function vueDestockage() {
  const base = S.produits().filter((p) => S.remiseDestockage(p) > 0 || p.etat === 'second-choix');
  seo({ titre: 'Déstockage matériel CHR en gros | MC France CHR', description: 'Fins de série, prix publics en baisse et second choix contrôlé : le déstockage de matériel CHR au prix revendeur.' });
  rendre(`<section class="hero-univers" style="--c:#f0612a;--p:#fdeee6"><div class="conteneur">${fil([['Déstockage']]).html}</div>
    <div class="conteneur" style="padding-bottom:36px"><span class="pill rv">Tout l’univers du déstockage</span>
      <h1 class="rv" style="--i:1">Revendez malin avec le <span class="surligne" style="--c:#f0612a">déstockage</span></h1>
      <p class="hero-univers-intro rv" style="--i:2">Fins de série et prix publics en baisse (relevés sur la boutique actuelle de MC France), et second choix contrôlé : matériel neuf déclassé pour un défaut d’aspect, même garantie. <em>Les articles second choix et leurs défauts sont des exemples.</em></p>
    </div></section><section class="conteneur" id="zone-liste" style="padding-top:28px"></section>`);
  monterListe($('#zone-liste'), { cle: 'destock', base });
}

/* ---------- Fiche produit ---------- */
function vueProduit(id) {
  const p = S.produit(id);
  if (!p || p.enLigne === false) return vueIntrouvable();
  S.marquerVu(id);
  const f = S.famille(p.famille), sf = S.sousFamille(p.famille, p.sous);
  const vis = S.prixVisibles(), c = S.colisage(p), pal = S.paliersDe(p), r = S.reglages();
  const memes = S.produits().filter((x) => x.sous === p.sous && x.id !== p.id).slice(0, 10);
  const favs = S.favoris();
  const arr = S.arrivage(p);
  const f0 = fil([[f?.nom || '', `#/c/${p.famille}`], [sf?.nom || '', `#/c/${p.famille}/${p.sous}`], [p.nom]]);
  seo({
    titre: titreSeo(`${p.nom} – prix revendeur | MC France CHR`, `${p.nom.slice(0, 38)}… | Grossiste MC France CHR`),
    description: `${p.nom}${p.marque ? ' ' + p.marque : ''}, réf. ${p.ref} : en vente en gros au prix revendeur, ${c > 1 ? 'par lot de ' + c : 'à l’unité'}, palette de ${S.parPalette(p)}. ${(p.points || []).slice(0, 2).join('. ')}`,
    ld: { '@graph': [f0.ld, { '@type': 'Product', name: p.nom, sku: p.ref, ...(p.marque ? { brand: { '@type': 'Brand', name: p.marque } } : {}), image: p.images.filter((i) => !i.startsWith('data:')).map((i) => BASE + i), description: (p.points || []).join('. ') || p.nom, category: `${f?.nom} > ${sf?.nom}` }] },
  });
  const condHtml = `<div class="conditionnement"><div>${ic('box')}<p><span>Colisage</span><strong>${c > 1 ? `Lot de ${c}` : 'À l’unité'}</strong></p></div><div>${ic('pallet')}<p><span>Palette</span><strong>${S.parPalette(p)} unités</strong></p></div><div>${ic('clock')}<p><span>${p.stock > 0 ? 'Stock Roubaix' : 'Arrivage'}</span><strong>${p.stock > 0 ? `${p.stock} u.` : dateCourte(arr).slice(0, 5)}</strong></p></div></div>`;
  let bloc;
  if (vis) {
    const pu = S.prixUnitaire(p, c);
    bloc = `<div class="bloc-gros" data-achat>
      <div class="prix-revendeur"><small>Votre prix revendeur HT${pu.remiseClient ? ` · niveau ${esc(S.niveau(S.clientConnecte()).nom)} −${pu.remiseClient} % inclus` : ''}</small>
        <div class="prix-revendeur-l"><strong class="prix" id="pu">${eur(pu.unit)} <small>HT / unité</small></strong>${S.prixRevendeurBarre(p) ? `<s>${eur(S.prixRevendeurBarre(p))}</s><span class="pastille p-promo">Déstockage −${S.remiseDestockage(p)} %</span>` : ''}</div></div>
      <div class="trio"><div><span>Prix public conseillé</span><strong>${eur(S.ppc(p))}</strong></div><div class="marge"><span>Votre marge</span><strong id="marge">${eur(S.marge(p, pu.unit).montant)}</strong></div><div><span>Coefficient</span><strong id="coef">× ${S.marge(p, pu.unit).coef.toLocaleString('fr-FR')}</strong></div></div>
      ${condHtml}
      ${pal.length ? `<p class="paliers-titre">Prix dégressifs</p><table class="paliers-table"><thead><tr><th>Quantité</th><th>Remise</th><th>Prix unitaire HT</th></tr></thead><tbody>
        <tr data-palier="${c}"><td>${c > 1 ? `1 lot (${c} u.)` : '1 unité'} et +</td><td>—</td><td>${eur(S.prixUnitaire(p, c).unit)}</td></tr>
        ${pal.map((x) => `<tr data-palier="${x.min}"><td>${x.libelle} (${x.min} u.) et +</td><td>−${x.remise} %</td><td>${eur(S.prixUnitaire(p, x.min).unit)}</td></tr>`).join('')}
      </tbody></table>` : ''}
      <div class="achat">${qteHtml(p)}<button class="btn btn-orange btn-grand" type="button" data-ajouter="${p.id}">${ic('cart')}${p.stock > 0 ? 'Ajouter au panier' : 'Réserver sur arrivage'}</button></div>
      <div class="achat-total"><span id="ligne-detail"></span><strong id="ligne-total"></strong></div>
      <div id="palier-suivant"></div>
      <div class="achat-secondaires">
        <button class="btn" type="button" data-devis-produit>${ic('file')}Devis volume / conteneur</button>
        <button class="btn" type="button" data-copier-fiche>${ic('copy')}Copier la fiche pour mon site</button>
      </div>
    </div>`;
  } else {
    bloc = `<div class="bloc-gros">
      <div class="prix-revendeur"><small>Prix public conseillé HT</small><div class="prix-revendeur-l"><strong class="prix">${eur(S.ppc(p))} <small>HT</small></strong></div></div>
      ${condHtml}
      <div class="verrou-fiche"><h2>${ic('lock')}Prix revendeur réservé aux pros</h2><p>Connectez-vous pour voir votre prix revendeur, votre marge, les paliers de volume et commander en lots ou en palettes.</p>
        <div class="actions"><button class="btn btn-plein" type="button" data-voir-prix>${ic('unlock')}Voir mon prix revendeur</button><a class="btn" href="#/compte?inscription=1">Ouvrir un compte</a></div></div>
    </div>`;
  }
  rendre(`<div class="conteneur">${f0.html}
    <div class="fiche">
      <div class="galerie rv-zoom">
        <div class="galerie-principale">${badges(p)}<img id="photo" src="${src(p.images[0])}" alt="${esc(p.nom)}" width="620" height="620"></div>
        ${p.images.length > 1 ? `<div class="galerie-vignettes">${p.images.map((im, i) => `<button type="button" data-photo="${i}" aria-current="${i === 0}" aria-label="Photo ${i + 1}"><img src="${src(im)}" alt="" width="80" height="80"></button>`).join('')}</div>` : ''}
      </div>
      <div class="fiche-infos">
        ${p.marque ? `<p class="fiche-marque">${esc(p.marque)}</p>` : ''}
        <h1>${esc(p.nom)}</h1>
        <div class="fiche-meta"><span>Réf. <strong>${esc(p.ref)}</strong></span>${p.etat === 'second-choix' ? '' : dispo(p)}<button type="button" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}">${favs.includes(p.id) ? '♥ Dans mes favoris' : '♡ Ajouter aux favoris'}</button></div>
        ${p.etat === 'second-choix' ? `<div class="encadre-sc"><strong>Second choix — pièce unique</strong><span>${esc(p.defaut || '')}</span><span class="petit muet">Article d'exemple pour la démo.</span></div>` : ''}
        ${bloc}
        <ul class="fiche-garanties">
          <li>${ic('truck')}<p><strong>${p.stock > 0 ? `Expédié en ${esc(p.delai)}` : `Arrivage prévu le ${dateLongue(arr)}`}</strong><span>Messagerie, palette ou camion avec hayon</span></p></li>
          <li>${ic('label')}<p><strong>Livraison directe possible</strong><span>Chez votre client, sous étiquette neutre</span></p></li>
          <li>${ic('card')}<p><strong>Virement, carte, 30 ou 45 jours</strong><span>Encours selon votre compte revendeur</span></p></li>
          <li>${ic('shield')}<p><strong>Garantie 1 à 2 ans selon la marque</strong><span>SAV et pièces par MC France</span></p></li>
        </ul>
      </div>
    </div>
    <section class="fiche-onglets">
      <div class="onglets-tete" role="tablist">
        <button role="tab" type="button" aria-selected="true" aria-controls="o-desc" id="t-desc">Points clés</button>
        ${p.specs?.length ? '<button role="tab" type="button" aria-selected="false" aria-controls="o-specs" id="t-specs">Caractéristiques techniques</button>' : ''}
        <button role="tab" type="button" aria-selected="false" aria-controls="o-gros" id="t-gros">Logistique et vente en gros</button>
      </div>
      <div class="onglet" role="tabpanel" id="o-desc" aria-labelledby="t-desc">
        ${p.points?.length ? `<ul class="points-cles">${p.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        ${(p.texte || []).map((x) => `<p style="margin-top:12px">${esc(x)}</p>`).join('')}
      </div>
      ${p.specs?.length ? `<div class="onglet" role="tabpanel" id="o-specs" aria-labelledby="t-specs" hidden><div class="specs">${p.specs.map(([g, l]) => `<div><h3>${esc(g)}</h3><table>${l.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table></div>`).join('')}</div></div>` : ''}
      <div class="onglet" role="tabpanel" id="o-gros" aria-labelledby="t-gros" hidden><div class="specs">
        <div><h3>Conditionnement</h3><table><tr><td>Colisage</td><td>${c > 1 ? `Lot de ${c} unités` : 'À l’unité'}</td></tr><tr><td>Unités par palette</td><td>${S.parPalette(p)}</td></tr><tr><td>Stock entrepôt</td><td>${p.stock > 0 ? `${p.stock} unités` : `Arrivage le ${dateLongue(arr)}`}</td></tr></table></div>
        <div><h3>Livraison et paiement</h3><table><tr><td>Minimum de commande</td><td>${eur(r.minimumCommande)} HT</td></tr><tr><td>Franco de port</td><td>dès ${eur(r.francoPalette)} HT</td></tr><tr><td>Sous le franco</td><td>${eur(r.fraisPort)} HT</td></tr><tr><td>Livraison directe (étiquette neutre)</td><td>+ ${eur(r.fraisDirect)} HT</td></tr><tr><td>Paiement</td><td>Virement, carte, 30 / 45 jours</td></tr></table></div>
      </div><p class="petit muet" style="margin-top:14px">Colisage, palettes et arrivages : valeurs d’exemple pour la démo, réglables produit par produit dans l’admin.</p></div>
    </section>
    ${memes.length ? `<section class="section" style="padding-top:0"><div class="section-titre"><h2>Dans la même catégorie</h2><a href="#/c/${p.famille}/${p.sous}">Tout voir ${ic('arrow')}</a></div><div class="rangee">${memes.map(carte).join('')}</div></section>` : ''}
  </div>
  <div class="barre-mobile">${vis ? `<div><strong id="bm-prix">${eur(S.prixUnitaire(p, c).unit)} HT</strong><small>PPC ${eur(S.ppc(p))} · ${c > 1 ? `lot de ${c}` : 'à l’unité'}</small></div><button class="btn btn-orange" type="button" data-ajouter-mobile>${ic('cart')}Ajouter</button>` : `<div><strong>PPC ${eur(S.ppc(p))}</strong><small>Prix revendeur : compte pro</small></div><button class="btn btn-plein" type="button" data-voir-prix>${ic('unlock')}Voir mon prix</button>`}</div>`);
  document.body.classList.add('avec-barre');
  if (vis) {
    const inp = $('.bloc-gros input[name=qte]');
    const majPrix = () => {
      const q = S.ajusterQte(p, inp.value);
      const pu = S.prixUnitaire(p, q);
      const m = S.marge(p, pu.unit);
      $('#pu').innerHTML = `${eur(pu.unit)} <small>HT / unité</small>`;
      $('#marge').textContent = eur(m.montant);
      $('#coef').textContent = `× ${m.coef.toLocaleString('fr-FR')}`;
      $('#ligne-detail').textContent = `${q} unités × ${eur(pu.unit)} · marge ${eur(m.montant * q)}`;
      $('#ligne-total').textContent = `${eur(pu.unit * q)} HT`;
      $('#bm-prix').textContent = `${eur(pu.unit)} HT`;
      $('#palier-suivant').innerHTML = palierSuivant(p, q);
      const actif = pal.filter((x) => q >= x.min).pop();
      $$('[data-palier]').forEach((tr) => tr.classList.toggle('actif', +tr.dataset.palier === (actif ? actif.min : c)));
    };
    inp.addEventListener('input', majPrix);
    inp.addEventListener('change', () => { inp.value = S.ajusterQte(p, inp.value); majPrix(); });
    majPrix();
    $('[data-ajouter-mobile]').addEventListener('click', () => $('.bloc-gros [data-ajouter]').click());
    $('[data-devis-produit]').addEventListener('click', () => demanderDevis([{ id: p.id, qte: S.ajusterQte(p, inp.value) }]));
    $('[data-copier-fiche]').addEventListener('click', async () => {
      const t = [p.nom, p.marque ? `Marque : ${p.marque}` : '', `Référence : ${p.ref}`, '', ...(p.points || []).map((x) => `• ${x}`), '', ...(p.texte || []), '', ...(p.specs || []).flatMap(([g, l]) => [g, ...l.map(([k, v]) => `${k} : ${v}`), ''])].join('\n');
      try { await navigator.clipboard.writeText(t); toast(`${ic('check')} Fiche copiée : collez-la dans votre boutique`); } catch { toast('Copie impossible dans ce navigateur.', 'erreur'); }
    });
  }
  $$('[data-photo]').forEach((b) => b.addEventListener('click', () => { $('#photo').src = src(p.images[+b.dataset.photo]); $$('[data-photo]').forEach((x) => x.setAttribute('aria-current', x === b)); }));
  $$('[role=tab]').forEach((t) => t.addEventListener('click', () => {
    $$('[role=tab]').forEach((x) => x.setAttribute('aria-selected', x === t));
    $$('[role=tabpanel]').forEach((x) => { x.hidden = x.id !== t.getAttribute('aria-controls'); });
  }));
}

/* ---------- Pack métier ---------- */
function vueMetier(slug) {
  const m = METIERS.find((x) => x.slug === slug);
  if (!m) return vueIntrouvable();
  const pk = packDe(m);
  const vis = S.prixVisibles();
  const tot = pk.reduce((s, p) => s + (vis ? S.prixUnitaire(p).unit * S.colisage(p) : S.ppc(p)), 0);
  seo({ titre: `${m.nom} en gros | MC France CHR`, description: `${m.nom} prêt à revendre : ${m.desc}` });
  rendre(`<div class="conteneur">${fil([['Packs'], [m.nom]]).html}
    <h1 class="page-titre">${esc(m.nom)} <span class="surligne" style="--c:var(--orange)">prêt à revendre</span></h1>
    <p class="hero-univers-intro" style="margin:-8px 0 22px">Une pièce par poste, la moins chère en stock : ajoutez le pack d’un coup (un lot par référence), puis ajustez les quantités ou remplacez un modèle.</p>
    <div class="panier">
      <div class="panier-lignes">${pk.map((p) => `<div class="ligne"><a href="#/p/${p.id}"><img src="${src(p.images[0])}" alt="" width="96" height="96"></a><div><p class="petit muet">${esc(S.sousFamille(p.famille, p.sous)?.nom || '')}</p><h3><a href="#/p/${p.id}">${esc(p.nom)}</a></h3><div class="ligne-meta"><span>Réf. ${esc(p.ref)}</span>${dispo(p)}</div></div><div class="ligne-actions"><span class="ligne-total">${vis ? eur(S.prixUnitaire(p).unit) : 'PPC ' + eur(S.ppc(p))}</span><a class="btn btn-petit" href="#/c/${p.famille}/${p.sous}">Autres modèles</a></div></div>`).join('')}</div>
      <aside class="resume"><h2>${esc(m.nom)}</h2>
        <div class="resume-l"><span>${pk.length} références</span><strong>${eur(tot)} HT</strong></div>
        ${vis ? `<button class="btn btn-orange btn-grand" type="button" data-pack>${ic('cart')}Ajouter le pack au panier</button><button class="btn" type="button" data-pack-devis>${ic('file')}Devis pour ce pack</button>` : `<button class="btn btn-plein btn-grand" type="button" data-voir-prix>${ic('unlock')}Voir mes prix revendeur</button>`}
      </aside>
    </div></div>`);
  $('[data-pack]')?.addEventListener('click', () => { pk.forEach((p) => S.ajouter(p.id)); toast(`${ic('check')} Pack ajouté : ${pk.length} références <a href="#/panier">Voir le panier</a>`); });
  $('[data-pack-devis]')?.addEventListener('click', () => demanderDevis(pk.map((p) => ({ id: p.id, qte: S.colisage(p) }))));
}

/* ---------- Panier ---------- */
function verrouPage(titre) {
  rendre(`<div class="conteneur">${fil([[titre]]).html}<h1 class="page-titre">${esc(titre)}</h1>
    <div class="vide">${ic('lock')}<h2>Réservé aux comptes revendeurs validés</h2><p class="muet">Connectez-vous pour voir vos prix, commander en lots ou en palettes et suivre vos commandes.</p>
    <div class="hero-actions" style="margin:0;justify-content:center"><button class="btn btn-plein" type="button" data-voir-prix>${ic('unlock')}Accès démo en un clic</button><a class="btn" href="#/compte?inscription=1">Ouvrir un compte revendeur</a></div></div></div>`);
}
function vueEnValidation(titre) {
  const c = S.clientConnecte();
  rendre(`<div class="conteneur">${fil([[titre]]).html}<h1 class="page-titre">${esc(titre)}</h1>
    <div class="vide">${ic('clock')}<h2>Compte en cours de validation</h2><p class="muet">${esc(c.societe)} : nous vérifions votre société (24 h ouvrées). Vos prix revendeur s’afficheront dès la validation.</p>
    <div class="info-bulle jaune" style="text-align:left">${ic('info')}<span><strong>Démo :</strong> validez ce compte depuis l’<a href="admin/#/clients" target="_blank" rel="noopener"><strong>espace admin → Clients</strong></a>, puis revenez ici : les prix apparaissent tout seuls.</span></div></div></div>`);
}
function vuePanier() {
  seo({ titre: 'Panier | MC France CHR', description: 'Votre panier revendeur.' });
  if (!S.prixVisibles()) return S.clientConnecte() ? vueEnValidation('Panier') : verrouPage('Panier');
  const lignes = S.panier();
  if (!lignes.length) {
    rendre(`<div class="conteneur">${fil([['Panier']]).html}<h1 class="page-titre">Votre panier</h1>
      <div class="vide">${ic('cart')}<h2>Votre panier est vide</h2><p class="muet">Parcourez le catalogue, collez une liste de références ou recommandez depuis votre compte.</p>
      <div class="hero-actions" style="margin:0;justify-content:center"><a class="btn btn-plein" href="#/catalogue">Voir le catalogue</a><a class="btn" href="#/commande-rapide">${ic('zap')}Commande rapide</a><a class="btn" href="#/compte/commandes">${ic('repeat')}Recommander</a></div></div></div>`);
    return;
  }
  const t = S.calculer(lignes);
  const r = S.reglages();
  rendre(`<div class="conteneur">${fil([['Panier']]).html}<h1 class="page-titre">Votre panier <span class="muet" style="font-size:.5em">${lignes.length} référence${lignes.length > 1 ? 's' : ''} · ${S.nbArticles()} unités</span></h1>
    <div class="panier">
      <div>
        <div class="panier-lignes">${t.lignes.map((l) => `<div class="ligne">
          <a href="#/p/${l.id}"><img src="${src(l.p.images[0])}" alt="" width="96" height="96"></a>
          <div>
            <h3><a href="#/p/${l.id}">${esc(l.p.nom)}</a></h3>
            <div class="ligne-meta"><span>Réf. ${esc(l.p.ref)}</span><span>${S.colisage(l.p) > 1 ? `Lot de ${S.colisage(l.p)}` : 'À l’unité'}</span>${l.p.stock > 0 ? '' : '<span class="pastille p-bleu">Sur arrivage</span>'}</div>
            <p class="ligne-pu">${eur(l.unit)} HT / u. ${l.unit < l.base ? `<s>${eur(l.base)}</s>` : ''} ${l.remisePalier ? `<span class="pastille p-vert">−${l.remisePalier} % volume</span>` : ''} ${l.remiseClient ? `<span class="pastille p-bleu">−${l.remiseClient} % niveau</span>` : ''} <span class="petit muet">PPC ${eur(l.ppc)}</span></p>
            ${palierSuivant(l.p, l.qte) ? `<div style="margin-top:8px">${palierSuivant(l.p, l.qte)}</div>` : ''}
          </div>
          <div class="ligne-actions">${qteHtml(l.p, l.qte, l.id)}<span class="ligne-total">${eur(l.total)}</span><button class="btn btn-lien btn-petit btn-danger" type="button" data-retirer-ligne="${l.id}">${ic('trash')}Retirer</button></div>
        </div>`).join('')}</div>
        <div class="hero-actions" style="margin-top:14px"><a class="btn" href="#/catalogue">${ic('left')}Continuer</a><a class="btn" href="#/commande-rapide">${ic('zap')}Ajouter par référence</a><button class="btn btn-lien btn-danger" type="button" data-vider>Vider le panier</button></div>
      </div>
      <aside class="resume">
        <h2>Récapitulatif</h2>
        ${jauges(t)}
        <div class="resume-l"><span>Total revendeur HT</span><strong>${eur(t.ht)}</strong></div>
        <div class="resume-l vert"><span>Marge estimée (au PPC)</span><span>${eur(t.margeEstimee)} HT</span></div>
        <div class="resume-l"><span>Livraison HT (messagerie / palette)</span><span>${t.port ? eur(t.port) : 'Offerte'}</span></div>
        <div class="resume-l"><span>TVA ${r.tva} %</span><span>${eur(t.tva)}</span></div>
        <div class="resume-total"><span>Total TTC</span><strong>${eur(t.ttc)}</strong></div>
        ${t.manqueMinimum > 0 ? `<button class="btn btn-grand" type="button" disabled>Minimum ${eur(r.minimumCommande)} HT non atteint</button>` : `<a class="btn btn-orange btn-grand" href="#/commande">Passer la commande ${ic('arrow')}</a>`}
        <button class="btn" type="button" data-devis-panier>${ic('file')}Transformer en devis PDF</button>
        <p class="petit muet">Export hors Union européenne et conteneurs : demandez un devis, les prix sont confirmés départ entrepôt.</p>
      </aside>
    </div></div>`);
  vue.querySelectorAll('.ligne input[name=qte]').forEach((inp) => inp.addEventListener('change', () => {
    const cle = inp.dataset.cle;
    S.changerQte(cle, Math.max(0, parseInt(inp.value, 10) || 0));
    vuePanier();
    vue.querySelector(`input[data-cle="${CSS.escape(cle)}"]`)?.focus();
  }));
  vue.querySelectorAll('[data-retirer-ligne]').forEach((b) => b.addEventListener('click', () => { S.changerQte(b.dataset.retirerLigne, 0); vuePanier(); }));
  $('[data-vider]').addEventListener('click', async () => {
    const rr = await modale({ titre: 'Vider le panier ?', corps: '<p>Toutes les références seront retirées.</p>', actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Vider', classe: 'btn-sombre' }] });
    if (rr.action === 'ok') { S.viderPanier(); vuePanier(); }
  });
  $('[data-devis-panier]').addEventListener('click', () => demanderDevis(S.panier()));
}

async function demanderDevis(lignes) {
  const c = S.clientConnecte();
  if (!c) return ouvrirAcces();
  const r = await modale({
    titre: 'Demande de devis volume',
    corps: `<p class="muet">Un devis à votre nom, valable ${S.reglages().validiteDevis} jours, imprimable en PDF. Pour un conteneur ou des quantités hors palette, précisez vos besoins : MC France vous répond avec un prix confirmé.</p>
      <div class="carte-societe"><span><strong>${esc(c.societe)}</strong><br>${esc(c.contact)} · ${esc(c.email)}</span></div>
      <label class="champ"><span>Votre message (quantités, destination, délai, conteneur 20’ / 40’…)</span><textarea name="message" rows="3"></textarea></label>`,
    actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Créer le devis', classe: 'btn-plein' }],
  });
  if (r.action !== 'ok') return;
  const d = S.creerDevis({ client: { id: c.id, societe: c.societe, contact: c.contact, email: c.email, tel: c.tel, siret: c.siret, tva: c.tva }, lignes, message: r.donnees.message });
  location.hash = `#/document/devis/${d.num}`;
  toast(`${ic('check')} Devis ${d.num} créé`);
}

/* ---------- Commande ---------- */
function vueCommande() {
  seo({ titre: 'Commande | MC France CHR', description: 'Validation de la commande revendeur.' });
  if (!S.prixVisibles()) return S.clientConnecte() ? vueEnValidation('Commande') : verrouPage('Commande');
  const lignes = S.panier();
  if (!lignes.length) { location.hash = '#/panier'; return; }
  const c = S.clientConnecte();
  const r = S.reglages();
  if (S.calculer(lignes).manqueMinimum > 0) { location.hash = '#/panier'; return; }
  rendre(`<div class="conteneur">${fil([['Panier', '#/panier'], ['Commande']]).html}<h1 class="page-titre">Commande revendeur</h1>
    <form class="tunnel" id="form-commande" novalidate>
      <div>
        <section class="etape">
          <div class="etape-titre"><span>1</span><h2>${esc(c.societe)}</h2></div>
          <div class="carte-societe"><span>${esc(c.contact)} · ${esc(c.email)} · ${esc(c.tel)}<br>SIRET ${esc(c.siret)} · TVA ${esc(c.tva)}</span><span class="pastille p-vert">Niveau ${esc(S.niveau(c).nom)}</span></div>
        </section>
        <section class="etape">
          <div class="etape-titre"><span>2</span><h2>Livraison</h2></div>
          <div class="choix" id="choix-livraison">
            ${[['palette', 'Messagerie / palette', `1 à 3 jours ouvrés · offerte dès ${eur(r.francoPalette)} HT`], ['hayon', 'Camion avec hayon + rendez-vous', 'Pour le matériel lourd, déchargé au sol à l’heure convenue'], ['direct', 'Livraison directe chez votre client', 'Étiquette neutre, aucun prix ni document MC France dans le colis'], ['enlevement', 'Enlèvement à l’entrepôt de Roubaix', 'Prêt sous 24 à 48 h · gratuit']].map(([v, tt, d], i) => `<label><input type="radio" name="mode" value="${v}" ${i === 0 ? 'checked' : ''}><span><strong>${tt}</strong><small>${d}</small></span><em data-prix-mode="${v}"></em></label>`).join('')}
          </div>
          <div class="grille-champs" id="destinataire" hidden>
            <label class="champ"><span>Nom du client final *</span><input name="destinataire" placeholder="Restaurant, société…"></label>
            <label class="champ"><span>Téléphone du client final</span><input name="telDest" type="tel"></label>
          </div>
          <div class="grille-champs" id="adresse">
            <label class="champ" style="grid-column:1/-1"><span>Adresse de livraison *</span><input name="adresse" required autocomplete="street-address" value="${esc(c.adresse || '')}"></label>
            <label class="champ"><span>Code postal *</span><input name="cp" required inputmode="numeric" autocomplete="postal-code" value="${esc(c.cp || '')}"></label>
            <label class="champ"><span>Ville *</span><input name="ville" required autocomplete="address-level2" value="${esc(c.ville || '')}"></label>
            <label class="champ"><span>Pays</span><select name="pays">${['France', 'Belgique', 'Luxembourg'].map((p) => `<option ${c.pays === p ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
          </div>
        </section>
        <section class="etape">
          <div class="etape-titre"><span>3</span><h2>Paiement et références</h2></div>
          <div class="choix">
            <label><input type="radio" name="paiement" value="virement" checked><span><strong>Virement bancaire</strong><small>Préparation à réception du virement</small></span></label>
            <label><input type="radio" name="paiement" value="cb"><span><strong>Carte bancaire</strong><small>Page sécurisée de la banque · paiement simulé dans la démo</small></span></label>
            ${['30j', '45j'].map((k) => `<label><input type="radio" name="paiement" value="${k}" ${c.conditions === k ? '' : 'disabled'}><span><strong>${S.PAIEMENTS[k]}</strong><small>${c.conditions === k ? 'Selon les conditions de votre compte' : 'Non ouvert sur votre compte'}</small></span></label>`).join('')}
          </div>
          <div class="grille-champs">
            <label class="champ"><span>Votre n° de bon de commande</span><input name="refClient" placeholder="BC-2026-0145"></label>
            <label class="champ"><span>Instructions (accès, horaires…)</span><input name="note"></label>
          </div>
        </section>
      </div>
      <aside class="resume" id="resume-commande"></aside>
    </form></div>`);
  const form = $('#form-commande');
  const majResume = () => {
    const mode = form.mode.value;
    const t = S.calculer(lignes, mode);
    $('#adresse').hidden = mode === 'enlevement';
    $('#destinataire').hidden = mode !== 'direct';
    $$('[data-prix-mode]').forEach((e) => { const tt = S.calculer(lignes, e.dataset.prixMode); e.textContent = tt.port ? eur(tt.port) + ' HT' : 'Offert'; });
    $('#resume-commande').innerHTML = `<h2>Votre commande</h2>
      <div class="resume-lignes">${t.lignes.map((l) => `<div><img src="${src(l.p.images[0])}" alt="" width="44" height="44"><span>${l.qte} × ${esc(l.p.nom)}</span><strong>${eur(l.total)}</strong></div>`).join('')}</div>
      <div class="resume-l"><span>Total revendeur HT</span><strong>${eur(t.ht)}</strong></div>
      <div class="resume-l vert"><span>Marge estimée</span><span>${eur(t.margeEstimee)}</span></div>
      <div class="resume-l"><span>Livraison HT</span><span>${t.port ? eur(t.port) : 'Offerte'}</span></div>
      <div class="resume-l"><span>TVA ${r.tva} %</span><span>${eur(t.tva)}</span></div>
      <div class="resume-total"><span>Total TTC</span><strong>${eur(t.ttc)}</strong></div>
      <label class="case petit"><input type="checkbox" name="cgv" required><span>J’accepte les conditions générales de vente entre professionnels.</span></label>
      <button class="btn btn-orange btn-grand" type="submit">${ic('check')}Valider la commande</button>
      <p class="petit muet">Démo : aucune somme n’est prélevée.</p>`;
  };
  let dernierMode = 'palette';
  form.addEventListener('change', (e) => {
    if (e.target.name !== 'mode') return;
    const m = form.mode.value;
    if (m === 'direct' && dernierMode !== 'direct') { form.adresse.value = ''; form.cp.value = ''; form.ville.value = ''; }
    if (m !== 'direct' && dernierMode === 'direct') { form.adresse.value = c.adresse || ''; form.cp.value = c.cp || ''; form.ville.value = c.ville || ''; }
    dernierMode = m;
    majResume();
  });
  majResume();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const requis = d.mode === 'enlevement' ? [] : ['adresse', 'cp', 'ville'];
    if (d.mode === 'direct') requis.push('destinataire');
    let err = null;
    $$('.champ.erreur', form).forEach((x) => x.classList.remove('erreur'));
    for (const k of requis) if (!String(d[k] || '').trim()) { form[k].closest('.champ').classList.add('erreur'); err = err || form[k]; }
    if (err) { err.focus(); toast('Vérifiez les champs en rouge.', 'erreur'); return; }
    if (!d.cgv) { toast('Merci d’accepter les conditions générales de vente.', 'erreur'); return; }
    const cmd = S.passerCommande({
      client: { id: c.id, societe: c.societe, contact: c.contact, email: c.email, tel: c.tel, siret: c.siret, tva: c.tva },
      livraison: d.mode === 'enlevement' ? { mode: 'enlevement', cp: c.cp || '', adresse: '', ville: '' } : { mode: d.mode, adresse: d.adresse, cp: d.cp, ville: d.ville, pays: d.pays, ...(d.mode === 'direct' ? { destinataire: d.destinataire, telDest: d.telDest } : {}) },
      paiement: d.paiement, note: d.note, refClient: d.refClient, lignes,
    });
    S.viderPanier();
    try { sessionStorage.setItem('mcf-suivi-' + cmd.num, '1'); } catch { /* rien */ }
    location.hash = `#/merci/${cmd.num}`;
  });
}

/* ---------- Suivi ---------- */
function chronologie(c) {
  const retrait = c.livraison?.mode === 'enlevement';
  const etapes = ['validee', 'preparation', 'expediee', 'livree'];
  if (c.paiement === 'virement' || c.historique.some((h) => h.statut === 'attente')) etapes.unshift('attente');
  const idx = etapes.indexOf(c.statut);
  const quand = (s) => c.historique.filter((h) => h.statut === s).pop()?.date;
  const icones = { attente: 'euro', validee: 'check', preparation: 'box', expediee: retrait ? 'store' : 'truck', livree: 'pin' };
  return `<div class="chrono" style="--n:${etapes.length}">${etapes.map((s, i) => {
    const etat = c.statut === 'annulee' ? '' : i < idx || (i === idx && s === 'livree') ? 'fait' : i === idx ? 'encours' : '';
    return `<div class="chrono-etape ${etat}"><span class="chrono-pastille">${etat === 'fait' ? ic('check') : ic(icones[s])}</span><span>${S.statut(s, retrait).nom}${quand(s) ? `<small><br>${new Date(quand(s)).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</small>` : ''}</span></div>`;
  }).join('')}</div>`;
}
function detailCommande(c) {
  const retrait = c.livraison?.mode === 'enlevement';
  return `<section class="carte-blanche">
      <div class="section-titre" style="margin:0"><div><h2>Commande ${esc(c.num)}</h2><p>Passée le ${dateLongue(c.date)} · ${esc(S.PAIEMENTS[c.paiement] || '')}${c.refClient ? ` · votre réf. ${esc(c.refClient)}` : ''}</p></div>
      <span class="pastille ${c.statut === 'livree' ? 'p-vert' : c.statut === 'annulee' ? 'p-rouge' : c.statut === 'attente' ? 'p-jaune' : 'p-bleu'}">${S.statut(c.statut, retrait).nom}</span></div>
      ${c.statut === 'annulee' ? `<div class="info-bulle jaune">${ic('info')}<span>Cette commande a été annulée.</span></div>` : chronologie(c)}
      ${c.suivi ? `<div class="suivi-colis">${ic('truck')}<span>Transporteur <strong>${esc(c.transporteur)}</strong> · n° de suivi <code>${esc(c.suivi)}</code></span></div>` : ''}
      ${c.livraison?.mode === 'direct' ? `<div class="suivi-colis">${ic('label')}<span>Livraison directe chez <strong>${esc(c.livraison.destinataire || 'votre client')}</strong>, ${esc(c.livraison.cp)} ${esc(c.livraison.ville)} · étiquette neutre</span></div>` : ''}
      ${retrait && c.statut === 'expediee' ? `<div class="suivi-colis">${ic('store')}<span>Votre commande vous attend à l’entrepôt : <strong>${esc(S.reglages().adresse)}</strong></span></div>` : ''}
    </section>
    <section class="carte-blanche"><h2>Articles</h2>
      <div class="tableau-scroll"><table class="tableau"><thead><tr><th></th><th>Article</th><th class="num">Qté</th><th class="num">PU HT</th><th class="num">Total HT</th></tr></thead><tbody>
      ${c.lignes.map((l) => `<tr><td><img src="${src(l.image)}" alt="" width="44" height="44" style="object-fit:contain"></td><td>${esc(l.nom)}<br><small class="muet">Réf. ${esc(l.ref)}${l.ppc ? ` · PPC ${eur(l.ppc)}` : ''}</small></td><td class="num">${l.qte}</td><td class="num">${eur(l.unit)}</td><td class="num">${eur(l.total)}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="resume-l"><span>Total HT</span><strong>${eur(c.totaux.ht)}</strong></div>
      <div class="resume-l"><span>Livraison HT</span><span>${c.totaux.port ? eur(c.totaux.port) : 'Offerte'}</span></div>
      <div class="resume-total"><span>Total TTC</span><strong>${eur(c.totaux.ttc)}</strong></div>
      <div class="hero-actions" style="margin-top:4px"><a class="btn" href="#/document/facture/${c.num}">${ic('file')}Facture</a><button class="btn" type="button" data-recommander="${c.num}">${ic('repeat')}Recommander</button></div>
    </section>`;
}
function vueMerci(num) {
  const c = S.commande(num);
  if (!c) return vueIntrouvable();
  seo({ titre: 'Commande confirmée | MC France CHR', description: '' });
  rendre(`<div class="conteneur merci">
    <div class="merci-tete">${ic('check')}<h1>Merci, votre commande est enregistrée</h1>
      <p>Commande <strong>${esc(c.num)}</strong> · ${eur(c.totaux.ht)} HT. Un récapitulatif part à <strong>${esc(c.client.email)}</strong>.</p>
      ${c.paiement === 'virement' ? `<div class="info-bulle jaune">${ic('info')}<span>Virement à effectuer avec la référence <strong>${esc(c.num)}</strong> : la préparation démarre à réception.</span></div>` : ''}
      <div class="hero-actions" style="justify-content:center;margin:0"><a class="btn btn-plein" href="#/suivi/${c.num}">${ic('truck')}Suivre la commande</a><a class="btn" href="#/document/facture/${c.num}">${ic('file')}Facture</a><a class="btn" href="#/">Accueil</a></div>
    </div>
    <div class="info-bulle">${ic('info')}<span><strong>Pour la démo :</strong> ouvrez l’<a href="admin/#/commandes/${c.num}" target="_blank" rel="noopener"><strong>espace admin</strong></a>, faites avancer la commande (préparation, expédition avec n° de suivi, livraison), puis revenez au suivi : il se met à jour tout seul.</span></div>
    ${detailCommande(c)}</div>`);
}
function vueSuivi(num) {
  const cli = S.clientConnecte();
  const c = num ? S.commande(num) : null;
  let ok = false;
  try { ok = !!(c && (sessionStorage.getItem('mcf-suivi-' + num) || (cli && c.client.id === cli.id))); } catch { ok = !!(c && cli && c.client.id === cli.id); }
  seo({ titre: 'Suivi de commande | MC France CHR', description: 'Suivez votre commande revendeur : préparation, expédition, livraison.' });
  if (c && ok) { rendre(`<div class="conteneur merci">${fil([['Suivi de commande', '#/suivi'], [c.num]]).html}${detailCommande(c)}</div>`); return; }
  const miennes = cli ? S.commandes().filter((x) => x.client.id === cli.id).slice(0, 6) : [];
  const ex = S.commandes().find((x) => x.statut === 'expediee');
  rendre(`<div class="conteneur merci">${fil([['Suivi de commande']]).html}
    <h1 class="page-titre" style="margin-bottom:0">Suivre une commande</h1>
    <form class="carte-blanche" id="form-suivi">
      <p class="muet">Numéro de commande et code postal de livraison (ou e-mail du compte).</p>
      <div class="grille-champs"><label class="champ"><span>N° de commande</span><input name="num" required placeholder="MCF-2026-10481" value="${esc(num || '')}"></label><label class="champ"><span>Code postal ou e-mail</span><input name="verif" required placeholder="59000"></label></div>
      <button class="btn btn-plein" type="submit">${ic('search')}Afficher le suivi</button>
      ${ex ? `<p class="petit muet">Exemple : ${esc(ex.num)} avec le code postal ${esc(ex.livraison.cp)}.</p>` : ''}
    </form>
    ${miennes.length ? `<section class="carte-blanche"><h2>Vos dernières commandes</h2><div class="tableau-scroll"><table class="tableau"><tbody>${miennes.map((x) => `<tr><td><strong>${esc(x.num)}</strong><br><small class="muet">${dateCourte(x.date)}</small></td><td>${S.statut(x.statut, x.livraison?.mode === 'enlevement').nom}</td><td class="num">${eur(x.totaux.ht)} HT</td><td class="num"><a class="btn btn-petit" href="#/suivi/${x.num}">Suivre</a></td></tr>`).join('')}</tbody></table></div></section>` : ''}
  </div>`);
  $('#form-suivi').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = e.target.num.value.trim().toUpperCase();
    const v = S.norm(e.target.verif.value).replace(/\s/g, '');
    const cmd = S.commande(n);
    if (!cmd || !(S.norm(cmd.livraison?.cp).replace(/\s/g, '') === v || S.norm(cmd.client.email) === v)) { toast('Aucune commande ne correspond.', 'erreur'); return; }
    try { sessionStorage.setItem('mcf-suivi-' + n, '1'); } catch { /* rien */ }
    location.hash = `#/suivi/${n}`;
  });
}

/* ---------- Compte revendeur ---------- */
function vueCompte(onglet, params) {
  const c = S.clientConnecte();
  seo({ titre: 'Espace revendeur | MC France CHR', description: 'Espace revendeur : commandes, devis, niveau de remise, export du catalogue.' });
  if (!c || params?.get('inscription')) return vueConnexion(params);
  onglet = onglet || 'tableau';
  const mes = S.commandes().filter((x) => x.client.id === c.id);
  const mesDevis = S.devis().filter((x) => x.client.id === c.id);
  const vol = S.volumeAnnuel(c.id);
  const niv = S.niveau(c);
  const suivant = S.NIVEAUX.find((n) => n.seuil > vol && n.remise > niv.remise);
  const enCours = mes.filter((x) => !['livree', 'annulee'].includes(x.statut));
  const menu = [['tableau', 'chart', 'Tableau de bord'], ['commandes', 'box', 'Commandes'], ['devis', 'file', 'Devis'], ['export', 'download', 'Export catalogue'], ['favoris', 'heart', 'Favoris'], ['societe', 'user', 'Société']];
  const ligneCmd = (x) => `<tr><td><strong>${esc(x.num)}</strong><br><small class="muet">${dateCourte(x.date)}${x.refClient ? ' · ' + esc(x.refClient) : ''}</small></td><td><span class="pastille ${x.statut === 'livree' ? 'p-vert' : x.statut === 'attente' ? 'p-jaune' : x.statut === 'annulee' ? 'p-rouge' : 'p-bleu'}">${S.statut(x.statut, x.livraison?.mode === 'enlevement').court}</span></td><td class="num">${eur(x.totaux.ht)} HT</td><td class="num" style="white-space:nowrap"><a class="btn btn-petit" href="#/suivi/${x.num}">Suivre</a> <button class="btn btn-petit" type="button" data-recommander="${x.num}" title="Remettre au panier">${ic('repeat')}</button></td></tr>`;
  let contenu;
  if (c.statut !== 'valide' && onglet === 'tableau') {
    contenu = `<div class="info-bulle jaune">${ic('clock')}<span>Votre compte est <strong>en cours de validation</strong> (24 h ouvrées). Vos prix revendeur s’afficheront ensuite. <em>Démo : validez-le depuis l’<a href="admin/#/clients" target="_blank" rel="noopener"><strong>espace admin</strong></a>.</em></span></div>`;
  } else if (onglet === 'tableau') {
    contenu = `<div class="kpis">
        <div class="kpi"><span>Commandes en cours</span><strong>${enCours.length}</strong></div>
        <div class="kpi"><span>Achats 12 mois HT</span><strong>${eur(vol)}</strong></div>
        <div class="kpi"><span>Remise de niveau</span><strong>${niv.remise ? `−${niv.remise} %` : '—'}</strong></div>
        <div class="kpi"><span>Paiement</span><strong style="font-size:17px">${esc(S.PAIEMENTS[c.conditions] || 'Comptant (virement ou carte)')}</strong></div>
      </div>
      <section class="carte-blanche"><h2>Votre niveau revendeur : ${esc(niv.nom)}</h2>
        <div class="niveau-etapes">${S.NIVEAUX.map((n) => `<div class="${n.id === niv.id ? 'actif' : ''}"><strong>${n.nom}</strong>${n.remise ? `−${n.remise} %` : 'Base'}<br>${n.seuil ? `dès ${nombre(n.seuil / 1000)} k€` : ''}</div>`).join('')}</div>
        ${suivant ? `<div class="jauge"><p>Encore <strong>${eur(suivant.seuil - vol)} HT</strong> d’achats sur 12 mois pour passer ${esc(suivant.nom)} (−${suivant.remise} %).</p><div class="jauge-barre"><i style="width:${Math.min(100, (vol / suivant.seuil) * 100).toFixed(1)}%"></i></div></div>` : ''}
        <p class="petit muet">Seuils et remises d’exemple, réglés par MC France.</p>
      </section>
      <section class="carte-blanche"><div class="section-titre" style="margin:0"><h2>Dernières commandes</h2><a href="#/compte/commandes">Tout voir ${ic('arrow')}</a></div>
        ${mes.length ? `<div class="tableau-scroll"><table class="tableau"><tbody>${mes.slice(0, 4).map(ligneCmd).join('')}</tbody></table></div>` : '<p class="muet">Aucune commande pour l’instant.</p>'}</section>`;
  } else if (onglet === 'commandes') {
    contenu = `<section class="carte-blanche"><h2>Commandes</h2>${mes.length ? `<div class="tableau-scroll"><table class="tableau"><thead><tr><th>Commande</th><th>Statut</th><th class="num">Montant</th><th></th></tr></thead><tbody>${mes.map(ligneCmd).join('')}</tbody></table></div>` : '<p class="muet">Aucune commande.</p>'}</section>`;
  } else if (onglet === 'devis') {
    contenu = `<section class="carte-blanche"><h2>Devis</h2>${mesDevis.length ? `<div class="tableau-scroll"><table class="tableau"><tbody>${mesDevis.map((d) => `<tr><td><strong>${esc(d.num)}</strong><br><small class="muet">${dateCourte(d.date)} · valable jusqu’au ${dateCourte(d.validite)}</small></td><td><span class="pastille ${d.statut === 'converti' ? 'p-vert' : d.statut === 'envoye' ? 'p-bleu' : 'p-jaune'}">${{ demande: 'Demandé', envoye: 'Reçu', converti: 'Commandé' }[d.statut]}</span></td><td class="num">${eur(d.totaux.ht)} HT</td><td class="num"><a class="btn btn-petit" href="#/document/devis/${d.num}">Voir</a></td></tr>`).join('')}</tbody></table></div>` : '<p class="muet">Aucun devis.</p>'}</section>`;
  } else if (onglet === 'export') {
    contenu = `<section class="carte-blanche"><h2>Export du catalogue pour votre site</h2>
      <p class="muet">Un fichier CSV (séparateur point-virgule, lisible dans Excel et importable dans Shopify, PrestaShop ou WooCommerce après mise en correspondance des colonnes) : référence, nom, marque, catégories, <strong>votre prix revendeur</strong>, prix public conseillé, colisage, palette, stock, points clés, caractéristiques et liens des photos.</p>
      <div class="hero-actions" style="margin:0"><button class="btn btn-plein" type="button" data-export ${c.statut === 'valide' ? '' : 'disabled'}>${ic('download')}Télécharger le catalogue (${S.produits().length} références)</button></div>
      <p class="petit muet">Dans la vraie version : flux mis à jour chaque nuit (prix, stocks) à l’adresse privée de votre compte.</p></section>`;
  } else if (onglet === 'favoris') {
    const favs = S.favoris().map(S.produit).filter((p) => p && p.enLigne !== false);
    contenu = favs.length ? `<div class="grille-produits">${favs.map(carte).join('')}</div>` : `<div class="vide">${ic('heart')}<h2>Aucun favori</h2><p class="muet">Touchez le cœur d’un produit pour le retrouver ici.</p></div>`;
  } else {
    contenu = `<section class="carte-blanche"><h2>Société</h2><div class="specs"><div><table>
      <tr><td>Raison sociale</td><td>${esc(c.societe)}</td></tr><tr><td>Activité</td><td>${esc(c.activite || '—')}</td></tr><tr><td>Contact</td><td>${esc(c.contact)}</td></tr>
      <tr><td>E-mail</td><td>${esc(c.email)}</td></tr><tr><td>Téléphone</td><td>${esc(c.tel)}</td></tr></table></div><div><table>
      <tr><td>SIRET</td><td>${esc(c.siret)}</td></tr><tr><td>TVA</td><td>${esc(c.tva)}</td></tr><tr><td>Adresse</td><td>${esc(c.adresse || '—')}<br>${esc(c.cp || '')} ${esc(c.ville || '')}</td></tr>
      <tr><td>Statut</td><td>${c.statut === 'valide' ? 'Validé' : c.statut === 'refuse' ? 'Refusé' : 'En validation'}</td></tr><tr><td>Niveau</td><td>${esc(niv.nom)}</td></tr></table></div></div></section>`;
  }
  rendre(`<div class="conteneur">${fil([['Espace revendeur']]).html}<h1 class="page-titre">Bonjour ${esc((c.contact || '').split(' ')[0])}</h1>
    <div class="compte">
      <nav class="compte-menu" aria-label="Compte"><div class="compte-societe"><strong>${esc(c.societe)}</strong><span class="pastille ${c.statut === 'valide' ? 'p-vert' : 'p-jaune'}">${c.statut === 'valide' ? `Niveau ${esc(niv.nom)}` : 'En validation'}</span>${c.exemple ? '<span class="pastille p-gris">Compte d’exemple</span>' : ''}</div>
        ${menu.map(([k, i, t]) => `<a href="#/compte/${k}" ${onglet === k ? 'aria-current="page"' : ''}>${ic(i)}${t}</a>`).join('')}
        <button type="button" data-deconnexion>${ic('logout')}Se déconnecter</button></nav>
      <div style="display:grid;gap:16px">${contenu}</div>
    </div></div>`);
  $('[data-deconnexion]').addEventListener('click', () => { S.deconnecter(); location.hash = '#/compte'; toast('Vous êtes déconnecté.'); });
  $('[data-export]')?.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([S.exportCatalogueCsv()], { type: 'text/csv;charset=utf-8' }));
    a.download = `catalogue-mc-france-${S.slug(c.societe)}.csv`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(`${ic('download')} Catalogue exporté`);
  });
}
function vueConnexion(params) {
  const inscription = params?.get('inscription');
  rendre(`<div class="conteneur">${fil([['Espace revendeur']]).html}<h1 class="page-titre">${inscription ? 'Ouvrir un compte <span class="surligne" style="--c:var(--orange)">revendeur</span>' : 'Espace revendeur'}</h1>
    <div class="connexion">
      <section class="carte-blanche">
        <h2>Déjà revendeur</h2>
        <form id="form-connexion" style="display:grid;gap:12px">
          <label class="champ"><span>E-mail</span><input name="email" type="email" required autocomplete="email" placeholder="vous@societe.fr"></label>
          <label class="champ"><span>Mot de passe</span><input name="mdp" type="password" autocomplete="current-password" placeholder="Dans la démo : laissez vide"></label>
          <button class="btn btn-sombre" type="submit">Se connecter</button>
        </form>
        <div class="acces-demo"><strong>${ic('sparkle')} Accès démo</strong><span class="petit">« Nordéquip Pro », grossiste à Lille : compte validé niveau Gold (−5 %), paiement à 30 jours.</span><button class="btn btn-plein" type="button" data-demo>${ic('unlock')}Entrer avec le compte d’exemple</button></div>
      </section>
      <section class="carte-blanche">
        <h2>Ouvrir un compte revendeur</h2>
        <ul class="avantages-pro">
          <li>${ic('check')}Prix revendeur, prix public conseillé et marge sur tout le catalogue</li>
          <li>${ic('check')}Lots, palettes, conteneurs ; remise de niveau selon votre volume</li>
          <li>${ic('check')}Livraison directe chez vos clients sous étiquette neutre</li>
          <li>${ic('check')}Export des fiches et photos pour votre site</li>
        </ul>
        <form id="form-inscription" style="display:grid;gap:14px" novalidate>
          <div class="grille-champs">
            <label class="champ"><span>Raison sociale *</span><input name="societe" required autocomplete="organization"></label>
            <label class="champ"><span>SIRET *</span><input name="siret" required inputmode="numeric" maxlength="17"><small id="aide-siret">14 chiffres · le n° de TVA est calculé tout seul.</small></label>
            <label class="champ"><span>N° de TVA</span><input name="tva" placeholder="FR… ou BE…"></label>
            <label class="champ"><span>Activité *</span><select name="activite">${S.ACTIVITES.map((m) => `<option>${m}</option>`).join('')}</select></label>
            <label class="champ"><span>Volume d’achat annuel estimé</span><select name="volume"><option>Moins de 20 000 €</option><option>20 000 à 60 000 €</option><option>60 000 à 150 000 €</option><option>Plus de 150 000 €</option></select></label>
            <label class="champ"><span>Site internet</span><input name="site" type="url" placeholder="https://"></label>
            <label class="champ"><span>Nom du contact *</span><input name="contact" required autocomplete="name"></label>
            <label class="champ"><span>E-mail *</span><input name="email" type="email" required autocomplete="email"></label>
            <label class="champ"><span>Téléphone *</span><input name="tel" type="tel" required autocomplete="tel"></label>
            <label class="champ"><span>Adresse</span><input name="adresse" autocomplete="street-address"></label>
            <label class="champ"><span>Code postal</span><input name="cp" inputmode="numeric" autocomplete="postal-code"></label>
            <label class="champ"><span>Ville</span><input name="ville" autocomplete="address-level2"></label>
          </div>
          <label class="champ"><span>Extrait Kbis (PDF ou photo, facultatif)</span><input name="kbis" type="file" accept=".pdf,image/*"></label>
          <button class="btn btn-orange btn-grand" type="submit">Demander mon compte revendeur</button>
          <p class="petit muet">Pour tester : SIRET ${S.siretFictif(42)} (fictif, clé valide).</p>
        </form>
      </section>
    </div></div>`);
  if (inscription) setTimeout(() => $('#form-inscription input[name=societe]')?.focus({ preventScroll: true }), 50);
  const apres = () => { location.hash = '#/compte'; };
  $('[data-demo]').addEventListener('click', () => { S.connecter('demo'); toast(`${ic('unlock')} Prix revendeur affichés · Nordéquip Pro`); apres(); });
  $('#form-connexion').addEventListener('submit', (e) => {
    e.preventDefault();
    const cl = S.clients().find((x) => S.norm(x.email) === S.norm(e.target.email.value));
    if (!cl) { toast('Aucun compte avec cet e-mail. Essayez demo@exemple.fr.', 'erreur'); return; }
    S.connecter(cl.id); toast(`${ic('check')} Connecté : ${esc(cl.societe)}`); apres();
  });
  const fi = $('#form-inscription');
  fi.siret.addEventListener('input', () => {
    const v = fi.siret.value.replace(/\D/g, '');
    const aide = $('#aide-siret');
    if (v.length === 14) { const ok = S.siretValide(v); aide.textContent = ok ? 'SIRET valide ✓' : 'SIRET invalide : vérifiez les chiffres.'; aide.style.color = ok ? 'var(--vert)' : 'var(--rouge)'; if (ok && !fi.tva.value) fi.tva.value = S.tvaDepuisSiret(v); }
  });
  fi.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(fi));
    let err = null;
    $$('.champ.erreur', fi).forEach((x) => x.classList.remove('erreur'));
    for (const k of ['societe', 'siret', 'contact', 'email', 'tel']) if (!String(d[k] || '').trim()) { fi[k].closest('.champ').classList.add('erreur'); err = err || fi[k]; }
    if (d.siret && !S.siretValide(d.siret)) { fi.siret.closest('.champ').classList.add('erreur'); err = err || fi.siret; }
    if (err) { err.focus(); toast('Vérifiez les champs en rouge.', 'erreur'); return; }
    const siret = d.siret.replace(/\D/g, '');
    const cl = S.creerClient({ societe: d.societe, contact: d.contact, email: d.email, tel: d.tel, adresse: d.adresse, cp: d.cp, ville: d.ville, activite: d.activite, volume: d.volume, site: d.site, kbis: fi.kbis.files[0]?.name || '', siret, tva: d.tva || S.tvaDepuisSiret(siret), pays: 'France' });
    S.connecter(cl.id);
    toast(`${ic('check')} Demande envoyée : validation sous 24 h ouvrées`);
    apres();
  });
}

/* ---------- Commande rapide ---------- */
function vueRapide() {
  seo({ titre: 'Commande rapide par référence | MC France CHR', description: 'Collez votre liste de références et quantités : tout part au panier.' });
  if (!S.prixVisibles()) return S.clientConnecte() ? vueEnValidation('Commande rapide') : verrouPage('Commande rapide');
  const ex = S.produits().filter((p) => p.stock > 2 && p.etat === 'neuf');
  const exemple = [ex[3], ex[20], ex[45], ex[70]].filter(Boolean).map((p, i) => `${p.ref} ${S.colisage(p) * [2, 1, 3, 1][i]}`).join('\n');
  rendre(`<div class="conteneur">${fil([['Commande rapide']]).html}<h1 class="page-titre">Commande rapide <span class="surligne" style="--c:var(--orange)">par référence</span></h1>
    <div class="rapide">
      <section class="carte-blanche"><h2>Collez votre liste</h2>
        <p class="muet">Une ligne par article : la référence puis la quantité en unités (arrondie au lot). Copier-coller depuis Excel accepté.</p>
        <label class="champ"><span class="sr">Liste</span><textarea id="liste-refs" spellcheck="false" placeholder="7950.5320 4&#10;LG800BFB ; 2"></textarea></label>
        <div class="hero-actions" style="margin:0"><button class="btn" type="button" id="ex-refs">Remplir avec un exemple</button><label class="btn">${ic('upload')}Importer un CSV<input type="file" accept=".csv,.txt,text/csv,text/plain" id="fichier-refs" hidden></label></div>
      </section>
      <section class="carte-blanche"><h2>Vérification</h2><div id="rapide-res" class="rapide-res"><p class="muet">Les articles reconnus apparaissent ici avec votre prix revendeur et le stock.</p></div></section>
    </div></div>`);
  const ta = $('#liste-refs');
  let reconnus = [];
  const analyser = () => {
    const lignes = ta.value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    reconnus = [];
    const rows = lignes.map((l) => {
      const parts = l.split(/[;\t,]|\s+/).map((x) => x.trim()).filter(Boolean);
      let q = 1;
      if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) q = parseInt(parts.pop(), 10);
      const ref = parts.join(' ');
      const p = S.produitParRef(ref) || S.produitParRef(parts[0] || '');
      if (!p) return `<tr class="ko"><td>${ic('x')}</td><td>« ${esc(ref)} » introuvable</td><td class="num">${q}</td><td></td></tr>`;
      const qa = S.ajusterQte(p, q);
      reconnus.push({ id: p.id, qte: qa });
      return `<tr class="ok"><td>${ic('check')}</td><td>${esc(p.nom)}<br><small class="muet">Réf. ${esc(p.ref)} · ${p.stock > 0 ? `${p.stock} en stock` : 'sur arrivage'}${qa !== q ? ` · arrondi au lot de ${S.colisage(p)}` : ''}</small></td><td class="num">${qa}</td><td class="num">${eur(S.prixUnitaire(p, qa).unit * qa)}</td></tr>`;
    });
    const t = S.calculer(reconnus);
    $('#rapide-res').innerHTML = rows.length ? `<div class="tableau-scroll"><table class="tableau"><tbody>${rows.join('')}</tbody></table></div>
      <div class="resume-l" style="margin-top:12px"><span>${reconnus.length} référence${reconnus.length > 1 ? 's' : ''} reconnue${reconnus.length > 1 ? 's' : ''}</span><strong>${eur(t.ht)} HT</strong></div>
      <button class="btn btn-orange btn-grand btn-bloc" type="button" id="rapide-ajouter" ${reconnus.length ? '' : 'disabled'} style="margin-top:12px">${ic('cart')}Tout ajouter au panier</button>` : '<p class="muet">Les articles reconnus apparaissent ici.</p>';
    $('#rapide-ajouter')?.addEventListener('click', () => { reconnus.forEach((r) => S.ajouter(r.id, r.qte)); toast(`${ic('check')} ${reconnus.length} référence${reconnus.length > 1 ? 's' : ''} ajoutée${reconnus.length > 1 ? 's' : ''} <a href="#/panier">Voir le panier</a>`); });
  };
  ta.addEventListener('input', analyser);
  $('#ex-refs').addEventListener('click', () => { ta.value = exemple; analyser(); });
  $('#fichier-refs').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; ta.value = (await f.text()).split(/\r?\n/).filter((l) => !/^r[ée]f/i.test(l)).join('\n'); analyser(); });
}

/* ---------- Documents ---------- */
function vueDocument(type, num) {
  const o = type === 'devis' ? S.devis().find((d) => d.num === num) : S.commande(num);
  if (!o) return vueIntrouvable();
  const html = documentCommercial(type, o);
  seo({ titre: `${type === 'devis' ? 'Devis' : 'Facture'} ${num} | MC France CHR`, description: '' });
  rendre(`<div class="conteneur" style="padding-bottom:40px">${fil([[type === 'devis' ? 'Devis' : 'Facture'], [num]]).html}
    <div class="hero-actions" style="margin:4px 0 16px"><button class="btn btn-plein" type="button" data-imprimer>${ic('print')}Imprimer / PDF</button>
      ${type === 'devis' ? `<button class="btn" type="button" data-devis-panier>${ic('cart')}Commander ce devis</button>` : `<a class="btn" href="#/suivi/${num}">${ic('truck')}Suivi</a>`}
      <a class="btn" href="#/compte/${type === 'devis' ? 'devis' : 'commandes'}">Mon compte</a></div>${html}</div>`);
  $('[data-imprimer]').addEventListener('click', () => imprimer(html));
  $('[data-devis-panier]')?.addEventListener('click', () => { o.lignes.forEach((l) => S.produit(l.id) && S.ajouter(l.id, l.qte)); location.hash = '#/panier'; });
}

/* ---------- Devenir revendeur ---------- */
function vueRevendeurs() {
  const r = S.reglages();
  seo({ titre: 'Devenir revendeur de matériel CHR | MC France CHR', description: `Conditions revendeurs : prix revendeur (PPC −${r.remiseRevendeur} %), paliers par lot et palette, niveaux Silver, Gold, Distributeur, livraison directe sous étiquette neutre.`, ld: faqLd(FAQ_GROS) });
  rendre(`<section class="hero-univers" style="--c:#f0612a;--p:#fdeee6"><div class="conteneur">${fil([['Devenir revendeur']]).html}</div>
    <div class="conteneur hero-univers-l">
      <div><span class="pill rv">Programme revendeurs</span>
        <h1 class="rv" style="--i:1">Revendez le matériel CHR <span class="surligne" style="--c:#f0612a">avec de vraies marges</span></h1>
        <p class="hero-univers-intro rv" style="--i:2">Magasins, e-commerçants, cuisinistes, installateurs, centrales d’achat et clients export : un compte, des prix revendeur sur tout le catalogue et une logistique pensée pour la revente.</p>
        <div class="hero-actions rv" style="--i:3"><a class="btn btn-orange btn-grand" href="#/compte?inscription=1">Ouvrir mon compte ${ic('arrow')}</a><button class="btn btn-grand" type="button" data-voir-prix>Accès démo</button></div>
        <div class="stats">
          <div class="stat rv"><strong>${r.remiseRevendeur}<small> %</small></strong><span>Sous le prix public conseillé</span></div>
          <div class="stat rv" style="--i:1;--c:#1a8cd8"><strong>−${r.remisePalette}<small> %</small></strong><span>À la palette complète</span></div>
          <div class="stat rv" style="--i:2;--c:#138a4f"><strong>${nombre(r.minimumCommande)}<small> €</small></strong><span>Minimum de commande HT</span></div>
          <div class="stat rv" style="--i:3;--c:#7a5af8"><strong>${nombre(r.francoPalette)}<small> €</small></strong><span>Franco de port HT</span></div>
        </div>
      </div>
      <figure class="hero-univers-photo rv-zoom"><img src="img/univers/showroom.webp" alt="Showroom de matériel de restauration professionnelle" width="896" height="1120" style="object-position:center 60%"><figcaption>Illustration</figcaption></figure>
    </div></section>
  <section class="section conteneur">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--bleu)">Niveaux revendeurs</span><h2 class="rv" style="margin-top:14px">Plus vous achetez, plus votre remise grimpe</h2><p class="rv">Calculée sur vos achats des 12 derniers mois, elle s’ajoute au prix revendeur et aux paliers de volume.</p></div></div>
    <div class="carte-blanche rv"><div class="tableau-scroll"><table class="tableau niveaux-table"><thead><tr><th>Niveau</th><th>Achats sur 12 mois</th><th class="num">Remise en plus</th></tr></thead><tbody>${S.NIVEAUX.map((n) => `<tr><td><strong>${n.nom}</strong></td><td>${n.seuil ? `dès ${eur(n.seuil)} HT` : 'Dès l’ouverture du compte'}</td><td class="num"><strong>${n.remise ? `−${n.remise} %` : '—'}</strong></td></tr>`).join('')}</tbody></table></div><p class="petit muet">Seuils, remises, minimum et franco : valeurs d’exemple, réglées par MC France dans l’admin.</p></div>
  </section>
  <section class="section conteneur" style="padding-top:0"><div class="etapes">${ETAPES_GROS.map(([t, d], i) => `<div class="etape-gros rv" style="--i:${i};--c:${['#1a8cd8', '#138a4f', '#f0612a', '#7a5af8'][i]}"><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></section>
  <section class="section conteneur" style="padding-top:0"><div class="texte-seo"><div class="texte-seo-corps rv"><h2>Devenir revendeur de matériel de restauration professionnelle</h2><p>Revendre du matériel CHR demande trois choses : des prix d’achat qui laissent une marge, un stock disponible et une logistique fiable. MC France CHR vous donne les trois, avec un catalogue de grandes marques professionnelles, un entrepôt à Roubaix et la livraison directe chez vos clients.</p><p>Vos fiches produits sont prêtes : caractéristiques techniques, points clés et photos s’exportent pour votre site. Les prix publics conseillés vous aident à rester cohérent avec le marché.</p></div><div class="faq rv">${FAQ_GROS.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></div></section>`);
}

/* ---------- Infos pratiques ---------- */
function vueInfos(page = 'conditions') {
  const r = S.reglages();
  const pages = {
    conditions: ['Conditions de vente en gros', `<p>Vente réservée aux professionnels (SIRET ou n° de TVA intracommunautaire). Prix en euros hors taxes, départ entrepôt de Roubaix.</p><ul><li>Prix revendeur : prix public conseillé − ${r.remiseRevendeur} %, plus la remise de votre niveau.</li><li>Paliers : −${r.remise3lots} % dès 3 lots d’une même référence, −${r.remisePalette} % à la palette complète.</li><li>Minimum de commande : ${eur(r.minimumCommande)} HT. Franco de port : ${eur(r.francoPalette)} HT.</li><li>Colisage indiqué sur chaque fiche ; quantités arrondies au lot.</li></ul><p class="petit muet">Valeurs d’exemple pour la démo, modifiables dans l’admin.</p>`],
    livraison: ['Livraison, palettes, export', `<ul><li>Messagerie ou palette : 1 à 3 jours ouvrés pour le stock ; ${eur(r.fraisPort)} HT sous le franco.</li><li>Camion avec hayon et rendez-vous : + ${eur(r.hayon)} HT.</li><li>Livraison directe chez votre client, sous étiquette neutre : + ${eur(r.fraisDirect)} HT.</li><li>Enlèvement gratuit à l’entrepôt de Roubaix.</li><li>Export et conteneurs 20’ / 40’ : sur devis, prix départ entrepôt.</li></ul>`],
    paiement: ['Paiement et encours', '<p>Virement (préparation à réception), carte bancaire, ou à 30 / 45 jours fin de mois (LCR) pour les comptes validés selon l’encours accordé. Sociétés de l’Union européenne avec n° de TVA valide : autoliquidation.</p>'],
    garantie: ['Garantie et SAV', '<p>Garantie de 1 à 2 ans selon les marques, pièces et main-d’œuvre. Le service après-vente de MC France accompagne vos clients pour la réparation, l’entretien et les pièces détachées.</p>'],
    showroom: ['Showroom et entrepôt', `<p><strong>MC France CHR</strong><br>139 rue des Arts, rez-de-chaussée<br>59100 Roubaix</p><p>Téléphone : <a href="tel:+33320775904">03 20 77 59 04</a> · <a href="tel:+33644898000">06 44 89 80 00</a></p><p>Venez voir le matériel, comparer les modèles et repartir avec votre palette.</p>`],
  };
  const [titre, corps] = pages[page] || pages.conditions;
  seo({ titre: `${titre} | MC France CHR`, description: titre });
  rendre(`<div class="conteneur">${fil([['Infos pratiques'], [titre]]).html}<h1 class="page-titre">${titre}</h1>
    <div class="infos"><nav class="compte-menu" aria-label="Infos pratiques">${Object.entries(pages).map(([k, [t]]) => `<a href="#/infos/${k}" ${k === page ? 'aria-current="page"' : ''}>${t}</a>`).join('')}</nav><div class="infos-texte">${corps}</div></div></div>`);
}
function vueIntrouvable() {
  seo({ titre: 'Page introuvable | MC France CHR', description: '' });
  rendre(`<div class="conteneur" style="padding:40px 16px"><div class="vide">${ic('search')}<h2>Page introuvable</h2><p class="muet">Ce produit ou cette page n’existe plus.</p><a class="btn btn-plein" href="#/">Retour à l’accueil</a></div></div>`);
}

/* ---------- Routeur ---------- */
const ROUTES = [
  [/^$/, vueAccueil], [/^catalogue$/, vueCatalogue], [/^c\/([\w-]+)$/, vueUnivers], [/^c\/([\w-]+)\/([\w-]+)$/, vueSous],
  [/^p\/([\w-]+)$/, vueProduit], [/^recherche\/(.+)$/, vueRecherche], [/^(?:destockage|promos|second-choix)$/, vueDestockage],
  [/^metier\/([\w-]+)$/, vueMetier], [/^panier$/, vuePanier], [/^commande$/, vueCommande], [/^merci\/([\w-]+)$/, vueMerci],
  [/^suivi(?:\/([\w-]+))?$/, vueSuivi], [/^compte(?:\/(\w+))?$/, vueCompte], [/^commande-rapide$/, vueRapide],
  [/^document\/(devis|facture)\/([\w-]+)$/, vueDocument], [/^infos(?:\/([\w-]+))?$/, vueInfos], [/^revendeurs$/, vueRevendeurs],
];
let routePrecedente = null;
function router() {
  const [chemin, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(qs || '');
  document.body.classList.remove('avec-barre');
  $('#suggestions').hidden = true;
  fermerTiroir(); fermerRecherche(); fermerVolant();
  const route = ROUTES.find(([re]) => re.test(chemin));
  if (route) route[1](...chemin.match(route[0]).slice(1).map((x) => (x === undefined ? undefined : decodeURIComponent(x))), params);
  else vueIntrouvable();
  majOnglets(chemin);
  if (routePrecedente !== chemin) { window.scrollTo(0, 0); if (routePrecedente !== null) vue.focus({ preventScroll: true }); }
  routePrecedente = chemin;
  animer();
}
function rerendre() { const y = window.scrollY; router(); window.scrollTo(0, y); }

/* ---------- Tiroir et recherche mobile ---------- */
function ouvrirTiroir() { $('#tiroir-menu').hidden = false; document.body.style.overflow = 'hidden'; $('#tiroir-menu .tiroir-tete .btn-icone').focus(); }
function fermerTiroir() { if (!$('#tiroir-menu').hidden) { $('#tiroir-menu').hidden = true; document.body.style.overflow = ''; } }
function ouvrirRecherche() {
  if (!matchMedia('(max-width: 1080px)').matches) { $('#q').focus(); return; }
  $('#recherche-mobile').hidden = false; document.body.style.overflow = 'hidden';
  suggestions($('#qm').value, $('#suggestions-m'));
  setTimeout(() => $('#qm').focus(), 30);
}
function fermerRecherche() { if (!$('#recherche-mobile').hidden) { $('#recherche-mobile').hidden = true; document.body.style.overflow = ''; } }

/* ---------- Événements globaux ---------- */
document.addEventListener('click', (e) => {
  if (e.target.matches('.tiroir-voile')) return fermerTiroir();
  if (e.target.matches('.volant-voile')) return fermerVolant();
  const t = e.target.closest('button, a');
  if (!t) { if (!e.target.closest('#recherche')) $('#suggestions').hidden = true; return; }
  if (t.dataset.ajouter) {
    const zone = t.closest('[data-achat]');
    const q = zone ? parseInt(zone.querySelector('input[name=qte]')?.value, 10) : undefined;
    if (S.ajouter(t.dataset.ajouter, q)) {
      voler(t.closest('.carte, .fiche')?.querySelector('.carte-img img, #photo'));
      ['#lien-panier', '#barre-onglets [data-onglet=panier]'].forEach((s) => { const b = $(s); if (b) { b.classList.remove('saute'); void b.offsetWidth; b.classList.add('saute'); } });
      setTimeout(() => ouvrirVolant(t.dataset.ajouter), ANIM ? 450 : 0);
    }
    return;
  }
  if (t.matches('[data-plus], [data-moins]')) {
    const inp = t.parentElement.querySelector('input');
    const pas = +inp.dataset.pas || 1;
    const v = (parseInt(inp.value, 10) || pas) + (t.matches('[data-plus]') ? pas : -pas);
    inp.value = Math.max(inp.dataset.cle && t.matches('[data-moins]') ? 0 : pas, Math.min(9999, v));
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    if (inp.dataset.cle) inp.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (t.hasAttribute('data-voir-prix')) { e.preventDefault(); ouvrirAcces(); return; }
  if (t.dataset.fav) {
    const ajoute = S.basculerFavori(t.dataset.fav);
    $$(`[data-fav="${CSS.escape(t.dataset.fav)}"]`).forEach((b) => { b.setAttribute('aria-pressed', ajoute); if (!b.classList.contains('carte-fav')) b.textContent = ajoute ? '♥ Dans mes favoris' : '♡ Ajouter aux favoris'; });
    toast(ajoute ? `${ic('heart')} Ajouté aux favoris <a href="#/compte/favoris">Voir</a>` : 'Retiré des favoris');
    return;
  }
  if (t.dataset.recommander) {
    const c = S.commande(t.dataset.recommander);
    let n = 0;
    c?.lignes.forEach((l) => { if (S.produit(l.id)) { S.ajouter(l.id, l.qte); n++; } });
    toast(`${ic('repeat')} ${n} référence${n > 1 ? 's' : ''} remise${n > 1 ? 's' : ''} au panier <a href="#/panier">Voir</a>`);
    return;
  }
  if (t.hasAttribute('data-ouvrir-menu')) return ouvrirTiroir();
  if (t.hasAttribute('data-fermer-tiroir')) return fermerTiroir();
  if (t.hasAttribute('data-ouvrir-recherche')) return ouvrirRecherche();
  if (t.hasAttribute('data-fermer-recherche')) return fermerRecherche();
  if (t.hasAttribute('data-fermer-volant')) return fermerVolant();
  if (t.hasAttribute('data-fermer-ruban')) { $('#ruban-demo').hidden = true; try { sessionStorage.setItem('mcf-ruban', '1'); } catch { /* rien */ } return; }
  if (!t.closest('#recherche')) $('#suggestions').hidden = true;
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { fermerVolant(); fermerTiroir(); fermerRecherche(); $('#suggestions').hidden = true; $('#filtres')?.classList.remove('ouvert'); } });
window.addEventListener('scroll', () => $('#entete').classList.toggle('ombre', window.scrollY > 8), { passive: true });

function brancherRecherche(form, champ, boite) {
  champ.addEventListener('input', () => suggestions(champ.value, boite));
  champ.addEventListener('focus', () => { if (champ.value.trim().length > 1) suggestions(champ.value, boite); });
  champ.addEventListener('keydown', (e) => {
    const items = $$('.sugg-prod', boite);
    if (!items.length || boite.hidden) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      suggActif = (suggActif + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((x, i) => x.classList.toggle('actif', i === suggActif));
    } else if (e.key === 'Enter' && suggActif >= 0) { e.preventDefault(); location.hash = items[suggActif].getAttribute('href'); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = champ.value.trim();
    if (!v) return;
    const exact = S.produitParRef(v);
    location.hash = exact ? `#/p/${exact.id}` : `#/recherche/${encodeURIComponent(v)}`;
    champ.blur();
  });
}
brancherRecherche($('#recherche'), $('#q'), $('#suggestions'));
brancherRecherche($('#recherche-m'), $('#qm'), $('#suggestions-m'));

S.ecouter((cle, externe) => {
  if (['catalogue', 'reglages', 'reinit'].includes(cle) && externe) construireNavigation();
  majEntete();
  if (cle === 'session') { construireNavigation(); if (!externe) { rerendre(); return; } }
  if (externe && !document.querySelector('dialog[open]') && !$('#form-commande') && !$('#form-inscription')) rerendre();
  if (cle === 'erreur-stockage') toast('Le navigateur refuse d’enregistrer (stockage plein ou navigation privée).', 'erreur');
});

/* ---------- Démarrage ---------- */
$$('[data-ic]').forEach((el) => { el.innerHTML = ic(el.dataset.ic); });
$$('[data-ic-avant]').forEach((el) => el.insertAdjacentHTML('afterbegin', ic(el.dataset.icAvant)));
try { if (sessionStorage.getItem('mcf-ruban')) $('#ruban-demo').hidden = true; } catch { /* rien */ }
construireNavigation();
majEntete();
window.addEventListener('hashchange', router);
router();
