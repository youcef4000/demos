// Catalogue : filtres par filière, région et recherche, ajout à la demande de devis.
import { boot, ready, reduced, esc } from './site.js';
import { track } from './store.js';
import { productCard, bindAddButtons, visibleProducts, regionOf } from './ui.js';
import { icon } from './art.js';

const ctx = await boot('catalogue');
const { content: C, i18n, gsap } = ctx;
const $ = (s) => document.querySelector(s);
const products = visibleProducts(C);
const sectors = C.sectors.filter((s) => s.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const params = new URLSearchParams(location.search);
const state = { sector: params.get('sector') || 'all', region: params.get('region') || 'all', q: '' };

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const haystack = (p) => {
  const r = regionOf(C, p.region);
  const s = C.sectors.find((x) => x.id === p.sector);
  return norm([p.name, p.short, p.place, r?.name, s?.name].flatMap((f) => (f && typeof f === 'object' ? Object.values(f) : [f])).join(' '));
};
const index = new Map(products.map((p) => [p.id, haystack(p)]));

// Barre de filtres
$('#cat-chips').innerHTML = [{ id: 'all', name: null }, ...sectors]
  .map((s) => {
    const n = s.id === 'all' ? products.length : products.filter((p) => p.sector === s.id).length;
    return `<button type="button" class="chip" data-sector="${esc(s.id)}" aria-pressed="false" style="${s.color ? `--cc:${esc(s.color)}` : ''}">${s.color ? '<span class="chip__dot"></span>' : ''}${esc(s.id === 'all' ? i18n.ui('catalogue.all') : i18n.t(s.name))}<span class="chip__n">${n}</span></button>`;
  })
  .join('');
const usedRegions = [...new Set(products.map((p) => p.region))].map((id) => regionOf(C, id)).filter(Boolean);
usedRegions.sort((a, b) => i18n.t(a.name).localeCompare(i18n.t(b.name), i18n.lang));
$('#cat-region').innerHTML = `<option value="all">${esc(i18n.ui('catalogue.allRegions'))}</option>` + usedRegions.map((r) => `<option value="${esc(r.id)}">${esc(i18n.t(r.name))}</option>`).join('');
$('#cat-region').value = usedRegions.some((r) => r.id === state.region) ? state.region : 'all';

const grid = $('#cat-grid');
grid.innerHTML = products.map((p) => productCard(p, ctx)).join('');
bindAddButtons(grid, ctx);
const cards = [...grid.children];

function apply(animate = true) {
  const q = norm(state.q.trim());
  const Flip = window.Flip;
  const flipState = animate && gsap && Flip && !reduced ? Flip.getState(cards) : null;
  let n = 0;
  for (const el of cards) {
    const p = products.find((x) => x.id === el.dataset.id);
    const ok = (state.sector === 'all' || p.sector === state.sector) && (state.region === 'all' || p.region === state.region) && (!q || index.get(p.id).includes(q));
    el.hidden = !ok;
    if (ok) n++;
  }
  document.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sector === state.sector)));
  $('#cat-count').textContent = i18n.ui('catalogue.results', { n: i18n.num(n) });
  $('#cat-empty').hidden = n > 0;
  if (flipState) Flip.from(flipState, { duration: 0.7, ease: 'expo.out', absolute: true, scale: true, onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.6 }), onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.4 }) });
  const u = new URL(location.href);
  state.sector === 'all' ? u.searchParams.delete('sector') : u.searchParams.set('sector', state.sector);
  state.region === 'all' ? u.searchParams.delete('region') : u.searchParams.set('region', state.region);
  history.replaceState(null, '', u);
}

$('#cat-chips').addEventListener('click', (e) => {
  const b = e.target.closest('.chip');
  if (!b) return;
  state.sector = b.dataset.sector;
  track('filter', { sector: state.sector });
  apply();
});
$('#cat-region').addEventListener('change', (e) => {
  state.region = e.target.value;
  apply();
});
let t;
$('#cat-q').addEventListener('input', (e) => {
  clearTimeout(t);
  t = setTimeout(() => {
    state.q = e.target.value;
    apply(false);
    if (state.q.trim().length > 2) track('search', { q: state.q.trim().slice(0, 40) });
  }, 120);
});
apply(false);

if (gsap && !reduced) gsap.from(cards.filter((c) => !c.hidden), { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.04, delay: 0.15 });
document.querySelectorAll('.search [data-icon]').forEach((el) => (el.innerHTML = icon('search')));
ready(ctx);
