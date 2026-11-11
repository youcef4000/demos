// Outil du propriétaire : crée les liens d'activation signés avec la clé privée.
// La clé privée ne quitte jamais l'appareil ; l'application ne contient que la clé publique (js/config.js).

import { CONFIG } from './config.js';

const CLE_STOCKEE = 'benna.admin.cle';
const JOURNAL = 'benna.admin.journal';
const $ = (id) => document.getElementById(id);
let cle = null; // CryptoKey de signature
let plan = 'plus';
let duree = 12;

const vers64 = (octets) => btoa(String.fromCharCode(...new Uint8Array(octets))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function dire(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('vu');
  setTimeout(() => el.classList.remove('vu'), 2600);
}

async function chargerCle(jwk, retenir) {
  try {
    cle = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  } catch {
    cle = null;
    dire('Ce fichier n’est pas une clé privée Benna.');
    return;
  }
  const memePaire = jwk.x === CONFIG.cleLicence?.x && jwk.y === CONFIG.cleLicence?.y;
  $('etat-cle').textContent = memePaire ? 'Clé chargée : elle correspond à l’application.' : 'Clé chargée, mais elle ne correspond pas à la clé publique de l’application : les liens seraient refusés.';
  if (retenir) localStorage.setItem(CLE_STOCKEE, JSON.stringify(jwk));
}

// Jeton : « B1.<contenu>.<signature> », contenu = { p: formule, x: date de fin, n: nom }.
async function creerJeton(contenu) {
  const texte = vers64(new TextEncoder().encode(JSON.stringify(contenu)));
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, cle, new TextEncoder().encode(texte));
  return `B1.${texte}.${vers64(signature)}`;
}

function dateFin() {
  const d = new Date();
  if (duree === 0) d.setDate(d.getDate() + 15);
  else d.setMonth(d.getMonth() + duree);
  return d.toISOString().slice(0, 10);
}

function afficherJournal() {
  const lignes = JSON.parse(localStorage.getItem(JOURNAL) || '[]');
  $('journal-vide').hidden = lignes.length > 0;
  $('journal').innerHTML = '';
  for (const l of lignes) {
    const li = document.createElement('li');
    const bloc = document.createElement('span');
    const nom = document.createElement('strong');
    nom.textContent = l.nom || 'Sans nom';
    const detail = document.createElement('small');
    detail.textContent = `${l.plan === 'pro' ? 'Benna Pro' : 'Benna+'} · créé le ${l.cree} · valable jusqu’au ${l.fin}`;
    bloc.style.display = 'grid';
    bloc.append(nom, detail);
    li.append(bloc);
    $('journal').append(li);
  }
}

function segment(id, choisir) {
  $(id).addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    $(id).querySelectorAll('button').forEach((x) => x.classList.toggle('actif', x === b));
    choisir(b.dataset.v);
  });
}

segment('plan', (v) => { plan = v; });
segment('duree', (v) => { duree = Number(v); });

$('fichier-cle').addEventListener('change', async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  try {
    const contenu = JSON.parse(await f.text());
    await chargerCle(contenu.jwk || contenu, $('retenir').checked);
  } catch {
    dire('Fichier illisible.');
  }
});

$('retenir').addEventListener('change', (e) => {
  if (!e.target.checked) localStorage.removeItem(CLE_STOCKEE);
});

$('creer').addEventListener('click', async () => {
  if (!cle) {
    dire('Chargez d’abord votre clé privée.');
    return;
  }
  const nom = $('nom').value.trim();
  const fin = dateFin();
  const jeton = await creerJeton({ p: plan, x: fin, n: nom });
  const lien = `${new URL('./', location.href).href}#/activer/${jeton}`;
  $('lien').value = lien;
  $('envoyer').href = `https://wa.me/?text=${encodeURIComponent(`Merci pour votre abonnement ${plan === 'pro' ? 'Benna Pro' : 'Benna+'}.\nTouchez ce lien pour l’activer :\n${lien}`)}`;
  $('resultat').hidden = false;
  const lignes = JSON.parse(localStorage.getItem(JOURNAL) || '[]');
  lignes.unshift({ nom, plan, fin, cree: new Date().toISOString().slice(0, 10) });
  localStorage.setItem(JOURNAL, JSON.stringify(lignes.slice(0, 500)));
  afficherJournal();
  $('resultat').scrollIntoView({ behavior: 'smooth' });
});

$('copier').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('lien').value);
    dire('Lien copié.');
  } catch {
    $('lien').select();
    dire('Sélectionné : copiez-le à la main.');
  }
});

$('nouvelle-cle').addEventListener('click', async () => {
  if (!window.confirm('Créer une nouvelle clé ? Les liens déjà envoyés ne fonctionneront plus une fois la nouvelle clé publique installée.')) return;
  const paire = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const privee = await crypto.subtle.exportKey('jwk', paire.privateKey);
  const publique = await crypto.subtle.exportKey('jwk', paire.publicKey);
  const fichier = new Blob([JSON.stringify({ usage: 'Clé privée Benna : sert à créer les liens d’activation. Ne jamais la publier.', creee: new Date().toISOString().slice(0, 10), jwk: privee }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(fichier);
  a.download = 'benna-cle-privee.json';
  a.click();
  $('ligne-config').value = `cleLicence: { kty: 'EC', crv: 'P-256', x: '${publique.x}', y: '${publique.y}' },`;
  $('cle-publique').hidden = false;
});

const stockee = localStorage.getItem(CLE_STOCKEE);
if (stockee) {
  $('retenir').checked = true;
  chargerCle(JSON.parse(stockee), false);
}
afficherJournal();
