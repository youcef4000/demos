// Illustrations vectorielles des vidéos : produits d'exemple, personnages, fonds de « photo ».
// Tout est dessiné ici (aucune image externe) pour que le rendu soit identique à l'écran et en MP4.

let uid = 0;
const id = (p) => `${p}${++uid}`;

/** Générateur pseudo-aléatoire à graine : le rendu d'une image est toujours le même. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Flacon de parfum : verre, liquide ambré, bouchon or. */
export function perfume({ liquid = ['#f6c870', '#b86a1c'], cap = ['#f2dfa0', '#8c6b3f'], label = 'NOOR' } = {}) {
  const g = id('pf');
  return `<svg class="art art-perfume" viewBox="0 0 200 300" aria-hidden="true">
  <defs>
    <linearGradient id="${g}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${liquid[0]}"/><stop offset="1" stop-color="${liquid[1]}"/></linearGradient>
    <linearGradient id="${g}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${cap[1]}"/><stop offset=".45" stop-color="${cap[0]}"/><stop offset="1" stop-color="${cap[1]}"/></linearGradient>
    <linearGradient id="${g}v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".2" stop-color="#fff" stop-opacity=".05"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient>
    <radialGradient id="${g}s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="100" cy="286" rx="78" ry="10" fill="url(#${g}s)"/>
  <rect x="78" y="22" width="44" height="46" rx="6" fill="url(#${g}c)"/>
  <rect x="86" y="62" width="28" height="18" rx="3" fill="${cap[1]}"/>
  <rect x="26" y="78" width="148" height="200" rx="26" fill="url(#${g}l)" opacity=".92"/>
  <rect x="26" y="78" width="148" height="200" rx="26" fill="url(#${g}v)"/>
  <rect x="26" y="78" width="148" height="200" rx="26" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
  <rect x="58" y="150" width="84" height="56" rx="4" fill="#07060a" fill-opacity=".72"/>
  <text x="100" y="185" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="700" font-stretch="125%" font-size="17" letter-spacing="4" fill="#f2dfa0">${label}</text>
  <rect x="40" y="92" width="10" height="160" rx="5" fill="#fff" opacity=".28"/>
</svg>`;
}

/** Pot de crème. */
export function jar({ body = ['#f5efe6', '#cdbfa9'], lid = ['#e0be55', '#8c6b3f'], label = 'SOIN' } = {}) {
  const g = id('jr');
  return `<svg class="art art-jar" viewBox="0 0 240 200" aria-hidden="true">
  <defs>
    <linearGradient id="${g}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${body[1]}"/><stop offset=".4" stop-color="${body[0]}"/><stop offset="1" stop-color="${body[1]}"/></linearGradient>
    <linearGradient id="${g}l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${lid[1]}"/><stop offset=".45" stop-color="${lid[0]}"/><stop offset="1" stop-color="${lid[1]}"/></linearGradient>
    <radialGradient id="${g}s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="120" cy="188" rx="100" ry="10" fill="url(#${g}s)"/>
  <rect x="30" y="74" width="180" height="110" rx="18" fill="url(#${g}b)"/>
  <rect x="22" y="36" width="196" height="50" rx="12" fill="url(#${g}l)"/>
  <rect x="70" y="110" width="100" height="40" rx="4" fill="#07060a" fill-opacity=".08"/>
  <text x="120" y="137" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="700" font-stretch="125%" font-size="17" letter-spacing="5" fill="#5b4a2d">${label}</text>
</svg>`;
}

/** Sérum à pipette. */
export function serum({ glass = ['#7fc8b3', '#2f6f5d'], label = 'SÉRUM' } = {}) {
  const g = id('sr');
  return `<svg class="art art-serum" viewBox="0 0 140 300" aria-hidden="true">
  <defs>
    <linearGradient id="${g}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${glass[1]}"/><stop offset=".4" stop-color="${glass[0]}"/><stop offset="1" stop-color="${glass[1]}"/></linearGradient>
    <radialGradient id="${g}s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="70" cy="290" rx="56" ry="8" fill="url(#${g}s)"/>
  <rect x="52" y="10" width="36" height="58" rx="18" fill="#1b1716"/>
  <rect x="58" y="64" width="24" height="26" rx="4" fill="#e0be55"/>
  <rect x="22" y="88" width="96" height="196" rx="20" fill="url(#${g}g)"/>
  <rect x="34" y="150" width="72" height="70" rx="4" fill="#f6f2ea" fill-opacity=".9"/>
  <text x="70" y="191" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="700" font-stretch="112%" font-size="14" letter-spacing="2" fill="#2f6f5d">${label}</text>
  <rect x="32" y="100" width="8" height="160" rx="4" fill="#fff" opacity=".3"/>
</svg>`;
}

/** Personnage simplifié (UGC, avatar, client). `mood` : neutral | smile | talk */
export function person({ skin = '#d9a77f', hair = '#2a1d17', top = '#c9a227', mood = 'smile', hijab = false } = {}) {
  const g = id('ps');
  const mouth =
    mood === 'talk'
      ? '<ellipse class="mouth" cx="100" cy="118" rx="9" ry="6" fill="#5a2a22"/>'
      : mood === 'smile'
        ? '<path d="M88 114q12 12 24 0" fill="none" stroke="#5a2a22" stroke-width="4" stroke-linecap="round"/>'
        : '<path d="M90 117h20" stroke="#5a2a22" stroke-width="4" stroke-linecap="round"/>';
  const hairShape = hijab
    ? `<path d="M48 104q0-64 52-64t52 64v40q-20 26-52 26t-52-26Z" fill="${hair}"/>`
    : `<path d="M54 92q-2-52 46-54 50 0 48 54-8-22-48-24-38 2-46 24Z" fill="${hair}"/>`;
  return `<svg class="art art-person" viewBox="0 0 200 240" aria-hidden="true">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="#07060a"/></linearGradient></defs>
  <path d="M22 240q6-66 78-70 72 4 78 70Z" fill="url(#${g})"/>
  <rect x="86" y="132" width="28" height="40" rx="10" fill="${skin}"/>
  ${hijab ? hairShape : ''}
  <ellipse cx="100" cy="96" rx="44" ry="50" fill="${skin}"/>
  ${hijab ? '' : hairShape}
  <circle class="eye" cx="84" cy="94" r="5" fill="#1a1210"/><circle class="eye" cx="116" cy="94" r="5" fill="#1a1210"/>
  <path d="M76 80q8-6 16 0M108 80q8-6 16 0" fill="none" stroke="#1a1210" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>
  ${mouth}
</svg>`;
}

/** Fond de « photo » : dégradés doux qui évoquent un décor. */
export const BG = {
  studio: 'radial-gradient(120% 90% at 50% 30%, #3a2c14 0%, #120e09 60%, #07060a 100%)',
  teal: 'radial-gradient(110% 90% at 50% 25%, #7fd3c3 0%, #3a8f84 55%, #1c4b45 100%)',
  sable: 'radial-gradient(120% 90% at 50% 20%, #f3e3c4 0%, #d6b98a 55%, #8a6a45 100%)',
  rose: 'radial-gradient(120% 90% at 50% 25%, #f5cfc6 0%, #d58f86 55%, #6c3b3a 100%)',
  nuit: 'radial-gradient(120% 90% at 50% 20%, #2b3350 0%, #151a2c 60%, #07060a 100%)',
  bain: 'linear-gradient(180deg, #e9eef0 0%, #c9d4d8 60%, #9fb0b6 100%)',
  cuisine: 'linear-gradient(180deg, #f2e6d6 0%, #d9c3a6 55%, #8c6f4f 100%)',
  or: 'radial-gradient(120% 90% at 50% 20%, #f2dfa0 0%, #c9a227 55%, #5c4511 100%)',
};

/** Choisit l'illustration produit d'après un nom court. */
export function product(kind = 'parfum', opts = {}) {
  if (kind === 'creme') return jar(opts);
  if (kind === 'serum') return serum(opts);
  return perfume(opts);
}
