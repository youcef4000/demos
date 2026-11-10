// Noyau du cabinet — écriture de classeurs Excel (.xlsx) sans librairie, dans le navigateur comme sur le serveur.
// Un .xlsx est une archive ZIP de fichiers XML ; on l'écrit « stockée » (sans compression), ce qu'Excel,
// LibreOffice et les modules d'import (PC Compta) lisent sans difficulté.
// feuilles = [{ nom, colonnes: [{ titre, largeur, type: 'texte'|'nombre'|'montant'|'date' }], lignes: [[...]] }]
// Les montants sont fournis en centimes et écrits en dinars (2 décimales) ; les dates en ISO, affichées JJ/MM/AAAA.

const enc = new TextEncoder();
const x = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');

let TABLE_CRC;
function crc32(o) {
  if (!TABLE_CRC) {
    TABLE_CRC = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      TABLE_CRC[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < o.length; i++) c = TABLE_CRC[(c ^ o[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Archive ZIP « stockée ». fichiers = [{ nom, donnees: Uint8Array }]. */
export function zip(fichiers) {
  const parties = [];
  const annuaire = [];
  let offset = 0;
  for (const f of fichiers) {
    const nom = enc.encode(f.nom);
    const d = f.donnees;
    const crc = crc32(d);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x0800, true); // noms en UTF-8
    h.setUint16(8, 0, true);
    h.setUint16(10, 0, true);
    h.setUint16(12, 0x21, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, d.length, true);
    h.setUint32(22, d.length, true);
    h.setUint16(26, nom.length, true);
    h.setUint16(28, 0, true);
    parties.push(new Uint8Array(h.buffer), nom, d);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true);
    c.setUint16(12, 0, true);
    c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, d.length, true);
    c.setUint32(24, d.length, true);
    c.setUint16(28, nom.length, true);
    c.setUint32(42, offset, true);
    annuaire.push(new Uint8Array(c.buffer), nom);
    offset += 30 + nom.length + d.length;
  }
  const tailleAnnuaire = annuaire.reduce((s, p) => s + p.length, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true);
  fin.setUint16(8, fichiers.length, true);
  fin.setUint16(10, fichiers.length, true);
  fin.setUint32(12, tailleAnnuaire, true);
  fin.setUint32(16, offset, true);
  const tout = [...parties, ...annuaire, new Uint8Array(fin.buffer)];
  const out = new Uint8Array(tout.reduce((s, p) => s + p.length, 0));
  let p = 0;
  for (const t of tout) {
    out.set(t, p);
    p += t.length;
  }
  return out;
}

function refCol(i) {
  let s = '';
  i += 1;
  while (i > 0) {
    const r = (i - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

function serieExcel(iso) {
  const t = Date.parse(`${String(iso).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(t)) return null;
  return Math.round(t / 86400000) + 25569; // jours depuis le 30/12/1899
}

// Styles : 0 normal, 1 en-tête gras, 2 montant 0,00, 3 date JJ/MM/AAAA, 4 total gras montant
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0.00"/><numFmt numFmtId="165" formatCode="dd/mm/yyyy"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8EEF5"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

function feuilleXml(f) {
  const cols = f.colonnes || [];
  const larg = cols.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.largeur || 14}" customWidth="1"/>`).join('');
  const lignes = [];
  const entete = cols.map((c, i) => `<c r="${refCol(i)}1" t="inlineStr" s="1"><is><t>${x(c.titre)}</t></is></c>`).join('');
  lignes.push(`<row r="1">${entete}</row>`);
  (f.lignes || []).forEach((ligne, n) => {
    const r = n + 2;
    const gras = ligne.gras;
    const vals = Array.isArray(ligne) ? ligne : ligne.valeurs;
    const cells = vals.map((v, i) => {
      const ref = `${refCol(i)}${r}`;
      const type = cols[i]?.type || 'texte';
      if (v === null || v === undefined || v === '') return '';
      if (type === 'montant' && typeof v === 'number') return `<c r="${ref}" s="${gras ? 4 : 2}"><v>${(v / 100).toFixed(2)}</v></c>`;
      if (type === 'nombre' && typeof v === 'number') return `<c r="${ref}"><v>${v}</v></c>`;
      if (type === 'date') {
        const s = serieExcel(v);
        if (s) return `<c r="${ref}" s="3"><v>${s}</v></c>`;
      }
      return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${x(v)}</t></is></c>`;
    });
    lignes.push(`<row r="${r}">${cells.join('')}</row>`);
  });
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${larg ? `<cols>${larg}</cols>` : ''}<sheetData>${lignes.join('')}</sheetData></worksheet>`;
}

/** Classeur .xlsx → Uint8Array. */
export function classeur(feuilles) {
  const noms = feuilles.map((f, i) => (f.nom || `Feuille${i + 1}`).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31));
  const fichiers = [
    { nom: '[Content_Types].xml', texte: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${noms.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>` },
    { nom: '_rels/.rels', texte: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { nom: 'xl/workbook.xml', texte: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${noms.map((n, i) => `<sheet name="${x(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` },
    { nom: 'xl/_rels/workbook.xml.rels', texte: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${noms.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${noms.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { nom: 'xl/styles.xml', texte: STYLES },
    ...feuilles.map((f, i) => ({ nom: `xl/worksheets/sheet${i + 1}.xml`, texte: feuilleXml(f) })),
  ];
  return zip(fichiers.map((f) => ({ nom: f.nom, donnees: enc.encode(f.texte) })));
}

export const TYPE_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
