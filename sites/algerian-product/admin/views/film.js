// Film d'introduction : chapitres (région, produit, texte, cap de caméra, vidéo aérienne) et régions.
import { esc } from '../../store.js';
import { ALGERIA } from '../../geo.js';
import { S, ml, field, bind, t, tf, move, emptyML, confirmDo } from '../ui.js';

const KX = Math.cos((28 * Math.PI) / 180);
const B = { w: -9.2, e: 12.4, s: 18.6, n: 37.6 };
const VW = 320;
const VH = Math.round((VW * (B.n - B.s)) / ((B.e - B.w) * KX));
const px = (lon) => ((lon - B.w) / (B.e - B.w)) * VW;
const py = (lat) => ((B.n - lat) / (B.n - B.s)) * VH;
const DZ = ALGERIA.map((r) => r.reduce((d, v, k) => (k % 2 ? d : d + `${k ? 'L' : 'M'}${px(r[k]).toFixed(1)} ${py(r[k + 1]).toFixed(1)}`), '') + 'Z').join('');

export default function film(el) {
  const D = S.draft;
  let open = 0;
  const map = () => `<svg class="fmap" viewBox="0 0 ${VW} ${VH}"><path d="${DZ}"/>${D.film
    .map((f, i) => (f.lat == null ? '' : `<g transform="translate(${px(f.lon).toFixed(1)} ${py(f.lat).toFixed(1)})" class="${i === open ? 'is-on' : ''}${f.visible === false ? ' is-off' : ''}"><circle r="${i === open ? 7 : 4.5}"/><text x="9" y="4">${i + 1}</text></g>`))
    .join('')}</svg>`;

  function render() {
    el.innerHTML = `<div class="filmv">
      <aside class="card filmv__map"><header><h3>Le survol, dans l’ordre</h3><p>La caméra vole d’une région à l’autre dans cet ordre.</p></header><div id="fmap">${map()}</div>
        <p class="hint">Chaque chapitre joue sa <b>vidéo aérienne</b> en plein écran. Collez le lien de la page Pexels (ou Wikimedia Commons) : il est converti en lien direct. Les vidéos du film sont réencodées en 1080p et servies par le site pour une lecture fluide ; une nouvelle vidéo est lue depuis sa source tant qu’elle n’a pas été ajoutée à cet encodage.</p></aside>
      <div class="filmv__list">${D.film
        .map((f, i) => {
          const name = t(D.regions.find((r) => r.id === f.id)?.name) || f.id;
          return `<details class="card chap" data-i="${i}" ${i === open ? 'open' : ''}>
          <summary><b class="chap__n">${String(i + 1).padStart(2, '0')}</b><span>${esc(name)}<small>${esc(t(D.products.find((p) => p.id === f.product)?.name))}</small></span>
            <span class="prow__a"><button type="button" class="ib" data-act="up">↑</button><button type="button" class="ib" data-act="down">↓</button></span></summary>
          <div class="fgrid">
            ${field(`film.${i}.id`, 'Région (wilaya)', { options: D.regions.map((r) => [r.id, tf(r.name)]) })}
            ${field(`film.${i}.product`, 'Produit présenté', { options: [['', '—'], ...D.products.map((p) => [p.id, tf(p.name)])] })}
            ${ml(`film.${i}.area`, 'Sous-titre (zone)')}
            ${ml(`film.${i}.line`, 'Phrase du chapitre', { wide: true, max: 70 })}
            ${field(`film.${i}.lat`, 'Latitude', { type: 'number', attrs: 'step="0.01"' })}
            ${field(`film.${i}.lon`, 'Longitude', { type: 'number', attrs: 'step="0.01"' })}
            ${field(`film.${i}.heading`, 'Cap de la caméra (°)', { type: 'number', attrs: 'step="1" min="-180" max="180"', help: '0 = regard vers le nord' })}
            ${field(`film.${i}.video`, 'Vidéo aérienne (lien Pexels, Commons ou .mp4)', { type: 'url', attrs: 'placeholder="https://www.pexels.com/fr-fr/video/…"' })}
            ${field(`film.${i}.photo`, 'Photo du lieu (secours si la vidéo ne charge pas)', { type: 'url' })}
            ${field(`film.${i}.realVideo`, 'Vidéo tournée dans cette région', { type: 'checkbox' })}
            ${field(`film.${i}.visible`, 'Chapitre affiché', { type: 'checkbox' })}
            <div class="f"><button type="button" class="b b--danger b--sm" data-act="del">Retirer ce chapitre</button></div>
          </div></details>`;
        })
        .join('')}
        <button class="b b--primary" type="button" id="fadd">+ Ajouter un chapitre</button>
      </div></div>`;
    bind(el, (input) => {
      if (/\.(lat|lon|visible)$/.test(input.dataset.path)) el.querySelector('#fmap').innerHTML = map();
      if (/\.id$/.test(input.dataset.path)) {
        const i = Number(input.closest('[data-i]').dataset.i);
        const r = D.regions.find((x) => x.id === D.film[i].id);
        if (r?.lat != null) Object.assign(D.film[i], { lat: r.lat, lon: r.lon });
        S.onChange();
        render();
      }
    });
    el.querySelectorAll('details').forEach((d) => d.addEventListener('toggle', () => d.open && ((open = Number(d.dataset.i)), (el.querySelector('#fmap').innerHTML = map()))));
    el.querySelectorAll('[data-act]').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.preventDefault();
        const i = Number(b.closest('[data-i]').dataset.i);
        if (b.dataset.act === 'del') {
          if (!confirmDo('Retirer ce chapitre du film ?')) return;
          D.film.splice(i, 1);
        } else if (!move(D.film, i, b.dataset.act === 'up' ? -1 : 1)) return;
        else open = i + (b.dataset.act === 'up' ? -1 : 1);
        S.onChange();
        render();
      })
    );
    el.querySelector('#fadd').addEventListener('click', () => {
      const r = D.regions[0];
      D.film.push({ id: r.id, lat: r.lat, lon: r.lon, product: '', heading: 0, area: emptyML(), line: emptyML(), video: '', visible: true });
      open = D.film.length - 1;
      S.onChange();
      render();
    });
  }
  render();
}
