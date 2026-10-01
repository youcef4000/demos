// Tableau de bord du jour : rendez-vous, demandes du site, production, achats urgents, stock bas.
import { S, esc, icon, btn, tile, chip, meter, empty, money, fmtNum, plural, rel, ago, thumb, PACE } from '../ui.js';
import { RDV_TYPES, readRequests, iso, today, weekStart, addDays, fmtDate, fmtHour, toMin, fromMin, progressOf, paceOf, stockAlerts, lowMatieres } from '../../store.js';
import { editRdv, confirmRequest, declineRequest } from './planning.js';
import { editModele } from './modeles.js';
import { editAchat, setAchatStatus } from './achats.js';
import { editCommande } from './commandes.js';

export function render(root) {
  const d = S.data;
  const t = today();
  const tid = iso(t);
  const ws = weekStart(t);
  const week = Array.from({ length: 7 }, (_, i) => iso(addDays(ws, i)));
  const active = (r) => r.status !== 'annule';
  const todays = d.rdv.filter((r) => r.date === tid && active(r)).sort((a, b) => a.start.localeCompare(b.start));
  const weekCount = d.rdv.filter((r) => week.includes(r.date) && active(r)).length;
  const reqs = readRequests();
  const prod = d.production;
  const late = prod.filter((p) => paceOf(p) === 'retard');
  const remaining = prod.reduce((a, p) => a + Math.max(0, p.qty - (p.steps?.controle || 0)), 0);
  const toDo = d.commandes.filter((o) => ['nouvelle', 'confirmee', 'preparee'].includes(o.statut));
  const due = d.commandes.filter((o) => ['expediee', 'livree'].includes(o.statut) && !o.paye).reduce((a, o) => a + total(o), 0);
  const alerts = stockAlerts(d);
  const lowM = lowMatieres(d);
  const urgent = d.achats.filter((a) => a.status === 'a-acheter').sort((a, b) => rank(a) - rank(b));
  const open = d.settings.openDays.includes(t.getDay());
  const hour = new Date().getHours();
  const hello = hour < 5 || hour >= 18 ? 'Bonsoir' : 'Bonjour';

  const bits = [];
  bits.push(todays.length ? plural(todays.length, 'rendez-vous', 'rendez-vous') + " aujourd'hui" : open ? "aucun rendez-vous aujourd'hui" : "boutique fermée aujourd'hui");
  if (reqs.length) bits.push(plural(reqs.length, 'demande du site', 'demandes du site') + ' à confirmer');
  if (late.length) bits.push(plural(late.length, 'modèle en retard', 'modèles en retard'));
  if (alerts.length + lowM.length) bits.push(plural(alerts.length + lowM.length, 'alerte de stock', 'alertes de stock'));
  const sentence = bits.join(', ').replace(/^./, (c) => c.toUpperCase()) + '.';

  root.innerHTML = `
    <header class="hello">
      <p class="vh__kicker">${esc(fmtDate(t, { weekday: true, year: true }))}</p>
      <h1 class="hello__title">${hello} <em>${esc(d.settings.owner || 'Melissa')}</em></h1>
      <p class="hello__sub">${esc(sentence)}</p>
      <div class="quick">
        ${btn('Rendez-vous', { act: 'rdv', ic: 'calendar', kind: 'soft' })}
        ${btn('Modèle', { act: 'modele', ic: 'sketch', kind: 'soft' })}
        ${btn('Achat', { act: 'achat', ic: 'bag', kind: 'soft' })}
        ${btn('Commande', { act: 'commande', ic: 'receipt', kind: 'soft' })}
      </div>
    </header>

    <section class="tiles" aria-label="En un coup d'œil">
      ${tile("Rendez-vous aujourd'hui", todays.length, `${plural(weekCount, 'cette semaine', 'cette semaine')}`)}
      ${tile('Pièces en production', fmtNum(remaining), `${plural(prod.length, 'modèle', 'modèles')}${late.length ? ` · <b class="txt-critical">${icon('alert')}${late.length} en retard</b>` : ''}`)}
      ${tile('Commandes à traiter', toDo.length, due ? `${money(due)} à encaisser` : 'Tout est encaissé')}
      ${tile('Alertes de stock', alerts.length + lowM.length, `${plural(alerts.length, 'taille', 'tailles')} · ${plural(lowM.length, 'matière', 'matières')}`)}
    </section>

    <div class="dash">
      ${reqs.length ? `<section class="panel panel--req dash__wide">
        <header class="panel__head"><h2>${icon('heart')}Demandes du site <em class="badge">${reqs.length}</em></h2><a href="#/planning">Planning →</a></header>
        <ul class="reqs">${reqs
          .slice(0, 4)
          .map(
            (r) => `<li class="req" data-req="${esc(r.id)}"><span class="req__when"><b>${esc(fmtDate(r.date, { weekday: true, short: true }))}</b>${esc(fmtHour(r.start))}</span>
            <span class="req__who"><b>${esc(r.name)}</b><small><i class="tdot" style="--c:${RDV_TYPES[r.type]?.color}"></i>${esc(RDV_TYPES[r.type]?.label || '')} · ${esc(r.phone)}</small></span>
            <span class="req__acts"><button type="button" class="b b--dark b--sm" data-act="req-ok">${icon('check')}<span>Confirmer</span></button><button type="button" class="b b--ghost b--sm b--danger" data-act="req-no">Refuser</button></span></li>`,
          )
          .join('')}</ul>
      </section>` : ''}

      <section class="panel">
        <header class="panel__head"><h2>${icon('clock')}Aujourd'hui</h2><a href="#/planning">Semaine →</a></header>
        ${
          todays.length
            ? `<ol class="tl">${todays
                .map((r) => {
                  const ty = RDV_TYPES[r.type] || RDV_TYPES.interne;
                  const end = fromMin(toMin(r.start) + Number(r.duration || 60));
                  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
                  const past = toMin(end) <= nowMin;
                  return `<li class="tl__i${past ? ' is-past' : ''}" style="--c:${ty.color}"><button type="button" data-rdv="${esc(r.id)}"><span class="tl__time">${esc(fmtHour(r.start))}</span><span class="tl__body"><b>${esc(r.title)}</b><small>${esc(ty.label)} · jusqu'à ${esc(fmtHour(end))}${r.status === 'a-confirmer' ? ' · à confirmer' : ''}</small>${r.note ? `<small class="tl__note">${esc(r.note)}</small>` : ''}</span></button></li>`;
                })
                .join('')}</ol>`
            : empty(open ? 'Journée libre : idéale pour avancer la production.' : "La boutique est fermée aujourd'hui.")
        }
      </section>

      <section class="panel">
        <header class="panel__head"><h2>${icon('needle')}Production en cours</h2><a href="#/production">Détail →</a></header>
        ${
          prod.length
            ? `<ul class="plist">${prod
                .slice()
                .sort((a, b) => a.deadline.localeCompare(b.deadline))
                .map((p) => {
                  const pr = progressOf(p);
                  const pc = PACE[paceOf(p)];
                  return `<li><a href="#/production" class="plist__i">${thumb(p, 'thumb--s')}<span class="plist__body"><span class="plist__top"><b>${esc(p.name)}</b><span class="plist__pct">${Math.round(pr * 100)}&nbsp;%</span></span>${meter(pr, pc.tone === 'critical' ? 'critical' : 'good', `${p.name} : ${Math.round(pr * 100)} %`)}<small>${chip(pc.label, pc.tone, pc.icon)} Livraison ${esc(rel(p.deadline))} · ${fmtNum(p.qty)} pièces</small></span></a></li>`;
                })
                .join('')}</ul>`
            : empty('Aucun modèle en production.', '<a class="b b--ghost b--sm" href="#/modeles">Voir les modèles à réaliser</a>')
        }
      </section>

      <section class="panel">
        <header class="panel__head"><h2>${icon('bag')}À acheter</h2><a href="#/achats">Liste →</a></header>
        ${
          urgent.length
            ? `<ul class="buy">${urgent
                .slice(0, 5)
                .map(
                  (a) => `<li class="buy__i" data-achat="${esc(a.id)}"><button type="button" class="buy__check" data-act="ordered" aria-label="Marquer « ${esc(a.name)} » comme commandé">${icon('check')}</button><button type="button" class="buy__body" data-act="edit-achat"><b>${esc(a.name)}</b><small>${fmtNum(a.qty)} ${esc(a.unit)}${a.modele ? ` · pour ${esc(a.modele)}` : ''}</small></button>${a.urgency === 'urgent' ? chip('Urgent', 'critical', 'alert') : chip(a.urgency === 'semaine' ? 'Cette semaine' : 'Plus tard', a.urgency === 'semaine' ? 'warning' : '')}</li>`,
                )
                .join('')}</ul><p class="panel__foot">Budget estimé : <b>${money(urgent.reduce((x, a) => x + (Number(a.price) || 0), 0))}</b></p>`
            : empty('Rien à acheter pour le moment.')
        }
      </section>

      <section class="panel">
        <header class="panel__head"><h2>${icon('box')}Stock bas</h2><a href="#/stock">Stock →</a></header>
        ${
          alerts.length + lowM.length
            ? `<ul class="low">${alerts
                .slice(0, 5)
                .map((x) => `<li><span class="low__name"><i class="tdot" style="--c:${esc(x.variant.hex)}"></i>${esc(x.item.name)} <small>${esc(x.variant.name)} · ${esc(x.size)}</small></span>${x.qty === 0 ? chip('Rupture', 'critical', 'alert') : chip(`${x.qty} restante${x.qty > 1 ? 's' : ''}`, 'warning')}</li>`)
                .join('')}${lowM
                .slice(0, 3)
                .map((m) => `<li><span class="low__name">${icon('fabric')}${esc(m.name)} <small>${fmtNum(m.qty)} ${esc(m.unit)} / seuil ${fmtNum(m.threshold)}</small></span>${chip('À racheter', 'warning')}</li>`)
                .join('')}</ul>`
            : empty('Tout est en stock.')
        }
      </section>

      <section class="panel">
        <header class="panel__head"><h2>${icon('receipt')}Commandes à traiter</h2><a href="#/commandes">Toutes →</a></header>
        ${
          toDo.length
            ? `<ul class="olist">${toDo
                .slice(0, 5)
                .map((o) => `<li><button type="button" data-cmd="${esc(o.id)}"><span><b>#${o.num} · ${esc(o.client)}</b><small>${esc(o.items.map((i) => `${i.name} ${i.size} ×${i.qty}`).join(', '))}</small></span><span class="olist__right">${money(total(o))}<small>${esc({ nouvelle: 'Nouvelle', confirmee: 'Confirmée', preparee: 'Préparée' }[o.statut])}</small></span></button></li>`)
                .join('')}</ul>`
            : empty('Aucune commande en attente.')
        }
      </section>

      <section class="panel">
        <header class="panel__head"><h2>${icon('heart')}Dernières nouvelles</h2></header>
        <ul class="news">${(d.journal || [])
          .slice(0, 6)
          .map((j) => `<li><span>${esc(j.text)}</span><small>${esc(ago(j.at))}</small></li>`)
          .join('') || '<li><span>Rien de neuf pour le moment.</span></li>'}</ul>
      </section>
    </div>
  `;

  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]');
    if (a) {
      const act = a.dataset.act;
      if (act === 'rdv') return editRdv({ date: tid, start: '10:00' });
      if (act === 'modele') return editModele();
      if (act === 'achat') return editAchat();
      if (act === 'commande') return editCommande();
      const li = a.closest('[data-req]');
      const req = li && readRequests().find((r) => r.id === li.dataset.req);
      if (req && act === 'req-ok') return confirmRequest(req);
      if (req && act === 'req-no') return declineRequest(req);
      const ac = a.closest('[data-achat]');
      const item = ac && d.achats.find((x) => x.id === ac.dataset.achat);
      if (item && act === 'ordered') return setAchatStatus(item, 'commande');
      if (item && act === 'edit-achat') return editAchat(item);
    }
    const rv = e.target.closest('[data-rdv]');
    if (rv) {
      const r = d.rdv.find((x) => x.id === rv.dataset.rdv);
      if (r) editRdv(r);
    }
    const cm = e.target.closest('[data-cmd]');
    if (cm) {
      const o = d.commandes.find((x) => x.id === cm.dataset.cmd);
      if (o) editCommande(o);
    }
  });
}

const rank = (a) => ({ urgent: 0, semaine: 1, 'plus-tard': 2 })[a.urgency] ?? 3;
export const total = (o) => o.items.reduce((a, i) => a + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
