# Transforme le relevé de discounthoreca.be (scrape.py) en js/catalogue.js + photos webp pour la démo Discount Horeca.
# Usage : python3 tools/discount-horeca/generer.py <dossier-de-travail> sites/discount-horeca
# Sélection : jusqu'à QUOTA produits par sous-catégorie de la démo, répartis sur toute la gamme de prix,
# en préférant les fiches avec photos et caractéristiques. Les articles « exposition » (-EXPO) sont des exemples.
import json, re, html, os, sys, glob, io, datetime, hashlib, subprocess, unicodedata
from PIL import Image

REF, SITE = sys.argv[1], sys.argv[2]
os.makedirs(SITE + '/img/p', exist_ok=True)
os.makedirs(REF + '/img', exist_ok=True)
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
DATE = '2026-11-21'
QUOTA = 9

# (slug, nom, nom court, icône, description, [(sous-slug, nom, [ids de catégories du site], quota)])
FAMILLES = [
 ('froid', 'Froid', 'Froid', 'snow', 'Comptoirs et vitrines réfrigérés, armoires frigorifiques, saladettes, tables réfrigérées, machines à glaçons et chambres froides.', [
   ('comptoirs-refrigeres', 'Comptoirs réfrigérés', [12], 8), ('vitrines-refrigerees', 'Vitrines réfrigérées', [20, 191, 193, 21, 22, 23], 8),
   ('vitrines-boissons', 'Frigos à boissons', [19], 6), ('armoires-frigorifiques', 'Armoires frigorifiques', [24], 10),
   ('saladettes', 'Saladettes et tables de préparation', [32], 8), ('tables-refrigerees', 'Tables réfrigérées', [28, 254], 9),
   ('machines-a-glacons', 'Machines à glaçons', [220], 7), ('chambres-froides', 'Chambres froides', [44], 6), ('congelateurs-bahut', 'Congélateurs bahuts', [45], 4)]),
 ('cuisson', 'Cuisson', 'Cuisson', 'flame', 'Plaques et cuisinières des séries 600 à 900, fours mixtes vapeur, planchas, grillades pierre de lave, cuiseurs à pâtes, woks et marmites.', [
   ('plaques-de-cuisson', 'Plaques de cuisson', [51], 8), ('cuisinieres', 'Cuisinières et fourneaux', [63], 8), ('grillades', 'Grillades et grills vapeur', [62, 76], 5),
   ('planchas', 'Planchas', [64], 6), ('cuiseurs-a-pates', 'Cuiseurs à pâtes', [67], 4), ('woks', 'Woks', [68], 4), ('marmites', 'Marmites et sauteuses', [66], 3),
   ('fours-mixtes', 'Fours mixtes vapeur', [103], 6), ('fours-patisserie', 'Fours pâtisserie-boulangerie', [113], 5), ('micro-ondes', 'Micro-ondes professionnels', [228], 3),
   ('maintien-au-chaud', 'Maintien au chaud', [115], 4), ('petit-materiel-cuisson', 'Petit matériel de cuisson', [116], 3)]),
 ('friterie-snack', 'Friterie & snack', 'Friterie & snack', 'burger', 'Friteuses haut rendement, grills kebab, grills panini et salamandres, rôtissoires, crêpières, gaufriers et vitrines chauffantes.', [
   ('friteuses', 'Friteuses', [65], 10), ('grills-kebab', 'Gyros grills', [70], 5), ('grills-panini', 'Grills panini et salamandres', [71, 202], 6),
   ('rotissoires', 'Rôtissoires à poulets', [69], 5), ('crepieres-gaufriers', 'Crêpières et gaufriers', [176], 5), ('vitrines-chauffantes', 'Vitrines chauffantes', [127], 4)]),
 ('pizzeria', 'Pizzeria', 'Pizzeria', 'pizza', 'Fours à pizza électriques, gaz et convoyeurs, pétrins à spirale, laminoirs, diviseuses, tables à pizza, râpes et accessoires.', [
   ('fours-a-pizza', 'Fours à pizza', [159, 230], 9), ('petrins', 'Pétrins pour pizzeria', [162], 6), ('laminoirs-diviseuses', 'Laminoirs et diviseuses', [163, 219], 5),
   ('tables-a-pizza', 'Tables à pizza', [165], 5), ('rapes-fromage', 'Râpes à fromage', [164], 3), ('accessoires-pizza', 'Accessoires pour pizza', [243], 3)]),
 ('preparation', 'Préparation & boucherie', 'Préparation', 'knife', 'Trancheuses, hachoirs, scies à os, cutters, coupe-légumes, mixeurs, batteurs, machines sous vide, balances et bacs gastro.', [
   ('trancheuses', 'Trancheuses', [135], 6), ('hachoirs', 'Hachoirs et mélangeurs', [138, 139], 6), ('boucherie', 'Scies à os, attendrisseurs, poussoirs', [136, 137, 141, 140], 6),
   ('cutters-coupe-legumes', 'Cutters et coupe-légumes', [131, 132], 6), ('mixeurs', 'Mixeurs plongeants', [133], 4), ('batteurs-petrins', 'Batteurs et pétrins de boulangerie', [142], 6),
   ('sous-vide', 'Machines sous vide', [238], 4), ('balances', 'Balances', [134], 2), ('bacs-gastro', 'Bacs gastronormes', [206], 3), ('ustensiles', 'Petit matériel et ustensiles', [205], 4)]),
 ('cafe-dessert', 'Café, bar & self-service', 'Café & bar', 'cup', 'Machines à café, moulins, frigos de bar, presse-agrumes et buffets chauds ou froids.', [
   ('machines-a-cafe', 'Machines à café', [125], 5), ('moulins-a-cafe', 'Moulins à café', [126], 4), ('frigos-de-bar', 'Frigos de bar', [121], 6),
   ('presse-agrumes', 'Presse-agrumes', [128], 3), ('buffets', 'Buffets self-service', [129, 130, 39], 3)]),
 ('lavage', 'Lavage', 'Lavage', 'drop', 'Lave-verres et lave-vaisselle professionnels, frontaux ou à capot.', [
   ('lave-verres', 'Lave-verres', [146], 8), ('lave-vaisselle', 'Lave-vaisselle', [147], 10)]),
 ('inox', 'Inox made in Belgium', 'Inox', 'table', 'Tables, plonges, armoires, étagères, chariots et lave-mains en inox, fabriqués en Belgique.', [
   ('tables-inox', 'Tables inox', [148], 10), ('plonges', 'Plonges inox', [149], 9), ('armoires-inox', 'Armoires inox', [150, 271], 8),
   ('etageres-inox', 'Étagères et consoles', [152, 281], 6), ('chariots', 'Chariots et échelles', [151], 4), ('hygiene', 'Lave-mains et hygiène', [153], 5)]),
 ('hottes', 'Hottes made in Belgium', 'Hottes', 'fan', 'Hottes murales et centrales, hottes complètes avec moteur, hottes vapeur et à compensation, moteurs et variateurs.', [
   ('hottes-completes', 'Hottes complètes avec moteur', [154], 6), ('hottes-murales', 'Hottes murales', [155], 7), ('hottes-centrales', 'Hottes centrales', [156], 4),
   ('hottes-vapeur', 'Hottes vapeur', [216], 3), ('hottes-compensation', 'Hottes à compensation', [217], 3), ('moteurs-hottes', 'Moteurs d’extraction', [157], 5), ('variateurs', 'Variateurs de vitesse', [158], 2)]),
]

def get(url, path):
    if os.path.exists(path):
        return open(path, 'rb').read()
    for i in range(5):
        r = subprocess.run(['curl', '-sSL', '--max-time', '40', '-A', UA, '-o', '-', url], capture_output=True)
        if r.returncode == 0 and len(r.stdout) > 1000:
            open(path, 'wb').write(r.stdout)
            return r.stdout
    return None

def slug(s):
    s = unicodedata.normalize('NFD', s or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

def txt(s):
    s = html.unescape(html.unescape(s or ''))
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s)).replace('\xa0', ' ').strip()

FAUTES = [(r'\bprofessionel', 'professionnel'), (r'\bfrabrication\b', 'fabrication'), (r'\bfabriquation\b', 'fabrication'), (r'\bpoissonerie\b', 'poissonnerie'),
          (r'\bboulangrerie\b', 'boulangerie'), (r'\bvapeurau\b', 'vapeur au'), (r'\bsalamndre', 'salamandre'), (r'\bpattisserie', 'pâtisserie'), (r'\bkebbab\b', 'kebab'),
          (r'\bmadein\b', 'made in'), (r'\btravaille\b', 'travail'), (r'\brefrigere\b', 'réfrigéré'), (r'\bréfrigérateu\b', 'réfrigérateur'), (r'\bpatisserie\b', 'pâtisserie')]
MARQUES = {'CombiSteel': 'Combisteel', 'santos': 'Santos', 'Buffalo HORECA': 'Buffalo', 'TopCold': 'Topcold'}
NOMS_MARQUES = ['Diamond', 'Bertrand', 'Combisteel', 'Santos', 'Buffalo', 'Tecnodom', 'Coreco', 'Prismafood', 'Liebherr', 'Topcold', 'Tefcold']
FAUTES += [(r'\bcombistel\b', 'Combisteel'), (r'\bHotte complètes\b', 'Hotte complète'), (r'\bbertrand(?=\d)', 'Bertrand '), (r'tablettehaute', 'tablette, haute'), (r'qualitée\s*', 'qualité '), (r'^copy of\s+', ''), (r'modelproduit hfconcept', 'modèle'), (r'made in Belgique', 'made in Belgium'), (r'\s+,', ','), (r'\binox(?=\d)', 'inox '), (r'\bcuves? a\b', lambda m: m.group(0)[:-1] + 'à'), (r'qualité supérieur\b', 'qualité supérieure')]
PETITS = {'gn': 'GN', 'led': 'LED', 'inox': 'inox', 'l': 'L', 'kg': 'kg', 'w': 'W', 'v': 'V', 'mm': 'mm', 'cm': 'cm', 'kw': 'kW', 'aisi': 'AISI', 'hf': 'HF'}
def nom_propre(n):
    n = txt(n)
    lettres = [c for c in n if c.isalpha()]
    if lettres and sum(c.isupper() for c in lettres) / len(lettres) > 0.6:
        n = ' '.join(PETITS.get(m.lower(), m.lower()) for m in n.split(' '))
    for a, b in FAUTES:
        n = re.sub(a, b, n, flags=re.I)
    for m in NOMS_MARQUES:
        n = re.sub(r'\b' + m + r'\b', m, n, flags=re.I)
    n = re.sub(r'(?<=\d)\s*[xX×]\s*(?=\d)', ' x ', n)
    n = re.sub(r'\s+([,.)])', r'\1', n)
    n = re.sub(r'\s{2,}', ' ', n).strip(' -–,.:')
    return n[:1].upper() + n[1:]

BLOC = re.compile(r'(?i)<\s*(br|/?(div|p|li|ul|ol|tr|table|h\d|section|article))\b[^>]*>')
def lignes(h):
    # texte brut ligne par ligne : chaque bloc HTML (div, p, li, titre, br) devient une ligne
    h = html.unescape(h or '')
    h = BLOC.sub('\n', h)
    out = []
    for x in re.sub(r'<[^>]+>', ' ', h).split('\n'):
        x = re.sub(r'[ \t\xa0]+', lambda m: '  ' if len(m.group(0)) > 1 else ' ', html.unescape(x)).strip(' -–•·*')
        if x and not x.endswith(':') and txt(x).lower() not in ('détails du produit', 'caractéristiques', 'description', 'caractéristiques techniques', 'spécifications'):
            out.append(x.strip())
    fus = []
    for x in out:
        if fus and re.search(r'\d\.$', fus[-1]) and re.match(r'^\d', x):
            fus[-1] += x
        else:
            fus.append(x)
    return fus

def paires_html(h):
    # <li><strong>clé</strong><span>valeur</span></li> ou <li><strong>clé :</strong> valeur</li>
    out = []
    for li in re.findall(r'(?s)<li[^>]*>(.*?)</li>', html.unescape(h or '')):
        k = re.search(r'(?s)<strong[^>]*>(.*?)</strong>(.*)', li)
        if k:
            cle, val = txt(k.group(1)).rstrip(' :'), txt(k.group(2)).lstrip(' :')
            if cle and val and len(cle) <= 60 and len(val) <= 120:
                out.append([cle, val.replace('&', ' / ')])
    return out

VALEUR = re.compile(r'^(.{3,60}?)\s+((?:[A-Za-z]\s?)?[\d][\d\s.,/x×&+\-°%]*(?:\s?(?:mm|cm|kg|kw|w|v|l|ltr|litres?|m³|m3|db|hz|°c|°|bar|rpm|pizzas?|kcal/h|gn))?)$', re.I)
def classer(ligne):
    # renvoie ('spec', clé, valeur) ou ('texte', phrase)
    t = ligne.strip()
    if '  ' in t:
        a, b = [x.strip() for x in t.split('  ', 1)]
        if 2 < len(a) <= 60 and 0 < len(b) <= 80 and not a.endswith('.'):
            return ('spec', a.rstrip(' :'), re.sub(r'\s+', ' ', b))
    t = re.sub(r'\s+', ' ', t)
    m = re.match(r'^(kw|kg|m³|m3|t°|volt|watt|nb)\s*:?\s+(.{1,40})$', t, re.I)
    if m:
        return ('spec', m.group(1), m.group(2))
    m = re.match(r'^([^:]{2,60}?)\s*:\s*(.{1,100})$', t)
    if m and not m.group(1).strip().endswith('.'):
        return ('spec', m.group(1).strip(), m.group(2).strip())
    m = VALEUR.match(t)
    if m and len(t.split()) <= 9 and not t.endswith('.') and ',' not in m.group(1):
        return ('spec', m.group(1).strip(), m.group(2).strip())
    return ('texte', t)

def groupe(k):
    if re.search(r'(?i)dimension|dim\.|\(l\s*x\s*p\s*x\s*h\)|lxpxh|largeur|hauteur|profondeur|poids|pois|volume|capacit|contenu', k):
        return 'Dimensions et capacité'
    if re.search(r'(?i)kw|volt|tension|puissance|alimentation|gaz|watt|amp|hz|phase|kcal|énergie|energie', k):
        return 'Alimentation'
    return 'Caractéristiques'

def joli(k):
    k = re.sub(r'\s+', ' ', k).strip(' :–-')
    k = {x.lower(): y for x, y in {'(L x P x H) mm': 'Dimensions (L x P x H, mm)', 'mm (LxPxH)': 'Dimensions (L x P x H, mm)', 'Pois en KG': 'Poids (kg)', 'T°': 'Température', 'kW': 'Puissance (kW)', 'Voltage': 'Tension', 'Volt': 'Tension', 'KW': 'Puissance (kW)', 'Kw': 'Puissance (kW)', 'Kg': 'Poids (kg)', 'KG': 'Poids (kg)', 'M³': 'Volume emballé (m³)', 'M3': 'Volume emballé (m³)', 'NB': 'Remarque', 'Nb': 'Remarque', 'Dimension': 'Dimensions (mm)', 'Dimensions en mm': 'Dimensions (mm)', 'Materiel': 'Matériau', 'Dimenssions en mm': 'Dimensions (mm)'}.items()}.get(k.lower(), k)
    return k[:1].upper() + k[1:]

def analyser(d, nom):
    g = {'Dimensions et capacité': [], 'Alimentation': [], 'Caractéristiques': []}
    pts, texte = [], []
    debut_nom = slug(nom)[:24]
    def ajouter_spec(k, v):
        k = joli(k)
        if v and all(x[0].lower() != k.lower() for x in g[groupe(k)]):
            g[groupe(k)].append([k, v])
    for k, v in paires_html(d.get('description_short')) + paires_html(d.get('description')):
        ajouter_spec(k, v)
    vus = {txt(k).lower() for k, _ in paires_html(d.get('description_short')) + paires_html(d.get('description'))}
    for source in (d.get('description_short'), d.get('description')):
        ls = lignes(source)
        for i, l in enumerate(ls):
            if slug(l).startswith(debut_nom) or len(l) < 2:
                continue
            suivante = ls[i + 1] if i + 1 < len(ls) else ''
            if l and not re.search(r'\d', l) and len(l) <= 60 and not l.endswith('.') and re.fullmatch(r'[\d\s.,/xX×h+\-°%()]+(mm|cm|kg|kw|w|v|l)?', suivante or 'z', re.I):
                ls[i + 1] = l + '  ' + suivante
                continue
            c = classer(l)
            if c[0] == 'spec':
                if c[1].lower() not in vus:
                    ajouter_spec(c[1], c[2])
            elif len(c[1]) > 170:
                if c[1] not in texte:
                    texte.append(c[1])
            elif c[1] not in pts:
                pts.append(c[1][:1].upper() + c[1][1:])
    for f in d.get('features') or []:
        k, v = txt(f.get('name')), txt(str(f.get('value') or ''))
        if k and v:
            ajouter_spec(k, v)
    specs = [[k, v] for k, v in g.items() if v]
    if len(pts) < 3:
        pts += [f"{k} : {v}" for gk, l in specs for k, v in l if gk != 'Dimensions et capacité'][:5 - len(pts)]
        dims = [f"{k} : {v}" for k, v in g['Dimensions et capacité']][:1]
        pts = dims + pts
    propres, vus_pts = [], set()
    for x in pts:
        x = re.sub(r'\s+([,.])', r'\1', x).replace('Made in Belgique', 'Made in Belgium')
        if slug(x) not in vus_pts:
            vus_pts.add(slug(x))
            propres.append(x)
    return specs, propres[:8], texte[:3]

def image(url, dest):
    brut = get(url, REF + '/img/' + hashlib.md5(url.encode()).hexdigest()[:16])
    if not brut:
        return False
    try:
        im = Image.open(io.BytesIO(brut)).convert('RGBA')
    except Exception:
        return False
    fond = Image.new('RGBA', im.size, (255, 255, 255, 255))
    fond.alpha_composite(im)
    im = fond.convert('RGB')
    im.thumbnail((620, 620), Image.LANCZOS)
    c = max(im.size)
    carre = Image.new('RGB', (c, c), (255, 255, 255))
    carre.paste(im, ((c - im.size[0]) // 2, (c - im.size[1]) // 2))
    carre.save(dest, 'WEBP', quality=74, method=6)
    return True

# ---------- Lecture du relevé ----------
cats = {int(k): v for k, v in json.load(open(REF + '/categories.json', encoding='utf-8')).items()}
enfants = {}
for cid, c in cats.items():
    if c.get('parent'):
        enfants.setdefault(c['parent'], []).append(cid)
def descendants(cid):
    res = {cid}
    for e in enfants.get(cid, []):
        res |= descendants(e)
    return res
fiches = {}
for f in glob.glob(REF + '/fiches/*.json'):
    d = json.load(open(f, encoding='utf-8'))
    if d.get('data', {}).get('name'):
        fiches[d['pid']] = d

def qualite(fi):
    d = fi['data']
    return (len(fi['images']) > 0) * 10 + min(len(fi['images']), 3) + (len(analyser(d, d.get('name') or '')[0]) > 0) * 3 + min(len(txt(d.get('description'))) // 200, 3) + ((d.get('quantity') or 0) > 0) * 1

utilises, produits = set(), []
for fslug, fnom, fcourt, ficone, fdesc, subs in FAMILLES:
    for sslug, snom, ids, quota in subs:
        pool = set().union(*(descendants(i) for i in ids))
        cand = [fi for pid, fi in fiches.items() if pid not in utilises and set(fi['cats']) & pool and fi['images'] and (fi['data'].get('price_tax_exc') or 0) > 0]
        bons = [c for c in cand if qualite(c) >= 14] or cand
        bons.sort(key=lambda c: c['data']['price_tax_exc'])
        # répartition sur la gamme de prix, sans doublons de nom quasi identiques
        pris, noms = [], set()
        if bons:
            pas = max(1, len(bons) / max(1, quota))
            idx = [int(i * pas) for i in range(quota)] + list(range(len(bons)))
            for i in idx:
                if i >= len(bons) or len(pris) >= quota:
                    continue
                c = bons[i]
                cle = re.sub(r'\d+', '#', slug(c['data']['name']))[:40]
                if c['pid'] in {x['pid'] for x in pris} or (cle in noms and len(bons) > quota * 1.5):
                    continue
                pris.append(c)
                noms.add(cle)
        for c in pris:
            utilises.add(c['pid'])
            produits.append((fslug, sslug, c))
        print(fslug, sslug, 'candidats', len(cand), 'pris', len(pris), flush=True)

sortie = []
for fslug, sslug, fi in produits:
    d = fi['data']
    nom = nom_propre(d['name'])
    pid = fi['pid']
    ident = f"{slug(nom)[:48].strip('-')}-{pid}"
    marque = MARQUES.get((fi.get('marque') or '').strip(), (fi.get('marque') or '').strip())
    ref = (d.get('reference') or '').strip() or f'DH-{pid}'
    ht = round(float(d['price_tax_exc']), 2)
    barre = None
    if d.get('has_discount') and d.get('price_without_reduction'):
        try:
            b = round(float(d['price_without_reduction']), 2)
            barre = b if b > ht * 1.01 else None
        except (TypeError, ValueError):
            barre = None
    specs, pts, texte = analyser(d, nom)
    imgs = []
    for k, u in enumerate(fi['images'][:3]):
        dest = f"{SITE}/img/p/dh-{pid}-{k + 1}.webp"
        if os.path.exists(dest) or image(u, dest):
            imgs.append(f"img/p/dh-{pid}-{k + 1}.webp")
    if not imgs:
        print('sans photo, ignoré :', nom)
        continue
    try:
        ajout = datetime.date.fromisoformat((d.get('date_add') or '2020-01-01')[:10])
    except ValueError:
        ajout = datetime.date(2020, 1, 1)
    q = d.get('quantity')
    stock = int(q) if isinstance(q, (int, float)) else int(q) if isinstance(q, str) and q.lstrip('-').isdigit() else 0
    sortie.append({
        'id': ident, 'ref': ref, 'nom': nom, 'marque': marque, 'famille': fslug, 'sous': sslug,
        'prixHT': ht, 'prixBarreHT': barre, 'stock': max(0, stock),
        'delai': '24 à 72 h' if stock > 0 else 'sur commande',
        'etat': 'neuf', 'nouveau': (datetime.date.fromisoformat(DATE) - ajout).days < 150,
        'points': pts, 'texte': texte, 'specs': specs, 'images': imgs, 'ajoute': ajout.isoformat(),
        'source': fi['url'],
    })

# Exposition (exemples) : copies de produits réels présentées comme modèles d'exposition du showroom, -20 %, 1 pièce.
DEFAUTS = [
    'Modèle d’exposition du showroom, complet avec sa notice.',
    'Ancien modèle d’exposition : petite rayure sur le flanc, sans effet sur le fonctionnement.',
    'Emballage d’origine abîmé : appareil neuf, jamais utilisé.',
    'Modèle de salon professionnel, contrôlé par notre atelier.',
    'Retour client sous 14 jours, testé et contrôlé.',
    'Micro-rayures sur la façade inox, invisible une fois installé.',
]
expo, k = [], 0
for i, p in enumerate(sortie):
    if p['prixHT'] > 400 and i % 23 == 5 and k < len(DEFAUTS):
        c = json.loads(json.dumps(p))
        c.update({'id': p['id'] + '-expo', 'ref': p['ref'] + '-EXPO', 'etat': 'exposition', 'defaut': DEFAUTS[k],
                  'prixBarreHT': p['prixBarreHT'] or p['prixHT'], 'prixHT': round(p['prixHT'] * 0.8, 2), 'stock': 1,
                  'delai': '24 à 72 h', 'nouveau': False, 'exemple': True})
        c.pop('source', None)
        expo.append(c)
        k += 1
sortie += expo

fams = []
for fslug, fnom, fcourt, ficone, fdesc, subs in FAMILLES:
    ps = [p for p in sortie if p['famille'] == fslug and p['etat'] == 'neuf']
    sous = []
    for sslug, snom, ids, quota in subs:
        pss = sorted([p for p in ps if p['sous'] == sslug], key=lambda x: (-len(x['images']), -x['prixHT']))
        if pss:
            sous.append({'slug': sslug, 'nom': snom, 'image': pss[0]['images'][0], 'site': [cats[i]['url'] for i in ids if i in cats][:1]})
    fams.append({'slug': fslug, 'nom': fnom, 'court': fcourt, 'icone': ficone, 'description': fdesc,
                 'image': max(ps, key=lambda x: (len(x['images']), x['prixHT']))['images'][0] if ps else '', 'sous': sous})

entete = f"""// Catalogue de la démo Discount Horeca — généré par le relevé public de discounthoreca.be du {DATE}.
// RÉEL (relevé public) : noms (casse et fautes de frappe corrigées), références, marques, prix HTVA, prix avant promotion,
// stocks affichés, descriptions, caractéristiques et photos des produits.
// EXEMPLES (présentés comme tels dans la démo) : les modèles « exposition » (suffixe -EXPO) et leurs défauts.
"""
total_site = len(json.load(open(REF + '/inventaire.json', encoding='utf-8')))
js = entete + 'export const RELEVE = ' + json.dumps({'date': DATE, 'produits': len(sortie) - len(expo), 'exposition': len(expo), 'site': total_site, 'categoriesSite': len(cats)}, ensure_ascii=False) + ';\n'
js += 'export const FAMILLES = ' + json.dumps(fams, ensure_ascii=False, indent=1) + ';\n'
js += 'export const PRODUITS = [\n' + ',\n'.join(json.dumps({k: v for k, v in p.items() if k != 'source'}, ensure_ascii=False, separators=(',', ':')) for p in sortie) + '\n];\n'
open(SITE + '/js/catalogue.js', 'w', encoding='utf-8').write(js)
json.dump({p['id']: p.get('source') for p in sortie if p.get('source')}, open(REF + '/sources-demo.json', 'w'), ensure_ascii=False, indent=0)
print('produits', len(sortie), 'dont exposition', len(expo), '· site', total_site)
