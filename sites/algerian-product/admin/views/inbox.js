// Demandes reçues : devis, candidatures de producteurs, messages. Suivi par statut, notes, réponse.
import { readInbox, writeInbox, esc } from '../../store.js';
import { S, openDrawer, closeDrawer, toast, confirmDo, countryName, fmtDate, tf } from '../ui.js';

const STATUS = {
  quote: [['new', 'Nouvelle'], ['progress', 'En cours'], ['offer', 'Offre envoyée'], ['won', 'Gagnée'], ['lost', 'Perdue']],
  producer: [['new', 'Nouvelle'], ['review', 'À l’étude'], ['accepted', 'Retenue'], ['declined', 'Refusée']],
  contact: [['new', 'Nouveau'], ['done', 'Traité']],
};
const TABS = [['quote', 'Devis'], ['producer', 'Producteurs'], ['contact', 'Messages']];
const label = (type, st) => (STATUS[type].find((x) => x[0] === st) || [st, st])[1];
const LANGN = { fr: 'français', en: 'anglais', ar: 'arabe', es: 'espagnol' };
const TYPES = { importer: 'Importateur', distributor: 'Distributeur', wholesaler: 'Grossiste', chain: 'Chaîne de magasins', industry: 'Industriel / marque', retailer: 'Détaillant / e-commerce', trading: 'Négoce', other: 'Autre' };
const UNITS = { kg: 'kg', t: 't', carton: 'cartons', pallet: 'palettes', c20: 'conteneurs 20′', c40: 'conteneurs 40′', pcs: 'pièces', m2: 'm²' };

// Réponse pré-rédigée dans la langue de la demande
const REPLY = {
  fr: (x) => [`Votre demande ${x.ref} — Algerian Product`, `Bonjour ${x.name || ''},\n\nMerci pour votre demande ${x.ref}. Nous revenons vers vous avec une offre détaillée (prix, conditionnement, délais et documents) dans les meilleurs délais.\n\nBien cordialement,\nAlgerian Product`],
  en: (x) => [`Your request ${x.ref} — Algerian Product`, `Hello ${x.name || ''},\n\nThank you for your request ${x.ref}. We will come back to you shortly with a detailed offer (prices, packaging, lead times and documents).\n\nKind regards,\nAlgerian Product`],
  ar: (x) => [`طلبكم ${x.ref} — Algerian Product`, `السلام عليكم ${x.name || ''}،\n\nشكرًا على طلبكم ${x.ref}. سنعود إليكم قريبًا بعرض مفصل (الأسعار، التعبئة، الآجال والوثائق).\n\nمع خالص التحية،\nAlgerian Product`],
  es: (x) => [`Su solicitud ${x.ref} — Algerian Product`, `Hola ${x.name || ''}:\n\nGracias por su solicitud ${x.ref}. Le enviaremos en breve una oferta detallada (precios, envases, plazos y documentos).\n\nUn cordial saludo,\nAlgerian Product`],
};

export default function inbox(el, app) {
  let tab = 'quote';
  let status = 'all';
  let q = '';
  const deepId = location.hash.split('/')[1];
  if (deepId) tab = readInbox().find((x) => x.id === deepId)?.type || tab;

  const save = (list) => {
    writeInbox(list);
    app.refreshCounts();
  };

  function render() {
    const all = readInbox();
    const list = all.filter((x) => x.type === tab).filter((x) => status === 'all' || x.status === status).filter((x) => !q || JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));
    const counts = Object.fromEntries(TABS.map(([t]) => [t, all.filter((x) => x.type === t && x.status === 'new').length]));
    el.innerHTML = `
      <div class="bar">
        <div class="seg">${TABS.map(([t, l]) => `<button type="button" data-tab="${t}" aria-pressed="${t === tab}">${l}${counts[t] ? ` <b class="badge">${counts[t]}</b>` : ''}</button>`).join('')}</div>
        <input class="bar__search" type="search" placeholder="Rechercher (société, pays, produit…)" value="${esc(q)}" id="ib-q">
        <button class="b b--ghost" type="button" id="ib-csv">Exporter (CSV)</button>
      </div>
      <div class="chips">${[['all', 'Tous'], ...STATUS[tab]].map(([s, l]) => `<button type="button" class="chip" data-status="${s}" aria-pressed="${s === status}">${l} <small>${s === 'all' ? all.filter((x) => x.type === tab).length : all.filter((x) => x.type === tab && x.status === s).length}</small></button>`).join('')}</div>
      ${tab === 'quote' ? pipeline(all.filter((x) => x.type === 'quote')) : ''}
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Réf.</th><th>${tab === 'contact' ? 'Expéditeur' : 'Société'}</th><th>${tab === 'quote' ? 'Produits' : tab === 'producer' ? 'Wilaya · filière' : 'Sujet'}</th><th>${tab === 'quote' ? 'Destination' : 'Langue'}</th><th>Reçue</th><th>Statut</th></tr></thead>
        <tbody>${list.map((x) => row(x)).join('') || `<tr><td colspan="6" class="muted">Aucune demande ici pour l’instant.</td></tr>`}</tbody>
      </table></div>`;
    el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => ((tab = b.dataset.tab), (status = 'all'), render())));
    el.querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => ((status = b.dataset.status), render())));
    el.querySelector('#ib-q').addEventListener('input', (e) => {
      q = e.target.value;
      clearTimeout(render.t);
      render.t = setTimeout(() => {
        render();
        const i = el.querySelector('#ib-q');
        i.focus();
        i.setSelectionRange(q.length, q.length);
      }, 250);
    });
    el.querySelector('#ib-csv').addEventListener('click', () => csv(list));
    el.querySelectorAll('tr[data-id]').forEach((tr) => tr.addEventListener('click', () => detail(tr.dataset.id)));
  }

  function row(x) {
    const what = x.type === 'quote' ? (x.items || []).map((i) => i.name).join(', ') : x.type === 'producer' ? `${x.wilaya || ''} · ${tf(S.draft.sectors.find((s) => s.id === x.sector)?.name)}` : x.subject || x.message?.slice(0, 60);
    return `<tr data-id="${esc(x.id)}" tabindex="0" class="${x.status === 'new' ? 'is-new' : ''}">
      <td class="mono">${esc(x.ref)}${x.sample ? ' <span class="tag">exemple</span>' : ''}</td>
      <td><b>${esc(x.company || x.name || '—')}</b><small>${esc(x.email || '')}</small></td>
      <td class="clip">${esc(what || '—')}</td>
      <td>${x.type === 'quote' ? esc(countryName(x.country)) + (x.city ? `<small>${esc(x.city)}</small>` : '') : esc(LANGN[x.lang] || x.lang || '—')}</td>
      <td>${fmtDate(x.at)}</td>
      <td><span class="st st--${esc(x.status)}">${esc(label(x.type, x.status))}</span></td></tr>`;
  }

  function pipeline(quotes) {
    return `<div class="pipe">${STATUS.quote
      .map(([s, l]) => {
        const n = quotes.filter((x) => x.status === s).length;
        return `<div class="pipe__col st--${s}"><span>${l}</span><b>${n}</b></div>`;
      })
      .join('')}</div>`;
  }

  function detail(id) {
    const list = readInbox();
    const x = list.find((i) => i.id === id);
    if (!x) return;
    const rows = [];
    const add = (k, v) => v && rows.push(`<div><dt>${k}</dt><dd>${v}</dd></div>`);
    add('Reçue le', esc(fmtDate(x.at, { dateStyle: 'full', timeStyle: 'short' })));
    add('Langue du visiteur', esc(LANGN[x.lang] || x.lang));
    add('Provenance', esc(x.source));
    if (x.type === 'quote') {
      add('Produits', (x.items || []).map((i) => `${esc(i.name)}${i.qty ? ` — <b>${esc(i.qty)} ${esc(UNITS[i.unit] || i.unit)}</b>` : ''}`).join('<br>'));
      add('Destination', `${esc(countryName(x.country))}${x.city ? ' · ' + esc(x.city) : ''}`);
      add('Incoterm', esc(x.incoterm || 'À conseiller'));
      add('Fréquence', esc({ once: 'Ponctuelle', monthly: 'Mensuelle', quarterly: 'Trimestrielle', yearly: 'Annuelle / saisonnière' }[x.frequency] || x.frequency));
      add('Date souhaitée', esc(x.date));
      add('Société', esc(x.company));
      add('Profil', esc(TYPES[x.buyerType] || x.buyerType));
    }
    if (x.type === 'producer') {
      add('Entreprise', esc(x.company));
      add('Wilaya', esc(x.wilaya));
      add('Filière', esc(tf(S.draft.sectors.find((s) => s.id === x.sector)?.name)));
      add('Produits', esc(x.products));
      add('Capacité', esc(x.capacity));
      add('Certifications', esc(x.certs));
      add('Exporte déjà', x.exports === 'yes' ? 'Oui' : 'Pas encore');
    }
    add('Contact', `${esc(x.name || '')}${x.role ? ', ' + esc(x.role) : ''}<br><a href="mailto:${esc(x.email)}">${esc(x.email)}</a>${x.phone ? `<br>${esc(x.phone)}` : ''}`);
    if (x.subject) add('Sujet', esc(x.subject));
    add('Message', x.message ? `<span dir="auto">${esc(x.message)}</span>` : '');
    const [subj, body] = (REPLY[x.lang] || REPLY.fr)(x);
    const wa = String(x.phone || '').replace(/\D/g, '');
    const html = `
      <div class="dhead"><span class="mono">${esc(x.ref)}</span>${x.sample ? '<span class="tag">exemple</span>' : ''}</div>
      <label class="f"><span>Statut</span><select id="d-status">${STATUS[x.type].map(([s, l]) => `<option value="${s}"${s === x.status ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      <dl class="dl">${rows.join('')}</dl>
      <label class="f"><span>Notes internes</span><textarea id="d-notes" rows="4" placeholder="Prix proposé, producteur contacté, relance prévue…">${esc(x.notes || '')}</textarea></label>
      <div class="dactions">
        <a class="b b--primary" href="mailto:${esc(x.email)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}">Répondre par e-mail (${esc(LANGN[x.lang] || 'français')})</a>
        ${wa ? `<a class="b b--ghost" href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
        <button class="b b--danger" type="button" id="d-del">Supprimer</button>
      </div>`;
    const body$ = openDrawer(`${x.type === 'quote' ? 'Demande de devis' : x.type === 'producer' ? 'Candidature producteur' : 'Message'} — ${x.company || x.name || ''}`, html, { onClose: render });
    const update = (patch) => {
      const l = readInbox();
      const i = l.findIndex((y) => y.id === id);
      Object.assign(l[i], patch);
      save(l);
    };
    body$.querySelector('#d-status').addEventListener('change', (e) => {
      update({ status: e.target.value });
      toast(`Statut : ${label(x.type, e.target.value)}`, 'ok');
    });
    body$.querySelector('#d-notes').addEventListener('input', (e) => update({ notes: e.target.value }));
    body$.querySelector('#d-del').addEventListener('click', () => {
      if (!confirmDo(`Supprimer définitivement ${x.ref} ?`)) return;
      save(readInbox().filter((y) => y.id !== id));
      closeDrawer();
      toast('Demande supprimée.');
    });
  }

  function csv(list) {
    const cols = ['ref', 'at', 'status', 'company', 'name', 'email', 'phone', 'country', 'city', 'incoterm', 'frequency', 'wilaya', 'sector', 'subject', 'message'];
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [cols.concat(['produits']).join(';'), ...list.map((x) => cols.map((c) => cell(x[c])).concat(cell((x.items || []).map((i) => `${i.name} ${i.qty || ''} ${i.unit || ''}`).join(' | '))).join(';'))];
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `algerian-product-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  render();
  if (deepId) detail(deepId);
}
