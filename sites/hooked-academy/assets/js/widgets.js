// Exercices interactifs des leçons. renderWidget(nom, conteneur, { lesson, module, onXP }).
// Chaque exercice fonctionne au doigt comme à la souris ; les animations respectent le mouvement réduit.
// Textes : assets/js/i18n/widgets.js (clés wd.*), en français, anglais et arabe (de droite à gauche).

import { icon } from './icons.js';
import { t, fmtNum } from './i18n.js';
import './i18n/widgets.js';
import { product, person, BG } from '../../motion/art.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = () => (reduce ? null : window.gsap);
const store = {
  get: (k, d) => {
    try {
      return JSON.parse(localStorage.getItem(`hooked-academy:ex:${k}`)) ?? d;
    } catch {
      return d;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(`hooked-academy:ex:${k}`, JSON.stringify(v));
    } catch {}
  },
};
/** Liste traduite (tableau du dictionnaire). */
const tA = (k) => {
  const v = t(k);
  return Array.isArray(v) ? v : [];
};
/** Nombre à décimales fixes, au format de la langue (sans séparateur de milliers). */
const dec = (x, d = 1) => fmtNum(x, { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false });
const money = (x) => t('wd.money', { n: fmtNum(x) });
const once = (key, ctx, n, why) => {
  if (store.get(`xp:${key}`, false)) return;
  store.set(`xp:${key}`, true);
  ctx.onXP?.(n, why);
};
const copyText = (txt, btn) =>
  navigator.clipboard?.writeText(txt).then(() => {
    if (!btn) return;
    const o = btn.innerHTML;
    btn.innerHTML = `${icon('check', { size: 15 })} ${esc(t('wd.copied'))}`;
    setTimeout(() => (btn.innerHTML = o), 1400);
  });
const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const seg = (name, opts, cur) => `<div class="seg" data-seg="${name}">${opts.map(([v, lab]) => `<button type="button" data-v="${esc(v)}" aria-pressed="${v === cur}">${esc(lab)}</button>`).join('')}</div>`;
function onSeg(root, name, fn) {
  $$(`[data-seg="${name}"] button`, root).forEach((b) =>
    b.addEventListener('click', () => {
      $$(`[data-seg="${name}"] button`, root).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      fn(b.dataset.v);
    }),
  );
}
const pop = (el) => gsap()?.fromTo(el, { scale: 0.94, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2)' });

/* ------------------------------------------------------------------ */

export function flashcards(box, lesson) {
  const qs = (lesson.quiz || []).slice(0, 4);
  const cards = qs.length ? qs.map((q) => ({ f: q.q, b: `${q.a[q.ok]} — ${q.why}` })) : (lesson.key || []).map((k, i) => ({ f: t('wd.fc.key', { n: i + 1 }), b: k }));
  box.innerHTML = `<div class="flash">${cards.map((c) => `<div class="fc" tabindex="0" role="button" aria-label="${esc(t('wd.fc.flip'))}"><div class="fc-in"><div class="fc-f"><span>${esc(t('wd.fc.q'))}</span><b>${esc(c.f)}</b></div><div class="fc-b">${esc(c.b)}</div></div></div>`).join('')}</div>`;
  $$('.fc', box).forEach((c) => {
    const flip = () => c.classList.toggle('is-flip');
    c.addEventListener('click', flip);
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flip();
      }
    });
  });
}

const W = {};

W.formats = (el, ctx) => {
  const BGS = { video: 'teal', image: 'sable', carrousel: 'rose' };
  const F = Object.fromEntries(Object.keys(BGS).map((k) => [k, { t: t(`wd.fm.${k}.t`), d: t(`wd.fm.${k}.d`), bg: BGS[k], hl: t(`wd.fm.${k}.hl`), btn: t(`wd.fm.${k}.btn`), l: tA(`wd.fm.${k}.l`) }]));
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.fm.h'))}</h3>${seg('f', [['video', t('wd.fm.video')], ['image', t('wd.fm.image')], ['carrousel', t('wd.fm.carrousel')]], 'video')}
    <div class="wd-grid"><div class="mini-ph"><div class="mini-sc" id="msc"></div></div><div><h4 class="wd-h" id="ft"></h4><p class="wd-p" id="fd"></p><ul class="wd-p" id="fl" style="padding-inline-start:18px;margin-top:10px"></ul></div></div></div>`;
  const draw = (k) => {
    const f = F[k];
    $('#msc', el).style.background = BG[f.bg];
    $('#msc', el).innerHTML = `${product(k === 'image' ? 'creme' : k === 'carrousel' ? 'serum' : 'parfum')}<p class="mini-hl">${esc(f.hl)}</p>${k === 'video' ? '<div style="position:absolute;left:12px;right:12px;top:12px;height:3px;border-radius:3px;background:rgba(255,255,255,.3)"><i style="display:block;height:100%;width:45%;background:#fff;border-radius:3px"></i></div>' : ''}<div class="mini-btn">${esc(f.btn)}</div>`;
    $('#ft', el).textContent = f.t;
    $('#fd', el).textContent = f.d;
    $('#fl', el).innerHTML = f.l.map((x) => `<li>${esc(x)}</li>`).join('');
    pop($('#msc', el));
  };
  let seen = new Set();
  onSeg(el, 'f', (k) => {
    draw(k);
    seen.add(k);
    if (seen.size === 3) once(`formats:${ctx.lesson.id}`, ctx, 20, t('wd.fm.xp'));
  });
  draw('video');
  seen.add('video');
};

W.outils = (el, ctx) => {
  const T = [
    ['capcut', 'CapCut', t('wd.ou.capcut'), 'https://www.capcut.com', 'scissors'],
    ['canva', 'Canva', t('wd.ou.canva'), 'https://www.canva.com', 'layout'],
    ['chatgpt', 'ChatGPT', t('wd.ou.chatgpt'), 'https://chatgpt.com', 'chat'],
  ];
  const st = store.get('outils', {});
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.ou.h'))}</h3><p class="wd-p">${esc(t('wd.ou.p'))}</p><div style="display:grid;gap:10px">${T.map(
    ([k, n, d, u, ic]) => `<label class="card" style="display:flex;align-items:center;gap:14px;padding:14px;cursor:pointer"><input type="checkbox" data-k="${k}" ${st[k] ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--gold-500)"><span style="width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:rgb(201 162 39 / .14);color:var(--gold-300)">${icon(ic, { size: 22 })}</span><span style="display:grid"><b>${n}</b><span class="muted" style="font-size:13px">${esc(d)}</span></span><a class="b b--s" href="${u}" target="_blank" rel="noopener" style="margin-inline-start:auto">${esc(t('wd.ou.open'))}</a></label>`,
  ).join('')}</div><div class="meter"><i id="om" style="width:0"></i></div></div>`;
  const upd = () => {
    const n = $$('input', el).filter((i) => i.checked).length;
    $('#om', el).style.width = `${(n / 3) * 100}%`;
    if (n === 3) once('outils', ctx, 30, t('wd.ou.xp'));
  };
  $$('input', el).forEach((i) =>
    i.addEventListener('change', () => {
      st[i.dataset.k] = i.checked;
      store.set('outils', st);
      upd();
    }),
  );
  upd();
};

W.ratio = (el) => {
  const R = { '9:16': [9, 16, t('wd.ra.9:16')], '4:5': [4, 5, t('wd.ra.4:5')], '1:1': [1, 1, t('wd.ra.1:1')], '16:9': [16, 9, t('wd.ra.16:9')] };
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.ra.h'))}</h3>${seg('r', Object.keys(R).map((k) => [k, k]), '9:16')}<label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" id="sz" checked style="accent-color:var(--gold-500)"> ${esc(t('wd.ra.zones'))}</label>
    <div style="display:grid;place-items:center;min-height:380px"><div class="ipreview" id="rp" style="background:${BG.studio};width:auto;height:360px">${product('parfum')}<i class="ip-r" id="rr"></i><div id="zt" style="position:absolute;left:0;right:0;top:0;height:13%;background:repeating-linear-gradient(45deg,rgb(226 96 74/.4) 0 8px,rgb(226 96 74/.15) 8px 16px)"></div><div id="zb" style="position:absolute;left:0;right:0;bottom:0;height:22%;background:repeating-linear-gradient(45deg,rgb(226 96 74/.4) 0 8px,rgb(226 96 74/.15) 8px 16px)"></div></div></div><p class="wd-p" id="ru" style="text-align:center"></p></div>`;
  const rp = $('#rp', el);
  rp.querySelector('.art').style.transform = 'translate(-50%,-50%)';
  const draw = (k) => {
    const [a, b, u] = R[k];
    const h = a / b > 1.2 ? Math.min(360, (el.clientWidth - 20) * (b / a)) : 360;
    rp.style.height = `${h}px`;
    rp.style.aspectRatio = `${a} / ${b}`;
    $('#rr', el).textContent = k;
    $('#ru', el).textContent = u;
    const z = $('#sz', el).checked && k === '9:16';
    $('#zt', el).hidden = !z;
    $('#zb', el).hidden = !z;
  };
  let cur = '9:16';
  onSeg(el, 'r', (k) => draw((cur = k)));
  $('#sz', el).addEventListener('change', () => draw(cur));
  draw(cur);
};

W.anatomie = (el, ctx) => {
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.an.h'))}</h3><p class="wd-p">${esc(t('wd.an.p'))}</p>
    <div class="wd-grid"><div class="mini-ph"><div class="mini-sc" id="asc" style="background:${BG.teal}">${product('parfum')}<p class="mini-hl" id="ahl"></p><div class="mini-btn" id="abtn">${esc(t('wd.an.btn'))}</div></div></div>
    <div style="display:grid;gap:12px"><b id="aph" style="font-family:var(--font-display);font-size:28px"></b><p class="wd-p" id="ad"></p>
    <input class="range" type="range" min="0" max="150" value="0" id="ar" aria-label="${esc(t('wd.an.range'))}"><div style="display:grid;grid-template-columns:2fr 9fr 4fr;gap:4px"><i style="height:8px;border-radius:4px;background:var(--hook)"></i><i style="height:8px;border-radius:4px;background:var(--body)"></i><i style="height:8px;border-radius:4px;background:var(--cta)"></i></div><span class="muted" id="at" style="font-family:var(--font-mono);font-size:12px"></span></div></div></div>`;
  const P = [
    [3, t('wd.an.hook'), 'var(--hook)', t('wd.an.hook.d'), t('wd.an.hook.hl')],
    [11, t('wd.an.body'), 'var(--body)', t('wd.an.body.d'), t('wd.an.body.hl')],
    [15, t('wd.an.cta'), 'var(--cta)', t('wd.an.cta.d'), t('wd.an.cta.hl')],
  ];
  const r = $('#ar', el);
  let maxSeen = 0;
  const draw = () => {
    const sec = +r.value / 10;
    maxSeen = Math.max(maxSeen, sec);
    const k = sec < 3 ? 0 : sec < 11 ? 1 : 2;
    const [, n, c, d, hl] = P[k];
    $('#aph', el).textContent = n;
    $('#aph', el).style.color = c;
    $('#ad', el).textContent = d;
    $('#ahl', el).textContent = hl;
    $('#at', el).textContent = t('wd.an.time', { t: dec(sec), total: fmtNum(15) });
    $('#abtn', el).style.opacity = k === 2 ? 1 : 0.25;
    $('#abtn', el).style.transform = k === 2 ? 'scale(1.05)' : '';
    if (maxSeen >= 14.5) once(`anatomie:${ctx.lesson.id}`, ctx, 20, t('wd.an.xp'));
  };
  r.addEventListener('input', draw);
  draw();
};

W.hooks = (el, ctx) => {
  const K = ['pos', 'neg', 'stat', 'pos', 'neg', 'stat'];
  const H = shuffle(tA('wd.hk.items').map((txt, i) => [txt, K[i]]));
  const N = { pos: t('wd.hk.pos'), neg: t('wd.hk.neg'), stat: t('wd.hk.stat') };
  let ok = 0;
  let done = 0;
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.hk.h'))}</h3><p class="wd-p">${esc(t('wd.hk.p'))}</p><div style="display:grid;gap:10px">${H.map(
    ([txt], i) => `<div class="card" data-i="${i}" style="padding:14px;display:grid;gap:10px"><b>${esc(t('wd.quote', { s: txt }))}</b><div class="seg">${Object.entries(N).map(([v, n]) => `<button type="button" data-v="${v}">${esc(n)}</button>`).join('')}</div></div>`,
  ).join('')}</div><div class="qz-score" id="hs" hidden></div></div>`;
  $$('[data-i]', el).forEach((c) => {
    const k = H[+c.dataset.i][1];
    $$('button', c).forEach((b) =>
      b.addEventListener('click', () => {
        if (c.dataset.done) return;
        c.dataset.done = 1;
        done++;
        const good = b.dataset.v === k;
        if (good) ok++;
        b.setAttribute('aria-pressed', 'true');
        c.style.boxShadow = `inset 0 0 0 1.5px ${good ? 'var(--body)' : 'var(--danger)'}`;
        if (!good) $(`button[data-v="${k}"]`, c).style.boxShadow = 'inset 0 0 0 1.5px var(--body)';
        if (done === H.length) {
          const s = $('#hs', el);
          s.hidden = false;
          s.textContent = `${t('wd.hk.score', { ok: fmtNum(ok), n: fmtNum(H.length) })}${ok === H.length ? t('wd.hk.perfect') : ''}`;
          if (ok >= 5) once(`hooks:${ctx.lesson.id}`, ctx, 30, t('wd.hk.xp'));
        }
      }),
    );
  });
};

W.cta = (el, ctx) => {
  const O = { v: tA('wd.cta.v'), b: tA('wd.cta.b'), f: tA('wd.cta.f'), u: tA('wd.cta.u') };
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.cta.h'))}</h3><div class="wd-grid"><div style="display:grid;gap:10px">
    ${[['v', t('wd.cta.lv')], ['b', t('wd.cta.lb')], ['f', t('wd.cta.lf')], ['u', t('wd.cta.lu')]].map(([k, n]) => `<label class="lbl">${esc(n)}<select class="in" data-k="${k}">${O[k].map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>`).join('')}
    </div><div style="display:grid;gap:12px;justify-items:center"><div class="mini-ph"><div class="mini-sc" style="background:${BG.or}">${product('parfum')}<p class="mini-hl">${esc(t('wd.cta.hl'))}</p><div class="mini-btn" id="cb" style="font-size:11px"></div></div></div><div style="width:100%"><span class="muted" style="font-size:12px">${esc(t('wd.cta.ing'))}</span><div class="meter"><i id="cm"></i></div></div></div></div></div>`;
  const draw = () => {
    const v = Object.fromEntries($$('select', el).map((s) => [s.dataset.k, s.value]));
    $('#cb', el).textContent = `${v.v} ${v.b} ${v.f} ${v.u}`.replace(/\s+/g, ' ').trim();
    const n = 2 + (v.f ? 1 : 0) + (v.u ? 1 : 0);
    $('#cm', el).style.width = `${(n / 4) * 100}%`;
    pop($('#cb', el));
    if (n >= 3) once(`cta:${ctx.lesson.id}`, ctx, 20, t('wd.cta.xp'));
  };
  $$('select', el).forEach((s) => s.addEventListener('change', draw));
  draw();
};

W.aida = (el, ctx) => {
  const A = [
    ['A', t('wd.ai.a1'), t('wd.ai.a1.s'), 'var(--hook)'],
    ['I', t('wd.ai.i'), t('wd.ai.i.s'), 'var(--body)'],
    ['D', t('wd.ai.d'), t('wd.ai.d.s'), 'var(--body)'],
    ['A', t('wd.ai.a2'), t('wd.ai.a2.s'), 'var(--cta)'],
  ];
  let order = shuffle(A.map((_, i) => i));
  if (order.join() === '0,1,2,3') order = [2, 0, 3, 1];
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.ai.h'))}</h3><p class="wd-p">${esc(t('wd.ai.p'))}</p><ol class="sortable" id="so"></ol><button class="b b--or" type="button" id="ch">${esc(t('wd.check'))}</button><p class="wd-p" id="cr"></p></div>`;
  const so = $('#so', el);
  const draw = () => {
    so.innerHTML = order
      .map((i, p) => `<li><div class="it" data-p="${p}" style="--c:${A[i][3]}"><span class="k">${A[i][0]}</span><span style="display:grid"><b>${esc(A[i][1])}</b><span class="muted" style="font-size:12px;font-weight:500">${esc(A[i][2])}</span></span><span class="mv"><button class="b b--i b--s" type="button" data-up="${p}" aria-label="${esc(t('wd.up'))}">↑</button><button class="b b--i b--s" type="button" data-dn="${p}" aria-label="${esc(t('wd.down'))}">↓</button></span></div></li>`)
      .join('');
    $$('[data-up]', so).forEach((b) => b.addEventListener('click', () => move(+b.dataset.up, -1)));
    $$('[data-dn]', so).forEach((b) => b.addEventListener('click', () => move(+b.dataset.dn, 1)));
    if (window.Draggable && !reduce) {
      $$('.it', so).forEach((it) => {
        window.Draggable.create(it, {
          type: 'y',
          bounds: so,
          onDragEnd() {
            const p = +it.dataset.p;
            const h = it.offsetHeight + 8;
            const to = Math.max(0, Math.min(order.length - 1, p + Math.round(this.y / h)));
            const [x] = order.splice(p, 1);
            order.splice(to, 0, x);
            draw();
          },
        });
      });
    }
  };
  const move = (p, d) => {
    const q = p + d;
    if (q < 0 || q >= order.length) return;
    [order[p], order[q]] = [order[q], order[p]];
    draw();
  };
  draw();
  $('#ch', el).addEventListener('click', () => {
    const ok = order.join() === '0,1,2,3';
    so.classList.toggle('is-ok', ok);
    $('#cr', el).textContent = ok ? t('wd.ai.ok') : t('wd.ai.ko');
    if (ok) once(`aida:${ctx.lesson.id}`, ctx, 30, t('wd.ai.xp'));
  });
};

W.carrousel = (el, ctx) => {
  const def = tA('wd.ca.def');
  const names = tA('wd.ca.names');
  const bgs = ['nuit', 'rose', 'teal', 'sable', 'or'];
  const saved = store.get(`car:${ctx.lesson.id}`, def);
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.ca.h'))}</h3><div class="wd-grid"><div style="display:grid;gap:8px">${names.map((n, i) => `<label class="lbl">${i + 1}. ${esc(n)}<input class="in" data-i="${i}" value="${esc(saved[i])}" maxlength="60"></label>`).join('')}</div>
    <div style="display:grid;gap:10px;justify-items:center"><div class="mini-ph"><div class="mini-sc" id="cs"></div></div><div class="seg">${names.map((n, i) => `<button type="button" data-s="${i}" aria-pressed="${i === 0}">${i + 1}</button>`).join('')}</div></div></div></div>`;
  let cur = 0;
  const draw = () => {
    const v = $$('input', el).map((i) => i.value);
    store.set(`car:${ctx.lesson.id}`, v);
    const sc = $('#cs', el);
    sc.style.background = BG[bgs[cur]];
    sc.innerHTML = `<span style="position:absolute;inset-inline-end:10px;top:10px;font-family:var(--font-mono);font-size:10px;padding:2px 6px;border-radius:6px;background:rgba(0,0,0,.4)">${cur + 1}/5</span><p class="mini-hl">${esc(v[cur])}</p>${product(cur === 4 ? 'parfum' : 'parfum')}${cur === 4 ? `<div class="mini-btn">${esc(t('wd.ca.btn'))}</div>` : ''}`;
    $$('[data-s]', el).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.s === cur)));
  };
  $$('input', el).forEach((i) =>
    i.addEventListener('input', () => {
      cur = +i.dataset.i;
      draw();
      if ($$('input', el).every((x) => x.value.trim().length > 3)) once(`car:${ctx.lesson.id}`, ctx, 20, t('wd.ca.xp'));
    }),
  );
  $$('[data-s]', el).forEach((b) =>
    b.addEventListener('click', () => {
      cur = +b.dataset.s;
      draw();
      pop($('#cs', el));
    }),
  );
  draw();
};

W.prompt = (el, ctx) => {
  const F = [
    ['role', 'var(--ia)'],
    ['ctx', 'var(--hook)'],
    ['task', 'var(--body)'],
    ['fmt', 'var(--cta)'],
    ['cons', 'var(--gold-400)'],
  ].map(([k, c]) => [t(`wd.pr.${k}`), t(`wd.pr.${k}.ex`), c]);
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.pr.h'))}</h3><div class="wd-grid" style="align-items:start"><div style="display:grid;gap:8px">${F.map(([n, ph, c], i) => `<label class="lbl"><span style="color:${c}">${esc(n)}</span><textarea class="in" rows="2" data-i="${i}" placeholder="${esc(ph)}"></textarea></label>`).join('')}<button class="b b--s" type="button" id="pex">${esc(t('wd.pr.fill'))}</button></div>
    <div style="display:grid;gap:10px"><span class="muted" style="font-size:12px">${esc(t('wd.pr.yours'))}</span><div class="out" id="po"></div><span class="muted" style="font-size:12px">${esc(t('wd.pr.quality'))}</span><div class="meter"><i id="pm"></i></div><button class="b b--or" type="button" id="pc">${icon('copy', { size: 16 })} ${esc(t('wd.copy.prompt'))}</button></div></div></div>`;
  const draw = () => {
    const v = $$('textarea', el).map((ta) => ta.value.trim());
    $('#po', el).innerHTML = v.some(Boolean) ? v.map((x, i) => (x ? `<span style="box-shadow:inset 0 -2px 0 ${F[i][2]}">${esc(x)}</span>` : '')).filter(Boolean).join(' ') : `<span class="muted">${esc(t('wd.pr.empty'))}</span>`;
    const score = v.filter((x) => x.length > 8).length / 5;
    $('#pm', el).style.width = `${score * 100}%`;
    if (score === 1) once(`prompt:${ctx.lesson.id}`, ctx, 30, t('wd.pr.xp'));
  };
  $$('textarea', el).forEach((t) => t.addEventListener('input', draw));
  $('#pex', el).addEventListener('click', () => {
    $$('textarea', el).forEach((ta, i) => (ta.value = F[i][1]));
    draw();
  });
  $('#pc', el).addEventListener('click', (e) => copyText($('#po', el).textContent, e.currentTarget));
  draw();
};

W['prompt-image'] = (el, ctx) => {
  // Chaque option : le texte du prompt (wd.pi.groupe.valeur) et son libellé court sur le bouton (… .l).
  const G = {
    sujet: ['parfum', 'creme', 'serum'],
    decor: ['studio', 'bain', 'sable', 'rose'],
    lumiere: ['g', 'cj', 'dur'],
    cadrage: ['proche', 'cp', 'large'],
    style: ['luxe', 'life', 'mini'],
    format: ['4:5', '9:16', '1:1'],
  };
  const cur = { sujet: 'parfum', decor: 'studio', lumiere: 'g', cadrage: 'proche', style: 'luxe', format: '4:5' };
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.pi.h'))}</h3><div class="wd-grid" style="align-items:start"><div style="display:grid;gap:12px">${Object.keys(G).map((k) => `<div style="display:grid;gap:6px"><span class="muted" style="font-size:12px;font-weight:700">${esc(t(`wd.pi.${k}`))}</span>${seg(k, G[k].map((v) => [v, t(`wd.pi.${k}.${v}.l`)]), cur[k])}</div>`).join('')}</div>
    <div style="display:grid;gap:12px"><div class="ipreview" id="ip"><div class="light" id="il"></div><i class="ip-r" id="ir"></i></div><div class="out" id="io"></div><button class="b b--or" type="button" id="ic">${icon('copy', { size: 16 })} ${esc(t('wd.copy.prompt'))}</button></div></div></div>`;
  const ip = $('#ip', el);
  const draw = () => {
    ip.querySelector('.art')?.remove();
    ip.insertAdjacentHTML('afterbegin', product(cur.sujet));
    ip.style.background = BG[cur.decor];
    const [a, b] = cur.format.split(':').map(Number);
    ip.style.aspectRatio = `${a} / ${b}`;
    $('#ir', el).textContent = cur.format;
    $('#il', el).style.background = { g: 'linear-gradient(90deg, rgb(255 240 210 / .35), transparent 60%)', cj: 'radial-gradient(60% 50% at 50% 30%, rgb(255 210 120 / .55), transparent 70%)', dur: 'linear-gradient(120deg, transparent 40%, rgb(0 0 0 / .55))' }[cur.lumiere];
    const art = ip.querySelector('.art');
    const tf = { proche: 'translate(-50%,-50%) scale(1.15)', cp: 'translate(-50%,-48%) scale(1.1) perspective(400px) rotateX(-14deg)', large: 'translate(-50%,-40%) scale(.7)' }[cur.cadrage];
    art.style.transform = tf;
    art.style.filter = cur.style === 'mini' ? 'saturate(.6)' : cur.style === 'life' ? 'saturate(1.15)' : 'contrast(1.08)';
    const txt = Object.keys(G).map((k) => t(`wd.pi.${k}.${cur[k]}`)).join(', ') + '.';
    $('#io', el).textContent = txt;
  };
  let changes = 0;
  Object.keys(G).forEach((k) =>
    onSeg(el, k, (v) => {
      cur[k] = v;
      draw();
      pop(ip);
      if (++changes >= 4) once(`pimg:${ctx.lesson.id}`, ctx, 20, t('wd.pi.xp'));
    }),
  );
  $('#ic', el).addEventListener('click', (e) => copyText($('#io', el).textContent, e.currentTarget));
  draw();
};

W.camera = (el, ctx) => {
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.cm.h'))}</h3><div class="cam3d"><canvas id="cc"></canvas><span>REC ●</span></div>${seg('m', ['push', 'orbit', 'pan', 'crane'].map((k) => [k, t(`wd.cm.${k}`)]), '')}<p class="wd-p" id="cd">${esc(t('wd.cm.p'))}</p></div>`;
  const D = Object.fromEntries(['push', 'orbit', 'pan', 'crane'].map((k) => [k, t(`wd.cm.${k}.d`)]));
  let lab = null;
  import('./lab3d.js')
    .then((m) => {
      lab = m.initLab($('#cc', el), { manualCamera: true, step: 6 });
      if (!lab) throw new Error('webgl');
    })
    .catch(() => {
      $('.cam3d', el).innerHTML = `<div style="position:absolute;inset:15% 30%">${product('parfum')}</div>`;
    });
  let tried = new Set();
  onSeg(el, 'm', (k) => {
    $('#cd', el).textContent = D[k];
    tried.add(k);
    if (tried.size === 4) once(`cam:${ctx.lesson.id}`, ctx, 20, t('wd.cm.xp'));
    if (!lab || !window.gsap) return;
    const c = lab.camera;
    const L = lab.look;
    const g = window.gsap;
    g.killTweensOf(c.position);
    c.position.set(0, 1.6, 7.4);
    L.set(0, 1.1, 0);
    const upd = () => lab.render();
    if (k === 'push') g.fromTo(c.position, { z: 8.4, y: 1.5 }, { z: 4.2, y: 1.3, duration: 2.6, ease: 'power2.inOut', onUpdate: upd });
    if (k === 'orbit') {
      const o = { a: -0.9 };
      g.to(o, { a: 0.9, duration: 3, ease: 'sine.inOut', onUpdate: () => (c.position.set(Math.sin(o.a) * 6.4, 1.6, Math.cos(o.a) * 6.4), upd()) });
    }
    if (k === 'pan') g.fromTo(c.position, { x: -2.6 }, { x: 2.6, duration: 3, ease: 'sine.inOut', onUpdate: upd });
    if (k === 'crane') g.fromTo(c.position, { y: 7, z: 4.5 }, { y: 1.5, z: 7.2, duration: 3, ease: 'power2.inOut', onUpdate: upd });
  });
};

W.metrics = (el, ctx) => {
  const F = [
    ['imp', 10000],
    ['v3', 3200],
    ['tp', 900],
    ['clic', 160],
    ['dep', 15000],
    ['ach', 12],
  ].map(([k, v]) => [k, t(`wd.mt.${k}`), v]);
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.mt.h'))}</h3><p class="wd-p">${esc(t('wd.mt.p'))}</p><div class="kpis">${F.map(([k, n, v]) => `<label class="lbl">${esc(n)}<input class="in" type="number" min="0" inputmode="numeric" data-k="${k}" value="${v}"></label>`).join('')}</div><div class="kpis" id="mk"></div><div class="out" id="md"></div></div>`;
  const draw = () => {
    const v = Object.fromEntries($$('input', el).map((i) => [i.dataset.k, Math.max(0, +i.value || 0)]));
    const hr = v.imp ? v.v3 / v.imp : 0;
    const hd = v.v3 ? v.tp / v.v3 : 0;
    const ctr = v.imp ? v.clic / v.imp : 0;
    const cpa = v.ach ? v.dep / v.ach : 0;
    const pc = (x) => t('wd.pct', { n: dec(x * 100) });
    $('#mk', el).innerHTML = [
      ['hr', pc(hr), 'var(--hook)'],
      ['hd', pc(hd), 'var(--body)'],
      ['ctr', pc(ctr), 'var(--cta)'],
      ['cpa', cpa ? money(Math.round(cpa)) : '—', 'var(--gold-400)'],
    ].map(([k, x, c]) => `<div class="kpi" style="box-shadow:inset calc(3px * var(--dir, 1)) 0 0 ${c}"><span>${esc(t(`wd.mt.${k}`))}</span><b>${esc(x)}</b><span>${esc(t(`wd.mt.${k}.d`))}</span></div>`).join('');
    const weakest = [
      [hr, 'hook'],
      [hd, 'body'],
      [ctr * 10, 'cta'],
    ].sort((a, b) => a[0] - b[0])[0][1];
    $('#md', el).textContent = t('wd.mt.weak', { part: t(`wd.mt.w.${weakest}`), tip: t(`wd.mt.w.${weakest}.tip`) });
  };
  $$('input', el).forEach((i) =>
    i.addEventListener('input', () => {
      draw();
      once(`metrics:${ctx.lesson.id}`, ctx, 20, t('wd.mt.xp'));
    }),
  );
  draw();
};

W.prix = (el, ctx) => {
  const F = [
    ['h', 2.5],
    ['t', 1500],
    ['o', 6000],
    ['n', 20],
    ['m', 30],
  ].map(([k, v]) => [k, t(`wd.px.f${k}`), v]);
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.px.h'))}</h3><p class="wd-p">${esc(t('wd.px.p'))}</p><div class="kpis">${F.map(([k, n, v]) => `<label class="lbl">${esc(n)}<input class="in" type="number" min="0" step="any" inputmode="decimal" data-k="${k}" value="${v}"></label>`).join('')}</div><div class="kpis" id="pk" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))"></div></div>`;
  const draw = () => {
    const v = Object.fromEntries($$('input', el).map((i) => [i.dataset.k, Math.max(0, +i.value || 0)]));
    const unit = (v.h * v.t + (v.n ? v.o / v.n : 0)) * (1 + v.m / 100);
    const r = (x) => money(Math.round(x / 500) * 500);
    $('#pk', el).innerHTML = [
      ['one', r(unit)],
      ['test', r(unit * 3)],
      ['grow', r(unit * 8 * 0.9)],
      ['sub', r(unit * 12 * 0.85)],
    ].map(([k, x]) => `<div class="kpi"><span>${esc(t(`wd.px.${k}`))}</span><b>${esc(x)}</b><span>${esc(t(`wd.px.${k}.d`))}</span></div>`).join('');
  };
  $$('input', el).forEach((i) =>
    i.addEventListener('input', () => {
      draw();
      once(`prix:${ctx.lesson.id}`, ctx, 20, t('wd.px.xp'));
    }),
  );
  draw();
};

W.dm = (el, ctx) => {
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.dm.h'))}</h3><div class="wd-grid" style="align-items:start"><div style="display:grid;gap:8px">
    <label class="lbl">${esc(t('wd.dm.lm'))}<input class="in" data-k="m" value="${esc(t('wd.dm.m'))}"></label>
    <label class="lbl">${esc(t('wd.dm.lo'))}<input class="in" data-k="o" value="${esc(t('wd.dm.o'))}"></label>
    <label class="lbl">${esc(t('wd.dm.lv'))}<select class="in" data-k="v">${tA('wd.dm.v').map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>
    <label class="lbl">${esc(t('wd.dm.lc'))}<select class="in" data-k="c"><option value="ig">Instagram</option><option value="wa">WhatsApp</option><option value="li">LinkedIn</option></select></label>
    </div><div style="display:grid;gap:10px"><div class="out" id="dmo"></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="b b--or" type="button" id="dmc">${icon('copy', { size: 16 })} ${esc(t('wd.copy'))}</button><a class="b" id="dmw" target="_blank" rel="noopener">${icon('whatsapp', { size: 16 })} ${esc(t('wd.dm.wa'))}</a></div><p class="wd-p" style="font-size:12.5px">${esc(t('wd.dm.rule'))}</p></div></div></div>`;
  const draw = () => {
    const v = Object.fromEntries($$('[data-k]', el).map((i) => [i.dataset.k, i.value.trim()]));
    const hi = v.c === 'li' ? t('wd.dm.hi.li') : t('wd.dm.hi');
    const txt = t('wd.dm.msg', { hi, m: v.m, o: v.o, v: v.v });
    $('#dmo', el).textContent = txt;
    $('#dmw', el).href = `https://wa.me/?text=${encodeURIComponent(txt)}`;
  };
  $$('[data-k]', el).forEach((i) => i.addEventListener('input', draw));
  $('#dmc', el).addEventListener('click', (e) => {
    copyText($('#dmo', el).textContent, e.currentTarget);
    once(`dm:${ctx.lesson.id}`, ctx, 20, t('wd.dm.xp'));
  });
  draw();
};

/** Exercice par défaut : appliquer la leçon à son propre produit. */
W.applique = (el, ctx) => {
  const key = `app:${ctx.lesson.id}`;
  el.innerHTML = `<div class="wd"><h3 class="wd-h">${esc(t('wd.ap.h'))}</h3><p class="wd-p">${t('wd.ap.p', { title: `<b>${esc(ctx.lesson.title)}</b>` })}</p>
    <div class="out" style="white-space:normal">${(ctx.lesson.key || []).map((k) => `<p style="margin:0 0 6px">• ${esc(k)}</p>`).join('')}</div>
    <textarea class="in" rows="5" id="apt" placeholder="${esc(t('wd.ap.ph'))}">${esc(store.get(key, ''))}</textarea><button class="b b--or" type="button" id="aps">${esc(t('wd.save'))}</button><p class="wd-p" id="apm"></p></div>`;
  $('#aps', el).addEventListener('click', () => {
    const v = $('#apt', el).value.trim();
    store.set(key, v);
    $('#apm', el).textContent = v.length > 30 ? t('wd.ap.ok') : t('wd.ap.short');
    if (v.length > 30) once(key, ctx, 20, t('wd.ap.xp'));
  });
};

export function renderWidget(name, el, ctx) {
  const fn = W[name] || W.applique;
  try {
    fn(el, ctx);
  } catch (err) {
    console.error('Exercice', name, err);
    W.applique(el, ctx);
  }
  gsap()?.from(el.firstElementChild?.children || [], { y: 20, autoAlpha: 0, stagger: 0.05, duration: 0.5, ease: 'expo.out', clearProps: 'all' });
}

export const WIDGETS = Object.keys(W);
