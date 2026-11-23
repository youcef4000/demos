// Scènes de la Formation Sites & Apps (thème « code ») : terminal, éditeur, navigateur, arborescence,
// diff, graphe Git, alerte de sécurité. Même contrat que scenes.js : export function nom(root, sc, d, ctx)
// → timeline GSAP qui démarre à 0 ; la sortie (fondu) est gérée par le moteur (engine.js).
// Tout dépend seulement du temps (rendu MP4 image par image identique au lecteur).

import { G, esc, rich, words, kicker, $, $$, riseWords, type, count, track } from './kit.js';
import { icon } from '../assets/js/icons.js';

const C = {
  hook: 'var(--hook)', body: 'var(--body)', cta: 'var(--cta)', gold: 'var(--gold-400)', ia: 'var(--ia)',
  danger: 'var(--danger)', mist: 'var(--mist-300)', ok: 'var(--ok)', warn: 'var(--cta)',
};
const col = (c) => C[c] || c || 'var(--gold-400)';

function head(sc) {
  return sc.title || sc.kicker ? `<header class="s-head">${kicker(sc.kicker)}${sc.title ? `<h2 class="s-title">${words(sc.title)}</h2>` : ''}</header>` : '';
}
function enterHead(tl, root) {
  const k = $(root, '.s-head .kick');
  if (k) tl.fromTo(k, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' }, 0);
  const h2 = $(root, '.s-title');
  if (h2) riseWords(tl, h2, 0.08, { stagger: 0.04, duration: 0.6 });
}
function note(tl, root, sc, d) {
  const n = $(root, '.dv-note');
  if (n) tl.fromTo(n, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, sc.noteAt ?? Math.max(0.8, d - 2.6));
}
const noteHtml = (sc) => (sc.note ? `<p class="dv-note">${icon(sc.noteIcon || 'bolt', { size: 26 })}<span>${rich(sc.note)}</span></p>` : '');
const bar = (title, extra = '') => `<div class="dv-bar"><i></i><i></i><i></i><span>${esc(title)}</span>${extra}</div>`;

/* ------------------------------------------------------------------ */
/* Coloration syntaxique (simple et déterministe)                      */
/* ------------------------------------------------------------------ */

const KW = {
  js: 'const|let|var|function|return|if|else|for|while|import|from|export|default|async|await|new|class|extends|try|catch|throw|true|false|null|undefined|this|of|in|typeof|switch|case|break',
  sql: 'select|from|where|insert|into|values|create|table|alter|enable|row|level|security|policy|on|for|using|with|check|references|default|primary|key|not|null|and|or|update|delete|grant|to|as|uuid|text|timestamptz|numeric|int8|boolean|now|auth|uid',
  py: 'def|return|if|else|elif|for|while|import|from|as|class|try|except|raise|True|False|None|with|in|and|or|not',
};
function rules(lang) {
  const str = [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/y, 'str'];
  const num = [/\b\d+(?:\.\d+)?\b/y, 'num'];
  switch (lang) {
    case 'html':
      return [[/<!--.*?-->/y, 'com'], [/<\/?[a-zA-Z][\w-]*/y, 'tag'], [/\/?>/y, 'tag'], [/[\w:@-]+(?==)/y, 'attr'], str];
    case 'css':
      return [[/\/\*.*?\*\//y, 'com'], [/@[\w-]+/y, 'kw'], [/--[\w-]+/y, 'var'], [/[\w-]+(?=\s*:(?!:))/y, 'prop'], [/#[0-9a-fA-F]{3,8}\b/y, 'num'], [/[.#]?[a-zA-Z][\w-]*(?=[^;{}]*\{)/y, 'sel'], str, num];
    case 'sql':
      return [[/--.*/y, 'com'], [new RegExp(`\\b(?:${KW.sql})\\b`, 'iy'), 'kw'], str, num];
    case 'bash':
      return [[/#.*/y, 'com'], [/^\s*[\w./-]+/y, 'fn'], [/\s--?[\w-]+/y, 'attr'], [/\$\{?\w+\}?/y, 'var'], str];
    case 'json':
      return [[/"(?:[^"\\]|\\.)*"(?=\s*:)/y, 'prop'], str, num, [/\b(?:true|false|null)\b/y, 'kw']];
    case 'env':
      return [[/#.*/y, 'com'], [/^[A-Z0-9_]+(?==)/y, 'prop'], [/=.*/y, 'str']];
    case 'py':
      return [[/#.*/y, 'com'], [new RegExp(`\\b(?:${KW.py})\\b`, 'y'), 'kw'], [/[A-Za-z_]\w*(?=\()/y, 'fn'], str, num];
    case 'md':
      return [[/^#+ .*/y, 'kw'], [/`[^`]*`/y, 'str'], [/\*\*[^*]+\*\*/y, 'fn'], [/^\s*[-*] /y, 'tag']];
    default:
      return [[/\/\/.*/y, 'com'], [/\/\*.*?\*\//y, 'com'], [new RegExp(`\\b(?:${KW.js})\\b`, 'y'), 'kw'], [/[A-Za-z_$][\w$]*(?=\()/y, 'fn'], [/\b[A-Z][A-Za-z0-9_]*\b/y, 'type'], str, num];
  }
}
/** Une ligne de code → HTML coloré. */
export function syntax(line, lang = 'js') {
  const R = rules(lang);
  let out = '';
  let i = 0;
  let plain = '';
  const flush = () => {
    if (plain) out += esc(plain);
    plain = '';
  };
  while (i < line.length) {
    let hit = null;
    for (const [re, cls] of R) {
      re.lastIndex = i;
      const m = re.exec(line);
      if (m && m.index === i && m[0].length) {
        hit = [m[0], cls];
        break;
      }
    }
    if (hit) {
      flush();
      out += `<span class="sx-${hit[1]}">${esc(hit[0])}</span>`;
      i += hit[0].length;
    } else {
      plain += line[i];
      i += 1;
    }
  }
  flush();
  return out || '&nbsp;';
}

/* ------------------------------------------------------------------ */
/* Terminal : commandes tapées, sorties réelles                         */
/* ------------------------------------------------------------------ */

/**
 * { type: 'terminal', kicker, title, cwd: '~/projets/salon', shell: 'bash' | 'powershell',
 *   lines: [{ cmd: 'git init', out: ['Initialized…', { t: '✓ ok', c: 'ok' }], at }, { comment: '# …' }], note }
 * Les sorties sont copiées d'une vraie session : la leçon montre ce que l'élève verra vraiment.
 */
export function terminal(root, sc, d) {
  const L = sc.lines || [];
  const ps = sc.shell === 'powershell';
  const prompt = ps ? `PS ${esc(sc.cwd || 'C:\\Projets')}&gt;` : `<b>${esc(sc.user || 'eleve')}</b>:<em>${esc(sc.cwd || '~')}</em>$`;
  root.innerHTML = `${head(sc)}
    <div class="tm ${sc.title ? '' : 'is-tall'}">
      ${bar(sc.app || (ps ? 'Windows PowerShell' : `Terminal — ${sc.cwd || '~'}`))}
      <div class="tm-body"><div class="tm-in">${L.map((l) => {
        if (l.comment) return `<p class="tm-l tm-com">${esc(l.comment)}</p>`;
        const outs = (l.out || []).map((o) => (typeof o === 'string' ? { t: o } : o));
        return `<p class="tm-l tm-cmd"><span class="tm-p">${prompt}</span> <span class="tm-c"></span></p>${outs
          .map((o) => `<p class="tm-l tm-o ${o.c ? `is-${o.c}` : ''}">${esc(o.t) || '&nbsp;'}</p>`)
          .join('')}`;
      }).join('')}</div></div>
    </div>
    ${noteHtml(sc)}`;
  const tl = G().timeline();
  enterHead(tl, root);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($(root, '.tm'), { autoAlpha: 0, y: 50, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }, base);
  // Minutage : on resserre la frappe si la scène est courte
  const cmds = L.filter((l) => l.cmd);
  const outs = L.reduce((n, l) => n + (l.out || []).length + (l.comment ? 1 : 0), 0);
  const chars = cmds.reduce((n, l) => n + l.cmd.length, 0);
  const avail = Math.max(1.5, d - base - 1.6 - (sc.note ? 2 : 0));
  let cps = sc.cps || 26;
  const need = chars / cps + cmds.length * 0.5 + outs * 0.14;
  if (need > avail) cps = Math.min(90, chars / Math.max(0.6, avail - cmds.length * 0.35 - outs * 0.08));
  const gapOut = need > avail ? 0.08 : 0.14;
  let t = base + 0.6;
  const rows = $$(root, '.tm-l');
  let r = 0;
  L.forEach((l) => {
    if (typeof l.at === 'number') t = l.at;
    if (l.comment) {
      tl.fromTo(rows[r++], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, t);
      t += 0.3;
      return;
    }
    const row = rows[r++];
    tl.fromTo(row, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, t);
    const dt = type(tl, $(row, '.tm-c'), l.cmd, t + 0.1, { cps, caret: true });
    t += dt + 0.35;
    tl.set($(row, '.tm-c'), { className: 'tm-c' }, t);
    (l.out || []).forEach(() => {
      tl.fromTo(rows[r++], { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.18 }, t);
      t += gapOut;
    });
    t += 0.25;
  });
  // Défilement : le terminal garde les dernières lignes visibles
  const body = $(root, '.tm-body');
  const inner = $(root, '.tm-in');
  const shown = rows.map((row) => {
    const st = tl.getChildren(false, true, true).find((x) => x.targets?.().includes(row));
    return st ? st.startTime() : 0;
  });
  track(tl, d, (tt) => {
    const max = body.clientHeight;
    let last = null;
    rows.forEach((row, i) => {
      if (tt >= shown[i]) last = row;
    });
    const bottom = last ? last.offsetTop + last.offsetHeight : 0;
    inner.style.transform = `translateY(${-Math.max(0, bottom - max + 24)}px)`;
  });
  note(tl, root, sc, d);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Éditeur de code : lignes qui apparaissent, lignes surlignées, notes  */
/* ------------------------------------------------------------------ */

/**
 * { type: 'code', kicker, title, file: 'index.html', lang: 'html', code: `…`,
 *   hl: [3, [5, 7]], notes: [{ line: 3, text: 'Le titre de la page', c: 'hook', at }], note }
 */
export function code(root, sc, d) {
  const lines = String(sc.code || '').replace(/\n$/, '').split('\n');
  const lang = sc.lang || (sc.file || '').split('.').pop() || 'js';
  const hl = new Set();
  (sc.hl || []).forEach((x) => (Array.isArray(x) ? Array.from({ length: x[1] - x[0] + 1 }, (_, k) => hl.add(x[0] + k)) : hl.add(x)));
  const notes = sc.notes || [];
  root.innerHTML = `${head(sc)}
    <div class="ed ${notes.length ? 'has-notes' : ''} ${lines.length > 14 || Math.max(...lines.map((l) => l.length)) > (notes.length ? 52 : 90) ? 'is-small' : ''}">
      <div class="ed-win">
        <div class="dv-bar ed-tabs"><i></i><i></i><i></i><span class="ed-tab">${icon('doc', { size: 18 })} ${esc(sc.file || 'code')}</span><em>${esc(lang.toUpperCase())}</em></div>
        <ol class="ed-code">${lines.map((l, i) => `<li class="ed-l ${hl.has(i + 1) ? 'is-hl' : ''}" data-n="${i + 1}"><code>${syntax(l, lang)}</code></li>`).join('')}</ol>
      </div>
      ${notes.length ? `<ul class="ed-notes">${notes.map((n) => `<li style="--c:${col(n.c || 'gold')}"><b>${esc(n.line ? `L${n.line}` : '•')}</b><span>${rich(n.text)}</span></li>`).join('')}</ul>` : ''}
    </div>
    ${noteHtml(sc)}`;
  const tl = G().timeline();
  enterHead(tl, root);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($(root, '.ed-win'), { autoAlpha: 0, y: 50, rotateX: 8 }, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.8, ease: 'expo.out' }, base);
  const els = $$(root, '.ed-l');
  const per = Math.min(0.22, Math.max(0.05, (d * 0.38) / Math.max(1, els.length)));
  els.forEach((el, i) => tl.fromTo(el, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power2.out' }, base + 0.4 + i * per));
  const after = base + 0.6 + els.length * per;
  const hls = $$(root, '.ed-l.is-hl');
  if (hls.length) tl.fromTo(hls, { '--h': 0 }, { '--h': 1, duration: 0.5, ease: 'power2.out', stagger: 0.06 }, sc.hlAt ?? after + 0.2);
  const ns = $$(root, '.ed-notes li');
  const span = Math.max(0.5, (d - after - 2.2) / Math.max(1, ns.length));
  ns.forEach((n, i) => {
    const t = notes[i].at ?? after + 0.5 + i * span;
    tl.fromTo(n, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'expo.out' }, t);
    const line = notes[i].line && els[notes[i].line - 1];
    if (line) tl.fromTo(line, { '--p': 0 }, { '--p': 1, duration: 0.4, yoyo: true, repeat: 1 }, t);
  });
  note(tl, root, sc, d);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Navigateur : adresse tapée, page (maquette ou vraie capture), console, Lighthouse */
/* ------------------------------------------------------------------ */

function mockPage(p = {}) {
  const c = p.color || 'var(--gold-400)';
  if (p.kind === 'error') return `<div class="bw-err">${icon('x', { size: 70 })}<b>${esc(p.title || 'Cette page ne fonctionne pas')}</b><span>${esc(p.sub || 'ERR_CONNECTION_REFUSED')}</span></div>`;
  if (p.kind === 'blank') return `<div class="bw-blank"></div>`;
  const blocks = p.blocks || ['cards'];
  return `<div class="bw-site" style="--s:${c}">
      <nav><b>${esc(p.brand || 'Mon site')}</b><span></span><span></span><span></span><i>${esc(p.navCta || 'Contact')}</i></nav>
      <section class="bw-hero"><h3>${rich(p.hero || 'Le titre qui dit tout')}</h3><p>${esc(p.sub || '')}</p><u>${esc(p.cta || 'Réserver sur WhatsApp')}</u></section>
      ${blocks.map((b) => (b === 'form' ? `<div class="bw-form"><i></i><i></i><i></i><u>${esc(p.formCta || 'Envoyer')}</u></div>` : b === 'table' ? `<div class="bw-table">${[0, 1, 2, 3].map(() => '<i></i>').join('')}</div>` : `<div class="bw-cards"><i></i><i></i><i></i></div>`)).join('')}
    </div>`;
}

/**
 * { type: 'browser', kicker, title, url, page: { brand, hero, sub, cta, color, blocks: ['cards','form','table'], kind: 'site'|'error'|'blank' },
 *   shot: 'assets/img/dev/capture.webp' (vraie capture, défile si scroll: true), device: 'desktop' | 'phone',
 *   console: [{ t: 'Uncaught TypeError…', c: 'err' | 'warn' | 'ok' }], lighthouse: { perf, a11y, bp, seo }, note }
 */
export function browser(root, sc, d) {
  const phone = sc.device === 'phone';
  const lh = sc.lighthouse;
  const con = sc.console || [];
  const LH = lh ? [['perf', 'Performance'], ['a11y', 'Accessibilité'], ['bp', 'Bonnes pratiques'], ['seo', 'SEO']].filter(([k]) => lh[k] != null) : [];
  root.innerHTML = `${head(sc)}
    <div class="bw ${phone ? 'is-phone' : ''} ${con.length || LH.length ? 'has-dev' : ''} ${sc.title ? '' : 'is-tall'}">
      <div class="bw-win">
        <div class="dv-bar bw-bar"><i></i><i></i><i></i><span class="bw-url">${icon('lock', { size: 16 })}<em class="bw-u"></em></span></div>
        <div class="bw-page">${sc.shot ? `<div class="bw-shot"><img src="../${esc(sc.shot)}" alt=""></div>` : mockPage(sc.page)}</div>
      </div>
      ${con.length || LH.length ? `<div class="bw-dev">
        <div class="bw-dev-h"><b>${LH.length ? 'Lighthouse' : 'Console'}</b><span>DevTools</span></div>
        ${con.length ? `<ul class="bw-con">${con.map((c) => `<li class="is-${c.c || 'log'}">${esc(c.t)}</li>`).join('')}</ul>` : ''}
        ${LH.length ? `<ul class="bw-lh">${LH.map(([k, lab]) => `<li data-v="${lh[k]}"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bw-r0"/><circle cx="60" cy="60" r="52" class="bw-r1"/></svg><b>0</b><span>${esc(lab)}</span></li>`).join('')}</ul>` : ''}
      </div>` : ''}
    </div>
    ${noteHtml(sc)}`;
  const tl = G().timeline();
  enterHead(tl, root);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($(root, '.bw-win'), { autoAlpha: 0, y: 60, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' }, base);
  const dt = type(tl, $(root, '.bw-u'), sc.url || 'localhost:8000', base + 0.5, { cps: 30, caret: false });
  const load = base + 0.7 + dt;
  tl.fromTo($(root, '.bw-page'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, load);
  const site = $(root, '.bw-site');
  if (site) tl.fromTo($$(site, 'nav, section, .bw-cards, .bw-form, .bw-table'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.12 }, load + 0.1);
  const shot = $(root, '.bw-shot img');
  if (shot && sc.scroll) {
    const p = { y: 0 };
    tl.fromTo(p, { y: 0 }, { y: 1, duration: Math.max(1.5, d - load - 2.5), ease: 'power1.inOut', onUpdate: () => {
      const box = shot.parentElement;
      const max = Math.max(0, shot.offsetHeight - box.clientHeight);
      shot.style.transform = `translateY(${(-max * p.y).toFixed(1)}px)`;
    } }, load + 0.6);
  }
  const dev = $(root, '.bw-dev');
  if (dev) {
    const t0 = sc.devAt ?? load + 1;
    tl.fromTo(dev, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, t0);
    $$(root, '.bw-con li').forEach((li, i) => tl.fromTo(li, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.3 }, t0 + 0.4 + i * 0.35));
    $$(root, '.bw-lh li').forEach((li, i) => {
      const v = Number(li.dataset.v) || 0;
      const r1 = $(li, '.bw-r1');
      const len = 2 * Math.PI * 52;
      r1.style.strokeDasharray = `${len} ${len}`;
      li.style.setProperty('--c', v >= 90 ? 'var(--ok)' : v >= 50 ? 'var(--cta)' : 'var(--danger)');
      tl.fromTo(r1, { strokeDashoffset: len }, { strokeDashoffset: len * (1 - v / 100), duration: 1.4, ease: 'power3.out' }, t0 + 0.4 + i * 0.2);
      count(tl, $(li, 'b'), v, t0 + 0.4 + i * 0.2, { duration: 1.4 });
    });
  }
  note(tl, root, sc, d);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Arborescence de fichiers                                             */
/* ------------------------------------------------------------------ */

const FILE_IC = (p) => {
  if (/\/$/.test(p)) return 'layers';
  if (/\.(png|jpe?g|webp|svg|gif)$/i.test(p)) return 'image';
  if (/^\.env|secret|key/i.test(p)) return 'key';
  if (/\.(md|txt)$/i.test(p)) return 'doc';
  return 'pen';
};
/**
 * { type: 'tree', kicker, title, items: [{ p: 'salon/', d: 0 }, { p: 'index.html', d: 1, note: 'La page', c: 'gold', tag: 'ignoré', at }], note }
 */
export function tree(root, sc, d) {
  const items = sc.items || [];
  root.innerHTML = `${head(sc)}
    <div class="tr-wrap">
      <div class="tr-win">${bar(sc.app || 'Explorateur')}
        <ul class="tr">${items.map((it) => `<li class="tr-i ${/\/$/.test(it.p) ? 'is-dir' : ''}" style="--d:${it.d || 0};--c:${col(it.c || 'mist')}">${icon(it.icon || FILE_IC(it.p), { size: 26 })}<b>${esc(it.p)}</b>${it.tag ? `<em>${esc(it.tag)}</em>` : ''}${it.note ? `<span>${rich(it.note)}</span>` : ''}</li>`).join('')}</ul>
      </div>
    </div>
    ${noteHtml(sc)}`;
  const tl = G().timeline();
  enterHead(tl, root);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($(root, '.tr-win'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' }, base);
  const step = Math.min(0.9, Math.max(0.2, (d - base - 2.5) / Math.max(1, items.length)));
  $$(root, '.tr-i').forEach((li, i) => {
    const t = items[i].at ?? base + 0.4 + i * step;
    tl.fromTo(li, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'expo.out' }, t);
    const s = $(li, 'span');
    if (s) tl.fromTo(s, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 0.2);
  });
  note(tl, root, sc, d);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Diff : avant / après, ligne par ligne                               */
/* ------------------------------------------------------------------ */

/**
 * { type: 'diff', kicker, title, file: 'app.js', lang: 'js',
 *   lines: [{ t: ' ', code: '…' }, { t: '-', code: '…' }, { t: '+', code: '…' }], note }
 * Les lignes « - » se barrent d'abord, puis les lignes « + » entrent : on voit la correction se faire.
 */
export function diff(root, sc, d) {
  const lines = sc.lines || [];
  const lang = sc.lang || (sc.file || '').split('.').pop() || 'js';
  root.innerHTML = `${head(sc)}
    <div class="df-win">
      <div class="dv-bar"><i></i><i></i><i></i><span>${icon('doc', { size: 18 })} ${esc(sc.file || 'fichier')}</span><em class="df-stat"><b class="is-m">−${lines.filter((l) => l.t === '-').length}</b> <b class="is-p">+${lines.filter((l) => l.t === '+').length}</b></em></div>
      <ol class="df">${lines.map((l) => `<li class="df-l ${l.t === '-' ? 'is-m' : l.t === '+' ? 'is-p' : ''}"><i>${l.t === ' ' ? '' : esc(l.t)}</i><code>${syntax(l.code || '', lang)}</code></li>`).join('')}</ol>
    </div>
    ${noteHtml(sc)}`;
  const tl = G().timeline();
  enterHead(tl, root);
  const base = sc.title ? 0.5 : 0.2;
  tl.fromTo($(root, '.df-win'), { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' }, base);
  const els = $$(root, '.df-l');
  const ctx = els.filter((e) => !e.matches('.is-p'));
  ctx.forEach((e, i) => tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, base + 0.4 + i * 0.08));
  const tm = sc.minusAt ?? base + 1.2 + ctx.length * 0.08;
  $$(root, '.df-l.is-m').forEach((e, i) => tl.fromTo(e, { '--x': 0 }, { '--x': 1, duration: 0.45, ease: 'power2.inOut' }, tm + i * 0.2));
  const tp = sc.plusAt ?? tm + 1.2;
  $$(root, '.df-l.is-p').forEach((e, i) => tl.fromTo(e, { autoAlpha: 0, x: 30, height: 0 }, { autoAlpha: 1, x: 0, height: 'auto', duration: 0.5, ease: 'expo.out' }, tp + i * 0.25));
  note(tl, root, sc, d);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Graphe Git : branches, commits, fusion                              */
/* ------------------------------------------------------------------ */

/**
 * { type: 'gitgraph', kicker, title, commits: [{ b: 'main', msg: 'Premier commit' }, { b: 'menu', from: 'main', msg: 'Nouveau menu' },
 *   { b: 'main', merge: 'menu', msg: 'Fusion du menu', tag: 'en ligne' }], note }
 */
export function gitgraph(root, sc, d) {
  const cs = sc.commits || [];
  const lanes = [...new Set(cs.map((c) => c.b))];
  const W = 1560;
  const step = Math.min(240, (W - 120) / Math.max(1, cs.length - 1 || 1));
  const X = (i) => 60 + i * step;
  const Y = (b) => 70 + lanes.indexOf(b) * 150;
  const H = 70 + (lanes.length - 1) * 150 + 90;
  const last = {};
  const segs = [];
  const LC = ['var(--gold-400)', 'var(--body)', 'var(--cta)', 'var(--hook)'];
  const laneCol = (b) => LC[lanes.indexOf(b) % LC.length];
  cs.forEach((c, i) => {
    const x = X(i);
    const y = Y(c.b);
    if (last[c.b] != null) segs.push({ d: `M${X(last[c.b])} ${y} L${x} ${y}`, c: laneCol(c.b), at: i });
    else if (c.from && last[c.from] != null) segs.push({ d: `M${X(last[c.from])} ${Y(c.from)} C${X(last[c.from]) + step * 0.6} ${Y(c.from)} ${x - step * 0.6} ${y} ${x} ${y}`, c: laneCol(c.b), at: i });
    if (c.merge && last[c.merge] != null) segs.push({ d: `M${X(last[c.merge])} ${Y(c.merge)} C${X(last[c.merge]) + step * 0.6} ${Y(c.merge)} ${x - step * 0.6} ${y} ${x} ${y}`, c: laneCol(c.merge), at: i });
    last[c.b] = i;
  });
  root.innerHTML = `${head(sc)}
    <div class="gg">
      <svg class="gg-svg" viewBox="0 0 ${W} ${H}" style="height:${H}px">
        ${segs.map((s) => `<path d="${s.d}" stroke="${s.c}" class="gg-s" data-at="${s.at}"/>`).join('')}
        ${cs.map((c, i) => `<g class="gg-c" data-i="${i}"><circle cx="${X(i)}" cy="${Y(c.b)}" r="${c.merge ? 22 : 18}" fill="${laneCol(c.b)}"/>${c.merge ? `<circle cx="${X(i)}" cy="${Y(c.b)}" r="10" fill="#060a10"/>` : ''}</g>`).join('')}
      </svg>
      ${lanes.map((b) => `<span class="gg-b" style="top:${Y(b) - 22}px;--c:${laneCol(b)}">${icon('route', { size: 18 })} ${esc(b)}</span>`).join('')}
      ${cs.map((c, i) => `<span class="gg-m ${i % 2 ? 'is-up' : ''}" style="left:${(X(i) / W) * 100}%;top:${Y(c.b) + (i % 2 ? -78 : 34)}px">${rich(c.msg || '')}${c.tag ? `<em>${esc(c.tag)}</em>` : ''}</span>`).join('')}
    </div>
    ${noteHtml(sc)}`;
  const tl = G().timeline();
  enterHead(tl, root);
  const base = sc.title ? 0.6 : 0.2;
  const per = Math.min(1.2, Math.max(0.35, (d - base - 2.5) / Math.max(1, cs.length)));
  tl.fromTo($$(root, '.gg-b'), { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.1 }, base);
  $$(root, '.gg-s').forEach((p) => {
    const len = Math.ceil(p.getTotalLength ? p.getTotalLength() : 600) + 2;
    p.style.strokeDasharray = `${len} ${len}`;
    tl.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: per * 0.8, ease: 'power2.inOut' }, base + 0.3 + (Number(p.dataset.at) - 0.8) * per);
  });
  $$(root, '.gg-c').forEach((g, i) => tl.fromTo(g, { autoAlpha: 0, scale: 0, transformOrigin: 'center', transformBox: 'fill-box' }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2.4)' }, base + 0.4 + i * per));
  $$(root, '.gg-m').forEach((m, i) => tl.fromTo(m, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, base + 0.55 + i * per));
  note(tl, root, sc, d);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Alerte de sécurité : l'attaque, l'impact, la correction              */
/* ------------------------------------------------------------------ */

/**
 * { type: 'alert', kicker, code: 'A01', level: 'Critique', name: 'Contrôle d’accès cassé',
 *   attack: 'Ce que fait l’attaquant', impact: 'Ce qu’il obtient', fix: ['…', '…'], fixAt, note }
 */
export function alert(root, sc, d) {
  const fix = sc.fix || [];
  root.innerHTML = `${sc.kicker ? `<header class="s-head">${kicker(sc.kicker)}</header>` : ''}
    <div class="al">
      <div class="al-card">
        <div class="al-top">${icon('shield', { size: 46 })}<b>${esc(sc.code || '!')}</b><em>${esc(sc.level || 'Critique')}</em></div>
        <h2 class="al-name">${words(sc.name || '')}</h2>
        ${sc.attack ? `<p class="al-row"><span>${esc(sc.attackLabel || 'L’attaque')}</span>${rich(sc.attack)}</p>` : ''}
        ${sc.impact ? `<p class="al-row is-imp"><span>${esc(sc.impactLabel || 'L’impact')}</span>${rich(sc.impact)}</p>` : ''}
        <i class="al-scan" aria-hidden="true"></i>
      </div>
      ${fix.length ? `<div class="al-fix"><p class="al-fix-h">${icon('check', { size: 26, stroke: 2.6 })} ${esc(sc.fixLabel || 'La correction')}</p><ul>${fix.map((f) => `<li>${rich(f)}</li>`).join('')}</ul></div>` : ''}
    </div>
    ${noteHtml(sc)}`;
  const tl = G().timeline();
  const k = $(root, '.s-head .kick');
  if (k) tl.fromTo(k, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' }, 0);
  const card = $(root, '.al-card');
  tl.fromTo(card, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, 0.2);
  tl.fromTo(card, { x: 0 }, { keyframes: [{ x: -10 }, { x: 9 }, { x: -6 }, { x: 4 }, { x: 0 }], duration: 0.5, ease: 'none' }, 0.75);
  riseWords(tl, $(root, '.al-name'), 0.5, { stagger: 0.05 });
  $$(root, '.al-row').forEach((r, i) => tl.fromTo(r, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 1.2 + i * 0.9));
  tl.fromTo($(root, '.al-scan'), { yPercent: -100 }, { yPercent: 900, duration: 2.2, ease: 'power1.inOut', repeat: 1 }, 0.4);
  const fx = $(root, '.al-fix');
  if (fx) {
    const tf = sc.fixAt ?? Math.max(2.6, d * 0.45);
    tl.fromTo(fx, { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' }, tf);
    tl.to(card, { '--calm': 1, duration: 0.8 }, tf);
    $$(fx, 'li').forEach((li, i) => tl.fromTo(li, { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.45 }, tf + 0.4 + i * Math.min(0.9, (d - tf - 1.5) / Math.max(1, fix.length))));
  }
  note(tl, root, sc, d);
  return tl;
}
