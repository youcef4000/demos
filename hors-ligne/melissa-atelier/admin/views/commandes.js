// Commandes : Instagram, WhatsApp, boutique et revendeuses ; préparation, livraison et paiement main à main.
import { S, $, $$, esc, icon, head, btn, commit, log, openSheet, ask, field, input, area, select, uid, num, tile, chip, money, empty, waLink, clientList, toast } from '../ui.js';
import { iso, today, addDays, fmtDate, SIZES } from '../../store.js';

let filter = 'traiter';

export const STATUTS = {
  nouvelle: { label: 'Nouvelle', tone: 'info', next: 'confirmee', action: 'Confirmer' },
  confirmee: { label: 'Confirmée', tone: 'info', next: 'preparee', action: 'Préparer (sort du stock)' },
  preparee: { label: 'Préparée', tone: 'warning', next: 'expediee', action: 'Expédier' },
  expediee: { label: 'Expédiée', tone: 'warning', next: 'livree', action: 'Livrée' },
  livree: { label: 'Livrée', tone: 'good', next: null },
  retour: { label: 'Retour', tone: 'critical', next: null },
};
const CANAUX = [
  ['instagram', 'Instagram'],
  ['whatsapp', 'WhatsApp'],
  ['boutique', 'Boutique'],
  ['gros', 'Revendeuse (gros)'],
];
const FILTERS = [
  ['traiter', 'À traiter', (o) => ['nouvelle', 'confirmee', 'preparee'].includes(o.statut)],
  ['route', 'En livraison', (o) => o.statut === 'expediee'],
  ['encaisser', 'À encaisser', (o) => ['expediee', 'livree'].includes(o.statut) && !o.paye],
  ['livree', 'Livrées', (o) => o.statut === 'livree'],
  ['retour', 'Retours', (o) => o.statut === 'retour'],
  ['all', 'Toutes', () => true],
];
export const total = (o) => o.items.reduce((a, i) => a + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);

export function render(root) {
  const d = S.data;
  const list = d.commandes.slice().sort((a, b) => b.date.localeCompare(a.date) || b.num - a.num);
  const f = FILTERS.find(([k]) => k === filter) || FILTERS[0];
  const shown = list.filter(f[2]);
  const since = iso(addDays(today(), -30));
  const cashed = list.filter((o) => o.paye && o.date >= since).reduce((a, o) => a + total(o), 0);
  const due = list.filter(FILTERS[2][2]).reduce((a, o) => a + total(o), 0);
  const closed = list.filter((o) => ['livree', 'retour'].includes(o.statut));
  const ret = closed.length ? Math.round((list.filter((o) => o.statut === 'retour').length / closed.length) * 100) : 0;
  root.innerHTML = `
    ${head({ kicker: 'Boutique', title: 'Commandes', sub: 'Livraison disponible, paiement main à main.', actions: btn('Commande', { act: 'new', ic: 'plus' }) })}
    <section class="tiles">
      ${tile('À traiter', list.filter(FILTERS[0][2]).length, 'nouvelles, confirmées, préparées')}
      ${tile('En livraison', list.filter(FILTERS[1][2]).length)}
      ${tile('À encaisser', money(due), 'livraisons pas encore payées')}
      ${tile('Encaissé sur 30 jours', money(cashed), `taux de retour ${ret} %`)}
    </section>
    <div class="filters" role="group" aria-label="Filtrer les commandes">${FILTERS.map(([k, l, fn]) => `<button type="button" class="fchip" data-f="${k}" aria-pressed="${filter === k}">${l} <b>${list.filter(fn).length}</b></button>`).join('')}</div>
    <ul class="orders">${shown.map(row).join('') || `<li>${empty('Aucune commande ici.')}</li>`}</ul>
  `;
  bind(root);
}

function row(o) {
  const st = STATUTS[o.statut];
  const canal = CANAUX.find(([k]) => k === o.canal)?.[1] || o.canal;
  return `<li class="order" data-cmd="${esc(o.id)}">
    <button type="button" class="order__main" data-act="edit">
      <span class="order__num">#${o.num}<small>${esc(fmtDate(o.date, { short: true }))}</small></span>
      <span class="order__who"><b>${esc(o.client)}</b><small>${esc(o.wilaya || '—')} · ${esc(canal)}</small><small class="order__items">${esc(o.items.map((i) => `${i.name} ${i.color ? `${i.color} ` : ''}${i.size} ×${i.qty}`).join(' · '))}</small></span>
    </button>
    <span class="order__right">
      <b>${money(total(o))}</b>
      <span class="order__tags">${chip(st.label, st.tone, o.statut === 'retour' ? 'alert' : o.statut === 'livree' ? 'check' : o.statut === 'expediee' ? 'truck' : '')}${['expediee', 'livree'].includes(o.statut) ? `<button type="button" class="paid${o.paye ? ' is-on' : ''}" data-act="paid" aria-pressed="${!!o.paye}">${o.paye ? `${icon('check')}Payée` : 'Non payée'}</button>` : ''}</span>
      ${st.next ? `<button type="button" class="b b--soft b--xs" data-act="next">${esc(st.action)}${icon('right')}</button>` : ''}
    </span>
  </li>`;
}

function bind(root) {
  root.addEventListener('click', async (e) => {
    const f = e.target.closest('[data-f]');
    if (f) {
      filter = f.dataset.f;
      return S.render();
    }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'new') return editCommande();
    const o = S.data.commandes.find((x) => x.id === a.closest('[data-cmd]')?.dataset.cmd);
    if (!o) return;
    if (a.dataset.act === 'edit') return editCommande(o);
    if (a.dataset.act === 'paid') {
      o.paye = !o.paye;
      log(`Commande #${o.num} ${o.paye ? 'encaissée' : 'marquée non payée'} (${money(total(o))})`);
      return commit(o.paye ? `#${o.num} encaissée : ${money(total(o))}` : `#${o.num} non payée`);
    }
    if (a.dataset.act === 'next') {
      const next = STATUTS[o.statut].next;
      if (next === 'livree' && !(await ask(`Commande #${o.num} livrée. Le paiement main à main de ${money(total(o))} a-t-il été reçu ?`, 'Oui, payée'))) {
        setStatut(o, 'livree');
        return commit(`#${o.num} livrée (paiement en attente)`);
      }
      if (next === 'livree') o.paye = true;
      setStatut(o, next);
      commit(`#${o.num} : ${STATUTS[next].label.toLowerCase()}`);
    }
  });
}

// Le stock bouge quand la commande est préparée, et revient en cas de retour
function setStatut(o, statut) {
  const prev = o.statut;
  if (prev === statut) return;
  const out = ['preparee', 'expediee', 'livree'].includes(statut);
  if (out && !o.stockOut) move(o, -1);
  if (!out && o.stockOut) move(o, 1);
  o.statut = statut;
  log(`Commande #${o.num} (${o.client}) : ${STATUTS[statut].label.toLowerCase()}`);
}

function move(o, sign) {
  const missing = [];
  for (const it of o.items) {
    const st = S.data.stock.find((s) => s.id === it.stockId) || S.data.stock.find((s) => s.name === it.name);
    const v = st?.variants.find((x) => x.name === it.color) || st?.variants[0];
    if (!v) continue;
    const cur = Number(v.sizes[it.size]) || 0;
    if (sign < 0 && cur < it.qty) missing.push(`${it.name} ${v.name} ${it.size}`);
    v.sizes[it.size] = Math.max(0, cur + sign * Number(it.qty));
  }
  o.stockOut = sign < 0;
  if (missing.length) setTimeout(() => toast(`Stock insuffisant : ${missing.join(', ')}`, true), 300);
}

export function editCommande(o = null) {
  const isNew = !o;
  const d = S.data;
  const nextNum = Math.max(1000, ...d.commandes.map((x) => x.num)) + 1;
  const v = o || { num: nextNum, date: iso(today()), client: '', phone: '', wilaya: '', canal: 'instagram', items: [], statut: 'nouvelle', paye: false, note: '' };
  const items = v.items.length ? v.items : [{ stockId: d.stock[0]?.id, name: d.stock[0]?.name, color: d.stock[0]?.variants[0]?.name, size: 'M', qty: 1, price: d.stock[0]?.price || 0 }];
  const wa = o && waLink(o.phone, `Bonjour ${o.client}, votre commande Melissa #${o.num} `);
  openSheet({
    title: isNew ? 'Nouvelle commande' : `Commande #${v.num}`,
    danger: isNew ? '' : 'Supprimer',
    wide: true,
    body: `${wa ? `<p class="sheet__links"><a class="b b--ghost b--sm" href="${esc(wa)}" target="_blank" rel="noopener">${icon('wa')}<span>Écrire à la cliente</span></a></p>` : ''}
    <div class="fgrid">
      ${field('Cliente', input('client', v.client, 'required list="dl-clientes" autocomplete="off"'))}
      ${field('Téléphone', input('phone', v.phone, 'type="tel" inputmode="tel"'))}
      ${field('Wilaya / commune', input('wilaya', v.wilaya))}
      ${field('Canal', select('canal', CANAUX, v.canal))}
      ${field('Date', input('date', v.date, 'type="date"'))}
      ${field('Statut', select('statut', Object.entries(STATUTS).map(([k, x]) => [k, x.label]), v.statut))}
    </div>
    <div class="f f--wide"><span class="f__label">Articles</span><div class="lines" id="lines">${items.map(line).join('')}</div>
      <button type="button" class="b b--ghost b--sm" data-add-line>${icon('plus')}<span>Ajouter un article</span></button></div>
    <p class="lines__total">Total : <b id="ototal">${money(items.reduce((a, i) => a + i.price * i.qty, 0))}</b></p>
    <div class="fgrid">
      <div class="f f--wide"><label class="switch"><input type="checkbox" name="paye"${v.paye ? ' checked' : ''}><i></i><span>Payée (main à main)</span></label></div>
      ${field('Note', area('note', v.note), { wide: true })}
    </div>${clientList()}`,
    onMount: (body) => {
      const box = $('#lines', body);
      const refresh = () => {
        let sum = 0;
        $$('.line', box).forEach((l) => {
          sum += num($('[data-k=price]', l).value, 0) * num($('[data-k=qty]', l).value, 0);
        });
        $('#ototal', body).textContent = money(sum);
      };
      body.addEventListener('click', (e) => {
        if (e.target.closest('[data-add-line]')) {
          box.insertAdjacentHTML('beforeend', line({ stockId: d.stock[0]?.id, name: d.stock[0]?.name, color: d.stock[0]?.variants[0]?.name, size: 'M', qty: 1, price: d.stock[0]?.price || 0 }));
          refresh();
        }
        if (e.target.closest('[data-del-line]')) {
          if ($$('.line', box).length > 1) e.target.closest('.line').remove();
          refresh();
        }
      });
      body.addEventListener('change', (e) => {
        const l = e.target.closest('.line');
        if (l && e.target.dataset.k === 'stock') {
          const st = d.stock.find((s) => s.id === e.target.value);
          $('[data-k=color]', l).innerHTML = (st?.variants || []).map((x) => `<option>${esc(x.name)}</option>`).join('');
          $('[data-k=price]', l).value = st?.price || 0;
        }
        if (l) availability(l);
        refresh();
      });
      body.addEventListener('input', refresh);
      $$('.line', box).forEach(availability);
      $('[name=client]', body).addEventListener('change', (e) => {
        const c = d.clientes.find((x) => x.name === e.target.value);
        if (!c) return;
        const ph = $('[name=phone]', body);
        const wi = $('[name=wilaya]', body);
        if (!ph.value && !c.phone.includes('•')) ph.value = c.phone;
        if (!wi.value) wi.value = c.ville;
      });
    },
    onSubmit: (data, form) => {
      if (!data.client.trim()) return false;
      const lines = $$('.line', form).map((l) => {
        const st = d.stock.find((s) => s.id === $('[data-k=stock]', l).value);
        return { stockId: st?.id || '', name: st?.name || '', color: $('[data-k=color]', l).value, size: $('[data-k=size]', l).value, qty: Math.max(1, num($('[data-k=qty]', l).value, 1)), price: num($('[data-k=price]', l).value, 0) };
      });
      const rec = { client: data.client.trim(), phone: data.phone.trim(), wilaya: data.wilaya.trim(), canal: data.canal, date: data.date || iso(today()), paye: !!data.paye, note: data.note.trim() };
      let target = o;
      if (isNew) {
        target = { id: uid('cm'), num: nextNum, statut: 'nouvelle', stockOut: false, items: lines, ...rec };
        d.commandes.push(target);
      } else {
        // Les articles changent : on rend d'abord au stock ce qui en était sorti
        if (o.stockOut) move(o, 1);
        Object.assign(o, rec, { items: lines });
        o.stockOut = false;
        if (['preparee', 'expediee', 'livree'].includes(o.statut)) move(o, -1);
      }
      setStatut(target, data.statut);
      if (!d.clientes.some((c) => c.name.toLowerCase() === rec.client.toLowerCase())) d.clientes.push({ id: uid('cl'), name: rec.client, phone: rec.phone, ville: rec.wilaya, note: '', since: iso(today()), pro: rec.canal === 'gros', mesures: {} });
      log(`Commande #${target.num} ${isNew ? 'créée' : 'modifiée'} : ${rec.client}, ${money(total(target))}`);
      commit(isNew ? `Commande #${target.num} créée` : 'Commande enregistrée');
    },
    onDanger: () => {
      if (o.stockOut) move(o, 1);
      S.data.commandes = S.data.commandes.filter((x) => x !== o);
      log(`Commande #${o.num} supprimée`);
      commit('Commande supprimée');
    },
  });
}

function line(it) {
  const d = S.data;
  const st = d.stock.find((s) => s.id === it.stockId) || d.stock.find((s) => s.name === it.name) || d.stock[0];
  return `<div class="line">
    <select data-k="stock" aria-label="Article">${d.stock.map((s) => `<option value="${esc(s.id)}"${s === st ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
    <select data-k="color" aria-label="Couleur">${(st?.variants || []).map((x) => `<option${x.name === it.color ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
    <select data-k="size" aria-label="Taille">${SIZES.map((s) => `<option${s === it.size ? ' selected' : ''}>${s}</option>`).join('')}</select>
    <input data-k="qty" type="number" min="1" value="${it.qty}" inputmode="numeric" aria-label="Quantité">
    <input data-k="price" type="number" min="0" step="100" value="${it.price}" inputmode="numeric" aria-label="Prix unitaire (DA)">
    <button type="button" class="b b--icon b--ghost b--xs" data-del-line aria-label="Retirer l'article">${icon('trash')}</button>
    <small class="line__stock"></small>
  </div>`;
}

function availability(l) {
  const st = S.data.stock.find((s) => s.id === $('[data-k=stock]', l).value);
  const v = st?.variants.find((x) => x.name === $('[data-k=color]', l).value);
  const q = v ? Number(v.sizes[$('[data-k=size]', l).value]) || 0 : 0;
  const out = $('.line__stock', l);
  out.textContent = q ? `${q} en stock` : 'Rupture : à produire';
  out.className = `line__stock ${q ? 'txt-good' : 'txt-critical'}`;
}

