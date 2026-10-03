// Filières : noms, textes, couleur, motif, ordre et visibilité.
import { esc } from '../../store.js';
import { PATTERNS, patternSvg } from '../../art.js';
import { S, ml, field, bind, t, move } from '../ui.js';

export default function sectors(el) {
  const D = S.draft;
  function render() {
    el.innerHTML = `<p class="hint">Les filières structurent le catalogue et la section horizontale de l’accueil. Ajoutez-en une nouvelle quand la marque s’ouvre à un nouveau secteur.</p>
      <div class="cards2">${D.sectors
        .map(
          (s, i) => `<section class="card sector-card" data-i="${i}">
          <div class="sector-card__head" style="--sc:${esc(s.color)}">${patternSvg(s.pattern, 'sector-card__pat')}<b>${String(i + 1).padStart(2, '0')}</b><span>${esc(t(s.name))}</span>
            <div class="prow__a"><button type="button" class="ib" data-act="up">↑</button><button type="button" class="ib" data-act="down">↓</button></div></div>
          <div class="fgrid">
            ${ml(`sectors.${i}.name`, 'Nom', { wide: true })}
            ${ml(`sectors.${i}.desc`, 'Description', { textarea: true, wide: true })}
            <label class="f f--color"><span>Couleur</span><input type="color" data-path="sectors.${i}.color" value="${esc(s.color)}"></label>
            ${field(`sectors.${i}.pattern`, 'Motif', { options: Object.keys(PATTERNS).map((k) => [k, { palm: 'Palmes', star: 'Étoiles', weave: 'Losanges', tile: 'Carreaux', grid: 'Trame', arch: 'Arcs' }[k]]) })}
            ${field(`sectors.${i}.visible`, 'Visible sur le site', { type: 'checkbox' })}
            <p class="muted">${D.products.filter((p) => p.sector === s.id).length} produit(s)</p>
          </div></section>`
        )
        .join('')}</div>
      <button class="b b--primary" type="button" id="sadd">+ Ajouter une filière</button>`;
    bind(el, (input) => {
      if (input.dataset.path.endsWith('.pattern')) return render();
      const card = input.closest('[data-i]');
      const s = D.sectors[card.dataset.i];
      const head = card.querySelector('.sector-card__head');
      head.style.setProperty('--sc', s.color);
      head.querySelector('span').textContent = t(s.name);
    });
    el.querySelectorAll('[data-act]').forEach((b) =>
      b.addEventListener('click', () => {
        if (move(D.sectors, Number(b.closest('[data-i]').dataset.i), b.dataset.act === 'up' ? -1 : 1)) (S.onChange(), render());
      })
    );
    el.querySelector('#sadd').addEventListener('click', () => {
      const empty = Object.fromEntries(D.languages.map((l) => [l.code, '']));
      D.sectors.push({ id: `filiere-${Date.now().toString(36)}`, color: '#3c4f4a', pattern: 'star', name: { ...empty, fr: 'Nouvelle filière' }, desc: { ...empty }, visible: false, order: D.sectors.length });
      S.onChange();
      render();
    });
  }
  render();
}
