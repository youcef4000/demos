// Pièces manquantes par dossier et préparation des relances (workflow W9, sans IA) : brouillons à valider.
import { h, brut, monter, icone, dateFr, periodeFr, sur, toast, badge } from '../ui.js';
import { encadreHumain } from './commun.js';

export default async function (el, ctx) {
  const r = await ctx.c.appel('GET', `/relances?periode=${ctx.periode}`);
  const incomplets = r.dossiers.filter((d) => d.manquantes.length);
  monter(
    el,
    h`<p class="sous-titre">Pièces attendues pour ${periodeFr(ctx.periode)} (liste modifiable dans Paramètres → Pièces à demander). G50 à déposer avant le ${dateFr(r.dateLimite)}.</p>
    <section class="carte">
      <div class="carte-tete"><h2>${incomplets.length} dossier(s) incomplet(s)</h2>
        <span class="actions ligne-actions">
          <select class="saisie" id="modele" aria-label="Modèle de relance" style="width:auto">${brut('<option value="">Modèle automatique (1er rappel puis 2e)</option>')}${r.modeles.map((m) => h`<option value="${m.id}">${m.nom}</option>`)}</select>
          <button class="btn btn-primaire" data-preparer ${incomplets.length ? '' : brut('disabled')}>${icone('cloche')} Préparer les relances</button>
        </span></div>
      <div class="table-defile"><table class="tableau empile"><thead><tr><th>Dossier</th><th>Pièces attendues</th><th>Dernière relance</th></tr></thead><tbody>
      ${r.dossiers.map((d) => h`<tr>
        <td class="titre" data-l="Dossier"><b>${d.raisonSociale}</b><span class="sous">${d.contact?.nom || ''} · ${d.contact?.email || 'pas d’e-mail'}</span></td>
        <td data-l="Pièces"><div class="pastilles">${d.attendues.map((a) => h`<span class="badge ${a.recues ? 'ok' : a.neant ? '' : 'erreur'}" title="${a.libelle}">${a.recues ? '✓' : a.neant ? 'néant' : '✗'} ${a.libelle.replace(/ du mois.*$/, '').replace(/\(.*\)/, '')}</span>`)}</div></td>
        <td data-l="Relance">${d.derniereRelance ? h`${badge('envoi', d.derniereRelance.statut)} <span class="petit muet">${d.derniereRelance.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'} · ${dateFr(d.derniereRelance.le)}</span>` : d.manquantes.length ? h`<span class="muet">Aucune</span>` : h`<span class="badge ok">Complet</span>`}${d.nbRelances ? h`<span class="sous">${d.nbRelances} envoyée(s)</span>` : ''}</td>
      </tr>`)}
      </tbody></table></div>
    </section>
    ${encadreHumain("Préparer les relances crée des brouillons dans la boîte d'envoi, à partir de vos modèles. Rien n'est envoyé au client avant votre validation. Le serveur en prépare aussi automatiquement les jours choisis (le 5 et le 12 du mois par défaut).")}`,
  );
  sur(el, 'click', '[data-preparer]', async () => {
    try {
      const res = await ctx.c.appel('POST', '/relances/preparer', { periode: ctx.periode, modeleId: el.querySelector('#modele').value || undefined });
      toast(res.preparees ? `${res.preparees} brouillon(s) de relance prêt(s) dans la boîte d'envoi.` : 'Aucun nouveau brouillon : relances déjà préparées ou dossiers complets.', res.preparees ? 'ok' : '');
      if (res.preparees) ctx.aller('envois');
      else ctx.rafraichir();
    } catch (err) {
      toast(err.message, 'erreur');
    }
  });
}
