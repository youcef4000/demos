# Traductions NL et EN du catalogue de la démo Discount Horeca (version Premium).
# Usage : python3 tools/discount-horeca/traduire.py <dossier-modeles-argos> sites/discount-horeca
#   (après generer.py). Modèles Argos Translate (open source, en local) : translate-fr_en et translate-en_nl,
#   décompressés dans <dossier-modeles-argos>/fr_en-1_9/… et en_nl-1_8/… ; il faut les paquets ctranslate2 et sentencepiece.
# - Noms de produits : traduction relue à la main (noms_traduits.py), avec les corrections du français.
# - Points clés, textes, caractéristiques : traduction automatique FR → EN → NL avec un glossaire du métier,
#   signalée « à relire » dans la boutique.
# Écrit js/catalogue-en.js et js/catalogue-nl.js (chargés seulement quand on change de langue) et corrige js/catalogue.js.
import json, re, sys, os, glob
import ctranslate2, sentencepiece as spm
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from noms_traduits import NOMS, CORRECTIONS_FR

MODELES, SITE = sys.argv[1], sys.argv[2]

class Moteur:
    def __init__(self, d):
        d = glob.glob(d + '/translate-*')[0]
        self.t = ctranslate2.Translator(d + '/model', device='cpu', inter_threads=4)
        self.sp = spm.SentencePieceProcessor(model_file=d + '/sentencepiece.model')
    def __call__(self, phrases):
        if not phrases:
            return []
        toks = [self.sp.encode(p, out_type=str) for p in phrases]
        res = self.t.translate_batch(toks, beam_size=4, max_batch_size=32, max_decoding_length=300)
        return [re.sub(r'\s+', ' ', self.sp.decode(r.hypotheses[0]).replace('▁', ' ')).strip() for r in res]

fr_en, en_nl = Moteur(MODELES + '/fr_en-1_9'), Moteur(MODELES + '/en_nl-1_8')

# ---------- Lecture du catalogue ----------
src = open(SITE + '/js/catalogue.js', encoding='utf-8').read()
def bloc(nom):
    m = re.search(r'export const ' + nom + r' = (.*?);\n(?=export const|$)', src, re.S)
    return json.loads(m.group(1))
RELEVE, FAMILLES, PRODUITS = bloc('RELEVE'), bloc('FAMILLES'), bloc('PRODUITS')
neufs = [p for p in PRODUITS if p['etat'] == 'neuf']
assert len(neufs) == len(NOMS), (len(neufs), len(NOMS))

# corrections du français (noms), reportées sur les copies « exposition »
for i, nom in CORRECTIONS_FR.items():
    neufs[i]['nom'] = nom
par_id = {p['id']: p for p in neufs}
for p in PRODUITS:
    if p['etat'] == 'exposition' and p['id'][:-5] in par_id:
        p['nom'] = par_id[p['id'][:-5]]['nom']

# ---------- Glossaire ----------
AVANT_MT = [  # réécritures du français que le moteur comprend mieux
    (r'\bsous[- ]tablette\b', 'étagère inférieure'), (r'\bplonges?\b', 'évier'), (r'\bVérins\b', 'Pieds à vis'),
    (r'\bfriteuses?\b', 'friteuse'), (r'\bdotation\b', 'fourniture'), (r'\bbac à frites\b', 'panier à frites'), (r'\bathermiques?\b', 'isolée de la chaleur'), (r'\bBandeau\b', 'Panneau avant'), (r'\bbroches\b', 'tournebroches'),
]
APRES_EN = [(r'\bdive\b', 'sink'), (r'\bCart\b', 'Basket'), (r'\bBrooches\b', 'Spits'), (r'\bHeadband\b', 'Front panel'), (r'\bcart\b', 'basket'), (r'\bstainless steel steel\b', 'stainless steel'), (r'\bGas cooker\b', 'Gas fryer'), (r'\bBLANCHE\b', 'WHITE'), (r'\bBlanche\b', 'White'), (r'\bNOIR(E)?\b', 'BLACK')]
APRES_NL = [(r'\b([Rr])oestvrij stalen\b', lambda m: 'Inox' if m.group(1) == 'R' else 'inox'), (r'Spoedgas', 'Propaangas'), (r'\bBroeches\b', 'Spitten'),(r'\broestvrijstalen\b', 'inox'), (r'\broestvrij staal\b', 'inox'), (r'\bRoestvrijstalen\b', 'Inox'), (r'\bRoestvrij staal\b', 'Inox'), (r'\bdiepvries\b', 'diepvries'), (r'\bhet koelmiddel\b', 'het koelmiddel')]
def avant(t):
    for a, b in AVANT_MT:
        t = re.sub(a, b, t, flags=re.I)
    return t
def apres(t, regles):
    for a, b in regles:
        t = re.sub(a, b, t)
    return t

CLES = {
    'Dimensions (L x P x H, mm)': ('Dimensions (W x D x H, mm)', 'Afmetingen (B x D x H, mm)'), 'Puissance (kW)': ('Power (kW)', 'Vermogen (kW)'),
    'Tension': ('Voltage', 'Spanning'), 'Poids (kg)': ('Weight (kg)', 'Gewicht (kg)'), 'Volume emballé (m³)': ('Packed volume (m³)', 'Verpakt volume (m³)'),
    'Poids Brut (kg)': ('Gross weight (kg)', 'Brutogewicht (kg)'), 'Poids brut (kg)': ('Gross weight (kg)', 'Brutogewicht (kg)'), 'Volume (m³)': ('Volume (m³)', 'Volume (m³)'),
    'Température': ('Temperature', 'Temperatuur'), 'Dimensions (mm)': ('Dimensions (mm)', 'Afmetingen (mm)'), 'Hp': ('HP', 'pk'), 'Remarque': ('Note', 'Opmerking'),
    'En dotation': ('Supplied with', 'Meegeleverd'), 'Puissance': ('Power', 'Vermogen'), 'Kcal/h': ('kcal/h', 'kcal/u'), 'Kcal/h (gaz)': ('kcal/h (gas)', 'kcal/u (gas)'),
    'Profondeur (mm)': ('Depth (mm)', 'Diepte (mm)'), 'Hauteur (mm)': ('Height (mm)', 'Hoogte (mm)'), 'Largeur (mm)': ('Width (mm)', 'Breedte (mm)'),
    'Tension (Volt)': ('Voltage (V)', 'Spanning (V)'), 'Puissance totale (kW)': ('Total power (kW)', 'Totaal vermogen (kW)'), 'Dimensions': ('Dimensions', 'Afmetingen'),
    'Sur demande': ('On request', 'Op aanvraag'), 'Poids': ('Weight', 'Gewicht'), 'Plage de température (° C)': ('Temperature range (°C)', 'Temperatuurbereik (°C)'),
    'Capacité': ('Capacity', 'Capaciteit'), 'Matériel': ('Material', 'Materiaal'), 'Matériau': ('Material', 'Materiaal'), 'Classe climatique': ('Climate class', 'Klimaatklasse'),
    'PLUS': ('PLUS', 'PLUS'), 'ADVANTAGE': ('ADVANTAGE', 'VOORDEEL'), 'ADVANTAGE - SAVE THE PLANET': ('ADVANTAGE - SAVE THE PLANET', 'VOORDEEL - DUURZAAM'),
    'Poids brut / net': ('Gross / net weight', 'Bruto / netto gewicht'), 'Volume brut / net': ('Gross / net volume', 'Bruto / netto volume'),
    'Dim. LxPxH intérieur (mm)': ('Internal dim. W x D x H (mm)', 'Binnenafm. B x D x H (mm)'), 'Fréquence de tension (Hz)': ('Frequency (Hz)', 'Frequentie (Hz)'),
    'Quantité de réfrigérant (gr)': ('Refrigerant charge (g)', 'Hoeveelheid koelmiddel (g)'), 'Réalisation': ('Construction', 'Uitvoering'),
    'Dimensions emballage (cm W x D x H)': ('Packaging dimensions (cm W x D x H)', 'Verpakkingsafmetingen (cm B x D x H)'), 'Poids net (Kg)': ('Net weight (kg)', 'Nettogewicht (kg)'),
    'Alimentation (volt)': ('Power supply (V)', 'Voeding (V)'), 'Capacité brut (Ltr)': ('Gross capacity (L)', 'Brutocapaciteit (L)'), 'Capacité nette (Ltr)': ('Net capacity (L)', 'Nettocapaciteit (L)'),
    'Gaz réfrigérant': ('Refrigerant gas', 'Koelgas'), 'Liquide de refroidissement': ('Refrigerant', 'Koelmiddel'), 'Type de refroidissement': ('Cooling type', 'Type koeling'),
    'Dimensions intérieures (LxPxH)': ('Internal dimensions (W x D x H)', 'Binnenafmetingen (B x D x H)'), 'Dimensions extérieures (cm W x D x H)': ('External dimensions (cm W x D x H)', 'Buitenafmetingen (cm B x D x H)'),
    'Dimensions intérieures (cm W x D x H)': ('Internal dimensions (cm W x D x H)', 'Binnenafmetingen (cm B x D x H)'), 'Dimension': ('Dimensions', 'Afmetingen'),
    'Nombre de portes': ('Number of doors', 'Aantal deuren'), 'Nombre de tiroirs': ('Number of drawers', 'Aantal laden'), 'Nombre des grilles': ('Number of shelves', 'Aantal roosters'),
    'Cuve': ('Bowl', 'Spoelbak'), 'Broches': ('Spits', 'Spitten'), 'Kg': ('Weight (kg)', 'Gewicht (kg)'), 'Tension en V': ('Voltage (V)', 'Spanning (V)'), 'Débit du moteur': ('Motor airflow', 'Debiet motor'), 'Dimensions en mm': ('Dimensions (mm)', 'Afmetingen (mm)'),
    'Le niveau de bruit (dB)': ('Noise level (dB)', 'Geluidsniveau (dB)'), 'Couleur': ('Colour', 'Kleur'), 'Type': ('Type', 'Type'), 'Décongélation': ('Defrosting', 'Ontdooiing'),
    'Consommation électrique (Kw/24h)': ('Power consumption (kWh/24 h)', 'Stroomverbruik (kWh/24 u)'), 'Plage de temperature (°c)': ('Temperature range (°C)', 'Temperatuurbereik (°C)'),
}
GROUPES = {'Dimensions et capacité': ('Dimensions and capacity', 'Afmetingen en capaciteit'), 'Alimentation': ('Power supply', 'Voeding'), 'Caractéristiques': ('Features', 'Kenmerken')}

def couper(t):
    # phrases d'un long texte, pour rester sous la longueur que le moteur traduit bien
    return [x for x in re.split(r'(?<=[.!?])\s+(?=[A-ZÀ-Ý0-9"«(])', t) if x.strip()]

# ---------- Segments à traduire ----------
segments = set()
for p in neufs:
    segments.update(p['points'])
    for t in p.get('texte') or []:
        segments.update(couper(t))
    for g, l in p['specs']:
        for k, v in l:
            if k not in CLES:
                segments.add(k)
            if re.search(r'[A-Za-zÀ-ÿ]{3,}', v):
                segments.add(v)
segments = sorted(s for s in segments if re.search(r'[A-Za-zÀ-ÿ]{2,}', s))
print('segments', len(segments), flush=True)
en = [apres(x, APRES_EN) for x in fr_en([avant(s) for s in segments])]
print('anglais fait', flush=True)
nl = [apres(x, APRES_NL) for x in en_nl(en)]
print('néerlandais fait', flush=True)
TR = {'en': dict(zip(segments, en)), 'nl': dict(zip(segments, nl))}
def tr(langue, s):
    return TR[langue].get(s, s)

# ---------- Fichiers par langue ----------
for k, langue in enumerate(('en', 'nl')):
    produits = {}
    for i, p in enumerate(neufs):
        texte = [' '.join(tr(langue, x) for x in couper(t)) for t in (p.get('texte') or [])]
        specs = [[GROUPES.get(g, (g, g))[k], [[CLES[c][k] if c in CLES else tr(langue, c), tr(langue, v) if re.search(r'[A-Za-zÀ-ÿ]{3,}', v) else v] for c, v in l]] for g, l in p['specs']]
        produits[p['id']] = {'n': NOMS[i][k], 'p': [tr(langue, x) for x in p['points']], 't': texte, 's': specs}
    js = (f"// Catalogue de la démo Discount Horeca en {'anglais' if langue == 'en' else 'néerlandais'} (version Premium) — généré par tools/discount-horeca/traduire.py.\n"
          "// Noms : traduction relue à la main. Points clés, textes et caractéristiques : traduction automatique (Argos Translate, en local),\n"
          "// signalée « à relire » dans la boutique.\n"
          "export const PRODUITS_TRAD = " + json.dumps(produits, ensure_ascii=False, separators=(',', ':')) + ";\n")
    open(f"{SITE}/js/catalogue-{langue}.js", 'w', encoding='utf-8').write(js)
    print(langue, len(produits), 'produits', round(len(js) / 1024), 'Ko', flush=True)

# ---------- catalogue.js avec les noms corrigés ----------
entete = src[:src.index('export const RELEVE')]
out = entete + 'export const RELEVE = ' + json.dumps(RELEVE, ensure_ascii=False) + ';\n'
out += 'export const FAMILLES = ' + json.dumps(FAMILLES, ensure_ascii=False, indent=1) + ';\n'
out += 'export const PRODUITS = [\n' + ',\n'.join(json.dumps(p, ensure_ascii=False, separators=(',', ':')) for p in PRODUITS) + '\n];\n'
open(SITE + '/js/catalogue.js', 'w', encoding='utf-8').write(out)
print('catalogue.js mis à jour')
