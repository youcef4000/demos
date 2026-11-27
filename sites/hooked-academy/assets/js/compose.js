// Hooked Academy — « Compose ta formule » : la section prix de la landing (thème « cut ») et de /ia/ (thème « glass »).
//
// L'élève coche les formations qui l'intéressent ; le ticket calcule tout seul la meilleure formule (data/offres.js) :
// une formation → son prix ; Créative + IA → le pack Créative + IA ; Sites & Apps avec une autre formation → le pack
// complet, qui coûte autant ou moins que la sélection et ajoute la formation manquante.
//
// Leviers de décision, tous honnêtes (aucun faux avis, faux chiffre ni faux compte à rebours) ;
// sources et choix détaillés : formations/tarifs/README.md.
// - Option par défaut : les trois formations sont cochées au départ (pack complet) ; on décoche librement.
// - « Je l'ai composé moi-même » (Franke, Schreier et Kaiser, 2010) : l'élève construit sa formule.
// - Prix de référence réel : la somme des formations vendues séparément, barrée, puis la remise du pack.
// - Prix ramené à la leçon et au jour (Gourville, 1998).
// - Moins de douleur de payer : « À payer aujourd'hui : 0 DA », paiement à la livraison, après l'appel.
// - Progression : l'étape 1 sur 3 est cochée dès qu'une formule est choisie (Nunes et Drèze, 2006).
// - Suggestion du pack qui ajoute le plus pour le moins, avec le vrai calcul.
// Mouvement : un retour visuel à chaque choix (chiffres qui basculent, lignes imprimées, tampon) ; rien ne bouge
// en « mouvement réduit ».
import { add, t, lang } from './i18n.js';

add({
  fr: {
    'cp.k1': 'Choisis une formule',
    'cp.k2': '… ou compose la tienne',
    'cp.presets': 'Formules',
    'cp.courses': 'Formations à cocher',
    'cp.best': 'Meilleure offre',
    'cp.p.one': 'Une formation',
    'cp.from': 'dès {p}',
    'cp.cur': 'DA',
    'cp.and': ' et ',
    'cp.n.creative': 'Formation Créative',
    'cp.n.ia': 'Formation IA',
    'cp.n.dev': 'Formation Sites & Apps',
    'cp.x.creative': 'la Créative',
    'cp.x.ia': 'l’IA',
    'cp.x.dev': 'Sites & Apps',
    'cp.g.creative': 'Faire des pubs qui vendent, avec ton téléphone.',
    'cp.g.ia': 'Produire images, vidéos et UGC avec l’IA, puis les vendre.',
    'cp.g.dev': 'Créer, sécuriser et vendre des sites et des applications.',
    'cp.meta': '{n} leçons · {m} modules',
    'cp.s.in': 'Incluse',
    'cp.s.out': 'Ajouter',
    'cp.s.gift': 'Offerte',
    'cp.o.creative': 'Formation Créative',
    'cp.o.ia': 'Formation IA',
    'cp.o.dev': 'Formation Sites & Apps',
    'cp.o.both': 'Pack Créative + IA',
    'cp.o.all': 'Pack complet',
    'cp.r.k': 'Ton ticket',
    'cp.r.empty': 'Coche au moins une formation : ton prix s’affiche ici.',
    'cp.r.gift': 'offerte',
    'cp.r.sep': 'Prix séparé',
    'cp.r.disc': 'Remise pack',
    'cp.r.total': 'Total · accès 1 an',
    'cp.r.per': 'soit {l} la leçon · {d} par jour sur un an',
    'cp.r.today': 'À payer aujourd’hui',
    'cp.r.after': 'Tu règles après l’appel de l’équipe : paiement à la livraison.',
    'cp.u.both': 'Ajoute {x} pour {p} de plus : c’est le pack Créative + IA, et tu économises {s}.',
    'cp.u.all': 'Ajoute {x} pour {p} de plus : c’est le pack complet, et tu économises {s}.',
    'cp.u.dev': 'Ajoute Sites & Apps pour {p} de plus au lieu de {q} : c’est le pack complet.',
    'cp.u.add': 'Ajouter {x}',
    'cp.u.same': 'Bonne nouvelle : au même prix, le pack complet ajoute {x}.',
    'cp.u.less': 'Le pack complet coûte {p} de moins et ajoute {x}.',
    'cp.u.more': 'Le pack complet ajoute {x} pour {p} de plus.',
    'cp.u.best': 'Tu as la meilleure offre : {s} d’économie et les trois certificats.',
    'cp.go.pack': 'Réserver ce pack',
    'cp.go.one': 'Réserver cette formation',
    'cp.go.none': 'Choisis une formation',
    'cp.go.sub': '{z} maintenant · l’équipe te répond sur WhatsApp',
    'cp.st1': 'Formule',
    'cp.st2': 'Coordonnées · 30 s',
    'cp.st3': 'Appel de l’équipe',
    'cp.cohort': 'Inscriptions ouvertes · {c}',
    'cp.next': 'Prochaine session',
    'cp.sr': '{o} : {p}.',
    'cp.sr.save': '{o} : {p}, tu économises {s}.',
    'cp.t1': '0 DA à payer en ligne',
    'cp.t2': 'L’équipe t’appelle d’abord',
    'cp.t3': 'Paiement à la livraison',
    'cp.t4': 'Accès 1 an, ouvert dès la validation',
    'cp.t5': 'Leçons de 2 minutes, en darija',
    'cp.t6': 'Un certificat par formation',
  },
  en: {
    'cp.k1': 'Pick a plan',
    'cp.k2': '… or build your own',
    'cp.presets': 'Plans',
    'cp.courses': 'Courses to tick',
    'cp.best': 'Best value',
    'cp.p.one': 'One course',
    'cp.from': 'from {p}',
    'cp.cur': 'DZD',
    'cp.and': ' and ',
    'cp.n.creative': 'Creative Course',
    'cp.n.ia': 'AI Course',
    'cp.n.dev': 'Sites & Apps Course',
    'cp.x.creative': 'Creative',
    'cp.x.ia': 'AI',
    'cp.x.dev': 'Sites & Apps',
    'cp.g.creative': 'Make ads that sell, with your phone.',
    'cp.g.ia': 'Produce images, videos and UGC with AI, then sell them.',
    'cp.g.dev': 'Build, secure and sell websites and apps.',
    'cp.meta': '{n} lessons · {m} modules',
    'cp.s.in': 'Included',
    'cp.s.out': 'Add',
    'cp.s.gift': 'Free',
    'cp.o.creative': 'Creative Course',
    'cp.o.ia': 'AI Course',
    'cp.o.dev': 'Sites & Apps Course',
    'cp.o.both': 'Creative + AI Pack',
    'cp.o.all': 'Complete Pack',
    'cp.r.k': 'Your ticket',
    'cp.r.empty': 'Tick at least one course: your price shows up here.',
    'cp.r.gift': 'free',
    'cp.r.sep': 'Bought separately',
    'cp.r.disc': 'Pack discount',
    'cp.r.total': 'Total · 1-year access',
    'cp.r.per': 'that’s {l} per lesson · {d} a day over a year',
    'cp.r.today': 'To pay today',
    'cp.r.after': 'You pay after the team’s call: cash on delivery.',
    'cp.u.both': 'Add {x} for {p} more: that’s the Creative + AI Pack, and you save {s}.',
    'cp.u.all': 'Add {x} for {p} more: that’s the Complete Pack, and you save {s}.',
    'cp.u.dev': 'Add Sites & Apps for {p} more instead of {q}: that’s the Complete Pack.',
    'cp.u.add': 'Add {x}',
    'cp.u.same': 'Good news: for the same price, the Complete Pack adds {x}.',
    'cp.u.less': 'The Complete Pack costs {p} less and adds {x}.',
    'cp.u.more': 'The Complete Pack adds {x} for {p} more.',
    'cp.u.best': 'You have the best value: {s} saved and all three certificates.',
    'cp.go.pack': 'Book this pack',
    'cp.go.one': 'Book this course',
    'cp.go.none': 'Pick a course',
    'cp.go.sub': '{z} now · the team replies on WhatsApp',
    'cp.st1': 'Plan',
    'cp.st2': 'Your details · 30 s',
    'cp.st3': 'Team call',
    'cp.cohort': 'Sign-ups open · {c}',
    'cp.next': 'Next session',
    'cp.sr': '{o}: {p}.',
    'cp.sr.save': '{o}: {p}, you save {s}.',
    'cp.t1': '0 DZD to pay online',
    'cp.t2': 'The team calls you first',
    'cp.t3': 'Cash on delivery',
    'cp.t4': '1-year access, open as soon as it’s approved',
    'cp.t5': '2-minute lessons, in Darija',
    'cp.t6': 'A certificate for each course',
  },
  ar: {
    'cp.k1': 'اختر صيغة',
    'cp.k2': '… أو كوّن صيغتك',
    'cp.presets': 'الصيغ',
    'cp.courses': 'تكوينات للاختيار',
    'cp.best': 'أفضل عرض',
    'cp.p.one': 'تكوين واحد',
    'cp.from': 'ابتداءً من {p}',
    'cp.cur': 'دج',
    'cp.and': ' و',
    'cp.n.creative': 'تكوين الكرياتيف',
    'cp.n.ia': 'تكوين الذكاء الاصطناعي',
    'cp.n.dev': 'تكوين المواقع والتطبيقات',
    'cp.x.creative': 'الكرياتيف',
    'cp.x.ia': 'الذكاء الاصطناعي',
    'cp.x.dev': 'المواقع والتطبيقات',
    'cp.g.creative': 'اصنع إعلانات تبيع، بهاتفك.',
    'cp.g.ia': 'أنتج الصور والفيديوهات وUGC بالذكاء الاصطناعي، ثم بِعها.',
    'cp.g.dev': 'اصنع المواقع والتطبيقات واحمها وبِعها.',
    'cp.meta': '{n} درسًا · {m} وحدة',
    'cp.s.in': 'مُضمَّن',
    'cp.s.out': 'أضف',
    'cp.s.gift': 'مجانًا',
    'cp.o.creative': 'تكوين الكرياتيف',
    'cp.o.ia': 'تكوين الذكاء الاصطناعي',
    'cp.o.dev': 'تكوين المواقع والتطبيقات',
    'cp.o.both': 'باقة الكرياتيف + الذكاء الاصطناعي',
    'cp.o.all': 'الباقة الكاملة',
    'cp.r.k': 'تذكرتك',
    'cp.r.empty': 'اختر تكوينًا واحدًا على الأقل: يظهر سعرك هنا.',
    'cp.r.gift': 'مجانًا',
    'cp.r.sep': 'السعر منفصلًا',
    'cp.r.disc': 'تخفيض الباقة',
    'cp.r.total': 'المجموع · وصول لمدة سنة',
    'cp.r.per': 'أي {l} للدرس · {d} في اليوم على مدى سنة',
    'cp.r.today': 'للدفع اليوم',
    'cp.r.after': 'تدفع بعد مكالمة الفريق: الدفع عند الاستلام.',
    'cp.u.both': 'أضف {x} مقابل {p} إضافية: إنها باقة الكرياتيف + الذكاء الاصطناعي، وتوفّر {s}.',
    'cp.u.all': 'أضف {x} مقابل {p} إضافية: إنها الباقة الكاملة، وتوفّر {s}.',
    'cp.u.dev': 'أضف المواقع والتطبيقات مقابل {p} إضافية بدل {q}: إنها الباقة الكاملة.',
    'cp.u.add': 'أضف {x}',
    'cp.u.same': 'خبر سار: بالسعر نفسه، تضيف الباقة الكاملة {x}.',
    'cp.u.less': 'الباقة الكاملة أرخص بـ{p} وتضيف {x}.',
    'cp.u.more': 'الباقة الكاملة تضيف {x} مقابل {p} إضافية.',
    'cp.u.best': 'لديك أفضل عرض: توفّر {s} والشهادات الثلاث.',
    'cp.go.pack': 'احجز هذه الباقة',
    'cp.go.one': 'احجز هذا التكوين',
    'cp.go.none': 'اختر تكوينًا',
    'cp.go.sub': '{z} الآن · يردّ عليك الفريق عبر واتساب',
    'cp.st1': 'الصيغة',
    'cp.st2': 'بياناتك · 30 ث',
    'cp.st3': 'مكالمة الفريق',
    'cp.cohort': 'التسجيل مفتوح · {c}',
    'cp.next': 'الدورة القادمة',
    'cp.sr': '{o}: {p}.',
    'cp.sr.save': '{o}: {p}، وتوفّر {s}.',
    'cp.t1': '0 دج للدفع على الإنترنت',
    'cp.t2': 'الفريق يتصل بك أولًا',
    'cp.t3': 'الدفع عند الاستلام',
    'cp.t4': 'وصول لمدة سنة، يُفتح فور المصادقة',
    'cp.t5': 'دروس من دقيقتين، بالدارجة',
    'cp.t6': 'شهادة لكل تكوين',
  },
});

export const COURSES = ['creative', 'ia', 'dev'];
const PACK = { both: ['creative', 'ia'], all: COURSES };

/** La meilleure formule pour une sélection de formations ; null si rien n'est coché. */
export function bestOffer(sel, P) {
  const s = COURSES.filter((c) => sel.has(c));
  if (!s.length) return null;
  const id = s.length === 1 ? s[0] : s.includes('dev') ? 'all' : 'both';
  const inc = PACK[id] || [id];
  const sum = inc.reduce((a, c) => a + P[c], 0); // les formations incluses, vendues séparément
  const price = P[id];
  const chosen = s.reduce((a, c) => a + P[c], 0); // ce qui est coché, vendu séparément
  const save = Math.max(0, sum - price);
  return { id, inc, gifts: inc.filter((c) => !sel.has(c)), sum, price, save, pct: sum ? Math.round((save / sum) * 100) : 0, delta: price - chosen };
}

/** La formule au-dessus : ce qu'elle ajoute, pour combien de plus, et ce qu'elle fait économiser. */
export function nextOffer(o, P) {
  if (!o || o.id === 'all') return null;
  const to = o.id === 'creative' || o.id === 'ia' ? 'both' : 'all';
  const inc = PACK[to];
  const more = P[to] - o.price;
  const sum = inc.reduce((a, c) => a + P[c], 0);
  if (!(more > 0) || !(sum > P[to])) return null;
  const adds = inc.filter((c) => !o.inc.includes(c));
  return { to, adds, more, save: sum - P[to], alone: adds.reduce((a, c) => a + P[c], 0) };
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmt = (n) => new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'fr-FR').format(n);
// Typographie française : espace insécable avant « : ; ! ? »
const typo = (s) => (lang === 'fr' ? String(s).replace(/ ([:;!?»])/g, ' $1') : s);
const tt = (k, v) => typo(t(k, v));

/**
 * Monte le configurateur dans `root` (son contenu de secours, sans JavaScript, est remplacé).
 * @param {HTMLElement} root
 * @param {{ theme: 'cut' | 'glass', prices: Record<string, number>, lessons: Record<string, number>, mods: Record<string, number>,
 *   initial?: string[], one?: string, cohort?: string, onPick?: (id: string) => void }} o
 */
export function mountCompose(root, o) {
  const P = o.prices;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = (n) => `${fmt(n)} ${t('cp.cur')}`;
  const names = (list) => {
    const x = list.map((c) => t(`cp.x.${c}`));
    return x.length < 2 ? x.join('') : `${x.slice(0, -1).join(', ')}${t('cp.and')}${x[x.length - 1]}`;
  };
  let sel = new Set(o.initial || COURSES);
  let last = null; // l'offre affichée avant le dernier choix
  const minSolo = Math.min(...COURSES.map((c) => P[c]));
  const cohort = o.cohort && o.cohort.trim() === 'Prochaine session' ? t('cp.next') : (o.cohort || '').trim();
  const now = new Date();
  const two = (n) => String(n).padStart(2, '0');
  const date = `${two(now.getDate())}/${two(now.getMonth() + 1)}/${now.getFullYear()}`;
  const trust = ['cp.t1', 'cp.t2', 'cp.t3', 'cp.t4', 'cp.t5', 'cp.t6'].map((k) => tt(k));

  root.classList.add('cp');
  root.dataset.theme = o.theme;
  root.innerHTML = `<div class="cp-in">
  <div class="cp-side">
    <p class="cp-k"><span>1</span>${esc(tt('cp.k1'))}</p>
    <div class="cp-presets" role="group" aria-label="${esc(t('cp.presets'))}">
      <button type="button" class="cp-pre is-best" data-set="all"><i>${esc(t('cp.best'))}</i><b>${esc(t('cp.o.all'))}</b><small>${esc(money(P.all))}</small></button>
      <button type="button" class="cp-pre" data-set="both"><b>${esc(t('cp.o.both'))}</b><small>${esc(money(P.both))}</small></button>
      <button type="button" class="cp-pre" data-set="one"><b>${esc(t('cp.p.one'))}</b><small>${esc(t('cp.from', { p: money(minSolo) }))}</small></button>
    </div>
    <p class="cp-k"><span>2</span>${esc(tt('cp.k2'))}</p>
    <div class="cp-courses" role="group" aria-label="${esc(t('cp.courses'))}">
      ${COURSES.map(
        (c) => `<button type="button" class="cp-c" data-t="${c}" aria-pressed="false">
        <span class="cp-c-band" aria-hidden="true"><i></i></span>
        <span class="cp-c-txt"><b class="cp-c-name">${esc(t(`cp.n.${c}`))}</b><span class="cp-c-goal">${esc(tt(`cp.g.${c}`))}</span><span class="cp-c-meta">${esc(t('cp.meta', { n: o.lessons[c], m: o.mods[c] }))}</span></span>
        <span class="cp-c-end"><span class="cp-c-price">${esc(money(P[c]))}</span><span class="cp-c-state"></span></span>
      </button>`,
      ).join('')}
    </div>
  </div>
  <div class="cp-receipt">
    <div class="cp-slot" aria-hidden="true"><i></i></div>
    <div class="cp-paper">
      <p class="cp-r-head"><span>${esc(t('cp.r.k'))}</span><span dir="ltr">${esc(date)}</span></p>
      <p class="cp-r-name"></p>
      <ul class="cp-lines"></ul>
      <p class="cp-row cp-sep"><span>${esc(t('cp.r.sep'))}</span><s></s></p>
      <p class="cp-row cp-disc"><span>${esc(t('cp.r.disc'))}</span><b></b></p>
      <div class="cp-total">
        <span class="cp-total-k">${esc(t('cp.r.total'))}</span>
        <span class="cp-amt"><span class="cp-digits" aria-hidden="true"></span><span class="cp-cur">${esc(t('cp.cur'))}</span></span>
        <span class="cp-stamp" aria-hidden="true"></span>
      </div>
      <p class="cp-per"></p>
      <p class="cp-today"><span>${esc(tt('cp.r.today'))}</span><b>${esc(money(0))}</b></p>
      <p class="cp-after">${esc(tt('cp.r.after'))}</p>
      <div class="cp-nudge" hidden><p></p><button type="button"></button></div>
      <a class="cp-go" href="#inscription"><span></span><i aria-hidden="true">→</i></a>
      <p class="cp-go-sub">${esc(tt('cp.go.sub', { z: money(0) }))}</p>
      <ol class="cp-steps"><li class="is-done"><i>✓</i>${esc(t('cp.st1'))}</li><li><i>2</i>${esc(t('cp.st2'))}</li><li><i>3</i>${esc(t('cp.st3'))}</li></ol>
      ${cohort ? `<p class="cp-cohort"><i aria-hidden="true"></i>${esc(t('cp.cohort', { c: cohort }))}</p>` : ''}
      <p class="cp-sr" aria-live="polite"></p>
    </div>
  </div>
</div>
<div class="cp-trust"><ul class="cp-trust-in">${[...trust, ...trust].map((x, i) => `<li${i >= trust.length ? ' aria-hidden="true"' : ''}>${esc(x)}</li>`).join('')}</ul></div>`;

  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const cards = $$('.cp-c');
  const presets = $$('.cp-pre');
  const digits = $('.cp-digits');
  const stamp = $('.cp-stamp');
  const nudge = $('.cp-nudge');
  const go = $('.cp-go');

  // Le prix en grand : un chiffre par case ; les cases qui changent basculent
  const flip = (cell, i) => {
    cell.classList.remove('is-flip');
    void cell.offsetWidth;
    cell.style.setProperty('--k', i);
    cell.classList.add('is-flip');
  };
  const setDigits = (n, animate) => {
    const str = fmt(n);
    const old = digits.dataset.v || '';
    digits.dataset.v = str;
    const same = old.length === str.length;
    if (!animate || reduce || !same) {
      digits.innerHTML = [...str].map((ch) => `<span class="cp-d${/\d/.test(ch) ? '' : ' cp-d--sep'}">${ch}</span>`).join('');
      // nouvelle longueur : toutes les cases basculent
      if (animate && !reduce) [...digits.children].forEach((cell, i) => /\d/.test(str[i]) && flip(cell, i));
      return;
    }
    [...str].forEach((ch, i) => {
      if (old[i] === ch) return;
      const cell = digits.children[i];
      cell.textContent = ch;
      flip(cell, i);
    });
  };
  const pulse = (el, cls) => {
    if (reduce || !el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  };
  // Petits confettis (thème « glass ») quand l'élève arrive au pack complet
  const confetti = () => {
    if (reduce || o.theme !== 'glass') return;
    const box = $('.cp-total');
    const colors = ['#c6f23c', '#9b7bff', '#5fd3b3', '#e0be55', '#5ee7ff'];
    for (let i = 0; i < 18; i++) {
      const c = document.createElement('i');
      c.className = 'cp-conf';
      const a = (Math.PI * 2 * i) / 18 + Math.random() * 0.4;
      const r = 70 + Math.random() * 90;
      c.style.setProperty('--x', `${Math.cos(a) * r}px`);
      c.style.setProperty('--y', `${Math.sin(a) * r - 40}px`);
      c.style.setProperty('--r', `${Math.round(Math.random() * 540 - 270)}deg`);
      c.style.setProperty('--k', colors[i % colors.length]);
      box.appendChild(c);
      setTimeout(() => c.remove(), 1100);
    }
  };

  function render(user) {
    const off = bestOffer(sel, P);
    for (const b of cards) {
      const c = b.dataset.t;
      const st = sel.has(c) ? 'in' : off && off.gifts.includes(c) ? 'gift' : 'out';
      b.dataset.state = st;
      b.setAttribute('aria-pressed', String(sel.has(c)));
      b.querySelector('.cp-c-state').textContent = t(`cp.s.${st}`);
    }
    presets.forEach((p) => p.classList.toggle('is-on', !!off && (p.dataset.set === off.id || (p.dataset.set === 'one' && COURSES.includes(off.id)))));
    root.dataset.offre = off ? off.id : 'none';
    go.setAttribute('aria-disabled', String(!off));
    go.dataset.pick = off ? off.id : '';
    go.querySelector('span').textContent = t(!off ? 'cp.go.none' : PACK[off.id] ? 'cp.go.pack' : 'cp.go.one');
    if (!off) {
      $('.cp-r-name').textContent = tt('cp.r.empty');
      $('.cp-lines').innerHTML = '';
      setDigits(0, user);
      stamp.classList.remove('is-on');
      nudge.hidden = true;
      nudge.querySelector('p').textContent = '';
      $('.cp-per').textContent = '';
      $('.cp-sr').textContent = tt('cp.r.empty');
      last = null;
      return;
    }
    const before = new Set(last ? last.inc : []);
    $('.cp-r-name').textContent = t(`cp.o.${off.id}`);
    $('.cp-lines').innerHTML = off.inc
      .map((c, i) => {
        const gift = off.gifts.includes(c);
        const fresh = user && !before.has(c) ? ' is-new' : '';
        return `<li class="${gift ? 'is-gift' : ''}${fresh}" style="--i:${i}"><span>${esc(t(`cp.n.${c}`))}</span><i></i>${gift ? `<s>${esc(money(P[c]))}</s><b>${esc(t('cp.r.gift'))}</b>` : `<b>${esc(money(P[c]))}</b>`}</li>`;
      })
      .join('');
    $('.cp-sep').hidden = off.inc.length < 2;
    $('.cp-sep s').textContent = money(off.sum);
    $('.cp-disc').hidden = !(off.save > 0);
    $('.cp-disc b').textContent = `−${money(off.save)}`;
    setDigits(off.price, user);
    const pct = off.save > 0 ? `−${off.pct} %` : '';
    if (stamp.textContent !== pct || !stamp.classList.contains('is-on')) {
      stamp.textContent = pct;
      stamp.classList.toggle('is-on', !!pct);
      if (pct && user) pulse(stamp, 'is-slam');
    }
    const lessons = off.inc.reduce((a, c) => a + o.lessons[c], 0);
    $('.cp-per').textContent = tt('cp.r.per', { l: money(Math.round(off.price / lessons)), d: money(Math.round(off.price / 365)) });

    // Le conseil : la formation offerte par le pack, sinon le pack au-dessus, sinon « meilleure offre »
    const nx = nextOffer(off, P);
    const btn = nudge.querySelector('button');
    let msg = '';
    let good = false;
    btn.hidden = true;
    if (off.gifts.length) {
      const x = names(off.gifts);
      msg = off.delta < 0 ? tt('cp.u.less', { p: money(-off.delta), x }) : off.delta === 0 ? tt('cp.u.same', { x }) : tt('cp.u.more', { p: money(off.delta), x });
      good = off.delta <= 0;
    } else if (nx) {
      const x = names(nx.adds);
      msg = off.id === 'both' ? tt('cp.u.dev', { p: money(nx.more), q: money(nx.alone) }) : tt(`cp.u.${nx.to}`, { x, p: money(nx.more), s: money(nx.save) });
      btn.hidden = false;
      btn.textContent = t('cp.u.add', { x });
      btn.dataset.add = nx.adds.join(',');
    } else if (off.id === 'all') {
      msg = tt('cp.u.best', { s: money(off.save) });
      good = true;
    }
    nudge.hidden = !msg;
    nudge.classList.toggle('is-good', good);
    nudge.querySelector('p').textContent = msg;
    if (user && msg && (!last || last.id !== off.id)) pulse(nudge, 'is-bump');
    $('.cp-sr').textContent = off.save > 0 ? tt('cp.sr.save', { o: t(`cp.o.${off.id}`), p: money(off.price), s: money(off.save) }) : tt('cp.sr', { o: t(`cp.o.${off.id}`), p: money(off.price) });
    if (user && off.id === 'all' && last?.id !== 'all') confetti();
    if (user) pulse($('.cp-paper'), 'is-tick');
    last = off;
  }

  // Choix : une formation (on coche, on décoche), une formule toute faite, ou le conseil du ticket
  cards.forEach((b) =>
    b.addEventListener('click', () => {
      const c = b.dataset.t;
      if (sel.has(c)) sel.delete(c);
      else sel.add(c);
      pulse(b, 'is-bump');
      render(true);
    }),
  );
  presets.forEach((p) =>
    p.addEventListener('click', () => {
      const k = p.dataset.set;
      sel = new Set(k === 'one' ? [o.one || 'creative'] : PACK[k]);
      pulse(p, 'is-bump');
      render(true);
    }),
  );
  nudge.querySelector('button').addEventListener('click', (e) => {
    e.currentTarget.dataset.add.split(',').forEach((c) => sel.add(c));
    render(true);
  });
  go.addEventListener('click', (e) => {
    if (go.getAttribute('aria-disabled') === 'true') return e.preventDefault();
    o.onPick?.(go.dataset.pick);
  });

  render(false);

  // Entrée en scène : le ticket sort de la fente, les lignes s'impriment, le prix séparé est barré
  // et le total bascule jusqu'au prix du pack, puis le tampon tombe.
  if (reduce || !('IntersectionObserver' in window)) {
    root.classList.add('is-shown', 'is-struck');
    return { render };
  }
  const off0 = bestOffer(sel, P);
  if (off0) setDigits(off0.sum, false);
  stamp.classList.remove('is-on');
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      root.classList.add('is-shown', 'is-intro');
      const off = bestOffer(sel, P);
      const lines = off ? off.inc.length : 0;
      const t0 = 500 + lines * 140;
      setTimeout(() => root.classList.add('is-struck'), t0);
      setTimeout(() => off && setDigits(off.price, true), t0 + 380);
      setTimeout(() => {
        if (off && off.save > 0) {
          stamp.classList.add('is-on');
          pulse(stamp, 'is-slam');
        }
        pulse($('.cp-today'), 'is-hl');
      }, t0 + 900);
      // L'entrée est finie : ensuite, seules les lignes ajoutées s'impriment
      setTimeout(() => root.classList.remove('is-intro'), t0 + 1800);
    },
    { threshold: 0.3 },
  );
  io.observe($('.cp-receipt'));
  return { render };
}
