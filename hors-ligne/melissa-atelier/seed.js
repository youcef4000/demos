// Données d'exemple de l'espace atelier. Les dates sont calculées à partir d'aujourd'hui pour que
// la démo paraisse toujours « en cours » : rendez-vous de la semaine, échéances proches, etc.
// Les noms de clientes, quantités et prix sont fictifs ; les photos viennent du compte Instagram public.

export const VERSION = 1;

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const day = (base, n) => {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
  return d;
};
// Le vendredi, la boutique est fermée (réglage par défaut) : on décale l'exemple au samedi.
const open = (base, n) => {
  const d = day(base, n);
  if (d.getDay() === 5) d.setDate(d.getDate() + 1);
  return iso(d);
};

let n = 0;
const id = (p) => `${p}${(++n).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const COLORS = {
  sauge: { name: 'Sauge', hex: '#a8ae95' },
  chocolat: { name: 'Chocolat', hex: '#5b3a29' },
  creme: { name: 'Crème', hex: '#efe6d6' },
  ivoire: { name: 'Ivoire', hex: '#f6f1e7' },
  rose: { name: 'Rose poudré', hex: '#e7c4c1' },
  ciel: { name: 'Bleu ciel', hex: '#c6d6e6' },
  beurre: { name: 'Jaune beurre', hex: '#efdc9a' },
  nuit: { name: 'Bleu nuit', hex: '#25304a' },
  blanc: { name: 'Blanc', hex: '#fbfaf7' },
  noir: { name: 'Noir', hex: '#1d1a19' },
  bordeaux: { name: 'Bordeaux', hex: '#5d141f' },
  sable: { name: 'Sable', hex: '#d9c7a7' },
};
const c = (...keys) => keys.map((k) => ({ ...COLORS[k] }));

export function seed(today = new Date()) {
  n = 0;
  const T = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const clientes = [
    { name: 'Amina B.', ville: 'Bab Ezzouar, Alger', mesures: { poitrine: 92, taille: 74, hanches: 100, epaules: 38, manche: 58, longueur: 140 } },
    { name: 'Sarah K.', ville: 'Blida', mesures: { poitrine: 88, taille: 68, hanches: 96, epaules: 37, manche: 59, longueur: 138 } },
    { name: 'Imane T.', ville: 'Oran', mesures: { poitrine: 96, taille: 80, hanches: 104, epaules: 39, manche: 57, longueur: 142 } },
    { name: 'Lina M.', ville: 'Tizi Ouzou', mesures: { poitrine: 84, taille: 66, hanches: 92, epaules: 36, manche: 58, longueur: 136 } },
    { name: 'Yasmine H.', ville: 'Constantine', mesures: {} },
    { name: 'Rania D.', ville: 'Baba Hassen, Alger', mesures: { poitrine: 90, taille: 72, hanches: 98, epaules: 38, manche: 60, longueur: 141 } },
    { name: 'Nour A.', ville: 'Draria, Alger', mesures: {} },
    { name: 'Revendeuse — Sétif', ville: 'Sétif', pro: true, mesures: {} },
    { name: 'Boutique revendeuse — Oran', ville: 'Oran', pro: true, mesures: {} },
  ].map((x, i) => ({
    id: id('cl'),
    phone: `05 •• •• •• ${pad(11 + i * 7)}`,
    note: '',
    since: iso(day(T, -120 + i * 9)),
    pro: false,
    ...x,
  }));
  const cl = (name) => clientes.find((x) => x.name === name);

  const R = (offset, start, duration, type, title, extra = {}) => {
    const date = open(T, offset);
    return {
      id: id('rv'),
      date,
      start,
      duration,
      type,
      title,
      phone: '',
      note: '',
      clientId: cl(title)?.id || null,
      status: offset < 0 ? 'termine' : 'confirme',
      source: 'atelier',
      ...extra,
    };
  };
  const rdv = [
    R(-6, '10:00', 60, 'essayage', 'Imane T.'),
    R(-5, '14:00', 90, 'fournisseur', 'Grossiste tissus — échantillons de lin'),
    R(-4, '11:00', 60, 'mesures', 'Lina M.', { note: 'Ensemble pour une cérémonie, tissu crème.' }),
    R(-2, '15:00', 60, 'gros', 'Revendeuse — Sétif', { note: 'Commande 24 pièces, ensembles pastel.' }),
    R(-1, '10:00', 120, 'interne', 'Shooting — ensembles sauge et chocolat'),
    R(0, '10:30', 60, 'essayage', 'Amina B.', { note: 'Essayage ensemble crème, taille M.' }),
    R(0, '12:00', 45, 'interne', "Point production avec l'équipe"),
    R(0, '15:00', 60, 'mesures', 'Rania D.', { note: 'Prise de mesures — robe longue satin.' }),
    R(1, '11:00', 60, 'essayage', 'Yasmine H.'),
    R(1, '14:30', 90, 'gros', 'Boutique revendeuse — Oran', { note: 'Présentation du catalogue automne.' }),
    R(2, '10:00', 60, 'fournisseur', 'Mercerie — boutons et fermetures'),
    R(2, '16:00', 45, 'essayage', 'Nour A.', { status: 'a-confirmer' }),
    R(3, '11:00', 120, 'interne', 'Shooting — collection automne'),
    R(3, '15:00', 60, 'mesures', 'Sarah K.', { note: 'Retouches kimono + nouvelles mesures.' }),
    R(4, '10:00', 60, 'visite', "Visite de l'atelier — revendeuse"),
    R(5, '14:00', 60, 'essayage', 'Lina M.'),
    R(7, '10:00', 60, 'essayage', 'Imane T.'),
    R(8, '11:00', 90, 'fournisseur', 'Grossiste tissus — commande crêpe'),
    R(9, '15:00', 60, 'mesures', 'Amina B.'),
  ];

  const modeles = [
    { name: 'Ensemble tailleur crème', stage: 'valide', colors: c('creme', 'noir'), fabric: 'Crêpe épais', meters: 2.6, qty: 80, deadline: iso(day(T, 24)), priority: 'haute', img: 'img/blazer.webp', notes: 'Veste croisée + pantalon droit. Boutons dorés 20 mm.' },
    { name: 'Robe chemise ceinturée', stage: 'prototype', colors: c('sauge', 'ciel'), fabric: 'Lin lavé', meters: 2.9, qty: 60, deadline: iso(day(T, 35)), priority: 'normale', img: '', notes: 'Toile en cours : reprendre la longueur de manche (+2 cm).' },
    { name: 'Kimono satin long', stage: 'patron', colors: c('ivoire', 'noir'), fabric: 'Satin de soie', meters: 3.2, qty: 50, deadline: iso(day(T, 42)), priority: 'normale', img: 'img/satin.webp', notes: 'Gradation S → XXL à faire.' },
    { name: 'Abaya lin brodée', stage: 'croquis', colors: c('sable', 'ivoire'), fabric: 'Lin brodé', meters: 3.5, qty: 40, deadline: iso(day(T, 55)), priority: 'haute', img: 'img/croquis.webp', notes: 'Broderie ton sur ton au col et aux poignets.' },
    { name: 'Jupe longue satinée', stage: 'croquis', colors: c('chocolat', 'bordeaux'), fabric: 'Satin mat', meters: 1.8, qty: 70, deadline: iso(day(T, 60)), priority: 'basse', img: '', notes: '' },
    { name: 'Ensemble plissé automne', stage: 'idee', colors: c('bordeaux', 'chocolat', 'creme'), fabric: 'Crêpe plissé', meters: 2.4, qty: 100, deadline: iso(day(T, 75)), priority: 'normale', img: '', notes: 'Idée vue au salon : plissé soleil sur le bas.' },
    { name: 'Cardigan maille côtelée', stage: 'idee', colors: c('sable', 'sauge'), fabric: 'Maille côtelée', meters: 1.6, qty: 60, deadline: '', priority: 'basse', img: '', notes: '' },
  ].map((m) => ({ id: id('md'), created: iso(day(T, -20)), ...m }));

  const team = ['Samira', 'Lynda', 'Nesrine', 'Kahina'];
  const P = (name, img, colors, qty, startOff, endOff, steps, teamIdx, notes = '') => ({
    id: id('pr'),
    name,
    img,
    colors,
    sizes: ['S', 'M', 'L', 'XL'],
    qty,
    start: iso(day(T, startOff)),
    deadline: iso(day(T, endOff)),
    team: teamIdx.map((i) => team[i]),
    steps: { coupe: steps[0], couture: steps[1], finitions: steps[2], repassage: steps[3], controle: steps[4] },
    notes,
  });
  const production = [
    P('Ensemble lin sauge', 'img/sauge.webp', c('sauge', 'creme'), 120, -14, 6, [120, 98, 76, 60, 44], [0, 1], 'Priorité aux tailles M et L (précommandes).'),
    P('Ensemble brodé nuit', 'img/brodes.webp', c('nuit', 'chocolat'), 60, -12, 3, [60, 34, 12, 6, 0], [2], 'Broderies livrées en retard par le sous-traitant.'),
    P('Kimono chocolat ceinturé', 'img/marron-ceinture.webp', c('chocolat'), 80, -6, 12, [80, 40, 22, 10, 4], [1, 3]),
    P('Top péplum à pois', 'img/pois.webp', c('blanc', 'noir'), 50, -2, 18, [30, 6, 0, 0, 0], [3]),
  ];

  const Z = (name, img, off, qty, colors, collection, desc, vitrine = true) => ({ id: id('rz'), name, img, date: iso(day(T, off)), qty, colors, collection, desc, vitrine });
  const realisations = [
    Z('Ensemble lin pastel', 'img/pastels.webp', -64, 300, c('rose', 'sable', 'sauge', 'beurre', 'ciel'), 'Printemps 2026', 'Chemise ample et pantalon large, en cinq couleurs douces.'),
    Z('Ensemble crème boutonné', 'img/creme.webp', -38, 150, c('creme'), 'Été 2026', 'Veste à boutons nacrés et pantalon fluide.'),
    Z('Ensemble blanc deux pièces', 'img/defile.webp', -80, 120, c('blanc'), 'Été 2026', 'Top court et jupe longue évasée.'),
    Z('Robe jaune beurre', 'img/jaune.webp', -95, 90, c('beurre'), 'Été 2026', 'Robe à bretelles, taille marquée, jupe ample.'),
    Z('Ensemble rose poudré', 'img/rose-ordi.webp', -33, 110, c('rose'), 'Automne 2026', 'Blouse à manches évasées et pantalon assorti.'),
    Z('Ensemble bleu ciel', 'img/ciel.webp', -52, 100, c('ciel'), 'Été 2026', 'Gilet sans manches et pantalon large.'),
    Z('Chemise satin ivoire', 'img/satin.webp', -26, 140, c('ivoire'), 'Automne 2026', 'Satin fluide, nœud au dos.'),
    Z('Kimono chocolat', 'img/chocolat.webp', -21, 90, c('chocolat'), 'Automne 2026', 'Manches kimono, à porter avec voile.'),
    Z('Ensemble chocolat fluide', 'img/marron-voile.webp', -70, 80, c('chocolat'), 'Printemps 2026', 'Tunique longue et pantalon droit.'),
    Z('Blouse brodée sable', 'img/sac-melissa.webp', -30, 70, c('sable'), 'Automne 2026', 'Broderie florale ton sur ton.'),
    Z('Ensemble sauge voilé', 'img/sauge.webp', -110, 120, c('sauge'), 'Printemps 2026', 'Tunique longue fendue et pantalon.', false),
    Z('Ensemble rose & chemise', 'img/boutique-rose.webp', -125, 60, c('rose', 'blanc'), 'Printemps 2026', 'Pantalon rose et chemise ample.', false),
  ];

  const S = (name, img, price, variants) => ({ id: id('st'), name, img, price, threshold: 1, variants });
  const V = (key, S_, M, L, XL) => ({ ...COLORS[key], sizes: { S: S_, M, L, XL } });
  const stock = [
    S('Ensemble crème boutonné', 'img/creme.webp', 6500, [V('creme', 4, 7, 5, 2)]),
    S('Ensemble lin pastel', 'img/pastels.webp', 5900, [V('rose', 3, 0, 6, 2), V('sauge', 5, 8, 4, 2), V('beurre', 2, 3, 1, 2), V('ciel', 4, 5, 3, 2)]),
    S('Chemise satin ivoire', 'img/satin.webp', 4200, [V('ivoire', 6, 9, 7, 3)]),
    S('Kimono chocolat', 'img/chocolat.webp', 6900, [V('chocolat', 2, 1, 3, 2)]),
    S('Ensemble rose poudré', 'img/rose-ordi.webp', 6200, [V('rose', 3, 4, 2, 2)]),
    S('Ensemble bleu ciel', 'img/ciel.webp', 6200, [V('ciel', 0, 3, 4, 2)]),
    S('Robe jaune beurre', 'img/jaune.webp', 5400, [V('beurre', 2, 3, 2, 1)]),
    S('Blouse brodée sable', 'img/sac-melissa.webp', 4800, [V('sable', 5, 6, 6, 3)]),
  ];

  const fournisseurs = [
    { name: 'Grossiste tissus', specialite: 'Lin, crêpe, satin', ville: 'El Hamiz' },
    { name: 'Mercerie', specialite: 'Boutons, fils, fermetures', ville: 'Alger centre' },
    { name: 'Imprimeur', specialite: 'Étiquettes tissées, sacs', ville: 'Baba Hassen' },
    { name: 'Brodeuse', specialite: 'Broderie à façon', ville: 'Blida' },
  ].map((f, i) => ({ id: id('fo'), phone: `05 •• •• •• ${pad(40 + i * 3)}`, ...f }));
  const fo = (name) => fournisseurs.find((f) => f.name === name)?.id || '';

  const M = (name, cat, qty, unit, threshold, sup, hex = '') => ({ id: id('mt'), name, cat, qty, unit, threshold, supplierId: fo(sup), hex });
  const matieres = [
    M('Lin lavé sauge', 'tissu', 34, 'm', 60, 'Grossiste tissus', '#a8ae95'),
    M('Lin lavé crème', 'tissu', 85, 'm', 40, 'Grossiste tissus', '#efe6d6'),
    M('Crêpe chocolat', 'tissu', 12, 'm', 40, 'Grossiste tissus', '#5b3a29'),
    M('Satin ivoire', 'tissu', 96, 'm', 40, 'Grossiste tissus', '#f6f1e7'),
    M('Coton brodé bleu nuit', 'tissu', 22, 'm', 20, 'Brodeuse', '#25304a'),
    M('Crêpe épais crème', 'tissu', 18, 'm', 60, 'Grossiste tissus', '#efe6d6'),
    M('Entoilage thermocollant', 'tissu', 25, 'm', 15, 'Mercerie'),
    M('Boutons nacrés 15 mm', 'fourniture', 420, 'pièces', 300, 'Mercerie'),
    M('Boutons dorés 20 mm', 'fourniture', 60, 'pièces', 200, 'Mercerie'),
    M('Fil polyester crème', 'fourniture', 14, 'bobines', 20, 'Mercerie'),
    M('Fermetures invisibles 20 cm', 'fourniture', 140, 'pièces', 80, 'Mercerie'),
    M('Étiquettes tissées « Melissa »', 'emballage', 540, 'pièces', 500, 'Imprimeur'),
    M('Sacs « Melissa Mode »', 'emballage', 170, 'pièces', 150, 'Imprimeur'),
    M('Cintres', 'emballage', 200, 'pièces', 100, 'Mercerie'),
  ];
  const mt = (name) => matieres.find((x) => x.name === name)?.id || '';

  const A = (name, cat, qty, unit, price, urgency, status, sup, extra = {}) => ({
    id: id('ac'),
    name,
    cat,
    qty,
    unit,
    price,
    urgency,
    status,
    supplierId: fo(sup),
    matiereId: mt(name),
    modele: '',
    note: '',
    created: iso(day(T, -3)),
    ...extra,
  });
  const achats = [
    A('Lin lavé sauge', 'tissu', 60, 'm', 72000, 'urgent', 'a-acheter', 'Grossiste tissus', { modele: 'Ensemble lin sauge', note: 'Même référence que le dernier rouleau.' }),
    A('Crêpe chocolat', 'tissu', 50, 'm', 55000, 'urgent', 'a-acheter', 'Grossiste tissus', { modele: 'Kimono chocolat ceinturé' }),
    A('Crêpe épais crème', 'tissu', 200, 'm', 230000, 'semaine', 'a-acheter', 'Grossiste tissus', { modele: 'Ensemble tailleur crème' }),
    A('Boutons dorés 20 mm', 'fourniture', 400, 'pièces', 16000, 'semaine', 'a-acheter', 'Mercerie', { modele: 'Ensemble tailleur crème' }),
    A('Fil polyester crème', 'fourniture', 30, 'bobines', 9000, 'semaine', 'a-acheter', 'Mercerie'),
    A('Aiguilles machine (lot de 100)', 'equipement', 1, 'lot', 3500, 'plus-tard', 'a-acheter', 'Mercerie'),
    A('Étiquettes tissées « Melissa »', 'emballage', 1000, 'pièces', 25000, 'semaine', 'commande', 'Imprimeur', { note: 'Livraison prévue la semaine prochaine.' }),
    A('Sacs « Melissa Mode »', 'emballage', 300, 'pièces', 36000, 'plus-tard', 'commande', 'Imprimeur'),
    A('Satin ivoire', 'tissu', 50, 'm', 60000, 'semaine', 'recu', 'Grossiste tissus', { created: iso(day(T, -9)) }),
  ];

  const st = (name) => stock.find((s) => s.name === name)?.id || '';
  const O = (num, off, client, canal, items, statut, paye, extra = {}) => ({
    id: id('cm'),
    num,
    date: iso(day(T, off)),
    clientId: cl(client)?.id || null,
    client,
    phone: cl(client)?.phone || '',
    wilaya: (cl(client)?.ville || '').split(',').pop().trim(),
    canal,
    items: items.map(([name, color, size, qty, price]) => ({ stockId: st(name), name, color, size, qty, price })),
    statut,
    paye,
    stockOut: ['preparee', 'expediee', 'livree'].includes(statut),
    note: '',
    ...extra,
  });
  const commandes = [
    O(1049, 0, 'Yasmine H.', 'instagram', [['Ensemble bleu ciel', 'Bleu ciel', 'L', 1, 6200]], 'nouvelle', false),
    O(1048, 0, 'Amina B.', 'instagram', [['Ensemble crème boutonné', 'Crème', 'M', 1, 6500]], 'confirmee', false),
    O(1047, -1, 'Revendeuse — Sétif', 'gros', [['Ensemble lin pastel', 'Rose poudré', 'M', 6, 4200], ['Ensemble lin pastel', 'Sauge', 'M', 6, 4200], ['Ensemble lin pastel', 'Bleu ciel', 'L', 6, 4200], ['Ensemble lin pastel', 'Jaune beurre', 'L', 6, 4200]], 'preparee', false, { note: 'Tarif revendeuse. Expédition par transporteur.' }),
    O(1046, -2, 'Sarah K.', 'whatsapp', [['Kimono chocolat', 'Chocolat', 'L', 1, 6900]], 'expediee', false),
    O(1045, -3, 'Imane T.', 'instagram', [['Chemise satin ivoire', 'Ivoire', 'S', 1, 4200], ['Ensemble rose poudré', 'Rose poudré', 'S', 1, 6200]], 'livree', true),
    O(1044, -4, 'Lina M.', 'instagram', [['Robe jaune beurre', 'Jaune beurre', 'M', 1, 5400]], 'retour', false, { note: 'Taille trop grande — échange proposé.' }),
    O(1043, -5, 'Rania D.', 'boutique', [['Blouse brodée sable', 'Sable', 'M', 2, 4800]], 'livree', true),
    O(1042, -8, 'Nour A.', 'instagram', [['Ensemble crème boutonné', 'Crème', 'L', 1, 6500]], 'livree', true),
    O(1041, -12, 'Boutique revendeuse — Oran', 'gros', [['Chemise satin ivoire', 'Ivoire', 'M', 20, 3000]], 'livree', true),
  ];

  return {
    version: VERSION,
    demo: true,
    created: iso(T),
    settings: { owner: 'Melissa', openDays: [6, 0, 1, 2, 3, 4], open: '10:00', close: '18:00', slot: 60, team },
    rdv,
    modeles,
    production,
    realisations,
    stock,
    matieres,
    achats,
    fournisseurs,
    commandes,
    clientes,
    journal: [
      { at: Date.now() - 864e5 * 2, text: 'Commande #1045 livrée et encaissée' },
      { at: Date.now() - 864e5, text: 'Satin ivoire : 50 m reçus' },
    ],
  };
}
