// Planning des rendez-vous, semaine par semaine (du samedi au vendredi).
// Grille horaire sur ordinateur, agenda jour par jour sur téléphone, demandes du site à confirmer.
import { S, $, esc, icon, head, btn, commit, log, openSheet, ask, field, group, input, area, select, choice, uid, waLink, clientList, empty } from '../ui.js';
import { RDV_TYPES, readRequests, writeRequests, iso, parseISO, addDays, today, weekStart, toMin, fromMin, fmtDate, fmtHour, dayName } from '../../store.js';

let offset = 0; // semaines par rapport à la semaine en cours
let day = ''; // jour affiché sur téléphone
let hidden = new Set(); // types masqués

const PX = 58; // hauteur d'une heure dans la grille
const STATUS = [
  ['confirme', 'Confirmé'],
  ['a-confirmer', 'À confirmer'],
  ['termine', 'Terminé'],
  ['annule', 'Annulé'],
];

export function render(root) {
  const t = today();
  const start = addDays(weekStart(t), offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const ids = days.map(iso);
  if (!ids.includes(day)) day = ids.includes(iso(t)) ? iso(t) : ids[0];
  const all = S.data.rdv.filter((r) => ids.includes(r.date));
  const shown = all.filter((r) => !hidden.has(r.type));
  const reqs = readRequests();
  const label = `Du ${fmtDate(days[0], { short: true })} au ${fmtDate(days[6], { short: true, year: true })}`;

  const byType = Object.keys(RDV_TYPES).map((k) => [k, all.filter((r) => r.type === k && r.status !== 'annule').length]);

  root.innerHTML = `
    ${head({ kicker: 'Planning', title: offset === 0 ? 'Cette semaine' : offset === 1 ? 'La semaine prochaine' : offset === -1 ? 'La semaine dernière' : 'Semaine', sub: `${label} · ${all.filter((r) => r.status !== 'annule').length} rendez-vous`, actions: btn('Rendez-vous', { act: 'new', ic: 'plus' }) })}
    ${reqs.length ? requestsBlock(reqs) : ''}
    <div class="wk-bar">
      <div class="wk-nav">
        <button type="button" class="b b--ghost b--icon" data-act="prev" aria-label="Semaine précédente">${icon('left')}</button>
        <button type="button" class="b b--ghost b--sm" data-act="now"${offset === 0 ? ' disabled' : ''}>Aujourd'hui</button>
        <button type="button" class="b b--ghost b--icon" data-act="next" aria-label="Semaine suivante">${icon('right')}</button>
      </div>
      <div class="legend" role="group" aria-label="Afficher ou masquer un type de rendez-vous">
        ${byType.map(([k, n]) => `<button type="button" class="legend__i" data-type="${k}" aria-pressed="${!hidden.has(k)}"><i style="--c:${RDV_TYPES[k].color}"></i>${esc(RDV_TYPES[k].label)}<b>${n}</b></button>`).join('')}
      </div>
    </div>
    ${grid(days, shown)}
    ${agenda(days, shown)}
  `;
  bind(root, days);
}

function requestsBlock(reqs) {
  return `<section class="panel panel--req">
    <header class="panel__head"><h2>${icon('heart')}Demandes du site <em class="badge">${reqs.length}</em></h2><p>À confirmer par téléphone ou WhatsApp</p></header>
    <ul class="reqs">${reqs
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
      .map(
        (r) => `<li class="req" data-req="${esc(r.id)}">
        <span class="req__when"><b>${esc(fmtDate(r.date, { weekday: true, short: true }))}</b>${esc(fmtHour(r.start))}</span>
        <span class="req__who"><b>${esc(r.name)}</b><small><i class="tdot" style="--c:${RDV_TYPES[r.type]?.color || '#999'}"></i>${esc(RDV_TYPES[r.type]?.label || r.type)} · ${esc(r.phone)}</small>${r.note ? `<small class="req__note">« ${esc(r.note)} »</small>` : ''}</span>
        <span class="req__acts">
          <button type="button" class="b b--dark b--sm" data-act="req-ok">${icon('check')}<span>Confirmer</span></button>
          <button type="button" class="b b--ghost b--sm" data-act="req-edit">Modifier</button>
          <button type="button" class="b b--ghost b--sm b--danger" data-act="req-no">Refuser</button>
        </span>
      </li>`,
      )
      .join('')}</ul>
  </section>`;
}

function range(list) {
  let h0 = 9;
  let h1 = 19;
  for (const r of list) {
    h0 = Math.min(h0, Math.floor(toMin(r.start) / 60));
    h1 = Math.max(h1, Math.ceil((toMin(r.start) + Number(r.duration || 60)) / 60));
  }
  return [h0, Math.min(24, h1)];
}

// Répartit les rendez-vous qui se chevauchent sur plusieurs colonnes
function lanes(list) {
  const items = list.map((r) => ({ r, s: toMin(r.start), e: toMin(r.start) + Number(r.duration || 60), lane: 0, n: 1 })).sort((a, b) => a.s - b.s || b.e - a.e);
  let cluster = [];
  let end = -1;
  const flush = () => {
    const ends = [];
    for (const it of cluster) {
      let l = ends.findIndex((x) => x <= it.s);
      if (l === -1) l = ends.length;
      ends[l] = it.e;
      it.lane = l;
    }
    cluster.forEach((it) => (it.n = ends.length));
    cluster = [];
  };
  for (const it of items) {
    if (it.s >= end && cluster.length) flush();
    cluster.push(it);
    end = Math.max(end, it.e);
  }
  if (cluster.length) flush();
  return items;
}

function grid(days, list) {
  const [h0, h1] = range(list);
  const openDays = S.data.settings.openDays;
  const t = iso(today());
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const hours = Array.from({ length: h1 - h0 }, (_, i) => h0 + i);
  return `<div class="week" style="--px:${PX}px;--rows:${h1 - h0}">
    <div class="week__head"><span></span>${days
      .map((d) => {
        const id = iso(d);
        const n = list.filter((r) => r.date === id && r.status !== 'annule').length;
        return `<div class="week__day${id === t ? ' is-today' : ''}${openDays.includes(d.getDay()) ? '' : ' is-closed'}"><small>${dayName(d, true)}</small><b>${d.getDate()}</b>${openDays.includes(d.getDay()) ? `<em>${n ? n + ' rdv' : '—'}</em>` : '<em>Fermé</em>'}</div>`;
      })
      .join('')}</div>
    <div class="week__body" data-h0="${h0}">
      <div class="week__hours">${hours.map((h) => `<span>${h}h</span>`).join('')}</div>
      ${days
        .map((d) => {
          const id = iso(d);
          const evs = lanes(list.filter((r) => r.date === id));
          const line = id === t && nowMin >= h0 * 60 && nowMin <= h1 * 60 ? `<i class="week__now" style="top:${((nowMin - h0 * 60) * PX) / 60}px"></i>` : '';
          return `<div class="week__col${openDays.includes(d.getDay()) ? '' : ' is-closed'}" data-date="${id}" aria-label="${esc(fmtDate(d, { weekday: true }))}">${evs.map((it) => evBlock(it, h0)).join('')}${line}</div>`;
        })
        .join('')}
    </div>
  </div>`;
}

function evBlock({ r, s, e, lane, n }, h0) {
  const ty = RDV_TYPES[r.type] || RDV_TYPES.interne;
  const top = ((s - h0 * 60) * PX) / 60;
  const h = Math.max(24, ((e - s) * PX) / 60 - 3);
  return `<button type="button" class="ev ev--${r.status}${h < 44 ? ' ev--short' : ''}" data-rdv="${esc(r.id)}" style="--c:${ty.color};top:${top}px;height:${h}px;left:calc(${(lane / n) * 100}% + 2px);width:calc(${100 / n}% - 4px)" title="${esc(`${fmtHour(r.start)} · ${ty.label} · ${r.title}`)}">
    <small>${esc(fmtHour(r.start))} · ${esc(ty.label)}</small><b>${esc(r.title)}</b>${r.status === 'a-confirmer' ? '<em>À confirmer</em>' : ''}
  </button>`;
}

function agenda(days, list) {
  const openDays = S.data.settings.openDays;
  const t = iso(today());
  const items = list.filter((r) => r.date === day).sort((a, b) => a.start.localeCompare(b.start));
  const d = parseISO(day);
  return `<div class="agenda">
    <div class="agenda__days" role="group" aria-label="Jour">${days
      .map((x) => {
        const id = iso(x);
        const n = list.filter((r) => r.date === id && r.status !== 'annule').length;
        return `<button type="button" class="aday${id === t ? ' is-today' : ''}${openDays.includes(x.getDay()) ? '' : ' is-closed'}" data-day="${id}" aria-pressed="${id === day}"><small>${dayName(x, true)}</small><b>${x.getDate()}</b><span class="aday__dots">${'<i></i>'.repeat(Math.min(n, 4))}</span></button>`;
      })
      .join('')}</div>
    <h2 class="agenda__title">${esc(fmtDate(d, { weekday: true }))}${openDays.includes(d.getDay()) ? '' : ' · <em>boutique fermée</em>'}</h2>
    ${
      items.length
        ? `<ol class="alist">${items
            .map((r) => {
              const ty = RDV_TYPES[r.type] || RDV_TYPES.interne;
              const end = fromMin(toMin(r.start) + Number(r.duration || 60));
              return `<li><button type="button" class="acard ev--${r.status}" data-rdv="${esc(r.id)}" style="--c:${ty.color}">
            <span class="acard__time"><b>${esc(fmtHour(r.start))}</b><small>${esc(fmtHour(end))}</small></span>
            <span class="acard__body"><small><i class="tdot"></i>${esc(ty.label)}${r.status === 'a-confirmer' ? ' · <em>à confirmer</em>' : r.status === 'annule' ? ' · annulé' : r.status === 'termine' ? ' · terminé' : ''}</small><b>${esc(r.title)}</b>${r.note ? `<span>${esc(r.note)}</span>` : ''}</span>
          </button></li>`;
            })
            .join('')}</ol>`
        : empty('Aucun rendez-vous ce jour-là.', btn('Ajouter un rendez-vous', { act: 'new-day', kind: 'ghost', ic: 'plus', small: true }))
    }
  </div>`;
}

function bind(root) {
  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]');
    const ev = e.target.closest('[data-rdv]');
    const lg = e.target.closest('.legend__i');
    const dy = e.target.closest('[data-day]');
    if (a) {
      const act = a.dataset.act;
      if (act === 'prev') offset -= 1;
      if (act === 'next') offset += 1;
      if (act === 'now') offset = 0;
      if (['prev', 'next', 'now'].includes(act)) {
        day = '';
        return S.render();
      }
      if (act === 'new') return editRdv({ date: day, start: '10:00' });
      if (act === 'new-day') return editRdv({ date: day, start: '10:00' });
      const li = a.closest('[data-req]');
      const req = li && readRequests().find((r) => r.id === li.dataset.req);
      if (req && act === 'req-ok') return confirmRequest(req);
      if (req && act === 'req-edit') return confirmRequest(req, true);
      if (req && act === 'req-no') return declineRequest(req);
      return;
    }
    if (ev) {
      const r = S.data.rdv.find((x) => x.id === ev.dataset.rdv);
      if (r) editRdv(r);
      return;
    }
    if (lg) {
      const k = lg.dataset.type;
      if (hidden.has(k)) hidden.delete(k);
      else hidden.add(k);
      return S.render();
    }
    if (dy) {
      day = dy.dataset.day;
      return S.render();
    }
    // Clic dans une case vide de la grille : nouveau rendez-vous à cette heure
    const col = e.target.closest('.week__col');
    if (col && !col.classList.contains('is-closed')) {
      const body = col.closest('.week__body');
      const y = e.clientY - col.getBoundingClientRect().top;
      const h0 = Number(body.dataset.h0);
      const min = Math.max(0, Math.floor(((y / PX) * 60) / 30) * 30) + h0 * 60;
      editRdv({ date: col.dataset.date, start: fromMin(min) });
    }
  });
}

/* Fiche rendez-vous ------------------------------------------------------ */
export function editRdv(r = {}, { fromRequest = null } = {}) {
  const isNew = !r.id;
  const types = Object.entries(RDV_TYPES).map(([k, v]) => [k, v.label, v.color]);
  const type = r.type || 'essayage';
  const call = r.phone ? `<p class="sheet__links"><a class="b b--ghost b--sm" href="tel:${esc(r.phone.replace(/[^\d+]/g, ''))}">${icon('phone')}<span>Appeler</span></a>${waLink(r.phone, 'Bonjour') ? `<a class="b b--ghost b--sm" href="${esc(waLink(r.phone, `Bonjour ${r.title}, `))}" target="_blank" rel="noopener">${icon('wa')}<span>WhatsApp</span></a>` : ''}</p>` : '';
  openSheet({
    title: fromRequest ? 'Confirmer la demande' : isNew ? 'Nouveau rendez-vous' : 'Rendez-vous',
    submit: fromRequest ? 'Confirmer le rendez-vous' : 'Enregistrer',
    danger: isNew ? '' : 'Supprimer',
    body: `${call}<div class="fgrid">
      ${field('Cliente ou objet', input('title', r.title || '', 'required list="dl-clientes" autocomplete="off" placeholder="Ex. Amina B., shooting…"'), { wide: true })}
      ${group('Type', choice('type', types, [type]))}
      ${field('Jour', input('date', r.date || iso(today()), 'type="date" required'))}
      ${field('Heure', input('start', r.start || '10:00', 'type="time" step="900" required'))}
      ${field('Durée', select('duration', [[30, '30 min'], [45, '45 min'], [60, '1 h'], [90, '1 h 30'], [120, '2 h'], [180, '3 h']], r.duration || RDV_TYPES[type].duration))}
      ${field('Statut', select('status', STATUS, r.status || 'confirme'))}
      ${field('Téléphone', input('phone', r.phone || '', 'type="tel" inputmode="tel" placeholder="05 .. .. .. .."'), { wide: false })}
      ${field('Note', area('note', r.note || '', 'placeholder="Taille, modèle, tissu…"'), { wide: true })}
    </div>${clientList()}`,
    onMount: (body) => {
      const title = $('[name=title]', body);
      const phone = $('[name=phone]', body);
      title.addEventListener('change', () => {
        const c = S.data.clientes.find((x) => x.name === title.value);
        if (c && !phone.value && !c.phone.includes('•')) phone.value = c.phone;
      });
    },
    onSubmit: (v) => {
      if (!v.title.trim()) return false;
      const c = S.data.clientes.find((x) => x.name === v.title.trim());
      const rec = { ...r, title: v.title.trim(), type: v.type, date: v.date, start: v.start, duration: Number(v.duration), status: v.status, phone: v.phone.trim(), note: v.note.trim(), clientId: c?.id || r.clientId || null };
      if (isNew) {
        rec.id = uid('rv');
        rec.source = rec.source || 'atelier';
        S.data.rdv.push(rec);
      } else Object.assign(r, rec);
      if (fromRequest) {
        writeRequests(readRequests().filter((x) => x.id !== fromRequest.id));
        addClient(rec);
      }
      log(`Rendez-vous ${isNew ? 'ajouté' : 'modifié'} : ${rec.title}, ${fmtDate(rec.date, { short: true })} à ${fmtHour(rec.start)}`);
      commit(isNew ? 'Rendez-vous ajouté au planning' : 'Rendez-vous enregistré');
      if (fromRequest) setTimeout(() => notify(rec), 50);
    },
    onDanger: () => {
      S.data.rdv = S.data.rdv.filter((x) => x.id !== r.id);
      log(`Rendez-vous supprimé : ${r.title}`);
      commit('Rendez-vous supprimé');
    },
  });
}

function addClient(rec) {
  if (S.data.clientes.some((c) => c.name.toLowerCase() === rec.title.toLowerCase())) return;
  S.data.clientes.push({ id: uid('cl'), name: rec.title, phone: rec.phone, ville: '', note: 'Venue par le site', since: iso(today()), pro: rec.type === 'gros', mesures: {} });
}

// Demande du site → rendez-vous confirmé (directement, ou après modification)
export function confirmRequest(req, edit = false) {
  const base = { title: req.name, phone: req.phone, type: req.type, date: req.date, start: req.start, duration: RDV_TYPES[req.type]?.duration || 60, note: req.note || '', status: 'confirme', source: 'site' };
  if (edit) return editRdv(base, { fromRequest: req });
  const rec = { id: uid('rv'), clientId: null, ...base };
  S.data.rdv.push(rec);
  addClient(rec);
  writeRequests(readRequests().filter((x) => x.id !== req.id));
  log(`Demande du site confirmée : ${rec.title}, ${fmtDate(rec.date, { short: true })} à ${fmtHour(rec.start)}`);
  commit();
  notify(rec);
}

function notify(rec) {
  const ty = RDV_TYPES[rec.type]?.site || RDV_TYPES[rec.type]?.label || '';
  const text = `Bonjour ${rec.title}, votre rendez-vous chez Melissa (${ty.toLowerCase()}) est confirmé : ${fmtDate(rec.date, { weekday: true })} à ${fmtHour(rec.start)}. À bientôt !`;
  const link = waLink(rec.phone, text);
  openSheet({
    title: 'Rendez-vous confirmé',
    submit: false,
    cancel: 'Fermer',
    noFocus: true,
    body: `<div class="done">${icon('check')}<p><b>${esc(rec.title)}</b> est dans le planning : ${esc(fmtDate(rec.date, { weekday: true }))} à ${esc(fmtHour(rec.start))}.</p>
      ${link ? `<p>Prévenez-la en un geste :</p><a class="b b--dark" href="${esc(link)}" target="_blank" rel="noopener" data-sheet-close>${icon('wa')}<span>Envoyer la confirmation</span></a>` : '<p>Pensez à la rappeler pour confirmer.</p>'}
      <p class="done__msg">« ${esc(text)} »</p></div>`,
  });
}

export async function declineRequest(req) {
  if (!(await ask(`Refuser la demande de ${req.name} ?`, 'Refuser'))) return;
  writeRequests(readRequests().filter((x) => x.id !== req.id));
  log(`Demande du site refusée : ${req.name}`);
  commit('Demande retirée');
}
