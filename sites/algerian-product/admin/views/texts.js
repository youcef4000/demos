// Textes du site : chaque phrase de l'interface et des pages, groupée par section, dans chaque langue.
import { esc } from '../../store.js';
import { S, ml, bind } from '../ui.js';

const GROUPS = {
  nav: 'Menu et en-tête', common: 'Commun', film: 'Film d’introduction', home: 'Accueil — ouverture', about: 'La maison (vision, mission…)',
  sectors: 'Filières', seal: 'Identité / sceau', featured: 'Sélection', atlas: 'Atlas des régions', markets: 'Marchés',
  services: 'Export & services', audience: 'Pour qui', producers: 'Producteurs', cta: 'Appel final', footer: 'Pied de page',
  catalogue: 'Catalogue', product: 'Fiche produit', basket: 'Liste de devis', quote: 'Formulaire de devis', producer: 'Candidature producteur', contact: 'Contact',
};

export default function texts(el) {
  const D = S.draft;
  let q = '';
  let missing = new URLSearchParams(location.hash.split('?')[1] || '').get('missing') === '1';
  let group = 'film';
  function render() {
    const keys = Object.keys(D.text);
    const groups = Object.keys(GROUPS).filter((g) => keys.some((k) => k.startsWith(g + '.')));
    const isMissing = (k) => !D.text[k]?.[S.lang];
    let shown = keys.filter((k) => (q ? (k + JSON.stringify(D.text[k])).toLowerCase().includes(q.toLowerCase()) : k.startsWith(group + '.')));
    if (missing) shown = (q ? shown : keys).filter(isMissing);
    const nMissing = keys.filter(isMissing).length;
    el.innerHTML = `
      <div class="bar">
        <input class="bar__search" type="search" id="tq" placeholder="Rechercher un texte, dans toutes les sections" value="${esc(q)}">
        <label class="sw"><input type="checkbox" id="tmiss" ${missing ? 'checked' : ''}><span class="sw__ui"></span><span>Seulement les textes à traduire en ${S.lang.toUpperCase()} (${nMissing})</span></label>
      </div>
      <p class="hint">Astuce : <code>*mot*</code> met un mot en valeur (italique doré ou vert selon la section). Un texte vide affiche la langue par défaut.</p>
      <div class="texts">
        <nav class="texts__nav">${groups.map((g) => `<button type="button" data-g="${g}" aria-pressed="${!q && !missing && g === group}">${GROUPS[g]}<small>${keys.filter((k) => k.startsWith(g + '.')).length}</small></button>`).join('')}
          <button type="button" data-g="__values" aria-pressed="${group === '__values'}">Valeurs</button><button type="button" data-g="__services" aria-pressed="${group === '__services'}">Étapes de l’export</button></nav>
        <div class="texts__list card">${
          group === '__values' && !q && !missing
            ? D.values.map((v, i) => `<div class="fgrid">${ml(`values.${i}.title`, `Valeur ${i + 1} — titre`)}${ml(`values.${i}.text`, 'Texte', { textarea: true, rows: 2, wide: true })}</div>`).join('<hr>')
            : group === '__services' && !q && !missing
              ? D.services.map((v, i) => `<div class="fgrid">${ml(`services.${i}.title`, `Étape ${i + 1} — titre`)}${ml(`services.${i}.text`, 'Texte', { textarea: true, rows: 2, wide: true })}</div>`).join('<hr>')
              : shown.map((k) => ml(`text.${k.replaceAll('.', '~')}`, k, { textarea: (D.text[k]?.fr || '').length > 70, rows: 3, wide: true })).join('') || '<p class="muted">Tout est traduit ici.</p>'
        }</div>
      </div>`;
    bind(el);
    el.querySelector('#tq').addEventListener('input', (e) => {
      q = e.target.value;
      clearTimeout(render.t);
      render.t = setTimeout(() => {
        render();
        const i = el.querySelector('#tq');
        i.focus();
        i.setSelectionRange(q.length, q.length);
      }, 250);
    });
    el.querySelector('#tmiss').addEventListener('change', (e) => ((missing = e.target.checked), render()));
    el.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => ((group = b.dataset.g), (q = ''), (missing = false), render())));
  }
  render();
}
