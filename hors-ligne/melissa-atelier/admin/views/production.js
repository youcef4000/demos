// Production en cours : avancement de chaque modèle étape par étape, échéancier, passage en stock.
import { S, $, $$, esc, icon, head, btn, commit, log, openSheet, field, group, input, area, choice, colorChoice, colorsFrom, photoField, bindPhoto, uid, num, thumb, chip, meter, ava, rel, fmtNum, plural, season, toggle, empty, PACE, toast } from '../ui.js';
import { saveData, STEPS, SIZES, iso, today, addDays, parseISO, diffDays, fmtDate, progressOf, paceOf } from '../../store.js';

export function render(root) {
  const list = S.data.production.slice().sort((a, b) => a.deadline.localeCompare(b.deadline));
  const late = list.filter((p) => paceOf(p) === 'retard').length;
  const pieces = list.reduce((a, p) => a + Number(p.qty || 0), 0);
  root.innerHTML = `
    ${head({ kicker: 'Création', title: 'Production en cours', sub: `${plural(list.length, 'modèle', 'modèles')} · ${plural(pieces, 'pièce', 'pièces')}${late ? ` · ${late} en retard` : ''}`, actions: btn('Mettre en production', { act: 'new', ic: 'plus' }) })}
    ${list.length ? gantt(list) : ''}
    <div class="prods">${list.map(card).join('') || empty('Aucun modèle en production.', '<a class="b b--ghost b--sm" href="#/modeles">Lancer un modèle validé</a>')}</div>
  `;
  bind(root);
}

// Échéancier : une barre par modèle, du début à la livraison, remplie selon l'avancement
function gantt(list) {
  const t = today();
  let a = parseISO(list.reduce((m, p) => (p.start < m ? p.start : m), iso(t)));
  let b = parseISO(list.reduce((m, p) => (p.deadline > m ? p.deadline : m), iso(addDays(t, 7))));
  a = addDays(a, -2);
  b = addDays(b, 3);
  const span = Math.max(1, diffDays(iso(a), iso(b)));
  const x = (d) => (diffDays(iso(a), d) / span) * 100;
  const ticks = [];
  for (let d = new Date(a); d <= b; d = addDays(d, 7)) ticks.push(iso(d));
  return `<section class="panel gantt" aria-label="Échéancier de production">
    <header class="panel__head"><h2>${icon('calendar')}Échéancier</h2><p class="gantt__legend"><span><i class="gl gl--done"></i>réalisé</span><span><i class="gl gl--late"></i>en retard</span><span><i class="gl gl--today"></i>aujourd'hui</span></p></header>
    <div class="gantt__body">
      <div class="gantt__row gantt__row--axis" aria-hidden="true"><span class="gantt__name"></span><span class="gantt__track">${ticks.map((d) => `<span style="left:${x(d)}%">${esc(fmtDate(d, { short: true }))}</span>`).join('')}</span></div>
      ${list
        .map((p) => {
          const pr = progressOf(p);
          const pace = paceOf(p);
          const l = x(p.start);
          const w = Math.max(2, x(p.deadline) - l);
          return `<div class="gantt__row"><span class="gantt__name">${esc(p.name)}</span><span class="gantt__track"><i class="gantt__now" style="left:${x(iso(t))}%"></i><span class="gantt__bar gantt__bar--${pace === 'retard' ? 'late' : 'ok'}" style="left:${l}%;width:${w}%" title="${esc(`${p.name} : ${Math.round(pr * 100)} % · du ${fmtDate(p.start, { short: true })} au ${fmtDate(p.deadline, { short: true })}`)}"><i style="width:${pr * 100}%"></i></span><b class="gantt__pct" style="left:calc(${l + w}% + 6px)">${Math.round(pr * 100)}&nbsp;%</b></span></div>`;
        })
        .join('')}
    </div>
  </section>`;
}

function card(p) {
  const pr = progressOf(p);
  const pc = PACE[paceOf(p)];
  const tone = pc.tone === 'critical' ? 'critical' : 'good';
  return `<article class="prod" data-id="${esc(p.id)}">
    <header class="prod__head">
      ${thumb(p, 'thumb--m')}
      <div class="prod__title">
        <h2>${esc(p.name)}</h2>
        <p>${chip(pc.label, pc.tone, pc.icon)}<span>${fmtNum(p.qty)} pièces · livraison le ${esc(fmtDate(p.deadline, { short: true }))} (${esc(rel(p.deadline))})</span></p>
        <p class="prod__team">${(p.team || []).map(ava).join('')}<span>${esc((p.team || []).join(', ') || 'Équipe à définir')}</span></p>
      </div>
      <p class="prod__pct"><b data-pct>${Math.round(pr * 100)}</b>&nbsp;%</p>
    </header>
    <div data-meter>${meter(pr, tone, `Avancement : ${Math.round(pr * 100)} %`)}</div>
    <ol class="steps">${STEPS.map(([k, l], i) => {
      const n = Number(p.steps?.[k]) || 0;
      return `<li class="step${n >= p.qty ? ' is-done' : ''}" data-step="${k}">
        <span class="step__label"><i>${i + 1}</i>${esc(l)}</span>
        <span class="step__ctrl">
          <button type="button" class="b b--icon b--ghost b--xs" data-act="minus" aria-label="${esc(l)} : une pièce de moins">−</button>
          <input type="number" inputmode="numeric" min="0" max="${p.qty}" value="${n}" aria-label="${esc(l)} : pièces terminées sur ${p.qty}">
          <button type="button" class="b b--icon b--ghost b--xs" data-act="plus" aria-label="${esc(l)} : une pièce de plus">+</button>
        </span>
        <span class="step__of">/ ${fmtNum(p.qty)}</span>
        ${meter(n / p.qty, n >= p.qty ? 'good' : 'accent', `${l} : ${n} sur ${p.qty}`)}
        <button type="button" class="step__all" data-act="all">Tout</button>
      </li>`;
    }).join('')}</ol>
    ${p.notes ? `<p class="prod__notes">${icon('sketch')}${esc(p.notes)}</p>` : ''}
    <footer class="prod__foot">
      ${btn('Modifier', { act: 'edit', kind: 'ghost', ic: 'edit', small: true })}
      ${btn(pr >= 1 ? 'Terminer et ranger en stock' : 'Terminer', { act: 'finish', kind: pr >= 1 ? 'dark' : 'ghost', ic: 'check', small: true })}
    </footer>
  </article>`;
}

// Une étape ne peut pas dépasser la précédente (on ne coud pas ce qui n'est pas coupé)
function setStep(p, k, value) {
  const keys = STEPS.map(([x]) => x);
  const i = keys.indexOf(k);
  const max = i === 0 ? p.qty : Number(p.steps[keys[i - 1]]) || 0;
  p.steps[k] = Math.max(0, Math.min(max, Math.round(value)));
  for (let j = i + 1; j < keys.length; j += 1) p.steps[keys[j]] = Math.min(p.steps[keys[j]] || 0, p.steps[keys[j - 1]]);
}

// Mise à jour sur place (sans redessiner toute la page, pour garder le focus)
function patch(cardEl, p) {
  const pr = progressOf(p);
  const pc = PACE[paceOf(p)];
  $('[data-pct]', cardEl).textContent = Math.round(pr * 100);
  $('[data-meter]', cardEl).innerHTML = meter(pr, pc.tone === 'critical' ? 'critical' : 'good', `Avancement : ${Math.round(pr * 100)} %`);
  $('.prod__title .tag', cardEl).outerHTML = chip(pc.label, pc.tone, pc.icon);
  $$('.step', cardEl).forEach((li) => {
    const n = Number(p.steps[li.dataset.step]) || 0;
    const inp = $('input', li);
    if (document.activeElement !== inp) inp.value = n;
    li.classList.toggle('is-done', n >= p.qty);
    $('.meter', li).outerHTML = meter(n / p.qty, n >= p.qty ? 'good' : 'accent', `${n} sur ${p.qty}`);
  });
  const fin = $('[data-act="finish"]', cardEl);
  fin.className = `b b--${pr >= 1 ? 'dark' : 'ghost'} b--sm`;
  $('span', fin).textContent = pr >= 1 ? 'Terminer et ranger en stock' : 'Terminer';
  saveData(S.data);
}

function bind(root) {
  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'new') return editProduction();
    const cardEl = a.closest('.prod');
    const p = cardEl && S.data.production.find((x) => x.id === cardEl.dataset.id);
    if (!p) return;
    const li = a.closest('[data-step]');
    if (li) {
      const k = li.dataset.step;
      const cur = Number(p.steps[k]) || 0;
      if (a.dataset.act === 'minus') setStep(p, k, cur - (e.shiftKey ? 10 : 1));
      if (a.dataset.act === 'plus') setStep(p, k, cur + (e.shiftKey ? 10 : 1));
      if (a.dataset.act === 'all') setStep(p, k, p.qty);
      return patch(cardEl, p);
    }
    if (a.dataset.act === 'edit') editProduction(p);
    if (a.dataset.act === 'finish') finish(p);
  });
  root.addEventListener('change', (e) => {
    const inp = e.target.closest('.step input');
    if (!inp) return;
    const cardEl = inp.closest('.prod');
    const p = S.data.production.find((x) => x.id === cardEl.dataset.id);
    setStep(p, inp.closest('[data-step]').dataset.step, num(inp.value, 0));
    inp.value = p.steps[inp.closest('[data-step]').dataset.step];
    patch(cardEl, p);
    log(`${p.name} : avancement mis à jour (${Math.round(progressOf(p) * 100)} %)`);
  });
}

export function editProduction(p = null) {
  const isNew = !p;
  const team = S.data.settings.team || [];
  const v = p || { name: '', qty: 50, start: iso(today()), deadline: iso(addDays(today(), 21)), team: [], sizes: SIZES, colors: [], notes: '', img: '' };
  openSheet({
    title: isNew ? 'Mettre en production' : v.name,
    danger: isNew ? '' : 'Retirer de la production',
    dangerAsk: 'Retirer ce modèle de la production ? Son avancement sera perdu.',
    wide: true,
    body: `<div class="fgrid">
      ${field('Modèle', input('name', v.name, 'required'), { wide: true })}
      ${field('Quantité', input('qty', v.qty, 'type="number" min="1" required inputmode="numeric"'))}
      ${field('Début', input('start', v.start, 'type="date" required'))}
      ${field('Livraison prévue', input('deadline', v.deadline, 'type="date" required'))}
      ${group('Tailles', choice('sizes', SIZES.map((s) => [s, s]), v.sizes || SIZES, { multi: true }))}
      ${group('Couleurs', colorChoice('colors', v.colors || []))}
      ${group('Équipe', choice('team', team.map((t) => [t, t]), v.team || [], { multi: true }))}
      ${field('Notes', area('notes', v.notes), { wide: true })}
      ${photoField('img', v.img)}
    </div>`,
    onMount: bindPhoto,
    onSubmit: (d) => {
      if (!d.name.trim()) return false;
      const qty = Math.max(1, num(d.qty, 1));
      const rec = { name: d.name.trim(), qty, start: d.start, deadline: d.deadline, sizes: d.sizes?.length ? d.sizes : SIZES, colors: colorsFrom(d.colors), team: d.team || [], notes: d.notes.trim(), img: d.img };
      if (isNew) S.data.production.push({ id: uid('pr'), steps: { coupe: 0, couture: 0, finitions: 0, repassage: 0, controle: 0 }, ...rec });
      else {
        Object.assign(p, rec);
        STEPS.forEach(([k]) => (p.steps[k] = Math.min(p.steps[k] || 0, qty)));
      }
      log(`Production ${isNew ? 'lancée' : 'modifiée'} : ${rec.name}`);
      commit(isNew ? 'Modèle mis en production' : 'Production enregistrée');
    },
    onDanger: () => {
      S.data.production = S.data.production.filter((x) => x !== p);
      log(`Retiré de la production : ${p.name}`);
      commit('Retiré de la production');
    },
  });
}

// Répartition par défaut d'une quantité entre couleurs et tailles (somme exacte)
function split(total, colors, sizes) {
  const W = { S: 2, M: 3, L: 3, XL: 2, XXL: 1 };
  const cells = [];
  colors.forEach((c) => sizes.forEach((s) => cells.push({ c: c.name, s, w: W[s] || 2 })));
  const sw = cells.reduce((a, x) => a + x.w, 0) || 1;
  cells.forEach((x) => (x.q = Math.floor((total * x.w) / sw)));
  let rest = total - cells.reduce((a, x) => a + x.q, 0);
  for (let i = 0; rest > 0 && cells.length; i = (i + 1) % cells.length, rest -= 1) cells[i].q += 1;
  return cells;
}

// Fin de production : les pièces rejoignent le stock et la liste des réalisations
export function finish(p) {
  const pr = progressOf(p);
  const done = Number(p.steps.controle) || 0;
  const total = done || p.qty;
  const colors = p.colors?.length ? p.colors : [{ name: 'Unique', hex: '#d9c7a7' }];
  const sizes = p.sizes?.length ? p.sizes : SIZES;
  const cells = split(total, colors, sizes);
  const existing = S.data.stock.find((s) => s.name.toLowerCase() === p.name.toLowerCase());
  openSheet({
    title: `Terminer « ${p.name} »`,
    submit: 'Ranger en stock',
    wide: true,
    body: `${pr < 1 ? `<p class="note note--warn">${icon('alert')}<span>Toutes les étapes ne sont pas terminées (${Math.round(pr * 100)} %). Vous pouvez quand même clôturer.</span></p>` : ''}
    <p class="lead">Répartissez les <b>${fmtNum(total)} pièces</b> contrôlées dans le stock. Elles s'ajoutent ${existing ? 'à l\'article existant' : 'à un nouvel article'} « ${esc(p.name)} ».</p>
    <div class="dist" style="--n:${sizes.length}">
      <span></span>${sizes.map((s) => `<b>${esc(s)}</b>`).join('')}
      ${colors.map((c) => `<span class="dist__c"><i class="tdot" style="--c:${esc(c.hex)}"></i>${esc(c.name)}</span>${sizes.map((s) => `<input type="number" min="0" inputmode="numeric" name="q|${esc(c.name)}|${esc(s)}" value="${cells.find((x) => x.c === c.name && x.s === s)?.q || 0}" aria-label="${esc(c.name)} ${esc(s)}">`).join('')}`).join('')}
    </div>
    <p class="dist__sum">Total réparti : <b data-sum>${fmtNum(total)}</b> / ${fmtNum(total)}</p>
    <div class="fgrid">
      ${field('Prix de vente (DA)', input('price', existing?.price || '', 'type="number" min="0" step="100" inputmode="numeric"'))}
      ${field('Collection', input('collection', season()))}
      ${field('Description', input('desc', ''), { wide: true })}
      <div class="f f--wide">${toggle('vitrine', true, 'Afficher ce modèle sur le site (collection)')}</div>
    </div>`,
    onMount: (body) => {
      body.addEventListener('input', () => {
        const s = $$('.dist input', body).reduce((a, i) => a + num(i.value, 0), 0);
        $('[data-sum]', body).textContent = fmtNum(s);
      });
    },
    onSubmit: (d) => {
      let item = existing;
      if (!item) {
        item = { id: uid('st'), name: p.name, img: p.img, price: num(d.price, 0), threshold: 2, variants: [] };
        S.data.stock.push(item);
      } else if (d.price) item.price = num(d.price, item.price);
      let added = 0;
      colors.forEach((c) => {
        let v = item.variants.find((x) => x.name === c.name);
        if (!v) {
          v = { name: c.name, hex: c.hex, sizes: Object.fromEntries(SIZES.map((s) => [s, 0])) };
          item.variants.push(v);
        }
        sizes.forEach((s) => {
          const q = num(d[`q|${c.name}|${s}`], 0);
          v.sizes[s] = (Number(v.sizes[s]) || 0) + q;
          added += q;
        });
      });
      S.data.realisations.unshift({ id: uid('rz'), name: p.name, img: p.img, date: iso(today()), qty: added || total, colors: p.colors || [], collection: d.collection || season(), desc: d.desc || '', vitrine: !!d.vitrine && !!p.img });
      S.data.production = S.data.production.filter((x) => x !== p);
      log(`${p.name} terminé : ${added} pièces rangées en stock`);
      commit(`${fmtNum(added)} pièces ajoutées au stock`);
      if (d.vitrine && !p.img) setTimeout(() => toast('Ajoutez une photo dans « Réalisations » pour l\'afficher sur le site.'), 400);
    },
  });
}
