// Exercices interactifs des leçons. renderWidget(nom, conteneur, { lesson, module, onXP }).
// Chaque exercice fonctionne au doigt comme à la souris ; les animations respectent le mouvement réduit.

import { icon } from './icons.js';
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
const once = (key, ctx, n, why) => {
  if (store.get(`xp:${key}`, false)) return;
  store.set(`xp:${key}`, true);
  ctx.onXP?.(n, why);
};
const copyText = (t, btn) =>
  navigator.clipboard?.writeText(t).then(() => {
    if (!btn) return;
    const o = btn.innerHTML;
    btn.innerHTML = `${icon('check', { size: 15 })} Copié`;
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
const seg = (name, opts, cur) => `<div class="seg" data-seg="${name}">${opts.map(([v, t]) => `<button type="button" data-v="${esc(v)}" aria-pressed="${v === cur}">${esc(t)}</button>`).join('')}</div>`;
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
  const cards = qs.length ? qs.map((q) => ({ f: q.q, b: `${q.a[q.ok]} — ${q.why}` })) : (lesson.key || []).map((k, i) => ({ f: `À retenir n°${i + 1}`, b: k }));
  box.innerHTML = `<div class="flash">${cards.map((c) => `<div class="fc" tabindex="0" role="button" aria-label="Retourner la carte"><div class="fc-in"><div class="fc-f"><span>Question</span><b>${esc(c.f)}</b></div><div class="fc-b">${esc(c.b)}</div></div></div>`).join('')}</div>`;
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
  const F = {
    video: { t: 'La vidéo', d: 'Elle montre le produit en action. C’est le format qui retient le plus longtemps.', bg: 'teal', hl: 'Ton parfum tient combien de temps ?', btn: 'Commander' },
    image: { t: 'L’image', d: 'Un seul visuel, un seul message, lisible en une seconde. Parfait pour une offre claire.', bg: 'sable', hl: 'Un parfum qui reste toute la journée', btn: 'Découvrir' },
    carrousel: { t: 'Le carrousel', d: 'Une histoire en plusieurs slides : problème, solution, preuve, commande.', bg: 'rose', hl: '1/5 · Le problème', btn: 'Glisse →' },
  };
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Explore les 3 formats</h3>${seg('f', [['video', 'Vidéo'], ['image', 'Image'], ['carrousel', 'Carrousel']], 'video')}
    <div class="wd-grid"><div class="mini-ph"><div class="mini-sc" id="msc"></div></div><div><h4 class="wd-h" id="ft"></h4><p class="wd-p" id="fd"></p><ul class="wd-p" id="fl" style="padding-left:18px;margin-top:10px"></ul></div></div></div>`;
  const draw = (k) => {
    const f = F[k];
    $('#msc', el).style.background = BG[f.bg];
    $('#msc', el).innerHTML = `${product(k === 'image' ? 'creme' : k === 'carrousel' ? 'serum' : 'parfum')}<p class="mini-hl">${esc(f.hl)}</p>${k === 'video' ? '<div style="position:absolute;left:12px;right:12px;top:12px;height:3px;border-radius:3px;background:rgba(255,255,255,.3)"><i style="display:block;height:100%;width:45%;background:#fff;border-radius:3px"></i></div>' : ''}<div class="mini-btn">${esc(f.btn)}</div>`;
    $('#ft', el).textContent = f.t;
    $('#fd', el).textContent = f.d;
    $('#fl', el).innerHTML = { video: '<li>Hook dans les 3 premières secondes</li><li>Sous-titres obligatoires</li>', image: '<li>6 mots maximum dans le titre</li><li>Un bouton d’action visible</li>', carrousel: '<li>La slide 1 donne envie de glisser</li><li>Le CTA sur la dernière slide</li>' }[k];
    pop($('#msc', el));
  };
  let seen = new Set();
  onSeg(el, 'f', (k) => {
    draw(k);
    seen.add(k);
    if (seen.size === 3) once(`formats:${ctx.lesson.id}`, ctx, 20, 'Trois formats explorés');
  });
  draw('video');
  seen.add('video');
};

W.outils = (el, ctx) => {
  const T = [
    ['capcut', 'CapCut', 'Montage vidéo', 'https://www.capcut.com', 'scissors'],
    ['canva', 'Canva', 'Images et carrousels', 'https://www.canva.com', 'layout'],
    ['chatgpt', 'ChatGPT', 'Idées, scripts, prompts', 'https://chatgpt.com', 'chat'],
  ];
  const st = store.get('outils', {});
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Installe ta boîte à outils</h3><p class="wd-p">Coche chaque outil une fois installé (version gratuite).</p><div style="display:grid;gap:10px">${T.map(
    ([k, n, d, u, ic]) => `<label class="card" style="display:flex;align-items:center;gap:14px;padding:14px;cursor:pointer"><input type="checkbox" data-k="${k}" ${st[k] ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--gold-500)"><span style="width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:rgb(201 162 39 / .14);color:var(--gold-300)">${icon(ic, { size: 22 })}</span><span style="display:grid"><b>${n}</b><span class="muted" style="font-size:13px">${d}</span></span><a class="b b--s" href="${u}" target="_blank" rel="noopener" style="margin-left:auto">Ouvrir ↗</a></label>`,
  ).join('')}</div><div class="meter"><i id="om" style="width:0"></i></div></div>`;
  const upd = () => {
    const n = $$('input', el).filter((i) => i.checked).length;
    $('#om', el).style.width = `${(n / 3) * 100}%`;
    if (n === 3) once('outils', ctx, 30, 'Boîte à outils prête');
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
  const R = { '9:16': [9, 16, 'Reels · TikTok · Stories'], '4:5': [4, 5, 'Fil Instagram & Facebook'], '1:1': [1, 1, 'Carrousel · fil'], '16:9': [16, 9, 'YouTube · écran large'] };
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Choisis un format</h3>${seg('r', Object.keys(R).map((k) => [k, k]), '9:16')}<label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" id="sz" checked style="accent-color:var(--gold-500)"> Afficher les zones cachées par l’interface</label>
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
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Fais défiler une pub de 15 secondes</h3><p class="wd-p">Déplace le curseur : observe le rôle de chaque partie.</p>
    <div class="wd-grid"><div class="mini-ph"><div class="mini-sc" id="asc" style="background:${BG.teal}">${product('parfum')}<p class="mini-hl" id="ahl"></p><div class="mini-btn" id="abtn">Commander — paiement à la livraison</div></div></div>
    <div style="display:grid;gap:12px"><b id="aph" style="font-family:var(--font-display);font-size:28px"></b><p class="wd-p" id="ad"></p>
    <input class="range" type="range" min="0" max="150" value="0" id="ar" aria-label="Temps de la vidéo"><div style="display:grid;grid-template-columns:2fr 9fr 4fr;gap:4px"><i style="height:8px;border-radius:4px;background:var(--hook)"></i><i style="height:8px;border-radius:4px;background:var(--body)"></i><i style="height:8px;border-radius:4px;background:var(--cta)"></i></div><span class="muted" id="at" style="font-family:var(--font-mono);font-size:12px"></span></div></div></div>`;
  const P = [
    [3, 'Hook', 'var(--hook)', 'Les 3 premières secondes : on arrête le pouce avec une question, une promesse ou une image forte.', 'Ton parfum disparaît avant midi ?'],
    [11, 'Body', 'var(--body)', 'On présente le produit, on le montre en action, on donne une preuve honnête.', 'Formule concentrée · 2 pulvérisations · tient jusqu’au soir'],
    [15, 'CTA', 'var(--cta)', 'On dit exactement quoi faire, et on lève les freins (paiement à la livraison).', 'Commande maintenant'],
  ];
  const r = $('#ar', el);
  let maxSeen = 0;
  const draw = () => {
    const t = +r.value / 10;
    maxSeen = Math.max(maxSeen, t);
    const k = t < 3 ? 0 : t < 11 ? 1 : 2;
    const [, n, c, d, hl] = P[k];
    $('#aph', el).textContent = n;
    $('#aph', el).style.color = c;
    $('#ad', el).textContent = d;
    $('#ahl', el).textContent = hl;
    $('#at', el).textContent = `${t.toFixed(1).replace('.', ',')} s / 15 s`;
    $('#abtn', el).style.opacity = k === 2 ? 1 : 0.25;
    $('#abtn', el).style.transform = k === 2 ? 'scale(1.05)' : '';
    if (maxSeen >= 14.5) once(`anatomie:${ctx.lesson.id}`, ctx, 20, 'Anatomie explorée');
  };
  r.addEventListener('input', draw);
  draw();
};

W.hooks = (el, ctx) => {
  const H = shuffle([
    ['Voici comment avoir une peau nette en 7 jours', 'pos'],
    ['Tu abîmes tes cheveux sans le savoir', 'neg'],
    ['[chiffre] clientes l’ont déjà recommandé', 'stat'],
    ['Le parfum qu’on te demandera toute la soirée', 'pos'],
    ['Arrête de mettre ta crème comme ça', 'neg'],
    ['[chiffre] commandes livrées ce mois-ci', 'stat'],
  ]);
  const N = { pos: 'Positif', neg: 'Négatif', stat: 'Statistique' };
  let ok = 0;
  let done = 0;
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Classe chaque hook</h3><p class="wd-p">Positif (résultat désiré), négatif (problème, erreur) ou statistique (chiffre vrai) ?</p><div style="display:grid;gap:10px">${H.map(
    ([t, k], i) => `<div class="card" data-i="${i}" style="padding:14px;display:grid;gap:10px"><b>« ${esc(t)} »</b><div class="seg">${Object.entries(N).map(([v, n]) => `<button type="button" data-v="${v}">${n}</button>`).join('')}</div></div>`,
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
          s.textContent = `${ok}/${H.length} bonnes réponses${ok === H.length ? ' — parfait !' : ''}`;
          if (ok >= 5) once(`hooks:${ctx.lesson.id}`, ctx, 30, 'Hooks bien classés');
        }
      }),
    );
  });
};

W.cta = (el, ctx) => {
  const O = {
    v: ['Commande', 'Écris-nous', 'Réserve', 'Découvre'],
    b: ['ton flacon', 'ton échantillon offert', 'ta routine complète', 'ton coffret cadeau'],
    f: ['— paiement à la livraison', '— livraison 58 wilayas', '— échange gratuit', ''],
    u: ['', '· stock limité à 50 pièces', '· offre valable jusqu’à dimanche'],
  };
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Construis ton CTA</h3><div class="wd-grid"><div style="display:grid;gap:10px">
    ${[['v', 'Verbe d’action'], ['b', 'Bénéfice'], ['f', 'Facilité'], ['u', 'Urgence (seulement si vraie)']].map(([k, n]) => `<label class="lbl">${n}<select class="in" data-k="${k}">${O[k].map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>`).join('')}
    </div><div style="display:grid;gap:12px;justify-items:center"><div class="mini-ph"><div class="mini-sc" style="background:${BG.or}">${product('parfum')}<p class="mini-hl">Ton parfum toute la journée</p><div class="mini-btn" id="cb" style="font-size:11px"></div></div></div><div style="width:100%"><span class="muted" style="font-size:12px">Ingrédients</span><div class="meter"><i id="cm"></i></div></div></div></div></div>`;
  const draw = () => {
    const v = Object.fromEntries($$('select', el).map((s) => [s.dataset.k, s.value]));
    $('#cb', el).textContent = `${v.v} ${v.b} ${v.f} ${v.u}`.replace(/\s+/g, ' ').trim();
    const n = 2 + (v.f ? 1 : 0) + (v.u ? 1 : 0);
    $('#cm', el).style.width = `${(n / 4) * 100}%`;
    pop($('#cb', el));
    if (n >= 3) once(`cta:${ctx.lesson.id}`, ctx, 20, 'CTA construit');
  };
  $$('select', el).forEach((s) => s.addEventListener('change', draw));
  draw();
};

W.aida = (el, ctx) => {
  const A = [
    ['A', 'Attention', 'Le hook', 'var(--hook)'],
    ['I', 'Intérêt', 'Le problème du client', 'var(--body)'],
    ['D', 'Désir', 'La vie avec le produit', 'var(--body)'],
    ['A', 'Action', 'Le CTA', 'var(--cta)'],
  ];
  let order = shuffle(A.map((_, i) => i));
  if (order.join() === '0,1,2,3') order = [2, 0, 3, 1];
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Remets AIDA dans l’ordre</h3><p class="wd-p">Utilise les flèches (ou fais glisser).</p><ol class="sortable" id="so"></ol><button class="b b--or" type="button" id="ch">Vérifier</button><p class="wd-p" id="cr"></p></div>`;
  const so = $('#so', el);
  const draw = () => {
    so.innerHTML = order
      .map((i, p) => `<li><div class="it" data-p="${p}" style="--c:${A[i][3]}"><span class="k">${A[i][0]}</span><span style="display:grid"><b>${A[i][1]}</b><span class="muted" style="font-size:12px;font-weight:500">${A[i][2]}</span></span><span class="mv"><button class="b b--i b--s" type="button" data-up="${p}" aria-label="Monter">↑</button><button class="b b--i b--s" type="button" data-dn="${p}" aria-label="Descendre">↓</button></span></div></li>`)
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
    $('#cr', el).textContent = ok ? 'Parfait : Attention → Intérêt → Désir → Action.' : 'Pas encore : commence par ce qui arrête le pouce.';
    if (ok) once(`aida:${ctx.lesson.id}`, ctx, 30, 'AIDA maîtrisé');
  });
};

W.carrousel = (el, ctx) => {
  const def = ['Ton parfum disparaît avant midi ?', 'Il s’évapore en 3 heures', 'NOOR : formule concentrée', '2 pulvérisations, jusqu’au soir', 'Commande — paiement à la livraison'];
  const names = ['Hook', 'Problème', 'Solution', 'Preuve', 'CTA'];
  const bgs = ['nuit', 'rose', 'teal', 'sable', 'or'];
  const saved = store.get(`car:${ctx.lesson.id}`, def);
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Écris ton carrousel en 5 slides</h3><div class="wd-grid"><div style="display:grid;gap:8px">${names.map((n, i) => `<label class="lbl">${i + 1}. ${n}<input class="in" data-i="${i}" value="${esc(saved[i])}" maxlength="60"></label>`).join('')}</div>
    <div style="display:grid;gap:10px;justify-items:center"><div class="mini-ph"><div class="mini-sc" id="cs"></div></div><div class="seg">${names.map((n, i) => `<button type="button" data-s="${i}" aria-pressed="${i === 0}">${i + 1}</button>`).join('')}</div></div></div></div>`;
  let cur = 0;
  const draw = () => {
    const v = $$('input', el).map((i) => i.value);
    store.set(`car:${ctx.lesson.id}`, v);
    const sc = $('#cs', el);
    sc.style.background = BG[bgs[cur]];
    sc.innerHTML = `<span style="position:absolute;right:10px;top:10px;font-family:var(--font-mono);font-size:10px;padding:2px 6px;border-radius:6px;background:rgba(0,0,0,.4)">${cur + 1}/5</span><p class="mini-hl">${esc(v[cur])}</p>${product(cur === 4 ? 'parfum' : 'parfum')}${cur === 4 ? '<div class="mini-btn">Commander</div>' : ''}`;
    $$('[data-s]', el).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.s === cur)));
  };
  $$('input', el).forEach((i) =>
    i.addEventListener('input', () => {
      cur = +i.dataset.i;
      draw();
      if ($$('input', el).every((x) => x.value.trim().length > 3)) once(`car:${ctx.lesson.id}`, ctx, 20, 'Carrousel écrit');
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
    ['Rôle', 'Tu es un copywriter spécialisé e-commerce en Algérie.', 'var(--ia)'],
    ['Contexte', 'Je vends [produit] à [prix], livraison 58 wilayas, cible : [cible].', 'var(--hook)'],
    ['Tâche', 'Écris un script vidéo de 20 secondes.', 'var(--body)'],
    ['Format', 'Hook / Body / CTA, avec le texte à l’écran.', 'var(--cta)'],
    ['Contraintes', 'Darija simple, pas de promesse non vérifiable.', 'var(--gold-400)'],
  ];
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Construis ton prompt bloc par bloc</h3><div class="wd-grid" style="align-items:start"><div style="display:grid;gap:8px">${F.map(([n, ph, c], i) => `<label class="lbl"><span style="color:${c}">${n}</span><textarea class="in" rows="2" data-i="${i}" placeholder="${esc(ph)}"></textarea></label>`).join('')}<button class="b b--s" type="button" id="pex">Remplir avec l’exemple</button></div>
    <div style="display:grid;gap:10px"><span class="muted" style="font-size:12px">Ton prompt</span><div class="out" id="po"></div><span class="muted" style="font-size:12px">Qualité</span><div class="meter"><i id="pm"></i></div><button class="b b--or" type="button" id="pc">${icon('copy', { size: 16 })} Copier le prompt</button></div></div></div>`;
  const draw = () => {
    const v = $$('textarea', el).map((t) => t.value.trim());
    $('#po', el).innerHTML = v.some(Boolean) ? v.map((x, i) => (x ? `<span style="box-shadow:inset 0 -2px 0 ${F[i][2]}">${esc(x)}</span>` : '')).filter(Boolean).join(' ') : '<span class="muted">Remplis les blocs à gauche…</span>';
    const score = v.filter((x) => x.length > 8).length / 5;
    $('#pm', el).style.width = `${score * 100}%`;
    if (score === 1) once(`prompt:${ctx.lesson.id}`, ctx, 30, 'Prompt complet');
  };
  $$('textarea', el).forEach((t) => t.addEventListener('input', draw));
  $('#pex', el).addEventListener('click', () => {
    $$('textarea', el).forEach((t, i) => (t.value = F[i][1]));
    draw();
  });
  $('#pc', el).addEventListener('click', (e) => copyText($('#po', el).textContent, e.currentTarget));
  draw();
};

W['prompt-image'] = (el, ctx) => {
  const G = {
    sujet: [['parfum', 'Flacon de parfum ambré, bouchon doré'], ['creme', 'Pot de crème blanc, couvercle doré'], ['serum', 'Flacon de sérum vert à pipette']],
    decor: [['studio', 'posé sur du marbre noir'], ['bain', 'dans une salle de bain claire'], ['sable', 'sur du sable chaud'], ['rose', 'sur un tissu rose poudré']],
    lumiere: [['g', 'lumière douce venant de la gauche'], ['cj', 'en contre-jour doré'], ['dur', 'lumière dure, ombres marquées']],
    cadrage: [['proche', 'plan rapproché'], ['cp', 'légère contre-plongée'], ['large', 'plan large avec décor']],
    style: [['luxe', 'photo produit de luxe'], ['life', 'style lifestyle authentique'], ['mini', 'style minimaliste']],
    format: [['4:5', 'format 4:5'], ['9:16', 'format 9:16'], ['1:1', 'format 1:1']],
  };
  const N = { sujet: 'Sujet', decor: 'Décor', lumiere: 'Lumière', cadrage: 'Cadrage', style: 'Style', format: 'Format' };
  const cur = { sujet: 'parfum', decor: 'studio', lumiere: 'g', cadrage: 'proche', style: 'luxe', format: '4:5' };
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Compose ton prompt image</h3><div class="wd-grid" style="align-items:start"><div style="display:grid;gap:12px">${Object.keys(G).map((k) => `<div style="display:grid;gap:6px"><span class="muted" style="font-size:12px;font-weight:700">${N[k]}</span>${seg(k, G[k].map(([v, t]) => [v, t.replace(/^(Flacon de |Pot de |posé |dans une |sur du |sur un |lumière |en |photo |style |format )/, '')]), cur[k])}</div>`).join('')}</div>
    <div style="display:grid;gap:12px"><div class="ipreview" id="ip"><div class="light" id="il"></div><i class="ip-r" id="ir"></i></div><div class="out" id="io"></div><button class="b b--or" type="button" id="ic">${icon('copy', { size: 16 })} Copier le prompt</button></div></div></div>`;
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
    const txt = Object.keys(G).map((k) => G[k].find(([v]) => v === cur[k])[1]).join(', ') + '.';
    $('#io', el).textContent = txt;
  };
  let changes = 0;
  Object.keys(G).forEach((k) =>
    onSeg(el, k, (v) => {
      cur[k] = v;
      draw();
      pop(ip);
      if (++changes >= 4) once(`pimg:${ctx.lesson.id}`, ctx, 20, 'Prompt image composé');
    }),
  );
  $('#ic', el).addEventListener('click', (e) => copyText($('#io', el).textContent, e.currentTarget));
  draw();
};

W.camera = (el, ctx) => {
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Essaie les mouvements de caméra</h3><div class="cam3d"><canvas id="cc"></canvas><span>REC ●</span></div>${seg('m', [['push', 'Push-in'], ['orbit', 'Orbit'], ['pan', 'Travelling'], ['crane', 'Plongée']], '')}<p class="wd-p" id="cd">Choisis un mouvement : la caméra le joue sur le flacon.</p></div>`;
  const D = { push: 'La caméra avance : tension, désir.', orbit: 'La caméra tourne autour : effet premium.', pan: 'La caméra glisse sur le côté : fluidité.', crane: 'La caméra descend d’en haut : vue d’ensemble.' };
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
    if (tried.size === 4) once(`cam:${ctx.lesson.id}`, ctx, 20, 'Mouvements testés');
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
    ['imp', 'Impressions', 10000],
    ['v3', 'Vues de 3 s', 3200],
    ['tp', 'Vues longues (ThruPlay)', 900],
    ['clic', 'Clics', 160],
    ['dep', 'Dépense (DA)', 15000],
    ['ach', 'Achats', 12],
  ];
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Calcule les métriques de ta créative</h3><p class="wd-p">Valeurs d’exemple : remplace-les par celles de ton gestionnaire de publicités.</p><div class="kpis">${F.map(([k, n, v]) => `<label class="lbl">${n}<input class="in" type="number" min="0" inputmode="numeric" data-k="${k}" value="${v}"></label>`).join('')}</div><div class="kpis" id="mk"></div><div class="out" id="md"></div></div>`;
  const draw = () => {
    const v = Object.fromEntries($$('input', el).map((i) => [i.dataset.k, Math.max(0, +i.value || 0)]));
    const hr = v.imp ? v.v3 / v.imp : 0;
    const hd = v.v3 ? v.tp / v.v3 : 0;
    const ctr = v.imp ? v.clic / v.imp : 0;
    const cpa = v.ach ? v.dep / v.ach : 0;
    const pc = (x) => `${(x * 100).toFixed(1).replace('.', ',')} %`;
    $('#mk', el).innerHTML = [
      ['Hook rate', pc(hr), 'Le hook accroche-t-il ?', 'var(--hook)'],
      ['Hold rate', pc(hd), 'Le body retient-il ?', 'var(--body)'],
      ['CTR', pc(ctr), 'Le CTA donne-t-il envie ?', 'var(--cta)'],
      ['CPA', cpa ? `${Math.round(cpa).toLocaleString('fr-FR')} DA` : '—', 'Coût par achat', 'var(--gold-400)'],
    ].map(([n, x, d, c]) => `<div class="kpi" style="box-shadow:inset 3px 0 0 ${c}"><span>${n}</span><b>${x}</b><span>${d}</span></div>`).join('');
    const weakest = [
      [hr, 'Le hook', 'teste 3 nouvelles premières secondes'],
      [hd, 'Le body', 'coupe les passages où la courbe chute et montre le produit plus tôt'],
      [ctr * 10, 'Le CTA', 'rends l’action plus claire et lève un frein (livraison, paiement)'],
    ].sort((a, b) => a[0] - b[0])[0];
    $('#md', el).textContent = `Point le plus faible : ${weakest[1]} → ${weakest[2]}. Compare toujours avec tes autres créatives : un chiffre seul ne veut rien dire.`;
  };
  $$('input', el).forEach((i) =>
    i.addEventListener('input', () => {
      draw();
      once(`metrics:${ctx.lesson.id}`, ctx, 20, 'Métriques calculées');
    }),
  );
  draw();
};

W.prix = (el, ctx) => {
  const F = [
    ['h', 'Heures pour produire 1 créative', 2.5],
    ['t', 'Ton taux horaire visé (DA)', 1500],
    ['o', 'Abonnements outils / mois (DA)', 6000],
    ['n', 'Créatives livrées par mois', 20],
    ['m', 'Marge (%)', 30],
  ];
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Calcule tes prix</h3><p class="wd-p">Valeurs d’exemple à remplacer par les tiennes. Aucun tarif n’est imposé : c’est ton marché qui décide.</p><div class="kpis">${F.map(([k, n, v]) => `<label class="lbl">${n}<input class="in" type="number" min="0" step="any" inputmode="decimal" data-k="${k}" value="${v}"></label>`).join('')}</div><div class="kpis" id="pk" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))"></div></div>`;
  const draw = () => {
    const v = Object.fromEntries($$('input', el).map((i) => [i.dataset.k, Math.max(0, +i.value || 0)]));
    const unit = (v.h * v.t + (v.n ? v.o / v.n : 0)) * (1 + v.m / 100);
    const r = (x) => `${(Math.round(x / 500) * 500).toLocaleString('fr-FR')} DA`;
    $('#pk', el).innerHTML = [
      ['1 créative', r(unit), 'prix plancher conseillé'],
      ['Pack Test · 3', r(unit * 3), 'pour démarrer avec un client'],
      ['Pack Croissance · 8', r(unit * 8 * 0.9), '−10 % pour le volume'],
      ['Abonnement · 12/mois', r(unit * 12 * 0.85), '−15 %, revenu récurrent'],
    ].map(([n, x, d]) => `<div class="kpi"><span>${n}</span><b>${x}</b><span>${d}</span></div>`).join('');
  };
  $$('input', el).forEach((i) =>
    i.addEventListener('input', () => {
      draw();
      once(`prix:${ctx.lesson.id}`, ctx, 20, 'Prix calculés');
    }),
  );
  draw();
};

W.dm = (el, ctx) => {
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Rédige ton premier message</h3><div class="wd-grid" style="align-items:start"><div style="display:grid;gap:8px">
    <label class="lbl">Prénom ou nom de la marque<input class="in" data-k="m" value="Boutique Lina"></label>
    <label class="lbl">Ce que tu as remarqué (sincère, précis)<input class="in" data-k="o" value="votre Reel sur le sérum : le produit est top, la vidéo démarre lentement"></label>
    <label class="lbl">Ce que tu offres d’abord<select class="in" data-k="v"><option>3 idées de hooks pour le relancer</option><option>une analyse rapide de vos 3 dernières pubs</option><option>une version image de votre meilleure vidéo</option></select></label>
    <label class="lbl">Canal<select class="in" data-k="c"><option value="ig">Instagram</option><option value="wa">WhatsApp</option><option value="li">LinkedIn</option></select></label>
    </div><div style="display:grid;gap:10px"><div class="out" id="dmo"></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="b b--or" type="button" id="dmc">${icon('copy', { size: 16 })} Copier</button><a class="b" id="dmw" target="_blank" rel="noopener">${icon('whatsapp', { size: 16 })} Ouvrir WhatsApp</a></div><p class="wd-p" style="font-size:12.5px">Règle d’or : personnalise chaque message, n’envoie jamais le même texte à 100 comptes.</p></div></div></div>`;
  const draw = () => {
    const v = Object.fromEntries($$('[data-k]', el).map((i) => [i.dataset.k, i.value.trim()]));
    const hi = v.c === 'li' ? 'Bonjour' : 'Salam';
    const txt = `${hi} ${v.m} ! J’ai vu ${v.o}. J’ai préparé ${v.v}, je vous les envoie ?`;
    $('#dmo', el).textContent = txt;
    $('#dmw', el).href = `https://wa.me/?text=${encodeURIComponent(txt)}`;
  };
  $$('[data-k]', el).forEach((i) => i.addEventListener('input', draw));
  $('#dmc', el).addEventListener('click', (e) => {
    copyText($('#dmo', el).textContent, e.currentTarget);
    once(`dm:${ctx.lesson.id}`, ctx, 20, 'Message de prospection prêt');
  });
  draw();
};

/** Exercice par défaut : appliquer la leçon à son propre produit. */
W.applique = (el, ctx) => {
  const key = `app:${ctx.lesson.id}`;
  el.innerHTML = `<div class="wd"><h3 class="wd-h">Applique à ton produit</h3><p class="wd-p">Choisis un produit que tu connais et écris ta version en 3 à 5 lignes en appliquant : <b>${esc(ctx.lesson.title)}</b>.</p>
    <div class="out" style="white-space:normal">${(ctx.lesson.key || []).map((k) => `<p style="margin:0 0 6px">• ${esc(k)}</p>`).join('')}</div>
    <textarea class="in" rows="5" id="apt" placeholder="Mon produit : … Mon application : …">${esc(store.get(key, ''))}</textarea><button class="b b--or" type="button" id="aps">Enregistrer</button><p class="wd-p" id="apm"></p></div>`;
  $('#aps', el).addEventListener('click', () => {
    const v = $('#apt', el).value.trim();
    store.set(key, v);
    $('#apm', el).textContent = v.length > 30 ? 'Enregistré. Garde-le pour ton projet final.' : 'Écris au moins quelques lignes.';
    if (v.length > 30) once(key, ctx, 20, 'Exercice appliqué');
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
