// Application installable : enregistre le service worker et gère le bouton « Installer l'application ».
// Les éléments [data-pwa-install] s'affichent seulement quand l'installation est possible :
// invite native (Chrome, Edge, Android) ou mode d'emploi (iPhone et iPad, via le menu Partager).

import { t, add } from './i18n.js';

add({
  fr: {
    'pwa.install': 'Installer l’application',
    'pwa.ios.title': 'Installer Hooked Academy',
    'pwa.ios.text': 'Sur iPhone et iPad : touche le bouton Partager de Safari, puis « Sur l’écran d’accueil ». L’application s’ouvre ensuite comme les autres, en plein écran.',
    'pwa.ios.ok': 'Compris',
    'pwa.done': 'Application installée',
  },
  en: {
    'pwa.install': 'Install the app',
    'pwa.ios.title': 'Install Hooked Academy',
    'pwa.ios.text': 'On iPhone and iPad: tap Safari’s Share button, then “Add to Home Screen”. The app then opens like any other, full screen.',
    'pwa.ios.ok': 'Got it',
    'pwa.done': 'App installed',
  },
  ar: {
    'pwa.install': 'ثبّت التطبيق',
    'pwa.ios.title': 'تثبيت Hooked Academy',
    'pwa.ios.text': 'على iPhone وiPad: اضغط زر المشاركة في Safari، ثم «إضافة إلى الشاشة الرئيسية». بعدها يفتح التطبيق مثل باقي التطبيقات، بملء الشاشة.',
    'pwa.ios.ok': 'فهمت',
    'pwa.done': 'تم تثبيت التطبيق',
  },
});

const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let deferred = null;

/** L'installation est-elle proposable maintenant ? (pour les boutons rendus après coup) */
export const installable = () => !standalone() && (!!deferred || ios());

function show(on) {
  document.querySelectorAll('[data-pwa-install]').forEach((b) => (b.hidden = !on));
}

function iosHelp() {
  let d = document.getElementById('pwa-ios');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'pwa-ios';
    d.className = 'pwa-dlg';
    d.innerHTML = `<form method="dialog"><h2>${t('pwa.ios.title')}</h2><p>${t('pwa.ios.text')}</p><button class="pwa-ok" value="ok">${t('pwa.ios.ok')}</button></form>`;
    document.body.append(d);
  }
  d.showModal?.();
}

async function install() {
  if (deferred) {
    deferred.prompt();
    const r = await deferred.userChoice.catch(() => null);
    deferred = null;
    if (r?.outcome === 'accepted') show(false);
    return;
  }
  if (ios()) iosHelp();
}

/** À appeler une fois par page. `swUrl` : chemin du service worker depuis la page (« sw.js » ou « ../sw.js »). */
export function initPWA(swUrl) {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))) {
    addEventListener('load', () => navigator.serviceWorker.register(swUrl, { scope: new URL('./', new URL(swUrl, location.href)).pathname }).catch(() => {}));
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-pwa-install]')) install();
  });
  if (standalone()) return show(false);
  show(ios());
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    show(true);
  });
  addEventListener('appinstalled', () => {
    deferred = null;
    show(false);
  });
}
