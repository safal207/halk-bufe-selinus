import {byId, getLanguage, readBasket, save} from './basket.js?v=kids-meal-1';

const routes = [
  {id:'selinus', photo:byId.get('ispanakli').photo, meals:['ispanakli','kasarli','patatesli'], extra:'cay'},
  {id:'quick', photo:byId.get('karisik-tost').photo, meals:['kasarli-tost','sucuklu-tost','karisik-tost'], extra:'cay'},
  {id:'hearty', photo:byId.get('cheeseburger').photo, meals:['hamburger','cheeseburger','tavuk-burger'], extra:'patates'}
];
const guideCopy = {
  tr: {
    language:'Dil',
    kicker:'SELİNUS REHBERİ', title:'Kendi tepsini hazırla.', intro:'Bir rota seç, yemeğini bul ve kasaya hazır ol.',
    menu:'Menü', steps:['Rota','Yemek','Tepsi'], question:['Nasıl bir mola?', 'Ana yemeğini seç', 'Tepsin hazır'],
    note:['Bir rota seçerek başla.', 'Fiyatları karşılaştırıp bir yemek seç.', 'İstersen yanına bir ürün ekle. Fiyatı hemen gör.'],
    routeNames:['Selinus klasiği','Hızlı bir atıştırma','Doyurucu bir öğün'],
    routeNotes:['Gözleme çeşitleri','Tost çeşitleri','Burger çeşitleri'],
    next:'Devam et', back:'Geri', add:'Sepete ekle ve aç', total:'Tepsi toplamı',
    limit:'Sepetinde bu üründen en fazla 99 adet olabilir.', failed:'Sepet kaydedilemedi. Tarayıcı depolama ayarlarını kontrol et.',
  },
  ru: {
    language:'Язык',
    kicker:'ГИД ПО МЕНЮ СЕЛИНУСА', title:'Соберите свой поднос.', intro:'Выберите маршрут, найдите блюдо и приготовьте заказ для кассы.',
    menu:'Меню', steps:['Маршрут','Блюдо','Поднос'], question:['Чего хочется?', 'Выберите блюдо', 'Ваш поднос готов'],
    note:['Выберите, с чего начать.', 'Сравните варианты и выберите один.', 'Добавьте что-нибудь к блюду, если хочется. Сумма обновится сразу.'],
    routeNames:['Классика Селинуса','Быстрый перекус','Сытный обед'],
    routeNotes:['Гёзлеме с разными начинками','Тосты с начинкой','Бургеры на выбор'],
    next:'Продолжить', back:'Назад', add:'Добавить и открыть корзину', total:'Итого за поднос',
    limit:'В корзине может быть до 99 штук на позицию.', failed:'Корзина не сохранилась. Проверьте настройки хранилища браузера.',
  },
  en: {
    language:'Language',
    kicker:'SELİNUS MENU GUIDE', title:'Build your tray.', intro:'Pick a route, find your dish and get your order ready for the counter.',
    menu:'Menu', steps:['Route','Dish','Tray'], question:['What are you in the mood for?', 'Pick your main', 'Your tray is ready'],
    note:['Pick a route to get started.', 'Compare the options and choose one.', 'Add a side if you like. The total updates right away.'],
    routeNames:['Selinus classics','A quick bite','A hearty lunch'],
    routeNotes:['Gözleme with your choice of filling','Toast with your choice of filling','Choose a burger'],
    next:'Continue', back:'Back', add:'Add and open basket', total:'Tray total',
    limit:'Your basket can hold up to 99 per item.', failed:'Could not save the basket. Check your browser’s storage settings.',
  },
  de: {
    language:'Sprache',
    kicker:'SELİNUS-MENÜGUIDE', title:'Stell dein Tablett zusammen.', intro:'Wähle, worauf du Lust hast, und bereite deine Bestellung für die Kasse vor.',
    menu:'Menü', steps:['Auswahl','Gericht','Tablett'], question:['Worauf hast du Lust?', 'Wähle dein Hauptgericht', 'Dein Tablett ist bereit'],
    note:['Wähle eine Kategorie.', 'Vergleiche die Gerichte und wähle eins aus.', 'Du kannst etwas dazubestellen. Der Gesamtpreis wird sofort aktualisiert.'],
    routeNames:['Selinus-Klassiker','Ein schneller Snack','Eine herzhafte Mahlzeit'],
    routeNotes:['Gözleme mit verschiedenen Füllungen','Toast mit verschiedenen Füllungen','Burger zur Auswahl'],
    next:'Weiter', back:'Zurück', add:'In den Warenkorb', total:'Gesamtpreis',
    limit:'Pro Artikel passen bis zu 99 Stück in den Warenkorb.', failed:'Der Warenkorb konnte nicht gespeichert werden. Prüfe die Speichereinstellungen deines Browsers.',
  }
};
const $ = id => document.getElementById(id);
let lang = getLanguage();
let step = 0;
let route = null;
let dish = null;
let extra = false;
const t = key => guideCopy[lang][key];
const price = id => `${byId.get(id).price} ₺`;

function render() {
  document.documentElement.lang = lang;
  document.title = `Halk Büfe Selinus · ${t('kicker')}`;
  $('language').value = lang;
  $('language').setAttribute('aria-label',t('language'));
  $('brand-link').href = `./?lang=${lang}`;
  $('menu-link').href = `./?lang=${lang}#menu`;
  $('menu-link').textContent = t('menu');
  $('guide-kicker').textContent = t('kicker');
  $('guide-title').textContent = t('title');
  $('guide-intro').textContent = t('intro');
  $('checkpoints').innerHTML = t('steps').map((label,index) => `<li ${index === step ? 'aria-current="step"' : index < step ? 'class="visited"' : ''}>
    <b aria-hidden="true">${index < step ? '✓' : index+1}</b><span>${label}</span></li>`).join('');
  $('quest-step').textContent = `0${step+1} / 03`;
  $('quest-title').textContent = t('question')[step];
  $('quest-note').textContent = t('note')[step];
  $('quest-error').textContent = '';
  if (step === 0) {
    $('quest-content').innerHTML = `<div class="quest-grid">${routes.map((choice,index) => `
      <button type="button" class="quest-card" data-route="${choice.id}" aria-pressed="${choice === route}">
        <img alt="" src="assets/${choice.photo}.webp" width="230" height="105">
        <span class="quest-card-copy"><b>${t('routeNames')[index]}</b><small>${t('routeNotes')[index]}</small></span>
      </button>`).join('')}</div>`;
  } else if (step === 1) {
    $('quest-content').innerHTML = `<div class="quest-grid">${route.meals.map(id => {
      const item = byId.get(id);
      return `<button type="button" class="quest-card" data-dish="${id}" aria-pressed="${id === dish}">
        <img alt="" src="assets/${item.photo}.webp" width="230" height="105">
        <span class="quest-card-copy"><b>${item.name[lang]}</b><small>${price(id)}</small></span>
      </button>`;
    }).join('')}</div>`;
  } else {
    $('quest-content').innerHTML = `<ul class="quest-summary"><li><span class="tray-dish"><img class="dish-thumb" src="assets/${byId.get(dish).photo}.webp" width="52" height="52" alt=""><b>${byId.get(dish).name[lang]}</b></span><span class="price">${price(dish)}</span></li></ul>
      <label class="quest-extra"><span><img src="assets/${byId.get(route.extra).photo}.webp" width="64" height="56" alt=""><input type="checkbox" id="quest-extra" ${extra ? 'checked' : ''}>${byId.get(route.extra).name[lang]}</span>
        <span class="price">+ ${price(route.extra)}</span></label>
      <div class="quest-total"><span>${t('total')}</span><output id="quest-total"></output></div>`;
    renderTotal();
  }
  const ready = step === 0 ? route : dish;
  $('quest-actions').innerHTML = `${step ? `<button class="secondary" type="button" data-move="-1">${t('back')}</button>` : ''}
    ${step < 2 ? `<button class="primary" type="button" data-move="1" ${ready ? '' : 'disabled'}>${t('next')} →</button>`
      : `<button class="primary" type="button" id="quest-add">${t('add')}</button>`}`;
}
function renderTotal() {
  const sum = byId.get(dish).price + (extra ? byId.get(route.extra).price : 0);
  $('quest-total').textContent = `${sum} ₺`;
}
function choose(button,kind) {
  for (const option of $('quest-content').querySelectorAll(`[data-${kind}]`)) option.setAttribute('aria-pressed',option === button);
  $('quest-actions').querySelector('[data-move="1"]').disabled = false;
}
function addTray() {
  const basket = readBasket();
  const selected = extra ? [dish,route.extra] : [dish];
  if (selected.some(id => basket[id] >= 99)) {
    $('quest-error').textContent = t('limit');
    return;
  }
  for (const id of selected) basket[id] = (basket[id] ?? 0) + 1;
  if (!save('basket',JSON.stringify(basket))) {
    $('quest-error').textContent = t('failed');
    return;
  }
  $('quest-add').disabled = true;
  location.assign(`./?lang=${lang}&cart=1`);
}

$('language').addEventListener('change',() => {
  lang = $('language').value;
  save('lang',lang);
  const url = new URL(location.href);
  url.searchParams.set('lang',lang);
  history.replaceState(null,'',url);
  render();
});
$('quest-content').addEventListener('click',event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.route) {
    const selected = routes.find(choice => choice.id === button.dataset.route);
    if (selected !== route) {
      route = selected;
      dish = null;
      extra = false;
    }
    choose(button,'route');
  }
  if (button.dataset.dish) {
    dish = button.dataset.dish;
    choose(button,'dish');
  }
});
$('quest-content').addEventListener('change',event => {
  if (event.target.id === 'quest-extra') {
    extra = event.target.checked;
    renderTotal();
  }
});
$('quest-actions').addEventListener('click',event => {
  const button = event.target.closest('button');
  if (button?.id === 'quest-add') addTray();
  if (button?.dataset.move) {
    step += Number(button.dataset.move);
    render();
    $('quest-title').focus();
  }
});
render();
