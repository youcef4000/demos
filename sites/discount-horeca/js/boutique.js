// Discount Horeca — démo de la nouvelle boutique, version Premium (FR / NL / EN), application d'une page (routes #/…).
import * as S from './store.js';
import * as I from './i18n.js';
import { UNIVERS } from './univers.js';
import { eur, esc, ic, src, toast, modale, documentCommercial, dateCourte, dateLongue, nombre } from './ui.js';

const { t, H, nomP, nomF, courtF, nomS } = I;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const vue = $('#vue');
const BASE = 'https://demos.bornzstudio.com/discount-horeca/';
const MARQUE = 'Discount Horeca';
const ANIM = 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches;
if (ANIM) document.documentElement.classList.add('anim');

function pref(cle, valeur) {
  try {
    if (valeur === undefined) return localStorage.getItem('dh.v1.pref.' + cle);
    localStorage.setItem('dh.v1.pref.' + cle, valeur);
  } catch { /* stockage indisponible */ }
  return valeur;
}
const aller = (h) => { location.hash = H(h); };

/* ---------- Univers : couleurs, photos, textes ---------- */
function U(slug) {
  const f = S.famille(slug);
  const tr = I.univers(slug);
  if (tr) return { ...UNIVERS[slug], ...tr, couleur: UNIVERS[slug]?.couleur || '#0f97d8', pastel: UNIVERS[slug]?.pastel || '#e5f5fc' };
  return { couleur: '#0f97d8', pastel: '#e5f5fc', pastille: f ? nomF(f) : '', titre: [f ? nomF(f) : '', t('pour l’horeca')], intro: f ? I.descF(f) : '', seo: [], faq: [], sous: {} };
}
const styleU = (slug) => `--c:${U(slug).couleur};--p:${U(slug).pastel}`;
const photoU = (slug, petit = false) => (UNIVERS[slug] ? `img/univers/${slug}${petit ? '-640' : ''}.webp` : S.famille(slug)?.image || '');
const produitsDe = (fam, sous) => S.produits().filter((p) => p.famille === fam && (!sous || p.sous === sous));
const nbMarques = (ps) => new Set(ps.map((p) => p.marque).filter(Boolean)).size;
const prixDe = (p) => S.prixUnitaire(p).unit;
const prixMin = (ps) => (ps.length ? Math.min(...ps.map(prixDe)) : 0);
const remiseMax = (ps) => Math.max(0, ...ps.map(S.remisePromo));
const BELGE = new Set(['tables-inox', 'plonges', 'armoires-inox', 'etageres-inox', 'hottes-completes', 'hottes-murales', 'hottes-centrales', 'hottes-vapeur', 'hottes-compensation']);
const madeInBelgium = (p) => BELGE.has(p.sous);
const sousNom = (fam, sous) => { const s = S.sousFamille(fam, sous); return s ? nomS(s) : ''; };

/* ---------- SEO par page ---------- */
let cheminCourant = '';
function seo({ titre, description, ld }) {
  document.title = titre;
  let d = description || '';
  if (d.length > 155) d = d.slice(0, d.lastIndexOf(' ', 150)) + '…';
  $('meta[name=description]').setAttribute('content', d);
  $('#jsonld-page').textContent = ld ? JSON.stringify({ '@context': 'https://schema.org', ...ld }) : '';
}
/* Versions linguistiques de la page (hreflang) : une adresse par langue. */
function alternates(chemin) {
  Object.keys(I.LANGUES).forEach((l) => {
    let el = $(`link[rel=alternate][hreflang="${l}-BE"]`);
    if (!el) { el = document.createElement('link'); el.rel = 'alternate'; el.hreflang = `${l}-BE`; document.head.append(el); }
    el.href = `${BASE}#/${l === 'fr' ? '' : l + '/'}${chemin}`;
  });
  $('link[rel=canonical]').href = `${BASE}#/${I.LANGUE === 'fr' ? '' : I.LANGUE + '/'}${chemin}`;
  $('meta[property="og:locale"]').content = I.LANGUES[I.LANGUE].og;
}
function titreSeo(...variantes) { return variantes.find((x) => x.length <= 62) || variantes[variantes.length - 1]; }
function fil(liens) {
  const ld = { '@type': 'BreadcrumbList', itemListElement: [[t('Accueil'), '#/'], ...liens].map(([n, h], i) => ({ '@type': 'ListItem', position: i + 1, name: n, ...(h ? { item: BASE + H(h) } : {}) })) };
  return {
    html: `<nav class="fil" aria-label="${t('Fil d’Ariane')}"><a href="#/">${t('Accueil')}</a>${liens.map(([x, h]) => `${ic('right')}${h ? `<a href="${h}">${esc(x)}</a>` : `<span aria-current="page">${esc(x)}</span>`}`).join('')}</nav>`,
    ld,
  };
}
const faqLd = (liste) => ({ '@type': 'FAQPage', mainEntity: liste.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) });

/* ---------- Petits morceaux d'interface ---------- */
function dispo(p, court = false) {
  if (p.etat === 'exposition') return `<span class="stock stock-bas">${t('Pièce unique · au showroom')}</span>`;
  if (p.stock > 2) return `<span class="stock stock-ok">${court ? t('En stock · 24–72 h') : t('En stock · livré en 24 à 72 h')}</span>`;
  if (p.stock > 0) return `<span class="stock stock-bas">${t('Plus que {n} en stock', { n: p.stock })}</span>`;
  return `<span class="stock stock-non">${court ? t('Sur commande') : t('Sur commande · délai confirmé sous 24 h')}</span>`;
}
function badges(p) {
  const r = S.remisePromo(p);
  return `<div class="carte-badges">${p.etat === 'exposition' ? `<span class="pastille p-sc">${t('Exposition')}</span>` : ''}${r ? `<span class="pastille p-promo">−${r} %</span>` : ''}${madeInBelgium(p) ? '<span class="pastille p-belge">Made in Belgium</span>' : ''}${p.nouveau ? `<span class="pastille p-nouveau">${t('Nouveau')}</span>` : ''}</div>`;
}
function qteHtml(p, valeur, cle = '') {
  return `<div class="qte"><button type="button" data-moins aria-label="${t('Un de moins')}">${ic('minus')}</button><input name="qte" type="number" inputmode="numeric" min="1" step="1" max="99" value="${valeur ?? 1}" data-pas="1" aria-label="${t('Quantité')}" ${cle ? `data-cle="${cle}"` : ''}><button type="button" data-plus aria-label="${t('Un de plus')}">${ic('plus')}</button></div>`;
}
function prixCarte(p) {
  const pu = S.prixUnitaire(p);
  const barre = pu.remiseRevendeur ? p.prixHT : pu.barre;
  return `<div class="carte-prix">
      <div class="carte-prix-l"><strong class="prix">${eur(pu.unit)}<small>${t('HTVA')}</small></strong>${barre ? `<s>${eur(barre)}</s>` : ''}</div>
      <div class="carte-prix-sous"><span>${eur(S.ttc(pu.unit))} ${t('TVAC')}</span>${pu.remiseRevendeur ? `<span>${t('Revendeur')} <b>−${pu.remiseRevendeur} %</b></span>` : ''}</div>
    </div>`;
}
function carte(p, i = 0) {
  const favs = S.favoris();
  const nom = nomP(p);
  return `<article class="carte rv" style="--i:${i % 8}">
    <a class="carte-img" href="#/p/${p.id}" tabindex="-1" aria-hidden="true"><img src="${src(p.images[0])}" alt="" loading="lazy" width="300" height="300"></a>
    ${badges(p)}
    <button class="carte-fav" type="button" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}" aria-label="${t('Ajouter aux favoris')}">${ic('heart')}</button>
    <div class="carte-corps">
      <p class="carte-marque">${esc(p.marque || '')}</p>
      <h3 class="carte-nom"><a href="#/p/${p.id}">${esc(nom)}</a></h3>
      <p class="carte-ref">${t('Réf.')} ${esc(p.ref)}</p>
      ${p.etat === 'exposition' ? `<p class="carte-sc">${esc(t(p.defaut || ''))}</p>` : dispo(p, true)}
      ${prixCarte(p)}
      <div class="carte-achat" data-achat>${qteHtml(p)}<button class="btn btn-plein" type="button" data-ajouter="${p.id}" aria-label="${esc(t('Ajouter {nom} au panier', { nom }))}">${ic('cart')}<span>${t('Ajouter')}</span></button></div>
    </div>
  </article>`;
}
function jauges(tot) {
  const r = S.reglages();
  const pct = Math.min(100, (tot.ht / r.franco) * 100);
  return `<div class="jauge ${tot.resteFranco <= 0 ? 'ok' : ''}"><p>${tot.resteFranco > 0 ? t('Livraison gratuite en Belgique dans <strong>{montant} HTVA</strong>', { montant: eur(tot.resteFranco) }) : t('<strong>Livraison gratuite</strong> en Belgique (dès {montant} HTVA)', { montant: eur(r.franco) })}</p><div class="jauge-barre"><i style="width:${pct.toFixed(1)}%"></i></div></div>`;
}
function rendre(html) { vue.innerHTML = html; localiserLiens(vue); }
function imprimer(html) { $('#zone-impression').innerHTML = html; window.print(); }
/* Liens internes dans la langue courante (#/… → #/nl/…). */
function localiserLiens(racine = document) {
  if (I.LANGUE === 'fr') return;
  $$('a[href^="#/"]', racine).forEach((a) => {
    if (a.dataset.langue) return;
    const h = a.getAttribute('href');
    if (!/^#\/(nl|en)(\/|$)/.test(h)) a.setAttribute('href', H(h));
  });
}

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
  const pas = (x) => {
    const k = Math.min(1, (x - t0) / d);
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
      <a href="#/c/${f.slug}">${ic(f.icone)}${esc(courtF(f))}</a>
      <div class="nav-mega"><div class="conteneur nav-mega-l">
        <div class="nav-mega-photo"><img src="${src(photoU(f.slug, true))}" alt="" loading="lazy" width="320" height="230"><h3>${esc(nomF(f))}</h3><p>${t('{n} références · {s} catégories', { n: ps.length, s: f.sous.length })}</p><a class="btn btn-petit" href="#/c/${f.slug}">${t('Tout l’univers')} ${ic('arrow')}</a></div>
        <div class="nav-mega-sous">${f.sous.map((s) => `<a href="#/c/${f.slug}/${s.slug}"><img src="${src(s.image || f.image)}" alt="" loading="lazy" width="150" height="112">${esc(nomS(s))}<small>${t('{n} réf.', { n: produitsDe(f.slug, s.slug).length })}</small></a>`).join('')}</div>
      </div></div>
    </div>`;
  }).join('') + `<div class="nav-speciaux"><a class="nav-destock" href="#/promos">${t('Promos')}</a><a class="nav-revendeur" href="#/packs">${t('Packs')}</a></div>`;
  $('#tiroir-corps').innerHTML = fams.map((f) => `<details>
      <summary><img src="${src(photoU(f.slug, true))}" alt="" width="44" height="44" loading="lazy">${esc(nomF(f))}${ic('down')}</summary>
      <div class="tiroir-sous"><a href="#/c/${f.slug}"><strong>${t('Tout l’univers')}</strong></a>${f.sous.map((s) => `<a href="#/c/${f.slug}/${s.slug}">${esc(nomS(s))}</a>`).join('')}</div>
    </details>`).join('') + `<div class="tiroir-langues">${Object.entries(I.LANGUES).map(([k, l]) => `<a href="#/" data-langue="${k}" lang="${l.locale}">${l.nom}</a>`).join('')}</div><div class="tiroir-liens">
      <a href="#/catalogue">${ic('grid')}${t('Tout le catalogue')}</a>
      <a href="#/promos">${ic('percent')}${t('Promotions')}</a>
      <a href="#/bonnes-affaires">${ic('tag')}${t('Bonnes affaires et exposition')}</a>
      <a href="#/packs">${ic('box')}${t('Packs prêts à ouvrir')}</a>
      <a href="#/revendeurs">${ic('users')}${t('Revendeurs et installateurs')}</a>
      <a href="#/suivi">${ic('truck')}${t('Suivre une commande')}</a>
      <a href="#/infos/contact">${ic('pin')}${t('Showroom et contact')}</a>
      <a href="admin/" target="_blank" rel="noopener">${ic('settings')}${t('Espace admin (démo)')}</a>
      <a href="analyse-seo.html">${ic('chart')}${t('Analyse du site actuel')}</a>
    </div>`;
  $('#pied-familles').innerHTML = fams.map((f) => `<li><a href="#/c/${f.slug}">${esc(nomF(f))}</a></li>`).join('');
  $('#pied-reassurance').innerHTML = reassurance().map(([i, x, d]) => `<div>${ic(i)}<p><strong>${x}</strong><span>${d}</span></p></div>`).join('');
  const nbSous = fams.reduce((s, f) => s + f.sous.length, 0);
  const cat = $('.action-catalogue small'); if (cat) cat.textContent = t('{n} catégories', { n: nbSous });
  localiserLiens(document.body);
  majLangues(cheminCourant);
}
function reassurance() {
  const r = S.reglages();
  return [
    ['truck', t('Livré en 24 à 72 h'), t('Gratuit en Belgique dès {montant} € HTVA', { montant: nombre(r.franco) })],
    ['store', t('Showroom à Sint-Pieters-Leeuw'), t('Du lundi au samedi, parking gratuit')],
    ['card', t('Bancontact, carte, virement'), t('Ou {acompte} % d’acompte, solde à la livraison', { acompte: r.acompte })],
    ['shield', t('Garantie et SAV'), t('Un an pièces et main-d’œuvre (pros)')],
  ];
}
function majEntete() {
  const n = S.nbLignes();
  [$('#panier-nb'), $('#panier-nb-mobile')].forEach((b) => { b.hidden = n === 0; b.textContent = n; });
  const tot = S.calculer(S.panier());
  $('#panier-total').textContent = n ? eur(tot.ht) : t('Panier');
  const c = S.clientConnecte();
  $('#libelle-compte').innerHTML = c ? `${esc(c.societe.length > 18 ? c.societe.slice(0, 17) + '…' : c.societe)}<small>${S.estRevendeur(c) ? t('Revendeur −{remise} %', { remise: S.reglages().remiseRevendeur }) : c.statut === 'en-attente' ? t('Compte en validation') : t('Compte pro')}</small>` : `${t('Mon compte')}<small>${t('Se connecter')}</small>`;
  const r = S.reglages();
  $('#bandeau-msg').textContent = t(r.bandeau);
  const wa = S.lienWhatsapp(t('Bonjour, j’ai une question sur votre matériel horeca.'));
  $('#lien-whatsapp').href = wa; $('#lien-whatsapp').target = '_blank'; $('#lien-whatsapp').rel = 'noopener';
  $('#bouton-whatsapp').href = wa;
  $('#pied-adresse').innerHTML = `<strong>${t('Showroom')}</strong><br>${esc(r.adresse)}<br>${esc(t(r.horaires))}`;
  $('#pied-tel').innerHTML = `<a href="tel:${esc(r.telephone.replace(/\s/g, ''))}">${esc(r.telephone)}</a> · <a href="mailto:${esc(r.email)}">${esc(r.email)}</a>`;
  $('#pied-societe').textContent = t('© 2026 Discount Horeca · {societe} · TVA {tva} · Prix en euros HTVA, TVAC indiqué.', { societe: r.societe, tva: r.numeroTva });
}
function majOnglets(chemin) {
  const seg = chemin.split('/')[0];
  const actif = { '': '', catalogue: 'catalogue', c: 'catalogue', p: 'catalogue', compte: 'compte', panier: 'panier', commande: 'panier', infos: 'infos' }[seg];
  $$('#barre-onglets [data-onglet]').forEach((a) => (a.dataset.onglet === actif ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
}
/* Textes fixes de index.html (data-t : texte, data-ta : attributs). */
function traduireStatique() {
  // data-t="clé" : clé de traduction distincte du texte français affiché (libellé court, par ex.).
  $$('[data-t]').forEach((el) => { if (!el.dataset.tFr) el.dataset.tFr = el.innerHTML.trim(); el.innerHTML = I.LANGUE === 'fr' ? el.dataset.tFr : t(el.dataset.t || el.dataset.tFr); });
  $$('[data-ta]').forEach((el) => el.dataset.ta.split(',').forEach((a) => {
    const k = 'fr' + a.replace(/[^a-z]/gi, '');
    if (!el.dataset[k]) el.dataset[k] = el.getAttribute(a);
    el.setAttribute(a, t(el.dataset[k]));
  }));
  document.documentElement.lang = I.LANGUES[I.LANGUE].locale;
}
/* Sélecteur de langue : même page, autre langue. */
function majLangues(chemin) {
  $$('[data-langue]').forEach((a) => {
    const l = a.dataset.langue;
    a.setAttribute('href', `#/${l === 'fr' ? '' : l + '/'}${chemin}`);
    if (l === I.LANGUE) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
}

/* ---------- Accès compte (démo) ---------- */
async function ouvrirAcces(raison = '') {
  const r = await modale({
    titre: t('Mon compte Discount Horeca'),
    corps: `${raison ? `<p class="muet">${esc(raison)}</p>` : ''}
      <div class="acces-demo"><strong>${ic('sparkle')} ${t('Démo : entrez en un clic')}</strong><span class="petit">${t('« Brasserie Exemple » (compte pro horeca) ou « Horeca Services Exemple » (revendeur validé, −{remise} % sur tout le catalogue).', { remise: S.reglages().remiseRevendeur })}</span></div>
      <label class="champ"><span>${t('Déjà client ? Votre e-mail')}</span><input name="email" type="email" autocomplete="email" placeholder="${t('vous@societe.be')}"></label>
      <p class="petit muet">${t('Pas encore de compte ? Il se crée en une minute, avec votre numéro d’entreprise.')}</p>`,
    actions: [{ id: 'inscription', libelle: t('Créer un compte') }, { id: 'login', libelle: t('Se connecter') }, { id: 'rev', libelle: t('Démo revendeur') }, { id: 'demo', libelle: t('Démo pro'), classe: 'btn-plein' }],
  });
  if (r.action === 'demo') { S.connecter('demo'); toast(`${ic('check')} ${t('Connecté : Brasserie Exemple (compte pro)')}`); return true; }
  if (r.action === 'rev') { S.connecter('rev'); toast(`${ic('unlock')} ${t('Prix revendeur affichés (−{remise} %)', { remise: S.reglages().remiseRevendeur })}`); return true; }
  if (r.action === 'login') {
    const cl = S.clients().find((x) => S.norm(x.email) === S.norm(r.donnees.email));
    if (!cl) { toast(t('Aucun compte avec cet e-mail. Essayez demo@exemple.be.'), 'erreur'); return false; }
    S.connecter(cl.id); toast(`${ic('check')} ${t('Connecté : {nom}', { nom: esc(cl.societe) })}`); return true;
  }
  if (r.action === 'inscription') aller('#/compte?inscription=1');
  return false;
}

/* ---------- Recherche instantanée ---------- */
let suggActif = -1;
function rechercher(q, max) {
  if (I.LANGUE === 'fr') return S.rechercher(q, max);
  // recherche aussi dans les noms traduits
  const mots = S.norm(q).split(/[\s,;/]+/).filter((m) => m.length > 1 || /\d/.test(m));
  if (!mots.length) return [];
  const vus = new Set(S.rechercher(q, max).map((p) => p.id));
  const res = S.produits().filter((p) => vus.has(p.id) || mots.every((m) => S.norm(`${nomP(p)} ${p.ref} ${p.marque || ''} ${sousNom(p.famille, p.sous)}`).includes(m)));
  return res.slice(0, max);
}
function suggestions(q, boite) {
  const bureau = boite.id === 'suggestions';
  if (q.trim().length < 2) { boite.hidden = bureau; boite.innerHTML = bureau ? '' : suggestionsVides(); localiserLiens(boite); return; }
  const res = rechercher(q, 6);
  const n = S.norm(q);
  const cats = [];
  S.familles().forEach((f) => { if (S.norm(nomF(f)).includes(n)) cats.push([nomF(f), `#/c/${f.slug}`]); f.sous.forEach((s) => { if (S.norm(nomS(s)).includes(n)) cats.push([nomS(s), `#/c/${f.slug}/${s.slug}`]); }); });
  boite.innerHTML = (cats.length ? `<p class="sugg-titre">${t('Catégories')}</p><div class="sugg-cat">${cats.slice(0, 6).map(([x, h]) => `<a href="${h}">${esc(x)}</a>`).join('')}</div>` : '')
    + (res.length ? `<p class="sugg-titre">${t('Produits')}</p>${res.map((p) => `<a class="sugg-prod" href="#/p/${p.id}"><img src="${src(p.images[0])}" alt="" width="52" height="52"><span>${esc(nomP(p))}<small>${t('Réf.')} ${esc(p.ref)} · ${esc(p.marque || '')}</small></span><strong>${eur(prixDe(p))}<small> ${t('HTVA')}</small></strong></a>`).join('')}<a class="sugg-tout" href="#/recherche/${encodeURIComponent(q)}">${t('Voir tous les résultats pour « {q} »', { q: esc(q) })}</a>`
      : `<p class="sugg-vide">${t('Aucun produit pour « {q} ».', { q: esc(q) })} <a href="${S.lienWhatsapp(t('Bonjour, je cherche : {q}', { q }))}" target="_blank" rel="noopener">${t('Demandez-nous sur WhatsApp')}</a>.</p>`);
  boite.hidden = false;
  suggActif = -1;
  localiserLiens(boite);
}
function suggestionsVides() {
  const frequentes = [t('friteuse gaz'), t('table inox'), t('four à pizza'), t('frigo boisson'), t('lave-vaisselle'), t('hotte murale')];
  return `<p class="sugg-titre">${t('Univers')}</p><div class="sugg-cat">${S.familles().map((f) => `<a href="#/c/${f.slug}">${esc(nomF(f))}</a>`).join('')}</div><p class="sugg-titre">${t('Recherches fréquentes')}</p><div class="sugg-cat">${frequentes.map((x) => `<a href="#/recherche/${encodeURIComponent(x)}">${esc(x)}</a>`).join('')}</div>`;
}

/* ---------- Panier volant ---------- */
let dernierFocus = null;
function ouvrirVolant(id) {
  const p = S.produit(id);
  const tot = S.calculer(S.panier());
  const l = tot.lignes.find((x) => x.id === id);
  if (!p || !l) return;
  const n = S.nbArticles();
  $('#volant-boite').innerHTML = `
    <header class="volant-tete"><h2 id="volant-titre">${ic('check')}${t('Ajouté au panier')}</h2><button class="btn-icone" type="button" data-fermer-volant aria-label="${t('Fermer')}">${ic('x')}</button></header>
    <div class="volant-produit"><img src="${src(p.images[0])}" alt="" width="88" height="88"><div>
      <h3>${esc(nomP(p))}</h3>
      <p class="petit muet">${t('Réf.')} ${esc(p.ref)} · ${t('{n} dans le panier', { n: l.qte })}</p>
      <p class="petit"><strong>${eur(l.unit)} ${t('HTVA')}</strong> · ${eur(S.ttc(l.unit))} ${t('TVAC')} ${S.remisePromo(p) ? `<span class="pastille p-promo">−${S.remisePromo(p)} %</span>` : ''}</p>
    </div></div>
    <div class="volant-corps">${jauges(tot)}
      ${tot.economie > 0 ? `<div class="info-bulle vert">${ic('percent')}<span>${t('Vous économisez <strong>{montant} HTVA</strong> sur ce panier par rapport aux prix habituels.', { montant: eur(tot.economie) })}</span></div>` : ''}
    </div>
    <footer class="volant-pied">
      <div class="volant-ligne"><span>${n > 1 ? t('Panier · {n} articles', { n }) : t('Panier · 1 article')}</span><strong>${eur(tot.ht)} ${t('HTVA')}</strong></div>
      <a class="btn btn-orange btn-grand" href="${H('#/panier')}" data-fermer-volant>${t('Voir le panier')}</a>
      <button class="btn" type="button" data-fermer-volant>${t('Continuer mes achats')}</button>
    </footer>`;
  const v = $('#volant');
  if (v.hidden) dernierFocus = document.activeElement;
  v.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#volant-boite [data-fermer-volant]').focus();
}
function fermerVolant() { if ($('#volant').hidden) return; $('#volant').hidden = true; document.body.style.overflow = ''; dernierFocus?.focus?.(); }

/* ---------- Packs d'ouverture ---------- */
const PACKS = [
  { slug: 'friterie', nom: 'Pack friterie', court: 'Friterie', icone: 'burger', desc: 'Friteuse, grill panini, frigo à boissons, hotte murale.', sous: ['friteuses', 'grills-panini', 'vitrines-boissons', 'hottes-murales'] },
  { slug: 'pizzeria', nom: 'Pack pizzeria', court: 'Pizzeria', icone: 'pizza', desc: 'Four à pizza, pétrin, table à pizza, laminoir.', sous: ['fours-a-pizza', 'petrins', 'tables-a-pizza', 'laminoirs-diviseuses'] },
  { slug: 'brasserie', nom: 'Pack brasserie', court: 'Brasserie', icone: 'flame', desc: 'Cuisinière, armoire frigo, lave-vaisselle, hotte.', sous: ['cuisinieres', 'armoires-frigorifiques', 'lave-vaisselle', 'hottes-murales'] },
  { slug: 'bar', nom: 'Pack café & bar', court: 'Café & bar', icone: 'cup', desc: 'Machine à café, lave-verres, frigo de bar, machine à glaçons.', sous: ['machines-a-cafe', 'lave-verres', 'frigos-de-bar', 'machines-a-glacons'] },
  { slug: 'boulangerie', nom: 'Pack boulangerie', court: 'Boulangerie', icone: 'store', desc: 'Batteur, four pâtisserie, vitrine réfrigérée, table inox.', sous: ['batteurs-petrins', 'fours-patisserie', 'vitrines-refrigerees', 'tables-inox'] },
];
function packDe(m) {
  return m.sous.map((s) => {
    const l = S.produits().filter((p) => p.sous === s && p.etat === 'neuf').sort((a, b) => (b.stock > 0) - (a.stock > 0) || a.prixHT - b.prixHT);
    return l[0];
  }).filter(Boolean);
}
const totalPack = (pk) => S.arrondi(pk.reduce((s, p) => s + prixDe(p), 0));

/* ---------- Accueil ---------- */
function vueAccueil() {
  const ps = S.produits();
  const fams = S.familles();
  const r = S.reglages();
  const FAQ = I.faq();
  const promos = ps.filter((p) => S.remisePromo(p) > 0 && p.etat === 'neuf').sort((a, b) => S.remisePromo(b) - S.remisePromo(a));
  const affaires = ps.filter((p) => S.bonneAffaire(p)).sort((a, b) => (b.etat === 'exposition') - (a.etat === 'exposition') || S.remisePromo(b) - S.remisePromo(a));
  const nouveaux = ps.filter((p) => p.nouveau && p.etat === 'neuf');
  const vedette = ps.filter((p) => p.etat === 'neuf' && p.stock > 0 && S.remisePromo(p) >= 25 && p.prixHT > 800).sort((a, b) => b.images.length - a.images.length)[0] || promos[0];
  const nbSous = fams.reduce((s, f) => s + f.sous.length, 0);
  const marques = S.marques();
  const pv = vedette ? S.prixUnitaire(vedette) : null;
  const nomV = vedette ? nomP(vedette) : '';
  seo({
    titre: t('Matériel horeca professionnel en Belgique | Discount Horeca'),
    description: t('Matériel horeca à prix discount : froid, cuisson, friterie, pizzeria, inox et hottes made in Belgium. Prix HTVA et TVAC, showroom à Sint-Pieters-Leeuw, livraison en Belgique.'),
    ld: { '@graph': [faqLd(FAQ)] },
  });
  rendre(`
  <section class="hero">
    <div class="conteneur hero-l">
      <div>
        <span class="pill rv" style="--c:var(--bleu)">${t('Showroom à Sint-Pieters-Leeuw')}</span>
        <h1 class="rv" style="--i:1">${t('Le matériel horeca')} <span class="surligne" style="--c:var(--bleu)">${t('à prix discount')}</span></h1>
        <p class="hero-chapo rv" style="--i:2">${t('Froid, cuisson, friterie, pizzeria, préparation, lavage, <strong>inox et hottes fabriqués en Belgique</strong> : {n} références avec le prix <strong>HTVA et TVAC</strong>, des promotions jusqu’à <strong>−{remise} %</strong> et la livraison en 24 à 72 h dans toute la Belgique.', { n: ps.length, remise: remiseMax(ps) })}</p>
        <div class="hero-actions rv" style="--i:3">
          <a class="btn btn-orange btn-grand" href="#/promos">${t('Voir les promotions')} ${ic('arrow')}</a>
          <a class="btn btn-grand" href="#/catalogue">${ic('grid')}${t('Tout le catalogue')}</a>
        </div>
        <p class="hero-demo rv" style="--i:4">${ic('pin')}${t('Showroom ouvert du lundi au samedi, de 9 h à 17 h')} · ${esc(r.adresse)}</p>
      </div>
      <div class="hero-visuel rv-zoom">
        <div class="hero-photo"><img src="img/univers/accueil.webp" alt="${t('Cuisine professionnelle équipée de matériel inox')}" width="1344" height="752" fetchpriority="high"></div>
        ${vedette ? `<a class="flottante flottante-prix" href="#/p/${vedette.id}"><img src="${src(vedette.images[0])}" alt="" width="58" height="58"><small>${esc(nomV.length > 34 ? nomV.slice(0, 33) + '…' : nomV)}</small><strong>${eur(pv.unit)} <small>${t('HTVA')}</small></strong><span>${pv.barre ? t('au lieu de {prix} · −{remise} %', { prix: eur(pv.barre), remise: S.remisePromo(vedette) }) : `${eur(S.ttc(pv.unit))} ${t('TVAC')}`}</span></a>` : ''}
        <div class="flottante flottante-marge"><small>${t('Livraison gratuite')}</small><strong>${nombre(r.franco)} €</strong><span class="petit muet">${t('HTVA d’achat, partout en Belgique')}</span></div>
        <div class="flottante flottante-etiquette">${ic('card')}<span>${t('Bancontact, Payconiq<br>ou {acompte} % d’acompte', { acompte: r.acompte })}</span></div>
      </div>
    </div>
    <div class="conteneur" style="padding-bottom:56px">
      <div class="stats" style="margin-top:0">
        <div class="stat rv"><strong data-compte="${ps.length}">${ps.length}</strong><span>${t('Références dans la démo')}</span></div>
        <div class="stat rv" style="--i:1;--c:var(--bleu)"><strong data-compte="${nbSous}">${nbSous}</strong><span>${t('Catégories, {n} univers', { n: fams.length })}</span></div>
        <div class="stat rv" style="--i:2;--c:#16a06a"><strong data-compte="${marques.length}">${marques.length}</strong><span>${t('Marques professionnelles')}</span></div>
        <div class="stat rv" style="--i:3;--c:var(--orange)"><strong>24–72<small> h</small></strong><span>${t('Livraison du stock en Belgique')}</span></div>
      </div>
    </div>
  </section>

  <div class="marques" aria-label="${t('Marques du catalogue')}"><div class="marques-l">${[...marques, ...marques].map((m, i) => `<span ${i >= marques.length ? 'aria-hidden="true"' : ''}>${esc(m)}</span>`).join('')}</div></div>

  <section class="section conteneur" id="univers">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--bleu)">${t('Le catalogue')}</span><h2 class="rv" style="margin-top:14px">${t('{n} univers,', { n: fams.length })} <span class="surligne">${t('{n} catégories', { n: nbSous })}</span></h2><p class="rv">${t('Un menu clair, des photos, le prix de départ et le nombre de références : on trouve son matériel en deux gestes, même sur téléphone.')}</p></div><a class="rv" href="#/catalogue">${t('Tout le catalogue')} ${ic('arrow')}</a></div>
    <div class="univers-grille">
      ${fams.map((f, i) => { const pf = produitsDe(f.slug); return `<a class="carte-univers rv" href="#/c/${f.slug}" style="${styleU(f.slug)};--i:${i % 3}">
        <div class="carte-univers-photo"><img src="${src(photoU(f.slug, true))}" alt="" loading="lazy" width="640" height="358"><span class="carte-univers-nb">${t('{n} réf. · dès {prix} HTVA', { n: pf.length, prix: eur(prixMin(pf)) })}</span><span class="carte-univers-fleche">${ic('arrow')}</span></div>
        <div class="carte-univers-txt"><h3>${esc(nomF(f))}</h3><div class="carte-univers-sous">${f.sous.slice(0, 4).map((s) => `<span>${esc(nomS(s))}</span>`).join('')}${f.sous.length > 4 ? `<span>+${f.sous.length - 4}</span>` : ''}</div></div>
      </a>`; }).join('')}
    </div>
  </section>

  <section class="section conteneur" style="padding-top:0">
    <div class="section-titre"><div><span class="pill rv">${t('Pourquoi Discount Horeca')}</span><h2 class="rv" style="margin-top:14px">${t('Le prix discount,')} <span class="surligne" style="--c:var(--orange)">${t('le service en plus')}</span></h2></div></div>
    <div class="atouts">
      ${[['euro', '#0f97d8', '#e5f5fc', t('Prix HTVA et TVAC'), t('Le prix hors TVA pour votre comptabilité, le prix TVAC juste en dessous, et l’économie réalisée sur chaque promotion.')],
    ['truck', '#f04e2e', '#fdebe7', t('Livré en 24 à 72 h'), t('Partout en Belgique, d’Arlon à Ostende. Gratuit dès {montant} € HTVA, ou retrait gratuit au showroom.', { montant: nombre(r.franco) })],
    ['store', '#16a06a', '#e3f6ee', t('Un vrai showroom'), t('Venez voir, toucher et comparer le matériel à Sint-Pieters-Leeuw, à quelques minutes de la E19. Parking gratuit.')],
    ['table', '#5b6b7c', '#eceff3', t('Inox et hottes made in Belgium'), t('Tables, plonges, armoires, étagères et hottes fabriquées en Belgique, y compris sur mesure.')]]
    .map(([i, c, p, x, d], k) => `<div class="atout rv" style="--c:${c};--p:${p};--i:${k}">${ic(i)}<h3>${x}</h3><p>${d}</p></div>`).join('')}
    </div>
  </section>

  ${promos.length ? `<section class="section conteneur" style="padding-top:0">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--orange)">${t('Promotions')}</span><h2 class="rv" style="margin-top:14px">${t('Les plus fortes baisses du moment')}</h2></div><a class="rv" href="#/promos">${t('Toutes les promos ({n})', { n: promos.length })} ${ic('arrow')}</a></div>
    <div class="rangee">${promos.slice(0, 10).map(carte).join('')}</div>
  </section>` : ''}

  <section class="section conteneur" style="padding-top:0">
    <div class="simulateur rv-zoom" id="simulateur">
      <div class="simu-gauche">
        <span class="pill" style="--c:var(--jaune)">${t('Projet d’ouverture')}</span>
        <h2>${t('Combien coûte l’équipement de votre établissement ?')}</h2>
        <p>${t('Choisissez votre activité : le pack de base, le total HTVA et TVAC, l’acompte de {acompte} % et la livraison, calculés en direct. Ajoutez-le au panier ou demandez un devis avec installation.', { acompte: r.acompte })}</p>
        <label class="champ"><span>${t('Votre activité')}</span><select class="saisie" id="simu-pack">${PACKS.map((m) => `<option value="${m.slug}">${esc(t(m.court))}</option>`).join('')}</select></label>
      </div>
      <div class="simu-droite" id="simu-resultat"></div>
    </div>
  </section>

  <section class="section conteneur" style="padding-top:0">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--vert)">${t('Comment ça marche')}</span><h2 class="rv" style="margin-top:14px">${t('De la commande à la mise en service')}</h2></div><a class="rv" href="#/infos/livraison">${t('Livraison et paiement')} ${ic('arrow')}</a></div>
    <div class="etapes">${I.etapes().map(([x, d], i) => `<div class="etape-gros rv" style="--i:${i};--c:${['#0f97d8', '#16a06a', '#f04e2e', '#5b6b7c'][i]}"><h3>${x}</h3><p>${d}</p></div>`).join('')}</div>
  </section>

  ${affaires.length ? `<section class="section conteneur" style="padding-top:0">
    <div class="destock rv-zoom">
      <div>
        <span class="pill">${t('Bonnes affaires')}</span>
        <h2>${t('Les <span class="surligne" style="--c:var(--orange)">bonnes affaires</span> du showroom')}</h2>
        <p>${t('Promotions de −{seuil} % et plus, et modèles d’exposition contrôlés par notre atelier : les meilleurs prix du catalogue, en quantités limitées.', { seuil: r.seuilBonneAffaire })}</p>
        <div class="stats">
          <div class="stat"><strong data-compte="${affaires.length}">${affaires.length}</strong><span>${t('Bonnes affaires')}</span></div>
          <div class="stat" style="--c:#16a06a"><strong>−${remiseMax(ps)}<small> %</small></strong><span>${t('Jusqu’à, sur le prix habituel')}</span></div>
        </div>
        <a class="btn btn-sombre" href="#/bonnes-affaires">${t('Voir les bonnes affaires')} ${ic('arrow')}</a>
      </div>
      <div class="rangee">${affaires.slice(0, 9).map(carte).join('')}</div>
    </div>
  </section>` : ''}

  <section class="section conteneur" style="padding-top:0">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--bleu)">${t('Packs prêts à ouvrir')}</span><h2 class="rv" style="margin-top:14px">${t('Équiper un métier en une commande')}</h2><p class="rv">${t('Un appareil par poste, en stock de préférence : ajoutez le pack d’un coup, puis remplacez un modèle si besoin.')}</p></div><a class="rv" href="#/packs">${t('Tous les packs')} ${ic('arrow')}</a></div>
    <div class="metiers">${PACKS.slice(0, 4).map((m, i) => { const pk = packDe(m); return `<article class="metier rv" style="--i:${i}">
      <div class="metier-tete">${ic(m.icone)}<div><h3>${esc(t(m.nom))}</h3><p>${esc(t(m.desc))}</p></div></div>
      <div class="metier-imgs">${pk.map((p) => `<img src="${src(p.images[0])}" alt="${esc(nomP(p))}" loading="lazy" width="80" height="80">`).join('')}</div>
      <p class="petit">${t('{n} équipements', { n: pk.length })} · <strong>${eur(totalPack(pk))} ${t('HTVA')}</strong></p>
      <a class="btn" href="#/pack/${m.slug}">${t('Voir le pack')} ${ic('arrow')}</a>
    </article>`; }).join('')}</div>
  </section>

  <section class="engagement">
    <div class="conteneur engagement-l">
      <figure class="engagement-photo rv-zoom"><img src="img/univers/showroom.webp" alt="${t('Showroom de matériel de cuisine professionnelle')}" loading="lazy" width="896" height="1120"><figcaption>${t('Illustration · à remplacer par une photo du showroom')}</figcaption></figure>
      <div>
        <div class="guillemets rv" aria-hidden="true">”</div>
        <blockquote class="rv">${t('Venez voir le matériel <em>avant de l’acheter</em>. Notre équipe partage ses conseils et son expérience pour équiper votre cuisine selon votre activité et votre budget.')}</blockquote>
        <cite class="rv">${t('Le showroom de Sint-Pieters-Leeuw, à quelques minutes de la E19')}</cite>
        <div class="stats">
          <div class="stat rv"><strong>${t('6 j/7')}</strong><span>${t('Du lundi au samedi, 9 h – 17 h')}</span></div>
          <div class="stat rv" style="--i:1;--c:var(--jaune)"><strong>24–72 h</strong><span>${t('Livraison du stock')}</span></div>
          <div class="stat rv" style="--i:2;--c:#7ff0b3"><strong>BE</strong><span>${t('D’Arlon à Ostende')}</span></div>
          <div class="stat rv" style="--i:3;--c:#9cd7ff"><strong>${t('SAV')}</strong><span>${t('Pièces et réparation')}</span></div>
        </div>
        <div class="hero-actions" style="margin-top:22px"><a class="btn btn-jaune" href="#/infos/contact">${ic('pin')}${t('Plan d’accès')}</a><a class="btn" href="${S.lienWhatsapp(t('Bonjour, je souhaite passer au showroom.'))}" target="_blank" rel="noopener">${ic('phone')}WhatsApp</a></div>
      </div>
    </div>
  </section>

  ${nouveaux.length ? `<section class="section conteneur">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--bleu)">${t('Nouveautés')}</span><h2 class="rv" style="margin-top:14px">${t('Arrivés récemment')}</h2></div><a class="rv" href="#/catalogue">${t('Tout voir')} ${ic('arrow')}</a></div>
    <div class="rangee">${nouveaux.slice(0, 10).map(carte).join('')}</div>
  </section>` : ''}

  <section class="section conteneur">
    <div class="texte-seo">
      <div class="texte-seo-corps rv">
        <span class="pill" style="--c:var(--bleu)">${t('Magasin horeca en Belgique')}</span>
        <h2>${t('Matériel horeca professionnel à Bruxelles et dans toute la Belgique')}</h2>
        <p>${t('Discount Horeca est un magasin de matériel professionnel pour l’horeca, avec un showroom à Sint-Pieters-Leeuw, aux portes de Bruxelles. Restaurants, brasseries, friteries, snacks, pizzerias, cafés, boulangeries, boucheries, hôtels et collectivités y trouvent le gros matériel de cuisine : froid commercial, cuisson, friteuses, fours à pizza, préparation, lave-vaisselle, mobilier inox et hottes.')}</p>
        <p>${t('Chaque produit affiche son <strong>prix HTVA</strong> et son <strong>prix TVAC</strong>, le stock et le délai. Le matériel en stock est livré en 24 à 72 heures partout en Belgique, gratuitement dès {montant} € HTVA, ou retiré au showroom. Les tables, plonges, armoires, étagères et hottes en inox sont fabriquées en Belgique.', { montant: nombre(r.franco) })}</p>
      </div>
      <div class="faq rv">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    </div>
  </section>

  <section class="conteneur" style="padding-bottom:20px">
    <div class="appel rv-zoom"><div><h2>${t('Un projet d’ouverture ou de rénovation ?')}</h2><p>${t('Envoyez votre liste ou votre plan : devis détaillé avec livraison, installation et raccordement.')}</p></div><div class="hero-actions" style="margin:0"><a class="btn btn-jaune btn-grand" href="#/devis-projet">${t('Demander un devis')} ${ic('arrow')}</a><a class="btn btn-grand" href="${S.lienWhatsapp(t('Bonjour, j’ai un projet d’équipement horeca.'))}" target="_blank" rel="noopener">${ic('phone')}WhatsApp</a></div></div>
  </section>`);
  brancherSimulateur();
}
function brancherSimulateur() {
  const sel = $('#simu-pack');
  if (!sel) return;
  const maj = () => {
    const m = PACKS.find((x) => x.slug === sel.value);
    const pk = packDe(m);
    const tot = S.calculer(pk.map((p) => ({ id: p.id, qte: 1 })));
    const r = S.reglages();
    $('#simu-resultat').innerHTML = `<div class="simu-pack">${pk.map((p) => `<a href="#/p/${p.id}" title="${esc(nomP(p))}"><img src="${src(p.images[0])}" alt="${esc(nomP(p))}" width="64" height="64"></a>`).join('')}</div>
      <div class="simu-chiffres">
        <div><span>${t('{n} équipements, HTVA', { n: pk.length })}</span><strong>${eur(tot.ht)}</strong></div>
        <div><span>${t('Total TVAC (21 %)')}</span><strong>${eur(tot.ttc)}</strong></div>
        <div><span>${t('Livraison en Belgique')}</span><strong>${tot.port ? eur(tot.port) + ' ' + t('HTVA') : t('Gratuite')}</strong></div>
        <div><span>${t('Économie sur les prix habituels')}</span><strong>${eur(tot.economie)}</strong></div>
        <div class="grand"><span>${t('Acompte à la commande ({acompte} %), solde à la livraison', { acompte: r.acompte })}</span><strong>${eur(tot.acompte)}</strong></div>
      </div>
      <div class="hero-actions" style="margin:0"><a class="btn btn-jaune" href="#/pack/${m.slug}">${t('Voir le pack')} ${ic('arrow')}</a><button class="btn" type="button" data-simu-ajouter>${ic('cart')}${t('Tout ajouter')}</button></div>`;
    localiserLiens($('#simu-resultat'));
    $('[data-simu-ajouter]').addEventListener('click', () => { pk.forEach((p) => S.ajouter(p.id, 1)); toast(`${ic('check')} ${t('{pack} ajouté : {n} équipements', { pack: t(m.nom), n: pk.length })} <a href="${H('#/panier')}">${t('Voir le panier')}</a>`); });
  };
  sel.addEventListener('change', maj);
  maj();
}

/* ---------- Catalogue (liste des univers) ---------- */
function vueCatalogue() {
  const fams = S.familles();
  const f0 = fil([[t('Catalogue')]]);
  seo({ titre: t('Catalogue de matériel horeca | Discount Horeca'), description: t('Tout le matériel horeca : {liste}. Prix HTVA et TVAC, livraison en Belgique.', { liste: fams.map((f) => nomF(f).toLowerCase()).join(', ') }), ld: f0.ld });
  rendre(`<div class="conteneur">${f0.html}
    <header class="section-titre" style="margin-top:8px"><div><span class="pill rv">${t('Tout le catalogue')}</span><h1 class="page-titre rv" style="margin:14px 0 0">${t('Le catalogue')} <span class="surligne">${t('matériel horeca')}</span></h1><p class="rv">${t('{n} références dans {s} catégories. Démo : une sélection des {total} produits relevés sur le site actuel.', { n: S.produits().length, s: fams.reduce((s, f) => s + f.sous.length, 0), total: nombre(S.RELEVE.site) })}</p></div></header>
    <div class="cat-liste">${fams.map((f, i) => { const pf = produitsDe(f.slug); return `<section class="cat-carte rv" style="${styleU(f.slug)};--i:${i % 2}">
      <a class="cat-carte-tete" href="#/c/${f.slug}"><img src="${src(photoU(f.slug, true))}" alt="" width="74" height="74" loading="lazy"><div><h2>${esc(nomF(f))}</h2><p>${t('{n} références · {m} marques', { n: pf.length, m: nbMarques(pf) })}</p></div>${ic('arrow')}</a>
      <ul>${f.sous.map((s) => `<li><a href="#/c/${f.slug}/${s.slug}"><span>${esc(nomS(s))}</span><small>${t('{n} réf.', { n: produitsDe(f.slug, s.slug).length })} ${ic('right')}</small></a></li>`).join('')}</ul>
    </section>`; }).join('')}</div></div>`);
}

/* ---------- Listes avec filtres ---------- */
let filtres = null, cleFiltres = '';
function monterListe(el, { cle, base, sousFamilles = null, titre = '', triDefaut = 'pertinence' }) {
  if (cleFiltres !== cle) {
    filtres = { marques: new Set(), sous: new Set(), min: '', max: '', stock: false, promo: false, expo: false, belge: false, tri: triDefaut, limite: 24 };
    cleFiltres = cle;
  }
  const modeVue = pref('vue') === 'liste' ? 'liste' : 'grille';
  const marques = [...new Set(base.map((p) => p.marque).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  const compte = (f) => base.filter(f).length;
  el.innerHTML = `${titre}
  <div class="catalogue">
    <aside class="filtres" id="filtres" aria-label="${t('Filtres')}">
      <div class="filtres-tete"><h2>${t('Filtrer')}</h2><button class="btn-icone" type="button" data-fermer-filtres aria-label="${t('Fermer')}">${ic('x')}</button></div>
      ${sousFamilles && sousFamilles.length > 1 ? `<div class="filtre"><h3>${t('Catégorie')}</h3>${sousFamilles.map((s) => `<label class="case"><input type="checkbox" name="sous" value="${s.slug}" ${filtres.sous.has(s.slug) ? 'checked' : ''}><span>${esc(nomS(s))}</span><small>${compte((p) => p.sous === s.slug)}</small></label>`).join('')}</div>` : ''}
      <div class="filtre"><h3>${t('Disponibilité et offres')}</h3>
        <label class="case"><input type="checkbox" name="stock" ${filtres.stock ? 'checked' : ''}><span>${t('En stock, livré en 24–72 h')}</span><small>${compte((p) => p.stock > 0)}</small></label>
        <label class="case"><input type="checkbox" name="promo" ${filtres.promo ? 'checked' : ''}><span>${t('En promotion')}</span><small>${compte((p) => S.remisePromo(p) > 0)}</small></label>
        ${compte((p) => p.etat === 'exposition') ? `<label class="case"><input type="checkbox" name="expo" ${filtres.expo ? 'checked' : ''}><span>${t('Modèles d’exposition')}</span><small>${compte((p) => p.etat === 'exposition')}</small></label>` : ''}
        ${compte(madeInBelgium) ? `<label class="case"><input type="checkbox" name="belge" ${filtres.belge ? 'checked' : ''}><span>Made in Belgium</span><small>${compte(madeInBelgium)}</small></label>` : ''}
      </div>
      <div class="filtre"><h3>${t('Prix HTVA')}</h3>
        <div class="filtre-prix"><input class="saisie" type="number" name="min" min="0" placeholder="${t('Min')}" value="${filtres.min}" inputmode="numeric" aria-label="${t('Prix minimum')}"><span>–</span><input class="saisie" type="number" name="max" min="0" placeholder="${t('Max')}" value="${filtres.max}" inputmode="numeric" aria-label="${t('Prix maximum')}"></div>
      </div>
      ${marques.length > 1 ? `<div class="filtre"><h3>${t('Marque')}</h3>${marques.map((m) => `<label class="case"><input type="checkbox" name="marque" value="${esc(m)}" ${filtres.marques.has(m) ? 'checked' : ''}><span>${esc(m)}</span><small>${compte((p) => p.marque === m)}</small></label>`).join('')}</div>` : ''}
      <button class="btn btn-plein btn-grand filtres-valider" type="button" data-fermer-filtres id="filtres-valider">${t('Voir les produits')}</button>
    </aside>
    <div>
      <div class="barre-outils">
        <p class="nb" id="liste-nb"></p>
        <button class="btn btn-filtres" type="button" data-ouvrir-filtres>${ic('filter')}${t('Filtrer')}</button>
        <label class="sr" for="tri">${t('Trier')}</label>
        <select id="tri">${[['pertinence', t('Pertinence')], ['prix-asc', t('Prix croissant')], ['prix-desc', t('Prix décroissant')], ['promo', t('Plus forte promo')], ['nouveau', t('Nouveautés')], ['nom', t('Nom A → Z')]].map(([v, x]) => `<option value="${v}" ${filtres.tri === v ? 'selected' : ''}>${x}</option>`).join('')}</select>
        <div class="vue-bascule" role="group" aria-label="${t('Affichage')}"><button type="button" data-vue="grille" aria-pressed="${modeVue === 'grille'}" aria-label="${t('Grille')}">${ic('grid')}</button><button type="button" data-vue="liste" aria-pressed="${modeVue === 'liste'}" aria-label="${t('Liste')}">${ic('list')}</button></div>
      </div>
      <div class="filtres-actifs" id="filtres-actifs"></div>
      <div class="grille-produits ${modeVue === 'liste' ? 'en-liste' : ''}" id="liste"></div>
      <div class="voir-plus" id="voir-plus"></div>
    </div>
  </div>`;
  const majListe = () => {
    let l = base.filter((p) => (!filtres.sous.size || filtres.sous.has(p.sous)) && (!filtres.marques.size || filtres.marques.has(p.marque))
      && (!filtres.stock || p.stock > 0) && (!filtres.promo || S.remisePromo(p) > 0) && (!filtres.expo || p.etat === 'exposition') && (!filtres.belge || madeInBelgium(p))
      && (filtres.min === '' || prixDe(p) >= +filtres.min) && (filtres.max === '' || prixDe(p) <= +filtres.max));
    const tri = {
      'prix-asc': (a, b) => prixDe(a) - prixDe(b), 'prix-desc': (a, b) => prixDe(b) - prixDe(a),
      promo: (a, b) => S.remisePromo(b) - S.remisePromo(a), nouveau: (a, b) => (b.ajoute || '').localeCompare(a.ajoute || ''), nom: (a, b) => nomP(a).localeCompare(nomP(b), I.LANGUE),
    }[filtres.tri];
    l = l.slice().sort(tri || ((a, b) => (b.stock > 0) - (a.stock > 0)));
    $('#liste-nb', el).textContent = l.length > 1 ? t('{n} produits', { n: l.length }) : t('{n} produit', { n: l.length });
    $('#filtres-valider', el).textContent = t('Voir les {n} produits', { n: l.length });
    $('#liste', el).innerHTML = l.length ? l.slice(0, filtres.limite).map(carte).join('') : `<div class="vide" style="grid-column:1/-1">${ic('search')}<h2>${t('Aucun produit avec ces filtres')}</h2><p class="muet">${t('Retirez un filtre ou demandez-nous : d’autres modèles sont disponibles sur commande.')}</p><button class="btn" type="button" data-effacer-filtres>${t('Effacer les filtres')}</button></div>`;
    $('#voir-plus', el).innerHTML = l.length > filtres.limite ? `<button class="btn btn-sombre" type="button" data-voir-plus>${t('Voir plus ({n} restants)', { n: l.length - filtres.limite })}</button>` : '';
    const actifs = [
      ...[...filtres.sous].map((s) => [`sous:${s}`, nomS(sousFamilles?.find((x) => x.slug === s) || { nom: s, slug: s })]), ...[...filtres.marques].map((m) => [`marque:${m}`, m]),
      ...(filtres.stock ? [['stock', t('En stock')]] : []), ...(filtres.promo ? [['promo', t('En promotion')]] : []), ...(filtres.expo ? [['expo', t('Exposition')]] : []), ...(filtres.belge ? [['belge', 'Made in Belgium']] : []),
      ...(filtres.min !== '' ? [['min', t('Dès {prix}', { prix: eur(filtres.min) })]] : []), ...(filtres.max !== '' ? [['max', t('Jusqu’à {prix}', { prix: eur(filtres.max) })]] : []),
    ];
    $('#filtres-actifs', el).innerHTML = actifs.map(([k, x]) => `<button type="button" data-retirer="${esc(k)}">${esc(x)}${ic('x')}</button>`).join('');
    localiserLiens(el);
    animer();
  };
  const f = $('#filtres', el);
  f.addEventListener('change', (e) => {
    const x = e.target;
    if (x.name === 'marque') x.checked ? filtres.marques.add(x.value) : filtres.marques.delete(x.value);
    else if (x.name === 'sous') x.checked ? filtres.sous.add(x.value) : filtres.sous.delete(x.value);
    else if (['stock', 'promo', 'expo', 'belge'].includes(x.name)) filtres[x.name] = x.checked;
    else if (['min', 'max'].includes(x.name)) filtres[x.name] = x.value;
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
  const FAQ = I.faq();
  const nf = nomF(f);
  const f0 = fil([[t('Catalogue'), '#/catalogue'], [nf]]);
  seo({
    titre: titreSeo(t('{nom} : matériel horeca en Belgique | Discount Horeca', { nom: nf }), t('{nom} horeca en Belgique | Discount Horeca', { nom: nf }), `${courtF(f)} | ${MARQUE}`),
    description: u.intro,
    ld: { '@graph': [f0.ld, { '@type': 'CollectionPage', name: nf, description: u.intro, url: `${BASE}${H('#/c/' + fam)}` }, ...(u.faq.length ? [faqLd(u.faq)] : [])] },
  });
  rendre(`<section class="hero-univers" style="${styleU(fam)}">
      <div class="conteneur">${f0.html}</div>
      <div class="conteneur hero-univers-l">
        <div>
          <span class="pill rv" style="--c:${u.couleur}">${esc(u.pastille)}</span>
          <h1 class="rv" style="--i:1">${esc(u.titre[0])}<br><span class="surligne" style="--c:${u.couleur}">${esc(u.titre[1])}</span></h1>
          <p class="hero-univers-intro rv" style="--i:2">${esc(u.intro)}</p>
          <div class="stats">
            <div class="stat rv" style="--c:${u.couleur}"><strong data-compte="${f.sous.length}">${f.sous.length}</strong><span>${t('Catégories')}</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:1"><strong data-compte="${ps.length}">${ps.length}</strong><span>${t('Références')}</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:2"><strong data-compte="${nbMarques(ps)}">${nbMarques(ps)}</strong><span>${t('Marques')}</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:3"><strong>${eur(prixMin(ps)).replace(/[,.]00(?=\s?€|$)/, '')}</strong><span>${t('Dès, HTVA')}</span></div>
          </div>
        </div>
        <figure class="hero-univers-photo rv-zoom"><img src="${src(photoU(fam))}" alt="${esc(t('{nom} : équipement de cuisine professionnelle', { nom: nf }))}" width="1344" height="752"><figcaption>${t('Illustration')}</figcaption></figure>
      </div>
    </section>
    <section class="section conteneur" style="${styleU(fam)}">
      <div class="section-titre"><div><span class="pill rv" style="--c:${u.couleur}">${t('{n} catégories', { n: f.sous.length })}</span><h2 class="rv" style="margin-top:14px">${t('Choisissez votre')} <span class="surligne" style="--c:${u.couleur}">${t('catégorie')}</span></h2></div></div>
      <div class="sous-grille">${f.sous.map((s, i) => { const pss = produitsDe(fam, s.slug); return `<a class="carte-sous rv" href="#/c/${fam}/${s.slug}" style="--i:${i % 3};--p:${i % 2 ? u.pastel : `color-mix(in srgb, ${u.couleur} 16%, #fff)`}">
        <span class="carte-sous-num">${String(i + 1).padStart(2, '0')}</span><span class="carte-sous-fleche">${ic('arrow')}</span>
        <span class="carte-sous-img"><img src="${src(s.image || f.image)}" alt="" loading="lazy" width="220" height="160"></span>
        <span><h3>${esc(nomS(s))}</h3><p><b>${t('{n} réf.', { n: pss.length })}</b> · ${t('dès {prix} HTVA', { prix: eur(prixMin(pss)) })}</p></span>
      </a>`; }).join('')}</div>
    </section>
    <section class="conteneur" id="zone-liste"></section>
    <section class="section conteneur">
      <div class="texte-seo">
        <div class="texte-seo-corps rv"><h2>${t('{nom} : le matériel horeca à prix discount', { nom: esc(nf) })}</h2>${u.seo.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        <div class="faq rv">${[...u.faq, FAQ[2], FAQ[5]].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      </div>
    </section>`);
  monterListe($('#zone-liste'), { cle: 'u/' + fam, base: ps, sousFamilles: f.sous, titre: `<div class="section-titre"><div><span class="pill rv" style="--c:${u.couleur}">${t('La sélection')}</span><h2 class="rv" style="margin-top:14px">${t('Tous les produits : {nom}', { nom: esc(courtF(f)) })}</h2></div></div>` });
}
function vueSous(fam, sous) {
  const f = S.famille(fam);
  const sf = f?.sous.find((s) => s.slug === sous);
  if (!sf) return vueIntrouvable();
  const u = U(fam);
  const ps = produitsDe(fam, sous);
  const FAQ = I.faq();
  const ns = nomS(sf), nf = nomF(f);
  const texte = u.sous[sous] || t('{nom} pour l’horeca, au prix HTVA et TVAC, livrés en Belgique.', { nom: ns });
  const f0 = fil([[t('Catalogue'), '#/catalogue'], [nf, `#/c/${fam}`], [ns]]);
  const vitrine = ps.slice().sort((a, b) => b.images.length - a.images.length || b.prixHT - a.prixHT)[0];
  seo({
    titre: titreSeo(t('{nom} horeca en Belgique | Discount Horeca', { nom: ns }), t('{nom} professionnels | Discount Horeca', { nom: ns }), `${ns} | ${MARQUE}`),
    description: `${texte} ${t('Prix HTVA et TVAC, livraison en Belgique, showroom à Sint-Pieters-Leeuw.')}`,
    ld: { '@graph': [f0.ld, { '@type': 'CollectionPage', name: ns, description: texte, url: `${BASE}${H(`#/c/${fam}/${sous}`)}`, mainEntity: { '@type': 'ItemList', numberOfItems: ps.length, itemListElement: ps.slice(0, 20).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${BASE}${H('#/p/' + p.id)}`, name: nomP(p) })) } }] },
  });
  rendre(`<section class="hero-univers" style="${styleU(fam)}">
      <div class="conteneur">${f0.html}</div>
      <div class="conteneur hero-univers-l" style="padding-bottom:30px">
        <div>
          <span class="pill rv" style="--c:${u.couleur}">${esc(nf)}</span>
          <h1 class="rv" style="--i:1">${esc(ns)} <span class="surligne" style="--c:${u.couleur}">${t('pour l’horeca')}</span></h1>
          <p class="hero-univers-intro rv" style="--i:2">${esc(texte)} ${t('Prix HTVA et TVAC, stock et délai sur chaque fiche.')}</p>
          <div class="stats">
            <div class="stat rv" style="--c:${u.couleur}"><strong data-compte="${ps.length}">${ps.length}</strong><span>${t('Références')}</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:1"><strong data-compte="${nbMarques(ps)}">${nbMarques(ps)}</strong><span>${t('Marques')}</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:2"><strong>${eur(prixMin(ps)).replace(/[,.]00(?=\s?€|$)/, '')}</strong><span>${t('Dès, HTVA')}</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:3"><strong data-compte="${ps.filter((p) => p.stock > 0).length}">${ps.filter((p) => p.stock > 0).length}</strong><span>${t('En stock, livrés en 24–72 h')}</span></div>
          </div>
        </div>
        ${vitrine ? `<div class="hero-sous-photo rv-zoom"><img src="${src(vitrine.images[0])}" alt="${esc(ns)}" width="520" height="520"></div>` : ''}
      </div>
      <div class="conteneur"><nav class="mini-sous" aria-label="${esc(t('Autres catégories : {nom}', { nom: nf }))}">${f.sous.map((s, i) => `<a href="#/c/${fam}/${s.slug}" ${s.slug === sous ? 'aria-current="page"' : ''}><img src="${src(s.image || f.image)}" alt="" width="44" height="44" loading="lazy"><b>${String(i + 1).padStart(2, '0')}</b>${esc(nomS(s))}</a>`).join('')}</nav></div>
    </section>
    <section class="conteneur" id="zone-liste" style="padding-top:28px"></section>
    <section class="section conteneur">
      <div class="texte-seo">
        <div class="texte-seo-corps rv"><h2>${t('{nom} : bien choisir', { nom: esc(ns) })}</h2><p>${esc(texte)}</p>${u.seo.slice(0, 1).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        <div class="faq rv">${[...u.faq, FAQ[2]].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      </div>
    </section>`);
  monterListe($('#zone-liste'), { cle: `s/${fam}/${sous}`, base: ps });
}
function vueRecherche(q) {
  const res = rechercher(q, 500);
  $('#q').value = q;
  const fams = [...new Set(res.map((p) => p.famille))];
  seo({ titre: `« ${q} » | ${MARQUE}`, description: t('Résultats pour {q} : prix HTVA et TVAC, stock et délai.', { q }) });
  rendre(`<div class="conteneur">${fil([[t('Recherche')], [q]]).html}<h1 class="page-titre">« ${esc(q)} » <span class="muet" style="font-size:.5em">${res.length > 1 ? t('{n} résultats', { n: res.length }) : t('{n} résultat', { n: res.length })}</span></h1></div><section class="conteneur" id="zone-liste"></section>`);
  monterListe($('#zone-liste'), { cle: 'r/' + q, base: res, sousFamilles: fams.length === 1 ? S.famille(fams[0]).sous : null });
}
function vuePromos() {
  const base = S.produits().filter((p) => S.remisePromo(p) > 0 && p.etat === 'neuf');
  seo({ titre: t('Promotions matériel horeca | Discount Horeca'), description: t('{n} promotions sur le matériel horeca : jusqu’à −{remise} % sur le prix habituel, prix HTVA et TVAC, livraison en Belgique.', { n: base.length, remise: remiseMax(base) }) });
  rendre(`<section class="hero-univers" style="--c:#f04e2e;--p:#fdebe7"><div class="conteneur">${fil([[t('Promotions')]]).html}</div>
    <div class="conteneur" style="padding-bottom:36px"><span class="pill rv">${t('Promotions')}</span>
      <h1 class="rv" style="--i:1">${t('Jusqu’à <span class="surligne" style="--c:#f04e2e">−{remise} %</span> sur le matériel horeca', { remise: remiseMax(base) })}</h1>
      <p class="hero-univers-intro rv" style="--i:2">${t('{n} produits en promotion, triés par la plus forte baisse. Le prix barré est le prix habituel affiché sur le site actuel ; l’économie est calculée sur le prix HTVA.', { n: base.length })}</p>
    </div></section><section class="conteneur" id="zone-liste" style="padding-top:28px"></section>`);
  monterListe($('#zone-liste'), { cle: 'promos', base, triDefaut: 'promo' });
}
function vueBonnesAffaires() {
  const r = S.reglages();
  const base = S.produits().filter((p) => S.bonneAffaire(p));
  seo({ titre: t('Bonnes affaires et exposition | Discount Horeca'), description: t('Promotions de plus de 35 % et modèles d’exposition du showroom : les bonnes affaires du matériel horeca, en quantités limitées.') });
  rendre(`<section class="hero-univers" style="--c:#f04e2e;--p:#fdebe7"><div class="conteneur">${fil([[t('Bonnes affaires')]]).html}</div>
    <div class="conteneur" style="padding-bottom:36px"><span class="pill rv">${t('Bonnes affaires')}</span>
      <h1 class="rv" style="--i:1">${t('Les <span class="surligne" style="--c:#f04e2e">bonnes affaires</span> du showroom')}</h1>
      <p class="hero-univers-intro rv" style="--i:2">${t('Promotions de −{seuil} % et plus, et modèles d’exposition contrôlés : du matériel neuf ou presque, sous garantie.', { seuil: r.seuilBonneAffaire })} <em>${t('Les modèles d’exposition et leurs défauts sont des exemples pour la démo.')}</em></p>
    </div></section><section class="conteneur" id="zone-liste" style="padding-top:28px"></section>`);
  monterListe($('#zone-liste'), { cle: 'affaires', base, triDefaut: 'promo' });
}

/* ---------- Fiche produit ---------- */
function vueProduit(id) {
  const p = S.produit(id);
  if (!p || p.enLigne === false) return vueIntrouvable();
  S.marquerVu(id);
  const f = S.famille(p.famille), sf = S.sousFamille(p.famille, p.sous);
  const r = S.reglages();
  const pu = S.prixUnitaire(p);
  const promo = S.remisePromo(p);
  const memes = S.produits().filter((x) => x.sous === p.sous && x.id !== p.id).slice(0, 10);
  const favs = S.favoris();
  const nom = nomP(p);
  const points = I.pointsP(p), texte = I.texteP(p), specs = I.specsP(p);
  const f0 = fil([[f ? nomF(f) : '', `#/c/${p.famille}`], [sf ? nomS(sf) : '', `#/c/${p.famille}/${p.sous}`], [nom]]);
  const wa = S.lienWhatsapp(t('Bonjour, une question sur : {nom} (réf. {ref})', { nom, ref: p.ref }));
  seo({
    titre: titreSeo(`${nom} | ${MARQUE}`, `${nom.slice(0, 40).trim()}… | ${MARQUE}`),
    description: `${nom}${p.marque ? ' ' + p.marque : ''} : ${eur(pu.unit)} ${t('HTVA')} (${eur(S.ttc(pu.unit))} ${t('TVAC')})${promo ? `, −${promo} %` : ''}. ${points.slice(0, 2).join('. ')}`,
    ld: { '@graph': [f0.ld, { '@type': 'Product', name: nom, sku: p.ref, ...(p.marque ? { brand: { '@type': 'Brand', name: p.marque } } : {}), image: p.images.filter((i) => !i.startsWith('data:')).map((i) => BASE + i), description: points.join('. ') || nom, category: `${f ? nomF(f) : ''} > ${sf ? nomS(sf) : ''}`, itemCondition: p.etat === 'exposition' ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition', offers: { '@type': 'Offer', url: `${BASE}${H('#/p/' + p.id)}`, priceCurrency: 'EUR', price: p.prixHT, priceSpecification: { '@type': 'UnitPriceSpecification', price: p.prixHT, priceCurrency: 'EUR', valueAddedTaxIncluded: false }, availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/BackOrder', seller: { '@id': BASE + '#org' } } }] },
  });
  const bloc = `<div class="bloc-gros" data-achat>
      <div class="prix-revendeur"><small>${pu.remiseRevendeur ? t('Votre prix revendeur · −{remise} % inclus', { remise: pu.remiseRevendeur }) : promo ? t('Promotion −{remise} %', { remise: promo }) : t('Prix')}</small>
        <div class="prix-revendeur-l"><strong class="prix" id="pu">${eur(pu.unit)} <small>${t('HTVA')}</small></strong>${pu.remiseRevendeur ? `<s>${eur(p.prixHT)}</s>` : pu.barre ? `<s>${eur(pu.barre)}</s><span class="pastille p-promo">−${promo} %</span>` : ''}</div>
        <p class="prix-tvac">${eur(S.ttc(pu.unit))} ${t('TVAC')} <span class="muet">· ${t('TVA 21 %')}</span></p></div>
      <div class="trio"><div><span>${t('Économie')}</span><strong>${pu.barre || pu.remiseRevendeur ? eur((pu.barre || p.prixHT) - pu.unit) : '—'}</strong></div><div class="marge"><span>${t('Acompte {taux} %', { taux: r.acompte })}</span><strong id="acompte">${eur(S.ttc(pu.unit) * r.acompte / 100)}</strong></div><div><span>${t('Livraison gratuite')}</span><strong>${pu.unit >= r.franco ? t('Oui') : t('dès {montant} €', { montant: nombre(r.franco) })}</strong></div></div>
      <div class="achat">${qteHtml(p)}<button class="btn btn-orange btn-grand" type="button" data-ajouter="${p.id}">${ic('cart')}${p.stock > 0 || p.etat === 'exposition' ? t('Ajouter au panier') : t('Commander')}</button></div>
      <div class="achat-total"><span id="ligne-detail"></span><strong id="ligne-total"></strong></div>
      <div class="achat-secondaires">
        <button class="btn" type="button" data-devis-produit>${ic('file')}${t('Devis avec installation')}</button>
        <a class="btn" href="${wa}" target="_blank" rel="noopener">${ic('phone')}${t('Question sur WhatsApp')}</a>
        ${S.estRevendeur() ? `<button class="btn" type="button" data-copier-fiche>${ic('copy')}${t('Copier la fiche')}</button>` : ''}
      </div>
    </div>`;
  rendre(`<div class="conteneur">${f0.html}
    <div class="fiche">
      <div class="galerie rv-zoom">
        <div class="galerie-principale">${badges(p)}<img id="photo" src="${src(p.images[0])}" alt="${esc(nom)}" width="620" height="620"></div>
        ${p.images.length > 1 ? `<div class="galerie-vignettes">${p.images.map((im, i) => `<button type="button" data-photo="${i}" aria-current="${i === 0}" aria-label="${t('Photo {n}', { n: i + 1 })}"><img src="${src(im)}" alt="" width="80" height="80"></button>`).join('')}</div>` : ''}
      </div>
      <div class="fiche-infos">
        ${p.marque ? `<p class="fiche-marque">${esc(p.marque)}</p>` : ''}
        <h1>${esc(nom)}</h1>
        <div class="fiche-meta"><span>${t('Réf.')} <strong>${esc(p.ref)}</strong></span>${dispo(p)}<button type="button" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}">${favs.includes(p.id) ? t('♥ Dans mes favoris') : t('♡ Ajouter aux favoris')}</button></div>
        ${p.etat === 'exposition' ? `<div class="encadre-sc"><strong>${t('Modèle d’exposition — pièce unique')}</strong><span>${esc(t(p.defaut || ''))}</span><span class="petit muet">${t('Article d’exemple pour la démo.')}</span></div>` : ''}
        ${bloc}
        <ul class="fiche-garanties">
          <li>${ic('truck')}<p><strong>${p.stock > 0 ? t('En stock : livré en 24 à 72 h') : t('Sur commande : délai confirmé sous 24 h')}</strong><span>${t('Partout en Belgique, gratuit dès {montant} HTVA', { montant: eur(r.franco) })}</span></p></li>
          <li>${ic('store')}<p><strong>${t('Retrait gratuit au showroom')}</strong><span>${t('Sint-Pieters-Leeuw, du lundi au samedi')}</span></p></li>
          <li>${ic('card')}<p><strong>${t('Bancontact, Payconiq, carte, virement')}</strong><span>${t('Ou {acompte} % d’acompte, solde à la livraison', { acompte: r.acompte })}</span></p></li>
          <li>${ic('shield')}<p><strong>${t('Garantie un an')}</strong><span>${t('Pièces et main-d’œuvre pour les professionnels')}</span></p></li>
        </ul>
      </div>
    </div>
    <section class="fiche-onglets">
      <div class="onglets-tete" role="tablist">
        <button role="tab" type="button" aria-selected="true" aria-controls="o-desc" id="t-desc">${t('Description')}</button>
        ${specs.length ? `<button role="tab" type="button" aria-selected="false" aria-controls="o-specs" id="t-specs">${t('Caractéristiques techniques')}</button>` : ''}
        <button role="tab" type="button" aria-selected="false" aria-controls="o-liv" id="t-liv">${t('Livraison et paiement')}</button>
      </div>
      <div class="onglet" role="tabpanel" id="o-desc" aria-labelledby="t-desc">
        ${I.traductionAuto(p) ? `<p class="trad-auto">${ic('info')}${t('Description traduite automatiquement depuis le français ; elle sera relue avant la mise en ligne.')}</p>` : ''}
        ${points.length ? `<ul class="points-cles">${points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        ${texte.map((x) => `<p style="margin-top:12px">${esc(x)}</p>`).join('')}
      </div>
      ${specs.length ? `<div class="onglet" role="tabpanel" id="o-specs" aria-labelledby="t-specs" hidden><div class="specs">${specs.map(([g, l]) => `<div><h3>${esc(g)}</h3><table>${l.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table></div>`).join('')}</div></div>` : ''}
      <div class="onglet" role="tabpanel" id="o-liv" aria-labelledby="t-liv" hidden><div class="specs">
        <div><h3>${t('Livraison')}</h3><table><tr><td>${t('Belgique, 1 livreur, devant la porte (rez-de-chaussée)')}</td><td>${p.stock > 0 ? t('24 à 72 h') : t('Sur commande')}</td></tr><tr><td>${t('Livraison gratuite')}</td><td>${t('dès {montant} HTVA', { montant: eur(r.franco) })}</td></tr><tr><td>${t('Sous ce montant')}</td><td>${t('{montant} HTVA (exemple)', { montant: eur(r.fraisLivraison) })}</td></tr><tr><td>${t('Retrait au showroom')}</td><td>${t('Gratuit')}</td></tr><tr><td>${t('Installation et raccordement')}</td><td>${t('Sur devis')}</td></tr><tr><td>${t('Hors Belgique')}</td><td>${t('Nous contacter avant de commander')}</td></tr></table></div>
        <div><h3>${t('Paiement')}</h3><table><tr><td>${t('En ligne')}</td><td>Bancontact, Payconiq, Visa, Mastercard</td></tr><tr><td>${t('Virement')}</td><td>${t('Préparation à réception')}</td></tr><tr><td>${t('Acompte')}</td><td>${t('{acompte} % à la commande, solde à la livraison', { acompte: r.acompte })}</td></tr><tr><td>${t('Au showroom')}</td><td>${t('Au retrait')}</td></tr></table></div>
      </div><p class="petit muet" style="margin-top:14px">${t('Conditions reprises des conditions de vente publiées ; frais de livraison sous le franco : valeur d’exemple, réglable dans l’admin.')}</p></div>
    </section>
    ${memes.length ? `<section class="section" style="padding-top:0"><div class="section-titre"><h2>${t('Dans la même catégorie')}</h2><a href="#/c/${p.famille}/${p.sous}">${t('Tout voir')} ${ic('arrow')}</a></div><div class="rangee">${memes.map(carte).join('')}</div></section>` : ''}
  </div>
  <div class="barre-mobile"><div><strong id="bm-prix">${eur(pu.unit)} ${t('HTVA')}</strong><small>${eur(S.ttc(pu.unit))} ${t('TVAC')}${promo ? ` · −${promo} %` : ''}</small></div><button class="btn btn-orange" type="button" data-ajouter-mobile>${ic('cart')}${t('Ajouter')}</button></div>`);
  document.body.classList.add('avec-barre');
  const inp = $('.bloc-gros input[name=qte]');
  const majPrix = () => {
    const q = S.ajusterQte(p, inp.value);
    $('#ligne-detail').textContent = `${q} × ${eur(pu.unit)} ${t('HTVA')} · ${eur(S.ttc(pu.unit * q))} ${t('TVAC')}`;
    $('#ligne-total').textContent = `${eur(pu.unit * q)} ${t('HTVA')}`;
    $('#acompte').textContent = eur(S.ttc(pu.unit * q) * r.acompte / 100);
  };
  inp.addEventListener('input', majPrix);
  inp.addEventListener('change', () => { inp.value = S.ajusterQte(p, inp.value); majPrix(); });
  majPrix();
  $('[data-ajouter-mobile]').addEventListener('click', () => $('.bloc-gros [data-ajouter]').click());
  $('[data-devis-produit]').addEventListener('click', () => demanderDevis([{ id: p.id, qte: S.ajusterQte(p, inp.value) }]));
  $('[data-copier-fiche]')?.addEventListener('click', async () => {
    const x = [nom, p.marque ? `${t('Marque')} : ${p.marque}` : '', `${t('Référence')} : ${p.ref}`, '', ...points.map((y) => `• ${y}`), '', ...texte, '', ...specs.flatMap(([g, l]) => [g, ...l.map(([k, v]) => `${k} : ${v}`), ''])].join('\n');
    try { await navigator.clipboard.writeText(x); toast(`${ic('check')} ${t('Fiche copiée')}`); } catch { toast(t('Copie impossible dans ce navigateur.'), 'erreur'); }
  });
  $$('[data-photo]').forEach((b) => b.addEventListener('click', () => { $('#photo').src = src(p.images[+b.dataset.photo]); $$('[data-photo]').forEach((x) => x.setAttribute('aria-current', x === b)); }));
  $$('[role=tab]').forEach((x) => x.addEventListener('click', () => {
    $$('[role=tab]').forEach((y) => y.setAttribute('aria-selected', y === x));
    $$('[role=tabpanel]').forEach((y) => { y.hidden = y.id !== x.getAttribute('aria-controls'); });
  }));
}

/* ---------- Packs ---------- */
function vuePacks() {
  seo({ titre: t('Packs d’ouverture horeca | Discount Horeca'), description: t('Packs friterie, pizzeria, brasserie, café et boulangerie : l’équipement de base d’un établissement en une commande, prix HTVA et TVAC.') });
  rendre(`<div class="conteneur">${fil([[t('Packs')]]).html}
    <h1 class="page-titre">${t('Packs')} <span class="surligne" style="--c:var(--orange)">${t('prêts à ouvrir')}</span></h1>
    <p class="hero-univers-intro" style="margin:-8px 0 22px">${t('Un appareil par poste, en stock de préférence. Ajoutez un pack d’un coup ou demandez un devis avec installation.')}</p>
    <div class="metiers">${PACKS.map((m, i) => { const pk = packDe(m); return `<article class="metier rv" style="--i:${i}">
      <div class="metier-tete">${ic(m.icone)}<div><h2 style="font-size:20px">${esc(t(m.nom))}</h2><p>${esc(t(m.desc))}</p></div></div>
      <div class="metier-imgs">${pk.map((p) => `<img src="${src(p.images[0])}" alt="${esc(nomP(p))}" loading="lazy" width="80" height="80">`).join('')}</div>
      <p class="petit">${t('{n} équipements', { n: pk.length })} · <strong>${eur(totalPack(pk))} ${t('HTVA')}</strong> · ${eur(S.ttc(totalPack(pk)))} ${t('TVAC')}</p>
      <a class="btn" href="#/pack/${m.slug}">${t('Voir le pack')} ${ic('arrow')}</a>
    </article>`; }).join('')}</div></div>`);
}
function vuePack(slug) {
  const m = PACKS.find((x) => x.slug === slug);
  if (!m) return vueIntrouvable();
  const pk = packDe(m);
  const tot = S.calculer(pk.map((p) => ({ id: p.id, qte: 1 })));
  const nm = t(m.nom);
  seo({ titre: t('{pack} : équipement complet | Discount Horeca', { pack: nm }), description: `${nm} : ${t(m.desc)} ${eur(tot.ht)} ${t('HTVA')}, ${t('livraison en Belgique')}.` });
  rendre(`<div class="conteneur">${fil([[t('Packs'), '#/packs'], [nm]]).html}
    <h1 class="page-titre">${esc(nm)} <span class="surligne" style="--c:var(--orange)">${t('prêt à ouvrir')}</span></h1>
    <p class="hero-univers-intro" style="margin:-8px 0 22px">${esc(t(m.desc))} ${t('Ajoutez le pack d’un coup, puis ajustez les quantités ou remplacez un modèle.')}</p>
    <div class="panier">
      <div class="panier-lignes">${pk.map((p) => `<div class="ligne"><a href="#/p/${p.id}"><img src="${src(p.images[0])}" alt="" width="96" height="96"></a><div><p class="petit muet">${esc(sousNom(p.famille, p.sous))}</p><h3><a href="#/p/${p.id}">${esc(nomP(p))}</a></h3><div class="ligne-meta"><span>${t('Réf.')} ${esc(p.ref)}</span>${dispo(p)}</div></div><div class="ligne-actions"><span class="ligne-total">${eur(prixDe(p))}<small class="muet"> ${t('HTVA')}</small></span><a class="btn btn-petit" href="#/c/${p.famille}/${p.sous}">${t('Autres modèles')}</a></div></div>`).join('')}</div>
      <aside class="resume"><h2>${esc(nm)}</h2>
        <div class="resume-l"><span>${t('{n} équipements', { n: pk.length })}</span><strong>${eur(tot.ht)} ${t('HTVA')}</strong></div>
        <div class="resume-l"><span>${t('Livraison')}</span><span>${tot.port ? eur(tot.port) + ' ' + t('HTVA') : t('Gratuite')}</span></div>
        <div class="resume-l"><span>${t('TVA 21 %')}</span><span>${eur(tot.tva)}</span></div>
        <div class="resume-total"><span>${t('Total TVAC')}</span><strong>${eur(tot.ttc)}</strong></div>
        <div class="resume-l vert"><span>${t('Acompte {taux} % à la commande', { taux: S.reglages().acompte })}</span><span>${eur(tot.acompte)}</span></div>
        <button class="btn btn-orange btn-grand" type="button" data-pack>${ic('cart')}${t('Ajouter le pack au panier')}</button>
        <button class="btn" type="button" data-pack-devis>${ic('file')}${t('Devis avec installation')}</button>
      </aside>
    </div></div>`);
  $('[data-pack]').addEventListener('click', () => { pk.forEach((p) => S.ajouter(p.id, 1)); toast(`${ic('check')} ${t('Pack ajouté : {n} équipements', { n: pk.length })} <a href="${H('#/panier')}">${t('Voir le panier')}</a>`); });
  $('[data-pack-devis]').addEventListener('click', () => demanderDevis(pk.map((p) => ({ id: p.id, qte: 1 }))));
}

/* ---------- Panier ---------- */
function vuePanier() {
  seo({ titre: t('Panier | Discount Horeca'), description: t('Votre panier.') });
  const lignes = S.panier();
  if (!lignes.length) {
    rendre(`<div class="conteneur">${fil([[t('Panier')]]).html}<h1 class="page-titre">${t('Votre panier')}</h1>
      <div class="vide">${ic('cart')}<h2>${t('Votre panier est vide')}</h2><p class="muet">${t('Parcourez le catalogue, profitez des promotions ou partez d’un pack d’ouverture.')}</p>
      <div class="hero-actions" style="margin:0;justify-content:center"><a class="btn btn-plein" href="#/catalogue">${t('Voir le catalogue')}</a><a class="btn" href="#/promos">${ic('percent')}${t('Promotions')}</a><a class="btn" href="#/packs">${ic('box')}${t('Packs')}</a></div></div></div>`);
    return;
  }
  const tot = S.calculer(lignes);
  const r = S.reglages();
  const n = S.nbArticles();
  rendre(`<div class="conteneur">${fil([[t('Panier')]]).html}<h1 class="page-titre">${t('Votre panier')} <span class="muet" style="font-size:.5em">${n > 1 ? t('{n} articles', { n }) : t('1 article')}</span></h1>
    <div class="panier">
      <div>
        <div class="panier-lignes">${tot.lignes.map((l) => `<div class="ligne">
          <a href="#/p/${l.id}"><img src="${src(l.p.images[0])}" alt="" width="96" height="96"></a>
          <div>
            <h3><a href="#/p/${l.id}">${esc(nomP(l.p))}</a></h3>
            <div class="ligne-meta"><span>${t('Réf.')} ${esc(l.p.ref)}</span>${l.p.stock > 0 ? `<span>${t('En stock')}</span>` : `<span class="pastille p-bleu">${t('Sur commande')}</span>`}</div>
            <p class="ligne-pu">${t('{prix} HTVA / pièce', { prix: eur(l.unit) })} ${l.barre || l.remiseRevendeur ? `<s>${eur(l.remiseRevendeur ? l.base : l.barre)}</s>` : ''} ${S.remisePromo(l.p) ? `<span class="pastille p-promo">−${S.remisePromo(l.p)} %</span>` : ''} ${l.remiseRevendeur ? `<span class="pastille p-bleu">${t('−{remise} % revendeur', { remise: l.remiseRevendeur })}</span>` : ''} <span class="petit muet">${eur(S.ttc(l.unit))} ${t('TVAC')}</span></p>
          </div>
          <div class="ligne-actions">${qteHtml(l.p, l.qte, l.id)}<span class="ligne-total">${eur(l.total)}</span><button class="btn btn-lien btn-petit btn-danger" type="button" data-retirer-ligne="${l.id}">${ic('trash')}${t('Retirer')}</button></div>
        </div>`).join('')}</div>
        <div class="hero-actions" style="margin-top:14px"><a class="btn" href="#/catalogue">${ic('left')}${t('Continuer')}</a><a class="btn" href="#/commande-rapide">${ic('zap')}${t('Ajouter par référence')}</a><button class="btn btn-lien btn-danger" type="button" data-vider>${t('Vider le panier')}</button></div>
      </div>
      <aside class="resume">
        <h2>${t('Récapitulatif')}</h2>
        ${jauges(tot)}
        <div class="resume-l"><span>${t('Total HTVA')}</span><strong>${eur(tot.ht)}</strong></div>
        ${tot.economie > 0 ? `<div class="resume-l vert"><span>${t('Votre économie')}</span><span>${eur(tot.economie)} ${t('HTVA')}</span></div>` : ''}
        <div class="resume-l"><span>${t('Livraison HTVA')}</span><span>${tot.port ? eur(tot.port) : t('Gratuite')}</span></div>
        <div class="resume-l"><span>${t('TVA {taux} %', { taux: r.tva })}</span><span>${eur(tot.tva)}</span></div>
        <div class="resume-total"><span>${t('Total TVAC')}</span><strong>${eur(tot.ttc)}</strong></div>
        <a class="btn btn-orange btn-grand" href="#/commande">${t('Commander')} ${ic('arrow')}</a>
        <button class="btn" type="button" data-devis-panier>${ic('file')}${t('Transformer en devis PDF')}</button>
        <p class="petit muet">${t('Paiement en ligne ou acompte de {acompte} % ({montant}), solde à la livraison. Retrait gratuit au showroom possible.', { acompte: r.acompte, montant: eur(tot.acompte) })}</p>
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
    const rr = await modale({ titre: t('Vider le panier ?'), corps: `<p>${t('Tous les articles seront retirés.')}</p>`, actions: [{ id: 'annuler', libelle: t('Annuler') }, { id: 'ok', libelle: t('Vider'), classe: 'btn-sombre' }] });
    if (rr.action === 'ok') { S.viderPanier(); vuePanier(); }
  });
  $('[data-devis-panier]').addEventListener('click', () => demanderDevis(S.panier()));
}

async function demanderDevis(lignes, message = '') {
  let c = S.clientConnecte();
  if (!c) { if (!(await ouvrirAcces(t('Le devis est établi au nom de votre société : connectez-vous ou entrez avec un compte de démo.')))) return; c = S.clientConnecte(); }
  if (!c) return;
  const r = await modale({
    titre: t('Demande de devis'),
    corps: `<p class="muet">${t('Un devis à votre nom, valable {jours} jours, imprimable en PDF. Précisez l’installation, le raccordement (gaz, électricité, eau), l’étage, les dimensions sur mesure ou la date d’ouverture : nous confirmons le prix final.', { jours: S.reglages().validiteDevis })}</p>
      <div class="carte-societe"><span><strong>${esc(c.societe)}</strong><br>${esc(c.contact)} · ${esc(c.email)}</span></div>
      <label class="champ"><span>${t('Votre message')}</span><textarea name="message" rows="3" placeholder="${t('Installation souhaitée, accès, délai…')}">${esc(message)}</textarea></label>`,
    actions: [{ id: 'annuler', libelle: t('Annuler') }, { id: 'ok', libelle: t('Créer le devis'), classe: 'btn-plein' }],
  });
  if (r.action !== 'ok') return;
  const d = S.creerDevis({ client: { id: c.id, societe: c.societe, contact: c.contact, email: c.email, tel: c.tel, bce: c.bce, tva: c.tva }, lignes, message: r.donnees.message });
  aller(`#/document/devis/${d.num}`);
  toast(`${ic('check')} ${t('Devis {num} créé', { num: d.num })}`);
}
function vueDevisProjet() {
  seo({ titre: t('Devis pour un projet horeca | Discount Horeca'), description: t('Ouverture, rénovation, cuisine complète : envoyez votre liste ou votre plan, nous chiffrons livraison, installation et raccordement.') });
  rendre(`<div class="conteneur">${fil([[t('Devis projet')]]).html}<h1 class="page-titre">${t('Un projet')} <span class="surligne" style="--c:var(--orange)">${t('d’ouverture ou de rénovation')}</span> ?</h1>
    <div class="connexion">
      <section class="carte-blanche"><h2>${t('Comment ça se passe')}</h2>
        <ul class="avantages-pro">
          <li>${ic('check')}${t('Vous envoyez votre liste, un plan ou des photos de la cuisine')}</li>
          <li>${ic('check')}${t('Nous vous rappelons sous 24 h ouvrées, ou vous passez au showroom')}</li>
          <li>${ic('check')}${t('Devis détaillé : matériel, inox sur mesure, livraison, installation et raccordement')}</li>
          <li>${ic('check')}${t('Acompte de {acompte} % à la commande, solde à la livraison', { acompte: S.reglages().acompte })}</li>
        </ul>
        <div class="hero-actions" style="margin:0"><a class="btn" href="${S.lienWhatsapp(t('Bonjour, j’ai un projet d’équipement horeca.'))}" target="_blank" rel="noopener">${ic('phone')}WhatsApp</a><a class="btn" href="#/infos/contact">${ic('pin')}${t('Showroom')}</a></div>
      </section>
      <section class="carte-blanche"><h2>${t('Votre projet')}</h2>
        <form id="form-projet" style="display:grid;gap:12px" novalidate>
          <label class="champ"><span>${t('Type d’établissement')}</span><select name="activite">${S.ACTIVITES.map((a) => `<option value="${esc(a)}">${esc(t(a))}</option>`).join('')}</select></label>
          <label class="champ"><span>${t('Votre besoin *')}</span><textarea name="message" rows="5" required placeholder="${t('Ex. : cuisine de 40 couverts, ligne de cuisson gaz série 700, hotte de 3 m, plonge et lave-vaisselle, ouverture en mars.')}"></textarea></label>
          <label class="champ"><span>${t('Plan ou photos (facultatif)')}</span><input type="file" name="fichiers" accept="image/*,.pdf" multiple></label>
          <button class="btn btn-orange btn-grand" type="submit">${t('Envoyer ma demande')}</button>
          <p class="petit muet">${t('Démo : la demande devient un devis dans l’espace admin ; aucun fichier n’est envoyé.')}</p>
        </form>
      </section>
    </div></div>`);
  $('#form-projet').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.message.value.trim();
    if (!msg) { e.target.message.closest('.champ').classList.add('erreur'); e.target.message.focus(); toast(t('Décrivez votre besoin en quelques mots.'), 'erreur'); return; }
    demanderDevis(S.panier(), `${t(e.target.activite.value)} : ${msg}`);
  });
}

/* ---------- Commande ---------- */
function vueCommande() {
  seo({ titre: t('Commande | Discount Horeca'), description: t('Validation de la commande.') });
  const lignes = S.panier();
  if (!lignes.length) { aller('#/panier'); return; }
  const c = S.clientConnecte();
  const r = S.reglages();
  rendre(`<div class="conteneur">${fil([[t('Panier'), '#/panier'], [t('Commande')]]).html}<h1 class="page-titre">${t('Commande')}</h1>
    <form class="tunnel" id="form-commande" novalidate>
      <div>
        <section class="etape">
          <div class="etape-titre"><span>1</span><h2>${c ? esc(c.societe) : t('Vos coordonnées')}</h2></div>
          ${c ? `<div class="carte-societe"><span>${esc(c.contact)} · ${esc(c.email)} · ${esc(c.tel)}${c.bce ? `<br>${t('N° d’entreprise')} ${esc(c.bce)} · ${t('TVA')} ${esc(c.tva)}` : ''}</span><span class="pastille ${S.estRevendeur(c) ? 'p-bleu' : 'p-vert'}">${S.estRevendeur(c) ? t('Revendeur −{remise} %', { remise: r.remiseRevendeur }) : esc(t(S.TYPES[c.type] || 'Compte pro'))}</span></div>`
    : `<p class="petit muet" style="margin-bottom:10px">${t('Déjà client ?')} <button class="btn-lien" type="button" data-voir-prix style="padding:0">${t('Connectez-vous')}</button> ${t('pour retrouver vos adresses.')}</p>
          <div class="choix choix-ligne">${[['pro', t('Professionnel'), t('Facture au nom de la société')], ['particulier', t('Particulier'), t('Facture à votre nom')]].map(([v, x, d], i) => `<label><input type="radio" name="profil" value="${v}" ${i === 0 ? 'checked' : ''}><span><strong>${x}</strong><small>${d}</small></span></label>`).join('')}</div>
          <div class="grille-champs">
            <label class="champ" data-pro><span>${t('Société *')}</span><input name="societe" autocomplete="organization"></label>
            <label class="champ" data-pro><span>${t('N° d’entreprise (BCE) *')}</span><input name="bce" inputmode="numeric" placeholder="0123.456.749"><small id="aide-bce">${t('10 chiffres · le n° de TVA est calculé tout seul.')}</small></label>
            <label class="champ"><span>${t('Nom et prénom *')}</span><input name="contact" autocomplete="name"></label>
            <label class="champ"><span>${t('E-mail *')}</span><input name="email" type="email" autocomplete="email"></label>
            <label class="champ"><span>${t('Téléphone *')}</span><input name="tel" type="tel" autocomplete="tel"></label>
          </div>
          <label class="case petit" style="margin-top:8px"><input type="checkbox" name="creer" checked><span>${t('Créer mon compte avec ces informations (suivi, factures, recommande)')}</span></label>`}
        </section>
        <section class="etape">
          <div class="etape-titre"><span>2</span><h2>${t('Livraison')}</h2></div>
          <div class="choix" id="choix-livraison">
            ${[['livraison', t('Livraison en Belgique'), t('1 livreur, devant la porte, au rez-de-chaussée · 24 à 72 h pour le stock · gratuite dès {montant} HTVA', { montant: eur(r.franco) })], ['installation', t('Livraison + installation et raccordement'), t('Mise en place, raccordement et mise en service chiffrés sur devis avant intervention')], ['showroom', t('Retrait au showroom'), `${r.adresse} · ${t('du lundi au samedi, de 9 h à 17 h')} · ${t('gratuit')}`]].map(([v, x, d], i) => `<label><input type="radio" name="mode" value="${v}" ${i === 0 ? 'checked' : ''}><span><strong>${x}</strong><small>${esc(d)}</small></span><em data-prix-mode="${v}"></em></label>`).join('')}
          </div>
          <div class="grille-champs" id="adresse">
            <label class="champ" style="grid-column:1/-1"><span>${t('Adresse de livraison *')}</span><input name="adresse" autocomplete="street-address" value="${esc(c?.adresse || '')}"></label>
            <label class="champ"><span>${t('Code postal *')}</span><input name="cp" inputmode="numeric" autocomplete="postal-code" value="${esc(c?.cp || '')}" maxlength="4"></label>
            <label class="champ"><span>${t('Commune *')}</span><input name="ville" autocomplete="address-level2" value="${esc(c?.ville || '')}"></label>
            <p class="petit muet" style="grid-column:1/-1">${t('Livraison en Belgique. Pour un autre pays,')} <a href="#/infos/contact">${t('contactez-nous avant de commander')}</a>.</p>
          </div>
        </section>
        <section class="etape">
          <div class="etape-titre"><span>3</span><h2>${t('Paiement')}</h2></div>
          <div class="choix" id="choix-paiement">
            ${[['bancontact', 'Bancontact / Payconiq', t('Paiement immédiat avec l’app bancaire · simulé dans la démo')], ['carte', t('Carte Visa / Mastercard'), t('Page sécurisée de la banque · simulé dans la démo')], ['acompte', t('Acompte de {acompte} % en ligne', { acompte: r.acompte }), t('Le solde est payé à la livraison ou au retrait (conditions de vente, art. 2.2)')], ['virement', t('Virement bancaire'), t('Préparation à réception du virement')], ['showroom', t('Paiement au showroom'), t('Uniquement avec le retrait au showroom')]].map(([v, x, d], i) => `<label><input type="radio" name="paiement" value="${v}" ${i === 0 ? 'checked' : ''}><span><strong>${x}</strong><small>${d}</small></span><em data-prix-paiement="${v}"></em></label>`).join('')}
          </div>
          <div class="grille-champs">
            <label class="champ"><span>${t('Votre référence (bon de commande)')}</span><input name="refClient" placeholder="BC-2026-0145"></label>
            <label class="champ"><span>${t('Instructions (accès, horaires, étage…)')}</span><input name="note"></label>
          </div>
        </section>
      </div>
      <aside class="resume" id="resume-commande"></aside>
    </form></div>`);
  const form = $('#form-commande');
  const majResume = () => {
    const mode = form.mode.value;
    const showroomSeul = form.querySelector('input[name=paiement][value=showroom]');
    showroomSeul.disabled = mode !== 'showroom';
    if (showroomSeul.disabled && showroomSeul.checked) form.querySelector('input[name=paiement][value=bancontact]').checked = true;
    const tot = S.calculer(lignes, mode);
    $('#adresse').hidden = mode === 'showroom';
    $$('[data-pro]').forEach((x) => { x.hidden = form.profil?.value === 'particulier'; });
    $$('[data-prix-mode]').forEach((e) => { const tt = S.calculer(lignes, e.dataset.prixMode); e.textContent = e.dataset.prixMode === 'installation' ? (tt.port ? eur(tt.port) + ' + ' + t('devis') : t('Devis')) : tt.port ? eur(tt.port) + ' ' + t('HTVA') : t('Gratuit'); });
    $('[data-prix-paiement=acompte]').textContent = eur(tot.acompte);
    const pay = form.paiement.value;
    $('#resume-commande').innerHTML = `<h2>${t('Votre commande')}</h2>
      <div class="resume-lignes">${tot.lignes.map((l) => `<div><img src="${src(l.p.images[0])}" alt="" width="44" height="44"><span>${l.qte} × ${esc(nomP(l.p))}</span><strong>${eur(l.total)}</strong></div>`).join('')}</div>
      <div class="resume-l"><span>${t('Total HTVA')}</span><strong>${eur(tot.ht)}</strong></div>
      ${tot.economie > 0 ? `<div class="resume-l vert"><span>${t('Votre économie')}</span><span>${eur(tot.economie)}</span></div>` : ''}
      <div class="resume-l"><span>${t('Livraison HTVA')}</span><span>${mode === 'showroom' ? t('Retrait gratuit') : tot.port ? eur(tot.port) : t('Gratuite')}${mode === 'installation' ? ' ' + t('+ installation sur devis') : ''}</span></div>
      <div class="resume-l"><span>${t('TVA {taux} %', { taux: r.tva })}</span><span>${eur(tot.tva)}</span></div>
      <div class="resume-total"><span>${t('Total TVAC')}</span><strong>${eur(tot.ttc)}</strong></div>
      ${pay === 'acompte' ? `<div class="resume-l vert"><span>${t('À payer maintenant ({taux} %)', { taux: r.acompte })}</span><strong>${eur(tot.acompte)}</strong></div><div class="resume-l"><span>${t('Solde à la livraison')}</span><span>${eur(tot.ttc - tot.acompte)}</span></div>` : ''}
      <label class="case petit"><input type="checkbox" name="cgv" required><span>${t('J’accepte les')} <a href="${H('#/infos/conditions')}" target="_blank">${t('conditions générales de vente')}</a>.</span></label>
      <button class="btn btn-orange btn-grand" type="submit">${ic('check')}${pay === 'bancontact' || pay === 'carte' ? t('Payer {montant}', { montant: eur(tot.ttc) }) : pay === 'acompte' ? t('Payer l’acompte de {montant}', { montant: eur(tot.acompte) }) : t('Valider la commande')}</button>
      <p class="petit muet">${t('Démo : aucune somme n’est prélevée.')}</p>`;
  };
  form.addEventListener('change', (e) => { if (['mode', 'paiement', 'profil'].includes(e.target.name)) majResume(); });
  form.bce?.addEventListener('input', () => {
    const v = form.bce.value.replace(/\D/g, '');
    const aide = $('#aide-bce');
    if (v.length === 10) { const ok = S.bceValide(v); aide.textContent = ok ? t('Numéro valide ✓ · TVA {tva}', { tva: S.tvaDepuisBce(v) }) : t('Numéro invalide : vérifiez les chiffres.'); aide.style.color = ok ? 'var(--vert)' : 'var(--rouge)'; }
  });
  majResume();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const pro = !c && d.profil === 'pro';
    const requis = [...(c ? [] : ['contact', 'email', 'tel']), ...(pro ? ['societe', 'bce'] : []), ...(d.mode === 'showroom' ? [] : ['adresse', 'cp', 'ville'])];
    let err = null;
    $$('.champ.erreur', form).forEach((x) => x.classList.remove('erreur'));
    for (const k of requis) if (!String(d[k] || '').trim()) { form[k].closest('.champ').classList.add('erreur'); err = err || form[k]; }
    if (pro && d.bce && !S.bceValide(d.bce)) { form.bce.closest('.champ').classList.add('erreur'); err = err || form.bce; }
    if (d.mode !== 'showroom' && d.cp && !/^\d{4}$/.test(d.cp.trim())) { form.cp.closest('.champ').classList.add('erreur'); err = err || form.cp; }
    if (err) { err.focus(); toast(t('Vérifiez les champs en rouge.'), 'erreur'); return; }
    if (!d.cgv) { toast(t('Merci d’accepter les conditions générales de vente.'), 'erreur'); return; }
    let cli = c;
    if (!cli) {
      const infos = { type: pro ? 'horeca' : 'particulier', societe: pro ? d.societe.trim() : d.contact.trim(), contact: d.contact.trim(), email: d.email.trim(), tel: d.tel.trim(), adresse: d.adresse || '', cp: d.cp || '', ville: d.ville || '', pays: 'Belgique', langue: I.LANGUE, ...(pro ? { bce: S.bceFormat(d.bce), tva: S.tvaDepuisBce(d.bce) } : {}) };
      if (d.creer) { cli = S.creerClient(infos); S.connecter(cli.id); } else cli = { id: null, ...infos };
    }
    const cmd = S.passerCommande({
      client: { id: cli.id, societe: cli.societe, contact: cli.contact, email: cli.email, tel: cli.tel, bce: cli.bce || '', tva: cli.tva || '' },
      livraison: d.mode === 'showroom' ? { mode: 'showroom', cp: d.cp || cli.cp || '' } : { mode: d.mode, adresse: d.adresse, cp: d.cp, ville: d.ville, pays: 'Belgique' },
      paiement: d.paiement, note: d.note, refClient: d.refClient, lignes,
    });
    S.viderPanier();
    try { sessionStorage.setItem('dh-suivi-' + cmd.num, '1'); } catch { /* rien */ }
    aller(`#/merci/${cmd.num}`);
  });
}

/* ---------- Suivi ---------- */
function chronologie(c) {
  const retrait = c.livraison?.mode === 'showroom';
  const etapes = ['validee', 'preparation', 'expediee', 'livree'];
  if (c.historique.some((h) => h.statut === 'attente')) etapes.unshift('attente');
  const idx = etapes.indexOf(c.statut);
  const quand = (s) => c.historique.filter((h) => h.statut === s).pop()?.date;
  const icones = { attente: 'euro', validee: 'check', preparation: 'box', expediee: retrait ? 'store' : 'truck', livree: 'pin' };
  return `<div class="chrono" style="--n:${etapes.length}">${etapes.map((s, i) => {
    const etat = c.statut === 'annulee' ? '' : i < idx || (i === idx && s === 'livree') ? 'fait' : i === idx ? 'encours' : '';
    return `<div class="chrono-etape ${etat}"><span class="chrono-pastille">${etat === 'fait' ? ic('check') : ic(icones[s])}</span><span>${t(S.statut(s, retrait).nom)}${quand(s) ? `<small><br>${new Date(quand(s)).toLocaleString(I.LANGUES[I.LANGUE].locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</small>` : ''}</span></div>`;
  }).join('')}</div>`;
}
function detailCommande(c) {
  const retrait = c.livraison?.mode === 'showroom';
  return `<section class="carte-blanche">
      <div class="section-titre" style="margin:0"><div><h2>${t('Commande {num}', { num: esc(c.num) })}</h2><p>${t('Passée le {date}', { date: dateLongue(c.date) })} · ${esc(t(S.PAIEMENTS[c.paiement] || ''))}${c.refClient ? ` · ${t('votre réf.')} ${esc(c.refClient)}` : ''}</p></div>
      <span class="pastille ${c.statut === 'livree' ? 'p-vert' : c.statut === 'annulee' ? 'p-rouge' : c.statut === 'attente' ? 'p-jaune' : 'p-bleu'}">${t(S.statut(c.statut, retrait).nom)}</span></div>
      ${c.statut === 'annulee' ? `<div class="info-bulle jaune">${ic('info')}<span>${t('Cette commande a été annulée.')}</span></div>` : chronologie(c)}
      ${c.suivi ? `<div class="suivi-colis">${ic('truck')}<span>${esc(t(c.transporteur))} · ${t('n° de suivi')} <code>${esc(c.suivi)}</code></span></div>` : ''}
      ${c.livraison?.mode === 'installation' ? `<div class="suivi-colis">${ic('settings')}<span>${t('Installation et raccordement : un technicien vous appelle pour fixer le rendez-vous et confirmer le devis.')}</span></div>` : ''}
      ${retrait && c.statut === 'expediee' ? `<div class="suivi-colis">${ic('store')}<span>${t('Votre commande vous attend au showroom :')} <strong>${esc(S.reglages().adresse)}</strong></span></div>` : ''}
      ${c.peppol ? `<div class="suivi-colis">${ic('file')}<span>${t('Facture envoyée par Peppol le {date}', { date: dateCourte(c.peppol.date) })}</span></div>` : ''}
    </section>
    <section class="carte-blanche"><h2>${t('Articles')}</h2>
      <div class="tableau-scroll"><table class="tableau"><thead><tr><th></th><th>${t('Article')}</th><th class="num">${t('Qté')}</th><th class="num">${t('PU HTVA')}</th><th class="num">${t('Total HTVA')}</th></tr></thead><tbody>
      ${c.lignes.map((l) => { const p = S.produit(l.id); return `<tr><td><img src="${src(l.image)}" alt="" width="44" height="44" style="object-fit:contain"></td><td>${esc(p ? nomP(p) : l.nom)}<br><small class="muet">${t('Réf.')} ${esc(l.ref)}</small></td><td class="num">${l.qte}</td><td class="num">${eur(l.unit)}</td><td class="num">${eur(l.total)}</td></tr>`; }).join('')}
      </tbody></table></div>
      <div class="resume-l"><span>${t('Total HTVA')}</span><strong>${eur(c.totaux.ht)}</strong></div>
      <div class="resume-l"><span>${t('Livraison HTVA')}</span><span>${c.totaux.port ? eur(c.totaux.port) : retrait ? t('Retrait gratuit') : t('Gratuite')}</span></div>
      <div class="resume-total"><span>${t('Total TVAC')}</span><strong>${eur(c.totaux.ttc)}</strong></div>
      ${c.totaux.acompte ? `<div class="resume-l vert"><span>${t('Acompte payé')}</span><span>${t('{montant} · solde {solde} à la livraison', { montant: eur(c.totaux.acompte), solde: eur(c.totaux.ttc - c.totaux.acompte) })}</span></div>` : ''}
      <div class="hero-actions" style="margin-top:4px"><a class="btn" href="#/document/facture/${c.num}">${ic('file')}${t('Facture')}</a><button class="btn" type="button" data-recommander="${c.num}">${ic('repeat')}${t('Recommander')}</button></div>
    </section>`;
}
function vueMerci(num) {
  const c = S.commande(num);
  if (!c) return vueIntrouvable();
  seo({ titre: t('Commande confirmée | Discount Horeca'), description: '' });
  rendre(`<div class="conteneur merci">
    <div class="merci-tete">${ic('check')}<h1>${t('Merci, votre commande est enregistrée')}</h1>
      <p>${t('Commande <strong>{num}</strong> · {montant} TVAC. Un récapitulatif part à <strong>{email}</strong>.', { num: esc(c.num), montant: eur(c.totaux.ttc), email: esc(c.client.email) })}</p>
      ${c.paiement === 'virement' ? `<div class="info-bulle jaune">${ic('info')}<span>${t('Virement de <strong>{montant}</strong> avec la communication <strong>{num}</strong> : les coordonnées bancaires figurent dans l’e-mail de confirmation. La préparation démarre à réception.', { montant: eur(c.totaux.ttc), num: esc(c.num) })}</span></div>` : ''}
      ${c.paiement === 'acompte' ? `<div class="info-bulle vert">${ic('check')}<span>${t('Acompte de <strong>{montant}</strong> payé (simulé). Solde de {solde} à la livraison.', { montant: eur(c.totaux.acompte), solde: eur(c.totaux.ttc - c.totaux.acompte) })}</span></div>` : ''}
      <div class="hero-actions" style="justify-content:center;margin:0"><a class="btn btn-plein" href="#/suivi/${c.num}">${ic('truck')}${t('Suivre la commande')}</a><a class="btn" href="#/document/facture/${c.num}">${ic('file')}${t('Facture')}</a><a class="btn" href="#/">${t('Accueil')}</a></div>
    </div>
    <div class="info-bulle">${ic('info')}<span>${t('<strong>Pour la démo :</strong> ouvrez l’<a href="admin/#/commandes/{num}" target="_blank" rel="noopener"><strong>espace admin</strong></a>, faites avancer la commande (préparation, livraison, livrée), envoyez la facture par Peppol, puis revenez au suivi : il se met à jour tout seul.', { num: c.num })}</span></div>
    ${detailCommande(c)}</div>`);
}
function vueSuivi(num) {
  const cli = S.clientConnecte();
  const c = num ? S.commande(num) : null;
  let ok = false;
  try { ok = !!(c && (sessionStorage.getItem('dh-suivi-' + num) || (cli && c.client.id === cli.id))); } catch { ok = !!(c && cli && c.client.id === cli.id); }
  seo({ titre: t('Suivi de commande | Discount Horeca'), description: t('Suivez votre commande : préparation, livraison, retrait au showroom.') });
  if (c && ok) { rendre(`<div class="conteneur merci">${fil([[t('Suivi de commande'), '#/suivi'], [c.num]]).html}${detailCommande(c)}</div>`); return; }
  const miennes = cli ? S.commandes().filter((x) => x.client.id === cli.id).slice(0, 6) : [];
  const ex = S.commandes().find((x) => x.statut === 'expediee' && x.livraison?.cp);
  rendre(`<div class="conteneur merci">${fil([[t('Suivi de commande')]]).html}
    <h1 class="page-titre" style="margin-bottom:0">${t('Suivre une commande')}</h1>
    <form class="carte-blanche" id="form-suivi">
      <p class="muet">${t('Numéro de commande et code postal de livraison (ou e-mail).')}</p>
      <div class="grille-champs"><label class="champ"><span>${t('N° de commande')}</span><input name="num" required placeholder="DH-2026-03181" value="${esc(num || '')}"></label><label class="champ"><span>${t('Code postal ou e-mail')}</span><input name="verif" required placeholder="1060"></label></div>
      <button class="btn btn-plein" type="submit">${ic('search')}${t('Afficher le suivi')}</button>
      ${ex ? `<p class="petit muet">${t('Exemple : {num} avec le code postal {cp}.', { num: esc(ex.num), cp: esc(ex.livraison.cp) })}</p>` : ''}
    </form>
    ${miennes.length ? `<section class="carte-blanche"><h2>${t('Vos dernières commandes')}</h2><div class="tableau-scroll"><table class="tableau"><tbody>${miennes.map((x) => `<tr><td><strong>${esc(x.num)}</strong><br><small class="muet">${dateCourte(x.date)}</small></td><td>${t(S.statut(x.statut, x.livraison?.mode === 'showroom').nom)}</td><td class="num">${eur(x.totaux.ht)} ${t('HTVA')}</td><td class="num"><a class="btn btn-petit" href="#/suivi/${x.num}">${t('Suivre')}</a></td></tr>`).join('')}</tbody></table></div></section>` : ''}
  </div>`);
  $('#form-suivi').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = e.target.num.value.trim().toUpperCase();
    const v = S.norm(e.target.verif.value).replace(/\s/g, '');
    const cmd = S.commande(n);
    if (!cmd || !(S.norm(cmd.livraison?.cp).replace(/\s/g, '') === v || S.norm(cmd.client.email) === v)) { toast(t('Aucune commande ne correspond.'), 'erreur'); return; }
    try { sessionStorage.setItem('dh-suivi-' + n, '1'); } catch { /* rien */ }
    aller(`#/suivi/${n}`);
  });
}

/* ---------- Compte ---------- */
function vueCompte(onglet, params) {
  const c = S.clientConnecte();
  seo({ titre: t('Mon compte | Discount Horeca'), description: t('Commandes, devis, factures et favoris.') });
  if (!c || params?.get('inscription')) return vueConnexion(params);
  onglet = onglet || 'tableau';
  const r = S.reglages();
  const mes = S.commandes().filter((x) => x.client.id === c.id);
  const mesDevis = S.devis().filter((x) => x.client.id === c.id);
  const achats = S.achatsAnnuels(c.id);
  const enCours = mes.filter((x) => !['livree', 'annulee'].includes(x.statut));
  const rev = S.estRevendeur(c);
  const menu = [['tableau', 'chart', t('Tableau de bord')], ['commandes', 'box', t('Commandes')], ['devis', 'file', t('Devis')], ...(rev ? [['export', 'download', t('Export catalogue')]] : []), ['favoris', 'heart', t('Favoris')], ['societe', 'user', c.type === 'particulier' ? t('Mes informations') : t('Société')]];
  const ligneCmd = (x) => `<tr><td><strong>${esc(x.num)}</strong><br><small class="muet">${dateCourte(x.date)}${x.refClient ? ' · ' + esc(x.refClient) : ''}</small></td><td><span class="pastille ${x.statut === 'livree' ? 'p-vert' : x.statut === 'attente' ? 'p-jaune' : x.statut === 'annulee' ? 'p-rouge' : 'p-bleu'}">${t(S.statut(x.statut, x.livraison?.mode === 'showroom').court)}</span></td><td class="num">${eur(x.totaux.ht)} ${t('HTVA')}</td><td class="num" style="white-space:nowrap"><a class="btn btn-petit" href="#/suivi/${x.num}">${t('Suivre')}</a> <button class="btn btn-petit" type="button" data-recommander="${x.num}" title="${t('Remettre au panier')}">${ic('repeat')}</button></td></tr>`;
  let contenu;
  if (onglet === 'tableau') {
    contenu = `${c.type === 'revendeur' && c.statut !== 'valide' ? `<div class="info-bulle jaune">${ic('clock')}<span>${t('Votre compte revendeur est <strong>en cours de validation</strong> (24 h ouvrées). En attendant, vous commandez au prix public.')} <em>${t('Démo : validez-le depuis l’<a href="admin/#/clients" target="_blank" rel="noopener"><strong>espace admin</strong></a>.')}</em></span></div>` : ''}
      <div class="kpis">
        <div class="kpi"><span>${t('Commandes en cours')}</span><strong>${enCours.length}</strong></div>
        <div class="kpi"><span>${t('Achats sur 12 mois HTVA')}</span><strong>${eur(achats)}</strong></div>
        <div class="kpi"><span>${t('Devis')}</span><strong>${mesDevis.length}</strong></div>
        <div class="kpi"><span>${t('Vos prix')}</span><strong style="font-size:17px">${rev ? t('Revendeur −{remise} %', { remise: r.remiseRevendeur }) : t('Prix public HTVA')}</strong></div>
      </div>
      <section class="carte-blanche"><div class="section-titre" style="margin:0"><h2>${t('Dernières commandes')}</h2><a href="#/compte/commandes">${t('Tout voir')} ${ic('arrow')}</a></div>
        ${mes.length ? `<div class="tableau-scroll"><table class="tableau"><tbody>${mes.slice(0, 4).map(ligneCmd).join('')}</tbody></table></div>` : `<p class="muet">${t('Aucune commande pour l’instant.')}</p>`}</section>
      <section class="carte-blanche"><h2>${t('Votre conseiller')}</h2><p>${t('Une question, une pièce détachée, un rendez-vous au showroom :')} <a href="tel:${esc(r.telephone.replace(/\s/g, ''))}"><strong>${esc(r.telephone)}</strong></a> ${t('ou')} <a href="${S.lienWhatsapp(t('Bonjour, {societe} ici.', { societe: c.societe }))}" target="_blank" rel="noopener"><strong>WhatsApp</strong></a>.</p></section>`;
  } else if (onglet === 'commandes') {
    contenu = `<section class="carte-blanche"><h2>${t('Commandes')}</h2>${mes.length ? `<div class="tableau-scroll"><table class="tableau"><thead><tr><th>${t('Commande')}</th><th>${t('Statut')}</th><th class="num">${t('Montant')}</th><th></th></tr></thead><tbody>${mes.map(ligneCmd).join('')}</tbody></table></div>` : `<p class="muet">${t('Aucune commande.')}</p>`}</section>`;
  } else if (onglet === 'devis') {
    const etatDevis = { demande: t('Demandé'), envoye: t('Reçu'), converti: t('Commandé') };
    contenu = `<section class="carte-blanche"><div class="section-titre" style="margin:0"><h2>${t('Devis')}</h2><a href="#/devis-projet">${t('Nouveau devis')} ${ic('arrow')}</a></div>${mesDevis.length ? `<div class="tableau-scroll"><table class="tableau"><tbody>${mesDevis.map((d) => `<tr><td><strong>${esc(d.num)}</strong><br><small class="muet">${dateCourte(d.date)} · ${t('valable jusqu’au {date}', { date: dateCourte(d.validite) })}</small></td><td><span class="pastille ${d.statut === 'converti' ? 'p-vert' : d.statut === 'envoye' ? 'p-bleu' : 'p-jaune'}">${etatDevis[d.statut]}</span></td><td class="num">${eur(d.totaux.ht)} ${t('HTVA')}</td><td class="num"><a class="btn btn-petit" href="#/document/devis/${d.num}">${t('Voir')}</a></td></tr>`).join('')}</tbody></table></div>` : `<p class="muet">${t('Aucun devis.')}</p>`}</section>`;
  } else if (onglet === 'export' && rev) {
    contenu = `<section class="carte-blanche"><h2>${t('Export du catalogue')}</h2>
      <p class="muet">${t('Un fichier CSV (point-virgule, lisible dans Excel, importable dans Shopify, PrestaShop ou WooCommerce) : référence, nom, marque, catégories, <strong>votre prix revendeur HTVA</strong>, prix public HTVA et TVAC, stock, points clés, caractéristiques et liens des photos.')}</p>
      <div class="hero-actions" style="margin:0"><button class="btn btn-plein" type="button" data-export>${ic('download')}${t('Télécharger le catalogue ({n} références)', { n: S.produits().length })}</button></div>
      <p class="petit muet">${t('Dans la vraie version : flux mis à jour chaque nuit (prix, stocks) à l’adresse privée de votre compte.')}</p></section>`;
  } else if (onglet === 'favoris') {
    const favs = S.favoris().map(S.produit).filter((p) => p && p.enLigne !== false);
    contenu = favs.length ? `<div class="grille-produits">${favs.map(carte).join('')}</div>` : `<div class="vide">${ic('heart')}<h2>${t('Aucun favori')}</h2><p class="muet">${t('Touchez le cœur d’un produit pour le retrouver ici.')}</p></div>`;
  } else {
    contenu = `<section class="carte-blanche"><h2>${c.type === 'particulier' ? t('Mes informations') : t('Société')}</h2><div class="specs"><div><table>
      <tr><td>${t('Nom')}</td><td>${esc(c.societe)}</td></tr><tr><td>${t('Type de compte')}</td><td>${esc(t(S.TYPES[c.type] || '—'))}</td></tr><tr><td>${t('Activité')}</td><td>${esc(c.activite ? t(c.activite) : '—')}</td></tr><tr><td>${t('Contact')}</td><td>${esc(c.contact)}</td></tr>
      <tr><td>${t('E-mail')}</td><td>${esc(c.email)}</td></tr><tr><td>${t('Téléphone')}</td><td>${esc(c.tel)}</td></tr></table></div><div><table>
      <tr><td>${t('N° d’entreprise')}</td><td>${esc(c.bce || '—')}</td></tr><tr><td>${t('TVA')}</td><td>${esc(c.tva || '—')}</td></tr><tr><td>${t('Adresse')}</td><td>${esc(c.adresse || '—')}<br>${esc(c.cp || '')} ${esc(c.ville || '')}</td></tr>
      <tr><td>${t('Langue')}</td><td>${esc(I.LANGUES[c.langue]?.nom || 'Français')}</td></tr><tr><td>${t('Statut')}</td><td>${c.statut === 'valide' ? t('Actif') : c.statut === 'refuse' ? t('Refusé') : t('En validation')}</td></tr></table></div></div></section>`;
  }
  rendre(`<div class="conteneur">${fil([[t('Mon compte')]]).html}<h1 class="page-titre">${t('Bonjour {prenom}', { prenom: esc((c.contact || '').split(' ')[0]) })}</h1>
    <div class="compte">
      <nav class="compte-menu" aria-label="${t('Compte')}"><div class="compte-societe"><strong>${esc(c.societe)}</strong><span class="pastille ${c.statut === 'valide' ? 'p-vert' : 'p-jaune'}">${rev ? t('Revendeur −{remise} %', { remise: r.remiseRevendeur }) : c.statut === 'valide' ? esc(t(S.TYPES[c.type] || 'Compte')) : t('En validation')}</span>${c.exemple ? `<span class="pastille p-gris">${t('Compte d’exemple')}</span>` : ''}</div>
        ${menu.map(([k, i, x]) => `<a href="#/compte/${k}" ${onglet === k ? 'aria-current="page"' : ''}>${ic(i)}${x}</a>`).join('')}
        <button type="button" data-deconnexion>${ic('logout')}${t('Se déconnecter')}</button></nav>
      <div style="display:grid;gap:16px">${contenu}</div>
    </div></div>`);
  $('[data-deconnexion]').addEventListener('click', () => { S.deconnecter(); aller('#/compte'); toast(t('Vous êtes déconnecté.')); });
  $('[data-export]')?.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([S.exportCatalogueCsv()], { type: 'text/csv;charset=utf-8' }));
    a.download = `catalogue-discount-horeca-${S.slug(c.societe)}.csv`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(`${ic('download')} ${t('Catalogue exporté')}`);
  });
}
function vueConnexion(params) {
  const inscription = params?.get('inscription');
  const type = params?.get('type') === 'revendeur' ? 'revendeur' : 'horeca';
  rendre(`<div class="conteneur">${fil([[t('Mon compte')]]).html}<h1 class="page-titre">${inscription ? `${t('Créer mon')} <span class="surligne" style="--c:var(--orange)">${t('compte')}</span>` : t('Mon compte')}</h1>
    <div class="connexion">
      <section class="carte-blanche">
        <h2>${t('Déjà client')}</h2>
        <form id="form-connexion" style="display:grid;gap:12px">
          <label class="champ"><span>${t('E-mail')}</span><input name="email" type="email" required autocomplete="email" placeholder="${t('vous@societe.be')}"></label>
          <label class="champ"><span>${t('Mot de passe')}</span><input name="mdp" type="password" autocomplete="current-password" placeholder="${t('Dans la démo : laissez vide')}"></label>
          <button class="btn btn-sombre" type="submit">${t('Se connecter')}</button>
        </form>
        <div class="acces-demo"><strong>${ic('sparkle')} ${t('Accès démo')}</strong><span class="petit">${t('« Brasserie Exemple » à Saint-Gilles : compte pro horeca, commandes et devis d’exemple.')}</span><div class="hero-actions" style="margin:0"><button class="btn btn-plein" type="button" data-demo="demo">${ic('unlock')}${t('Compte pro')}</button><button class="btn" type="button" data-demo="rev">${t('Compte revendeur (−{remise} %)', { remise: S.reglages().remiseRevendeur })}</button></div></div>
      </section>
      <section class="carte-blanche">
        <h2>${t('Créer un compte')}</h2>
        <ul class="avantages-pro">
          <li>${ic('check')}${t('Factures au nom de votre société, avec votre n° de TVA')}</li>
          <li>${ic('check')}${t('Suivi des commandes, recommande en un clic, devis PDF')}</li>
          <li>${ic('check')}${t('Revendeurs et installateurs : remise sur tout le catalogue après validation')}</li>
        </ul>
        <form id="form-inscription" style="display:grid;gap:14px" novalidate>
          <div class="grille-champs">
            <label class="champ"><span>${t('Type de compte *')}</span><select name="type">${Object.entries(S.TYPES).map(([k, x]) => `<option value="${k}" ${k === type ? 'selected' : ''}>${esc(t(x))}</option>`).join('')}</select></label>
            <label class="champ"><span>${t('Activité')}</span><select name="activite">${S.ACTIVITES.map((m) => `<option value="${esc(m)}" ${type === 'revendeur' && m.startsWith('Revendeur') ? 'selected' : ''}>${esc(t(m))}</option>`).join('')}</select></label>
            <label class="champ" data-pro><span>${t('Société *')}</span><input name="societe" autocomplete="organization"></label>
            <label class="champ" data-pro><span>${t('N° d’entreprise (BCE) *')}</span><input name="bce" inputmode="numeric" maxlength="14" placeholder="0123.456.749"><small id="aide-bce">${t('10 chiffres · le n° de TVA est calculé tout seul.')}</small></label>
            <label class="champ"><span>${t('Nom et prénom *')}</span><input name="contact" required autocomplete="name"></label>
            <label class="champ"><span>${t('E-mail *')}</span><input name="email" type="email" required autocomplete="email"></label>
            <label class="champ"><span>${t('Téléphone *')}</span><input name="tel" type="tel" required autocomplete="tel"></label>
            <label class="champ"><span>${t('Langue')}</span><select name="langue">${Object.entries(I.LANGUES).map(([k, l]) => `<option value="${k}" ${k === I.LANGUE ? 'selected' : ''}>${l.nom}</option>`).join('')}</select></label>
            <label class="champ"><span>${t('Adresse')}</span><input name="adresse" autocomplete="street-address"></label>
            <label class="champ"><span>${t('Code postal')}</span><input name="cp" inputmode="numeric" autocomplete="postal-code" maxlength="4"></label>
            <label class="champ"><span>${t('Commune')}</span><input name="ville" autocomplete="address-level2"></label>
          </div>
          <button class="btn btn-orange btn-grand" type="submit">${t('Créer mon compte')}</button>
          <p class="petit muet">${t('Pour tester : n° d’entreprise {bce} (fictif, de forme valide).', { bce: S.bceFictif(42) })}</p>
        </form>
      </section>
    </div></div>`);
  if (inscription) setTimeout(() => $('#form-inscription select[name=type]')?.focus({ preventScroll: true }), 50);
  const apres = () => { aller('#/compte'); };
  $$('[data-demo]').forEach((b) => b.addEventListener('click', () => { S.connecter(b.dataset.demo); toast(`${ic('unlock')} ${t('Connecté : {nom}', { nom: esc(S.client(b.dataset.demo).societe) })}`); apres(); }));
  $('#form-connexion').addEventListener('submit', (e) => {
    e.preventDefault();
    const cl = S.clients().find((x) => S.norm(x.email) === S.norm(e.target.email.value));
    if (!cl) { toast(t('Aucun compte avec cet e-mail. Essayez demo@exemple.be.'), 'erreur'); return; }
    S.connecter(cl.id); toast(`${ic('check')} ${t('Connecté : {nom}', { nom: esc(cl.societe) })}`); apres();
  });
  const fi = $('#form-inscription');
  const majType = () => { $$('[data-pro]', fi).forEach((x) => { x.hidden = fi.type.value === 'particulier'; }); };
  fi.type.addEventListener('change', majType);
  majType();
  fi.bce.addEventListener('input', () => {
    const v = fi.bce.value.replace(/\D/g, '');
    const aide = $('#aide-bce');
    if (v.length === 10) { const ok = S.bceValide(v); aide.textContent = ok ? t('Numéro valide ✓ · TVA {tva}', { tva: S.tvaDepuisBce(v) }) : t('Numéro invalide : vérifiez les chiffres.'); aide.style.color = ok ? 'var(--vert)' : 'var(--rouge)'; }
  });
  fi.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(fi));
    const pro = d.type !== 'particulier';
    let err = null;
    $$('.champ.erreur', fi).forEach((x) => x.classList.remove('erreur'));
    for (const k of ['contact', 'email', 'tel', ...(pro ? ['societe', 'bce'] : [])]) if (!String(d[k] || '').trim()) { fi[k].closest('.champ').classList.add('erreur'); err = err || fi[k]; }
    if (pro && d.bce && !S.bceValide(d.bce)) { fi.bce.closest('.champ').classList.add('erreur'); err = err || fi.bce; }
    if (err) { err.focus(); toast(t('Vérifiez les champs en rouge.'), 'erreur'); return; }
    const cl = S.creerClient({ type: d.type, societe: pro ? d.societe.trim() : d.contact.trim(), contact: d.contact.trim(), email: d.email.trim(), tel: d.tel.trim(), adresse: d.adresse, cp: d.cp, ville: d.ville, activite: pro ? d.activite : '', langue: d.langue, pays: 'Belgique', ...(pro ? { bce: S.bceFormat(d.bce), tva: S.tvaDepuisBce(d.bce) } : {}) });
    S.connecter(cl.id);
    toast(d.type === 'revendeur' ? `${ic('check')} ${t('Compte créé : validation revendeur sous 24 h ouvrées')}` : `${ic('check')} ${t('Compte créé, bienvenue !')}`);
    apres();
  });
}

/* ---------- Commande rapide ---------- */
function vueRapide() {
  seo({ titre: t('Commande rapide par référence | Discount Horeca'), description: t('Collez votre liste de références et quantités : tout part au panier.') });
  const ex = S.produits().filter((p) => p.stock > 2 && p.etat === 'neuf');
  const exemple = [ex[3], ex[20], ex[45], ex[70]].filter(Boolean).map((p, i) => `${p.ref} ${[2, 1, 3, 1][i]}`).join('\n');
  rendre(`<div class="conteneur">${fil([[t('Commande rapide')]]).html}<h1 class="page-titre">${t('Commande rapide')} <span class="surligne" style="--c:var(--orange)">${t('par référence')}</span></h1>
    <div class="rapide">
      <section class="carte-blanche"><h2>${t('Collez votre liste')}</h2>
        <p class="muet">${t('Une ligne par article : la référence puis la quantité. Copier-coller depuis Excel accepté.')}</p>
        <label class="champ"><span class="sr">${t('Liste')}</span><textarea id="liste-refs" spellcheck="false" placeholder="${t('RÉFÉRENCE 2')}&#10;${t('RÉFÉRENCE ; 1')}"></textarea></label>
        <div class="hero-actions" style="margin:0"><button class="btn" type="button" id="ex-refs">${t('Remplir avec un exemple')}</button><label class="btn">${ic('upload')}${t('Importer un CSV')}<input type="file" accept=".csv,.txt,text/csv,text/plain" id="fichier-refs" hidden></label></div>
      </section>
      <section class="carte-blanche"><h2>${t('Vérification')}</h2><div id="rapide-res" class="rapide-res"><p class="muet">${t('Les articles reconnus apparaissent ici avec le prix et le stock.')}</p></div></section>
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
      if (!p) return `<tr class="ko"><td>${ic('x')}</td><td>${t('« {ref} » introuvable', { ref: esc(ref) })}</td><td class="num">${q}</td><td></td></tr>`;
      const qa = S.ajusterQte(p, q);
      reconnus.push({ id: p.id, qte: qa });
      return `<tr class="ok"><td>${ic('check')}</td><td>${esc(nomP(p))}<br><small class="muet">${t('Réf.')} ${esc(p.ref)} · ${p.stock > 0 ? t('{n} en stock', { n: p.stock }) : t('sur commande')}</small></td><td class="num">${qa}</td><td class="num">${eur(prixDe(p) * qa)}</td></tr>`;
    });
    const tot = S.calculer(reconnus);
    $('#rapide-res').innerHTML = rows.length ? `<div class="tableau-scroll"><table class="tableau"><tbody>${rows.join('')}</tbody></table></div>
      <div class="resume-l" style="margin-top:12px"><span>${reconnus.length > 1 ? t('{n} références reconnues', { n: reconnus.length }) : t('{n} référence reconnue', { n: reconnus.length })}</span><strong>${eur(tot.ht)} ${t('HTVA')}</strong></div>
      <button class="btn btn-orange btn-grand btn-bloc" type="button" id="rapide-ajouter" ${reconnus.length ? '' : 'disabled'} style="margin-top:12px">${ic('cart')}${t('Tout ajouter au panier')}</button>` : `<p class="muet">${t('Les articles reconnus apparaissent ici.')}</p>`;
    $('#rapide-ajouter')?.addEventListener('click', () => { reconnus.forEach((x) => S.ajouter(x.id, x.qte)); toast(`${ic('check')} ${t('{n} référence(s) ajoutée(s)', { n: reconnus.length })} <a href="${H('#/panier')}">${t('Voir le panier')}</a>`); });
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
  const nomDoc = type === 'devis' ? t('Devis') : t('Facture');
  seo({ titre: `${nomDoc} ${num} | ${MARQUE}`, description: '' });
  rendre(`<div class="conteneur" style="padding-bottom:40px">${fil([[nomDoc], [num]]).html}
    <div class="hero-actions" style="margin:4px 0 16px"><button class="btn btn-plein" type="button" data-imprimer>${ic('print')}${t('Imprimer / PDF')}</button>
      ${type === 'devis' ? `<button class="btn" type="button" data-devis-panier>${ic('cart')}${t('Commander ce devis')}</button>` : `<a class="btn" href="#/suivi/${num}">${ic('truck')}${t('Suivi')}</a>`}
      <a class="btn" href="#/compte/${type === 'devis' ? 'devis' : 'commandes'}">${t('Mon compte')}</a></div>${html}</div>`);
  $('[data-imprimer]').addEventListener('click', () => imprimer(html));
  $('[data-devis-panier]')?.addEventListener('click', () => { o.lignes.forEach((l) => S.produit(l.id) && S.ajouter(l.id, l.qte)); aller('#/panier'); });
}

/* ---------- Revendeurs et installateurs ---------- */
function vueRevendeurs() {
  const r = S.reglages();
  seo({ titre: t('Revendeurs et installateurs horeca | Discount Horeca'), description: t('Revendeurs, cuisinistes et installateurs : −{remise} % sur tout le catalogue, export des fiches et photos, commande rapide, devis volume.', { remise: r.remiseRevendeur }) });
  rendre(`<section class="hero-univers" style="--c:#0f97d8;--p:#e5f5fc"><div class="conteneur">${fil([[t('Revendeurs et installateurs')]]).html}</div>
    <div class="conteneur hero-univers-l">
      <div><span class="pill rv" style="--c:var(--bleu)">${t('Programme revendeurs')}</span>
        <h1 class="rv" style="--i:1">${t('Revendeurs et installateurs :')} <span class="surligne" style="--c:var(--bleu)">${t('vos prix pros')}</span></h1>
        <p class="hero-univers-intro rv" style="--i:2">${t('Cuisinistes, installateurs, magasins et e-commerçants : un compte validé, une remise sur tout le catalogue, vos fiches et photos à reprendre et la commande par référence.')}</p>
        <div class="hero-actions rv" style="--i:3"><a class="btn btn-orange btn-grand" href="#/compte?inscription=1&type=revendeur">${t('Demander mon compte')} ${ic('arrow')}</a><button class="btn btn-grand" type="button" data-demo-rev>${t('Accès démo revendeur')}</button></div>
        <div class="stats">
          <div class="stat rv"><strong>−${r.remiseRevendeur}<small> %</small></strong><span>${t('Sur tout le catalogue (exemple)')}</span></div>
          <div class="stat rv" style="--i:1;--c:#16a06a"><strong data-compte="${S.produits().length}">${S.produits().length}</strong><span>${t('Références à revendre')}</span></div>
          <div class="stat rv" style="--i:2;--c:#f04e2e"><strong>${nombre(r.franco)}<small> €</small></strong><span>${t('Livraison gratuite HTVA')}</span></div>
          <div class="stat rv" style="--i:3;--c:#5b6b7c"><strong>CSV</strong><span>${t('Fiches et photos à exporter')}</span></div>
        </div>
      </div>
      <figure class="hero-univers-photo rv-zoom"><img src="img/univers/entrepot.webp" alt="${t('Entrepôt de matériel de cuisine professionnelle')}" width="896" height="1120" style="object-position:center 60%"><figcaption>${t('Illustration')}</figcaption></figure>
    </div></section>
  <section class="section conteneur">
    <div class="atouts">${[['tag', '#0f97d8', '#e5f5fc', t('Prix revendeur'), t('Votre remise (exemple : −{remise} %) s’affiche sur chaque fiche, dans le panier et sur vos devis, dès la validation du compte.', { remise: r.remiseRevendeur })],
    ['zap', '#f04e2e', '#fdebe7', t('Commande par référence'), t('Collez votre liste ou importez un CSV : les références reconnues partent au panier avec le stock.')],
    ['download', '#16a06a', '#e3f6ee', t('Fiches et photos'), t('Exportez références, caractéristiques et photos pour votre boutique en ligne ou vos offres.')],
    ['shield', '#5b6b7c', '#eceff3', t('Garantie revendeur'), t('Un an sur les pièces reconnues défectueuses, selon les conditions de vente.')]].map(([i, c, p, x, d], k) => `<div class="atout rv" style="--c:${c};--p:${p};--i:${k}">${ic(i)}<h3>${x}</h3><p>${d}</p></div>`).join('')}</div>
    <p class="petit muet" style="margin-top:14px">${t('Remise revendeur : valeur d’exemple, réglée dans l’admin. Garantie : reprise des conditions de vente publiées (art. 8).')}</p>
  </section>`);
  $('[data-demo-rev]').addEventListener('click', () => { S.connecter('rev'); toast(`${ic('unlock')} ${t('Prix revendeur affichés (−{remise} %)', { remise: r.remiseRevendeur })}`); aller('#/catalogue'); });
}

/* ---------- Infos pratiques ---------- */
function vueInfos(page = 'livraison') {
  const r = S.reglages();
  const itineraire = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.adresse)}`;
  const pages = {
    livraison: [t('Livraison et retour'), `<ul><li>${t('<strong>Livraison en Belgique</strong>, d’Arlon à Ostende : le matériel en stock est livré en 24 à 72 h, par un livreur, devant la porte, au rez-de-chaussée.')}</li><li>${t('<strong>Gratuite dès {franco} HTVA</strong> d’achat ; sous ce montant : {frais} HTVA <em>(exemple, à confirmer)</em>.', { franco: eur(r.franco), frais: eur(r.fraisLivraison) })}</li><li>${t('<strong>Retrait gratuit</strong> au showroom de Sint-Pieters-Leeuw.')}</li><li>${t('<strong>Installation et raccordement</strong> : sur devis, facturés en régie (conditions de vente, art. 9).')}</li><li>${t('<strong>Hors Belgique</strong> : contactez-nous avant de commander.')}</li><li>${t('À la réception, contrôlez le matériel et notez tout dégât sur le bon de livraison.')}</li></ul>`],
    paiement: [t('Moyens de paiement'), `<p>${t('Sur la nouvelle boutique : <strong>Bancontact, Payconiq, Visa et Mastercard</strong> (par un prestataire belge comme Mollie ou Stripe), <strong>virement</strong> (préparation à réception), <strong>acompte de {acompte} %</strong> à la commande avec le solde à la livraison, ou <strong>paiement au showroom</strong> lors du retrait.', { acompte: r.acompte })}</p><p>${t('Les factures aux entreprises belges partent automatiquement par <strong>Peppol</strong>, la facturation électronique obligatoire entre entreprises depuis le 1er janvier 2026.')}</p><p class="petit muet">${t('Sur le site actuel, la page « Méthodes de paiement » indique « Prochainement disponible ». Dans la démo, les paiements sont simulés.')}</p>`],
    conditions: [t('Conditions de vente'), `<p>${t('Résumé des conditions générales publiées par {societe} :', { societe: esc(r.societe) })}</p><ul><li>${t('Prix hors TVA, départ magasin ; transport, taxes et assurances en sus sauf franco.')}</li><li>${t('Acompte de {acompte} % à la commande ; il prolonge la réservation du matériel jusqu’à 30 jours.', { acompte: r.acompte })}</li><li>${t('Livraison gratuite en Belgique dès {franco} HTVA, par un livreur, devant la porte du rez-de-chaussée.', { franco: eur(r.franco) })}</li><li>${t('Les marchandises restent la propriété du vendeur jusqu’au paiement complet.')}</li><li>${t('Contestation dans les 7 jours suivant la livraison.')}</li><li>${t('Droit belge, tribunaux de Bruxelles.')}</li></ul><p class="petit muet">${t('Le texte complet (12 articles) sera repris tel quel sur la vraie boutique.')}</p>`],
    garantie: [t('Garantie et SAV'), `<ul><li>${t('<strong>Professionnels</strong> : un an pièces et main-d’œuvre à partir de la livraison, six mois sur le matériel d’occasion.')}</li><li>${t('<strong>Revendeurs</strong> : un an, limité aux pièces reconnues défectueuses.')}</li><li>${t('Hors pièces d’usure (joints, lampes, vitres) et dégâts dus au calcaire, au nettoyage ou à un court-circuit.')}</li><li>${t('Le service après-vente est assuré par nos soins.')}</li></ul>`],
    contact: [t('Showroom et contact'), `<p><strong>${esc(r.societe)} — Discount Horeca</strong><br>${esc(r.adresse)}<br>${esc(t(r.horaires))}</p><p>${t('Téléphone')} : <a href="tel:${esc(r.telephone.replace(/\s/g, ''))}">${esc(r.telephone)}</a><br>WhatsApp : <a href="${S.lienWhatsapp()}" target="_blank" rel="noopener">${esc(r.whatsapp)}</a><br>${t('E-mail')} : <a href="mailto:${esc(r.email)}">${esc(r.email)}</a></p><p>${t('À quelques minutes de la E19, parking gratuit. Venez voir le matériel, échanger avec l’équipe et repartir avec votre commande.')}</p><div class="hero-actions" style="margin:10px 0 0"><a class="btn btn-plein" href="${itineraire}" target="_blank" rel="noopener">${ic('pin')}${t('Itinéraire')}</a><a class="btn" href="${S.lienWhatsapp()}" target="_blank" rel="noopener">${ic('phone')}WhatsApp</a></div><p class="petit muet">${t('N° de TVA')} : ${esc(r.numeroTva)}.</p>`],
    langues: [t('Français, Nederlands, English'), `<p>${t('La boutique existe en <strong>français, néerlandais et anglais</strong> : une adresse par langue (<code>#/</code>, <code>#/nl/</code>, <code>#/en/</code> dans la démo, <code>/fr/</code>, <code>/nl/</code>, <code>/en/</code> sur la vraie boutique) et les balises <code>hreflang</code> pour que Google propose la bonne version.')}</p><p>${t('Menus, pages, catégories et noms des produits sont traduits et relus. Les descriptions techniques sont traduites automatiquement, puis relues dans l’admin avant la mise en ligne : chaque fiche affiche son statut.')}</p><p>${t('Le site actuel traduit ses pages avec le module Google Traduction : ces traductions ne sont pas indexées par Google et donnent une image peu professionnelle aux clients néerlandophones, près de 6 Belges sur 10.')}</p>`],
  };
  const [titre, corps] = pages[page] || pages.livraison;
  seo({ titre: `${titre} | ${MARQUE}`, description: `${titre} : ${corps.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}` });
  rendre(`<div class="conteneur">${fil([[t('Infos pratiques')], [titre]]).html}<h1 class="page-titre">${titre}</h1>
    <div class="infos"><nav class="compte-menu" aria-label="${t('Infos pratiques')}">${Object.entries(pages).map(([k, [x]]) => `<a href="#/infos/${k}" ${k === page ? 'aria-current="page"' : ''}>${x}</a>`).join('')}</nav><div class="infos-texte">${corps}</div></div></div>`);
}
function vueIntrouvable() {
  seo({ titre: t('Page introuvable | Discount Horeca'), description: '' });
  rendre(`<div class="conteneur" style="padding:40px 16px"><div class="vide">${ic('search')}<h2>${t('Page introuvable')}</h2><p class="muet">${t('Ce produit ou cette page n’existe plus.')}</p><a class="btn btn-plein" href="#/">${t('Retour à l’accueil')}</a></div></div>`);
}

/* ---------- Routeur ---------- */
const ROUTES = [
  [/^$/, vueAccueil], [/^catalogue$/, vueCatalogue], [/^c\/([\w-]+)$/, vueUnivers], [/^c\/([\w-]+)\/([\w-]+)$/, vueSous],
  [/^p\/([\w-]+)$/, vueProduit], [/^recherche\/(.+)$/, vueRecherche], [/^promos$/, vuePromos], [/^(?:bonnes-affaires|destockage|exposition)$/, vueBonnesAffaires],
  [/^packs$/, vuePacks], [/^pack\/([\w-]+)$/, vuePack], [/^panier$/, vuePanier], [/^commande$/, vueCommande], [/^merci\/([\w-]+)$/, vueMerci],
  [/^suivi(?:\/([\w-]+))?$/, vueSuivi], [/^compte(?:\/(\w+))?$/, vueCompte], [/^commande-rapide$/, vueRapide], [/^devis-projet$/, vueDevisProjet],
  [/^document\/(devis|facture)\/([\w-]+)$/, vueDocument], [/^infos(?:\/([\w-]+))?$/, vueInfos], [/^revendeurs$/, vueRevendeurs],
];
let routePrecedente = null, jeton = 0;
async function router() {
  let [chemin, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(qs || '');
  let langue = 'fr';
  const m = chemin.match(/^(nl|en)(?:\/(.*))?$/);
  if (m) { langue = m[1]; chemin = m[2] || ''; }
  const j = ++jeton;
  cheminCourant = chemin + (qs ? '?' + qs : '');
  if (langue !== I.LANGUE) {
    try { await I.chargerLangue(langue); } catch (e) { console.error(e); toast('Langue indisponible.', 'erreur'); }
    if (j !== jeton) return;
    pref('langue', langue);
    traduireStatique();
    construireNavigation();
    majEntete();
  }
  document.body.classList.remove('avec-barre');
  $('#suggestions').hidden = true;
  fermerTiroir(); fermerRecherche(); fermerVolant();
  const route = ROUTES.find(([re]) => re.test(chemin));
  if (route) route[1](...chemin.match(route[0]).slice(1).map((x) => (x === undefined ? undefined : decodeURIComponent(x))), params);
  else vueIntrouvable();
  majOnglets(chemin);
  majLangues(cheminCourant);
  alternates(cheminCourant);
  const cle = langue + '/' + chemin;
  if (routePrecedente !== cle) { window.scrollTo(0, 0); if (routePrecedente !== null) vue.focus({ preventScroll: true }); }
  routePrecedente = cle;
  animer();
}
function rerendre() { const y = window.scrollY; router().then(() => window.scrollTo(0, y)); }

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
  const x = e.target.closest('button, a');
  if (!x) { if (!e.target.closest('#recherche')) $('#suggestions').hidden = true; return; }
  // lien interne sans la langue (toasts, contenus ajoutés) : on garde la langue courante
  if (x.tagName === 'A' && I.LANGUE !== 'fr' && !x.dataset.langue) {
    const h = x.getAttribute('href') || '';
    if (/^#\//.test(h) && !/^#\/(nl|en)(\/|$)/.test(h)) { e.preventDefault(); location.hash = H(h); return; }
  }
  if (x.dataset.ajouter) {
    const zone = x.closest('[data-achat]');
    const q = zone ? parseInt(zone.querySelector('input[name=qte]')?.value, 10) : undefined;
    if (S.ajouter(x.dataset.ajouter, q)) {
      voler(x.closest('.carte, .fiche')?.querySelector('.carte-img img, #photo'));
      ['#lien-panier', '#barre-onglets [data-onglet=panier]'].forEach((s) => { const b = $(s); if (b) { b.classList.remove('saute'); void b.offsetWidth; b.classList.add('saute'); } });
      setTimeout(() => ouvrirVolant(x.dataset.ajouter), ANIM ? 450 : 0);
    }
    return;
  }
  if (x.matches('[data-plus], [data-moins]')) {
    const inp = x.parentElement.querySelector('input');
    const v = (parseInt(inp.value, 10) || 1) + (x.matches('[data-plus]') ? 1 : -1);
    inp.value = Math.max(inp.dataset.cle && x.matches('[data-moins]') ? 0 : 1, Math.min(99, v));
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    if (inp.dataset.cle) inp.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (x.hasAttribute('data-voir-prix')) { e.preventDefault(); ouvrirAcces(); return; }
  if (x.dataset.fav) {
    const ajoute = S.basculerFavori(x.dataset.fav);
    $$(`[data-fav="${CSS.escape(x.dataset.fav)}"]`).forEach((b) => { b.setAttribute('aria-pressed', ajoute); if (!b.classList.contains('carte-fav')) b.textContent = ajoute ? t('♥ Dans mes favoris') : t('♡ Ajouter aux favoris'); });
    toast(ajoute ? `${ic('heart')} ${t('Ajouté aux favoris')} <a href="${H('#/compte/favoris')}">${t('Voir')}</a>` : t('Retiré des favoris'));
    return;
  }
  if (x.dataset.recommander) {
    const c = S.commande(x.dataset.recommander);
    let n = 0;
    c?.lignes.forEach((l) => { if (S.produit(l.id)) { S.ajouter(l.id, l.qte); n++; } });
    toast(`${ic('repeat')} ${t('{n} article(s) remis au panier', { n })} <a href="${H('#/panier')}">${t('Voir')}</a>`);
    return;
  }
  if (x.hasAttribute('data-ouvrir-menu')) return ouvrirTiroir();
  if (x.hasAttribute('data-fermer-tiroir')) return fermerTiroir();
  if (x.hasAttribute('data-ouvrir-recherche')) return ouvrirRecherche();
  if (x.hasAttribute('data-fermer-recherche')) return fermerRecherche();
  if (x.hasAttribute('data-fermer-volant')) return fermerVolant();
  if (x.hasAttribute('data-fermer-ruban')) { $('#ruban-demo').hidden = true; try { sessionStorage.setItem('dh-ruban', '1'); } catch { /* rien */ } return; }
  if (!x.closest('#recherche')) $('#suggestions').hidden = true;
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
    aller(exact ? `#/p/${exact.id}` : `#/recherche/${encodeURIComponent(v)}`);
    champ.blur();
  });
}
brancherRecherche($('#recherche'), $('#q'), $('#suggestions'));
brancherRecherche($('#recherche-m'), $('#qm'), $('#suggestions-m'));

S.ecouter((cle, externe) => {
  if (['catalogue', 'reglages', 'reinit'].includes(cle) && externe) construireNavigation();
  majEntete();
  if (cle === 'session') { construireNavigation(); if (!externe) { rerendre(); return; } }
  if (externe && !document.querySelector('dialog[open]') && !$('#form-commande') && !$('#form-inscription') && !$('#form-projet')) rerendre();
  if (cle === 'erreur-stockage') toast(t('Le navigateur refuse d’enregistrer (stockage plein ou navigation privée).'), 'erreur');
});

/* ---------- Démarrage ---------- */
$$('[data-ic]').forEach((el) => { el.innerHTML = ic(el.dataset.ic); });
$$('[data-ic-avant]').forEach((el) => el.insertAdjacentHTML('afterbegin', ic(el.dataset.icAvant)));
try { if (sessionStorage.getItem('dh-ruban')) $('#ruban-demo').hidden = true; } catch { /* rien */ }
traduireStatique();
construireNavigation();
majEntete();
window.addEventListener('hashchange', router);
router();
