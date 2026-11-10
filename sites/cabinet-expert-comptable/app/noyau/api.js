// Noyau du cabinet — toutes les routes de l'application, avec leurs contrôles d'accès.
// Le même code tourne :
//   - dans la démo (navigateur, base en mémoire enregistrée dans le navigateur, agents simulés) ;
//   - sur le serveur (Node, base SQLite, agents Claude, envoi des e-mails), voir projets/cabinet-expert-comptable.
// Règle d'or : aucune action sortante (message au client, écriture comptable, déclaration) sans un clic humain.
//   - les agents IA ne font que PROPOSER (fiche lue, compte proposé) ;
//   - les workflows ne font que PRÉPARER (relances en brouillon, G50 calculée) ;
//   - envoyer, valider une écriture, valider une G50, publier un résultat : réservé à un membre du cabinet.
import { periodeFr, da, nouvelId, decalerPeriode, lireMontant } from './format.js';
import { SCHEMAS_DEFAUT, PLAN_COMPTES, JOURNAUX } from './scf.js';
import { controler, bloquante, normaliserFiche, TYPES_PIECE } from './pieces.js';
import { genererEcritures, historiqueImputations, imputerLigne, equilibre } from './ecritures.js';
import { calculerG50 } from './g50.js';
import { resultatPeriode, resultatsExercice } from './resultat.js';
import { ECHEANCIER_DEFAUT, echeancesDuMois } from './echeancier.js';
import { PIECES_A_DEMANDER_DEFAUT, MODELES_DEFAUT, piecesAttendues, valeursModele, brouillon, lienWhatsApp } from './relances.js';
import { EXPORT_DEFAUT, exportPCCompta, exportG50, exportEtatAchats, lignesExport } from './export.js';
import { TYPE_XLSX } from './xlsx.js';
import { SITE_DEFAUT, CABINET_DEFAUT } from './site.js';

export class ErreurApi extends Error {
  constructor(statut, message) {
    super(message);
    this.statut = statut;
  }
}
const refus = (m = 'Accès refusé.') => new ErreurApi(403, m);
const introuvable = (m = 'Introuvable.') => new ErreurApi(404, m);
const invalide = (m) => new ErreurApi(400, m);

export const PARAMETRES = {
  site: { titre: 'Textes du site', defaut: SITE_DEFAUT },
  cabinet: { titre: 'Cabinet', defaut: CABINET_DEFAUT },
  modeles: { titre: 'Modèles de relance et de messages', defaut: MODELES_DEFAUT },
  echeancier: { titre: 'Échéancier fiscal et social', defaut: ECHEANCIER_DEFAUT },
  pieces: { titre: 'Pièces à demander', defaut: PIECES_A_DEMANDER_DEFAUT },
  schemas: { titre: 'Schémas de comptabilisation', defaut: SCHEMAS_DEFAUT },
  export: { titre: "Format d'export PC Compta", defaut: EXPORT_DEFAUT },
  agents: { titre: 'Agents IA', defaut: { lecteur_pieces: { actif: true, seuilConfiance: 0.8 }, imputation_scf: { actif: true } } },
  relances: { titre: 'Relances automatiques', defaut: { jours: [5, 12], modeleParDefaut: 'relance_1', modeleRappel: 'relance_2' } },
};

const ROLES = { associe: 'Associé', collaborateur: 'Collaborateur', client: 'Client' };
const PERSONNEL = ['associe', 'collaborateur'];
const PERIODE = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * base    : { tous(col), liste(col, filtre), lire(col, id), ecrire(col, doc), supprimer(col, id), param(cle), ecrireParam(cle, v) }
 * moteurs : { lirePiece({ piece, dossier }), imputer({ ligne, fiche, dossier, plan, schemas }), envoyer(envoi, dossier) }
 * securite: { preparerMotDePasse(mdp) → Promise<object> } (empreinte du mot de passe, jamais le mot de passe)
 * horloge : () → Date (la démo est figée au 10/11/2026)
 * infosAgents : () → [{ id, nom, role, declencheur, entrees, sorties, validation, prompt }]
 */
export function creerApi({ base, moteurs, securite = {}, horloge = () => new Date(), infosAgents = () => [] }) {
  const maintenant = () => horloge().toISOString();
  const aujourdhui = () => maintenant().slice(0, 10);
  const periodeTravail = () => decalerPeriode(aujourdhui().slice(0, 7), -1);
  const param = (cle) => base.param(cle) ?? structuredClone(PARAMETRES[cle].defaut);

  function journaliser(u, action, objet, details = '') {
    base.ecrire('journal', { id: nouvelId('j'), le: maintenant(), utilisateurId: u?.id || 'systeme', nom: u?.nom || (u === 'agent' ? 'Agent IA' : 'Système'), action, objet, details });
  }

  // ——— Accès ———
  function exiger(u, ...roles) {
    if (!u) throw new ErreurApi(401, 'Connexion requise.');
    if (roles.length && !roles.includes(u.role)) throw refus();
  }
  function dossiersVisibles(u) {
    const tous = base.tous('dossiers').filter((d) => !d.archive);
    if (u.role === 'associe') return tous;
    if (u.role === 'collaborateur') return tous.filter((d) => d.collaborateurId === u.id);
    return tous.filter((d) => d.id === u.dossierId);
  }
  function dossier(u, id) {
    const d = base.lire('dossiers', id);
    if (!d) throw introuvable('Dossier introuvable.');
    if (!dossiersVisibles(u).some((x) => x.id === id)) throw refus('Ce dossier ne fait pas partie de votre portefeuille.');
    return d;
  }
  function piece(u, id) {
    const p = base.lire('pieces', id);
    if (!p) throw introuvable('Pièce introuvable.');
    dossier(u, p.dossierId);
    return p;
  }
  const periodeOuDefaut = (p) => {
    if (!p) return periodeTravail();
    if (!PERIODE.test(p)) throw invalide('Période invalide (AAAA-MM attendu).');
    return p;
  };
  const nomUtilisateur = (id) => base.lire('utilisateurs', id)?.nom || '';

  // ——— Calculs réutilisés ———
  const piecesDossier = (dossierId, periode) => base.liste('pieces', periode ? { dossierId, periode } : { dossierId });
  const ecrituresDossier = (dossierId, periode) => base.liste('ecritures', periode ? { dossierId, periode } : { dossierId });
  const declarationDe = (dossierId, periode) => base.liste('declarations', { dossierId, periode }).find((d) => d.type === 'G50') || null;
  const neantDe = (dossierId, periode) => base.lire('neant', `${dossierId}|${periode}`)?.types || [];

  function attendues(d, periode) {
    return piecesAttendues({ dossier: d, periode, pieces: piecesDossier(d.id, periode), liste: param('pieces'), neant: neantDe(d.id, periode) });
  }

  function etatEcheance(d, regle, pc) {
    if (regle.lien === 'g50') {
      const dec = declarationDe(d.id, pc);
      return { fait: dec?.statut === 'deposee', statut: dec?.statut === 'deposee' ? 'fait' : dec?.statut || null, montant: dec?.calcul?.total ?? null };
    }
    const s = base.lire('suivi_echeances', `${regle.id}|${d.id}|${pc}`);
    return { fait: Boolean(s?.fait) };
  }

  function resumeDossier(d, periode) {
    const pcs = piecesDossier(d.id, periode);
    const att = attendues(d, periode);
    const dec = declarationDe(d.id, periode);
    const ecr = ecrituresDossier(d.id, periode);
    return {
      ...d,
      collaborateur: nomUtilisateur(d.collaborateurId),
      periode,
      pieces: { total: pcs.length, aValider: pcs.filter((p) => p.statut === 'a_valider').length, enLecture: pcs.filter((p) => p.statut === 'en_lecture' || p.statut === 'recue').length },
      manquantes: att.filter((a) => a.manquante).map((a) => a.libelle),
      ecritures: { proposees: ecr.filter((e) => e.statut === 'proposee').length, validees: ecr.filter((e) => e.statut === 'validee' || e.statut === 'exportee').length },
      g50: dec ? { id: dec.id, statut: dec.statut, total: dec.calcul.total, dateLimite: dec.calcul.dateLimite } : null,
    };
  }

  // ——— Agents (propositions seulement) ———
  async function lancerLecture(p, u) {
    const reglages = param('agents').lecteur_pieces || {};
    const d = base.lire('dossiers', p.dossierId);
    p.statut = 'en_lecture';
    base.ecrire('pieces', p);
    if (reglages.actif === false || !moteurs?.lirePiece) {
      p.statut = 'a_valider';
      p.fiche = p.fiche || { typeDoc: p.type, lignes: [] };
      p.lecture = { agent: null, le: maintenant(), confiance: 0, remarques: ['Agent de lecture désactivé : fiche à remplir à la main.'] };
      p.controles = controler(p.fiche, { dossier: d, periode: p.periode });
      return base.ecrire('pieces', p);
    }
    try {
      const r = await moteurs.lirePiece({ piece: p, dossier: d });
      const fiche = normaliserFiche({ ...r.fiche, typeDoc: r.fiche?.typeDoc || p.type }, d);
      fiche.pieceId = p.id;
      const courant = base.lire('pieces', p.id) || p;
      courant.fiche = fiche;
      if (['facture_achat', 'facture_vente', 'avoir', 'etat_paie', 'releve_bancaire', 'piece_caisse'].includes(fiche.typeDoc)) courant.type = fiche.typeDoc;
      courant.lecture = { agent: 'lecteur_pieces', le: maintenant(), confiance: r.confiance ?? null, remarques: r.remarques || [], incertains: r.incertains || [], modele: r.modele || null };
      courant.controles = controler(fiche, { dossier: d, periode: courant.periode, autresPieces: piecesDossier(d.id) });
      const seuil = Number(reglages.seuilConfiance ?? 0.8);
      if ((r.confiance ?? 1) < seuil) courant.controles.push({ niveau: 'alerte', code: 'confiance', message: `Lecture peu sûre (${Math.round((r.confiance || 0) * 100)} %) : relire chaque champ.` });
      courant.statut = 'a_valider';
      base.ecrire('pieces', courant);
      journaliser('agent', 'Pièce lue par l’agent', `${TYPES_PIECE[courant.type] || 'Pièce'} ${fiche.numero || ''} — ${d.raisonSociale}`, `confiance ${Math.round((r.confiance ?? 0) * 100)} %`);
      return courant;
    } catch (e) {
      const courant = base.lire('pieces', p.id) || p;
      courant.statut = 'a_valider';
      courant.fiche = courant.fiche || { typeDoc: courant.type, lignes: [] };
      courant.lecture = { agent: 'lecteur_pieces', le: maintenant(), confiance: 0, remarques: [`Lecture impossible : ${e.message}. Fiche à remplir à la main.`] };
      courant.controles = controler(courant.fiche, { dossier: d, periode: courant.periode });
      base.ecrire('pieces', courant);
      return courant;
    }
  }

  async function proposerEcritures(p, u) {
    const d = base.lire('dossiers', p.dossierId);
    const schemas = param('schemas');
    const historique = historiqueImputations(piecesDossier(d.id), ecrituresDossier(d.id));
    const imputations = {};
    const lignes = p.fiche.lignes || [];
    for (let i = 0; i < lignes.length; i++) {
      const imp = imputerLigne(lignes[i], p.fiche, { schemas, historique });
      if (imp.compte) {
        imputations[i] = imp;
        continue;
      }
      if (param('agents').imputation_scf?.actif === false || !moteurs?.imputer) continue;
      const r = await moteurs.imputer({ ligne: lignes[i], fiche: p.fiche, dossier: d, plan: PLAN_COMPTES, schemas });
      if (r?.compte) {
        imputations[i] = { compte: String(r.compte), source: 'agent', justification: r.justification || '', confiance: r.confiance ?? null };
        lignes[i].compte = String(r.compte);
        lignes[i].sourceCompte = 'agent';
        lignes[i].justification = r.justification || '';
      }
    }
    const { ecritures, manquantes } = genererEcritures(p, d, { schemas, historique, imputations });
    if (manquantes.length) throw invalide(`Compte à choisir pour la ligne ${manquantes.map((i) => i + 1).join(', ')} (aucune règle, agent indisponible).`);
    // Remplace les écritures encore proposées de cette pièce
    for (const e of base.liste('ecritures', { dossierId: d.id })) if (e.pieceId === p.id && e.statut === 'proposee') base.supprimer('ecritures', e.id);
    const out = [];
    for (const e of ecritures) {
      const justifs = Object.values(imputations).filter((x) => x.source === 'agent').map((x) => x.justification);
      out.push(base.ecrire('ecritures', { id: nouvelId('e'), ...e, statut: 'proposee', creeLe: maintenant(), creePar: u.id, justification: justifs.join(' ') }));
    }
    return out;
  }

  // ——— Routes ———
  const R = [];
  const route = (methode, motif, roles, fn) => R.push({ methode, motif: new RegExp(`^${motif.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`), roles, fn });

  // Public (site du cabinet)
  route('GET', '/public/site', null, () => ({ site: param('site'), cabinet: param('cabinet') }));
  route('POST', '/public/contact', null, ({ corps }) => {
    const c = corps || {};
    const nom = String(c.nom || '').trim().slice(0, 120);
    const message = String(c.message || '').trim().slice(0, 3000);
    const contact = String(c.email || c.telephone || '').trim().slice(0, 160);
    if (!nom || !message || !contact) throw invalide('Nom, moyen de contact et message sont obligatoires.');
    const doc = base.ecrire('contacts', { id: nouvelId('c'), le: maintenant(), nom, entreprise: String(c.entreprise || '').slice(0, 160), email: String(c.email || '').slice(0, 160), telephone: String(c.telephone || '').slice(0, 40), message, traite: false });
    journaliser(null, 'Demande de contact reçue (site)', nom);
    return { ok: true, id: doc.id };
  });

  route('GET', '/moi', [], ({ u }) => ({ utilisateur: publicUtilisateur(u), roleLibelle: ROLES[u.role], cabinet: param('cabinet'), periodeTravail: periodeTravail(), aujourdhui: aujourdhui(), dossier: u.role === 'client' ? base.lire('dossiers', u.dossierId) : null }));

  // Compteurs du menu (pièces, écritures, messages en attente)
  route('GET', '/compteurs', [], ({ u }) => {
    const ids = new Set(dossiersVisibles(u).map((d) => d.id));
    const dans = (col, f) => base.tous(col).filter((x) => ids.has(x.dossierId) && f(x)).length;
    if (u.role === 'client') return { messagesNonLus: dans('messages', (m) => m.de === 'cabinet' && !m.lu) };
    return {
      piecesAValider: dans('pieces', (p) => p.statut === 'a_valider'),
      ecrituresProposees: dans('ecritures', (e) => e.statut === 'proposee'),
      envoisAValider: dans('envois', (e) => e.statut === 'a_valider'),
      messagesNonLus: dans('messages', (m) => m.de === 'client' && !m.lu),
      contactsNonTraites: u.role === 'associe' ? base.tous('contacts').filter((c) => !c.traite).length : 0,
      g50AValider: u.role === 'associe' ? dans('declarations', (d) => d.statut === 'preparee') : 0,
    };
  });

  // Tableau de bord du cabinet
  route('GET', '/tableau', PERSONNEL, ({ u, q }) => {
    const periode = periodeOuDefaut(q.periode);
    const ds = dossiersVisibles(u);
    const resumes = ds.map((d) => resumeDossier(d, periode));
    const ids = new Set(ds.map((d) => d.id));
    const mois = aujourdhui().slice(0, 7);
    const ech = [mois, decalerPeriode(mois, 1)].flatMap((m) => echeancesDuMois({ mois: m, dossiers: ds, regles: param('echeancier'), etat: etatEcheance, aujourdhui: aujourdhui() })).filter((e) => !e.fait && e.date >= aujourdhui()).slice(0, 12);
    const envois = base.tous('envois').filter((e) => e.statut === 'a_valider' && ids.has(e.dossierId));
    const lectures = base.tous('journal').filter((j) => j.utilisateurId === 'systeme' && j.nom === 'Agent IA').sort((a, b) => b.le.localeCompare(a.le)).slice(0, 6);
    return {
      periode,
      dateLimiteG50: `${decalerPeriode(periode, 1)}-20`,
      indicateurs: {
        dossiers: ds.length,
        piecesAValider: resumes.reduce((s, r) => s + r.pieces.aValider, 0),
        ecrituresProposees: resumes.reduce((s, r) => s + r.ecritures.proposees, 0),
        envoisAValider: envois.length,
        g50: { aPreparer: resumes.filter((r) => !r.g50 && r.regime !== 'ifu').length, preparees: resumes.filter((r) => r.g50?.statut === 'preparee').length, validees: resumes.filter((r) => r.g50?.statut === 'validee').length, deposees: resumes.filter((r) => r.g50?.statut === 'deposee').length },
        dossiersIncomplets: resumes.filter((r) => r.manquantes.length).length,
        aPayerTotal: resumes.reduce((s, r) => s + (r.g50?.total || 0), 0),
      },
      dossiers: resumes,
      echeances: ech,
      activiteAgents: lectures,
    };
  });

  // Dossiers
  route('GET', '/dossiers', PERSONNEL, ({ u, q }) => {
    const periode = periodeOuDefaut(q.periode);
    return { periode, dossiers: dossiersVisibles(u).map((d) => resumeDossier(d, periode)), collaborateurs: base.tous('utilisateurs').filter((x) => PERSONNEL.includes(x.role) && x.actif !== false).map((x) => ({ id: x.id, nom: x.nom, role: x.role })) };
  });
  route('GET', '/dossiers/:id', [], ({ u, p, q }) => {
    const d = dossier(u, p.id);
    const periode = periodeOuDefaut(q.periode);
    const r = u.role === 'client' ? { ...d, periode } : resumeDossier(d, periode);
    const dec = declarationDe(d.id, periode);
    const visible = dec && (u.role !== 'client' || ['validee', 'deposee'].includes(dec.statut));
    return { dossier: r, attendues: attendues(d, periode), declaration: visible ? { ...dec, preparePar: nomUtilisateur(dec.preparePar), validePar: nomUtilisateur(dec.validePar) } : null, resultat: u.role === 'client' && !base.lire('publications', `${d.id}|${periode}`) ? null : resultatPeriode(ecrituresDossier(d.id), periode) };
  });
  const CHAMPS_DOSSIER = ['raisonSociale', 'forme', 'activite', 'nature', 'wilaya', 'adresse', 'nif', 'nis', 'rc', 'ai', 'regime', 'impot', 'centreImpots', 'salaries', 'caisse', 'banque', 'casnos', 'tvaSurEncaissements', 'creditTvaInitial', 'collaborateurId', 'contact', 'debutExercice', 'archive'];
  route('POST', '/dossiers', ['associe'], ({ u, corps }) => {
    if (!corps?.raisonSociale) throw invalide('Raison sociale obligatoire.');
    const d = { id: nouvelId('d'), creeLe: maintenant() };
    for (const k of CHAMPS_DOSSIER) if (corps[k] !== undefined) d[k] = corps[k];
    base.ecrire('dossiers', d);
    journaliser(u, 'Dossier créé', d.raisonSociale);
    return d;
  });
  route('PUT', '/dossiers/:id', ['associe'], ({ u, p, corps }) => {
    const d = dossier(u, p.id);
    for (const k of CHAMPS_DOSSIER) if (corps[k] !== undefined) d[k] = corps[k];
    base.ecrire('dossiers', d);
    journaliser(u, 'Dossier modifié', d.raisonSociale);
    return d;
  });
  route('POST', '/dossiers/:id/neant', [], ({ u, p, corps }) => {
    const d = dossier(u, p.id);
    const periode = periodeOuDefaut(corps.periode);
    const cle = `${d.id}|${periode}`;
    const doc = base.lire('neant', cle) || { id: cle, types: [] };
    doc.types = corps.neant ? [...new Set([...doc.types, corps.type])] : doc.types.filter((t) => t !== corps.type);
    base.ecrire('neant', doc);
    journaliser(u, corps.neant ? 'Déclaré « néant ce mois »' : '« Néant » retiré', `${TYPES_PIECE[corps.type] || corps.type} — ${d.raisonSociale} — ${periodeFr(periode)}`);
    return { attendues: attendues(d, periode) };
  });

  // Pièces
  route('GET', '/pieces', [], ({ u, q }) => {
    const ids = q.dossierId ? [dossier(u, q.dossierId).id] : dossiersVisibles(u).map((d) => d.id);
    let l = ids.flatMap((id) => piecesDossier(id, q.periode || undefined));
    if (q.statut) l = l.filter((p) => q.statut.split(',').includes(p.statut));
    const noms = Object.fromEntries(base.tous('dossiers').map((d) => [d.id, d.raisonSociale]));
    return { pieces: l.sort((a, b) => b.recueLe.localeCompare(a.recueLe)).map((p) => ({ ...p, dossier: noms[p.dossierId] })) };
  });
  route('GET', '/pieces/:id', [], ({ u, p }) => {
    const pc = piece(u, p.id);
    const d = base.lire('dossiers', pc.dossierId);
    const ecr = u.role === 'client' ? [] : ecrituresDossier(pc.dossierId).filter((e) => e.pieceId === pc.id);
    const schemas = param('schemas');
    const historique = historiqueImputations(piecesDossier(d.id), ecrituresDossier(d.id));
    const imputations = pc.fiche?.lignes?.map((l) => imputerLigne(l, pc.fiche, { schemas, historique })) || [];
    return { piece: pc, dossier: d, ecritures: ecr, imputations, plan: PLAN_COMPTES };
  });
  route('POST', '/pieces', [], async ({ u, corps }) => {
    const d = dossier(u, corps.dossierId || u.dossierId);
    const periode = periodeOuDefaut(corps.periode);
    if (!TYPES_PIECE[corps.type]) throw invalide('Type de pièce inconnu.');
    if (!corps.fichier?.ref) throw invalide('Fichier manquant.');
    const pc = base.ecrire('pieces', { id: nouvelId('p'), dossierId: d.id, periode, type: corps.type, fichier: corps.fichier, source: u.role === 'client' ? 'client' : 'cabinet', deposePar: u.id, recueLe: maintenant(), statut: 'recue', commentaire: String(corps.commentaire || '').slice(0, 500), exemple: corps.exemple || null });
    journaliser(u, 'Pièce déposée', `${TYPES_PIECE[pc.type]} — ${d.raisonSociale} — ${periodeFr(periode)}`, corps.fichier.nom || '');
    // Lecture par l'agent lancée tout de suite, sans attendre (le statut passe à « Lecture en cours »)
    if (corps.attendreLecture) return lancerLecture(pc, u);
    lancerLecture(pc, u).catch(() => {});
    return pc;
  });
  route('POST', '/pieces/:id/lire', PERSONNEL, ({ u, p }) => {
    const pc = piece(u, p.id);
    if (['comptabilisee'].includes(pc.statut)) throw invalide('Pièce déjà comptabilisée.');
    return lancerLecture(pc, u);
  });
  route('PUT', '/pieces/:id', PERSONNEL, ({ u, p, corps }) => {
    const pc = piece(u, p.id);
    if (['validee', 'comptabilisee'].includes(pc.statut)) throw invalide('Pièce déjà validée : annuler la validation d’abord.');
    const d = base.lire('dossiers', pc.dossierId);
    if (corps.periode) pc.periode = periodeOuDefaut(corps.periode);
    if (corps.type && TYPES_PIECE[corps.type]) pc.type = corps.type;
    if (corps.fiche) {
      const f = normaliserFiche({ ...corps.fiche, typeDoc: corps.fiche.typeDoc || pc.type }, d);
      f.pieceId = pc.id;
      pc.fiche = f;
      pc.corrigeePar = u.id;
      pc.corrigeeLe = maintenant();
    }
    pc.controles = controler(pc.fiche || { typeDoc: pc.type }, { dossier: d, periode: pc.periode, autresPieces: piecesDossier(d.id) });
    base.ecrire('pieces', pc);
    return pc;
  });
  route('POST', '/pieces/:id/valider', PERSONNEL, async ({ u, p }) => {
    const pc = piece(u, p.id);
    if (pc.statut !== 'a_valider') throw invalide('Seule une pièce « à valider » peut être validée.');
    const d = base.lire('dossiers', pc.dossierId);
    pc.controles = controler(pc.fiche, { dossier: d, periode: pc.periode, autresPieces: piecesDossier(d.id) });
    if (bloquante(pc.controles)) throw invalide(`Corriger d'abord : ${pc.controles.filter((c) => c.niveau === 'erreur').map((c) => c.message).join(' ')}`);
    const ecritures = ['releve_bancaire', 'autre'].includes(pc.fiche.typeDoc) ? [] : await proposerEcritures(pc, u);
    pc.statut = ecritures.length ? 'validee' : 'comptabilisee';
    pc.valideePar = u.id;
    pc.valideeLe = maintenant();
    base.ecrire('pieces', pc);
    journaliser(u, 'Fiche validée', `${TYPES_PIECE[pc.type]} ${pc.fiche.numero || ''} — ${d.raisonSociale}`, `${ecritures.length} écriture(s) proposée(s)`);
    return { piece: pc, ecritures };
  });
  route('POST', '/pieces/:id/rouvrir', PERSONNEL, ({ u, p }) => {
    const pc = piece(u, p.id);
    const ecr = ecrituresDossier(pc.dossierId).filter((e) => e.pieceId === pc.id);
    if (ecr.some((e) => e.statut === 'exportee')) throw invalide('Écritures déjà exportées vers PC Compta : passer une écriture de correction dans PC Compta.');
    for (const e of ecr) base.supprimer('ecritures', e.id);
    pc.statut = 'a_valider';
    base.ecrire('pieces', pc);
    journaliser(u, 'Pièce rouverte', pc.fiche?.numero || pc.id);
    return pc;
  });
  route('POST', '/pieces/:id/rejeter', PERSONNEL, ({ u, p, corps }) => {
    const pc = piece(u, p.id);
    if (pc.statut === 'comptabilisee') throw invalide('Pièce déjà comptabilisée.');
    pc.statut = 'rejetee';
    pc.motifRejet = String(corps.motif || '').slice(0, 300);
    base.ecrire('pieces', pc);
    journaliser(u, 'Pièce rejetée', pc.fiche?.numero || pc.fichier?.nom || pc.id, pc.motifRejet);
    return pc;
  });

  // Écritures
  route('GET', '/ecritures', PERSONNEL, ({ u, q }) => {
    const ids = q.dossierId ? [dossier(u, q.dossierId).id] : dossiersVisibles(u).map((d) => d.id);
    let l = ids.flatMap((id) => ecrituresDossier(id, q.periode || undefined));
    if (q.journal) l = l.filter((e) => e.journal === q.journal);
    if (q.statut) l = l.filter((e) => q.statut.split(',').includes(e.statut));
    l.sort((a, b) => a.journal.localeCompare(b.journal) || a.date.localeCompare(b.date));
    const totaux = Object.fromEntries(Object.keys(JOURNAUX).map((j) => [j, equilibre(l.filter((e) => e.journal === j).flatMap((e) => e.lignes))]));
    const cfg = param('export');
    return { ecritures: l, totaux, journaux: JOURNAUX, plan: PLAN_COMPTES, apercuExport: { colonnes: cfg.colonnes, lignes: lignesExport(l.filter((e) => e.statut !== 'proposee'), cfg).slice(0, 40) } };
  });
  route('PUT', '/ecritures/:id', PERSONNEL, ({ u, p, corps }) => {
    const e = base.lire('ecritures', p.id);
    if (!e) throw introuvable();
    dossier(u, e.dossierId);
    if (e.statut !== 'proposee') throw invalide('Seule une écriture proposée se modifie ici.');
    const lignes = (corps.lignes || []).map((l) => ({ compte: String(l.compte || '').trim(), libelle: String(l.libelle || '').slice(0, 120), debit: Math.max(0, Math.round(Number(l.debit) || 0)), credit: Math.max(0, Math.round(Number(l.credit) || 0)) })).filter((l) => l.compte && (l.debit || l.credit));
    const eq = equilibre(lignes);
    if (!eq.ok) throw invalide(`Écriture déséquilibrée : débit ${da(eq.debit)}, crédit ${da(eq.credit)}.`);
    e.lignes = lignes;
    e.modifieePar = u.id;
    e.source = e.source === 'agent' ? 'agent_corrige' : 'manuel';
    base.ecrire('ecritures', e);
    journaliser(u, 'Écriture corrigée', `${e.journal} ${e.numeroPiece}`);
    return e;
  });
  route('POST', '/ecritures/valider', PERSONNEL, ({ u, corps }) => {
    const ids = corps.ids || [];
    const faites = [];
    for (const id of ids) {
      const e = base.lire('ecritures', id);
      if (!e || e.statut !== 'proposee') continue;
      dossier(u, e.dossierId);
      if (!equilibre(e.lignes).ok) throw invalide(`Écriture ${e.numeroPiece} déséquilibrée.`);
      e.statut = 'validee';
      e.valideePar = u.id;
      e.valideeLe = maintenant();
      base.ecrire('ecritures', e);
      faites.push(e);
      const pc = base.lire('pieces', e.pieceId);
      if (pc && ecrituresDossier(pc.dossierId).filter((x) => x.pieceId === pc.id).every((x) => x.statut !== 'proposee')) {
        pc.statut = 'comptabilisee';
        base.ecrire('pieces', pc);
      }
    }
    if (faites.length) journaliser(u, 'Écritures validées', `${faites.length} écriture(s)`, [...new Set(faites.map((e) => base.lire('dossiers', e.dossierId)?.raisonSociale))].join(', '));
    return { validees: faites.length };
  });

  // Exports
  route('GET', '/export/pccompta', PERSONNEL, ({ u, q }) => {
    const d = dossier(u, q.dossierId);
    const periode = periodeOuDefaut(q.periode);
    const l = ecrituresDossier(d.id, periode).filter((e) => e.statut === 'validee' || e.statut === 'exportee');
    if (!l.length) throw invalide('Aucune écriture validée sur cette période.');
    const f = exportPCCompta(l, d, periode, param('export'));
    for (const e of l) {
      if (e.statut === 'validee') {
        e.statut = 'exportee';
        e.exporteeLe = maintenant();
        base.ecrire('ecritures', e);
      }
    }
    journaliser(u, 'Export PC Compta', `${d.raisonSociale} — ${periodeFr(periode)}`, `${l.length} écriture(s)`);
    return { telechargement: { nom: f.nom, type: TYPE_XLSX, octets: f.octets } };
  });
  route('GET', '/export/etat-achats', PERSONNEL, ({ u, q }) => {
    const d = dossier(u, q.dossierId);
    const periode = periodeOuDefaut(q.periode);
    const c = calculerG50({ dossier: d, periode, pieces: piecesDossier(d.id) });
    const f = exportEtatAchats(c, d, periode);
    return { telechargement: { nom: f.nom, type: TYPE_XLSX, octets: f.octets } };
  });
  route('GET', '/export/g50', [], ({ u, q }) => {
    const dec = base.lire('declarations', q.id);
    if (!dec) throw introuvable();
    const d = dossier(u, dec.dossierId);
    if (u.role === 'client' && !['validee', 'deposee'].includes(dec.statut)) throw refus();
    const f = exportG50(dec, d);
    return { telechargement: { nom: f.nom, type: TYPE_XLSX, octets: f.octets } };
  });

  // Déclarations G50
  route('GET', '/declarations', [], ({ u, q }) => {
    const ids = q.dossierId ? [dossier(u, q.dossierId).id] : dossiersVisibles(u).map((d) => d.id);
    let l = ids.flatMap((id) => base.liste('declarations', { dossierId: id }));
    if (q.periode) l = l.filter((d) => d.periode === q.periode);
    if (u.role === 'client') l = l.filter((d) => ['validee', 'deposee'].includes(d.statut));
    const noms = Object.fromEntries(base.tous('dossiers').map((d) => [d.id, d.raisonSociale]));
    return { declarations: l.sort((a, b) => b.periode.localeCompare(a.periode) || noms[a.dossierId].localeCompare(noms[b.dossierId])).map((x) => ({ ...x, dossier: noms[x.dossierId], preparePar: nomUtilisateur(x.preparePar), validePar: nomUtilisateur(x.validePar) })) };
  });
  function calculer(d, periode, saisies) {
    return calculerG50({ dossier: d, periode, pieces: piecesDossier(d.id), precedente: declarationDe(d.id, decalerPeriode(periode, -1)), saisies });
  }
  route('POST', '/declarations/g50', PERSONNEL, ({ u, corps }) => {
    const d = dossier(u, corps.dossierId);
    const periode = periodeOuDefaut(corps.periode);
    const ex = declarationDe(d.id, periode);
    if (ex && ['validee', 'deposee'].includes(ex.statut)) throw invalide('G50 déjà validée : la rouvrir pour la recalculer.');
    const dec = ex || { id: nouvelId('g'), type: 'G50', dossierId: d.id, periode, saisies: {} };
    dec.calcul = calculer(d, periode, dec.saisies);
    dec.statut = 'preparee';
    dec.preparePar = u.id;
    dec.prepareLe = maintenant();
    base.ecrire('declarations', dec);
    journaliser(u, 'G50 préparée', `${d.raisonSociale} — ${periodeFr(periode)}`, da(dec.calcul.total));
    return dec;
  });
  route('PUT', '/declarations/:id', PERSONNEL, ({ u, p, corps }) => {
    const dec = base.lire('declarations', p.id);
    if (!dec) throw introuvable();
    const d = dossier(u, dec.dossierId);
    if (['validee', 'deposee'].includes(dec.statut)) throw invalide('G50 validée : la rouvrir pour la modifier.');
    const s = corps.saisies || {};
    dec.saisies = {
      precompte: s.precompte === '' || s.precompte == null ? null : lireMontant(s.precompte),
      irg: s.irg === '' || s.irg == null ? null : lireMontant(s.irg),
      autres: (s.autres || []).filter((a) => a.libelle).map((a) => ({ libelle: String(a.libelle).slice(0, 120), montant: typeof a.montant === 'number' ? a.montant : lireMontant(a.montant) })),
    };
    for (const k of ['precompte', 'irg']) if (dec.saisies[k] == null) delete dec.saisies[k];
    dec.calcul = calculer(d, dec.periode, dec.saisies);
    base.ecrire('declarations', dec);
    return dec;
  });
  route('POST', '/declarations/:id/valider', ['associe'], ({ u, p }) => {
    const dec = base.lire('declarations', p.id);
    if (!dec) throw introuvable();
    const d = dossier(u, dec.dossierId);
    if (dec.statut !== 'preparee') throw invalide('Seule une G50 préparée peut être validée.');
    dec.calcul = calculer(d, dec.periode, dec.saisies);
    dec.statut = 'validee';
    dec.validePar = u.id;
    dec.valideLe = maintenant();
    base.ecrire('declarations', dec);
    // Message au client préparé, PAS envoyé : il attend dans la boîte d'envoi
    const modele = param('modeles').find((m) => m.usage === 'g50');
    if (modele) {
      const v = valeursModele({ dossier: d, periode: dec.periode, cabinet: param('cabinet'), g50: dec.calcul });
      base.ecrire('envois', { id: nouvelId('m'), dossierId: d.id, ...brouillon(modele, v, d), origine: 'g50', lienId: dec.id, statut: 'a_valider', creeLe: maintenant(), creePar: 'workflow' });
    }
    journaliser(u, 'G50 validée', `${d.raisonSociale} — ${periodeFr(dec.periode)}`, da(dec.calcul.total));
    return dec;
  });
  route('POST', '/declarations/:id/rouvrir', ['associe'], ({ u, p }) => {
    const dec = base.lire('declarations', p.id);
    if (!dec) throw introuvable();
    dossier(u, dec.dossierId);
    if (dec.statut === 'deposee') throw invalide('G50 déjà déposée : une rectification se fait sur Jibaya’tic ou au guichet.');
    dec.statut = 'preparee';
    base.ecrire('declarations', dec);
    journaliser(u, 'G50 rouverte', dec.periode);
    return dec;
  });
  route('POST', '/declarations/:id/deposee', PERSONNEL, ({ u, p, corps }) => {
    const dec = base.lire('declarations', p.id);
    if (!dec) throw introuvable();
    const d = dossier(u, dec.dossierId);
    if (dec.statut !== 'validee') throw invalide("La G50 doit être validée par l'associé avant d'être déposée.");
    dec.statut = 'deposee';
    dec.deposeLe = corps.date || aujourdhui();
    dec.reference = String(corps.reference || '').slice(0, 80);
    dec.deposePar = u.id;
    base.ecrire('declarations', dec);
    journaliser(u, 'G50 marquée déposée', `${d.raisonSociale} — ${periodeFr(dec.periode)}`, dec.reference);
    return dec;
  });

  // Résultats
  route('GET', '/resultats', [], ({ u, q }) => {
    const d = dossier(u, q.dossierId || u.dossierId);
    const periode = periodeOuDefaut(q.periode);
    const ecr = ecrituresDossier(d.id);
    const ex = resultatsExercice(ecr, periode, d.debutExercice ? `${periode.slice(0, 4)}-${d.debutExercice}` : undefined);
    const pubs = base.liste('publications', { dossierId: d.id });
    if (u.role === 'client') {
      const publies = new Set(pubs.map((x) => x.periode));
      ex.mois = ex.mois.filter((m) => publies.has(m.periode));
      ex.cumul = ex.mois.reduce((s, r) => ({ produits: s.produits + r.produits, charges: s.charges + r.charges, resultat: s.resultat + r.resultat }), { produits: 0, charges: 0, resultat: 0 });
    }
    return { dossier: { id: d.id, raisonSociale: d.raisonSociale }, periode, ...ex, publications: pubs };
  });
  route('POST', '/resultats/publier', PERSONNEL, ({ u, corps }) => {
    const d = dossier(u, corps.dossierId);
    const periode = periodeOuDefaut(corps.periode);
    const r = resultatPeriode(ecrituresDossier(d.id), periode);
    if (!r.nbEcritures) throw invalide('Aucune écriture validée sur ce mois.');
    if (ecrituresDossier(d.id, periode).some((e) => e.statut === 'proposee')) throw invalide('Des écritures du mois sont encore à valider.');
    base.ecrire('publications', { id: `${d.id}|${periode}`, dossierId: d.id, periode, publieLe: maintenant(), publiePar: u.id, resultat: r.resultat });
    const modele = param('modeles').find((m) => m.usage === 'resultat');
    if (modele && corps.prevenir !== false) {
      const v = valeursModele({ dossier: d, periode, cabinet: param('cabinet'), resultat: r });
      base.ecrire('envois', { id: nouvelId('m'), dossierId: d.id, ...brouillon(modele, v, d), origine: 'resultat', statut: 'a_valider', creeLe: maintenant(), creePar: 'workflow' });
    }
    journaliser(u, 'Résultat publié au client', `${d.raisonSociale} — ${periodeFr(periode)}`, da(r.resultat));
    return { ok: true, resultat: r };
  });

  // Échéancier
  route('GET', '/echeances', [], ({ u, q }) => {
    const mois = q.mois && PERIODE.test(q.mois) ? q.mois : aujourdhui().slice(0, 7);
    const ds = dossiersVisibles(u);
    return { mois, echeances: echeancesDuMois({ mois, dossiers: ds, regles: param('echeancier'), etat: etatEcheance, aujourdhui: aujourdhui() }), regles: param('echeancier') };
  });
  route('POST', '/echeances/suivi', PERSONNEL, ({ u, corps }) => {
    const d = dossier(u, corps.dossierId);
    const regle = param('echeancier').find((r) => r.id === corps.regleId);
    if (!regle) throw introuvable('Échéance inconnue.');
    if (regle.lien === 'g50') throw invalide('Le suivi de la G50 se fait depuis la déclaration.');
    const id = `${regle.id}|${d.id}|${corps.periodeConcernee}`;
    base.ecrire('suivi_echeances', { id, fait: Boolean(corps.fait), le: maintenant(), par: u.id });
    journaliser(u, corps.fait ? 'Échéance faite' : 'Échéance rouverte', `${regle.libelle} — ${d.raisonSociale}`, corps.periodeConcernee);
    return { ok: true };
  });

  // Relances (workflow, pas d'IA) → brouillons dans la boîte d'envoi
  route('GET', '/relances', PERSONNEL, ({ u, q }) => {
    const periode = periodeOuDefaut(q.periode);
    const envois = base.tous('envois').filter((e) => e.origine === 'relance');
    return {
      periode,
      dateLimite: `${decalerPeriode(periode, 1)}-20`,
      modeles: param('modeles').filter((m) => m.usage === 'relance'),
      dossiers: dossiersVisibles(u).map((d) => {
        const att = attendues(d, periode);
        const dernieres = envois.filter((e) => e.dossierId === d.id && e.periode === periode).sort((a, b) => b.creeLe.localeCompare(a.creeLe));
        return { id: d.id, raisonSociale: d.raisonSociale, contact: d.contact, attendues: att, manquantes: att.filter((a) => a.manquante), derniereRelance: dernieres[0] ? { statut: dernieres[0].statut, le: dernieres[0].envoyeLe || dernieres[0].creeLe, canal: dernieres[0].canal } : null, nbRelances: dernieres.filter((e) => e.statut === 'envoye').length };
      }),
    };
  });
  function preparerRelances(u, periode, dossierIds, modeleId) {
    const modeles = param('modeles');
    const reglages = param('relances');
    const cree = [];
    for (const d of dossiersVisibles(u === 'systeme' ? { role: 'associe' } : u)) {
      if (dossierIds && !dossierIds.includes(d.id)) continue;
      const manquantes = attendues(d, periode).filter((a) => a.manquante);
      if (!manquantes.length) continue;
      if (base.tous('envois').some((e) => e.dossierId === d.id && e.periode === periode && e.origine === 'relance' && e.statut === 'a_valider')) continue;
      const dejaEnvoyees = base.tous('envois').filter((e) => e.dossierId === d.id && e.periode === periode && e.origine === 'relance' && e.statut === 'envoye').length;
      const modele = modeles.find((m) => m.id === (modeleId || (dejaEnvoyees ? reglages.modeleRappel : reglages.modeleParDefaut))) || modeles.find((m) => m.usage === 'relance');
      const v = valeursModele({ dossier: d, periode, cabinet: param('cabinet'), manquantes, dateLimite: `${decalerPeriode(periode, 1)}-20` });
      cree.push(base.ecrire('envois', { id: nouvelId('m'), dossierId: d.id, periode, ...brouillon(modele, v, d), origine: 'relance', manquantes: manquantes.map((m) => m.libelle), statut: 'a_valider', creeLe: maintenant(), creePar: u === 'systeme' ? 'workflow' : u.id }));
    }
    return cree;
  }
  route('POST', '/relances/preparer', PERSONNEL, ({ u, corps }) => {
    const periode = periodeOuDefaut(corps.periode);
    const cree = preparerRelances(u, periode, corps.dossierIds, corps.modeleId);
    journaliser(u, 'Relances préparées', `${cree.length} brouillon(s) — ${periodeFr(periode)}`);
    return { preparees: cree.length, envois: cree };
  });

  // Boîte d'envoi : rien ne part sans validation
  route('GET', '/envois', PERSONNEL, ({ u, q }) => {
    const ids = new Set(dossiersVisibles(u).map((d) => d.id));
    let l = base.tous('envois').filter((e) => ids.has(e.dossierId));
    if (q.statut) l = l.filter((e) => q.statut.split(',').includes(e.statut));
    const noms = Object.fromEntries(base.tous('dossiers').map((d) => [d.id, d.raisonSociale]));
    return { envois: l.sort((a, b) => (b.envoyeLe || b.creeLe).localeCompare(a.envoyeLe || a.creeLe)).map((e) => ({ ...e, dossier: noms[e.dossierId], valideePar: nomUtilisateur(e.valideePar) })) };
  });
  route('PUT', '/envois/:id', PERSONNEL, ({ u, p, corps }) => {
    const e = base.lire('envois', p.id);
    if (!e) throw introuvable();
    dossier(u, e.dossierId);
    if (e.statut !== 'a_valider') throw invalide('Message déjà traité.');
    for (const k of ['objet', 'corps', 'destinataire']) if (corps[k] != null) e[k] = String(corps[k]).slice(0, k === 'corps' ? 5000 : 200);
    if (corps.canal && ['email', 'whatsapp'].includes(corps.canal)) e.canal = corps.canal;
    e.modifiePar = u.id;
    base.ecrire('envois', e);
    return e;
  });
  route('POST', '/envois/:id/valider', PERSONNEL, async ({ u, p }) => {
    const e = base.lire('envois', p.id);
    if (!e) throw introuvable();
    const d = dossier(u, e.dossierId);
    if (e.statut !== 'a_valider') throw invalide('Message déjà traité.');
    if (!e.destinataire) throw invalide(e.canal === 'whatsapp' ? 'Numéro WhatsApp du client manquant.' : 'Adresse e-mail du client manquante.');
    let resultat = { ok: true };
    if (e.canal === 'email') resultat = (await moteurs?.envoyer?.(e, d)) || { ok: true, simulation: true };
    else resultat = { ok: true, lien: lienWhatsApp(e.destinataire, e.corps) };
    if (!resultat.ok) throw new ErreurApi(502, `Envoi impossible : ${resultat.erreur || 'serveur de messagerie injoignable'}.`);
    e.statut = 'envoye';
    e.valideePar = u.id;
    e.envoyeLe = maintenant();
    e.resultat = resultat;
    base.ecrire('envois', e);
    // Copie dans la messagerie de l'espace client
    base.ecrire('messages', { id: nouvelId('x'), dossierId: d.id, de: 'cabinet', auteurId: u.id, auteur: u.nom, objet: e.objet, texte: e.corps, le: maintenant(), lu: false, envoiId: e.id });
    journaliser(u, e.canal === 'whatsapp' ? 'Message WhatsApp validé' : 'E-mail validé et envoyé', `${e.objet || e.corps.slice(0, 60)} — ${d.raisonSociale}`);
    return e;
  });
  route('POST', '/envois/:id/rejeter', PERSONNEL, ({ u, p }) => {
    const e = base.lire('envois', p.id);
    if (!e) throw introuvable();
    dossier(u, e.dossierId);
    if (e.statut !== 'a_valider') throw invalide('Message déjà traité.');
    e.statut = 'rejete';
    e.valideePar = u.id;
    e.rejeteLe = maintenant();
    base.ecrire('envois', e);
    journaliser(u, 'Brouillon écarté', e.objet || e.corps.slice(0, 60));
    return e;
  });

  // Messagerie cabinet ↔ client
  route('GET', '/messages', [], ({ u, q }) => {
    const ids = q.dossierId ? [dossier(u, q.dossierId).id] : dossiersVisibles(u).map((d) => d.id);
    const l = ids.flatMap((id) => base.liste('messages', { dossierId: id })).sort((a, b) => a.le.localeCompare(b.le));
    const noms = Object.fromEntries(base.tous('dossiers').map((d) => [d.id, d.raisonSociale]));
    return { messages: l.map((m) => ({ ...m, dossier: noms[m.dossierId] })) };
  });
  route('POST', '/messages', [], ({ u, corps }) => {
    const d = dossier(u, corps.dossierId || u.dossierId);
    const texte = String(corps.texte || '').trim().slice(0, 3000);
    if (!texte) throw invalide('Message vide.');
    const m = base.ecrire('messages', { id: nouvelId('x'), dossierId: d.id, de: u.role === 'client' ? 'client' : 'cabinet', auteurId: u.id, auteur: u.nom, texte, le: maintenant(), lu: false });
    return m;
  });
  route('POST', '/messages/lus', [], ({ u, corps }) => {
    const d = dossier(u, corps.dossierId || u.dossierId);
    for (const m of base.liste('messages', { dossierId: d.id })) {
      if (!m.lu && (u.role === 'client' ? m.de === 'cabinet' : m.de === 'client')) {
        m.lu = true;
        base.ecrire('messages', m);
      }
    }
    return { ok: true };
  });

  // Espace client
  route('GET', '/client/accueil', ['client'], ({ u }) => {
    const d = dossier(u, u.dossierId);
    const periode = periodeTravail();
    const att = attendues(d, periode);
    const decs = base.liste('declarations', { dossierId: d.id }).filter((x) => ['validee', 'deposee'].includes(x.statut)).sort((a, b) => b.periode.localeCompare(a.periode));
    const pubs = base.liste('publications', { dossierId: d.id }).sort((a, b) => b.periode.localeCompare(a.periode));
    const dernier = pubs[0] ? resultatPeriode(ecrituresDossier(d.id), pubs[0].periode) : null;
    const mois = aujourdhui().slice(0, 7);
    const ech = [mois, decalerPeriode(mois, 1)].flatMap((m) => echeancesDuMois({ mois: m, dossiers: [d], regles: param('echeancier'), etat: etatEcheance, aujourdhui: aujourdhui() })).filter((e) => e.date >= aujourdhui()).slice(0, 5);
    const pcs = piecesDossier(d.id, periode);
    return {
      dossier: d,
      periode,
      dateLimite: `${decalerPeriode(periode, 1)}-20`,
      attendues: att,
      pieces: { deposees: pcs.length, traitees: pcs.filter((p) => ['validee', 'comptabilisee'].includes(p.statut)).length },
      g50: decs[0] || null,
      resultat: dernier,
      echeances: ech,
      nonLus: base.liste('messages', { dossierId: d.id }).filter((m) => m.de === 'cabinet' && !m.lu).length,
      cabinet: param('cabinet'),
    };
  });

  // Paramètres (associé) — textes du site, modèles, échéancier, pièces à demander, schémas, export, agents
  route('GET', '/parametres', ['associe'], () => ({ cles: Object.entries(PARAMETRES).map(([cle, v]) => ({ cle, titre: v.titre })) }));
  route('GET', '/parametres/:cle', PERSONNEL, ({ p }) => {
    if (!PARAMETRES[p.cle]) throw introuvable();
    return { cle: p.cle, valeur: param(p.cle), defaut: PARAMETRES[p.cle].defaut, plan: p.cle === 'schemas' ? PLAN_COMPTES : undefined };
  });
  route('PUT', '/parametres/:cle', ['associe'], ({ u, p, corps }) => {
    if (!PARAMETRES[p.cle]) throw introuvable();
    const v = corps.valeur;
    if (v === undefined || v === null) throw invalide('Valeur manquante.');
    if (JSON.stringify(v).length > 200000) throw invalide('Paramètre trop volumineux.');
    validerParametre(p.cle, v);
    base.ecrireParam(p.cle, v);
    journaliser(u, 'Paramètres modifiés', PARAMETRES[p.cle].titre);
    return { cle: p.cle, valeur: v };
  });
  route('POST', '/parametres/:cle/reinitialiser', ['associe'], ({ u, p }) => {
    if (!PARAMETRES[p.cle]) throw introuvable();
    base.ecrireParam(p.cle, structuredClone(PARAMETRES[p.cle].defaut));
    journaliser(u, 'Paramètres remis par défaut', PARAMETRES[p.cle].titre);
    return { cle: p.cle, valeur: param(p.cle) };
  });

  // Utilisateurs (associé)
  route('GET', '/utilisateurs', ['associe'], () => ({ utilisateurs: base.tous('utilisateurs').map(publicUtilisateur), dossiers: base.tous('dossiers').map((d) => ({ id: d.id, raisonSociale: d.raisonSociale })) }));
  route('POST', '/utilisateurs', ['associe'], async ({ u, corps }) => {
    const email = String(corps.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw invalide('Adresse e-mail invalide.');
    if (base.tous('utilisateurs').some((x) => x.email === email)) throw invalide('Cette adresse a déjà un compte.');
    if (!ROLES[corps.role]) throw invalide('Rôle inconnu.');
    if (corps.role === 'client' && !base.lire('dossiers', corps.dossierId)) throw invalide('Choisir le dossier du client.');
    if (String(corps.motDePasse || '').length < 10) throw invalide('Mot de passe : 10 caractères au moins.');
    const nu = { id: nouvelId('u'), email, nom: String(corps.nom || email).slice(0, 80), role: corps.role, dossierId: corps.role === 'client' ? corps.dossierId : null, actif: true, creeLe: maintenant(), ...(await securite.preparerMotDePasse?.(corps.motDePasse)) };
    base.ecrire('utilisateurs', nu);
    journaliser(u, 'Compte créé', `${nu.nom} (${ROLES[nu.role]})`);
    return publicUtilisateur(nu);
  });
  route('PUT', '/utilisateurs/:id', ['associe'], async ({ u, p, corps }) => {
    const x = base.lire('utilisateurs', p.id);
    if (!x) throw introuvable();
    if (corps.nom) x.nom = String(corps.nom).slice(0, 80);
    if (corps.actif !== undefined) {
      if (x.id === u.id && !corps.actif) throw invalide('Impossible de désactiver votre propre compte.');
      x.actif = Boolean(corps.actif);
    }
    if (corps.motDePasse) {
      if (String(corps.motDePasse).length < 10) throw invalide('Mot de passe : 10 caractères au moins.');
      Object.assign(x, await securite.preparerMotDePasse?.(corps.motDePasse));
    }
    base.ecrire('utilisateurs', x);
    journaliser(u, 'Compte modifié', x.nom);
    return publicUtilisateur(x);
  });

  route('GET', '/journal', ['associe'], ({ q }) => ({ journal: base.tous('journal').sort((a, b) => b.le.localeCompare(a.le)).slice(0, Number(q.n) || 200) }));
  route('GET', '/contacts', ['associe'], () => ({ contacts: base.tous('contacts').sort((a, b) => b.le.localeCompare(a.le)) }));
  route('PUT', '/contacts/:id', ['associe'], ({ u, p, corps }) => {
    const c = base.lire('contacts', p.id);
    if (!c) throw introuvable();
    c.traite = Boolean(corps.traite);
    base.ecrire('contacts', c);
    journaliser(u, c.traite ? 'Demande de contact traitée' : 'Demande de contact rouverte', c.nom);
    return c;
  });

  route('GET', '/agents', PERSONNEL, () => {
    const pcs = base.tous('pieces').filter((p) => p.lecture?.agent === 'lecteur_pieces');
    const corrigees = pcs.filter((p) => p.corrigeePar).length;
    const ecr = base.tous('ecritures');
    return {
      agents: infosAgents(),
      reglages: param('agents'),
      stats: {
        lecteur_pieces: { lues: pcs.length, corrigees, confianceMoyenne: pcs.length ? Math.round((pcs.reduce((s, p) => s + (p.lecture.confiance || 0), 0) / pcs.length) * 100) : 0 },
        imputation_scf: { proposees: ecr.filter((e) => e.source === 'agent' || e.source === 'agent_corrige').length, corrigees: ecr.filter((e) => e.source === 'agent_corrige').length },
      },
    };
  });

  // Tâche planifiée (serveur : chaque matin) — prépare les relances des jours prévus, sans rien envoyer
  async function tachesDuJour() {
    const jour = Number(aujourdhui().slice(8, 10));
    const reglages = param('relances');
    if (!(reglages.jours || []).map(Number).includes(jour)) return { relances: 0 };
    const cree = preparerRelances('systeme', periodeTravail());
    if (cree.length) journaliser(null, 'Relances préparées automatiquement', `${cree.length} brouillon(s) à valider`);
    return { relances: cree.length };
  }

  function validerParametre(cle, v) {
    const liste = (x) => {
      if (!Array.isArray(x)) throw invalide('Liste attendue.');
    };
    if (cle === 'modeles') {
      liste(v);
      for (const m of v) if (!m.id || !m.nom || !m.corps || !['email', 'whatsapp'].includes(m.canal)) throw invalide('Chaque modèle a un nom, un canal (e-mail ou WhatsApp) et un texte.');
    }
    if (cle === 'echeancier') {
      liste(v);
      for (const r of v) {
        if (!r.id || !r.libelle) throw invalide('Chaque échéance a un libellé.');
        const j = Number(r.jour);
        if (!(j >= 1 && j <= 31)) throw invalide(`Jour invalide pour « ${r.libelle} ».`);
        if (!['mensuelle', 'annuelle'].includes(r.frequence)) throw invalide('Fréquence : mensuelle ou annuelle.');
      }
    }
    if (cle === 'pieces') {
      liste(v);
      for (const x of v) if (!x.libelle || !TYPES_PIECE[x.type]) throw invalide('Chaque pièce a un libellé et un type connu.');
    }
    if (cle === 'export' && (!Array.isArray(v.colonnes) || !v.colonnes.length)) throw invalide("Au moins une colonne d'export.");
  }

  function publicUtilisateur(x) {
    if (!x) return null;
    const { empreinte, sel, ...reste } = x;
    return reste;
  }

  async function traiter(u, methode, chemin, { corps = {}, q = {} } = {}) {
    try {
      const chem = chemin.split('?')[0];
      for (const r of R) {
        if (r.methode !== methode) continue;
        const m = r.motif.exec(chem);
        if (!m) continue;
        if (r.roles !== null) exiger(u, ...r.roles);
        if (u && u.actif === false) throw new ErreurApi(401, 'Compte désactivé.');
        const donnees = await r.fn({ u, p: m.groups || {}, q, corps: corps || {} });
        if (donnees && donnees.telechargement) return { statut: 200, fichier: donnees.telechargement };
        return { statut: 200, json: donnees };
      }
      return { statut: 404, json: { erreur: 'Adresse inconnue.' } };
    } catch (e) {
      if (e instanceof ErreurApi) return { statut: e.statut, json: { erreur: e.message } };
      console.error(e);
      return { statut: 500, json: { erreur: 'Erreur interne : réessayer, puis prévenir le prestataire si cela persiste.' } };
    }
  }

  return { traiter, tachesDuJour, lancerLecture, periodeTravail };
}
