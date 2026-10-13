// Marque Hooked Academy : monogramme et logo, en SVG inline (les polices du site s'appliquent).
// Le monogramme reprend la géométrie de Hooked Lab : deux piliers et deux barres courtes.
// Ici les deux barres se redressent en chevron : le H « monte d'un niveau ».

let n = 0;

/** Monogramme seul. `lab: true` dessine l'état Hooked Lab (barres droites), utile pour l'animation. */
export function markSVG({ cls = '', lab = false, solid = '' } = {}) {
  const id = `ha-or-${++n}`;
  const fill = solid || `url(#${id})`;
  const legs = lab
    ? '<path class="ha-leg ha-leg--g" d="M19.75 21 19.75 27"/><path class="ha-leg ha-leg--d" d="M28.25 21 28.25 27"/>'
    : '<path class="ha-leg ha-leg--g" d="M19.4 29.2 24 18.8"/><path class="ha-leg ha-leg--d" d="M28.6 29.2 24 18.8"/>';
  return `<svg class="ha-mark ${cls}" viewBox="0 0 48 48" aria-hidden="true">${
    solid ? '' : `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="9" x2="0" y2="39"><stop offset="0" stop-color="#f2dfa0"/><stop offset="1" stop-color="#b08a24"/></linearGradient></defs>`
  }<g fill="${fill}"><rect class="ha-pilier" x="8.5" y="9" width="5.5" height="30" rx="2.75"/><rect class="ha-pilier" x="34" y="9" width="5.5" height="30" rx="2.75"/></g><g fill="none" stroke="${fill}" stroke-width="5.5" stroke-linecap="round">${legs}</g></svg>`;
}

/** Contenu du logo (pastille + HOOKED / ACADEMY), à placer dans un élément .ha-logo. */
export const logoInner = () => `<span class="ha-logo__pastille">${markSVG()}</span><span class="ha-logo__nom"><b>HOOKED</b><span>ACADEMY</span></span>`;

/** Logo complet. */
export function logoHTML({ href = '', label = 'Hooked Academy', cls = '' } = {}) {
  const tag = href ? 'a' : 'span';
  return `<${tag} class="ha-logo ${cls}"${href ? ` href="${href}"` : ''} aria-label="${label}">${logoInner()}</${tag}>`;
}

/** Points des deux barres du milieu, de l'état Lab (droites) à l'état Academy (chevron). */
export const LEGS = {
  lab: [
    [19.75, 27, 19.75, 21],
    [28.25, 27, 28.25, 21],
  ],
  academy: [
    [19.4, 29.2, 24, 18.8],
    [28.6, 29.2, 24, 18.8],
  ],
};

/** Anime le passage Lab -> Academy sur un monogramme dessiné avec `lab: true`. Renvoie une timeline GSAP. */
export function morphMark(svg, gsap, { duration = 0.9, ease = 'expo.inOut' } = {}) {
  const legs = svg.querySelectorAll('.ha-leg');
  const tl = gsap.timeline();
  legs.forEach((leg, i) => {
    const p = { t: 0 };
    const [a, b] = [LEGS.lab[i], LEGS.academy[i]];
    tl.to(
      p,
      {
        t: 1,
        duration,
        ease,
        onUpdate: () => {
          const v = a.map((x, k) => x + (b[k] - x) * p.t);
          leg.setAttribute('d', `M${v[0].toFixed(2)} ${v[1].toFixed(2)} ${v[2].toFixed(2)} ${v[3].toFixed(2)}`);
        },
      },
      0,
    );
  });
  return tl;
}
