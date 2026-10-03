// Socle commun des pages : contenu, langue, en-tête, pied de page, défilement doux, apparitions,
// liste de devis et mesure d'audience.
import { loadContent, track, visitContext, readBasket, esc } from './store.js';
import { resolveLang, createI18n, applyDom, setDocumentLang, switchLang } from './i18n.js';
import { emblem, icon } from './art.js';

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const preview = new URLSearchParams(location.search).get('preview') === '1';

// Garde ?preview=1 sur les liens internes pendant l'aperçu depuis l'admin
export const href = (url) => {
  if (!preview) return url;
  const [path, hash] = url.split('#');
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}preview=1${hash ? '#' + hash : ''}`;
};

function fillIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    if (!el.firstElementChild) el.innerHTML = icon(el.dataset.icon);
  });
}

function renderHeader(c, i18n, page) {
  const hdr = document.getElementById('hdr');
  if (!hdr) return;
  const home = page === 'home' ? '' : './';
  const nav = [
    ['produits.html', 'nav.products', page === 'catalogue' || page === 'product'],
    [`${home}#regions`, 'nav.regions'],
    [`${home}#marches`, 'nav.markets'],
    [`${home}#services`, 'nav.services'],
    [`${home}#maison`, 'nav.about'],
  ];
  const langs = i18n.languages;
  const langItems = langs
    .map((l) => `<li><button type="button" role="option" lang="${esc(l.code)}" data-lang="${esc(l.code)}" aria-selected="${l.code === i18n.lang}">${esc(l.name)}<span>${esc(l.code.toUpperCase())}</span></button></li>`)
    .join('');
  hdr.innerHTML = `<div class="hdr__inner">
    <a class="brand" href="${href('./')}" aria-label="Algerian Product — ${esc(i18n.ui('nav.home'))}">${emblem('brand__mark')}<span class="brand__word">Algerian<span>Product</span></span></a>
    <nav class="hdr__nav" aria-label="Navigation">${nav
      .map(([u, k, cur]) => `<a href="${href(u)}"${cur ? ' aria-current="page"' : ''}>${esc(i18n.ui(k))}</a>`)
      .join('')}</nav>
    <div class="hdr__actions">
      <div class="lang">
        <button class="lang__btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(i18n.ui('nav.lang'))}">${icon('globe')}<span>${esc(i18n.lang.toUpperCase())}</span></button>
        <ul class="lang__menu" role="listbox" hidden>${langItems}</ul>
      </div>
      <a class="btn btn--sm btn--light hdr__cta" href="${href('devis.html')}">${esc(i18n.ui('nav.quote'))}</a>
      <button class="hdr__burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="${esc(i18n.ui('nav.menu'))}">${icon('menu')}</button>
    </div>
  </div>
  <div class="menu" id="menu" hidden>
    <nav class="menu__nav">${nav
      .map(([u, k], i) => `<a href="${href(u)}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(i18n.ui(k))}</a>`)
      .join('')}<a href="${href('devis.html')}"><span>06</span>${esc(i18n.ui('nav.quote'))}</a></nav>
    <div class="menu__langs">${langs
      .map((l) => `<button type="button" data-lang="${esc(l.code)}" lang="${esc(l.code)}" aria-pressed="${l.code === i18n.lang}">${esc(l.name)}</button>`)
      .join('')}</div>
  </div>`;

  hdr.querySelectorAll('[data-lang]').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.lang !== i18n.lang) switchLang(b.dataset.lang);
    })
  );
  const lb = hdr.querySelector('.lang__btn');
  const lm = hdr.querySelector('.lang__menu');
  const closeLang = () => {
    lm.hidden = true;
    lb.setAttribute('aria-expanded', 'false');
  };
  lb.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = lm.hidden;
    lm.hidden = !open;
    lb.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', closeLang);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && (closeLang(), closeMenu()));

  const burger = hdr.querySelector('.hdr__burger');
  const menu = hdr.querySelector('#menu');
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = icon('menu');
    document.documentElement.classList.remove('menu-open');
  }
  burger.addEventListener('click', () => {
    const open = menu.hidden;
    if (!open) return closeMenu();
    menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.innerHTML = icon('close');
    document.documentElement.classList.add('menu-open');
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  // Fond de l'en-tête après le haut de page ; texte sombre sur les sections claires
  const onScroll = () => hdr.classList.toggle('hdr--solid', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const light = [...document.querySelectorAll('.sec--paper, [data-hdr="light"], .page-light main')];
  if (light.length && 'IntersectionObserver' in window) {
    const state = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) state.set(e.target, e.isIntersecting);
        hdr.classList.toggle('hdr--dark', [...state.values()].some(Boolean));
      },
      { rootMargin: '0px 0px -94% 0px' }
    );
    light.forEach((s) => io.observe(s));
  }
}

function renderFooter(c, i18n) {
  const f = document.getElementById('ftr');
  if (!f) return;
  const ct = c.contact || {};
  const socials = Object.entries(ct.socials || {}).filter(([, u]) => u);
  const wa = String(ct.whatsapp || '').replace(/\D/g, '');
  f.innerHTML = `<div class="wrap ftr__grid">
    <div class="ftr__brand">
      <a class="brand brand--lg" href="${href('./')}">${emblem('brand__mark')}<span class="brand__word">Algerian<span>Product</span></span></a>
      <p>${esc(i18n.ui('footer.tagline'))}</p>
    </div>
    <div class="ftr__col">
      <h3>${esc(i18n.ui('footer.explore'))}</h3>
      <a href="${href('produits.html')}">${esc(i18n.ui('nav.products'))}</a>
      <a href="${href('./#regions')}">${esc(i18n.ui('nav.regions'))}</a>
      <a href="${href('./#marches')}">${esc(i18n.ui('nav.markets'))}</a>
      <a href="${href('./#services')}">${esc(i18n.ui('nav.services'))}</a>
      <a href="${href('devis.html')}">${esc(i18n.ui('nav.quote'))}</a>
    </div>
    <div class="ftr__col">
      <h3>${esc(i18n.ui('footer.contact'))}</h3>
      ${ct.email ? `<a href="mailto:${esc(ct.email)}">${icon('mail')}${esc(ct.email)}</a>` : ''}
      ${wa ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>` : ''}
      ${ct.phone ? `<a href="tel:${esc(ct.phone.replace(/\s/g, ''))}">${icon('phone')}${esc(ct.phone)}</a>` : ''}
      ${ct.office ? `<p>${icon('pin')}${esc(i18n.t(ct.office))}</p>` : ''}
      <a href="${href('devis.html#contact')}">${esc(i18n.ui('quote.tabContact'))}</a>
    </div>
    <div class="ftr__col">
      <h3>${esc(i18n.ui('nav.lang'))}</h3>
      ${i18n.languages.map((l) => `<button type="button" data-lang="${esc(l.code)}" lang="${esc(l.code)}"${l.code === i18n.lang ? ' aria-current="true"' : ''}>${esc(l.name)}</button>`).join('')}
      ${socials.length ? `<h3 class="ftr__h-follow">${esc(i18n.ui('footer.follow'))}</h3><div class="ftr__socials">${socials.map(([k, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener" aria-label="${esc(k)}">${icon(k)}</a>`).join('')}</div>` : ''}
    </div>
  </div>
  <div class="wrap ftr__bottom">
    <p>${esc(i18n.ui('footer.demo'))}</p>
    <p><span>© ${new Date().getFullYear()} Algerian Product</span> · <a href="admin/">${esc(i18n.ui('footer.admin'))}</a></p>
  </div>`;
  f.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => b.dataset.lang !== i18n.lang && switchLang(b.dataset.lang)));
}

export function updateBasket(i18n) {
  const el = document.getElementById('basket');
  if (!el) return;
  const n = readBasket().length;
  el.hidden = n === 0;
  el.href = href('devis.html');
  el.innerHTML = `<span class="basket__n">${n}</span><span class="basket__t">${esc(i18n.ui('basket.title'))}</span>${icon('arrow')}`;
  el.setAttribute('aria-label', i18n.ui('basket.count', { n }));
}

function previewBanner(source) {
  if (!preview) return;
  const b = document.createElement('div');
  b.className = 'preview-banner';
  b.textContent = source === 'draft' ? 'Aperçu du brouillon — pas encore publié' : 'Aperçu';
  document.body.appendChild(b);
}

// Apparitions au défilement (titres ligne à ligne, blocs en fondu)
export function reveals(gsap, ST, root = document) {
  if (!gsap || reduced) return;
  root.querySelectorAll('[data-split]').forEach((el) => {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    let targets = [el];
    if (window.SplitText) {
      try {
        const st = new window.SplitText(el, { type: 'lines', linesClass: 'line' });
        targets = st.lines;
        st.lines.forEach((l) => {
          const w = document.createElement('span');
          w.className = 'line-mask';
          l.parentNode.insertBefore(w, l);
          w.appendChild(l);
        });
      } catch {}
    }
    gsap.from(targets, { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 86%' } });
  });
  root.querySelectorAll('[data-reveal]').forEach((el) => {
    if (el.dataset.revealDone) return;
    el.dataset.revealDone = '1';
    gsap.from(el, { y: 28, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
}

export async function boot(page) {
  const { content, source } = await loadContent({ preview });
  const lang = resolveLang(content);
  const i18n = createI18n(content, lang);
  setDocumentLang(i18n);
  if (i18n.dir === 'rtl' && !document.querySelector('link[href*="Noto+Kufi"]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400..700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap';
    document.head.appendChild(l);
  }
  const seo = content.seo?.[page];
  if (seo) {
    document.title = i18n.t(seo.title);
    document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.t(seo.description));
  }
  renderHeader(content, i18n, page);
  renderFooter(content, i18n);
  applyDom(i18n);
  fillIcons();
  document.querySelectorAll('[data-link]').forEach((a) => (a.href = href(a.dataset.link)));
  updateBasket(i18n);
  addEventListener('ap:basket', () => updateBasket(i18n));
  previewBanner(source);
  if (!preview) track('view', { page, lang, ...visitContext() });

  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  let lenis = null;
  if (gsap && ST) {
    gsap.registerPlugin(ST);
    if (window.SplitText) gsap.registerPlugin(window.SplitText);
    if (window.Lenis && !reduced) {
      lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on('scroll', ST.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href*="#"]').forEach((a) =>
        a.addEventListener('click', (e) => {
          const url = new URL(a.href, location.href);
          if (url.pathname !== location.pathname || !url.hash) return;
          const t = document.querySelector(url.hash);
          if (!t) return;
          e.preventDefault();
          lenis.scrollTo(t, { offset: 0, duration: 1.4 });
          history.replaceState(null, '', url.hash);
        })
      );
    }
  }
  return { content, i18n, lang, gsap, ST, lenis, page, fillIcons, href };
}

export function ready(ctx) {
  document.documentElement.classList.add('booted');
  document.body.classList.remove('is-loading');
  if (ctx.gsap && ctx.ST) {
    reveals(ctx.gsap, ctx.ST);
    // Les polices changent la hauteur des titres : on recalcule une fois chargées
    document.fonts?.ready.then(() => ctx.ST.refresh());
  }
  if (location.hash) {
    const t = document.querySelector(location.hash);
    if (t) setTimeout(() => (ctx.lenis ? ctx.lenis.scrollTo(t, { immediate: true }) : t.scrollIntoView()), 60);
  }
}

export { esc, fillIcons };
