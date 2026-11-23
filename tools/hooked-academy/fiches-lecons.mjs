// Fiches PDF et liens des leçons (Formation Créative et Formation IA), générés à partir du programme et de ses traductions :
//   ressources/<leçon>/01-fiche-de-la-leçon.fr.pdf (+ .en, .ar) : l'essentiel, la méthode vue dans la vidéo,
//   les prompts de l'atelier, l'exercice, le quiz corrigé et les outils ;
//   ressources/<leçon>/liens.txt : les outils cités dans la leçon (pages officielles).
// Puis relancer `node tools/hooked-academy/ressources.mjs` pour mettre à jour le manifeste.
//
//   node tools/hooked-academy/fiches-lecons.mjs                 toutes les leçons, trois langues
//   TRACK=creative node tools/hooked-academy/fiches-lecons.mjs  une seule formation (creative, ia ou dev)
//   node tools/hooked-academy/fiches-lecons.mjs ia1-l2 ia3-l4   seulement ces leçons
//   LANGS=fr node tools/hooked-academy/fiches-lecons.mjs        une seule langue
//
// À relancer quand une leçon change (texte, prompts, quiz) : la fiche suit le programme.
// Prérequis : Playwright (voir pdf-ressource.mjs).
import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHtml, renderPdf, parse } from './pdf-ressource.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(HERE, '../../sites/hooked-academy');
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
const { MODULES, modCode } = await import(pathToFileURL(path.join(SITE, 'data/programme.js')).href);
const { OUTILS } = await import(pathToFileURL(path.join(SITE, 'data/outils.js')).href);
// Hooked Lab pas encore ouvert : les traductions passent par le même masque que le site (data/hooked-lab.js)
const { LAB, masquer, sansLab } = await import(pathToFileURL(path.join(SITE, 'data/hooked-lab.js')).href);

const LANGS = (process.env.LANGS || 'fr,en,ar').split(',');
const ONLY = process.argv.slice(2);
const TRACK = process.env.TRACK;
const COURSE = {
  creative: { fr: 'Formation Créative', en: 'Creative Course', ar: 'التكوين الإبداعي' },
  ia: { fr: 'Formation IA', en: 'AI Course', ar: 'تكوين الذكاء الاصطناعي' },
  dev: { fr: 'Formation Sites & Apps', en: 'Sites & Apps Course', ar: 'تكوين المواقع والتطبيقات' },
};
const FILE = { fr: '01-fiche-de-la-leçon', en: '01-lesson-sheet', ar: '01-ملخص-الدرس' };
const T = {
  fr: { lesson: 'Leçon', sheet: 'fiche de la leçon', ess: 'L’essentiel', meth: 'La méthode de la vidéo', prompts: 'Les prompts de l’atelier', ex: 'L’exercice', quiz: 'Vérifie-toi', answer: 'Réponse', tools: 'Les outils', note: 'Remplace ce qui est entre crochets [ ] par ton produit, ta cible, ta ville.', video: 'Le prompt de la vidéo' },
  en: { lesson: 'Lesson', sheet: 'lesson sheet', ess: 'Key points', meth: 'The method from the video', prompts: 'Workshop prompts', ex: 'The exercise', quiz: 'Check yourself', answer: 'Answer', tools: 'Tools', note: 'Replace what is in square brackets [ ] with your product, audience and city.', video: 'The prompt from the video' },
  ar: { lesson: 'الدرس', sheet: 'ملخص الدرس', ess: 'الأساسي', meth: 'طريقة الفيديو', prompts: 'برومبتات الورشة', ex: 'التمرين', quiz: 'اختبر نفسك', answer: 'الجواب', tools: 'الأدوات', note: 'استبدل ما بين المعقوفين [ ] بمنتجك وجمهورك ومدينتك.', video: 'برومبت الفيديو' },
};

// Outils cités → liens (page officielle, ou lien de parrainage de l'équipe quand il existe, comme dans l'espace étudiant)
const TOOL = Object.fromEntries(OUTILS.map((o) => [o.id, { name: o.name, url: o.ref || o.url }]));
const EXTRA = {
  adlib: { name: 'Meta Ad Library', url: 'https://www.facebook.com/ads/library/' },
  tiktok: { name: 'TikTok Creative Center', url: 'https://ads.tiktok.com/business/creativecenter/' },
  lab: { name: 'Hooked Lab', url: 'https://hooked-lab.com' },
  aliexpress: { name: 'AliExpress', url: 'https://www.aliexpress.com' },
  snaptik: { name: 'SnapTik', url: 'https://snaptik.app' },
  metasound: { name: 'Meta Sound Collection', url: 'https://www.facebook.com/sound/collection/' },
  tiktokmusic: { name: 'TikTok Commercial Music Library', url: 'https://ads.tiktok.com/business/creativecenter/music/pc/en' },
  // Formation Sites & Apps : pages officielles des outils cités
  claudecode: { name: 'Claude Code (documentation)', url: 'https://code.claude.com/docs' },
  skills: { name: 'Skills Claude (documentation)', url: 'https://code.claude.com/docs/en/skills' },
  plugins: { name: 'Plugins Claude Code (documentation)', url: 'https://code.claude.com/docs/en/discover-plugins' },
  mcp: { name: 'MCP dans Claude Code (documentation)', url: 'https://code.claude.com/docs/en/mcp' },
  github: { name: 'GitHub', url: 'https://github.com' },
  git: { name: 'Git', url: 'https://git-scm.com' },
  vscode: { name: 'VS Code', url: 'https://code.visualstudio.com' },
  node: { name: 'Node.js', url: 'https://nodejs.org' },
  supabase: { name: 'Supabase (documentation)', url: 'https://supabase.com/docs' },
  vercel: { name: 'Vercel', url: 'https://vercel.com' },
  netlify: { name: 'Netlify', url: 'https://www.netlify.com' },
  cloudflare: { name: 'Cloudflare Pages', url: 'https://pages.cloudflare.com' },
  railway: { name: 'Railway', url: 'https://railway.com' },
  render: { name: 'Render', url: 'https://render.com' },
  coolify: { name: 'Coolify', url: 'https://coolify.io' },
  pagespeed: { name: 'PageSpeed Insights', url: 'https://pagespeed.web.dev' },
  opengraph: { name: 'OpenGraph.xyz', url: 'https://www.opengraph.xyz' },
  owasp: { name: 'OWASP Top 10', url: 'https://owasp.org/Top10/' },
  cheatsheets: { name: 'OWASP Cheat Sheets', url: 'https://cheatsheetseries.owasp.org' },
  mdn: { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/fr/' },
  vite: { name: 'Vite', url: 'https://vite.dev' },
  vitest: { name: 'Vitest', url: 'https://vitest.dev' },
  playwright: { name: 'Playwright', url: 'https://playwright.dev' },
  zod: { name: 'Zod', url: 'https://zod.dev' },
  gsap: { name: 'GSAP', url: 'https://gsap.com' },
  lottie: { name: 'LottieFiles', url: 'https://lottiefiles.com' },
  spline: { name: 'Spline', url: 'https://spline.design' },
  awwwards: { name: 'Awwwards', url: 'https://www.awwwards.com' },
  motionsites: { name: 'Motionsites', url: 'https://motionsites.ai' },
  chargily: { name: 'Chargily Pay (développeurs)', url: 'https://dev.chargily.com' },
  lovable: { name: 'Lovable', url: 'https://lovable.dev' },
  bolt: { name: 'Bolt', url: 'https://bolt.new' },
  replit: { name: 'Replit', url: 'https://replit.com' },
  squoosh: { name: 'Squoosh', url: 'https://squoosh.app' },
  realtimecolors: { name: 'Realtime Colors', url: 'https://www.realtimecolors.com' },
  uptimerobot: { name: 'UptimeRobot', url: 'https://uptimerobot.com' },
  resend: { name: 'Resend', url: 'https://resend.com' },
  expo: { name: 'Expo', url: 'https://expo.dev' },
  shadcn: { name: 'shadcn/ui', url: 'https://ui.shadcn.com' },
};
const DETECT = [
  ['chatgpt', /chatgpt/i],
  ['claude', /\bclaude\b/i],
  ['gemini', /gemini|nano banana/i],
  ['veo', /\bveo\b|\bflow\b/i],
  ['kling', /kling/i],
  ['higgsfield', /higgsfield/i],
  ['elevenlabs', /elevenlabs/i],
  ['capcut', /capcut/i],
  ['canva', /canva/i],
  ['hostinger', /hostinger/i],
  ['lab', /hooked lab/i],
  ['adlib', /biblioth[eè]que publicitaire|ad library/i],
  ['aliexpress', /aliexpress/i],
  ['snaptik', /snaptik/i],
  ['metasound', /sound collection|musique autoris|musique libre de droits/i],
  ['tiktokmusic', /sound collection|musique autoris|musique libre de droits/i],
  ['tiktok', /tiktok/i],
  // Formation Sites & Apps
  ['claudecode', /claude code/i],
  ['skills', /\bskills?\b|SKILL\.md/],
  ['plugins', /\/plugin\b|\bplugins?\b/i],
  ['mcp', /\bMCP\b/],
  ['github', /github/i],
  ['git', /\bgit (init|add|commit|push|log|revert|merge|checkout|status)\b/],
  ['vscode', /vs code|vscode/i],
  ['node', /node\.?js|\bnpm\b/i],
  ['supabase', /supabase/i],
  ['vercel', /vercel/i],
  ['netlify', /netlify/i],
  ['cloudflare', /cloudflare/i],
  ['railway', /railway/i],
  ['render', /\bRender\b/],
  ['coolify', /coolify|dokploy/i],
  ['pagespeed', /lighthouse|pagespeed/i],
  ['opengraph', /open ?graph|og:image/i],
  ['owasp', /owasp/i],
  ['cheatsheets', /owasp|xss|injection|idor/i],
  ['vite', /\bVite\b/],
  ['vitest', /vitest/i],
  ['playwright', /playwright/i],
  ['zod', /\bzod\b/i],
  ['gsap', /gsap|scrolltrigger|lenis/i],
  ['lottie', /lottie/i],
  ['spline', /spline/i],
  ['awwwards', /awwwards/i],
  ['motionsites', /motionsites/i],
  ['chargily', /chargily/i],
  ['lovable', /lovable/i],
  ['bolt', /\bbolt\b/i],
  ['replit', /replit/i],
  ['squoosh', /squoosh/i],
  ['realtimecolors', /realtime colors/i],
  ['uptimerobot', /uptimerobot/i],
  ['resend', /resend/i],
  ['expo', /\bexpo\b/i],
  ['shadcn', /shadcn/i],
];
const DEFAULT = { ia0: ['chatgpt', 'claude'], ia1: ['chatgpt', 'claude'], ia2: ['gemini', 'canva'], ia3: ['veo', 'kling', 'capcut'], ia4: ['elevenlabs', 'capcut'], ia10: ['adlib', 'chatgpt'], ia5: ['elevenlabs', 'higgsfield'], ia6: ['higgsfield', 'capcut'], ia7: ['lab', 'adlib'], ia8: ['chatgpt', 'canva'], ia9: ['lab', 'chatgpt'],
  m0: ['capcut', 'canva'], m1: ['capcut', 'canva'], m2: ['capcut', 'chatgpt'], m3: ['chatgpt', 'canva'], m4: ['capcut', 'chatgpt'], m5: ['capcut', 'canva'], m6: ['canva', 'chatgpt'],
  m7: ['adlib', 'capcut'], m8: ['capcut'], m9: ['capcut'], m10: ['adlib', 'chatgpt'], m11: ['canva', 'capcut'], m12: ['capcut', 'canva'],
  dv0: ['claudecode', 'github'], dv1: ['claudecode', 'mdn'], dv2: ['mdn', 'vite'], dv3: ['claudecode', 'github'], dv4: ['pagespeed', 'mdn'], dv5: ['github', 'git'],
  dv6: ['github', 'netlify'], dv7: ['supabase', 'cheatsheets'], dv8: ['owasp', 'cheatsheets'], dv9: ['supabase', 'vite'], dv10: ['vitest', 'playwright'], dv11: ['gsap', 'awwwards'],
  dv12: ['claudecode', 'skills'], dv13: ['github', 'pagespeed'], dv14: ['owasp', 'uptimerobot'], dv15: ['github', 'claudecode'] };
const linksOf = (m, l) => {
  // le texte de la leçon, sans les noms de scènes (« flow » est un type de scène, pas l'outil Flow)
  const txt = JSON.stringify(l, (k, v) => (k === 'type' || k === 'widget' ? undefined : v));
  const ids = DETECT.filter(([, re]) => re.test(txt)).map(([id]) => id);
  for (const id of DEFAULT[m.id] || []) if (ids.length < 2 && !ids.includes(id) && (LAB || id !== 'lab')) ids.push(id);
  return ids.slice(0, m.track === 'dev' ? 8 : ids.length).map((id) => TOOL[id] || EXTRA[id]).filter(Boolean);
};

// Traduction d'une leçon : les tableaux se fusionnent par position, comme dans l'espace étudiant
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
function merge(base, ov) {
  if (ov == null) return base;
  if (Array.isArray(base)) return base.map((x, i) => merge(x, Array.isArray(ov) ? ov[i] : undefined));
  if (isObj(base)) return Object.fromEntries(Object.keys(base).map((k) => [k, merge(base[k], isObj(ov) ? ov[k] : undefined)]));
  return typeof base === 'string' && typeof ov === 'string' && ov.trim() ? ov : base;
}
const OV = {};
for (const lang of LANGS.filter((l) => l !== 'fr')) {
  OV[lang] = {};
  for (const m of MODULES.filter((x) => !TRACK || x.track === TRACK)) {
    try {
      OV[lang][m.id] = (await import(pathToFileURL(path.join(SITE, `data/i18n/${lang}/${m.id}.js`)).href)).default;
    } catch {}
  }
}

const clean = (s) => String(s ?? '').replace(/[~^]/g, '').replace(/\s+/g, ' ').trim();
const bullet = (x) => {
  if (typeof x === 'string') return `- ${clean(x)}`;
  if (Array.isArray(x.cells)) return `- **${clean(x.cells[0])}** — ${x.cells.slice(1).map(clean).join(' · ')}`;
  if (x.text && x.fr) return `- ${clean(x.text)} — ${clean(x.fr)}`;
  const label = clean(x.label || x.t || x.title || (x.word ? `${x.k ? `${x.k} · ` : ''}${x.word}` : ''));
  const sub = clean(x.sub || x.text || x.fr || x.when || '');
  return label || sub ? `- ${label ? `**${label}**` : ''}${label && sub ? ' — ' : ''}${sub}` : '';
};
function method(scenes) {
  const out = [];
  for (const sc of scenes) {
    if (['title', 'outro', 'prompt', 'chat'].includes(sc.type)) continue;
    const head = clean(sc.title || sc.kicker || '');
    const lines = [];
    if (sc.type === 'compare') {
      for (const side of [sc.left, sc.right]) if (side) lines.push(`- **${clean(side.title)}** : ${(side.items || []).map(clean).join(' · ')}`);
    } else if (sc.type === 'anatomy' && sc.parts) {
      sc.parts.filter((p) => p.fr || p.sub).forEach((p) => lines.push(`- **${clean(p.label)}**${p.when ? ` (${clean(p.when)})` : ''} — ${clean(p.fr || p.sub)}`));
    } else if (sc.type === 'formula' && sc.parts) {
      lines.push(`- ${sc.parts.map((p) => clean(p.t)).join(' + ')}${sc.result?.t ? ` = **${clean(sc.result.t)}**` : ''}`);
    } else if (sc.type === 'terminal') {
      const cmd = [];
      for (const l of sc.lines || []) {
        if (l.comment) cmd.push(l.comment);
        else {
          cmd.push(`$ ${l.cmd}`);
          (l.out || []).slice(0, 6).forEach((o) => cmd.push(typeof o === 'string' ? o : o.t));
        }
      }
      if (cmd.length) lines.push('```', ...cmd, '```');
    } else if (sc.type === 'code' || sc.type === 'diff') {
      const code = sc.type === 'code' ? String(sc.code || '') : (sc.lines || []).map((l) => `${l.t === ' ' ? ' ' : l.t} ${l.code}`).join('\n');
      if (code.trim()) lines.push(sc.file ? `\`${clean(sc.file)}\`` : '', '```', code, '```');
      (sc.notes || []).forEach((n) => lines.push(`- ${n.line ? `Ligne ${n.line} : ` : ''}${clean(n.text)}`));
    } else if (sc.type === 'alert') {
      lines.push(`- **${clean(sc.code || '')} · ${clean(sc.name)}**${sc.level ? ` (${clean(sc.level)})` : ''}`);
      if (sc.attack) lines.push(`- ${clean(sc.attackLabel || 'L’attaque')} : ${clean(sc.attack)}`);
      if (sc.impact) lines.push(`- ${clean(sc.impactLabel || 'L’impact')} : ${clean(sc.impact)}`);
      (sc.fix || []).forEach((f) => lines.push(`- ✔ ${clean(f)}`));
    } else if (sc.type === 'tree') {
      (sc.items || []).forEach((it) => lines.push(`- \`${clean(it.p)}\`${it.note ? ` — ${clean(it.note)}` : ''}`));
    } else if (sc.type === 'gitgraph') {
      (sc.commits || []).forEach((c) => lines.push(`- \`${clean(c.b)}\` — ${clean(c.msg)}${c.merge ? ` (fusion de \`${clean(c.merge)}\`)` : ''}`));
    } else if (sc.type === 'browser') {
      if (sc.lighthouse) lines.push(`- Lighthouse : ${Object.entries(sc.lighthouse).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
      (sc.console || []).forEach((c) => lines.push(`- Console : ${clean(c.t)}`));
    } else if (sc.type === 'quote' || sc.type === 'big') {
      lines.push(`> ${clean(sc.text)}${sc.sub ? ` — ${clean(sc.sub)}` : ''}`);
    } else {
      for (const list of [sc.items, sc.nodes, sc.steps, sc.rows, sc.cards, sc.letters, sc.levels, sc.frames, sc.layers]) if (Array.isArray(list)) list.forEach((x) => lines.push(bullet(x)));
    }
    if (sc.note) lines.push(`> ${clean(sc.note).replace(/\*/g, '')}`);
    const body = lines.filter(Boolean);
    if (!body.length) continue;
    if (head) out.push(`### ${head}`);
    out.push(...body, '');
  }
  return out;
}
function sheet(m, l, lang) {
  const t = T[lang];
  const tools = linksOf(m, l);
  const md = [`# ${clean(l.title)}`, `_${COURSE[m.track][lang]} · ${modCode(m)} · ${t.lesson} ${String(l.n).padStart(2, '0')} — ${clean(m.title)}_`, ''];
  if (l.key?.length) md.push(`## ${t.ess}`, ...l.key.map((k) => `- ${clean(k)}`), '');
  const meth = method(l.scenes || []);
  if (meth.length) md.push(`## ${t.meth}`, ...meth);
  // prompts de l'atelier, puis ceux montrés dans la vidéo (s'ils sont différents)
  const prompts = (l.res || []).map((r) => ({ title: clean(r.title), text: String(r.text).trim() }));
  for (const sc of l.scenes || []) {
    if (sc.type !== 'prompt' || !sc.segments) continue;
    const text = sc.segments.map((x) => x.text).join(' ').trim();
    if (text && !prompts.some((p) => p.text === text)) prompts.push({ title: `${t.video}${sc.app ? ` · ${sc.app}` : ''}`, text });
  }
  if (prompts.length) {
    md.push(`## ${t.prompts}`, `> ${t.note}`, '');
    for (const p of prompts) md.push(`### ${p.title}`, '```', p.text, '```', '');
  }
  if (l.todo?.length) md.push(`## ${t.ex}`, ...l.todo.map((x) => `- [ ] ${clean(x)}`), '');
  if (l.quiz?.length) {
    md.push(`## ${t.quiz}`);
    for (const q of l.quiz) md.push(`**${clean(q.q)}**`, '', ...q.a.map((a) => `- ${clean(a)}`), '', `> ${t.answer} : ${clean(q.a[q.ok])}${q.why ? ` — ${clean(q.why)}` : ''}`, '');
  }
  if (tools.length) md.push(`## ${t.tools}`, ...tools.map((x) => `- **${x.name}** : ${x.url}`), '');
  // En arabe, une puce qui commence par un mot latin (Hook, CTA, A · Attention) passerait de gauche à droite :
  // une marque invisible de droite à gauche la garde dans le sens de la page (hors des blocs de prompt).
  if (lang === 'ar') {
    let code = false;
    md.forEach((line, i) => {
      if (line.startsWith('```')) code = !code;
      else if (!code && /^- (\[ \] )?/.test(line)) md[i] = line.replace(/^- (\[ \] )?/, (m) => `${m}\u200F`);
    });
  }
  return { md: md.join('\n'), tools };
}

const { chromium } = await import('playwright');
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage();
let n = 0;
for (const m of MODULES.filter((x) => !TRACK || x.track === TRACK)) {
  for (const l0 of m.lessons) {
    if (l0.off || (ONLY.length && !ONLY.includes(l0.id))) continue;
    const dir = path.join(SITE, 'ressources', l0.id);
    await mkdir(dir, { recursive: true });
    // anciennes fiches de cette leçon (si le titre du fichier a changé)
    // (seulement dans les langues générées : LANGS=ar ne touche pas aux fiches fr et en)
    for (const f of await readdir(dir)) {
      const m = f.match(/^01-(?:fiche-de-la-leçon|lesson-sheet|ملخص-الدرس)\.(fr|en|ar)\.pdf$/);
      if (m && LANGS.includes(m[1])) await unlink(path.join(dir, f));
    }
    let tools = [];
    for (const lang of LANGS) {
      const ovm = OV[lang]?.[m.id];
      const mm = lang === 'fr' ? m : { ...m, title: sansLab(ovm?.modules?.[m.id]?.title || m.title) };
      const l = lang === 'fr' ? l0 : masquer(merge(l0, ovm?.lessons?.[l0.id]));
      const s = sheet(mm, l, lang);
      tools = s.tools;
      const html = await buildHtml(s.md, { lang, formation: m.track });
      await renderPdf(page, html, path.join(dir, `${FILE[lang]}.${lang}.pdf`), { lang, title: parse(s.md).title });
      n++;
    }
    await writeFile(path.join(dir, 'liens.txt'), `# Outils cités dans la leçon ${l0.id} (généré par tools/hooked-academy/fiches-lecons.mjs)\n${tools.map((x) => `${x.name} | ${x.url}`).join('\n')}\n`);
    console.log(`✓ ${l0.id} (${tools.map((x) => x.name).join(', ') || 'aucun outil'})`);
  }
}
await browser.close();
console.log(`${n} fiches PDF`);
