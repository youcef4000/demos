// Vidéo de présentation des pages publiques (landing et /ia/) : la première chose qu'on voit.
// - Ordinateur : la vidéo démarre sans le son, en boucle, comme un aperçu ; le bouton la relance au début avec le son.
// - Téléphone, « économie de données » ou mouvement réduit : seulement l'image et le bouton (rien ne se télécharge avant le clic).
// - Pixel Meta : ViewContent « Vidéo de présentation » au premier lancement avec le son.
//
//   <figure class="pres" data-pres data-dur="2:44">
//     <div class="pres-box"><video class="pres-v" …><source …></video>
//       <button class="pres-play" type="button">…<b class="pres-t"></b><small class="pres-s"></small></button></div>
//   </figure>
import { lang } from './i18n.js';
import { trackView } from './suivi.js';

const T = {
  fr: { play: 'Regarde la présentation', sound: 'avec le son', label: 'Vidéo de présentation de Hooked Academy' },
  en: { play: 'Watch the introduction', sound: 'with sound', label: 'Hooked Academy introduction video' },
  ar: { play: 'شاهد التقديم', sound: 'مع الصوت', label: 'فيديو تقديم Hooked Academy' },
};

export function mountPresentation(root) {
  if (!root) return;
  const tx = T[lang] || T.fr;
  const video = root.querySelector('video');
  const play = root.querySelector('.pres-play');
  if (!video || !play) return;
  video.setAttribute('aria-label', tx.label);
  play.setAttribute('aria-label', tx.play);
  root.querySelector('.pres-t').textContent = tx.play;
  root.querySelector('.pres-s').textContent = `${root.dataset.dur || ''} · ${tx.sound}`.replace(/^ · /, '');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!navigator.connection?.saveData;
  const wide = matchMedia('(min-width: 900px)').matches;
  let preview = false;
  let full = false;

  // Aperçu sans le son (ordinateur seulement), en pause quand la vidéo sort de l'écran
  if (wide && !reduce && !saveData) {
    preview = true;
    video.muted = true;
    video.loop = true;
    video.preload = 'auto';
    new IntersectionObserver(([e]) => {
      if (full) return;
      if (e.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.25 }).observe(root);
  }

  play.addEventListener('click', () => {
    full = true;
    root.classList.add('is-on');
    video.loop = false;
    video.muted = false;
    video.controls = true;
    if (preview) video.currentTime = 0;
    video.play().catch(() => {
      // Lecture refusée (rare) : les contrôles restent pour lancer à la main
    });
    trackView('Vidéo de présentation');
  });
}
