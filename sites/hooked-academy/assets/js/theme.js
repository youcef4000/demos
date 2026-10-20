// Thème de l'espace étudiant : sombre (par défaut) ou clair, choisi par l'étudiant et gardé dans ce navigateur.
// La page le pose dès le <head> (petit script en ligne) pour éviter un éclair de la mauvaise couleur.

const KEY = 'hooked-academy:theme';
const META = { dark: '#07060a', light: '#f7f3ea' };

export function getTheme() {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function setTheme(v) {
  const th = v === 'light' ? 'light' : 'dark';
  try {
    localStorage.setItem(KEY, th);
  } catch {}
  const html = document.documentElement;
  if (th === 'light') html.dataset.theme = 'light';
  else delete html.dataset.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META[th]);
  return th;
}
