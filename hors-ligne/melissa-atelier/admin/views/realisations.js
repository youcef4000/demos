// Réalisations : tout ce qui est sorti de l'atelier, et ce qui est affiché sur le site.
import { S, esc, icon, head, btn, commit, log, openSheet, field, group, input, colorChoice, colorsFrom, photoField, bindPhoto, uid, num, src, dots, tile, fmtNum, toggle, season, empty, toast } from '../ui.js';
import { iso, today, parseISO } from '../../store.js';

let filter = 'all';

const month = (d) => parseISO(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

export function render(root) {
  const all = S.data.realisations.slice().sort((a, b) => b.date.localeCompare(a.date));
  const cols = [...new Set(all.map((r) => r.collection).filter(Boolean))];
  if (filter !== 'all' && !cols.includes(filter)) filter = 'all';
  const list = filter === 'all' ? all : all.filter((r) => r.collection === filter);
  const onSite = all.filter((r) => r.vitrine && r.img).length;
  root.innerHTML = `
    ${head({ kicker: 'Création', title: 'Réalisations', sub: "Tout ce qui est sorti de l'atelier. Un interrupteur suffit pour l'afficher sur le site.", actions: `<a class="b b--ghost" href="../#collection" target="_blank" rel="noopener">${icon('ext')}<span>Voir sur le site</span></a>${btn('Ajouter', { act: 'new', ic: 'plus' })}` })}
    <section class="tiles tiles--3">
      ${tile('Modèles réalisés', all.length)}
      ${tile('Pièces produites', fmtNum(all.reduce((a, r) => a + Number(r.qty || 0), 0)))}
      ${tile('Affichés sur le site', onSite, `sur ${all.length}`)}
    </section>
    <div class="filters" role="group" aria-label="Collection">
      <button type="button" class="fchip" data-f="all" aria-pressed="${filter === 'all'}">Toutes <b>${all.length}</b></button>
      ${cols.map((c) => `<button type="button" class="fchip" data-f="${esc(c)}" aria-pressed="${filter === c}">${esc(c)} <b>${all.filter((r) => r.collection === c).length}</b></button>`).join('')}
    </div>
    <div class="looks">${
      list
        .map(
          (r, i) => `<article class="look" data-id="${esc(r.id)}" style="--i:${i}">
        <button type="button" class="look__media" data-act="edit" aria-label="Modifier ${esc(r.name)}">${r.img ? `<img src="${esc(src(r.img))}" alt="" loading="lazy">` : `<span class="look__ph">${icon('image')}<small>Ajouter une photo</small></span>`}${r.vitrine && r.img ? `<span class="look__live">${icon('eye')}Sur le site</span>` : ''}</button>
        <div class="look__body">
          <p class="look__meta">${esc(r.collection || '')} · ${esc(month(r.date))}</p>
          <h2>${esc(r.name)}</h2>
          <p class="look__row">${dots(r.colors)}<span>${fmtNum(r.qty)} pièces</span></p>
          ${toggleRow(r)}
        </div>
      </article>`,
        )
        .join('') || empty('Aucune réalisation dans cette collection.')
    }</div>`;

  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-f]');
    if (f) {
      filter = f.dataset.f;
      return S.render();
    }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'new') return editLook();
    const r = S.data.realisations.find((x) => x.id === a.closest('[data-id]')?.dataset.id);
    if (r && a.dataset.act === 'edit') editLook(r);
  });
  root.addEventListener('change', (e) => {
    const sw = e.target.closest('[data-vitrine]');
    if (!sw) return;
    const r = S.data.realisations.find((x) => x.id === sw.dataset.vitrine);
    if (!r) return;
    if (sw.checked && !r.img) {
      sw.checked = false;
      toast("Ajoutez d'abord une photo pour l'afficher sur le site.", true);
      return editLook(r);
    }
    r.vitrine = sw.checked;
    log(`${r.name} ${r.vitrine ? 'affiché sur' : 'retiré du'} site`);
    commit();
    toast(r.vitrine ? `« ${r.name} » est visible sur le site` : `« ${r.name} » est retiré du site`, false, r.vitrine ? { href: '../#collection', label: 'Voir ↗', ext: true } : null);
  });
}

const toggleRow = (r) => `<label class="switch switch--s"><input type="checkbox" data-vitrine="${esc(r.id)}"${r.vitrine && r.img ? ' checked' : ''}><i></i><span>Sur le site</span></label>`;

export function editLook(r = null) {
  const isNew = !r;
  const v = r || { name: '', collection: season(), date: iso(today()), qty: '', colors: [], desc: '', img: '', vitrine: true };
  openSheet({
    title: isNew ? 'Nouvelle réalisation' : v.name,
    danger: isNew ? '' : 'Supprimer',
    wide: true,
    body: `<div class="fgrid">
      ${field('Nom', input('name', v.name, 'required'), { wide: true })}
      ${field('Collection', input('collection', v.collection))}
      ${field('Terminé le', input('date', v.date, 'type="date"'))}
      ${field('Pièces produites', input('qty', v.qty, 'type="number" min="0" inputmode="numeric"'))}
      ${group('Couleurs', colorChoice('colors', v.colors || []))}
      ${field('Description (affichée sur le site)', input('desc', v.desc), { wide: true })}
      ${photoField('img', v.img)}
      <div class="f f--wide">${toggle('vitrine', v.vitrine, 'Afficher sur le site')}</div>
    </div>`,
    onMount: bindPhoto,
    onSubmit: (d) => {
      if (!d.name.trim()) return false;
      const rec = { name: d.name.trim(), collection: d.collection.trim(), date: d.date || iso(today()), qty: num(d.qty, 0), colors: colorsFrom(d.colors), desc: d.desc.trim(), img: d.img, vitrine: !!d.vitrine && !!d.img };
      if (isNew) S.data.realisations.unshift({ id: uid('rz'), ...rec });
      else Object.assign(r, rec);
      log(`Réalisation ${isNew ? 'ajoutée' : 'modifiée'} : ${rec.name}`);
      commit(rec.vitrine ? 'Enregistré · visible sur le site' : 'Enregistré');
    },
    onDanger: () => {
      S.data.realisations = S.data.realisations.filter((x) => x !== r);
      log(`Réalisation supprimée : ${r.name}`);
      commit('Réalisation supprimée');
    },
  });
}
