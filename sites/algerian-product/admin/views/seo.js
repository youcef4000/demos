// SEO & partage : titre et description de chaque page dans chaque langue, aperçus Google et réseaux.
import { esc } from '../../store.js';
import { S, ml, bind, t } from '../ui.js';

const PAGES = [['home', 'Accueil', ''], ['about', 'La maison', 'maison.html'], ['regions', 'Régions', 'regions.html'], ['markets', 'Marchés', 'marches.html'], ['services', 'Export & services', 'services.html'], ['catalogue', 'Catalogue', 'produits.html'], ['quote', 'Demande de devis', 'devis.html']];
const CHECKS = [
  ['Une adresse par langue (?lang=fr, ?lang=en…) et balises hreflang', true],
  ['Titre, description et image de partage (Open Graph) sur chaque page', true],
  ['Données structurées « Product » sur chaque fiche produit', true],
  ['Site rapide : aucune dépendance lourde, images compressées, relief calculé dans le navigateur', true],
  ['Lisible sur téléphone (la majorité des visites viennent des réseaux)', true],
  ['Plan du site (sitemap.xml) et Google Search Console', false, 'à la mise en ligne'],
  ['Pages pré-générées par langue (/fr/, /en/…) pour un référencement maximal', false, 'version production'],
];

export default function seo(el) {
  const D = S.draft;
  const url = (path) => `algerianproduct.com/${path}${S.lang !== D.defaultLang ? `${path.includes('?') ? '&' : '?'}lang=${S.lang}` : ''}`;
  function previews(key, path) {
    const s = D.seo[key];
    return `<div class="serp"><p class="serp__url">${esc(url(path))}</p><p class="serp__t">${esc(t(s.title))}</p><p class="serp__d">${esc(t(s.description).slice(0, 160))}${t(s.description).length > 160 ? '…' : ''}</p></div>
      <div class="og"><div class="og__img"><img src="../img/og.jpg" alt=""></div><div class="og__b"><small>${esc(url(path).split('/')[0].toUpperCase())}</small><b>${esc(t(s.title))}</b><p>${esc(t(s.description))}</p></div></div>`;
  }
  el.innerHTML = `<p class="hint">Ce que Google et les réseaux (LinkedIn, WhatsApp, Instagram) affichent quand quelqu’un partage le lien. Langue éditée : <b>${S.lang.toUpperCase()}</b>. Les fiches produits utilisent automatiquement le nom et l’accroche du produit.</p>
    ${PAGES.map(([k, l, path]) => `<section class="card seo" data-k="${k}"><header><h3>${l}</h3></header><div class="seo__grid"><div class="fgrid">${ml(`seo.${k}.title`, 'Titre', { wide: true, max: 60 })}${ml(`seo.${k}.description`, 'Description', { textarea: true, rows: 3, wide: true, max: 155 })}</div><div class="seo__prev" data-prev="${k}">${previews(k, path)}</div></div></section>`).join('')}
    <section class="card"><header><h3>Référencement technique</h3></header><ul class="checklist">${CHECKS.map(([l, ok, note]) => `<li class="${ok ? 'is-ok' : ''}"><span>${ok ? '✓' : '○'}</span>${esc(l)}${note ? ` <small>${esc(note)}</small>` : ''}</li>`).join('')}</ul></section>`;
  bind(el, (input) => {
    const k = input.closest('[data-k]').dataset.k;
    el.querySelector(`[data-prev="${k}"]`).innerHTML = previews(k, PAGES.find((p) => p[0] === k)[2]);
  });
}
