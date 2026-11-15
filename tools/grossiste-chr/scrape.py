# Relevé public du catalogue mcfrancechr.fr pour la démo Stockinox (grossiste CHR, nom fictif).
# Usage : python3 tools/grossiste-chr/scrape.py <dossier-de-travail>   (hors du dépôt, ex. /tmp/mcf)
# puis    python3 tools/grossiste-chr/generer.py <dossier-de-travail> sites/grossiste-chr
# tree.json : familles de la démo -> catégories du site (ids), nombre de produits, prix minimum.
import re, html, json, time, sys, os, subprocess, urllib.request, ssl

OUT = sys.argv[1]
os.makedirs(OUT + '/pages', exist_ok=True)
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'

def get(url, path=None, binary=False):
    if path and os.path.exists(path):
        return open(path, 'rb').read() if binary else open(path, encoding='utf-8', errors='ignore').read()
    last = None
    for i in range(6):
        r = subprocess.run(['curl', '-sSL', '--max-time', '40', '-A', UA, '-o', '-', url], capture_output=True)
        if r.returncode == 0 and len(r.stdout) > 500:
            if path:
                open(path, 'wb').write(r.stdout)
            time.sleep(0.6)
            return r.stdout if binary else r.stdout.decode('utf-8', 'ignore')
        last = r.stderr.decode()[:200]
        time.sleep(2 + i * 2)
    raise RuntimeError(url + ' ' + str(last))

# Catégories du site : relevées dans le menu de la page d'accueil.
cats = {}
accueil = get('https://www.mcfrancechr.fr/', f"{OUT}/pages/accueil.html")
for m in re.finditer(r'<a[^>]+href="(https://www\.mcfrancechr\.fr/(\d+)-[^"#]+)"', accueil):
    cats.setdefault(m.group(2), m.group(1))

# arbre de la démo : (slug famille, slug sous-cat, [ids catégories du site], nb produits)
TREE = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tree.json'), encoding='utf-8'))

def price(s):
    s = html.unescape(s).replace('\xa0', '').replace(' ', '').replace('€', '').replace('HT', '').strip()
    return float(s.replace('.', '').replace(',', '.')) if s else None

def miniatures(page):
    res = []
    for m in re.finditer(r'(?s)<article id="product-miniature".*?</article>', page):
        a = m.group(0)
        u = re.search(r'href="([^"#]+\.html)', a)
        if not u:
            continue
        pr = re.search(r'<span class="price">\s*([^<]+)</span>', a)
        t = re.search(r'itemprop="name"><a[^>]*>([^<]*)</a>', a)
        t = html.unescape(t.group(1)).strip().lower() if t else ''
        if re.match(r'(dessus|grille|kit|disque|co[uû]teau|ng co|p[ée]dale|douchette|volet|suma|outil|moulin|thermos|pot à|porte-filtre|bac à marc|doner grill|doner kebab (smooth|slicer|meat|\d)|machine à espresso - (piston|tamper|cappuccino)|epb|couvercle|pied|support|plateau|joint|filtre|panier|bac|tiroir|roulette|étagère pour|clayette|option|accessoire|lot de|brosse|rack|casier|cuve|résistance|thermostat|plaque pour|façade|porte |habillage|rehausse|socle|crémaillère)', t):
            continue
        res.append({'url': u.group(1), 'ht': price(pr.group(1)) if pr else None, 'titre': t})
    return res

products = []
seen = set()
for fam in TREE:
    for sub in fam['subs']:
        picked = []
        for cid in sub['ids']:
            url = cats[str(cid)]
            if sub.get('min', 90) > 150:
                page = get(url + '?order=product.price.desc', f"{OUT}/pages/cat-{cid}-desc.html")
            else:
                page = get(url, f"{OUT}/pages/cat-{cid}.html")
            lst = miniatures(page)
            if sub.get('min', 90) > 150:
                lst = sorted(lst, key=lambda m: m['ht'] or 0)
            for mi in lst:
                if mi['url'] in seen or not mi['ht'] or mi['ht'] < sub.get('min', 90):
                    continue
                picked.append(mi)
                seen.add(mi['url'])
                if len(picked) >= sub['n'] * (sub['ids'].index(cid) + 1) / len(sub['ids']) + 0.5:
                    break
        picked = picked[:sub['n']]
        for mi in picked:
            pid = re.search(r'/(\d+)-[^/]*\.html$', mi['url']).group(1)
            page = get(mi['url'], f"{OUT}/pages/p-{pid}.html")
            m = re.search(r'data-product="([^"]*)"', page)
            if not m:
                print('pas de data-product', mi['url']); continue
            d = json.loads(html.unescape(m.group(1)))
            brand = None
            i = page.find('product-manufacturer')
            if i > 0:
                b = re.search(r'alt="([^"]+)"', page[i:i + 800])
                if b: brand = html.unescape(b.group(1)).strip()
            imgs = [((x.get('large') or {}).get('url')) for x in d.get('images', [])]
            imgs = [x for x in imgs if x][:3]
            products.append({
                'pid': pid, 'fam': fam['slug'], 'sub': sub['slug'], 'url': mi['url'].split('#')[0],
                'name': d.get('name'), 'ref': d.get('reference'), 'brand': brand,
                'ht': round(float(d.get('price_tax_exc') or 0), 2),
                'ht_list': mi['ht'],
                'regular_ttc': d.get('price_without_reduction'), 'ttc': d.get('price_amount'),
                'disc': d.get('discount_percentage'), 'has_discount': d.get('has_discount'),
                'qty': d.get('quantity'), 'delivery': d.get('delivery_in_stock'),
                'short': d.get('description_short'), 'desc': d.get('description'),
                'features': d.get('features'), 'imgs': imgs, 'date_add': d.get('date_add'),
            })
            print(len(products), fam['slug'], sub['slug'], d.get('reference'), (d.get('name') or '')[:60], flush=True)

json.dump(products, open(OUT + '/products.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('total', len(products))
