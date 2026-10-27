// Villa Lumen — plans dessinés en SVG : un plan par pièce, le plan du rez-de-jardin,
// la Palm Jumeirah et le quartier. Les tracés portent pathLength="1" pour être animés.

const S = 10; // 1 m = 10 unités SVG
const f = (n) => String(n.toFixed(2)).replace('.', ',').replace(/,00$/, '').replace(/(,\d)0$/, '$1');

/* ---------------- pièces (mètres, x vers la mer, y vers le sud) ---------------- */
export const ROOMS = {
  entree: {
    name: 'Hall d\'entrée', w: 6, h: 4.8,
    open: [
      { side: 'w', at: 1.6, len: 1.6, kind: 'door' },
      { side: 'e', at: 0.6, len: 3.4, kind: 'open' },
      { side: 's', at: 4.2, len: 1.2, kind: 'door' },
    ],
    items: [
      { t: 'stairs', x: 0.4, y: 0.3, w: 3.8, h: 1.2, n: 14, label: 'Escalier' },
      { t: 'rect', x: 0.3, y: 4.0, w: 2.2, h: 0.45 },
      { t: 'circle', x: 3.6, y: 3.0, r: 0.9, dash: true },
    ],
    cam: { x: 5.1, y: 4.1, a: -150 },
  },
  sejour: {
    name: 'Séjour', w: 11.4, h: 7.2,
    open: [
      { side: 'w', at: 2.8, len: 3.4, kind: 'open' },
      { side: 'n', at: 0.8, len: 6.4, kind: 'open' },
      { side: 'e', at: 0.4, len: 6.4, kind: 'slide', label: 'Baie coulissante 6,40 m' },
      { side: 's', at: 1.4, len: 1.2, kind: 'door' },
    ],
    items: [
      { t: 'rect', x: 4.2, y: 2.6, w: 4.4, h: 3.2, dash: true },
      { t: 'rect', x: 4.6, y: 2.9, w: 3.6, h: 0.95, r: 0.25 },
      { t: 'rect', x: 7.2, y: 2.9, w: 1.0, h: 2.4, r: 0.25 },
      { t: 'circle', x: 5.8, y: 4.6, r: 0.6 },
      { t: 'circle', x: 4.9, y: 5.9, r: 0.45 },
      { t: 'rect', x: 0.3, y: 0.8, w: 0.5, h: 1.8 },
    ],
    cam: { x: 1.2, y: 6.4, a: -18 },
  },
  cuisine: {
    name: 'Cuisine', w: 7.8, h: 5.6,
    open: [
      { side: 's', at: 0, len: 7.8, kind: 'open' },
      { side: 'e', at: 1.6, len: 1.0, kind: 'door' },
      { side: 'w', at: 1.2, len: 3.0, kind: 'window' },
    ],
    items: [
      { t: 'rect', x: 0.3, y: 0.05, w: 7.2, h: 0.65, label: 'Plan Calacatta' },
      { t: 'rect', x: 1.8, y: 2.1, w: 4.2, h: 1.2, r: 0.1, label: 'Îlot 4,20 m' },
      { t: 'circle', x: 2.4, y: 3.7, r: 0.22 }, { t: 'circle', x: 3.4, y: 3.7, r: 0.22 },
      { t: 'circle', x: 4.4, y: 3.7, r: 0.22 }, { t: 'circle', x: 5.4, y: 3.7, r: 0.22 },
    ],
    cam: { x: 7.2, y: 5.1, a: -150 },
  },
  suite: {
    name: 'Suite parentale', w: 8.4, h: 6.2,
    open: [
      { side: 'n', at: 1.4, len: 1.2, kind: 'door' },
      { side: 'e', at: 3.4, len: 1.0, kind: 'door' },
      { side: 's', at: 1.0, len: 6.2, kind: 'window', label: 'Vue jardin & mer' },
    ],
    items: [
      { t: 'rect', x: 0.3, y: 1.9, w: 2.3, h: 2.2, r: 0.1, label: 'Lit' },
      { t: 'rect', x: 0.3, y: 1.3, w: 0.5, h: 0.5 }, { t: 'rect', x: 0.3, y: 4.2, w: 0.5, h: 0.5 },
      { t: 'rect', x: 2.8, y: 2.4, w: 0.5, h: 1.2, r: 0.1 },
      { t: 'rect', x: 5.8, y: 0.3, w: 2.3, h: 2.6, dash: true, label: 'Dressing' },
      { t: 'circle', x: 6.9, y: 4.9, r: 0.45 },
    ],
    cam: { x: 7.4, y: 5.5, a: -168 },
  },
  bain: {
    name: 'Salle de bain', w: 4.8, h: 6.2,
    open: [
      { side: 'w', at: 3.4, len: 1.0, kind: 'door' },
      { side: 'e', at: 1.0, len: 4.2, kind: 'window', label: 'Fenêtre sur la loggia' },
    ],
    items: [
      { t: 'ellipse', x: 3.2, y: 3.0, rx: 0.5, ry: 0.95, label: 'Baignoire îlot' },
      { t: 'rect', x: 0.3, y: 0.3, w: 0.6, h: 2.6, label: 'Double vasque' },
      { t: 'rect', x: 0.3, y: 4.6, w: 1.9, h: 1.3, hatch: true, label: 'Douche' },
    ],
    cam: { x: 1.2, y: 0.9, a: 55 },
  },
  terrasse: {
    name: 'Terrasse & bassin', w: 7.8, h: 19,
    open: [
      { side: 'w', at: 5.6, len: 7.2, kind: 'slide' },
      { side: 'e', at: 0, len: 19, kind: 'edge', label: 'Accès direct à la plage' },
    ],
    items: [
      { t: 'pool', x: 1.8, y: 1.5, w: 4.5, h: 12, label: 'Bassin 12 × 4,5 m' },
      { t: 'rect', x: 0.3, y: 3.0, w: 1.2, h: 0.6, r: 0.1 }, { t: 'rect', x: 0.3, y: 4.2, w: 1.2, h: 0.6, r: 0.1 },
      { t: 'rect', x: 0.3, y: 5.4, w: 1.2, h: 0.6, r: 0.1 },
      { t: 'rect', x: 1.8, y: 15.2, w: 3.6, h: 1.0, r: 0.25 },
      { t: 'circle', x: 3.6, y: 17.2, r: 0.6 },
    ],
    cam: { x: 1.2, y: 17.8, a: -72 },
  },
};

// plan du rez-de-jardin (mètres)
export const KEY = {
  w: 30.4, h: 19,
  rooms: [
    { id: 'entree', x: 0, y: 8, w: 6, h: 4.8, label: 'Hall' },
    { id: 'sejour', x: 6, y: 5.6, w: 11.4, h: 7.2, label: 'Séjour' },
    { id: 'cuisine', x: 6, y: 0, w: 7.8, h: 5.6, label: 'Cuisine' },
    { id: 'office', x: 13.8, y: 0, w: 5.4, h: 5.6, label: 'Office' },
    { id: 'loggia', x: 17.4, y: 5.6, w: 1.8, h: 7.2, label: '' },
    { id: 'suite', x: 6, y: 12.8, w: 8.4, h: 6.2, label: 'Suite' },
    { id: 'bain', x: 14.4, y: 12.8, w: 4.8, h: 6.2, label: 'Bain' },
    { id: 'terrasse', x: 19.2, y: 0, w: 7.8, h: 19, label: 'Terrasse' },
  ],
  pool: { x: 21, y: 1.5, w: 4.5, h: 12 },
  beach: { x: 27, y: 0, w: 3.4, h: 19 },
};

/* ---------------- dessin d'un plan de pièce ---------------- */
export function roomSVG(id) {
  const R = ROOMS[id];
  const W = R.w * S, H = R.h * S;
  const pad = 26;
  const out = [];
  const seg = (x1, y1, x2, y2, cls = 'pw') => out.push(`<path class="${cls}" pathLength="1" d="M${x1} ${y1}L${x2} ${y2}"/>`);
  // murs : chaque côté découpé autour des ouvertures
  const sides = {
    n: { len: R.w, p: (t) => [t * S, 0] },
    s: { len: R.w, p: (t) => [t * S, H] },
    w: { len: R.h, p: (t) => [0, t * S] },
    e: { len: R.h, p: (t) => [W, t * S] },
  };
  for (const [k, sd] of Object.entries(sides)) {
    const ops = R.open.filter((o) => o.side === k).sort((a, b) => a.at - b.at);
    let t = 0;
    for (const o of ops) {
      if (o.at > t) seg(...sd.p(t), ...sd.p(o.at));
      t = o.at + o.len;
    }
    if (t < sd.len) seg(...sd.p(t), ...sd.p(sd.len));
    for (const o of ops) {
      const [ax, ay] = sd.p(o.at), [bx, by] = sd.p(o.at + o.len);
      const horiz = k === 'n' || k === 's';
      if (o.kind === 'window' || o.kind === 'slide') {
        const d = 2.2;
        if (horiz) { seg(ax, ay - d, bx, by - d, 'pwin'); seg(ax, ay + d, bx, by + d, 'pwin'); }
        else { seg(ax - d, ay, bx - d, by, 'pwin'); seg(ax + d, ay, bx + d, by, 'pwin'); }
        if (o.kind === 'slide') {
          const mx = (ax + bx) / 2, my = (ay + by) / 2;
          if (horiz) seg(mx - 6, ay, mx + 6, ay, 'pw'); else seg(ax, my - 6, ax, my + 6, 'pw');
        }
      } else if (o.kind === 'door') {
        const r = o.len * S;
        // battant + arc d'ouverture vers l'intérieur
        if (k === 'w') out.push(`<path class="pdoor" pathLength="1" d="M${ax} ${ay}L${ax + r} ${ay}A${r} ${r} 0 0 1 ${bx} ${by}"/>`);
        if (k === 'e') out.push(`<path class="pdoor" pathLength="1" d="M${ax} ${ay}L${ax - r} ${ay}A${r} ${r} 0 0 0 ${bx} ${by}"/>`);
        if (k === 'n') out.push(`<path class="pdoor" pathLength="1" d="M${ax} ${ay}L${ax} ${ay + r}A${r} ${r} 0 0 0 ${bx} ${by}"/>`);
        if (k === 's') out.push(`<path class="pdoor" pathLength="1" d="M${ax} ${ay}L${ax} ${ay - r}A${r} ${r} 0 0 1 ${bx} ${by}"/>`);
      } else if (o.kind === 'edge') {
        seg(ax + 3, ay, bx + 3, by, 'pedge');
      }
      if (o.label) {
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        // à l'ouest, l'étiquette passe à l'intérieur (la cote de hauteur est dehors)
        const off = k === 'e' ? 9 : 8;
        const rot = horiz ? '' : ` transform="rotate(${k === 'e' ? 90 : -90} ${mx + off} ${my})"`;
        const ty = horiz ? (k === 'n' ? my + 12 : my + 11) : my;
        const tx = horiz ? mx : mx + off;
        out.push(`<text class="plbl plbl--edge" x="${tx}" y="${ty}"${rot}>${o.label}</text>`);
      }
    }
  }
  // mobilier
  for (const it of R.items) {
    const x = it.x * S, y = it.y * S;
    const cls = `pf${it.dash ? ' pf--dash' : ''}${it.hatch ? ' pf--hatch' : ''}`;
    if (it.t === 'rect') out.push(`<rect class="${cls}" x="${x}" y="${y}" width="${it.w * S}" height="${it.h * S}" rx="${(it.r || 0) * S}"/>`);
    if (it.t === 'circle') out.push(`<circle class="${cls}" cx="${x}" cy="${y}" r="${it.r * S}"/>`);
    if (it.t === 'ellipse') out.push(`<ellipse class="${cls}" cx="${x}" cy="${y}" rx="${it.rx * S}" ry="${it.ry * S}"/>`);
    if (it.t === 'pool') out.push(`<rect class="ppool" x="${x}" y="${y}" width="${it.w * S}" height="${it.h * S}" rx="3"/>`);
    if (it.t === 'stairs') {
      out.push(`<rect class="pf" x="${x}" y="${y}" width="${it.w * S}" height="${it.h * S}"/>`);
      for (let i = 1; i < it.n; i++) {
        const sx = x + (i * it.w * S) / it.n;
        out.push(`<path class="pf pf--thin" d="M${sx} ${y}V${y + it.h * S}"/>`);
      }
    }
    if (it.label) {
      const cx = it.t === 'rect' || it.t === 'pool' || it.t === 'stairs' ? x + (it.w * S) / 2 : x;
      const cy = it.t === 'rect' || it.t === 'pool' || it.t === 'stairs' ? y + (it.h * S) / 2 : y;
      const vertical = it.t === 'pool' || (it.h > it.w * 1.6 && it.t === 'rect');
      out.push(`<text class="plbl${it.t === 'pool' ? ' plbl--pool' : ''}" x="${cx}" y="${cy + 2}"${vertical ? ` transform="rotate(-90 ${cx} ${cy})"` : ''}>${it.label}</text>`);
    }
  }
  // cotes
  out.push(`<g class="pdim">
    <path pathLength="1" d="M0 -14H${W}M0 -18V-10M${W} -18V-10"/>
    <text x="${W / 2}" y="-19">${f(R.w)} m</text>
    <path pathLength="1" d="M-14 0V${H}M-18 0H-10M-18 ${H}H-10"/>
    <text x="-19" y="${H / 2}" transform="rotate(-90 -19 ${H / 2})">${f(R.h)} m</text>
  </g>`);
  // point de vue de la photo
  const { x: cx, y: cy, a } = R.cam;
  const rad = (d) => (d * Math.PI) / 180, L = 34, spread = 26;
  const p1 = [cx * S + Math.cos(rad(a - spread)) * L, cy * S + Math.sin(rad(a - spread)) * L];
  const p2 = [cx * S + Math.cos(rad(a + spread)) * L, cy * S + Math.sin(rad(a + spread)) * L];
  out.push(`<g class="pcam"><path class="pcam__cone" d="M${cx * S} ${cy * S}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}A${L} ${L} 0 0 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}Z"/><circle class="pcam__pulse" cx="${cx * S}" cy="${cy * S}" r="9"/><circle class="pcam__dot" cx="${cx * S}" cy="${cy * S}" r="3.6"/></g>`);
  return `<svg class="plan-svg" viewBox="${-pad} ${-pad - 6} ${W + pad * 2} ${H + pad * 2 + 6}" role="img" aria-label="Plan : ${R.name}, ${f(R.w)} × ${f(R.h)} m">${out.join('')}</svg>`;
}

/* ---------------- plan du rez-de-jardin ---------------- */
export function keySVG(active = '') {
  const K = KEY, out = [];
  out.push(`<rect class="kbeach" x="${K.beach.x * S}" y="0" width="${K.beach.w * S}" height="${K.beach.h * S}"/>`);
  for (const r of K.rooms) {
    out.push(`<rect class="kroom${r.id === active ? ' is-on' : ''}" data-room="${r.id}" x="${r.x * S}" y="${r.y * S}" width="${r.w * S}" height="${r.h * S}"/>`);
    if (r.label) out.push(`<text class="klbl" x="${(r.x + r.w / 2) * S}" y="${(r.y + r.h / 2) * S + 3}">${r.label}</text>`);
  }
  out.push(`<rect class="kpool" x="${K.pool.x * S}" y="${K.pool.y * S}" width="${K.pool.w * S}" height="${K.pool.h * S}" rx="3"/>`);
  out.push(`<text class="klbl klbl--sea" x="${(K.beach.x + K.beach.w / 2) * S}" y="${(K.h / 2) * S}" transform="rotate(90 ${(K.beach.x + K.beach.w / 2) * S} ${(K.h / 2) * S})">Plage · mer →</text>`);
  return `<svg class="key-svg" viewBox="-6 -6 ${K.w * S + 12} ${K.h * S + 12}" role="img" aria-label="Plan du rez-de-jardin">${out.join('')}</svg>`;
}

/* ---------------- Palm Jumeirah (carte stylisée) ---------------- */
// Tronc, 16 palmes (A à P) et croissant. `mark` = index de la palme mise en valeur.
export function palmSVG({ mark = 13, routes = false, compact = false } = {}) {
  const out = [];
  const cx = 200, top = 120, base = 330;
  out.push(`<path class="palm__coast" pathLength="1" d="M-10 372C80 360 150 352 200 352C260 352 330 362 410 380"/>`);
  out.push(`<path class="palm__trunk" pathLength="1" d="M${cx} ${base + 22}V${top}"/>`);
  const letters = 'ABCDEFGHIJKLMNOP';
  for (let i = 0; i < 8; i++) {
    const y = top + 18 + i * 22;
    const len = 62 + Math.sin((i / 7) * Math.PI) * 26;
    for (const side of [-1, 1]) {
      const idx = side < 0 ? i : 15 - i;
      const ex = cx + side * len, ey = y - 30 + i * 1.5;
      out.push(`<path class="palm__frond${idx === mark ? ' is-mark' : ''}" pathLength="1" d="M${cx} ${y}Q${cx + side * len * 0.55} ${y + 4} ${ex} ${ey}"/>`);
      if (!compact && idx === mark) out.push(`<text class="palm__lbl" x="${ex + side * 8}" y="${ey + 4}" text-anchor="${side < 0 ? 'end' : 'start'}">Palme ${letters[idx]}</text>`);
    }
  }
  out.push(`<path class="palm__crescent" pathLength="1" d="M58 250A160 160 0 1 1 342 250"/>`);
  // repère de la villa sur la palme choisie
  const mi = mark < 8 ? mark : 15 - mark, side = mark < 8 ? -1 : 1;
  const my = top + 18 + mi * 22, mlen = 62 + Math.sin((mi / 7) * Math.PI) * 26;
  const px = cx + side * mlen * 0.86, py = my - 24 + mi * 1.3;
  if (routes) {
    out.push(`<g class="palm__routes">
      <path class="palm__route" pathLength="1" d="M${px} ${py}C${px + 10} 300 150 350 70 362"/>
      <path class="palm__route" pathLength="1" d="M${px} ${py}C${px + 30} 320 250 352 300 366"/>
      <path class="palm__route" pathLength="1" d="M${px} ${py}C${px + 60} 330 330 350 392 372"/>
    </g>
    <g class="palm__pts">
      <circle cx="70" cy="362" r="4"/><text x="70" y="388" text-anchor="middle">Dubai Marina · 10 min</text>
      <circle cx="300" cy="366" r="4"/><text x="300" y="352" text-anchor="middle">Burj Al Arab · 15 min</text>
      <circle cx="392" cy="372" r="4"/><text x="392" y="398" text-anchor="end">Burj Khalifa · 25 min</text>
    </g>`);
  }
  out.push(`<g class="palm__pin" transform="translate(${px.toFixed(1)} ${py.toFixed(1)})"><circle class="palm__pulse" r="14"/><circle r="5.5"/></g>`);
  if (!compact) out.push(`<text class="palm__sea" x="200" y="46">Golfe arabique</text>`);
  return `<svg class="palm-svg" viewBox="0 ${compact ? 40 : 20} 400 ${compact ? 340 : 390}" role="img" aria-label="Carte stylisée de la Palm Jumeirah">${out.join('')}</svg>`;
}

/* ---------------- parcelle (vue d'ensemble de la villa) ---------------- */
export function plotSVG() {
  const K = KEY;
  const out = [];
  const pw = 30.4 * S, ph = 36 * S, oy = 8.5 * S;
  out.push(`<rect class="plot__sea" x="${pw}" y="-20" width="80" height="${ph + 40}"/>`);
  out.push(`<rect class="plot__land" x="0" y="0" width="${pw}" height="${ph}"/>`);
  out.push(`<path class="pw" pathLength="1" d="M0 0H${pw}V${ph}H0Z"/>`);
  for (const r of K.rooms) out.push(`<rect class="kroom" x="${r.x * S}" y="${r.y * S + oy}" width="${r.w * S}" height="${r.h * S}"/>`);
  out.push(`<rect class="kpool" x="${K.pool.x * S}" y="${K.pool.y * S + oy}" width="${K.pool.w * S}" height="${K.pool.h * S}" rx="3"/>`);
  out.push(`<rect class="kbeach" x="${K.beach.x * S}" y="0" width="${K.beach.w * S}" height="${ph}"/>`);
  out.push(`<g class="pdim"><path pathLength="1" d="M${pw + 14} 0V${ph}M${pw + 10} 0H${pw + 18}M${pw + 10} ${ph}H${pw + 18}"/><text x="${pw + 26}" y="${ph / 2}" transform="rotate(90 ${pw + 26} ${ph / 2})">Plage privée · 36 m</text></g>`);
  out.push(`<text class="plbl" x="${(9 + 6) * S / 2}" y="${ph - 22}">Jardin · 1 100 m² de terrain</text>`);
  return `<svg class="plan-svg" viewBox="-20 -34 ${pw + 130} ${ph + 60}" role="img" aria-label="Plan de la parcelle">${out.join('')}</svg>`;
}
