// Fiche produit : visuel, origine sur la carte, formats, spécifications, certifications, logistique.
import { boot, ready, reduced, href, esc } from './site.js';
import { track, readBasket, toggleBasket } from './store.js';
import { productVisual, icon } from './art.js';
import { productCard, bindAddButtons, visibleProducts, sectorOf, regionOf, dms } from './ui.js';
import { BOX, ALGERIA } from './geo.js';

const ctx = await boot('product');
const { content: C, i18n, gsap } = ctx;
const id = new URLSearchParams(location.search).get('id');
const p = visibleProducts(C).find((x) => x.id === id);
const prodEl = document.getElementById('prod');

if (!p) {
  prodEl.innerHTML = `<div class="wrap prod__missing"><h1 class="h1">${esc(i18n.ui('product.notFound'))}</h1><a class="btn btn--dark" href="${href('produits.html')}">${esc(i18n.ui('featured.all'))}${icon('arrow')}</a></div>`;
} else {
  const s = sectorOf(C, p.sector);
  const r = regionOf(C, p.region);
  const name = i18n.t(p.name);
  document.title = `${name} — Algerian Product`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.t(p.short) + ' ' + i18n.t(p.desc).slice(0, 110));
  track('product', { product: p.id });

  // Mini-carte de l'Algérie avec la région d'origine
  const KX = Math.cos((28 * Math.PI) / 180);
  const B = { w: -9.2, e: 12.4, s: 18.6, n: 37.6 };
  const VW = 300;
  const VH = Math.round((VW * (B.n - B.s)) / ((B.e - B.w) * KX));
  const px = (lon) => ((lon - B.w) / (B.e - B.w)) * VW;
  const py = (lat) => ((B.n - lat) / (B.n - B.s)) * VH;
  const dz = ALGERIA.map((ring) => ring.reduce((d, v, k) => (k % 2 ? d : d + `${k ? 'L' : 'M'}${px(ring[k]).toFixed(1)} ${py(ring[k + 1]).toFixed(1)}`), '') + 'Z').join('');
  const pin = r?.lat != null ? `<g transform="translate(${px(r.lon).toFixed(1)} ${py(r.lat).toFixed(1)})"><circle r="12" class="om__halo"/><circle r="4.5" class="om__dot"/></g>` : '';
  const map = `<svg class="om" viewBox="0 0 ${VW} ${VH}" aria-hidden="true"><path d="${dz}" class="om__dz"/>${pin}</svg>`;

  const inB = () => readBasket().includes(p.id);
  const addLabel = () => `${icon(inB() ? 'check' : 'plus')}<span>${esc(i18n.ui(inB() ? 'catalogue.added' : 'catalogue.add'))}</span>`;
  const wa = String(C.contact?.whatsapp || '').replace(/\D/g, '');
  const certs = (p.certs || []).map((c) => `<li>${icon('quality')}${esc(i18n.t(C.certs?.[c]) || c)}</li>`).join('');

  prodEl.innerHTML = `<div class="wrap">
    <nav class="crumbs" aria-label="Fil d’Ariane"><a href="${href('./')}">${esc(i18n.ui('nav.home'))}</a><span>/</span><a href="${href('produits.html')}">${esc(i18n.ui('nav.products'))}</a><span>/</span><a href="${href(`produits.html?sector=${p.sector}`)}">${esc(i18n.t(s?.name))}</a></nav>
    <div class="prod__grid">
      <div class="prod__visual">${productVisual(p, s, { cls: 'prod__pv' })}${p.image ? '' : `<span class="prod__tag">${esc(i18n.ui('product.illustration'))}</span>`}</div>
      <div class="prod__info">
        <p class="kicker">${esc(i18n.t(s?.name))}</p>
        <h1 class="prod__title">${esc(name)}</h1>
        <p class="prod__short">${esc(i18n.t(p.short))}</p>
        <div class="origin">
          ${map}
          <dl>
            <div><dt>${esc(i18n.ui('product.origin'))}</dt><dd>${esc(i18n.t(p.place))}</dd></div>
            <div><dt>${esc(i18n.ui('nav.regions'))}</dt><dd>${esc(i18n.t(r?.name))} · ${esc(i18n.ui('product.country'))}</dd></div>
            ${r?.lat != null ? `<div><dt>GPS</dt><dd dir="ltr">${dms(r.lat, 'N', 'S')} ${dms(r.lon, 'E', 'W')}</dd></div>` : ''}
          </dl>
        </div>
        <div class="prod__ctas">
          <button class="btn btn--dark" type="button" id="prod-add">${addLabel()}</button>
          <a class="btn btn--outline" href="${href(`devis.html?p=${encodeURIComponent(p.id)}`)}" id="prod-quote">${esc(i18n.ui('product.quoteNow'))}${icon('arrow')}</a>
          ${wa ? `<a class="btn btn--outline" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${encodeURIComponent(name)}">${icon('wa')}${esc(i18n.ui('product.whatsapp'))}</a>` : ''}
        </div>
      </div>
    </div>
    <div class="prod__sections">
      <section class="psec psec--desc" data-reveal><h2>${esc(i18n.ui('product.about'))}</h2><p class="prod__desc">${esc(i18n.t(p.desc))}</p></section>
      <section class="psec" data-reveal><h2>${esc(i18n.ui('product.formats'))}</h2><ul class="formats">${(p.formats || []).map((f, k) => `<li><span>${String(k + 1).padStart(2, '0')}</span>${esc(i18n.t(f.label))}</li>`).join('')}</ul></section>
      <section class="psec" data-reveal><h2>${esc(i18n.ui('product.specs'))}</h2><dl class="specs">${(p.specs || []).map((x) => `<div><dt>${esc(i18n.t(x.k))}</dt><dd>${esc(i18n.t(x.v))}</dd></div>`).join('')}</dl></section>
      <section class="psec" data-reveal><h2>${esc(i18n.ui('product.certs'))}</h2><ul class="certs">${certs}</ul><p class="psec__note">${esc(i18n.ui('product.certsNote'))}</p></section>
      <section class="psec" data-reveal><h2>${esc(i18n.ui('product.logistics'))}</h2><dl class="specs">
        <div><dt>${esc(i18n.ui('product.moq'))}</dt><dd>${esc(i18n.t(p.moq))}</dd></div>
        <div><dt>${esc(i18n.ui('product.leadtime'))}</dt><dd>${esc(i18n.t(p.leadtime))}</dd></div>
        <div><dt>${esc(i18n.ui('product.incoterms'))}</dt><dd dir="ltr">${esc((p.incoterms || []).join(' · '))}</dd></div>
        <div><dt>${esc(i18n.ui('product.hs'))}</dt><dd dir="ltr">${esc(p.hs || '—')}</dd></div>
      </dl></section>
    </div>
  </div>`;

  const addBtn = document.getElementById('prod-add');
  addBtn.addEventListener('click', () => {
    toggleBasket(p.id);
    if (inB()) track('basket', { product: p.id });
    addBtn.innerHTML = addLabel();
  });
  document.getElementById('prod-quote').addEventListener('click', () => track('cta', { name: 'quote-product', product: p.id }));

  // Données structurées pour les moteurs de recherche
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: i18n.t(p.desc),
    category: i18n.t(s?.name),
    countryOfOrigin: { '@type': 'Country', name: 'Algeria' },
    brand: { '@type': 'Brand', name: 'Algerian Product' },
    url: location.href.split('?')[0] + `?id=${p.id}`,
  });
  document.head.appendChild(ld);

  // Produits de la même filière
  const rel = visibleProducts(C).filter((x) => x.sector === p.sector && x.id !== p.id).slice(0, 4);
  const relEl = document.getElementById('related');
  if (rel.length) {
    relEl.innerHTML = `<div class="wrap"><div class="sec__head"><h2 class="h2">${esc(i18n.ui('product.related'))}</h2><a class="link-arrow" href="${href(`produits.html?sector=${p.sector}`)}">${esc(i18n.ui('sectors.explore'))}${icon('arrow')}</a></div><div class="cards">${rel.map((x) => productCard(x, ctx)).join('')}</div></div>`;
    bindAddButtons(relEl, ctx);
  } else relEl.remove();

  if (gsap && !reduced) {
    gsap.from('.prod__visual', { clipPath: 'inset(12% 12% 12% 12% round 24px)', duration: 1.4, ease: 'expo.out' });
    gsap.from('.prod__visual .pv__illus', { scale: 0.8, rotate: -6, duration: 1.6, ease: 'expo.out' });
    gsap.from('.prod__info > *', { y: 30, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.07, delay: 0.1 });
  }
}
ready(ctx);
