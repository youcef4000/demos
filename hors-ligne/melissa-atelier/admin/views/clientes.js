// Clientes : coordonnées, mensurations pour le sur-mesure, historique des rendez-vous et commandes.
import { S, $, $$, esc, icon, head, btn, commit, log, openSheet, closeSheet, field, input, area, uid, num, ava, chip, money, empty, waLink, norm } from '../ui.js';
import { RDV_TYPES, iso, today, fmtDate, fmtHour } from '../../store.js';
import { editRdv } from './planning.js';
import { total } from './commandes.js';

let q = '';
let pros = false;

export const MESURES = [
  ['poitrine', 'Tour de poitrine'],
  ['taille', 'Tour de taille'],
  ['hanches', 'Tour de hanches'],
  ['epaules', 'Carrure épaules'],
  ['manche', 'Longueur de manche'],
  ['longueur', 'Longueur totale'],
];

const history = (c) => {
  const k = norm(c.name);
  const rdv = S.data.rdv.filter((r) => r.clientId === c.id || norm(r.title) === k).sort((a, b) => b.date.localeCompare(a.date));
  const cmds = S.data.commandes.filter((o) => o.clientId === c.id || norm(o.client) === k).sort((a, b) => b.date.localeCompare(a.date));
  return { rdv, cmds };
};

export function render(root) {
  const t = iso(today());
  const list = S.data.clientes
    .filter((c) => (!pros || c.pro) && (!q || norm(`${c.name} ${c.ville} ${c.phone}`).includes(norm(q))))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  root.innerHTML = `
    ${head({ kicker: 'Boutique', title: 'Clientes', sub: `${S.data.clientes.length} fiches · mensurations, rendez-vous et commandes au même endroit.`, actions: btn('Cliente', { act: 'new', ic: 'plus' }) })}
    <div class="bar">
      <label class="search">${icon('search')}<input type="search" placeholder="Rechercher un nom, une ville, un numéro…" value="${esc(q)}" aria-label="Rechercher une cliente" data-q></label>
      <label class="switch switch--s"><input type="checkbox" data-pros${pros ? ' checked' : ''}><i></i><span>Revendeuses</span></label>
    </div>
    <ul class="clients">${list
      .map((c) => {
        const h = history(c);
        const next = h.rdv.filter((r) => r.date >= t && r.status !== 'annule').pop();
        const spent = h.cmds.filter((o) => o.statut !== 'retour').reduce((a, o) => a + total(o), 0);
        const measured = Object.values(c.mesures || {}).filter(Boolean).length;
        return `<li><button type="button" class="client" data-cl="${esc(c.id)}">
          ${ava(c.name)}
          <span class="client__body"><b>${esc(c.name)}</b><small>${esc(c.ville || '—')} · ${esc(c.phone || 'pas de numéro')}</small>
            <span class="client__tags">${c.pro ? chip('Revendeuse', 'info') : ''}${measured ? chip(`${measured} mesures`, '') : ''}${next ? chip(`RDV ${fmtDate(next.date, { short: true })}`, 'good', 'calendar') : ''}</span></span>
          <span class="client__right"><b>${h.cmds.length}</b><small>commande${h.cmds.length > 1 ? 's' : ''}</small>${spent ? `<small>${money(spent)}</small>` : ''}</span>
        </button></li>`;
      })
      .join('') || `<li>${empty('Aucune cliente ne correspond.')}</li>`}</ul>
  `;
  root.addEventListener('input', (e) => {
    if (!e.target.matches('[data-q]')) return;
    q = e.target.value;
    const pos = e.target.selectionStart;
    S.render();
    const inp = $('[data-q]');
    inp.focus();
    inp.setSelectionRange(pos, pos);
  });
  root.addEventListener('change', (e) => {
    if (e.target.matches('[data-pros]')) {
      pros = e.target.checked;
      S.render();
    }
  });
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-act="new"]')) return editCliente();
    const b = e.target.closest('[data-cl]');
    const c = b && S.data.clientes.find((x) => x.id === b.dataset.cl);
    if (c) editCliente(c);
  });
}

export function editCliente(c = null) {
  const isNew = !c;
  const v = c || { name: '', phone: '', ville: '', note: '', pro: false, mesures: {} };
  const h = isNew ? { rdv: [], cmds: [] } : history(v);
  const wa = waLink(v.phone, `Bonjour ${v.name}, `);
  openSheet({
    title: isNew ? 'Nouvelle cliente' : v.name,
    danger: isNew ? '' : 'Supprimer la fiche',
    wide: true,
    body: `${!isNew && (wa || (v.phone && !v.phone.includes('•'))) ? `<p class="sheet__links"><a class="b b--ghost b--sm" href="tel:${esc(v.phone.replace(/[^\d+]/g, ''))}">${icon('phone')}<span>Appeler</span></a>${wa ? `<a class="b b--ghost b--sm" href="${esc(wa)}" target="_blank" rel="noopener">${icon('wa')}<span>WhatsApp</span></a>` : ''}</p>` : ''}
    <div class="fgrid">
      ${field('Nom', input('name', v.name, 'required'), { wide: true })}
      ${field('Téléphone', input('phone', v.phone, 'type="tel" inputmode="tel"'))}
      ${field('Ville', input('ville', v.ville))}
      <div class="f f--wide"><label class="switch"><input type="checkbox" name="pro"${v.pro ? ' checked' : ''}><i></i><span>Revendeuse (achat en gros)</span></label></div>
    </div>
    <fieldset class="mesures"><legend>Mensurations <small>en cm</small></legend>
      ${MESURES.map(([k, l]) => `<label><span>${l}</span><input name="m_${k}" type="number" min="0" step="0.5" inputmode="decimal" value="${esc(v.mesures?.[k] ?? '')}"></label>`).join('')}
    </fieldset>
    <div class="fgrid">${field('Notes', area('note', v.note, 'placeholder="Préférences, tailles habituelles, retouches…"'), { wide: true })}</div>
    ${
      isNew
        ? ''
        : `<div class="hist"><h3>Historique</h3>
      ${h.rdv.length + h.cmds.length ? `<ul>${[
        ...h.rdv.slice(0, 6).map((r) => `<li><span class="tdot" style="--c:${RDV_TYPES[r.type]?.color}"></span><span>${esc(RDV_TYPES[r.type]?.label || 'Rendez-vous')} · ${esc(fmtDate(r.date, { short: true }))} à ${esc(fmtHour(r.start))}</span><small>${esc({ confirme: 'confirmé', 'a-confirmer': 'à confirmer', termine: 'terminé', annule: 'annulé' }[r.status] || '')}</small></li>`),
        ...h.cmds.slice(0, 6).map((o) => `<li>${icon('receipt')}<span>Commande #${o.num} · ${esc(fmtDate(o.date, { short: true }))}</span><small>${money(total(o))}</small></li>`),
      ].join('')}</ul>` : '<p class="f__hint">Pas encore de rendez-vous ni de commande.</p>'}
      <button type="button" class="b b--soft b--sm" data-new-rdv>${icon('calendar')}<span>Prendre rendez-vous</span></button></div>`
    }`,
    onMount: (body) => {
      $('[data-new-rdv]', body)?.addEventListener('click', () => {
        closeSheet();
        setTimeout(() => editRdv({ title: v.name, phone: v.phone.includes('•') ? '' : v.phone, type: 'mesures', date: iso(today()), start: '10:00' }), 30);
      });
    },
    onSubmit: (d) => {
      if (!d.name.trim()) return false;
      const mesures = Object.fromEntries(MESURES.map(([k]) => [k, d[`m_${k}`] === '' ? '' : num(d[`m_${k}`], '')]).filter(([, x]) => x !== ''));
      const rec = { name: d.name.trim(), phone: d.phone.trim(), ville: d.ville.trim(), pro: !!d.pro, note: d.note.trim(), mesures };
      if (isNew) S.data.clientes.push({ id: uid('cl'), since: iso(today()), ...rec });
      else Object.assign(c, rec);
      log(`Fiche ${isNew ? 'créée' : 'mise à jour'} : ${rec.name}`);
      commit('Fiche enregistrée');
    },
    onDanger: () => {
      S.data.clientes = S.data.clientes.filter((x) => x !== c);
      commit('Fiche supprimée');
    },
  });
  $$('.mesures input').forEach((i) => i.setAttribute('placeholder', '—'));
}
