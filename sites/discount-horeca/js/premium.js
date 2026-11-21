// Modules de la version Premium de l'admin Discount Horeca :
//  - Fournisseurs : tarifs et stocks repris des fournisseurs (marques du catalogue), avec règles et journal ;
//  - Peppol : facture électronique UBL 2.1 / Peppol BIS Billing 3.0 pour les clients avec numéro d'entreprise ;
//  - SEO et langues : contrôles calculés sur le catalogue, mots-clés cibles, plan de trois mois ;
//  - Traductions : nom NL/EN de chaque fiche, relu ou non (sinon la boutique signale la traduction automatique).
// Démo : la synchronisation fournisseurs est simulée (écarts tirés au hasard) et rien n'est envoyé par Peppol.
import * as S from './store.js';
import { eur, esc, ic, src, toast, modale, dateCourte, heure, nombre } from './ui.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pluriel = (n, un, plusieurs = un + 's') => `${nombre(n)} ${n > 1 ? plusieurs : un}`;

/* =====================================================================
   Fournisseurs
   ===================================================================== */
const FLUX = { csv: 'Fichier CSV / Excel', xml: 'Flux XML', api: 'API du fournisseur', email: 'Tarif reçu par e-mail', manuel: 'Mise à jour manuelle' };
const FREQ = { heure: 'Toutes les heures', nuit: 'Chaque nuit', semaine: 'Chaque lundi', demande: 'À la demande' };
const MAISON = 'HF Concept';
const REGLE = { flux: 'csv', frequence: 'nuit', baisses: true, hausses: false, ruptures: true };

function fournisseurs() {
  const par = new Map();
  for (const p of S.tousProduits()) {
    if (p.etat === 'exposition') continue;
    const m = p.marque || 'Sans marque';
    if (!par.has(m)) par.set(m, []);
    par.get(m).push(p);
  }
  return [...par].map(([nom, ps]) => ({ nom, ps })).sort((a, b) => b.ps.length - a.ps.length || a.nom.localeCompare(b.nom, 'fr'));
}
function regle(nom) {
  const defaut = nom === MAISON || nom === 'Sans marque' ? { ...REGLE, flux: 'manuel', frequence: 'demande' } : REGLE;
  return { ...defaut, ...(S.lirePremium('fournisseurs', {})[nom] || {}) };
}
function enregistrerRegle(nom, r) {
  const toutes = S.lirePremium('fournisseurs', {});
  toutes[nom] = r;
  S.ecrirePremium('fournisseurs', toutes);
}
function melanger(a) {
  const t = [...a];
  for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
  return t;
}
/* Écarts d'exemple entre le tarif « reçu » et le catalogue : quelques prix et stocks par fournisseur. */
function simuler(liste) {
  const ecarts = [];
  for (const f of liste) {
    const r = regle(f.nom);
    if (r.flux === 'manuel') continue;
    const n = Math.min(6, Math.max(1, Math.round(f.ps.length * 0.12)));
    for (const p of melanger(f.ps).slice(0, n)) {
      const e = { id: p.id, nom: p.nom, ref: p.ref, image: p.images[0], marque: f.nom, prix: p.prixHT, stock: p.stock };
      const tirage = Math.random();
      if (tirage < 0.45) {
        const sens = Math.random() < 0.6 ? 1 : -1;
        e.nouveauPrix = Math.round(p.prixHT * (1 + sens * (0.01 + Math.random() * 0.04)) * 10) / 10;
        e.auto = sens > 0 ? r.hausses : r.baisses;
      } else if (tirage < 0.8 || !p.stock) {
        e.nouveauStock = p.stock + 1 + Math.floor(Math.random() * 6);
        e.auto = true;
      } else {
        e.nouveauStock = 0;
        e.auto = r.ruptures;
      }
      ecarts.push(e);
    }
  }
  return ecarts;
}
async function synchroniser(liste) {
  const ecarts = simuler(liste);
  if (!ecarts.length) { toast('Aucun fournisseur à synchroniser : leur mise à jour est manuelle.', 'erreur'); return; }
  const ligne = (e, i) => {
    const prix = e.nouveauPrix !== undefined;
    const detail = prix
      ? `${eur(e.prix)} → <strong>${eur(e.nouveauPrix)}</strong> <span class="pastille ${e.nouveauPrix > e.prix ? 'p-orange' : 'p-vert'}">${e.nouveauPrix > e.prix ? '+' : '−'}${Math.abs(Math.round((e.nouveauPrix / e.prix - 1) * 1000) / 10)} %</span>`
      : e.nouveauStock === 0 ? `Stock ${e.stock} → <strong>0</strong> <span class="pastille p-rouge">Rupture fournisseur</span>` : `Stock ${e.stock} → <strong>${e.nouveauStock}</strong>`;
    return `<tr><td><input type="checkbox" name="e${i}" ${e.auto ? 'checked' : ''} aria-label="Appliquer"></td>
      <td class="nom">${esc(e.nom)}<small>${esc(e.marque)} · Réf. ${esc(e.ref)}</small></td><td>${detail}${e.auto ? '' : '<br><small class="muet">À valider (règle du fournisseur)</small>'}</td></tr>`;
  };
  const r = await modale({
    titre: `Synchronisation : ${pluriel(ecarts.length, 'écart')} trouvé${ecarts.length > 1 ? 's' : ''}`,
    large: true,
    corps: `<p class="bandeau-simu">${ic('info')}<span><strong>Simulation :</strong> les écarts ci-dessous sont tirés au hasard pour montrer le fonctionnement. La version en ligne lit le vrai tarif de chaque fournisseur (fichier, flux XML ou API) et applique ces règles chaque nuit.</span></p>
      <div class="table-scroll"><table class="table-admin"><thead><tr><th></th><th>Produit</th><th>Changement</th></tr></thead><tbody>${ecarts.map(ligne).join('')}</tbody></table></div>
      <p class="petit muet">Cochés : appliqués selon les règles (baisses de prix, retours en stock). Non cochés : hausses de prix et ruptures à valider.</p>`,
    actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Appliquer la sélection', classe: 'btn-plein' }],
  });
  if (r.action !== 'ok') return;
  const choisis = ecarts.filter((_, i) => r.donnees['e' + i]);
  let prix = 0, stocks = 0;
  for (const e of choisis) {
    const p = S.produit(e.id);
    if (!p) continue;
    if (e.nouveauPrix !== undefined) {
      p.prixHT = e.nouveauPrix;
      if (p.prixBarreHT && p.prixBarreHT <= p.prixHT * 1.01) p.prixBarreHT = null;
      prix++;
    } else { p.stock = e.nouveauStock; stocks++; }
    S.enregistrerProduit(p);
  }
  const journal = S.lirePremium('journal', []);
  const maintenant = new Date().toISOString();
  const noms = [...new Set(ecarts.map((e) => e.marque))];
  noms.forEach((m) => {
    const de = choisis.filter((e) => e.marque === m);
    journal.unshift({ date: maintenant, fournisseur: m, ecarts: ecarts.filter((e) => e.marque === m).length, prix: de.filter((e) => e.nouveauPrix !== undefined).length, stocks: de.filter((e) => e.nouveauPrix === undefined).length });
  });
  S.ecrirePremium('journal', journal.slice(0, 60));
  const dernieres = S.lirePremium('synchros', {});
  noms.forEach((m) => { dernieres[m] = maintenant; });
  S.ecrirePremium('synchros', dernieres);
  toast(`${ic('check')} ${pluriel(prix, 'prix', 'prix')} et ${pluriel(stocks, 'stock')} mis à jour — la boutique suit`, 'ok', 4500);
}
async function reglerFournisseur(nom, ps) {
  const r = regle(nom);
  const sel = (nomChamp, valeurs, courant) => `<select name="${nomChamp}">${Object.entries(valeurs).map(([k, v]) => `<option value="${k}" ${k === courant ? 'selected' : ''}>${v}</option>`).join('')}</select>`;
  const m = await modale({
    titre: `Fournisseur : ${esc(nom)}`,
    corps: `<p class="muet petit">${pluriel(ps.length, 'produit')} au catalogue${nom === MAISON ? ' · marque maison (HF Concept SRL), prix fixés en interne' : ''}.</p>
      <label class="champ"><span>Source du tarif et du stock</span>${sel('flux', FLUX, r.flux)}</label>
      <label class="champ"><span>Fréquence</span>${sel('frequence', FREQ, r.frequence)}</label>
      <label class="case"><input type="checkbox" name="baisses" ${r.baisses ? 'checked' : ''}><span>Appliquer les baisses de prix sans validation</span></label>
      <label class="case"><input type="checkbox" name="hausses" ${r.hausses ? 'checked' : ''}><span>Appliquer les hausses de prix sans validation</span></label>
      <label class="case"><input type="checkbox" name="ruptures" ${r.ruptures ? 'checked' : ''}><span>Rupture chez le fournisseur : passer la fiche « sur commande »</span></label>`,
    actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Enregistrer', classe: 'btn-plein' }],
  });
  if (m.action !== 'ok') return false;
  enregistrerRegle(nom, { flux: m.donnees.flux, frequence: m.donnees.frequence, baisses: !!m.donnees.baisses, hausses: !!m.donnees.hausses, ruptures: !!m.donnees.ruptures });
  toast(`${ic('check')} Règles de ${esc(nom)} enregistrées`);
  return true;
}

export function vueFournisseurs(ctx) {
  const liste = fournisseurs();
  const journal = S.lirePremium('journal', []);
  const dernieres = S.lirePremium('synchros', {});
  const auto = liste.filter((f) => regle(f.nom).flux !== 'manuel');
  const nProduits = liste.reduce((s, f) => s + f.ps.length, 0);
  ctx.cadre('fournisseurs', 'Fournisseurs', `
    <p class="bandeau-simu">${ic('info')}<span><strong>Version Premium · démo :</strong> les marques et le nombre de produits viennent du catalogue relevé ; les sources de tarif sont des réglages d'exemple et la synchronisation est simulée. En production, chaque fournisseur est branché selon ce qu'il fournit (fichier CSV/Excel, flux XML ou API).</span></p>
    <div class="kpis">
      <div class="kpi"><span>Fournisseurs (marques)</span><strong>${liste.length}</strong><small>${pluriel(nProduits, 'produit')} neufs au catalogue</small></div>
      <div class="kpi"><span>Synchronisés automatiquement</span><strong>${auto.length}</strong><small>${pluriel(auto.reduce((s, f) => s + f.ps.length, 0), 'produit')} suivis</small></div>
      <div class="kpi"><span>Mise à jour manuelle</span><strong>${liste.length - auto.length}</strong><small>dont la marque maison ${MAISON}</small></div>
      <div class="kpi"><span>Dernière synchronisation</span><strong>${journal[0] ? dateCourte(journal[0].date) : '—'}</strong><small>${journal[0] ? heure(journal[0].date) : 'aucune dans ce navigateur'}</small></div>
    </div>
    <section class="panneau">
      <div class="panneau-tete"><h2>Fournisseurs et règles</h2><div class="outils"><button class="btn" type="button" data-import>${ic('upload')}Coller un tarif</button><button class="btn btn-plein" type="button" data-synchro-tout>${ic('repeat')}Tout synchroniser</button></div></div>
      <div class="table-scroll"><table class="table-admin"><thead><tr><th>Fournisseur</th><th class="num">Produits</th><th class="num">En stock</th><th class="num">En promo</th><th>Source</th><th>Fréquence</th><th>Dernière synchro</th><th></th></tr></thead><tbody>
      ${liste.map((f, i) => {
        const r = regle(f.nom);
        return `<tr>
          <td class="nom"><strong>${esc(f.nom)}</strong><small>${f.nom === MAISON ? 'Marque maison' : f.nom === 'Sans marque' ? 'Marque à compléter sur les fiches' : `${f.ps.slice(0, 2).map((p) => esc(p.nom.slice(0, 32))).join(' · ')}…`}</small></td>
          <td class="num">${f.ps.length}</td><td class="num">${f.ps.filter((p) => p.stock > 0).length}</td><td class="num">${f.ps.filter((p) => S.remisePromo(p) > 0).length}</td>
          <td><span class="pastille ${r.flux === 'manuel' ? 'p-gris' : 'p-bleu'}">${FLUX[r.flux]}</span></td><td>${FREQ[r.frequence]}</td>
          <td>${dernieres[f.nom] ? heure(dernieres[f.nom]) : '<span class="muet">—</span>'}</td>
          <td class="actions-ligne"><button class="btn btn-petit" type="button" data-regler="${i}">${ic('settings')}Règles</button>${r.flux === 'manuel' ? '' : `<button class="btn btn-petit" type="button" data-synchro="${i}">${ic('repeat')}Synchroniser</button>`}</td>
        </tr>`;
      }).join('')}
      </tbody></table></div>
    </section>
    <section class="panneau">
      <div class="panneau-tete"><h2>Journal des synchronisations</h2>${journal.length ? '<button class="btn btn-lien" type="button" data-vider>Vider le journal</button>' : ''}</div>
      ${journal.length ? `<div class="table-scroll"><table class="table-admin"><thead><tr><th>Date</th><th>Fournisseur</th><th class="num">Écarts trouvés</th><th class="num">Prix appliqués</th><th class="num">Stocks appliqués</th></tr></thead><tbody>
        ${journal.map((j) => `<tr><td>${heure(j.date)}</td><td>${esc(j.fournisseur)}</td><td class="num">${j.ecarts}</td><td class="num">${j.prix}</td><td class="num">${j.stocks}</td></tr>`).join('')}
      </tbody></table></div>` : '<p class="muet">Aucune synchronisation dans ce navigateur. Lancez « Tout synchroniser » pour voir les écarts, les valider et les retrouver ici.</p>'}
    </section>`);
  $('[data-synchro-tout]').addEventListener('click', async () => { await synchroniser(liste); vueFournisseurs(ctx); });
  $$('[data-synchro]').forEach((b) => b.addEventListener('click', async () => { await synchroniser([liste[+b.dataset.synchro]]); vueFournisseurs(ctx); }));
  $$('[data-regler]').forEach((b) => b.addEventListener('click', async () => { const f = liste[+b.dataset.regler]; if (await reglerFournisseur(f.nom, f.ps)) vueFournisseurs(ctx); }));
  $('[data-import]').addEventListener('click', () => ctx.importerPrix());
  $('[data-vider]')?.addEventListener('click', () => { S.ecrirePremium('journal', []); S.ecrirePremium('synchros', {}); vueFournisseurs(ctx); });
}

/* =====================================================================
   Peppol : facture UBL 2.1 (Peppol BIS Billing 3.0)
   ===================================================================== */
const xml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const montant = (n) => (Math.round(n * 100) / 100).toFixed(2);
const chiffres = (s) => String(s || '').replace(/\D/g, '');
export const peppolPossible = (c) => S.bceValide(c.client?.bce || '') && c.statut !== 'annulee';
export const idPeppol = (bce) => `0208:${chiffres(bce)}`;
const PAYE = ['bancontact', 'carte', 'payconiq'];

export function ubl(c) {
  const r = S.reglages();
  const taux = r.tva;
  const fiche = c.client.id ? S.client(c.client.id) : null;
  const adrClient = fiche?.adresse ? { rue: fiche.adresse, cp: fiche.cp, ville: fiche.ville } : { rue: c.livraison?.adresse, cp: c.livraison?.cp, ville: c.livraison?.ville };
  const [rueV, resteV = ''] = r.adresse.split(/,\s*/);
  const [, cpV = '', villeV = resteV] = resteV.match(/^(\d{4})\s+(.+)$/) || [];
  const lignes = S.arrondi(c.lignes.reduce((s, l) => s + l.total, 0));
  const port = c.totaux.port || 0;
  const base = S.arrondi(lignes + port);
  const tva = S.arrondi(base * taux / 100);
  const ttc = S.arrondi(base + tva);
  const paye = PAYE.includes(c.paiement) ? ttc : Math.min(ttc, c.totaux.acompte || 0);
  const jour = c.date.slice(0, 10);
  const echeance = new Date(new Date(c.date).getTime() + 30 * 864e5).toISOString().slice(0, 10);
  const categorie = (balise) => `<cac:${balise}><cbc:ID>S</cbc:ID><cbc:Percent>${taux}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:${balise}>`;
  const partie = ({ bce, nom, tva: numTva, rue, cp, ville }) => `<cac:Party>
      <cbc:EndpointID schemeID="0208">${chiffres(bce)}</cbc:EndpointID>
      <cac:PartyName><cbc:Name>${xml(nom)}</cbc:Name></cac:PartyName>
      <cac:PostalAddress><cbc:StreetName>${xml(rue)}</cbc:StreetName><cbc:CityName>${xml(ville)}</cbc:CityName><cbc:PostalZone>${xml(cp)}</cbc:PostalZone><cac:Country><cbc:IdentificationCode>BE</cbc:IdentificationCode></cac:Country></cac:PostalAddress>
      ${numTva ? `<cac:PartyTaxScheme><cbc:CompanyID>BE${chiffres(numTva)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>` : ''}
      <cac:PartyLegalEntity><cbc:RegistrationName>${xml(nom)}</cbc:RegistrationName><cbc:CompanyID schemeID="0208">${chiffres(bce)}</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Document de démonstration (Bornz Studio) : facture au format UBL 2.1 / Peppol BIS Billing 3.0, générée par l'admin. -->
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${xml(c.num)}</cbc:ID>
  <cbc:IssueDate>${jour}</cbc:IssueDate>
  <cbc:DueDate>${echeance}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cbc:BuyerReference>${xml(c.refClient || c.num)}</cbc:BuyerReference>
  <cac:AccountingSupplierParty>
    ${partie({ bce: r.numeroTva, nom: r.societe, tva: r.numeroTva, rue: rueV, cp: cpV, ville: villeV })}
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    ${partie({ bce: c.client.bce, nom: c.client.societe, tva: c.client.tva, rue: adrClient.rue || '', cp: adrClient.cp || '', ville: adrClient.ville || '' })}
  </cac:AccountingCustomerParty>
  <cac:PaymentTerms><cbc:Note>${xml(S.PAIEMENTS[c.paiement] || c.paiement || '')}${c.totaux.acompte ? ` · acompte payé ${montant(c.totaux.acompte)} EUR` : ''}</cbc:Note></cac:PaymentTerms>
  ${port ? `<cac:AllowanceCharge><cbc:ChargeIndicator>true</cbc:ChargeIndicator><cbc:AllowanceChargeReasonCode>FC</cbc:AllowanceChargeReasonCode><cbc:AllowanceChargeReason>Livraison</cbc:AllowanceChargeReason><cbc:Amount currencyID="EUR">${montant(port)}</cbc:Amount>${categorie('TaxCategory')}</cac:AllowanceCharge>` : ''}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="EUR">${montant(tva)}</cbc:TaxAmount>
    <cac:TaxSubtotal><cbc:TaxableAmount currencyID="EUR">${montant(base)}</cbc:TaxableAmount><cbc:TaxAmount currencyID="EUR">${montant(tva)}</cbc:TaxAmount>${categorie('TaxCategory')}</cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">${montant(lignes)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${montant(base)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR">${montant(ttc)}</cbc:TaxInclusiveAmount>
    ${port ? `<cbc:ChargeTotalAmount currencyID="EUR">${montant(port)}</cbc:ChargeTotalAmount>` : ''}
    ${paye ? `<cbc:PrepaidAmount currencyID="EUR">${montant(paye)}</cbc:PrepaidAmount>` : ''}
    <cbc:PayableAmount currencyID="EUR">${montant(ttc - paye)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
${c.lignes.map((l, i) => `  <cac:InvoiceLine>
    <cbc:ID>${i + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">${l.qte}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="EUR">${montant(l.total)}</cbc:LineExtensionAmount>
    <cac:Item><cbc:Name>${xml(l.nom)}</cbc:Name><cac:SellersItemIdentification><cbc:ID>${xml(l.ref)}</cbc:ID></cac:SellersItemIdentification>${categorie('ClassifiedTaxCategory')}</cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="EUR">${montant(l.unit)}</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>`).join('\n')}
</Invoice>
`;
}
function telecharger(nom, contenu, type) {
  const url = URL.createObjectURL(new Blob([contenu], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: nom });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function blocPeppol(c) {
  if (!c.client?.bce) return `<section class="panneau"><h2>Facture électronique Peppol</h2><p class="muet petit">Client sans numéro d’entreprise (particulier) : facture PDF classique, Peppol ne s’applique pas.</p></section>`;
  const ok = peppolPossible(c);
  return `<section class="panneau bloc-peppol"><div class="panneau-tete"><h2>Facture électronique Peppol</h2>${c.peppol ? '<span class="pastille p-vert">Envoyée</span>' : ok ? '<span class="pastille p-jaune">À envoyer</span>' : '<span class="pastille p-gris">Indisponible</span>'}</div>
    <div class="fiche-client">
      <span>Destinataire Peppol : <code>${esc(idPeppol(c.client.bce))}</code> <small class="muet">(n° d’entreprise ${esc(c.client.bce)})</small></span>
      ${c.peppol ? `<span>Envoyée le ${heure(c.peppol.date)} · <small class="muet">réf. ${esc(c.peppol.id)}</small></span>` : `<span class="muet petit">Obligatoire entre entreprises belges depuis le 1er janvier 2026 : la facture arrive directement dans le logiciel comptable du client.</span>`}
    </div>
    <div class="outils" style="margin-top:12px">
      <button class="btn" type="button" data-ubl ${ok ? '' : 'disabled'}>${ic('download')}Fichier UBL (XML)</button>
      ${ok && !c.peppol ? `<button class="btn btn-plein" type="button" data-peppol>${ic('file')}Envoyer via Peppol</button>` : ''}
    </div></section>`;
}
export function brancherPeppol(c, rafraichir) {
  $('[data-ubl]')?.addEventListener('click', () => telecharger(`facture-${c.num}.xml`, ubl(c), 'application/xml'));
  $('[data-peppol]')?.addEventListener('click', async () => {
    const r = await modale({
      titre: 'Envoyer la facture via Peppol',
      corps: `<div class="fiche-client"><strong>${esc(c.client.societe)}</strong><span>Identifiant Peppol <code>${esc(idPeppol(c.client.bce))}</code></span><span>Facture ${esc(c.num)} · ${eur(c.totaux.ttc)} TVAC · UBL 2.1, Peppol BIS Billing 3.0</span></div>
        <p class="bandeau-simu" style="margin-top:14px">${ic('info')}<span><strong>Démo :</strong> rien n’est envoyé. En production, la facture part par le point d’accès Peppol choisi par Discount Horeca, après vérification du destinataire dans l’annuaire Peppol.</span></p>`,
      actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Envoyer (simulation)', classe: 'btn-plein' }],
    });
    if (r.action !== 'ok') return;
    const id = (globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`).toUpperCase();
    S.envoyerPeppol(c.num, id);
    toast(`${ic('check')} Facture ${esc(c.num)} marquée comme envoyée par Peppol — visible dans le suivi client`);
    rafraichir();
  });
}

/* =====================================================================
   SEO et langues
   ===================================================================== */
const MARQUE = 'Discount Horeca';
// Mots attendus dans le nom selon la catégorie (les catégories « fourre-tout » ne sont pas contrôlées).
const ATTENDUS = {
  'comptoirs-refrigeres': /comptoir|vitrine|frigo|caisse|[ée]l[ée]ment/i, 'vitrines-refrigerees': /vitrine|cabinet|meuble/i, 'vitrines-boissons': /boisson|vitr|porte|frigo|bar|cev/i,
  'armoires-frigorifiques': /armoire|frigo|cong/i, 'saladettes': /salad|pr[ée]paration|pizza/i, 'tables-refrigerees': /table|frigo/i,
  'machines-a-glacons': /gla[cç]on|glace/i, 'congelateurs-bahut': /cong[ée]lateur|bahut|conservateur/i, 'cuiseurs-a-pates': /p[âa]te/i, 'woks': /wok|chinois/i,
  'marmites': /marmite|sauteuse|braisi/i, 'fours-mixtes': /four|mixte|vapeur/i, 'micro-ondes': /micro/i, 'maintien-au-chaud': /chau|bain|lampe|maintien/i,
  friteuses: /friteuse/i, 'grills-kebab': /gyros|kebab|grill/i, 'grills-panini': /panini|grill|toast|salamandre|contact/i, rotissoires: /r[ôo]tissoire|poulet/i,
  'crepieres-gaufriers': /cr[êe]pi|gaufr/i, 'fours-a-pizza': /four|support/i, petrins: /p[ée]trin/i, 'laminoirs-diviseuses': /lamin|divis|boul/i, 'rapes-fromage': /r[âa]pe/i,
  trancheuses: /trancheuse/i, 'sous-vide': /vide/i, balances: /balance|bascule/i, 'machines-a-cafe': /caf[ée]|espresso/i, 'moulins-a-cafe': /moulin/i,
  'lave-verres': /lave.?verre/i, 'lave-vaisselle': /lave.?vaisselle|capot/i, 'tables-inox': /table/i, 'armoires-inox': /armoire/i, 'etageres-inox': /[ée]tag[èe]re|console/i,
  chariots: /chariot|[ée]chelle/i, 'hottes-completes': /hotte/i, 'hottes-murales': /hotte/i, 'moteurs-hottes': /moteur|caisson|extract/i, variateurs: /variateur/i,
};
const majuscules = (s) => { const l = s.replace(/[^A-Za-zÀ-ÿ]/g, ''); return l.length > 8 && l.replace(/[^A-ZÀ-Þ]/g, '').length / l.length > 0.7; };

function controles(ps) {
  const noms = new Map();
  ps.forEach((p) => { const k = S.norm(p.nom); noms.set(k, (noms.get(k) || 0) + 1); });
  return [
    { cle: 'photos', titre: 'Une seule photo', aide: 'Une deuxième photo (vue de face, détail, en situation) rassure et sert Google Images.', ps: ps.filter((p) => (p.images || []).length < 2) },
    { cle: 'specs', titre: 'Sans caractéristiques techniques', aide: 'Dimensions, alimentation et puissance sont les premières questions des clients.', ps: ps.filter((p) => !(p.specs || []).length) },
    { cle: 'texte', titre: 'Sans texte ni points clés', aide: 'Une fiche sans texte n’a rien à montrer à Google au-delà du nom.', ps: ps.filter((p) => !(p.texte || []).length && !(p.points || []).length) },
    { cle: 'titre', titre: 'Nom coupé dans le titre Google', aide: `Le titre « nom | ${MARQUE} » dépasse 62 caractères : la boutique le coupe à 40 caractères.`, ps: ps.filter((p) => `${p.nom} | ${MARQUE}`.length > 62) },
    { cle: 'majuscules', titre: 'Nom en majuscules', aide: 'Les noms en capitales se lisent mal et paraissent criards dans les résultats.', ps: ps.filter((p) => majuscules(p.nom)) },
    { cle: 'doublons', titre: 'Nom identique à une autre fiche', aide: 'Deux fiches au même nom se concurrencent sur Google : ajoutez la taille, la puissance ou la série.', ps: ps.filter((p) => noms.get(S.norm(p.nom)) > 1) },
    { cle: 'marque', titre: 'Sans marque', aide: 'La marque sert les recherches « Diamond prix », « Combisteel Belgique »…', ps: ps.filter((p) => !p.marque) },
    { cle: 'categorie', titre: 'Catégorie à vérifier', aide: 'Le nom ne contient aucun mot attendu pour sa catégorie : accessoire, ou produit mal rangé ?', ps: ps.filter((p) => ATTENDUS[p.sous] && !ATTENDUS[p.sous].test(p.nom)) },
    { cle: 'promo', titre: 'Promotion de plus de 50 %', aide: 'Un prix barré doit être un prix réellement pratiqué auparavant : à justifier.', ps: ps.filter((p) => S.remisePromo(p) > 50) },
  ];
}
const MOTS_CLES = [
  ['Positionnement', 'matériel horeca Belgique · magasin horeca Bruxelles · grossiste horeca', 'horeca materiaal · horeca groothandel', '#/'],
  ['Friterie', 'friteuse professionnelle · friteuse gaz friterie · équiper une friterie', 'frituurtoestel · frituur openen materiaal', '#/c/friterie-snack/friteuses'],
  ['Inox', 'table inox sur mesure · plonge inox · inox made in Belgium', 'inox werktafel · spoeltafel inox', '#/c/inox/tables-inox'],
  ['Hottes', 'hotte professionnelle made in Belgium · hotte cuisine pro', 'dampkap horeca · afzuigkap horeca', '#/c/hottes'],
  ['Pizzeria', 'four à pizza professionnel · matériel pour ouvrir une pizzeria', 'pizzaoven · pizzeria materiaal', '#/c/pizzeria'],
  ['Froid', 'frigo horeca · frigo boissons · saladette', 'horeca koelkast · drankkoelkast', '#/c/froid'],
  ['Lavage', 'lave-vaisselle professionnel · lave-verre', 'vaatwasmachine horeca · glazenwasser', '#/c/lavage'],
  ['Bonnes affaires', 'matériel horeca promo · matériel horeca d’exposition', 'horeca materiaal promo · tweedehands', '#/bonnes-affaires'],
  ['Local', 'showroom matériel horeca · Sint-Pieters-Leeuw · Bruxelles · Halle', 'horeca winkel Sint-Pieters-Leeuw', '#/infos/contact'],
];
const PLAN = [
  ['Mois 1 · Lancement', [
    'Adresses propres par page et rendu côté serveur, en français, néerlandais et anglais',
    'Redirections 301 des 1 569 adresses PrestaShop actuelles',
    'Search Console, plan du site par langue et balises hreflang',
    'Fiche Google Business Profile du showroom de Sint-Pieters-Leeuw',
  ]],
  ['Mois 2 · Contenu', [
    'Fiches NL et EN relues, en commençant par les meilleures ventes',
    'Deuxième photo pour les fiches qui n’en ont qu’une',
    'Pages marques : Diamond, Combisteel, Bertrand, Prismafood…',
    'Demande d’avis Google après chaque livraison',
  ]],
  ['Mois 3 · Ajustement', [
    'Lecture des vraies requêtes dans Search Console et textes ajustés',
    'Guides « ouvrir une friterie », « ouvrir une pizzeria » (FR et NL)',
    'Contrôle mensuel des prix barrés, des catégories vides et des fiches incomplètes',
  ]],
];

export function vueSeo(ctx) {
  const ps = S.tousProduits().filter((p) => p.enLigne !== false);
  const cs = controles(ps);
  const aCorriger = new Set(cs.flatMap((c) => c.ps.map((p) => p.id)));
  const complets = ps.length - aCorriger.size;
  const relu = (l) => ps.filter((p) => p.trad?.[l]?.relu).length;
  const fams = S.familles();
  const parSous = (f, s) => ps.filter((p) => p.famille === f.slug && p.sous === s.slug).length;
  const minces = fams.flatMap((f) => f.sous.map((s) => ({ f, s, n: parSous(f, s) }))).filter((x) => x.n < 3);
  const plan = S.lirePremium('plan-seo', {});
  const nPlan = PLAN.reduce((s, [, l]) => s + l.length, 0);
  const coches = Object.values(plan).filter(Boolean).length;
  ctx.cadre('seo', 'SEO et langues', `
    <div class="kpis">
      <div class="kpi"><span>Fiches en ligne</span><strong>${nombre(ps.length)}</strong><small>${fams.length} univers, ${fams.reduce((s, f) => s + f.sous.length, 0)} catégories</small></div>
      <div class="kpi"><span>Fiches sans point à corriger</span><strong>${Math.round(complets / Math.max(1, ps.length) * 100)} %</strong><small>${nombre(complets)} sur ${nombre(ps.length)}, d’après les ${cs.length} contrôles</small></div>
      <div class="kpi"><span>Traductions relues</span><strong>NL ${relu('nl')} · EN ${relu('en')}</strong><small>les autres fiches sont en traduction automatique, signalée au client</small></div>
      <div class="kpi"><span>Plan de trois mois</span><strong>${coches} / ${nPlan}</strong><small>actions faites</small></div>
    </div>
    <div class="deux">
      <section class="panneau">
        <div class="panneau-tete"><h2>Contrôles du catalogue</h2><span class="muet petit">Calculés à l’instant sur les fiches de la boutique</span></div>
        <div class="controles">${cs.map((c) => `<details class="controle"><summary><span class="pastille ${c.ps.length ? 'p-orange' : 'p-vert'}">${c.ps.length ? nombre(c.ps.length) : ic('check')}</span><span><strong>${c.titre}</strong><small>${c.aide}</small></span>${c.ps.length ? ic('down') : ''}</summary>
          ${c.ps.length ? `<div class="liste-simple">${c.ps.slice(0, 25).map((p) => `<a href="#/produits/${encodeURIComponent(p.id)}"><img src="${src(p.images[0])}" alt="" width="40" height="40"><span>${esc(p.nom)}<small>Réf. ${esc(p.ref)} · ${esc(S.sousFamille(p.famille, p.sous)?.nom || '')}</small></span>${ic('right')}</a>`).join('')}${c.ps.length > 25 ? `<p class="muet petit">… et ${c.ps.length - 25} autres.</p>` : ''}</div>` : ''}
        </details>`).join('')}</div>
      </section>
      <div style="display:grid;gap:18px;align-content:start">
        <section class="panneau">
          <h2>Langues de la boutique</h2>
          <div class="liste-simple">
            ${[['fr', 'Français', 'langue d’origine du catalogue'], ['nl', 'Nederlands', `${relu('nl')} fiches relues · interface et catégories rédigées`], ['en', 'English', `${relu('en')} fiches relues · interface et catégories rédigées`]].map(([l, n, d]) => `<a href="../#/${l === 'fr' ? '' : l + '/'}" target="_blank" rel="noopener"><span class="pastille p-bleu">${l.toUpperCase()}</span><span><strong>${n}</strong><small>${d}</small></span>${ic('arrow')}</a>`).join('')}
          </div>
          <p class="petit muet">Relire une fiche : ouvrez-la dans Produits, section « Traductions », corrigez le nom et cochez « relue ». La mention « traduction automatique » disparaît alors de la boutique.</p>
        </section>
        <section class="panneau">
          <h2>Catégories à étoffer</h2>
          ${minces.length ? `<div class="liste-simple">${minces.map((x) => `<a href="../#/c/${x.f.slug}/${x.s.slug}" target="_blank" rel="noopener"><span class="pastille ${x.n ? 'p-orange' : 'p-rouge'}">${x.n}</span><span>${esc(x.s.nom)}<small>${esc(x.f.nom)}</small></span>${ic('arrow')}</a>`).join('')}</div><p class="petit muet">Moins de 3 produits : une page trop mince se positionne mal. Ajoutez des produits ou regroupez la catégorie.</p>` : '<p class="muet">Toutes les catégories ont au moins 3 produits.</p>'}
        </section>
      </div>
    </div>
    <section class="panneau">
      <div class="panneau-tete"><h2>Mots-clés cibles et pages de la boutique</h2><a href="../analyse-seo.html" target="_blank" rel="noopener">Analyse complète</a></div>
      <p class="petit muet">Les positions Google et le trafic se mesurent après la mise en ligne, avec la Search Console : la démo n’affiche aucun chiffre inventé.</p>
      <div class="table-scroll"><table class="table-admin"><thead><tr><th>Groupe</th><th>Français</th><th>Néerlandais</th><th>Pages</th></tr></thead><tbody>
        ${MOTS_CLES.map(([g, fr, nl, h]) => `<tr><td><strong>${g}</strong></td><td>${fr}</td><td><em>${nl}</em></td><td class="actions-ligne"><a class="btn btn-petit" href="../${h}" target="_blank" rel="noopener">FR</a><a class="btn btn-petit" href="../${h.replace('#/', '#/nl/')}" target="_blank" rel="noopener">NL</a></td></tr>`).join('')}
      </tbody></table></div>
    </section>
    <section class="panneau">
      <h2>Plan de référencement sur trois mois</h2>
      <div class="plan-seo">${PLAN.map(([mois, actions], m) => `<div><h3>${mois}</h3>${actions.map((a, i) => `<label class="case"><input type="checkbox" data-plan="${m}-${i}" ${plan[`${m}-${i}`] ? 'checked' : ''}><span>${a}</span></label>`).join('')}</div>`).join('')}</div>
    </section>`);
  $$('[data-plan]').forEach((c) => c.addEventListener('change', () => {
    const p = S.lirePremium('plan-seo', {});
    p[c.dataset.plan] = c.checked;
    S.ecrirePremium('plan-seo', p);
    vueSeo(ctx);
  }));
}

/* =====================================================================
   Traductions dans l'éditeur de produit
   ===================================================================== */
const LANGUES = { nl: 'Néerlandais', en: 'Anglais' };
let auto = null;
const chargerAuto = () => (auto ||= Promise.all([import('./catalogue-nl.js'), import('./catalogue-en.js')]).then(([nl, en]) => ({ nl: nl.PRODUITS_TRAD, en: en.PRODUITS_TRAD })));

export function sectionTraductions(p) {
  return `<section class="panneau section-form">
    <h2>Traductions <span class="pastille p-bleu">Premium</span></h2>
    <p class="petit muet">Sans nom relu, la boutique affiche la traduction automatique du catalogue et le signale au client.</p>
    ${Object.entries(LANGUES).map(([l, n]) => `<div class="trad-ligne">
      <label class="champ"><span>Nom en ${n.toLowerCase()} (${l.toUpperCase()})</span><input name="trad-${l}" value="${esc(p.trad?.[l]?.nom || '')}" data-trad="${l}"><small id="auto-${l}" class="muet"></small></label>
      <label class="case"><input type="checkbox" name="relu-${l}" ${p.trad?.[l]?.relu ? 'checked' : ''}><span>Traduction relue</span></label>
    </div>`).join('')}
  </section>`;
}
export function brancherTraductions(p) {
  const base = String(p.id || '').replace(/-expo$/, '');
  chargerAuto().then((a) => Object.keys(LANGUES).forEach((l) => {
    const n = a[l]?.[base]?.n;
    const champ = $(`[data-trad="${l}"]`);
    if (!champ) return;
    champ.placeholder = n || '';
    $(`#auto-${l}`).textContent = n ? `Traduction automatique : ${n}` : 'Pas de traduction automatique pour ce produit.';
  })).catch(() => { /* hors ligne : pas d'aide */ });
}
export function lireTraductions(d, p) {
  const trad = {};
  for (const l of Object.keys(LANGUES)) {
    const nom = String(d[`trad-${l}`] || '').trim();
    const relu = !!d[`relu-${l}`];
    if (nom || relu) trad[l] = { ...(nom ? { nom } : {}), relu };
  }
  if (Object.keys(trad).length) p.trad = trad; else delete p.trad;
}
