# Relevé public du catalogue discounthoreca.be pour la démo Discount Horeca (proposition de refonte).
# Usage : python3 tools/discount-horeca/scrape.py <dossier-de-travail>   (hors du dépôt)
# puis    python3 tools/discount-horeca/generer.py <dossier-de-travail> sites/discount-horeca
#
# 1. Parcourt toutes les catégories du plan du site (pages ?page=N) : inventaire.json (produit -> catégories, prix de liste).
# 2. Lit chaque fiche produit (bloc data-product de PrestaShop, marque, balises SEO) : fiches/<id>.json.
# Les pages sont mises en cache : relancer la commande reprend là où elle s'est arrêtée.
import re, html, json, time, sys, os, subprocess

OUT = sys.argv[1]
# Facultatif : <k> <n> = ne lire que les fiches k, k+n, k+2n… (plusieurs processus en parallèle).
PART = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (0, 1)
os.makedirs(OUT + '/pages', exist_ok=True)
os.makedirs(OUT + '/fiches', exist_ok=True)
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
SITE = 'https://www.discounthoreca.be/fr/'

def get(url, path=None):
    if path and os.path.exists(path):
        return open(path, encoding='utf-8', errors='ignore').read()
    last = None
    for i in range(5):
        r = subprocess.run(['curl', '-sSL', '--max-time', '40', '-A', UA, '-o', '-', url], capture_output=True)
        if r.returncode == 0 and len(r.stdout) > 500:
            t = r.stdout.decode('utf-8', 'ignore')
            if path:
                open(path, 'w', encoding='utf-8').write(t)
            time.sleep(0.4)
            return t
        last = r.stderr.decode()[:200]
        time.sleep(2 + i * 2)
    print('ÉCHEC', url, last, flush=True)
    return ''

def txt(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()

def prix(s):
    s = html.unescape(s or '').replace('\xa0', '').replace(' ', '').replace(' ', '').replace('€', '').strip()
    try:
        return float(s.replace('.', '').replace(',', '.'))
    except ValueError:
        return None

# ---------- 1. Arbre des catégories (plan du site) ----------
plan = get(SITE + 'plan-site', OUT + '/pages/plan-site.html')
arbre, pile, prof = [], [], 0
for t in re.finditer(r'<ul[^>]*>|</ul>|<a[^>]+href="(https://www\.discounthoreca\.be/fr/(\d+)-[^"]*)"[^>]*>(.*?)</a>', plan, re.S):
    s = t.group(0)
    if s.startswith('<ul'):
        prof += 1
    elif s.startswith('</ul'):
        prof -= 1
    else:
        arbre.append({'id': int(t.group(2)), 'url': t.group(1), 'nom': txt(t.group(3)), 'prof': prof})
# le plan liste deux fois l'arbre : on garde la version complète (sous « Accueil », la plus profonde)
i = max(k for k, c in enumerate(arbre) if c['id'] == 2)
complet = arbre[i:]
base = complet[0]['prof']
cats, parents = {}, {}
for c in complet[1:]:
    niv = c['prof'] - base
    if niv <= 0:
        break
    pile = pile[:niv - 1] + [c['id']]
    cats[c['id']] = {'id': c['id'], 'nom': c['nom'], 'url': c['url'], 'niveau': niv, 'parent': pile[-2] if len(pile) > 1 else None}
if PART == (0, 1):
    json.dump(cats, open(OUT + '/categories.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('catégories', len(cats), flush=True)

# ---------- 2. Inventaire : toutes les pages de chaque catégorie ----------
inv = {}
def miniatures(page):
    for a in re.findall(r'(?s)<article[^>]*product-miniature.*?</article>', page):
        pid = re.search(r'data-id-product="(\d+)"', a)
        u = re.search(r'href="([^"#]+\.html)', a)
        if not pid or not u:
            continue
        t = re.search(r'product-title"><a[^>]*>(.*?)</a>', a, re.S)
        pr = re.search(r'<span class="price"[^>]*>\s*([^<]+)', a)
        rg = re.search(r'<span class="regular-price"[^>]*>\s*([^<]+)', a)
        im = re.search(r'data-full-size-image-url="([^"]+)"', a)
        yield pid.group(1), {'url': u.group(1), 'titre': txt(t.group(1)) if t else '', 'ht': prix(pr.group(1)) if pr else None,
                             'barre': prix(rg.group(1)) if rg else None, 'vignette': im.group(1) if im else ''}

for cid, c in cats.items():
    page_n = 1
    while True:
        url = c['url'] + (f'?page={page_n}' if page_n > 1 else '')
        page = get(url, f"{OUT}/pages/cat-{cid}-{page_n}.html")
        if page_n == 1:
            m = re.search(r'Il y a (\d+) produit', page)
            c['nb'] = int(m.group(1)) if m else 0
        trouves = list(miniatures(page))
        for pid, d in trouves:
            e = inv.setdefault(pid, {**d, 'cats': []})
            if cid not in e['cats']:
                e['cats'].append(cid)
        if len(trouves) < 24 or page_n * 24 >= c.get('nb', 0):
            break
        page_n += 1
    print('catégorie', cid, c['nom'], c.get('nb'), 'produits', flush=True)
if PART == (0, 1):
    json.dump(cats, open(OUT + '/categories.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if PART == (0, 1):
    json.dump(inv, open(OUT + '/inventaire.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('inventaire', len(inv), 'produits', flush=True)

# ---------- 3. Fiches produits ----------
for n, (pid, e) in enumerate(inv.items()):
    if n % PART[1] != PART[0]:
        continue
    dest = f"{OUT}/fiches/{pid}.json"
    if os.path.exists(dest):
        continue
    page = get(e['url'])
    if not page:
        continue
    m = re.search(r'data-product="([^"]*)"', page)
    d = json.loads(html.unescape(m.group(1))) if m else {}
    marque = None
    i = page.find('product-manufacturer')
    if i > 0:
        b = re.search(r'alt="([^"]+)"', page[i:i + 800]) or re.search(r'<a[^>]*>([^<]+)</a>', page[i:i + 800])
        if b:
            marque = html.unescape(b.group(1)).strip()
    titre = re.search(r'<title>(.*?)</title>', page, re.S)
    desc = re.search(r'<meta name="description" content="([^"]*)"', page)
    h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', page, re.S)
    fil = [txt(x) for x in re.findall(r'(?s)<li[^>]*itemprop="itemListElement".*?<span itemprop="name">(.*?)</span>', page)]
    imgs = [((x.get('bySize') or {}).get('large_default') or {}).get('url') or (x.get('large') or {}).get('url') for x in d.get('images', [])]
    fiche = {
        'pid': pid, 'url': e['url'], 'cats': e['cats'], 'marque': marque,
        'title': txt(titre.group(1)) if titre else '', 'meta_description': html.unescape(desc.group(1)) if desc else '',
        'h1': [txt(x) for x in h1], 'fil': fil, 'images': [x for x in imgs if x],
        'canonical': bool(re.search(r'rel="canonical"', page)), 'hreflang': len(re.findall(r'hreflang=', page)),
        'ld_product': '"@type": "Product"' in page or '"@type":"Product"' in page,
        'poids_html': len(page),
        'data': {k: d.get(k) for k in ('id_product', 'reference', 'name', 'price_tax_exc', 'price_without_reduction', 'price_amount', 'has_discount',
                                       'discount_percentage', 'quantity', 'availability', 'availability_message', 'condition', 'date_add', 'date_upd',
                                       'description', 'description_short', 'features', 'meta_title', 'meta_description', 'category', 'category_name',
                                       'id_manufacturer', 'rate', 'on_sale', 'link_rewrite', 'ean13')},
    }
    json.dump(fiche, open(dest, 'w', encoding='utf-8'), ensure_ascii=False)
    if n % 25 == 0:
        print('fiche', n, '/', len(inv), pid, (d.get('name') or '')[:60], flush=True)
print('terminé', flush=True)
