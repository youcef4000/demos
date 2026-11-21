# Traductions manuelles (NL, EN) des gammes, catégories et textes éditoriaux de la boutique Discount Horeca.
# Source française : sites/discount-horeca/js/catalogue.js (FAMILLES) et js/univers.js (UNIVERS, FAQ, ETAPES).
# Utilisé par i18n_ui.py pour écrire js/i18n-nl.js et js/i18n-en.js.

FAMILLES = {
    'nl': {
        'froid': {'nom': 'Koeling', 'court': 'Koeling', 'description': 'Gekoelde toonbanken en vitrines, koelkasten, saladettes, koelwerkbanken, ijsblokjesmachines en koelcellen.'},
        'cuisson': {'nom': 'Koken', 'court': 'Koken', 'description': 'Kookplaten en fornuizen van de reeksen 600 tot 900, combi-stoomovens, bakplaten, lavasteengrills, pastakokers, wokfornuizen en kookketels.'},
        'friterie-snack': {'nom': 'Frituur & snack', 'court': 'Frituur & snack', 'description': 'Friteuses met hoog rendement, gyrosgrills, paninigrills en salamanders, kippengrills, pannenkoekplaten, wafelijzers en warmhoudvitrines.'},
        'pizzeria': {'nom': 'Pizzeria', 'court': 'Pizzeria', 'description': 'Elektrische pizzaovens, gasovens en bandovens, spiraalkneders, deegrollers, deegverdelers, pizzawerkbanken, raspen en toebehoren.'},
        'preparation': {'nom': 'Voorbereiding & slagerij', 'court': 'Voorbereiding', 'description': 'Snijmachines, gehaktmolens, beenderzagen, cutters, groentesnijders, staafmixers, mengers, vacuümmachines, weegschalen en GN-bakken.'},
        'cafe-dessert': {'nom': 'Koffie, bar & zelfbediening', 'court': 'Koffie & bar', 'description': 'Koffiemachines, koffiemolens, barkoelkasten, citruspersen en warme of koude buffetten.'},
        'lavage': {'nom': 'Vaatwas', 'court': 'Vaatwas', 'description': 'Professionele glazen- en vaatwasmachines, voorladers of doorschuifmodellen.'},
        'inox': {'nom': 'Inox made in Belgium', 'court': 'Inox', 'description': 'Werktafels, spoeltafels, kasten, rekken, wagens en handwasbakken in inox, gemaakt in België.'},
        'hottes': {'nom': 'Dampkappen made in Belgium', 'court': 'Dampkappen', 'description': 'Wand- en eilanddampkappen, complete dampkappen met motor, condensatiekappen en compensatiekappen, motoren en snelheidsregelaars.'},
    },
    'en': {
        'froid': {'nom': 'Refrigeration', 'court': 'Refrigeration', 'description': 'Refrigerated counters and display cases, fridges, saladettes, refrigerated tables, ice machines and cold rooms.'},
        'cuisson': {'nom': 'Cooking', 'court': 'Cooking', 'description': 'Hobs and ranges from the 600 to 900 series, combi steam ovens, griddles, lava stone grills, pasta cookers, woks and boiling pans.'},
        'friterie-snack': {'nom': 'Chip shop & snack', 'court': 'Chip shop & snack', 'description': 'High-output fryers, gyros grills, panini grills and salamanders, chicken rotisseries, crêpe makers, waffle irons and heated displays.'},
        'pizzeria': {'nom': 'Pizzeria', 'court': 'Pizzeria', 'description': 'Electric, gas and conveyor pizza ovens, spiral mixers, dough rollers, dough dividers, pizza prep tables, cheese graters and accessories.'},
        'preparation': {'nom': 'Food prep & butchery', 'court': 'Food prep', 'description': 'Slicers, mincers, bone saws, cutters, vegetable cutters, stick blenders, mixers, vacuum packers, scales and gastronorm pans.'},
        'cafe-dessert': {'nom': 'Coffee, bar & self-service', 'court': 'Coffee & bar', 'description': 'Coffee machines, grinders, bar fridges, citrus juicers and hot or cold buffets.'},
        'lavage': {'nom': 'Warewashing', 'court': 'Warewashing', 'description': 'Professional glasswashers and dishwashers, front-loading or pass-through hood type.'},
        'inox': {'nom': 'Stainless steel made in Belgium', 'court': 'Stainless steel', 'description': 'Stainless steel work tables, sinks, cabinets, shelving, trolleys and hand basins, made in Belgium.'},
        'hottes': {'nom': 'Hoods made in Belgium', 'court': 'Hoods', 'description': 'Wall and island hoods, complete hoods with motor, condensation hoods and compensating hoods, motors and speed controllers.'},
    },
}

SOUS = {
    'nl': {
        'comptoirs-refrigeres': 'Gekoelde toonbanken', 'vitrines-refrigerees': 'Koelvitrines', 'vitrines-boissons': 'Drankkoelkasten',
        'armoires-frigorifiques': 'Koelkasten', 'saladettes': 'Saladettes en voorbereidingstafels', 'tables-refrigerees': 'Koelwerkbanken',
        'machines-a-glacons': 'IJsblokjesmachines', 'chambres-froides': 'Koelcellen', 'congelateurs-bahut': 'Kisttoestellen',
        'plaques-de-cuisson': 'Kookplaten', 'cuisinieres': 'Fornuizen', 'grillades': 'Grills en stoomgrills', 'planchas': 'Bakplaten',
        'cuiseurs-a-pates': 'Pastakokers', 'woks': 'Wokfornuizen', 'marmites': 'Kookketels en kantelbraadpannen', 'fours-mixtes': 'Combi-stoomovens',
        'fours-patisserie': 'Ovens voor bakkerij en patisserie', 'micro-ondes': 'Professionele microgolfovens', 'maintien-au-chaud': 'Warmhouden',
        'petit-materiel-cuisson': 'Klein kookmateriaal',
        'friteuses': 'Friteuses', 'grills-kebab': 'Gyrosgrills', 'grills-panini': 'Paninigrills en salamanders', 'rotissoires': 'Kippengrills',
        'crepieres-gaufriers': 'Pannenkoekplaten en wafelijzers', 'vitrines-chauffantes': 'Warmhoudvitrines',
        'fours-a-pizza': 'Pizzaovens', 'petrins': 'Kneedmachines voor pizzeria', 'laminoirs-diviseuses': 'Deegrollers en deegverdelers',
        'tables-a-pizza': 'Pizzawerkbanken', 'rapes-fromage': 'Kaasraspen', 'accessoires-pizza': 'Pizzatoebehoren',
        'trancheuses': 'Snijmachines', 'hachoirs': 'Gehaktmolens en mengers', 'boucherie': 'Beenderzagen, vleesmalsers, worstvullers',
        'cutters-coupe-legumes': 'Cutters en groentesnijders', 'mixeurs': 'Staafmixers', 'batteurs-petrins': 'Mengers en bakkerijkneders',
        'sous-vide': 'Vacuümmachines', 'balances': 'Weegschalen', 'bacs-gastro': 'Gastronormbakken', 'ustensiles': 'Klein materiaal en keukengerei',
        'machines-a-cafe': 'Koffiemachines', 'moulins-a-cafe': 'Koffiemolens', 'frigos-de-bar': 'Barkoelkasten', 'presse-agrumes': 'Citruspersen',
        'buffets': 'Zelfbedieningsbuffetten',
        'lave-verres': 'Glazenwasmachines', 'lave-vaisselle': 'Vaatwasmachines',
        'tables-inox': 'Inox werktafels', 'plonges': 'Inox spoeltafels', 'armoires-inox': 'Inox kasten', 'etageres-inox': 'Rekken en consoles',
        'chariots': 'Wagens en hordenwagens', 'hygiene': 'Handwasbakken en hygiëne',
        'hottes-completes': 'Complete dampkappen met motor', 'hottes-murales': 'Wanddampkappen', 'hottes-centrales': 'Eilanddampkappen',
        'hottes-vapeur': 'Condensatiekappen', 'hottes-compensation': 'Compensatiekappen', 'moteurs-hottes': 'Afzuigmotoren', 'variateurs': 'Snelheidsregelaars',
    },
    'en': {
        'comptoirs-refrigeres': 'Refrigerated counters', 'vitrines-refrigerees': 'Refrigerated display cases', 'vitrines-boissons': 'Drinks fridges',
        'armoires-frigorifiques': 'Upright fridges and freezers', 'saladettes': 'Saladettes and prep tables', 'tables-refrigerees': 'Refrigerated tables',
        'machines-a-glacons': 'Ice machines', 'chambres-froides': 'Cold rooms', 'congelateurs-bahut': 'Chest freezers',
        'plaques-de-cuisson': 'Hobs', 'cuisinieres': 'Ranges and cookers', 'grillades': 'Grills and steam grills', 'planchas': 'Griddles',
        'cuiseurs-a-pates': 'Pasta cookers', 'woks': 'Woks', 'marmites': 'Boiling pans and tilting pans', 'fours-mixtes': 'Combi steam ovens',
        'fours-patisserie': 'Bakery and pastry ovens', 'micro-ondes': 'Commercial microwaves', 'maintien-au-chaud': 'Hot holding',
        'petit-materiel-cuisson': 'Small cooking equipment',
        'friteuses': 'Fryers', 'grills-kebab': 'Gyros grills', 'grills-panini': 'Panini grills and salamanders', 'rotissoires': 'Chicken rotisseries',
        'crepieres-gaufriers': 'Crêpe makers and waffle irons', 'vitrines-chauffantes': 'Heated displays',
        'fours-a-pizza': 'Pizza ovens', 'petrins': 'Pizzeria dough mixers', 'laminoirs-diviseuses': 'Dough rollers and dividers',
        'tables-a-pizza': 'Pizza prep tables', 'rapes-fromage': 'Cheese graters', 'accessoires-pizza': 'Pizza accessories',
        'trancheuses': 'Slicers', 'hachoirs': 'Mincers and mixers', 'boucherie': 'Bone saws, tenderisers, sausage fillers',
        'cutters-coupe-legumes': 'Cutters and vegetable cutters', 'mixeurs': 'Stick blenders', 'batteurs-petrins': 'Planetary mixers and bakery mixers',
        'sous-vide': 'Vacuum packers', 'balances': 'Scales', 'bacs-gastro': 'Gastronorm pans', 'ustensiles': 'Smallwares and utensils',
        'machines-a-cafe': 'Coffee machines', 'moulins-a-cafe': 'Coffee grinders', 'frigos-de-bar': 'Bar fridges', 'presse-agrumes': 'Citrus juicers',
        'buffets': 'Self-service buffets',
        'lave-verres': 'Glasswashers', 'lave-vaisselle': 'Dishwashers',
        'tables-inox': 'Stainless steel tables', 'plonges': 'Stainless steel sinks', 'armoires-inox': 'Stainless steel cabinets', 'etageres-inox': 'Shelving and brackets',
        'chariots': 'Trolleys and racks', 'hygiene': 'Hand basins and hygiene',
        'hottes-completes': 'Complete hoods with motor', 'hottes-murales': 'Wall hoods', 'hottes-centrales': 'Island hoods',
        'hottes-vapeur': 'Condensation hoods', 'hottes-compensation': 'Compensating hoods', 'moteurs-hottes': 'Extraction motors', 'variateurs': 'Speed controllers',
    },
}

UNIVERS = {'nl': {}, 'en': {}}

UNIVERS['nl']['froid'] = {
    'pastille': 'Alle horecakoeling',
    'titre': ['Professionele koeling', 'tegen discountprijzen'],
    'intro': 'Gekoelde toonbanken en vitrines, koelkasten, saladettes, koelwerkbanken, ijsblokjesmachines en koelcellen: commerciële koeling voor restaurants, snackbars, bakkerijen en winkels, geleverd in heel België.',
    'seo': [
        'Discount Horeca levert professionele koeling aan keukens en toonbanken in Brussel, Wallonië en Vlaanderen: koel- en vrieskasten, drankkoelkasten met glazen deuren, patisserie- en panoramische vitrines, koelwerkbanken in de reeksen 600, 700 en 800, pizzasaladettes en ijsblokjesmachines.',
        'Elke productfiche vermeldt de prijs excl. en incl. btw, de afmetingen en de aansluiting. De showroommodellen kunt u bekijken in de showroom in Sint-Pieters-Leeuw, op enkele minuten van de E19 en de Brusselse Ring.',
    ],
    'faq': [
        ['Levert u koelkasten op de verdieping?', 'De standaardlevering gebeurt door een koerier, voor de deur, op het gelijkvloers. Voor plaatsing of aansluiting kiest u „Levering + installatie”: wij maken een offerte op maat.'],
        ['Maakt u koelcellen op maat?', 'Ja: panelen van 80 mm met vloer, ingebouwd monoblok of aparte koelgroep. Stuur uw binnenafmetingen vanuit het winkelmandje („Offerte aanvragen”).'],
    ],
    'sous': {
        'comptoirs-refrigeres': 'Gekoelde toonbanken en toonbankvitrines, statisch of geventileerd: slagerij, viswinkel, patisserie en ijs.',
        'vitrines-refrigerees': 'Gekoelde tafelvitrines, panoramische koel- en vriesvitrines, wandvitrines voor charcuterie, kaas en zelfbediening.',
        'vitrines-boissons': 'Drankkoelkasten met glazen draai- of schuifdeuren, voor cafés, snackbars, nachtwinkels en buurtwinkels.',
        'armoires-frigorifiques': 'Inox koel- en vrieskasten, patisseriekasten 600 × 400, rijs- en rijpingskasten.',
        'saladettes': 'Gekoelde saladettes en voorbereidingstafels met gastronormbakken, saladette-opzetstukken en toonbanken.',
        'tables-refrigerees': 'Koel- en vrieswerkbanken, compact of in de reeksen 600, 700 en 800, en lage koelwerkbanken.',
        'machines-a-glacons': 'IJsblokjesmachines voor holle, volle of platte blokjes, ijskorrels of schilferijs, voor bars, restaurants en viswinkels.',
        'chambres-froides': 'Koelcellen in panelen van 80 mm met vloer, ingebouwde monoblokken en koelgroepen voor koelen of vriezen.',
        'congelateurs-bahut': 'Professionele kisttoestellen met volle of glazen deksel, voor de opslag en verkoop van diepvriesproducten en ijs.',
    },
}
UNIVERS['en']['froid'] = {
    'pastille': 'All catering refrigeration',
    'titre': ['Commercial refrigeration', 'at discount prices'],
    'intro': 'Refrigerated counters and display cases, upright fridges, saladettes, refrigerated tables, ice machines and cold rooms: commercial refrigeration for restaurants, snack bars, bakeries and shops, delivered anywhere in Belgium.',
    'seo': [
        'Discount Horeca equips kitchens and counters in Brussels, Wallonia and Flanders with commercial refrigeration: upright fridges and freezers, glass-door drinks fridges, pastry and panoramic display cases, refrigerated tables in the 600, 700 and 800 series, pizza saladettes and ice machines.',
        'Every product page shows the price excl. and incl. VAT, the dimensions and the power supply. Ex-display models can be seen at the showroom in Sint-Pieters-Leeuw, a few minutes from the E19 and the Brussels Ring.',
    ],
    'faq': [
        ['Do you deliver fridges upstairs?', 'Standard delivery is made by a carrier, to the door, on the ground floor. For installation or connection, choose “Delivery + installation”: we will send you a quote.'],
        ['Do you offer made-to-measure cold rooms?', 'Yes: 80 mm panels with floor, built-in monoblock or remote condensing unit. Send your internal dimensions from the basket (“Request a quote”).'],
    ],
    'sous': {
        'comptoirs-refrigeres': 'Refrigerated counters and countertop display cases, static or fan-assisted: butchery, fishmonger, pastry and ice cream.',
        'vitrines-refrigerees': 'Countertop display cases, panoramic chilled and frozen displays, wall-mounted cases for cooked meats, cheese and self-service.',
        'vitrines-boissons': 'Drinks fridges with hinged or sliding glass doors, for cafés, snack bars, night shops and convenience stores.',
        'armoires-frigorifiques': 'Stainless steel upright fridges and freezers, 600 × 400 pastry cabinets, proving and dry-ageing cabinets.',
        'saladettes': 'Refrigerated saladettes and prep tables with gastronorm pans, saladette toppers and counters.',
        'tables-refrigerees': 'Refrigerated and freezer tables, compact or in the 600, 700 and 800 series, and low refrigerated tables.',
        'machines-a-glacons': 'Ice machines for hollow, solid or flat cubes, nugget or flake ice, for bars, restaurants and fishmongers.',
        'chambres-froides': 'Cold rooms in 80 mm panels with floor, built-in monoblocks and chiller or freezer condensing units.',
        'congelateurs-bahut': 'Commercial chest freezers with solid or glass lids, for storing and selling frozen food and ice cream.',
    },
}

UNIVERS['nl']['cuisson'] = {
    'pastille': 'Alles om professioneel te koken',
    'titre': ['Professioneel koken,', 'op gas of elektrisch'],
    'intro': 'Kookplaten en fornuizen in de reeksen 600 tot 900, combi-stoomovens met touchscreen, bakplaten, lavasteengrills, pastakokers, wokfornuizen en kookketels: de complete kooklijn voor Belgische restaurants.',
    'seo': [
        'De kookzone is het hart van een horecakeuken. Discount Horeca biedt fornuizen op gas of elektrisch, kookplaten, lavasteengrills, verchroomde of stalen bakplaten, wokfornuizen met watergordijn en combi-stoomovens, in modulaire reeksen om een samenhangende kooklijn samen te stellen.',
        'Gastoestellen werken op aardgas of propaan, naargelang het model: de fiche vermeldt de aansluiting en het vermogen. Aansluiting door een erkend installateur bestelt u met de optie „Levering + installatie”.',
    ],
    'faq': [
        ['Welke reeks kiezen: 600, 700 of 900?', 'Het getal geeft de diepte van het toestel (600, 650, 700 of 900 mm). Neem dezelfde reeks voor de hele kooklijn: de toestellen staan dan op één lijn en passen op dezelfde onderbouw.'],
        ['Werken de gastoestellen op propaan?', 'Veel modellen bestaan in aardgas of propaan. Vermeld uw gastype in de bestelling of offerteaanvraag: wij controleren de uitvoering en de ombouwkit.'],
    ],
    'sous': {
        'plaques-de-cuisson': 'Kookplaten op gas en elektrisch in de reeksen 600, 650, 700 en 900, als tafelmodel of op onderbouw.',
        'cuisinieres': 'Professionele fornuizen op gas of elektrisch, met oven, in de reeksen 600 tot 900.',
        'grillades': 'Lavasteengrills op gas en stoomgrills, voor vlees, brochettes en gegrilde groenten.',
        'planchas': 'Bakplaten op gas en elektrisch, gladde, geribde of verchroomde platen, om op het werkblad te plaatsen.',
        'cuiseurs-a-pates': 'Pastakokers op gas en elektrisch, met manden, voor Italiaanse restaurants en grootkeukens.',
        'woks': 'Tafelwoks en Aziatische wokfornuizen met watergordijn, met 1 tot 3 krachtige branders.',
        'marmites': 'Kookketels en kantelbraadpannen op gas of elektrisch, van 50 tot 60 liter, voor grote producties.',
        'fours-mixtes': 'Combi-stoomovens op gas of elektrisch, mechanisch of met touchscreen, van 7 tot 11 niveaus GN 1/1.',
        'fours-patisserie': 'Heteluchtovens voor patisserie en bakkerij, op gas of elektrisch, voor platen van 600 × 400.',
        'micro-ondes': 'Professionele microgolfovens om snel op te warmen.',
        'maintien-au-chaud': 'GN-voedselwarmers, warmhoudvitrines en warmhoudbruggen met infraroodlampen.',
        'petit-materiel-cuisson': 'Elektrisch klein kookmateriaal: inductieplaten, worstenwarmers, broodroosters met band.',
    },
}
UNIVERS['en']['cuisson'] = {
    'pastille': 'Everything for professional cooking',
    'titre': ['Professional cooking,', 'gas or electric'],
    'intro': 'Hobs and ranges in the 600 to 900 series, touchscreen combi steam ovens, griddles, lava stone grills, pasta cookers, woks and boiling pans: the complete cooking line for Belgian restaurants.',
    'seo': [
        'The cooking line is the heart of a commercial kitchen. Discount Horeca offers gas or electric ranges, hobs, lava stone grills, chrome or steel griddles, water-cooled woks and combi steam/convection ovens, in modular series to build a consistent line.',
        'Gas appliances run on natural gas or propane depending on the model: the product page states the supply and the power rating. Connection by a certified installer can be ordered with the “Delivery + installation” option.',
    ],
    'faq': [
        ['Which series should I choose: 600, 700 or 900?', 'The number is the depth of the appliance (600, 650, 700 or 900 mm). Use the same series for the whole cooking line: the appliances line up and sit on the same stands.'],
        ['Do the gas appliances run on propane?', 'Many models are available for natural gas or propane. State your gas type in the order or quote request: we check the version and the conversion kit.'],
    ],
    'sous': {
        'plaques-de-cuisson': 'Gas and electric hobs in the 600, 650, 700 and 900 series, countertop or on a stand.',
        'cuisinieres': 'Professional gas or electric ranges with oven, in the 600 to 900 series.',
        'grillades': 'Gas lava stone grills and steam grills, for meat, skewers and grilled vegetables.',
        'planchas': 'Gas and electric griddles with smooth, ribbed or chrome plates, for the worktop.',
        'cuiseurs-a-pates': 'Gas and electric pasta cookers with baskets, for Italian restaurants and institutional kitchens.',
        'woks': 'Countertop woks and water-cooled Asian wok ranges, with 1 to 3 high-power burners.',
        'marmites': 'Gas or electric boiling pans and tilting pans, 50 to 60 litres, for large production runs.',
        'fours-mixtes': 'Gas or electric combi steam/convection ovens, manual or touchscreen, 7 to 11 GN 1/1 levels.',
        'fours-patisserie': 'Gas or electric convection ovens for pastry and bakery, for 600 × 400 trays.',
        'micro-ondes': 'Commercial microwave ovens for fast reheating.',
        'maintien-au-chaud': 'GN food warmers, heated displays and infrared heat lamp gantries.',
        'petit-materiel-cuisson': 'Small electric cooking equipment: induction hobs, sausage warmers, conveyor toasters.',
    },
}

UNIVERS['nl']['friterie-snack'] = {
    'pastille': 'Frituur, snackbar en broodjeszaak',
    'titre': ['Frituur & snack,', 'uitgerust op z’n Belgisch'],
    'intro': 'Friteuses op gas en elektrisch met hoog rendement, gyrosgrills, paninigrills en salamanders, kippengrills, pannenkoekplaten, wafelijzers en warmhoudvitrines: alles voor de frituur, de snackbar en de broodjeszaak.',
    'seo': [
        'De Belgische friet vraagt friteuses die de drukte aankunnen: ronde kuipen met hoog rendement, gasfriteuses in de reeksen 600, 700 en 900, elektrische tafelfriteuses. Discount Horeca richt frituren, snackbars, kebabzaken en broodjeszaken in heel België in.',
        'Gyrosgrills op gas of elektrisch, paninigrills, tosti-ijzers en salamanders, kippengrills, pannenkoekplaten en wafelijzers: vergelijk vermogens en afmetingen en laat leveren binnen 24 tot 72 uur als het model op voorraad is.',
    ],
    'faq': [
        ['Welke friteuse voor een frituur?', 'Kies voor een frituur een gasfriteuse met hoog rendement en ronde kuipen (2 × 13 liter of meer): ze komt snel weer op temperatuur tussen twee baden. Onze verkopers adviseren u in de showroom of via WhatsApp.'],
        ['Kan ik de friteuses bekijken voor ik koop?', 'Ja: kom langs in de showroom in Sint-Pieters-Leeuw, van maandag tot zaterdag van 9 tot 17 u. Gratis parking.'],
    ],
    'sous': {
        'friteuses': 'Professionele friteuses op gas en elektrisch: hoog rendement met ronde kuipen, reeksen 600, 700 en 900, tafelfriteuses.',
        'grills-kebab': 'Elektrische gyrosgrills of op gas, voor spiesen van 20 tot 55 kg vlees.',
        'grills-panini': 'Paninigrills met gladde of geribde platen, tosti-ijzers en salamanders voor de broodjeszaak en de snackbar.',
        'rotissoires': 'Kippengrills op gas, met 2 tot 6 spiesen, kippengrills met schommels en warmhoudkasten voor kip.',
        'crepieres-gaufriers': 'Elektrische pannenkoekplaten met hoog rendement Ø 400 mm, enkel of dubbel, en professionele wafelijzers.',
        'vitrines-chauffantes': 'Warmhoudvitrines voor snacks, koffiekoeken en bereide gerechten, om op de toonbank te plaatsen.',
    },
}
UNIVERS['en']['friterie-snack'] = {
    'pastille': 'Chip shop, snack bar and sandwich bar',
    'titre': ['Chip shop & snack,', 'equipped the Belgian way'],
    'intro': 'High-output gas and electric fryers, gyros grills, panini grills and salamanders, chicken rotisseries, crêpe makers, waffle irons and heated displays: everything for the chip shop, the snack bar and the sandwich bar.',
    'seo': [
        'Belgian fries need fryers that can handle the rush: high-output round tanks, gas fryers in the 600, 700 and 900 series, countertop electric fryers. Discount Horeca equips chip shops, snack bars, kebab shops and sandwich bars all over Belgium.',
        'Gas or electric gyros grills, panini grills, toasters and salamanders, chicken rotisseries, crêpe makers and waffle irons: compare power ratings and dimensions, then get delivery within 24 to 72 hours when the model is in stock.',
    ],
    'faq': [
        ['Which fryer for a chip shop?', 'For a chip shop, go for a high-output gas fryer with round tanks (2 × 13 litres or more): it recovers temperature quickly between batches. Our sales team can advise you at the showroom or on WhatsApp.'],
        ['Can I see the fryers before buying?', 'Yes: visit the showroom in Sint-Pieters-Leeuw, Monday to Saturday from 9 am to 5 pm. Free parking.'],
    ],
    'sous': {
        'friteuses': 'Professional gas and electric fryers: high-output round tanks, 600, 700 and 900 series, countertop fryers.',
        'grills-kebab': 'Electric or gas gyros grills, for 20 to 55 kg meat cones.',
        'grills-panini': 'Panini grills with smooth or ribbed plates, toasters and salamanders for sandwich and snack bars.',
        'rotissoires': 'Gas chicken rotisseries with 2 to 6 spits, basket rotisseries and heated chicken cabinets.',
        'crepieres-gaufriers': 'High-output electric crêpe makers Ø 400 mm, single or double, and professional waffle irons.',
        'vitrines-chauffantes': 'Countertop heated displays for snacks, pastries and ready meals.',
    },
}

UNIVERS['nl']['pizzeria'] = {
    'pastille': 'Alles voor de pizzeria',
    'titre': ['De complete pizzeria,', 'van kneder tot oven'],
    'intro': 'Elektrische pizzaovens en gasovens, bandovens, spiraalkneders, deegrollers, deegverdeel- en bolmachines, gekoelde pizzawerkbanken, kaasraspen en toebehoren: de complete uitrusting van een pizzeria.',
    'seo': [
        'Een pizzeria openen of opnieuw inrichten vraagt een complete keten: spiraalkneder, deegverdeel- en bolmachine, deegroller, gekoelde pizzawerkbank met saladette, elektrische steenoven of bandoven, en de toebehoren van de pizzaiolo. Discount Horeca brengt al het pizzeriamateriaal samen in één winkel, met een pizzeriapack dat klaar is om te bestellen.',
        'Elke fiche vermeldt het aantal en de diameter van de pizza’s, de inhoud van de kuip in kilo deeg, de aansluiting en de afmetingen.',
    ],
    'faq': [
        ['Hebt u een compleet pizzeriapack?', 'Ja: de rubriek „Packs” bundelt oven, kneder, pizzawerkbank en deegroller, in één klik in het winkelmandje of om te zetten in een offerte.'],
        ['Elektrische oven of gasoven?', 'De elektrische steenoven is eenvoudig te installeren en bakt gelijkmatig; de gasoven verlaagt de energiefactuur bij grote volumes. De bandoven past bij levering aan huis en hoge debieten.'],
    ],
    'sous': {
        'fours-a-pizza': 'Elektrische pizzaovens en gasovens, met een of twee bakkamers, en bandovens voor hoge debieten.',
        'petrins': 'Spiraalkneders voor pizzeria, met vaste of kantelbare kop, een of twee snelheden, van 10 tot 50 liter.',
        'laminoirs-diviseuses': 'Pizzadeegrollers, deegverdelers en bolmachines voor gelijkmatige deegballen en tijdwinst.',
        'tables-a-pizza': 'Gekoelde pizzawerkbanken met granieten blad en saladette met gastronormbakken.',
        'rapes-fromage': 'Elektrische kaasraspen voor mozzarella, parmezaan en brood.',
        'accessoires-pizza': 'Pizzascheppen, pizzasnijders, platen en toebehoren voor de pizzaiolo.',
    },
}
UNIVERS['en']['pizzeria'] = {
    'pastille': 'Everything for the pizzeria',
    'titre': ['The complete pizzeria,', 'from mixer to oven'],
    'intro': 'Electric and gas pizza ovens, conveyor ovens, spiral mixers, dough rollers, dough dividers and rounders, refrigerated pizza prep tables, cheese graters and accessories: the full kit for a pizzeria.',
    'seo': [
        'Opening or refitting a pizzeria takes a complete chain: spiral mixer, dough divider and rounder, dough roller, refrigerated pizza table with saladette, electric deck oven or conveyor oven, and the pizzaiolo’s accessories. Discount Horeca brings all the pizzeria equipment together in one store, with a pizzeria pack ready to order.',
        'Each product page states the number and diameter of pizzas, the bowl capacity in kilos of dough, the power supply and the dimensions.',
    ],
    'faq': [
        ['Do you have a complete pizzeria pack?', 'Yes: the “Packs” section brings together oven, mixer, pizza table and dough roller, to add to the basket in one click or turn into a quote.'],
        ['Electric or gas oven?', 'An electric deck oven is easy to install and bakes evenly; a gas oven cuts the energy bill on large volumes. A conveyor oven suits delivery and high throughput.'],
    ],
    'sous': {
        'fours-a-pizza': 'Electric and gas pizza ovens, with one or two chambers, and conveyor ovens for high throughput.',
        'petrins': 'Spiral mixers for pizzerias, fixed or tilting head, one or two speeds, 10 to 50 litres.',
        'laminoirs-diviseuses': 'Pizza dough rollers, dividers and rounders for consistent dough balls and time savings.',
        'tables-a-pizza': 'Refrigerated pizza tables with granite top and gastronorm saladette.',
        'rapes-fromage': 'Electric cheese graters for mozzarella, parmesan and breadcrumbs.',
        'accessoires-pizza': 'Peels, pizza cutters, trays and pizzaiolo accessories.',
    },
}

UNIVERS['nl']['preparation'] = {
    'pastille': 'Voorbereiding en slagerij',
    'titre': ['Sneller voorbereiden,', 'slagerij inbegrepen'],
    'intro': 'Snijmachines, gehaktmolens, beenderzagen, vleesmalsers, cutters, groentesnijders, staafmixers, mengers, vacuümmachines, weegschalen en GN-bakken: voorbereidingsmateriaal voor restaurants, slagerijen en traiteurs.',
    'seo': [
        'Discount Horeca levert voorbereidingsmateriaal aan slagerijen, traiteurs en restaurantkeukens: snijmachines voor ham en vlees, gekoelde of niet-gekoelde gehaktmolens, vleesmengers, beenderzagen, vleesmalsers, worstvullers en hamburgerpersen.',
        'Voor keuken en patisserie: cutters en groentesnijders, staafmixers, planeetmengers, bakkerijkneders, vacuümmachines, weegschalen en inox gastronormbakken.',
    ],
    'faq': [
        ['Welke snijmachine voor charcuterie?', 'Een mes van 250 tot 300 mm volstaat voor de meeste restaurants en traiteurs; slagerijen verkiezen 300 tot 350 mm, met tandwielaandrijving.'],
    ],
    'sous': {
        'trancheuses': 'Professionele snijmachines voor ham en vlees, recht, schuin of verticaal, messen van 250 tot 350 mm.',
        'hachoirs': 'Gekoelde of niet-gekoelde gehaktmolens en vleesmengers voor slagerijen en traiteurs.',
        'boucherie': 'Beenderzagen, vleesmalsers, worstvullers en hamburgerpersen.',
        'cutters-coupe-legumes': 'Professionele cutters en groentesnijders, met schijven om te snijden, te raspen en in blokjes te snijden.',
        'mixeurs': 'Professionele staafmixers, staven van 250 tot 500 mm, met of zonder snelheidsregeling.',
        'batteurs-petrins': 'Planeetmengers, kneders en deeguitrolmachines voor bakkerij en patisserie.',
        'sous-vide': 'Vacuümmachines met klok voor bewaring en garen op lage temperatuur.',
        'balances': 'Professionele keukenweegschalen.',
        'bacs-gastro': 'Inox gastronormbakken, van GN 1/9 tot GN 2/1, en deksels.',
        'ustensiles': 'Klein materiaal en keukengerei: snijplanken, pollepels, vergieten, kommen en tafelgerei.',
    },
}
UNIVERS['en']['preparation'] = {
    'pastille': 'Food prep and butchery',
    'titre': ['Prep faster,', 'butchery included'],
    'intro': 'Slicers, mincers, bone saws, tenderisers, cutters, vegetable cutters, stick blenders, mixers, vacuum packers, scales and gastronorm pans: food prep equipment for restaurants, butchers and caterers.',
    'seo': [
        'Discount Horeca supplies butchers, caterers and restaurant kitchens with food prep equipment: ham and meat slicers, refrigerated or standard mincers, meat mixers, bone saws, tenderisers, sausage fillers and burger presses.',
        'For the kitchen and pastry: cutters and vegetable cutters, stick blenders, planetary mixers, bakery dough mixers, vacuum packers, scales and stainless steel gastronorm pans.',
    ],
    'faq': [
        ['Which slicer for cooked meats?', 'A 250 to 300 mm blade suits most restaurants and caterers; butchers prefer 300 to 350 mm with gear drive.'],
    ],
    'sous': {
        'trancheuses': 'Professional ham and meat slicers, straight, angled or vertical, 250 to 350 mm blades.',
        'hachoirs': 'Refrigerated or standard meat mincers and meat mixers for butchers and caterers.',
        'boucherie': 'Bone saws, tenderisers, sausage fillers and burger presses.',
        'cutters-coupe-legumes': 'Professional cutters and vegetable cutters, with discs for slicing, grating and dicing.',
        'mixeurs': 'Professional stick blenders, 250 to 500 mm shafts, with or without speed control.',
        'batteurs-petrins': 'Planetary mixers, dough mixers and dough sheeters for bakery and pastry.',
        'sous-vide': 'Chamber vacuum packers for storage and low-temperature cooking.',
        'balances': 'Professional kitchen scales.',
        'bacs-gastro': 'Stainless steel gastronorm pans, GN 1/9 to GN 2/1, and lids.',
        'ustensiles': 'Smallwares and utensils: boards, ladles, colanders, bowls and tableware.',
    },
}

UNIVERS['nl']['cafe-dessert'] = {
    'pastille': 'Koffie, bar en zelfbediening',
    'titre': ['Koffie, dessert', '& zelfbediening'],
    'intro': 'Koffiemachines, koffiemolens, barkoelkasten, citruspersen en warme of koude buffetten: de toog van het café, de bar en de ontbijtzaal.',
    'seo': [
        'Voor cafés, bars, hotels en tearooms: professionele espressomachines, koffiemolens, bar- en achterbarkoelkasten, citruspersen en warme of koude buffetten voor zelfbediening en ontbijt.',
    ],
    'faq': [
        ['Installeert u koffiemachines?', 'Machines met wateraansluiting vragen een toevoer en een afvoer. Kies „Levering + installatie” voor een aansluiting op offerte.'],
    ],
    'sous': {
        'machines-a-cafe': 'Professionele espressomachines met 2 of 3 groepen, halfautomatisch of automatisch.',
        'moulins-a-cafe': 'Professionele koffiemolens met doseerder of on demand.',
        'frigos-de-bar': 'Barkoelers en flessenkoelers met 3 of 4 glazen deuren.',
        'presse-agrumes': 'Professionele citruspersen voor vers sap aan de toog.',
        'buffets': 'Warme en koude buffetten voor zelfbediening, ontbijt en kantines.',
    },
}
UNIVERS['en']['cafe-dessert'] = {
    'pastille': 'Coffee, bar and self-service',
    'titre': ['Coffee, dessert', '& self-service'],
    'intro': 'Coffee machines, grinders, bar fridges, citrus juicers and hot or cold buffets: the counter of the café, the bar and the breakfast room.',
    'seo': [
        'For cafés, bars, hotels and tea rooms: professional espresso machines, coffee grinders, bar and back-bar fridges, citrus juicers, and hot or cold buffets for self-service and breakfast.',
    ],
    'faq': [
        ['Do you install coffee machines?', 'Plumbed-in machines need a water supply and a drain. Choose “Delivery + installation” for a connection priced on quotation.'],
    ],
    'sous': {
        'machines-a-cafe': 'Professional 2 or 3-group espresso machines, semi-automatic or automatic.',
        'moulins-a-cafe': 'Professional coffee grinders, doser or on-demand.',
        'frigos-de-bar': 'Back-bar coolers and bottle coolers with 3 or 4 glass doors.',
        'presse-agrumes': 'Professional citrus juicers for fresh juice at the counter.',
        'buffets': 'Hot and cold buffets for self-service, breakfast and canteens.',
    },
}

UNIVERS['nl']['lavage'] = {
    'pastille': 'Professionele vaatwas',
    'titre': ['Professionele glazen-', 'en vaatwasmachines'],
    'intro': 'Professionele glazen- en vaatwasmachines, voorladers of doorschuifmodellen, met korven van 350 tot 500 mm, afvoerpomp of waterontharder naargelang het model.',
    'seo': [
        'Een goede glazenwasser bespaart kostbare tijd achter de bar; een doorschuifvaatwasser houdt het tempo van een service van 100 couverts bij. Discount Horeca biedt voorladers en doorschuifmodellen, met afvoerpomp en waterontharder naargelang de uitvoering.',
        'Vervolledig de vaatwaszone met een inox spoeltafel made in Belgium met ruimte voor vaatwasser, en aan- en afvoertafels.',
    ],
    'faq': [
        ['Is een waterontharder nodig?', 'In de meeste Belgische gemeenten is het water kalkrijk: een ingebouwde of externe waterontharder verlengt de levensduur van de machine. Kalkschade valt niet onder de garantie.'],
    ],
    'sous': {
        'lave-verres': 'Professionele glazenwasmachines (voorladers), korven van 350 tot 400 mm, voor bars en cafés.',
        'lave-vaisselle': 'Professionele vaatwasmachines, voorladers en doorschuifmodellen, korven van 500 mm, voor restaurants en grootkeukens.',
    },
}
UNIVERS['en']['lavage'] = {
    'pastille': 'Commercial warewashing',
    'titre': ['Commercial glasswashers', 'and dishwashers'],
    'intro': 'Commercial glasswashers and dishwashers, front-loading or pass-through hood type, with 350 to 500 mm baskets, drain pump or water softener depending on the model.',
    'seo': [
        'A good glasswasher saves precious time behind the bar; a pass-through dishwasher keeps pace with a 100-cover service. Discount Horeca offers front-loading and hood-type models, with drain pump and water softener depending on the version.',
        'Complete the wash area with a Belgian-made stainless steel sink with dishwasher space, plus inlet and outlet tables.',
    ],
    'faq': [
        ['Do I need a water softener?', 'In most Belgian municipalities the water is hard: a built-in or external softener extends the life of the machine. Limescale damage is not covered by the warranty.'],
    ],
    'sous': {
        'lave-verres': 'Professional front-loading glasswashers, 350 to 400 mm baskets, for bars and cafés.',
        'lave-vaisselle': 'Professional front-loading and hood-type dishwashers, 500 mm baskets, for restaurants and institutional kitchens.',
    },
}

UNIVERS['nl']['inox'] = {
    'pastille': 'Inox gemaakt in België',
    'titre': ['Inox made in Belgium,', 'op maat'],
    'intro': 'Werktafels, spoeltafels, kasten, rekken, wagens en handwasbakken in inox, gemaakt in België, in reeksen met een diepte van 500 tot 800 mm.',
    'seo': [
        'Inox meubilair gemaakt in België is de specialiteit van Discount Horeca: werktafels met of zonder onderblad, spoeltafels met een of twee spoelbakken, spoeltafels met ruimte voor vaatwasser, kasten met draai- of schuifdeuren, warmhoudkasten, wandrekken en consoles.',
        'Kies de diepte (500, 600, 700 of 800 mm) volgens uw keuken. Voor een maat buiten de catalogus vraagt u een offerte aan: dankzij de Belgische productie is maatwerk mogelijk.',
    ],
    'faq': [
        ['Maakt u inox op maat?', 'Ja: werktafels, spoeltafels, rekken en dampkappen worden in België gemaakt. Geef de lengte, de diepte en de gewenste opties op in een offerteaanvraag.'],
        ['Welk inox wordt gebruikt?', 'De fiche vermeldt de staalsoort: geborsteld voedingsinox EN 1.4509 (AISI 441) voor de meeste werktafels en spoeltafels gemaakt in België, AISI 304 voor andere modellen.'],
    ],
    'sous': {
        'tables-inox': 'Inox werktafels gemaakt in België, reeksen 500 tot 800, met onderblad en spatrand.',
        'plonges': 'Inox spoeltafels made in Belgium met een of twee spoelbakken, met vaatwasruimte en aan- en afvoertafels.',
        'armoires-inox': 'Inox kasten met draai- of schuifdeuren, wandmodel of op poten, en warmhoudkasten.',
        'etageres-inox': 'Inox wandrekken, chefrekken en consoles, diepte 300 mm.',
        'chariots': 'Inox serveerwagens en hordenwagens.',
        'hygiene': 'Mengkranen met elleboogbediening, sproeidouches en vuilnisbakken in inox.',
    },
}
UNIVERS['en']['inox'] = {
    'pastille': 'Stainless steel made in Belgium',
    'titre': ['Stainless steel made in Belgium,', 'made to measure'],
    'intro': 'Stainless steel work tables, sinks, cabinets, shelving, trolleys and hand basins, made in Belgium, in depth series from 500 to 800 mm.',
    'seo': [
        'Belgian-made stainless steel furniture is Discount Horeca’s speciality: work tables with or without undershelf, single or double-bowl sinks, sinks with dishwasher space, cabinets with hinged or sliding doors, heated cabinets, wall shelves and brackets.',
        'Choose the depth (500, 600, 700 or 800 mm) to suit your kitchen. For a size not in the catalogue, ask for a quote: Belgian manufacturing makes bespoke sizes possible.',
    ],
    'faq': [
        ['Do you make stainless steel to measure?', 'Yes: tables, sinks, shelving and hoods are made in Belgium. Give the length, depth and options you need in a quote request.'],
        ['Which stainless steel is used?', 'The product page states the steel grade: brushed food-grade EN 1.4509 (AISI 441) for most of the Belgian-made tables and sinks, AISI 304 for other models.'],
    ],
    'sous': {
        'tables-inox': 'Belgian-made stainless steel work tables, 500 to 800 series, with undershelf and upstand.',
        'plonges': 'Belgian-made stainless steel sinks with one or two bowls, with dishwasher space and inlet and outlet tables.',
        'armoires-inox': 'Stainless steel cabinets with hinged or sliding doors, wall-mounted or on legs, and heated cabinets.',
        'etageres-inox': 'Stainless steel wall shelves, chef shelves and brackets, 300 mm deep.',
        'chariots': 'Stainless steel service trolleys and tray racks.',
        'hygiene': 'Elbow-operated mixer taps, pre-rinse sprays and stainless steel bins.',
    },
}

UNIVERS['nl']['hottes'] = {
    'pastille': 'Dampkappen made in Belgium',
    'titre': ['Dampkappen en afzuiging,', 'gemaakt in België'],
    'intro': 'Wand- en eilanddampkappen, complete dampkappen met motor, verlichting en snelheidsregelaar, condensatiekappen en compensatiekappen, afzuigmotoren en regelaars: keukenventilatie gemaakt in België.',
    'seo': [
        'Een professionele keuken moet vet, rook en damp afvoeren. Discount Horeca maakt in België inox wand- en eilanddampkappen, compleet geleverd met motor, lamp en snelheidsregelaar, en ook condensatiekappen voor combi-ovens en compensatiekappen.',
        'Afzuigmotoren en regelaars zijn ook apart te bestellen. De lengte van de dampkap kiest u volgens de kooklijn, met een overstek aan elke kant.',
    ],
    'faq': [
        ['Welke lengte van dampkap kiezen?', 'Reken de lengte van de kooklijn plus 15 tot 20 cm aan elke kant. Ons team helpt u de motor te dimensioneren volgens de lengte en het type koken.'],
        ['Plaatst u de dampkap?', 'Plaatsing en aansluiting gebeuren op offerte: kies „Levering + installatie” of vraag een offerte aan vanuit de productfiche.'],
    ],
    'sous': {
        'hottes-completes': 'Complete inox dampkappen met motor, verlichting en snelheidsregelaar, klaar om te plaatsen.',
        'hottes-murales': 'Inox wanddampkappen met filters, gemaakt in België, van 1 tot 5 meter.',
        'hottes-centrales': 'Inox eilanddampkappen voor kookeilanden.',
        'hottes-vapeur': 'Condensatiekappen voor combi-ovens en vaatwasmachines.',
        'hottes-compensation': 'Compensatiekappen met ingebouwde toevoer van verse lucht.',
        'moteurs-hottes': 'Afzuigmotoren en afzuigboxen voor professionele dampkappen.',
        'variateurs': 'Snelheidsregelaars voor dampkapmotoren.',
    },
}
UNIVERS['en']['hottes'] = {
    'pastille': 'Hoods made in Belgium',
    'titre': ['Hoods and extraction,', 'made in Belgium'],
    'intro': 'Wall and island hoods, complete hoods with motor, lighting and speed controller, condensation and compensating hoods, extraction motors and controllers: kitchen ventilation made in Belgium.',
    'seo': [
        'A commercial kitchen has to extract grease, smoke and steam. Discount Horeca makes stainless steel wall and island hoods in Belgium, supplied complete with motor, light and speed controller, as well as condensation hoods for combi ovens and compensating hoods.',
        'Extraction motors and controllers can also be ordered separately. The hood length is chosen to match the cooking line, with an overhang on each side.',
    ],
    'faq': [
        ['What hood length should I choose?', 'Take the length of the cooking line plus 15 to 20 cm on each side. Our team helps you size the motor for the length and type of cooking.'],
        ['Do you fit the hood?', 'Fitting and connection are priced on quotation: choose “Delivery + installation” or ask for a quote from the product page.'],
    ],
    'sous': {
        'hottes-completes': 'Complete stainless steel hoods with motor, lighting and speed controller, ready to fit.',
        'hottes-murales': 'Stainless steel wall hoods with filters, made in Belgium, 1 to 5 metres.',
        'hottes-centrales': 'Stainless steel island hoods for cooking islands.',
        'hottes-vapeur': 'Condensation hoods for combi ovens and dishwashers.',
        'hottes-compensation': 'Compensating hoods with built-in fresh air supply.',
        'moteurs-hottes': 'Extraction motors and fan boxes for commercial hoods.',
        'variateurs': 'Speed controllers for hood motors.',
    },
}

FAQ = {
    'nl': [
        ['Wie kan kopen bij Discount Horeca?', 'Horecaprofessionals (restaurants, frituren, snackbars, cafés, bakkerijen, hotels, grootkeukens), wederverkopers en installateurs, en particulieren. Een pro-account met ondernemingsnummer geeft facturen op naam van uw bedrijf en de geschiedenis van uw bestellingen.'],
        ['Zijn de prijzen exclusief btw?', 'De prijzen worden getoond excl. btw, met de prijs incl. btw er net onder (Belgische btw van 21 %). Bedrijven uit een ander land van de Europese Unie met een geldig btw-nummer worden zonder btw gefactureerd (verlegging van heffing).'],
        ['Is de levering gratis?', 'De levering is gratis in België vanaf 1.200 € excl. btw aankoop. Ze gebeurt door een koerier, voor de deur, op het gelijkvloers. Afhalen in de showroom in Sint-Pieters-Leeuw is altijd gratis.'],
        ['Wat zijn de levertermijnen?', 'Producten op voorraad worden geleverd binnen 24 tot 72 uur. Voor producten op bestelling wordt de termijn na de bestelling telefonisch bevestigd.'],
        ['Hoe betalen?', 'Online met Bancontact, Payconiq of kaart, per overschrijving, of met een voorschot van 30 % bij de bestelling en het saldo bij levering. In de showroom betaalt u bij het afhalen.'],
        ['Installeert u het materiaal?', 'De prijzen zijn exclusief aansluiting en ingebruikname. Kies de optie „Levering + installatie”: ons team stuurt u een offerte voor we langskomen.'],
        ['Welke garantie?', 'Eén jaar onderdelen en arbeid voor professionals (zes maanden op tweedehandsmateriaal), behalve slijtonderdelen en kalkschade. De dienst na verkoop doen we zelf.'],
    ],
    'en': [
        ['Who can buy from Discount Horeca?', 'Catering professionals (restaurants, chip shops, snack bars, cafés, bakeries, hotels, institutional kitchens), resellers and installers, and private customers. A business account with a company number gives you invoices in your company’s name and your order history.'],
        ['Are prices excluding VAT?', 'Prices are shown excl. VAT, with the price incl. VAT just below (Belgian VAT at 21%). Companies from another European Union country with a valid VAT number are invoiced without VAT (reverse charge).'],
        ['Is delivery free?', 'Delivery is free in Belgium for orders from €1,200 excl. VAT. It is made by a carrier, to the door, on the ground floor. Collection from the showroom in Sint-Pieters-Leeuw is always free.'],
        ['What are the lead times?', 'Products in stock are delivered within 24 to 72 hours. For made-to-order products, the lead time is confirmed by phone after the order.'],
        ['How can I pay?', 'Online by Bancontact, Payconiq or card, by bank transfer, or with a 30% deposit on order and the balance on delivery. At the showroom, you pay on collection.'],
        ['Do you install the equipment?', 'Prices do not include connection or commissioning. Choose the “Delivery + installation” option: our team sends you a quote before coming out.'],
        ['What warranty do you give?', 'One year parts and labour for business customers (six months on second-hand equipment), excluding wear parts and limescale damage. After-sales service is handled by our own team.'],
    ],
}

ETAPES = {
    'nl': [
        ['Kies online of in de showroom', 'Prijs excl. en incl. btw, voorraad en levertermijn op elke fiche. Of kom het materiaal bekijken in Sint-Pieters-Leeuw.'],
        ['Betaal zoals u wilt', 'Bancontact, Payconiq, kaart, overschrijving, of een voorschot van 30 % en het saldo bij levering.'],
        ['Geleverd binnen 24 tot 72 uur', 'Overal in België, gratis vanaf 1.200 € excl. btw. Of gratis afhalen in de showroom.'],
        ['Geïnstalleerd als u dat wenst', 'Aansluiting en ingebruikname op offerte, en een dienst na verkoop die uw materiaal opvolgt.'],
    ],
    'en': [
        ['Choose online or at the showroom', 'Price excl. and incl. VAT, stock and lead time on every product page. Or come and see the equipment in Sint-Pieters-Leeuw.'],
        ['Pay the way you want', 'Bancontact, Payconiq, card, bank transfer, or a 30% deposit and the balance on delivery.'],
        ['Delivered in 24 to 72 hours', 'Anywhere in Belgium, free from €1,200 excl. VAT. Or free collection at the showroom.'],
        ['Installed if you wish', 'Connection and commissioning on quotation, and an after-sales service that looks after your equipment.'],
    ],
}
