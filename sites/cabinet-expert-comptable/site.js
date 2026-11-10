// Site public : textes et coordonnées modifiables depuis l'espace du cabinet (Paramètres → Textes du site),
// formulaire de contact enregistré dans « Demandes du site ». Même accès aux données que l'application
// (démo dans le navigateur, ou serveur du cabinet).
import { client } from './app/js/api.js';

const remplir = (el, texte) => {
  if (texte != null && texte !== '') el.textContent = texte;
};

function listes(site) {
  for (const conteneur of document.querySelectorAll('[data-liste]')) {
    const elements = site[conteneur.dataset.liste];
    if (!Array.isArray(elements) || !elements.length) continue;
    const modele = conteneur.firstElementChild;
    const neufs = elements.map((x) => {
      const n = modele.cloneNode(true);
      n.querySelector('h3').textContent = x.titre;
      n.querySelector('p').textContent = x.texte;
      return n;
    });
    conteneur.replaceChildren(...neufs);
  }
}

function apparitions() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entrees) => {
    for (const e of entrees) if (e.isIntersecting) {
      e.target.classList.add('vu');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const el of document.querySelectorAll('.carte, .etapes li, .fiche')) {
    el.classList.add('apparait');
    io.observe(el);
  }
}

async function demarrer() {
  let c;
  try {
    c = await client();
    const { site, cabinet } = await c.appel('GET', '/public/site');
    for (const el of document.querySelectorAll('[data-site]')) remplir(el, site[el.dataset.site]);
    for (const el of document.querySelectorAll('[data-cabinet]')) remplir(el, cabinet[el.dataset.cabinet]);
    listes(site);
    if (cabinet.nom) document.title = `${cabinet.nom} — ${cabinet.activite || 'Expertise comptable'}`;
    if (c.mode !== 'demo') document.querySelector('.bandeau-demo')?.remove();
  } catch {
    // Textes par défaut déjà présents dans la page
  }
  apparitions();

  const f = document.getElementById('f-contact');
  const retour = document.getElementById('retour');
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    retour.className = 'retour';
    const d = Object.fromEntries(new FormData(f));
    if (!d.nom.trim() || !d.message.trim() || (!d.email.trim() && !d.telephone.trim())) {
      retour.textContent = 'Merci d’indiquer votre nom, votre message et un e-mail ou un téléphone.';
      retour.classList.add('erreur');
      return;
    }
    const b = f.querySelector('[type=submit]');
    b.disabled = true;
    try {
      await (c || (await client())).appel('POST', '/public/contact', d);
      f.reset();
      retour.textContent = 'Merci, votre demande est bien arrivée au cabinet. Nous vous rappelons rapidement.';
      retour.classList.add('ok');
    } catch (err) {
      retour.textContent = err.message || 'Envoi impossible pour le moment : appelez-nous directement.';
      retour.classList.add('erreur');
    } finally {
      b.disabled = false;
    }
  });
}

demarrer();
