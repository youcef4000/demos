// Lecteur des vidéos animées. Paramètres :
//   ?id=m1-l1        leçon à lire
//   &autoplay=1      démarre seul
//   &render=1        mode rendu MP4 : pas d'interface, window.__seek(t) pilote l'image
//   &tele=1          prompteur « à dire » sous la vidéo (studio voix off)
//   &audio=1         lit la voix off montée de la leçon, la vidéo suit le son
//   &lang=fr|en|ar   langue (sinon le dernier choix de la plateforme) ; la composition reste de gauche à droite
// Communique avec la page parente (postMessage) : prêt, temps, fin ; reçoit play / pause / seek.

import { lang, dir, t, applyDom, fmtNum } from '../assets/js/i18n.js';
import '../assets/js/i18n/motion.js';
import { compose } from './engine.js';
import { findLesson } from '../data/programme.js';
import { fmt } from './kit.js';

// Langue et sens de la page (i18n.js les pose déjà ; on le dit ici pour qui lit ce fichier), libellés du lecteur
document.documentElement.lang = lang;
document.documentElement.dir = dir;
applyDom();

const q = new URLSearchParams(location.search);
const id = q.get('id') || 'm1-l1';
const RENDER = q.has('render');
const found = findLesson(id);
const pl = document.getElementById('pl');
const stage = document.getElementById('stage');

if (RENDER) document.documentElement.classList.add('is-render');

const post = (event, extra = {}) => {
  if (window.parent !== window) window.parent.postMessage({ type: 'ha-player', id, event, ...extra }, '*');
};

async function boot() {
  if (!found) {
    const err = document.createElement('p');
    err.className = 'pl-err';
    err.textContent = t('mo.pl.notfound', { id });
    stage.replaceChildren(err);
    return;
  }
  // Polices chargées avant de mesurer quoi que ce soit (sinon les tracés partent faux)
  try {
    await document.fonts.ready;
    await Promise.all(['800 40px Archivo', '600 40px Figtree', '600 40px "IBM Plex Sans Arabic"', '400 20px "JetBrains Mono"'].map((f) => document.fonts.load(f, 'Aa وش')));
  } catch {}
  const { lesson, module, next } = found;
  const comp = compose(lesson, stage, { module, next });
  const { tl, duration, steps } = comp;
  document.title = `${lesson.title} — Hooked Academy`;

  const fit = () => {
    const r = pl.getBoundingClientRect();
    const s = Math.min(r.width / 1920, r.height / 1080);
    comp.root.style.transform = `translate(${(r.width - 1920 * s) / 2}px, ${(r.height - 1080 * s) / 2}px) scale(${s})`;
  };
  fit();
  new ResizeObserver(fit).observe(pl);

  let t = Math.min(duration, Math.max(0, parseFloat(q.get('t')) || 0));
  tl.seek(t, false);

  // Mode rendu : le script pilote chaque image
  window.__duration = duration;
  window.__seek = (time) => {
    tl.seek(Math.min(duration, Math.max(0, time)), false);
    return true;
  };
  window.__ready = true;
  if (RENDER) return;

  const $ = (s) => document.getElementById(s);
  const seek = $('seek');
  const time = $('time');
  $('dur').textContent = fmt(duration);
  let playing = false;
  let speed = 1;
  let last = 0;
  let audio = null;

  if (q.has('audio') && lesson.audio) {
    audio = new Audio(new URL(`../${lesson.audio}`, location.href).href);
    audio.preload = 'auto';
  }

  const tele = $('tele');
  const teleTxt = $('tele-txt');
  if (q.has('tele')) {
    tele.hidden = false;
    pl.classList.add('has-tele');
  }
  const sayAt = (tt) => {
    let k = 0;
    steps.forEach((s, i) => {
      if (tt >= s.t) k = i;
    });
    return steps[k]?.sc.say || '';
  };

  const render = () => {
    tl.seek(t, false);
    seek.value = String(Math.round((t / duration) * 1000));
    seek.style.setProperty('--p', `${(t / duration) * 100}%`);
    time.textContent = fmt(t);
    if (!tele.hidden) {
      const s = sayAt(t);
      if (teleTxt.textContent !== s) teleTxt.textContent = s;
    }
  };

  let lastPost = 0;
  const loop = (now) => {
    if (!playing) return;
    if (audio && !audio.paused) t = audio.currentTime;
    else t += ((now - last) / 1000) * speed;
    last = now;
    if (t >= duration) {
      t = duration;
      render();
      setPlaying(false);
      post('ended', { t, duration });
      return;
    }
    render();
    if (now - lastPost > 250) {
      post('time', { t, duration });
      lastPost = now;
    }
    requestAnimationFrame(loop);
  };

  function setPlaying(v) {
    playing = v;
    pl.classList.toggle('is-playing', v);
    $('play').setAttribute('aria-label', t(v ? 'mo.pl.pause' : 'mo.pl.lecture'));
    if (v) {
      if (t >= duration - 0.05) t = 0;
      last = performance.now();
      if (audio) {
        audio.currentTime = t;
        audio.playbackRate = speed;
        audio.play().catch(() => {});
      }
      requestAnimationFrame(loop);
      post('play', { t, duration });
    } else {
      if (audio) audio.pause();
      post('pause', { t, duration });
    }
  }

  const toggle = () => setPlaying(!playing);
  $('big').addEventListener('click', toggle);
  $('play').addEventListener('click', toggle);
  stage.addEventListener('click', toggle);
  seek.addEventListener('input', () => {
    t = (Number(seek.value) / 1000) * duration;
    if (audio) audio.currentTime = t;
    render();
    post('time', { t, duration });
  });
  const speeds = [1, 1.25, 1.5, 0.75];
  $('speed').addEventListener('click', () => {
    speed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    $('speed').textContent = `${fmtNum(speed)}×`;
    if (audio) audio.playbackRate = speed;
  });
  $('fs').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else {
        await pl.requestFullscreen();
        await screen.orientation?.lock?.('landscape').catch(() => {});
      }
    } catch {}
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === 'k') {
      e.preventDefault();
      toggle();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      t = Math.min(duration, Math.max(0, t + (e.key === 'ArrowRight' ? 5 : -5)));
      if (audio) audio.currentTime = t;
      render();
    }
  });
  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || m.type !== 'ha-cmd') return;
    if (m.cmd === 'play') setPlaying(true);
    if (m.cmd === 'pause') setPlaying(false);
    if (m.cmd === 'seek') {
      t = Math.min(duration, Math.max(0, +m.t || 0));
      if (audio) audio.currentTime = t;
      render();
      post('time', { t, duration });
    }
  });

  // Mouvement réduit : pas de lecture automatique, l'utilisateur lance quand il veut
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  render();
  pl.classList.add('is-ready');
  post('ready', { duration });
  if (q.has('autoplay') && !reduce) setPlaying(true);
}

boot();
