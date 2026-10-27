// Marchés visés : pays, villes, statut (prioritaire, en développement, prochainement).
import { esc } from '../../store.js';
import { S, bind, countryName, ISO, confirmDo, emptyML } from '../ui.js';

const STATUS = [['priority', 'Prioritaire'], ['developing', 'En développement'], ['soon', 'Prochainement']];
// Coordonnées par défaut (capitale ou grand port) pour placer un nouveau pays sur la carte
const CAP = { DE: [53.55, 9.99], IT: [41.9, 12.5], NL: [51.92, 4.48], PT: [38.72, -9.14], CH: [46.2, 6.14], TN: [36.8, 10.18], MA: [33.57, -7.59], EG: [30.04, 31.24], KW: [29.37, 47.98], OM: [23.59, 58.41], BH: [26.23, 50.59], JO: [31.95, 35.93], NG: [6.45, 3.4], ML: [12.64, -8], NE: [13.51, 2.11], MR: [18.08, -15.98], GH: [5.6, -0.19], CM: [4.05, 9.7], RU: [55.75, 37.62], JP: [35.68, 139.69], KR: [37.57, 126.98], IN: [19.08, 72.88], MY: [3.14, 101.69], ID: [-6.2, 106.85], BR: [-23.55, -46.63], MX: [19.43, -99.13], AU: [-33.87, 151.21], SE: [59.33, 18.07], PL: [52.23, 21.01] };

export default function markets(el) {
  const D = S.draft;
  function render() {
    el.innerHTML = `<p class="hint">Ces pays apparaissent sur la carte du monde de l’accueil, reliés à Alger. Les noms de pays sont traduits automatiquement dans chaque langue du site.</p>
      <div class="table-wrap"><table class="table table--edit"><thead><tr><th>Pays</th><th>Villes (${S.lang.toUpperCase()})</th><th>Statut</th><th>Lat.</th><th>Lon.</th><th>Affiché</th><th></th></tr></thead><tbody>
      ${D.markets
        .map(
          (m, i) => `<tr data-i="${i}">
          <td><select data-path="markets.${i}.code">${ISO.map((c) => `<option value="${c}"${c === m.code ? ' selected' : ''}>${esc(countryName(c))}</option>`).join('')}</select></td>
          <td><input type="text" data-path="markets.${i}.city.${S.lang}" value="${esc(m.city?.[S.lang] || '')}" placeholder="${esc(m.city?.fr || '')}"></td>
          <td><select data-path="markets.${i}.status">${STATUS.map(([v, l]) => `<option value="${v}"${v === m.status ? ' selected' : ''}>${l}</option>`).join('')}</select></td>
          <td><input type="number" step="0.01" data-path="markets.${i}.lat" value="${m.lat}"></td>
          <td><input type="number" step="0.01" data-path="markets.${i}.lon" value="${m.lon}"></td>
          <td><label class="sw"><input type="checkbox" data-path="markets.${i}.visible" ${m.visible !== false ? 'checked' : ''}><span class="sw__ui"></span></label></td>
          <td><button type="button" class="ib" data-del="${i}" title="Retirer">✕</button></td></tr>`
        )
        .join('')}</tbody></table></div>
      <div class="bar"><select id="m-new" class="bar__select"><option value="">Ajouter un pays…</option>${ISO.filter((c) => !D.markets.some((m) => m.code === c)).map((c) => `<option value="${c}">${esc(countryName(c))}</option>`).join('')}</select></div>`;
    bind(el, (input) => {
      if (input.dataset.path.endsWith('.code')) {
        const m = D.markets[input.closest('[data-i]').dataset.i];
        if (CAP[m.code]) [m.lat, m.lon] = CAP[m.code];
        S.onChange();
        render();
      }
    });
    el.querySelectorAll('[data-del]').forEach((b) =>
      b.addEventListener('click', () => {
        if (!confirmDo('Retirer ce marché ?')) return;
        D.markets.splice(Number(b.dataset.del), 1);
        S.onChange();
        render();
      })
    );
    el.querySelector('#m-new').addEventListener('change', (e) => {
      const c = e.target.value;
      if (!c) return;
      const [lat, lon] = CAP[c] || [0, 0];
      D.markets.push({ id: c.toLowerCase(), code: c, city: emptyML(), lat, lon, status: 'soon', visible: true });
      S.onChange();
      render();
    });
  }
  render();
}
