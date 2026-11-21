#!/usr/bin/env python3
"""Écrit js/i18n-nl.js et js/i18n-en.js (textes NL/EN de la boutique Discount Horeca).

Sources :
  cles_ui.json      phrases françaises de l'interface (clés de t('…')), dans l'ordre
  textes_ui.py      TEXTES = [(index, nl, en), …], même ordre que cles_ui.json
  textes_contenu.py FAMILLES, SOUS, UNIVERS, FAQ, ETAPES traduits

Vérifie l'alignement des index, les {variables}, les balises HTML et la couverture des gammes et catégories
par rapport à js/catalogue.js et js/univers.js.

Usage : python3 tools/discount-horeca/i18n_ui.py [sites/discount-horeca]
"""
import json, re, subprocess, sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
from textes_ui import TEXTES            # noqa: E402
import textes_contenu as C              # noqa: E402

SITE = Path(sys.argv[1] if len(sys.argv) > 1 else ICI.parent.parent / 'sites' / 'discount-horeca').resolve()
erreurs = []

cles = json.loads((ICI / 'cles_ui.json').read_text(encoding='utf-8'))
if len(cles) != len(TEXTES):
    erreurs.append(f'{len(cles)} clés pour {len(TEXTES)} traductions')
var = lambda s: sorted(re.findall(r'\{\w+\}', s))
balises = lambda s: sorted(re.findall(r'</?[a-z]+', s))
for i, (n, nl, en) in enumerate(TEXTES):
    if n != i:
        erreurs.append(f'index {i} : trouvé {n}')
        continue
    fr = cles[i]
    for code, tr in (('nl', nl), ('en', en)):
        if not tr.strip():
            erreurs.append(f'{code} vide : {fr!r}')
        if var(tr) != var(fr):
            erreurs.append(f'{code} variables {var(tr)} ≠ {var(fr)} : {fr!r}')
        if balises(tr) != balises(fr):
            erreurs.append(f'{code} balises : {fr!r}')

# Français de référence, lu dans les modules de la boutique.
js = """Promise.all([import('./js/catalogue.js'), import('./js/univers.js')]).then(([c, u]) => {
  console.log(JSON.stringify({ familles: c.FAMILLES.map(f => ({ slug: f.slug, sous: f.sous.map(s => s.slug) })),
    univers: u.UNIVERS, faq: u.FAQ, etapes: u.ETAPES }));
});"""
ref = json.loads(subprocess.run(['node', '--input-type=module', '-e', js], cwd=SITE, capture_output=True, text=True, check=True).stdout)

for code in ('nl', 'en'):
    fam, sous, univ = C.FAMILLES[code], C.SOUS[code], C.UNIVERS[code]
    for f in ref['familles']:
        if not all(fam.get(f['slug'], {}).get(k) for k in ('nom', 'court', 'description')):
            erreurs.append(f'{code} famille incomplète : {f["slug"]}')
        for s in f['sous']:
            if s not in sous:
                erreurs.append(f'{code} catégorie manquante : {s}')
    for slug, u in ref['univers'].items():
        t = univ.get(slug)
        if not t:
            erreurs.append(f'{code} univers manquant : {slug}')
            continue
        if set(t) != {'pastille', 'titre', 'intro', 'seo', 'faq', 'sous'} - (set() if 'sous' in u else {'sous'}):
            erreurs.append(f'{code} univers {slug} : champs {sorted(t)}')
        for k in ('titre', 'seo', 'faq'):
            if len(t.get(k, [])) != len(u.get(k, [])):
                erreurs.append(f'{code} univers {slug}.{k} : {len(t.get(k, []))} au lieu de {len(u.get(k, []))}')
        if set(t.get('sous', {})) != set(u.get('sous', {})):
            erreurs.append(f'{code} univers {slug}.sous : {set(u.get("sous", {})) ^ set(t.get("sous", {}))}')
    if len(C.FAQ[code]) != len(ref['faq']) or len(C.ETAPES[code]) != len(ref['etapes']):
        erreurs.append(f'{code} FAQ ou étapes incomplètes')

if erreurs:
    print('\n'.join(erreurs[:60]))
    sys.exit(f'{len(erreurs)} erreur(s) : rien n’est écrit.')

NOMS = {'nl': 'néerlandais', 'en': 'anglais'}
for col, code in ((1, 'nl'), (2, 'en')):
    ui = {cles[i]: ligne[col] for i, ligne in enumerate(TEXTES)}
    dump = lambda o: json.dumps(o, ensure_ascii=False, indent=1)
    sortie = (
        f'// Textes de la boutique en {NOMS[code]} (version Premium). Fichier généré par tools/discount-horeca/i18n_ui.py :\n'
        f'// modifier textes_ui.py ou textes_contenu.py puis relancer le script.\n'
        f'export const UI = {dump(ui)};\n'
        f'export const FAMILLES = {dump(C.FAMILLES[code])};\n'
        f'export const SOUS = {dump(C.SOUS[code])};\n'
        f'export const UNIVERS = {dump(C.UNIVERS[code])};\n'
        f'export const FAQ = {dump(C.FAQ[code])};\n'
        f'export const ETAPES = {dump(C.ETAPES[code])};\n'
    )
    chemin = SITE / 'js' / f'i18n-{code}.js'
    chemin.write_text(sortie, encoding='utf-8')
    print(f'{chemin.relative_to(SITE.parent.parent)} : {len(ui)} textes, {len(sortie) // 1024} Ko')
