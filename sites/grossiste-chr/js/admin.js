// Espace admin Stockinox (démo) : mêmes données que la boutique, dans le navigateur.
// La vraie version : comptes administrateurs côté serveur, base de données, photos stockées en ligne.
import * as S from './store.js';
import { eur, esc, ic, src, toast, modale, documentCommercial, dateCourte, heure, definirRacine, nombre } from './ui.js';

definirRacine('../');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');

function entre() { try { return sessionStorage.getItem('stx-admin') === '1'; } catch { return true; } }

/* ---------- Écran d'entrée ---------- */
function ecranEntree() {
  app.innerHTML = `<div class="entree"><form class="entree-boite" id="form-entree">
    <img src="../img/logo.svg" alt="Stockinox" width="200" height="43">
    <h1>Espace admin</h1>
    <p>Gérez le catalogue, les commandes, les comptes pros et les devis de la boutique.</p>
    <label class="champ"><span>E-mail</span><input name="email" type="email" value="admin@example.com" autocomplete="username"></label>
    <label class="champ"><span>Mot de passe</span><input name="mdp" type="password" value="demo-demo" autocomplete="current-password"></label>
    <button class="btn btn-plein btn-grand" type="submit">Entrer</button>
    <div class="info-bulle" style="display:flex;gap:10px;padding:12px;border-radius:10px;background:var(--bleu-c);font-size:13px">${ic('info')}<span><strong>Démo :</strong> accès libre, les données restent dans ce navigateur. La vraie version a des comptes administrateurs sécurisés côté serveur.</span></div>
    <a class="btn btn-lien" href="../">← Retour à la boutique</a>
  </form></div>`;
  $('#form-entree').addEventListener('submit', (e) => {
    e.preventDefault();
    try { sessionStorage.setItem('stx-admin', '1'); } catch { /* rien */ }
    demarrer();
  });
}

/* ---------- Cadre ---------- */
const MENU = [
  ['', 'chart', 'Tableau de bord'],
  ['commandes', 'box', 'Commandes'],
  ['produits', 'tag', 'Produits'],
  ['categories', 'layers', 'Catégories'],
  ['clients', 'users', 'Revendeurs'],
  ['devis', 'file', 'Devis'],
  ['reglages', 'settings', 'Réglages'],
];
function compteurs() {
  const cmd = S.commandes();
  return {
    commandes: cmd.filter((c) => ['attente', 'validee', 'preparation'].includes(c.statut)).length,
    clients: S.clients().filter((c) => c.statut === 'en-attente').length,
    devis: S.devis().filter((d) => d.statut === 'demande').length,
  };
}
function cadre(section, titre, contenu, actions = '') {
  const n = compteurs();
  app.innerHTML = `<div class="cadre">
    <aside class="lateral" id="lateral">
      <div class="lateral-tete"><img src="../img/logo-blanc.svg" alt="Stockinox" width="150" height="33"><span>Espace admin</span></div>
      <nav aria-label="Administration">${MENU.map(([k, i, t]) => `<a href="#/${k}" ${section === k ? 'aria-current="page"' : ''}>${ic(i)}${t}${n[k] ? `<span class="compteur">${n[k]}</span>` : ''}</a>`).join('')}</nav>
      <div class="lateral-pied">
        <a href="../" target="_blank" rel="noopener">${ic('eye')}Voir la boutique</a>
        <a href="#" data-sortir>${ic('logout')}Quitter</a>
      </div>
    </aside>
    <div class="principal">
      <header class="barre-haut"><button class="btn-icone burger" type="button" data-burger aria-label="Menu">${ic('menu')}</button><h1>${titre}</h1>${actions}<span class="chip-exemple" title="Clients, commandes et devis d'exemple ; produits et prix relevés sur un vrai catalogue public">Démo · clients et commandes d'exemple</span></header>
      <main class="contenu" id="contenu">${contenu}</main>
    </div>
  </div>`;
  document.title = `${titre} — Admin Stockinox`;
}

/* ---------- Tableau de bord ---------- */
function vueTableau() {
  const cmd = S.commandes().filter((c) => c.statut !== 'annulee');
  const jour = 864e5;
  const maintenant = Date.now();
  const d30 = cmd.filter((c) => maintenant - new Date(c.date) < 30 * jour);
  const ca = d30.reduce((s, c) => s + c.totaux.ht, 0);
  const aTraiter = S.commandes().filter((c) => ['validee', 'preparation'].includes(c.statut));
  const attente = S.commandes().filter((c) => c.statut === 'attente');
  const stockBas = S.tousProduits().filter((p) => p.enLigne !== false && p.stock > 0 && p.stock <= 2).slice(0, 6);
  const comptes = S.clients().filter((c) => c.statut === 'en-attente');
  const devisAttente = S.devis().filter((d) => d.statut === 'demande');
  // ventes par jour (30 jours)
  const jours = [...Array(30)].map((_, i) => { const d = new Date(maintenant - (29 - i) * jour); d.setHours(0, 0, 0, 0); return { d, ht: 0, n: 0 }; });
  d30.forEach((c) => { const d = new Date(c.date); d.setHours(0, 0, 0, 0); const j = jours.find((x) => x.d.getTime() === d.getTime()); if (j) { j.ht += c.totaux.ht; j.n++; } });
  // meilleures ventes
  const ventes = {};
  cmd.forEach((c) => c.lignes.forEach((l) => { ventes[l.id] = ventes[l.id] || { l, q: 0, ht: 0 }; ventes[l.id].q += l.qte; ventes[l.id].ht += l.total; }));
  const top = Object.values(ventes).sort((a, b) => b.ht - a.ht).slice(0, 5);

  cadre('', 'Tableau de bord', `
    <div class="kpis">
      <div class="kpi"><span>Chiffre d'affaires HT · 30 jours</span><strong>${eur(ca)}</strong><small>${d30.length} commande${d30.length > 1 ? 's' : ''}</small></div>
      <div class="kpi"><span>Panier moyen HT</span><strong>${eur(d30.length ? ca / d30.length : 0)}</strong><small>sur 30 jours</small></div>
      <div class="kpi"><span>À préparer / expédier</span><strong>${aTraiter.length}</strong><small><a href="#/commandes?f=traiter" class="btn-lien" style="padding:0">Voir les commandes</a></small></div>
      <div class="kpi"><span>Paiements attendus</span><strong>${attente.length}</strong><small>${eur(attente.reduce((s, c) => s + c.totaux.ttc, 0))} TTC en virement</small></div>
    </div>
    <div class="deux">
      <section class="panneau">
        <div class="panneau-tete"><h2>Ventes HT par jour, 30 derniers jours</h2></div>
        <div class="graph" id="graph"></div>
      </section>
      <section class="panneau">
        <div class="panneau-tete"><h2>À traiter</h2><a href="#/commandes?f=traiter">Tout voir</a></div>
        <div class="liste-simple">${aTraiter.length ? aTraiter.slice(0, 6).map((c) => `<a href="#/commandes/${c.num}"><span class="pastille ${c.statut === 'validee' ? 'p-bleu' : 'p-jaune'}">${S.statut(c.statut).court}</span><span><strong>${esc(c.client.societe)}</strong><small>${esc(c.num)} · ${heure(c.date)}</small></span><strong class="num">${eur(c.totaux.ht)}</strong></a>`).join('') : '<p class="muet">Rien à traiter pour l\'instant.</p>'}</div>
      </section>
    </div>
    <div class="trois">
      <section class="panneau">
        <div class="panneau-tete"><h2>Revendeurs à valider</h2><a href="#/clients">Revendeurs</a></div>
        <div class="liste-simple">${comptes.length ? comptes.map((c) => `<a href="#/clients"><span class="pastille p-jaune">À valider</span><span><strong>${esc(c.societe)}</strong><small>${[c.activite, c.ville].filter(Boolean).map(esc).join(' · ')}</small></span>${ic('right')}</a>`).join('') : '<p class="muet">Aucun compte en attente.</p>'}</div>
      </section>
      <section class="panneau">
        <div class="panneau-tete"><h2>Stock bas (≤ 2)</h2><a href="#/produits?stock=bas">Produits</a></div>
        <div class="liste-simple">${stockBas.length ? stockBas.map((p) => `<a href="#/produits/${p.id}"><img src="${src(p.images[0])}" alt="" width="40" height="40"><span>${esc(p.nom)}<small>Réf. ${esc(p.ref)}</small></span><span class="pastille p-orange">${p.stock}</span></a>`).join('') : '<p class="muet">Aucun produit en stock bas.</p>'}</div>
      </section>
      <section class="panneau">
        <div class="panneau-tete"><h2>Meilleures ventes</h2></div>
        <div class="liste-simple">${top.map((t) => `<a href="#/produits/${t.l.id}"><img src="${src(t.l.image)}" alt="" width="40" height="40"><span>${esc(t.l.nom)}<small>${t.q} vendu${t.q > 1 ? 's' : ''}</small></span><strong class="num">${eur(t.ht)}</strong></a>`).join('')}</div>
      </section>
    </div>
    ${devisAttente.length ? `<section class="panneau"><div class="panneau-tete"><h2>Demandes de devis</h2><a href="#/devis">Tous les devis</a></div><div class="liste-simple">${devisAttente.map((d) => `<a href="#/devis/${d.num}"><span class="pastille p-jaune">Nouveau</span><span><strong>${esc(d.client.societe)}</strong><small>${esc(d.num)} · ${dateCourte(d.date)}${d.message ? ' · « ' + esc(d.message.slice(0, 70)) + '… »' : ''}</small></span><strong class="num">${eur(d.totaux.ht)} HT</strong></a>`).join('')}</div></section>` : ''}
  `);
  $('#graph').innerHTML = graphique(jours, $('#graph').clientWidth);
  brancherGraphique(jours);
}
function graphique(jours, largeur = 600) {
  const max = Math.max(1000, ...jours.map((j) => j.ht));
  const pas = max > 20000 ? 10000 : max > 8000 ? 4000 : max > 4000 ? 2000 : 1000;
  const haut = Math.ceil(max / pas) * pas;
  const W = Math.max(300, Math.round(largeur)), H = 220, g = 40, b = 22;
  const lb = (W - g) / jours.length;
  const y = (v) => H - b - (v / haut) * (H - b - 8);
  let lignes = '';
  for (let v = 0; v <= haut; v += pas) lignes += `<line x1="${g}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text x="${g - 8}" y="${y(v) + 4}" text-anchor="end">${v >= 1000 ? v / 1000 + ' k' : v}</text>`;
  const barres = jours.map((j, i) => {
    const x = g + i * lb + 1;
    const w = Math.max(2, lb - 2);
    const h = Math.max(0, H - b - y(j.ht));
    const r = Math.min(4, w / 2, h);
    const path = h > 0 ? `M${x},${H - b} V${H - b - h + r} Q${x},${H - b - h} ${x + r},${H - b - h} H${x + w - r} Q${x + w},${H - b - h} ${x + w},${H - b - h + r} V${H - b} Z` : '';
    return `<rect class="cible" data-i="${i}" x="${g + i * lb}" y="0" width="${lb}" height="${H - b}"/><path class="barre" data-i="${i}" d="${path}"/>`;
  }).join('');
  const tous = W > 520 ? 5 : 10;
  const etiq = jours.map((j, i) => ((29 - i) % tous === 0) ? `<text x="${g + i * lb + lb / 2}" y="${H - 4}" text-anchor="middle">${j.d.getDate()}/${j.d.getMonth() + 1}</text>` : '').join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Ventes hors taxes par jour sur 30 jours"><g class="grille axe">${lignes}</g>${barres}<g class="axe">${etiq}</g></svg><div class="bulle" id="bulle" hidden></div>`;
}
function brancherGraphique(jours) {
  const g = $('#graph');
  const bulle = $('#bulle');
  g.addEventListener('mousemove', (e) => {
    const c = e.target.closest('[data-i]');
    $$('.barre.survol', g).forEach((x) => x.classList.remove('survol'));
    if (!c) { bulle.hidden = true; return; }
    const j = jours[+c.dataset.i];
    $(`.barre[data-i="${c.dataset.i}"]`, g).classList.add('survol');
    const r = g.getBoundingClientRect();
    bulle.innerHTML = `<strong>${eur(j.ht)} HT</strong>${j.d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · ${j.n} commande${j.n > 1 ? 's' : ''}`;
    bulle.style.left = Math.min(r.width - 80, Math.max(80, e.clientX - r.left)) + 'px';
    bulle.style.top = (e.clientY - r.top) + 'px';
    bulle.hidden = false;
  });
  g.addEventListener('mouseleave', () => { bulle.hidden = true; $$('.barre.survol', g).forEach((x) => x.classList.remove('survol')); });
}

/* ---------- Commandes ---------- */
const FILTRES_CMD = [
  ['tout', 'Toutes', () => true],
  ['traiter', 'À traiter', (c) => ['validee', 'preparation'].includes(c.statut)],
  ['attente', 'Paiement attendu', (c) => c.statut === 'attente'],
  ['expediee', 'Expédiées', (c) => c.statut === 'expediee'],
  ['livree', 'Livrées', (c) => c.statut === 'livree'],
  ['annulee', 'Annulées', (c) => c.statut === 'annulee'],
];
const couleurStatut = (s) => ({ attente: 'p-jaune', validee: 'p-bleu', preparation: 'p-orange', expediee: 'p-bleu', livree: 'p-vert', annulee: 'p-rouge' }[s] || 'p-gris');
function vueCommandes(params) {
  const f = params.get('f') || 'tout';
  const q = params.get('q') || '';
  const toutes = S.commandes();
  const filtre = FILTRES_CMD.find((x) => x[0] === f) || FILTRES_CMD[0];
  const liste = toutes.filter(filtre[2]).filter((c) => !q || S.norm(`${c.num} ${c.client.societe} ${c.client.email}`).includes(S.norm(q)));
  cadre('commandes', 'Commandes', `
    <div class="onglets">${FILTRES_CMD.map(([k, t, fn]) => `<a href="#/commandes?f=${k}" ${k === f ? 'aria-current="page"' : ''}>${t} <b>${toutes.filter(fn).length}</b></a>`).join('')}</div>
    <section class="panneau">
      <div class="outils"><input class="saisie recherche-admin" id="q-cmd" type="search" placeholder="N° de commande, société, e-mail…" value="${esc(q)}" aria-label="Rechercher une commande"></div>
      <div class="table-scroll"><table class="table-admin"><thead><tr><th>Commande</th><th>Client</th><th>Livraison</th><th>Paiement</th><th class="num">Total HT</th><th>Statut</th></tr></thead><tbody>
      ${liste.map((c) => `<tr data-lien="#/commandes/${c.num}" style="cursor:pointer">
        <td class="nom"><a href="#/commandes/${c.num}">${esc(c.num)}</a><small>${heure(c.date)}</small></td>
        <td class="nom">${esc(c.client.societe)}<small>${esc(c.client.contact || '')}${c.exemple ? ' · exemple' : ''}</small></td>
        <td>${{ palette: 'Palette', hayon: 'Hayon + RDV', direct: 'Directe client', enlevement: 'Enlèvement' }[c.livraison?.mode] || ''}<br><small class="muet">${esc(c.livraison?.cp || '')} ${esc(c.livraison?.ville || '')}</small></td>
        <td>${esc({ cb: 'Carte', virement: 'Virement', '4x': '4× sans frais', '30j': '30 jours' }[c.paiement] || '')}</td>
        <td class="num"><strong>${eur(c.totaux.ht)}</strong></td>
        <td><span class="pastille ${couleurStatut(c.statut)}">${S.statut(c.statut, c.livraison?.mode === 'enlevement').court}</span></td>
      </tr>`).join('') || '<tr><td colspan="6" class="muet">Aucune commande.</td></tr>'}
      </tbody></table></div>
    </section>`);
  const champ = $('#q-cmd');
  champ.addEventListener('change', () => { location.hash = `#/commandes?f=${f}&q=${encodeURIComponent(champ.value)}`; });
  $$('[data-lien]').forEach((tr) => tr.addEventListener('click', (e) => { if (!e.target.closest('a')) location.hash = tr.dataset.lien; }));
}
function vueCommande(num) {
  const c = S.commande(num);
  if (!c) return introuvable('Commande');
  const retrait = c.livraison?.mode === 'enlevement';
  const ordre = ['attente', 'validee', 'preparation', 'expediee', 'livree'];
  const etapes = c.paiement === 'virement' || c.historique.some((h) => h.statut === 'attente') ? ordre : ordre.slice(1);
  const idx = etapes.indexOf(c.statut);
  const quand = (s) => c.historique.filter((h) => h.statut === s).pop()?.date;
  const suivant = {
    attente: ['validee', `${ic('euro')}Paiement reçu`],
    validee: ['preparation', `${ic('box')}Passer en préparation`],
    preparation: ['expediee', retrait ? `${ic('store')}Prête à l’entrepôt` : `${ic('truck')}Marquer expédiée`],
    expediee: ['livree', retrait ? `${ic('check')}Marquer enlevée` : `${ic('check')}Marquer livrée`],
  }[c.statut];
  const client = c.client.id ? S.client(c.client.id) : null;
  cadre('commandes', `Commande ${esc(c.num)}`, `
    <section class="panneau">
      <div class="panneau-tete"><div><h2>${esc(c.client.societe)} · ${eur(c.totaux.ttc)} TTC</h2><p class="muet petit">Passée le ${heure(c.date)} · ${esc(S.PAIEMENTS[c.paiement] || '')}${c.exemple ? ' · commande d\'exemple' : ''}</p></div><span class="pastille ${couleurStatut(c.statut)}">${S.statut(c.statut, retrait).nom}</span></div>
      ${c.statut === 'annulee' ? '' : `<div class="etapes-admin">${etapes.map((s, i) => `<span class="${i < idx || (i === idx && s === 'livree') ? 'fait' : i === idx ? 'encours' : ''}">${S.statut(s, retrait).nom}${quand(s) ? `<small>${heure(quand(s))}</small>` : ''}</span>`).join('')}</div>`}
      <div class="actions-statut">
        ${suivant && c.statut !== 'annulee' ? `<button class="btn btn-plein" type="button" data-avancer="${suivant[0]}">${suivant[1]}</button>` : ''}
        ${!['livree', 'annulee'].includes(c.statut) ? `<button class="btn btn-danger" type="button" data-annuler>${ic('x')}Annuler</button>` : ''}
        <button class="btn" type="button" data-doc="bon">${ic('print')}Bon de préparation</button>
        <button class="btn" type="button" data-doc="facture">${ic('file')}Facture</button>
        <a class="btn btn-lien" href="../#/suivi/${c.num}" target="_blank" rel="noopener">Voir le suivi client ${ic('arrow')}</a>
      </div>
      ${c.suivi ? `<p class="petit">Transporteur <strong>${esc(c.transporteur)}</strong> · suivi <code>${esc(c.suivi)}</code></p>` : ''}
    </section>
    <div class="deux">
      <section class="panneau">
        <h2>Articles</h2>
        <div class="table-scroll"><table class="table-admin"><thead><tr><th></th><th>Article</th><th class="num">Qté</th><th class="num">PU HT</th><th class="num">Total HT</th></tr></thead><tbody>
        ${c.lignes.map((l) => `<tr><td><img src="${src(l.image)}" alt="" width="44" height="44"></td><td class="nom"><a href="#/produits/${l.id}">${esc(l.nom)}</a><small>Réf. ${esc(l.ref)}</small></td><td class="num">${l.qte}</td><td class="num">${eur(l.unit)}${l.unit < l.base ? `<br><small class="muet"><s>${eur(l.base)}</s></small>` : ''}</td><td class="num"><strong>${eur(l.total)}</strong></td></tr>`).join('')}
        <tr><td colspan="4" class="num">Total HT</td><td class="num"><strong>${eur(c.totaux.ht)}</strong></td></tr>
        <tr><td colspan="4" class="num">Port HT</td><td class="num">${c.totaux.port ? eur(c.totaux.port) : 'Offert'}</td></tr>
        <tr><td colspan="4" class="num">TVA</td><td class="num">${eur(c.totaux.tva)}</td></tr>
        <tr><td colspan="4" class="num"><strong>Total TTC</strong></td><td class="num"><strong>${eur(c.totaux.ttc)}</strong></td></tr>
        </tbody></table></div>
        ${c.note ? `<p class="petit"><strong>Instructions du client :</strong> ${esc(c.note)}</p>` : ''}
      </section>
      <div style="display:grid;gap:18px">
        <section class="panneau"><h2>Client</h2><div class="fiche-client"><strong>${esc(c.client.societe)}</strong><span>${esc(c.client.contact || '')}</span><span>${esc(c.client.email || '')} · ${esc(c.client.tel || '')}</span><span class="muet">SIRET ${esc(c.client.siret || '—')} · TVA ${esc(c.client.tva || '—')}</span>${client ? `<span>${client.statut === 'valide' ? '<span class="pastille p-vert">Compte validé</span>' : '<span class="pastille p-jaune">Compte à valider</span>'} <span class="pastille p-bleu">${esc(S.niveau(client).nom)}</span> ${['30j', '45j'].includes(client.conditions) ? `<span class="pastille p-gris">${client.conditions === '30j' ? '30 jours' : 'LCR 45 j'}</span>` : ''}</span>` : '<span class="muet">Sans compte</span>'}</div></section>
        <section class="panneau"><h2>${retrait ? 'Enlèvement' : 'Livraison'}</h2><div class="fiche-client"><strong>${esc(S.LIVRAISONS[c.livraison?.mode] || '')}</strong>${retrait ? `<span>Entrepôt, ${esc(S.reglages().adresse)}</span>` : `${c.livraison.destinataire ? `<span>Client final : <strong>${esc(c.livraison.destinataire)}</strong>${c.livraison.telDest ? ' · ' + esc(c.livraison.telDest) : ''}</span><span class="pastille p-orange" style="justify-self:start">Étiquette neutre, sans prix</span>` : ''}<span>${esc(c.livraison.adresse)}</span><span>${esc(c.livraison.cp)} ${esc(c.livraison.ville)} · ${esc(c.livraison.pays || 'France')}</span>`}${c.refClient ? `<span class="muet">Bon de commande client : ${esc(c.refClient)}</span>` : ''}</div></section>
        <section class="panneau"><h2>Historique</h2><ul class="historique">${c.historique.map((h) => `<li><span>${S.statut(h.statut, retrait).nom}<br><small>${heure(h.date)}${h.note ? ' · ' + esc(h.note) : ''}</small></span></li>`).join('')}</ul></section>
      </div>
    </div>`, `<a class="btn btn-petit" href="#/commandes">${ic('left')}Commandes</a>`);
  $('[data-avancer]')?.addEventListener('click', async (e) => {
    const nouveau = e.currentTarget.dataset.avancer;
    let extra = {};
    if (nouveau === 'expediee' && !retrait) {
      const r = await modale({
        titre: 'Expédier la commande',
        corps: `<label class="champ"><span>Transporteur</span><select name="transporteur">${['Geodis', 'DB Schenker', 'Kuehne + Nagel', 'DPD', 'Chronopost', 'Livraison Stockinox'].map((t) => `<option>${t}</option>`).join('')}</select></label>
          <label class="champ"><span>N° de suivi</span><input name="suivi" value="EX${Math.floor(10000000 + Math.random() * 89999999)}FR"></label>
          <p class="petit muet">Le client voit le transporteur et le numéro dans son suivi de commande.</p>`,
        actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Marquer expédiée', classe: 'btn-plein' }],
      });
      if (r.action !== 'ok') return;
      extra = { transporteur: r.donnees.transporteur, suivi: r.donnees.suivi };
    }
    S.changerStatut(c.num, nouveau, extra);
    toast(`${ic('check')} ${S.statut(nouveau, retrait).nom} — le suivi client est à jour`);
    vueCommande(num);
  });
  $('[data-annuler]')?.addEventListener('click', async () => {
    const r = await modale({ titre: 'Annuler la commande ?', corps: '<label class="champ"><span>Motif (visible dans l\'historique)</span><input name="note" placeholder="Demande du client, rupture…"></label>', actions: [{ id: 'annuler', libelle: 'Retour' }, { id: 'ok', libelle: 'Annuler la commande', classe: 'btn-sombre' }] });
    if (r.action !== 'ok') return;
    S.changerStatut(c.num, 'annulee', { note: r.donnees.note || '' });
    vueCommande(num);
  });
  $$('[data-doc]').forEach((b) => b.addEventListener('click', () => imprimer(documentCommercial(b.dataset.doc, c))));
}

/* ---------- Produits ---------- */
let selection = new Set();
function vueProduits(params) {
  const q = params.get('q') || '';
  const fam = params.get('famille') || '';
  const stock = params.get('stock') || '';
  const page = Math.max(1, +params.get('page') || 1);
  const parPage = 40;
  const tous = S.tousProduits();
  const liste = tous.filter((p) => (!q || S.norm(`${p.nom} ${p.ref} ${p.marque}`).includes(S.norm(q)))
    && (!fam || p.famille === fam)
    && (!stock || (stock === 'rupture' ? p.stock <= 0 : stock === 'bas' ? p.stock > 0 && p.stock <= 2 : stock === 'horsligne' ? p.enLigne === false : stock === 'sc' ? p.etat === 'second-choix' : true)));
  const pages = Math.max(1, Math.ceil(liste.length / parPage));
  const vus = liste.slice((page - 1) * parPage, page * parPage);
  const lienAvec = (k, v) => { const p = new URLSearchParams(params); if (v) p.set(k, v); else p.delete(k); p.delete('page'); if (k === 'page' && v) p.set('page', v); return '#/produits?' + p.toString(); };
  cadre('produits', 'Produits', `
    <section class="panneau">
      <div class="outils">
        <input class="saisie recherche-admin" id="q-prod" type="search" placeholder="Nom, référence, marque…" value="${esc(q)}" aria-label="Rechercher un produit">
        <select class="saisie" id="f-fam" aria-label="Famille"><option value="">Toutes les familles</option>${S.familles().map((f) => `<option value="${f.slug}" ${fam === f.slug ? 'selected' : ''}>${esc(f.nom)}</option>`).join('')}</select>
        <select class="saisie" id="f-stock" aria-label="État"><option value="">Tous</option><option value="bas" ${stock === 'bas' ? 'selected' : ''}>Stock bas</option><option value="rupture" ${stock === 'rupture' ? 'selected' : ''}>Rupture / sur commande</option><option value="horsligne" ${stock === 'horsligne' ? 'selected' : ''}>Hors ligne</option><option value="sc" ${stock === 'sc' ? 'selected' : ''}>Second choix</option></select>
        <button class="btn" type="button" data-import>${ic('upload')}Prix et stocks (CSV)</button>
        <button class="btn" type="button" data-export>${ic('download')}Exporter</button>
      </div>
      <div class="lot" id="lot" hidden><strong id="lot-nb"></strong>
        <button class="btn btn-petit" type="button" data-lot="horsligne">Mettre hors ligne</button>
        <button class="btn btn-petit" type="button" data-lot="enligne">Mettre en ligne</button>
        <button class="btn btn-petit" type="button" data-lot="prix">Changer les prix (%)</button>
        <button class="btn btn-petit" type="button" data-lot="supprimer">Supprimer</button>
      </div>
      <div class="table-scroll"><table class="table-admin"><thead><tr>
        <th><input type="checkbox" id="tout-cocher" aria-label="Tout sélectionner"></th><th></th><th>Produit</th><th>Catégorie</th><th class="num">PPC HT</th><th class="num">Revendeur HT</th><th class="num">Stock</th><th>En ligne</th><th></th>
      </tr></thead><tbody>
      ${vus.map((p) => `<tr>
        <td><input type="checkbox" data-sel="${p.id}" ${selection.has(p.id) ? 'checked' : ''} aria-label="Sélectionner"></td>
        <td><img src="${src(p.images[0])}" alt="" width="44" height="44" loading="lazy"></td>
        <td class="nom"><a href="#/produits/${p.id}">${esc(p.nom)}</a><small>Réf. ${esc(p.ref)} · ${esc(p.marque || '—')} ${p.etat === 'second-choix' ? '· <span class="pastille p-sc">Second choix</span>' : ''} ${p.prixBarreHT ? `· <s>${eur(p.prixBarreHT)}</s>` : ''}</small></td>
        <td><small>${esc(S.famille(p.famille)?.court || '')}<br><span class="muet">${esc(S.sousFamille(p.famille, p.sous)?.nom || '')}</span></small></td>
        <td class="num"><input class="mini" type="number" step="0.01" min="0" value="${p.prixHT}" data-champ="prixHT" data-id="${p.id}" aria-label="Prix public conseillé HT"></td>
        <td class="num"><small><strong>${eur(S.prixRevendeur(p))}</strong>${p.prixRevendeur ? ' <span class="pastille p-jaune">fixé</span>' : ''}<br><span class="muet">${S.colisage(p) > 1 ? 'lot de ' + S.colisage(p) : 'à l’unité'} · pal. ${S.parPalette(p)}</span></small></td>
        <td class="num"><input class="mini" type="number" step="1" min="0" value="${p.stock}" data-champ="stock" data-id="${p.id}" aria-label="Stock" style="width:70px"></td>
        <td><label class="inter"><input type="checkbox" data-enligne="${p.id}" ${p.enLigne !== false ? 'checked' : ''} aria-label="En ligne"><span></span></label></td>
        <td><div class="table-actions"><a class="btn-icone" href="#/produits/${p.id}" aria-label="Modifier">${ic('edit')}</a><a class="btn-icone" href="../#/p/${p.id}" target="_blank" rel="noopener" aria-label="Voir dans la boutique">${ic('eye')}</a><button class="btn-icone" type="button" data-dupliquer="${p.id}" aria-label="Dupliquer">${ic('copy')}</button><button class="btn-icone" type="button" data-supprimer="${p.id}" aria-label="Supprimer">${ic('trash')}</button></div></td>
      </tr>`).join('') || '<tr><td colspan="9" class="muet">Aucun produit.</td></tr>'}
      </tbody></table></div>
      <div class="pagination">${page > 1 ? `<a class="btn btn-petit" href="${lienAvec('page', page - 1)}">${ic('left')}</a>` : ''}<span>${liste.length} produit${liste.length > 1 ? 's' : ''} · page ${page} / ${pages}</span>${page < pages ? `<a class="btn btn-petit" href="${lienAvec('page', page + 1)}">${ic('right')}</a>` : ''}</div>
    </section>`, `<a class="btn btn-plein btn-petit" href="#/produits/nouveau">${ic('plus')}Nouveau produit</a>`);

  $('#q-prod').addEventListener('change', (e) => { location.hash = lienAvec('q', e.target.value); });
  $('#f-fam').addEventListener('change', (e) => { location.hash = lienAvec('famille', e.target.value); });
  $('#f-stock').addEventListener('change', (e) => { location.hash = lienAvec('stock', e.target.value); });
  const majLot = () => { $('#lot').hidden = !selection.size; $('#lot-nb').textContent = `${selection.size} sélectionné${selection.size > 1 ? 's' : ''}`; };
  majLot();
  $('#tout-cocher').addEventListener('change', (e) => { vus.forEach((p) => (e.target.checked ? selection.add(p.id) : selection.delete(p.id))); $$('[data-sel]').forEach((x) => { x.checked = e.target.checked; }); majLot(); });
  $$('[data-sel]').forEach((x) => x.addEventListener('change', () => { x.checked ? selection.add(x.dataset.sel) : selection.delete(x.dataset.sel); majLot(); }));
  $$('input.mini').forEach((inp) => inp.addEventListener('change', () => {
    const p = S.produit(inp.dataset.id);
    const v = inp.dataset.champ === 'stock' ? Math.max(0, parseInt(inp.value, 10) || 0) : Math.max(0, S.arrondi(parseFloat(inp.value) || 0));
    p[inp.dataset.champ] = v;
    S.enregistrerProduit(p);
    inp.classList.add('enregistre');
    setTimeout(() => inp.classList.remove('enregistre'), 900);
  }));
  $$('[data-enligne]').forEach((x) => x.addEventListener('change', () => { const p = S.produit(x.dataset.enligne); p.enLigne = x.checked; S.enregistrerProduit(p); toast(x.checked ? 'Produit en ligne' : 'Produit retiré de la boutique'); }));
  $$('[data-supprimer]').forEach((b) => b.addEventListener('click', () => supprimer([b.dataset.supprimer])));
  $$('[data-dupliquer]').forEach((b) => b.addEventListener('click', () => {
    const p = S.copie(S.produit(b.dataset.dupliquer));
    p.id = S.nouvelId(p.nom + '-copie');
    p.ref = p.ref + '-COPIE';
    p.nom = p.nom + ' (copie)';
    p.enLigne = false;
    S.enregistrerProduit(p);
    location.hash = `#/produits/${p.id}`;
    toast('Copie créée, hors ligne : modifiez-la puis mettez-la en ligne.');
  }));
  $$('[data-lot]').forEach((b) => b.addEventListener('click', async () => {
    const ids = [...selection];
    if (b.dataset.lot === 'supprimer') return supprimer(ids);
    if (b.dataset.lot === 'prix') {
      const r = await modale({ titre: `Changer le prix de ${ids.length} produit${ids.length > 1 ? 's' : ''}`, corps: '<label class="champ"><span>Variation en % (ex. 5 pour +5 %, -10 pour −10 %)</span><input name="pct" type="number" step="0.1" value="5"></label>', actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Appliquer', classe: 'btn-plein' }] });
      if (r.action !== 'ok') return;
      const pct = parseFloat(r.donnees.pct) || 0;
      ids.forEach((id) => { const p = S.produit(id); p.prixHT = S.arrondi(p.prixHT * (1 + pct / 100)); S.enregistrerProduit(p); });
      toast(`${ic('check')} Prix mis à jour (${pct > 0 ? '+' : ''}${pct} %)`);
    } else {
      ids.forEach((id) => { const p = S.produit(id); p.enLigne = b.dataset.lot === 'enligne'; S.enregistrerProduit(p); });
      toast(`${ic('check')} ${ids.length} produit${ids.length > 1 ? 's' : ''} ${b.dataset.lot === 'enligne' ? 'en ligne' : 'hors ligne'}`);
    }
    selection.clear();
    router();
  }));
  $('[data-export]').addEventListener('click', () => {
    const lignes = [['reference', 'nom', 'marque', 'famille', 'sous_categorie', 'prix_public_conseille_ht', 'prix_revendeur_ht', 'prix_public_barre_ht', 'colisage', 'palette', 'stock', 'en_ligne', 'etat']];
    S.tousProduits().forEach((p) => lignes.push([p.ref, p.nom, p.marque || '', S.famille(p.famille)?.nom || '', S.sousFamille(p.famille, p.sous)?.nom || '', String(p.prixHT).replace('.', ','), String(S.prixRevendeur(p)).replace('.', ','), p.prixBarreHT ? String(p.prixBarreHT).replace('.', ',') : '', S.colisage(p), S.parPalette(p), p.stock, p.enLigne === false ? 'non' : 'oui', p.etat]));
    const csv = '﻿' + lignes.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `stockinox-produits-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  $('[data-import]').addEventListener('click', importerPrix);
}
async function supprimer(ids) {
  const r = await modale({ titre: `Supprimer ${ids.length > 1 ? `${ids.length} produits` : 'ce produit'} ?`, corps: `<p>${ids.length > 1 ? 'Ils disparaissent' : 'Il disparaît'} de la boutique. Les commandes passées gardent leurs lignes. Astuce : « hors ligne » le cache sans le supprimer.</p>`, actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Supprimer', classe: 'btn-sombre' }] });
  if (r.action !== 'ok') return;
  S.supprimerProduits(ids);
  ids.forEach((id) => selection.delete(id));
  toast(`${ic('trash')} ${ids.length > 1 ? `${ids.length} produits supprimés` : 'Produit supprimé'}`);
  location.hash = '#/produits';
  router();
}
async function importerPrix() {
  const r = await modale({
    titre: 'Mettre à jour les prix et stocks',
    large: true,
    corps: `<p class="muet">Collez les lignes du tarif ou d'un export Excel : <strong>référence ; prix public conseillé HT ; stock</strong> (le stock est facultatif). Le prix revendeur suit (PPC − remise revendeur), sauf s'il est fixé sur la fiche.</p>
      <label class="champ"><span>Lignes</span><textarea name="csv" rows="8" style="font-family:ui-monospace,monospace" placeholder="${esc(S.tousProduits().slice(0, 3).map((p) => `${p.ref};${String(S.arrondi(p.prixHT * 1.03)).replace('.', ',')};${p.stock + 5}`).join('\n'))}"></textarea></label>`,
    actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Mettre à jour', classe: 'btn-plein' }],
  });
  if (r.action !== 'ok') return;
  let n = 0;
  const inconnues = [];
  String(r.donnees.csv || '').split(/\r?\n/).forEach((l) => {
    const [ref, prix, stock] = l.split(/[;\t]/).map((x) => x && x.trim().replace(/^"|"$/g, ''));
    if (!ref || /^r[ée]f/i.test(ref)) return;
    const p = S.tousProduits().find((x) => S.norm(x.ref) === S.norm(ref));
    if (!p) { inconnues.push(ref); return; }
    const v = parseFloat(String(prix || '').replace(/\s/g, '').replace(',', '.'));
    if (!isNaN(v) && v > 0) p.prixHT = S.arrondi(v);
    if (stock !== undefined && stock !== '' && !isNaN(parseInt(stock, 10))) p.stock = Math.max(0, parseInt(stock, 10));
    S.enregistrerProduit(p);
    n++;
  });
  toast(`${ic('check')} ${n} produit${n > 1 ? 's' : ''} mis à jour${inconnues.length ? ` · ${inconnues.length} référence${inconnues.length > 1 ? 's' : ''} inconnue${inconnues.length > 1 ? 's' : ''}` : ''}`, inconnues.length && !n ? 'erreur' : 'ok', 4500);
  router();
}

/* ---------- Éditeur de produit ---------- */
function versTexteSpecs(specs) { return (specs || []).map(([g, l]) => `## ${g}\n${l.map(([k, v]) => `${k} : ${v}`).join('\n')}`).join('\n\n'); }
function depuisTexteSpecs(t) {
  const groupes = [];
  let g = null;
  t.split(/\r?\n/).forEach((ligne) => {
    const l = ligne.trim();
    if (!l) return;
    if (l.startsWith('#')) { g = [l.replace(/^#+\s*/, ''), []]; groupes.push(g); return; }
    const m = l.match(/^(.+?)\s*:\s*(.+)$/);
    if (!m) return;
    if (!g) { g = ['Caractéristiques', []]; groupes.push(g); }
    g[1].push([m[1], m[2]]);
  });
  return groupes.filter((x) => x[1].length);
}
function vueEditeur(id) {
  const nouveau = id === 'nouveau';
  const orig = nouveau ? null : S.produit(id);
  if (!nouveau && !orig) return introuvable('Produit');
  const fams = S.familles();
  const p = orig ? S.copie(orig) : { id: '', ref: '', nom: '', marque: '', famille: fams[0].slug, sous: fams[0].sous[0]?.slug, prixHT: 0, prixBarreHT: null, stock: 0, delai: '1 à 3 jours ouvrés', etat: 'neuf', nouveau: true, points: [], texte: [], specs: [], images: [], enLigne: true, ajoute: new Date().toISOString().slice(0, 10) };
  const r = S.reglages();
  cadre('produits', nouveau ? 'Nouveau produit' : esc(p.nom), `
    <form class="editeur" id="editeur" novalidate>
      <div style="display:grid;gap:18px">
        <section class="panneau section-form">
          <h2>Informations</h2>
          <label class="champ"><span>Nom du produit *</span><input name="nom" required value="${esc(p.nom)}" placeholder="Armoire réfrigérée inox 1 porte 600 L"></label>
          <div class="grille-champs">
            <label class="champ"><span>Référence *</span><input name="ref" required value="${esc(p.ref)}" placeholder="ARM600-INOX"></label>
            <label class="champ"><span>Marque</span><input name="marque" value="${esc(p.marque || '')}" list="marques"></label>
          </div>
          <datalist id="marques">${[...new Set(S.tousProduits().map((x) => x.marque).filter(Boolean))].sort().map((m) => `<option value="${esc(m)}">`).join('')}</datalist>
          <div class="grille-champs">
            <label class="champ"><span>Famille</span><select name="famille">${fams.map((f) => `<option value="${f.slug}" ${p.famille === f.slug ? 'selected' : ''}>${esc(f.nom)}</option>`).join('')}</select></label>
            <label class="champ"><span>Sous-catégorie</span><select name="sous" id="sel-sous"></select></label>
          </div>
        </section>
        <section class="panneau section-form">
          <h2>Photos</h2>
          <div class="photos" id="photos"></div>
          <p class="petit muet">Glissez des photos ou touchez « Ajouter ». Elles sont redimensionnées (800 px, WebP) avant l'enregistrement. La première est la photo principale.</p>
        </section>
        <section class="panneau section-form">
          <h2>Prix revendeur et prix public</h2>
          <div class="grille-champs">
            <label class="champ"><span>Prix public conseillé HT (PPC) *</span><input name="prixHT" type="number" step="0.01" min="0" required value="${p.prixHT || ''}"><small id="aide-ttc"></small></label>
            <label class="champ"><span>Prix revendeur HT</span><input name="prixRevendeur" type="number" step="0.01" min="0" value="${p.prixRevendeur || ''}" placeholder="Auto : PPC − ${r.remiseRevendeur} %"><small id="aide-revendeur"></small></label>
            <label class="champ"><span>Prix public barré HT</span><input name="prixBarreHT" type="number" step="0.01" min="0" value="${p.prixBarreHT || ''}"><small>Déstockage si la baisse atteint ${S.SEUIL_DESTOCKAGE} %</small></label>
          </div>
        </section>
        <section class="panneau section-form">
          <h2>Conditionnement et stock</h2>
          <div class="grille-champs">
            <label class="champ"><span>Colisage (unités par lot)</span><input name="colisage" type="number" step="1" min="1" value="${p.colisage || ''}" placeholder="Auto : ${S.colisage({ ...p, colisage: 0 })}"></label>
            <label class="champ"><span>Unités par palette</span><input name="palette" type="number" step="1" min="1" value="${p.palette || ''}" placeholder="Auto : ${S.parPalette({ ...p, palette: 0 })}"></label>
            <label class="champ"><span>Stock entrepôt</span><input name="stock" type="number" step="1" min="0" value="${p.stock}"></label>
            <label class="champ"><span>Délai si en stock</span><input name="delai" value="${esc(p.delai || '')}"></label>
            <label class="champ"><span>Arrivage prévu (si rupture)</span><input name="arrivage" type="date" value="${esc(p.arrivage || '')}"></label>
          </div>
          <p class="petit muet">Prix dégressifs appliqués à tous les produits (réglages) : −${r.remise3lots} % dès 3 lots, −${r.remisePalette} % à la palette.</p>
        </section>
        <section class="panneau section-form">
          <h2>État</h2>
          <div class="grille-champs">
            <label class="champ"><span>État</span><select name="etat"><option value="neuf" ${p.etat === 'neuf' ? 'selected' : ''}>Neuf</option><option value="second-choix" ${p.etat === 'second-choix' ? 'selected' : ''}>Second choix</option></select></label>
            <label class="champ" id="champ-defaut" ${p.etat === 'second-choix' ? '' : 'hidden'}><span>Défaut décrit au client</span><input name="defaut" value="${esc(p.defaut || '')}" placeholder="Rayure légère sur le flanc gauche"></label>
          </div>
          <label class="case"><input type="checkbox" name="nouveau" ${p.nouveau ? 'checked' : ''}><span>Afficher le badge « Nouveau »</span></label>
          <label class="case"><input type="checkbox" name="enLigne" ${p.enLigne !== false ? 'checked' : ''}><span>En ligne dans la boutique</span></label>
        </section>
        <section class="panneau section-form">
          <h2>Description</h2>
          <label class="champ"><span>Points clés (une ligne par point)</span><textarea name="points" rows="6">${esc((p.points || []).join('\n'))}</textarea></label>
          <label class="champ"><span>Texte de présentation (un paragraphe par ligne)</span><textarea name="texte" rows="4">${esc((p.texte || []).join('\n'))}</textarea></label>
          <label class="champ"><span>Caractéristiques techniques</span><textarea name="specs" rows="10" style="font-family:ui-monospace,monospace;font-size:13px" placeholder="## Dimensions et poids&#10;Largeur (mm) : 600&#10;## Alimentation&#10;Tension (V) : 230">${esc(versTexteSpecs(p.specs))}</textarea><small>« ## » ouvre un groupe ; puis une ligne « Caractéristique : valeur ».</small></label>
        </section>
      </div>
      <aside class="editeur-cote">
        <section class="panneau"><h2>Aperçu</h2><div class="apercu" id="apercu"></div></section>
        <button class="btn btn-plein btn-grand" type="submit">${ic('check')}Enregistrer</button>
        ${nouveau ? '' : `<a class="btn" href="../#/p/${p.id}" target="_blank" rel="noopener">${ic('eye')}Voir dans la boutique</a><button class="btn btn-danger" type="button" data-supprimer-fiche>${ic('trash')}Supprimer</button>`}
        
      </aside>
    </form>`, `<a class="btn btn-petit" href="#/produits">${ic('left')}Produits</a>`);

  const form = $('#editeur');
  const majSous = () => {
    const f = S.famille(form.famille.value);
    $('#sel-sous').innerHTML = f.sous.map((s) => `<option value="${s.slug}" ${p.sous === s.slug ? 'selected' : ''}>${esc(s.nom)}</option>`).join('');
  };
  majSous();
  form.famille.addEventListener('change', () => { p.sous = null; majSous(); apercu(); });
  form.etat.addEventListener('change', () => { $('#champ-defaut').hidden = form.etat.value !== 'second-choix'; });

  const apercu = () => {
    const ht = parseFloat(form.prixHT.value) || 0;
    const barre = parseFloat(form.prixBarreHT.value) || 0;
    $('#aide-ttc').textContent = `${eur(S.ttc(ht))} TTC`;
    const pr = parseFloat(form.prixRevendeur.value) || S.arrondi(ht * (1 - r.remiseRevendeur / 100));
    $('#aide-revendeur').textContent = ht ? `${eur(pr)} HT · marge ${eur(ht - pr)} (${Math.round(((ht - pr) / ht) * 100)} %)` : '';
    $('#apercu').innerHTML = `<div class="apercu-img"><img src="${src(p.images[0])}" alt="" width="280" height="280"><div class="badges">${form.etat.value === 'second-choix' ? '<span class="pastille p-sc">Second choix</span>' : ''}${barre > ht && ht && (1 - ht / barre) * 100 >= S.SEUIL_DESTOCKAGE ? `<span class="pastille p-promo">Déstockage −${Math.round((1 - ht / barre) * 100)} %</span>` : ''}${form.nouveau.checked ? '<span class="pastille p-nouveau">Nouveau</span>' : ''}</div></div>
      <div class="apercu-corps"><span class="marque">${esc(form.marque.value)}</span><span class="nom">${esc(form.nom.value || 'Nom du produit')}</span><span class="ref">Réf. ${esc(form.ref.value || '—')}</span><span class="prix">${eur(ht)} <small class="muet" style="font-size:12px">HT</small>${barre > ht ? `<s>${eur(barre)}</s>` : ''}</span>${form.enLigne.checked ? '' : '<span class="pastille p-gris">Hors ligne</span>'}</div>`;
  };
  form.addEventListener('input', apercu);
  form.addEventListener('change', apercu);

  const photos = () => {
    $('#photos').innerHTML = p.images.map((im, i) => `<div class="photo"><img src="${src(im)}" alt="Photo ${i + 1}" width="110" height="110"><div class="photo-actions">
        <button type="button" data-photo-g="${i}" aria-label="Avancer">${ic('left')}</button>
        <button type="button" data-photo-x="${i}" aria-label="Retirer">${ic('trash')}</button>
        <button type="button" data-photo-d="${i}" aria-label="Reculer">${ic('right')}</button></div></div>`).join('')
      + `<label class="depot" id="depot">${ic('upload')}<span>Ajouter des photos</span><input type="file" accept="image/*" multiple hidden id="fichiers"></label>`;
    $('#fichiers').addEventListener('change', (e) => ajouterPhotos(e.target.files));
    const depot = $('#depot');
    ['dragenter', 'dragover'].forEach((ev) => depot.addEventListener(ev, (e) => { e.preventDefault(); depot.classList.add('survol'); }));
    ['dragleave', 'drop'].forEach((ev) => depot.addEventListener(ev, () => depot.classList.remove('survol')));
    depot.addEventListener('drop', (e) => { e.preventDefault(); ajouterPhotos(e.dataTransfer.files); });
    $$('[data-photo-x]').forEach((b) => b.addEventListener('click', () => { p.images.splice(+b.dataset.photoX, 1); photos(); apercu(); }));
    $$('[data-photo-g]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.photoG; if (i > 0) { [p.images[i - 1], p.images[i]] = [p.images[i], p.images[i - 1]]; photos(); apercu(); } }));
    $$('[data-photo-d]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.photoD; if (i < p.images.length - 1) { [p.images[i + 1], p.images[i]] = [p.images[i], p.images[i + 1]]; photos(); apercu(); } }));
  };
  const ajouterPhotos = async (fichiers) => {
    for (const f of [...fichiers].filter((x) => x.type.startsWith('image/')).slice(0, 8)) {
      try { p.images.push(await reduire(f)); } catch { toast(`Image illisible : ${esc(f.name)}`, 'erreur'); }
    }
    photos(); apercu();
  };
  photos();
  apercu();

  $('[data-supprimer-fiche]')?.addEventListener('click', () => supprimer([p.id]));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    $$('.champ.erreur', form).forEach((x) => x.classList.remove('erreur'));
    const manque = ['nom', 'ref', 'prixHT'].filter((k) => !String(d[k] || '').trim() || (k === 'prixHT' && !(parseFloat(d[k]) > 0)));
    const doublon = S.tousProduits().find((x) => x.id !== p.id && S.norm(x.ref) === S.norm(d.ref));
    if (doublon) manque.push('ref');
    if (manque.length) {
      manque.forEach((k) => form[k].closest('.champ').classList.add('erreur'));
      form[manque[0]].focus();
      toast(doublon ? `La référence ${esc(d.ref)} existe déjà (${esc(doublon.nom)}).` : 'Nom, référence et prix HT sont obligatoires.', 'erreur');
      return;
    }
    Object.assign(p, {
      nom: d.nom.trim(), ref: d.ref.trim().toUpperCase(), marque: d.marque.trim(), famille: d.famille, sous: d.sous,
      prixHT: S.arrondi(parseFloat(d.prixHT)), prixBarreHT: parseFloat(d.prixBarreHT) > parseFloat(d.prixHT) ? S.arrondi(parseFloat(d.prixBarreHT)) : null,
      prixRevendeur: parseFloat(d.prixRevendeur) > 0 ? S.arrondi(parseFloat(d.prixRevendeur)) : undefined,
      colisage: parseInt(d.colisage, 10) > 0 ? parseInt(d.colisage, 10) : undefined, palette: parseInt(d.palette, 10) > 0 ? parseInt(d.palette, 10) : undefined,
      arrivage: d.arrivage || undefined,
      stock: Math.max(0, parseInt(d.stock, 10) || 0), delai: d.delai.trim() || '1 à 3 jours ouvrés',
      etat: d.etat, defaut: d.etat === 'second-choix' ? d.defaut.trim() : undefined, nouveau: !!d.nouveau, enLigne: !!d.enLigne,
      points: d.points.split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
      texte: d.texte.split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
      specs: depuisTexteSpecs(d.specs),
    });
    if (nouveau) p.id = S.nouvelId(p.ref || p.nom);
    if (!S.enregistrerProduit(p)) { toast('Enregistrement impossible : stockage du navigateur plein (photos trop lourdes ?).', 'erreur', 6000); return; }
    toast(`${ic('check')} Produit enregistré — visible dans la boutique <a href="../#/p/${p.id}" target="_blank" rel="noopener">Voir</a>`, 'ok', 4500);
    if (nouveau) location.hash = `#/produits/${p.id}`; else vueEditeur(p.id);
  });
}
function reduire(fichier, max = 800) {
  return new Promise((ok, ko) => {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let d = c.toDataURL('image/webp', 0.82);
      if (!d.startsWith('data:image/webp')) d = c.toDataURL('image/jpeg', 0.82);
      ok(d);
    };
    img.onerror = () => { URL.revokeObjectURL(url); ko(new Error('image')); };
    img.src = url;
  });
}

/* ---------- Catégories ---------- */
function vueCategories() {
  const fams = S.copie(S.familles());
  const nb = (f, s) => S.tousProduits().filter((p) => p.famille === f && (!s || p.sous === s)).length;
  const rendreFams = () => {
    $('#fams').innerHTML = fams.map((f, i) => `<div class="fam-edit">
      <div class="fam-edit-tete"><input class="saisie" data-fam-nom="${i}" value="${esc(f.nom)}" aria-label="Nom de la famille"><span class="table-actions">
        <button class="btn-icone" type="button" data-monter="${i}" aria-label="Monter" ${i === 0 ? 'disabled' : ''}>${ic('left')}</button>
        <button class="btn-icone" type="button" data-descendre="${i}" aria-label="Descendre" ${i === fams.length - 1 ? 'disabled' : ''}>${ic('right')}</button></span></div>
      <label class="champ"><span>Description (en-tête de la catégorie)</span><textarea data-fam-desc="${i}" rows="2">${esc(f.description || '')}</textarea></label>
      <div class="sous-edit">${f.sous.map((s, j) => `<div><input class="saisie" data-sous-nom="${i}.${j}" value="${esc(s.nom)}" aria-label="Nom de la sous-catégorie"><small>${nb(f.slug, s.slug)} produits</small><button class="btn-icone" type="button" data-sous-x="${i}.${j}" aria-label="Supprimer" ${nb(f.slug, s.slug) ? 'disabled title="Déplacez d\'abord ses produits"' : ''}>${ic('trash')}</button></div>`).join('')}
        <button class="btn btn-petit" type="button" data-sous-plus="${i}" style="justify-self:start">${ic('plus')}Sous-catégorie</button></div>
      <p class="petit muet">${nb(f.slug)} produits · adresse : #/c/${esc(f.slug)}</p>
    </div>`).join('');
  };
  cadre('categories', 'Catégories', `
    <div class="info-bulle" style="display:flex;gap:10px;padding:12px 14px;border-radius:10px;background:var(--bleu-c);font-size:13.5px">${ic('info')}<span>Renommez, réordonnez, ajoutez des sous-catégories : le menu de la boutique suit dès l'enregistrement. Une sous-catégorie ne se supprime que vide.</span></div>
    <div class="grille-fams" id="fams"></div>`, `<button class="btn btn-plein btn-petit" type="button" data-enregistrer-cats>${ic('check')}Enregistrer</button>`);
  rendreFams();
  const c = $('#contenu');
  c.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.famNom) fams[+t.dataset.famNom].nom = t.value;
    if (t.dataset.famDesc) fams[+t.dataset.famDesc].description = t.value;
    if (t.dataset.sousNom) { const [i, j] = t.dataset.sousNom.split('.').map(Number); fams[i].sous[j].nom = t.value; }
  });
  c.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.monter) { const i = +b.dataset.monter; [fams[i - 1], fams[i]] = [fams[i], fams[i - 1]]; rendreFams(); }
    if (b.dataset.descendre) { const i = +b.dataset.descendre; [fams[i + 1], fams[i]] = [fams[i], fams[i + 1]]; rendreFams(); }
    if (b.dataset.sousX) { const [i, j] = b.dataset.sousX.split('.').map(Number); fams[i].sous.splice(j, 1); rendreFams(); }
    if (b.dataset.sousPlus) {
      const r = await modale({ titre: 'Nouvelle sous-catégorie', corps: '<label class="champ"><span>Nom</span><input name="nom" placeholder="Cellules de refroidissement"></label>', actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Ajouter', classe: 'btn-plein' }] });
      if (r.action !== 'ok' || !r.donnees.nom?.trim()) return;
      const i = +b.dataset.sousPlus;
      let s = S.slug(r.donnees.nom);
      while (fams.some((f) => f.sous.some((x) => x.slug === s))) s += '-2';
      fams[i].sous.push({ slug: s, nom: r.donnees.nom.trim(), image: '' });
      rendreFams();
    }
  });
  $('[data-enregistrer-cats]').addEventListener('click', () => {
    if (fams.some((f) => !f.nom.trim() || f.sous.some((s) => !s.nom.trim()))) { toast('Chaque famille et sous-catégorie doit avoir un nom.', 'erreur'); return; }
    S.enregistrerFamilles(fams);
    toast(`${ic('check')} Catégories enregistrées — le menu de la boutique est à jour`);
  });
}

/* ---------- Clients pros ---------- */
function vueClients(params) {
  const f = params.get('f') || 'tout';
  const tous = S.clients();
  const liste = tous.filter((c) => f === 'tout' || c.statut === f);
  const cmd = S.commandes();
  cadre('clients', 'Revendeurs', `
    <div class="onglets">${[['tout', 'Tous'], ['en-attente', 'À valider'], ['valide', 'Validés'], ['refuse', 'Refusés']].map(([k, t]) => `<a href="#/clients?f=${k}" ${k === f ? 'aria-current="page"' : ''}>${t} <b>${k === 'tout' ? tous.length : tous.filter((c) => c.statut === k).length}</b></a>`).join('')}</div>
    <section class="panneau"><div class="table-scroll"><table class="table-admin"><thead><tr><th>Société</th><th>SIRET · TVA</th><th>Activité</th><th class="num">Achats 12 mois</th><th>Niveau · paiement</th><th>Statut</th><th></th></tr></thead><tbody>
    ${liste.map((c) => { const achats = S.volumeAnnuel(c.id); return `<tr>
      <td class="nom"><strong>${esc(c.societe)}</strong><small>${esc(c.contact || '')} · ${esc(c.email || '')}${c.exemple ? ' · exemple' : ''}</small></td>
      <td><small>${esc(c.siret || '—')}<br>${esc(c.tva || '—')}</small></td>
      <td>${esc(c.activite || '—')}<br><small class="muet">${esc(c.ville || '')}${c.volume ? ' · ' + esc(c.volume) : ''}</small></td>
      <td class="num">${eur(achats)}</td>
      <td><small><strong>${esc(S.niveau(c).nom)}</strong>${S.niveau(c).remise ? ` (−${S.niveau(c).remise} %)` : ''}<br>${esc({ comptant: 'Comptant', '30j': '30 jours fin de mois', '45j': 'LCR 45 jours' }[c.conditions] || 'Comptant')}</small></td>
      <td><span class="pastille ${c.statut === 'valide' ? 'p-vert' : c.statut === 'refuse' ? 'p-rouge' : 'p-jaune'}">${{ valide: 'Validé', refuse: 'Refusé', 'en-attente': 'À valider' }[c.statut]}</span></td>
      <td><div class="table-actions">${c.statut === 'en-attente' ? `<button class="btn btn-plein btn-petit" type="button" data-valider="${c.id}">Valider</button>` : ''}<button class="btn-icone" type="button" data-editer-client="${c.id}" aria-label="Modifier">${ic('edit')}</button></div></td>
    </tr>`; }).join('') || '<tr><td colspan="7" class="muet">Aucun client.</td></tr>'}
    </tbody></table></div></section>`);
  const editer = async (id, valider = false) => {
    const c = S.client(id);
    const r = await modale({
      titre: `${valider ? 'Valider' : 'Modifier'} — ${esc(c.societe)}`,
      corps: `<p class="petit muet">SIRET ${esc(c.siret)} ${S.siretValide(c.siret) ? '<span class="pastille p-vert">clé valide</span>' : '<span class="pastille p-rouge">clé invalide</span>'} · TVA ${esc(c.tva || '—')}</p>
        <div class="grille-champs">
          <label class="champ"><span>Statut</span><select name="statut">${[['valide', 'Validé'], ['en-attente', 'À valider'], ['refuse', 'Refusé']].map(([k, t]) => `<option value="${k}" ${(valider ? 'valide' : c.statut) === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
          <label class="champ"><span>Paiement</span><select name="conditions">${[['comptant', 'Comptant (virement, carte)'], ['30j', '30 jours fin de mois'], ['45j', 'LCR 45 jours fin de mois']].map(([k, t]) => `<option value="${k}" ${c.conditions === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
          <label class="champ"><span>Niveau revendeur</span><select name="niveau">${S.NIVEAUX.map((n) => `<option value="${n.id}" ${S.niveau(c).id === n.id ? 'selected' : ''}>${n.nom}${n.remise ? ` (−${n.remise} %)` : ''}</option>`).join('')}</select></label>
        </div>
        <p class="petit muet">${esc(c.activite || '')}${c.volume ? ' · volume annoncé : ' + esc(c.volume) : ''}${c.site ? ' · ' + esc(c.site) : ''}${c.kbis ? ' · Kbis : ' + esc(c.kbis) : ''}</p>
        <p class="petit muet">Achats sur 12 mois : ${eur(S.volumeAnnuel(c.id))} HT. La remise de niveau s'ajoute au prix revendeur et aux paliers, sur tout le catalogue.</p>`,
      actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Enregistrer', classe: 'btn-plein' }],
    });
    if (r.action !== 'ok') return;
    S.majClient(id, { statut: r.donnees.statut, conditions: r.donnees.conditions, niveau: r.donnees.niveau });
    toast(`${ic('check')} ${esc(c.societe)} : ${r.donnees.statut === 'valide' ? 'compte validé' : 'mis à jour'}`);
    router();
  };
  $$('[data-valider]').forEach((b) => b.addEventListener('click', () => editer(b.dataset.valider, true)));
  $$('[data-editer-client]').forEach((b) => b.addEventListener('click', () => editer(b.dataset.editerClient)));
}

/* ---------- Devis ---------- */
const NOMS_DEVIS = { demande: 'Nouveau', envoye: 'Envoyé', converti: 'Commandé' };
function vueDevis() {
  const liste = S.devis();
  cadre('devis', 'Devis', `<section class="panneau"><div class="table-scroll"><table class="table-admin"><thead><tr><th>Devis</th><th>Client</th><th>Validité</th><th class="num">Total HT</th><th>Statut</th></tr></thead><tbody>
    ${liste.map((d) => `<tr data-lien="#/devis/${d.num}" style="cursor:pointer"><td class="nom"><a href="#/devis/${d.num}">${esc(d.num)}</a><small>${heure(d.date)}</small></td><td class="nom">${esc(d.client.societe)}<small>${esc(d.client.email || '')}</small></td><td>${dateCourte(d.validite)}</td><td class="num"><strong>${eur(d.totaux.ht)}</strong></td><td><span class="pastille ${d.statut === 'demande' ? 'p-jaune' : d.statut === 'converti' ? 'p-vert' : 'p-bleu'}">${NOMS_DEVIS[d.statut] || d.statut}</span></td></tr>`).join('') || '<tr><td colspan="5" class="muet">Aucun devis.</td></tr>'}
  </tbody></table></div></section>`);
  $$('[data-lien]').forEach((tr) => tr.addEventListener('click', (e) => { if (!e.target.closest('a')) location.hash = tr.dataset.lien; }));
}
function vueUnDevis(num) {
  const liste = S.devis();
  const d = liste.find((x) => x.num === num);
  if (!d) return introuvable('Devis');
  const html = documentCommercial('devis', d);
  cadre('devis', `Devis ${esc(d.num)}`, `
    <section class="panneau"><div class="panneau-tete"><div><h2>${esc(d.client.societe)} · ${eur(d.totaux.ht)} HT</h2><p class="muet petit">Reçu le ${heure(d.date)}</p></div><span class="pastille ${d.statut === 'demande' ? 'p-jaune' : d.statut === 'converti' ? 'p-vert' : 'p-bleu'}">${NOMS_DEVIS[d.statut]}</span></div>
      ${d.message ? `<p><strong>Message :</strong> ${esc(d.message)}</p>` : ''}
      <div class="actions-statut">
        ${d.statut === 'demande' ? `<button class="btn btn-plein" type="button" data-envoye>${ic('check')}Marquer envoyé au client</button>` : ''}
        ${d.statut !== 'converti' ? `<button class="btn" type="button" data-convertir>${ic('box')}Transformer en commande</button>` : ''}
        <button class="btn" type="button" data-imprimer>${ic('print')}Imprimer / PDF</button>
      </div></section>
    ${html}`, `<a class="btn btn-petit" href="#/devis">${ic('left')}Devis</a>`);
  $('[data-imprimer]').addEventListener('click', () => imprimer(html));
  $('[data-envoye]')?.addEventListener('click', () => { d.statut = 'envoye'; S.enregistrerDevis(liste); toast('Devis marqué envoyé'); vueUnDevis(num); });
  $('[data-convertir]')?.addEventListener('click', async () => {
    const r = await modale({ titre: 'Transformer en commande', corps: `<label class="champ"><span>Paiement</span><select name="paiement">${Object.entries(S.PAIEMENTS).map(([k, t]) => `<option value="${k}">${t}</option>`).join('')}</select></label><label class="champ"><span>Livraison</span><select name="mode">${Object.entries(S.LIVRAISONS).map(([k, t]) => `<option value="${k}">${t}</option>`).join('')}</select></label>`, actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Créer la commande', classe: 'btn-plein' }] });
    if (r.action !== 'ok') return;
    const cli = d.client.id ? S.client(d.client.id) : null;
    const lignes = d.lignes.filter((l) => S.produit(l.id)).map((l) => ({ id: l.id, qte: l.qte }));
    const cmd = S.passerCommande({ client: d.client, livraison: { mode: r.donnees.mode, adresse: cli?.adresse || '', cp: cli?.cp || '', ville: cli?.ville || '', pays: cli?.pays || 'France' }, paiement: r.donnees.paiement, note: `Issue du devis ${d.num}`, lignes });
    const l2 = S.devis();
    const d2 = l2.find((x) => x.num === num);
    d2.statut = 'converti';
    S.enregistrerDevis(l2);
    toast(`${ic('check')} Commande ${cmd.num} créée`);
    location.hash = `#/commandes/${cmd.num}`;
  });
}

/* ---------- Réglages ---------- */
function vueReglages() {
  const r = S.reglages();
  cadre('reglages', 'Réglages', `
    <form class="panneau section-form" id="form-reglages" style="max-width:820px">
      <h2>Prix revendeur et volume</h2>
      <div class="grille-champs">
        <label class="champ"><span>Remise revendeur sur le PPC (%)</span><input name="remiseRevendeur" type="number" min="0" max="80" step="0.5" value="${r.remiseRevendeur}"></label>
        <label class="champ"><span>Remise dès 3 lots (%)</span><input name="remise3lots" type="number" min="0" max="50" step="0.5" value="${r.remise3lots}"></label>
        <label class="champ"><span>Remise à la palette (%)</span><input name="remisePalette" type="number" min="0" max="50" step="0.5" value="${r.remisePalette}"></label>
        <label class="champ"><span>Minimum de commande (€ HT)</span><input name="minimumCommande" type="number" min="0" step="50" value="${r.minimumCommande}"></label>
      </div>
      <h2>Livraison</h2>
      <div class="grille-champs">
        <label class="champ"><span>Franco de port (€ HT)</span><input name="francoPalette" type="number" min="0" step="50" value="${r.francoPalette}"></label>
        <label class="champ"><span>Port sous le franco (€ HT)</span><input name="fraisPort" type="number" min="0" step="1" value="${r.fraisPort}"></label>
        <label class="champ"><span>Supplément hayon + RDV (€ HT)</span><input name="hayon" type="number" min="0" step="1" value="${r.hayon}"></label>
        <label class="champ"><span>Supplément livraison directe (€ HT)</span><input name="fraisDirect" type="number" min="0" step="1" value="${r.fraisDirect}"></label>
        <label class="champ"><span>TVA (%)</span><input name="tva" type="number" min="0" step="0.1" value="${r.tva}"></label>
      </div>
      <p class="petit muet">Niveaux revendeurs : ${S.NIVEAUX.map((n) => `${n.nom} ${n.remise ? `−${n.remise} %` : ''}${n.seuil ? ` dès ${nombre(n.seuil)} €` : ''}`).join(' · ')} (achats sur 12 mois).</p>
      <h2>Boutique</h2>
      <label class="champ"><span>Bandeau en haut de page</span><input name="bandeau" value="${esc(r.bandeau)}"></label>
      <div class="grille-champs">
        <label class="champ"><span>Validité des devis (jours)</span><input name="validiteDevis" type="number" min="1" value="${r.validiteDevis}"></label>
        <label class="champ"><span>E-mail de contact</span><input name="email" type="email" value="${esc(r.email)}"></label>
      </div>
      <div class="outils"><button class="btn btn-plein" type="submit">${ic('check')}Enregistrer les réglages</button></div>
    </form>
    <section class="panneau" style="max-width:820px">
      <h2>Données de la démo</h2>
      <p class="muet">Remet le catalogue relevé, les clients, commandes et devis d'exemple et vide le panier — dans ce navigateur seulement.</p>
      <div class="outils"><button class="btn btn-danger" type="button" data-reinit>${ic('repeat')}Réinitialiser la démo</button></div>
    </section>`);
  $('#form-reglages').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const n = (k) => Math.max(0, +d[k] || 0);
    S.enregistrerReglages({ ...S.reglages(), remiseRevendeur: n('remiseRevendeur'), remise3lots: n('remise3lots'), remisePalette: n('remisePalette'), minimumCommande: n('minimumCommande'), francoPalette: n('francoPalette'), fraisPort: n('fraisPort'), hayon: n('hayon'), fraisDirect: n('fraisDirect'), tva: n('tva'), bandeau: d.bandeau.trim(), validiteDevis: +d.validiteDevis || 30, email: d.email.trim() });
    toast(`${ic('check')} Réglages enregistrés — la boutique est à jour`);
  });
  $('[data-reinit]').addEventListener('click', async () => {
    const r2 = await modale({ titre: 'Réinitialiser la démo ?', corps: '<p>Vos produits ajoutés ou modifiés, commandes et comptes créés dans ce navigateur seront effacés.</p>', actions: [{ id: 'annuler', libelle: 'Annuler' }, { id: 'ok', libelle: 'Réinitialiser', classe: 'btn-sombre' }] });
    if (r2.action !== 'ok') return;
    S.reinitialiser();
    try { sessionStorage.setItem('stx-admin', '1'); } catch { /* rien */ }
    toast('Démo réinitialisée');
    location.hash = '#/';
    router();
  });
}

function introuvable(quoi) {
  cadre('', `${quoi} introuvable`, `<section class="panneau"><p>${quoi} introuvable : supprimé ou lien erroné.</p><a class="btn" href="#/">Retour au tableau de bord</a></section>`);
}
function imprimer(html) {
  $('#zone-impression').innerHTML = html;
  window.print();
}

/* ---------- Routeur ---------- */
function router() {
  if (!entre()) return ecranEntree();
  const [chemin, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(qs || '');
  const [a, b] = chemin.split('/').map((x) => x && decodeURIComponent(x));
  const y = window.scrollY;
  if (!a) vueTableau();
  else if (a === 'commandes') b ? vueCommande(b) : vueCommandes(params);
  else if (a === 'produits') b ? vueEditeur(b) : vueProduits(params);
  else if (a === 'categories') vueCategories();
  else if (a === 'clients') vueClients(params);
  else if (a === 'devis') b ? vueUnDevis(b) : vueDevis();
  else if (a === 'reglages') vueReglages();
  else introuvable('Page');
  if (router.precedent !== chemin) window.scrollTo(0, 0); else window.scrollTo(0, y);
  router.precedent = chemin;
}
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-burger], [data-sortir]');
  if (t?.hasAttribute('data-burger')) { $('#lateral').classList.toggle('ouvert'); return; }
  if (t?.hasAttribute('data-sortir')) { e.preventDefault(); try { sessionStorage.removeItem('stx-admin'); } catch { /* rien */ } ecranEntree(); return; }
  if (!e.target.closest('#lateral') && $('#lateral')?.classList.contains('ouvert')) $('#lateral').classList.remove('ouvert');
});
/* Une commande passée dans la boutique (autre onglet) apparaît sans recharger. */
S.ecouter((cle, externe) => {
  if (!externe || !entre()) return;
  if (document.querySelector('dialog[open]') || $('#editeur') || $('#form-reglages') || $('#fams')) return;
  router();
  if (cle === 'commandes') toast(`${ic('box')} Nouvelle activité sur les commandes`);
});

function demarrer() {
  window.removeEventListener('hashchange', router);
  window.addEventListener('hashchange', router);
  router();
}
demarrer();
