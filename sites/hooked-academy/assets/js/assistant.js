// Assistant Hooked : répond aux questions fréquentes à partir de la FAQ gérée par l'équipe (faq.js),
// sans serveur ni IA. La question est comparée aux questions, mots-clés et réponses de chaque entrée
// (dans les trois langues) ; sans réponse assez sûre, l'assistant propose d'écrire à l'équipe sur WhatsApp.
// mountAssistant({ links, whatsapp, faqHref, extra, bottom }) : bouton flottant + fenêtre de discussion.
// match(question, entries) : utilisé aussi par l'espace équipe pour tester les mots-clés.

import { add, t, lang } from './i18n.js';
import { icon } from './icons.js';
import * as FAQ from './faq.js';
import { OFFRES } from '../../data/offres.js';

add({
  fr: {
    'bot.fab': 'Une question ?',
    'bot.name': 'Assistant Hooked',
    'bot.sub': 'Réponses de l’équipe, en direct',
    'bot.close': 'Fermer l’assistant',
    'bot.hello': 'Salam ! Je suis l’assistant de Hooked Academy. Pose ta question, ou choisis-en une :',
    'bot.ph': 'Écris ta question…',
    'bot.send': 'Envoyer',
    'bot.near': 'Questions proches',
    'bot.none': 'Je n’ai pas trouvé de réponse sûre à ta question. L’équipe te répond sur WhatsApp :',
    'bot.wa': 'Écrire à l’équipe',
    'bot.waMsg': 'Salam ! J’ai une question sur Hooked Academy : {q}',
    'bot.all': 'Voir toutes les questions',
    'bot.typing': 'L’assistant écrit…',
    'bot.useful': 'Autre chose ? Écris ta question ci-dessous.',
    'bot.l.tarifs': 'Voir les tarifs',
    'bot.l.signup': 'Réserver ma place',
    'bot.l.courses': 'Voir les formations',
  },
  en: {
    'bot.fab': 'Got a question?',
    'bot.name': 'Hooked assistant',
    'bot.sub': 'The team’s answers, instantly',
    'bot.close': 'Close the assistant',
    'bot.hello': 'Salam! I’m the Hooked Academy assistant. Ask your question, or pick one:',
    'bot.ph': 'Type your question…',
    'bot.send': 'Send',
    'bot.near': 'Related questions',
    'bot.none': 'I couldn’t find a reliable answer to your question. The team answers you on WhatsApp:',
    'bot.wa': 'Message the team',
    'bot.waMsg': 'Salam! I have a question about Hooked Academy: {q}',
    'bot.all': 'See all questions',
    'bot.typing': 'The assistant is typing…',
    'bot.useful': 'Anything else? Type your question below.',
    'bot.l.tarifs': 'See the prices',
    'bot.l.signup': 'Save my spot',
    'bot.l.courses': 'See the courses',
  },
  ar: {
    'bot.fab': 'لديك سؤال؟',
    'bot.name': 'مساعد Hooked',
    'bot.sub': 'إجابات الفريق، فورًا',
    'bot.close': 'إغلاق المساعد',
    'bot.hello': 'السلام عليكم! أنا مساعد Hooked Academy. اطرح سؤالك، أو اختر واحدًا:',
    'bot.ph': 'اكتب سؤالك…',
    'bot.send': 'إرسال',
    'bot.near': 'أسئلة قريبة',
    'bot.none': 'لم أجد إجابة مؤكَّدة لسؤالك. يجيبك الفريق عبر واتساب:',
    'bot.wa': 'راسل الفريق',
    'bot.waMsg': 'السلام عليكم! لديّ سؤال عن Hooked Academy: {q}',
    'bot.all': 'عرض كل الأسئلة',
    'bot.typing': 'المساعد يكتب…',
    'bot.useful': 'شيء آخر؟ اكتب سؤالك في الأسفل.',
    'bot.l.tarifs': 'عرض الأسعار',
    'bot.l.signup': 'احجز مكانك',
    'bot.l.courses': 'عرض التكوينات',
  },
});

/* ------------------------------------------------------------------ */
/* Recherche de la meilleure réponse                                   */
/* ------------------------------------------------------------------ */

const STOP = new Set(
  (
    'le la les un une des de du d l et ou au aux en est ce ces cet cette mon ma mes ton ta tes son sa ses je j tu il elle on nous vous ils elles qui que qu quoi ' +
    'quel quelle quels quelles est-ce pour par sur dans avec sans pas ne n plus y faut faire fait peux peut puis veux veut suis es ai as a c s me te se si oui non bien tres ' +
    'sont ils etre avoir ' +
    'the an of to is are do does did i you my your it in on for and or what how why can could with be am me we our there this that have has will would should ' +
    'من في على الى عن ما ماذا هل كيف لماذا كم ان و او هذا هذه ذلك التي الذي لي لك انا انت هو هي مع كان يمكن ' +
    'واش كاش لازم راني راك نقدر باش تاع ديال كيفاش وين علاش'
  ).split(' '),
);
/** Minuscules, sans accents ni signes, arabe unifié (alif, ta marbouta, alif maqsoura). */
export const normText = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ـ/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
const stem = (w) => {
  if (/^[a-z]/.test(w)) return w.length > 4 ? w.replace(/(es|s|x)$/, '') : w;
  if (/^[؀-ۿ]/.test(w)) return w.length > 4 ? w.replace(/^(وال|بال|كال|فال|ال)/, '') : w;
  return w;
};
const tokens = (s) => [...new Set(normText(s).split(' ').filter((w) => w.length > 1 && !STOP.has(w)).map(stem))];

const all = (o) => (o && typeof o === 'object' ? Object.values(o).join(' ') : String(o || ''));
function indexOf(e) {
  return { e, strong: new Set([...tokens(all(e.q)), ...tokens(e.kw)]), weak: new Set(tokens(all(e.a))) };
}
const near = (set, w) => {
  if (w.length < 4) return false;
  for (const x of set) if (x.length >= 4 && (x.startsWith(w) || w.startsWith(x))) return true;
  return false;
};

/** Entrées triées par pertinence : [{ e, score }] (score moyen par mot de la question, de 0 à 3). */
export function match(question, entries) {
  const q = tokens(question);
  if (!q.length) return [];
  return entries
    .map(indexOf)
    .map(({ e, strong, weak }) => {
      let s = 0;
      let hit = 0;
      for (const w of q) {
        const v = strong.has(w) ? 3 : near(strong, w) ? 2 : weak.has(w) ? 1 : near(weak, w) ? 0.5 : 0;
        if (v >= 2) hit++;
        s += v;
      }
      return { e, score: hit ? s / q.length : 0 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
}
/** Seuil d'une réponse « sûre » ; en dessous, l'assistant renvoie vers l'équipe. */
export const SURE = 1.2;

/** Réponses intégrées, en plus de la FAQ : les tarifs (data/offres.js) et les salutations. Jamais proposées en suggestion. */
const da = (n) => `${new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'fr-FR').format(n)} ${{ fr: 'DA', en: 'DZD', ar: 'دج' }[lang] || 'DA'}`;
export function builtins() {
  const p = { c: da(OFFRES.creative), i: da(OFFRES.ia), b: da(OFFRES.both) };
  return [
    {
      id: '_prix',
      kw: 'prix, tarif, tarifs, coût, combien, cher, dinar, dinars, da, dzd, pack, packs, price, cost, how much, fee, سعر, الثمن, ثمن, كم, تكلفة, دينار, شحال, بشحال',
      q: { fr: 'Combien coûte la formation ?', en: 'How much does the course cost?', ar: 'كم يكلّف التكوين؟' },
      a: {
        fr: `Pack Créative : ${p.c} · Pack IA : ${p.i} · Pack complet (les deux formations) : ${p.b}.\n\nChaque pack donne un an d’accès à la plateforme. Le paiement se fait avec l’équipe sur WhatsApp, après ton inscription (CCP, BaridiMob ou espèces).`,
        en: `Creative pack: ${p.c} · AI pack: ${p.i} · Full pack (both courses): ${p.b}.\n\nEach pack gives one year of access to the platform. You pay with the team on WhatsApp, after signing up (CCP, BaridiMob or cash).`,
        ar: `باقة التكوين الإبداعي: ${p.c} · باقة الذكاء الاصطناعي: ${p.i} · الباقة الكاملة (التكوينان): ${p.b}.\n\nتمنحك كل باقة وصولًا إلى المنصة لمدة سنة. يتم الدفع مع الفريق عبر واتساب بعد تسجيلك (CCP أو BaridiMob أو نقدًا).`,
      },
    },
    {
      id: '_salut',
      kw: 'bonjour, bonsoir, salut, salam, slt, coucou, merci, hello, hi, hey, thanks, thank, السلام, سلام, مرحبا, اهلا, شكرا, صحيت, صحة',
      q: { fr: 'Salam', en: 'Salam', ar: 'السلام عليكم' },
      a: {
        fr: 'Salam ! Pose-moi ta question sur les formations, l’inscription ou la plateforme : je te réponds avec les réponses de l’équipe.',
        en: 'Salam! Ask me about the courses, signing up or the platform: I answer with the team’s answers.',
        ar: 'وعليكم السلام! اسألني عن التكوينات أو التسجيل أو المنصة: أجيبك بإجابات الفريق.',
      },
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Interface                                                           */
/* ------------------------------------------------------------------ */

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const para = (s) =>
  String(s || '')
    .split(/\n\s*\n/)
    .map((p) => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Monte l'assistant dans la page.
 * links    : { <id d'entrée>: { href, label } } — bouton sous la réponse (ex. outils → #/outils)
 * whatsapp : numéro de l'équipe (chiffres), pour la réponse de secours
 * faqHref  : lien « toutes les questions »
 * extra    : entrées en plus de la FAQ (même forme que la FAQ, textes { fr, en, ar })
 * filter   : (entrée) => bool, entrées proposées en suggestion à l'ouverture
 * bottom   : décalage du bouton (ex. au-dessus d'une barre d'onglets mobile)
 */
export function mountAssistant({ links = {}, whatsapp = '', faqHref = '', extra = [], filter = () => true, bottom = '' } = {}) {
  if (document.getElementById('ha-bot')) return;
  if (!document.querySelector('link[data-hb]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = new URL('../css/assistant.css', import.meta.url).href;
    css.dataset.hb = '';
    document.head.appendChild(css);
  }
  const wrap = document.createElement('div');
  wrap.className = 'hb';
  if (bottom) wrap.style.setProperty('--hb-bottom', bottom);
  wrap.innerHTML = `<section class="hb-win" id="ha-bot" role="dialog" aria-modal="false" aria-labelledby="hb-name" hidden>
      <header class="hb-h"><span class="hb-av">${icon('bot', { size: 20 })}</span><div><b id="hb-name">${t('bot.name')}</b><small>${t('bot.sub')}</small></div><button class="hb-x" type="button" aria-label="${esc(t('bot.close'))}">${icon('x', { size: 18 })}</button></header>
      <div class="hb-log" role="log" aria-live="polite"></div>
      <form class="hb-f"><label class="sr-only" for="hb-in">${t('bot.ph')}</label><input class="hb-in" id="hb-in" type="text" maxlength="200" autocomplete="off" placeholder="${esc(t('bot.ph'))}" dir="auto"><button class="hb-send" type="submit" aria-label="${esc(t('bot.send'))}">${icon('send', { size: 18 })}</button></form>
    </section>
    <button class="hb-fab" type="button" aria-expanded="false" aria-controls="ha-bot">${icon('bot', { size: 22 })}<span class="hb-fab-t">${t('bot.fab')}</span></button>`;
  document.body.appendChild(wrap);
  const fab = wrap.querySelector('.hb-fab');
  const win = wrap.querySelector('.hb-win');
  const log = wrap.querySelector('.hb-log');
  const input = wrap.querySelector('.hb-in');
  let entries = [];
  let started = false;

  const pickL = (o) => FAQ.pickLang(o, lang);
  const scroll = () => (log.scrollTop = log.scrollHeight);
  const say = (html, who = 'bot') => {
    const m = document.createElement('div');
    m.className = `hb-m is-${who}`;
    m.innerHTML = html;
    log.appendChild(m);
    scroll();
    return m;
  };
  const chips = (list) => `<div class="hb-chips">${list.map((e) => `<button type="button" class="hb-chip" data-q="${esc(e.id)}" dir="auto">${esc(pickL(e.q))}</button>`).join('')}</div>`;
  const waLink = (q) => (whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(t('bot.waMsg', { q }))}` : '');

  const answer = (e, others = []) => {
    const ln = links[e.id];
    say(
      `<b dir="auto">${esc(pickL(e.q))}</b>${para(pickL(e.a))}${ln ? `<a class="hb-link" href="${esc(ln.href)}"${/^https?:/.test(ln.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(ln.label)} ${icon('arrow', { size: 14 })}</a>` : ''}${others.length ? `<p class="hb-k">${t('bot.near')}</p>${chips(others)}` : ''}`,
    );
  };
  const fallback = (q) => {
    const wa = waLink(q);
    say(
      `<p>${t('bot.none')}</p><div class="hb-acts">${wa ? `<a class="hb-link is-wa" href="${esc(wa)}" target="_blank" rel="noopener">${icon('whatsapp', { size: 16 })} ${t('bot.wa')}</a>` : ''}${faqHref ? `<a class="hb-link" href="${esc(faqHref)}">${t('bot.all')}</a>` : ''}</div>`,
    );
  };
  const reply = (fn) => {
    if (reduce) return fn();
    const dots = say(`<span class="hb-dots" aria-label="${esc(t('bot.typing'))}"><i></i><i></i><i></i></span>`);
    setTimeout(() => {
      dots.remove();
      fn();
    }, 420);
  };

  const ask = (text) => {
    const q = text.trim();
    if (!q) return;
    say(`<p dir="auto">${esc(q)}</p>`, 'me');
    const found = match(q, entries);
    reply(() => {
      const best = found[0];
      if (!best || best.score < SURE) return fallback(q);
      answer(
        best.e,
        found.slice(1, 3).filter((x) => x.score >= SURE * 0.75).map((x) => x.e),
      );
    });
  };

  const start = async () => {
    if (started) return;
    started = true;
    await FAQ.ready();
    entries = [...FAQ.list(), ...extra, ...builtins()].filter((e) => pickL(e.q) && pickL(e.a));
    say(`<p>${t('bot.hello')}</p>${chips(entries.filter((e) => !e.id.startsWith('_') && filter(e)).slice(0, 4))}`);
  };

  const open = (v) => {
    win.hidden = !v;
    fab.setAttribute('aria-expanded', String(v));
    wrap.classList.toggle('is-open', v);
    if (v) {
      start();
      setTimeout(() => input.focus(), 30);
    } else fab.focus();
  };
  fab.addEventListener('click', () => open(win.hidden));
  wrap.querySelector('.hb-x').addEventListener('click', () => open(false));
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !win.hidden) open(false);
  });
  wrap.querySelector('.hb-f').addEventListener('submit', (e) => {
    e.preventDefault();
    ask(input.value);
    input.value = '';
  });
  log.addEventListener('click', (e) => {
    const c = e.target.closest('.hb-chip');
    if (c) {
      const it = entries.find((x) => x.id === c.dataset.q);
      if (!it) return;
      say(`<p dir="auto">${esc(pickL(it.q))}</p>`, 'me');
      reply(() => answer(it));
      return;
    }
    // Un lien interne (#/outils…) referme la fenêtre pour laisser voir la page
    const a = e.target.closest('a.hb-link');
    if (a && a.getAttribute('href')?.startsWith('#')) open(false);
  });
  return { open: () => open(true) };
}
