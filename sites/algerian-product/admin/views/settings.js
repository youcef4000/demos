// Réglages : coordonnées, réseaux sociaux, mot de passe, sauvegarde et remise à zéro de la démo.
import { readInbox, writeInbox, readEvents, clearEvents, resetContent, usageKB, loadDefault } from '../../store.js';
import { S, ml, field, bind, toast, confirmDo } from '../ui.js';

export default function settings(el, app) {
  const D = S.draft;
  el.innerHTML = `<div class="cards2">
    <section class="card"><header><h3>Coordonnées affichées sur le site</h3></header><div class="fgrid">
      ${field('contact.email', 'E-mail de contact', { type: 'email' })}
      ${field('contact.whatsapp', 'Numéro WhatsApp', { type: 'tel', help: 'Format international, ex. 1514… ou 213… — le bouton WhatsApp apparaît dès qu’un numéro est saisi.' })}
      ${field('contact.phone', 'Téléphone', { type: 'tel' })}
      ${ml('contact.office', 'Bureaux')}
      ${field('contact.notifyEmail', 'Recevoir les demandes sur', { type: 'email', help: 'En production, chaque demande déclenche un e-mail à cette adresse.' })}
    </div></section>
    <section class="card"><header><h3>Réseaux sociaux</h3><p>Une icône apparaît dans le pied de page pour chaque lien.</p></header><div class="fgrid">
      ${['linkedin', 'instagram', 'facebook', 'tiktok', 'youtube'].map((k) => field(`contact.socials.${k}`, k[0].toUpperCase() + k.slice(1), { type: 'url', attrs: `placeholder="https://www.${k}.com/…"` })).join('')}
    </div></section>
    <section class="card"><header><h3>Accès</h3></header><div class="fgrid">
      <label class="f"><span>Nouveau mot de passe</span><input type="password" id="pw1" autocomplete="new-password"></label>
      <div class="f"><button class="b b--primary" type="button" id="pw-save">Changer le mot de passe</button><small>Démo : protège seulement ce navigateur. En production : comptes nominatifs et double authentification.</small></div>
    </div></section>
    <section class="card"><header><h3>Sauvegarde</h3><p>Stockage utilisé dans ce navigateur : ${usageKB()} Ko.</p></header>
      <div class="dactions">
        <button class="b b--ghost" type="button" id="exp">Télécharger une sauvegarde</button>
        <label class="b b--ghost upload-btn">Restaurer une sauvegarde<input type="file" accept="application/json" id="imp" hidden></label>
      </div>
      <h4 class="ftitle">Remise à zéro de la démo</h4>
      <div class="dactions">
        <button class="b b--danger" type="button" id="rst-content">Contenu d’origine</button>
        <button class="b b--danger" type="button" id="rst-stats">Effacer les statistiques réelles (${readEvents().length})</button>
        <button class="b b--danger" type="button" id="rst-inbox">Vider les demandes</button>
      </div></section>
  </div>`;
  bind(el);
  el.querySelector('#pw-save').addEventListener('click', () => {
    const v = el.querySelector('#pw1').value;
    if (v.length < 6) return toast('6 caractères minimum.', 'err');
    try {
      localStorage.setItem('ap:admin:pw', v);
    } catch {}
    toast('Mot de passe changé.', 'ok');
  });
  el.querySelector('#exp').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ app: 'algerian-product', at: new Date().toISOString(), content: D, inbox: readInbox() }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `algerian-product-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  });
  el.querySelector('#imp').addEventListener('change', async (e) => {
    try {
      const data = JSON.parse(await e.target.files[0].text());
      if (data.app !== 'algerian-product' || !data.content?.products) throw new Error();
      S.draft = data.content;
      if (Array.isArray(data.inbox)) writeInbox(data.inbox);
      S.onChange();
      app.renderLangSwitch();
      toast('Sauvegarde restaurée (pensez à publier).', 'ok');
      app.refresh();
    } catch {
      toast('Fichier de sauvegarde invalide.', 'err');
    }
  });
  el.querySelector('#rst-content').addEventListener('click', async () => {
    if (!confirmDo('Revenir au contenu d’origine ? Vos modifications (non sauvegardées) seront perdues.')) return;
    resetContent();
    S.draft = await loadDefault('../');
    S.dirty = false;
    app.renderLangSwitch();
    toast('Contenu d’origine rétabli.', 'ok');
    app.refresh();
  });
  el.querySelector('#rst-stats').addEventListener('click', () => {
    if (!confirmDo('Effacer les statistiques enregistrées dans ce navigateur ?')) return;
    clearEvents();
    toast('Statistiques effacées.');
    app.refresh();
  });
  el.querySelector('#rst-inbox').addEventListener('click', () => {
    if (!confirmDo('Supprimer toutes les demandes reçues ?')) return;
    writeInbox([]);
    toast('Demandes supprimées.');
    app.refresh();
  });
}
