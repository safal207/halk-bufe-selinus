export const categories = [
  ['breakfast','Kahvaltı','Завтраки','Breakfast','Frühstück','sun'],
  ['toast','Tostlar','Тосты','Toast','Toast','toast'],
  ['burger','Burgerler','Бургеры','Burgers','Burger','burger'],
  ['salad','Salatalar','Салаты','Salads','Salate','leaf'],
  ['mains','Yemekler','Горячее','Mains','Warme Gerichte','plate'],
  ['gozleme','Gözlemeler','Гёзлеме','Gözleme','Gözleme','fold'],
  ['kids','Çocuk menüsü','Детское','Kids','Kindermenüs','star'],
  ['dessert','Tatlılar','Десерты','Desserts','Desserts','cake'],
  ['drinks','Sıcak içecekler','Напитки','Hot drinks','Heiße Getränke','cup']
].map(([id, tr, ru, en, de, icon]) => ({id, name:{tr,ru,en,de}, icon}));

// Dish images are generated serving illustrations.
const rows = [
  ['kahvalti','breakfast',220,'Kahvaltı tabağı','Турецкий завтрак','Turkish breakfast plate','Türkischer Frühstücksteller','catalog/kahvalti'],
  ['karisik-omlet','breakfast',160,'Karışık omlet','Омлет с добавками','Mixed omelette','Omelett mit gemischter Füllung','catalog/karisik-omlet'],
  ['sade-omlet','breakfast',120,'Sade omlet','Омлет','Plain omelette','Omelett natur','catalog/sade-omlet'],
  ['sucuklu-tost','toast',125,'Sucuklu tost','Тост с суджуком','Sucuk toast','Toast mit Sucuk','catalog/sucuklu-tost'],
  ['kasarli-tost','toast',125,'Kaşarlı tost','Тост с кашаром','Kaşar cheese toast','Toast mit Kaşar-Käse','catalog/kasarli-tost'],
  ['beyaz-peynirli-tost','toast',125,'Beyaz peynirli tost','Тост с белым сыром','White cheese toast','Toast mit Weißkäse','catalog/beyaz-peynirli-tost'],
  ['karisik-tost','toast',150,'Karışık tost','Тост с начинкой','Mixed toast','Toast mit gemischter Füllung','campaign/mixed-toast'],
  ['hamburger','burger',250,'Hamburger','Гамбургер','Hamburger','Hamburger','catalog/hamburger'],
  ['cheeseburger','burger',260,'Cheeseburger','Чизбургер','Cheeseburger','Cheeseburger','campaign/cheeseburger'],
  ['tavuk-burger','burger',220,'Tavuk burger','Чикенбургер','Chicken burger','Hähnchenburger','catalog/tavuk-burger'],
  ['patates','burger',120,'Patates cips','Картофель фри','Fries','Pommes frites','campaign/fries'],
  ['tavuklu-salata','salad',220,'Tavuklu salata','Салат с курицей','Chicken salad','Salat mit Hähnchen','catalog/tavuklu-salata'],
  ['mevsim-salata','salad',150,'Mevsim salata','Сезонный салат','Seasonal salad','Saisonaler Salat','catalog/mevsim-salata'],
  ['kremali-makarna','mains',null,'Kremalı makarna','Паста в сливочном соусе','Creamy pasta','Pasta in Sahnesoße','campaign/creamy-pasta'],
  ['tavuklu-makarna','mains',275,'Kremalı tavuklu makarna','Сливочная паста с курицей','Creamy chicken pasta','Pasta in Sahnesoße mit Hähnchen','catalog/tavuklu-makarna'],
  ['tavuk-sis','mains',290,'Tavuk şiş','Куриный шашлык','Chicken skewers','Hähnchenspieße','campaign/tavuk-sis-meal'],
  ['tavuk-izgara','mains',320,'Tavuk ızgara','Курица на гриле','Grilled chicken','Gegrilltes Hähnchen','catalog/tavuk-izgara'],
  ['kori-tavuk','mains',330,'Köri soslu tavuk','Курица в соусе карри','Chicken with curry sauce','Hähnchen in Currysoße','catalog/kori-tavuk'],
  ['citir-tavuk','mains',250,'Çıtır tavuk','Хрустящая курица','Crispy chicken','Knuspriges Hähnchen','catalog/citir-tavuk'],
  ['tavuk-ekmek','mains',220,'Tavuk şiş ekmek arası','Сэндвич с куриным шашлыком','Chicken skewer sandwich','Sandwich mit Hähnchenspieß','catalog/tavuk-ekmek'],
  ['tavuk-cocuk','kids',240,'Tavuk şiş çocuk menüsü','Детское меню с куриным шашлыком','Kids’ chicken skewer meal','Kindermenü mit Hähnchenspieß','catalog/tavuk-cocuk'],
  ['kofte','mains',330,'Köfte','Кёфте','Köfte meatballs','Köfte (türkische Hackfleischbällchen)','campaign/grilled-kofte'],
  ['kofte-ekmek','mains',260,'Köfte ekmek arası','Сэндвич с кёфте','Köfte sandwich','Köfte-Sandwich','catalog/kofte-ekmek'],
  ['kofte-cocuk','kids',250,'Köfte çocuk menüsü','Детское меню с кёфте','Kids’ köfte meal','Kindermenü mit Köfte','catalog/kofte-cocuk'],
  ['atistirma','mains',230,'Atıştırma tabağı','Тарелка закусок','Snack platter','Snackteller','catalog/atistirma'],
  ['sigara-boregi','mains',150,'Sigara böreği','Хрустящие рулетики бёрек','Sigara böreği rolls','Knusprige Börek-Röllchen','catalog/sigara-boregi'],
  ['sade-sepit','gozleme',75,'Sade şepit','Лепёшка шепит','Plain şepit flatbread','Şepit-Fladenbrot natur','catalog/sade-sepit'],
  ['kasarli-sepit','gozleme',110,'Yağlı kaşar peynirli şepit','Шепит с кашаром','Buttered şepit with kaşar','Gebuttertes Şepit mit Kaşar-Käse','catalog/kasarli-sepit'],
  ['lorlu-sepit','gozleme',100,'Yağlı lor peynirli şepit','Шепит с сыром лор','Buttered şepit with lor cheese','Gebuttertes Şepit mit Lor-Frischkäse','catalog/lorlu-sepit'],
  ['ispanakli','gozleme',120,'Ispanaklı gözleme','Гёзлеме со шпинатом','Spinach gözleme','Gözleme mit Spinat','campaign/spinach-gozleme'],
  ['ispanakli-kasarli','gozleme',130,'Ispanaklı kaşarlı gözleme','Гёзлеме со шпинатом и кашаром','Spinach and kaşar gözleme','Gözleme mit Spinat und Kaşar-Käse','catalog/ispanakli-kasarli'],
  ['lorlu','gozleme',120,'Lor peynirli gözleme','Гёзлеме с сыром лор','Lor cheese gözleme','Gözleme mit Lor-Frischkäse','catalog/lorlu'],
  ['patatesli','gozleme',120,'Patatesli gözleme','Гёзлеме с картофелем','Potato gözleme','Gözleme mit Kartoffeln','catalog/patatesli'],
  ['kasarli','gozleme',130,'Kaşarlı gözleme','Гёзлеме с кашаром','Kaşar cheese gözleme','Gözleme mit Kaşar-Käse','catalog/kasarli'],
  ['ispanakli-peynirli','gozleme',140,'Ispanaklı peynirli gözleme','Гёзлеме со шпинатом и сыром лор','Spinach and lor cheese gözleme','Gözleme mit Spinat und Lor-Frischkäse','catalog/ispanakli-peynirli'],
  ['patatesli-kasarli','gozleme',130,'Patatesli kaşarlı gözleme','Гёзлеме с картофелем и кашаром','Potato and kaşar gözleme','Gözleme mit Kartoffeln und Kaşar-Käse','catalog/patatesli-kasarli'],
  ['patatesli-kasarli-ispanakli','gozleme',150,'Patatesli kaşarlı ıspanaklı gözleme','Гёзлеме с картофелем, кашаром и шпинатом','Potato, kaşar and spinach gözleme','Gözleme mit Kartoffeln, Kaşar-Käse und Spinat','catalog/patatesli-kasarli-ispanakli'],
  ['kabak','dessert',170,'Kabak tatlısı','Тыквенный десерт','Pumpkin dessert','Kürbisdessert','campaign/pumpkin-dessert'],
  ['revani','dessert',125,'Revani tatlısı','Ревани','Revani semolina cake','Revani (Grießkuchen)','campaign/revani'],
  ['gunun-tatlisi','dessert',null,'Günün tatlısı','Десерт дня','Dessert of the day','Dessert des Tages','catalog/gunun-tatlisi'],
  ['cay','drinks',10,'Çay','Турецкий чай','Turkish tea','Türkischer Tee','branding/turkish-tea'],
  ['bitki-cayi','drinks',20,'Bitki çayı','Травяной чай','Herbal tea','Kräutertee','branding/herbal-tea'],
  ['turk-kahvesi','drinks',50,'Türk kahvesi','Турецкий кофе','Turkish coffee','Türkischer Kaffee','branding/turkish-coffee'],
  ['nescafe','drinks',50,'Nescafe','Нескафе','Nescafe','Nescafé','branding/nescafe'],
];

// Serving details supplied by the site owner, separate from the photographed price list.
const descriptions = {
  'tavuk-sis': {
    tr: 'Pirinç pilavı, patates kızartması ve kırmızı lahana ile.',
    ru: 'С рисом, картофелем фри и красной капустой.',
    en: 'With rice pilaf, French fries and red cabbage.',
    de: 'Mit Reis, Pommes frites und Rotkohl.',
  },
};
export const menu = rows.map(([id, category, price, tr, ru, en, de, photo]) =>
  ({ id, category, price, name: {tr, ru, en, de}, photo, description: descriptions[id] }));
export const featured = ['tavuk-sis','cheeseburger','tavuk-cocuk','ispanakli'];
