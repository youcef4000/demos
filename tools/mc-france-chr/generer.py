# Transforme le relevé (products.json de scrape.py) en js/catalogue.js + photos webp pour la démo MC France CHR.
# Usage : python3 tools/mc-france-chr/generer.py <dossier-de-travail> sites/mc-france-chr
import json, re, html, os, sys, subprocess, io, datetime, hashlib
from PIL import Image

REF = sys.argv[1]          # dossier du relevé
SITE = sys.argv[2]         # sites/mc-france-chr
os.makedirs(SITE + '/img/p', exist_ok=True)
os.makedirs(REF + '/img', exist_ok=True)
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
DATE = '2026-11-15'

FAMILLES = [
 ('froid', 'Froid professionnel', 'Froid', 'snow', 'Armoires, vitrines, saladettes et tables réfrigérées pour garder la chaîne du froid, du stockage au service.', [
   ('armoires-refrigerees', 'Armoires réfrigérées'), ('congelateurs', 'Congélateurs'), ('vitrines-refrigerees', 'Vitrines réfrigérées'),
   ('saladettes', 'Saladettes'), ('tables-refrigerees', 'Tables réfrigérées'), ('machines-a-glacons', 'Machines à glaçons')]),
 ('cuisson', 'Cuisson', 'Cuisson', 'flame', 'Fours, friteuses, planchas et cuisinières pour tenir le rythme du coup de feu.', [
   ('fours', 'Fours professionnels'), ('friteuses', 'Friteuses'), ('planchas', 'Planchas & plaques grill'),
   ('grills-salamandres', 'Salamandres & paninis'), ('cuisinieres', 'Cuisinières'), ('rotissoires', 'Rôtissoires')]),
 ('pizza-boulangerie', 'Pizza & boulangerie', 'Pizza', 'pizza', 'Fours à pizza, pétrins et façonneuses : tout pour la pâte, du pétrissage à la cuisson.', [
   ('fours-a-pizza', 'Fours à pizza'), ('petrins', 'Pétrins spirale'), ('faconneuses', 'Façonneuses & laminoirs'), ('saladettes-a-pizza', 'Saladettes à pizza')]),
 ('preparation', 'Préparation & boucherie', 'Préparation', 'knife', 'Trancheuses, hachoirs, coupe-légumes et machines sous vide pour préparer plus vite.', [
   ('trancheuses', 'Trancheuses'), ('hachoirs', 'Hachoirs à viande'), ('coupe-legumes', 'Coupe-légumes'),
   ('batteurs-blenders', 'Batteurs & blenders'), ('sous-vide', 'Machines sous vide')]),
 ('snack', 'Snack & maintien au chaud', 'Snack', 'burger', 'Kebab, chauffe-frites, bains-marie, crêpières : l\'équipement du snack et de la restauration rapide.', [
   ('kebab', 'Machines à kebab'), ('chauffe-frites', 'Chauffe-frites'), ('bain-marie', 'Bains-marie'),
   ('vitrines-chauffantes', 'Vitrines chauffantes'), ('crepieres-gaufriers', 'Crêpières & gaufriers')]),
 ('bar', 'Café & bar', 'Café & bar', 'cup', 'Machines à granita, à café et distributeurs de boissons pour le comptoir.', [
   ('machines-a-granita', 'Machines à granita'), ('machines-a-cafe', 'Machines à café'), ('distributeurs-boissons', 'Distributeurs de boissons')]),
 ('laverie', 'Laverie', 'Laverie', 'drop', 'Lave-vaisselle et lave-verres professionnels, frontaux ou à capot.', [
   ('lave-vaisselle', 'Lave-vaisselle'), ('lave-verres', 'Lave-verres')]),
 ('inox', 'Inox & hygiène', 'Inox', 'table', 'Tables, plonges, étagères et lave-mains en inox pour une cuisine aux normes.', [
   ('tables-inox', 'Tables inox'), ('plonges', 'Plonges inox'), ('etageres', 'Étagères inox'), ('lave-mains', 'Lave-mains')]),
 ('ventilation', 'Ventilation', 'Ventilation', 'fan', 'Hottes et moteurs d\'extraction pour une cuisine saine et conforme.', [
   ('hottes', 'Hottes professionnelles'), ('moteurs', 'Moteurs de hotte')]),
]

def get(url, path):
    if os.path.exists(path):
        return open(path, 'rb').read()
    for i in range(6):
        r = subprocess.run(['curl', '-sSL', '--max-time', '40', '-A', UA, '-o', '-', url], capture_output=True)
        if r.returncode == 0 and len(r.stdout) > 1000:
            open(path, 'wb').write(r.stdout)
            return r.stdout
    return None

def slug(s):
    import unicodedata
    s = unicodedata.normalize('NFD', s or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:60]

PETITS = {'gn': 'GN', 'led': 'LED', 'inox': 'inox', 'l': 'L', 'kg': 'kg', 'w': 'W', 'v': 'V', 'mm': 'mm', 'cm': 'cm', 'kw': 'kW'}
def casse(nom):
    lettres = [c for c in nom if c.isalpha()]
    if lettres and sum(c.isupper() for c in lettres) / len(lettres) > 0.7:
        mots = nom.lower().split(' ')
        mots = [PETITS.get(m, m) for m in mots]
        nom = ' '.join(mots)
    return nom[:1].upper() + nom[1:]

def nettoyer_nom(nom, marque, ref):
    n = html.unescape(nom or '').strip()
    if ' | ' in n:
        n = n.split(' | ')[0]
    n = re.sub(r'\s*[-–]?\s*r[ée]f\.?\s*:?\s*[\w.\-/]+\s*$', '', n, flags=re.I)
    if marque:
        n = re.sub(r'\s*[-–]\s*' + re.escape(marque) + r'\s*(?=$|[-–])', '', n, flags=re.I)
        n = re.sub(r'\s+' + re.escape(marque) + r'\s*$', '', n, flags=re.I)
    if ref:
        n = re.sub(r'\s*[-–]?\s*' + re.escape(ref) + r'\s*$', '', n, flags=re.I)
    n = re.sub(r'\s{2,}', ' ', n).strip(' -–')
    n = casse(n)
    n = n.replace('Réfrigérateu ', 'Réfrigérateur ').replace('BLanc', 'blanc')
    return n

def blocs(h):
    h = html.unescape(h or '')
    h = re.sub(r'(?i)<br\s*/?>', '\n', h)
    items = re.findall(r'(?s)<(p|li|h\d|tr)[^>]*>(.*?)</\1>', h)
    out = []
    for tag, inner in items:
        fort = bool(re.fullmatch(r'(?s)\s*<(strong|b)>.*?</\1>\s*', inner)) or tag.startswith('h')
        texte = re.sub(r'<[^>]+>', ' ', inner)
        texte = re.sub(r'\s+', ' ', texte).replace('\xa0', ' ').strip()
        if texte:
            for t in texte.split('\n'):
                if t.strip():
                    out.append((fort, t.strip()))
    if not items:
        t = re.sub(r'<[^>]+>', '\n', h)
        out = [(False, x.strip()) for x in t.split('\n') if x.strip()]
    return out

def specs(desc):
    groupes, courant, texte = [], None, []
    for fort, t in blocs(desc):
        if fort and ':' not in t:
            courant = [t.rstrip(' :'), []]
            groupes.append(courant)
            continue
        m = re.match(r'^([^:]{2,60}):\s*(.+)$', t)
        if m:
            k, v = m.group(1).strip(), m.group(2).strip()
            if v.lower() in ('non disponible', 'non', '-', 'n/a', '') and k.lower() not in ('serrure',):
                continue
            if courant is None:
                courant = ['Caractéristiques', []]
                groupes.append(courant)
            courant[1].append([k, v])
        elif len(t) > 25:
            texte.append(t)
    groupes = [g for g in groupes if g[1]]
    return groupes, texte[:4]

UNITES = [(r'_?mm$', ' (mm)'), (r'_?kg$', ' (kg)'), (r'_?kw$', ' (kW)'), (r'_?ltr$', ' (L)'), (r'_?volt$', ' (V)'), (r'_?hz$', ' (Hz)'), (r'_?db$', ' (dB)'), (r'_?w$', ' (W)')]
IGNORER = {'colis_postal', 'nombre de portes 1', 'modèle_de_table_autonomes_encastré', 'nombre_de_paires_de_guide', 'distance_de_conducteur_mm'}
def libelle(n):
    n = n.strip()
    for motif, rep in UNITES:
        if re.search(motif, n, re.I) and '_' in n:
            n = re.sub(motif, '', n, flags=re.I) + rep
            break
    n = n.replace('_', ' ').replace('lxpxh', 'L × P × H').replace('lxp', 'L × P').replace(' ltr', ' (L)')
    n = re.sub(r'\s+', ' ', n).strip()
    return n[:1].upper() + n[1:].lower() if n.isupper() or n.islower() or '_' in n else n

def specs_features(feats):
    groupes = {'Dimensions et poids': [], 'Alimentation': [], 'Caractéristiques': []}
    for f in feats or []:
        nom, val = (f.get('name') or '').strip(), html.unescape(str(f.get('value') or '')).strip()
        if not nom or not val or nom.lower() in IGNORER or val.lower() in ('non disponible', '-'):
            continue
        k = libelle(nom)
        if re.search(r'(?i)largeur|hauteur|profondeur|poids|dimension', nom):
            g = 'Dimensions et poids'
        elif re.search(r'(?i)tension|puissance|fr[ée]quence|gas|gaz|kw|volt|brûleur|alimentation|consommation', nom):
            g = 'Alimentation'
        else:
            g = 'Caractéristiques'
        if all(x[0] != k for x in groupes[g]):
            groupes[g].append([k, val[:1].upper() + val[1:]])
    return [[g, v] for g, v in groupes.items() if v]

def points(short):
    pts = []
    for fort, t in blocs(short):
        t = t.strip(' •-·')
        if 3 < len(t) < 140 and not t.lower().startswith(('référence', 'option', 'quantité')):
            pts.append(t)
    return pts[:10]

def image(url, dest):
    brut = get(url, REF + '/img/' + url.rsplit('/', 1)[1].split('?')[0] + '_' + hashlib.md5(url.encode()).hexdigest()[:8])
    if not brut:
        return False
    im = Image.open(io.BytesIO(brut)).convert('RGBA')
    fond = Image.new('RGBA', im.size, (255, 255, 255, 255))
    fond.alpha_composite(im)
    im = fond.convert('RGB')
    im.thumbnail((620, 620), Image.LANCZOS)
    # cadre carré blanc
    c = max(im.size)
    carre = Image.new('RGB', (c, c), (255, 255, 255))
    carre.paste(im, ((c - im.size[0]) // 2, (c - im.size[1]) // 2))
    carre.save(dest, 'WEBP', quality=74, method=6)
    return True

data = json.load(open(REF + '/products.json', encoding='utf-8'))
produits, vus = [], set()
for d in data:
    marque = (d.get('brand') or '').strip()
    if not marque:
        m = re.search(r'\|\s*([A-Z][A-Z0-9 &]+?)\s*-', d.get('name') or '')
        marque = m.group(1).strip() if m else ''
    marque = marque.title() if marque.isupper() and len(marque) > 3 else marque
    marque = {'Mcfrance Chr': 'MC France', 'Rm Gastro': 'RM Gastro'}.get(marque, marque)
    ref = (d.get('ref') or '').strip()
    nom = nettoyer_nom(d['name'], marque, ref)
    if re.match(r'(?i)(espresso waste|accroche|disque|lame|grille|co[uû]teau|ng co|p[ée]dale|douchette|volet|suma|epb|couvercle|kit |support|pied|accessoire|plaque pour|dessus|joint|filtre|tête|cône|peigne|rouleau|panier|bac )', nom):
        print('accessoire, ignoré :', nom); continue
    pid = slug(ref) or slug(nom)
    if pid in vus:
        pid = slug(nom)[:40] + '-' + d['pid']
    vus.add(pid)
    ht = round(float(d['ht']), 2)
    barre = None
    if d.get('has_discount') and d.get('regular_ttc'):
        try:
            r = float(str(d['regular_ttc']).replace('\xa0', '').replace(' ', '').replace('€', '').replace(',', '.'))
            barre = round(r / 1.2, 2)
        except ValueError:
            barre = None
        if not barre or barre <= ht * 1.01:
            barre = None
    grp, texte = specs(d.get('desc'))
    if not grp:
        grp = specs_features(d.get('features'))
    # texte : paragraphes descriptifs (description courte longue + description), sans la simple répétition du nom
    texte = [t for t in texte if not t.isupper() and 'est un équipement professionnel' not in t]
    for fort, t in blocs(d.get('short')):
        if len(t) >= 140 and t not in texte:
            texte.insert(0, t)
    texte = texte[:4]
    imgs = []
    for k, u in enumerate(d.get('imgs') or []):
        dest = f"{SITE}/img/p/{pid}-{k + 1}.webp"
        if os.path.exists(dest) or image(u, dest):
            imgs.append(f"img/p/{pid}-{k + 1}.webp")
    if not imgs:
        print('sans photo, ignoré :', nom)
        continue
    pts = points(d.get('short'))
    pts = [x for x in pts if len(x) < 140]
    if not pts:
        pts = [f"{k} : {v}" for g, lignes in grp for k, v in lignes if g != 'Dimensions et poids'][:5]
        dims = {k.split(' (')[0].lower(): v for g, lignes in grp for k, v in lignes if g == 'Dimensions et poids'}
        if all(x in dims for x in ('largeur', 'profondeur', 'hauteur')):
            pts.insert(0, f"Dimensions (L × P × H) : {dims['largeur']} × {dims['profondeur']} × {dims['hauteur']} mm")
    try:
        ajout = datetime.date.fromisoformat((d.get('date_add') or '2020-01-01')[:10])
    except ValueError:
        ajout = datetime.date(2020, 1, 1)
    q = d.get('qty')
    produits.append({
        'id': pid, 'ref': ref.upper(), 'nom': nom, 'marque': marque,
        'famille': d['fam'], 'sous': d['sub'],
        'prixHT': ht, 'prixBarreHT': barre,
        'stock': int(q) if isinstance(q, (int, float)) or (isinstance(q, str) and q.lstrip('-').isdigit()) else 0,
        'delai': (d.get('delivery') or 'Délai de livraison 1 à 3 jours ouvrés').replace('Délai de livraison ', ''),
        'etat': 'neuf', 'nouveau': (datetime.date.fromisoformat(DATE) - ajout).days < 75,
        'points': pts, 'texte': texte, 'specs': grp,
        'images': imgs, 'source': d['url'], 'ajoute': ajout.isoformat(),
    })
    produits[-1]['stock'] = max(0, produits[-1]['stock'])

# Second choix (exemples) : copies de produits réels, défaut d'aspect décrit, prix -25 %, 1 pièce.
DEFAUTS = [
    "Rayure légère sur le flanc gauche, sans effet sur le fonctionnement.",
    "Carton d'origine abîmé pendant le transport : appareil neuf, jamais utilisé.",
    "Petit enfoncement sur le panneau arrière, invisible une fois installé.",
    "Retour client sous 14 jours : testé et contrôlé par notre atelier.",
    "Ancien modèle d'exposition du showroom de Roubaix, complet avec notice.",
    "Micro-rayures sur la façade inox, garantie identique au neuf.",
]
sc, k = [], 0
for i, p in enumerate(produits):
    if p['prixHT'] > 250 and p['stock'] > 0 and i % 9 == 4 and k < 10:
        c = json.loads(json.dumps(p))
        c.update({'id': p['id'] + '-sc', 'ref': p['ref'] + '-SC', 'etat': 'second-choix', 'defaut': DEFAUTS[k % len(DEFAUTS)],
                  'prixBarreHT': p['prixBarreHT'] or p['prixHT'], 'prixHT': round(p['prixHT'] * 0.75, 2), 'stock': 1 + k % 2,
                  'nouveau': False, 'exemple': True})
        sc.append(c)
        k += 1
produits += sc

PREF = {'froid': ('armoires-refrigerees', 2), 'cuisson': ('friteuses', 3), 'pizza-boulangerie': ('fours-a-pizza', 3), 'preparation': ('trancheuses', 1),
        'snack': ('kebab', 1), 'bar': ('machines-a-granita', 0), 'laverie': ('lave-vaisselle', 3), 'inox': ('tables-inox', 1), 'ventilation': ('hottes', 0)}
fams = []
for slugf, nom, court, icone, desc, subs in FAMILLES:
    ps = [p for p in produits if p['famille'] == slugf and p['etat'] == 'neuf']
    fams.append({'slug': slugf, 'nom': nom, 'court': court, 'icone': icone, 'description': desc,
                 'image': ([p for p in ps if p['sous'] == PREF[slugf][0]][PREF[slugf][1]:] or ps)[0]['images'][0] if ps else '',
                 'sous': [{'slug': s, 'nom': n, 'image': next((p['images'][0] for p in sorted(ps, key=lambda x: -x['prixHT']) if p['sous'] == s), '')} for s, n in subs]})

entete = f"""// Catalogue de la démo MC France CHR — généré par le relevé du {DATE}.
// RÉEL (relevé public sur mcfrancechr.fr) : noms, références, marques, prix HT, prix barrés, stocks affichés,
// délais, points clés, fiches techniques et photos des produits.
// EXEMPLES (présentés comme tels dans la démo) : les articles « second choix » (suffixe -SC) et leurs défauts.
"""
js = entete + 'export const RELEVE = ' + json.dumps({'date': DATE, 'source': 'https://www.mcfrancechr.fr/', 'produits': len(produits) - len(sc), 'secondChoix': len(sc)}, ensure_ascii=False) + ';\n'
js += 'export const FAMILLES = ' + json.dumps(fams, ensure_ascii=False, indent=1) + ';\n'
js += 'export const PRODUITS = [\n' + ',\n'.join(json.dumps(p, ensure_ascii=False, separators=(',', ':')) for p in produits) + '\n];\n'
open(SITE + '/js/catalogue.js', 'w', encoding='utf-8').write(js)
print('produits', len(produits), 'dont second choix', len(sc))
