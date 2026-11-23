// « Le site se construit au défilement » : l'animation de la Formation Sites & Apps (landing et /ia/).
// Cinq étapes, comme la méthode de la formation : décrire (le prompt), coder, vérifier, mobile, en ligne.
// La progression vient du défilement (ScrollTrigger) ; chaque étape change d'un coup (pas de fondu).
// Décoratif (aria-hidden) : en « mouvement réduit » ou sans GSAP, l'étape finale s'affiche, complète.
import { add, t, lang } from './i18n.js';

add({
  fr: {
    'sb.cap1': 'Tu décris ce que tu veux',
    'sb.cap2': 'L’IA écrit le code',
    'sb.cap3': 'Tu vérifies le rendu',
    'sb.cap4': 'Parfait sur téléphone',
    'sb.cap5': 'En ligne : rapide et sécurisé',
    'sb.st': 'Décrire|Coder|Vérifier|Mobile|En ligne',
    'sb.prompt': 'Crée le site de ma boutique : mobile d’abord, bouton WhatsApp, rapide (Lighthouse 90+).',
    'sb.done': '3 fichiers créés',
    'sb.brand': 'Ta boutique',
    'sb.h': 'Ta boutique, en ligne.',
    'sb.p': 'Commande en ligne, réponse sur WhatsApp.',
    'sb.btn': 'Commander sur WhatsApp',
    'sb.live': 'En ligne',
    'sb.lh': 'Perf.|Accès.|Pratiques|SEO',
    'sb.ex': 'Exemple',
  },
  en: {
    'sb.cap1': 'You describe what you want',
    'sb.cap2': 'AI writes the code',
    'sb.cap3': 'You check the result',
    'sb.cap4': 'Perfect on a phone',
    'sb.cap5': 'Live: fast and secure',
    'sb.st': 'Describe|Code|Check|Mobile|Live',
    'sb.prompt': 'Build my shop’s website: mobile first, WhatsApp button, fast (Lighthouse 90+).',
    'sb.done': '3 files created',
    'sb.brand': 'Your shop',
    'sb.h': 'Your shop, online.',
    'sb.p': 'Order online, get a reply on WhatsApp.',
    'sb.btn': 'Order on WhatsApp',
    'sb.live': 'Live',
    'sb.lh': 'Perf.|Access.|Practices|SEO',
    'sb.ex': 'Example',
  },
  ar: {
    'sb.cap1': 'تصف ما تريد',
    'sb.cap2': 'الذكاء الاصطناعي يكتب الكود',
    'sb.cap3': 'تتحقق من النتيجة',
    'sb.cap4': 'مثالي على الهاتف',
    'sb.cap5': 'على الإنترنت: سريع وآمن',
    'sb.st': 'صِف|برمج|تحقّق|الهاتف|على الإنترنت',
    'sb.prompt': 'أنشئ موقع متجري: الهاتف أولًا، زر واتساب، وسرعة عالية في Lighthouse.',
    'sb.done': 'تم إنشاء 3 ملفات',
    'sb.brand': 'متجرك',
    'sb.h': 'متجرك على الإنترنت.',
    'sb.p': 'اطلب على الإنترنت، والرد على واتساب.',
    'sb.btn': 'اطلب عبر واتساب',
    'sb.live': 'على الإنترنت',
    'sb.lh': 'الأداء|الوصول|الممارسات|SEO',
    'sb.ex': 'مثال',
  },
});

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const N = 5; // étapes

/** Les lignes de code (toujours de gauche à droite) : [classe, texte] par morceau. */
function codeLines() {
  const tag = (s) => ['t', s];
  const at = (s) => ['a', s];
  const str = (s) => ['s', s];
  const tx = (s) => ['x', s];
  return [
    [tag('<!doctype html>')],
    [tag('<html '), at('lang'), tag('='), str(`"${lang}"`), tag('>')],
    [tag('<meta '), at('name'), tag('='), str('"viewport"'), tag(' '), at('content'), tag('='), str('"width=device-width"'), tag('>')],
    [tag('<header '), at('class'), tag('='), str('"nav"'), tag('>')],
    [tx('  '), tag('<a '), at('class'), tag('='), str('"logo"'), tag('>'), tx(t('sb.brand')), tag('</a>')],
    [tag('</header>')],
    [tag('<section '), at('class'), tag('='), str('"hero"'), tag('>')],
    [tx('  '), tag('<h1>'), tx(t('sb.h')), tag('</h1>')],
    [tx('  '), tag('<a '), at('class'), tag('='), str('"btn"'), tag(' '), at('href'), tag('='), str('"https://wa.me/213…"'), tag('>')],
    [tx('    '), tx(t('sb.btn')), tag('</a>')],
    [tag('</section>')],
    [tag('<ul '), at('class'), tag('='), str('"produits"'), tag('>'), tx('…'), tag('</ul>')],
  ];
}

function markup() {
  const st = t('sb.st').split('|');
  const lh = t('sb.lh').split('|');
  const lines = codeLines()
    .map((l) => `<li>${l.map(([c, s]) => `<span class="sb-${c}">${esc(s)}</span>`).join('')}</li>`)
    .join('');
  const ring = '<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5"/><circle class="sb-rv" cx="18" cy="18" r="15.5" pathLength="100"/></svg>';
  return `<div class="sb-pin">
  <p class="sb-cap"><b class="sb-n">01</b><span class="sb-of">/0${N}</span><span class="sb-cap-t"></span></p>
  <div class="sb-stage">
    <div class="sb-win">
      <div class="sb-bar"><i></i><i></i><i></i><span class="sb-url" dir="ltr"><svg class="sb-lock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none"/></svg><span class="sb-url-t">localhost:8000</span></span></div>
      <div class="sb-body">
        <div class="sb-term">
          <p class="sb-th"><span class="sb-star">✻</span> Claude Code <span class="sb-path" dir="ltr">~/ta-boutique</span></p>
          <p class="sb-prompt"><span class="sb-ps">›</span><span class="sb-typed" dir="auto"></span><i class="sb-caret"></i></p>
          <ol class="sb-code" dir="ltr">${lines}</ol>
          <p class="sb-done"><span class="sb-ok">✓</span> ${esc(t('sb.done'))} <span dir="ltr">index.html · style.css · app.js</span></p>
        </div>
        <div class="sb-site">
          <div class="sb-nav sb-blk"><b>${esc(t('sb.brand'))}</b><span class="sb-links"><i></i><i></i><i></i></span><span class="sb-burger"><i></i><i></i></span></div>
          <div class="sb-hero sb-blk"><p class="sb-h">${esc(t('sb.h'))}</p><p class="sb-p">${esc(t('sb.p'))}</p><span class="sb-btn">${esc(t('sb.btn'))}</span></div>
          <div class="sb-img sb-blk"><i></i><i></i><i></i></div>
          <ul class="sb-cards sb-blk"><li><i></i><b></b><b></b></li><li><i></i><b></b><b></b></li><li><i></i><b></b><b></b></li></ul>
          <span class="sb-ex">${esc(t('sb.ex'))}</span>
        </div>
      </div>
    </div>
    <p class="sb-stamp">${esc(t('sb.live'))} <span>✓</span></p>
  </div>
  <ul class="sb-lh">${lh.map((x) => `<li>${ring}<b>100</b><small>${esc(x)}</small></li>`).join('')}</ul>
  <ol class="sb-steps">${st.map((x, i) => `<li><span>0${i + 1}</span>${esc(x)}</li>`).join('')}</ol>
</div>`;
}

/**
 * Monte l'animation dans `root` et la relie au défilement.
 * @param {HTMLElement} root
 * @param {{ gsap?: any, ScrollTrigger?: any, reduce?: boolean, trigger?: Element, start?: string, end?: string, cut?: boolean }} o
 *   cut : transitions en sauts (landing « Coupe franche ») plutôt qu'en douceur (/ia/).
 */
export function mountSiteBuild(root, o = {}) {
  root.classList.add('sb');
  root.classList.toggle('sb--cut', !!o.cut);
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = markup();
  const $ = (s) => root.querySelector(s);
  const typed = $('.sb-typed');
  const lines = [...root.querySelectorAll('.sb-code li')];
  const blks = [...root.querySelectorAll('.sb-blk')];
  const steps = [...root.querySelectorAll('.sb-steps li')];
  const caps = [1, 2, 3, 4, 5].map((i) => t(`sb.cap${i}`));
  const prompt = t('sb.prompt');
  const urlT = $('.sb-url-t');
  const last = { s: -1, c: -1, l: -1, b: -1, r: -1 };

  // p : 0 → 1 sur toute la hauteur du déclencheur
  const set = (p) => {
    const x = Math.min(N - 1e-6, Math.max(0, p) * N);
    const s = Math.floor(x);
    const k = x - s; // avancée dans l'étape
    if (s !== last.s) {
      last.s = s;
      root.dataset.s = String(s);
      $('.sb-n').textContent = `0${s + 1}`;
      $('.sb-cap-t').textContent = caps[s];
      steps.forEach((li, i) => (li.className = i < s ? 'is-done' : i === s ? 'is-cur' : ''));
      root.classList.toggle('is-phone', s >= 3);
      urlT.textContent = s >= 4 ? 'ta-boutique.dz' : 'localhost:8000';
    }
    // 01 · le prompt se tape (fini un peu avant la fin de l'étape)
    const c = s === 0 ? Math.ceil(Math.min(1, k * 1.25) * prompt.length) : prompt.length;
    if (c !== last.c) {
      last.c = c;
      typed.textContent = prompt.slice(0, c);
    }
    // 02 · les lignes de code arrivent une à une
    const l = s < 1 ? 0 : s > 1 ? lines.length + 1 : Math.floor(Math.min(1, k * 1.2) * (lines.length + 1));
    if (l !== last.l) {
      last.l = l;
      lines.forEach((li, i) => li.classList.toggle('is-on', i < l));
      root.classList.toggle('is-coded', l > lines.length);
    }
    // 03 · la page apparaît bloc par bloc
    const b = s < 2 ? 0 : s > 2 ? blks.length : Math.ceil(Math.min(1, k * 1.35) * blks.length);
    if (b !== last.b) {
      last.b = b;
      blks.forEach((el, i) => el.classList.toggle('is-on', i < b));
    }
    // 05 · les scores se remplissent
    const r = s < 4 ? 0 : Math.round(Math.min(1, k * 1.6) * 20) / 20;
    if (r !== last.r) {
      last.r = r;
      root.style.setProperty('--sb-r', String(r));
    }
  };

  const { gsap, ScrollTrigger, reduce } = o;
  if (!gsap || !ScrollTrigger || reduce) {
    set(1);
    return { set };
  }
  set(0);
  ScrollTrigger.create({
    trigger: o.trigger || root,
    start: o.start || 'top 65%',
    end: o.end || 'bottom 75%',
    onUpdate: (st) => set(st.progress),
    onRefresh: (st) => set(st.progress),
  });
  return { set };
}
