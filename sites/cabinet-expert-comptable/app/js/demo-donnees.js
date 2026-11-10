// Démo : données fictives et réalistes du cabinet (entreprises, NIF, personnes et montants imaginaires).
// La démo est figée au mardi 10/11/2026 : on prépare les G50 d'octobre 2026 (date limite 20/11/2026).
// Tout est calculé avec le noyau (mêmes règles que le serveur) : écritures, G50, résultats.
import { normaliserFiche, controler, totaux } from '../noyau/pieces.js';
import { genererEcritures } from '../noyau/ecritures.js';
import { calculerG50 } from '../noyau/g50.js';
import { valeursModele, brouillon, MODELES_DEFAUT } from '../noyau/relances.js';
import { CABINET_DEFAUT } from '../noyau/site.js';
import { resultatPeriode } from '../noyau/resultat.js';
import { periodeFr, da } from '../noyau/format.js';

export const MAINTENANT_DEMO = '2026-11-10T08:30:00.000Z';
const OCT = '2026-10';
const SEP = '2026-09';

// ——— Hasard reproductible ———
function graine(s) {
  let a = 0;
  for (const c of s) a = (a * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = graine('cabinet-mizane-demo');
const entre = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const arrondi = (c, pas = 100) => Math.round(c / pas) * pas; // centimes, arrondi au dinar
const iso = (p, j) => `${p}-${String(j).padStart(2, '0')}`;
const horo = (date, h = 9, mn = 0) => `${date}T${String(h - 1).padStart(2, '0')}:${String(mn).padStart(2, '0')}:00.000Z`; // heure d'Alger → UTC

// ——— Personnes du cabinet et clients (comptes de démo) ———
export const COMPTES_DEMO = [
  { id: 'u-nadia', email: 'associe@cabinet.demo', motDePasse: 'Associe-2026', nom: 'Nadia Bensalem', role: 'associe', titre: 'Associée, expert-comptable' },
  { id: 'u-amine', email: 'collaborateur@cabinet.demo', motDePasse: 'Collab-2026', nom: 'Amine Ferhat', role: 'collaborateur', titre: 'Collaborateur comptable' },
  { id: 'u-lina', email: 'lina@cabinet.demo', motDePasse: 'Collab-2026', nom: 'Lina Touati', role: 'collaborateur', titre: 'Collaboratrice comptable' },
  { id: 'u-rachid', email: 'client@atlas.demo', motDePasse: 'Client-2026', nom: 'Rachid Belkacem', role: 'client', dossierId: 'd-atlas', titre: 'Gérant, SARL Atlas Distribution Alimentaire' },
  { id: 'u-samia', email: 'client@sahel.demo', motDePasse: 'Client-2026', nom: 'Samia Kaci', role: 'client', dossierId: 'd-sahel', titre: 'Gérante, EURL Sahel Travaux Bâtiment' },
];

// ——— Dossiers (entreprises fictives) ———
const DOSSIERS = [
  { id: 'd-atlas', salaireMoyen: 48000, raisonSociale: 'SARL Atlas Distribution Alimentaire', forme: 'SARL', activite: "Distribution de produits alimentaires (revente en l'état)", nature: 'marchandises', wilaya: 'Blida', adresse: "Zone d'activités, Ouled Yaïch, Blida", nif: '999009012345671', nis: '199909012345678', rc: '09/00-9912345 B 15', ai: '09012345671', centreImpots: 'CDI de Blida', salaries: 9, caisse: true, casnos: true, collaborateurId: 'u-amine', contact: { nom: 'M. Rachid Belkacem', email: 'gerance@atlas-distribution.example', telephone: '0550 00 00 01' }, ventes: 19_500_000_00, marge: 0.18 },
  { id: 'd-sahel', salaireMoyen: 52000, raisonSociale: 'EURL Sahel Travaux Bâtiment', forme: 'EURL', activite: 'Travaux de bâtiment et second œuvre', nature: 'travaux', wilaya: 'Tipaza', adresse: 'Cité des 200 Logements, Bou Ismaïl, Tipaza', nif: '999042000876512', nis: '199942000876513', rc: '42/00-9900871 B 18', ai: '42000876512', centreImpots: 'CDI de Tipaza', salaries: 14, caisse: false, casnos: true, collaborateurId: 'u-amine', contact: { nom: 'Mme Samia Kaci', email: 'direction@sahel-travaux.example', telephone: '0550 00 00 02' }, ventes: 11_800_000_00, marge: 0.24 },
  { id: 'd-numidia', salaireMoyen: 55000, raisonSociale: 'SPA Numidia Plast', forme: 'SPA', activite: "Fabrication d'emballages plastiques", nature: 'production', wilaya: 'Sétif', adresse: 'Zone industrielle, El Eulma, Sétif', nif: '999019001122334', nis: '199919001122335', rc: '19/00-9901122 B 09', ai: '19001122334', centreImpots: 'CDI de Sétif', salaries: 32, caisse: false, casnos: false, collaborateurId: 'u-lina', contact: { nom: 'M. Fateh Bouzid', email: 'daf@numidia-plast.example', telephone: '0550 00 00 03' }, ventes: 38_000_000_00, marge: 0.21 },
  { id: 'd-tassili', salaireMoyen: 145000, raisonSociale: 'EURL Tassili Conseil Informatique', forme: 'EURL', activite: 'Conseil et services informatiques', nature: 'prestation', wilaya: 'Alger', adresse: 'Rue des Frères Bouadou, Hydra, Alger', nif: '999016004455667', nis: '199916004455668', rc: '16/00-9904455 B 20', ai: '16004455667', centreImpots: "CDI d'Hydra", salaries: 5, caisse: false, casnos: true, collaborateurId: 'u-amine', contact: { nom: 'M. Yacine Ait Ali', email: 'contact@tassili-conseil.example', telephone: '0550 00 00 04' }, ventes: 1_650_000_00, marge: 0.3 },
  { id: 'd-cirta', salaireMoyen: 58000, raisonSociale: 'SARL Cirta Transport & Logistique', forme: 'SARL', activite: 'Transport routier de marchandises', nature: 'prestation', wilaya: 'Constantine', adresse: 'Zone industrielle Palma, Constantine', nif: '999025007788990', nis: '199925007788991', rc: '25/00-9907788 B 12', ai: '25007788990', centreImpots: 'CDI de Constantine', salaries: 11, caisse: true, casnos: true, collaborateurId: 'u-lina', contact: { nom: 'Mme Leila Bensaïd', email: 'gestion@cirta-transport.example', telephone: '0550 00 00 05' }, ventes: 9_200_000_00, marge: 0.16 },
  { id: 'd-djurdjura', salaireMoyen: 45000, raisonSociale: 'EURL Djurdjura Agro', forme: 'EURL', activite: "Huilerie et conditionnement d'huile d'olive", nature: 'production', wilaya: 'Tizi Ouzou', adresse: 'Route nationale 12, Draâ Ben Khedda, Tizi Ouzou', nif: '999015003344556', nis: '199915003344557', rc: '15/00-9903344 B 16', ai: '15003344556', centreImpots: 'CDI de Tizi Ouzou', salaries: 3, caisse: true, casnos: true, collaborateurId: 'u-lina', contact: { nom: 'M. Arezki Haddadi', email: 'huilerie@djurdjura-agro.example', telephone: '0550 00 00 06' }, ventes: 3_100_000_00, marge: 0.27 },
];

const nifF = (n) => `999${String(n).padStart(12, '0')}`;
const rcF = (w, n) => `${w}/00-99${String(n).padStart(5, '0')} B ${entre(10, 23)}`;

// Tiers fictifs : [nom, adresse, activité, nature, libellés possibles]
const TIERS = {
  'd-atlas': {
    fournisseurs: [
      ['SARL Biscuiterie des Hauts-Plateaux', 'Zone industrielle, Sétif', 'Fabrication de biscuits', 'marchandises', ['Biscuits fourrés 24 × 80 g', 'Gaufrettes chocolat 12 × 200 g', 'Cookies pépites 18 × 150 g'], true],
      ['EURL Boissons du Tell', 'Route de Blida, Boufarik', 'Boissons gazeuses', 'marchandises', ['Soda orange 6 × 1,5 L', 'Eau gazeuse 12 × 1 L', 'Jus multifruits 12 × 1 L'], true],
      ['SARL Détergents de la Chiffa', 'Chiffa, Blida', "Produits d'entretien", 'marchandises', ['Lessive poudre 10 kg', 'Liquide vaisselle 12 × 1 L', 'Javel 12 × 2 L'], true],
      ['EURL Transports Mitidja Express', 'Boufarik, Blida', 'Transport de marchandises', 'prestation', ['Transport livraison clients — octobre']],
      ['EURL NetLink Algérie', 'Bir Mourad Raïs, Alger', 'Fournisseur internet', 'frais', ['Forfait internet professionnel']],
      ['SARL Station-service Ouled Yaïch', 'Ouled Yaïch, Blida', 'Carburants', 'frais', ['Carburant véhicules de livraison']],
    ],
    clients: ['SARL Hypermarché Les Roses', 'Supérette El Baraka', 'EURL Alimentation Générale Ben Ali', 'SARL Grossiste Mitidja Distribution', 'Cafétéria Les Pins'],
  },
  'd-sahel': {
    fournisseurs: [
      ['SARL Ciments et Agrégats du Sahel', 'Hadjout, Tipaza', 'Matériaux de construction', 'travaux', ['Ciment CPJ 42.5 (sacs de 50 kg)', 'Sable de carrière (m³)', 'Gravier 15/25 (m³)'], true],
      ['EURL Quincaillerie Générale Tipaza', 'Tipaza', 'Quincaillerie', 'travaux', ['Fer à béton Ø12 (tonnes)', 'Treillis soudé', 'Visserie et fixations'], true],
      ['SARL Location Engins BTP Chenoua', 'Cherchell, Tipaza', "Location d'engins", 'prestation', ['Location mini-pelle avec chauffeur (jours)']],
      ['EURL Peintures et Revêtements Sahel', 'Koléa, Tipaza', 'Peintures', 'travaux', ['Peinture vinylique 25 kg', 'Enduit de façade'], true],
    ],
    clients: ['SARL Promotion Immobilière Les Oliviers', 'EURL Clinique Dentaire Chenoua', 'Résidence Bel Horizon (syndic)', 'SARL Hôtel Corniche Bleue'],
  },
  'd-numidia': {
    fournisseurs: [
      ['SARL Polymères de l’Est', 'Zone industrielle, Annaba', 'Matières plastiques', 'production', ['Granulés PEHD (tonnes)', 'Granulés PEBD (tonnes)', 'Colorant mélange-maître'], true],
      ['EURL Encres et Colorants Sétif', 'Sétif', 'Encres d’impression', 'production', ['Encre flexographique', 'Solvant de nettoyage'], true],
      ['SARL Maintenance Industrielle Hauts-Plateaux', 'El Eulma, Sétif', 'Maintenance', 'prestation', ['Maintenance préventive extrudeuse']],
      ['EURL Cartonnerie du Bord', 'Bordj Bou Arréridj', 'Emballages carton', 'production', ['Cartons d’expédition (milliers)'], true],
    ],
    clients: ['SARL Laiterie des Hauts-Plateaux', 'EURL Eaux Minérales des Babors', 'SPA Agro-Industrie Sétifienne', 'SARL Fromagerie du Hodna'],
  },
  'd-tassili': {
    fournisseurs: [
      ['SARL Espace Bureaux Hydra', 'Hydra, Alger', 'Location de bureaux', 'frais', ['Loyer bureaux — octobre 2026']],
      ['EURL NetLink Algérie', 'Bir Mourad Raïs, Alger', 'Fournisseur internet', 'frais', ['Fibre professionnelle 100 Mb/s']],
      ['SARL Salon Numérique d’Alger', 'Pins Maritimes, Alger', 'Événementiel', 'frais', ['Insertion publicitaire catalogue du salon IT']],
    ],
    clients: ['SARL Pharma Distribution Kouba', 'EURL Courtage Assurances Atlas', 'SARL Import-Export Sidi Yahia', 'Clinique El Amel'],
  },
  'd-cirta': {
    fournisseurs: [
      ['SARL Station-service Zouaghi', 'Zouaghi, Constantine', 'Carburants', 'frais', ['Gasoil flotte poids lourds'], true],
      ['EURL Garage Mécanique Ali Mendjeli', 'Ali Mendjeli, Constantine', 'Mécanique poids lourds', 'prestation', ['Entretien et réparation semi-remorque']],
      ['SARL Pneumatiques de l’Est', 'Constantine', 'Pneumatiques', 'frais', ['Pneus 315/80 R22.5 (x6)']],
    ],
    clients: ['SARL Minoterie du Rhumel', 'EURL Matériaux Constantine', 'SPA Céramique de l’Est'],
  },
  'd-djurdjura': {
    fournisseurs: [
      ['SARL Verrerie et Bouteilles du Centre', 'Rouiba, Alger', 'Verrerie', 'production', ['Bouteilles verre 1 L (cartons)', 'Bidons PET 5 L'], true],
      ['EURL Étiquettes Imprimées Tizi', 'Tizi Ouzou', 'Imprimerie', 'production', ['Étiquettes adhésives (milliers)'], true],
      ['EURL Équipements Oléicoles de Kabylie', 'Azazga, Tizi Ouzou', 'Équipements', 'immobilisation', ['Ligne d’extraction continue 2 phases']],
    ],
    clients: ['SARL Épicerie Fine La Casbah', 'EURL Restaurant Le Djurdjura', 'SARL Saveurs d’Algérie Export'],
  },
};

// ——— Construction des pièces d'exemple (documents « vrais ») ———
const exemples = [];
let numero = 1;

function tiers(nom, adresse, activite, i) {
  const w = adresse.match(/(\d\d)/)?.[1] || String(entre(10, 48));
  return { nom, adresse, activite, nif: nifF(1000 + i * 37 + nom.length), rc: rcF(w, 1000 + i * 13), nis: nifF(5000 + i * 41), ai: String(10000000000 + i * 977) };
}
function identite(d) {
  return { nom: d.raisonSociale, adresse: d.adresse, activite: d.activite, nif: d.nif, rc: d.rc, nis: d.nis, ai: d.ai, tel: d.contact.telephone };
}
function ligne(libelle, ht, taux = 19) {
  const q = entre(2, 40);
  const pu = arrondi(ht / q);
  return { libelle, quantite: q, prixUnitaire: pu, montantHT: pu * q, tauxTVA: taux };
}
function doc(d, periode, o) {
  const id = `x-${String(numero++).padStart(4, '0')}`;
  const e = { id, dossierId: d.id, periode, aspect: { rotation: Math.round((rnd() - 0.5) * 16) / 10 }, ...o };
  if (['facture_achat', 'facture_vente', 'avoir', 'piece_caisse'].includes(e.type)) {
    const t = totaux({ lignes: e.lignes, timbre: e.timbre });
    e.totalHT = t.ht;
    e.totalTVA = t.tva;
    e.totalTTC = t.ttc;
  }
  exemples.push(e);
  return e;
}

/** Droit de timbre fictif sur paiement en espèces (1 % du TTC, plafonné) — montant imprimé sur la facture. */
const timbreEspeces = (ttc) => Math.min(arrondi(ttc * 0.01), 250_000_00 / 100);

function ventesDuMois(d, periode, i0, nb, total) {
  const out = [];
  const clients = TIERS[d.id].clients;
  for (let i = 0; i < nb; i++) {
    const part = arrondi((total / nb) * (0.7 + rnd() * 0.6), 10000);
    const client = tiers(clients[(i0 + i) % clients.length], d.wilaya, '', i0 + i);
    const jour = Math.min(28, 3 + i * Math.floor(25 / nb) + entre(0, 2));
    const modes = d.nature === 'marchandises' ? ['virement', 'cheque', 'especes', 'a_terme'] : ['virement', 'virement', 'cheque', 'a_terme'];
    const mode = modes[(i0 + i) % modes.length];
    const lignes = libellesVente(d, part);
    const ht = lignes.reduce((s, l) => s + l.montantHT, 0);
    const ttc = ht + Math.round(ht * 0.19);
    const paye = mode !== 'a_terme';
    const date = iso(periode, jour);
    out.push(
      doc(d, periode, {
        type: 'facture_vente',
        numero: `${d.raisonSociale.split(' ')[1].slice(0, 3).toUpperCase()}-${periode.slice(2, 4)}${periode.slice(5, 7)}-${String(40 + i0 + i).padStart(3, '0')}`,
        date,
        emetteur: identite(d),
        destinataire: client,
        nature: d.nature,
        lignes,
        timbre: mode === 'especes' ? timbreEspeces(ttc) : 0,
        modePaiement: mode,
        datePaiement: paye ? iso(periode, Math.min(28, jour + entre(0, 3))) : '',
        tampon: mode === 'especes' ? 'PAYÉ' : '',
        couleur: '#0f4c5c',
      }),
    );
  }
  return out;
}

function libellesVente(d, ht) {
  const par = {
    'd-atlas': ['Biscuits fourrés (cartons)', 'Boissons gazeuses (packs)', "Produits d'entretien (lots)", 'Conserves de légumes (cartons)'],
    'd-sahel': ['Situation de travaux n° {n} — gros œuvre', 'Travaux de revêtement de sol', 'Travaux de peinture et finitions'],
    'd-numidia': ['Bouteilles PEHD 1 L (milliers)', 'Films rétractables (bobines)', 'Bidons 5 L (milliers)'],
    'd-tassili': ['Assistance informatique — forfait mensuel', 'Développement module de gestion des stocks', 'Audit sécurité du réseau'],
    'd-cirta': ['Transport Constantine – Alger (rotations)', 'Transport Constantine – Annaba (rotations)', 'Location camion avec chauffeur (jours)'],
    'd-djurdjura': ["Huile d'olive vierge extra 1 L (cartons de 12)", "Huile d'olive 5 L (bidons)"],
  }[d.id];
  const n = d.id === 'd-tassili' || d.id === 'd-sahel' ? 1 : entre(1, 2);
  const out = [];
  for (let k = 0; k < n; k++) out.push(ligne(par[(k + entre(0, 5)) % par.length].replace('{n}', entre(3, 9)), Math.round(ht / n)));
  if (d.id === 'd-tassili' || d.id === 'd-sahel') out.forEach((l) => Object.assign(l, { quantite: 1, prixUnitaire: arrondi(l.montantHT, 10000), montantHT: arrondi(l.montantHT, 10000) }));
  return out;
}

function achatsDuMois(d, periode, i0, total) {
  const out = [];
  const fs = TIERS[d.id].fournisseurs;
  const nbPrincipaux = fs.filter((f) => f[5]).length;
  fs.forEach(([nom, adresse, activite, nature, libs, principal], k) => {
    if (nature === 'immobilisation') return;
    const montant = principal ? arrondi((total / nbPrincipaux) * (0.8 + rnd() * 0.4), 10000) : arrondi(entre(25_000, 180_000) * 100, 10000);
    const nl = principal ? entre(1, Math.min(3, libs.length)) : 1;
    const lignes = Array.from({ length: nl }, (_, j) => ligne(libs[(j + k) % libs.length], Math.round(montant / nl)));
    if (!principal) lignes.forEach((l) => Object.assign(l, { quantite: 1, prixUnitaire: l.montantHT }));
    const mode = ['virement', 'cheque', 'a_terme', 'especes'][(i0 + k) % 4];
    const espece = mode === 'especes' && montant < 30_000_000;
    const ht = lignes.reduce((s, l) => s + l.montantHT, 0);
    const jour = entre(2, 27);
    out.push(
      doc(d, periode, {
        type: 'facture_achat',
        numero: `F${periode.slice(2, 4)}-${entre(1000, 9800)}`,
        date: iso(periode, jour),
        emetteur: tiers(nom, adresse, activite, k + 3),
        destinataire: identite(d),
        nature,
        lignes,
        timbre: espece ? timbreEspeces(ht * 1.19) : 0,
        modePaiement: espece ? 'especes' : mode === 'especes' ? 'cheque' : mode,
        refPaiement: mode === 'cheque' ? String(entre(1000000, 9999999)) : '',
        datePaiement: mode !== 'a_terme' ? iso(periode, Math.min(28, jour + entre(0, 4))) : '',
        tampon: espece ? 'PAYÉ' : '',
        couleur: ['#1f4e79', '#7a2e2e', '#2e5e3a', '#5a3d7a', '#7a4b1f'][k % 5],
      }),
    );
  });
  return out;
}

function paieDuMois(d, periode) {
  if (!d.salaries) return null;
  const brut = arrondi(d.salaries * d.salaireMoyen * (0.95 + rnd() * 0.1) * 100, 100);
  const cs = Math.round(brut * 0.09);
  const irg = arrondi((brut - cs) * (0.085 + rnd() * 0.02), 100);
  return doc(d, periode, { type: 'etat_paie', numero: `PAIE-${periode}`, date: iso(periode, 28), emetteur: identite(d), paie: { effectif: d.salaries, brut, cotisationsSalariales: cs, irg, net: brut - cs - irg, cotisationsPatronales: Math.round(brut * 0.26) } });
}

function releveDuMois(d, periode, ventes, achats) {
  const mvts = [
    ...ventes.filter((v) => ['virement', 'cheque'].includes(v.modePaiement)).map((v) => ({ date: v.datePaiement, libelle: `Remise ${v.modePaiement === 'cheque' ? 'chèque' : 'virement'} ${v.destinataire.nom}`.slice(0, 52), credit: v.totalTTC })),
    ...achats.filter((a) => ['virement', 'cheque'].includes(a.modePaiement)).map((a) => ({ date: a.datePaiement, libelle: `${a.modePaiement === 'cheque' ? 'Chèque' : 'Virement'} ${a.emetteur.nom}`.slice(0, 52), debit: a.totalTTC })),
    { date: iso(periode, 28), libelle: 'Frais de tenue de compte', debit: 150000 },
  ].sort((a, b) => a.date.localeCompare(b.date));
  return doc(d, periode, { type: 'releve_bancaire', numero: `RB-${periode}`, date: iso(periode, 30), emetteur: { nom: 'Banque fictive de démonstration', adresse: `Agence de ${d.wilaya}`, activite: 'Relevé mensuel' }, destinataire: identite(d), compte: `00${d.nif.slice(-10)} 45`, mouvements: mvts.slice(0, 22) });
}

function caisseDuMois(d, periode) {
  if (!d.caisse) return null;
  return doc(d, periode, { type: 'piece_caisse', numero: `BC-${periode.slice(5, 7)}-${entre(10, 99)}`, date: iso(periode, entre(5, 25)), emetteur: identite(d), lignes: [{ libelle: 'Achat fournitures de bureau (reçu joint)', montantHT: arrondi(entre(2_000, 9_000) * 100), tauxTVA: 0 }], modePaiement: 'especes' });
}

// ——— Lecture simulée par l'agent (avec, parfois, une erreur de lecture à corriger) ———
export function lectureSimulee(e) {
  const f = {
    typeDoc: e.type,
    numero: e.numero || '',
    date: e.date || '',
    emetteur: { nom: e.emetteur?.nom || '', nif: e.emetteur?.nif || '', rc: e.emetteur?.rc || '', adresse: e.emetteur?.adresse || '' },
    destinataire: { nom: e.destinataire?.nom || '', nif: e.destinataire?.nif || '', rc: e.destinataire?.rc || '', adresse: e.destinataire?.adresse || '' },
    nature: e.nature || '',
    lignes: (e.lignes || []).map((l) => ({ libelle: l.libelle, montantHT: l.montantHT, tauxTVA: l.tauxTVA })),
    totalHT: e.totalHT ?? null,
    totalTVA: e.totalTVA ?? null,
    timbre: e.timbre || 0,
    totalTTC: e.totalTTC ?? (e.type === 'releve_bancaire' ? null : null),
    modePaiement: e.modePaiement || (e.type.startsWith('facture') ? 'a_terme' : ''),
    datePaiement: e.datePaiement || '',
    ...(e.paie ? { paie: { ...e.paie } } : {}),
  };
  const erreurs = e.lecture?.erreurs || {};
  for (const [k, v] of Object.entries(erreurs)) {
    if (k === 'nifEmetteur') f.emetteur.nif = v;
    else f[k] = v;
  }
  const remarques = e.lecture?.remarques || (e.type === 'releve_bancaire' ? [`Relevé de ${(e.mouvements || []).length} mouvements : conservé comme justificatif.`] : []);
  return { fiche: f, confiance: e.lecture?.confiance ?? 0.9 + Math.round(rnd() * 8) / 100, remarques, incertains: e.lecture?.incertains || [] };
}

/** Imputation simulée (même rôle que l'agent imputation_scf) pour les lignes sans règle. */
export function imputationSimulee(ligne, fiche) {
  const t = `${ligne.libelle} ${fiche?.emetteur?.nom || ''}`.toLowerCase();
  const table = [
    [/publicit|salon|insertion|annonce|catalogue/, '623', 'Insertion publicitaire : dépense de publicité de l’exercice.', 0.9],
    [/réception|restaurant|repas|hôtel|billet|mission/, '625', 'Frais de réception et de déplacement liés à l’activité.', 0.85],
    [/pneu/, '602', 'Pneumatiques consommés par la flotte : autres approvisionnements (615 possible si posés lors d’une réparation).', 0.72],
    [/ordinateur|portable|serveur|imprimante|informatique/, '2183', 'Matériel informatique durable : immobilisation (matériel de bureau et informatique).', 0.88],
    [/installation et mise en service|montage/, '215', "Frais d'installation rattachés à l'équipement : immobilisés avec lui.", 0.8],
    [/ligne d.extraction|presse|machine|broyeur|décanteur|extrudeuse/, '215', 'Équipement de production durable : installations techniques, matériel et outillage.', 0.9],
    [/véhicule|camion|fourgon|semi-remorque neuve/, '2182', 'Véhicule acquis : matériel de transport.', 0.86],
    [/mobilier|chaise|armoire/, '2184', 'Mobilier de bureau durable.', 0.85],
    [/logiciel|licence/, '618', 'Abonnement logiciel consommé dans l’exercice : documentation et divers.', 0.6],
  ];
  for (const [re, compte, justification, confiance] of table) if (re.test(t)) return { compte, justification, confiance };
  return { compte: '607', justification: 'Aucune indication claire : fourniture non stockée retenue par prudence, à vérifier.', confiance: 0.55 };
}

// ——— Génération complète ———
export function genererDonneesDemo() {
  const col = { utilisateurs: [], dossiers: [], pieces: [], ecritures: [], declarations: [], publications: [], envois: [], messages: [], journal: [], contacts: [], suivi_echeances: [], neant: [], exemples: [] };
  let nId = 1;
  const id = (p) => `${p}-${String(nId++).padStart(5, '0')}`;
  const journal = (le, utilisateurId, nom, action, objet, details = '') => col.journal.push({ id: id('j'), le, utilisateurId, nom, action, objet, details });
  const nomU = (uid) => COMPTES_DEMO.find((c) => c.id === uid)?.nom || 'Agent IA';

  for (const c of COMPTES_DEMO) col.utilisateurs.push({ id: c.id, email: c.email, nom: c.nom, role: c.role, titre: c.titre, dossierId: c.dossierId || null, actif: true, creeLe: '2026-01-04T08:00:00.000Z' });
  for (const d of DOSSIERS) {
    const { ventes, marge, salaireMoyen, ...dossier } = d;
    col.dossiers.push({ ...dossier, regime: 'reel', impot: 'IBS', banque: true, tvaSurEncaissements: true, creditTvaInitial: 0, debutExercice: '01', creeLe: '2026-01-05T08:00:00.000Z' });
  }

  // Historique janvier → août repris de PC Compta (écritures récapitulatives exportées)
  for (const d of DOSSIERS) {
    for (let mo = 1; mo <= 8; mo++) {
      const p = `2026-${String(mo).padStart(2, '0')}`;
      const saison = d.id === 'd-djurdjura' ? [1.6, 1.3, 1.0, 0.7, 0.5, 0.4, 0.4, 0.5][mo - 1] : 0.85 + rnd() * 0.3;
      const ca = arrondi(d.ventes * saison, 10000);
      const achats = arrondi(ca * (1 - d.marge - 0.08 - rnd() * 0.05), 10000);
      const masse = arrondi(d.salaries * d.salaireMoyen * 100 * (0.97 + rnd() * 0.06), 100);
      const comptes = { marchandises: ['600', '700'], production: ['601', '701'], prestation: ['604', '706'], travaux: ['605', '704'] }[d.nature];
      const base = { dossierId: d.id, periode: p, statut: 'exportee', source: 'reprise', creeLe: `${p}-28T10:00:00.000Z`, valideePar: 'u-nadia', exporteeLe: `${p}-28T10:00:00.000Z` };
      col.ecritures.push({ id: id('e'), ...base, journal: 'VT', date: `${p}-28`, numeroPiece: `REPRISE-${p}`, libelle: `Reprise PC Compta — ventes de ${periodeFr(p)}`, lignes: [{ compte: '411', libelle: 'Clients (récapitulatif)', debit: Math.round(ca * 1.19), credit: 0 }, { compte: comptes[1], libelle: 'Ventes du mois', debit: 0, credit: ca }, { compte: '4457', libelle: 'TVA collectée', debit: 0, credit: Math.round(ca * 1.19) - ca }] });
      col.ecritures.push({ id: id('e'), ...base, journal: 'AC', date: `${p}-28`, numeroPiece: `REPRISE-${p}`, libelle: `Reprise PC Compta — achats de ${periodeFr(p)}`, lignes: [{ compte: comptes[0], libelle: 'Achats du mois', debit: achats, credit: 0 }, { compte: '4456', libelle: 'TVA déductible', debit: Math.round(achats * 0.19), credit: 0 }, { compte: '401', libelle: 'Fournisseurs (récapitulatif)', debit: 0, credit: achats + Math.round(achats * 0.19) }] });
      if (masse) {
        const pat = Math.round(masse * 0.26);
        col.ecritures.push({ id: id('e'), ...base, journal: 'PA', date: `${p}-28`, numeroPiece: `REPRISE-${p}`, libelle: `Reprise PC Compta — paie de ${periodeFr(p)}`, lignes: [{ compte: '631', libelle: 'Salaires bruts', debit: masse, credit: 0 }, { compte: '635', libelle: 'Charges patronales', debit: pat, credit: 0 }, { compte: '431', libelle: 'CNAS', debit: 0, credit: Math.round(masse * 0.09) + pat }, { compte: '421', libelle: 'Net à payer et IRG', debit: 0, credit: masse - Math.round(masse * 0.09) }] });
      }
      col.publications.push({ id: `${d.id}|${p}`, dossierId: d.id, periode: p, publieLe: `${p}-28T15:00:00.000Z`, publiePar: d.collaborateurId, resultat: null });
    }
  }

  // Septembre et octobre : pièces réelles du mois (documents d'exemple), avec leur traitement
  const scenario = {
    'd-atlas': { aValider: 2, enCours: 1, manque: ['releve_bancaire'], g50: null },
    'd-sahel': { g50: 'validee' },
    'd-numidia': { g50: 'deposee' },
    'd-tassili': { aValider: 3, g50: null },
    'd-cirta': { manque: ['facture_vente', 'etat_paie', 'releve_bancaire'], aValider: 0, g50: null },
    'd-djurdjura': { immo: true, g50: 'preparee' },
  };
  const disponibles = []; // pièces d'exemple que la démo propose au dépôt

  for (const d of DOSSIERS) {
    const dossier = col.dossiers.find((x) => x.id === d.id);
    for (const p of [SEP, OCT]) {
      const sc = p === OCT ? scenario[d.id] : {};
      const coef = d.id === 'd-djurdjura' ? (p === SEP ? 0.6 : 1.4) : 0.9 + rnd() * 0.2;
      const nbV = d.id === 'd-tassili' ? 3 : d.id === 'd-djurdjura' ? 3 : 4 + (p === OCT ? 1 : 0);
      let ventes = ventesDuMois(d, p, p === SEP ? 0 : 3, nbV, arrondi(d.ventes * coef, 10000));
      let achats = achatsDuMois(d, p, p === SEP ? 0 : 1, arrondi(d.ventes * coef * (1 - d.marge - 0.1), 10000));
      const extra = [];
      if (p === OCT && d.id === 'd-atlas') {
        // Frais de réception (aucune règle) → agent d'imputation ; facture floue → erreur de lecture à corriger
        extra.push(doc(d, p, { type: 'facture_achat', numero: 'R-2026-0412', date: iso(p, 22), emetteur: tiers('SARL Restaurant Le Jardin de Blida', 'Blida', 'Restauration', 9), destinataire: identite(d), nature: 'frais', lignes: [{ libelle: 'Repas de réception clients (12 couverts)', quantite: 1, prixUnitaire: 4_800_000, montantHT: 4_800_000, tauxTVA: 19 }], timbre: 0, modePaiement: 'cheque', refPaiement: '4410293', datePaiement: iso(p, 22), couleur: '#7a2e2e' }));
        const flou = achats[0];
        flou.aspect = { rotation: -2.4, flou: 0.9 };
        flou.lecture = { confiance: 0.62, erreurs: { totalTTC: flou.totalTTC - 2_000_000 }, incertains: ['totalTTC', 'date'], remarques: ['Photo floue et de travers : le total TTC est difficile à lire.'] };
      }
      if (p === OCT && d.id === 'd-tassili') {
        extra.push(doc(d, p, { type: 'facture_achat', numero: 'FV-26-1187', date: iso(p, 14), emetteur: tiers('EURL Matériel Informatique Bab Ezzouar', 'Bab Ezzouar, Alger', 'Matériel informatique', 12), destinataire: identite(d), nature: 'immobilisation', lignes: [{ libelle: 'Ordinateur portable 15" i7 / 16 Go', quantite: 3, prixUnitaire: 16_500_000, montantHT: 49_500_000, tauxTVA: 19 }], timbre: 0, modePaiement: 'virement', datePaiement: iso(p, 16), couleur: '#2e5e3a' }));
      }
      if (p === OCT && d.id === 'd-djurdjura') {
        const [nom, adresse, activite, , libs] = TIERS[d.id].fournisseurs[2];
        extra.push(doc(d, p, { type: 'facture_achat', numero: 'EOK-2026-077', date: iso(p, 9), emetteur: tiers(nom, adresse, activite, 21), destinataire: identite(d), nature: 'immobilisation', lignes: [{ libelle: libs[0], quantite: 1, prixUnitaire: 420_000_000, montantHT: 420_000_000, tauxTVA: 19 }, { libelle: 'Installation et mise en service', quantite: 1, prixUnitaire: 18_000_000, montantHT: 18_000_000, tauxTVA: 19 }], timbre: 0, modePaiement: 'virement', datePaiement: iso(p, 12), couleur: '#5a3d7a' }));
      }
      if (p === OCT && d.id === 'd-cirta') extra.push(doc(d, p, { type: 'facture_achat', numero: 'PE-26-3307', date: iso(p, 18), emetteur: tiers('SARL Pneumatiques de l’Est', 'Constantine', 'Pneumatiques', 31), destinataire: identite(d), nature: 'frais', lignes: [{ libelle: 'Pneus 315/80 R22.5 (x6)', quantite: 6, prixUnitaire: 6_850_000, montantHT: 41_100_000, tauxTVA: 19 }], timbre: 0, modePaiement: 'cheque', refPaiement: '5520781', datePaiement: iso(p, 20), couleur: '#7a4b1f' }));
      if (p === OCT && d.id === 'd-tassili') ventes[ventes.length - 1].modePaiement = 'a_terme';
      if (p === OCT && d.id === 'd-tassili') ventes[ventes.length - 1].datePaiement = '';
      const paie = paieDuMois(d, p);
      const releve = releveDuMois(d, p, ventes, achats);
      const caisse = caisseDuMois(d, p);
      let tout = [...ventes, ...achats, ...extra, paie, releve, caisse].filter(Boolean);
      // Pièces pas encore reçues en octobre (relances) : gardées comme « exemples à déposer »
      if (sc.manque) {
        for (const t of sc.manque) {
          const manquantes = tout.filter((x) => x.type === t);
          disponibles.push(...manquantes.map((x) => x.id));
          tout = tout.filter((x) => x.type !== t);
        }
      }
      if (p === OCT && d.id === 'd-atlas') {
        // Une facture de plus, à déposer pendant la démo
        const [nom, adresse, activite, nature, libs] = TIERS[d.id].fournisseurs[3];
        const sup = doc(d, p, { type: 'facture_achat', numero: 'TME-1026-88', date: iso(p, 29), emetteur: tiers(nom, adresse, activite, 44), destinataire: identite(d), nature, lignes: [{ libelle: libs[0], quantite: 1, prixUnitaire: 26_500_000, montantHT: 26_500_000, tauxTVA: 19 }], timbre: 0, modePaiement: 'virement', datePaiement: iso(p, 30), couleur: '#2e5e3a' });
        disponibles.push(sup.id);
      }
      if (p === OCT && d.id === 'd-tassili') {
        const sup = doc(d, p, { type: 'facture_achat', numero: 'SNA-26-0091', date: iso(p, 27), emetteur: tiers('SARL Salon Numérique d’Alger', 'Pins Maritimes, Alger', 'Événementiel', 51), destinataire: identite(d), nature: 'frais', lignes: [{ libelle: 'Stand 9 m² — salon des solutions numériques', quantite: 1, prixUnitaire: 31_000_000, montantHT: 31_000_000, tauxTVA: 19 }], timbre: 0, modePaiement: 'a_terme', couleur: '#5a3d7a' });
        disponibles.push(sup.id);
      }

      // Traitement des pièces reçues
      const ordre = tout.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      const aValider = new Set();
      if (sc.aValider) {
        const achatsOct = ordre.filter((x) => x.type === 'facture_achat');
        const choix = d.id === 'd-atlas' ? [ordre.find((x) => x.lecture?.erreurs), ordre.find((x) => x.numero === 'R-2026-0412')] : [ordre.find((x) => x.numero === 'FV-26-1187'), ...ordre.filter((x) => x.type === 'facture_vente').slice(-2)];
        choix.filter(Boolean).slice(0, sc.aValider).forEach((x) => aValider.add(x.id));
      }
      const proposees = new Set(sc.enCours ? [ordre.find((x) => x.type === 'facture_vente' && !aValider.has(x.id))?.id] : []);
      const g50Preparable = !aValider.size && !(sc.manque || []).length;
      const moisSuivant = p === SEP ? '2026-10' : '2026-11';

      for (const e of ordre) {
        const depose = p === SEP ? `${moisSuivant}-0${entre(2, 7)}` : `2026-11-0${entre(2, 9)}`;
        const recueLe = horo(depose, entre(8, 18), entre(0, 59));
        const lu = lectureSimulee(e);
        const fiche = normaliserFiche({ ...lu.fiche }, dossier);
        const pieceId = id('p');
        fiche.pieceId = pieceId;
        const statutFinal = aValider.has(e.id) ? 'a_valider' : proposees.has(e.id) ? 'validee' : 'comptabilisee';
        const piece = {
          id: pieceId,
          dossierId: d.id,
          periode: p,
          type: e.type,
          fichier: { ref: `exemple:${e.id}`, nom: `${e.numero || e.type}.jpg`, mime: 'image/svg+xml' },
          exemple: e.id,
          source: e.type === 'etat_paie' && d.id === 'd-numidia' ? 'cabinet' : 'client',
          deposePar: d.id === 'd-atlas' ? 'u-rachid' : d.id === 'd-sahel' ? 'u-samia' : d.collaborateurId,
          recueLe,
          statut: statutFinal,
          fiche,
          lecture: { agent: 'lecteur_pieces', le: new Date(Date.parse(recueLe) + 40_000).toISOString(), confiance: lu.confiance, remarques: lu.remarques, incertains: lu.incertains, modele: 'simulation (démo)' },
          commentaire: '',
        };
        journal(recueLe, piece.deposePar, nomU(piece.deposePar), 'Pièce déposée', `${e.numero || e.type} — ${d.raisonSociale}`);
        journal(piece.lecture.le, 'systeme', 'Agent IA', 'Pièce lue par l’agent', `${e.numero || e.type} — ${d.raisonSociale}`, `confiance ${Math.round(lu.confiance * 100)} %`);
        if (statutFinal !== 'a_valider') {
          // Fiche corrigée et validée par le collaborateur (la vraie valeur remplace l'erreur de lecture)
          const juste = normaliserFiche(lectureSimulee({ ...e, lecture: undefined }).fiche, dossier);
          juste.pieceId = pieceId;
          piece.fiche = juste;
          if (e.lecture?.erreurs) piece.corrigeePar = d.collaborateurId;
          piece.valideePar = d.collaborateurId;
          piece.valideeLe = new Date(Date.parse(recueLe) + 3 * 3600_000).toISOString();
          const imputations = {};
          (juste.lignes || []).forEach((l, i) => {
            const essai = genererEcritures({ ...piece, fiche: { ...juste, lignes: [l] } }, dossier).manquantes;
            if (essai.length) {
              const r = imputationSimulee(l, juste);
              imputations[i] = { compte: r.compte, source: 'agent', justification: r.justification, confiance: r.confiance };
              l.compte = r.compte;
              l.sourceCompte = 'agent';
              l.justification = r.justification;
            }
          });
          const { ecritures } = genererEcritures(piece, dossier, { imputations });
          const statutE = statutFinal === 'validee' ? 'proposee' : p === SEP ? 'exportee' : 'validee';
          for (const ec of ecritures) {
            const justif = Object.values(imputations).map((x) => x.justification).join(' ');
            col.ecritures.push({ id: id('e'), ...ec, statut: statutE, creeLe: piece.valideeLe, creePar: d.collaborateurId, justification: justif, ...(statutE !== 'proposee' ? { valideePar: d.collaborateurId, valideeLe: piece.valideeLe } : {}), ...(statutE === 'exportee' ? { exporteeLe: `${moisSuivant}-12T14:00:00.000Z` } : {}) });
          }
          if (statutFinal === 'comptabilisee' || !ecritures.length) piece.statut = 'comptabilisee';
          journal(piece.valideeLe, d.collaborateurId, nomU(d.collaborateurId), 'Fiche validée', `${e.numero || e.type} — ${d.raisonSociale}`, `${ecritures.length} écriture(s) proposée(s)`);
        }
        piece.controles = controler(piece.fiche, { dossier, periode: p, autresPieces: [] });
        if (lu.confiance < 0.8 && statutFinal === 'a_valider') piece.controles.push({ niveau: 'alerte', code: 'confiance', message: `Lecture peu sûre (${Math.round(lu.confiance * 100)} %) : relire chaque champ.` });
        col.pieces.push(piece);
      }
      if (p === SEP) journal(`${moisSuivant}-12T14:00:00.000Z`, d.collaborateurId, nomU(d.collaborateurId), 'Export PC Compta', `${d.raisonSociale} — ${periodeFr(p)}`);

      // G50
      const piecesD = col.pieces.filter((x) => x.dossierId === d.id);
      const precedente = col.declarations.find((x) => x.dossierId === d.id && x.periode === '2026-09') || null;
      const statutG50 = p === SEP ? 'deposee' : sc.g50;
      if (statutG50 && (p === SEP || g50Preparable)) {
        const calcul = calculerG50({ dossier, periode: p, pieces: piecesD, precedente });
        const dec = { id: id('g'), type: 'G50', dossierId: d.id, periode: p, saisies: {}, calcul, statut: statutG50, preparePar: d.collaborateurId, prepareLe: `${moisSuivant}-${p === SEP ? '13' : '07'}T10:00:00.000Z` };
        if (statutG50 !== 'preparee') Object.assign(dec, { validePar: 'u-nadia', valideLe: `${moisSuivant}-${p === SEP ? '14' : '08'}T09:15:00.000Z` });
        if (statutG50 === 'deposee') Object.assign(dec, { deposeLe: `${moisSuivant}-${p === SEP ? String(entre(15, 19)) : '09'}`, reference: `Jibaya'tic — accusé n° ${entre(100000, 999999)} (fictif)`, deposePar: d.collaborateurId });
        col.declarations.push(dec);
        journal(dec.prepareLe, d.collaborateurId, nomU(d.collaborateurId), 'G50 préparée', `${d.raisonSociale} — ${periodeFr(p)}`, da(calcul.total));
        if (dec.validePar) journal(dec.valideLe, 'u-nadia', 'Nadia Bensalem', 'G50 validée', `${d.raisonSociale} — ${periodeFr(p)}`, da(calcul.total));
        if (dec.deposeLe) journal(`${dec.deposeLe}T11:00:00.000Z`, d.collaborateurId, nomU(d.collaborateurId), 'G50 marquée déposée', `${d.raisonSociale} — ${periodeFr(p)}`, dec.reference);
        // Message du montant au client
        if (statutG50 !== 'preparee') {
          const v = valeursModele({ dossier, periode: p, cabinet: CABINET_DEFAUT, g50: calcul });
          const b = brouillon(MODELES_DEFAUT.find((m) => m.usage === 'g50'), v, dossier);
          const le = `${moisSuivant}-${p === SEP ? '14' : '09'}T10:05:00.000Z`;
          const ev = { id: id('m'), dossierId: d.id, ...b, origine: 'g50', lienId: dec.id, statut: 'envoye', creeLe: dec.valideLe, creePar: 'workflow', valideePar: d.collaborateurId, envoyeLe: le, resultat: { ok: true, simulation: true } };
          col.envois.push(ev);
          col.messages.push({ id: id('x'), dossierId: d.id, de: 'cabinet', auteurId: d.collaborateurId, auteur: nomU(d.collaborateurId), objet: ev.objet, texte: ev.corps, le, lu: p === SEP, envoiId: ev.id });
          journal(le, d.collaborateurId, nomU(d.collaborateurId), 'E-mail validé et envoyé', `${ev.objet} — ${d.raisonSociale}`);
        }
      }
    }
    // Résultat de septembre publié
    const r = resultatPeriode(col.ecritures.filter((e) => e.dossierId === d.id), SEP);
    col.publications.push({ id: `${d.id}|${SEP}`, dossierId: d.id, periode: SEP, publieLe: '2026-10-24T15:00:00.000Z', publiePar: d.collaborateurId, resultat: r.resultat });
    const vr = valeursModele({ dossier: col.dossiers.find((x) => x.id === d.id), periode: SEP, cabinet: CABINET_DEFAUT, resultat: r });
    const br = brouillon(MODELES_DEFAUT.find((m) => m.usage === 'resultat'), vr, d);
    const evr = { id: id('m'), dossierId: d.id, ...br, origine: 'resultat', statut: 'envoye', creeLe: '2026-10-24T15:00:00.000Z', creePar: 'workflow', valideePar: d.collaborateurId, envoyeLe: '2026-10-24T15:10:00.000Z', resultat: { ok: true, simulation: true } };
    col.envois.push(evr);
    col.messages.push({ id: id('x'), dossierId: d.id, de: 'cabinet', auteurId: d.collaborateurId, auteur: nomU(d.collaborateurId), objet: evr.objet, texte: evr.corps, le: evr.envoyeLe, lu: true, envoiId: evr.id });
  }

  // Relances d'octobre : une envoyée (Cirta, 05/11), deux brouillons préparés ce matin par le workflow
  const cirta = col.dossiers.find((x) => x.id === 'd-cirta');
  const atlas = col.dossiers.find((x) => x.id === 'd-atlas');
  const manq = (d, types) => types.map((t) => ({ facture_vente: 'Factures de vente du mois', etat_paie: "État de paie récapitulatif du mois (avec l'IRG retenu)", releve_bancaire: 'Relevé bancaire du mois' })[t]).map((libelle) => ({ libelle }));
  const relance = (d, modeleId, types, statut, le) => {
    const v = valeursModele({ dossier: d, periode: OCT, cabinet: CABINET_DEFAUT, manquantes: manq(d, types), dateLimite: '2026-11-20' });
    const b = brouillon(MODELES_DEFAUT.find((m) => m.id === modeleId), v, d);
    const ev = { id: id('m'), dossierId: d.id, periode: OCT, ...b, origine: 'relance', manquantes: manq(d, types).map((x) => x.libelle), statut, creeLe: le, creePar: 'workflow', ...(statut === 'envoye' ? { valideePar: d.collaborateurId, envoyeLe: le, resultat: { ok: true, simulation: true } } : {}) };
    col.envois.push(ev);
    if (statut === 'envoye') col.messages.push({ id: id('x'), dossierId: d.id, de: 'cabinet', auteurId: d.collaborateurId, auteur: nomU(d.collaborateurId), objet: ev.objet, texte: ev.corps, le, lu: true, envoiId: ev.id });
    journal(le, 'systeme', 'Système', statut === 'envoye' ? 'E-mail validé et envoyé' : 'Relances préparées automatiquement', `${d.raisonSociale} — ${periodeFr(OCT)}`);
  };
  relance(cirta, 'relance_1', ['facture_vente', 'etat_paie', 'releve_bancaire'], 'envoye', '2026-11-05T07:40:00.000Z');
  relance(cirta, 'relance_2', ['facture_vente', 'etat_paie', 'releve_bancaire'], 'a_valider', '2026-11-10T06:00:00.000Z');
  relance(atlas, 'relance_1', ['releve_bancaire'], 'a_valider', '2026-11-10T06:00:00.000Z');

  // Messages des clients
  const msgClient = (dossierId, auteurId, auteur, texte, le, lu = false) => col.messages.push({ id: id('x'), dossierId, de: 'client', auteurId, auteur, texte, le, lu });
  msgClient('d-atlas', 'u-rachid', 'Rachid Belkacem', "Bonjour, j'ai déposé les factures d'octobre. Le relevé bancaire arrive en début de semaine prochaine.", '2026-11-08T16:12:00.000Z');
  msgClient('d-cirta', null, 'Leila Bensaïd', 'Bonjour Madame, les factures de vente partent demain matin avec le chauffeur.', '2026-11-06T09:20:00.000Z', true);
  msgClient('d-sahel', 'u-samia', 'Samia Kaci', 'Merci, le paiement de la G50 est prévu jeudi.', '2026-11-09T18:45:00.000Z');

  // Suivi des échéances déjà faites
  for (const d of ['d-sahel', 'd-numidia', 'd-cirta']) col.suivi_echeances.push({ id: `cnas-mois|${d}|2026-09`, fait: true, le: '2026-10-27T10:00:00.000Z', par: 'u-lina' });
  col.suivi_echeances.push({ id: 'cnas-mois|d-numidia|2026-10', fait: true, le: '2026-11-06T10:00:00.000Z', par: 'u-lina' });

  // Demandes de contact reçues par le site
  col.contacts.push({ id: id('c'), le: '2026-11-07T19:02:00.000Z', nom: 'Hichem Larbi', entreprise: 'SARL Boulangerie Moderne (exemple)', email: 'contact@boulangerie-moderne.example', telephone: '', message: 'Bonjour, nous cherchons un cabinet pour la tenue de la comptabilité et les G50 à partir de janvier. 6 salariés.', traite: false });
  col.contacts.push({ id: id('c'), le: '2026-11-03T11:30:00.000Z', nom: 'Meriem Zerrouki', entreprise: 'Création EURL e-commerce (exemple)', email: 'meriem@exemple-ecommerce.example', telephone: '', message: "Je crée une EURL de vente en ligne : pouvez-vous m'accompagner pour la création et la première année ?", traite: true });

  col.exemples = exemples;
  col.journal.sort((a, b) => a.le.localeCompare(b.le));
  return { collections: col, parametres: {}, disponibles };
}
