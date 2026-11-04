import {categories, featured, menu} from './menu.js';
import {copy} from './copy.js';
import {basketKey, byId, getLanguage, languages, read, readBasket, save} from './basket.js';

const icons = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19"/>',
  toast: '<path d="M6 20V9C2 8 4 4 8 4h8c4 0 6 4 2 5v11z"/><path d="M9 12l6 4m0-4-6 4"/>',
  burger: '<path d="M3 10a9 6 0 0 1 18 0zM3 14h18M4 17h16l-1 3H5z"/>',
  leaf: '<path d="M20 4c-11-1-16 4-15 11 7 4 14 0 15-11zM4 20l11-11"/>',
  plate: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>',
  fold: '<path d="M3 18 12 5l9 13H3zM7 15h10m-7-3h4"/>',
  star: '<path d="m12 3 2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.9L12 3Z"/>',
  cake: '<path d="M4 12h16v8H4zM4 16h16M12 12V6m-2 0 2-3 2 3"/>',
  cup: '<path d="M6 7h10l-1 11H7zM16 9h2a2 2 0 0 1 0 4h-2M4 21h14M9 4h4"/>',
  bag: '<path d="M5 8h14l1 13H4zM9 9V6a3 3 0 0 1 6 0v3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>',
  grid: '<path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  pin: '<path d="M19 10c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  share: '<path d="M12 15V3m-4 4 4-4 4 4M7 11H5v9h14v-9h-2"/>',
  qr: '<path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h3v3h3v3h-6m6-6v1"/>',
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const $ = id => document.getElementById(id);
let lang = getLanguage();
let category = 'all';
let view = 'list';
let basket = readBasket();
let mode = read('mode') === 'takeaway' ? 'takeaway' : 'here';
let itemOpen = null;
let shareCard = null;
let toastTimeout;
let cashierView = false;
const t = key => copy[lang][key];
const money = n => `${n} ₺`;
const label = row => row[languages.indexOf(lang)+1];
const normalize = str => str.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replaceAll('ı','i');
const moneyOrAsk = item => item.price === null ? t('ask') : money(item.price);
const getLines = () => Object.entries(basket).map(([id,qty]) => ({item:byId.get(id),qty}));
const total = () => getLines().reduce((sum,{item,qty}) => sum + item.price * qty,0);
const count = () => Object.values(basket).reduce((sum,qty) => sum + qty,0);

function notify(message) {
  $('toast-message').textContent = message;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('toast-message').textContent = '', 2200);
}
function addButton(item) {
  return `<button class="icon-button add" type="button" data-add="${item.id}" aria-label="${t('add')} · ${item.name[lang]}">${icon('plus')}</button>`;
}
function titleButton(item) {
  return `<button class="item-open" type="button" data-item="${item.id}">${item.name[lang]}${lang === 'tr' ? '' : `<small lang="tr">${item.name.tr}</small>`}</button>`;
}
function rowHtml(item) {
  return `<li class="menu-row">${titleButton(item)}<span class="${item.price === null ? 'unknown' : 'price'}">${moneyOrAsk(item)}</span>${item.price === null ? '' : addButton(item)}</li>`;
}
function featureHtml(item) {
  return `<article class="feature" data-photo="${item.photo}">
    <button class="feature-open" type="button" data-item="${item.id}" aria-label="${item.name[lang]}"><img src="assets/${item.photo}.webp" loading="lazy" width="280" height="170" alt=""></button>
    <div class="feature-info">${titleButton(item)}<div class="feature-bottom"><span class="${item.price === null ? 'unknown' : 'price'}">${moneyOrAsk(item)}</span>${item.price === null ? '' : addButton(item)}</div></div></article>`;
}
function renderCategories() {
  $('categories').setAttribute('aria-label',t('categories'));
  $('categories').innerHTML = [['all',t('all'),t('all'),t('all'),'grid'],...categories].map(row =>
    `<button class="category" data-category="${row[0]}" aria-pressed="${row[0] === category}" type="button">${icon(row[4])}${label(row)}</button>`).join('');
}
function renderMenu() {
  const query = normalize($('search').value.trim());
  const matching = menu.filter(item => (category === 'all' || item.category === category)
    && (!query || Object.values(item.name).some(name => normalize(name).includes(query))));
  if (view === 'photos') {
    const photos = matching.filter(item => item.photo);
    $('results').innerHTML = photos.length
      ? `<div class="featured">${photos.map(featureHtml).join('')}</div>`
      : `<p class="empty" role="status">${t('noPhotos')}</p>`;
    return;
  }
  const picks = !query && category === 'all'
    ? `<section class="group"><h3 class="group-title">${icon('star')}${t('featured')}</h3><div class="featured">${featured.map(id => featureHtml(byId.get(id))).join('')}</div></section>` : '';
  const groups = categories.map(row => {
    const items = matching.filter(item => item.category === row[0]);
    return items.length ? `<section class="group"><h3 class="group-title">${icon(row[4])}${label(row)} <small>${items.length}</small></h3><ul class="menu-list">${items.map(rowHtml).join('')}</ul></section>` : '';
  }).join('');
  $('results').innerHTML = picks + (groups || `<p class="empty" role="status">${t('noResults')}</p>`);
}
function renderLanguage() {
  document.documentElement.lang = lang;
  $('language').value = lang;
  for (const [id,key] of Object.entries({
    'hero-title':'heroTitle','hero-text':'heroText','hero-caption':'heroCaption','menu-kicker':'menuKicker',
    'menu-title':'menuTitle','footer-text':'footer',
  })) $(id).textContent = t(key);
  $('hero-kicker').innerHTML = icon('pin') + t('heroKicker');
  $('hero-cta').innerHTML = t('heroCta') + icon('arrow');
  $('guide-link').textContent = t('guide');
  $('guide-link').href = `guide.html?lang=${lang}`;
  $('location').innerHTML = icon('pin') + t('map');
  $('menu-view').setAttribute('aria-label',t('view'));
  $('menu-view').setAttribute('role','group');
  $('menu-view').innerHTML = ['list','photos'].map((option,index) => `<button type="button" data-view="${option}" aria-pressed="${option === view}">${t(index ? 'photoView' : 'listView')}</button>`).join('');
  $('search').placeholder = t('search');
  $('search').setAttribute('aria-label',t('search'));
  for (const close of document.querySelectorAll('.close')) {
    close.innerHTML = icon('close');
    close.setAttribute('aria-label',t('close'));
  }
  renderCategories();
  renderMenu();
  renderCart();
}
function focusMenu() {
  $('menu').scrollIntoView({block:'start'});
}
function update(id, delta) {
  if (byId.get(id)?.price == null) return false;
  const qty = (basket[id] ?? 0) + delta;
  if (qty > 99) {
    notify(t('qtyLimit'));
    return false;
  }
  if (qty > 0) basket[id] = qty;
  else delete basket[id];
  save('basket', JSON.stringify(basket));
  if (cashierView && !count()) cashierView = false;
  renderCart();
  return true;
}
function recommend() {
  const items = getLines().map(({item}) => item);
  const has = group => items.some(item => group.includes(item.category));
  if (!has(['drinks']) && has(['gozleme','toast','breakfast','dessert'])) return byId.get('cay');
  if (!basket.patates && !has(['kids']) && items.some(item => item.category === 'burger' && item.id !== 'patates')) return byId.get('patates');
  if (items.every(item => item.category === 'drinks')) return byId.get('revani');
  return null;
}
function cartControls(item, qty) {
  return `<div class="quantity">
    <button class="step-button" type="button" data-step="-1" data-id="${item.id}" aria-label="${t('reduce')} · ${item.name[lang]}">${icon('minus')}</button>
    <output aria-label="${item.name[lang]}">${qty}</output>
    <button class="step-button" type="button" data-step="1" data-id="${item.id}" aria-label="${t('increase')} · ${item.name[lang]}" ${qty >= 99 ? 'disabled' : ''}>${icon('plus')}</button>
  </div>`;
}
function renderCart() {
  const qty = count();
  $('header-cart').setAttribute('aria-label',`${t('cart')} · ${qty}`);
  $('header-cart').innerHTML = icon('bag') + `<span class="header-cart-label">${t('cart')}</span><span class="counter">${qty}</span>`;
  $('mobile-cart').hidden = !qty;
  $('mobile-cart-button').innerHTML = `<span class="cart-summary">${icon('bag')}${t('cart')} · ${qty}</span><strong>${money(total())}</strong>`;
  $('cart-title').textContent = t(cashierView ? 'cashierTitle' : 'cart');
  $('cart-kicker').textContent = t(cashierView ? 'cashierKicker' : 'cartKicker');
  if (cashierView) {
    renderCashier();
    return;
  }
  if (!qty) {
    $('cart-body').innerHTML = `<p class="empty">${t('emptyCart')}</p>`;
    $('cart-footer').innerHTML = `<button type="button" class="primary" data-action="menu">${t('returnMenu')}</button>`;
    return;
  }
  const extra = recommend();
  const lines = getLines().map(({item,qty}) =>
    `<li class="cart-line"><div><b>${item.name[lang]}</b><small>${money(item.price)} × ${qty} · ${money(item.price * qty)}</small></div>${cartControls(item,qty)}</li>`).join('');
  const offer = extra ? `<section class="offer">
    <img class="offer-photo" src="assets/${extra.photo}.webp" width="144" height="144" alt="">
    <div class="offer-copy"><div class="eyebrow">${icon('star')}${t('offer')}</div>
    <b>${extra.name[lang]}</b><button class="offer-add" type="button" data-add="${extra.id}" data-offer aria-label="${t('offerAdd')} ${money(extra.price)} · ${extra.name[lang]}">${t('offerAdd')} ${money(extra.price)}</button></div></section>` : '';
  $('cart-body').innerHTML = `<ul class="cart-list">${lines}</ul>${offer}
    <fieldset class="serve"><legend>${t('mode')}</legend>
      ${['here','takeaway'].map(option => `<label><input type="radio" name="mode" value="${option}" ${mode === option ? 'checked' : ''}><span>${t(option)}</span></label>`).join('')}
    </fieldset>`;
  $('cart-footer').innerHTML = `<div class="total"><span>${t('subtotal')}</span><strong id="cart-total">${money(total())}</strong></div>
    <button type="button" class="primary" data-action="cashier">${icon('qr')}${t('cashier')}</button><p class="handoff-note">${t('checkoutNote')}</p>`;
}
function orderText() {
  const service = mode === 'takeaway' ? 'Paket' : 'Burada';
  return ['Halk Büfe Selinus', service, ...getLines().map(({item,qty}) => `${qty} × ${item.name.tr} — ${money(item.price * qty)}`),
    `Toplam: ${money(total())}`].join('\n');
}
function drawQR(canvas, content) {
  const code = new window.SelinusQRCode(-1,1);
  code.addData(String.fromCharCode(...new TextEncoder().encode(content)));
  code.make();
  const modules = code.getModuleCount();
  const pixel = 5;
  canvas.width = canvas.height = (modules + 8) * pixel;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0,0,canvas.width,canvas.height);
  context.fillStyle = '#000';
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (code.isDark(y,x)) context.fillRect((x+4)*pixel,(y+4)*pixel,pixel,pixel);
    }
  }
}
function renderCashier() {
  $('cart-body').innerHTML = `<div class="qr"><p>${t('cashierNote')}</p><canvas id="order-qr" role="img" aria-label="${t('qrAlt')}" hidden></canvas></div>
    <p class="serve-summary" lang="tr">${mode === 'takeaway' ? 'Paket' : 'Burada'}</p>
    <ul class="cart-list cashier-list" lang="tr">${getLines().map(({item,qty}) =>
      `<li class="cart-line"><b>${qty} × ${item.name.tr}</b><span class="price">${money(item.price * qty)}</span></li>`).join('')}</ul>`;
  try {
    drawQR($('order-qr'),orderText());
    $('order-qr').hidden = false;
  } catch (error) {
    console.warn('QR unavailable. The text summary is still available.',error);
  }
  $('cart-footer').innerHTML = `<div class="total"><span>${t('subtotal')}</span><strong>${money(total())}</strong></div>
    <button type="button" class="secondary" data-action="copy">${t('copy')}</button>
    <button type="button" class="primary" data-action="edit">${t('edit')}</button>`;
}
function openCart() {
  cashierView = false;
  renderCart();
  if (!$('cart').open) $('cart').showModal();
}
function shareUrl(item) {
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set('lang', lang);
  url.hash = `dish-${item.id}`;
  return url.href;
}
function openItem(id) {
  const item = byId.get(id);
  if (!item) return;
  itemOpen = item;
  shareCard = null;
  $('item-category').textContent = label(categories.find(row => row[0] === item.category));
  $('item-title').textContent = item.name[lang];
  $('item-body').innerHTML = `${item.photo ? `<img class="detail-photo" id="detail-photo" src="assets/${item.photo}.webp" alt=""><small class="photo-note">${t('photoNote')}</small>` : ''}
    ${lang === 'tr' ? '' : `<p class="detail-text" lang="tr">${item.name.tr}</p>`}
    <span class="detail-price ${item.price === null ? 'unknown' : 'price'}">${moneyOrAsk(item)}</span>
    ${item.price === null ? `<p class="detail-text">${t('priceNote')}</p>` : ''}
    <div class="share-fallback" id="share-fallback" hidden></div>`;
  $('item-footer').innerHTML = `<button type="button" class="secondary" data-action="share">${icon('share')}${t('share')}</button>
    ${item.price === null ? '' : `<button type="button" class="primary" data-add="${item.id}" data-detail>${icon('plus')}${t('add')} · ${money(item.price)}</button>`}`;
  if (!$('item-dialog').open) $('item-dialog').showModal();
  prepareShareCard(item,$('detail-photo')).then(file => {
    if (itemOpen === item) shareCard = file;
  }).catch(() => {});
}
function drawCover(context,image,y,height) {
  const scale = Math.max(800 / image.naturalWidth, height / image.naturalHeight);
  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;
  context.save();
  context.beginPath();
  context.rect(0,y,800,height);
  context.clip();
  context.drawImage(image,(800-w)/2,y+(height-h)/2,w,h);
  context.restore();
}
async function prepareShareCard(item,image) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 640;
  const context = canvas.getContext('2d');
  context.fillStyle = '#113d37';
  context.fillRect(0,0,800,640);
  let bottom = 160;
  if (image) {
    try {
      await image.decode();
      drawCover(context,image,82,330);
      bottom = 450;
    } catch {}
  }
  context.fillStyle = '#f2c47a';
  context.font = 'bold 28px system-ui';
  context.fillText('HALK BÜFE SELİNUS · GAZİPAŞA',32,52,730);
  context.fillStyle = '#fffdf7';
  context.font = 'bold 43px system-ui';
  const words = item.name[lang].split(' ');
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > 730 && line) {
      context.fillText(line,32,bottom,730);
      bottom += 48;
      line = word;
    } else line = candidate;
  }
  context.fillText(line,32,bottom,730);
  context.font = 'bold 32px system-ui';
  context.fillStyle = '#f2c47a';
  context.fillText(moneyOrAsk(item),32,bottom+51,730);
  const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/jpeg',.9));
  return blob && new File([blob],`halk-bufe-${item.id}.jpg`,{type:'image/jpeg'});
}
function showCopyFallback(container, value) {
  const field = document.createElement('textarea');
  field.className = 'copy-field';
  field.setAttribute('aria-label',t('selectCopy'));
  field.readOnly = true;
  field.value = value;
  container.querySelector('.copy-field')?.remove();
  container.append(field);
  field.focus();
  field.select();
}
async function copyText(value, container) {
  try {
    await navigator.clipboard.writeText(value);
    const button = container.querySelector('[data-action="copy"],[data-action="copy-link"]');
    if (button) button.textContent = t('copied');
  } catch { showCopyFallback(container,value); }
}
async function shareItem() {
  const item = itemOpen;
  if (!item) return;
  const title = item.name[lang];
  const url = shareUrl(item);
  if (navigator.share) {
    const payload = {title, text:`${title} · ${moneyOrAsk(item)}\n${url}`};
    if (shareCard && navigator.canShare?.({files:[shareCard]})) payload.files = [shareCard];
    else if (!shareCard) payload.url = url;
    if (payload.files || payload.url) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
  }
  const fallback = $('share-fallback');
  fallback.hidden = false;
  fallback.innerHTML = `<small>${t('fallback')}</small><button type="button" class="secondary" data-action="copy-link">${t('copyLink')}</button>
    <button type="button" class="secondary" data-action="download">${t('download')}</button>`;
}
function showDishFromHash() {
  if (location.hash.startsWith('#dish-')) openItem(location.hash.slice(6));
}

$('language-icon').innerHTML = icon('globe');
$('search-icon').innerHTML = icon('search');
$('language').addEventListener('change', () => {
  lang = $('language').value;
  save('lang',lang);
  const url = new URL(location.href);
  url.searchParams.set('lang',lang);
  history.replaceState(null,'',url);
  renderLanguage();
});
$('search').addEventListener('input', () => {
  if (category !== 'all') {
    category = 'all';
    renderCategories();
  }
  renderMenu();
});
$('header-cart').addEventListener('click',openCart);
$('mobile-cart-button').addEventListener('click',openCart);
$('hero-cta').addEventListener('click',event => {
  event.preventDefault();
  $('menu-title').focus({preventScroll:true});
  focusMenu();
});
$('cart').addEventListener('change',event => {
  if (event.target.name === 'mode') {
    mode = event.target.value;
    save('mode', mode);
  }
});
$('cart').addEventListener('close',() => {
  cashierView = false;
  if (!count() && document.activeElement === document.body) $('header-cart').focus({preventScroll:true});
});
for (const id of ['cart','item-dialog']) $(id).addEventListener('click',event => {
  if (event.target === $(id)) $(id).close();
});
window.addEventListener('hashchange',showDishFromHash);
window.addEventListener('storage',event => {
  if (event.key === basketKey || event.key === null) {
    basket = readBasket();
    if (!count()) cashierView = false;
    renderCart();
  }
});
document.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  const data = button.dataset;
  if (data.category) {
    category = data.category;
    for (const chip of $('categories').querySelectorAll('button')) chip.setAttribute('aria-pressed',chip === button);
    renderMenu();
    focusMenu();
  }
  if (data.view) {
    view = data.view;
    for (const option of $('menu-view').querySelectorAll('button')) option.setAttribute('aria-pressed',option === button);
    renderMenu();
    focusMenu();
  }
  if (data.item) openItem(data.item);
  if (data.close) $(data.close).close();
  if (data.add && update(data.add,1)) {
    if ('detail' in data) $('item-dialog').close();
    if ('offer' in data) $('cart-footer').querySelector('.primary')?.focus();
    notify(t('added'));
  }
  if (data.step && update(data.id, Number(data.step))) {
    const focus = $('cart-body').querySelector(`[data-id="${data.id}"][data-step="${data.step}"]:not(:disabled)`)
      ?? $('cart-body').querySelector('[data-step]') ?? $('cart-footer').querySelector('button');
    focus?.focus({preventScroll:true});
  }
  switch (data.action) {
    case 'menu': $('cart').close(); $('menu-title').focus({preventScroll:true}); focusMenu(); break;
    case 'cashier':
    case 'edit':
      cashierView = data.action === 'cashier';
      renderCart();
      $('cart-body').scrollTop = 0;
      $('cart').querySelector('.close').focus();
      break;
    case 'copy': await copyText(orderText(),$('cart-footer')); break;
    case 'share': await shareItem(); break;
    case 'copy-link': if (itemOpen) await copyText(shareUrl(itemOpen),$('share-fallback')); break;
    case 'download': {
      if (!itemOpen) break;
      const file = shareCard ?? await prepareShareCard(itemOpen,$('detail-photo'));
      if (!file) break;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href),1500);
      break;
    }
  }
});

renderLanguage();
const landing = new URL(location.href);
if (landing.searchParams.get('cart') === '1' && count()) {
  landing.searchParams.delete('cart');
  history.replaceState(null,'',landing);
  openCart();
} else showDishFromHash();
