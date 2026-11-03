// Noyau « Le Passe » — lecture des classeurs Excel (.xlsx) sans librairie.
// Partagé entre la démo (navigateur) et le moteur (Node). Un .xlsx est une archive ZIP de fichiers XML :
// on lit l'archive, les textes partagés, puis chaque feuille. La décompression est fournie par l'appelant :
//   navigateur : DecompressionStream('deflate-raw')     Node : zlib.inflateRawSync
// Les formules ne sont pas recalculées : on lit la dernière valeur enregistrée par Excel.

import { detecterColonnes } from './csv.js';

const dec = new TextDecoder('utf-8');

/** Lit l'annuaire d'une archive ZIP (sans ZIP64). Renvoie Map(nom → { methode, taille, offset }). */
function annuaireZip(o) {
  const v = new DataView(o.buffer, o.byteOffset, o.byteLength);
  let fin = -1;
  for (let i = o.length - 22; i >= Math.max(0, o.length - 65557); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      fin = i;
      break;
    }
  }
  if (fin < 0) throw new Error("Ce fichier n'est pas un classeur .xlsx valide");
  const nb = v.getUint16(fin + 10, true);
  let p = v.getUint32(fin + 16, true);
  const fichiers = new Map();
  for (let k = 0; k < nb; k++) {
    if (v.getUint32(p, true) !== 0x02014b50) throw new Error('Archive .xlsx abîmée');
    const methode = v.getUint16(p + 10, true);
    const taille = v.getUint32(p + 20, true);
    const lgNom = v.getUint16(p + 28, true);
    const lgExtra = v.getUint16(p + 30, true);
    const lgComm = v.getUint16(p + 32, true);
    const offset = v.getUint32(p + 42, true);
    const nom = dec.decode(o.subarray(p + 46, p + 46 + lgNom));
    fichiers.set(nom, { methode, taille, offset });
    p += 46 + lgNom + lgExtra + lgComm;
  }
  return { fichiers, vue: v };
}

async function extraire(o, zip, nom, inflateRaw) {
  const f = zip.fichiers.get(nom);
  if (!f) return null;
  const v = zip.vue;
  const debut = f.offset + 30 + v.getUint16(f.offset + 26, true) + v.getUint16(f.offset + 28, true);
  const brut = o.subarray(debut, debut + f.taille);
  if (f.methode === 0) return dec.decode(brut);
  if (f.methode === 8) return dec.decode(await inflateRaw(brut));
  throw new Error(`Compression ${f.methode} non gérée`);
}

const entites = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, '&');
const textes = (xml) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => entites(m[1])).join('');

function colonne(ref) {
  let n = 0;
  for (const ch of ref.replace(/\d+$/, '')) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function lireFeuille(xml, partages) {
  const lignes = [];
  for (const r of xml.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const numeroAttr = /\sr="(\d+)"/.exec(r[1])?.[1];
    const numero = numeroAttr ? Number(numeroAttr) - 1 : lignes.length;
    const cellules = [];
    for (const c of (r[2] || '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1];
      const corps = c[2] || '';
      const refCell = /\sr="([A-Z]+\d+)"/.exec(attrs)?.[1];
      const type = /\st="([^"]+)"/.exec(attrs)?.[1];
      let val = null;
      if (type === 'inlineStr') val = textes(corps);
      else {
        const vv = /<v>([\s\S]*?)<\/v>/.exec(corps)?.[1];
        if (vv === undefined) continue;
        if (type === 's') val = partages[Number(vv)] ?? '';
        else if (type === 'b') val = vv === '1' ? 'VRAI' : 'FAUX';
        else val = entites(vv);
      }
      if (val === null || val === '') continue;
      const i = refCell ? colonne(refCell) : cellules.length;
      if (i > 2000) continue; // colonnes fantômes d'une mise en forme étendue
      cellules[i] = String(val);
    }
    if (cellules.length) lignes[numero] = Array.from(cellules, (x) => x ?? '');
  }
  return Array.from(lignes, (l) => l ?? []);
}

/** Lit toutes les feuilles d'un classeur. octets : Uint8Array. inflateRaw : (Uint8Array) => Uint8Array | Promise<Uint8Array>. */
export async function lireXlsx(octets, inflateRaw) {
  const o = octets instanceof Uint8Array ? octets : new Uint8Array(octets);
  const zip = annuaireZip(o);
  const lire = (n) => extraire(o, zip, n, inflateRaw);
  const partagesXml = await lire('xl/sharedStrings.xml');
  const partages = partagesXml ? [...partagesXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => textes(m[1])) : [];
  const classeur = (await lire('xl/workbook.xml')) || '';
  const liens = (await lire('xl/_rels/workbook.xml.rels')) || '';
  // L'ordre des attributs varie selon le logiciel qui a écrit le fichier : on les lit un par un.
  const attr = (balise, nom) => new RegExp(`\\s${nom}="([^"]*)"`).exec(balise)?.[1];
  const cibles = new Map([...liens.matchAll(/<Relationship\b[^>]*>/g)].map((m) => [attr(m[0], 'Id'), attr(m[0], 'Target')]));
  const feuilles = [];
  for (const m of classeur.matchAll(/<sheet\b[^>]*>/g)) {
    let cible = cibles.get(attr(m[0], 'r:id')) || '';
    cible = cible.startsWith('/') ? cible.slice(1) : `xl/${cible.replace(/^\.\//, '')}`;
    const xml = await lire(cible);
    if (xml) feuilles.push({ nom: entites(attr(m[0], 'name') || `Feuille ${feuilles.length + 1}`), lignes: lireFeuille(xml, partages) });
  }
  return feuilles;
}

/** Un fichier commence-t-il comme une archive ZIP (donc .xlsx) ? */
export const estXlsx = (o) => o.length > 4 && o[0] === 0x50 && o[1] === 0x4b && o[2] === 0x03 && o[3] === 0x04;

/**
 * Trouve, dans toutes les feuilles, la ligne d'en-tête la plus riche.
 * Les titres au-dessus (ex. « ANCIEN prix du … », souvent en cellules fusionnées) sont gardés pour
 * reconnaître l'ancien prix. Renvoie { feuille, ligneEntete, entetes, titres, lignes, mapping, confiance }.
 */
export function choisirTableau(feuilles, profil = {}) {
  let meilleur = null;
  for (const f of feuilles) {
    for (let i = 0; i < Math.min(f.lignes.length, 25); i++) {
      const dessus = f.lignes[i - 1] || [];
      const brute = f.lignes[i] || [];
      const entetes = Array.from({ length: Math.max(brute.length, dessus.length) }, (_, k) => String(brute[k] ?? '').trim());
      if (entetes.filter(Boolean).length < 2) continue;
      const titres = [];
      let courant = '';
      for (let k = 0; k < entetes.length; k++) {
        if (dessus[k]) courant = String(dessus[k]).trim();
        titres.push(courant);
      }
      const det = detecterColonnes(entetes, profil, { titres });
      if (!('ref' in det.mapping)) continue;
      const lignes = f.lignes.slice(i + 1).filter((l) => l && l[det.mapping.ref]);
      const score = Object.keys(det.mapping).length * 1000 + lignes.length;
      if (!meilleur || score > meilleur.score) meilleur = { score, feuille: f.nom, ligneEntete: i + 1, entetes, titres, lignes, ...det };
    }
  }
  if (!meilleur) throw new Error('Aucun tableau reconnu dans ce classeur (pas de colonne « référence »)');
  delete meilleur.score;
  return meilleur;
}
