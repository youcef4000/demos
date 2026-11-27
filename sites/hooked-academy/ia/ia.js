// Hooked Academy — landing « Formation IA » (/ia/), page B du test A/B des landings (la page A est /).
// GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText) et Lenis 1.3 pour le défilement doux à la souris.
// Chiffres, tarifs et FAQ viennent des mêmes sources que la landing (data/programme.js, data/offres.js,
// FAQ de l'équipe) ; les inscriptions partent au même serveur avec la source « Landing IA ».
// En « mouvement réduit », rien ne bouge tout seul : la page reste complète et lisible.
// ?capture : mode d'enregistrement vidéo (temps piloté de l'extérieur, pas de Lenis).
import { lang, t, has, setLang, isRTL } from '../assets/js/i18n.js';
import './ia-i18n.js';
import { allLessons, coreModulesOf, modCode } from '../data/programme.js';
import { OFFRES } from '../data/offres.js';
import { addApplication, settings } from '../assets/js/store.js';
import { planFromUrl, utm, trackLead, watchDemo } from '../assets/js/suivi.js';
import { api } from '../assets/js/api.js';
import * as FAQ from '../assets/js/faq.js';
import { mountAssistant } from '../assets/js/assistant.js';
import { initPWA } from '../assets/js/pwa.js';
import { mountSiteBuild } from '../assets/js/site-build.js';
import { mountCompose } from '../assets/js/compose.js';
import { mountPresentation } from '../assets/js/presentation.js';
import { wilayaOptions } from '../data/wilayas.js';

// Vidéo de présentation du héro : prête avant toutes les animations
mountPresentation(document.getElementById('pres'));

{
  const D = document;
  const H = D.documentElement;
  const $ = (s, r = D) => r.querySelector(s);
  const $$ = (s, r = D) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const NB = ' ';
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  // Données réelles : comptes calculés comme sur la landing (sans le module de bienvenue)
  const LESSONS = allLessons().filter((l) => !l.module.intro);
  const N = {
    'ia-lessons': LESSONS.filter((l) => l.module.track === 'ia').length,
    'ia-mods': coreModulesOf('ia').length,
    'crea-lessons': LESSONS.filter((l) => l.module.track === 'creative').length,
    'crea-mods': coreModulesOf('creative').length,
    'dev-lessons': LESSONS.filter((l) => l.module.track === 'dev').length,
    'dev-mods': coreModulesOf('dev').length,
    both: LESSONS.filter((l) => ['creative', 'ia'].includes(l.module.track)).length,
    all: LESSONS.length,
  };
  const DATA = {
    ia: coreModulesOf('ia').map((m) => ({ id: m.id, code: modCode(m), title: m.title, pitch: m.pitch, lessons: m.lessons.map((l) => l.title) })),
  };
  const P = { creative: OFFRES.creative, ia: OFFRES.ia, dev: OFFRES.dev, both: OFFRES.both, all: OFFRES.all };
  const SOLO = ['ia', 'creative', 'dev'];
  const reduce = H.classList.contains('rm');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const CAP = /[?&]capture\b/.test(location.search);
  const isSmall = () => innerWidth < 900;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Images : chemins écrits en toutes lettres (l'assemblage en un seul fichier les remplace).
  const IMG = {
    basket: 'img/gen-basket.webp',
    parfum: 'img/gen-parfum.webp',
    dattes: 'img/gen-dattes.webp',
    // une vignette réelle de leçon par module
    mods: Object.fromEntries(
      Object.entries({ ia1: 'ia1-l1', ia2: 'ia2-l3', ia3: 'ia3-l5', ia4: 'ia4-l1', ia5: 'ia5-l1', ia6: 'ia6-l5', ia7: 'ia7-l2', ia8: 'ia8-l1', ia9: 'ia9-l1', ia10: 'ia5-l4' }).map(([k, v]) => [k, `../assets/img/lecons/${v}.webp`]),
    ),
  };

  /* ---------------------------------------------------------------- */
  /* Langue, chiffres réels et tarifs                                   */
  /* ---------------------------------------------------------------- */
  const nl = (n) => t(n > 1 ? 'ia.lessons' : 'ia.lesson', { n });
  const da = (n) => `${fmt(n)}${NB}${t('ia.tar.da')}`;
  const VARS = {
    'ia.hero.sub': { n: N['ia-lessons'] },
    'ia.prog.t': { n: N['ia-lessons'], nm: N['ia-mods'] },
    'ia.tar.ia.1': { n: N['ia-lessons'] },
    'ia.tar.ia.2': { nm: N['ia-mods'] },
    'ia.tar.c.1': { n: N['crea-lessons'] },
    'ia.tar.c.2': { nm: N['crea-mods'] },
    'ia.tar.d.1': { n: N['dev-lessons'] },
    'ia.tar.d.2': { nm: N['dev-mods'] },
    'ia.tar.b.1': { n: N.both },
    'ia.tar.b.was': { prix: fmt(P.creative + P.ia) },
    'ia.tar.b.save': { prix: fmt(P.creative + P.ia - P.both) },
    'ia.tar.a.1': { n: N.all },
    'ia.tar.a.was': { prix: fmt(P.creative + P.ia + P.dev) },
    'ia.tar.a.save': { prix: fmt(P.creative + P.ia + P.dev - P.all) },
    'ia.f.from': { prix: fmt(Math.min(...SOLO.map((k) => P[k]))) },
  };
  // Typographie française : espace insécable avant « : ; ! ? » et dans les guillemets
  function frTypo(root) {
    if (lang !== 'fr') return;
    const w = D.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const v = n.nodeValue.replace(/ ([:;!?»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');
      if (v !== n.nodeValue) n.nodeValue = v;
    }
  }
  (function translate() {
    D.title = t('ia.meta.title');
    $('meta[name="description"]').setAttribute('content', t('ia.meta.desc'));
    if (lang !== 'fr') {
      $$('[data-k]').forEach((el) => has(el.dataset.k) && (el.textContent = t(el.dataset.k)));
      $$('[data-list]').forEach((ul) => (ul.innerHTML = t(ul.dataset.list).split('|').map((x) => `<li>${esc(x)}</li>`).join('')));
      $$('[data-ka]').forEach((el) =>
        el.dataset.ka.split(';').forEach((p) => {
          const [a, k] = p.split(':');
          if (has(k)) el.setAttribute(a, t(k));
        }),
      );
    }
    $$('[data-h]').forEach((el) => (el.innerHTML = t(el.dataset.h, VARS[el.dataset.h])));
    $$('[data-count]').forEach((el) => {
      el.dataset.count = N[el.dataset.count];
      el.textContent = el.dataset.count;
    });
    $$('[data-price]').forEach((el) => (el.textContent = fmt(P[el.dataset.price])));
    $$('[data-price-s]').forEach((el) => (el.textContent = da(P[el.dataset.priceS])));
    $('#all-lbl').textContent = t('ia.all.open', { n: N['ia-lessons'] });
    $$('#lsw [data-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
      b.addEventListener('click', () => setLang(b.dataset.lang));
    });
    frTypo(D.body);
  })();

  /* ---------------------------------------------------------------- */
  /* Programme : modules et leçons réels                               */
  /* ---------------------------------------------------------------- */
  (function renderProgramme() {
    const byId = Object.fromEntries(DATA.ia.map((m) => [m.id, m]));
    $$('.mods').forEach((ul) => {
      ul.innerHTML = ul.dataset.mods
        .split(',')
        .map((id) => {
          const m = byId[id];
          return `<li class="mod"><div class="mod-img"><img src="${IMG.mods[id]}" alt="" width="640" height="360" decoding="async"></div><div class="mod-x"><p class="mod-c">${m.code} · ${nl(m.lessons.length)}</p><p class="mod-t">${esc(m.title)}</p><p class="mod-p">${esc(m.pitch)}</p></div></li>`;
        })
        .join('');
    });
    $('#sa-mods').innerHTML = coreModulesOf('dev')
      .map((m) => `<li><b>${esc(modCode(m))}</b>${esc(m.title)}</li>`)
      .join('');
    $('#all-list').innerHTML = DATA.ia
      .map((m) => `<section class="al-m"><h4><span>${m.code}</span>${esc(m.title)}<em>${nl(m.lessons.length)}</em></h4><ol>${m.lessons.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></section>`)
      .join('');
  })();

  // Barres de la forme d'onde (voix off)
  $('#d-wave').innerHTML = '<i></i>'.repeat(26);
  // Plans du storyboard : la même image, quatre cadrages
  const STORY = [
    ['cover', '50% 50%'],
    ['260%', '62% 52%'],
    ['170%', '28% 60%'],
    ['cover', '50% 40%'],
  ];
  $$('#story i').forEach((el, k) => {
    el.style.backgroundImage = `url("${IMG.basket}")`;
    el.style.backgroundSize = STORY[k][0];
    el.style.backgroundPosition = STORY[k][1];
  });
  $('#d-bg').style.backgroundImage = `url("${IMG.basket}")`;

  /* ---------------------------------------------------------------- */
  /* Mur de pubs du héro                                                */
  /* ---------------------------------------------------------------- */
  (function buildWall() {
    const pool = [IMG.basket, IMG.mods.ia6, IMG.parfum, IMG.mods.ia2, IMG.dattes, IMG.mods.ia3, IMG.mods.ia5, IMG.mods.ia8, IMG.mods.ia4, IMG.mods.ia9, IMG.mods.ia7];
    const cols = innerWidth >= 900 ? 6 : 3;
    const wall = $('#wall');
    let html = '';
    for (let c = 0; c < cols; c++) {
      const list = Array.from({ length: 5 }, (_, k) => pool[(c * 3 + k * 2) % pool.length]);
      const cells = [...list, ...list].map((u) => `<i style="background-image:url('${u}')"></i>`).join('');
      html += `<div class="wall-c" style="--d:${54 + (c % 3) * 9}s;animation-delay:-${c * 7}s">${cells}</div>`;
    }
    wall.innerHTML = html;
  })();

  /* ---------------------------------------------------------------- */
  /* Liste complète des leçons (ouvrir / fermer)                       */
  /* ---------------------------------------------------------------- */
  const allBtn = $('#all-btn');
  const allList = $('#all-list');
  allBtn.addEventListener('click', () => {
    const open = allBtn.getAttribute('aria-expanded') === 'true';
    allBtn.setAttribute('aria-expanded', String(!open));
    $('#all-lbl').textContent = open ? t('ia.all.open', { n: N['ia-lessons'] }) : t('ia.all.close');
    const done = () => hasGsap && ScrollTrigger.refresh();
    if (!hasGsap || reduce) {
      allList.hidden = open;
      done();
      return;
    }
    if (!open) {
      allList.hidden = false;
      gsap.fromTo(allList, { height: 0 }, { height: 'auto', duration: 0.8, ease: 'expo.out', onComplete: () => (gsap.set(allList, { clearProps: 'height' }), done()) });
      gsap.from(allList.children, { y: 24, autoAlpha: 0, duration: 0.6, stagger: 0.035, ease: 'power3.out' });
    } else {
      gsap.to(allList, { height: 0, duration: 0.55, ease: 'expo.inOut', onComplete: () => ((allList.hidden = true), gsap.set(allList, { clearProps: 'height' }), done()) });
    }
  });

  /* ---------------------------------------------------------------- */
  /* Formulaire : même serveur que la landing, source « Landing IA »   */
  /* ---------------------------------------------------------------- */
  const form = $('#form');
  // Wilaya (obligatoire) : les 58, numéro et nom dans la langue de la page (data/wilayas.js)
  $('select[name="wilaya"]', form).insertAdjacentHTML('beforeend', wilayaOptions(lang).map((o) => `<option value="${o.value}">${esc(o.label)}</option>`).join(''));
  // La formule (une formation, pack complet, pack Créative + IA), puis la formation si « une formation » :
  // le champ caché `formation` porte l'offre envoyée au serveur (creative, ia, dev, both ou all).
  const fSync = () => {
    const f = $('input[name="formule"]:checked', form)?.value || 'all';
    const s = $('input[name="solo"]:checked', form)?.value || 'ia';
    $('#f-solo').hidden = f !== 'solo';
    $('input[name="formation"]', form).value = f === 'solo' ? s : f;
  };
  const pickOffer = (id) => {
    const solo = SOLO.includes(id);
    const r = $(`input[name="formule"][value="${solo ? 'solo' : id}"]`, form);
    if (r) r.checked = true;
    if (solo) $(`input[name="solo"][value="${id}"]`, form).checked = true;
    fSync();
  };
  $$('input[name="formule"], input[name="solo"]', form).forEach((r) => r.addEventListener('change', fSync));
  fSync();
  D.addEventListener('click', (e) => {
    const a = e.target.closest('[data-pick]');
    if (a) pickOffer(a.dataset.pick);
  });
  // ?plan=creative|ia|sites|pack2|pack3 (lien d'une publicité) : la formule est présélectionnée ; sans paramètre, rien ne change
  const plan = planFromUrl();
  if (plan) pickOffer(plan);
  // Pixel Meta : ViewContent quand on ouvre le compte démo
  watchDemo();
  // Tarifs : « compose ta formule » (assets/js/compose.js, thème « glass »). Les trois formations sont cochées au départ
  // (pack complet) ; « Une formation » propose l'IA sur cette page. Le bouton du ticket choisit la formule du formulaire.
  mountCompose($('#compose'), {
    theme: 'glass',
    prices: P,
    lessons: { creative: N['crea-lessons'], ia: N['ia-lessons'], dev: N['dev-lessons'] },
    mods: { creative: N['crea-mods'], ia: N['ia-mods'], dev: N['dev-mods'] },
    one: 'ia',
    cohort: settings().cohort,
    onPick: pickOffer,
  });

  let sending = false;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = $('#form-err');
    const f = form.elements;
    const bad = [];
    const mark = (el, ok) => (el.setAttribute('aria-invalid', String(!ok)), ok || bad.push(el));
    mark(f.name, f.name.value.trim().length >= 2);
    mark(f.phone, /^[\d\s+().-]{8,}$/.test(f.phone.value.trim()) && f.phone.value.replace(/\D/g, '').length >= 9);
    mark(f.wilaya, /^\d{2}$/.test(f.wilaya.value));
    if (f.email.value.trim()) mark(f.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()));
    const ok = f.ok.checked;
    if (bad.length || !ok) {
      err.textContent = t(bad.length ? 'ia.f.bad' : 'ia.f.check');
      (bad[0] || f.ok).focus();
      if (hasGsap && !reduce) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    err.textContent = '';
    if (sending) return;
    const data = Object.fromEntries(new FormData(form).entries());
    delete data.ok;
    data.lang = lang;
    data.source = 'Landing IA';
    const btn = $('.form-go', form);
    sending = true;
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    // Les UTM de la session partent avec la demande ; Lead seulement après la réponse OK du serveur
    addApplication({ ...data, ...utm() })
      .then(() => {
        trackLead(data.formation);
        sent(data);
      })
      .catch((e2) => {
        // Serveur injoignable ou trop d'envois : la demande part sur WhatsApp, rien n'est perdu
        const wa = String(settings().whatsapp || '').replace(/\D/g, '');
        const pack = t({ ia: 'ia.f.ia', both: 'ia.f.both', creative: 'ia.f.crea', dev: 'ia.f.dev', all: 'ia.f.all' }[data.formation] || 'ia.f.all');
        const msg = t('ia.f.waMsg', { name: data.name || '', phone: data.phone || '', pack });
        err.innerHTML = `${esc(t(e2?.status === 429 ? 'ia.f.rate' : 'ia.f.err'))} <a href="https://wa.me/${wa}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${esc(t('ia.f.wa'))}</a>`;
      })
      .finally(() => {
        sending = false;
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
      });
  });
  function sent(data) {
    const first = String(data.name || '').trim().split(/\s+/)[0] || '';
    $('#done-t').textContent = t('ia.f.done', { name: first ? `${isRTL ? '، ' : ', '}${first}` : '' });
    const done = $('#form-done');
    const fs = $('.form-in', form);
    const show = () => {
      fs.hidden = true;
      done.hidden = false;
      done.focus({ preventScroll: true });
    };
    if (!hasGsap || reduce) return show();
    burst($('.form-go', form));
    gsap.to(fs, {
      autoAlpha: 0,
      y: -10,
      duration: 0.35,
      onComplete: () => {
        show();
        gsap.from(done, { autoAlpha: 0, y: 20, scale: 0.96, duration: 0.6, ease: 'back.out(1.6)' });
        gsap.from($('.fd-ic', done), { scale: 0, rotation: -90, duration: 0.7, ease: 'back.out(2.2)', delay: 0.1 });
        ScrollTrigger.refresh();
      },
    });
  }
  function burst(from) {
    const r = from.getBoundingClientRect();
    const cols = ['#c6f23c', '#c8b6ff', '#5ee7ff', '#e0be55', '#9b7bff'];
    for (let i = 0; i < 34; i++) {
      const p = D.createElement('i');
      p.className = 'burst';
      p.style.background = cols[i % cols.length];
      p.style.left = `${r.left + r.width / 2}px`;
      p.style.top = `${r.top + r.height / 2}px`;
      D.body.appendChild(p);
      const a = Math.random() * Math.PI * 2;
      const v = 90 + Math.random() * 180;
      gsap.to(p, { x: Math.cos(a) * v, y: Math.sin(a) * v - 60, rotation: Math.random() * 540, duration: 0.9 + Math.random() * 0.5, ease: 'power3.out' });
      gsap.to(p, { y: '+=140', autoAlpha: 0, duration: 0.8, delay: 0.7, ease: 'power2.in', onComplete: () => p.remove() });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Rendu « diffusion » : bruit → pixels → image nette                 */
  /* ---------------------------------------------------------------- */
  function diffuser(cv) {
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const Hh = cv.height;
    const sm = D.createElement('canvas');
    const sx = sm.getContext('2d');
    const nz = D.createElement('canvas');
    nz.width = 48;
    nz.height = 60;
    const nx = nz.getContext('2d');
    const nd = nx.createImageData(48, 60);
    const PAL = [
      [14, 11, 32],
      [40, 30, 92],
      [124, 92, 255],
      [200, 182, 255],
      [94, 231, 255],
    ];
    function noise(seed) {
      const r = rng(seed * 7919 + 13);
      for (let i = 0; i < nd.data.length; i += 4) {
        const q = r();
        const c = PAL[q < 0.45 ? 0 : q < 0.72 ? 1 : q < 0.87 ? 2 : q < 0.95 ? 3 : 4];
        const k = 0.35 + 0.65 * r();
        nd.data[i] = c[0] * k;
        nd.data[i + 1] = c[1] * k;
        nd.data[i + 2] = c[2] * k;
        nd.data[i + 3] = 255;
      }
      nx.putImageData(nd, 0, 0);
    }
    return (img, p, seed) => {
      ctx.globalAlpha = 1;
      if (!img || p <= 0.002) {
        noise(seed);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(nz, 0, 0, W, Hh);
        return;
      }
      const q = clamp((p - 0.04) / 0.84, 0, 1);
      const px = Math.max(1, Math.round(Math.pow(2, lerp(5.6, 0, easeIO(q)))));
      if (px > 1) {
        const w = Math.max(2, Math.round(W / px));
        const h = Math.max(2, Math.round(Hh / px));
        if (sm.width !== w || sm.height !== h) {
          sm.width = w;
          sm.height = h;
        }
        sx.imageSmoothingEnabled = true;
        sx.drawImage(img, 0, 0, w, h);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sm, 0, 0, W, Hh);
      } else {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, W, Hh);
      }
      const na = clamp(1 - p * 1.35, 0, 1);
      if (na > 0.01) {
        noise(seed);
        ctx.imageSmoothingEnabled = false;
        ctx.globalAlpha = na * 0.9;
        ctx.drawImage(nz, 0, 0, W, Hh);
        ctx.globalAlpha = 1;
      }
    };
  }

  // Boucle d'animation qui ne tourne que si l'élément est à l'écran
  function loopWhenVisible(el, frame) {
    let on = false;
    let raf = 0;
    const tick = (t) => {
      frame(t);
      raf = on ? requestAnimationFrame(tick) : 0;
    };
    new IntersectionObserver(([e]) => {
      const was = on;
      on = e.isIntersecting && !D.hidden;
      if (on && !was && !raf) raf = requestAnimationFrame(tick);
    }).observe(el);
    return { draw: (t) => frame(t || performance.now()) };
  }

  /* ---------------------------------------------------------------- */
  /* Particules finales : elles forment le monogramme Hooked            */
  /* ---------------------------------------------------------------- */
  function logoParticles(cv) {
    const ctx = cv.getContext('2d');
    const r = rng(48);
    const S = 240;
    const off = D.createElement('canvas');
    off.width = off.height = S;
    const o = off.getContext('2d');
    o.scale(S / 48, S / 48);
    o.fillStyle = '#fff';
    o.strokeStyle = '#fff';
    const rr = (x, y, w, h, rad) => {
      o.beginPath();
      o.roundRect ? o.roundRect(x, y, w, h, rad) : o.rect(x, y, w, h);
      o.fill();
    };
    rr(8.5, 9, 5.5, 30, 2.75);
    rr(34, 9, 5.5, 30, 2.75);
    o.lineWidth = 5.5;
    o.lineCap = 'round';
    o.lineJoin = 'round';
    o.beginPath();
    o.moveTo(19.4, 29.2);
    o.lineTo(24, 18.8);
    o.lineTo(28.6, 29.2);
    o.stroke();
    const px = o.getImageData(0, 0, S, S).data;
    const step = innerWidth < 700 ? 5 : 4;
    const T = [];
    for (let y = 0; y < S; y += step) for (let x = 0; x < S; x += step) if (px[(y * S + x) * 4 + 3] > 140) T.push([x / S - 0.5, y / S - 0.5]);
    const parts = T.map(([tx, ty]) => ({ tx, ty, sx: r(), sy: r(), ph: r() * 6.28, dl: r() * 0.3, z: 0.6 + r() * 0.8 }));
    let W = 0;
    let Hh = 0;
    let dpr = 1;
    function size() {
      W = cv.clientWidth;
      Hh = cv.clientHeight;
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(Hh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    new ResizeObserver(size).observe(cv);
    const state = { p: 0 };
    const anchor = $('.fin-in');
    function frame(t) {
      const T2 = t / 1000;
      const L = Math.min(W * 0.62, Hh * 0.4, 340);
      const cx = W / 2;
      const cy = Math.max(L * 0.55 + 16, anchor.offsetTop - L * 0.55 - 26);
      ctx.clearRect(0, 0, W, Hh);
      ctx.globalCompositeOperation = 'lighter';
      for (const q of parts) {
        const k = easeOut(clamp((state.p * 1.3 - q.dl) / 1, 0, 1));
        const fx = q.sx * W + Math.sin(T2 * 0.5 + q.ph) * 30 * q.z;
        const fy = q.sy * Hh + Math.cos(T2 * 0.4 + q.ph) * 30 * q.z;
        const x = lerp(fx, cx + q.tx * L + Math.sin(T2 * 2 + q.ph) * 0.8, k);
        const y = lerp(fy, cy + q.ty * L + Math.cos(T2 * 2 + q.ph) * 0.8, k);
        const a = (0.25 + 0.55 * k) * (0.75 + 0.25 * Math.sin(T2 * 3 + q.ph));
        const c = k > 0.6 ? [lerp(155, 242, (k - 0.6) / 0.4), lerp(123, 214, (k - 0.6) / 0.4), lerp(255, 140, (k - 0.6) / 0.4)] : [155, 123, 255];
        ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;
        const s = (1.2 + 1.1 * k) * q.z;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    const loop = loopWhenVisible(cv, frame);
    return { state, draw: loop.draw };
  }

  /* ---------------------------------------------------------------- */
  /* Démarrage : polices + images chargées                              */
  /* ---------------------------------------------------------------- */
  const IMGS = {};
  const load = (k) =>
    new Promise((res) => {
      const im = new Image();
      im.onload = () => res((IMGS[k] = im));
      im.onerror = () => res(null);
      im.src = IMG[k];
    });
  let started = false;
  const go = () => {
    if (started) return;
    started = true;
    window.__haReady = true;
    try {
      if (!hasGsap || reduce) staticPage();
      else animatedPage();
    } catch (e) {
      console.error(e);
      H.classList.remove('js');
    }
  };
  /* ---------------------------------------------------------------- */
  /* FAQ de l'équipe, assistant, visite comptée pour le test A/B        */
  /* ---------------------------------------------------------------- */
  function renderFaq(animated) {
    FAQ.ready().then(() => {
      const items = FAQ.list().filter((x) => x.landing);
      $('#qa').innerHTML = items
        .map((x) => {
          const a = FAQ.pickLang(x.a, lang)
            .split(/\n\s*\n/)
            .map((p) => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
            .join('');
          return `<details><summary>${esc(FAQ.pickLang(x.q, lang))}<i aria-hidden="true"></i></summary><div class="qa-a">${a}</div></details>`;
        })
        .join('');
      frTypo($('#qa'));
      if (animated) {
        gsap.from('#qa details', { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out', scrollTrigger: { trigger: '#qa', start: 'top 85%' } });
        ScrollTrigger.refresh();
      }
    });
  }
  function bot() {
    let wa = '';
    try {
      wa = String(settings().whatsapp || '').replace(/\D/g, '');
    } catch {}
    const go2 = (href, k) => ({ href, label: t(k) });
    mountAssistant({
      whatsapp: wa,
      faqHref: '#faq',
      filter: (e) => e.landing,
      bottom: isSmall() ? 'calc(80px + env(safe-area-inset-bottom))' : '',
      links: {
        _prix: go2('#tarifs', 'bot.l.tarifs'),
        paiement: go2('#inscription', 'bot.l.signup'),
        acces: go2('#tarifs', 'bot.l.tarifs'),
        deux: go2('#creative', 'bot.l.courses'),
        debutant: go2('#inscription', 'bot.l.signup'),
      },
    });
  }
  // Une visite par jour et par réseau, comptée par le serveur (page « ia » ; la landing compte « a »)
  if (!CAP) api('POST', 'visit', { page: 'ia' }).catch(() => {});
  Promise.all([D.fonts ? D.fonts.ready : 0, load('basket'), load('parfum'), load('dattes')]).then(go);
  if (!CAP) {
    bot();
    initPWA('../sw.js');
  }
  setTimeout(go, 2600);

  /* ---------------------------------------------------------------- */
  /* Page sans mouvement (mouvement réduit, ou sans GSAP)               */
  /* ---------------------------------------------------------------- */
  function staticPage() {
    const g = diffuser($('#gen-cv'));
    g(IMGS.basket, 1, 1);
    $('#gen-txt').textContent = t('ia.gen.ex1').split('|').join(', ');
    $('#gen-status').textContent = t('ia.gen.ok');
    $('#gen-status').dataset.s = 'ok';
    $('#gen-pct').textContent = '100 %';
    const dv = diffuser($('#d-cv'));
    dv(IMGS.basket, 1, 1);
    ['#d-cv', '#d-bg', '#d-ad', '#d-lab'].forEach((s) => ($(s).style.opacity = 1));
    $('#d-chat').style.display = 'none';
    $('#d-chips').style.display = 'none';
    $('#d-notif').style.transform = 'none';
    $('#hbc').style.opacity = 1;
    $$('#hbc i').forEach((i) => (i.style.transform = 'none'));
    $$('#ps-list .ps').forEach((p) => p.classList.add('is-on'));
    $$('.crea-tl i').forEach((i) => (i.style.transform = 'none'));
    mountSiteBuild($('#sa-sb'), { reduce: true });
    $$('#orbit li').forEach((li) => li.classList.add('is-on'));
    renderFaq(false);
    const fin = logoParticles($('#fin-cv'));
    fin.state.p = 1;
    fin.draw(4000);
  }

  /* ---------------------------------------------------------------- */
  /* Page animée                                                        */
  /* ---------------------------------------------------------------- */
  function animatedPage() {
    gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (CAP) {
      window.__ST = ScrollTrigger;
      window.__gsap = gsap;
    }

    // Défilement doux à la souris (pas sur écran tactile)
    let lenis = null;
    if (fine && !CAP && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // Liens internes (et choix de la formule depuis les tarifs)
    D.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -16, duration: 1.5 });
      else scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY - 16, behavior: 'smooth' });
    });

    // Barre de progression, barre de navigation, bouton du bas
    gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    const nav = $('#nav');
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => nav.classList.toggle('is-up', self.direction === 1 && self.scroll() > 420),
    });

    hero();
    tools();
    pipeline();
    programme();
    platform();
    creative();
    sitesApps();
    pricing();
    reveals();
    faq();
    finale();
    pointerFx();

    // Bouton « Réserver » du bas (téléphone) : après le héro, avant l'inscription,
    // et jamais pendant les deux scènes plein écran (il cacherait leurs légendes)
    const dock = $('#dock');
    const zones = [];
    const upd = () => {
      const scene = zones[1].isActive || zones[2].isActive;
      dock.classList.toggle('is-on', zones[0].isActive && !scene);
      // l'assistant se retire aussi pendant les scènes (il cacherait les légendes)
      D.body.classList.toggle('in-scene', scene);
    };
    zones.push(ScrollTrigger.create({ trigger: '.stats', start: 'bottom 35%', endTrigger: '#inscription', end: 'top 85%', onToggle: upd }));
    zones.push(ScrollTrigger.create({ trigger: '.pipe-pin', start: 'top bottom', end: () => `+=${Math.round(innerHeight * (isSmall() ? 6 : 6.4))}`, onToggle: upd }));
    zones.push(ScrollTrigger.create({ trigger: '#plat-track', start: 'top 60%', end: 'bottom 40%', onToggle: upd }));

    // Une fois les mises en page stables (images, polices), on recalcule les positions
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  /* -------- Héro -------- */
  function hero() {
    gsap.set(['.hero-t', '[data-hero]', '.stats'], { visibility: 'visible' });
    const typed = $('#ht-typed');
    const word = typed.textContent;
    typed.textContent = '';
    const l2 = new SplitText('.ht-l2', { type: 'chars', charsClass: 'hc' });
    const l3 = $('.ht-l3 .grad');
    l3.style.display = 'inline-block';
    const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'expo.out' } });
    const tp = { n: 0 };
    tl.from('.hero-pill', { y: 18, autoAlpha: 0, duration: 0.7 }, 0)
      .from('.ht-du', { y: 40, autoAlpha: 0, duration: 0.8 }, 0.1)
      .from('.ht-prompt', { scaleX: 0.2, autoAlpha: 0, transformOrigin: '0% 50%', duration: 0.5 }, 0.25)
      .to(tp, { n: word.length, duration: 0.55, ease: 'none', onUpdate: () => (typed.textContent = word.slice(0, Math.round(tp.n))) }, 0.45)
      .from(l2.chars, { yPercent: 115, rotation: 8, duration: 0.9, stagger: 0.035 }, 0.9)
      .from(l3, { yPercent: 115, duration: 1, onComplete: () => l2.revert() }, 1.05)
      .from('.hero-sub', { y: 24, autoAlpha: 0, duration: 0.9 }, 1.3)
      .from('.hero-cta > *', { y: 24, autoAlpha: 0, scale: 0.94, duration: 0.8, stagger: 0.08 }, 1.42)
      .from('.hero-note', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.6)
      .from('.stats li', { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.07 }, 1.7);
    // Le générateur (sa section sous le héro) entre et démarre quand on l'atteint
    ScrollTrigger.create({
      trigger: '#gen',
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.from('.gen', { y: 70, rotationX: 22, autoAlpha: 0, transformPerspective: 1200, transformOrigin: '50% 100%', duration: 1.3, ease: 'expo.out' });
        gsap.delayedCall(0.7, generator);
      },
    });
    // Les chiffres comptent quand on les voit (après l'entrée du héro)
    ScrollTrigger.create({ trigger: '.stats', start: 'top 92%', once: true, onEnter: () => gsap.delayedCall(Math.max(0, 1.8 - tl.time()), () => countUp($$('.stats [data-count]'))) });
    // Le fond du héro s'éloigne au défilement
    gsap.to('.hero-bg', { yPercent: 22, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-copy', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  function countUp(els, dur = 1.4) {
    els.forEach((el) => {
      const v = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, { v, duration: dur, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)) });
    });
  }

  /* -------- Générateur prompt → image (boucle sur trois exemples) -------- */
  function generator() {
    const CAT = { Sujet: '#e0be55', Décor: '#55b894', Lumière: '#f2dfa0', Cadrage: '#ec7a45', Style: '#c8b6ff', Format: '#5ee7ff' };
    const CATS = ['Sujet', 'Décor', 'Lumière', 'Cadrage', 'Style', 'Format'];
    const EX = ['basket', 'parfum', 'dattes'].map((img, i) => ({ img, parts: t(`ia.gen.ex${i + 1}`).split('|').map((x, k) => [x, CATS[k]]) }));
    const txt = $('#gen-txt');
    const status = $('#gen-status');
    const go = $('#gen-go');
    const pct = $('#gen-pct');
    const bar = $('#gen-bar');
    const scan = $('.gen-scan');
    const vars = $$('#gen-vars i');
    const render = diffuser($('#gen-cv'));
    const st = { p: 0, img: null, drawn: -1 };
    let visible = true;
    let tl = null;
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (tl) visible ? tl.resume() : tl.pause();
    }).observe($('#gen'));
    gsap.ticker.add(() => {
      if (!visible) return;
      const seed = Math.floor(gsap.ticker.time * 14);
      if (st.p >= 1 && st.drawn === 1) return;
      render(st.img, st.p, seed);
      st.drawn = st.p >= 1 ? 1 : 0;
    });
    const setStatus = (t, s) => ((status.textContent = t), (status.dataset.s = s));
    function run(i) {
      const ex = EX[i % EX.length];
      const prevImg = st.img;
      // Le prompt, segment par segment (couleur = rôle dans le gabarit)
      txt.textContent = '';
      const segs = [];
      ex.parts.forEach(([part, c], k) => {
        if (k) {
          const sep = D.createTextNode('');
          txt.appendChild(sep);
          segs.push({ node: sep, full: isRTL ? '، ' : ', ' });
        }
        const sp = D.createElement('span');
        sp.className = 'tk';
        sp.style.setProperty('--c', CAT[c]);
        sp.title = t(`ia.cat.${c}`);
        txt.appendChild(sp);
        segs.push({ node: sp, full: part, tk: sp });
      });
      const cur = D.createElement('i');
      cur.className = 'cur';
      txt.appendChild(cur);
      const total = segs.reduce((a, s) => a + s.full.length, 0);
      const typeTo = (n) => {
        let r = Math.round(n);
        for (const s of segs) {
          s.node.textContent = s.full.slice(0, clamp(r, 0, s.full.length));
          r -= s.full.length;
        }
      };
      typeTo(0);
      const tks = segs.filter((s) => s.tk).map((s) => s.tk);
      const tp = { n: 0 };
      tl = gsap.timeline({ onComplete: () => run(i + 1) });
      if (prevImg) tl.to(st, { p: 0, duration: 0.5, ease: 'power2.in', onStart: () => (st.drawn = -1) }, 0);
      tl.to(vars, { autoAlpha: 0, y: 8, duration: 0.25, stagger: 0.04 }, 0)
        .call(() => {
          setStatus(t('ia.gen.ready'), '');
          pct.textContent = '0 %';
          bar.style.transform = 'scaleX(0)';
          st.img = IMGS[ex.img];
          vars.forEach((v, k) => {
            v.style.backgroundImage = `url("${IMG[ex.img]}")`;
            v.style.backgroundSize = ['cover', '230%', '160%'][k];
            v.style.backgroundPosition = ['50% 50%', '55% 45%', '30% 70%'][k];
          });
        }, null, prevImg ? 0.5 : 0)
        .to(tp, { n: total, duration: total / 42, ease: 'none', onUpdate: () => typeTo(tp.n) }, prevImg ? 0.6 : 0.1);
      const t0 = (prevImg ? 0.6 : 0.1) + total / 42 + 0.2;
      tks.forEach((tk, k) => tl.call(() => tk.classList.add('is-lit'), null, t0 + k * 0.13));
      const tg = t0 + tks.length * 0.13 + 0.3;
      tl.to(go, { scale: 0.88, duration: 0.12, ease: 'power2.in' }, tg)
        .to(go, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, tg + 0.12)
        .call(() => ((st.drawn = -1), setStatus(t('ia.gen.run'), 'run'), cur.remove()), null, tg + 0.12)
        .fromTo(
          st,
          { p: 0 },
          {
            p: 1,
            duration: 2.6,
            ease: 'power1.inOut',
            onUpdate: () => {
              pct.textContent = `${Math.round(st.p * 100)} %`;
              bar.style.transform = `scaleX(${st.p})`;
            },
          },
          tg + 0.18,
        )
        .fromTo(scan, { yPercent: -100, autoAlpha: 0 }, { yPercent: 400, autoAlpha: 1, duration: 1.3, ease: 'none' }, tg + 1.45)
        .to(scan, { autoAlpha: 0, duration: 0.2 }, tg + 2.7)
        .call(() => setStatus(t('ia.gen.ok'), 'ok'), null, tg + 2.8)
        .fromTo(vars, { autoAlpha: 0, y: 14, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(2)' }, tg + 2.9)
        .to({}, { duration: 2.6 }, tg + 3.3);
      if (!visible) tl.pause();
    }
    run(0);
  }

  /* -------- Bandeau d'outils : vitesse et inclinaison suivent le défilement -------- */
  function tools() {
    const rows = $$('.mq').map((mq) => {
      const ul = $('.mq-t', mq);
      const base = [...ul.children];
      let copies = 1;
      const add = () => {
        base.forEach((li) => {
          const c = li.cloneNode(true);
          c.setAttribute('aria-hidden', 'true');
          ul.appendChild(c);
        });
        copies++;
      };
      add();
      while (ul.scrollWidth < innerWidth * 2.4 && copies < 8) add();
      const gap = parseFloat(getComputedStyle(ul).columnGap) || 0;
      const setW = (ul.scrollWidth + gap) / copies;
      const dir = Number(mq.dataset.dir);
      const tw = gsap.fromTo(ul, { x: dir > 0 ? 0 : -setW }, { x: dir > 0 ? -setW : 0, duration: setW / 55, ease: 'none', repeat: -1 });
      const skew = gsap.quickTo(ul, 'skewX', { duration: 0.4, ease: 'power3' });
      return { tw, skew, dir };
    });
    ScrollTrigger.create({
      trigger: '.tools',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => rows.forEach((r) => (self.isActive ? r.tw.play() : r.tw.pause())),
      onUpdate: (self) => {
        const v = self.getVelocity();
        const boost = 1 + Math.min(Math.abs(v) / 350, 5);
        rows.forEach((r) => {
          gsap.to(r.tw, { timeScale: self.direction * boost, duration: 0.15, overwrite: true });
          gsap.to(r.tw, { timeScale: self.direction, duration: 1.2, delay: 0.15, ease: 'power2.out' });
          r.skew(clamp(-v / 160, -9, 9) * r.dir);
        });
      },
    });
  }

  /* -------- En action : la pub IA de A à Z, épinglée -------- */
  function pipeline() {
    const PROMPT = t('ia.dev.prompt');
    const me = $('#dc-me');
    const chat = $('#d-chat');
    const typing = $('#dc-typing');
    const ai = $('#dc-ai');
    const cv = $('#d-cv');
    const bg = $('#d-bg');
    const chips = $('#d-chips');
    const ad = $('#d-ad');
    const vid = $('#d-vid');
    const fill = $('#dv-fill');
    const flash = $('#d-flash');
    const move = $('#dv-move');
    const frames = $$('#dv-frames i');
    const FR = [['cover', '50% 50%'], ['170%', '40% 55%'], ['260%', '60% 50%'], ['150%', '55% 40%'], ['cover', '50% 45%']];
    frames.forEach((el, k) => {
      el.style.backgroundImage = `url("${IMG.basket}")`;
      el.style.backgroundSize = FR[k][0];
      el.style.backgroundPosition = FR[k][1];
    });
    const tlab = $('#dv-t');
    const sweep = $('.d-sweep');
    const subs = $$('#d-subs span');
    const wave = $('#d-wave');
    const bars = $$('i', wave);
    const voice = $('#d-voice');
    const box = $$('#d-box i');
    const grade = $('#d-grade');
    const story = $('#story');
    const figs = $$('#story figure');
    const hbc = $('#hbc');
    const hbcI = $$('#hbc i');
    const lab = $('#d-lab');
    const notif = $('#d-notif');
    const steps = $$('#ps-list .ps');
    const pmN = $('#pm-n');
    const pmBar = $('#pm-bar');
    const render = diffuser(cv);
    const st = { p: 0 };
    const draw = () => render(IMGS.basket, st.p, Math.floor(st.p * 30));
    draw();
    me.textContent = '';
    gsap.set(cv, { yPercent: -50, autoAlpha: 0, transformPerspective: 700 });
    gsap.set([typing, ai, chips, ad, vid, wave, voice, story, hbc, lab, grade, bg, me.parentNode], { autoAlpha: 0 });
    gsap.set(notif, { yPercent: -160 });
    const tp = { n: 0 };
    const wv = { t: 0 };
    let cur = -1;
    const setStep = (i) => {
      if (i === cur) return;
      cur = i;
      steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
      pmN.textContent = String(i + 1).padStart(2, '0');
    };
    setStep(0);
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onUpdate: () => {
        setStep(Math.min(5, Math.floor(tl.time() + 0.03)));
        pmBar.style.transform = `scaleX(${tl.progress().toFixed(4)})`;
      },
      scrollTrigger: {
        trigger: '.pipe-pin',
        start: 'top top',
        end: () => `+=${Math.round(innerHeight * (isSmall() ? 5 : 5.4))}`,
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    // 01 · le prompt
    tl.fromTo(me.parentNode, { autoAlpha: 0, y: 16, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.05, transformOrigin: '100% 100%' }, 0.02)
      .to(tp, { n: PROMPT.length, duration: 0.42, ease: 'none', onUpdate: () => (me.textContent = PROMPT.slice(0, Math.round(tp.n))) }, 0.04)
      .to(typing, { autoAlpha: 1, duration: 0.04 }, 0.5)
      .to(typing, { autoAlpha: 0, duration: 0.04 }, 0.6)
      .fromTo(ai, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.6)
      .from($$('li', ai), { autoAlpha: 0, x: -14, duration: 0.08, stagger: 0.07 }, 0.66)
      // 02 · l'image
      .to(chat, { yPercent: -22, autoAlpha: 0, duration: 0.16, ease: 'power2.in' }, 1.0)
      .to(cv, { autoAlpha: 1, duration: 0.05 }, 1.06)
      .to(st, { p: 1, duration: 0.7, ease: 'none', onUpdate: draw }, 1.08)
      .to(bg, { autoAlpha: 1, duration: 0.25 }, 1.55)
      .to(chips, { autoAlpha: 1, duration: 0.01 }, 1.2)
      .from($$('li', chips), { autoAlpha: 0, y: 14, scale: 0.7, duration: 0.08, stagger: 0.035 }, 1.2)
      .to(chips, { autoAlpha: 0, y: 10, duration: 0.08 }, 1.9)
      // 03 · la vidéo
      .to(ad, { autoAlpha: 1, duration: 0.12 }, 2.02)
      .fromTo(vid, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 2.02)
      .from(frames, { autoAlpha: 0, y: 12, scale: 0.7, duration: 0.06, stagger: 0.025 }, 2.06)
      .fromTo(
        fill,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.86,
          ease: 'none',
          onUpdate: function () {
            const p = this.progress();
            tlab.textContent = `0:0${Math.min(5, Math.floor(p * 5.99))}`;
            move.textContent = t(p < 0.34 ? 'ia.dev.mv1' : p < 0.66 ? 'ia.dev.mv2' : 'ia.dev.mv3');
            const on = Math.min(4, Math.floor(p * 5));
            frames.forEach((f, k) => f.classList.toggle('on', k === on));
          },
        },
        2.1,
      )
      // plan 1 : travelling avant et léger panoramique
      .fromTo(cv, { scale: 1, xPercent: 0, rotationY: 0 }, { scale: 1.3, xPercent: -5, duration: 0.3, ease: 'power1.in' }, 2.1)
      // coupe : flash et flou de mouvement, plan 2 : gros plan qui glisse sur la matière
      .fromTo(flash, { opacity: 0.8 }, { opacity: 0, duration: 0.08, immediateRender: false }, 2.4)
      .fromTo(cv, { scale: 2.2, xPercent: 9, filter: 'blur(6px)' }, { scale: 2.4, xPercent: 1, filter: 'blur(0px)', duration: 0.27, ease: 'power1.out', immediateRender: false }, 2.4)
      // coupe, plan 3 : orbite autour du produit
      .fromTo(flash, { opacity: 0.8 }, { opacity: 0, duration: 0.08, immediateRender: false }, 2.67)
      .fromTo(cv, { scale: 1.06, xPercent: 0, rotationY: -16, filter: 'blur(6px)' }, { scale: 1.16, rotationY: 12, filter: 'blur(0px)', duration: 0.33, ease: 'power1.inOut', immediateRender: false }, 2.67)
      .fromTo(sweep, { xPercent: -130 }, { xPercent: 130, duration: 0.3, ease: 'power1.inOut' }, 2.68)
      // 04 · la voix et les sous-titres
      .to(vid, { autoAlpha: 0, duration: 0.06 }, 3.0)
      .to([wave, voice], { autoAlpha: 1, duration: 0.08 }, 3.02)
      .to(wv, { t: 1, duration: 1, ease: 'none', onUpdate: () => bars.forEach((b, k) => (b.style.transform = `scaleY(${(0.18 + 0.82 * Math.abs(Math.sin(wv.t * 22 + k * 0.55) * Math.sin(wv.t * 7.3 + k * 0.23))).toFixed(3)})`)) }, 3.0)
      .to(cv, { scale: 1.22, rotationY: 0, duration: 1.0, ease: 'none' }, 3.0)
      .fromTo(subs[0], { autoAlpha: 0, scale: 0.55 }, { autoAlpha: 1, scale: 1, duration: 0.07, ease: 'back.out(3)' }, 3.12)
      .to(subs[0], { autoAlpha: 0, duration: 0.03 }, 3.4)
      .fromTo(subs[1], { autoAlpha: 0, scale: 0.55 }, { autoAlpha: 1, scale: 1, duration: 0.07, ease: 'back.out(3)' }, 3.42)
      .to(subs[1], { autoAlpha: 0, duration: 0.03 }, 3.68)
      .fromTo(subs[2], { autoAlpha: 0, scale: 0.55 }, { autoAlpha: 1, scale: 1.08, duration: 0.08, ease: 'back.out(3)' }, 3.7)
      // 05 · UGC et cinématique
      .to([subs[2], wave, voice, ad], { autoAlpha: 0, duration: 0.06 }, 4.0)
      .to(box, { scaleY: 1, duration: 0.16, ease: 'power3.out' }, 4.02)
      .to(grade, { autoAlpha: 1, duration: 0.15 }, 4.04)
      .to(cv, { scale: 1.5, xPercent: -6, duration: 0.95, ease: 'none' }, 4.0)
      .fromTo(story, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 4.2)
      .from(figs, { autoAlpha: 0, y: 16, duration: 0.08, stagger: 0.05 }, 4.22);
    figs.forEach((f, k) => {
      const i = $('i', f);
      tl.to(i, { boxShadow: '0 0 0 2px #c6f23c, 0 0 16px rgba(198,242,60,.7)', duration: 0.04 }, 4.45 + k * 0.13);
      if (k < figs.length - 1) tl.to(i, { boxShadow: '0 0 0 1.5px rgba(255,255,255,.55), 0 10px 20px -8px rgba(0,0,0,.9)', duration: 0.04 }, 4.58 + k * 0.13);
    });
    // 06 · analyser et vendre
    tl.to([story, grade], { autoAlpha: 0, duration: 0.08 }, 5.0)
      .to(box, { scaleY: 0, duration: 0.12 }, 5.0)
      .to(cv, { scale: 1.06, xPercent: 0, duration: 0.3 }, 5.0)
      .to(ad, { autoAlpha: 1, duration: 0.1 }, 5.05)
      .to(hbc, { autoAlpha: 1, duration: 0.05 }, 5.08)
      .to(hbcI[0], { scaleX: 1, duration: 0.12, ease: 'none' }, 5.1)
      .to(hbcI[1], { scaleX: 1, duration: 0.2, ease: 'none' }, 5.22)
      .to(hbcI[2], { scaleX: 1, duration: 0.12, ease: 'none' }, 5.42)
      .fromTo(lab, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 5.18)
      .from($$('li', lab), { autoAlpha: 0, x: -12, duration: 0.06, stagger: 0.06 }, 5.24)
      .to(notif, { yPercent: 0, duration: 0.16, ease: 'back.out(1.7)' }, 5.62)
      .to({}, { duration: 0.24 }, 5.76);
  }

  /* -------- Programme : cartes qui s'empilent -------- */
  function programme() {
    const phs = $$('.ph');
    phs.forEach((ph, i) => {
      const inn = $('.ph-in', ph);
      gsap.from($('.ph-t', ph), { yPercent: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: ph, start: 'top 80%' } });
      gsap.from($$('.mod', ph), { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: $('.mods', ph), start: 'top 88%' } });
      $$('.mod-img img', ph).forEach((im) => gsap.fromTo(im, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }));
      const next = phs[i + 1];
      if (!next) return;
      const st = { trigger: next, start: 'top bottom', end: 'top 25%', scrub: true };
      gsap.to(inn, { scale: 0.9, transformOrigin: '50% 0%', ease: 'none', scrollTrigger: st });
      gsap.to($('.ph-shade', ph), { opacity: 0.7, ease: 'none', scrollTrigger: { ...st } });
    });
  }

  /* -------- Plateforme : le téléphone tourne, les écrans changent -------- */
  function platform() {
    const phone = $('#phone');
    const shots = $$('.ps-img', phone);
    const chips = $$('#orbit li');
    const long = $('.ps-long img', phone);
    let k0 = -1;
    const few = isSmall();
    const show = (k) => {
      if (k === k0) return;
      k0 = k;
      shots.forEach((s) => gsap.to(s, { autoAlpha: Number(s.dataset.k2) === k ? 1 : 0, duration: 0.45, overwrite: true }));
      chips.forEach((c) => {
        const on = Number(c.dataset.k2) === k;
        c.classList.toggle('is-on', on);
        if (few) gsap.to(c, { autoAlpha: on ? 1 : 0, scale: on ? 1 : 0.75, duration: 0.45, ease: on ? 'back.out(2)' : 'power2.in', overwrite: 'auto' });
      });
    };
    if (few) gsap.set(chips, { autoAlpha: 0, scale: 0.75 });
    gsap.set(shots, { autoAlpha: 0 });
    shots.forEach((s) => s.classList.remove('is-on'));
    show(0);
    gsap.set(phone, { rotationY: -26, rotationX: 10, transformPerspective: 1300 });
    const tl = gsap.timeline({
      onUpdate: () => show(Math.min(3, Math.floor(tl.progress() * 4))),
      scrollTrigger: { trigger: '#plat-track', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    });
    tl.to(phone, { rotationY: 18, rotationX: -4, ease: 'none', duration: 1 }, 0)
      .fromTo(long, { yPercent: 0 }, { yPercent: -36, ease: 'none', duration: 0.22 }, 0.77);
    chips.forEach((c, i) => tl.fromTo(c, { y: 50 + (i % 3) * 26 }, { y: -(30 + (i % 3) * 30), ease: 'none', duration: 1 }, 0));
    if (!few) gsap.from(chips, { autoAlpha: 0, scale: 0.6, duration: 0.7, stagger: 0.06, ease: 'back.out(2)', scrollTrigger: { trigger: '#plat-track', start: 'top 65%' } });
    chips.forEach((c, i) => gsap.to(c, { yPercent: i % 2 ? 18 : -18, duration: 2.2 + (i % 3) * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    gsap.from(phone, { autoAlpha: 0, scale: 0.85, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#plat-track', start: 'top 75%' } });
  }

  /* -------- La créative : bascule vers l'or -------- */
  function creative() {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.crea', start: 'top 75%', end: 'bottom 25%', scrub: true } });
    tl.to(H, { '--bgc': '#0e0a05', duration: 1, ease: 'none' }).to(H, { '--bgc': '#0e0a05', duration: 2, ease: 'none' }).to(H, { '--bgc': '#07060b', duration: 1, ease: 'none' });
    gsap.fromTo('.crea-img', { clipPath: 'inset(16% 14% 16% 14% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none', scrollTrigger: { trigger: '.crea-img', start: 'top 92%', end: 'top 40%', scrub: true } });
    gsap.fromTo('.crea-img img', { scale: 1.35 }, { scale: 1.04, ease: 'none', scrollTrigger: { trigger: '.crea-img', start: 'top bottom', end: 'bottom top', scrub: true } });
    const ct = gsap.timeline({ scrollTrigger: { trigger: '.crea-tl', start: 'top 92%', end: 'top 55%', scrub: 0.5 } });
    ct.to('.ct-h i', { scaleX: 1, ease: 'none', duration: 0.26 }).to('.ct-b i', { scaleX: 1, ease: 'none', duration: 0.48 }).to('.ct-c i', { scaleX: 1, ease: 'none', duration: 0.26 });
    ScrollTrigger.create({ trigger: '.crea-stats', start: 'top 88%', once: true, onEnter: () => countUp($$('.crea-stats [data-count]'), 1.2) });
  }

  /* -------- Sites & Apps : bascule vers la menthe, le site se construit au défilement -------- */
  function sitesApps() {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.sa', start: 'top 75%', end: 'bottom 25%', scrub: true } });
    tl.to(H, { '--bgc': '#03100d', duration: 1, ease: 'none' }).to(H, { '--bgc': '#03100d', duration: 2, ease: 'none' }).to(H, { '--bgc': '#07060b', duration: 1, ease: 'none' });
    mountSiteBuild($('#sa-sb'), { gsap, ScrollTrigger, trigger: '.sa-vis', start: 'top 60%', end: 'bottom bottom' });
    ScrollTrigger.create({ trigger: '.sa-stats', start: 'top 88%', once: true, onEnter: () => countUp($$('.sa-stats [data-count]'), 1.2) });
    gsap.from('.sa-mods li', { y: 18, autoAlpha: 0, scale: 0.92, duration: 0.6, stagger: 0.04, ease: 'back.out(2)', scrollTrigger: { trigger: '.sa-mods', start: 'top 88%' } });
  }

  /* -------- Tarifs -------- */
  function pricing() {
    // Les formules puis les formations montent en cascade ; le ticket a sa propre entrée (compose.js)
    gsap.from('#compose .cp-pre', { y: 50, autoAlpha: 0, rotationX: 18, transformPerspective: 900, duration: 0.9, stagger: 0.09, ease: 'expo.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '#compose', start: 'top 80%' } });
    gsap.from('#compose .cp-c', { x: isRTL ? 60 : -60, autoAlpha: 0, duration: 1, stagger: 0.1, ease: 'expo.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '#compose .cp-courses', start: 'top 85%' } });
    gsap.from('#compose .cp-k', { autoAlpha: 0, x: isRTL ? 24 : -24, duration: 0.8, stagger: 0.2, ease: 'power3.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '#compose', start: 'top 82%' } });
  }

  /* -------- Apparitions génériques : titres, textes, petites étiquettes -------- */
  function reveals() {
    $$('[data-split]').forEach((el) => {
      const grad = /text/.test(getComputedStyle(el).backgroundClip || getComputedStyle(el).webkitBackgroundClip || '');
      if (grad) {
        gsap.from(el, { yPercent: 30, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
        return;
      }
      const sp = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'sl' });
      gsap.from(sp.lines, { yPercent: 112, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 88%' }, onComplete: () => sp.revert() });
    });
    $$('[data-fade]').forEach((el) => gsap.from(el, { y: 28, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 97%' } }));
    $$('[data-scramble]').forEach((el) => {
      const text = el.textContent;
      el.style.minHeight = `${el.offsetHeight}px`;
      el.textContent = '';
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: () => gsap.to(el, { duration: 1.3, scrambleText: { text, chars: '01<>/#*+_%', revealDelay: 0.2, speed: 0.45 }, ease: 'none' }),
      });
    });
    gsap.from('.steps li', { x: -24, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
    gsap.from('.incall li', { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: '.incall', start: 'top 90%' } });
    gsap.from('.mq li', { autoAlpha: 0, duration: 1.2, stagger: 0.02, scrollTrigger: { trigger: '.tools', start: 'top 85%' } });
  }

  /* -------- Questions : ouverture en douceur -------- */
  function faq() {
    renderFaq(true);
    $('#qa').addEventListener('click', (e) => {
      const sum = e.target.closest('summary');
      if (!sum) return;
      const d = sum.parentNode;
      const body = $('.qa-a', d);
      e.preventDefault();
      if (d.open) {
        d.classList.add('closing');
        gsap.to(body, {
          height: 0,
          duration: 0.45,
          ease: 'power3.inOut',
          onComplete: () => {
            d.open = false;
            d.classList.remove('closing');
            gsap.set(body, { clearProps: 'height' });
            ScrollTrigger.refresh();
          },
        });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: 0.55, ease: 'power3.out', onComplete: () => (gsap.set(body, { clearProps: 'height' }), ScrollTrigger.refresh()) });
        gsap.from($$('p', body), { y: -8, autoAlpha: 0, duration: 0.5, ease: 'power2.out' });
      }
    });
  }

  /* -------- Final : les particules forment le monogramme -------- */
  function finale() {
    const lp = logoParticles($('#fin-cv'));
    ScrollTrigger.create({ trigger: '.fin', start: 'top 85%', end: 'top 12%', scrub: 1, onUpdate: (self) => (lp.state.p = self.progress) });
  }

  /* -------- Effets au pointeur (ordinateur seulement) -------- */
  function pointerFx() {
    if (!fine || CAP) return;
    $$('[data-magnet]').forEach((b) => {
      const xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.28);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      b.addEventListener('pointerleave', () => (xTo(0), yTo(0)));
    });
    $$('.spot').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
    $$('.card').forEach((c) => {
      const rx = gsap.quickTo(c, 'rotationX', { duration: 0.6, ease: 'power3' });
      const ry = gsap.quickTo(c, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(c, { transformPerspective: 1100 });
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 8);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
      });
      c.addEventListener('pointerleave', () => (rx(0), ry(0)));
    });
    // Le générateur s'incline légèrement vers le pointeur
    const gen = $('.gen-in');
    const gx = gsap.quickTo(gen, 'rotationY', { duration: 0.8, ease: 'power3' });
    const gy = gsap.quickTo(gen, 'rotationX', { duration: 0.8, ease: 'power3' });
    addEventListener('pointermove', (e) => {
      const r = gen.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      gx(((e.clientX - (r.left + r.width / 2)) / innerWidth) * 10);
      gy(-((e.clientY - (r.top + r.height / 2)) / innerHeight) * 8);
    }, { passive: true });
  }
}
