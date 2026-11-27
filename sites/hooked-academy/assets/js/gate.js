// Écran vidéo d'arrivée des pages publiques (/ et /ia/) : à la première visite, la vidéo de présentation
// s'affiche par-dessus le site flouté. Le bouton « voir la formation » se débloque après GATE_SECONDS de
// lecture réelle (pause, chargement et coupure ne comptent pas ; le plein écran compte).
// Script classique (pas de module), chargé dans le <head> juste après le pixel : il marche aussi dans les
// navigateurs intégrés de Facebook et d'Instagram, et l'écran est en place avant que la page s'affiche.
//
// - ?gate=0 : jamais d'écran ; un visiteur qui a débloqué l'écran ne le revoit pas (localStorage).
// - À l'arrivée, une ancre dans l'adresse (#inscription, #formation-dev…) venue d'une publicité ne fait plus
//   descendre la page : ?plan= présélectionne seulement la formule du formulaire (assets/js/suivi.js).
// - Pixel Meta : VideoGatePlay (lancement), VideoGate50 (moitié de la vidéo), VideoGateUnlock (clic final).
(function () {
  'use strict';

  /* Réglages ---------------------------------------------------------------------------------- */
  // Vidéo de l'écran : changer seulement cette ligne (une vidéo verticale 9:16 s'affiche aussi bien)
  var GATE_VIDEO_SRC = '/video/presentation-960.mp4';
  var GATE_VIDEO_POSTER = '/assets/img/presentation.webp';
  var GATE_SECONDS = 45; // lecture réelle avant de débloquer le bouton
  var START_GUARD_MS = 10000; // la vidéo ne démarre pas, ou se bloque : bouton débloqué après 10 s
  var KEY = 'hooked-academy:gate';

  var TXT = {
    fr: {
      label: 'Présentation de Hooked Academy',
      play: '▶ Voir la vidéo (2 min)',
      fs: 'Plein écran',
      line: '3 formations · à partir de 20 000 DA · paiement à la livraison',
      wait: '⏳ {t}',
      waitL: 'Le bouton se débloque après {t} de vidéo',
      ok: '✅ J’ai compris, voir la formation',
    },
    en: {
      label: 'Hooked Academy introduction',
      play: '▶ Watch the video (2 min)',
      fs: 'Full screen',
      line: '3 courses · from 20,000 DA · cash on delivery',
      wait: '⏳ {t}',
      waitL: 'The button unlocks after {t} of video',
      ok: '✅ Got it, show me the course',
    },
    ar: {
      label: 'تقديم Hooked Academy',
      play: '▶ شوف الفيديو (دقيقتين)',
      fs: 'ملء الشاشة',
      line: '3 تكوينات · ابتداءً من 20 000 دج · الدفع عند الاستلام',
      wait: '⏳ {t}',
      waitL: 'يتفعّل الزر بعد {t} من الفيديو',
      ok: '✅ فهمت، نحب نشوف التكوين',
    },
  };

  /* Faut-il l'écran ? -------------------------------------------------------------------------- */
  var html = document.documentElement;
  var q;
  try {
    q = new URLSearchParams(location.search);
  } catch (e) {
    q = { get: function () { return null; } };
  }
  var seen = false;
  try {
    seen = localStorage.getItem(KEY) === '1';
  } catch (e) {}
  var fromAd = !!(q.get('plan') || q.get('utm_source') || q.get('utm_campaign') || q.get('fbclid'));
  var show = q.get('gate') !== '0' && !seen;

  // Ancre d'arrivée (lien de publicité, ou première visite) : on reste en haut de la page
  if (location.hash && (show || fromAd)) {
    try {
      history.replaceState(null, '', location.pathname + location.search);
    } catch (e) {}
  }
  if (!show) return;
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  } catch (e) {}
  html.className += ' gate-on';

  // Même règle de langue que le site (assets/js/i18n.js) : ?lang=, sinon le dernier choix, sinon le français
  var lang = q.get('lang');
  if (!TXT[lang]) {
    try {
      lang = localStorage.getItem('hooked-academy:lang');
    } catch (e) {}
  }
  if (!TXT[lang]) lang = 'fr';
  var T = TXT[lang];

  var track = function (name) {
    try {
      if (typeof window.fbq === 'function') window.fbq('trackCustom', name);
    } catch (e) {}
  };
  var mmss = function (s) {
    s = Math.max(0, Math.ceil(s));
    return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  };

  function build() {
    var gate = document.createElement('div');
    gate.className = 'gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-label', T.label);
    gate.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    gate.setAttribute('lang', lang);
    gate.innerHTML =
      '<div class="gate-in">' +
      '<div class="gate-media">' +
      '<video class="gate-v" playsinline webkit-playsinline preload="metadata"></video>' +
      '<button class="gate-play" type="button"></button>' +
      '<button class="gate-fs" type="button" hidden>⛶</button>' +
      '</div>' +
      '<p class="gate-line"></p>' +
      '<button class="gate-go" type="button" disabled></button>' +
      '</div>';
    var video = gate.querySelector('video');
    var play = gate.querySelector('.gate-play');
    var fs = gate.querySelector('.gate-fs');
    var go = gate.querySelector('.gate-go');
    video.poster = GATE_VIDEO_POSTER;
    video.src = GATE_VIDEO_SRC;
    video.setAttribute('aria-label', T.label);
    play.textContent = T.play;
    fs.setAttribute('aria-label', T.fs);
    fs.title = T.fs;
    gate.querySelector('.gate-line').textContent = T.line;

    // Le reste de la page : flouté (CSS), inerte et sans défilement tant que l'écran est là
    var others = [];
    for (var i = 0; i < document.body.children.length; i++) {
      var el = document.body.children[i];
      if (el !== gate && !el.hasAttribute('inert') && el.tagName !== 'SCRIPT') {
        el.setAttribute('inert', '');
        others.push(el);
      }
    }
    var stop = function (e) {
      e.stopPropagation();
    };
    gate.addEventListener('wheel', stop, { passive: true });
    gate.addEventListener('touchmove', stop, { passive: true });
    document.body.appendChild(gate);

    /* Compte à rebours sur la lecture réelle --------------------------------------------------- */
    var played = 0; // secondes de lecture réelle (cumulées)
    var unlocked = false;
    var started = false; // l'utilisateur a touché lecture
    var progressed = false; // la vidéo a vraiment avancé au moins une fois
    var half = false;
    var lastT = 0;
    var lastTick = 0;
    var lastProgressAt = 0;
    var tickId = 0;
    var guardId = 0;

    var render = function () {
      if (unlocked) {
        go.textContent = T.ok;
        go.disabled = false;
        go.removeAttribute('aria-label');
        return;
      }
      var left = mmss(GATE_SECONDS - played);
      go.textContent = T.wait.replace('{t}', left);
      go.setAttribute('aria-label', T.waitL.replace('{t}', left));
    };
    var unlock = function () {
      if (unlocked) return;
      unlocked = true;
      clearInterval(tickId);
      clearTimeout(guardId);
      try {
        localStorage.setItem(KEY, '1');
      } catch (e) {}
      go.className += ' is-ok';
      render();
    };
    render();

    var tick = function () {
      var now = Date.now();
      var dt = (now - lastTick) / 1000;
      lastTick = now;
      var t = video.currentTime || 0;
      // On compte seulement quand l'image avance (pause, chargement, coupure de réseau : rien)
      if (!video.paused && !video.ended && t > lastT + 0.01) {
        played += Math.min(dt, 0.5);
        lastProgressAt = now;
        progressed = true;
      }
      lastT = t;
      // Lecture demandée mais bloquée (réseau coupé…) depuis 10 s : on ne retient personne
      if (!unlocked && started && !video.paused && now - lastProgressAt > START_GUARD_MS) unlock();
      if (!unlocked && played >= GATE_SECONDS) unlock();
      if (!unlocked) render();
    };

    var startPlay = function () {
      if (!started) {
        started = true;
        track('VideoGatePlay');
        lastProgressAt = Date.now();
        // La vidéo n'a pas démarré 10 s après le toucher : bouton débloqué
        guardId = setTimeout(function () {
          if (!progressed) unlock();
        }, START_GUARD_MS);
      }
      lastTick = Date.now();
      lastT = video.currentTime || 0;
      if (!tickId && !unlocked) tickId = setInterval(tick, 250);
      video.muted = false;
      var p;
      try {
        p = video.play();
      } catch (e) {}
      if (p && p.catch) p.catch(function () {});
      video.controls = true;
      gate.className += ' is-started';
    };

    play.addEventListener('click', startPlay);
    video.addEventListener('play', function () {
      play.hidden = true;
      lastTick = Date.now();
      lastProgressAt = Date.now();
    });
    video.addEventListener('pause', function () {
      if (!video.ended) play.hidden = false;
    });
    video.addEventListener('seeked', function () {
      lastT = video.currentTime || 0;
    });
    // Moitié de la vidéo atteinte en la regardant (même après le déblocage du bouton)
    video.addEventListener('timeupdate', function () {
      if (!half && started && video.duration && video.currentTime >= video.duration / 2) {
        half = true;
        track('VideoGate50');
      }
    });
    video.addEventListener('ended', function () {
      tick();
      unlock();
    });
    // Vidéo introuvable ou illisible, ou réseau perdu : bouton débloqué tout de suite
    video.addEventListener('error', unlock);
    window.addEventListener('offline', unlock);
    play.addEventListener('click', function () {
      if (navigator.onLine === false) unlock();
    });

    // Plein écran (iPhone : celui de la vidéo ; ailleurs : l'API standard), caché si rien n'est possible
    var canFs = video.requestFullscreen || video.webkitRequestFullscreen || video.webkitEnterFullscreen;
    if (canFs) {
      fs.hidden = false;
      fs.addEventListener('click', function () {
        if (!started || video.paused) startPlay();
        try {
          if (video.requestFullscreen) video.requestFullscreen().catch(function () {});
          else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
          else video.webkitEnterFullscreen();
        } catch (e) {}
      });
    }

    go.addEventListener('click', function () {
      if (!unlocked) return;
      track('VideoGateUnlock');
      try {
        video.pause();
      } catch (e) {}
      clearInterval(tickId);
      try {
        if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
      } catch (e) {}
      for (var j = 0; j < others.length; j++) others[j].removeAttribute('inert');
      html.className = html.className.replace(/\s*\bgate-on\b/g, '');
      gate.parentNode && gate.parentNode.removeChild(gate);
      try {
        if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
      } catch (e) {}
      window.scrollTo(0, 0);
      // le haut de la page, avec les animations de la page recalculées
      try {
        window.dispatchEvent(new Event('resize'));
      } catch (e) {}
    });

    setTimeout(function () {
      try {
        play.focus({ preventScroll: true });
      } catch (e) {}
    }, 50);
  }

  var ready = function () {
    try {
      window.scrollTo(0, 0);
      build();
    } catch (e) {
      // Écran impossible à construire : la page reste utilisable, sans flou
      html.className = html.className.replace(/\s*\bgate-on\b/g, '');
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
