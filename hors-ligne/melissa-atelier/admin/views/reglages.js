// Réglages : prénom affiché, jours et horaires d'ouverture (créneaux du site), équipe, sauvegarde.
import { S, $, esc, icon, head, commit, toast, ask, field, input, choice, select, fmtNum } from '../ui.js';
import { saveData, loadData, usageKB, readRequests } from '../../store.js';

const DAYS = [
  [6, 'Samedi'],
  [0, 'Dimanche'],
  [1, 'Lundi'],
  [2, 'Mardi'],
  [3, 'Mercredi'],
  [4, 'Jeudi'],
  [5, 'Vendredi'],
];

export function render(root) {
  const s = S.data.settings;
  root.innerHTML = `
    ${head({ kicker: 'Réglages', title: "L'atelier", sub: 'Ces réglages servent aussi au site : les créneaux de rendez-vous proposés en ligne suivent vos horaires.' })}
    <form class="settings" id="settings">
      <section class="panel panel--flat">
        <header class="panel__head"><h2>${icon('heart')}Vous</h2></header>
        <div class="fgrid">${field('Prénom affiché sur le tableau de bord', input('owner', s.owner))}</div>
      </section>
      <section class="panel panel--flat">
        <header class="panel__head"><h2>${icon('clock')}Horaires des rendez-vous</h2></header>
        <div class="fgrid">
          <div class="f f--wide" role="group" aria-label="Jours d'ouverture"><span class="f__label">Jours d'ouverture</span>${choice('days', DAYS, s.openDays, { multi: true })}</div>
          ${field('Ouverture', input('open', s.open, 'type="time" step="1800"'))}
          ${field('Fermeture', input('close', s.close, 'type="time" step="1800"'))}
          ${field('Durée d\'un créneau', select('slot', [[30, '30 min'], [45, '45 min'], [60, '1 h'], [90, '1 h 30']], s.slot))}
        </div>
      </section>
      <section class="panel panel--flat">
        <header class="panel__head"><h2>${icon('needle')}Équipe de l'atelier</h2></header>
        <ul class="team">${(s.team || []).map((t, i) => `<li><span>${esc(t)}</span><button type="button" class="b b--icon b--ghost b--xs" data-del="${i}" aria-label="Retirer ${esc(t)}">${icon('trash')}</button></li>`).join('')}</ul>
        <div class="team__add"><input id="team-new" placeholder="Prénom d'une couturière" aria-label="Ajouter une personne"><button type="button" class="b b--soft b--sm" data-add>${icon('plus')}<span>Ajouter</span></button></div>
      </section>
      <div class="settings__save"><button type="submit" class="b b--dark">Enregistrer les réglages</button></div>
    </form>
    <section class="panel panel--flat">
      <header class="panel__head"><h2>${icon('download')}Sauvegarde</h2></header>
      <p class="f__hint">Dans cette démo, tout est enregistré dans ce navigateur (${fmtNum(usageKB())} Ko utilisés). En production, les données vivent sur un serveur sécurisé et se synchronisent entre le téléphone et l'ordinateur.</p>
      <div class="row-btns">
        <button type="button" class="b b--ghost b--sm" data-export>${icon('download')}<span>Exporter (fichier)</span></button>
        <label class="b b--ghost b--sm">${icon('upload')}<span>Importer</span><input type="file" accept="application/json,.json" hidden data-import></label>
        <button type="button" class="b b--ghost b--sm b--danger" data-reset>Remettre les données d'exemple</button>
      </div>
    </section>
  `;

  const form = $('#settings', root);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const days = [...form.querySelectorAll('[name="days[]"]:checked')].map((i) => Number(i.value));
    if (!days.length) return toast('Choisissez au moins un jour d\'ouverture.', true);
    if (form.open.value >= form.close.value) return toast("L'heure de fermeture doit suivre l'ouverture.", true);
    Object.assign(s, { owner: form.owner.value.trim() || 'Melissa', openDays: days, open: form.open.value, close: form.close.value, slot: Number(form.slot.value) });
    commit('Réglages enregistrés');
  });
  root.addEventListener('click', async (e) => {
    const del = e.target.closest('[data-del]');
    if (del) {
      s.team.splice(Number(del.dataset.del), 1);
      return commit();
    }
    if (e.target.closest('[data-add]')) {
      const v = $('#team-new', root).value.trim();
      if (!v) return;
      s.team = [...(s.team || []), v];
      return commit(`${v} ajoutée à l'équipe`);
    }
    if (e.target.closest('[data-export]')) {
      const blob = new Blob([JSON.stringify({ ...S.data, demandes: readRequests() }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `melissa-atelier-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
  });
  $('#team-new', root).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('[data-add]', root).click();
    }
  });
  $('[data-import]', root).addEventListener('change', async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!d || !d.settings || !Array.isArray(d.rdv)) throw new Error('format');
      if (!(await ask("Remplacer toutes les données de l'atelier par ce fichier ?", 'Remplacer'))) return;
      delete d.demandes;
      S.data = { ...loadData(), ...d };
      saveData(S.data);
      commit('Données importées');
    } catch {
      toast("Ce fichier n'est pas une sauvegarde de l'atelier.", true);
    }
  });
}

