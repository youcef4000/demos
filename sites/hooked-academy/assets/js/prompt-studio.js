// Studio de prompts (#/prompts et #/prompts/<modèle>) — page de l'espace étudiant.
// Les modèles et le moteur sont dans data/prompts.js ; ici : le choix du modèle, le formulaire, l'aperçu annoté
// (chaque partie du prompt est nommée et expliquée), la force du prompt, le mode expert, « Mon contexte »
// (la marque de l'élève, ajoutée à ses prompts) et ses prompts récents. Ces deux derniers restent sur cet
// appareil (localStorage) : ce sont des aides de confort, rien de plus.

import { t, lang } from './i18n.js';
import { icon } from './icons.js';
import { GROUPS, FIELDS, OPTS, TEMPLATES, byId, DEMO_TEMPLATES, buildPrompt, strength } from '../../data/prompts.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pick = (o) => (o && typeof o === 'object' ? o[lang] || o.fr : o || '');
const arrow = (size = 14) => icon('arrow', { size, cls: 'i-dir' });

/** Où ouvrir le prompt. `q` : adresse qui pré-remplit la conversation (sinon le prompt est copié, puis l'outil s'ouvre). */
const TOOLS = {
  chatgpt: { name: 'ChatGPT', url: 'https://chatgpt.com/', q: 'https://chatgpt.com/?q=' },
  claude: { name: 'Claude', url: 'https://claude.ai/new', q: 'https://claude.ai/new?q=' },
  gemini: { name: 'Gemini', url: 'https://gemini.google.com/app' },
  elevenlabs: { name: 'ElevenLabs', url: 'https://elevenlabs.io/app/speech-synthesis/text-to-speech' },
  veo: { name: 'Flow (Veo)', url: 'https://labs.google/fx/tools/flow' },
  kling: { name: 'Kling', url: 'https://app.klingai.com/' },
  higgsfield: { name: 'Higgsfield', url: 'https://higgsfield.ai' },
  claudecode: { name: 'Claude Code', url: 'https://claude.ai/code' },
  codex: { name: 'Codex', url: 'https://chatgpt.com/codex' },
  lovable: { name: 'Lovable', url: 'https://lovable.dev' },
};
/** Option qui désigne l'outil choisi → identifiant d'outil ci-dessus. */
const TOOL_OF = { gemini: 'gemini', chatgpt: 'chatgpt', higgsfield: 'higgsfield', veo: 'veo', kling: 'kling', claude: 'claudecode', codex: 'codex', lovable: 'lovable' };
const PREFILL_MAX = 6000;

const SOURCES = [
  ['Anthropic · Claude', 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices'],
  ['OpenAI · GPT-5.2', 'https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-2_prompting_guide'],
  ['Google · Nano Banana', 'https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana'],
  ['Google · Veo 3.1', 'https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1'],
  ['Kling', 'https://kling.ai/blog/kling-ai-negative-prompts-fix-video-distortion'],
  ['ElevenLabs v3', 'https://elevenlabs.io/docs/best-practices/prompting/eleven-v3'],
];
const LEARN = [
  ['target', 1],
  ['layers', 2],
  ['info', 3],
  ['check', 4],
  ['grid', 5],
  ['star', 6],
  ['shield', 7],
  ['help', 8],
  ['image', 9],
  ['mic', 10],
];
const BRAND_KEYS = ['name', 'what', 'city', 'aud', 'voice', 'always'];

/* ------------------------------------------------------------------ */
/* Mémoire de cet appareil                                             */
/* ------------------------------------------------------------------ */

const KEY = (id) => `hooked-academy:prompts:v1:${id || 'anon'}`;
function load(id) {
  try {
    const d = JSON.parse(localStorage.getItem(KEY(id)) || '{}');
    return d && typeof d === 'object' ? d : {};
  } catch {
    return {};
  }
}
function save(id, d) {
  try {
    localStorage.setItem(KEY(id), JSON.stringify(d));
  } catch {}
}

async function copyText(txt) {
  try {
    await navigator.clipboard.writeText(txt);
    return true;
  } catch {}
  try {
    const ta = document.createElement('textarea');
    ta.value = txt;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;inset-inline-start:-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Le contexte de marque, en lignes « - Libellé : valeur » dans la langue du prompt. */
function brandText(b) {
  const sep = lang === 'fr' ? ' : ' : ': ';
  return BRAND_KEYS.filter((k) => b?.[k] && String(b[k]).trim())
    .map((k) => `- ${t(`app.ps.ctx.${k}`)}${sep}${String(b[k]).trim()}`)
    .join('\n');
}

function ago(at) {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return t('app.ps.ago.now');
  if (m < 60) return t('app.ps.ago.m', { n: m });
  const h = Math.round(m / 60);
  if (h < 24) return t('app.ps.ago.h', { n: h });
  return t('app.ps.ago.d', { n: Math.round(h / 24) });
}

/* ------------------------------------------------------------------ */
/* La page                                                             */
/* ------------------------------------------------------------------ */

/**
 * @param {object} ctx  { shell, setTitle, me, demo, reserve, toast, enter, tplId }
 */
export function viewStudio(ctx) {
  const { shell, setTitle, me, demo, reserve, toast, enter } = ctx;
  setTitle(t('app.title.prompts'));
  const mem = load(me?.id);
  mem.vals ||= {};
  mem.opts ||= {};
  mem.hist ||= [];
  mem.brand ||= {};
  if (typeof mem.expert !== 'boolean') mem.expert = true;
  if (typeof mem.ask !== 'boolean') mem.ask = false;
  if (typeof mem.useBrand !== 'boolean') mem.useBrand = true;
  let tpl = byId[ctx.tplId] || byId[mem.tpl] || TEMPLATES[0];
  let group = 'all';
  let raw = false;
  const persist = () => save(me?.id, mem);
  const locked = (id) => demo && !DEMO_TEMPLATES.includes(id);
  const groupOf = (id) => GROUPS.find((g) => g.id === id);

  shell(
    'prompts',
    `<div class="ps">
      <section class="card ps-hero">
        <div class="ps-hero-t">
          <p class="card-k">${icon('wand', { size: 14 })} ${t('app.ps.k')}</p>
          <h1>${t('app.ps.title')}</h1>
          <p class="ps-lead">${t('app.ps.lead')}</p>
          <ul class="ps-badges">
            <li>${icon('layers', { size: 14 })} ${t('app.ps.b1', { n: TEMPLATES.length })}</li>
            <li>${icon('bolt', { size: 14 })} ${t('app.ps.b2')}</li>
            <li>${icon('globe', { size: 14 })} ${t('app.ps.b3')}</li>
            <li>${icon('clock', { size: 14 })} ${t('app.ps.b4')}</li>
          </ul>
        </div>
        <div class="ps-hero-art" aria-hidden="true">
          <div class="ps-ha-win">
            <span class="ps-ha-bar"><i></i><i></i><i></i></span>
            <span class="ps-ha-l" style="--w:58%;--c:var(--ps-role)"></span>
            <span class="ps-ha-l" style="--w:82%;--c:var(--ps-context)"></span>
            <span class="ps-ha-l" style="--w:70%;--c:var(--ps-task)"></span>
            <span class="ps-ha-l" style="--w:90%;--c:var(--ps-rules)"></span>
            <span class="ps-ha-l" style="--w:64%;--c:var(--ps-format)"></span>
            <span class="ps-ha-l" style="--w:76%;--c:var(--ps-check)"></span>
            <span class="ps-ha-go">${icon('sparkles', { size: 18 })}</span>
          </div>
        </div>
      </section>

      <section class="ps-pick" aria-label="${esc(t('app.ps.pick'))}">
        <div class="seg ps-gs" id="ps-gs" role="group" aria-label="${esc(t('app.ps.pick'))}">
          <button type="button" data-g="all" aria-pressed="true">${t('app.ps.all')}</button>
          ${GROUPS.map((g) => `<button type="button" data-g="${g.id}" aria-pressed="false">${icon(g.icon, { size: 15 })} ${esc(pick(g.title))}</button>`).join('')}
        </div>
        <div class="ps-tpls" id="ps-tpls">${TEMPLATES.map(
          (x) => `<button type="button" class="ps-tpl" data-id="${x.id}" data-g="${x.g}" aria-pressed="false">
            <span class="ps-tpl-ic">${icon(x.icon, { size: 20 })}</span>
            <span class="ps-tpl-t"><b>${esc(pick(x.title))}</b><small>${esc(pick(x.sub))}</small></span>
            ${locked(x.id) ? `<span class="ps-tpl-lk">${icon('lock', { size: 13 })}</span>` : ''}
          </button>`,
        ).join('')}</div>
      </section>

      <section class="card ps-ws" id="ps-ws" aria-labelledby="ps-ws-h"></section>

      <div class="ps-more">
        <details class="card ps-ctx" id="ps-ctx">
          <summary><span class="ps-sum-ic">${icon('user', { size: 18 })}</span><span><b>${t('app.ps.ctx.t')}</b><small id="ps-ctx-st"></small></span><span class="ps-pm" aria-hidden="true"></span></summary>
          <p class="muted ps-ctx-x">${t('app.ps.ctx.x')}</p>
          <div class="ps-ctx-g">${BRAND_KEYS.map(
            (k) => `<label class="lbl"><span>${t(`app.ps.ctx.${k}`)}</span>${
              k === 'always'
                ? `<textarea class="in" data-b="${k}" rows="2" placeholder="${esc(t(`app.ps.ctx.${k}.ph`))}">${esc(mem.brand[k] || '')}</textarea>`
                : `<input class="in" data-b="${k}" type="text" autocomplete="off" placeholder="${esc(t(`app.ps.ctx.${k}.ph`))}" value="${esc(mem.brand[k] || '')}">`
            }</label>`,
          ).join('')}</div>
          <div class="ps-ctx-a"><button class="b b--s b--or" type="button" id="ps-ctx-save">${icon('check', { size: 15 })} ${t('app.ps.ctx.save')}</button></div>
        </details>
        <details class="card ps-hist" id="ps-hist">
          <summary><span class="ps-sum-ic">${icon('clock', { size: 18 })}</span><span><b>${t('app.ps.hist.t')}</b><small>${t('app.ps.hist.x')}</small></span><span class="ps-pm" aria-hidden="true"></span></summary>
          <div id="ps-hist-l"></div>
        </details>
      </div>

      <section class="card ps-learn" aria-labelledby="ps-learn-h">
        <p class="card-k">${icon('bolt', { size: 14 })} ${t('app.ps.learn.k')}</p>
        <h2 id="ps-learn-h">${t('app.ps.learn.t')}</h2>
        <p class="muted">${t('app.ps.learn.x')}</p>
        <ol class="ps-learn-g">${LEARN.map(
          ([ic, n]) => `<li><span class="ps-learn-ic">${icon(ic, { size: 18 })}</span><div><b>${t(`app.ps.l${n}.t`)}</b><p>${t(`app.ps.l${n}.x`)}</p></div></li>`,
        ).join('')}</ol>
        <p class="ps-src muted">${t('app.ps.learn.src')} ${SOURCES.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(n)}</a>`).join(' · ')}</p>
      </section>
    </div>`,
  );

  /* -------------------------- choix du modèle -------------------------- */

  const markTpl = () => $$('#ps-tpls .ps-tpl').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === tpl.id)));
  $('#ps-gs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-g]');
    if (!b) return;
    group = b.dataset.g;
    $$('#ps-gs button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $$('#ps-tpls .ps-tpl').forEach((c) => (c.hidden = group !== 'all' && c.dataset.g !== group));
  });
  $('#ps-tpls').addEventListener('click', (e) => {
    const b = e.target.closest('.ps-tpl');
    if (!b) return;
    choose(b.dataset.id, true);
  });

  function choose(id, scroll) {
    tpl = byId[id] || tpl;
    mem.tpl = tpl.id;
    persist();
    history.replaceState(null, '', `#/prompts/${tpl.id}`);
    markTpl();
    drawWorkspace();
    if (scroll) {
      const ws = $('#ps-ws');
      const top = ws.getBoundingClientRect().top + scrollY - (($('.top-wrap')?.offsetHeight || 64) + 12);
      if (Math.abs(top - scrollY) > 120) scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  /* ---------------------------- l'atelier ------------------------------ */

  const optsOf = (x) => ({ ...x.def, ...(mem.opts[x.id] || {}) });

  function drawWorkspace() {
    const ws = $('#ps-ws');
    const G = groupOf(tpl.g);
    ws.dataset.g = tpl.g;
    const head = `<header class="ps-ws-h">
        <span class="ps-ws-ic">${icon(tpl.icon, { size: 22 })}</span>
        <div class="ps-ws-tt"><p class="card-k">${esc(pick(G.title))}</p><h2 id="ps-ws-h">${esc(pick(tpl.title))}</h2><p class="muted">${esc(pick(tpl.sub))}</p></div>
        ${
          tpl.media
            ? ''
            : `<div class="ps-mode" role="group" aria-label="${esc(t('app.ps.mode'))}">
          <button type="button" data-m="expert" aria-pressed="${mem.expert}">${icon('bolt', { size: 14 })} ${t('app.ps.expert')}</button>
          <button type="button" data-m="quick" aria-pressed="${!mem.expert}">${t('app.ps.quick')}</button>
          <small id="ps-mode-x">${t(mem.expert ? 'app.ps.expert.x' : 'app.ps.quick.x')}</small>
        </div>`
        }
      </header>`;
    if (locked(tpl.id)) {
      ws.innerHTML = `${head}<div class="ps-lock">
        <span class="ps-lock-ic">${icon('lock', { size: 26 })}</span>
        <h3>${t('app.ps.lock.t')}</h3>
        <p class="muted">${t('app.ps.lock.x', { n: TEMPLATES.length })}</p>
        <div class="ps-lock-a"><a class="b b--or" href="${reserve}">${t('app.cta.reserve')}</a>${DEMO_TEMPLATES.map((id) => `<button class="b b--s" type="button" data-go="${id}">${esc(pick(byId[id].title))}</button>`).join('')}</div>
      </div>`;
      ws.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => choose(b.dataset.go, true)));
      return;
    }
    const o = optsOf(tpl);
    const fields = tpl.fields
      .map((k) => {
        const F = FIELDS[k];
        const req = tpl.req.includes(k);
        const val = esc(mem.vals[k] || '');
        const ph = esc(pick(F.ph));
        const label = `<span>${esc(pick(F.label))}${req ? '' : ` <em class="ps-opt-t">${t('app.ps.optional')}</em>`}</span>`;
        return `<label class="lbl ps-f" data-f="${k}">${label}${
          F.area ? `<textarea class="in" id="ps-${k}" rows="${k === 'mine' || k === 'ad' ? 5 : 3}" placeholder="${ph}">${val}</textarea>` : `<input class="in" id="ps-${k}" type="text" autocomplete="off" placeholder="${ph}" value="${val}">`
        }</label>`;
      })
      .join('');
    const opts = tpl.opts
      .map((key) => {
        const O = OPTS[key];
        return `<div class="ps-o" data-o="${key}"><span class="ps-o-l">${esc(pick(O.label))}</span><div class="ps-chips" role="group" aria-label="${esc(pick(O.label))}">${Object.entries(O.values)
          .map(([val, x]) => `<button type="button" data-v="${esc(val)}" aria-pressed="${String(o[key]) === String(val)}">${esc(pick(x.name))}</button>`)
          .join('')}</div></div>`;
      })
      .join('');
    const brandOn = !!brandText(mem.brand);
    const toggles = tpl.media
      ? ''
      : `<div class="ps-tg">
          <label class="ps-sw"><input type="checkbox" id="ps-ask" ${mem.ask ? 'checked' : ''}><span class="ps-sw-k" aria-hidden="true"></span><span>${t('app.ps.ask')}</span></label>
          <label class="ps-sw ${brandOn ? '' : 'is-off'}"><input type="checkbox" id="ps-brand" ${brandOn && mem.useBrand ? 'checked' : ''} ${brandOn ? '' : 'disabled'}><span class="ps-sw-k" aria-hidden="true"></span><span>${t('app.ps.brand.use')}${brandOn ? '' : ` <a href="#ps-ctx" class="ps-ln" id="ps-brand-go">${t('app.ps.brand.fill')}</a>`}</span></label>
        </div>`;
    ws.innerHTML = `${head}
      <div class="ps-ws-g">
        <div class="ps-form">
          ${fields}
          ${opts ? `<div class="ps-opts">${opts}</div>` : ''}
          ${toggles}
          <div class="ps-fa">
            <button class="b b--s" type="button" id="ps-ex">${icon('spark', { size: 15 })} ${t('app.ps.example')}</button>
            <button class="b b--s" type="button" id="ps-clear">${icon('x', { size: 15 })} ${t('app.ps.clear')}</button>
          </div>
        </div>
        <div class="ps-res">
          <div class="ps-meter" id="ps-meter">
            <div class="ps-meter-top"><b>${t('app.ps.meter')}</b><span id="ps-sc"></span></div>
            <div class="ps-bar" aria-hidden="true"><i id="ps-bar"></i></div>
            <p class="ps-tip" id="ps-tip" aria-live="polite"></p>
          </div>
          <div class="ps-pv-h">
            <span class="ps-pv-k">${icon('doc', { size: 14 })} ${t('app.ps.preview')}</span>
            <button class="ps-ln" type="button" id="ps-raw">${t('app.ps.raw')}</button>
          </div>
          <div class="out ps-pv" id="ps-pv"></div>
          <div class="ps-neg" id="ps-neg" hidden>
            <div class="ps-pv-h"><span class="ps-pv-k">${icon('x', { size: 14 })} ${t('app.ps.neg')}</span><button class="ps-ln" type="button" id="ps-neg-c">${icon('copy', { size: 13 })} ${t('app.ps.neg.copy')}</button></div>
            <pre class="out ps-neg-t" id="ps-neg-t" dir="ltr"></pre>
          </div>
          <p class="ps-note" id="ps-note"></p>
          <div class="ps-act" id="ps-act"></div>
          <div class="ps-next" id="ps-next"></div>
        </div>
      </div>`;

    // Champs : chaque frappe reconstruit le prompt ; les valeurs suivent l'élève d'un modèle à l'autre
    tpl.fields.forEach((k) =>
      $(`#ps-${k}`, ws).addEventListener('input', (e) => {
        mem.vals[k] = e.target.value;
        persist();
        draw();
      }),
    );
    $$('.ps-o', ws).forEach((g) =>
      g.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-v]');
        if (!b) return;
        const key = g.dataset.o;
        mem.opts[tpl.id] = { ...(mem.opts[tpl.id] || {}), [key]: b.dataset.v };
        persist();
        $$('button', g).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        draw();
      }),
    );
    $$('.ps-mode button', ws).forEach((b) =>
      b.addEventListener('click', () => {
        mem.expert = b.dataset.m === 'expert';
        persist();
        $$('.ps-mode button', ws).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        $('#ps-mode-x', ws).textContent = t(mem.expert ? 'app.ps.expert.x' : 'app.ps.quick.x');
        draw();
      }),
    );
    $('#ps-ask', ws)?.addEventListener('change', (e) => {
      mem.ask = e.target.checked;
      persist();
      draw();
    });
    $('#ps-brand', ws)?.addEventListener('change', (e) => {
      mem.useBrand = e.target.checked;
      persist();
      draw();
    });
    $('#ps-brand-go', ws)?.addEventListener('click', (e) => {
      e.preventDefault();
      const d = $('#ps-ctx');
      d.open = true;
      d.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => $('[data-b="name"]', d)?.focus(), 350);
    });
    $('#ps-ex', ws).addEventListener('click', () => {
      tpl.fields.forEach((k) => {
        mem.vals[k] = pick(tpl.ex?.[k] || FIELDS[k].ex);
        $(`#ps-${k}`, ws).value = mem.vals[k];
      });
      persist();
      draw();
    });
    $('#ps-clear', ws).addEventListener('click', () => {
      tpl.fields.forEach((k) => {
        mem.vals[k] = '';
        $(`#ps-${k}`, ws).value = '';
      });
      persist();
      draw();
      $(`#ps-${tpl.req[0]}`, ws)?.focus();
    });
    $('#ps-raw', ws).addEventListener('click', () => {
      raw = !raw;
      draw();
    });
    $('#ps-neg-c', ws).addEventListener('click', async () => {
      if (await copyText($('#ps-neg-t', ws).textContent)) toast(`${icon('check', { size: 18 })} ${t('app.ps.copied')}`);
    });
    draw();
  }

  /* ------------------------ aperçu et actions ------------------------- */

  let current = null;
  function draw() {
    const ws = $('#ps-ws');
    if (!ws || locked(tpl.id)) return;
    const o = optsOf(tpl);
    const brand = !tpl.media && mem.useBrand ? brandText(mem.brand) : '';
    const r = buildPrompt(tpl, mem.vals, o, { L: lang, expert: mem.expert, ask: mem.ask, brand });
    current = r;
    // Repères des champs obligatoires encore vides
    // (les prompts d'image et de vidéo sont en anglais : leurs repères aussi)
    const miss = tpl.req.filter((k) => !(mem.vals[k] && String(mem.vals[k]).trim())).map((k) => `[${FIELDS[k].label[tpl.media ? 'en' : lang] || FIELDS[k].label.fr}]`);
    const mark = (s) => {
      let h = esc(s);
      for (const m of miss) h = h.split(esc(m)).join(`<mark class="ps-miss">${esc(m)}</mark>`);
      return h;
    };
    const pv = $('#ps-pv', ws);
    pv.dir = r.kind === 'media' ? 'ltr' : 'auto';
    pv.classList.toggle('is-raw', raw);
    $('#ps-raw', ws).textContent = t(raw ? 'app.ps.annotated' : 'app.ps.raw');
    if (raw) pv.innerHTML = `<pre class="ps-raw-t">${mark(r.text)}</pre>`;
    else if (r.kind === 'media')
      pv.innerHTML = `<p class="ps-media">${r.blocks.map((b) => `<span class="ps-seg" data-k="${b.k}" title="${esc(t(`app.ps.w.${b.k}`))}">${mark(b.body)}</span>`).join(' ')}</p>
        <p class="ps-legend">${[...new Set(r.blocks.map((b) => b.k))].map((k) => `<span class="ps-lg" data-k="${k}" title="${esc(t(`app.ps.w.${k}`))}">${t(`app.ps.s.${k}`)}</span>`).join('')}</p>`;
    else
      pv.innerHTML = r.blocks
        .map((b) => {
          const tag = b.k === 'role' ? '' : b.doc || { context: 'context', brand: 'brand', task: 'task', method: 'method', rules: 'rules', examples: 'examples', format: 'output_format', check: 'quality_check', missing: 'missing_info' }[b.k];
          return `<div class="ps-b" data-k="${b.k}">
            <span class="ps-b-k" title="${esc(t(`app.ps.w.${b.k}`))}">${t(`app.ps.s.${b.k}`)}${mem.expert && tag ? `<code>&lt;${tag}&gt;</code>` : ''}</span>
            <div class="ps-b-t" dir="auto">${mark(b.body)}</div>
          </div>`;
        })
        .join('');
    // Negative prompt (Kling)
    $('#ps-neg', ws).hidden = !r.neg;
    $('#ps-neg-t', ws).textContent = r.neg || '';
    // Force du prompt
    const S = strength(tpl, mem.vals, { expert: mem.expert, brand });
    const lvl = S.score >= 90 ? 3 : S.score >= 75 ? 2 : S.score >= 50 ? 1 : 0;
    $('#ps-sc', ws).innerHTML = `<b>${S.score}</b> % · ${t(`app.ps.m${lvl}`)}`;
    $('#ps-meter', ws).dataset.l = lvl;
    $('#ps-bar', ws).style.width = `${S.score}%`;
    $('#ps-tip', ws).innerHTML = S.missing
      ? `${icon('info', { size: 14 })} ${esc(pick(FIELDS[S.missing].tip))}`
      : !tpl.media && !mem.expert
        ? `${icon('bolt', { size: 14 })} ${t('app.ps.tip.expert')}`
        : !tpl.media && !brand
          ? `${icon('user', { size: 14 })} ${t('app.ps.tip.brand')}`
          : `${icon('check', { size: 14 })} ${t('app.ps.tip.ok')}`;
    // Notes selon le type
    const notes = [];
    if (tpl.media) notes.push(t('app.ps.note.media'));
    if (tpl.media && o.ref === 'yes') notes.push(t('app.ps.note.ref'));
    if (tpl.media === 'video' && o.vtool === 'veo') notes.push(t('app.ps.note.veo'));
    if (tpl.code) notes.push(t('app.ps.note.code'));
    if (tpl.id === 'voix') notes.push(t('app.ps.note.voice'));
    $('#ps-note', ws).innerHTML = notes.map((n) => `<span>${icon('info', { size: 14 })} ${n}</span>`).join('');
    $('#ps-note', ws).hidden = !notes.length;
    // Actions : copier, puis ouvrir (l'outil choisi d'abord)
    const chosen = tpl.toolOpt ? TOOL_OF[o[tpl.toolOpt]] : null;
    const tools = [...new Set([chosen, ...tpl.tools].filter((x) => x && TOOLS[x]))];
    $('#ps-act', ws).innerHTML = `<button class="b b--or" type="button" id="ps-copy">${icon('copy', { size: 16 })} ${t('app.ps.copy')}</button>${tools
      .map((id) => `<button class="b b--s" type="button" data-open="${id}">${t('app.ps.open', { name: esc(TOOLS[id].name) })}${icon('arrow', { size: 14, cls: 'i-ext' })}</button>`)
      .join('')}`;
    $('#ps-copy', ws).addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      if (!(await copyText(r.text))) return;
      remember();
      const was = btn.innerHTML;
      btn.innerHTML = `${icon('check', { size: 16 })} ${t('app.ps.copied')}`;
      btn.classList.add('is-done');
      setTimeout(() => {
        btn.innerHTML = was;
        btn.classList.remove('is-done');
      }, 1500);
    });
    $$('[data-open]', ws).forEach((b) =>
      b.addEventListener('click', async () => {
        const T = TOOLS[b.dataset.open];
        const q = encodeURIComponent(r.text);
        const url = T.q && q.length < PREFILL_MAX ? `${T.q}${q}` : T.url;
        window.open(url, '_blank', 'noopener');
        await copyText(r.text);
        remember();
        toast(`${icon('copy', { size: 18 })} ${t('app.ps.toast', { name: esc(T.name) })}`, 3600);
      }),
    );
    // Étape suivante : le modèle suivant garde les mêmes champs
    $('#ps-next', ws).innerHTML = tpl.next?.length
      ? `<span>${t('app.ps.next')}</span>${tpl.next.map((id) => `<button class="ps-nx" type="button" data-nx="${id}">${icon(byId[id].icon, { size: 14 })} ${esc(pick(byId[id].title))} ${arrow(13)}</button>`).join('')}`
      : '';
    $$('[data-nx]', ws).forEach((b) => b.addEventListener('click', () => choose(b.dataset.nx, true)));
  }

  /* ---------------------- prompts récents (copiés) --------------------- */

  function remember() {
    if (!current) return;
    const first = tpl.req.map((k) => mem.vals[k]).find((x) => x && String(x).trim()) || '';
    const item = { id: tpl.id, at: Date.now(), label: String(first).slice(0, 80), text: current.text, vals: Object.fromEntries(tpl.fields.map((k) => [k, mem.vals[k] || ''])), opts: optsOf(tpl), expert: mem.expert };
    mem.hist = [item, ...mem.hist.filter((h) => h.text !== item.text)].slice(0, 12);
    persist();
    drawHist();
  }
  function drawHist() {
    const box = $('#ps-hist-l');
    if (!box) return;
    box.innerHTML = mem.hist.length
      ? `<ul class="ps-hl">${mem.hist
          .map((h, i) => {
            const x = byId[h.id];
            if (!x) return '';
            return `<li><span class="ps-hl-ic" data-g="${x.g}">${icon(x.icon, { size: 16 })}</span><div><b>${esc(pick(x.title))}</b><small>${esc(h.label || '—')} · ${esc(ago(h.at))}</small></div><button class="b b--s" type="button" data-hc="${i}">${icon('copy', { size: 14 })}</button><button class="b b--s" type="button" data-ho="${i}">${t('app.ps.hist.open')}</button></li>`;
          })
          .join('')}</ul><button class="ps-ln" type="button" id="ps-hist-x">${t('app.ps.hist.clear')}</button>`
      : `<p class="muted ps-hist-0">${t('app.ps.hist.none')}</p>`;
    $$('[data-ho]', box).forEach((b) =>
      b.addEventListener('click', () => {
        const h = mem.hist[+b.dataset.ho];
        if (!h) return;
        Object.assign(mem.vals, h.vals || {});
        mem.opts[h.id] = { ...(h.opts || {}) };
        if (typeof h.expert === 'boolean') mem.expert = h.expert;
        persist();
        choose(h.id, true);
      }),
    );
    $$('[data-hc]', box).forEach((b) =>
      b.addEventListener('click', async () => {
        const h = mem.hist[+b.dataset.hc];
        if (h && (await copyText(h.text))) toast(`${icon('check', { size: 18 })} ${t('app.ps.copied')}`);
      }),
    );
    $('#ps-hist-x', box)?.addEventListener('click', () => {
      mem.hist = [];
      persist();
      drawHist();
    });
  }

  /* ----------------------------- mon contexte -------------------------- */

  const ctxStatus = () => {
    const on = !!brandText(mem.brand);
    $('#ps-ctx-st').textContent = on ? t('app.ps.ctx.on') : t('app.ps.ctx.empty');
    $('#ps-ctx').classList.toggle('is-on', on);
  };
  $('#ps-ctx-save').addEventListener('click', () => {
    $$('#ps-ctx [data-b]').forEach((i) => (mem.brand[i.dataset.b] = i.value.trim()));
    mem.useBrand = true;
    persist();
    ctxStatus();
    toast(`${icon('check', { size: 18 })} ${t('app.ps.ctx.saved')}`);
    drawWorkspace();
  });

  markTpl();
  drawWorkspace();
  drawHist();
  ctxStatus();
  if (ctx.tplId && byId[ctx.tplId]) requestAnimationFrame(() => choose(ctx.tplId, true));
  enter?.('.ps-hero, .ps-tpl, .ps-ws, .ps-more > *, .ps-learn');
}
