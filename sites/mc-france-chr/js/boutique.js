// Boutique MC France CHR — application d'une page, routes dans l'adresse (#/…), données dans store.js.
import * as S from './store.js';
import { eur, esc, ic, src, toast, modale, documentCommercial, dateCourte, dateLongue, nombre } from './ui.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const vue = $('#vue');

/* ---------- Préférences du visiteur ---------- */
function pref(cle, valeur) {
  try {
    if (valeur === undefined) return localStorage.getItem('mcf.v1.pref.' + cle);
    localStorage.setItem('mcf.v1.pref.' + cle, valeur);
  } catch { /* stockage indisponible : on garde la valeur par défaut */ }
  return valeur;
}
let taxe = pref('taxe') === 'ttc' ? 'ttc' : 'ht';
const aff = (ht) => (taxe === 'ttc' ? S.ttc(ht) : ht);
const suff = () => (taxe === 'ttc' ? 'TTC' : 'HT');
const autre = () => (taxe === 'ttc' ? 'HT' : 'TTC');
const affAutre = (ht) => (taxe === 'ttc' ? ht : S.ttc(ht));

/* ---------- Métiers (packs d'équipement) ---------- */
const METIERS = [
  { slug: 'pizzeria', nom: 'Ouvrir une pizzeria', icone: 'pizza', desc: 'Four, pétrin, saladette à pizza et façonneuse.', sous: ['fours-a-pizza', 'petrins', 'saladettes-a-pizza', 'faconneuses'] },
  { slug: 'snack', nom: 'Équiper un snack', icone: 'burger', desc: 'Friteuse, chauffe-frites, machine à kebab, panini.', sous: ['friteuses', 'chauffe-frites', 'kebab', 'grills-salamandres'] },
  { slug: 'boulangerie', nom: 'Boulangerie & pâtisserie', icone: 'store', desc: 'Pétrin, vitrine réfrigérée, batteur et four.', sous: ['petrins', 'vitrines-refrigerees', 'batteurs-blenders', 'fours'] },
  { slug: 'bar', nom: 'Bar & brasserie', icone: 'cup', desc: 'Lave-verres, glaçons, armoire à boissons, granita.', sous: ['lave-verres', 'machines-a-glacons', 'armoires-refrigerees', 'machines-a-granita'] },
];
function packDe(m) {
  return m.sous.map((s) => S.produits().filter((p) => p.sous === s && p.etat === 'neuf' && p.stock > 0).sort((a, b) => a.prixHT - b.prixHT)[0]).filter(Boolean);
}

/* ---------- Petits morceaux d'interface ---------- */
const remiseDe = (p) => (p.prixBarreHT ? Math.round((1 - p.prixHT / p.prixBarreHT) * 100) : 0);
function stockHtml(p) {
  if (p.stock > 5) return `<span class="stock stock-ok">En stock · ${esc(p.delai)}</span>`;
  if (p.stock > 0) return `<span class="stock stock-bas">Plus que ${p.stock} en stock</span>`;
  return '<span class="stock stock-non">Sur commande · délai à confirmer</span>';
}
function badges(p) {
  const r = remiseDe(p);
  return `<div class="carte-badges">${p.etat === 'second-choix' ? '<span class="pastille p-sc">Second choix</span>' : ''}${r ? `<span class="pastille p-promo">−${r} %</span>` : ''}${p.nouveau ? '<span class="pastille p-nouveau">Nouveau</span>' : ''}</div>`;
}
function qteHtml(nom = 'qte', valeur = 1, cle = '') {
  return `<div class="qte"><button type="button" data-moins aria-label="Moins">${ic('minus')}</button><input name="${nom}" type="number" inputmode="numeric" min="1" max="999" value="${valeur}" aria-label="Quantité" ${cle ? `data-cle="${cle}"` : ''}><button type="button" data-plus aria-label="Plus">${ic('plus')}</button></div>`;
}
function carte(p) {
  const favs = S.favoris();
  const pal = S.paliersDe(p).slice(-1)[0];
  const puPal = pal ? S.prixUnitaire(p, pal.min).unit : null;
  return `<article class="carte">
    <a class="carte-img" href="#/p/${p.id}" tabindex="-1" aria-hidden="true"><img src="${src(p.images[0])}" alt="" loading="lazy" width="300" height="300"></a>
    ${badges(p)}
    <button class="carte-fav" type="button" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}" aria-label="Ajouter aux favoris">${ic('heart')}</button>
    <div class="carte-corps">
      <p class="carte-marque">${esc(p.marque || '')}</p>
      <h3 class="carte-nom"><a href="#/p/${p.id}">${esc(p.nom)}</a></h3>
      <p class="carte-ref">Réf. ${esc(p.ref)}</p>
      ${stockHtml(p)}
      ${p.etat === 'second-choix' ? `<p class="carte-sc">${esc(p.defaut || '')}</p>` : ''}
      <div class="carte-prix">
        <div class="carte-prix-l"><strong class="prix">${eur(aff(p.prixHT))}<small>${suff()}</small></strong>${p.prixBarreHT ? `<s>${eur(aff(p.prixBarreHT))}</s>` : ''}</div>
        <span class="prix-2">${eur(affAutre(p.prixHT))} ${autre()}</span>
      </div>
      ${pal && puPal < p.prixHT ? `<p class="carte-palier">${ic('tag')} ${eur(aff(puPal))} ${suff()} dès ${pal.min} pièces</p>` : '<p class="carte-palier"></p>'}
      <div class="carte-achat" data-achat>${qteHtml()}<button class="btn btn-plein" type="button" data-ajouter="${p.id}" aria-label="Ajouter ${esc(p.nom)} au panier">${ic('cart')}<span>Ajouter</span></button></div>
    </div>
  </article>`;
}
function blocFranco(t) {
  const r = S.reglages();
  const pct = Math.min(100, (t.ht / r.franco) * 100);
  return `<div class="franco ${t.resteFranco <= 0 ? 'atteint' : ''}">
    <p>${t.resteFranco > 0 ? `Plus que <strong>${eur(t.resteFranco)} HT</strong> pour la livraison offerte` : `<strong>Livraison offerte</strong> : votre panier dépasse ${eur(r.franco)} HT`}</p>
    <div class="franco-barre"><i style="width:${pct.toFixed(1)}%"></i></div>
  </div>`;
}
function palierSuivant(p, qte) {
  const pal = S.paliersDe(p).find((x) => x.min > qte);
  if (!pal) return '';
  const u = S.prixUnitaire(p, pal.min).unit;
  return `<div class="info-bulle">${ic('tag')}<span>Ajoutez <strong>${pal.min - qte}</strong> pièce${pal.min - qte > 1 ? 's' : ''} pour passer à <strong>${eur(aff(u))} ${suff()}</strong> l'unité (−${pal.remise} %).</span></div>`;
}
function fil(liens) {
  return `<nav class="fil" aria-label="Fil d'Ariane"><a href="#/">Accueil</a>${liens.map(([t, h]) => `${ic('right')}${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}`).join('')}</nav>`;
}
function rendre(html, titre) {
  vue.innerHTML = html;
  document.title = titre ? `${titre} — MC France CHR` : 'MC France CHR — le matériel de restauration pro au prix de gros';
}
function imprimer(html) {
  const z = $('#zone-impression');
  z.innerHTML = html;
  window.print();
}

/* ---------- En-tête, navigation, pied ---------- */
function construireNavigation() {
  const fams = S.familles();
  const nb = (f, s) => S.produits().filter((p) => p.famille === f && (!s || p.sous === s)).length;
  $('#nav-familles').innerHTML = fams.map((f) => `<div class="nav-fam">
      <a href="#/c/${f.slug}">${ic(f.icone)}${esc(f.court || f.nom)}</a>
      <div class="nav-mega"><div class="conteneur nav-mega-l">
        <div class="nav-mega-intro"><h3>${esc(f.nom)}</h3><p>${esc(f.description || '')}</p><a class="btn btn-sombre btn-petit" href="#/c/${f.slug}">Tout voir (${nb(f.slug)}) ${ic('arrow')}</a></div>
        <div class="nav-mega-sous">${f.sous.map((s) => `<a href="#/c/${f.slug}/${s.slug}"><img src="${src(s.image || f.image)}" alt="" loading="lazy" width="150" height="112">${esc(s.nom)}</a>`).join('')}</div>
      </div></div>
    </div>`).join('') + `<div class="nav-speciaux"><a class="nav-promo" href="#/promos">Promos</a><a class="nav-sc" href="#/second-choix">Second choix</a></div>`;
  $('#tiroir-corps').innerHTML = fams.map((f) => `<details>
      <summary>${ic(f.icone)}${esc(f.nom)}${ic('down')}</summary>
      <div class="tiroir-sous"><a href="#/c/${f.slug}"><strong>Tout voir</strong></a>${f.sous.map((s) => `<a href="#/c/${f.slug}/${s.slug}">${esc(s.nom)}</a>`).join('')}</div>
    </details>`).join('') + `<div class="tiroir-liens">
      <a href="#/promos">${ic('percent')}Promotions</a>
      <a href="#/second-choix">${ic('tag')}Second choix</a>
      <a href="#/commande-rapide">${ic('zap')}Commande rapide</a>
      <a href="#/compte">${ic('user')}Mon compte pro</a>
      <a href="#/suivi">${ic('truck')}Suivre une commande</a>
      <a href="tel:+33320775904">${ic('phone')}03 20 77 59 04</a>
      <a href="admin/" target="_blank" rel="noopener">${ic('settings')}Espace admin (démo)</a>
    </div>`;
  $('#pied-familles').innerHTML = fams.map((f) => `<li><a href="#/c/${f.slug}">${esc(f.nom)}</a></li>`).join('');
  $('#pied-reassurance').innerHTML = reassurance().map(([i, t, d]) => `<div>${ic(i)}<p><strong>${t}</strong><span>${d}</span></p></div>`).join('');
}
function reassurance() {
  const r = S.reglages();
  return [
    ['truck', `Livraison offerte dès ${nombre(r.franco)} € HT`, 'France et Belgique, hors Corse'],
    ['percent', 'Prix pros dégressifs', 'Plus vous commandez, moins vous payez'],
    ['card', 'Paiement 4× ou à 30 jours', 'Carte, virement, compte pro'],
    ['shield', 'Garantie 1 à 2 ans', 'Selon les marques, SAV réactif'],
  ];
}
function majEntete() {
  const t = S.calculer(S.panier());
  const n = S.nbArticles();
  const badge = $('#panier-nb');
  badge.hidden = n === 0;
  badge.textContent = n;
  $('#panier-total').textContent = n ? `${eur(aff(t.ht))}` : 'Panier';
  const c = S.clientConnecte();
  $('#libelle-compte').innerHTML = c ? `${esc(c.societe.length > 16 ? c.societe.slice(0, 15) + '…' : c.societe)}<br><small class="muet">${c.statut === 'valide' ? 'Compte pro' : 'En validation'}</small>` : 'Compte<br>pro';
  const r = S.reglages();
  $('#bandeau-msg').textContent = r.bandeau;
  $$('[data-taxe]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.taxe === taxe));
}

/* ---------- Recherche instantanée ---------- */
let suggActif = -1;
function suggestions(q) {
  const boite = $('#suggestions');
  if (q.trim().length < 2) { boite.hidden = true; return; }
  const res = S.rechercher(q, 6);
  const n = norm(q);
  const cats = [];
  S.familles().forEach((f) => f.sous.forEach((s) => { if (S.norm(s.nom).includes(n)) cats.push([s.nom, `#/c/${f.slug}/${s.slug}`]); }));
  S.familles().forEach((f) => { if (S.norm(f.nom).includes(n)) cats.unshift([f.nom, `#/c/${f.slug}`]); });
  boite.innerHTML = (cats.length ? `<p class="sugg-titre">Catégories</p><div class="sugg-cat">${cats.slice(0, 5).map(([t, h]) => `<a href="${h}">${esc(t)}</a>`).join('')}</div>` : '')
    + (res.length ? `<p class="sugg-titre">Produits</p>${res.map((p) => `<a class="sugg-prod" href="#/p/${p.id}"><img src="${src(p.images[0])}" alt="" width="48" height="48"><span>${esc(p.nom)}<small>Réf. ${esc(p.ref)} · ${esc(p.marque || '')}</small></span><strong>${eur(aff(p.prixHT))} ${suff()}</strong></a>`).join('')}<a class="sugg-tout" href="#/recherche/${encodeURIComponent(q)}">Voir tous les résultats pour « ${esc(q)} »</a>`
      : `<p class="sugg-vide">Aucun produit pour « ${esc(q)} ». Essayez une référence ou un autre mot.</p>`);
  boite.hidden = false;
  suggActif = -1;
}
const norm = S.norm;

/* ---------- Panier volant ---------- */
let dernierFocus = null;
function ouvrirVolant(id) {
  const p = S.produit(id);
  const t = S.calculer(S.panier());
  const l = t.lignes.find((x) => x.id === id);
  if (!p || !l) return;
  const voisins = S.produits().filter((x) => x.famille === p.famille && x.sous !== p.sous && x.stock > 0 && x.etat === 'neuf').slice(0, 3);
  $('#volant-boite').innerHTML = `
    <header class="volant-tete"><h2 id="volant-titre">${ic('check')}Ajouté au panier</h2><button class="btn-icone" type="button" data-fermer-volant aria-label="Fermer">${ic('x')}</button></header>
    <div class="volant-produit"><img src="${src(p.images[0])}" alt="" width="84" height="84"><div>
      <h3>${esc(p.nom)}</h3>
      <p class="petit muet">Réf. ${esc(p.ref)} · quantité dans le panier : <strong>${l.qte}</strong></p>
      <p class="petit"><strong>${eur(aff(l.unit))} ${suff()}</strong> l'unité ${l.remisePalier ? `<span class="pastille p-vert">−${l.remisePalier} % quantité</span>` : ''}</p>
    </div></div>
    <div class="volant-corps">
      ${blocFranco(t)}
      ${palierSuivant(p, l.qte)}
      ${voisins.length ? `<div class="volant-suggest"><h4>Pour compléter</h4>${voisins.map((v) => `<div class="mini"><img src="${src(v.images[0])}" alt="" width="56" height="56" loading="lazy"><a href="#/p/${v.id}" data-fermer-volant>${esc(v.nom)}<br><strong>${eur(aff(v.prixHT))} ${suff()}</strong></a><button class="btn-icone" type="button" data-ajouter="${v.id}" aria-label="Ajouter ${esc(v.nom)}">${ic('plus')}</button></div>`).join('')}</div>` : ''}
    </div>
    <footer class="volant-pied">
      <div class="volant-ligne"><span>Panier · ${S.nbArticles()} article${S.nbArticles() > 1 ? 's' : ''}</span><strong>${eur(aff(t.ht))} ${suff()}</strong></div>
      <a class="btn btn-plein btn-grand" href="#/panier" data-fermer-volant>Voir le panier et commander</a>
      <button class="btn" type="button" data-fermer-volant>Continuer mes achats</button>
    </footer>`;
  const v = $('#volant');
  if (v.hidden) dernierFocus = document.activeElement;
  v.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#volant-boite [data-fermer-volant]').focus();
}
function fermerVolant() {
  $('#volant').hidden = true;
  document.body.style.overflow = '';
  dernierFocus?.focus?.();
}

/* ---------- Accueil ---------- */
function vueAccueil() {
  const ps = S.produits();
  const promos = ps.filter((p) => p.prixBarreHT && p.etat === 'neuf').sort((a, b) => remiseDe(b) - remiseDe(a));
  const vitrine = [];
  for (const fam of ['froid', 'pizza-boulangerie', 'cuisson', 'snack', 'inox']) {
    const p = promos.find((x) => x.famille === fam && !vitrine.includes(x)) || ps.find((x) => x.famille === fam && x.etat === 'neuf');
    if (p && vitrine.length < 3) vitrine.push(p);
  }
  const nouveaux = ps.filter((p) => p.nouveau && p.etat === 'neuf').slice(0, 12);
  const sc = ps.filter((p) => p.etat === 'second-choix');
  const r = S.reglages();
  const fams = S.familles();
  rendre(`
  <section class="hero">
    <div class="conteneur hero-l">
      <div>
        <p class="surtitre">Grossiste en matériel CHR · Roubaix · depuis 2013</p>
        <h1 class="etire">Le matériel de cuisine pro <em>au prix de gros</em></h1>
        <p class="hero-chapo">Froid, cuisson, pizza, inox, laverie… Avec votre compte pro : prix HT dégressifs, paiement à 30 jours, devis en un clic et livraison sur palette en France et en Belgique.</p>
        <div class="hero-actions">
          <a class="btn btn-jaune" href="#/compte">Ouvrir un compte pro ${ic('arrow')}</a>
          <a class="btn btn-contour" href="#/commande-rapide">${ic('zap')}Commande rapide par référence</a>
        </div>
        <div class="hero-chiffres">
          <div><strong>2013</strong><span>au service des pros</span></div>
          <div><strong>1 à 3 j</strong><span>livraison ouvrée en stock</span></div>
          <div><strong>${nombre(r.franco)} € HT</strong><span>franco de port</span></div>
        </div>
      </div>
      <div class="vitrine">
        ${vitrine.map((p) => `<a class="vitrine-carte" href="#/p/${p.id}">${remiseDe(p) ? `<span class="pastille p-promo">−${remiseDe(p)} %</span>` : ''}<img src="${src(p.images[0])}" alt="" width="320" height="320"><p>${esc(p.nom)}</p><div class="vitrine-prix"><strong>${eur(aff(p.prixHT))} ${suff()}</strong>${p.prixBarreHT ? `<s>${eur(aff(p.prixBarreHT))}</s>` : ''}</div></a>`).join('')}
      </div>
    </div>
  </section>
  <section class="reassurance"><div class="conteneur reassurance-l">
    ${reassurance().map(([i, t, d]) => `<div class="reassur">${ic(i)}<p><strong>${t}</strong><span>${d}</span></p></div>`).join('')}
  </div></section>

  <section class="section conteneur" id="univers">
    <div class="titre-section"><div><p class="surtitre">Catalogue</p><h2>Tous nos univers</h2></div></div>
    <div class="familles">
      ${fams.map((f) => `<a class="tuile" href="#/c/${f.slug}"><div class="tuile-img"><img src="${src(f.image)}" alt="" loading="lazy" width="132" height="132"></div><div class="tuile-txt"><strong>${ic(f.icone)}${esc(f.nom)}</strong><small>${f.sous.map((s) => esc(s.nom)).join(' · ')}</small><span>${ps.filter((p) => p.famille === f.slug).length} produits</span></div></a>`).join('')}
    </div>
  </section>

  ${promos.length ? `<section class="section conteneur">
    <div class="titre-section"><div><p class="surtitre">Prix barrés en ce moment</p><h2>Offres pros du moment</h2></div><a href="#/promos">Toutes les promos ${ic('arrow')}</a></div>
    <div class="rangee">${promos.slice(0, 12).map(carte).join('')}</div>
  </section>` : ''}

  <section class="section conteneur">
    <div class="gros">
      <div class="gros-txt">
        <p class="surtitre">Vente en gros</p>
        <h2>Plus vous commandez, moins vous payez</h2>
        <p>Les remises de quantité s'appliquent toutes seules, ligne par ligne, dès l'ajout au panier. Avec un compte pro validé, une remise client s'ajoute à vos prix et le paiement à 30 jours fin de mois se débloque.</p>
        <p>Une liste de références à commander ? Collez-la dans la <a href="#/commande-rapide"><strong>commande rapide</strong></a> : tout part au panier en un clic. Besoin d'un document pour votre comptable ou votre banque ? Le panier devient un <strong>devis PDF</strong>.</p>
        <div class="gros-actions"><a class="btn btn-sombre" href="#/compte">Ouvrir un compte pro</a><a class="btn" href="#/commande-rapide">${ic('zap')}Commande rapide</a></div>
      </div>
      <div class="gros-paliers">
        <div class="palier-ligne"><strong>1 pièce</strong><span>Prix catalogue</span></div>
        ${r.paliers.map((p) => `<div class="palier-ligne"><strong>Dès ${p.min} pièces identiques</strong><span>−${p.remise} %</span></div>`).join('')}
        <small>Exemple de paliers, réglables par MC France dans l'espace admin, produit par produit si besoin.</small>
      </div>
    </div>
  </section>

  <section class="section conteneur">
    <div class="titre-section"><div><p class="surtitre">Packs d'ouverture</p><h2>Équiper un métier</h2><p>Une sélection de départ par métier, à ajuster ensuite pièce par pièce.</p></div></div>
    <div class="metiers">
      ${METIERS.map((m) => { const pk = packDe(m); const tot = pk.reduce((s, p) => s + p.prixHT, 0); return `<article class="metier">
        <div class="metier-tete">${ic(m.icone)}<div><h3>${esc(m.nom)}</h3><p>${esc(m.desc)}</p></div></div>
        <div class="metier-imgs">${pk.map((p) => `<img src="${src(p.images[0])}" alt="${esc(p.nom)}" loading="lazy" width="80" height="80">`).join('')}</div>
        <div class="metier-prix"><span class="muet petit">${pk.length} équipements</span><strong>${eur(aff(tot))} ${suff()}</strong></div>
        <a class="btn btn-sombre" href="#/metier/${m.slug}">Voir le pack ${ic('arrow')}</a>
      </article>`; }).join('')}
    </div>
  </section>

  ${sc.length ? `<section class="section conteneur">
    <div class="sc-bandeau">
      <div class="sc-bandeau-txt">
        <p class="surtitre">Bonnes affaires</p>
        <h2>Second choix</h2>
        <p>Du matériel neuf déclassé pour un défaut d'aspect, un carton abîmé ou un retour d'exposition. Même garantie, prix cassés, pièces uniques : premier arrivé, premier servi.</p>
        <a class="btn btn-sombre" href="#/second-choix">Voir les ${sc.length} articles ${ic('arrow')}</a>
      </div>
      <div class="rangee">${sc.slice(0, 6).map(carte).join('')}</div>
    </div>
  </section>` : ''}

  ${nouveaux.length ? `<section class="section conteneur">
    <div class="titre-section"><div><p class="surtitre">Arrivages</p><h2>Nouveautés</h2></div></div>
    <div class="rangee">${nouveaux.map(carte).join('')}</div>
  </section>` : ''}

  <section class="section conteneur apropos">
    <div class="apropos-txt">
      <p class="surtitre">MC France CHR</p>
      <h2>Votre fournisseur de matériel de restauration depuis 2013</h2>
      <p>Installés à Roubaix, nous équipons restaurants, snacks, pizzerias, boulangeries, boucheries, hôtels et collectivités du Nord, de Picardie, de toute la France et de Belgique. Matériel neuf et d'occasion, grandes marques, conseils d'une équipe qui connaît la cuisine pro.</p>
      <div class="apropos-points">
        <div><strong>Showroom à Roubaix</strong><span>139 rue des Arts : venez voir et toucher le matériel.</span></div>
        <div><strong>Conseil au téléphone</strong><span>03 20 77 59 04 · 06 44 89 80 00</span></div>
        <div><strong>SAV réactif</strong><span>Réparation, entretien, maintenance.</span></div>
        <div><strong>Location & financement</strong><span>Location longue durée pour étaler l'investissement.</span></div>
      </div>
    </div>
    <div class="faq">
      <h2 class="sr">Questions fréquentes</h2>
      ${faq().map(([q, rr]) => `<details><summary>${q}</summary><p>${rr}</p></details>`).join('')}
    </div>
  </section>`);
}
function faq() {
  const r = S.reglages();
  return [
    ['Comment ouvrir un compte pro ?', 'Remplissez le formulaire avec votre SIRET : le numéro de TVA est calculé tout seul. Vous pouvez commander tout de suite ; MC France valide le compte sous 24 h ouvrées et active vos conditions (remise, paiement à 30 jours).'],
    ['Les prix sont-ils HT ?', `Oui, tous les prix sont affichés hors taxes, comme entre professionnels. Le bouton HT / TTC en haut de page bascule l'affichage. TVA à ${r.tva} % en France ; autoliquidation pour les sociétés de l'Union européenne avec un numéro de TVA valide.`],
    ['Comment marchent les prix dégressifs ?', `Dès ${r.paliers.map((p) => `${p.min} pièces identiques, −${p.remise} %`).join(' ; dès ')}. La remise s'applique toute seule dans le panier, ligne par ligne.`],
    ['Quels sont les délais et frais de livraison ?', `Livraison offerte dès ${nombre(r.franco)} € HT en France et en Belgique (hors Corse), en 1 à 3 jours ouvrés pour le matériel en stock. En dessous : forfait de ${eur(r.forfait)} HT. Camion avec hayon et prise de rendez-vous en option. Retrait gratuit au showroom de Roubaix.`],
    ['Puis-je payer à 30 jours ?', 'Oui, une fois votre compte pro validé : paiement à 30 jours fin de mois sur facture. Sinon : carte bancaire, virement ou paiement en 4 fois sans frais.'],
    ['Comment suivre ma commande ?', 'Depuis « Suivre une commande » avec votre numéro et votre code postal, ou depuis votre compte pro : chaque étape (validation, préparation, expédition, livraison) s\'affiche avec le numéro de suivi du transporteur.'],
  ];
}

/* ---------- Listes de produits (catégorie, recherche, promos, second choix) ---------- */
let filtres = null;
let cleFiltres = '';
function pageListe({ cle, entete, base, sousFamilles = null }) {
  if (cleFiltres !== cle) {
    filtres = { marques: new Set(), sous: new Set(), min: '', max: '', stock: false, promo: false, sc: false, tri: pref('tri') || 'pertinence', limite: 24 };
    cleFiltres = cle;
  }
  const modeVue = pref('vue') === 'liste' ? 'liste' : 'grille';
  const marques = [...new Set(base.map((p) => p.marque).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  const compte = (f) => base.filter(f).length;
  vue.innerHTML = `${entete}
  <div class="catalogue">
    <aside class="filtres" id="filtres" aria-label="Filtres">
      <div class="filtres-tete"><h2>Filtrer</h2><button class="btn-icone" type="button" data-fermer-filtres aria-label="Fermer">${ic('x')}</button></div>
      ${sousFamilles && sousFamilles.length > 1 ? `<div class="filtre"><h3>Catégorie</h3>${sousFamilles.map((s) => `<label class="case"><input type="checkbox" name="sous" value="${s.slug}" ${filtres.sous.has(s.slug) ? 'checked' : ''}><span>${esc(s.nom)}</span><small>${compte((p) => p.sous === s.slug)}</small></label>`).join('')}</div>` : ''}
      <div class="filtre"><h3>Disponibilité et offres</h3>
        <label class="case"><input type="checkbox" name="stock" ${filtres.stock ? 'checked' : ''}><span>En stock</span><small>${compte((p) => p.stock > 0)}</small></label>
        <label class="case"><input type="checkbox" name="promo" ${filtres.promo ? 'checked' : ''}><span>En promotion</span><small>${compte((p) => p.prixBarreHT)}</small></label>
        <label class="case"><input type="checkbox" name="sc" ${filtres.sc ? 'checked' : ''}><span>Second choix</span><small>${compte((p) => p.etat === 'second-choix')}</small></label>
      </div>
      <div class="filtre"><h3>Prix ${suff()}</h3>
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
        <select id="tri">
          ${[['pertinence', 'Pertinence'], ['prix-asc', 'Prix croissant'], ['prix-desc', 'Prix décroissant'], ['remise', 'Meilleures remises'], ['nouveau', 'Nouveautés'], ['nom', 'Nom A → Z']].map(([v, t]) => `<option value="${v}" ${filtres.tri === v ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <div class="vue-bascule" role="group" aria-label="Affichage">
          <button type="button" data-vue="grille" aria-pressed="${modeVue === 'grille'}" aria-label="Grille">${ic('grid')}</button>
          <button type="button" data-vue="liste" aria-pressed="${modeVue === 'liste'}" aria-label="Liste">${ic('list')}</button>
        </div>
      </div>
      <div class="filtres-actifs" id="filtres-actifs"></div>
      <div class="grille-produits ${modeVue === 'liste' ? 'en-liste' : ''}" id="liste"></div>
      <div class="voir-plus" id="voir-plus"></div>
    </div>
  </div>`;
  const majListe = () => {
    let l = base.filter((p) => (!filtres.sous.size || filtres.sous.has(p.sous))
      && (!filtres.marques.size || filtres.marques.has(p.marque))
      && (!filtres.stock || p.stock > 0) && (!filtres.promo || p.prixBarreHT) && (!filtres.sc || p.etat === 'second-choix')
      && (filtres.min === '' || aff(p.prixHT) >= +filtres.min) && (filtres.max === '' || aff(p.prixHT) <= +filtres.max));
    const tri = {
      'prix-asc': (a, b) => a.prixHT - b.prixHT, 'prix-desc': (a, b) => b.prixHT - a.prixHT, remise: (a, b) => remiseDe(b) - remiseDe(a),
      nouveau: (a, b) => (b.ajoute || '').localeCompare(a.ajoute || ''), nom: (a, b) => a.nom.localeCompare(b.nom, 'fr'),
    }[filtres.tri];
    if (tri) l = l.slice().sort(tri); else l = l.slice().sort((a, b) => (b.stock > 0) - (a.stock > 0));
    $('#liste-nb').textContent = `${l.length} produit${l.length > 1 ? 's' : ''}`;
    $('#filtres-valider').textContent = `Voir les ${l.length} produits`;
    $('#liste').innerHTML = l.length ? l.slice(0, filtres.limite).map(carte).join('') : `<div class="vide" style="grid-column:1/-1">${ic('search')}<h2>Aucun produit avec ces filtres</h2><p class="muet">Retirez un filtre ou appelez-nous : nous avons bien plus de références au showroom.</p><button class="btn" type="button" data-effacer-filtres>Effacer les filtres</button></div>`;
    $('#voir-plus').innerHTML = l.length > filtres.limite ? `<button class="btn btn-sombre" type="button" data-voir-plus>Voir plus (${l.length - filtres.limite} restants)</button>` : '';
    const actifs = [
      ...[...filtres.sous].map((s) => [`sous:${s}`, sousFamilles?.find((x) => x.slug === s)?.nom || s]),
      ...[...filtres.marques].map((m) => [`marque:${m}`, m]),
      ...(filtres.stock ? [['stock', 'En stock']] : []), ...(filtres.promo ? [['promo', 'En promotion']] : []), ...(filtres.sc ? [['sc', 'Second choix']] : []),
      ...(filtres.min !== '' ? [['min', `Dès ${eur(filtres.min)}`]] : []), ...(filtres.max !== '' ? [['max', `Jusqu'à ${eur(filtres.max)}`]] : []),
    ];
    $('#filtres-actifs').innerHTML = actifs.map(([k, t]) => `<button type="button" data-retirer="${esc(k)}">${esc(t)}${ic('x')}</button>`).join('');
  };
  const f = $('#filtres');
  f.addEventListener('change', (e) => {
    const el = e.target;
    if (el.name === 'marque') el.checked ? filtres.marques.add(el.value) : filtres.marques.delete(el.value);
    else if (el.name === 'sous') el.checked ? filtres.sous.add(el.value) : filtres.sous.delete(el.value);
    else if (['stock', 'promo', 'sc'].includes(el.name)) filtres[el.name] = el.checked;
    else if (['min', 'max'].includes(el.name)) filtres[el.name] = el.value;
    filtres.limite = 24;
    majListe();
  });
  f.addEventListener('input', (e) => { if (['min', 'max'].includes(e.target.name)) { filtres[e.target.name] = e.target.value; majListe(); } });
  $('#tri').addEventListener('change', (e) => { filtres.tri = e.target.value; pref('tri', e.target.value); majListe(); });
  vue.addEventListener('click', function gestion(e) {
    if (!document.body.contains(f)) { vue.removeEventListener('click', gestion); return; }
    const b = e.target.closest('[data-vue],[data-voir-plus],[data-retirer],[data-effacer-filtres],[data-ouvrir-filtres],[data-fermer-filtres]');
    if (!b) return;
    if (b.dataset.vue) { pref('vue', b.dataset.vue); $$('[data-vue]').forEach((x) => x.setAttribute('aria-pressed', x === b)); $('#liste').classList.toggle('en-liste', b.dataset.vue === 'liste'); }
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

function vueCategorie(fam, sous) {
  const f = S.famille(fam);
  if (!f) return vueIntrouvable();
  const sf = sous ? f.sous.find((s) => s.slug === sous) : null;
  if (sous && !sf) return vueIntrouvable();
  const tous = S.produits().filter((p) => p.famille === fam);
  const base = sf ? tous.filter((p) => p.sous === sous) : tous;
  document.title = `${sf ? sf.nom : f.nom} — MC France CHR`;
  pageListe({
    cle: `c/${fam}/${sous || ''}`,
    base,
    sousFamilles: sf ? null : f.sous,
    entete: `<div class="conteneur">${fil(sf ? [[f.nom, `#/c/${f.slug}`], [sf.nom]] : [[f.nom]])}
      <header class="cat-tete"><h1>${esc(sf ? sf.nom : f.nom)}</h1><p>${esc(f.description || '')} Prix HT dégressifs, livraison offerte dès ${nombre(S.reglages().franco)} € HT.</p></header>
      <nav class="sous-chips" aria-label="Sous-catégories">
        <a class="sous-chip" href="#/c/${f.slug}" ${!sf ? 'aria-current="page"' : ''}>${ic(f.icone)}Tout <small>${tous.length}</small></a>
        ${f.sous.map((s) => `<a class="sous-chip" href="#/c/${f.slug}/${s.slug}" ${sf?.slug === s.slug ? 'aria-current="page"' : ''}><img src="${src(s.image || f.image)}" alt="" width="44" height="44" loading="lazy">${esc(s.nom)} <small>${tous.filter((p) => p.sous === s.slug).length}</small></a>`).join('')}
      </nav>`,
  });
}
function vueRecherche(q) {
  const res = S.rechercher(q, 500);
  $('#q').value = q;
  document.title = `« ${q} » — MC France CHR`;
  const fams = [...new Set(res.map((p) => p.famille))];
  pageListe({
    cle: 'r/' + q, base: res,
    sousFamilles: fams.length === 1 ? S.famille(fams[0]).sous : null,
    entete: `<div class="conteneur">${fil([['Recherche'], [q]])}<header class="cat-tete"><h1>« ${esc(q)} »</h1><p>${res.length ? `${res.length} produit${res.length > 1 ? 's' : ''} trouvé${res.length > 1 ? 's' : ''} par nom, référence ou marque.` : 'Aucun produit ne correspond. Vérifiez la référence ou appelez-nous au 03 20 77 59 04.'}</p></header>`,
  });
}
function vuePromos() {
  const base = S.produits().filter((p) => p.prixBarreHT);
  document.title = 'Promotions — MC France CHR';
  pageListe({ cle: 'promos', base, entete: `<div class="conteneur">${fil([['Promotions']])}<header class="cat-tete"><h1>Promotions</h1><p>Les prix barrés du moment, relevés sur la boutique actuelle de MC France. Les remises de quantité s'ajoutent dans le panier.</p></header>` });
}
function vueSecondChoix() {
  const base = S.produits().filter((p) => p.etat === 'second-choix');
  document.title = 'Second choix — MC France CHR';
  pageListe({ cle: 'sc', base, entete: `<div class="conteneur">${fil([['Second choix']])}<header class="cat-tete"><h1>Second choix</h1><p>Matériel neuf déclassé : défaut d'aspect, carton abîmé, retour d'exposition ou retour client contrôlé. Même garantie que le neuf, quantités limitées. <em>Dans cette démo, les articles et défauts sont des exemples.</em></p></header>` });
}

/* ---------- Fiche produit ---------- */
function vueProduit(id) {
  const p = S.produit(id);
  if (!p || p.enLigne === false) return vueIntrouvable();
  S.marquerVu(id);
  const f = S.famille(p.famille);
  const sf = S.sousFamille(p.famille, p.sous);
  const pal = S.paliersDe(p);
  const r = S.reglages();
  const memes = S.produits().filter((x) => x.sous === p.sous && x.id !== p.id).slice(0, 10);
  const vusR = S.vus().filter((x) => x !== id).map(S.produit).filter((x) => x && x.enLigne !== false).slice(0, 10);
  const favs = S.favoris();
  const c = S.clientConnecte();
  rendre(`<div class="conteneur">
    ${fil([[f?.nom || '', `#/c/${p.famille}`], [sf?.nom || '', `#/c/${p.famille}/${p.sous}`], [p.nom]])}
    <div class="fiche">
      <div class="galerie">
        <div class="galerie-principale">${badges(p)}<img id="photo" src="${src(p.images[0])}" alt="${esc(p.nom)}" width="620" height="620"></div>
        ${p.images.length > 1 ? `<div class="galerie-vignettes">${p.images.map((im, i) => `<button type="button" data-photo="${i}" aria-current="${i === 0}" aria-label="Photo ${i + 1}"><img src="${src(im)}" alt="" width="76" height="76"></button>`).join('')}</div>` : ''}
      </div>
      <div class="fiche-infos">
        ${p.marque ? `<p class="fiche-marque">${esc(p.marque)}</p>` : ''}
        <h1>${esc(p.nom)}</h1>
        <div class="fiche-meta"><span>Réf. <strong>${esc(p.ref)}</strong></span>${stockHtml(p)}<button type="button" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}">${favs.includes(p.id) ? '♥ Dans mes favoris' : '♡ Ajouter aux favoris'}</button></div>
        ${p.etat === 'second-choix' ? `<div class="encadre-sc"><strong>Second choix — pièce unique</strong><span>${esc(p.defaut || '')}</span><span class="petit muet">Article d'exemple pour la démo.</span></div>` : ''}
        <div class="bloc-prix" data-achat>
          <div class="prix-principal"><strong class="prix" id="pu">${eur(aff(p.prixHT))} <small>${suff()}</small></strong>${p.prixBarreHT ? `<s>${eur(aff(p.prixBarreHT))}</s><span class="pastille p-promo">−${remiseDe(p)} %</span>` : ''}</div>
          <p class="prix-secondaire" id="pu-autre">${eur(affAutre(p.prixHT))} ${autre()} l'unité${c && c.statut === 'valide' && c.remise ? ` · remise client −${c.remise} % incluse au panier` : ''}</p>
          ${pal.length ? `<p class="paliers-titre">Prix dégressifs</p><table class="paliers-table"><thead><tr><th>Quantité</th><th>Remise</th><th>Prix unitaire ${suff()}</th></tr></thead><tbody>
            <tr data-palier="1"><td>1 à ${pal[0].min - 1}</td><td>—</td><td>${eur(aff(p.prixHT))}</td></tr>
            ${pal.map((x, i) => `<tr data-palier="${x.min}"><td>${pal[i + 1] ? `${x.min} à ${pal[i + 1].min - 1}` : `${x.min} et plus`}</td><td>−${x.remise} %</td><td>${eur(aff(S.arrondi(p.prixHT * (1 - x.remise / 100))))}</td></tr>`).join('')}
          </tbody></table>` : ''}
          <div class="achat">${qteHtml('qte', 1)}<button class="btn btn-plein btn-grand" type="button" data-ajouter="${p.id}">${ic('cart')}Ajouter au panier</button></div>
          <div class="achat-total"><span id="ligne-detail">1 × ${eur(aff(p.prixHT))}</span><strong id="ligne-total">${eur(aff(p.prixHT))} ${suff()}</strong></div>
          <div id="palier-suivant">${palierSuivant(p, 1)}</div>
          <div class="achat-secondaires">
            <button class="btn" type="button" data-devis-produit="${p.id}">${ic('file')}Demander un devis</button>
            <a class="btn" href="tel:+33320775904">${ic('phone')}Conseil : 03 20 77 59 04</a>
          </div>
        </div>
        <ul class="fiche-garanties">
          <li>${ic('truck')}<p><strong>${p.stock > 0 ? `Expédié en ${esc(p.delai)}` : 'Délai à confirmer par MC France'}</strong><span>Livraison offerte dès ${nombre(r.franco)} € HT · camion avec hayon sur demande</span></p></li>
          <li>${ic('store')}<p><strong>Retrait gratuit au showroom</strong><span>139 rue des Arts, Roubaix</span></p></li>
          <li>${ic('card')}<p><strong>Paiement 4× sans frais ou à 30 jours</strong><span>30 jours fin de mois avec un compte pro validé</span></p></li>
          <li>${ic('shield')}<p><strong>Garantie 1 à 2 ans selon la marque</strong><span>SAV, pièces et main-d'œuvre par MC France</span></p></li>
        </ul>
      </div>
    </div>
    <section class="fiche-onglets">
      <div class="onglets-tete" role="tablist">
        <button role="tab" type="button" aria-selected="true" aria-controls="o-desc" id="t-desc">Points clés</button>
        ${p.specs?.length ? '<button role="tab" type="button" aria-selected="false" aria-controls="o-specs" id="t-specs">Caractéristiques techniques</button>' : ''}
        <button role="tab" type="button" aria-selected="false" aria-controls="o-livr" id="t-livr">Livraison & garantie</button>
      </div>
      <div class="onglet" role="tabpanel" id="o-desc" aria-labelledby="t-desc">
        ${p.points?.length ? `<ul class="points-cles">${p.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        ${(p.texte || []).map((x) => `<p style="margin-top:12px">${esc(x)}</p>`).join('')}
        ${!p.points?.length && !p.texte?.length ? '<p class="muet">Fiche détaillée sur demande : appelez-nous au 03 20 77 59 04.</p>' : ''}
      </div>
      ${p.specs?.length ? `<div class="onglet" role="tabpanel" id="o-specs" aria-labelledby="t-specs" hidden><div class="specs">${p.specs.map(([g, lignes]) => `<div><h3>${esc(g)}</h3><table>${lignes.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table></div>`).join('')}</div></div>` : ''}
      <div class="onglet" role="tabpanel" id="o-livr" aria-labelledby="t-livr" hidden>
        <div class="specs">
          <div><h3>Livraison</h3><table>
            <tr><td>Délai en stock</td><td>${esc(p.delai)}</td></tr>
            <tr><td>Franco de port</td><td>dès ${eur(r.franco)} HT (France, Belgique, hors Corse)</td></tr>
            <tr><td>Sous le franco</td><td>${eur(r.forfait)} HT</td></tr>
            <tr><td>Camion avec hayon + rendez-vous</td><td>+ ${eur(r.hayon)} HT</td></tr>
            <tr><td>Retrait au showroom de Roubaix</td><td>Gratuit</td></tr>
          </table></div>
          <div><h3>Garantie et service</h3><table>
            <tr><td>Garantie</td><td>1 à 2 ans selon la marque</td></tr>
            <tr><td>SAV</td><td>Réparation, entretien, maintenance</td></tr>
            <tr><td>Paiement</td><td>Carte, virement, 4× sans frais, 30 jours (compte pro)</td></tr>
          </table></div>
        </div>
      </div>
    </section>
    ${memes.length ? `<section class="section" style="padding-top:0"><div class="titre-section"><h2>Dans la même catégorie</h2><a href="#/c/${p.famille}/${p.sous}">Tout voir ${ic('arrow')}</a></div><div class="rangee">${memes.map(carte).join('')}</div></section>` : ''}
    ${vusR.length ? `<section class="section" style="padding-top:0"><div class="titre-section"><h2>Vus récemment</h2></div><div class="rangee">${vusR.map(carte).join('')}</div></section>` : ''}
  </div>
  <div class="barre-mobile"><div><strong id="bm-prix">${eur(aff(p.prixHT))} ${suff()}</strong><small>${eur(affAutre(p.prixHT))} ${autre()}</small></div><button class="btn btn-plein" type="button" data-ajouter-mobile="${p.id}">${ic('cart')}Ajouter</button></div>`, p.nom);
  document.body.classList.add('avec-barre');

  const majPrix = () => {
    const q = Math.max(1, Math.min(999, parseInt($('.bloc-prix input[name=qte]').value, 10) || 1));
    const pu = S.prixUnitaire(p, q);
    $('#pu').innerHTML = `${eur(aff(pu.unit))} <small>${suff()}</small>`;
    $('#pu-autre').textContent = `${eur(affAutre(pu.unit))} ${autre()} l'unité`;
    $('#ligne-detail').textContent = `${q} × ${eur(aff(pu.unit))}`;
    $('#ligne-total').textContent = `${eur(aff(pu.unit * q))} ${suff()}`;
    $('#bm-prix').textContent = `${eur(aff(pu.unit))} ${suff()}`;
    $('#palier-suivant').innerHTML = palierSuivant(p, q);
    const actif = pal.filter((x) => q >= x.min).pop();
    $$('[data-palier]').forEach((tr) => tr.classList.toggle('actif', +tr.dataset.palier === (actif ? actif.min : 1)));
  };
  $('.bloc-prix input[name=qte]').addEventListener('input', majPrix);
  majPrix();
  $$('[data-photo]').forEach((b) => b.addEventListener('click', () => {
    $('#photo').src = src(p.images[+b.dataset.photo]);
    $$('[data-photo]').forEach((x) => x.setAttribute('aria-current', x === b));
  }));
  $$('[role=tab]').forEach((t) => t.addEventListener('click', () => {
    $$('[role=tab]').forEach((x) => x.setAttribute('aria-selected', x === t));
    $$('[role=tabpanel]').forEach((x) => { x.hidden = x.id !== t.getAttribute('aria-controls'); });
  }));
  $('[data-ajouter-mobile]').addEventListener('click', () => $('.bloc-prix [data-ajouter]').click());
  $('[data-devis-produit]').addEventListener('click', () => {
    const q = parseInt($('.bloc-prix input[name=qte]').value, 10) || 1;
    demanderDevis([{ id: p.id, qte: q }]);
  });
}

/* ---------- Pack métier ---------- */
function vueMetier(slug) {
  const m = METIERS.find((x) => x.slug === slug);
  if (!m) return vueIntrouvable();
  const pk = packDe(m);
  const tot = pk.reduce((s, p) => s + p.prixHT, 0);
  rendre(`<div class="conteneur">
    ${fil([['Équiper un métier'], [m.nom]])}
    <header class="cat-tete"><h1>${esc(m.nom)}</h1><p>Le pack de départ : une pièce par poste, la moins chère disponible en stock. Ajoutez-le d'un coup, puis ajustez les quantités ou remplacez une pièce depuis le panier.</p></header>
    <div class="panier">
      <div class="panier-lignes">${pk.map((p) => `<div class="ligne"><a href="#/p/${p.id}"><img src="${src(p.images[0])}" alt="" width="96" height="96"></a><div><p class="petit muet">${esc(S.sousFamille(p.famille, p.sous)?.nom || '')}</p><h3><a href="#/p/${p.id}">${esc(p.nom)}</a></h3><div class="ligne-meta"><span>Réf. ${esc(p.ref)}</span>${stockHtml(p)}</div></div><div class="ligne-actions"><span class="ligne-total">${eur(aff(p.prixHT))} ${suff()}</span><a class="btn btn-petit" href="#/c/${p.famille}/${p.sous}">Autres modèles</a></div></div>`).join('')}</div>
      <aside class="resume">
        <h2>Pack ${esc(m.nom.toLowerCase())}</h2>
        <div class="resume-l"><span>${pk.length} équipements</span><strong>${eur(aff(tot))} ${suff()}</strong></div>
        ${blocFranco({ ht: tot, resteFranco: Math.max(0, S.reglages().franco - tot) })}
        <button class="btn btn-plein btn-grand" type="button" data-pack="${m.slug}">${ic('cart')}Ajouter le pack au panier</button>
        <button class="btn" type="button" data-pack-devis="${m.slug}">${ic('file')}Devis pour ce pack</button>
      </aside>
    </div>
  </div>`, m.nom);
  $('[data-pack]').addEventListener('click', () => { pk.forEach((p) => S.ajouter(p.id, 1)); toast(`${ic('check')} Pack ajouté : ${pk.length} équipements <a href="#/panier">Voir le panier</a>`); });
  $('[data-pack-devis]').addEventListener('click', () => demanderDevis(pk.map((p) => ({ id: p.id, qte: 1 }))));
}

/* ---------- Panier ---------- */
function vuePanier(params) {
  const lignes = S.panier();
  if (!lignes.length) {
    rendre(`<div class="conteneur">${fil([['Panier']])}<h1 class="page-titre">Votre panier</h1>
      <div class="vide">${ic('cart')}<h2>Votre panier est vide</h2><p class="muet">Parcourez le catalogue, collez une liste de références ou recommandez depuis votre compte.</p>
      <div class="gros-actions"><a class="btn btn-plein" href="#/">Voir le catalogue</a><a class="btn" href="#/commande-rapide">${ic('zap')}Commande rapide</a><a class="btn" href="#/compte/commandes">${ic('repeat')}Recommander</a></div></div></div>`, 'Panier');
    return;
  }
  const t = S.calculer(lignes);
  const c = S.clientConnecte();
  rendre(`<div class="conteneur">${fil([['Panier']])}<h1 class="page-titre">Votre panier <span class="muet" style="font-size:.55em">${S.nbArticles()} article${S.nbArticles() > 1 ? 's' : ''}</span></h1>
    <div class="panier">
      <div>
        <div class="panier-lignes">
          ${t.lignes.map((l) => `<div class="ligne">
            <a href="#/p/${l.id}"><img src="${src(l.p.images[0])}" alt="" width="96" height="96"></a>
            <div>
              <h3><a href="#/p/${l.id}">${esc(l.p.nom)}</a></h3>
              <div class="ligne-meta"><span>Réf. ${esc(l.p.ref)}</span>${stockHtml(l.p)}${l.p.etat === 'second-choix' ? '<span class="pastille p-sc">Second choix</span>' : ''}</div>
              <p class="ligne-pu">${eur(aff(l.unit))} ${suff()} / pièce ${l.unit < l.base ? `<s>${eur(aff(l.base))}</s>` : ''} ${l.remisePalier ? `<span class="pastille p-vert">−${l.remisePalier} % quantité</span>` : ''} ${l.remiseClient ? `<span class="pastille p-bleu">−${l.remiseClient} % client</span>` : ''}</p>
              ${palierSuivant(l.p, l.qte) ? `<div style="margin-top:8px">${palierSuivant(l.p, l.qte)}</div>` : ''}
            </div>
            <div class="ligne-actions">
              ${qteHtml('qte', l.qte, l.id)}
              <span class="ligne-total">${eur(aff(l.total))}</span>
              <button class="btn btn-lien btn-petit btn-danger" type="button" data-retirer-ligne="${l.id}">${ic('trash')}Retirer</button>
            </div>
          </div>`).join('')}
        </div>
        <div class="gros-actions" style="margin-top:14px"><a class="btn" href="#/">${ic('left')}Continuer mes achats</a><a class="btn" href="#/commande-rapide">${ic('zap')}Ajouter par référence</a><button class="btn btn-lien btn-danger" type="button" data-vider>Vider le panier</button></div>
      </div>
      <aside class="resume">
        <h2>Récapitulatif</h2>
        ${blocFranco(t)}
        <div class="resume-l"><span>Sous-total HT</span><strong>${eur(t.ht)}</strong></div>
        ${t.economie > 0 ? `<div class="resume-l eco"><span>Vous économisez</span><span>${eur(t.economie)} HT</span></div>` : ''}
        <div class="resume-l"><span>Livraison standard HT</span><span>${t.port ? eur(t.port) : 'Offerte'}</span></div>
        <div class="resume-l"><span>TVA ${S.reglages().tva} %</span><span>${eur(t.tva)}</span></div>
        <div class="resume-total"><span>Total TTC</span><strong>${eur(t.ttc)}</strong></div>
        <a class="btn btn-plein btn-grand" href="#/commande">Passer la commande ${ic('arrow')}</a>
        <button class="btn" type="button" data-devis-panier>${ic('file')}Transformer en devis PDF</button>
        ${!c ? '<p class="petit muet">Avec un compte pro validé : remise client et paiement à 30 jours. <a href="#/compte" class="btn-lien">Se connecter</a></p>' : ''}
        <div class="resume-moyens"><span>Carte bancaire</span><span>Virement</span><span>4× sans frais</span><span>30 jours</span></div>
      </aside>
    </div></div>`, 'Panier');
  vue.querySelectorAll('.ligne input[name=qte]').forEach((inp) => inp.addEventListener('change', () => {
    S.changerQte(inp.dataset.cle, Math.max(0, parseInt(inp.value, 10) || 0));
    const cle = inp.dataset.cle;
    vuePanier();
    vue.querySelector(`input[data-cle="${CSS.escape(cle)}"]`)?.focus();
  }));
  vue.querySelectorAll('[data-retirer-ligne]').forEach((b) => b.addEventListener('click', () => { S.changerQte(b.dataset.retirerLigne, 0); vuePanier(); }));
  $('[data-vider]').addEventListener('click', async () => {
    const r = await modale({ titre: 'Vider le panier ?', corps: '<p>Tous les articles seront retirés.</p>', actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Vider', classe: 'btn-sombre' }] });
    if (r.action === 'ok') { S.viderPanier(); vuePanier(); }
  });
  $('[data-devis-panier]').addEventListener('click', () => demanderDevis(S.panier()));
  if (params?.get('devis')) demanderDevis(S.panier());
}

async function demanderDevis(lignes) {
  const c = S.clientConnecte();
  const r = await modale({
    titre: 'Recevoir un devis',
    corps: `<p class="muet">Un devis à votre nom, valable ${S.reglages().validiteDevis} jours, imprimable en PDF. MC France le reçoit aussi pour vous rappeler si besoin.</p>
      ${c ? `<div class="carte-societe"><span><strong>${esc(c.societe)}</strong><br>${esc(c.contact)} · ${esc(c.email)}</span></div>` : `
      <div class="grille-champs">
        <label class="champ"><span>Société *</span><input name="societe" required autocomplete="organization"></label>
        <label class="champ"><span>Nom du contact *</span><input name="contact" required autocomplete="name"></label>
        <label class="champ"><span>E-mail *</span><input name="email" type="email" required autocomplete="email"></label>
        <label class="champ"><span>Téléphone</span><input name="tel" type="tel" autocomplete="tel"></label>
      </div>`}
      <label class="champ"><span>Un message pour MC France (délai, installation, quantités…)</span><textarea name="message" rows="3"></textarea></label>`,
    actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Créer le devis', classe: 'btn-plein' }],
  });
  if (r.action !== 'ok') return;
  const cli = c ? { id: c.id, societe: c.societe, contact: c.contact, email: c.email, tel: c.tel, siret: c.siret, tva: c.tva } : { societe: r.donnees.societe || 'Société', contact: r.donnees.contact || '', email: r.donnees.email || '', tel: r.donnees.tel || '' };
  const d = S.creerDevis({ client: cli, lignes, message: r.donnees.message });
  try { sessionStorage.setItem('mcf-doc-' + d.num, '1'); } catch { /* rien */ }
  location.hash = `#/document/devis/${d.num}`;
  toast(`${ic('check')} Devis ${d.num} créé`);
}

/* ---------- Commande ---------- */
function vueCommande() {
  const lignes = S.panier();
  if (!lignes.length) { location.hash = '#/panier'; return; }
  const c = S.clientConnecte();
  const r = S.reglages();
  let mode = 'standard';
  const peut30 = c && c.statut === 'valide' && c.conditions === '30j';
  rendre(`<div class="conteneur">${fil([['Panier', '#/panier'], ['Commande']])}<h1 class="page-titre">Commande</h1>
    <form class="tunnel" id="form-commande" novalidate>
      <div>
        <section class="etape">
          <div class="etape-titre"><span>1</span><h2>Votre société</h2>${c ? '<button class="btn btn-petit" type="button" data-deconnexion>Changer de compte</button>' : '<a class="btn btn-petit" href="#/compte">J\'ai un compte</a>'}</div>
          ${c ? `<div class="carte-societe"><span><strong>${esc(c.societe)}</strong> · ${esc(c.contact)}<br>SIRET ${esc(c.siret)} · TVA ${esc(c.tva)}<br>${esc(c.email)} · ${esc(c.tel)}</span><span>${c.statut === 'valide' ? '<span class="pastille p-vert">Compte validé</span>' : '<span class="pastille p-jaune">En validation</span>'}</span></div>`
    : `<div class="grille-champs">
            <label class="champ"><span>Raison sociale *</span><input name="societe" required autocomplete="organization"></label>
            <label class="champ"><span>SIRET (14 chiffres) *</span><input name="siret" required inputmode="numeric" maxlength="17" placeholder="123 456 789 00012"><small id="aide-siret">Le n° de TVA est calculé tout seul.</small></label>
            <label class="champ"><span>N° de TVA intracommunautaire</span><input name="tva" placeholder="FR…"></label>
            <label class="champ"><span>Nom du contact *</span><input name="contact" required autocomplete="name"></label>
            <label class="champ"><span>E-mail *</span><input name="email" type="email" required autocomplete="email"></label>
            <label class="champ"><span>Téléphone *</span><input name="tel" type="tel" required autocomplete="tel"></label>
          </div>
          <label class="case"><input type="checkbox" name="creer" checked><span>Créer mon compte pro avec ces informations (remise client et paiement à 30 jours après validation par MC France)</span></label>`}
        </section>
        <section class="etape">
          <div class="etape-titre"><span>2</span><h2>Livraison</h2></div>
          <div class="choix" id="choix-livraison">
            ${[['standard', 'Livraison standard', `1 à 3 jours ouvrés pour le matériel en stock · offerte dès ${eur(r.franco)} HT`], ['hayon', 'Camion avec hayon + rendez-vous', 'Pour le matériel lourd, déchargé au sol à l\'heure convenue'], ['retrait', 'Retrait au showroom de Roubaix', '139 rue des Arts, prêt sous 24 à 48 h · gratuit']].map(([v, t, d], i) => `<label><input type="radio" name="mode" value="${v}" ${i === 0 ? 'checked' : ''}><span><strong>${t}</strong><small>${d}</small></span><em data-prix-mode="${v}"></em></label>`).join('')}
          </div>
          <div class="grille-champs" id="adresse">
            <label class="champ" style="grid-column:1/-1"><span>Adresse de livraison *</span><input name="adresse" required autocomplete="street-address" value="${esc(c?.adresse || '')}"></label>
            <label class="champ"><span>Code postal *</span><input name="cp" required inputmode="numeric" autocomplete="postal-code" value="${esc(c?.cp || '')}"></label>
            <label class="champ"><span>Ville *</span><input name="ville" required autocomplete="address-level2" value="${esc(c?.ville || '')}"></label>
            <label class="champ"><span>Pays</span><select name="pays">${['France', 'Belgique', 'Luxembourg'].map((p) => `<option ${c?.pays === p ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
          </div>
        </section>
        <section class="etape">
          <div class="etape-titre"><span>3</span><h2>Paiement</h2></div>
          <div class="choix">
            <label><input type="radio" name="paiement" value="cb" checked><span><strong>Carte bancaire</strong><small>Page de paiement sécurisée de la banque · dans la démo, le paiement est simulé</small></span></label>
            <label><input type="radio" name="paiement" value="4x"><span><strong>Paiement en 4 fois sans frais</strong><small>Prélevé sur votre carte en 4 mensualités</small></span></label>
            <label><input type="radio" name="paiement" value="virement"><span><strong>Virement bancaire</strong><small>La commande part en préparation à réception du virement</small></span></label>
            <label><input type="radio" name="paiement" value="30j" ${peut30 ? '' : 'disabled'}><span><strong>À 30 jours fin de mois</strong><small>${peut30 ? 'Sur facture, selon vos conditions de compte pro' : 'Disponible une fois votre compte pro validé par MC France'}</small></span></label>
          </div>
          <label class="champ"><span>Instructions (accès, horaires de livraison, bon de commande interne…)</span><textarea name="note" rows="2"></textarea></label>
        </section>
      </div>
      <aside class="resume" id="resume-commande"></aside>
    </form></div>`, 'Commande');
  const form = $('#form-commande');
  const majResume = () => {
    mode = form.mode.value;
    const t = S.calculer(lignes, mode);
    $('#adresse').hidden = mode === 'retrait';
    $$('[data-prix-mode]').forEach((e) => {
      const tt = S.calculer(lignes, e.dataset.prixMode);
      e.textContent = tt.port ? eur(tt.port) + ' HT' : 'Offert';
    });
    $('#resume-commande').innerHTML = `<h2>Votre commande</h2>
      <div class="resume-lignes">${t.lignes.map((l) => `<div><img src="${src(l.p.images[0])}" alt="" width="44" height="44"><span>${l.qte} × ${esc(l.p.nom)}</span><strong>${eur(l.total)}</strong></div>`).join('')}</div>
      <div class="resume-l"><span>Sous-total HT</span><strong>${eur(t.ht)}</strong></div>
      <div class="resume-l"><span>Livraison HT</span><span>${t.port ? eur(t.port) : 'Offerte'}</span></div>
      <div class="resume-l"><span>TVA ${r.tva} %</span><span>${eur(t.tva)}</span></div>
      <div class="resume-total"><span>Total TTC</span><strong>${eur(t.ttc)}</strong></div>
      <label class="case petit"><input type="checkbox" name="cgv" required><span>J'accepte les conditions générales de vente entre professionnels.</span></label>
      <button class="btn btn-plein btn-grand" type="submit">${ic('check')}Valider la commande</button>
      <p class="petit muet">Démo : aucune somme n'est prélevée.</p>`;
  };
  form.addEventListener('change', (e) => { if (e.target.name === 'mode') majResume(); });
  majResume();
  form.siret?.addEventListener('input', () => {
    const v = form.siret.value.replace(/\D/g, '');
    const aide = $('#aide-siret');
    if (v.length === 14) {
      const ok = S.siretValide(v);
      aide.textContent = ok ? 'SIRET valide ✓' : 'Ce SIRET n\'est pas valide : vérifiez les 14 chiffres.';
      aide.style.color = ok ? 'var(--vert)' : 'var(--rouge)';
      if (ok && !form.tva.value) form.tva.value = S.tvaDepuisSiret(v);
    } else { aide.textContent = 'Le n° de TVA est calculé tout seul.'; aide.style.color = ''; }
  });
  $('[data-deconnexion]')?.addEventListener('click', () => { S.deconnecter(); location.hash = '#/compte?retour=commande'; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const requis = ['adresse', 'cp', 'ville'].filter(() => d.mode !== 'retrait');
    if (!c) requis.push('societe', 'siret', 'contact', 'email', 'tel');
    let erreur = null;
    $$('.champ.erreur', form).forEach((x) => x.classList.remove('erreur'));
    for (const k of requis) {
      if (!String(d[k] || '').trim()) { form[k].closest('.champ').classList.add('erreur'); erreur = erreur || form[k]; }
    }
    if (!c && d.siret && !S.siretValide(d.siret)) { form.siret.closest('.champ').classList.add('erreur'); erreur = erreur || form.siret; }
    if (!c && d.email && !/^\S+@\S+\.\S+$/.test(d.email)) { form.email.closest('.champ').classList.add('erreur'); erreur = erreur || form.email; }
    if (erreur) { erreur.focus(); toast('Vérifiez les champs en rouge.', 'erreur'); return; }
    if (!d.cgv) { toast('Merci d\'accepter les conditions générales de vente.', 'erreur'); form.cgv.focus(); return; }
    let cli = c;
    const siret = String(d.siret || '').replace(/\D/g, '');
    if (!cli) {
      const infos = { societe: d.societe.trim(), contact: d.contact.trim(), email: d.email.trim(), tel: d.tel.trim(), siret, tva: d.tva || S.tvaDepuisSiret(siret), adresse: d.adresse, cp: d.cp, ville: d.ville, pays: d.pays };
      if (d.creer) { cli = S.creerClient(infos); S.connecter(cli.id); } else cli = infos;
    }
    const cmd = S.passerCommande({
      client: { id: cli.id, societe: cli.societe, contact: cli.contact, email: cli.email, tel: cli.tel, siret: cli.siret, tva: cli.tva },
      livraison: d.mode === 'retrait' ? { mode: 'retrait', cp: d.cp || cli.cp || '', adresse: '', ville: '' } : { mode: d.mode, adresse: d.adresse, cp: d.cp, ville: d.ville, pays: d.pays },
      paiement: d.paiement, note: d.note, lignes,
    });
    S.viderPanier();
    try { sessionStorage.setItem('mcf-suivi-' + cmd.num, '1'); } catch { /* rien */ }
    location.hash = `#/merci/${cmd.num}`;
  });
}

/* ---------- Suivi ---------- */
function chronologie(c) {
  const retrait = c.livraison?.mode === 'retrait';
  const etapes = ['validee', 'preparation', 'expediee', 'livree'];
  if (c.paiement === 'virement' || c.historique.some((h) => h.statut === 'attente')) etapes.unshift('attente');
  const idx = etapes.indexOf(c.statut);
  const quand = (s) => c.historique.filter((h) => h.statut === s).pop()?.date;
  return `<div class="chrono" style="--n:${etapes.length}">${etapes.map((s, i) => {
    const etat = c.statut === 'annulee' ? '' : i < idx || (i === idx && s === 'livree') ? 'fait' : i === idx ? 'encours' : '';
    return `<div class="chrono-etape ${etat}"><span class="chrono-pastille">${etat === 'fait' ? ic('check') : ic(['clock', 'check', 'box', 'truck', 'pin'][i + (etapes.length === 4 ? 1 : 0)] || 'check')}</span><span>${S.statut(s, retrait).nom}${quand(s) ? `<small><br>${new Date(quand(s)).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</small>` : ''}</span></div>`;
  }).join('')}</div>`;
}
function detailCommande(c, avecActions = true) {
  const retrait = c.livraison?.mode === 'retrait';
  return `<section class="carte-blanche">
      <div class="titre-section" style="margin:0"><div><h2>Commande ${esc(c.num)}</h2><p>Passée le ${dateLongue(c.date)} · ${esc(S.PAIEMENTS[c.paiement] || '')}</p></div>
      <span class="pastille ${c.statut === 'livree' ? 'p-vert' : c.statut === 'annulee' ? 'p-rouge' : c.statut === 'attente' ? 'p-jaune' : 'p-bleu'}">${S.statut(c.statut, retrait).nom}</span></div>
      ${c.statut === 'annulee' ? '<div class="info-bulle jaune">' + ic('info') + '<span>Cette commande a été annulée. Contactez MC France pour toute question.</span></div>' : chronologie(c)}
      ${c.suivi ? `<div class="suivi-colis">${ic('truck')}<span>Transporteur <strong>${esc(c.transporteur)}</strong> · n° de suivi <code>${esc(c.suivi)}</code></span></div>` : ''}
      ${retrait && c.statut === 'expediee' ? `<div class="suivi-colis">${ic('store')}<span>Votre matériel vous attend au showroom : <strong>${esc(S.reglages().adresse)}</strong></span></div>` : ''}
    </section>
    <section class="carte-blanche">
      <h2>Articles</h2>
      <div class="tableau-scroll"><table class="tableau"><thead><tr><th></th><th>Article</th><th class="num">Qté</th><th class="num">PU HT</th><th class="num">Total HT</th></tr></thead><tbody>
      ${c.lignes.map((l) => `<tr><td><img src="${src(l.image)}" alt="" width="44" height="44" style="object-fit:contain"></td><td>${esc(l.nom)}<br><small class="muet">Réf. ${esc(l.ref)}</small></td><td class="num">${l.qte}</td><td class="num">${eur(l.unit)}</td><td class="num">${eur(l.total)}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="resume-l"><span>Total HT</span><strong>${eur(c.totaux.ht)}</strong></div>
      <div class="resume-l"><span>Livraison HT</span><span>${c.totaux.port ? eur(c.totaux.port) : 'Offerte'}</span></div>
      <div class="resume-total"><span>Total TTC</span><strong>${eur(c.totaux.ttc)}</strong></div>
      ${avecActions ? `<div class="gros-actions"><a class="btn" href="#/document/facture/${c.num}">${ic('file')}Facture</a><button class="btn" type="button" data-recommander="${c.num}">${ic('repeat')}Recommander</button></div>` : ''}
    </section>`;
}
function vueMerci(num) {
  const c = S.commande(num);
  if (!c) return vueIntrouvable();
  rendre(`<div class="conteneur merci">
    <div class="merci-tete">${ic('check')}<h1>Merci, votre commande est enregistrée</h1>
      <p>Commande <strong>${esc(c.num)}</strong> · ${eur(c.totaux.ttc)} TTC. Un récapitulatif part à <strong>${esc(c.client.email)}</strong>.</p>
      ${c.paiement === 'virement' ? `<div class="info-bulle jaune">${ic('info')}<span>Virement à effectuer avec la référence <strong>${esc(c.num)}</strong> : la préparation démarre à réception.</span></div>` : ''}
      <div class="gros-actions"><a class="btn btn-plein" href="#/suivi/${c.num}">${ic('truck')}Suivre ma commande</a><a class="btn" href="#/document/facture/${c.num}">${ic('file')}Facture</a><a class="btn" href="#/">Retour à la boutique</a></div>
    </div>
    <div class="info-bulle">${ic('info')}<span><strong>Pour la démo :</strong> ouvrez l'<a href="admin/#/commandes/${c.num}" target="_blank" rel="noopener"><strong>espace admin</strong></a>, faites avancer la commande (préparation, expédition avec n° de suivi, livraison), puis revenez au suivi : il se met à jour tout seul.</span></div>
    ${detailCommande(c)}
  </div>`, 'Commande confirmée');
}
function vueSuivi(num) {
  const cli = S.clientConnecte();
  const c = num ? S.commande(num) : null;
  let autorise = false;
  try { autorise = !!(c && (sessionStorage.getItem('mcf-suivi-' + num) || (cli && c.client.id === cli.id))); } catch { autorise = !!(c && cli && c.client.id === cli.id); }
  if (c && autorise) {
    rendre(`<div class="conteneur merci">${fil([['Suivi de commande', '#/suivi'], [c.num]])}${detailCommande(c)}</div>`, `Suivi ${c.num}`);
    return;
  }
  const miennes = cli ? S.commandes().filter((x) => x.client.id === cli.id).slice(0, 5) : [];
  rendre(`<div class="conteneur merci">${fil([['Suivi de commande']])}
    <h1 class="page-titre" style="margin-bottom:0">Suivre une commande</h1>
    <form class="carte-blanche" id="form-suivi">
      <p class="muet">Saisissez le numéro reçu par e-mail et le code postal de livraison (ou l'e-mail de la commande).</p>
      <div class="grille-champs">
        <label class="champ"><span>N° de commande</span><input name="num" required placeholder="MCF-2026-10481" value="${esc(num || '')}"></label>
        <label class="champ"><span>Code postal ou e-mail</span><input name="verif" required placeholder="59100"></label>
      </div>
      <button class="btn btn-plein" type="submit">${ic('search')}Afficher le suivi</button>
      <p class="petit muet">Exemple : ${esc(S.commandes().find((x) => x.statut === 'expediee')?.num || '')} avec le code postal ${esc(S.commandes().find((x) => x.statut === 'expediee')?.livraison.cp || '')}.</p>
    </form>
    ${miennes.length ? `<section class="carte-blanche"><h2>Vos dernières commandes</h2><div class="tableau-scroll"><table class="tableau"><tbody>${miennes.map((x) => `<tr><td><strong>${esc(x.num)}</strong><br><small class="muet">${dateCourte(x.date)}</small></td><td>${S.statut(x.statut, x.livraison?.mode === 'retrait').nom}</td><td class="num">${eur(x.totaux.ttc)}</td><td class="num"><a class="btn btn-petit" href="#/suivi/${x.num}">Suivre</a></td></tr>`).join('')}</tbody></table></div></section>` : ''}
  </div>`, 'Suivi de commande');
  $('#form-suivi').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = e.target.num.value.trim().toUpperCase();
    const v = S.norm(e.target.verif.value).replace(/\s/g, '');
    const cmd = S.commande(n);
    if (!cmd || !(S.norm(cmd.livraison?.cp).replace(/\s/g, '') === v || S.norm(cmd.client.email) === v)) {
      toast('Aucune commande ne correspond à ce numéro et ce code postal.', 'erreur');
      return;
    }
    try { sessionStorage.setItem('mcf-suivi-' + n, '1'); } catch { /* rien */ }
    location.hash = `#/suivi/${n}`;
  });
}

/* ---------- Compte pro ---------- */
function vueCompte(onglet, params) {
  const c = S.clientConnecte();
  if (!c) return vueConnexion(params);
  onglet = onglet || 'tableau';
  const mes = S.commandes().filter((x) => x.client.id === c.id);
  const mesDevis = S.devis().filter((x) => x.client.id === c.id);
  const annee = mes.filter((x) => new Date(x.date).getFullYear() === new Date().getFullYear() && x.statut !== 'annulee').reduce((s, x) => s + x.totaux.ht, 0);
  const enCours = mes.filter((x) => !['livree', 'annulee'].includes(x.statut));
  const menu = [['tableau', 'chart', 'Tableau de bord'], ['commandes', 'box', 'Mes commandes'], ['devis', 'file', 'Mes devis'], ['favoris', 'heart', 'Favoris'], ['societe', 'user', 'Ma société']];
  const ligneCmd = (x) => `<tr><td><strong>${esc(x.num)}</strong><br><small class="muet">${dateCourte(x.date)}</small></td><td><span class="pastille ${x.statut === 'livree' ? 'p-vert' : x.statut === 'attente' ? 'p-jaune' : x.statut === 'annulee' ? 'p-rouge' : 'p-bleu'}">${S.statut(x.statut, x.livraison?.mode === 'retrait').court}</span></td><td class="num">${eur(x.totaux.ht)} HT</td><td class="num" style="white-space:nowrap"><a class="btn btn-petit" href="#/suivi/${x.num}">Suivre</a> <button class="btn btn-petit" type="button" data-recommander="${x.num}" title="Remettre ces articles au panier">${ic('repeat')}</button></td></tr>`;
  let contenu = '';
  if (onglet === 'tableau') {
    contenu = `<div class="kpis">
        <div class="kpi"><span>Commandes en cours</span><strong>${enCours.length}</strong></div>
        <div class="kpi"><span>Achats ${new Date().getFullYear()} HT</span><strong>${eur(annee)}</strong></div>
        <div class="kpi"><span>Remise client</span><strong>${c.statut === 'valide' && c.remise ? `−${c.remise} %` : '—'}</strong></div>
        <div class="kpi"><span>Paiement</span><strong style="font-size:17px">${c.statut === 'valide' && c.conditions === '30j' ? '30 jours fin de mois' : 'Comptant'}</strong></div>
      </div>
      ${c.statut !== 'valide' ? `<div class="info-bulle jaune">${ic('clock')}<span>Votre compte est <strong>en cours de validation</strong> par MC France (24 h ouvrées). Vous pouvez déjà commander au prix catalogue. <em>Démo : validez-le depuis l'<a href="admin/#/clients" target="_blank" rel="noopener"><strong>espace admin</strong></a>.</em></span></div>` : ''}
      <section class="carte-blanche"><div class="titre-section" style="margin:0"><h2>Dernières commandes</h2><a href="#/compte/commandes">Tout voir ${ic('arrow')}</a></div>
        ${mes.length ? `<div class="tableau-scroll"><table class="tableau"><tbody>${mes.slice(0, 4).map(ligneCmd).join('')}</tbody></table></div>` : '<p class="muet">Aucune commande pour l\'instant.</p>'}
      </section>
      <section class="carte-blanche"><h2>Raccourcis</h2><div class="gros-actions"><a class="btn" href="#/commande-rapide">${ic('zap')}Commande rapide</a><a class="btn" href="#/compte/devis">${ic('file')}Mes devis</a><a class="btn" href="#/compte/favoris">${ic('heart')}Mes favoris</a><a class="btn" href="tel:+33320775904">${ic('phone')}Appeler MC France</a></div></section>`;
  } else if (onglet === 'commandes') {
    contenu = `<section class="carte-blanche"><h2>Mes commandes</h2>${mes.length ? `<div class="tableau-scroll"><table class="tableau"><thead><tr><th>Commande</th><th>Statut</th><th class="num">Montant</th><th></th></tr></thead><tbody>${mes.map(ligneCmd).join('')}</tbody></table></div>` : '<p class="muet">Aucune commande pour l\'instant.</p>'}</section>`;
  } else if (onglet === 'devis') {
    contenu = `<section class="carte-blanche"><h2>Mes devis</h2>${mesDevis.length ? `<div class="tableau-scroll"><table class="tableau"><thead><tr><th>Devis</th><th>Statut</th><th class="num">Montant HT</th><th></th></tr></thead><tbody>${mesDevis.map((d) => `<tr><td><strong>${esc(d.num)}</strong><br><small class="muet">${dateCourte(d.date)} · valable jusqu'au ${dateCourte(d.validite)}</small></td><td><span class="pastille ${d.statut === 'converti' ? 'p-vert' : d.statut === 'envoye' ? 'p-bleu' : 'p-jaune'}">${{ demande: 'Demandé', envoye: 'Envoyé', converti: 'Commandé' }[d.statut] || d.statut}</span></td><td class="num">${eur(d.totaux.ht)}</td><td class="num"><a class="btn btn-petit" href="#/document/devis/${d.num}">Voir</a></td></tr>`).join('')}</tbody></table></div>` : '<p class="muet">Aucun devis. Depuis le panier, « Transformer en devis PDF » en crée un en un clic.</p>'}</section>`;
  } else if (onglet === 'favoris') {
    const favs = S.favoris().map(S.produit).filter((p) => p && p.enLigne !== false);
    contenu = favs.length ? `<div class="grille-produits">${favs.map(carte).join('')}</div>` : `<div class="vide">${ic('heart')}<h2>Aucun favori</h2><p class="muet">Touchez le cœur d'un produit pour le retrouver ici.</p></div>`;
  } else {
    contenu = `<section class="carte-blanche"><h2>Ma société</h2>
      <div class="specs"><div><table>
        <tr><td>Raison sociale</td><td>${esc(c.societe)}</td></tr><tr><td>Contact</td><td>${esc(c.contact)}</td></tr>
        <tr><td>E-mail</td><td>${esc(c.email)}</td></tr><tr><td>Téléphone</td><td>${esc(c.tel)}</td></tr>
        <tr><td>SIRET</td><td>${esc(c.siret)}</td></tr><tr><td>TVA</td><td>${esc(c.tva)}</td></tr>
      </table></div><div><table>
        <tr><td>Adresse</td><td>${esc(c.adresse || '—')}<br>${esc(c.cp || '')} ${esc(c.ville || '')}</td></tr>
        <tr><td>Statut</td><td>${c.statut === 'valide' ? 'Validé' : c.statut === 'refuse' ? 'Refusé' : 'En validation'}</td></tr>
        <tr><td>Conditions</td><td>${c.conditions === '30j' ? '30 jours fin de mois' : 'Comptant'}</td></tr>
        <tr><td>Remise client</td><td>${c.remise ? `${c.remise} %` : '—'}</td></tr>
      </table></div></div></section>`;
  }
  rendre(`<div class="conteneur">${fil([['Compte pro']])}<h1 class="page-titre">Bonjour ${esc((c.contact || '').split(' ')[0])}</h1>
    <div class="compte">
      <nav class="compte-menu" aria-label="Compte">
        <div class="compte-societe"><strong>${esc(c.societe)}</strong>${c.exemple ? '<span class="pastille p-gris">Compte d\'exemple</span>' : ''}</div>
        ${menu.map(([k, i, t]) => `<a href="#/compte/${k}" ${onglet === k ? 'aria-current="page"' : ''}>${ic(i)}${t}</a>`).join('')}
        <button type="button" data-deconnexion>${ic('logout')}Se déconnecter</button>
      </nav>
      <div style="display:grid;gap:16px">${contenu}</div>
    </div></div>`, 'Compte pro');
  $('[data-deconnexion]').addEventListener('click', () => { S.deconnecter(); location.hash = '#/compte'; toast('Vous êtes déconnecté.'); });
}
function vueConnexion(params) {
  const retour = params?.get('retour');
  rendre(`<div class="conteneur">${fil([['Compte pro']])}<h1 class="page-titre">Espace pro</h1>
    <div class="connexion">
      <section class="carte-blanche">
        <h2>Déjà client</h2>
        <form id="form-connexion" style="display:grid;gap:12px">
          <label class="champ"><span>E-mail</span><input name="email" type="email" required autocomplete="email" placeholder="vous@societe.fr"></label>
          <label class="champ"><span>Mot de passe</span><input name="mdp" type="password" autocomplete="current-password" placeholder="Dans la démo : laissez vide"></label>
          <button class="btn btn-sombre" type="submit">Se connecter</button>
        </form>
        <div class="info-bulle">${ic('info')}<span><strong>Démo :</strong> entrez dans le compte d'exemple « Snack Le Carré » (compte validé, remise −2 %, paiement à 30 jours).</span></div>
        <button class="btn btn-plein" type="button" data-demo>${ic('user')}Utiliser le compte d'exemple</button>
      </section>
      <section class="carte-blanche">
        <h2>Ouvrir un compte pro</h2>
        <ul class="avantages-pro">
          <li>${ic('check')}Prix HT et remises de quantité automatiques</li>
          <li>${ic('check')}Remise client et paiement à 30 jours fin de mois après validation</li>
          <li>${ic('check')}Devis PDF, commande rapide par référence, recommande en un clic</li>
          <li>${ic('check')}Suivi des commandes et factures au même endroit</li>
        </ul>
        <form id="form-inscription" style="display:grid;gap:14px" novalidate>
          <div class="grille-champs">
            <label class="champ"><span>Raison sociale *</span><input name="societe" required autocomplete="organization"></label>
            <label class="champ"><span>SIRET *</span><input name="siret" required inputmode="numeric" maxlength="17"><small id="aide-siret2">14 chiffres · le n° de TVA est calculé tout seul.</small></label>
            <label class="champ"><span>N° de TVA</span><input name="tva" placeholder="FR…"></label>
            <label class="champ"><span>Métier</span><select name="metier">${['Restaurant', 'Snack · fast-food', 'Pizzeria', 'Boulangerie', 'Boucherie', 'Bar · brasserie', 'Hôtel', 'Collectivité', 'Revendeur', 'Autre'].map((m) => `<option>${m}</option>`).join('')}</select></label>
            <label class="champ"><span>Nom du contact *</span><input name="contact" required autocomplete="name"></label>
            <label class="champ"><span>E-mail *</span><input name="email" type="email" required autocomplete="email"></label>
            <label class="champ"><span>Téléphone *</span><input name="tel" type="tel" required autocomplete="tel"></label>
            <label class="champ"><span>Adresse</span><input name="adresse" autocomplete="street-address"></label>
            <label class="champ"><span>Code postal</span><input name="cp" inputmode="numeric" autocomplete="postal-code"></label>
            <label class="champ"><span>Ville</span><input name="ville" autocomplete="address-level2"></label>
          </div>
          <button class="btn btn-plein btn-grand" type="submit">Créer mon compte pro</button>
          <p class="petit muet">Pour tester : SIRET ${S.siretFictif(42)} (fictif, clé valide).</p>
        </form>
      </section>
    </div></div>`, 'Espace pro');
  const apres = () => { location.hash = retour === 'commande' ? '#/commande' : '#/compte'; };
  $('[data-demo]').addEventListener('click', () => { S.connecter('demo'); toast(`${ic('check')} Connecté : Snack Le Carré`); apres(); });
  $('#form-connexion').addEventListener('submit', (e) => {
    e.preventDefault();
    const cl = S.clients().find((x) => S.norm(x.email) === S.norm(e.target.email.value));
    if (!cl) { toast('Aucun compte avec cet e-mail. Essayez demo@exemple.fr ou créez un compte.', 'erreur'); return; }
    S.connecter(cl.id); toast(`${ic('check')} Connecté : ${esc(cl.societe)}`); apres();
  });
  const fi = $('#form-inscription');
  fi.siret.addEventListener('input', () => {
    const v = fi.siret.value.replace(/\D/g, '');
    const aide = $('#aide-siret2');
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
    const cl = S.creerClient({ ...d, siret, tva: d.tva || S.tvaDepuisSiret(siret), pays: 'France' });
    S.connecter(cl.id);
    toast(`${ic('check')} Compte créé : en attente de validation par MC France`);
    apres();
  });
}

/* ---------- Commande rapide ---------- */
function vueRapide() {
  const exemples = S.produits().filter((p) => p.stock > 2 && p.etat === 'neuf');
  const ex = [exemples[3], exemples[20], exemples[45], exemples[70]].filter(Boolean).map((p, i) => `${p.ref} ${[2, 1, 4, 3][i]}`).join('\n');
  rendre(`<div class="conteneur">${fil([['Commande rapide']])}<h1 class="page-titre">Commande rapide</h1>
    <div class="rapide">
      <section class="carte-blanche">
        <h2>Collez votre liste de références</h2>
        <p class="muet">Une ligne par article : la référence, puis la quantité (espace, point-virgule ou tabulation). Un copier-coller depuis Excel fonctionne.</p>
        <label class="champ"><span class="sr">Liste</span><textarea id="liste-refs" spellcheck="false" placeholder="LG800BFB 2&#10;7950.5315 ; 1"></textarea></label>
        <div class="gros-actions">
          <button class="btn" type="button" id="ex-refs">Remplir avec un exemple</button>
          <label class="btn">${ic('upload')}Importer un CSV<input type="file" accept=".csv,.txt,text/csv,text/plain" id="fichier-refs" hidden></label>
        </div>
      </section>
      <section class="carte-blanche">
        <h2>Vérification</h2>
        <div id="rapide-res" class="rapide-res"><p class="muet">Les articles reconnus apparaissent ici, avec leur prix ${suff()} et le stock.</p></div>
      </section>
    </div></div>`, 'Commande rapide');
  const ta = $('#liste-refs');
  let reconnus = [];
  const analyser = () => {
    const lignes = ta.value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    reconnus = [];
    const rows = lignes.map((l) => {
      const parts = l.split(/[;\t,]|\s+/).map((x) => x.trim()).filter(Boolean);
      let qte = 1;
      if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) qte = parseInt(parts.pop(), 10);
      const ref = parts.join(' ');
      const p = S.produitParRef(ref) || S.produitParRef(parts[0] || '');
      if (p) reconnus.push({ id: p.id, qte });
      return p ? `<tr class="ok"><td>${ic('check')}</td><td>${esc(p.nom)}<br><small class="muet">Réf. ${esc(p.ref)} · ${p.stock > 0 ? `${p.stock} en stock` : 'sur commande'}</small></td><td class="num">${qte}</td><td class="num">${eur(aff(S.prixUnitaire(p, qte).unit * qte))}</td></tr>`
        : `<tr class="ko"><td>${ic('x')}</td><td>« ${esc(ref)} » introuvable</td><td class="num">${qte}</td><td></td></tr>`;
    });
    const t = S.calculer(reconnus);
    $('#rapide-res').innerHTML = rows.length ? `<div class="tableau-scroll"><table class="tableau"><tbody>${rows.join('')}</tbody></table></div>
      <div class="resume-l" style="margin-top:12px"><span>${reconnus.length} article${reconnus.length > 1 ? 's' : ''} reconnu${reconnus.length > 1 ? 's' : ''}</span><strong>${eur(aff(t.ht))} ${suff()}</strong></div>
      <button class="btn btn-plein btn-grand btn-bloc" type="button" id="rapide-ajouter" ${reconnus.length ? '' : 'disabled'} style="margin-top:12px">${ic('cart')}Tout ajouter au panier</button>`
      : `<p class="muet">Les articles reconnus apparaissent ici, avec leur prix ${suff()} et le stock.</p>`;
    $('#rapide-ajouter')?.addEventListener('click', () => {
      reconnus.forEach((r) => S.ajouter(r.id, r.qte));
      toast(`${ic('check')} ${reconnus.length} article${reconnus.length > 1 ? 's' : ''} ajouté${reconnus.length > 1 ? 's' : ''} <a href="#/panier">Voir le panier</a>`);
    });
  };
  ta.addEventListener('input', analyser);
  $('#ex-refs').addEventListener('click', () => { ta.value = ex; analyser(); });
  $('#fichier-refs').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    ta.value = (await f.text()).split(/\r?\n/).filter((l) => !/^r[ée]f/i.test(l)).join('\n');
    analyser();
  });
}

/* ---------- Documents ---------- */
function vueDocument(type, num) {
  const o = type === 'devis' ? S.devis().find((d) => d.num === num) : S.commande(num);
  if (!o) return vueIntrouvable();
  const html = documentCommercial(type, o);
  rendre(`<div class="conteneur" style="padding-bottom:40px">${fil([[type === 'devis' ? 'Devis' : 'Facture'], [num]])}
    <div class="gros-actions" style="margin:4px 0 16px"><button class="btn btn-plein" type="button" data-imprimer>${ic('print')}Imprimer / enregistrer en PDF</button>
      ${type === 'devis' ? `<button class="btn" type="button" data-devis-panier="${num}">${ic('cart')}Commander ce devis</button>` : `<a class="btn" href="#/suivi/${num}">${ic('truck')}Suivi</a>`}
      <a class="btn" href="#/compte/${type === 'devis' ? 'devis' : 'commandes'}">Mon compte</a></div>
    ${html}</div>`, `${type === 'devis' ? 'Devis' : 'Facture'} ${num}`);
  $('[data-imprimer]').addEventListener('click', () => imprimer(html));
  $('[data-devis-panier]')?.addEventListener('click', () => {
    o.lignes.forEach((l) => S.produit(l.id) && S.ajouter(l.id, l.qte));
    location.hash = '#/panier';
  });
}

/* ---------- Infos pratiques ---------- */
function vueInfos(page = 'livraison') {
  const r = S.reglages();
  const pages = {
    livraison: ['Livraison et retrait', `<p>Livraison offerte dès <strong>${eur(r.franco)} HT</strong> d'achat en France et en Belgique (hors Corse). Délai de 1 à 3 jours ouvrés pour le matériel en stock.</p>
      <ul><li>Sous le franco : forfait de ${eur(r.forfait)} HT.</li><li>Camion avec hayon et prise de rendez-vous : + ${eur(r.hayon)} HT, conseillé pour le matériel lourd (armoires, fours, chambres froides).</li><li>Retrait gratuit au showroom de Roubaix, prêt sous 24 à 48 h.</li></ul>
      <p class="petit muet">Forfaits indiqués à titre d'exemple : ils se règlent dans l'espace admin.</p>`],
    paiement: ['Paiement et 30 jours', '<p>Carte bancaire, virement, paiement en 4 fois sans frais, ou à 30 jours fin de mois pour les comptes pros validés.</p><ul><li>Les prix sont HT ; la TVA française s\'ajoute au moment de la commande.</li><li>Sociétés de l\'Union européenne avec n° de TVA valide : autoliquidation.</li><li>Location longue durée et financement : sur demande.</li></ul>'],
    garantie: ['Garantie et SAV', '<p>Garantie de 1 à 2 ans selon les marques, pièces et main-d\'œuvre. Le service après-vente de MC France intervient pour la réparation, l\'entretien et la maintenance.</p>'],
    retours: ['Retours', '<p>Un article ne convient pas ? Contactez MC France avant tout renvoi pour obtenir un accord de retour. <em>Texte d\'exemple : les conditions exactes sont à reprendre des CGV de MC France.</em></p>'],
    showroom: ['Le showroom', `<p><strong>MC France CHR</strong><br>139 rue des Arts, rez-de-chaussée<br>59100 Roubaix</p><p>Téléphone : <a href="tel:+33320775904">03 20 77 59 04</a> · <a href="tel:+33644898000">06 44 89 80 00</a></p><p>Venez voir le matériel en vrai, comparer les modèles et repartir avec votre commande.</p>`],
  };
  const [titre, corps] = pages[page] || pages.livraison;
  rendre(`<div class="conteneur">${fil([['Infos pratiques'], [titre]])}<h1 class="page-titre">${titre}</h1>
    <div class="infos">
      <nav class="compte-menu" aria-label="Infos pratiques">${Object.entries(pages).map(([k, [t]]) => `<a href="#/infos/${k}" ${k === page ? 'aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
      <div class="infos-texte">${corps}</div>
    </div></div>`, titre);
}

function vueIntrouvable() {
  rendre(`<div class="conteneur" style="padding:40px 16px"><div class="vide">${ic('search')}<h2>Page introuvable</h2><p class="muet">Ce produit ou cette page n'existe plus. Il a peut-être été retiré du catalogue.</p><a class="btn btn-plein" href="#/">Retour à l'accueil</a></div></div>`, 'Introuvable');
}

/* ---------- Routeur ---------- */
const ROUTES = [
  [/^$/, vueAccueil],
  [/^c\/([\w-]+)(?:\/([\w-]+))?$/, vueCategorie],
  [/^p\/([\w-]+)$/, vueProduit],
  [/^recherche\/(.+)$/, vueRecherche],
  [/^promos$/, vuePromos],
  [/^second-choix$/, vueSecondChoix],
  [/^metier\/([\w-]+)$/, vueMetier],
  [/^panier$/, vuePanier],
  [/^commande$/, vueCommande],
  [/^merci\/([\w-]+)$/, vueMerci],
  [/^suivi(?:\/([\w-]+))?$/, vueSuivi],
  [/^compte(?:\/(\w+))?$/, vueCompte],
  [/^commande-rapide$/, vueRapide],
  [/^document\/(devis|facture)\/([\w-]+)$/, vueDocument],
  [/^infos(?:\/([\w-]+))?$/, vueInfos],
];
let routePrecedente = null;
function router() {
  const brut = location.hash.replace(/^#\/?/, '');
  const [chemin, qs] = brut.split('?');
  const params = new URLSearchParams(qs || '');
  document.body.classList.remove('avec-barre');
  $('#suggestions').hidden = true;
  fermerTiroir();
  let trouve = false;
  for (const [re, f] of ROUTES) {
    const m = chemin.match(re);
    if (m) {
      const args = m.slice(1).map((x) => (x === undefined ? undefined : decodeURIComponent(x)));
      f(...args, params);
      trouve = true;
      break;
    }
  }
  if (!trouve) vueIntrouvable();
  if (routePrecedente !== chemin) {
    window.scrollTo(0, 0);
    if (routePrecedente !== null) vue.focus({ preventScroll: true });
  }
  routePrecedente = chemin;
}
function rerendre() {
  const y = window.scrollY;
  router();
  window.scrollTo(0, y);
}

/* ---------- Tiroir ---------- */
function ouvrirTiroir() { $('#tiroir-menu').hidden = false; document.body.style.overflow = 'hidden'; $('#tiroir-menu [data-fermer-tiroir].btn-icone').focus(); }
function fermerTiroir() { if (!$('#tiroir-menu').hidden) { $('#tiroir-menu').hidden = true; document.body.style.overflow = ''; } }

/* ---------- Événements globaux ---------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('button, a');
  if (!t) {
    if (!e.target.closest('#recherche')) $('#suggestions').hidden = true;
    return;
  }
  if (t.dataset.ajouter) {
    const zoneAchat = t.closest('[data-achat]');
    const q = zoneAchat ? Math.max(1, parseInt(zoneAchat.querySelector('input[name=qte]')?.value, 10) || 1) : 1;
    if (S.ajouter(t.dataset.ajouter, q)) {
      const b = $('#lien-panier');
      b.classList.remove('panier-saute'); void b.offsetWidth; b.classList.add('panier-saute');
      ouvrirVolant(t.dataset.ajouter);
    }
    return;
  }
  if (t.matches('[data-plus], [data-moins]')) {
    const inp = t.parentElement.querySelector('input');
    inp.value = Math.max(t.matches('[data-moins]') && inp.dataset.cle ? 0 : 1, Math.min(999, (parseInt(inp.value, 10) || 1) + (t.matches('[data-plus]') ? 1 : -1)));
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    if (inp.dataset.cle) inp.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (t.dataset.fav) {
    const ajoute = S.basculerFavori(t.dataset.fav);
    $$(`[data-fav="${CSS.escape(t.dataset.fav)}"]`).forEach((b) => {
      b.setAttribute('aria-pressed', ajoute);
      if (!b.classList.contains('carte-fav')) b.textContent = ajoute ? '♥ Dans mes favoris' : '♡ Ajouter aux favoris';
    });
    toast(ajoute ? `${ic('heart')} Ajouté aux favoris <a href="#/compte/favoris">Voir</a>` : 'Retiré des favoris');
    return;
  }
  if (t.dataset.recommander) {
    const c = S.commande(t.dataset.recommander);
    let n = 0;
    c?.lignes.forEach((l) => { if (S.produit(l.id)) { S.ajouter(l.id, l.qte); n++; } });
    toast(`${ic('repeat')} ${n} article${n > 1 ? 's' : ''} remis au panier <a href="#/panier">Voir le panier</a>`);
    return;
  }
  if (t.dataset.taxe) { taxe = t.dataset.taxe; pref('taxe', taxe); majEntete(); rerendre(); return; }
  if (t.hasAttribute('data-ouvrir-menu')) { ouvrirTiroir(); return; }
  if (t.hasAttribute('data-fermer-tiroir')) { fermerTiroir(); return; }
  if (t.hasAttribute('data-fermer-volant')) { fermerVolant(); return; }
  if (t.hasAttribute('data-fermer-ruban')) { $('#ruban-demo').hidden = true; try { sessionStorage.setItem('mcf-ruban', '1'); } catch { /* rien */ } return; }
  if (!t.closest('#recherche')) $('#suggestions').hidden = true;
});
document.addEventListener('click', (e) => {
  if (e.target.matches('.tiroir-voile')) fermerTiroir();
  if (e.target.matches('.volant-voile')) fermerVolant();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { fermerVolant(); fermerTiroir(); $('#suggestions').hidden = true; $('#filtres')?.classList.remove('ouvert'); }
});

const formRecherche = $('#recherche');
const q = $('#q');
q.addEventListener('input', () => suggestions(q.value));
q.addEventListener('focus', () => { if (q.value.trim().length > 1) suggestions(q.value); });
q.addEventListener('keydown', (e) => {
  const items = $$('#suggestions .sugg-prod');
  if (!items.length || $('#suggestions').hidden) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    suggActif = (suggActif + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items.forEach((x, i) => x.classList.toggle('actif', i === suggActif));
  } else if (e.key === 'Enter' && suggActif >= 0) {
    e.preventDefault();
    location.hash = items[suggActif].getAttribute('href');
  }
});
formRecherche.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = q.value.trim();
  if (!v) return;
  const exact = S.produitParRef(v);
  location.hash = exact ? `#/p/${exact.id}` : `#/recherche/${encodeURIComponent(v)}`;
  $('#suggestions').hidden = true;
  q.blur();
});

/* Changements venus de l'admin (autre onglet) ou du panier */
S.ecouter((cle, externe) => {
  if (['catalogue', 'reglages', 'reinit'].includes(cle) && externe) construireNavigation();
  majEntete();
  if (externe && !document.querySelector('dialog[open]') && !$('#form-commande')) rerendre();
  if (cle === 'erreur-stockage') toast('Le navigateur refuse d\'enregistrer (stockage plein ou navigation privée).', 'erreur');
});

/* ---------- Démarrage ---------- */
$$('[data-ic]').forEach((s) => { s.outerHTML = ic(s.dataset.ic); });
$('.entete-burger').innerHTML = ic('menu');
$('.recherche-btn').innerHTML = ic('search');
$$('.tiroir-tete [data-fermer-tiroir]').forEach((b) => { b.innerHTML = ic('x'); });
try { if (sessionStorage.getItem('mcf-ruban')) $('#ruban-demo').hidden = true; } catch { /* rien */ }
construireNavigation();
majEntete();
window.addEventListener('hashchange', router);
router();
