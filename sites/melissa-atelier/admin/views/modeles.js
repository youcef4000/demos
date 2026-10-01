// Modèles à réaliser : de l'idée au modèle validé, puis lancement en production.
import { S, $, $$, esc, icon, head, btn, commit, log, openSheet, field, group, input, area, select, choice, colorChoice, colorsFrom, photoField, bindPhoto, uid, num, norm, thumb, dots, chip, rel, fmtNum, toast } from '../ui.js';
import { iso, today, addDays, fmtDate, SIZES } from '../../store.js';

export const STAGES = [
  ['idee', 'Idée'],
  ['croquis', 'Croquis'],
  ['patron', 'Patronage'],
  ['prototype', 'Prototype'],
  ['valide', 'Validé'],
];
const PRIO = [
  ['haute', 'Prioritaire'],
  ['normale', 'Normale'],
  ['basse', 'Quand on aura le temps'],
];

// Tissu nécessaire et ce qu'il en reste en stock
export function fabricNeed(m) {
  const need = Math.round((Number(m.meters) || 0) * (Number(m.qty) || 0));
  if (!need || !m.fabric) return null;
  const key = norm(m.fabric);
  const mat = S.data.matieres.find((x) => x.cat === 'tissu' && (norm(x.name).includes(key) || key.includes(norm(x.name))));
  return { need, mat, missing: mat ? Math.max(0, need - Number(mat.qty)) : need };
}

export function render(root) {
  const list = S.data.modeles;
  root.innerHTML = `
    ${head({ kicker: 'Création', title: 'Modèles à réaliser', sub: `${list.length} modèles en préparation · ${list.filter((m) => m.stage === 'valide').length} prêts à lancer`, actions: btn('Nouveau modèle', { act: 'new', ic: 'plus' }) })}
    <p class="hint">${icon('move')}Faites glisser une carte d'une colonne à l'autre, ou utilisez les flèches.</p>
    <div class="board">${STAGES.map(([k, l], i) => {
      const items = list.filter((m) => m.stage === k).sort((a, b) => prio(a) - prio(b) || String(a.deadline || '9').localeCompare(String(b.deadline || '9')));
      return `<section class="col" data-stage="${k}" aria-label="${esc(l)}">
        <header class="col__head"><span class="col__n">${i + 1}</span><h2>${esc(l)}</h2><em>${items.length}</em></header>
        <div class="col__list">${items.map((m) => card(m, i)).join('') || '<p class="col__empty">Rien ici pour l\'instant</p>'}</div>
      </section>`;
    }).join('')}</div>
  `;
  bind(root);
}

const prio = (m) => ({ haute: 0, normale: 1, basse: 2 })[m.priority] ?? 1;

function card(m, i) {
  const f = fabricNeed(m);
  return `<article class="mcard" draggable="true" data-id="${esc(m.id)}">
    <button type="button" class="mcard__main" data-act="edit">
      ${thumb(m, 'thumb--card')}
      <span class="mcard__body">
        <span class="mcard__top">${dots(m.colors)}${m.priority === 'haute' ? chip('Prioritaire', 'critical', 'alert') : ''}</span>
        <b>${esc(m.name)}</b>
        <small>${esc(m.fabric || 'Tissu à choisir')}${m.qty ? ` · ${fmtNum(m.qty)} pièces` : ''}</small>
        ${m.deadline ? `<small>${icon('clock')}Objectif ${esc(fmtDate(m.deadline, { short: true }))} (${esc(rel(m.deadline))})</small>` : ''}
        ${f ? `<small class="${f.missing ? 'txt-warning' : 'txt-good'}">${icon(f.missing ? 'alert' : 'check')}${fmtNum(f.need)} m de tissu${f.missing ? ` · manque ${fmtNum(f.missing)} m` : ' · en stock'}</small>` : ''}
      </span>
    </button>
    <footer class="mcard__foot">
      <button type="button" class="b b--icon b--ghost b--xs" data-act="back" aria-label="Étape précédente" ${i === 0 ? 'disabled' : ''}>${icon('left')}</button>
      ${m.stage === 'valide' ? `<button type="button" class="b b--dark b--xs" data-act="launch" aria-label="Lancer la production de ${esc(m.name)}">${icon('needle')}<span>Lancer</span></button>` : `<span class="mcard__stage">${esc(STAGES[i][1])}</span>`}
      <button type="button" class="b b--icon b--ghost b--xs" data-act="fwd" aria-label="Étape suivante" ${i === STAGES.length - 1 ? 'disabled' : ''}>${icon('right')}</button>
    </footer>
  </article>`;
}

function move(m, delta) {
  const i = STAGES.findIndex(([k]) => k === m.stage);
  const j = Math.max(0, Math.min(STAGES.length - 1, i + delta));
  if (i === j) return;
  m.stage = STAGES[j][0];
  log(`${m.name} : passe à l'étape « ${STAGES[j][1]} »`);
  commit(`${m.name} → ${STAGES[j][1]}`);
}

function bind(root) {
  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'new') return editModele();
    const m = S.data.modeles.find((x) => x.id === a.closest('[data-id]')?.dataset.id);
    if (!m) return;
    if (a.dataset.act === 'edit') editModele(m);
    if (a.dataset.act === 'back') move(m, -1);
    if (a.dataset.act === 'fwd') move(m, 1);
    if (a.dataset.act === 'launch') launch(m);
  });
  // Glisser-déposer (ordinateur)
  let dragId = null;
  $$('.mcard', root).forEach((c) => {
    c.addEventListener('dragstart', (e) => {
      dragId = c.dataset.id;
      c.classList.add('is-drag');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragId);
    });
    c.addEventListener('dragend', () => {
      c.classList.remove('is-drag');
      $$('.col', root).forEach((x) => x.classList.remove('is-over'));
    });
  });
  $$('.col', root).forEach((col) => {
    col.addEventListener('dragover', (e) => {
      if (!dragId) return;
      e.preventDefault();
      col.classList.add('is-over');
    });
    col.addEventListener('dragleave', (e) => {
      if (!col.contains(e.relatedTarget)) col.classList.remove('is-over');
    });
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      const m = S.data.modeles.find((x) => x.id === dragId);
      dragId = null;
      if (!m || m.stage === col.dataset.stage) return S.render();
      m.stage = col.dataset.stage;
      const label = STAGES.find(([k]) => k === m.stage)[1];
      log(`${m.name} : passe à l'étape « ${label} »`);
      commit(`${m.name} → ${label}`);
    });
  });
}

export function editModele(m = null) {
  const isNew = !m;
  const v = m || { name: '', stage: 'idee', priority: 'normale', colors: [], fabric: '', meters: '', qty: '', deadline: '', notes: '', img: '' };
  const f = m && fabricNeed(m);
  openSheet({
    title: isNew ? 'Nouveau modèle' : v.name,
    danger: isNew ? '' : 'Supprimer',
    wide: true,
    body: `<div class="fgrid">
      ${field('Nom du modèle', input('name', v.name, 'required placeholder="Ex. Ensemble lin brodé"'), { wide: true })}
      ${field('Étape', select('stage', STAGES, v.stage))}
      ${field('Priorité', select('priority', PRIO, v.priority))}
      ${group('Couleurs', colorChoice('colors', v.colors || []))}
      ${field('Tissu', input('fabric', v.fabric, 'placeholder="Ex. Lin lavé, crêpe, satin…"'))}
      ${field('Tissu par pièce (m)', input('meters', v.meters, 'type="number" step="0.1" min="0" inputmode="decimal"'))}
      ${field('Quantité prévue', input('qty', v.qty, 'type="number" min="0" inputmode="numeric"'))}
      ${field('Objectif', input('deadline', v.deadline, 'type="date"'))}
      ${f ? `<div class="f f--wide"><p class="note ${f.missing ? 'note--warn' : ''}">${icon(f.missing ? 'alert' : 'check')}<span>Il faut environ <b>${fmtNum(f.need)} m</b> de ${esc(v.fabric.toLowerCase())}. ${f.mat ? `En stock : ${fmtNum(f.mat.qty)} m.` : 'Aucun tissu correspondant en stock.'}${f.missing ? ` Il manque ${fmtNum(f.missing)} m.` : ''}</span>${f.missing ? `<button type="button" class="b b--ghost b--sm" data-add-buy>${icon('bag')}<span>Ajouter aux achats</span></button>` : ''}</p></div>` : ''}
      ${field('Notes', area('notes', v.notes, 'placeholder="Détails, retouches, idées…"'), { wide: true })}
      ${photoField('img', v.img, 'Croquis ou photo')}
    </div>`,
    onMount: (body) => {
      bindPhoto(body);
      $('[data-add-buy]', body)?.addEventListener('click', (e) => {
        const b = e.currentTarget;
        const exists = S.data.achats.some((a) => a.status !== 'recu' && norm(a.name) === norm(f.mat?.name || v.fabric));
        if (exists) return toast('Ce tissu est déjà dans la liste des achats.');
        S.data.achats.push({ id: uid('ac'), name: f.mat?.name || v.fabric, cat: 'tissu', qty: f.missing, unit: 'm', price: 0, urgency: 'semaine', status: 'a-acheter', supplierId: f.mat?.supplierId || '', matiereId: f.mat?.id || '', modele: v.name, note: '', created: iso(today()) });
        log(`Achat ajouté : ${fmtNum(f.missing)} m de ${f.mat?.name || v.fabric} pour ${v.name}`);
        commit('Ajouté à la liste des achats');
        b.disabled = true;
        b.querySelector('span').textContent = 'Ajouté aux achats';
      });
    },
    onSubmit: (d) => {
      if (!d.name.trim()) return false;
      const rec = { name: d.name.trim(), stage: d.stage, priority: d.priority, colors: colorsFrom(d.colors), fabric: d.fabric.trim(), meters: num(d.meters, ''), qty: num(d.qty, ''), deadline: d.deadline, notes: d.notes.trim(), img: d.img };
      if (isNew) S.data.modeles.push({ id: uid('md'), created: iso(today()), ...rec });
      else Object.assign(m, rec);
      log(`Modèle ${isNew ? 'créé' : 'modifié'} : ${rec.name}`);
      commit(isNew ? 'Modèle ajouté' : 'Modèle enregistré');
      if (isNew && location.hash !== '#/modeles') S.go('modeles');
    },
    onDanger: () => {
      S.data.modeles = S.data.modeles.filter((x) => x !== m);
      log(`Modèle supprimé : ${m.name}`);
      commit('Modèle supprimé');
    },
  });
}

// Modèle validé → fiche de production
export function launch(m) {
  const team = S.data.settings.team || [];
  openSheet({
    title: `Lancer « ${m.name} »`,
    submit: 'Lancer la production',
    body: `<p class="lead">Le modèle quitte le tableau de création et rejoint la production, étape par étape : coupe, couture, finitions, repassage, contrôle.</p>
    <div class="fgrid">
      ${field('Quantité à produire', input('qty', m.qty || 50, 'type="number" min="1" required inputmode="numeric"'))}
      ${field('Début', input('start', iso(today()), 'type="date" required'))}
      ${field('Livraison prévue', input('deadline', m.deadline || iso(addDays(today(), 21)), 'type="date" required'))}
      ${group('Tailles', choice('sizes', SIZES.map((s) => [s, s]), SIZES, { multi: true }))}
      ${group('Équipe', team.length ? choice('team', team.map((t) => [t, t]), team.slice(0, 2), { multi: true }) : '<p class="f__hint">Ajoutez vos couturières dans les réglages.</p>')}
    </div>`,
    onSubmit: (d) => {
      const qty = Math.max(1, num(d.qty, 1));
      S.data.production.push({
        id: uid('pr'),
        modelId: m.id,
        name: m.name,
        img: m.img,
        colors: m.colors || [],
        sizes: d.sizes?.length ? d.sizes : SIZES,
        qty,
        start: d.start,
        deadline: d.deadline,
        team: d.team || [],
        steps: { coupe: 0, couture: 0, finitions: 0, repassage: 0, controle: 0 },
        notes: m.notes || '',
        fabric: m.fabric,
      });
      S.data.modeles = S.data.modeles.filter((x) => x !== m);
      log(`Production lancée : ${m.name}, ${qty} pièces`);
      commit(`${m.name} est en production`);
      S.go('production');
    },
  });
}
