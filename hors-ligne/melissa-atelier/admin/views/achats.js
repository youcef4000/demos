// Achats : liste de ce qu'il faut acheter, suggestions tirées du stock, fournisseurs.
import { S, esc, icon, head, btn, commit, log, openSheet, field, input, area, select, uid, num, tile, chip, fmtNum, money, empty, norm, waLink } from '../ui.js';
import { lowMatieres, iso, today, fmtDate } from '../../store.js';

let tab = 'liste';

export const URG = {
  urgent: { label: 'Urgent', tone: 'critical', icon: 'alert' },
  semaine: { label: 'Cette semaine', tone: 'warning', icon: 'clock' },
  'plus-tard': { label: 'Plus tard', tone: '', icon: '' },
};
const STATUS = [
  ['a-acheter', 'À acheter'],
  ['commande', 'Commandé'],
  ['recu', 'Reçu'],
];
const CATS = [
  ['tissu', 'Tissu'],
  ['fourniture', 'Fourniture'],
  ['emballage', 'Emballage'],
  ['equipement', 'Équipement'],
];
const rank = (a) => ({ urgent: 0, semaine: 1, 'plus-tard': 2 })[a.urgency] ?? 3;
const supName = (id) => S.data.fournisseurs.find((f) => f.id === id)?.name || '';

export function render(root) {
  root.innerHTML = `
    ${head({ kicker: 'Boutique', title: 'Achats', sub: 'Tissus, fournitures et emballages à acheter, et les fournisseurs.', actions: tab === 'liste' ? btn('Achat', { act: 'new', ic: 'plus' }) : btn('Fournisseur', { act: 'new-sup', ic: 'plus' }) })}
    <div class="seg" role="tablist" aria-label="Achats">
      <button type="button" role="tab" data-tab="liste" aria-selected="${tab === 'liste'}">Liste d'achats</button>
      <button type="button" role="tab" data-tab="fournisseurs" aria-selected="${tab === 'fournisseurs'}">Fournisseurs</button>
    </div>
    ${tab === 'liste' ? liste() : fournisseurs()}
  `;
  bind(root);
}

function liste() {
  const d = S.data;
  const todo = d.achats.filter((a) => a.status === 'a-acheter').sort((a, b) => rank(a) - rank(b));
  const ordered = d.achats.filter((a) => a.status === 'commande');
  const got = d.achats.filter((a) => a.status === 'recu').sort((a, b) => String(b.received || b.created).localeCompare(String(a.received || a.created)));
  const inList = (m) => d.achats.some((a) => a.status !== 'recu' && (a.matiereId === m.id || norm(a.name) === norm(m.name)));
  const sugg = lowMatieres(d).filter((m) => !inList(m));
  const budget = todo.reduce((x, a) => x + (Number(a.price) || 0), 0);
  return `
    <section class="tiles tiles--3">
      ${tile('À acheter', todo.length, `${todo.filter((a) => a.urgency === 'urgent').length} urgent${todo.filter((a) => a.urgency === 'urgent').length > 1 ? 's' : ''}`)}
      ${tile('Budget estimé', money(budget), 'pour la liste à acheter')}
      ${tile('Commandés', ordered.length, 'en attente de livraison')}
    </section>
    ${sugg.length ? `<section class="panel panel--sugg"><header class="panel__head"><h2>${icon('alert')}Sous le seuil, pas encore dans la liste</h2></header>
      <ul class="sugg">${sugg.map((m) => `<li data-mat="${esc(m.id)}"><span><b>${esc(m.name)}</b><small>${fmtNum(m.qty)} ${esc(m.unit)} en stock · seuil ${fmtNum(m.threshold)}</small></span><button type="button" class="b b--soft b--xs" data-act="add-sugg">${icon('plus')}<span>Ajouter</span></button></li>`).join('')}</ul></section>` : ''}
    <div class="bar">
      <p class="bar__txt">Cochez quand c'est commandé, puis reçu : le stock des matières se met à jour tout seul.</p>
      ${todo.length ? `<a class="b b--ghost b--sm" href="${esc(shareLink(todo))}" target="_blank" rel="noopener">${icon('wa')}<span>Envoyer la liste</span></a>` : ''}
    </div>
    ${block('À acheter', todo, 'a-acheter')}
    ${block('Commandé', ordered, 'commande')}
    ${got.length ? `<details class="panel panel--flat fold"><summary><h2>${icon('check')}Reçus <em>${got.length}</em></h2></summary>${rows(got.slice(0, 15))}</details>` : ''}
  `;
}

function block(title, list, status) {
  return `<section class="panel panel--flat"><header class="panel__head"><h2>${status === 'a-acheter' ? icon('bag') : icon('truck')}${title} <em class="count">${list.length}</em></h2></header>
    ${list.length ? rows(list) : empty(status === 'a-acheter' ? 'La liste est vide. Tout est acheté !' : 'Aucune commande en cours chez les fournisseurs.')}</section>`;
}

function rows(list) {
  return `<ul class="buys">${list
    .map((a) => {
      const u = URG[a.urgency] || URG['plus-tard'];
      const next = a.status === 'a-acheter' ? 'Marquer comme commandé' : a.status === 'commande' ? 'Marquer comme reçu' : 'Remettre à acheter';
      return `<li class="buys__i buys__i--${a.status}" data-achat="${esc(a.id)}">
      <button type="button" class="tick tick--${a.status}" data-act="next" aria-label="${esc(`${a.name} : ${next}`)}" title="${esc(next)}">${a.status === 'commande' ? icon('truck') : icon('check')}</button>
      <button type="button" class="buys__body" data-act="edit"><b>${esc(a.name)}</b><small>${fmtNum(a.qty)} ${esc(a.unit)}${supName(a.supplierId) ? ` · ${esc(supName(a.supplierId))}` : ''}${a.modele ? ` · pour ${esc(a.modele)}` : ''}${a.status === 'recu' && a.received ? ` · reçu le ${esc(fmtDate(a.received, { short: true }))}` : ''}</small>${a.note ? `<small class="buys__note">${esc(a.note)}</small>` : ''}</button>
      <span class="buys__right">${a.price ? `<b>${money(a.price)}</b>` : '<small>Prix ?</small>'}${a.status === 'a-acheter' ? chip(u.label, u.tone, u.icon) : ''}</span>
    </li>`;
    })
    .join('')}</ul>`;
}

// Liste à envoyer (à soi-même, à un fournisseur ou à la personne qui va acheter), groupée par fournisseur
function shareLink(todo) {
  const groups = {};
  todo.forEach((a) => (groups[supName(a.supplierId) || 'Divers'] ||= []).push(a));
  const text = `Liste d'achats — Melissa Atelier (${fmtDate(iso(today()), { short: true })})\n\n${Object.entries(groups)
    .map(([g, list]) => `*${g}*\n${list.map((a) => `• ${a.name} : ${fmtNum(a.qty)} ${a.unit}${a.urgency === 'urgent' ? ' (urgent)' : ''}`).join('\n')}`)
    .join('\n\n')}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function fournisseurs() {
  const d = S.data;
  return `<div class="sups">${d.fournisseurs
    .map((f) => {
      const open = d.achats.filter((a) => a.supplierId === f.id && a.status !== 'recu');
      const wa = waLink(f.phone, 'Bonjour, ');
      return `<article class="sup" data-sup="${esc(f.id)}">
      <button type="button" class="sup__main" data-act="edit-sup"><b>${esc(f.name)}</b><small>${esc(f.specialite || '')}${f.ville ? ` · ${esc(f.ville)}` : ''}</small><small>${open.length ? `${open.length} achat${open.length > 1 ? 's' : ''} en cours` : 'Rien en cours'}</small></button>
      <span class="sup__acts">${f.phone && !f.phone.includes('•') ? `<a class="b b--ghost b--icon b--xs" href="tel:${esc(f.phone.replace(/[^\d+]/g, ''))}" aria-label="Appeler ${esc(f.name)}">${icon('phone')}</a>` : ''}${wa ? `<a class="b b--ghost b--icon b--xs" href="${esc(wa)}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(f.name)}">${icon('wa')}</a>` : ''}</span>
    </article>`;
    })
    .join('') || empty('Aucun fournisseur enregistré.')}</div>
    <p class="hint">Les numéros d'exemple sont masqués (•••). Remplacez-les par les vrais pour appeler ou écrire en un geste.</p>`;
}

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
    if (act === 'new') return editAchat();
    if (act === 'new-sup') return editSup();
    if (act === 'add-sugg') {
      const m = S.data.matieres.find((x) => x.id === a.closest('[data-mat]').dataset.mat);
      const qty = Math.max(1, Math.ceil(Number(m.threshold) * 2 - Number(m.qty)));
      S.data.achats.push({ id: uid('ac'), name: m.name, cat: m.cat, qty, unit: m.unit, price: 0, urgency: 'semaine', status: 'a-acheter', supplierId: m.supplierId || '', matiereId: m.id, modele: '', note: '', created: iso(today()) });
      log(`Achat ajouté : ${fmtNum(qty)} ${m.unit} de ${m.name}`);
      return commit(`${m.name} ajouté à la liste`);
    }
    const sp = S.data.fournisseurs.find((x) => x.id === a.closest('[data-sup]')?.dataset.sup);
    if (sp && act === 'edit-sup') return editSup(sp);
    const item = S.data.achats.find((x) => x.id === a.closest('[data-achat]')?.dataset.achat);
    if (!item) return;
    if (act === 'edit') return editAchat(item);
    if (act === 'next') setAchatStatus(item, item.status === 'a-acheter' ? 'commande' : item.status === 'commande' ? 'recu' : 'a-acheter');
  });
}

// Changement de statut ; à la réception, la matière liée est ajoutée au stock
export function setAchatStatus(a, status) {
  const prev = a.status;
  if (prev === status) return;
  a.status = status;
  let msg = status === 'commande' ? `${a.name} : commandé` : status === 'recu' ? `${a.name} : reçu` : `${a.name} : remis dans la liste`;
  if (status === 'recu') {
    a.received = iso(today());
    const m = S.data.matieres.find((x) => x.id === a.matiereId) || S.data.matieres.find((x) => norm(x.name) === norm(a.name));
    if (m && m.unit === a.unit) {
      m.qty = Number(m.qty) + Number(a.qty);
      msg += ` · stock ${fmtNum(m.qty)} ${m.unit}`;
    }
  }
  if (prev === 'recu' && status !== 'recu') {
    const m = S.data.matieres.find((x) => x.id === a.matiereId) || S.data.matieres.find((x) => norm(x.name) === norm(a.name));
    if (m && m.unit === a.unit) m.qty = Math.max(0, Number(m.qty) - Number(a.qty));
    delete a.received;
  }
  log(msg);
  commit(msg);
}

export function editAchat(a = null) {
  const isNew = !a;
  const v = a || { name: '', cat: 'tissu', qty: '', unit: 'm', price: '', urgency: 'semaine', status: 'a-acheter', supplierId: '', matiereId: '', modele: '', note: '' };
  const sups = [['', '—'], ...S.data.fournisseurs.map((f) => [f.id, f.name])];
  const mats = [['', 'Aucune'], ...S.data.matieres.map((m) => [m.id, `${m.name} (${fmtNum(m.qty)} ${m.unit})`])];
  const models = [['', '—'], ...[...S.data.production, ...S.data.modeles].map((m) => [m.name, m.name])];
  openSheet({
    title: isNew ? 'Nouvel achat' : v.name,
    danger: isNew ? '' : 'Supprimer',
    body: `<div class="fgrid">
      ${field('Quoi', input('name', v.name, 'required placeholder="Ex. Crêpe chocolat, boutons dorés…"'), { wide: true })}
      ${field('Quantité', input('qty', v.qty, 'type="number" min="0" step="0.5" required inputmode="decimal"'))}
      ${field('Unité', select('unit', [['m', 'mètres'], ['pièces', 'pièces'], ['bobines', 'bobines'], ['rouleaux', 'rouleaux'], ['lot', 'lot']], v.unit))}
      ${field('Catégorie', select('cat', CATS, v.cat))}
      ${field('Urgence', select('urgency', Object.entries(URG).map(([k, x]) => [k, x.label]), v.urgency))}
      ${field('Prix estimé total (DA)', input('price', v.price, 'type="number" min="0" step="100" inputmode="numeric"'))}
      ${field('Statut', select('status', STATUS, v.status))}
      ${field('Fournisseur', select('supplierId', sups, v.supplierId))}
      ${field('Pour le modèle', select('modele', models, v.modele))}
      ${field('Matière du stock liée', select('matiereId', mats, v.matiereId), { wide: true, hint: 'À la réception, la quantité est ajoutée à cette matière.' })}
      ${field('Note', area('note', v.note), { wide: true })}
    </div>`,
    onSubmit: (d) => {
      if (!d.name.trim()) return false;
      const rec = { name: d.name.trim(), qty: num(d.qty, 0), unit: d.unit, cat: d.cat, urgency: d.urgency, price: num(d.price, 0), supplierId: d.supplierId, modele: d.modele, matiereId: d.matiereId, note: d.note.trim() };
      if (isNew) {
        S.data.achats.push({ id: uid('ac'), status: 'a-acheter', created: iso(today()), ...rec });
        const it = S.data.achats[S.data.achats.length - 1];
        if (d.status !== 'a-acheter') return setAchatStatus(it, d.status);
        log(`Achat ajouté : ${rec.name}`);
        commit('Ajouté à la liste');
      } else {
        Object.assign(a, rec);
        if (d.status !== a.status) return setAchatStatus(a, d.status);
        log(`Achat modifié : ${rec.name}`);
        commit('Achat enregistré');
      }
    },
    onDanger: () => {
      S.data.achats = S.data.achats.filter((x) => x !== a);
      log(`Achat supprimé : ${a.name}`);
      commit('Achat supprimé');
    },
  });
}

function editSup(f = null) {
  const isNew = !f;
  const v = f || { name: '', specialite: '', ville: '', phone: '' };
  openSheet({
    title: isNew ? 'Nouveau fournisseur' : v.name,
    danger: isNew ? '' : 'Supprimer',
    body: `<div class="fgrid">
      ${field('Nom', input('name', v.name, 'required'), { wide: true })}
      ${field('Spécialité', input('specialite', v.specialite, 'placeholder="Tissus, mercerie, emballages…"'))}
      ${field('Ville', input('ville', v.ville))}
      ${field('Téléphone', input('phone', v.phone, 'type="tel" inputmode="tel"'), { wide: true })}
    </div>`,
    onSubmit: (d) => {
      if (!d.name.trim()) return false;
      const rec = { name: d.name.trim(), specialite: d.specialite.trim(), ville: d.ville.trim(), phone: d.phone.trim() };
      if (isNew) S.data.fournisseurs.push({ id: uid('fo'), ...rec });
      else Object.assign(f, rec);
      commit('Fournisseur enregistré');
    },
    onDanger: () => {
      S.data.fournisseurs = S.data.fournisseurs.filter((x) => x !== f);
      S.data.achats.forEach((a) => a.supplierId === f.id && (a.supplierId = ''));
      commit('Fournisseur supprimé');
    },
  });
}

