// Demande de devis en 4 étapes, candidature producteur et message libre.
// Chaque envoi arrive dans la boîte de réception de l'admin (localStorage pour la démo).
import { boot, ready, reduced, href, esc } from './site.js';
import { addToInbox, readBasket, clearBasket, track, visitContext } from './store.js';
import { icon, productVisual } from './art.js';
import { visibleProducts, sectorOf } from './ui.js';

const ctx = await boot('quote');
const { content: C, i18n, gsap } = ctx;
const $ = (s, r = document) => r.querySelector(s);
const u = (k, v) => esc(i18n.ui(k, v));
const products = visibleProducts(C);

// Pays (noms traduits automatiquement par le navigateur, quelle que soit la langue)
const ISO = 'AE AF AL AM AO AR AT AU AZ BA BD BE BF BG BH BJ BR BY CA CD CF CG CH CI CL CM CN CO CR CY CZ DE DJ DK DO EC EE EG ES ET FI FR GA GB GE GH GM GN GQ GR GT GW HK HR HU ID IE IL IN IQ IR IS IT JO JP KE KG KR KW KZ LB LK LR LT LU LV LY MA MD ME MG MK ML MR MT MU MX MY MZ NE NG NL NO NZ OM PA PE PH PK PL PT QA RO RS RU RW SA SD SE SG SI SK SL SN SO SY TD TG TH TN TR TW TZ UA UG US UY UZ VE VN YE ZA ZM ZW'.split(' ');
const countries = ISO.map((c) => [c, i18n.country(c)]).sort((a, b) => a[1].localeCompare(b[1], i18n.lang));
const WILAYAS = 'Adrar,Chlef,Laghouat,Oum El Bouaghi,Batna,Béjaïa,Biskra,Béchar,Blida,Bouira,Tamanrasset,Tébessa,Tlemcen,Tiaret,Tizi Ouzou,Alger,Djelfa,Jijel,Sétif,Saïda,Skikda,Sidi Bel Abbès,Annaba,Guelma,Constantine,Médéa,Mostaganem,M’Sila,Mascara,Ouargla,Oran,El Bayadh,Illizi,Bordj Bou Arreridj,Boumerdès,El Tarf,Tindouf,Tissemsilt,El Oued,Khenchela,Souk Ahras,Tipaza,Mila,Aïn Defla,Naâma,Aïn Témouchent,Ghardaïa,Relizane,Timimoun,Bordj Badji Mokhtar,Ouled Djellal,Béni Abbès,In Salah,In Guezzam,Touggourt,Djanet,El M’Ghair,El Meniaa'.split(',');
const UNITS = ['kg', 't', 'carton', 'pallet', 'c20', 'c40', 'pcs', 'm2'];
const INCOTERMS = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'];
const TYPES = ['importer', 'distributor', 'wholesaler', 'chain', 'industry', 'retailer', 'trading', 'other'];
const guessCountry = () => {
  const c = visitContext().country;
  return ISO.includes(c) ? c : '';
};

const field = (name, label, input, req = false) => `<label class="field${req ? ' field--req' : ''}" data-field="${name}"><span class="field__l">${label}${req ? ' *' : ''}</span>${input}<span class="field__err" aria-live="polite"></span></label>`;
const inp = (name, type = 'text', attrs = '') => `<input name="${name}" type="${type}" ${attrs}>`;
const sel = (name, opts, attrs = '') => `<select class="select" name="${name}" ${attrs}>${opts}</select>`;
const opt = (v, l, cur) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(l)}</option>`;

/* Demande de devis ------------------------------------------------------- */
const q = {
  step: 0,
  items: [],
  country: guessCountry(),
};
const fromUrl = new URLSearchParams(location.search).get('p');
for (const pid of [...readBasket(), fromUrl].filter(Boolean)) if (products.some((p) => p.id === pid) && !q.items.some((i) => i.id === pid)) q.items.push({ id: pid, qty: '', unit: 'kg' });

function stepsBar() {
  return `<ol class="qsteps">${['quote.step1', 'quote.step2', 'quote.step3', 'quote.step4']
    .map((k, i) => `<li class="${i === q.step ? 'is-on' : i < q.step ? 'is-done' : ''}"><span>${i < q.step ? icon('check') : i + 1}</span>${u(k)}</li>`)
    .join('')}</ol>`;
}
function pickerHtml() {
  const sel = new Set(q.items.map((i) => i.id));
  return `<div class="picker">
    <label class="search search--sm">${icon('search')}<input type="search" id="pick-q" placeholder="${u('catalogue.search')}" autocomplete="off"></label>
    <ul class="picker__list" id="pick-list">${products
      .map((p) => {
        const s = sectorOf(C, p.sector);
        return `<li><button type="button" class="pick${sel.has(p.id) ? ' is-on' : ''}" data-pick="${esc(p.id)}" aria-pressed="${sel.has(p.id)}">
          ${productVisual(p, s, { cls: 'pick__pv' })}<span class="pick__t"><strong>${esc(i18n.t(p.name))}</strong><small>${esc(i18n.t(s?.name))}</small></span><span class="pick__ck">${icon(sel.has(p.id) ? 'check' : 'plus')}</span></button></li>`;
      })
      .join('')}</ul>
  </div>`;
}
function itemsHtml() {
  if (!q.items.length) return `<p class="q__hint">${u('quote.pick')}</p>`;
  return `<ul class="qitems">${q.items
    .map((it, k) => {
      const p = products.find((x) => x.id === it.id);
      return `<li data-k="${k}"><strong>${esc(i18n.t(p?.name))}</strong>
      <input class="qitems__qty" type="number" min="0" step="any" inputmode="decimal" placeholder="${u('quote.qty')}" value="${esc(it.qty)}" aria-label="${u('quote.qty')}">
      ${sel('unit', UNITS.map((x) => opt(x, i18n.ui('quote.u.' + x), it.unit)).join(''), `aria-label="${u('quote.unit')}"`)}
      <button type="button" class="qitems__rm" aria-label="${u('basket.remove')}">${icon('close')}</button></li>`;
    })
    .join('')}</ul>`;
}
function stepHtml() {
  if (q.step === 0)
    return `<div class="qgrid"><div>${pickerHtml()}</div><div class="qside"><h3 class="q__h">${u('basket.title')}</h3><div id="q-items">${itemsHtml()}</div><p class="field__err" id="q-items-err"></p></div></div>`;
  if (q.step === 1)
    return `<div class="fields">
      ${field('country', u('quote.country'), sel('country', `<option value=""></option>` + countries.map(([c, n]) => opt(c, n, q.country)).join(''), 'required'), true)}
      ${field('city', u('quote.city'), inp('city', 'text', `value="${esc(q.city || '')}"`))}
      ${field('incoterm', u('quote.incoterm'), sel('incoterm', opt('', i18n.ui('quote.incotermAdvise'), q.incoterm || '') + INCOTERMS.map((x) => opt(x, x, q.incoterm)).join('')) + `<small class="field__help">${u('quote.incotermHelp')}</small>`)}
      ${field('date', u('quote.date'), inp('date', 'date', `value="${esc(q.date || '')}"`))}
      ${field('frequency', u('quote.frequency'), sel('frequency', ['once', 'monthly', 'quarterly', 'yearly'].map((x) => opt(x, i18n.ui('quote.f.' + x), q.frequency || 'once')).join('')))}
    </div>`;
  if (q.step === 2)
    return `<div class="fields">
      ${field('company', u('quote.company'), inp('company', 'text', `autocomplete="organization" value="${esc(q.company || '')}"`), true)}
      ${field('name', u('quote.name'), inp('name', 'text', `autocomplete="name" value="${esc(q.name || '')}"`), true)}
      ${field('role', u('quote.role'), inp('role', 'text', `autocomplete="organization-title" value="${esc(q.role || '')}"`))}
      ${field('buyerType', u('quote.buyerType'), sel('buyerType', TYPES.map((x) => opt(x, i18n.ui('quote.t.' + x), q.buyerType || 'importer')).join('')))}
      ${field('email', u('quote.email'), inp('email', 'email', `autocomplete="email" value="${esc(q.email || '')}"`), true)}
      ${field('phone', u('quote.phone'), inp('phone', 'tel', `autocomplete="tel" value="${esc(q.phone || '')}"`))}
      <div class="field field--wide">${field('message', u('quote.message'), `<textarea name="message" rows="4">${esc(q.message || '')}</textarea>`)}</div>
    </div>`;
  const rows = [
    [u('quote.step1'), q.items.map((it) => `${esc(i18n.t(products.find((p) => p.id === it.id)?.name))}${it.qty ? ` — ${esc(it.qty)} ${u('quote.u.' + it.unit)}` : ''}`).join('<br>')],
    [u('quote.country'), esc(i18n.country(q.country)) + (q.city ? ` · ${esc(q.city)}` : '')],
    [u('quote.incoterm'), esc(q.incoterm || i18n.ui('quote.incotermAdvise'))],
    [u('quote.frequency'), u('quote.f.' + (q.frequency || 'once'))],
    [u('quote.company'), `${esc(q.company)}<br>${esc(q.name)}${q.role ? ', ' + esc(q.role) : ''}`],
    [u('quote.email'), esc(q.email) + (q.phone ? `<br>${esc(q.phone)}` : '')],
  ];
  if (q.message) rows.push([u('contact.message'), esc(q.message)]);
  return `<dl class="summary">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    <label class="consent"><input type="checkbox" name="consent" required><span>${u('quote.consent')}</span></label><p class="field__err" id="consent-err"></p>`;
}
function navHtml() {
  return `<div class="qnav">${q.step > 0 ? `<button type="button" class="btn btn--outline" data-prev>${u('quote.prev')}</button>` : '<span></span>'}
    <button type="submit" class="btn btn--dark">${q.step < 3 ? u('quote.next') : u('quote.send')}${icon('arrow')}</button></div>`;
}

function readStep(form) {
  const fd = new FormData(form);
  for (const [k, v] of fd.entries()) if (k !== 'unit' && k !== 'consent') q[k] = String(v).trim();
}
function validate(form) {
  let ok = true;
  const setErr = (name, msg) => {
    const f = form.querySelector(`[data-field="${name}"] .field__err`);
    if (f) f.textContent = msg || '';
    if (msg) ok = false;
  };
  if (q.step === 0) {
    const e = $('#q-items-err');
    e.textContent = q.items.length ? '' : i18n.ui('quote.noProduct');
    ok = q.items.length > 0;
  }
  if (q.step === 1) setErr('country', q.country ? '' : i18n.ui('quote.required'));
  if (q.step === 2) {
    setErr('company', q.company ? '' : i18n.ui('quote.required'));
    setErr('name', q.name ? '' : i18n.ui('quote.required'));
    setErr('email', !q.email ? i18n.ui('quote.required') : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q.email) ? '' : i18n.ui('quote.invalidEmail'));
  }
  if (q.step === 3) {
    const c = form.querySelector('[name="consent"]');
    $('#consent-err').textContent = c.checked ? '' : i18n.ui('quote.required');
    ok = c.checked;
  }
  if (!ok) form.querySelector('.field__err:not(:empty)')?.closest('label, .qside')?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
  return ok;
}

function successHtml(entry, kind) {
  const title = kind === 'producer' ? 'producer.successTitle' : kind === 'contact' ? 'contact.successTitle' : 'quote.successTitle';
  const text = kind === 'producer' ? 'producer.successText' : kind === 'contact' ? 'contact.successText' : 'quote.successText';
  return `<div class="success">
    <div class="success__mark">${icon('check')}</div>
    <h2 class="h2">${u(title)}</h2>
    <p class="lead">${u(text, { ref: entry.ref })}</p>
    <p class="success__ref">${esc(entry.ref)}</p>
    <p class="success__demo">${u('quote.demoNote')}</p>
    <div class="success__ctas"><a class="btn btn--dark" href="admin/#demandes">${u('quote.seeAdmin')}${icon('arrow')}</a><a class="btn btn--outline" href="${href('produits.html')}">${u('featured.all')}</a></div>
  </div>`;
}

function renderQuote(panel) {
  panel.innerHTML = `${stepsBar()}<form class="qform" novalidate>${stepHtml()}${navHtml()}</form>`;
  const form = panel.querySelector('form');
  if (gsap && !reduced) gsap.from(form.children[0], { y: 20, autoAlpha: 0, duration: 0.7, ease: 'expo.out' });
  if (q.step === 0) {
    const list = $('#pick-list', form);
    const refreshItems = () => ($('#q-items', form).innerHTML = itemsHtml());
    list.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]');
      if (!b) return;
      const id = b.dataset.pick;
      const k = q.items.findIndex((i) => i.id === id);
      if (k >= 0) q.items.splice(k, 1);
      else q.items.push({ id, qty: '', unit: 'kg' });
      const on = k < 0;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('.pick__ck').innerHTML = icon(on ? 'check' : 'plus');
      refreshItems();
    });
    $('#pick-q', form).addEventListener('input', (e) => {
      const v = e.target.value.toLowerCase();
      list.querySelectorAll('li').forEach((li) => (li.hidden = v && !li.textContent.toLowerCase().includes(v)));
    });
    const side = $('.qside', form);
    side.addEventListener('input', (e) => {
      const li = e.target.closest('li[data-k]');
      if (li && e.target.classList.contains('qitems__qty')) q.items[li.dataset.k].qty = e.target.value;
    });
    side.addEventListener('change', (e) => {
      const li = e.target.closest('li[data-k]');
      if (li && e.target.name === 'unit') q.items[li.dataset.k].unit = e.target.value;
    });
    side.addEventListener('click', (e) => {
      const rm = e.target.closest('.qitems__rm');
      if (!rm) return;
      const it = q.items.splice(rm.closest('li').dataset.k, 1)[0];
      const b = list.querySelector(`[data-pick="${CSS.escape(it.id)}"]`);
      if (b) {
        b.classList.remove('is-on');
        b.querySelector('.pick__ck').innerHTML = icon('plus');
      }
      refreshItems();
    });
  }
  form.querySelector('[data-prev]')?.addEventListener('click', () => {
    readStep(form);
    q.step--;
    renderQuote(panel);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (q.step > 0) readStep(form);
    if (!validate(form)) return;
    if (q.step < 3) {
      q.step++;
      track('quote_step', { step: q.step });
      renderQuote(panel);
      panel.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
      return;
    }
    const entry = addToInbox({
      type: 'quote',
      lang: i18n.lang,
      source: visitContext().source,
      items: q.items.map((it) => ({ ...it, name: i18n.t(products.find((p) => p.id === it.id)?.name) })),
      country: q.country,
      city: q.city,
      incoterm: q.incoterm,
      date: q.date,
      frequency: q.frequency || 'once',
      company: q.company,
      name: q.name,
      role: q.role,
      buyerType: q.buyerType || 'importer',
      email: q.email,
      phone: q.phone,
      message: q.message,
    });
    track('quote', { ref: entry.ref, country: q.country, products: q.items.map((i) => i.id) });
    clearBasket();
    panel.innerHTML = successHtml(entry, 'quote');
    if (gsap && !reduced) gsap.from(panel.querySelectorAll('.success > *'), { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.8, ease: 'expo.out' });
  });
}

/* Candidature producteur ---------------------------------------------------- */
function renderProducer(panel) {
  const sectors = C.sectors.filter((s) => s.visible !== false);
  panel.innerHTML = `<div class="qintro"><p>${u('producer.lead')}</p></div><form class="qform" novalidate><div class="fields">
    ${field('company', u('quote.company'), inp('company', 'text', 'autocomplete="organization"'), true)}
    ${field('name', u('quote.name'), inp('name', 'text', 'autocomplete="name"'), true)}
    ${field('wilaya', u('producer.wilaya'), sel('wilaya', '<option value=""></option>' + WILAYAS.map((w) => opt(w, w)).join('')), true)}
    ${field('sector', u('product.sector'), sel('sector', sectors.map((s) => opt(s.id, i18n.t(s.name))).join('')))}
    <div class="field field--wide">${field('products', u('producer.products'), '<textarea name="products" rows="3"></textarea>', true)}</div>
    ${field('capacity', u('producer.capacity'), inp('capacity'))}
    ${field('certs', u('producer.certs'), inp('certs'))}
    <fieldset class="field radios"><legend class="field__l">${u('producer.exports')}</legend><label><input type="radio" name="exports" value="yes"> ${u('producer.yes')}</label><label><input type="radio" name="exports" value="no" checked> ${u('producer.no')}</label></fieldset>
    ${field('email', u('quote.email'), inp('email', 'email', 'autocomplete="email"'), true)}
    ${field('phone', u('quote.phone'), inp('phone', 'tel', 'autocomplete="tel"'))}
  </div><div class="qnav"><span></span><button class="btn btn--dark" type="submit">${u('producer.send')}${icon('arrow')}</button></div></form>`;
  bindSimple(panel, 'producer', ['company', 'name', 'wilaya', 'products', 'email']);
}

/* Message libre ------------------------------------------------------------- */
function renderContact(panel) {
  const ct = C.contact || {};
  const wa = String(ct.whatsapp || '').replace(/\D/g, '');
  panel.innerHTML = `<div class="qgrid qgrid--contact"><form class="qform" novalidate><div class="fields">
    ${field('name', u('quote.name'), inp('name', 'text', 'autocomplete="name"'), true)}
    ${field('email', u('contact.email'), inp('email', 'email', 'autocomplete="email"'), true)}
    <div class="field field--wide">${field('subject', u('contact.subject'), inp('subject'))}</div>
    <div class="field field--wide">${field('message', u('contact.message'), '<textarea name="message" rows="6"></textarea>', true)}</div>
  </div><div class="qnav"><span></span><button class="btn btn--dark" type="submit">${u('contact.send')}${icon('arrow')}</button></div></form>
  <aside class="qside qcontact"><p>${u('contact.lead')}</p>
    ${ct.email ? `<a href="mailto:${esc(ct.email)}">${icon('mail')}<span><small>${u('contact.email')}</small>${esc(ct.email)}</span></a>` : ''}
    ${wa ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener">${icon('wa')}<span><small>WhatsApp</small>+${esc(wa)}</span></a>` : ''}
    ${ct.phone ? `<a href="tel:${esc(ct.phone)}">${icon('phone')}<span><small>Tel.</small>${esc(ct.phone)}</span></a>` : ''}
    ${ct.office ? `<p>${icon('pin')}<span><small>${u('contact.office')}</small>${esc(i18n.t(ct.office))}</span></p>` : ''}
  </aside></div>`;
  bindSimple(panel, 'contact', ['name', 'email', 'message']);
}

function bindSimple(panel, type, required) {
  const form = panel.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    let ok = true;
    for (const name of required) {
      const v = String(data[name] || '').trim();
      let msg = v ? '' : i18n.ui('quote.required');
      if (!msg && name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = i18n.ui('quote.invalidEmail');
      const err = form.querySelector(`[data-field="${name}"] .field__err`);
      if (err) err.textContent = msg;
      if (msg) ok = false;
    }
    if (!ok) return;
    const entry = addToInbox({ type, lang: i18n.lang, source: visitContext().source, ...data });
    track(type === 'producer' ? 'producer' : 'contact', { ref: entry.ref });
    panel.innerHTML = successHtml(entry, type);
  });
}

/* Onglets ------------------------------------------------------------------- */
const panels = $('#q-panels');
const renderers = { devis: renderQuote, producteur: renderProducer, contact: renderContact };
function openTab(name, push = true) {
  if (!renderers[name]) name = 'devis';
  document.querySelectorAll('#q-tabs [data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
  panels.dataset.tab = name;
  renderers[name](panels);
  if (push) history.replaceState(null, '', name === 'devis' ? location.pathname + location.search : `#${name}`);
}
$('#q-tabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]');
  if (b) openTab(b.dataset.tab);
});
openTab(location.hash.slice(1) || 'devis', false);
ready({ ...ctx, lenis: null });
