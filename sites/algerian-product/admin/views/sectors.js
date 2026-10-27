// Filières : noms, textes, couleur, motif, ordre et visibilité.
import { esc } from '../../store.js';
import { PATTERNS, patternSvg } from '../../art.js';
import { S, ml, field, bind, t, move, toast } from '../ui.js';

export default function sectors(el) {
  const D = S.draft;
  function render() {
    el.innerHTML = `<p class="hint">Les filières structurent le catalogue et la section horizontale de l’accueil. Ajoutez-en une nouvelle quand la marque s’ouvre à un nouveau secteur.</p>
      <div class="cards2">${D.sectors
        .map(
          (s, i) => `<section class="card sector-card" data-i="${i}">
          <div class="sector-card__head" style="--sc:${esc(s.color)}">${patternSvg(s.pattern, 'sector-card__pat')}<b>${String(i + 1).padStart(2, '0')}</b><span>${esc(t(s.name))}</span>
            <div class="prow__a"><button type="button" class="ib" data-act="up">↑</button><button type="button" class="ib" data-act="down">↓</button><button type="button" class="ib ib--del" data-del title="Supprimer la filière" aria-label="Supprimer la filière">✕</button></div></div>
          <div class="sector-del" hidden></div>
          <div class="fgrid">
            ${ml(`sectors.${i}.name`, 'Nom', { wide: true })}
            ${ml(`sectors.${i}.desc`, 'Description', { textarea: true, wide: true })}
            <label class="f f--color"><span>Couleur</span><input type="color" data-path="sectors.${i}.color" value="${esc(s.color)}"></label>
            ${field(`sectors.${i}.pattern`, 'Motif', { options: Object.keys(PATTERNS).map((k) => [k, { palm: 'Palmes', star: 'Étoiles', weave: 'Losanges', tile: 'Carreaux', grid: 'Trame', arch: 'Arcs' }[k]]) })}
            ${field(`sectors.${i}.photo`, 'Photo de fond (URL)', { type: 'url', wide: true })}
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
    el.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => askDelete(Number(b.closest('[data-i]').dataset.i))));
    el.querySelector('#sadd').addEventListener('click', () => {
      const empty = Object.fromEntries(D.languages.map((l) => [l.code, '']));
      D.sectors.push({ id: `filiere-${Date.now().toString(36)}`, color: '#3c4f4a', pattern: 'star', name: { ...empty, fr: 'Nouvelle filière' }, desc: { ...empty }, visible: false, order: D.sectors.length });
      S.onChange();
      render();
    });
  }
  // Suppression : confirmation dans la carte ; les produits de la filière sont déplacés (ou masqués)
  function askDelete(i) {
    const s = D.sectors[i];
    if (D.sectors.length < 2) return toast('Gardez au moins une filière.', 'err');
    const card = el.querySelector(`[data-i="${i}"]`);
    const box = card.querySelector('.sector-del');
    const list = D.products.filter((p) => p.sector === s.id);
    const others = D.sectors.filter((x) => x.id !== s.id);
    box.innerHTML = `<p><b>Supprimer « ${esc(t(s.name)) || 'Sans nom'} » ?</b> ${
      list.length ? `Elle contient ${list.length} produit(s).` : 'Elle ne contient aucun produit.'
    }</p>
      ${list.length ? `<label class="f"><span>Que faire de ces produits ?</span><select data-to>${others.map((x) => `<option value="${esc(x.id)}">Les déplacer vers « ${esc(t(x.name))} »</option>`).join('')}<option value="">Les masquer du site (à reclasser plus tard)</option></select></label>` : ''}
      <div class="sector-del__a"><button type="button" class="b b--danger" data-yes>Supprimer définitivement</button><button type="button" class="b b--ghost" data-no>Annuler</button></div>`;
    box.hidden = false;
    box.querySelector('[data-no]').addEventListener('click', () => ((box.hidden = true), (box.innerHTML = '')));
    box.querySelector('[data-yes]').addEventListener('click', () => {
      const to = box.querySelector('[data-to]')?.value ?? '';
      for (const p of list) {
        if (to) p.sector = to;
        else (p.sector = others[0].id), (p.visible = false);
      }
      D.sectors.splice(i, 1);
      D.sectors.forEach((x, k) => (x.order = k));
      S.onChange();
      render();
      toast(list.length ? `Filière supprimée, ${list.length} produit(s) ${to ? 'déplacé(s)' : 'masqué(s)'}.` : 'Filière supprimée.');
    });
    box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  render();
}
