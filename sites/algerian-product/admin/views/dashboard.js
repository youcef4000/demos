// Tableau de bord : audience, provenance, pays, langues, produits consultés et conversion en devis.
import { readEvents, readInbox, esc } from '../../store.js';
import { S, tf, countryName, fmtDate } from '../ui.js';
import { sampleDays } from '../sample.js';

const SRC = { linkedin: 'LinkedIn', instagram: 'Instagram', search: 'Moteurs de recherche', direct: 'Accès direct', whatsapp: 'WhatsApp', facebook: 'Facebook', email: 'E-mail', other: 'Autres sites' };
const DEV = { mobile: 'Téléphone', desktop: 'Ordinateur', tablet: 'Tablette' };
const nf = new Intl.NumberFormat('fr-FR');
const pf = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 });
const PERIOD_KEY = 'ap:admin:period';

// Évènements réels de ce navigateur, ramenés au même format que les jours d'exemple
function liveDays() {
  const days = new Map();
  const get = (key) => {
    if (!days.has(key)) days.set(key, { date: key, sessions: new Set(), visitors: 0, views: 0, productViews: 0, formStarts: 0, quotes: 0, producers: 0, sources: {}, countries: {}, langs: {}, devices: {}, products: {}, startSessions: new Set() });
    return days.get(key);
  };
  const add = (o, k) => k && (o[k] = (o[k] || 0) + 1);
  const seen = new Set();
  for (const e of readEvents()) {
    const d = new Date(e.t);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const day = get(key);
    if (e.type === 'view') {
      day.views++;
      if (!seen.has(e.s)) {
        seen.add(e.s);
        day.visitors++;
        if (e.source !== 'internal') add(day.sources, e.source);
        add(day.countries, e.country);
        add(day.langs, e.lang);
        add(day.devices, e.device);
      }
    } else if (e.type === 'product') {
      day.productViews++;
      add(day.products, e.product);
    } else if (e.type === 'quote_step' && !day.startSessions.has(e.s)) {
      day.startSessions.add(e.s);
      day.formStarts++;
    } else if (e.type === 'quote') day.quotes++;
    else if (e.type === 'producer') day.producers++;
  }
  return days;
}

function aggregate(n, useSample) {
  const sample = useSample ? sampleDays(Math.min(180, n * 2)) : [];
  const live = liveDays();
  const keys = [];
  const today = new Date();
  for (let i = n * 2 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  const sm = new Map(sample.map((x) => [x.date, x]));
  const merge = (a = {}, b = {}) => {
    const o = { ...a };
    for (const [k, v] of Object.entries(b)) o[k] = (o[k] || 0) + v;
    return o;
  };
  const rows = keys.map((k) => {
    const a = sm.get(k) || {};
    const b = live.get(k) || {};
    const num = (f) => (a[f] || 0) + (b[f] || 0);
    return {
      date: k,
      live: b.visitors || 0,
      visitors: num('visitors'),
      views: num('views'),
      productViews: num('productViews'),
      formStarts: num('formStarts'),
      quotes: num('quotes'),
      producers: num('producers'),
      sources: merge(a.sources, b.sources),
      countries: merge(a.countries, b.countries),
      langs: merge(a.langs, b.langs),
      devices: merge(a.devices, b.devices),
      products: merge(a.products, b.products),
    };
  });
  return { prev: rows.slice(0, n), cur: rows.slice(n) };
}

const sum = (rows, f) => rows.reduce((a, r) => a + r[f], 0);
const sumMap = (rows, f) => rows.reduce((o, r) => {
  for (const [k, v] of Object.entries(r[f])) o[k] = (o[k] || 0) + v;
  return o;
}, {});

function kpi(label, value, prev, fmt = (v) => nf.format(v), hint = '') {
  let delta = '';
  if (prev != null && prev > 0) {
    const d = (value - prev) / prev;
    delta = `<span class="kpi__d ${d >= 0 ? 'is-up' : 'is-down'}">${d >= 0 ? '▲' : '▼'} ${pf.format(Math.abs(d))}</span>`;
  }
  return `<div class="kpi"><p class="kpi__l">${label}</p><p class="kpi__v">${fmt(value)}</p><p class="kpi__s">${delta}${hint ? `<span>${hint}</span>` : ''}</p></div>`;
}

// Courbe avec réticule et infobulle (une seule série, un seul axe)
function areaChart(rows, field, label) {
  const W = 760;
  const H = 240;
  const P = { l: 40, r: 12, t: 16, b: 28 };
  const max = Math.max(1, ...rows.map((r) => r[field]));
  const nice = Math.ceil(max / 20) * 20;
  const x = (i) => P.l + (i / Math.max(1, rows.length - 1)) * (W - P.l - P.r);
  const y = (v) => H - P.b - (v / nice) * (H - P.t - P.b);
  const line = rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(r[field]).toFixed(1)}`).join('');
  const area = `${line}L${x(rows.length - 1).toFixed(1)} ${H - P.b}L${P.l} ${H - P.b}Z`;
  const grid = [0, 0.5, 1].map((k) => `<g><line x1="${P.l}" x2="${W - P.r}" y1="${y(nice * k)}" y2="${y(nice * k)}" class="ch__grid"/><text x="${P.l - 8}" y="${y(nice * k) + 4}" text-anchor="end" class="ch__ax">${nf.format(nice * k)}</text></g>`).join('');
  const step = Math.ceil(rows.length / 6);
  const ticks = rows.map((r, i) => (i % step === 0 || i === rows.length - 1 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="ch__ax">${new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</text>` : '')).join('');
  return `<div class="chart" data-chart="area"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
    <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--c1)" stop-opacity=".22"/><stop offset="1" stop-color="var(--c1)" stop-opacity="0"/></linearGradient></defs>
    ${grid}${ticks}<path d="${area}" fill="url(#ga)"/><path d="${line}" class="ch__line"/>
    <line class="ch__cross" y1="${P.t}" y2="${H - P.b}" x1="0" x2="0" hidden/><circle class="ch__dot" r="4.5" hidden/>
    <rect class="ch__hit" x="${P.l}" y="${P.t}" width="${W - P.l - P.r}" height="${H - P.t - P.b}" fill="transparent"/>
  </svg><div class="tip" hidden></div></div>`;
}
function bindArea(el, rows) {
  const svg = el.querySelector('svg');
  const hit = el.querySelector('.ch__hit');
  const cross = el.querySelector('.ch__cross');
  const dot = el.querySelector('.ch__dot');
  const tip = el.querySelector('.tip');
  const W = 760;
  const P = { l: 40, r: 12, t: 16, b: 28 };
  const max = Math.ceil(Math.max(1, ...rows.map((r) => r.visitors)) / 20) * 20;
  const move = (ev) => {
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const i = Math.max(0, Math.min(rows.length - 1, Math.round(((p.x - P.l) / (W - P.l - P.r)) * (rows.length - 1))));
    const r = rows[i];
    const cx = P.l + (i / Math.max(1, rows.length - 1)) * (W - P.l - P.r);
    const cy = 240 - P.b - (r.visitors / max) * (240 - P.t - P.b);
    cross.setAttribute('x1', cx);
    cross.setAttribute('x2', cx);
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
    cross.hidden = dot.hidden = tip.hidden = false;
    tip.innerHTML = `<b>${new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}</b><span>${nf.format(r.visitors)} visiteurs</span><span>${nf.format(r.quotes)} demandes de devis</span>${r.live ? `<span class="tip__live">dont ${r.live} visite(s) réelle(s)</span>` : ''}`;
    const rect = el.getBoundingClientRect();
    const left = (cx / W) * rect.width;
    tip.style.left = `${Math.min(rect.width - 180, Math.max(0, left + 12))}px`;
  };
  hit.addEventListener('pointermove', move);
  hit.addEventListener('pointerleave', () => (cross.hidden = dot.hidden = tip.hidden = true));
}

// Barres horizontales (classement), valeurs en texte, couleur unique
function bars(map, labelOf, { limit = 8, total = null } = {}) {
  const entries = Object.entries(map).filter(([k, v]) => k && v > 0).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return '<p class="muted">Pas encore de données.</p>';
  const top = entries.slice(0, limit);
  const rest = entries.slice(limit).reduce((a, [, v]) => a + v, 0);
  if (rest) top.push(['__other', rest]);
  const max = top[0][1];
  const tot = total || entries.reduce((a, [, v]) => a + v, 0);
  return `<ul class="hbars">${top
    .map(([k, v]) => `<li title="${esc(k === '__other' ? 'Autres' : labelOf(k))} : ${nf.format(v)} (${pf.format(v / tot)})"><span class="hbars__l">${esc(k === '__other' ? 'Autres' : labelOf(k))}</span><span class="hbars__t"><i style="width:${((v / max) * 100).toFixed(1)}%"></i></span><span class="hbars__v">${nf.format(v)}<small>${pf.format(v / tot)}</small></span></li>`)
    .join('')}</ul>`;
}

function funnel(steps) {
  const max = steps[0][1] || 1;
  return `<ol class="funnel">${steps
    .map(([l, v], i) => `<li><span class="funnel__l">${l}</span><span class="funnel__t"><i style="width:${Math.max(1.5, (v / max) * 100).toFixed(1)}%"></i></span><span class="funnel__v">${nf.format(v)}${i ? `<small>${pf.format(v / (steps[i - 1][1] || 1))} de l’étape précédente</small>` : ''}</span></li>`)
    .join('')}</ol>`;
}

export default function dashboard(el) {
  let period = 30;
  let useSample = true;
  try {
    period = Number(localStorage.getItem(PERIOD_KEY)) || 30;
  } catch {}
  const render = () => {
    const { cur, prev } = aggregate(period, useSample);
    const pv = period <= 45;
    const V = sum(cur, 'visitors');
    const Q = sum(cur, 'quotes');
    const inbox = readInbox();
    const live = readEvents();
    const prodName = (id) => tf(S.draft.products.find((p) => p.id === id)?.name) || id;
    el.innerHTML = `
      <div class="bar">
        <div class="seg" role="group" aria-label="Période">${[7, 30, 90].map((n) => `<button type="button" data-period="${n}" aria-pressed="${n === period}">${n} jours</button>`).join('')}</div>
        <label class="sw"><input type="checkbox" id="use-sample" ${useSample ? 'checked' : ''}><span class="sw__ui"></span><span>Inclure les données d’exemple</span></label>
        <p class="bar__note">${useSample ? '<b>Données d’exemple</b> + ' : ''}${nf.format(live.length)} évènement(s) réel(s) enregistré(s) depuis ce navigateur.</p>
      </div>
      <div class="kpis">
        ${kpi('Visiteurs', V, pv ? sum(prev, 'visitors') : null)}
        ${kpi('Pages vues', sum(cur, 'views'), pv ? sum(prev, 'views') : null)}
        ${kpi('Demandes de devis', Q, pv ? sum(prev, 'quotes') : null)}
        ${kpi('Taux de conversion', V ? Q / V : 0, pv ? (sum(prev, 'quotes') / (sum(prev, 'visitors') || 1)) : null, (v) => pf.format(v), 'visiteurs → devis')}
        ${kpi('Candidatures producteurs', sum(cur, 'producers'), null)}
      </div>
      <div class="grid2">
        <section class="card card--wide"><header><h3>Visiteurs par jour</h3><p>Survolez la courbe pour le détail.</p></header>${areaChart(cur, 'visitors', 'Visiteurs par jour')}</section>
        <section class="card"><header><h3>Du visiteur au devis</h3><p>Où l’on perd les acheteurs.</p></header>${funnel([
          ['Visiteurs', V],
          ['Ont ouvert une fiche produit', Math.min(V, Math.round(sum(cur, 'productViews') * 0.7))],
          ['Ont commencé le formulaire', sum(cur, 'formStarts')],
          ['Ont envoyé une demande', Q],
        ])}</section>
        <section class="card"><header><h3>Provenance</h3><p>Réseaux, recherche, accès direct.</p></header>${bars(sumMap(cur, 'sources'), (k) => SRC[k] || k)}</section>
        <section class="card"><header><h3>Pays des visiteurs</h3><p>Déduit du fuseau horaire, sans cookie.</p></header>${bars(sumMap(cur, 'countries'), (k) => (k === 'EU' ? 'Europe (autre)' : countryName(k)), { limit: 9 })}</section>
        <section class="card"><header><h3>Produits les plus consultés</h3><p>Fiches ouvertes sur la période.</p></header>${bars(sumMap(cur, 'products'), prodName, { limit: 8 })}</section>
        <section class="card"><header><h3>Langue du site</h3></header>${bars(sumMap(cur, 'langs'), (k) => S.draft.languages.find((l) => l.code === k)?.name || k)}
          <header class="card__sub"><h3>Appareils</h3></header>${bars(sumMap(cur, 'devices'), (k) => DEV[k] || k)}</section>
        <section class="card"><header><h3>Dernières demandes</h3><a href="#demandes">Tout voir →</a></header>
          <ul class="mini">${inbox.slice(0, 6).map((x) => `<li><a href="#demandes/${esc(x.id)}"><span class="pill pill--${esc(x.type)}">${x.type === 'quote' ? 'Devis' : x.type === 'producer' ? 'Producteur' : 'Message'}</span><b>${esc(x.company || x.name || '—')}</b><small>${esc(x.country ? countryName(x.country) : x.wilaya || '')} · ${fmtDate(x.at)}</small></a></li>`).join('') || '<li class="muted">Aucune demande.</li>'}</ul></section>
        <section class="card"><header><h3>Activité réelle de ce navigateur</h3><p>Vos propres visites de test sur le site.</p></header>
          <ul class="mini mini--log">${live.slice(-8).reverse().map((e) => `<li><span class="mono">${new Date(e.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>${esc(describe(e, prodName))}</li>`).join('') || '<li class="muted">Ouvrez le site dans un autre onglet : chaque page vue, fiche ouverte et demande envoyée apparaît ici.</li>'}</ul></section>
      </div>`;
    const chart = el.querySelector('[data-chart="area"]');
    if (chart) bindArea(chart, cur);
    el.querySelectorAll('[data-period]').forEach((b) =>
      b.addEventListener('click', () => {
        period = Number(b.dataset.period);
        try {
          localStorage.setItem(PERIOD_KEY, period);
        } catch {}
        render();
      })
    );
    el.querySelector('#use-sample').addEventListener('change', (e) => {
      useSample = e.target.checked;
      render();
    });
  };
  render();
}

function describe(e, prodName) {
  switch (e.type) {
    case 'view': return `Page « ${e.page} » vue (${e.lang?.toUpperCase()}, ${e.device}${e.country ? ', ' + countryName(e.country) : ''})`;
    case 'product': return `Fiche ouverte : ${prodName(e.product)}`;
    case 'basket': return `Ajouté à la demande : ${prodName(e.product)}`;
    case 'quote_step': return `Formulaire de devis : étape ${e.step}`;
    case 'quote': return `Demande de devis envoyée (${e.ref})`;
    case 'producer': return `Candidature producteur (${e.ref})`;
    case 'contact': return `Message envoyé (${e.ref})`;
    case 'film': return `Film : chapitre ${e.chapter}`;
    case 'scroll': return `Lecture de l’accueil : ${e.depth} %`;
    case 'search': return `Recherche : « ${e.q} »`;
    case 'filter': return `Filtre catalogue : ${e.sector}`;
    case 'cta': return `Clic sur un bouton (${e.name})`;
    default: return e.type;
  }
}
