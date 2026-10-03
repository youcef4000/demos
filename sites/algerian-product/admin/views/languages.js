// Langues : activer, ajouter, choisir la langue par défaut, suivre l'avancement des traductions.
import { esc } from '../../store.js';
import { S, toast, confirmDo } from '../ui.js';

const CANDIDATES = [['de', 'Deutsch', 'ltr'], ['it', 'Italiano', 'ltr'], ['pt', 'Português', 'ltr'], ['nl', 'Nederlands', 'ltr'], ['tr', 'Türkçe', 'ltr'], ['zh', '中文', 'ltr'], ['ru', 'Русский', 'ltr'], ['ja', '日本語', 'ltr'], ['ko', '한국어', 'ltr'], ['fa', 'فارسی', 'rtl'], ['ur', 'اردو', 'rtl'], ['he', 'עברית', 'rtl'], ['sw', 'Kiswahili', 'ltr'], ['ber', 'Tamaziɣt', 'ltr']];

// Parcourt tout le contenu et compte les champs traduits pour chaque langue
export function completion(D) {
  const def = D.defaultLang || 'fr';
  let total = 0;
  const done = Object.fromEntries(D.languages.map((l) => [l.code, 0]));
  (function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (!Array.isArray(o) && typeof o[def] === 'string' && o[def]) {
      total++;
      for (const l of D.languages) if (o[l.code]) done[l.code]++;
      return;
    }
    for (const v of Object.values(o)) walk(v);
  })({ text: D.text, sectors: D.sectors, products: D.products, regions: D.regions, film: D.film, markets: D.markets, services: D.services, values: D.values, seo: D.seo, certs: D.certs });
  return { total, done };
}

export default function languages(el, app) {
  const D = S.draft;
  function render() {
    const { total, done } = completion(D);
    el.innerHTML = `<p class="hint">Ajouter une langue ne demande aucune reconstruction du site : chaque texte reçoit simplement une nouvelle traduction. Tant qu’un texte n’est pas traduit, le site affiche la langue par défaut. En production, une traduction automatique (DeepL ou IA) peut pré-remplir chaque langue, à relire ensuite.</p>
      <div class="langs">${D.languages
        .map((l, i) => {
          const pct = total ? Math.round((done[l.code] / total) * 100) : 0;
          return `<section class="card lang" data-i="${i}">
            <header><h3 lang="${esc(l.code)}" dir="${l.dir}">${esc(l.name)}</h3><span class="mono">${esc(l.code)} · ${l.dir === 'rtl' ? 'droite → gauche' : 'gauche → droite'}</span></header>
            <div class="meter"><i style="width:${pct}%"></i></div><p class="lang__pct"><b>${pct} %</b> traduit · ${done[l.code]} / ${total} textes</p>
            <div class="lang__a">
              <label class="sw"><input type="checkbox" data-en="${i}" ${l.enabled ? 'checked' : ''} ${D.defaultLang === l.code ? 'disabled' : ''}><span class="sw__ui"></span><span>Proposée sur le site</span></label>
              <label class="radio"><input type="radio" name="def" data-def="${esc(l.code)}" ${D.defaultLang === l.code ? 'checked' : ''}> Langue par défaut</label>
            </div>
            <div class="lang__b"><button type="button" class="b b--ghost b--sm" data-tr="${esc(l.code)}">Traduire les textes manquants</button>${D.defaultLang !== l.code && !['fr', 'en', 'ar', 'es'].includes(l.code) ? `<button type="button" class="b b--danger b--sm" data-rm="${i}">Supprimer</button>` : ''}</div>
          </section>`;
        })
        .join('')}
        <section class="card lang lang--add"><header><h3>Ajouter une langue</h3></header>
          <select id="lnew"><option value="">Choisir…</option>${CANDIDATES.filter(([c]) => !D.languages.some((l) => l.code === c)).map(([c, n]) => `<option value="${c}">${esc(n)} (${c})</option>`).join('')}</select>
          <p class="muted">Elle est ajoutée masquée : traduisez puis cochez « Proposée sur le site ».</p></section>
      </div>`;
    el.querySelectorAll('[data-en]').forEach((c) => c.addEventListener('change', () => ((D.languages[c.dataset.en].enabled = c.checked), S.onChange(), app.renderLangSwitch())));
    el.querySelectorAll('[data-def]').forEach((r) =>
      r.addEventListener('change', () => {
        D.defaultLang = r.dataset.def;
        D.languages.find((l) => l.code === r.dataset.def).enabled = true;
        S.onChange();
        render();
      })
    );
    el.querySelectorAll('[data-tr]').forEach((b) =>
      b.addEventListener('click', () => {
        S.lang = b.dataset.tr;
        app.renderLangSwitch();
        location.hash = 'textes?missing=1';
      })
    );
    el.querySelectorAll('[data-rm]').forEach((b) =>
      b.addEventListener('click', () => {
        const l = D.languages[b.dataset.rm];
        if (!confirmDo(`Supprimer ${l.name} et toutes ses traductions ?`)) return;
        D.languages.splice(b.dataset.rm, 1);
        if (S.lang === l.code) S.lang = D.defaultLang;
        S.onChange();
        app.renderLangSwitch();
        render();
      })
    );
    el.querySelector('#lnew').addEventListener('change', (e) => {
      const c = CANDIDATES.find((x) => x[0] === e.target.value);
      if (!c) return;
      D.languages.push({ code: c[0], name: c[1], dir: c[2], enabled: false });
      S.onChange();
      app.renderLangSwitch();
      toast(`${c[1]} ajouté. Choisissez-le en haut pour traduire.`, 'ok');
      render();
    });
  }
  render();
}
