// Dictionnaire des ingrédients : traduit une seule fois, utilisé par toutes les recettes.
// Chaque ligne : id, français, arabe, anglais, rayon, densité (g par ml, 0 = pas de conversion en volume),
// poids d'une unité en grammes (pièce, gousse, feuille, sachet, boîte, botte…), prix indicatif en dinars,
// prix indicatif en euros, unité du prix ('kg', 'l' ou 'pc' = à l'unité).
// Les prix sont des ordres de grandeur : chacun peut les corriger dans « Carnet de prix ».
// Pluriel : « singulier|pluriel » quand il est irrégulier ; sinon un « s » est ajouté.

const LIGNES = [
  // Fruits et légumes
  ['oignon', 'Oignon', 'بصل', 'Onion', 'legumes', 0, 110, 80, 1.8, 'kg'],
  ['tomate', 'Tomate', 'طماطم', 'Tomato|Tomatoes', 'legumes', 0, 120, 120, 3, 'kg'],
  ['ail', 'Ail', 'ثوم', 'Garlic', 'legumes', 0, 5, 700, 8, 'kg'],
  ['carotte', 'Carotte', 'جزر', 'Carrot', 'legumes', 0, 80, 90, 1.6, 'kg'],
  ['navet', 'Navet', 'لفت', 'Turnip', 'legumes', 0, 150, 100, 2.5, 'kg'],
  ['courgette', 'Courgette', 'كوسة (قرعة)', 'Zucchini|Zucchini', 'legumes', 0, 200, 140, 2.8, 'kg'],
  ['poivron', 'Poivron', 'فلفل حلو', 'Bell pepper', 'legumes', 0, 150, 180, 3.5, 'kg'],
  ['pomme-de-terre', 'Pomme de terre|Pommes de terre', 'بطاطا', 'Potato|Potatoes', 'legumes', 0, 150, 90, 1.5, 'kg'],
  ['citron', 'Citron', 'ليمون', 'Lemon', 'legumes', 0, 100, 250, 3, 'kg'],
  ['champignon', 'Champignons', 'فطر', 'Mushrooms', 'legumes', 0, 15, 700, 6, 'kg'],
  ['concombre', 'Concombre', 'خيار', 'Cucumber', 'legumes', 0, 250, 120, 2.5, 'kg'],
  ['avocat', 'Avocat', 'أفوكادو', 'Avocado', 'legumes', 0, 200, 250, 1.3, 'pc'],
  ['chou', 'Chou blanc', 'ملفوف أبيض', 'White cabbage', 'legumes', 0, 900, 100, 1.8, 'kg'],
  ['laitue', 'Laitue', 'خس', 'Lettuce', 'legumes', 0, 300, 80, 1.2, 'pc'],
  ['fraise', 'Fraises', 'فراولة', 'Strawberries', 'legumes', 0, 15, 500, 7, 'kg'],
  ['persil', 'Persil', 'معدنوس (بقدونس)', 'Parsley', 'legumes', 0, 60, 30, 0.9, 'pc'],
  ['coriandre', 'Coriandre fraîche', 'قصبر (كزبرة خضراء)', 'Fresh coriander', 'legumes', 0, 60, 30, 0.9, 'pc'],
  ['basilic', 'Basilic', 'حبق (ريحان)', 'Basil', 'legumes', 0, 30, 80, 1.5, 'pc'],
  ['celeri-branche', 'Céleri branche', 'كرافس', 'Celery', 'legumes', 0, 40, 200, 2.5, 'kg'],

  // Viandes, volaille, poisson
  ['agneau', 'Agneau (épaule ou collier)', 'لحم غنمي', 'Lamb (shoulder or neck)', 'boucherie', 0, 0, 2800, 18, 'kg'],
  ['viande-hachee', 'Viande hachée', 'لحم مفروم', 'Minced beef', 'boucherie', 0, 0, 2000, 12, 'kg'],
  ['poulet', 'Poulet en morceaux', 'دجاج مقطّع', 'Chicken pieces', 'boucherie', 0, 0, 450, 5.5, 'kg'],
  ['poulet-blanc', 'Blanc de poulet', 'صدر دجاج', 'Chicken breast', 'boucherie', 0, 0, 950, 11, 'kg'],
  ['thon', 'Thon en boîte', 'تونة معلبة', 'Canned tuna', 'boucherie', 0, 140, 280, 1.6, 'pc'],
  ['surimi', 'Surimi', 'سوريمي', 'Surimi sticks', 'boucherie', 0, 15, 1500, 9, 'kg'],

  // Œufs et produits laitiers
  ['oeuf', 'Œuf', 'بيض', 'Egg', 'cremerie', 0, 55, 18, 0.3, 'pc'],
  ['lait', 'Lait', 'حليب', 'Milk', 'cremerie', 1.03, 0, 110, 1.1, 'l'],
  ['beurre', 'Beurre', 'زبدة', 'Butter', 'cremerie', 0, 0, 1300, 9, 'kg'],
  ['creme-liquide', 'Crème liquide entière', 'كريمة سائلة كاملة الدسم', 'Whipping cream', 'cremerie', 1, 0, 900, 4, 'l'],
  ['yaourt', 'Yaourt nature', 'ياغورت طبيعي', 'Plain yogurt', 'cremerie', 1.05, 110, 25, 0.25, 'pc'],
  ['fromage-portion', 'Fromage en portions', 'جبن مثلثات', 'Cheese triangle', 'cremerie', 0, 15, 20, 0.2, 'pc'],
  ['fromage-frais', 'Fromage frais à tartiner', 'جبن كريمي للدهن', 'Cream cheese', 'cremerie', 0, 0, 1600, 8, 'kg'],
  ['mascarpone', 'Mascarpone', 'ماسكاربوني', 'Mascarpone', 'cremerie', 0, 0, 3500, 9, 'kg'],
  ['mozzarella', 'Mozzarella', 'موزاريلا', 'Mozzarella', 'cremerie', 0, 0, 1800, 8, 'kg'],
  ['fromage-tranche', 'Cheddar', 'جبن شيدر', 'Cheddar', 'cremerie', 0, 20, 35, 0.2, 'pc'],

  // Épicerie
  ['farine', 'Farine', 'فرينة (دقيق)', 'Flour', 'epicerie', 0.55, 0, 70, 1, 'kg'],
  ['semoule-fine', 'Semoule fine', 'سميد رقيق', 'Fine semolina', 'epicerie', 0.72, 0, 90, 1.6, 'kg'],
  ['semoule-moyenne', 'Semoule moyenne', 'سميد متوسط', 'Medium semolina', 'epicerie', 0.75, 0, 90, 1.6, 'kg'],
  ['semoule-grosse', 'Semoule grosse', 'سميد خشن', 'Coarse semolina', 'epicerie', 0.75, 0, 95, 1.8, 'kg'],
  ['couscous', 'Couscous moyen', 'كسكس متوسط', 'Medium couscous', 'epicerie', 0.75, 0, 160, 2.2, 'kg'],
  ['frik', 'Frik (blé vert concassé)', 'فريك', 'Freekeh (cracked green wheat)', 'epicerie', 0.8, 0, 350, 6, 'kg'],
  ['farine-pois-chiche', 'Farine de pois chiche', 'دقيق الحمص', 'Chickpea flour', 'epicerie', 0.5, 0, 300, 4, 'kg'],
  ['farine-riz', 'Farine de riz', 'دقيق الأرز', 'Rice flour', 'epicerie', 0.6, 0, 300, 3.5, 'kg'],
  ['maizena', 'Maïzena', 'نشاء الذرة (مايزينا)', 'Cornstarch', 'epicerie', 0.5, 0, 400, 5, 'kg'],
  ['riz-basmati', 'Riz basmati', 'أرز بسمتي', 'Basmati rice', 'epicerie', 0.85, 0, 400, 3.5, 'kg'],
  ['riz-rond', 'Riz rond', 'أرز قصير الحبة', 'Short-grain rice', 'epicerie', 0.85, 0, 250, 2.5, 'kg'],
  ['lentille', 'Lentilles', 'عدس', 'Lentils', 'epicerie', 0.85, 0, 280, 3, 'kg'],
  ['pois-chiche-sec', 'Pois chiches secs', 'حمص جاف', 'Dried chickpeas', 'epicerie', 0.8, 0, 350, 3.5, 'kg'],
  ['pois-chiches-cuits', 'Pois chiches cuits', 'حمص مسلوق', 'Cooked chickpeas', 'epicerie', 0, 0, 375, 2.5, 'kg'],
  ['vermicelle', 'Vermicelles', 'شعيرية', 'Vermicelli', 'epicerie', 0, 0, 150, 2, 'kg'],
  ['nouille', 'Nouilles de blé', 'نودلز القمح', 'Wheat noodles', 'epicerie', 0, 0, 300, 3, 'kg'],
  ['rechta', 'Rechta fraîche', 'رشتة طازجة', 'Fresh rechta noodles', 'epicerie', 0, 0, 350, 6, 'kg'],
  ['sucre', 'Sucre', 'سكر', 'Sugar', 'epicerie', 0.85, 0, 100, 1.5, 'kg'],
  ['sucre-glace', 'Sucre glace', 'سكر ناعم', 'Icing sugar', 'epicerie', 0.5, 0, 200, 3, 'kg'],
  ['sucre-roux', 'Sucre roux', 'سكر أسمر', 'Brown sugar', 'epicerie', 0.8, 0, 400, 3.5, 'kg'],
  ['miel', 'Miel', 'عسل', 'Honey', 'epicerie', 1.4, 0, 1500, 9, 'kg'],
  ['huile', 'Huile végétale', 'زيت نباتي', 'Vegetable oil', 'epicerie', 0.92, 0, 135, 2.2, 'l'],
  ['huile-olive', "Huile d'olive", 'زيت الزيتون', 'Olive oil', 'epicerie', 0.92, 0, 900, 9, 'l'],
  ['concentre-tomate', 'Concentré de tomate', 'معجون الطماطم', 'Tomato paste', 'epicerie', 1.1, 0, 350, 4, 'kg'],
  ['tomate-concassee', 'Tomates concassées', 'طماطم مقطعة معلبة', 'Chopped tomatoes', 'epicerie', 0, 400, 150, 1, 'pc'],
  ['olive-verte', 'Olives vertes dénoyautées', 'زيتون أخضر منزوع النوى', 'Pitted green olives', 'epicerie', 0, 0, 500, 8, 'kg'],
  ['harissa', 'Harissa', 'هريسة', 'Harissa', 'epicerie', 1.1, 0, 500, 7, 'kg'],
  ['vinaigre', 'Vinaigre', 'خل', 'Vinegar', 'epicerie', 1, 0, 120, 1, 'l'],
  ['moutarde', 'Moutarde', 'خردل (موتارد)', 'Mustard', 'epicerie', 1.1, 0, 700, 4, 'kg'],
  ['mayonnaise', 'Mayonnaise', 'مايونيز', 'Mayonnaise', 'epicerie', 0.95, 0, 600, 5, 'kg'],
  ['ketchup', 'Ketchup', 'كاتشب', 'Ketchup', 'epicerie', 1.1, 0, 500, 3.5, 'kg'],
  ['sauce-soja', 'Sauce soja', 'صلصة الصويا', 'Soy sauce', 'epicerie', 1.1, 0, 1500, 8, 'l'],
  ['tahini', 'Tahini (crème de sésame)', 'طحينة', 'Tahini', 'epicerie', 1, 0, 1500, 10, 'kg'],
  ['confiture', "Confiture d'abricot", 'مربى المشمش', 'Apricot jam', 'epicerie', 1.3, 0, 450, 4, 'kg'],
  ['cafe', 'Café fort refroidi', 'قهوة مركزة باردة', 'Strong cold coffee', 'epicerie', 1, 0, 150, 1, 'l'],
  ['eau', 'Eau', 'ماء', 'Water', 'epicerie', 1, 0, 0, 0, 'l'],
  ['sel', 'Sel', 'ملح', 'Salt', 'epicerie', 1.2, 0, 30, 0.6, 'kg'],

  // Pains, feuilles et biscuits
  ['feuille-brick', 'Feuille de brick (dioul)', 'ورق الديول', 'Brick pastry sheet', 'pain', 0, 15, 12, 0.25, 'pc'],
  ['baguette', 'Baguette', 'خبز باغيت', 'Baguette', 'pain', 0, 250, 15, 1.1, 'pc'],
  ['tortilla', 'Tortilla de blé', 'خبز التورتيلا', 'Wheat tortilla', 'pain', 0, 40, 40, 0.35, 'pc'],
  ['pain-burger', 'Pain à burger', 'خبز البرغر', 'Burger bun', 'pain', 0, 60, 30, 0.4, 'pc'],
  ['nori', "Feuille d'algue nori", 'ورق النوري', 'Nori sheet', 'pain', 0, 3, 60, 0.3, 'pc'],
  ['biscuit-cuillere', 'Biscuits à la cuillère', 'بسكويت بودوار', 'Ladyfingers', 'pain', 0, 8, 1200, 6, 'kg'],
  ['biscuit-sec', 'Biscuits secs (petit-beurre)', 'بسكويت جاف', 'Plain butter biscuits', 'pain', 0, 8, 500, 4, 'kg'],

  // Pâtisserie
  ['levure-chimique', 'Levure chimique', 'خميرة الحلويات', 'Baking powder', 'patisserie', 0.9, 10, 15, 0.15, 'pc'],
  ['levure-boulangere', 'Levure boulangère sèche', 'خميرة الخبز الجافة', 'Dry yeast', 'patisserie', 0.8, 0, 1500, 20, 'kg'],
  ['vanille', 'Sucre vanillé', 'سكر الفانيلا', 'Vanilla sugar', 'patisserie', 0.85, 8, 15, 0.15, 'pc'],
  ['bicarbonate', 'Bicarbonate de soude', 'بيكربونات الصودا', 'Baking soda', 'patisserie', 1, 0, 400, 5, 'kg'],
  ['cacao', 'Cacao non sucré', 'كاكاو غير محلى', 'Unsweetened cocoa', 'patisserie', 0.45, 0, 1500, 10, 'kg'],
  ['chocolat-noir', 'Chocolat noir', 'شوكولاتة سوداء', 'Dark chocolate', 'patisserie', 0, 0, 1800, 9, 'kg'],
  ['amande-poudre', "Poudre d'amandes", 'لوز مطحون', 'Ground almonds', 'patisserie', 0.45, 0, 2600, 14, 'kg'],
  ['amande-entiere', 'Amandes entières', 'لوز كامل', 'Whole almonds', 'patisserie', 0, 1.2, 2400, 13, 'kg'],
  ['amande-effilee', 'Amandes effilées', 'لوز شرائح', 'Flaked almonds', 'patisserie', 0.4, 0, 2800, 15, 'kg'],
  ['pistache', 'Pistaches concassées', 'فستق مجروش', 'Crushed pistachios', 'patisserie', 0.5, 0, 4500, 25, 'kg'],
  ['raisin-sec', 'Raisins secs', 'زبيب', 'Raisins', 'patisserie', 0.65, 0, 900, 7, 'kg'],
  ['cerise-confite', 'Cerises confites', 'كرز مسكّر', 'Glacé cherries', 'patisserie', 0, 4, 1500, 14, 'kg'],
  ['pate-dattes', 'Pâte de dattes', 'عجينة التمر (الغرس)', 'Date paste', 'patisserie', 0, 0, 300, 6, 'kg'],
  ['eau-fleur-oranger', "Eau de fleur d'oranger", 'ماء الزهر', 'Orange blossom water', 'patisserie', 1, 0, 400, 6, 'l'],
  ['sesame', 'Graines de sésame', 'سمسم (جلجلان)', 'Sesame seeds', 'patisserie', 0.6, 0, 800, 8, 'kg'],

  // Épices et aromates
  ['paprika', 'Paprika', 'فلفل أحمر حلو (بابريكا)', 'Paprika', 'epices', 0.45, 0, 800, 15, 'kg'],
  ['poivre-noir', 'Poivre noir', 'فلفل أسود', 'Black pepper', 'epices', 0.5, 0, 2500, 30, 'kg'],
  ['cannelle', 'Cannelle moulue', 'قرفة مطحونة', 'Ground cinnamon', 'epices', 0.5, 0, 2000, 25, 'kg'],
  ['cumin', 'Cumin', 'كمون', 'Cumin', 'epices', 0.45, 0, 1500, 20, 'kg'],
  ['curcuma', 'Curcuma', 'كركم', 'Turmeric', 'epices', 0.6, 0, 1200, 18, 'kg'],
  ['gingembre', 'Gingembre moulu', 'زنجبيل مطحون', 'Ground ginger', 'epices', 0.45, 0, 1500, 20, 'kg'],
  ['ras-el-hanout', 'Ras el hanout', 'راس الحانوت', 'Ras el hanout', 'epices', 0.45, 0, 1500, 25, 'kg'],
  ['coriandre-moulue', 'Coriandre moulue', 'قصبر مطحون (كزبرة)', 'Ground coriander', 'epices', 0.4, 0, 1000, 18, 'kg'],
  ['cardamome', 'Cardamome moulue', 'هيل مطحون', 'Ground cardamom', 'epices', 0.45, 0, 8000, 60, 'kg'],
  ['clou-girofle', 'Clous de girofle', 'قرنفل', 'Cloves', 'epices', 0, 0.1, 4000, 40, 'kg'],
  ['muscade', 'Noix de muscade', 'جوزة الطيب', 'Nutmeg', 'epices', 0.5, 0, 5000, 50, 'kg'],
  ['origan', 'Origan séché', 'زعتر مجفف (أوريغانو)', 'Dried oregano', 'epices', 0.2, 0, 2000, 30, 'kg'],
  ['menthe-seche', 'Menthe séchée', 'نعناع مجفف', 'Dried mint', 'epices', 0.15, 0, 1500, 30, 'kg'],
  ['laurier', 'Feuille de laurier', 'ورق الغار (الرند)', 'Bay leaf|Bay leaves', 'epices', 0, 0.3, 2000, 40, 'kg'],
];

export const INGREDIENTS = Object.fromEntries(
  LIGNES.map(([id, fr, ar, en, rayon, d, w, dzd, eur, per]) => [id, { id, n: { fr, ar, en }, rayon, d, w, p: { DZD: dzd, EUR: eur }, per }]),
);

// Ce que l'on suppose toujours présent dans la cuisine : jamais compté comme « manquant ».
export const PLACARD = ['sel', 'eau', 'poivre-noir', 'huile'];

// Rayons, dans l'ordre d'un passage au marché puis à la supérette.
export const RAYONS = ['legumes', 'boucherie', 'cremerie', 'epicerie', 'pain', 'patisserie', 'epices'];

// Par quoi remplacer un ingrédient qu'on n'a pas (ou qu'on ne trouve pas ici).
export const REMPLACEMENTS = {
  'creme-liquide': {
    fr: 'Pour une sauce : 200 ml de lait, 1 c. à s. de maïzena et 20 g de beurre. Pour une chantilly, rien ne la remplace.',
    ar: 'للصلصات: 200 مل حليب مع ملعقة كبيرة مايزينا و20 غ زبدة. أما الكريمة المخفوقة فلا بديل لها.',
    en: 'For a sauce: 200 ml milk, 1 tbsp cornstarch and 20 g butter. For whipped cream there is no substitute.',
  },
  mascarpone: {
    fr: 'Même poids de fromage frais à tartiner, détendu avec 2 c. à s. de crème liquide.',
    ar: 'نفس الوزن من الجبن الكريمي للدهن مع ملعقتين كبيرتين من الكريمة السائلة.',
    en: 'Same weight of cream cheese loosened with 2 tbsp of whipping cream.',
  },
  'sucre-roux': {
    fr: 'Sucre blanc, plus 1 c. à c. de miel pour 100 g.',
    ar: 'سكر أبيض مع ملعقة صغيرة عسل لكل 100 غ.',
    en: 'White sugar plus 1 tsp of honey per 100 g.',
  },
  'levure-chimique': {
    fr: 'Pour 1 sachet : ½ c. à c. de bicarbonate et 1 c. à c. de jus de citron.',
    ar: 'بدل الكيس الواحد: نصف ملعقة صغيرة بيكربونات مع ملعقة صغيرة عصير ليمون.',
    en: 'For 1 sachet: ½ tsp baking soda and 1 tsp lemon juice.',
  },
  tahini: {
    fr: 'Graines de sésame grillées à sec, mixées longuement avec un filet d’huile.',
    ar: 'سمسم محمّص على الجاف يُطحن طويلاً مع قليل من الزيت.',
    en: 'Dry-toasted sesame seeds blended for a long time with a little oil.',
  },
  oeuf: {
    fr: 'Dans un gâteau moelleux uniquement : 60 g de yaourt ou ½ banane écrasée par œuf.',
    ar: 'في الكيك الطري فقط: 60 غ ياغورت أو نصف موزة مهروسة بدل كل بيضة.',
    en: 'In soft cakes only: 60 g yogurt or ½ mashed banana per egg.',
  },
  beurre: {
    fr: 'Même poids de margarine. Dans un gâteau : 80 % du poids en huile. En salé : du smen.',
    ar: 'نفس الوزن من المارغرين. في الكيك: 80٪ من الوزن زيتاً. في المالح: السمن.',
    en: 'Same weight of margarine. In cakes: 80% of the weight in oil. In savoury dishes: smen (clarified butter).',
  },
  frik: {
    fr: 'Boulgour gros, ou orge concassée. Le goût fumé sera moins présent.',
    ar: 'برغل خشن أو شعير مجروش، مع نكهة مدخنة أخف.',
    en: 'Coarse bulgur or cracked barley. The smoky taste will be milder.',
  },
  'feuille-brick': {
    fr: 'Pâte filo, à doubler : elle est plus fine.',
    ar: 'عجينة الفيلو، تُستعمل ورقتين معاً لأنها أرقّ.',
    en: 'Filo pastry, used double because it is thinner.',
  },
  'sauce-soja': {
    fr: 'Pas d’équivalent exact. Dépannage : 2 c. à s. de bouillon corsé, 1 pincée de sucre et 1 c. à c. de vinaigre.',
    ar: 'لا بديل مطابق. للضرورة: ملعقتان كبيرتان مرق مركز مع رشة سكر وملعقة صغيرة خل.',
    en: 'No exact match. In a pinch: 2 tbsp strong stock, a pinch of sugar and 1 tsp vinegar.',
  },
  yaourt: {
    fr: 'Même quantité de lben ou de raïb.',
    ar: 'نفس الكمية من اللبن أو الرايب.',
    en: 'Same amount of buttermilk (lben).',
  },
  'chocolat-noir': {
    fr: 'Pour 30 g : 3 c. à s. de cacao et 1 c. à s. de beurre.',
    ar: 'بدل 30 غ: ثلاث ملاعق كبيرة كاكاو مع ملعقة كبيرة زبدة.',
    en: 'For 30 g: 3 tbsp cocoa and 1 tbsp butter.',
  },
  'farine-riz': {
    fr: 'Riz rond mixé très finement, puis tamisé.',
    ar: 'أرز قصير يُطحن ناعماً جداً ثم يُغربل.',
    en: 'Short-grain rice blended very finely, then sieved.',
  },
  nouille: {
    fr: 'Spaghettis fins, cuits 1 minute de moins que le temps indiqué.',
    ar: 'سباغيتي رفيعة تُطهى أقل بدقيقة من الوقت المذكور.',
    en: 'Thin spaghetti, cooked 1 minute less than the packet time.',
  },
  'riz-rond': {
    fr: 'Le riz à sushi est un riz rond : le riz rond ordinaire convient s’il est bien rincé.',
    ar: 'أرز السوشي أرز قصير الحبة، والأرز القصير العادي يصلح إذا غُسل جيداً.',
    en: 'Sushi rice is a short-grain rice: ordinary short-grain rice works if rinsed well.',
  },
  miel: {
    fr: 'Sirop épais : 200 g de sucre, 100 ml d’eau et un filet de citron, bouillis 8 minutes.',
    ar: 'شراب ثخين: 200 غ سكر و100 مل ماء وقطرات ليمون تُغلى 8 دقائق.',
    en: 'Thick syrup: 200 g sugar, 100 ml water and a squeeze of lemon, boiled for 8 minutes.',
  },
};
