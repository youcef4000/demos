// Stock : pièces finies (couleur × taille), tissus et fournitures, mouvements.
import { S, $, esc, icon, head, btn, commit, log, openSheet, field, group, input, select, colorChoice, colorsFrom, photoField, bindPhoto, uid, num, thumb, tile, chip, meter, fmtNum, money, ago, empty, toast, norm } from '../ui.js';
import { SIZES, totalOf, stockAlerts, lowMatieres, iso, today, COLORS } from '../../store.js';

let tab = 'pieces';
let onlyAlerts = false;

const CATS = [
  ['tissu', 'Tissu'],
  ['fourniture', 'Fourniture'],
  ['emballage', 'Emballage'],
];
const UNITS = [
  ['m', 'mètres'],
  ['pièces', 'pièces'],
  ['bobines', 'bobines'],
  ['rouleaux', 'rouleaux'],
  ['lot', 'lots'],
];

export function render(root) {
  const d = S.data;
  const alerts = stockAlerts(d);
  const low = lowMatieres(d);
  root.innerHTML = `
    ${head({ kicker: 'Boutique', title: 'Stock', sub: 'Pièces finies par couleur et par taille, tissus et fournitures.', actions: tab === 'pieces' ? btn('Article', { act: 'new-item', ic: 'plus' }) : tab === 'matieres' ? btn('Matière', { act: 'new-mat', ic: 'plus' }) : '' })}
    <div class="seg" role="tablist" aria-label="Stock">
      <button type="button" role="tab" data-tab="pieces" aria-selected="${tab === 'pieces'}">Pièces finies${alerts.length ? ` <em class="badge badge--warn">${alerts.length}</em>` : ''}</button>
      <button type="button" role="tab" data-tab="matieres" aria-selected="${tab === 'matieres'}">Tissus & fournitures${low.length ? ` <em class="badge badge--warn">${low.length}</em>` : ''}</button>
      <button type="button" role="tab" data-tab="journal" aria-selected="${tab === 'journal'}">Mouvements</button>
    </div>
    ${tab === 'pieces' ? pieces(alerts) : tab === 'matieres' ? matieres(low) : journal()}
  `;
  bind(root);
}

function pieces(alerts) {
  const d = S.data;
  const total = d.stock.reduce((a, it) => a + totalOf(it), 0);
  const value = d.stock.reduce((a, it) => a + totalOf(it) * (Number(it.price) || 0), 0);
  const list = onlyAlerts ? d.stock.filter((it) => alerts.some((x) => x.item === it)) : d.stock;
  return `
    <section class="tiles tiles--3">
      ${tile('Pièces en stock', fmtNum(total))}
      ${tile('Valeur du stock', money(value), 'au prix de vente')}
      ${tile('Tailles à réassortir', alerts.length, `${alerts.filter((x) => x.qty === 0).length} en rupture`)}
    </section>
    <div class="bar">
      <label class="switch switch--s"><input type="checkbox" data-only${onlyAlerts ? ' checked' : ''}><i></i><span>Seulement les alertes</span></label>
      <p class="legend-s"><span><i class="cell-key cell-key--out"></i>Rupture</span><span><i class="cell-key cell-key--low"></i>Stock bas (≤ seuil)</span></p>
    </div>
    <div class="stocks">${list
      .map((it) => {
        const sizes = SIZES;
        return `<article class="sitem" data-item="${esc(it.id)}">
        <header class="sitem__head">${thumb(it, 'thumb--s')}<div><h2>${esc(it.name)}</h2><p>${it.price ? money(it.price) : 'Prix à définir'} · ${fmtNum(totalOf(it))} pièces · seuil ${it.threshold}</p></div>
          <button type="button" class="b b--icon b--ghost b--xs" data-act="edit-item" aria-label="Modifier ${esc(it.name)}">${icon('edit')}</button></header>
        <table class="matrix">
          <thead><tr><th scope="col"><span class="sr-only">Couleur</span></th>${sizes.map((s) => `<th scope="col">${s}</th>`).join('')}<th scope="col">Total</th></tr></thead>
          <tbody>${it.variants
            .map(
              (v) => `<tr><th scope="row"><i class="tdot" style="--c:${esc(v.hex)}"></i>${esc(v.name)}</th>${sizes
                .map((s) => {
                  const q = Number(v.sizes?.[s]) || 0;
                  const st = q === 0 ? 'out' : q <= it.threshold ? 'low' : '';
                  return `<td><button type="button" class="cell${st ? ` cell--${st}` : ''}" data-act="cell" data-v="${esc(v.name)}" data-s="${s}" aria-label="${esc(`${v.name} taille ${s} : ${q} pièce${q > 1 ? 's' : ''}${st === 'out' ? ', rupture' : st === 'low' ? ', stock bas' : ''}`)}">${q}${st ? icon('alert') : ''}</button></td>`;
                })
                .join('')}<td class="matrix__tot">${Object.values(v.sizes || {}).reduce((a, x) => a + (Number(x) || 0), 0)}</td></tr>`,
            )
            .join('')}</tbody>
        </table>
      </article>`;
      })
      .join('') || empty(onlyAlerts ? 'Aucune alerte : tout est bien rangé.' : 'Aucun article en stock.')}</div>`;
}

function matieres(low) {
  const d = S.data;
  const sup = (id) => d.fournisseurs.find((f) => f.id === id)?.name || '';
  const open = (m) => d.achats.some((a) => a.status !== 'recu' && (a.matiereId === m.id || norm(a.name) === norm(m.name)));
  return `
    <section class="tiles tiles--3">
      ${tile('Tissus', fmtNum(d.matieres.filter((m) => m.cat === 'tissu').reduce((a, m) => a + Number(m.qty || 0), 0)) + ' m', `${d.matieres.filter((m) => m.cat === 'tissu').length} références`)}
      ${tile('Fournitures et emballages', d.matieres.filter((m) => m.cat !== 'tissu').length, 'références')}
      ${tile('Sous le seuil', low.length, low.length ? 'à racheter' : 'tout va bien')}
    </section>
    ${CATS.map(([cat, label]) => {
      const items = d.matieres.filter((m) => m.cat === cat);
      if (!items.length) return '';
      return `<section class="panel panel--flat"><header class="panel__head"><h2>${icon(cat === 'tissu' ? 'fabric' : cat === 'emballage' ? 'bag' : 'scissors')}${label}s</h2></header>
      <ul class="mats">${items
        .map((m) => {
          const ratio = Number(m.qty) / Math.max(1, Number(m.threshold) * 2);
          const isLow = Number(m.qty) < Number(m.threshold);
          return `<li class="mat" data-mat="${esc(m.id)}">
            <button type="button" class="mat__name" data-act="edit-mat">${m.hex ? `<i class="swatch" style="--c:${esc(m.hex)}"></i>` : ''}<span><b>${esc(m.name)}</b><small>${esc(sup(m.supplierId) || 'Fournisseur ?')} · seuil ${fmtNum(m.threshold)} ${esc(m.unit)}</small></span></button>
            <span class="mat__level">${meter(ratio, isLow ? 'critical' : 'good', `${m.qty} ${m.unit}, seuil ${m.threshold}`)}${isLow ? chip('Sous le seuil', 'critical', 'alert') : ''}</span>
            <span class="mat__qty"><button type="button" class="b b--icon b--ghost b--xs" data-act="m-minus" aria-label="Moins">−</button><b>${fmtNum(m.qty)}</b><small>${esc(m.unit)}</small><button type="button" class="b b--icon b--ghost b--xs" data-act="m-plus" aria-label="Plus">+</button></span>
            ${isLow ? (open(m) ? '<span class="mat__ordered">Dans les achats</span>' : `<button type="button" class="b b--soft b--xs" data-act="buy">${icon('bag')}<span>Racheter</span></button>`) : '<span></span>'}
          </li>`;
        })
        .join('')}</ul></section>`;
    }).join('')}`;
}

function journal() {
  const j = S.data.journal || [];
  return `<section class="panel panel--flat"><ul class="news news--full">${j.map((x) => `<li><span>${esc(x.text)}</span><small>${esc(ago(x.at))}</small></li>`).join('') || '<li><span>Aucun mouvement pour le moment.</span></li>'}</ul></section>`;
}

const step = (m) => (m.unit === 'm' ? 1 : m.unit === 'pièces' ? 10 : 1);

function bind(root) {
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (t) {
      tab = t.dataset.tab;
      return S.render();
    }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    if (act === 'new-item') return editItem();
    if (act === 'new-mat') return editMat();
    const it = S.data.stock.find((x) => x.id === a.closest('[data-item]')?.dataset.item);
    if (it && act === 'edit-item') return editItem(it);
    if (it && act === 'cell') return editCell(it, it.variants.find((v) => v.name === a.dataset.v), a.dataset.s);
    const m = S.data.matieres.find((x) => x.id === a.closest('[data-mat]')?.dataset.mat);
    if (!m) return;
    if (act === 'edit-mat') return editMat(m);
    if (act === 'm-minus' || act === 'm-plus') {
      const before = Number(m.qty);
      m.qty = Math.max(0, before + (act === 'm-plus' ? 1 : -1) * step(m));
      log(`${m.name} : ${fmtNum(before)} → ${fmtNum(m.qty)} ${m.unit}`);
      return commit();
    }
    if (act === 'buy') {
      const qty = Math.max(step(m), Math.ceil((Number(m.threshold) * 2 - Number(m.qty)) / step(m)) * step(m));
      S.data.achats.push({ id: uid('ac'), name: m.name, cat: m.cat, qty, unit: m.unit, price: 0, urgency: 'semaine', status: 'a-acheter', supplierId: m.supplierId || '', matiereId: m.id, modele: '', note: 'Ajouté depuis le stock', created: iso(today()) });
      log(`Achat ajouté : ${fmtNum(qty)} ${m.unit} de ${m.name}`);
      commit();
      toast(`${m.name} ajouté aux achats`, false, { href: '#/achats', label: 'Voir la liste' });
    }
  });
  root.addEventListener('change', (e) => {
    if (e.target.matches('[data-only]')) {
      onlyAlerts = e.target.checked;
      S.render();
    }
  });
}

// Ajuster une case couleur × taille
const REASONS = [
  ['vente', 'Vente en boutique'],
  ['commande', 'Commande expédiée'],
  ['retour', 'Retour cliente'],
  ['production', 'Arrivée de production'],
  ['inventaire', 'Correction d\'inventaire'],
];
function editCell(it, v, size) {
  if (!v) return;
  const q = Number(v.sizes[size]) || 0;
  openSheet({
    title: `${it.name}`,
    submit: 'Mettre à jour',
    noFocus: true,
    body: `<p class="lead"><i class="tdot" style="--c:${esc(v.hex)}"></i>${esc(v.name)} · taille <b>${esc(size)}</b></p>
      <div class="stepper"><button type="button" class="b b--ghost b--icon" data-d="-1" aria-label="Une de moins">−</button><input name="qty" type="number" min="0" inputmode="numeric" value="${q}" aria-label="Quantité"><button type="button" class="b b--ghost b--icon" data-d="1" aria-label="Une de plus">+</button></div>
      <div class="fgrid">${field('Raison', select('reason', REASONS, 'vente'), { wide: true })}</div>`,
    onMount: (body) => {
      const inp = $('[name=qty]', body);
      const reason = $('[name=reason]', body);
      body.addEventListener('click', (e) => {
        const b = e.target.closest('[data-d]');
        if (!b) return;
        inp.value = Math.max(0, num(inp.value, 0) + Number(b.dataset.d));
        reason.value = num(inp.value, 0) < q ? 'vente' : 'retour';
      });
    },
    onSubmit: (d) => {
      const n = Math.max(0, num(d.qty, q));
      if (n === q) return;
      v.sizes[size] = n;
      const r = REASONS.find(([k]) => k === d.reason)?.[1] || '';
      log(`${it.name} · ${v.name} ${size} : ${q} → ${n} (${r.toLowerCase()})`);
      commit(n === 0 ? `${v.name} ${size} : rupture de stock` : 'Stock mis à jour');
    },
  });
}

export function editItem(it = null) {
  const isNew = !it;
  const v = it || { name: '', price: '', threshold: 2, img: '', variants: [] };
  openSheet({
    title: isNew ? 'Nouvel article' : v.name,
    danger: isNew ? '' : 'Supprimer',
    wide: true,
    body: `<div class="fgrid">
      ${field('Nom', input('name', v.name, 'required'), { wide: true })}
      ${field('Prix de vente (DA)', input('price', v.price, 'type="number" min="0" step="100" inputmode="numeric"'))}
      ${field('Seuil d\'alerte', input('threshold', v.threshold, 'type="number" min="0" inputmode="numeric"'), { hint: 'Alerte quand une taille descend à ce nombre.' })}
      ${group('Couleurs disponibles', colorChoice('colors', v.variants), { hint: 'Retirer une couleur efface son stock.' })}
      ${photoField('img', v.img)}
    </div>`,
    onMount: bindPhoto,
    onSubmit: (d) => {
      if (!d.name.trim()) return false;
      const chosen = colorsFrom(d.colors);
      const variants = chosen.map((c) => v.variants.find((x) => x.name === c.name) || { ...c, sizes: Object.fromEntries(SIZES.map((s) => [s, 0])) });
      const rec = { name: d.name.trim(), price: num(d.price, 0), threshold: Math.max(0, num(d.threshold, 2)), img: d.img, variants };
      if (isNew) S.data.stock.push({ id: uid('st'), ...rec });
      else Object.assign(it, rec);
      log(`Article ${isNew ? 'créé' : 'modifié'} : ${rec.name}`);
      commit('Article enregistré');
    },
    onDanger: () => {
      S.data.stock = S.data.stock.filter((x) => x !== it);
      log(`Article supprimé : ${it.name}`);
      commit('Article supprimé');
    },
  });
}

export function editMat(m = null) {
  const isNew = !m;
  const v = m || { name: '', cat: 'tissu', qty: 0, unit: 'm', threshold: 10, supplierId: '', hex: '' };
  const sups = [['', '—'], ...S.data.fournisseurs.map((f) => [f.id, f.name])];
  const hexes = [['', 'Sans couleur'], ...Object.values(COLORS).map((c) => [c.hex, c.name])];
  openSheet({
    title: isNew ? 'Nouvelle matière' : v.name,
    danger: isNew ? '' : 'Supprimer',
    body: `<div class="fgrid">
      ${field('Nom', input('name', v.name, 'required placeholder="Ex. Lin lavé sauge, boutons dorés…"'), { wide: true })}
      ${field('Catégorie', select('cat', CATS, v.cat))}
      ${field('Couleur', select('hex', hexes, v.hex))}
      ${field('Quantité', input('qty', v.qty, 'type="number" min="0" step="0.5" inputmode="decimal"'))}
      ${field('Unité', select('unit', UNITS, v.unit))}
      ${field('Seuil d\'alerte', input('threshold', v.threshold, 'type="number" min="0" inputmode="decimal"'))}
      ${field('Fournisseur', select('supplierId', sups, v.supplierId))}
    </div>`,
    onSubmit: (d) => {
      if (!d.name.trim()) return false;
      const rec = { name: d.name.trim(), cat: d.cat, qty: Math.max(0, num(d.qty, 0)), unit: d.unit, threshold: Math.max(0, num(d.threshold, 0)), supplierId: d.supplierId, hex: d.hex };
      if (isNew) S.data.matieres.push({ id: uid('mt'), ...rec });
      else Object.assign(m, rec);
      log(`Matière ${isNew ? 'ajoutée' : 'modifiée'} : ${rec.name}`);
      commit('Matière enregistrée');
    },
    onDanger: () => {
      S.data.matieres = S.data.matieres.filter((x) => x !== m);
      log(`Matière supprimée : ${m.name}`);
      commit('Matière supprimée');
    },
  });
}
