// PDF des ressources Hooked Academy (guides, check-lists, packs de prompts) : Markdown → PDF A4 à la marque.
//
//   node tools/hooked-academy/pdf-ressource.mjs <source.md> <sortie.pdf> [--formation creative|ia]
//
// Langue : prise du nom de la source (« guide.ar.md » → arabe, de droite à gauche), français par défaut.
// Markdown accepté (volontairement réduit) : « # Titre », « _Sous-titre_ » en 2ᵉ ligne, « ## » et « ### »,
// paragraphes, listes « - », cases « - [ ] », encadrés « > », blocs de prompt ``` ``` (un prompt par bloc),
// **gras** et *italique*. Pas de tableaux ni d'images.
// Prérequis : Node 20+, `npm i playwright` puis `npx playwright install chromium` (ou CHROMIUM=/chemin/vers/chrome).

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../sites/hooked-academy');
const T = {
  fr: { creative: 'Formation Créative', ia: 'Formation IA', res: 'Ressource étudiant', prompt: 'Prompt à copier', page: 'Page' },
  en: { creative: 'Creative Course', ia: 'AI Course', res: 'Student resource', prompt: 'Prompt to copy', page: 'Page' },
  ar: { creative: 'التكوين الإبداعي', ia: 'تكوين الذكاء الاصطناعي', res: 'مورد للطلبة', prompt: 'برومبت للنسخ', page: 'صفحة' },
};
const ACCENT = { creative: '#e0be55', ia: '#c8b6ff' };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^\w_])_(?!\s)(.+?)_(?!\w)/g, '$1<em>$2</em>');

/** Markdown réduit → { title, subtitle, html }. */
export function parse(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  let title = '';
  let subtitle = '';
  const out = [];
  let para = [];
  let list = null; // 'ul' | 'task'
  let quote = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(list === 'task' ? '</ul>' : '</ul>');
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) out.push(`<aside class="call">${quote.map((q) => (q ? `<p>${inline(q)}</p>` : '')).join('')}</aside>`);
    quote = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^```/.test(l)) {
      flushAll();
      const code = [];
      for (i++; i < lines.length && !/^```/.test(lines[i]); i++) code.push(lines[i]);
      out.push(`<div class="prompt"><span class="prompt-k">{{PROMPT}}</span><pre dir="auto">${esc(code.join('\n').trim())}</pre></div>`);
      continue;
    }
    const h = l.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      flushAll();
      if (h[1] === '#' && !title) {
        title = h[2].trim();
        const sub = (lines[i + 1] || '').match(/^_(.+)_\s*$/);
        if (sub) {
          subtitle = sub[1];
          i++;
        }
      } else out.push(`<h${h[1].length} dir="auto">${inline(h[2].trim())}</h${h[1].length}>`);
      continue;
    }
    const task = l.match(/^\s*[-*]\s+\[[ xX]?\]\s+(.+)$/);
    const li = !task && l.match(/^\s*(?:[-*•]|\d+[.)])\s+(.+)$/);
    if (task || li) {
      flushPara();
      flushQuote();
      const kind = task ? 'task' : 'ul';
      if (list !== kind) {
        flushList();
        out.push(kind === 'task' ? '<ul class="task">' : '<ul>');
        list = kind;
      }
      out.push(`<li dir="auto">${inline((task || li)[1])}</li>`);
      continue;
    }
    const q = l.match(/^>\s?(.*)$/);
    if (q) {
      flushPara();
      flushList();
      quote.push(q[1]);
      continue;
    }
    if (!l.trim()) {
      flushAll();
      continue;
    }
    flushList();
    flushQuote();
    para.push(l.trim());
  }
  flushAll();
  return { title, subtitle, html: out.join('\n') };
}

/** Page HTML complète (couverture + contenu) prête pour l'impression. */
export async function buildHtml(md, { lang = 'fr', formation = 'creative' } = {}) {
  const { markSVG } = await import(pathToFileURL(path.join(SITE, 'assets/js/brand.js')).href);
  const L = T[lang] || T.fr;
  const rtl = lang === 'ar';
  const acc = ACCENT[formation] || ACCENT.creative;
  const { title, subtitle, html } = parse(md);
  return `<!doctype html><html lang="${lang}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sofia+Sans+Extra+Condensed:wght@800;900&family=Sofia+Sans:wght@400;600;800&family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Alexandria:wght@700;800&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
@page { size: A4; margin: 22mm 18mm 20mm; }
@page :first { margin: 0; }
:root { --ink: #0f0f0d; --paper: #f6f3ea; --acc: ${acc}; --mute: #5b584f; --rule: #d8d2c2; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 400 11.2pt/1.6 ${rtl ? "'IBM Plex Sans Arabic', 'Sofia Sans'" : "'Sofia Sans', 'IBM Plex Sans Arabic'"}, sans-serif; color: var(--ink); }
.cover { position: relative; height: 297mm; padding: 26mm 22mm; background: var(--ink); color: var(--paper); display: flex; flex-direction: column; page-break-after: always; overflow: hidden; }
.cover::before { content: ''; position: absolute; inset: auto -40mm -60mm auto; width: 170mm; height: 170mm; border-radius: 50%; background: radial-gradient(circle, ${acc}33, transparent 70%); }
[dir='rtl'] .cover::before { inset: auto auto -60mm -40mm; }
.brand { display: flex; align-items: center; gap: 12px; }
.brand svg { width: 46px; height: 46px; }
.brand b { display: block; font: 900 20pt/1 'Sofia Sans Extra Condensed', sans-serif; letter-spacing: .04em; }
.brand span { display: block; font: 600 8pt/1.2 'Sofia Sans', sans-serif; letter-spacing: .32em; opacity: .7; }
.kicker { margin-top: auto; font: 800 10pt/1 'Sofia Sans', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--acc); }
[dir='rtl'] .kicker { letter-spacing: 0; font-family: 'IBM Plex Sans Arabic', sans-serif; }
.cover h1 { margin: 14px 0 0; font: 900 46pt/.95 'Sofia Sans Extra Condensed', sans-serif; text-transform: uppercase; max-width: 150mm; }
[dir='rtl'] .cover h1 { font: 800 36pt/1.3 'Alexandria', sans-serif; text-transform: none; }
.cover .sub { margin: 16px 0 0; font-size: 14pt; line-height: 1.45; opacity: .85; max-width: 140mm; }
.bar { height: 6px; width: 64px; margin-top: 26px; background: var(--acc); }
.cover footer { margin-top: 38mm; padding-top: 12px; border-top: 1px solid #ffffff2e; font-size: 9pt; opacity: .7; display: flex; justify-content: space-between; }
main { padding: 0; }
h2 { margin: 26px 0 10px; font: 900 21pt/1.05 'Sofia Sans Extra Condensed', sans-serif; text-transform: uppercase; page-break-after: avoid; break-after: avoid; }
h2::before { content: ''; display: block; width: 36px; height: 4px; margin-bottom: 10px; background: var(--acc); }
[dir='rtl'] h2 { font: 800 16pt/1.4 'Alexandria', sans-serif; text-transform: none; }
h3 { margin: 18px 0 6px; font: 800 12.5pt/1.3 'Sofia Sans', sans-serif; page-break-after: avoid; break-after: avoid; }
[dir='rtl'] h3 { font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; }
p { margin: 0 0 9px; }
ul { margin: 0 0 12px; padding-inline-start: 20px; }
li { margin: 0 0 5px; }
li::marker { color: #b08a24; }
ul.task { list-style: none; padding: 0; }
ul.task li { position: relative; padding-inline-start: 26px; break-inside: avoid; }
ul.task li::before { content: ''; position: absolute; inset-inline-start: 0; top: 4px; width: 13px; height: 13px; border: 1.6px solid var(--ink); border-radius: 3px; }
.call { margin: 12px 0 16px; padding: 12px 16px; border-inline-start: 4px solid var(--acc); background: #f4efe0; border-radius: 0 8px 8px 0; break-inside: avoid; }
[dir='rtl'] .call { border-radius: 8px 0 0 8px; }
.call p:last-child { margin: 0; }
.prompt { margin: 10px 0 16px; border: 1px solid var(--rule); border-radius: 10px; overflow: hidden; break-inside: avoid; }
.prompt-k { display: block; padding: 6px 12px; background: var(--ink); color: var(--acc); font: 800 8pt/1.4 'Sofia Sans', sans-serif; letter-spacing: .12em; text-transform: uppercase; }
[dir='rtl'] .prompt-k { letter-spacing: 0; font-family: 'IBM Plex Sans Arabic', sans-serif; }
.prompt pre { margin: 0; padding: 12px 14px; white-space: pre-wrap; font: 500 9.6pt/1.55 'IBM Plex Mono', 'IBM Plex Sans Arabic', monospace; background: #fbf9f3; }
[dir='rtl'] .prompt pre { font-family: 'IBM Plex Sans Arabic', monospace; font-size: 10.4pt; }
strong { font-weight: 800; }
</style></head><body>
<section class="cover">
  <div class="brand">${markSVG({ solid: acc })}<div><b>HOOKED</b><span>ACADEMY</span></div></div>
  <p class="kicker">${esc(L[formation] || L.creative)} · ${esc(L.res)}</p>
  <h1>${esc(title)}</h1>
  ${subtitle ? `<p class="sub">${inline(subtitle)}</p>` : ''}
  <div class="bar"></div>
  <footer><span>hooked-academy</span><span>demos.bornzstudio.com/hooked-academy</span></footer>
</section>
<main>${html.replaceAll('{{PROMPT}}', esc(L.prompt))}</main>
</body></html>`;
}

/** Rend le HTML en PDF avec une page Playwright déjà ouverte (le contexte peut router les polices). */
export async function renderPdf(page, html, out, { lang = 'fr', title = '' } = {}) {
  const L = T[lang] || T.fr;
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="width:100%;font:8px sans-serif;color:#8a8577;padding:0 18mm;display:flex;justify-content:space-between;direction:${lang === 'ar' ? 'rtl' : 'ltr'}"><span>Hooked Academy</span><span>${esc(title)}</span></div>`,
    footerTemplate: `<div style="width:100%;font:8px sans-serif;color:#8a8577;padding:0 18mm;text-align:center">${esc(L.page)} <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
  });
  await writeFile(out, pdf);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [src, out] = process.argv.slice(2);
  const fi = process.argv.indexOf('--formation');
  const formation = fi > 0 ? process.argv[fi + 1] : 'creative';
  if (!src || !out) {
    console.error('Usage : node tools/hooked-academy/pdf-ressource.mjs <source.md> <sortie.pdf> [--formation creative|ia]');
    process.exit(1);
  }
  const lang = (path.basename(src).match(/\.(fr|en|ar)\.md$/) || [, 'fr'])[1];
  const md = await readFile(src, 'utf8');
  const { chromium } = await import('playwright');
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage();
  const html = await buildHtml(md, { lang, formation });
  await renderPdf(page, html, out, { lang, title: parse(md).title });
  await browser.close();
  console.log('✓', out);
}
