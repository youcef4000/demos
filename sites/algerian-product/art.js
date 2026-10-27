// Identité et illustrations Algerian Product, en SVG.
// Le sceau : une étoile à huit branches (patrimoine géométrique algérien) dans un cercle (le monde),
// avec un point au centre (l'origine). Les produits sont dessinés au trait, dans un même style,
// en attendant les vraies photos que la cliente ajoutera depuis l'admin.

const star = (cx, cy, R) => {
  const r = (R * Math.cos(Math.PI / 4)) / Math.cos(Math.PI / 8);
  let d = '';
  for (let k = 0; k < 16; k++) {
    const a = (k * Math.PI) / 8 - Math.PI / 2;
    const rad = k % 2 ? r : R;
    d += `${k ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }
  return d + 'Z';
};
export const starPath = star;

// Emblème (en-tête, favicon, cartes)
export const emblem = (cls = '') => `<svg class="emblem ${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
  <circle cx="50" cy="50" r="46.5" fill="none" stroke="currentColor" stroke-width="3"/>
  <path d="${star(50, 50, 34)}" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="7" fill="currentColor"/>
</svg>`;

// Sceau complet avec texte circulaire
let sealN = 0;
export const seal = (cls = '', text = 'ALGERIAN PRODUCT · MADE IN ALGERIA · صنع في الجزائر · ') => {
  const id = `seal-path-${++sealN}`;
  return `<svg class="seal ${cls}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
  <defs><path id="${id}" d="M100 100 m-78 0 a78 78 0 1 1 156 0 a78 78 0 1 1 -156 0"/></defs>
  <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="2"/>
  <circle cx="100" cy="100" r="64" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".55"/>
  <text font-size="12.5" letter-spacing="3.2" fill="currentColor" class="seal__text"><textPath href="#${id}" textLength="486">${text}</textPath></text>
  <path d="${star(100, 100, 48)}" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
  <circle cx="100" cy="100" r="9" fill="currentColor"/>
</svg>`;
};

/* Motifs des filières (tuiles répétées) --------------------------------- */
export const PATTERNS = {
  palm: { size: 36, body: '<path d="M0 26 L18 10 L36 26 M0 36 L18 20 L36 36" fill="none" stroke="currentColor" stroke-width="1.2"/>' },
  star: { size: 44, body: `<path d="${star(22, 22, 11)}" fill="none" stroke="currentColor" stroke-width="1.1"/><circle cx="0" cy="0" r="2" fill="currentColor"/><circle cx="44" cy="0" r="2" fill="currentColor"/><circle cx="0" cy="44" r="2" fill="currentColor"/><circle cx="44" cy="44" r="2" fill="currentColor"/>` },
  weave: { size: 32, body: '<path d="M16 2 L30 16 L16 30 L2 16Z M16 10 L22 16 L16 22 L10 16Z" fill="none" stroke="currentColor" stroke-width="1.1"/>' },
  tile: { size: 40, body: '<path d="M0 20 A20 20 0 0 1 20 0 M20 40 A20 20 0 0 1 40 20 M20 0 A20 20 0 0 0 40 20 M0 20 A20 20 0 0 0 20 40" fill="none" stroke="currentColor" stroke-width="1.1"/>' },
  grid: { size: 28, body: '<path d="M0 0 H28 M0 0 V28" fill="none" stroke="currentColor" stroke-width=".7"/><path d="M14 11 V17 M11 14 H17" stroke="currentColor" stroke-width="1.1"/>' },
  arch: { size: 36, body: '<path d="M4 36 V20 A14 14 0 0 1 32 20 V36" fill="none" stroke="currentColor" stroke-width="1.1"/>' },
};
let patN = 0;
export function patternSvg(name, cls = 'pattern') {
  const p = PATTERNS[name] || PATTERNS.star;
  const id = `pat-${name}-${++patN}`;
  return `<svg class="${cls}" aria-hidden="true" focusable="false" preserveAspectRatio="none"><defs><pattern id="${id}" width="${p.size}" height="${p.size}" patternUnits="userSpaceOnUse">${p.body}</pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
}

/* Illustrations des produits (200 × 200, trait) -------------------------- */
const F = 'fill="currentColor" fill-opacity=".16"';
const rot = (x, y, a) => `transform="rotate(${a} ${x} ${y})"`;

function dates() {
  const strands = [
    'M100 58 C 86 78 76 104 70 150',
    'M100 58 C 95 86 91 116 90 160',
    'M100 58 C 106 86 111 116 113 160',
    'M100 58 C 116 78 126 104 132 148',
  ];
  const fruits = [
    [72, 118, 14], [68, 144, 8], [82, 134, 6], [90, 112, -4], [89, 140, 2], [92, 164, 0], [112, 120, -6],
    [112, 146, -2], [124, 108, -14], [130, 132, -10], [101, 128, 0], [78, 96, 20], [120, 90, -20],
  ];
  return `<path d="M100 18 C 98 34 99 46 100 58" />${strands.map((d) => `<path d="${d}" stroke-width="1.4"/>`).join('')}
  ${fruits.map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="6.5" ry="11" ${F} ${rot(x, y, a)}/>`).join('')}
  <path d="M100 30 C 120 22 140 26 158 40 M100 30 C 80 22 60 26 42 40" stroke-width="1.4" opacity=".7"/>`;
}
function oil() {
  const leaves = [[150, 150, -30], [158, 128, 30], [160, 108, -25], [166, 90, 28], [168, 72, -20]];
  return `<rect x="88" y="26" width="24" height="12" rx="2.5" ${F}/>
  <path d="M90 38 h20 v14 c0 8 20 14 20 36 v72 c0 8 -6 12 -12 12 h-36 c-6 0 -12 -4 -12 -12 v-72 c0 -22 20 -28 20 -36z"/>
  <rect x="78" y="100" width="44" height="44" rx="3" ${F}/>
  <path d="${star(100, 122, 10)}" stroke-width="1.4"/><path d="M76 160 h48" stroke-width="1.2" opacity=".6"/>
  <path d="M146 178 C 152 140 162 100 172 62" stroke-width="1.6"/>
  ${leaves.map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="13" ${F} ${rot(x, y, a)}/>`).join('')}
  <circle cx="141" cy="118" r="6" ${F}/><circle cx="174" cy="120" r="5.5" ${F}/>`;
}
function figs() {
  const seeds = [];
  for (let i = 0; i < 26; i++) {
    const a = i * 2.4;
    const r = 4 + (i % 7) * 3.2;
    seeds.push(`<circle cx="${(136 + Math.cos(a) * r * 0.9).toFixed(1)}" cy="${(124 + Math.sin(a) * r * 1.15).toFixed(1)}" r="1.3" fill="currentColor"/>`);
  }
  return `<path d="M72 56 C 66 44 78 38 84 46 C 110 54 122 88 112 118 C 104 142 66 148 52 126 C 38 102 46 68 72 56 Z" ${F}/>
  <path d="M76 48 l -6 -14 M70 34 c 8 -2 14 2 16 8" stroke-width="1.5"/>
  <path d="M60 86 C 58 104 64 122 78 132" stroke-width="1.2" opacity=".6"/>
  <path d="M138 78 C 166 84 178 118 166 142 C 154 166 118 166 106 142 C 96 120 108 84 138 78 Z"/>
  <path d="M137 92 C 156 98 160 124 152 138 C 144 152 124 152 118 138 C 112 124 118 96 137 92 Z" ${F}/>
  ${seeds.join('')}`;
}
function orange() {
  const dots = [];
  for (let i = 0; i < 22; i++) {
    const a = i * 2.39996;
    const r = 8 + ((i * 7) % 34);
    dots.push(`<circle cx="${(82 + Math.cos(a) * r).toFixed(1)}" cy="${(112 + Math.sin(a) * r).toFixed(1)}" r="1.2" fill="currentColor" opacity=".55"/>`);
  }
  const seg = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    seg.push(`M146 142 L${(146 + Math.cos(a) * 26).toFixed(1)} ${(142 + Math.sin(a) * 26).toFixed(1)}`);
  }
  return `<circle cx="82" cy="112" r="48" ${F}/>${dots.join('')}
  <path d="M82 64 c 2 -10 8 -16 16 -18 M86 58 c 10 -14 30 -18 42 -10 c -10 14 -28 18 -42 10z" stroke-width="1.5"/>
  <circle cx="146" cy="142" r="32"/><circle cx="146" cy="142" r="26" ${F}/><path d="${seg.join('')}" stroke-width="1.1"/>`;
}
function wheat() {
  const ear = (x0, y0, x1, y1) => {
    let s = `<path d="M${x0} ${y0} L${x1} ${y1}" stroke-width="1.5"/>`;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const a = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    for (let k = 0; k < 7; k++) {
      const t = 0.08 + k * 0.075;
      const cx = x1 - dx * t;
      const cy = y1 - dy * t;
      for (const side of [-1, 1]) {
        const gx = cx + -uy * side * 6;
        const gy = cy + ux * side * 6;
        s += `<ellipse cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" rx="4" ry="8" ${F} ${rot(gx.toFixed(1), gy.toFixed(1), (a + side * 28).toFixed(1))}/>`;
        s += `<path d="M${gx.toFixed(1)} ${gy.toFixed(1)} l${(ux * 22 + -uy * side * 10).toFixed(1)} ${(uy * 22 + ux * side * 10).toFixed(1)}" stroke-width=".8" opacity=".6"/>`;
      }
    }
    return s;
  };
  return ear(100, 180, 100, 30) + ear(92, 180, 52, 52) + ear(108, 180, 150, 54) + '<path d="M84 150 Q 100 158 116 150" stroke-width="2"/>';
}
function honey() {
  let hex = '';
  const H = (x, y, r) => {
    let d = '';
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 3) * k + Math.PI / 6;
      d += `${k ? 'L' : 'M'}${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`;
    }
    return d + 'Z';
  };
  for (const [x, y] of [[150, 52], [166, 61], [150, 70], [166, 79]]) hex += `<path d="${H(x, y, 9.5)}" stroke-width="1.2"/>`;
  return `<path d="M60 76 h64 v10 c 10 4 14 12 14 22 v52 c 0 10 -8 16 -18 16 h-56 c -10 0 -18 -6 -18 -16 v-52 c 0 -10 4 -18 14 -22z" ${F}/>
  <rect x="56" y="62" width="72" height="16" rx="3"/>
  <path d="M46 116 c 18 8 74 8 92 0" stroke-width="1.2" opacity=".6"/>
  <path d="M120 30 L84 100" stroke-width="2.2"/>
  <ellipse cx="80" cy="108" rx="10" ry="15" ${F} ${rot(80, 108, 28)}/>
  <path d="M73 102 l14 7 M71 108 l14 7 M70 114 l13 6" stroke-width="1.1"/>
  <path d="M76 124 c 0 6 -2 10 -2 14 a2 2 0 0 0 4 0 c 0 -4 -2 -8 -2 -14" ${F}/>${hex}`;
}
function tomato() {
  return `<path d="M58 84 v72 c 0 8 18 14 40 14 s 40 -6 40 -14 v-72" ${F}/><ellipse cx="98" cy="84" rx="40" ry="12"/>
  <path d="M58 100 c 0 7 18 13 40 13 s 40 -6 40 -13 M58 146 c 0 7 18 13 40 13 s 40 -6 40 -13" stroke-width="1.2" opacity=".6"/>
  <rect x="70" y="116" width="56" height="22" rx="2" stroke-width="1.2"/>
  <path d="${star(98, 127, 7)}" stroke-width="1.1"/>
  <circle cx="132" cy="54" r="28" ${F}/><path d="M118 44 c 4 -10 24 -10 28 0 M132 30 v-10 M124 34 l 8 4 8 -4" stroke-width="1.5"/>`;
}
function carpet() {
  let fr = '';
  for (let x = 56; x <= 144; x += 5) fr += `M${x} 30 v-10 M${x} 170 v10 `;
  let lz = '';
  for (const y of [62, 100, 138]) lz += `<path d="M100 ${y - 18} L122 ${y} L100 ${y + 18} L78 ${y}Z" ${F}/><path d="M100 ${y - 8} L110 ${y} L100 ${y + 8} L90 ${y}Z"/>`;
  let tri = '';
  for (let y = 40; y < 162; y += 12) tri += `M62 ${y} l6 6 -6 6 M138 ${y} l-6 6 6 6 `;
  return `<path d="${fr}" stroke-width="1.1" opacity=".7"/><rect x="54" y="30" width="92" height="140" rx="1.5"/>
  <rect x="60" y="36" width="80" height="128" stroke-width="1.2"/>${lz}<path d="${tri}" stroke-width="1.1"/>`;
}
function tray() {
  let petals = '';
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const x = 100 + Math.cos(a) * 44;
    const y = 112 + Math.sin(a) * 23;
    petals += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7" ry="3.6" ${rot(x.toFixed(1), y.toFixed(1), ((a * 180) / Math.PI + 90).toFixed(1))} stroke-width="1"/>`;
  }
  return `<ellipse cx="100" cy="116" rx="78" ry="42" ${F}/><ellipse cx="100" cy="112" rx="78" ry="42"/>
  <ellipse cx="100" cy="112" rx="66" ry="35" stroke-width="1.2"/><ellipse cx="100" cy="112" rx="30" ry="16" stroke-width="1.2"/>
  ${petals}<path d="${star(100, 112, 12)}" stroke-width="1.2" transform="translate(0 56) scale(1 .5)"/>
  <path d="M136 44 c 0 -8 10 -12 16 -8 l 6 4 M140 42 h-18 l 4 26 h12 z M132 40 v-6" stroke-width="1.5"/>`;
}
function pot() {
  let zig = 'M70 96';
  for (let x = 70; x <= 130; x += 7.5) zig += ` L${x + 3.75} ${zig.length % 2 ? 88 : 104} L${x + 7.5} 96`;
  return `<path d="M84 34 h32 v10 c 0 6 -4 8 -4 12 c 22 10 34 30 34 56 c 0 34 -24 58 -46 58 s -46 -24 -46 -58 c 0 -26 12 -46 34 -56 c 0 -4 -4 -6 -4 -12z" ${F}/>
  <path d="M88 60 c -24 -2 -36 14 -30 34 M112 60 c 24 -2 36 14 30 34" stroke-width="1.8"/>
  <path d="M66 82 h68 M62 110 h76" stroke-width="1.2"/>
  <path d="M72 82 L80 110 L88 82 L96 110 L104 82 L112 110 L120 82 L128 110" stroke-width="1.2"/>
  <path d="M70 130 l8 10 8 -10 8 10 8 -10 8 10 8 -10 8 10 8 -10" stroke-width="1.2"/>
  <circle cx="100" cy="150" r="3" fill="currentColor"/><circle cx="88" cy="154" r="2" fill="currentColor"/><circle cx="112" cy="154" r="2" fill="currentColor"/>`;
}
function silver() {
  return `<circle cx="100" cy="40" r="16"/><circle cx="100" cy="40" r="9" ${F}/>
  <path d="M100 56 L120 96 L100 92 L80 96Z" ${F}/>
  <path d="M100 92 C 88 104 60 104 52 116 C 60 128 88 128 100 140 C 112 128 140 128 148 116 C 140 104 112 104 100 92Z"/>
  <path d="M100 140 L114 170 L100 178 L86 170Z" ${F}/>
  <circle cx="100" cy="116" r="9"/><circle cx="52" cy="116" r="4" fill="currentColor"/><circle cx="148" cy="116" r="4" fill="currentColor"/>
  <path d="M70 116 h8 M122 116 h8 M100 100 v6 M100 126 v6" stroke-width="1.2"/>`;
}
function embroidery() {
  let ros = '';
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 360;
    ros += `<path d="M96 104 C 104 86 112 80 96 64 C 80 80 88 86 96 104Z" ${F} transform="rotate(${a} 96 104)" stroke-width="1.2"/>`;
  }
  return `<circle cx="96" cy="104" r="64"/><circle cx="96" cy="104" r="56" stroke-width="1.2"/>
  <path d="M146 54 l8 -8 M150 58 l8 -8" stroke-width="2"/>${ros}<circle cx="96" cy="104" r="8" fill="currentColor"/>
  <path d="M150 150 L178 178" stroke-width="2"/><ellipse cx="148" cy="148" rx="2" ry="5" ${rot(148, 148, -45)}/>
  <path d="M148 148 C 136 160 120 150 108 162 S 84 172 74 166" stroke-width="1.2" stroke-dasharray="3 3"/>`;
}
function denim() {
  return `<ellipse cx="62" cy="86" rx="22" ry="40" ${F}/><ellipse cx="62" cy="86" rx="8" ry="15"/>
  <path d="M62 46 H150 C 162 46 168 66 168 86 V 168 H 62 V 126" />
  <path d="M74 140 H 158 M74 146 H 158" stroke-width="1.1" stroke-dasharray="4 3"/>
  <path d="M120 64 V 126 M126 64 V 126" stroke-width="1.1" stroke-dasharray="4 3"/>
  <circle cx="142" cy="100" r="4" fill="currentColor"/><circle cx="104" cy="100" r="4" fill="currentColor"/>
  <path d="M84 72 h18 v20 l-9 5 -9 -5z" stroke-width="1.2"/>`;
}
function tiles() {
  let s = '';
  const t = 40;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const x = 40 + i * t;
      const y = 40 + j * t;
      s += `<rect x="${x}" y="${y}" width="${t}" height="${t}" stroke-width="1.2"/>`;
      s += `<path d="M${x} ${y + t / 2} A${t / 2} ${t / 2} 0 0 1 ${x + t / 2} ${y} M${x + t / 2} ${y + t} A${t / 2} ${t / 2} 0 0 1 ${x + t} ${y + t / 2}" stroke-width="1.1"/>`;
      if ((i + j) % 2 === 0) s += `<path d="${star(x + t / 2, y + t / 2, 9)}" ${F} stroke-width="1"/>`;
    }
  }
  return s;
}
function cement() {
  let st = '';
  for (let x = 50; x <= 118; x += 6) st += `M${x} 52 l3 -6 `;
  return `<path d="M44 56 C 44 50 50 48 56 48 H 116 C 122 48 128 50 128 56 L 132 160 C 132 168 126 172 118 172 H 54 C 46 172 40 168 40 160 Z" ${F}/>
  <path d="${st}" stroke-width="1.1"/><path d="M46 60 H126" stroke-width="1.2"/>
  <circle cx="86" cy="108" r="22" stroke-width="1.2"/><path d="${star(86, 108, 14)}" stroke-width="1.2"/>
  <path d="M60 146 h52" stroke-width="1.2"/>
  <rect x="140" y="148" width="40" height="24" ${F}/><rect x="146" y="124" width="40" height="24" ${F}/><rect x="140" y="100" width="40" height="24"/>`;
}
function glass() {
  return `<path d="M44 40 L120 30 L132 150 L56 160Z" ${F}/><path d="M78 56 L118 50 L126 132 L86 138Z" stroke-width="1.1" opacity=".55"/>
  <path d="M64 60 l22 -3 M62 74 l12 -2" stroke-width="1.4"/>
  <path d="M148 64 h16 v18 c 0 4 10 8 10 18 v66 c 0 4 -4 6 -8 6 h-20 c -4 0 -8 -2 -8 -6 v-66 c 0 -10 10 -14 10 -18z"/>
  <path d="M150 110 v40" stroke-width="1.4" opacity=".6"/>`;
}
function appliance() {
  let pins = '';
  for (let k = 0; k < 6; k++) {
    const o = 66 + k * 13.6;
    pins += `M${o} 46 v-16 M${o} 154 v16 M46 ${o} h-16 M154 ${o} h16 `;
  }
  return `<path d="${pins}" stroke-width="1.6"/><rect x="46" y="46" width="108" height="108" rx="8" ${F}/>
  <rect x="70" y="70" width="60" height="60" rx="3"/><path d="${star(100, 100, 18)}" stroke-width="1.2"/>
  <circle cx="58" cy="58" r="3" fill="currentColor"/><path d="M130 84 h12 M130 116 h12 M58 100 h12" stroke-width="1.1"/>`;
}
function cactus() {
  let sp = '';
  for (const [x, y] of [[80, 120], [92, 140], [70, 146], [124, 96], [132, 116], [110, 76], [84, 98]]) sp += `<path d="M${x} ${y} l3 -3 M${x} ${y} l-3 -3" stroke-width="1"/>`;
  return `<ellipse cx="82" cy="134" rx="26" ry="36" ${F} ${rot(82, 134, -12)}/><ellipse cx="124" cy="110" rx="20" ry="30" ${F} ${rot(124, 110, 18)}/>
  <ellipse cx="96" cy="84" rx="16" ry="24" ${F} ${rot(96, 84, -6)}/>${sp}
  <ellipse cx="96" cy="52" rx="8" ry="11"/><ellipse cx="114" cy="62" rx="7" ry="10" ${rot(114, 62, 25)}/><ellipse cx="136" cy="78" rx="7" ry="10" ${rot(136, 78, 40)}/>
  <path d="M150 128 h14 v10 h4 v38 c0 3 -2 4 -4 4 h-18 c-2 0 -4 -1 -4 -4 v-38 h4 z M152 128 v-8 h10 v8" stroke-width="1.5"/>`;
}
function soap() {
  return `<path d="M40 112 L100 86 L164 108 L104 136Z" ${F}/><path d="M40 112 v22 L104 160 v-24 M164 108 v22 L104 160"/>
  <path d="M40 112 L100 86 L164 108 L104 136Z"/><path d="${star(102, 111, 14)}" transform="translate(0 55.5) scale(1 .5)" stroke-width="1.2"/>
  <circle cx="58" cy="62" r="12" stroke-width="1.2"/><circle cx="80" cy="44" r="7" stroke-width="1.2"/><circle cx="140" cy="60" r="9" stroke-width="1.2"/><circle cx="160" cy="40" r="5" stroke-width="1.2"/>`;
}
function rose() {
  return `<path d="M78 70 C 64 62 50 74 54 92 C 58 112 80 122 96 116 C 114 110 120 90 112 78 C 104 66 90 66 84 76 C 78 86 86 98 96 96 C 104 94 104 84 98 82" ${F}/>
  <path d="M54 92 C 44 98 46 116 60 122 M112 78 C 124 74 130 90 122 102" stroke-width="1.3"/>
  <path d="M90 120 C 90 140 86 158 80 178 M86 150 c -12 -6 -22 -2 -28 6 c 10 4 20 2 28 -6z" stroke-width="1.5"/>
  <path d="M138 58 h18 v14 c 14 6 22 20 22 36 c 0 26 -18 44 -40 44 c -6 0 -12 -1 -16 -3" />
  <path d="M138 58 v14 c -8 3 -14 8 -18 14" /><path d="M126 120 c 12 8 34 8 46 0" stroke-width="1.2" opacity=".6"/>`;
}

const ART = { dates, oil, figs, orange, wheat, honey, tomato, carpet, tray, pot, silver, embroidery, denim, tiles, cement, glass, appliance, cactus, soap, rose };
export const ART_KEYS = Object.keys(ART);

export function illustration(key, cls = 'illus') {
  const fn = ART[key] || appliance;
  return `<svg class="${cls}" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${fn()}</svg>`;
}

// Visuel d'un produit : photo si la cliente en a ajouté une, sinon illustration sur sa couleur
export function productVisual(p, sector, { cls = '' } = {}) {
  const color = p.color || sector?.color || '#3b3b3b';
  if (p.image) {
    return `<div class="pv pv--photo ${cls}" style="--pc:${color}"><img src="${p.image}" alt="" loading="lazy" decoding="async"></div>`;
  }
  return `<div class="pv ${cls}" style="--pc:${color}">${patternSvg(sector?.pattern || 'star', 'pv__pattern')}${illustration(p.art, 'pv__illus')}</div>`;
}

/* Icônes d'interface ----------------------------------------------------- */
const I = {
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.6 5.4 3.6 8.5s-1 6.1-3.6 8.5c-2.6-2.4-3.6-5.4-3.6-8.5s1-6.1 3.6-8.5z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
  pause: '<path d="M8 5.5v13M16 5.5v13" stroke-width="2.6"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.6"/>',
  phone: '<path d="M5 3.5h3.2l1.6 4.2-2.2 1.4a11 11 0 0 0 5.3 5.3l1.4-2.2 4.2 1.6V17a2.5 2.5 0 0 1-2.7 2.5A15.5 15.5 0 0 1 2.5 6.2 2.5 2.5 0 0 1 5 3.5z"/>',
  wa: '<path d="M12 2.6a9.4 9.4 0 0 0-8.1 14.1L2.6 21.4l4.8-1.3A9.4 9.4 0 1 0 12 2.6zm4.3 11.3c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.4 6.4 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1c0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2l-.4-.3z" fill="currentColor" stroke="none"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5V16M8 7.6v.1M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.3-2.6s2.2.9 2.2 2.6V16"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>',
  facebook: '<path d="M14 8.5h2.5V5H14c-2.2 0-3.5 1.5-3.5 3.6V11H8v3.4h2.5V21H14v-6.6h2.4l.6-3.4h-3V9.3c0-.5.3-.8 1-.8z"/>',
  tiktok: '<path d="M14 4v10.5a3.5 3.5 0 1 1-3-3.46M14 4c.4 2.4 2 4 4.5 4.2"/>',
  youtube: '<rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="M10.5 9.5v5l4-2.5z" fill="currentColor"/>',
  // services
  sourcing: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M8 10.5c0-1.6 1-2.6 2.5-2.6"/>',
  quality: `<path d="${star(12, 12, 9)}"/><path d="M8.6 12.2l2.3 2.3 4.4-4.6"/>`,
  packaging: '<path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5L12 11.5l8.5-4M12 11.5v9"/>',
  logistics: '<path d="M2.5 15.5h19l-2.5 4h-14z"/><path d="M5 15.5v-5h6v5M11 15.5v-8h6v8M8 10.5v5M14 7.5v8"/>',
  support: '<path d="M4 5.5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3.5v-3.5H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z"/><path d="M19 9.5h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2v2.5l-3-2.5h-4"/>',
};
export const icon = (name, cls = 'i') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${I[name] || ''}</svg>`;
