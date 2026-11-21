// Discount Horeca — démo de la nouvelle boutique (application d'une page, routes #/…).
import * as S from './store.js';
import { UNIVERS, FAQ, ETAPES } from './univers.js';
import { eur, esc, ic, src, toast, modale, documentCommercial, dateCourte, dateLongue, nombre } from './ui.js';

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

/* ---------- Univers : couleurs, photos, textes ---------- */
function U(slug) {
  const f = S.famille(slug);
  return UNIVERS[slug] || { couleur: '#0f97d8', pastel: '#e5f5fc', pastille: f?.nom || '', titre: [f?.nom || '', 'pour l’horeca'], intro: f?.description || '', seo: [], faq: [], sous: {} };
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
function dispo(p, court = false) {
  if (p.etat === 'exposition') return '<span class="stock stock-bas">Pièce unique · au showroom</span>';
  if (p.stock > 2) return `<span class="stock stock-ok">En stock · ${court ? '24–72 h' : 'livré en 24 à 72 h'}</span>`;
  if (p.stock > 0) return `<span class="stock stock-bas">Plus que ${p.stock} en stock</span>`;
  return `<span class="stock stock-non">Sur commande${court ? '' : ' · délai confirmé sous 24 h'}</span>`;
}
function badges(p) {
  const r = S.remisePromo(p);
  return `<div class="carte-badges">${p.etat === 'exposition' ? '<span class="pastille p-sc">Exposition</span>' : ''}${r ? `<span class="pastille p-promo">−${r} %</span>` : ''}${madeInBelgium(p) ? '<span class="pastille p-belge">Made in Belgium</span>' : ''}${p.nouveau ? '<span class="pastille p-nouveau">Nouveau</span>' : ''}</div>`;
}
function qteHtml(p, valeur, cle = '') {
  return `<div class="qte"><button type="button" data-moins aria-label="Un de moins">${ic('minus')}</button><input name="qte" type="number" inputmode="numeric" min="1" step="1" max="99" value="${valeur ?? 1}" data-pas="1" aria-label="Quantité" ${cle ? `data-cle="${cle}"` : ''}><button type="button" data-plus aria-label="Un de plus">${ic('plus')}</button></div>`;
}
function prixCarte(p) {
  const pu = S.prixUnitaire(p);
  const barre = pu.remiseRevendeur ? p.prixHT : pu.barre;
  return `<div class="carte-prix">
      <div class="carte-prix-l"><strong class="prix">${eur(pu.unit)}<small>HTVA</small></strong>${barre ? `<s>${eur(barre)}</s>` : ''}</div>
      <div class="carte-prix-sous"><span>${eur(S.ttc(pu.unit))} TVAC</span>${pu.remiseRevendeur ? `<span>Revendeur <b>−${pu.remiseRevendeur} %</b></span>` : ''}</div>
    </div>`;
}
function carte(p, i = 0) {
  const favs = S.favoris();
  return `<article class="carte rv" style="--i:${i % 8}">
    <a class="carte-img" href="#/p/${p.id}" tabindex="-1" aria-hidden="true"><img src="${src(p.images[0])}" alt="" loading="lazy" width="300" height="300"></a>
    ${badges(p)}
    <button class="carte-fav" type="button" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}" aria-label="Ajouter aux favoris">${ic('heart')}</button>
    <div class="carte-corps">
      <p class="carte-marque">${esc(p.marque || '')}</p>
      <h3 class="carte-nom"><a href="#/p/${p.id}">${esc(p.nom)}</a></h3>
      <p class="carte-ref">Réf. ${esc(p.ref)}</p>
      ${p.etat === 'exposition' ? `<p class="carte-sc">${esc(p.defaut || '')}</p>` : dispo(p, true)}
      ${prixCarte(p)}
      <div class="carte-achat" data-achat>${qteHtml(p)}<button class="btn btn-plein" type="button" data-ajouter="${p.id}" aria-label="Ajouter ${esc(p.nom)} au panier">${ic('cart')}<span>Ajouter</span></button></div>
    </div>
  </article>`;
}
function jauges(t) {
  const r = S.reglages();
  const pct = Math.min(100, (t.ht / r.franco) * 100);
  return `<div class="jauge ${t.resteFranco <= 0 ? 'ok' : ''}"><p>${t.resteFranco > 0 ? `Livraison gratuite en Belgique dans <strong>${eur(t.resteFranco)} HTVA</strong>` : `<strong>Livraison gratuite</strong> en Belgique (dès ${eur(r.franco)} HTVA)`}</p><div class="jauge-barre"><i style="width:${pct.toFixed(1)}%"></i></div></div>`;
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
  }).join('') + `<div class="nav-speciaux"><a class="nav-destock" href="#/promos">Promos</a><a class="nav-revendeur" href="#/packs">Packs</a></div>`;
  $('#tiroir-corps').innerHTML = fams.map((f) => `<details>
      <summary><img src="${src(photoU(f.slug, true))}" alt="" width="44" height="44" loading="lazy">${esc(f.nom)}${ic('down')}</summary>
      <div class="tiroir-sous"><a href="#/c/${f.slug}"><strong>Tout l’univers</strong></a>${f.sous.map((s) => `<a href="#/c/${f.slug}/${s.slug}">${esc(s.nom)}</a>`).join('')}</div>
    </details>`).join('') + `<div class="tiroir-liens">
      <a href="#/catalogue">${ic('grid')}Tout le catalogue</a>
      <a href="#/promos">${ic('percent')}Promotions</a>
      <a href="#/bonnes-affaires">${ic('tag')}Bonnes affaires et exposition</a>
      <a href="#/packs">${ic('box')}Packs prêts à ouvrir</a>
      <a href="#/revendeurs">${ic('users')}Revendeurs et installateurs</a>
      <a href="#/suivi">${ic('truck')}Suivre une commande</a>
      <a href="#/infos/contact">${ic('pin')}Showroom et contact</a>
      <a href="admin/" target="_blank" rel="noopener">${ic('settings')}Espace admin (démo)</a>
      <a href="analyse-seo.html">${ic('chart')}Analyse du site actuel</a>
    </div>`;
  $('#pied-familles').innerHTML = fams.map((f) => `<li><a href="#/c/${f.slug}">${esc(f.nom)}</a></li>`).join('');
  $('#pied-reassurance').innerHTML = reassurance().map(([i, t, d]) => `<div>${ic(i)}<p><strong>${t}</strong><span>${d}</span></p></div>`).join('');
  const nbSous = fams.reduce((s, f) => s + f.sous.length, 0);
  const cat = $('.action-catalogue small'); if (cat) cat.textContent = `${nbSous} catégories`;
}
function reassurance() {
  const r = S.reglages();
  return [
    ['truck', 'Livré en 24 à 72 h', `Gratuit en Belgique dès ${nombre(r.franco)} € HTVA`],
    ['store', 'Showroom à Sint-Pieters-Leeuw', 'Du lundi au samedi, parking gratuit'],
    ['card', 'Bancontact, carte, virement', `Ou ${r.acompte} % d’acompte, solde à la livraison`],
    ['shield', 'Garantie et SAV', 'Un an pièces et main-d’œuvre (pros)'],
  ];
}
function majEntete() {
  const n = S.nbLignes();
  [$('#panier-nb'), $('#panier-nb-mobile')].forEach((b) => { b.hidden = n === 0; b.textContent = n; });
  const t = S.calculer(S.panier());
  $('#panier-total').textContent = n ? eur(t.ht) : 'Panier';
  const c = S.clientConnecte();
  $('#libelle-compte').innerHTML = c ? `${esc(c.societe.length > 18 ? c.societe.slice(0, 17) + '…' : c.societe)}<small>${S.estRevendeur(c) ? `Revendeur −${S.reglages().remiseRevendeur} %` : c.statut === 'en-attente' ? 'Compte en validation' : 'Compte pro'}</small>` : 'Mon compte<small>Se connecter</small>';
  const r = S.reglages();
  $('#bandeau-msg').textContent = r.bandeau;
  const wa = S.lienWhatsapp('Bonjour, j’ai une question sur votre matériel horeca.');
  $('#lien-whatsapp').href = wa; $('#lien-whatsapp').target = '_blank'; $('#lien-whatsapp').rel = 'noopener';
  $('#bouton-whatsapp').href = wa;
  $('#pied-adresse').innerHTML = `<strong>Showroom</strong><br>${esc(r.adresse)}<br>${esc(r.horaires)}`;
  $('#pied-tel').innerHTML = `<a href="tel:${esc(r.telephone.replace(/\s/g, ''))}">${esc(r.telephone)}</a> · <a href="mailto:${esc(r.email)}">${esc(r.email)}</a>`;
  $('#pied-societe').textContent = `© 2026 Discount Horeca · ${r.societe} · TVA ${r.numeroTva} · Prix en euros HTVA, TVAC indiqué.`;
}
function majOnglets(chemin) {
  const seg = chemin.split('/')[0];
  const actif = { '': '', catalogue: 'catalogue', c: 'catalogue', p: 'catalogue', compte: 'compte', panier: 'panier', commande: 'panier', infos: 'infos' }[seg];
  $$('#barre-onglets [data-onglet]').forEach((a) => (a.dataset.onglet === actif ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
}

/* ---------- Accès compte (démo) ---------- */
async function ouvrirAcces(raison = '') {
  const r = await modale({
    titre: 'Mon compte Discount Horeca',
    corps: `${raison ? `<p class="muet">${esc(raison)}</p>` : ''}
      <div class="acces-demo"><strong>${ic('sparkle')} Démo : entrez en un clic</strong><span class="petit">« Brasserie Exemple » (compte pro horeca) ou « Horeca Services Exemple » (revendeur validé, −${S.reglages().remiseRevendeur} % sur tout le catalogue).</span></div>
      <label class="champ"><span>Déjà client ? Votre e-mail</span><input name="email" type="email" autocomplete="email" placeholder="vous@societe.be"></label>
      <p class="petit muet">Pas encore de compte ? Il se crée en une minute, avec votre numéro d’entreprise.</p>`,
    actions: [{ id: 'inscription', libelle: 'Créer un compte' }, { id: 'login', libelle: 'Se connecter' }, { id: 'rev', libelle: 'Démo revendeur' }, { id: 'demo', libelle: 'Démo pro', classe: 'btn-plein' }],
  });
  if (r.action === 'demo') { S.connecter('demo'); toast(`${ic('check')} Connecté : Brasserie Exemple (compte pro)`); return true; }
  if (r.action === 'rev') { S.connecter('rev'); toast(`${ic('unlock')} Prix revendeur affichés (−${S.reglages().remiseRevendeur} %)`); return true; }
  if (r.action === 'login') {
    const cl = S.clients().find((x) => S.norm(x.email) === S.norm(r.donnees.email));
    if (!cl) { toast('Aucun compte avec cet e-mail. Essayez demo@exemple.be.', 'erreur'); return false; }
    S.connecter(cl.id); toast(`${ic('check')} Connecté : ${esc(cl.societe)}`); return true;
  }
  if (r.action === 'inscription') location.hash = '#/compte?inscription=1';
  return false;
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
  boite.innerHTML = (cats.length ? `<p class="sugg-titre">Catégories</p><div class="sugg-cat">${cats.slice(0, 6).map(([t, h]) => `<a href="${h}">${esc(t)}</a>`).join('')}</div>` : '')
    + (res.length ? `<p class="sugg-titre">Produits</p>${res.map((p) => `<a class="sugg-prod" href="#/p/${p.id}"><img src="${src(p.images[0])}" alt="" width="52" height="52"><span>${esc(p.nom)}<small>Réf. ${esc(p.ref)} · ${esc(p.marque || '')}</small></span><strong>${eur(prixDe(p))}<small> HTVA</small></strong></a>`).join('')}<a class="sugg-tout" href="#/recherche/${encodeURIComponent(q)}">Voir tous les résultats pour « ${esc(q)} »</a>`
      : `<p class="sugg-vide">Aucun produit pour « ${esc(q)} ». Essayez un autre mot ou <a href="${S.lienWhatsapp(`Bonjour, je cherche : ${q}`)}" target="_blank" rel="noopener">demandez-nous sur WhatsApp</a>.</p>`);
  boite.hidden = false;
  suggActif = -1;
}
function suggestionsVides() {
  return `<p class="sugg-titre">Univers</p><div class="sugg-cat">${S.familles().map((f) => `<a href="#/c/${f.slug}">${esc(f.nom)}</a>`).join('')}</div><p class="sugg-titre">Recherches fréquentes</p><div class="sugg-cat">${['friteuse gaz', 'table inox', 'four à pizza', 'frigo boisson', 'lave-vaisselle', 'hotte murale'].map((t) => `<a href="#/recherche/${encodeURIComponent(t)}">${t}</a>`).join('')}</div>`;
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
      <p class="petit muet">Réf. ${esc(p.ref)} · ${l.qte} dans le panier</p>
      <p class="petit"><strong>${eur(l.unit)} HTVA</strong> · ${eur(S.ttc(l.unit))} TVAC ${S.remisePromo(p) ? `<span class="pastille p-promo">−${S.remisePromo(p)} %</span>` : ''}</p>
    </div></div>
    <div class="volant-corps">${jauges(t)}
      ${t.economie > 0 ? `<div class="info-bulle vert">${ic('percent')}<span>Vous économisez <strong>${eur(t.economie)} HTVA</strong> sur ce panier par rapport aux prix habituels.</span></div>` : ''}
    </div>
    <footer class="volant-pied">
      <div class="volant-ligne"><span>Panier · ${S.nbArticles()} article${S.nbArticles() > 1 ? 's' : ''}</span><strong>${eur(t.ht)} HTVA</strong></div>
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

/* ---------- Packs d'ouverture ---------- */
const PACKS = [
  { slug: 'friterie', nom: 'Pack friterie', icone: 'burger', desc: 'Friteuse, grill panini, frigo à boissons, hotte murale.', sous: ['friteuses', 'grills-panini', 'vitrines-boissons', 'hottes-murales'] },
  { slug: 'pizzeria', nom: 'Pack pizzeria', icone: 'pizza', desc: 'Four à pizza, pétrin, table à pizza, laminoir.', sous: ['fours-a-pizza', 'petrins', 'tables-a-pizza', 'laminoirs-diviseuses'] },
  { slug: 'brasserie', nom: 'Pack brasserie', icone: 'flame', desc: 'Cuisinière, armoire frigo, lave-vaisselle, hotte.', sous: ['cuisinieres', 'armoires-frigorifiques', 'lave-vaisselle', 'hottes-murales'] },
  { slug: 'bar', nom: 'Pack café & bar', icone: 'cup', desc: 'Machine à café, lave-verres, frigo de bar, machine à glaçons.', sous: ['machines-a-cafe', 'lave-verres', 'frigos-de-bar', 'machines-a-glacons'] },
  { slug: 'boulangerie', nom: 'Pack boulangerie', icone: 'store', desc: 'Batteur, four pâtisserie, vitrine réfrigérée, table inox.', sous: ['batteurs-petrins', 'fours-patisserie', 'vitrines-refrigerees', 'tables-inox'] },
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
  const promos = ps.filter((p) => S.remisePromo(p) > 0 && p.etat === 'neuf').sort((a, b) => S.remisePromo(b) - S.remisePromo(a));
  const affaires = ps.filter((p) => S.bonneAffaire(p)).sort((a, b) => (b.etat === 'exposition') - (a.etat === 'exposition') || S.remisePromo(b) - S.remisePromo(a));
  const nouveaux = ps.filter((p) => p.nouveau && p.etat === 'neuf');
  const vedette = ps.filter((p) => p.etat === 'neuf' && p.stock > 0 && S.remisePromo(p) >= 25 && p.prixHT > 800).sort((a, b) => b.images.length - a.images.length)[0] || promos[0];
  const nbSous = fams.reduce((s, f) => s + f.sous.length, 0);
  const marques = S.marques();
  const pv = vedette ? S.prixUnitaire(vedette) : null;
  seo({
    titre: 'Matériel horeca professionnel en Belgique | Discount Horeca',
    description: 'Matériel horeca à prix discount : froid, cuisson, friterie, pizzeria, inox et hottes made in Belgium. Prix HTVA et TVAC, showroom à Sint-Pieters-Leeuw, livraison en Belgique.',
    ld: { '@graph': [faqLd(FAQ)] },
  });
  rendre(`
  <section class="hero">
    <div class="conteneur hero-l">
      <div>
        <span class="pill rv" style="--c:var(--bleu)">Showroom à Sint-Pieters-Leeuw</span>
        <h1 class="rv" style="--i:1">Le matériel horeca <span class="surligne" style="--c:var(--bleu)">à prix discount</span></h1>
        <p class="hero-chapo rv" style="--i:2">Froid, cuisson, friterie, pizzeria, préparation, lavage, <strong>inox et hottes fabriqués en Belgique</strong> : ${ps.length} références avec le prix <strong>HTVA et TVAC</strong>, des promotions jusqu’à <strong>−${remiseMax(ps)} %</strong> et la livraison en 24 à 72 h dans toute la Belgique.</p>
        <div class="hero-actions rv" style="--i:3">
          <a class="btn btn-orange btn-grand" href="#/promos">Voir les promotions ${ic('arrow')}</a>
          <a class="btn btn-grand" href="#/catalogue">${ic('grid')}Tout le catalogue</a>
        </div>
        <p class="hero-demo rv" style="--i:4">${ic('pin')}Showroom ouvert ${esc(r.horaires.toLowerCase())} · ${esc(r.adresse)}</p>
      </div>
      <div class="hero-visuel rv-zoom">
        <div class="hero-photo"><img src="img/univers/accueil.webp" alt="Cuisine professionnelle équipée de matériel inox" width="1344" height="752" fetchpriority="high"></div>
        ${vedette ? `<a class="flottante flottante-prix" href="#/p/${vedette.id}"><img src="${src(vedette.images[0])}" alt="" width="58" height="58"><small>${esc(vedette.nom.length > 34 ? vedette.nom.slice(0, 33) + '…' : vedette.nom)}</small><strong>${eur(pv.unit)} HTVA</strong><span>${pv.barre ? `au lieu de ${eur(pv.barre)} · −${S.remisePromo(vedette)} %` : `${eur(S.ttc(pv.unit))} TVAC`}</span></a>` : ''}
        <div class="flottante flottante-marge"><small>Livraison gratuite</small><strong>${nombre(r.franco)} €</strong><span class="petit muet">HTVA d’achat, partout en Belgique</span></div>
        <div class="flottante flottante-etiquette">${ic('card')}<span>Bancontact, Payconiq<br>ou ${r.acompte} % d’acompte</span></div>
      </div>
    </div>
    <div class="conteneur" style="padding-bottom:56px">
      <div class="stats" style="margin-top:0">
        <div class="stat rv"><strong data-compte="${ps.length}">${ps.length}</strong><span>Références dans la démo</span></div>
        <div class="stat rv" style="--i:1;--c:var(--bleu)"><strong data-compte="${nbSous}">${nbSous}</strong><span>Catégories, ${fams.length} univers</span></div>
        <div class="stat rv" style="--i:2;--c:#16a06a"><strong data-compte="${marques.length}">${marques.length}</strong><span>Marques professionnelles</span></div>
        <div class="stat rv" style="--i:3;--c:var(--orange)"><strong>24–72<small> h</small></strong><span>Livraison du stock en Belgique</span></div>
      </div>
    </div>
  </section>

  <div class="marques" aria-label="Marques du catalogue"><div class="marques-l">${[...marques, ...marques].map((m, i) => `<span ${i >= marques.length ? 'aria-hidden="true"' : ''}>${esc(m)}</span>`).join('')}</div></div>

  <section class="section conteneur" id="univers">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--bleu)">Le catalogue</span><h2 class="rv" style="margin-top:14px">${fams.length} univers, <span class="surligne">${nbSous} catégories</span></h2><p class="rv">Un menu clair, des photos, le prix de départ et le nombre de références : on trouve son matériel en deux gestes, même sur téléphone.</p></div><a class="rv" href="#/catalogue">Tout le catalogue ${ic('arrow')}</a></div>
    <div class="univers-grille">
      ${fams.map((f, i) => { const pf = produitsDe(f.slug); return `<a class="carte-univers rv" href="#/c/${f.slug}" style="${styleU(f.slug)};--i:${i % 3}">
        <div class="carte-univers-photo"><img src="${src(photoU(f.slug, true))}" alt="" loading="lazy" width="640" height="358"><span class="carte-univers-nb">${pf.length} réf. · dès ${eur(prixMin(pf))} HTVA</span><span class="carte-univers-fleche">${ic('arrow')}</span></div>
        <div class="carte-univers-txt"><h3>${esc(f.nom)}</h3><div class="carte-univers-sous">${f.sous.slice(0, 4).map((s) => `<span>${esc(s.nom)}</span>`).join('')}${f.sous.length > 4 ? `<span>+${f.sous.length - 4}</span>` : ''}</div></div>
      </a>`; }).join('')}
    </div>
  </section>

  <section class="section conteneur" style="padding-top:0">
    <div class="section-titre"><div><span class="pill rv">Pourquoi Discount Horeca</span><h2 class="rv" style="margin-top:14px">Le prix discount, <span class="surligne" style="--c:var(--orange)">le service en plus</span></h2></div></div>
    <div class="atouts">
      ${[['euro', '#0f97d8', '#e5f5fc', 'Prix HTVA et TVAC', 'Le prix hors TVA pour votre comptabilité, le prix TVAC juste en dessous, et l’économie réalisée sur chaque promotion.'],
    ['truck', '#f04e2e', '#fdebe7', 'Livré en 24 à 72 h', `Partout en Belgique, d’Arlon à Ostende. Gratuit dès ${nombre(r.franco)} € HTVA, ou retrait gratuit au showroom.`],
    ['store', '#16a06a', '#e3f6ee', 'Un vrai showroom', 'Venez voir, toucher et comparer le matériel à Sint-Pieters-Leeuw, à quelques minutes de la E19. Parking gratuit.'],
    ['table', '#5b6b7c', '#eceff3', 'Inox et hottes made in Belgium', 'Tables, plonges, armoires, étagères et hottes fabriquées en Belgique, y compris sur mesure.']]
    .map(([i, c, p, t, d], k) => `<div class="atout rv" style="--c:${c};--p:${p};--i:${k}">${ic(i)}<h3>${t}</h3><p>${d}</p></div>`).join('')}
    </div>
  </section>

  ${promos.length ? `<section class="section conteneur" style="padding-top:0">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--orange)">Promotions</span><h2 class="rv" style="margin-top:14px">Les plus fortes baisses du moment</h2></div><a class="rv" href="#/promos">Toutes les promos (${promos.length}) ${ic('arrow')}</a></div>
    <div class="rangee">${promos.slice(0, 10).map(carte).join('')}</div>
  </section>` : ''}

  <section class="section conteneur" style="padding-top:0">
    <div class="simulateur rv-zoom" id="simulateur">
      <div class="simu-gauche">
        <span class="pill" style="--c:var(--jaune)">Projet d’ouverture</span>
        <h2>Combien coûte l’équipement de votre établissement ?</h2>
        <p>Choisissez votre activité : le pack de base, le total HTVA et TVAC, l’acompte de ${r.acompte} % et la livraison, calculés en direct. Ajoutez-le au panier ou demandez un devis avec installation.</p>
        <label class="champ"><span>Votre activité</span><select class="saisie" id="simu-pack">${PACKS.map((m) => `<option value="${m.slug}">${esc(m.nom.replace('Pack ', ''))}</option>`).join('')}</select></label>
      </div>
      <div class="simu-droite" id="simu-resultat"></div>
    </div>
  </section>

  <section class="section conteneur" style="padding-top:0">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--vert)">Comment ça marche</span><h2 class="rv" style="margin-top:14px">De la commande à la mise en service</h2></div><a class="rv" href="#/infos/livraison">Livraison et paiement ${ic('arrow')}</a></div>
    <div class="etapes">${ETAPES.map(([t, d], i) => `<div class="etape-gros rv" style="--i:${i};--c:${['#0f97d8', '#16a06a', '#f04e2e', '#5b6b7c'][i]}"><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
  </section>

  ${affaires.length ? `<section class="section conteneur" style="padding-top:0">
    <div class="destock rv-zoom">
      <div>
        <span class="pill">Bonnes affaires</span>
        <h2>Les <span class="surligne" style="--c:var(--orange)">bonnes affaires</span> du showroom</h2>
        <p>Promotions de −${r.seuilBonneAffaire} % et plus, et modèles d’exposition contrôlés par notre atelier : les meilleurs prix du catalogue, en quantités limitées.</p>
        <div class="stats">
          <div class="stat"><strong data-compte="${affaires.length}">${affaires.length}</strong><span>Bonnes affaires</span></div>
          <div class="stat" style="--c:#16a06a"><strong>−${remiseMax(ps)}<small> %</small></strong><span>Jusqu’à, sur le prix habituel</span></div>
        </div>
        <a class="btn btn-sombre" href="#/bonnes-affaires">Voir les bonnes affaires ${ic('arrow')}</a>
      </div>
      <div class="rangee">${affaires.slice(0, 9).map(carte).join('')}</div>
    </div>
  </section>` : ''}

  <section class="section conteneur" style="padding-top:0">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--bleu)">Packs prêts à ouvrir</span><h2 class="rv" style="margin-top:14px">Équiper un métier en une commande</h2><p class="rv">Un appareil par poste, en stock de préférence : ajoutez le pack d’un coup, puis remplacez un modèle si besoin.</p></div><a class="rv" href="#/packs">Tous les packs ${ic('arrow')}</a></div>
    <div class="metiers">${PACKS.slice(0, 4).map((m, i) => { const pk = packDe(m); return `<article class="metier rv" style="--i:${i}">
      <div class="metier-tete">${ic(m.icone)}<div><h3>${esc(m.nom)}</h3><p>${esc(m.desc)}</p></div></div>
      <div class="metier-imgs">${pk.map((p) => `<img src="${src(p.images[0])}" alt="${esc(p.nom)}" loading="lazy" width="80" height="80">`).join('')}</div>
      <p class="petit">${pk.length} équipements · <strong>${eur(totalPack(pk))} HTVA</strong></p>
      <a class="btn" href="#/pack/${m.slug}">Voir le pack ${ic('arrow')}</a>
    </article>`; }).join('')}</div>
  </section>

  <section class="engagement">
    <div class="conteneur engagement-l">
      <figure class="engagement-photo rv-zoom"><img src="img/univers/showroom.webp" alt="Showroom de matériel de cuisine professionnelle" loading="lazy" width="896" height="1120"><figcaption>Illustration · à remplacer par une photo du showroom</figcaption></figure>
      <div>
        <div class="guillemets rv" aria-hidden="true">”</div>
        <blockquote class="rv">Venez voir le matériel <em>avant de l’acheter</em>. Notre équipe partage ses conseils et son expérience pour équiper votre cuisine selon votre activité et votre budget.</blockquote>
        <cite class="rv">Le showroom de Sint-Pieters-Leeuw, à quelques minutes de la E19</cite>
        <div class="stats">
          <div class="stat rv"><strong>6 j/7</strong><span>Du lundi au samedi, 9 h – 17 h</span></div>
          <div class="stat rv" style="--i:1;--c:var(--jaune)"><strong>24–72 h</strong><span>Livraison du stock</span></div>
          <div class="stat rv" style="--i:2;--c:#7ff0b3"><strong>BE</strong><span>D’Arlon à Ostende</span></div>
          <div class="stat rv" style="--i:3;--c:#9cd7ff"><strong>SAV</strong><span>Pièces et réparation</span></div>
        </div>
        <div class="hero-actions" style="margin-top:22px"><a class="btn btn-jaune" href="#/infos/contact">${ic('pin')}Plan d’accès</a><a class="btn" href="${S.lienWhatsapp('Bonjour, je souhaite passer au showroom.')}" target="_blank" rel="noopener">${ic('phone')}WhatsApp</a></div>
      </div>
    </div>
  </section>

  ${nouveaux.length ? `<section class="section conteneur">
    <div class="section-titre"><div><span class="pill rv" style="--c:var(--bleu)">Nouveautés</span><h2 class="rv" style="margin-top:14px">Arrivés récemment</h2></div><a class="rv" href="#/catalogue">Tout voir ${ic('arrow')}</a></div>
    <div class="rangee">${nouveaux.slice(0, 10).map(carte).join('')}</div>
  </section>` : ''}

  <section class="section conteneur">
    <div class="texte-seo">
      <div class="texte-seo-corps rv">
        <span class="pill" style="--c:var(--bleu)">Magasin horeca en Belgique</span>
        <h2>Matériel horeca professionnel à Bruxelles et dans toute la Belgique</h2>
        <p>Discount Horeca est un magasin de matériel professionnel pour l’horeca, avec un showroom à Sint-Pieters-Leeuw, aux portes de Bruxelles. Restaurants, brasseries, friteries, snacks, pizzerias, cafés, boulangeries, boucheries, hôtels et collectivités y trouvent le gros matériel de cuisine : froid commercial, cuisson, friteuses, fours à pizza, préparation, lave-vaisselle, mobilier inox et hottes.</p>
        <p>Chaque produit affiche son <strong>prix HTVA</strong> et son <strong>prix TVAC</strong>, le stock et le délai. Le matériel en stock est livré en 24 à 72 heures partout en Belgique, gratuitement dès ${nombre(r.franco)} € HTVA, ou retiré au showroom. Les tables, plonges, armoires, étagères et hottes en inox sont fabriquées en Belgique.</p>
      </div>
      <div class="faq rv">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    </div>
  </section>

  <section class="conteneur" style="padding-bottom:20px">
    <div class="appel rv-zoom"><div><h2>Un projet d’ouverture ou de rénovation ?</h2><p>Envoyez votre liste ou votre plan : devis détaillé avec livraison, installation et raccordement.</p></div><div class="hero-actions" style="margin:0"><a class="btn btn-jaune btn-grand" href="#/devis-projet">Demander un devis ${ic('arrow')}</a><a class="btn btn-grand" href="${S.lienWhatsapp('Bonjour, j’ai un projet d’équipement horeca.')}" target="_blank" rel="noopener">${ic('phone')}WhatsApp</a></div></div>
  </section>`);
  brancherSimulateur();
}
function brancherSimulateur() {
  const sel = $('#simu-pack');
  if (!sel) return;
  const maj = () => {
    const m = PACKS.find((x) => x.slug === sel.value);
    const pk = packDe(m);
    const lignes = pk.map((p) => ({ id: p.id, qte: 1 }));
    const t = S.calculer(lignes);
    const r = S.reglages();
    $('#simu-resultat').innerHTML = `<div class="simu-pack">${pk.map((p) => `<a href="#/p/${p.id}" title="${esc(p.nom)}"><img src="${src(p.images[0])}" alt="${esc(p.nom)}" width="64" height="64"></a>`).join('')}</div>
      <div class="simu-chiffres">
        <div><span>${pk.length} équipements, HTVA</span><strong>${eur(t.ht)}</strong></div>
        <div><span>Total TVAC (21 %)</span><strong>${eur(t.ttc)}</strong></div>
        <div><span>Livraison en Belgique</span><strong>${t.port ? eur(t.port) + ' HTVA' : 'Gratuite'}</strong></div>
        <div><span>Économie sur les prix habituels</span><strong>${eur(t.economie)}</strong></div>
        <div class="grand"><span>Acompte à la commande (${r.acompte} %), solde à la livraison</span><strong>${eur(t.acompte)}</strong></div>
      </div>
      <div class="hero-actions" style="margin:0"><a class="btn btn-jaune" href="#/pack/${m.slug}">Voir le pack ${ic('arrow')}</a><button class="btn" type="button" data-simu-ajouter>${ic('cart')}Tout ajouter</button></div>`;
    $('[data-simu-ajouter]').addEventListener('click', () => { pk.forEach((p) => S.ajouter(p.id, 1)); toast(`${ic('check')} ${m.nom} ajouté : ${pk.length} équipements <a href="#/panier">Voir le panier</a>`); });
  };
  sel.addEventListener('change', maj);
  maj();
}

/* ---------- Catalogue (liste des univers) ---------- */
function vueCatalogue() {
  const fams = S.familles();
  const f0 = fil([['Catalogue']]);
  seo({ titre: 'Catalogue de matériel horeca | Discount Horeca', description: `Tout le matériel horeca : ${fams.map((f) => f.nom.toLowerCase()).join(', ')}. Prix HTVA et TVAC, livraison en Belgique.`, ld: f0.ld });
  rendre(`<div class="conteneur">${f0.html}
    <header class="section-titre" style="margin-top:8px"><div><span class="pill rv">Tout le catalogue</span><h1 class="page-titre rv" style="margin:14px 0 0">Le catalogue <span class="surligne">matériel horeca</span></h1><p class="rv">${S.produits().length} références dans ${fams.reduce((s, f) => s + f.sous.length, 0)} catégories. Démo : une sélection des ${nombre(S.RELEVE.site)} produits relevés sur le site actuel.</p></div></header>
    <div class="cat-liste">${fams.map((f, i) => { const pf = produitsDe(f.slug); return `<section class="cat-carte rv" style="${styleU(f.slug)};--i:${i % 2}">
      <a class="cat-carte-tete" href="#/c/${f.slug}"><img src="${src(photoU(f.slug, true))}" alt="" width="74" height="74" loading="lazy"><div><h2>${esc(f.nom)}</h2><p>${pf.length} références · ${nbMarques(pf)} marques</p></div>${ic('arrow')}</a>
      <ul>${f.sous.map((s) => `<li><a href="#/c/${f.slug}/${s.slug}"><span>${esc(s.nom)}</span><small>${produitsDe(f.slug, s.slug).length} réf. ${ic('right')}</small></a></li>`).join('')}</ul>
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
    <aside class="filtres" id="filtres" aria-label="Filtres">
      <div class="filtres-tete"><h2>Filtrer</h2><button class="btn-icone" type="button" data-fermer-filtres aria-label="Fermer">${ic('x')}</button></div>
      ${sousFamilles && sousFamilles.length > 1 ? `<div class="filtre"><h3>Catégorie</h3>${sousFamilles.map((s) => `<label class="case"><input type="checkbox" name="sous" value="${s.slug}" ${filtres.sous.has(s.slug) ? 'checked' : ''}><span>${esc(s.nom)}</span><small>${compte((p) => p.sous === s.slug)}</small></label>`).join('')}</div>` : ''}
      <div class="filtre"><h3>Disponibilité et offres</h3>
        <label class="case"><input type="checkbox" name="stock" ${filtres.stock ? 'checked' : ''}><span>En stock, livré en 24–72 h</span><small>${compte((p) => p.stock > 0)}</small></label>
        <label class="case"><input type="checkbox" name="promo" ${filtres.promo ? 'checked' : ''}><span>En promotion</span><small>${compte((p) => S.remisePromo(p) > 0)}</small></label>
        ${compte((p) => p.etat === 'exposition') ? `<label class="case"><input type="checkbox" name="expo" ${filtres.expo ? 'checked' : ''}><span>Modèles d’exposition</span><small>${compte((p) => p.etat === 'exposition')}</small></label>` : ''}
        ${compte(madeInBelgium) ? `<label class="case"><input type="checkbox" name="belge" ${filtres.belge ? 'checked' : ''}><span>Made in Belgium</span><small>${compte(madeInBelgium)}</small></label>` : ''}
      </div>
      <div class="filtre"><h3>Prix HTVA</h3>
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
        <select id="tri">${[['pertinence', 'Pertinence'], ['prix-asc', 'Prix croissant'], ['prix-desc', 'Prix décroissant'], ['promo', 'Plus forte promo'], ['nouveau', 'Nouveautés'], ['nom', 'Nom A → Z']].map(([v, t]) => `<option value="${v}" ${filtres.tri === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <div class="vue-bascule" role="group" aria-label="Affichage"><button type="button" data-vue="grille" aria-pressed="${modeVue === 'grille'}" aria-label="Grille">${ic('grid')}</button><button type="button" data-vue="liste" aria-pressed="${modeVue === 'liste'}" aria-label="Liste">${ic('list')}</button></div>
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
      promo: (a, b) => S.remisePromo(b) - S.remisePromo(a), nouveau: (a, b) => (b.ajoute || '').localeCompare(a.ajoute || ''), nom: (a, b) => a.nom.localeCompare(b.nom, 'fr'),
    }[filtres.tri];
    l = l.slice().sort(tri || ((a, b) => (b.stock > 0) - (a.stock > 0)));
    $('#liste-nb', el).textContent = `${l.length} produit${l.length > 1 ? 's' : ''}`;
    $('#filtres-valider', el).textContent = `Voir les ${l.length} produits`;
    $('#liste', el).innerHTML = l.length ? l.slice(0, filtres.limite).map(carte).join('') : `<div class="vide" style="grid-column:1/-1">${ic('search')}<h2>Aucun produit avec ces filtres</h2><p class="muet">Retirez un filtre ou demandez-nous : d’autres modèles sont disponibles sur commande.</p><button class="btn" type="button" data-effacer-filtres>Effacer les filtres</button></div>`;
    $('#voir-plus', el).innerHTML = l.length > filtres.limite ? `<button class="btn btn-sombre" type="button" data-voir-plus>Voir plus (${l.length - filtres.limite} restants)</button>` : '';
    const actifs = [
      ...[...filtres.sous].map((s) => [`sous:${s}`, sousFamilles?.find((x) => x.slug === s)?.nom || s]), ...[...filtres.marques].map((m) => [`marque:${m}`, m]),
      ...(filtres.stock ? [['stock', 'En stock']] : []), ...(filtres.promo ? [['promo', 'En promotion']] : []), ...(filtres.expo ? [['expo', 'Exposition']] : []), ...(filtres.belge ? [['belge', 'Made in Belgium']] : []),
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
    else if (['stock', 'promo', 'expo', 'belge'].includes(t.name)) filtres[t.name] = t.checked;
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
    titre: titreSeo(`${f.nom} : matériel horeca en Belgique | ${MARQUE}`, `${f.nom} horeca en Belgique | ${MARQUE}`, `${f.court} horeca | ${MARQUE}`),
    description: u.intro,
    ld: { '@graph': [f0.ld, { '@type': 'CollectionPage', name: f.nom, description: u.intro, url: `${BASE}#/c/${fam}` }, ...(u.faq.length ? [faqLd(u.faq)] : [])] },
  });
  rendre(`<section class="hero-univers" style="${styleU(fam)}">
      <div class="conteneur">${f0.html}</div>
      <div class="conteneur hero-univers-l">
        <div>
          <span class="pill rv" style="--c:${u.couleur}">${esc(u.pastille)}</span>
          <h1 class="rv" style="--i:1">${esc(u.titre[0])}<br><span class="surligne" style="--c:${u.couleur}">${esc(u.titre[1])}</span></h1>
          <p class="hero-univers-intro rv" style="--i:2">${esc(u.intro)}</p>
          <div class="stats">
            <div class="stat rv" style="--c:${u.couleur}"><strong data-compte="${f.sous.length}">${f.sous.length}</strong><span>Catégories</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:1"><strong data-compte="${ps.length}">${ps.length}</strong><span>Références</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:2"><strong data-compte="${nbMarques(ps)}">${nbMarques(ps)}</strong><span>Marques</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:3"><strong>${eur(prixMin(ps)).replace(/,00\s€/, ' €')}</strong><span>Dès, HTVA</span></div>
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
        <span><h3>${esc(s.nom)}</h3><p><b>${pss.length} réf.</b> · dès ${eur(prixMin(pss))} HTVA</p></span>
      </a>`; }).join('')}</div>
    </section>
    <section class="conteneur" id="zone-liste"></section>
    <section class="section conteneur">
      <div class="texte-seo">
        <div class="texte-seo-corps rv"><h2>${esc(f.nom)} : le matériel horeca à prix discount</h2>${u.seo.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        <div class="faq rv">${[...u.faq, FAQ[2], FAQ[5]].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      </div>
    </section>`);
  monterListe($('#zone-liste'), { cle: 'u/' + fam, base: ps, sousFamilles: f.sous, titre: `<div class="section-titre"><div><span class="pill rv" style="--c:${u.couleur}">La sélection</span><h2 class="rv" style="margin-top:14px">Tous les produits ${esc(f.court.toLowerCase())}</h2></div></div>` });
}
function vueSous(fam, sous) {
  const f = S.famille(fam);
  const sf = f?.sous.find((s) => s.slug === sous);
  if (!sf) return vueIntrouvable();
  const u = U(fam);
  const ps = produitsDe(fam, sous);
  const texte = u.sous[sous] || `${sf.nom} pour l’horeca, au prix HTVA et TVAC, livrés en Belgique.`;
  const f0 = fil([['Catalogue', '#/catalogue'], [f.nom, `#/c/${fam}`], [sf.nom]]);
  const vitrine = ps.slice().sort((a, b) => b.images.length - a.images.length || b.prixHT - a.prixHT)[0];
  seo({
    titre: titreSeo(`${sf.nom} horeca en Belgique | ${MARQUE}`, `${sf.nom} professionnels | ${MARQUE}`, `${sf.nom} | ${MARQUE}`),
    description: `${texte} Prix HTVA et TVAC, livraison en Belgique, showroom à Sint-Pieters-Leeuw.`,
    ld: { '@graph': [f0.ld, { '@type': 'CollectionPage', name: sf.nom, description: texte, url: `${BASE}#/c/${fam}/${sous}`, mainEntity: { '@type': 'ItemList', numberOfItems: ps.length, itemListElement: ps.slice(0, 20).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${BASE}#/p/${p.id}`, name: p.nom })) } }] },
  });
  rendre(`<section class="hero-univers" style="${styleU(fam)}">
      <div class="conteneur">${f0.html}</div>
      <div class="conteneur hero-univers-l" style="padding-bottom:30px">
        <div>
          <span class="pill rv" style="--c:${u.couleur}">${esc(f.nom)}</span>
          <h1 class="rv" style="--i:1">${esc(sf.nom)} <span class="surligne" style="--c:${u.couleur}">pour l’horeca</span></h1>
          <p class="hero-univers-intro rv" style="--i:2">${esc(texte)} Prix HTVA et TVAC, stock et délai sur chaque fiche.</p>
          <div class="stats">
            <div class="stat rv" style="--c:${u.couleur}"><strong data-compte="${ps.length}">${ps.length}</strong><span>Références</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:1"><strong data-compte="${nbMarques(ps)}">${nbMarques(ps)}</strong><span>Marques</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:2"><strong>${eur(prixMin(ps)).replace(/,00\s€/, ' €')}</strong><span>Dès, HTVA</span></div>
            <div class="stat rv" style="--c:${u.couleur};--i:3"><strong data-compte="${ps.filter((p) => p.stock > 0).length}">${ps.filter((p) => p.stock > 0).length}</strong><span>En stock, livrés en 24–72 h</span></div>
          </div>
        </div>
        ${vitrine ? `<div class="hero-sous-photo rv-zoom"><img src="${src(vitrine.images[0])}" alt="${esc(sf.nom)} professionnel" width="520" height="520"></div>` : ''}
      </div>
      <div class="conteneur"><nav class="mini-sous" aria-label="Autres catégories ${esc(f.nom)}">${f.sous.map((s, i) => `<a href="#/c/${fam}/${s.slug}" ${s.slug === sous ? 'aria-current="page"' : ''}><img src="${src(s.image || f.image)}" alt="" width="44" height="44" loading="lazy"><b>${String(i + 1).padStart(2, '0')}</b>${esc(s.nom)}</a>`).join('')}</nav></div>
    </section>
    <section class="conteneur" id="zone-liste" style="padding-top:28px"></section>
    <section class="section conteneur">
      <div class="texte-seo">
        <div class="texte-seo-corps rv"><h2>${esc(sf.nom)} : bien choisir</h2><p>${esc(texte)}</p>${u.seo.slice(0, 1).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        <div class="faq rv">${[...u.faq, FAQ[2]].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      </div>
    </section>`);
  monterListe($('#zone-liste'), { cle: `s/${fam}/${sous}`, base: ps });
}
function vueRecherche(q) {
  const res = S.rechercher(q, 500);
  $('#q').value = q;
  const fams = [...new Set(res.map((p) => p.famille))];
  seo({ titre: `« ${q} » | ${MARQUE}`, description: `Résultats pour ${q} : prix HTVA et TVAC, stock et délai.` });
  rendre(`<div class="conteneur">${fil([['Recherche'], [q]]).html}<h1 class="page-titre">« ${esc(q)} » <span class="muet" style="font-size:.5em">${res.length} résultat${res.length > 1 ? 's' : ''}</span></h1></div><section class="conteneur" id="zone-liste"></section>`);
  monterListe($('#zone-liste'), { cle: 'r/' + q, base: res, sousFamilles: fams.length === 1 ? S.famille(fams[0]).sous : null });
}
function vuePromos() {
  const base = S.produits().filter((p) => S.remisePromo(p) > 0 && p.etat === 'neuf');
  seo({ titre: `Promotions matériel horeca | ${MARQUE}`, description: `${base.length} promotions sur le matériel horeca : jusqu’à −${remiseMax(base)} % sur le prix habituel, prix HTVA et TVAC, livraison en Belgique.` });
  rendre(`<section class="hero-univers" style="--c:#f04e2e;--p:#fdebe7"><div class="conteneur">${fil([['Promotions']]).html}</div>
    <div class="conteneur" style="padding-bottom:36px"><span class="pill rv">Promotions</span>
      <h1 class="rv" style="--i:1">Jusqu’à <span class="surligne" style="--c:#f04e2e">−${remiseMax(base)} %</span> sur le matériel horeca</h1>
      <p class="hero-univers-intro rv" style="--i:2">${base.length} produits en promotion, triés par la plus forte baisse. Le prix barré est le prix habituel affiché sur le site actuel ; l’économie est calculée sur le prix HTVA.</p>
    </div></section><section class="conteneur" id="zone-liste" style="padding-top:28px"></section>`);
  monterListe($('#zone-liste'), { cle: 'promos', base, triDefaut: 'promo' });
}
function vueBonnesAffaires() {
  const r = S.reglages();
  const base = S.produits().filter((p) => S.bonneAffaire(p));
  seo({ titre: `Bonnes affaires et exposition | ${MARQUE}`, description: 'Promotions de plus de 35 % et modèles d’exposition du showroom : les bonnes affaires du matériel horeca, en quantités limitées.' });
  rendre(`<section class="hero-univers" style="--c:#f04e2e;--p:#fdebe7"><div class="conteneur">${fil([['Bonnes affaires']]).html}</div>
    <div class="conteneur" style="padding-bottom:36px"><span class="pill rv">Bonnes affaires</span>
      <h1 class="rv" style="--i:1">Les <span class="surligne" style="--c:#f04e2e">bonnes affaires</span> du showroom</h1>
      <p class="hero-univers-intro rv" style="--i:2">Promotions de −${r.seuilBonneAffaire} % et plus, et modèles d’exposition contrôlés : du matériel neuf ou presque, sous garantie. <em>Les modèles d’exposition et leurs défauts sont des exemples pour la démo.</em></p>
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
  const f0 = fil([[f?.nom || '', `#/c/${p.famille}`], [sf?.nom || '', `#/c/${p.famille}/${p.sous}`], [p.nom]]);
  const wa = S.lienWhatsapp(`Bonjour, une question sur : ${p.nom} (réf. ${p.ref})`);
  seo({
    titre: titreSeo(`${p.nom} | ${MARQUE}`, `${p.nom.slice(0, 40).trim()}… | ${MARQUE}`),
    description: `${p.nom}${p.marque ? ' ' + p.marque : ''} : ${eur(pu.unit)} HTVA (${eur(S.ttc(pu.unit))} TVAC)${promo ? `, −${promo} %` : ''}. ${(p.points || []).slice(0, 2).join('. ')}`,
    ld: { '@graph': [f0.ld, { '@type': 'Product', name: p.nom, sku: p.ref, ...(p.marque ? { brand: { '@type': 'Brand', name: p.marque } } : {}), image: p.images.filter((i) => !i.startsWith('data:')).map((i) => BASE + i), description: (p.points || []).join('. ') || p.nom, category: `${f?.nom} > ${sf?.nom}`, itemCondition: p.etat === 'exposition' ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition', offers: { '@type': 'Offer', url: `${BASE}#/p/${p.id}`, priceCurrency: 'EUR', price: p.prixHT, priceSpecification: { '@type': 'UnitPriceSpecification', price: p.prixHT, priceCurrency: 'EUR', valueAddedTaxIncluded: false }, availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/BackOrder', seller: { '@id': BASE + '#org' } } }] },
  });
  const bloc = `<div class="bloc-gros" data-achat>
      <div class="prix-revendeur"><small>${pu.remiseRevendeur ? `Votre prix revendeur · −${pu.remiseRevendeur} % inclus` : promo ? `Promotion −${promo} %` : 'Prix'}</small>
        <div class="prix-revendeur-l"><strong class="prix" id="pu">${eur(pu.unit)} <small>HTVA</small></strong>${pu.remiseRevendeur ? `<s>${eur(p.prixHT)}</s>` : pu.barre ? `<s>${eur(pu.barre)}</s><span class="pastille p-promo">−${promo} %</span>` : ''}</div>
        <p class="prix-tvac">${eur(S.ttc(pu.unit))} TVAC <span class="muet">· TVA 21 %</span></p></div>
      <div class="trio"><div><span>Économie</span><strong>${pu.barre || pu.remiseRevendeur ? eur((pu.barre || p.prixHT) - pu.unit) : '—'}</strong></div><div class="marge"><span>Acompte ${r.acompte} %</span><strong id="acompte">${eur(S.ttc(pu.unit) * r.acompte / 100)}</strong></div><div><span>Livraison gratuite</span><strong>${pu.unit >= r.franco ? 'Oui' : `dès ${nombre(r.franco)} €`}</strong></div></div>
      <div class="achat">${qteHtml(p)}<button class="btn btn-orange btn-grand" type="button" data-ajouter="${p.id}">${ic('cart')}${p.stock > 0 || p.etat === 'exposition' ? 'Ajouter au panier' : 'Commander'}</button></div>
      <div class="achat-total"><span id="ligne-detail"></span><strong id="ligne-total"></strong></div>
      <div class="achat-secondaires">
        <button class="btn" type="button" data-devis-produit>${ic('file')}Devis avec installation</button>
        <a class="btn" href="${wa}" target="_blank" rel="noopener">${ic('phone')}Question sur WhatsApp</a>
        ${S.estRevendeur() ? `<button class="btn" type="button" data-copier-fiche>${ic('copy')}Copier la fiche</button>` : ''}
      </div>
    </div>`;
  rendre(`<div class="conteneur">${f0.html}
    <div class="fiche">
      <div class="galerie rv-zoom">
        <div class="galerie-principale">${badges(p)}<img id="photo" src="${src(p.images[0])}" alt="${esc(p.nom)}" width="620" height="620"></div>
        ${p.images.length > 1 ? `<div class="galerie-vignettes">${p.images.map((im, i) => `<button type="button" data-photo="${i}" aria-current="${i === 0}" aria-label="Photo ${i + 1}"><img src="${src(im)}" alt="" width="80" height="80"></button>`).join('')}</div>` : ''}
      </div>
      <div class="fiche-infos">
        ${p.marque ? `<p class="fiche-marque">${esc(p.marque)}</p>` : ''}
        <h1>${esc(p.nom)}</h1>
        <div class="fiche-meta"><span>Réf. <strong>${esc(p.ref)}</strong></span>${dispo(p)}<button type="button" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}">${favs.includes(p.id) ? '♥ Dans mes favoris' : '♡ Ajouter aux favoris'}</button></div>
        ${p.etat === 'exposition' ? `<div class="encadre-sc"><strong>Modèle d’exposition — pièce unique</strong><span>${esc(p.defaut || '')}</span><span class="petit muet">Article d'exemple pour la démo.</span></div>` : ''}
        ${bloc}
        <ul class="fiche-garanties">
          <li>${ic('truck')}<p><strong>${p.stock > 0 ? 'En stock : livré en 24 à 72 h' : 'Sur commande : délai confirmé sous 24 h'}</strong><span>Partout en Belgique, gratuit dès ${eur(r.franco)} HTVA</span></p></li>
          <li>${ic('store')}<p><strong>Retrait gratuit au showroom</strong><span>Sint-Pieters-Leeuw, du lundi au samedi</span></p></li>
          <li>${ic('card')}<p><strong>Bancontact, Payconiq, carte, virement</strong><span>Ou ${r.acompte} % d’acompte, solde à la livraison</span></p></li>
          <li>${ic('shield')}<p><strong>Garantie un an</strong><span>Pièces et main-d’œuvre pour les professionnels</span></p></li>
        </ul>
      </div>
    </div>
    <section class="fiche-onglets">
      <div class="onglets-tete" role="tablist">
        <button role="tab" type="button" aria-selected="true" aria-controls="o-desc" id="t-desc">Description</button>
        ${p.specs?.length ? '<button role="tab" type="button" aria-selected="false" aria-controls="o-specs" id="t-specs">Caractéristiques techniques</button>' : ''}
        <button role="tab" type="button" aria-selected="false" aria-controls="o-liv" id="t-liv">Livraison et paiement</button>
      </div>
      <div class="onglet" role="tabpanel" id="o-desc" aria-labelledby="t-desc">
        ${p.points?.length ? `<ul class="points-cles">${p.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        ${(p.texte || []).map((x) => `<p style="margin-top:12px">${esc(x)}</p>`).join('')}
      </div>
      ${p.specs?.length ? `<div class="onglet" role="tabpanel" id="o-specs" aria-labelledby="t-specs" hidden><div class="specs">${p.specs.map(([g, l]) => `<div><h3>${esc(g)}</h3><table>${l.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table></div>`).join('')}</div></div>` : ''}
      <div class="onglet" role="tabpanel" id="o-liv" aria-labelledby="t-liv" hidden><div class="specs">
        <div><h3>Livraison</h3><table><tr><td>Belgique, 1 livreur, devant la porte (rez-de-chaussée)</td><td>${p.stock > 0 ? '24 à 72 h' : 'Sur commande'}</td></tr><tr><td>Livraison gratuite</td><td>dès ${eur(r.franco)} HTVA</td></tr><tr><td>Sous ce montant</td><td>${eur(r.fraisLivraison)} HTVA (exemple)</td></tr><tr><td>Retrait au showroom</td><td>Gratuit</td></tr><tr><td>Installation et raccordement</td><td>Sur devis</td></tr><tr><td>Hors Belgique</td><td>Nous contacter avant de commander</td></tr></table></div>
        <div><h3>Paiement</h3><table><tr><td>En ligne</td><td>Bancontact, Payconiq, Visa, Mastercard</td></tr><tr><td>Virement</td><td>Préparation à réception</td></tr><tr><td>Acompte</td><td>${r.acompte} % à la commande, solde à la livraison</td></tr><tr><td>Au showroom</td><td>Au retrait</td></tr></table></div>
      </div><p class="petit muet" style="margin-top:14px">Conditions reprises des conditions de vente publiées ; frais de livraison sous le franco : valeur d’exemple, réglable dans l’admin.</p></div>
    </section>
    ${memes.length ? `<section class="section" style="padding-top:0"><div class="section-titre"><h2>Dans la même catégorie</h2><a href="#/c/${p.famille}/${p.sous}">Tout voir ${ic('arrow')}</a></div><div class="rangee">${memes.map(carte).join('')}</div></section>` : ''}
  </div>
  <div class="barre-mobile"><div><strong id="bm-prix">${eur(pu.unit)} HTVA</strong><small>${eur(S.ttc(pu.unit))} TVAC${promo ? ` · −${promo} %` : ''}</small></div><button class="btn btn-orange" type="button" data-ajouter-mobile>${ic('cart')}Ajouter</button></div>`);
  document.body.classList.add('avec-barre');
  const inp = $('.bloc-gros input[name=qte]');
  const majPrix = () => {
    const q = S.ajusterQte(p, inp.value);
    $('#ligne-detail').textContent = `${q} × ${eur(pu.unit)} HTVA · ${eur(S.ttc(pu.unit * q))} TVAC`;
    $('#ligne-total').textContent = `${eur(pu.unit * q)} HTVA`;
    $('#acompte').textContent = eur(S.ttc(pu.unit * q) * r.acompte / 100);
  };
  inp.addEventListener('input', majPrix);
  inp.addEventListener('change', () => { inp.value = S.ajusterQte(p, inp.value); majPrix(); });
  majPrix();
  $('[data-ajouter-mobile]').addEventListener('click', () => $('.bloc-gros [data-ajouter]').click());
  $('[data-devis-produit]').addEventListener('click', () => demanderDevis([{ id: p.id, qte: S.ajusterQte(p, inp.value) }]));
  $('[data-copier-fiche]')?.addEventListener('click', async () => {
    const t = [p.nom, p.marque ? `Marque : ${p.marque}` : '', `Référence : ${p.ref}`, '', ...(p.points || []).map((x) => `• ${x}`), '', ...(p.texte || []), '', ...(p.specs || []).flatMap(([g, l]) => [g, ...l.map(([k, v]) => `${k} : ${v}`), ''])].join('\n');
    try { await navigator.clipboard.writeText(t); toast(`${ic('check')} Fiche copiée`); } catch { toast('Copie impossible dans ce navigateur.', 'erreur'); }
  });
  $$('[data-photo]').forEach((b) => b.addEventListener('click', () => { $('#photo').src = src(p.images[+b.dataset.photo]); $$('[data-photo]').forEach((x) => x.setAttribute('aria-current', x === b)); }));
  $$('[role=tab]').forEach((t) => t.addEventListener('click', () => {
    $$('[role=tab]').forEach((x) => x.setAttribute('aria-selected', x === t));
    $$('[role=tabpanel]').forEach((x) => { x.hidden = x.id !== t.getAttribute('aria-controls'); });
  }));
}

/* ---------- Packs ---------- */
function vuePacks() {
  seo({ titre: `Packs d’ouverture horeca | ${MARQUE}`, description: 'Packs friterie, pizzeria, brasserie, café et boulangerie : l’équipement de base d’un établissement en une commande, prix HTVA et TVAC.' });
  rendre(`<div class="conteneur">${fil([['Packs']]).html}
    <h1 class="page-titre">Packs <span class="surligne" style="--c:var(--orange)">prêts à ouvrir</span></h1>
    <p class="hero-univers-intro" style="margin:-8px 0 22px">Un appareil par poste, en stock de préférence. Ajoutez un pack d’un coup ou demandez un devis avec installation.</p>
    <div class="metiers">${PACKS.map((m, i) => { const pk = packDe(m); return `<article class="metier rv" style="--i:${i}">
      <div class="metier-tete">${ic(m.icone)}<div><h2 style="font-size:20px">${esc(m.nom)}</h2><p>${esc(m.desc)}</p></div></div>
      <div class="metier-imgs">${pk.map((p) => `<img src="${src(p.images[0])}" alt="${esc(p.nom)}" loading="lazy" width="80" height="80">`).join('')}</div>
      <p class="petit">${pk.length} équipements · <strong>${eur(totalPack(pk))} HTVA</strong> · ${eur(S.ttc(totalPack(pk)))} TVAC</p>
      <a class="btn" href="#/pack/${m.slug}">Voir le pack ${ic('arrow')}</a>
    </article>`; }).join('')}</div></div>`);
}
function vuePack(slug) {
  const m = PACKS.find((x) => x.slug === slug);
  if (!m) return vueIntrouvable();
  const pk = packDe(m);
  const t = S.calculer(pk.map((p) => ({ id: p.id, qte: 1 })));
  seo({ titre: `${m.nom} : équipement complet | ${MARQUE}`, description: `${m.nom} : ${m.desc} ${eur(t.ht)} HTVA, livraison en Belgique.` });
  rendre(`<div class="conteneur">${fil([['Packs', '#/packs'], [m.nom]]).html}
    <h1 class="page-titre">${esc(m.nom)} <span class="surligne" style="--c:var(--orange)">prêt à ouvrir</span></h1>
    <p class="hero-univers-intro" style="margin:-8px 0 22px">${esc(m.desc)} Ajoutez le pack d’un coup, puis ajustez les quantités ou remplacez un modèle.</p>
    <div class="panier">
      <div class="panier-lignes">${pk.map((p) => `<div class="ligne"><a href="#/p/${p.id}"><img src="${src(p.images[0])}" alt="" width="96" height="96"></a><div><p class="petit muet">${esc(S.sousFamille(p.famille, p.sous)?.nom || '')}</p><h3><a href="#/p/${p.id}">${esc(p.nom)}</a></h3><div class="ligne-meta"><span>Réf. ${esc(p.ref)}</span>${dispo(p)}</div></div><div class="ligne-actions"><span class="ligne-total">${eur(prixDe(p))}<small class="muet"> HTVA</small></span><a class="btn btn-petit" href="#/c/${p.famille}/${p.sous}">Autres modèles</a></div></div>`).join('')}</div>
      <aside class="resume"><h2>${esc(m.nom)}</h2>
        <div class="resume-l"><span>${pk.length} équipements</span><strong>${eur(t.ht)} HTVA</strong></div>
        <div class="resume-l"><span>Livraison</span><span>${t.port ? eur(t.port) + ' HTVA' : 'Gratuite'}</span></div>
        <div class="resume-l"><span>TVA 21 %</span><span>${eur(t.tva)}</span></div>
        <div class="resume-total"><span>Total TVAC</span><strong>${eur(t.ttc)}</strong></div>
        <div class="resume-l vert"><span>Acompte ${S.reglages().acompte} % à la commande</span><span>${eur(t.acompte)}</span></div>
        <button class="btn btn-orange btn-grand" type="button" data-pack>${ic('cart')}Ajouter le pack au panier</button>
        <button class="btn" type="button" data-pack-devis>${ic('file')}Devis avec installation</button>
      </aside>
    </div></div>`);
  $('[data-pack]').addEventListener('click', () => { pk.forEach((p) => S.ajouter(p.id, 1)); toast(`${ic('check')} Pack ajouté : ${pk.length} équipements <a href="#/panier">Voir le panier</a>`); });
  $('[data-pack-devis]').addEventListener('click', () => demanderDevis(pk.map((p) => ({ id: p.id, qte: 1 }))));
}

/* ---------- Panier ---------- */
function vuePanier() {
  seo({ titre: `Panier | ${MARQUE}`, description: 'Votre panier.' });
  const lignes = S.panier();
  if (!lignes.length) {
    rendre(`<div class="conteneur">${fil([['Panier']]).html}<h1 class="page-titre">Votre panier</h1>
      <div class="vide">${ic('cart')}<h2>Votre panier est vide</h2><p class="muet">Parcourez le catalogue, profitez des promotions ou partez d’un pack d’ouverture.</p>
      <div class="hero-actions" style="margin:0;justify-content:center"><a class="btn btn-plein" href="#/catalogue">Voir le catalogue</a><a class="btn" href="#/promos">${ic('percent')}Promotions</a><a class="btn" href="#/packs">${ic('box')}Packs</a></div></div></div>`);
    return;
  }
  const t = S.calculer(lignes);
  const r = S.reglages();
  rendre(`<div class="conteneur">${fil([['Panier']]).html}<h1 class="page-titre">Votre panier <span class="muet" style="font-size:.5em">${S.nbArticles()} article${S.nbArticles() > 1 ? 's' : ''}</span></h1>
    <div class="panier">
      <div>
        <div class="panier-lignes">${t.lignes.map((l) => `<div class="ligne">
          <a href="#/p/${l.id}"><img src="${src(l.p.images[0])}" alt="" width="96" height="96"></a>
          <div>
            <h3><a href="#/p/${l.id}">${esc(l.p.nom)}</a></h3>
            <div class="ligne-meta"><span>Réf. ${esc(l.p.ref)}</span>${l.p.stock > 0 ? '<span>En stock</span>' : '<span class="pastille p-bleu">Sur commande</span>'}</div>
            <p class="ligne-pu">${eur(l.unit)} HTVA / pièce ${l.barre || l.remiseRevendeur ? `<s>${eur(l.remiseRevendeur ? l.base : l.barre)}</s>` : ''} ${S.remisePromo(l.p) ? `<span class="pastille p-promo">−${S.remisePromo(l.p)} %</span>` : ''} ${l.remiseRevendeur ? `<span class="pastille p-bleu">−${l.remiseRevendeur} % revendeur</span>` : ''} <span class="petit muet">${eur(S.ttc(l.unit))} TVAC</span></p>
          </div>
          <div class="ligne-actions">${qteHtml(l.p, l.qte, l.id)}<span class="ligne-total">${eur(l.total)}</span><button class="btn btn-lien btn-petit btn-danger" type="button" data-retirer-ligne="${l.id}">${ic('trash')}Retirer</button></div>
        </div>`).join('')}</div>
        <div class="hero-actions" style="margin-top:14px"><a class="btn" href="#/catalogue">${ic('left')}Continuer</a><a class="btn" href="#/commande-rapide">${ic('zap')}Ajouter par référence</a><button class="btn btn-lien btn-danger" type="button" data-vider>Vider le panier</button></div>
      </div>
      <aside class="resume">
        <h2>Récapitulatif</h2>
        ${jauges(t)}
        <div class="resume-l"><span>Total HTVA</span><strong>${eur(t.ht)}</strong></div>
        ${t.economie > 0 ? `<div class="resume-l vert"><span>Votre économie</span><span>${eur(t.economie)} HTVA</span></div>` : ''}
        <div class="resume-l"><span>Livraison HTVA</span><span>${t.port ? eur(t.port) : 'Gratuite'}</span></div>
        <div class="resume-l"><span>TVA ${r.tva} %</span><span>${eur(t.tva)}</span></div>
        <div class="resume-total"><span>Total TVAC</span><strong>${eur(t.ttc)}</strong></div>
        <a class="btn btn-orange btn-grand" href="#/commande">Commander ${ic('arrow')}</a>
        <button class="btn" type="button" data-devis-panier>${ic('file')}Transformer en devis PDF</button>
        <p class="petit muet">Paiement en ligne ou acompte de ${r.acompte} % (${eur(t.acompte)}), solde à la livraison. Retrait gratuit au showroom possible.</p>
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
    const rr = await modale({ titre: 'Vider le panier ?', corps: '<p>Tous les articles seront retirés.</p>', actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Vider', classe: 'btn-sombre' }] });
    if (rr.action === 'ok') { S.viderPanier(); vuePanier(); }
  });
  $('[data-devis-panier]').addEventListener('click', () => demanderDevis(S.panier()));
}

async function demanderDevis(lignes, message = '') {
  let c = S.clientConnecte();
  if (!c) { if (!(await ouvrirAcces('Le devis est établi au nom de votre société : connectez-vous ou entrez avec un compte de démo.'))) return; c = S.clientConnecte(); }
  if (!c) return;
  const r = await modale({
    titre: 'Demande de devis',
    corps: `<p class="muet">Un devis à votre nom, valable ${S.reglages().validiteDevis} jours, imprimable en PDF. Précisez l’installation, le raccordement (gaz, électricité, eau), l’étage, les dimensions sur mesure ou la date d’ouverture : nous confirmons le prix final.</p>
      <div class="carte-societe"><span><strong>${esc(c.societe)}</strong><br>${esc(c.contact)} · ${esc(c.email)}</span></div>
      <label class="champ"><span>Votre message</span><textarea name="message" rows="3" placeholder="Installation souhaitée, accès, délai…">${esc(message)}</textarea></label>`,
    actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Créer le devis', classe: 'btn-plein' }],
  });
  if (r.action !== 'ok') return;
  const d = S.creerDevis({ client: { id: c.id, societe: c.societe, contact: c.contact, email: c.email, tel: c.tel, bce: c.bce, tva: c.tva }, lignes, message: r.donnees.message });
  location.hash = `#/document/devis/${d.num}`;
  toast(`${ic('check')} Devis ${d.num} créé`);
}
function vueDevisProjet() {
  seo({ titre: `Devis pour un projet horeca | ${MARQUE}`, description: 'Ouverture, rénovation, cuisine complète : envoyez votre liste ou votre plan, nous chiffrons livraison, installation et raccordement.' });
  rendre(`<div class="conteneur">${fil([['Devis projet']]).html}<h1 class="page-titre">Un projet <span class="surligne" style="--c:var(--orange)">d’ouverture ou de rénovation</span> ?</h1>
    <div class="connexion">
      <section class="carte-blanche"><h2>Comment ça se passe</h2>
        <ul class="avantages-pro">
          <li>${ic('check')}Vous envoyez votre liste, un plan ou des photos de la cuisine</li>
          <li>${ic('check')}Nous vous rappelons sous 24 h ouvrées, ou vous passez au showroom</li>
          <li>${ic('check')}Devis détaillé : matériel, inox sur mesure, livraison, installation et raccordement</li>
          <li>${ic('check')}Acompte de ${S.reglages().acompte} % à la commande, solde à la livraison</li>
        </ul>
        <div class="hero-actions" style="margin:0"><a class="btn" href="${S.lienWhatsapp('Bonjour, j’ai un projet d’équipement horeca.')}" target="_blank" rel="noopener">${ic('phone')}WhatsApp</a><a class="btn" href="#/infos/contact">${ic('pin')}Showroom</a></div>
      </section>
      <section class="carte-blanche"><h2>Votre projet</h2>
        <form id="form-projet" style="display:grid;gap:12px" novalidate>
          <label class="champ"><span>Type d’établissement</span><select name="activite">${S.ACTIVITES.map((a) => `<option>${a}</option>`).join('')}</select></label>
          <label class="champ"><span>Votre besoin *</span><textarea name="message" rows="5" required placeholder="Ex. : cuisine de 40 couverts, ligne de cuisson gaz série 700, hotte de 3 m, plonge et lave-vaisselle, ouverture en mars."></textarea></label>
          <label class="champ"><span>Plan ou photos (facultatif)</span><input type="file" name="fichiers" accept="image/*,.pdf" multiple></label>
          <button class="btn btn-orange btn-grand" type="submit">Envoyer ma demande</button>
          <p class="petit muet">Démo : la demande devient un devis dans l’espace admin ; aucun fichier n’est envoyé.</p>
        </form>
      </section>
    </div></div>`);
  $('#form-projet').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.message.value.trim();
    if (!msg) { e.target.message.closest('.champ').classList.add('erreur'); e.target.message.focus(); toast('Décrivez votre besoin en quelques mots.', 'erreur'); return; }
    demanderDevis(S.panier(), `${e.target.activite.value} : ${msg}`);
  });
}

/* ---------- Commande ---------- */
function vueCommande() {
  seo({ titre: `Commande | ${MARQUE}`, description: 'Validation de la commande.' });
  const lignes = S.panier();
  if (!lignes.length) { location.hash = '#/panier'; return; }
  const c = S.clientConnecte();
  const r = S.reglages();
  rendre(`<div class="conteneur">${fil([['Panier', '#/panier'], ['Commande']]).html}<h1 class="page-titre">Commande</h1>
    <form class="tunnel" id="form-commande" novalidate>
      <div>
        <section class="etape">
          <div class="etape-titre"><span>1</span><h2>${c ? esc(c.societe) : 'Vos coordonnées'}</h2></div>
          ${c ? `<div class="carte-societe"><span>${esc(c.contact)} · ${esc(c.email)} · ${esc(c.tel)}${c.bce ? `<br>N° d’entreprise ${esc(c.bce)} · TVA ${esc(c.tva)}` : ''}</span><span class="pastille ${S.estRevendeur(c) ? 'p-bleu' : 'p-vert'}">${S.estRevendeur(c) ? `Revendeur −${r.remiseRevendeur} %` : esc(S.TYPES[c.type] || 'Compte pro')}</span></div>`
    : `<p class="petit muet" style="margin-bottom:10px">Déjà client ? <button class="btn-lien" type="button" data-voir-prix style="padding:0">Connectez-vous</button> pour retrouver vos adresses.</p>
          <div class="choix choix-ligne">${[['pro', 'Professionnel', 'Facture au nom de la société'], ['particulier', 'Particulier', 'Facture à votre nom']].map(([v, tt, d], i) => `<label><input type="radio" name="profil" value="${v}" ${i === 0 ? 'checked' : ''}><span><strong>${tt}</strong><small>${d}</small></span></label>`).join('')}</div>
          <div class="grille-champs">
            <label class="champ" data-pro><span>Société *</span><input name="societe" autocomplete="organization"></label>
            <label class="champ" data-pro><span>N° d’entreprise (BCE) *</span><input name="bce" inputmode="numeric" placeholder="0123.456.749"><small id="aide-bce">10 chiffres · le n° de TVA est calculé tout seul.</small></label>
            <label class="champ"><span>Nom et prénom *</span><input name="contact" autocomplete="name"></label>
            <label class="champ"><span>E-mail *</span><input name="email" type="email" autocomplete="email"></label>
            <label class="champ"><span>Téléphone *</span><input name="tel" type="tel" autocomplete="tel"></label>
          </div>
          <label class="case petit" style="margin-top:8px"><input type="checkbox" name="creer" checked><span>Créer mon compte avec ces informations (suivi, factures, recommande)</span></label>`}
        </section>
        <section class="etape">
          <div class="etape-titre"><span>2</span><h2>Livraison</h2></div>
          <div class="choix" id="choix-livraison">
            ${[['livraison', 'Livraison en Belgique', `1 livreur, devant la porte, au rez-de-chaussée · 24 à 72 h pour le stock · gratuite dès ${eur(r.franco)} HTVA`], ['installation', 'Livraison + installation et raccordement', 'Mise en place, raccordement et mise en service chiffrés sur devis avant intervention'], ['showroom', 'Retrait au showroom', `${r.adresse} · ${r.horaires.toLowerCase()} · gratuit`]].map(([v, tt, d], i) => `<label><input type="radio" name="mode" value="${v}" ${i === 0 ? 'checked' : ''}><span><strong>${tt}</strong><small>${esc(d)}</small></span><em data-prix-mode="${v}"></em></label>`).join('')}
          </div>
          <div class="grille-champs" id="adresse">
            <label class="champ" style="grid-column:1/-1"><span>Adresse de livraison *</span><input name="adresse" autocomplete="street-address" value="${esc(c?.adresse || '')}"></label>
            <label class="champ"><span>Code postal *</span><input name="cp" inputmode="numeric" autocomplete="postal-code" value="${esc(c?.cp || '')}" maxlength="4"></label>
            <label class="champ"><span>Commune *</span><input name="ville" autocomplete="address-level2" value="${esc(c?.ville || '')}"></label>
            <p class="petit muet" style="grid-column:1/-1">Livraison en Belgique. Pour un autre pays, <a href="#/infos/contact">contactez-nous avant de commander</a>.</p>
          </div>
        </section>
        <section class="etape">
          <div class="etape-titre"><span>3</span><h2>Paiement</h2></div>
          <div class="choix" id="choix-paiement">
            ${[['bancontact', 'Bancontact / Payconiq', 'Paiement immédiat avec l’app bancaire · simulé dans la démo'], ['carte', 'Carte Visa / Mastercard', 'Page sécurisée de la banque · simulé dans la démo'], ['acompte', `Acompte de ${r.acompte} % en ligne`, 'Le solde est payé à la livraison ou au retrait (conditions de vente, art. 2.2)'], ['virement', 'Virement bancaire', 'Préparation à réception du virement'], ['showroom', 'Paiement au showroom', 'Uniquement avec le retrait au showroom']].map(([v, tt, d], i) => `<label><input type="radio" name="paiement" value="${v}" ${i === 0 ? 'checked' : ''}><span><strong>${tt}</strong><small>${d}</small></span><em data-prix-paiement="${v}"></em></label>`).join('')}
          </div>
          <div class="grille-champs">
            <label class="champ"><span>Votre référence (bon de commande)</span><input name="refClient" placeholder="BC-2026-0145"></label>
            <label class="champ"><span>Instructions (accès, horaires, étage…)</span><input name="note"></label>
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
    const t = S.calculer(lignes, mode);
    $('#adresse').hidden = mode === 'showroom';
    $$('[data-pro]').forEach((x) => { x.hidden = form.profil?.value === 'particulier'; });
    $$('[data-prix-mode]').forEach((e) => { const tt = S.calculer(lignes, e.dataset.prixMode); e.textContent = e.dataset.prixMode === 'installation' ? (tt.port ? eur(tt.port) + ' + devis' : 'Devis') : tt.port ? eur(tt.port) + ' HTVA' : 'Gratuit'; });
    $('[data-prix-paiement=acompte]').textContent = eur(t.acompte);
    const pay = form.paiement.value;
    $('#resume-commande').innerHTML = `<h2>Votre commande</h2>
      <div class="resume-lignes">${t.lignes.map((l) => `<div><img src="${src(l.p.images[0])}" alt="" width="44" height="44"><span>${l.qte} × ${esc(l.p.nom)}</span><strong>${eur(l.total)}</strong></div>`).join('')}</div>
      <div class="resume-l"><span>Total HTVA</span><strong>${eur(t.ht)}</strong></div>
      ${t.economie > 0 ? `<div class="resume-l vert"><span>Votre économie</span><span>${eur(t.economie)}</span></div>` : ''}
      <div class="resume-l"><span>Livraison HTVA</span><span>${mode === 'showroom' ? 'Retrait gratuit' : t.port ? eur(t.port) : 'Gratuite'}${mode === 'installation' ? ' + installation sur devis' : ''}</span></div>
      <div class="resume-l"><span>TVA ${r.tva} %</span><span>${eur(t.tva)}</span></div>
      <div class="resume-total"><span>Total TVAC</span><strong>${eur(t.ttc)}</strong></div>
      ${pay === 'acompte' ? `<div class="resume-l vert"><span>À payer maintenant (${r.acompte} %)</span><strong>${eur(t.acompte)}</strong></div><div class="resume-l"><span>Solde à la livraison</span><span>${eur(t.ttc - t.acompte)}</span></div>` : ''}
      <label class="case petit"><input type="checkbox" name="cgv" required><span>J’accepte les <a href="#/infos/conditions" target="_blank">conditions générales de vente</a>.</span></label>
      <button class="btn btn-orange btn-grand" type="submit">${ic('check')}${pay === 'bancontact' || pay === 'carte' ? `Payer ${eur(t.ttc)}` : pay === 'acompte' ? `Payer l’acompte de ${eur(t.acompte)}` : 'Valider la commande'}</button>
      <p class="petit muet">Démo : aucune somme n’est prélevée.</p>`;
  };
  form.addEventListener('change', (e) => { if (['mode', 'paiement', 'profil'].includes(e.target.name)) majResume(); });
  form.bce?.addEventListener('input', () => {
    const v = form.bce.value.replace(/\D/g, '');
    const aide = $('#aide-bce');
    if (v.length === 10) { const ok = S.bceValide(v); aide.textContent = ok ? `Numéro valide ✓ · TVA ${S.tvaDepuisBce(v)}` : 'Numéro invalide : vérifiez les chiffres.'; aide.style.color = ok ? 'var(--vert)' : 'var(--rouge)'; }
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
    if (err) { err.focus(); toast('Vérifiez les champs en rouge.', 'erreur'); return; }
    if (!d.cgv) { toast('Merci d’accepter les conditions générales de vente.', 'erreur'); return; }
    let cli = c;
    if (!cli) {
      const infos = { type: pro ? 'horeca' : 'particulier', societe: pro ? d.societe.trim() : d.contact.trim(), contact: d.contact.trim(), email: d.email.trim(), tel: d.tel.trim(), adresse: d.adresse || '', cp: d.cp || '', ville: d.ville || '', pays: 'Belgique', ...(pro ? { bce: S.bceFormat(d.bce), tva: S.tvaDepuisBce(d.bce) } : {}) };
      if (d.creer) { cli = S.creerClient(infos); S.connecter(cli.id); } else cli = { id: null, ...infos };
    }
    const cmd = S.passerCommande({
      client: { id: cli.id, societe: cli.societe, contact: cli.contact, email: cli.email, tel: cli.tel, bce: cli.bce || '', tva: cli.tva || '' },
      livraison: d.mode === 'showroom' ? { mode: 'showroom', cp: d.cp || cli.cp || '' } : { mode: d.mode, adresse: d.adresse, cp: d.cp, ville: d.ville, pays: 'Belgique' },
      paiement: d.paiement, note: d.note, refClient: d.refClient, lignes,
    });
    S.viderPanier();
    try { sessionStorage.setItem('dh-suivi-' + cmd.num, '1'); } catch { /* rien */ }
    location.hash = `#/merci/${cmd.num}`;
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
    return `<div class="chrono-etape ${etat}"><span class="chrono-pastille">${etat === 'fait' ? ic('check') : ic(icones[s])}</span><span>${S.statut(s, retrait).nom}${quand(s) ? `<small><br>${new Date(quand(s)).toLocaleString('fr-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</small>` : ''}</span></div>`;
  }).join('')}</div>`;
}
function detailCommande(c) {
  const retrait = c.livraison?.mode === 'showroom';
  return `<section class="carte-blanche">
      <div class="section-titre" style="margin:0"><div><h2>Commande ${esc(c.num)}</h2><p>Passée le ${dateLongue(c.date)} · ${esc(S.PAIEMENTS[c.paiement] || '')}${c.refClient ? ` · votre réf. ${esc(c.refClient)}` : ''}</p></div>
      <span class="pastille ${c.statut === 'livree' ? 'p-vert' : c.statut === 'annulee' ? 'p-rouge' : c.statut === 'attente' ? 'p-jaune' : 'p-bleu'}">${S.statut(c.statut, retrait).nom}</span></div>
      ${c.statut === 'annulee' ? `<div class="info-bulle jaune">${ic('info')}<span>Cette commande a été annulée.</span></div>` : chronologie(c)}
      ${c.suivi ? `<div class="suivi-colis">${ic('truck')}<span>${esc(c.transporteur)} · n° de suivi <code>${esc(c.suivi)}</code></span></div>` : ''}
      ${c.livraison?.mode === 'installation' ? `<div class="suivi-colis">${ic('settings')}<span>Installation et raccordement : un technicien vous appelle pour fixer le rendez-vous et confirmer le devis.</span></div>` : ''}
      ${retrait && c.statut === 'expediee' ? `<div class="suivi-colis">${ic('store')}<span>Votre commande vous attend au showroom : <strong>${esc(S.reglages().adresse)}</strong></span></div>` : ''}
    </section>
    <section class="carte-blanche"><h2>Articles</h2>
      <div class="tableau-scroll"><table class="tableau"><thead><tr><th></th><th>Article</th><th class="num">Qté</th><th class="num">PU HTVA</th><th class="num">Total HTVA</th></tr></thead><tbody>
      ${c.lignes.map((l) => `<tr><td><img src="${src(l.image)}" alt="" width="44" height="44" style="object-fit:contain"></td><td>${esc(l.nom)}<br><small class="muet">Réf. ${esc(l.ref)}</small></td><td class="num">${l.qte}</td><td class="num">${eur(l.unit)}</td><td class="num">${eur(l.total)}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="resume-l"><span>Total HTVA</span><strong>${eur(c.totaux.ht)}</strong></div>
      <div class="resume-l"><span>Livraison HTVA</span><span>${c.totaux.port ? eur(c.totaux.port) : retrait ? 'Retrait gratuit' : 'Gratuite'}</span></div>
      <div class="resume-total"><span>Total TVAC</span><strong>${eur(c.totaux.ttc)}</strong></div>
      ${c.totaux.acompte ? `<div class="resume-l vert"><span>Acompte payé</span><span>${eur(c.totaux.acompte)} · solde ${eur(c.totaux.ttc - c.totaux.acompte)} à la livraison</span></div>` : ''}
      <div class="hero-actions" style="margin-top:4px"><a class="btn" href="#/document/facture/${c.num}">${ic('file')}Facture</a><button class="btn" type="button" data-recommander="${c.num}">${ic('repeat')}Recommander</button></div>
    </section>`;
}
function vueMerci(num) {
  const c = S.commande(num);
  if (!c) return vueIntrouvable();
  seo({ titre: `Commande confirmée | ${MARQUE}`, description: '' });
  rendre(`<div class="conteneur merci">
    <div class="merci-tete">${ic('check')}<h1>Merci, votre commande est enregistrée</h1>
      <p>Commande <strong>${esc(c.num)}</strong> · ${eur(c.totaux.ttc)} TVAC. Un récapitulatif part à <strong>${esc(c.client.email)}</strong>.</p>
      ${c.paiement === 'virement' ? `<div class="info-bulle jaune">${ic('info')}<span>Virement de <strong>${eur(c.totaux.ttc)}</strong> avec la communication <strong>${esc(c.num)}</strong> : les coordonnées bancaires figurent dans l’e-mail de confirmation. La préparation démarre à réception.</span></div>` : ''}
      ${c.paiement === 'acompte' ? `<div class="info-bulle vert">${ic('check')}<span>Acompte de <strong>${eur(c.totaux.acompte)}</strong> payé (simulé). Solde de ${eur(c.totaux.ttc - c.totaux.acompte)} à la livraison.</span></div>` : ''}
      <div class="hero-actions" style="justify-content:center;margin:0"><a class="btn btn-plein" href="#/suivi/${c.num}">${ic('truck')}Suivre la commande</a><a class="btn" href="#/document/facture/${c.num}">${ic('file')}Facture</a><a class="btn" href="#/">Accueil</a></div>
    </div>
    <div class="info-bulle">${ic('info')}<span><strong>Pour la démo :</strong> ouvrez l’<a href="admin/#/commandes/${c.num}" target="_blank" rel="noopener"><strong>espace admin</strong></a>, faites avancer la commande (préparation, livraison, livrée), puis revenez au suivi : il se met à jour tout seul.</span></div>
    ${detailCommande(c)}</div>`);
}
function vueSuivi(num) {
  const cli = S.clientConnecte();
  const c = num ? S.commande(num) : null;
  let ok = false;
  try { ok = !!(c && (sessionStorage.getItem('dh-suivi-' + num) || (cli && c.client.id === cli.id))); } catch { ok = !!(c && cli && c.client.id === cli.id); }
  seo({ titre: `Suivi de commande | ${MARQUE}`, description: 'Suivez votre commande : préparation, livraison, retrait au showroom.' });
  if (c && ok) { rendre(`<div class="conteneur merci">${fil([['Suivi de commande', '#/suivi'], [c.num]]).html}${detailCommande(c)}</div>`); return; }
  const miennes = cli ? S.commandes().filter((x) => x.client.id === cli.id).slice(0, 6) : [];
  const ex = S.commandes().find((x) => x.statut === 'expediee' && x.livraison?.cp);
  rendre(`<div class="conteneur merci">${fil([['Suivi de commande']]).html}
    <h1 class="page-titre" style="margin-bottom:0">Suivre une commande</h1>
    <form class="carte-blanche" id="form-suivi">
      <p class="muet">Numéro de commande et code postal de livraison (ou e-mail).</p>
      <div class="grille-champs"><label class="champ"><span>N° de commande</span><input name="num" required placeholder="DH-2026-03181" value="${esc(num || '')}"></label><label class="champ"><span>Code postal ou e-mail</span><input name="verif" required placeholder="1060"></label></div>
      <button class="btn btn-plein" type="submit">${ic('search')}Afficher le suivi</button>
      ${ex ? `<p class="petit muet">Exemple : ${esc(ex.num)} avec le code postal ${esc(ex.livraison.cp)}.</p>` : ''}
    </form>
    ${miennes.length ? `<section class="carte-blanche"><h2>Vos dernières commandes</h2><div class="tableau-scroll"><table class="tableau"><tbody>${miennes.map((x) => `<tr><td><strong>${esc(x.num)}</strong><br><small class="muet">${dateCourte(x.date)}</small></td><td>${S.statut(x.statut, x.livraison?.mode === 'showroom').nom}</td><td class="num">${eur(x.totaux.ht)} HTVA</td><td class="num"><a class="btn btn-petit" href="#/suivi/${x.num}">Suivre</a></td></tr>`).join('')}</tbody></table></div></section>` : ''}
  </div>`);
  $('#form-suivi').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = e.target.num.value.trim().toUpperCase();
    const v = S.norm(e.target.verif.value).replace(/\s/g, '');
    const cmd = S.commande(n);
    if (!cmd || !(S.norm(cmd.livraison?.cp).replace(/\s/g, '') === v || S.norm(cmd.client.email) === v)) { toast('Aucune commande ne correspond.', 'erreur'); return; }
    try { sessionStorage.setItem('dh-suivi-' + n, '1'); } catch { /* rien */ }
    location.hash = `#/suivi/${n}`;
  });
}

/* ---------- Compte ---------- */
function vueCompte(onglet, params) {
  const c = S.clientConnecte();
  seo({ titre: `Mon compte | ${MARQUE}`, description: 'Commandes, devis, factures et favoris.' });
  if (!c || params?.get('inscription')) return vueConnexion(params);
  onglet = onglet || 'tableau';
  const r = S.reglages();
  const mes = S.commandes().filter((x) => x.client.id === c.id);
  const mesDevis = S.devis().filter((x) => x.client.id === c.id);
  const achats = S.achatsAnnuels(c.id);
  const enCours = mes.filter((x) => !['livree', 'annulee'].includes(x.statut));
  const rev = S.estRevendeur(c);
  const menu = [['tableau', 'chart', 'Tableau de bord'], ['commandes', 'box', 'Commandes'], ['devis', 'file', 'Devis'], ...(rev ? [['export', 'download', 'Export catalogue']] : []), ['favoris', 'heart', 'Favoris'], ['societe', 'user', c.type === 'particulier' ? 'Mes informations' : 'Société']];
  const ligneCmd = (x) => `<tr><td><strong>${esc(x.num)}</strong><br><small class="muet">${dateCourte(x.date)}${x.refClient ? ' · ' + esc(x.refClient) : ''}</small></td><td><span class="pastille ${x.statut === 'livree' ? 'p-vert' : x.statut === 'attente' ? 'p-jaune' : x.statut === 'annulee' ? 'p-rouge' : 'p-bleu'}">${S.statut(x.statut, x.livraison?.mode === 'showroom').court}</span></td><td class="num">${eur(x.totaux.ht)} HTVA</td><td class="num" style="white-space:nowrap"><a class="btn btn-petit" href="#/suivi/${x.num}">Suivre</a> <button class="btn btn-petit" type="button" data-recommander="${x.num}" title="Remettre au panier">${ic('repeat')}</button></td></tr>`;
  let contenu;
  if (onglet === 'tableau') {
    contenu = `${c.type === 'revendeur' && c.statut !== 'valide' ? `<div class="info-bulle jaune">${ic('clock')}<span>Votre compte revendeur est <strong>en cours de validation</strong> (24 h ouvrées). En attendant, vous commandez au prix public. <em>Démo : validez-le depuis l’<a href="admin/#/clients" target="_blank" rel="noopener"><strong>espace admin</strong></a>.</em></span></div>` : ''}
      <div class="kpis">
        <div class="kpi"><span>Commandes en cours</span><strong>${enCours.length}</strong></div>
        <div class="kpi"><span>Achats sur 12 mois HTVA</span><strong>${eur(achats)}</strong></div>
        <div class="kpi"><span>Devis</span><strong>${mesDevis.length}</strong></div>
        <div class="kpi"><span>Vos prix</span><strong style="font-size:17px">${rev ? `Revendeur −${r.remiseRevendeur} %` : 'Prix public HTVA'}</strong></div>
      </div>
      <section class="carte-blanche"><div class="section-titre" style="margin:0"><h2>Dernières commandes</h2><a href="#/compte/commandes">Tout voir ${ic('arrow')}</a></div>
        ${mes.length ? `<div class="tableau-scroll"><table class="tableau"><tbody>${mes.slice(0, 4).map(ligneCmd).join('')}</tbody></table></div>` : '<p class="muet">Aucune commande pour l’instant.</p>'}</section>
      <section class="carte-blanche"><h2>Votre conseiller</h2><p>Une question, une pièce détachée, un rendez-vous au showroom : <a href="tel:${esc(r.telephone.replace(/\s/g, ''))}"><strong>${esc(r.telephone)}</strong></a> ou <a href="${S.lienWhatsapp(`Bonjour, ${c.societe} ici.`)}" target="_blank" rel="noopener"><strong>WhatsApp</strong></a>.</p></section>`;
  } else if (onglet === 'commandes') {
    contenu = `<section class="carte-blanche"><h2>Commandes</h2>${mes.length ? `<div class="tableau-scroll"><table class="tableau"><thead><tr><th>Commande</th><th>Statut</th><th class="num">Montant</th><th></th></tr></thead><tbody>${mes.map(ligneCmd).join('')}</tbody></table></div>` : '<p class="muet">Aucune commande.</p>'}</section>`;
  } else if (onglet === 'devis') {
    contenu = `<section class="carte-blanche"><div class="section-titre" style="margin:0"><h2>Devis</h2><a href="#/devis-projet">Nouveau devis ${ic('arrow')}</a></div>${mesDevis.length ? `<div class="tableau-scroll"><table class="tableau"><tbody>${mesDevis.map((d) => `<tr><td><strong>${esc(d.num)}</strong><br><small class="muet">${dateCourte(d.date)} · valable jusqu’au ${dateCourte(d.validite)}</small></td><td><span class="pastille ${d.statut === 'converti' ? 'p-vert' : d.statut === 'envoye' ? 'p-bleu' : 'p-jaune'}">${{ demande: 'Demandé', envoye: 'Reçu', converti: 'Commandé' }[d.statut]}</span></td><td class="num">${eur(d.totaux.ht)} HTVA</td><td class="num"><a class="btn btn-petit" href="#/document/devis/${d.num}">Voir</a></td></tr>`).join('')}</tbody></table></div>` : '<p class="muet">Aucun devis.</p>'}</section>`;
  } else if (onglet === 'export' && rev) {
    contenu = `<section class="carte-blanche"><h2>Export du catalogue</h2>
      <p class="muet">Un fichier CSV (point-virgule, lisible dans Excel, importable dans Shopify, PrestaShop ou WooCommerce) : référence, nom, marque, catégories, <strong>votre prix revendeur HTVA</strong>, prix public HTVA et TVAC, stock, points clés, caractéristiques et liens des photos.</p>
      <div class="hero-actions" style="margin:0"><button class="btn btn-plein" type="button" data-export>${ic('download')}Télécharger le catalogue (${S.produits().length} références)</button></div>
      <p class="petit muet">Dans la vraie version : flux mis à jour chaque nuit (prix, stocks) à l’adresse privée de votre compte.</p></section>`;
  } else if (onglet === 'favoris') {
    const favs = S.favoris().map(S.produit).filter((p) => p && p.enLigne !== false);
    contenu = favs.length ? `<div class="grille-produits">${favs.map(carte).join('')}</div>` : `<div class="vide">${ic('heart')}<h2>Aucun favori</h2><p class="muet">Touchez le cœur d’un produit pour le retrouver ici.</p></div>`;
  } else {
    contenu = `<section class="carte-blanche"><h2>${c.type === 'particulier' ? 'Mes informations' : 'Société'}</h2><div class="specs"><div><table>
      <tr><td>Nom</td><td>${esc(c.societe)}</td></tr><tr><td>Type de compte</td><td>${esc(S.TYPES[c.type] || '—')}</td></tr><tr><td>Activité</td><td>${esc(c.activite || '—')}</td></tr><tr><td>Contact</td><td>${esc(c.contact)}</td></tr>
      <tr><td>E-mail</td><td>${esc(c.email)}</td></tr><tr><td>Téléphone</td><td>${esc(c.tel)}</td></tr></table></div><div><table>
      <tr><td>N° d’entreprise</td><td>${esc(c.bce || '—')}</td></tr><tr><td>TVA</td><td>${esc(c.tva || '—')}</td></tr><tr><td>Adresse</td><td>${esc(c.adresse || '—')}<br>${esc(c.cp || '')} ${esc(c.ville || '')}</td></tr>
      <tr><td>Langue</td><td>${esc({ fr: 'Français', nl: 'Nederlands', en: 'English' }[c.langue] || 'Français')}</td></tr><tr><td>Statut</td><td>${c.statut === 'valide' ? 'Actif' : c.statut === 'refuse' ? 'Refusé' : 'En validation'}</td></tr></table></div></div></section>`;
  }
  rendre(`<div class="conteneur">${fil([['Mon compte']]).html}<h1 class="page-titre">Bonjour ${esc((c.contact || '').split(' ')[0])}</h1>
    <div class="compte">
      <nav class="compte-menu" aria-label="Compte"><div class="compte-societe"><strong>${esc(c.societe)}</strong><span class="pastille ${c.statut === 'valide' ? 'p-vert' : 'p-jaune'}">${rev ? `Revendeur −${r.remiseRevendeur} %` : c.statut === 'valide' ? esc(S.TYPES[c.type] || 'Compte') : 'En validation'}</span>${c.exemple ? '<span class="pastille p-gris">Compte d’exemple</span>' : ''}</div>
        ${menu.map(([k, i, t]) => `<a href="#/compte/${k}" ${onglet === k ? 'aria-current="page"' : ''}>${ic(i)}${t}</a>`).join('')}
        <button type="button" data-deconnexion>${ic('logout')}Se déconnecter</button></nav>
      <div style="display:grid;gap:16px">${contenu}</div>
    </div></div>`);
  $('[data-deconnexion]').addEventListener('click', () => { S.deconnecter(); location.hash = '#/compte'; toast('Vous êtes déconnecté.'); });
  $('[data-export]')?.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([S.exportCatalogueCsv()], { type: 'text/csv;charset=utf-8' }));
    a.download = `catalogue-discount-horeca-${S.slug(c.societe)}.csv`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(`${ic('download')} Catalogue exporté`);
  });
}
function vueConnexion(params) {
  const inscription = params?.get('inscription');
  const type = params?.get('type') === 'revendeur' ? 'revendeur' : 'horeca';
  rendre(`<div class="conteneur">${fil([['Mon compte']]).html}<h1 class="page-titre">${inscription ? 'Créer mon <span class="surligne" style="--c:var(--orange)">compte</span>' : 'Mon compte'}</h1>
    <div class="connexion">
      <section class="carte-blanche">
        <h2>Déjà client</h2>
        <form id="form-connexion" style="display:grid;gap:12px">
          <label class="champ"><span>E-mail</span><input name="email" type="email" required autocomplete="email" placeholder="vous@societe.be"></label>
          <label class="champ"><span>Mot de passe</span><input name="mdp" type="password" autocomplete="current-password" placeholder="Dans la démo : laissez vide"></label>
          <button class="btn btn-sombre" type="submit">Se connecter</button>
        </form>
        <div class="acces-demo"><strong>${ic('sparkle')} Accès démo</strong><span class="petit">« Brasserie Exemple » à Saint-Gilles : compte pro horeca, commandes et devis d’exemple.</span><div class="hero-actions" style="margin:0"><button class="btn btn-plein" type="button" data-demo="demo">${ic('unlock')}Compte pro</button><button class="btn" type="button" data-demo="rev">Compte revendeur (−${S.reglages().remiseRevendeur} %)</button></div></div>
      </section>
      <section class="carte-blanche">
        <h2>Créer un compte</h2>
        <ul class="avantages-pro">
          <li>${ic('check')}Factures au nom de votre société, avec votre n° de TVA</li>
          <li>${ic('check')}Suivi des commandes, recommande en un clic, devis PDF</li>
          <li>${ic('check')}Revendeurs et installateurs : remise sur tout le catalogue après validation</li>
        </ul>
        <form id="form-inscription" style="display:grid;gap:14px" novalidate>
          <div class="grille-champs">
            <label class="champ"><span>Type de compte *</span><select name="type">${Object.entries(S.TYPES).map(([k, t]) => `<option value="${k}" ${k === type ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
            <label class="champ"><span>Activité</span><select name="activite">${S.ACTIVITES.map((m) => `<option ${type === 'revendeur' && m.startsWith('Revendeur') ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
            <label class="champ" data-pro><span>Société *</span><input name="societe" autocomplete="organization"></label>
            <label class="champ" data-pro><span>N° d’entreprise (BCE) *</span><input name="bce" inputmode="numeric" maxlength="14" placeholder="0123.456.749"><small id="aide-bce">10 chiffres · le n° de TVA est calculé tout seul.</small></label>
            <label class="champ"><span>Nom et prénom *</span><input name="contact" required autocomplete="name"></label>
            <label class="champ"><span>E-mail *</span><input name="email" type="email" required autocomplete="email"></label>
            <label class="champ"><span>Téléphone *</span><input name="tel" type="tel" required autocomplete="tel"></label>
            <label class="champ"><span>Langue</span><select name="langue"><option value="fr">Français</option><option value="nl">Nederlands</option><option value="en">English</option></select></label>
            <label class="champ"><span>Adresse</span><input name="adresse" autocomplete="street-address"></label>
            <label class="champ"><span>Code postal</span><input name="cp" inputmode="numeric" autocomplete="postal-code" maxlength="4"></label>
            <label class="champ"><span>Commune</span><input name="ville" autocomplete="address-level2"></label>
          </div>
          <button class="btn btn-orange btn-grand" type="submit">Créer mon compte</button>
          <p class="petit muet">Pour tester : n° d’entreprise ${S.bceFictif(42)} (fictif, de forme valide).</p>
        </form>
      </section>
    </div></div>`);
  if (inscription) setTimeout(() => $('#form-inscription select[name=type]')?.focus({ preventScroll: true }), 50);
  const apres = () => { location.hash = '#/compte'; };
  $$('[data-demo]').forEach((b) => b.addEventListener('click', () => { S.connecter(b.dataset.demo); toast(`${ic('unlock')} Connecté : ${esc(S.client(b.dataset.demo).societe)}`); apres(); }));
  $('#form-connexion').addEventListener('submit', (e) => {
    e.preventDefault();
    const cl = S.clients().find((x) => S.norm(x.email) === S.norm(e.target.email.value));
    if (!cl) { toast('Aucun compte avec cet e-mail. Essayez demo@exemple.be.', 'erreur'); return; }
    S.connecter(cl.id); toast(`${ic('check')} Connecté : ${esc(cl.societe)}`); apres();
  });
  const fi = $('#form-inscription');
  const majType = () => { $$('[data-pro]', fi).forEach((x) => { x.hidden = fi.type.value === 'particulier'; }); };
  fi.type.addEventListener('change', majType);
  majType();
  fi.bce.addEventListener('input', () => {
    const v = fi.bce.value.replace(/\D/g, '');
    const aide = $('#aide-bce');
    if (v.length === 10) { const ok = S.bceValide(v); aide.textContent = ok ? `Numéro valide ✓ · TVA ${S.tvaDepuisBce(v)}` : 'Numéro invalide : vérifiez les chiffres.'; aide.style.color = ok ? 'var(--vert)' : 'var(--rouge)'; }
  });
  fi.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(fi));
    const pro = d.type !== 'particulier';
    let err = null;
    $$('.champ.erreur', fi).forEach((x) => x.classList.remove('erreur'));
    for (const k of ['contact', 'email', 'tel', ...(pro ? ['societe', 'bce'] : [])]) if (!String(d[k] || '').trim()) { fi[k].closest('.champ').classList.add('erreur'); err = err || fi[k]; }
    if (pro && d.bce && !S.bceValide(d.bce)) { fi.bce.closest('.champ').classList.add('erreur'); err = err || fi.bce; }
    if (err) { err.focus(); toast('Vérifiez les champs en rouge.', 'erreur'); return; }
    const cl = S.creerClient({ type: d.type, societe: pro ? d.societe.trim() : d.contact.trim(), contact: d.contact.trim(), email: d.email.trim(), tel: d.tel.trim(), adresse: d.adresse, cp: d.cp, ville: d.ville, activite: pro ? d.activite : '', langue: d.langue, pays: 'Belgique', ...(pro ? { bce: S.bceFormat(d.bce), tva: S.tvaDepuisBce(d.bce) } : {}) });
    S.connecter(cl.id);
    toast(d.type === 'revendeur' ? `${ic('check')} Compte créé : validation revendeur sous 24 h ouvrées` : `${ic('check')} Compte créé, bienvenue !`);
    apres();
  });
}

/* ---------- Commande rapide ---------- */
function vueRapide() {
  seo({ titre: `Commande rapide par référence | ${MARQUE}`, description: 'Collez votre liste de références et quantités : tout part au panier.' });
  const ex = S.produits().filter((p) => p.stock > 2 && p.etat === 'neuf');
  const exemple = [ex[3], ex[20], ex[45], ex[70]].filter(Boolean).map((p, i) => `${p.ref} ${[2, 1, 3, 1][i]}`).join('\n');
  rendre(`<div class="conteneur">${fil([['Commande rapide']]).html}<h1 class="page-titre">Commande rapide <span class="surligne" style="--c:var(--orange)">par référence</span></h1>
    <div class="rapide">
      <section class="carte-blanche"><h2>Collez votre liste</h2>
        <p class="muet">Une ligne par article : la référence puis la quantité. Copier-coller depuis Excel accepté.</p>
        <label class="champ"><span class="sr">Liste</span><textarea id="liste-refs" spellcheck="false" placeholder="RÉFÉRENCE 2&#10;RÉFÉRENCE ; 1"></textarea></label>
        <div class="hero-actions" style="margin:0"><button class="btn" type="button" id="ex-refs">Remplir avec un exemple</button><label class="btn">${ic('upload')}Importer un CSV<input type="file" accept=".csv,.txt,text/csv,text/plain" id="fichier-refs" hidden></label></div>
      </section>
      <section class="carte-blanche"><h2>Vérification</h2><div id="rapide-res" class="rapide-res"><p class="muet">Les articles reconnus apparaissent ici avec le prix et le stock.</p></div></section>
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
      return `<tr class="ok"><td>${ic('check')}</td><td>${esc(p.nom)}<br><small class="muet">Réf. ${esc(p.ref)} · ${p.stock > 0 ? `${p.stock} en stock` : 'sur commande'}</small></td><td class="num">${qa}</td><td class="num">${eur(prixDe(p) * qa)}</td></tr>`;
    });
    const t = S.calculer(reconnus);
    $('#rapide-res').innerHTML = rows.length ? `<div class="tableau-scroll"><table class="tableau"><tbody>${rows.join('')}</tbody></table></div>
      <div class="resume-l" style="margin-top:12px"><span>${reconnus.length} référence${reconnus.length > 1 ? 's' : ''} reconnue${reconnus.length > 1 ? 's' : ''}</span><strong>${eur(t.ht)} HTVA</strong></div>
      <button class="btn btn-orange btn-grand btn-bloc" type="button" id="rapide-ajouter" ${reconnus.length ? '' : 'disabled'} style="margin-top:12px">${ic('cart')}Tout ajouter au panier</button>` : '<p class="muet">Les articles reconnus apparaissent ici.</p>';
    $('#rapide-ajouter')?.addEventListener('click', () => { reconnus.forEach((x) => S.ajouter(x.id, x.qte)); toast(`${ic('check')} ${reconnus.length} référence${reconnus.length > 1 ? 's' : ''} ajoutée${reconnus.length > 1 ? 's' : ''} <a href="#/panier">Voir le panier</a>`); });
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
  seo({ titre: `${type === 'devis' ? 'Devis' : 'Facture'} ${num} | ${MARQUE}`, description: '' });
  rendre(`<div class="conteneur" style="padding-bottom:40px">${fil([[type === 'devis' ? 'Devis' : 'Facture'], [num]]).html}
    <div class="hero-actions" style="margin:4px 0 16px"><button class="btn btn-plein" type="button" data-imprimer>${ic('print')}Imprimer / PDF</button>
      ${type === 'devis' ? `<button class="btn" type="button" data-devis-panier>${ic('cart')}Commander ce devis</button>` : `<a class="btn" href="#/suivi/${num}">${ic('truck')}Suivi</a>`}
      <a class="btn" href="#/compte/${type === 'devis' ? 'devis' : 'commandes'}">Mon compte</a></div>${html}</div>`);
  $('[data-imprimer]').addEventListener('click', () => imprimer(html));
  $('[data-devis-panier]')?.addEventListener('click', () => { o.lignes.forEach((l) => S.produit(l.id) && S.ajouter(l.id, l.qte)); location.hash = '#/panier'; });
}

/* ---------- Revendeurs et installateurs ---------- */
function vueRevendeurs() {
  const r = S.reglages();
  seo({ titre: `Revendeurs et installateurs horeca | ${MARQUE}`, description: `Revendeurs, cuisinistes et installateurs : −${r.remiseRevendeur} % sur tout le catalogue, export des fiches et photos, commande rapide, devis volume.` });
  rendre(`<section class="hero-univers" style="--c:#0f97d8;--p:#e5f5fc"><div class="conteneur">${fil([['Revendeurs et installateurs']]).html}</div>
    <div class="conteneur hero-univers-l">
      <div><span class="pill rv" style="--c:var(--bleu)">Programme revendeurs</span>
        <h1 class="rv" style="--i:1">Revendeurs et installateurs : <span class="surligne" style="--c:var(--bleu)">vos prix pros</span></h1>
        <p class="hero-univers-intro rv" style="--i:2">Cuisinistes, installateurs, magasins et e-commerçants : un compte validé, une remise sur tout le catalogue, vos fiches et photos à reprendre et la commande par référence.</p>
        <div class="hero-actions rv" style="--i:3"><a class="btn btn-orange btn-grand" href="#/compte?inscription=1&type=revendeur">Demander mon compte ${ic('arrow')}</a><button class="btn btn-grand" type="button" data-demo-rev>Accès démo revendeur</button></div>
        <div class="stats">
          <div class="stat rv"><strong>−${r.remiseRevendeur}<small> %</small></strong><span>Sur tout le catalogue (exemple)</span></div>
          <div class="stat rv" style="--i:1;--c:#16a06a"><strong data-compte="${S.produits().length}">${S.produits().length}</strong><span>Références à revendre</span></div>
          <div class="stat rv" style="--i:2;--c:#f04e2e"><strong>${nombre(r.franco)}<small> €</small></strong><span>Livraison gratuite HTVA</span></div>
          <div class="stat rv" style="--i:3;--c:#5b6b7c"><strong>CSV</strong><span>Fiches et photos à exporter</span></div>
        </div>
      </div>
      <figure class="hero-univers-photo rv-zoom"><img src="img/univers/entrepot.webp" alt="Entrepôt de matériel de cuisine professionnelle" width="896" height="1120" style="object-position:center 60%"><figcaption>Illustration</figcaption></figure>
    </div></section>
  <section class="section conteneur">
    <div class="atouts">${[['tag', '#0f97d8', '#e5f5fc', 'Prix revendeur', `Votre remise (exemple : −${r.remiseRevendeur} %) s’affiche sur chaque fiche, dans le panier et sur vos devis, dès la validation du compte.`],
    ['zap', '#f04e2e', '#fdebe7', 'Commande par référence', 'Collez votre liste ou importez un CSV : les références reconnues partent au panier avec le stock.'],
    ['download', '#16a06a', '#e3f6ee', 'Fiches et photos', 'Exportez références, caractéristiques et photos pour votre boutique en ligne ou vos offres.'],
    ['shield', '#5b6b7c', '#eceff3', 'Garantie revendeur', 'Un an sur les pièces reconnues défectueuses, selon les conditions de vente.']].map(([i, c, p, t, d], k) => `<div class="atout rv" style="--c:${c};--p:${p};--i:${k}">${ic(i)}<h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
    <p class="petit muet" style="margin-top:14px">Remise revendeur : valeur d’exemple, réglée dans l’admin. Garantie : reprise des conditions de vente publiées (art. 8).</p>
  </section>`);
  $('[data-demo-rev]').addEventListener('click', () => { S.connecter('rev'); toast(`${ic('unlock')} Prix revendeur affichés (−${r.remiseRevendeur} %)`); location.hash = '#/catalogue'; });
}

/* ---------- Infos pratiques ---------- */
function vueInfos(page = 'livraison') {
  const r = S.reglages();
  const carte = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.adresse)}`;
  const pages = {
    livraison: ['Livraison et retour', `<ul><li><strong>Livraison en Belgique</strong>, d’Arlon à Ostende : le matériel en stock est livré en 24 à 72 h, par un livreur, devant la porte, au rez-de-chaussée.</li><li><strong>Gratuite dès ${eur(r.franco)} HTVA</strong> d’achat ; sous ce montant : ${eur(r.fraisLivraison)} HTVA <em>(exemple, à confirmer)</em>.</li><li><strong>Retrait gratuit</strong> au showroom de Sint-Pieters-Leeuw.</li><li><strong>Installation et raccordement</strong> : sur devis, facturés en régie (conditions de vente, art. 9).</li><li><strong>Hors Belgique</strong> : contactez-nous avant de commander.</li><li>À la réception, contrôlez le matériel et notez tout dégât sur le bon de livraison.</li></ul>`],
    paiement: ['Moyens de paiement', `<p>Sur la nouvelle boutique : <strong>Bancontact, Payconiq, Visa et Mastercard</strong> (par un prestataire belge comme Mollie ou Stripe), <strong>virement</strong> (préparation à réception), <strong>acompte de ${r.acompte} %</strong> à la commande avec le solde à la livraison, ou <strong>paiement au showroom</strong> lors du retrait.</p><p class="petit muet">Sur le site actuel, la page « Méthodes de paiement » indique « Prochainement disponible ». Dans la démo, les paiements sont simulés.</p>`],
    conditions: ['Conditions de vente', `<p>Résumé des conditions générales publiées par ${esc(r.societe)} :</p><ul><li>Prix hors TVA, départ magasin ; transport, taxes et assurances en sus sauf franco.</li><li>Acompte de ${r.acompte} % à la commande ; il prolonge la réservation du matériel jusqu’à 30 jours.</li><li>Livraison gratuite en Belgique dès ${eur(r.franco)} HTVA, par un livreur, devant la porte du rez-de-chaussée.</li><li>Les marchandises restent la propriété du vendeur jusqu’au paiement complet.</li><li>Contestation dans les 7 jours suivant la livraison.</li><li>Droit belge, tribunaux de Bruxelles.</li></ul><p class="petit muet">Le texte complet (12 articles) sera repris tel quel sur la vraie boutique.</p>`],
    garantie: ['Garantie et SAV', '<ul><li><strong>Professionnels</strong> : un an pièces et main-d’œuvre à partir de la livraison, six mois sur le matériel d’occasion.</li><li><strong>Revendeurs</strong> : un an, limité aux pièces reconnues défectueuses.</li><li>Hors pièces d’usure (joints, lampes, vitres) et dégâts dus au calcaire, au nettoyage ou à un court-circuit.</li><li>Le service après-vente est assuré par nos soins.</li></ul>'],
    contact: ['Showroom et contact', `<p><strong>${esc(r.societe)} — Discount Horeca</strong><br>${esc(r.adresse)}<br>${esc(r.horaires)}</p><p>Téléphone : <a href="tel:${esc(r.telephone.replace(/\s/g, ''))}">${esc(r.telephone)}</a><br>WhatsApp : <a href="${S.lienWhatsapp()}" target="_blank" rel="noopener">${esc(r.whatsapp)}</a><br>E-mail : <a href="mailto:${esc(r.email)}">${esc(r.email)}</a></p><p>À quelques minutes de la E19, parking gratuit. Venez voir le matériel, échanger avec l’équipe et repartir avec votre commande.</p><div class="hero-actions" style="margin:10px 0 0"><a class="btn btn-plein" href="${carte}" target="_blank" rel="noopener">${ic('pin')}Itinéraire</a><a class="btn" href="${S.lienWhatsapp()}" target="_blank" rel="noopener">${ic('phone')}WhatsApp</a></div><p class="petit muet">N° de TVA : ${esc(r.numeroTva)}.</p>`],
    langues: ['Français, Nederlands, English', '<p>La vraie boutique sera publiée en <strong>français, néerlandais et anglais</strong>, avec des textes traduits et relus, une adresse par langue (<code>/fr/</code>, <code>/nl/</code>, <code>/en/</code>) et les balises <code>hreflang</code>.</p><p>Le site actuel traduit ses pages avec le module Google Traduction : les traductions automatiques ne sont pas indexées par Google et donnent une image peu professionnelle aux clients néerlandophones, qui représentent près de 60 % de la Belgique.</p><p class="petit muet">Dans la démo, seule la version française est montée.</p>'],
  };
  const [titre, corps] = pages[page] || pages.livraison;
  seo({ titre: `${titre} | ${MARQUE}`, description: `${titre} : ${corps.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}` });
  rendre(`<div class="conteneur">${fil([['Infos pratiques'], [titre]]).html}<h1 class="page-titre">${titre}</h1>
    <div class="infos"><nav class="compte-menu" aria-label="Infos pratiques">${Object.entries(pages).map(([k, [t]]) => `<a href="#/infos/${k}" ${k === page ? 'aria-current="page"' : ''}>${t}</a>`).join('')}</nav><div class="infos-texte">${corps}</div></div></div>`);
}
function vueIntrouvable() {
  seo({ titre: `Page introuvable | ${MARQUE}`, description: '' });
  rendre(`<div class="conteneur" style="padding:40px 16px"><div class="vide">${ic('search')}<h2>Page introuvable</h2><p class="muet">Ce produit ou cette page n’existe plus.</p><a class="btn btn-plein" href="#/">Retour à l’accueil</a></div></div>`);
}

/* ---------- Routeur ---------- */
const ROUTES = [
  [/^$/, vueAccueil], [/^catalogue$/, vueCatalogue], [/^c\/([\w-]+)$/, vueUnivers], [/^c\/([\w-]+)\/([\w-]+)$/, vueSous],
  [/^p\/([\w-]+)$/, vueProduit], [/^recherche\/(.+)$/, vueRecherche], [/^promos$/, vuePromos], [/^(?:bonnes-affaires|destockage|exposition)$/, vueBonnesAffaires],
  [/^packs$/, vuePacks], [/^pack\/([\w-]+)$/, vuePack], [/^panier$/, vuePanier], [/^commande$/, vueCommande], [/^merci\/([\w-]+)$/, vueMerci],
  [/^suivi(?:\/([\w-]+))?$/, vueSuivi], [/^compte(?:\/(\w+))?$/, vueCompte], [/^commande-rapide$/, vueRapide], [/^devis-projet$/, vueDevisProjet],
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
    const v = (parseInt(inp.value, 10) || 1) + (t.matches('[data-plus]') ? 1 : -1);
    inp.value = Math.max(inp.dataset.cle && t.matches('[data-moins]') ? 0 : 1, Math.min(99, v));
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
    toast(`${ic('repeat')} ${n} article${n > 1 ? 's' : ''} remis au panier <a href="#/panier">Voir</a>`);
    return;
  }
  if (t.hasAttribute('data-ouvrir-menu')) return ouvrirTiroir();
  if (t.hasAttribute('data-fermer-tiroir')) return fermerTiroir();
  if (t.hasAttribute('data-ouvrir-recherche')) return ouvrirRecherche();
  if (t.hasAttribute('data-fermer-recherche')) return fermerRecherche();
  if (t.hasAttribute('data-fermer-volant')) return fermerVolant();
  if (t.hasAttribute('data-fermer-ruban')) { $('#ruban-demo').hidden = true; try { sessionStorage.setItem('dh-ruban', '1'); } catch { /* rien */ } return; }
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
  if (externe && !document.querySelector('dialog[open]') && !$('#form-commande') && !$('#form-inscription') && !$('#form-projet')) rerendre();
  if (cle === 'erreur-stockage') toast('Le navigateur refuse d’enregistrer (stockage plein ou navigation privée).', 'erreur');
});

/* ---------- Démarrage ---------- */
$$('[data-ic]').forEach((el) => { el.innerHTML = ic(el.dataset.ic); });
$$('[data-ic-avant]').forEach((el) => el.insertAdjacentHTML('afterbegin', ic(el.dataset.icAvant)));
try { if (sessionStorage.getItem('dh-ruban')) $('#ruban-demo').hidden = true; } catch { /* rien */ }
construireNavigation();
majEntete();
window.addEventListener('hashchange', router);
router();
