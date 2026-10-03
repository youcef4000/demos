// Composants partagés : carte produit, bouton « ajouter au devis »
import { esc, readBasket, toggleBasket, track } from './store.js';
import { productVisual, icon } from './art.js';
import { href } from './site.js';

export const sectorOf = (c, id) => c.sectors.find((s) => s.id === id);
export const regionOf = (c, id) => c.regions.find((r) => r.id === id);
export const visibleProducts = (c) => c.products.filter((p) => p.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
export const productUrl = (p) => href(`produit.html?id=${encodeURIComponent(p.id)}`);

export function productCard(p, { content, i18n }, { lazy = true } = {}) {
  const s = sectorOf(content, p.sector);
  const r = regionOf(content, p.region);
  const inBasket = readBasket().includes(p.id);
  return `<article class="card" data-id="${esc(p.id)}" data-sector="${esc(p.sector)}" style="--pc:${esc(p.color || s?.color)}">
    <a class="card__link" href="${productUrl(p)}">
      <div class="card__visual">${productVisual(p, s, { cls: 'card__pv' })}<span class="card__view">${esc(i18n.ui('catalogue.view'))}${icon('arrow')}</span></div>
      <div class="card__body">
        <p class="card__meta"><span>${esc(i18n.t(s?.name))}</span><span>${icon('pin')}${esc(i18n.t(r?.name))}</span></p>
        <h3 class="card__title">${esc(i18n.t(p.name))}</h3>
        <p class="card__short">${esc(i18n.t(p.short))}</p>
      </div>
    </a>
    <button class="card__add${inBasket ? ' is-in' : ''}" type="button" data-add="${esc(p.id)}" aria-pressed="${inBasket}">
      ${icon(inBasket ? 'check' : 'plus')}<span>${esc(i18n.ui(inBasket ? 'catalogue.added' : 'catalogue.add'))}</span>
    </button>
  </article>`;
}

export function bindAddButtons(root, { i18n }) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    e.preventDefault();
    const id = b.dataset.add;
    const list = toggleBasket(id);
    const on = list.includes(id);
    if (on) track('basket', { product: id });
    root.querySelectorAll(`[data-add="${CSS.escape(id)}"]`).forEach((x) => {
      x.classList.toggle('is-in', on);
      x.setAttribute('aria-pressed', String(on));
      x.innerHTML = `${icon(on ? 'check' : 'plus')}<span>${esc(i18n.ui(on ? 'catalogue.added' : 'catalogue.add'))}</span>`;
    });
  });
}

// Coordonnées lisibles : 36°43′N 4°03′E
export function dms(v, pos, neg) {
  const a = Math.abs(v);
  const d = Math.floor(a);
  const m = Math.round((a - d) * 60);
  return `${d}°${String(m === 60 ? 59 : m).padStart(2, '0')}′${v >= 0 ? pos : neg}`;
}
