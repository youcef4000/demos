// Espace client : ce que le cabinet attend ce mois-ci, la G50 à payer, le dernier résultat, les échéances.
import { h, monter, icone, da, dateFr, periodeFr, badge, dateBloc } from '../ui.js';

export default async function (el, ctx) {
  const a = await ctx.c.appel('GET', '/client/accueil');
  const manquantes = a.attendues.filter((x) => x.manquante);
  monter(
    el,
    h`<p class="sous-titre">Bonjour ${ctx.u.nom.split(' ')[0]}. Voici l'état de votre dossier ${a.dossier.raisonSociale}.</p>
    <div class="kpis">
      <a class="kpi ${manquantes.length ? '' : 'accent'}" href="#/deposer"><small>Pièces de ${periodeFr(a.periode)}</small><b>${a.pieces.deposees}</b><span>${manquantes.length ? `${manquantes.length} type(s) encore attendu(s)` : 'Tout est reçu, merci'}</span></a>
      <a class="kpi ${a.g50 && a.g50.statut !== 'deposee' ? 'accent' : ''}" href="#/g50"><small>G50 ${a.g50 ? periodeFr(a.g50.periode) : ''}</small><b>${a.g50 ? da(a.g50.calcul.total) : '—'}</b><span>${a.g50 ? (a.g50.statut === 'deposee' ? 'Déposée' : `À payer avant le ${dateFr(a.g50.calcul.dateLimite)}`) : 'En préparation par le cabinet'}</span></a>
      <a class="kpi" href="#/resultats"><small>Résultat ${a.resultat ? periodeFr(a.resultat.periode) : ''}</small><b>${a.resultat ? da(a.resultat.resultat) : '—'}</b><span>${a.resultat ? `Chiffre d'affaires ${da(a.resultat.groupes.ventes)}` : 'Pas encore publié'}</span></a>
      <a class="kpi" href="#/messages"><small>Messages du cabinet</small><b>${a.nonLus}</b><span>non lu(s)</span></a>
    </div>
    <div class="grille grille-2">
      <section class="carte">
        <div class="carte-tete"><h2>À envoyer pour ${periodeFr(a.periode)}</h2><span class="actions"><a class="btn btn-primaire" href="#/deposer">${icone('photo')} Déposer</a></span></div>
        <p class="petit muet">Avant le ${dateFr(a.dateLimite)} pour que le cabinet prépare votre G50 à temps.</p>
        <ul class="liste">${a.attendues.map((x) => h`<li><span class="badge ${x.recues ? 'ok' : x.neant ? '' : 'erreur'}">${x.recues ? `${x.recues} reçue(s)` : x.neant ? 'Néant' : 'À envoyer'}</span><div class="corps">${x.libelle}</div></li>`)}</ul>
      </section>
      <section class="carte">
        <h2>Prochaines échéances</h2>
        <ul class="liste">${a.echeances.length ? a.echeances.map((e) => h`<li>${dateBloc(e.date)}<div class="corps"><b>${e.libelle.split(' : ')[0].split(' (')[0]}</b><span>${e.organisme}${e.montant != null ? ` · ${da(e.montant)}` : ''}</span></div>${badge('echeance', e.statut)}</li>`) : h`<li class="muet">Aucune échéance proche.</li>`}</ul>
        <p class="tres-petit muet">Le cabinet suit vos échéances fiscales et sociales et vous prévient du montant à payer.</p>
      </section>
    </div>
    <section class="carte"><h2>Votre cabinet</h2><p class="petit">${a.cabinet.nom} · ${a.cabinet.adresse} · ${a.cabinet.telephone} · ${a.cabinet.email}<br>${a.cabinet.horaires}</p></section>`,
  );
}
