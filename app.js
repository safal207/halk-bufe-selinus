import {openShare} from './share.js?v=story-share-1';
import {categories, menu} from './menu.js?v=pasta-retouch-20261107';
import {copy} from './copy.js?v=social-20261110';
import {collections,collectionChoice,collectionItems,rotateItems} from './discover.js?v=discover-20261107';
import {dayparts,daypartChoice,daypartFor,daypartPhoto,createDaypartClock} from './daypart.js?v=daypart-20261106';
import {includedSides,recommendFor} from './cart-offer.js?v=cart-20261105';
import {createSocialStore,socialKey} from './social.js?v=tiktok-social-20261110';
import {nutritionLabels,nutritionMarkup,nutritionSearchText,nutritionSummary} from './nutrition.js?v=nutrition-20261105';
import {basketKey, byId, getLanguage, read, readBasket, save} from './basket.js?v=pasta-retouch-20261107';

const social = createSocialStore(menu.map(item => item.id));
const icons = {
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
  bookmark: '<path d="M5 3h14v18l-7-5-7 5V3Z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
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
  share: '<path d="m21 3-7 18-4-7-7-4L21 3ZM10 14 21 3"/>',
  qr: '<path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h3v3h3v3h-6m6-6v1"/>',
  shuffle: '<path d="M4 7h3c4 0 6 10 10 10h3m-3-3 3 3-3 3M4 17h3c1.2 0 2.2-.9 3.1-2.2M14 9.2C15 7.9 16 7 17 7h3m-3-3 3 3-3 3"/>',
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const $ = id => document.getElementById(id);
let lang = getLanguage();
let category = 'all';
const viewLabels = {feed:'feedView',photos:'photoView',list:'listView'};
const requestedView = new URLSearchParams(location.search).get('view');
let view = Object.hasOwn(viewLabels, requestedView) ? requestedView : 'feed';
let basket = readBasket();
let basketSaved = true;
let mode = read('mode') === 'takeaway' ? 'takeaway' : 'here';
let itemOpen = null;
let toastTimeout;
let cashierView = false;
let appliedOffer = null;
let lightChoice = daypartChoice(new URLSearchParams(location.search).get('time'));
let activeDaypart = daypartFor(new Date(),lightChoice);
let collection = collectionChoice(new URLSearchParams(location.search).get('collection'));
let collectionStep = 0;
let displayedItems = [];
let pendingPhotoTap = null;
const t = key => copy[lang][key];
const money = n => `${n} ₺`;
const normalize = str => str.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replaceAll('ı','i').replaceAll('ß','ss');
const moneyOrAsk = item => item.price === null ? t('ask') : money(item.price);
const getLines = () => Object.entries(basket).map(([id,qty]) => ({item:byId.get(id),qty}));
const total = () => getLines().reduce((sum,{item,qty}) => sum + item.price * qty,0);
const count = () => Object.values(basket).reduce((sum,qty) => sum + qty,0);

function notify(message) {
  $('toast-message').textContent = message;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('toast-message').textContent = '', 2200);
}
function addButton(item, inFeed = false) {
  return `<button class="${inFeed ? 'primary feed-add' : 'icon-button add'}" type="button" data-add="${item.id}" aria-label="${t('add')} · ${item.name[lang]}">${icon('plus')}${inFeed ? t('add') : ''}</button>`;
}
function titleButton(item, thumbnail = false) {
  const name = `${item.name[lang]}${lang === 'tr' ? '' : `<small lang="tr">${item.name.tr}</small>`}`;
  const content = thumbnail ? `<img class="dish-thumb" src="assets/${item.photo}.webp" loading="lazy" width="58" height="58" alt="">
    <span>${name}${item.description ? `<small class="serving-note">${item.description[lang]}</small>` : ''}<span class="row-price ${item.price === null ? 'unknown' : 'price'}">${moneyOrAsk(item)}</span></span>` : name;
  return `<button class="item-open" type="button" data-item="${item.id}">${content}</button>`;
}
function likeButton(item, feed = false) {
  const liked = social.liked(item.id);
  return `<button class="social-like" type="button" data-like="${item.id}" aria-pressed="${liked}" aria-label="${t(liked ? 'unlike' : 'like')} · ${item.name[lang]}" title="${feed ? t('myLikeHelp') : t(liked ? 'liked' : 'like')}">${icon('heart')}${feed ? `<b data-like-count="${item.id}">${liked ? 1 : 0}</b>` : ''}</button>`;
}
function bookmarkButton(item) {
  const bookmarked = social.bookmarked(item.id);
  return `<button class="social-bookmark" type="button" data-bookmark="${item.id}" aria-pressed="${bookmarked}" aria-label="${t(bookmarked ? 'removeBookmark' : 'bookmark')} · ${item.name[lang]}" title="${t(bookmarked ? 'removeBookmark' : 'bookmark')}">${icon('bookmark')}</button>`;
}
function viewCount(item, compact = false) {
  return `<span class="social-views" title="${t('viewHelp')}" aria-label="${t('myViews')}: ${social.views(item.id)}" data-view-label="${item.id}">${icon('eye')}<span class="views-label">${t(compact ? 'mine' : 'myViews')}</span><b data-view-count="${item.id}">${social.views(item.id)}</b></span>`;
}
function socialBar(item, compact = false, feed = false, onPhoto = false) {
  const groupLabel = onPhoto ? ` role="group" aria-label="${t('socialActions')} · ${item.name[lang]}"` : '';
  return `<div class="social-actions${compact ? ' social-compact' : ''}${feed ? ' social-feed' : ''}${onPhoto ? ' social-rail' : ''}"${groupLabel}>${likeButton(item,true)}${bookmarkButton(item)}${viewCount(item,compact)}<button class="social-share" type="button" data-share="${item.id}" aria-label="${t('share')} · ${item.name[lang]}" title="${t('share')}">${icon('share')}</button></div>`;
}
function rowHtml(item) {
  return `<li class="menu-row">${titleButton(item,true)}<div class="row-actions">${likeButton(item)}${bookmarkButton(item)}${item.price === null ? '' : addButton(item)}</div></li>`;
}
function featureHtml(item, inFeed = false) {
  const group = inFeed ? categories.find(row => row.id === item.category).name[lang] : '';
  return `<article class="feature" data-dish="${item.id}" data-photo="${item.photo}">
    <div class="feature-media">
      <button class="nutrition-entry" type="button" data-nutrition="${item.id}" aria-haspopup="dialog" aria-controls="item-dialog" aria-label="${nutritionLabels[lang].title} · ${item.name[lang]}" title="${nutritionLabels[lang].title}">${icon('info')}<span>${nutritionSummary(item,lang)}</span><span class="nutrition-entry-label">${nutritionSummary(item,lang) === nutritionLabels[lang].details ? '' : ` · ${nutritionLabels[lang].details}`}</span></button>
      <button class="feature-open" type="button" data-item="${item.id}" aria-label="${item.name[lang]}"><img src="assets/${item.photo}.webp" loading="lazy" width="280" height="170" alt=""></button>
      ${socialBar(item,true,inFeed,true)}
    </div>
    <div class="feature-info">${group ? `<div class="eyebrow feed-category">${group}</div>` : ''}${titleButton(item)}${item.description ? `<p class="dish-description">${item.description[lang]}</p>` : ''}<div class="feature-bottom"><span class="${item.price === null ? 'unknown' : 'price'}">${moneyOrAsk(item)}</span>${item.price === null ? '' : addButton(item,inFeed)}</div></div></article>`;
}
function renderCategories() {
  $('categories').setAttribute('aria-label',t('categories'));
  const all = {id:'all', name:{[lang]:t('all')}, icon:'grid'};
  const liked = {id:'liked',name:{[lang]:t('likedFilter')},icon:'heart'};
  const bookmarked = {id:'bookmarked',name:{[lang]:t('savedFilter')},icon:'bookmark'};
  $('categories').innerHTML = [all,liked,bookmarked,...categories].map(row =>
    `<button class="category" data-category="${row.id}" aria-pressed="${row.id === category}" type="button">${icon(row.icon)}${row.name[lang]}${row.id === 'liked' ? `<span class="category-count" data-like-total>${social.likedCount()}</span>` : row.id === 'bookmarked' ? `<span class="category-count" data-bookmark-total>${social.bookmarkedCount()}</span>` : ''}</button>`).join('');
}
function renderDiscover() {
  $('discover-title').textContent = t('discoverTitle');
  $('discover-hint').textContent = t('discoverHint');
  $('discover-strip').setAttribute('aria-label',t('discoverTitle'));
  $('discover-strip').innerHTML = collections.map(item => `<button class="discover-card" type="button" data-collection="${item.id}" aria-pressed="${item.id === collection}">
    <img src="assets/${item.image}.webp" width="60" height="60" loading="lazy" alt=""><span><b>${t(item.title)}</b><small>${t(item.hint)}</small></span></button>`).join('');
  $('discover-next').innerHTML = icon('shuffle') + t('discoverMore');
  $('discover-next').setAttribute('aria-label',t('discoverMoreAria'));
  $('discover-clear').textContent = t('discoverClear');
}
function setCollection(value) {
  collection = collectionChoice(value);
  collectionStep = 0;
  const url = new URL(location.href);
  if (collection === 'all') url.searchParams.delete('collection');
  else url.searchParams.set('collection',collection);
  history.replaceState(null,'',url);
}
function updateDiscoverState(items) {
  const active = collection !== 'all';
  $('categories').hidden = active;
  $('discover-active').hidden = !active;
  if (!active) return;
  const chosen = collections.find(item => item.id === collection);
  $('discover-current').textContent = t(chosen.title);
  $('discover-count').textContent = `${collection === 'for-you' && social.likedCount() ? t('discoverBecause')+' · ' : ''}${t('discoverCount')}: ${items.length}`;
  $('discover-next').disabled = items.length < 2;
}
function renderMenu() {
  $('menu-social-note').hidden = view === 'list' && category !== 'liked' && category !== 'bookmarked';
  document.documentElement.classList.toggle('feed-mode', view === 'feed');
  if (pendingPhotoTap) { clearTimeout(pendingPhotoTap.timer); pendingPhotoTap = null; }
  stopViewObservation();
  const query = normalize($('search').value.trim());
  const ordered = categories.flatMap(group => menu.filter(item => item.category === group.id));
  const matching = rotateItems(collectionItems(ordered,collection,id=>social.liked(id))
    .filter(item => (category === 'all' || (category === 'liked' ? social.liked(item.id) : category === 'bookmarked' ? social.bookmarked(item.id) : item.category === category))
      && (!query || [...Object.values(item.name),...Object.values(item.description ?? {}),nutritionSearchText(item)].some(text => normalize(text).includes(query)))),collectionStep);
  displayedItems = matching;
  updateDiscoverState(matching);
  const emptyKey = collection === 'for-you' && !query ? (social.likedCount() ? 'discoverNoMore' : 'discoverNoLikes') : (category === 'liked' && !query ? 'noLikes' : category === 'bookmarked' && !query ? 'noBookmarks' : 'noResults');
  const empty = `<div class="empty" role="status"><p>${t(emptyKey)}</p><button class="secondary" type="button" data-action="reset-menu">${t('resetSearch')}</button></div>`;
  if (view !== 'list') {
    const inFeed = view === 'feed';
    $('results').innerHTML = matching.length
      ? `${inFeed ? `<div class="feed-hint"><span>${t('feedHint')}</span><strong data-feed-progress aria-label="${t('feedProgress')}">1 / ${matching.length}</strong></div>` : ''}<div class="${inFeed ? 'menu-feed' : 'featured'}"${inFeed ? ` tabindex="0" role="region" aria-label="${t('feedView')}"` : ''}>${matching.map(item => featureHtml(item,inFeed)).join('')}</div>`
      : empty;
    observeVisibleDishes();
    if (inFeed) configureFeedNavigation();
    return;
  }
  const groupOrder = collection !== 'all' || collectionStep ? [...new Set(matching.map(item => item.category))].map(id => categories.find(row => row.id === id)) : categories;
  const groups = groupOrder.map(row => {
    const items = matching.filter(item => item.category === row.id);
    return items.length ? `<section class="group"><h3 class="group-title">${icon(row.icon)}${row.name[lang]} <small>${items.length}</small></h3><ul class="menu-list">${items.map(rowHtml).join('')}</ul></section>` : '';
  }).join('');
  $('results').innerHTML = groups || empty;
}

/* One card per intentional gesture. Scrolling is confined to the feed, not <html>. */
function configureFeedNavigation() {
  const feed = $('results').querySelector('.menu-feed');
  if (!feed) return;
  let wheelTotal = 0, direction = 0, blockedUntil = 0;
  let lastWheelAt = 0;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...feed.querySelectorAll(':scope > .feature')];
  function stepSize() {
    const first = cards[0];
    if (!first) return feed.clientHeight;
    const gap = parseFloat(getComputedStyle(feed).rowGap) || 0;
    return first.getBoundingClientRect().height + gap;
  }
  function currentIndex() {
    const step = stepSize();
    return step ? Math.max(0, Math.min(cards.length - 1, Math.round(feed.scrollTop / step))) : 0;
  }
  function updatePosition() {
    const meter = $('results').querySelector('[data-feed-progress]');
    if (meter) meter.textContent = `${currentIndex()+1} / ${cards.length}`;
  }
  function goOne(direction) {
    const next = Math.max(0,Math.min(cards.length - 1,currentIndex()+direction));
    if (next === currentIndex()) return false;
    feed.scrollTo({top: next*stepSize(), behavior: reducedMotion() ? 'instant' : 'smooth'});
    const meter = $('results').querySelector('[data-feed-progress]');
    if (meter) meter.textContent = `${next+1} / ${cards.length}`;
    return true;
  }
  feed.addEventListener('wheel', event => {
    if (event.ctrlKey || !cards.length) return;
    // At either end, let the visitor continue into the normal page.
    if ((feed.scrollTop < 2 && event.deltaY < 0) ||
        (feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 2 && event.deltaY > 0)) return;
    event.preventDefault();
    const now = Date.now();
    if (now < blockedUntil) return;
    const sign = Math.sign(event.deltaY);
    if (!sign) return;
    if (sign !== direction || now-lastWheelAt>250) wheelTotal = 0;
    direction = sign;
    lastWheelAt = now;
    wheelTotal += (event.deltaMode === 1 ? event.deltaY*16 : event.deltaMode === 2 ? event.deltaY*feed.clientHeight : event.deltaY);
    if (Math.abs(wheelTotal) < 68) return;
    wheelTotal = 0;
    blockedUntil = now + 850;
    goOne(sign);
  }, {passive:false});
  feed.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const dir = event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 :
      event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 0;
    if (!dir) return;
    event.preventDefault();
    goOne(dir);
  });
  feed.addEventListener('scroll',updatePosition,{passive:true});
  updatePosition();
}

function renderLanguage() {
  document.documentElement.lang = lang;
  document.title = `Halk Büfe Selinus · ${t('menuTitle')}`;
  $('language').value = lang;
  $('language').setAttribute('aria-label',t('language'));
  for (const [id,key] of Object.entries({
    'hero-caption':'heroCaption','menu-kicker':'menuKicker',
    'menu-title':'menuTitle','menu-photo-note':'photoNote','footer-text':'footer',
  })) $(id).textContent = t(key);
  $('hero-kicker').innerHTML = icon('pin') + t('heroKicker');
  $('daypart-label').textContent = t('daypartLabel');
  $('daypart-select').innerHTML = [['auto','daypartAuto'],...Object.keys(dayparts).map(key=>[key,key+'Choice'])].map(([value,key])=>`<option value="${value}">${t(key)}</option>`).join('');
  $('daypart-select').value = lightChoice;
  renderHero();
  $('hero-kids').innerHTML = icon('star') + t('heroKids') + icon('arrow');
  $('hero-cta').innerHTML = t('heroCta') + icon('arrow');
  $('guide-link').textContent = t('guide');
  $('guide-link').href = `guide.html?lang=${lang}`;
  $('location').innerHTML = icon('pin') + t('map');
  $('menu-view').setAttribute('aria-label',t('view'));
  $('menu-view').setAttribute('role','group');
  $('menu-view').innerHTML = Object.entries(viewLabels).map(([option,label]) => `<button type="button" data-view="${option}" aria-pressed="${option === view}">${t(label)}</button>`).join('');
  $('menu-social-note').textContent = t('socialNote');
  $('search-toggle').innerHTML = icon('search');
  $('search-toggle').setAttribute('aria-label',t('search'));
  $('search-clear').innerHTML = icon('close');
  $('search-clear').setAttribute('aria-label',t('clearSearch'));
  $('search').placeholder = t('search');
  $('search').setAttribute('aria-label',t('search'));
  for (const close of document.querySelectorAll('.close')) {
    close.innerHTML = icon('close');
    close.setAttribute('aria-label',t('close'));
  }
  renderCategories();
  renderDiscover();
  renderMenu();
  renderCart();
}
function renderHero() {
  const meal = byId.get(activeDaypart.dishId);
  const description = meal.description?.[lang] ?? t('morningDescription');
  document.querySelector('.hero').dataset.daypart = activeDaypart.id;
  $('hero-title').textContent = t(activeDaypart.title);
  $('hero-dish').textContent = meal.name[lang];
  $('hero-text').textContent = description;
  $('hero-price').textContent = money(meal.price);
  $('hero-portion').textContent = t(activeDaypart.id === 'morning' ? 'singlePortion' : 'heroPortion');
  $('daypart-status').textContent = `${t(activeDaypart.light)} · ${activeDaypart.range}${lightChoice === 'auto' ? '' : ' · '+t('daypartPreview')}`;
  const photo = $('hero-photo');
  photo.alt = `${meal.name[lang]}. ${description}`;
  photo.dataset.dishName = meal.name[lang];
  for (const img of [photo,document.querySelector('.launch-meal img')].filter(Boolean)) {
    if (img.dataset.daypart !== activeDaypart.id) {
      img.srcset = `${daypartPhoto(activeDaypart,640)} 640w, ${daypartPhoto(activeDaypart)} 1280w`;
      img.src = daypartPhoto(activeDaypart);
      img.dataset.daypart = activeDaypart.id;
    }
  }
  const launchName = $('launch-dish-name');
  if (launchName) launchName.textContent = meal.name[lang];
  $('hero-nutrition').dataset.nutrition = meal.id;
  $('hero-nutrition').innerHTML = icon('info') + nutritionSummary(meal,lang) + ` · ${nutritionLabels[lang].details}`;
  $('hero-nutrition').setAttribute('aria-label',`${nutritionLabels[lang].title} · ${meal.name[lang]}`);
  $('hero-order').dataset.add = meal.id;
  $('hero-order').innerHTML = icon('plus') + t('heroAdd');
  $('hero-order').setAttribute('aria-label',`${t('add')} · ${meal.name[lang]} · ${money(meal.price)}`);
}
function closeSearch() {
  $('search').value = '';
  $('search-box').hidden = true;
  $('search-toggle').setAttribute('aria-expanded','false');
}
function focusMenu() {
  const toolbar = $('menu-toolbar');
  const anchor = getComputedStyle(toolbar).position === 'sticky'
    ? $('results').getBoundingClientRect().top - toolbar.offsetHeight - 8
    : toolbar.getBoundingClientRect().top;
  const top = anchor + window.scrollY - document.querySelector('.top').offsetHeight;
  window.scrollTo({top:Math.max(0,top),behavior:'instant'});
}
function showMenuStart() {
  $('menu-title').focus({preventScroll:true});
  $('menu').scrollIntoView({block:'start',behavior:'instant'});
}
function refreshBasket() {
  const saved = read('basket');
  if (basketSaved && saved !== null && saved !== JSON.stringify(basket)) {
    basket = readBasket();
    appliedOffer = null;
  }
}
function persistBasket() {
  basketSaved = save('basket', JSON.stringify(basket));
  if (!count()) {
    cashierView = false;
    appliedOffer = null;
  }
  renderCart();
}
function update(id, delta, isOffer = false) {
  refreshBasket();
  if (isOffer && (appliedOffer || recommend()?.item.id !== id)) {
    renderCart();
    return false;
  }
  if (byId.get(id)?.price == null) return false;
  const qty = (basket[id] ?? 0) + delta;
  if (qty > 99) {
    notify(t('qtyLimit'));
    return false;
  }
  if (qty > 0) basket[id] = qty;
  else delete basket[id];
  if (isOffer) appliedOffer = id;
  else if (appliedOffer === id && qty <= 0) appliedOffer = null;
  persistBasket();
  return true;
}
function recommend() {
  return recommendFor(getLines(),menu);
}
function cartControls(item, qty) {
  return `<div class="quantity">
    <button class="step-button" type="button" data-step="-1" data-id="${item.id}" aria-label="${t('reduce')} · ${item.name[lang]}">${icon('minus')}</button>
    <output aria-label="${item.name[lang]}">${qty}</output>
    <button class="step-button" type="button" data-step="1" data-id="${item.id}" aria-label="${t('increase')} · ${item.name[lang]}" ${qty >= 99 ? 'disabled' : ''}>${icon('plus')}</button>
  </div>`;
}
function cartThumb(item) {
  return `<img class="dish-thumb" src="assets/${item.photo}.webp" loading="lazy" width="52" height="52" alt="">`;
}
function renderOffer() {
  const suggestion = appliedOffer ? null : recommend();
  const extra = appliedOffer ? byId.get(appliedOffer) : suggestion?.item;
  if (!extra) return '';
  if (appliedOffer) return `<section class="offer-confirmation" aria-label="${t('offerApplied')}"><div><b>${t('offerApplied')} · ${extra.name[lang]}</b><small>${t('offerInTotal')}</small></div><button class="offer-undo" type="button" data-action="offer-undo">${t('offerUndo')}</button></section>`;
  return `<section class="offer" aria-label="${t('offer')}">
    <img class="offer-photo" src="assets/${extra.photo}.webp" width="88" height="88" alt="">
    <div class="offer-copy"><div class="eyebrow">${t('offer')}</div>
    <b>${extra.name[lang]}</b><small>${t(suggestion.reason)}</small></div>
    <button class="offer-add" type="button" data-add="${extra.id}" data-offer aria-label="${t('offerAdd')} ${money(extra.price)} · ${extra.name[lang]}">${icon('plus')}${money(extra.price)}</button>
    <p class="offer-total">${t('offerTotal')} <strong>${money(suggestion.combinedTotal)}</strong></p></section>`;
}
function renderCart() {
  const qty = count();
  $('header-cart').setAttribute('aria-label',`${t('cart')} · ${qty}`);
  $('header-cart').innerHTML = icon('bag') + `<span class="header-cart-label">${t('cart')}</span><span class="counter">${qty}</span>`;
  $('mobile-cart').hidden = !qty;
  $('mobile-cart-button').innerHTML = `<span class="cart-summary">${icon('bag')}${t('cart')} · ${qty}</span><strong>${money(total())}</strong>`;
  $('cart-title').textContent = t(cashierView ? 'cashierTitle' : qty ? 'cartTitle' : 'cart');
  $('cart-kicker').textContent = t(cashierView ? 'cashierKicker' : qty ? 'cartReadyKicker' : 'cartKicker');
  if (cashierView) {
    renderCashier();
    return;
  }
  if (!qty) {
    $('cart-body').innerHTML = `<p class="empty">${t('emptyCart')}</p>`;
    $('cart-footer').innerHTML = `<button type="button" class="primary" data-action="menu">${t('returnMenu')}</button>`;
    return;
  }
  const lines = getLines().map(({item,qty}) =>
    `<li class="cart-line cart-edit-line">${cartThumb(item)}<div class="cart-line-copy"><b>${item.name[lang]}</b>${qty > 1 ? `<small>${money(item.price)} × ${qty}</small>` : ''}</div><strong class="cart-line-total">${money(item.price * qty)}</strong>${cartControls(item,qty)}${includedSides(item) ? `<small class="cart-sides">${t(includedSides(item))}</small>` : ''}</li>`).join('');
  $('cart-body').innerHTML = `<ul class="cart-list">${lines}</ul>
    <fieldset class="serve"><legend>${t('mode')}</legend>
      ${['here','takeaway'].map(option => `<label><input type="radio" name="mode" value="${option}" ${mode === option ? 'checked' : ''}><span>${t(option)}</span></label>`).join('')}
    </fieldset>${renderOffer()}`;
  $('cart-footer').innerHTML = `<div class="total"><span>${t('subtotal')}</span><strong id="cart-total">${money(total())}</strong></div>
    <button type="button" class="primary cart-checkout" data-action="cashier"><span>${t('cashier')}</span><span>${money(total())}${icon('arrow')}</span></button><p class="handoff-note">${t('checkoutNote')}</p>`;
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
  $('cart-body').innerHTML = `<p class="cashier-note">${t('cashierNote')}</p>
    <p class="serve-summary" lang="tr">${mode === 'takeaway' ? 'Paket' : 'Burada'}</p>
    <ul class="cart-list cashier-list" lang="tr">${getLines().map(({item,qty}) =>
      `<li class="cart-line"><div class="cart-item">${cartThumb(item)}<b>${qty} × ${item.name.tr}</b></div><span class="price">${money(item.price * qty)}</span></li>`).join('')}</ul>
    <details class="order-code" id="order-code"><summary>${t('showQr')}</summary><div class="qr"><canvas id="order-qr" role="img" aria-label="${t('qrAlt')}" hidden></canvas></div></details>`;
  try {
    drawQR($('order-qr'),orderText());
    $('order-qr').hidden = false;
  } catch (error) {
    $('order-code').hidden = true;
    console.warn('QR unavailable. The text summary is still available.',error);
  }
  $('cart-footer').innerHTML = `<div class="total"><span>${t('subtotal')}</span><strong>${money(total())}</strong></div>
    <button type="button" class="secondary" data-action="copy">${t('copy')}</button>
    <button type="button" class="primary" data-action="edit">${t('edit')}</button>`;
}
function openCart() {
  pauseViewTimers();
  refreshBasket();
  cashierView = false;
  renderCart();
  if (!$('cart').open) $('cart').showModal();
}
function openItem(id, showNutrition = false) {
  const item = byId.get(id);
  if (!item) return;
  pauseViewTimers();
  if (social.recordView(id)) refreshSocial();
  itemOpen = item;
  $('item-category').textContent = categories.find(row => row.id === item.category).name[lang];
  $('item-title').textContent = item.name[lang];
  $('item-body').innerHTML = `<img class="detail-photo" id="detail-photo" src="assets/${item.photo}.webp" alt=""><small class="photo-note">${t('photoNote')}</small>
    ${lang === 'tr' ? '' : `<p class="detail-text" lang="tr">${item.name.tr}</p>`}
    ${item.description ? `<p class="detail-text dish-description">${item.description[lang]}</p>` : ''}
    ${item.price === null ? `<span class="detail-price unknown">${t('ask')}</span>` : ''}
    ${item.price === null ? `<p class="detail-text">${t('priceNote')}</p>` : ''}
    ${nutritionMarkup(item,lang,{open:showNutrition})}
    `;
  $('item-footer').innerHTML = `${socialBar(item)}
    ${item.price === null ? '' : `<button type="button" class="primary" data-add="${item.id}" data-detail>${icon('plus')}${t('add')} · ${money(item.price)}</button>`}`;
  if (!$('item-dialog').open) $('item-dialog').showModal();
  $('item-body').scrollTop = 0;
  if (showNutrition) requestAnimationFrame(() => {
    const panel = $('item-body').querySelector('.nutrition-panel');
    panel.scrollIntoView({block:'start'});
    panel.querySelector('summary').focus({preventScroll:true});
  });
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
function showDishFromHash() {
  if (location.hash.startsWith('#dish-')) openItem(location.hash.slice(6));
}

function refreshSocial() {
  for (const button of document.querySelectorAll('[data-like]')) {
    const item = byId.get(button.dataset.like);
    button.setAttribute('aria-pressed',social.liked(item.id));
    button.setAttribute('aria-label',`${t(social.liked(item.id) ? 'unlike' : 'like')} · ${item.name[lang]}`);
    button.title = button.querySelector('[data-like-count]') ? t('myLikeHelp') : t(social.liked(item.id) ? 'liked' : 'like');
  }
  for (const button of document.querySelectorAll('[data-bookmark]')) {
    const item = byId.get(button.dataset.bookmark);
    if (!item) continue;
    const bookmarked = social.bookmarked(item.id);
    button.setAttribute('aria-pressed',bookmarked);
    button.setAttribute('aria-label',`${t(bookmarked ? 'removeBookmark' : 'bookmark')} · ${item.name[lang]}`);
    button.title = t(bookmarked ? 'removeBookmark' : 'bookmark');
  }
  for (const count of document.querySelectorAll('[data-like-count]')) count.textContent = social.liked(count.dataset.likeCount) ? '1' : '0';
  for (const counter of document.querySelectorAll('[data-view-count]')) counter.textContent = social.views(counter.dataset.viewCount);
  for (const label of document.querySelectorAll('[data-view-label]')) label.setAttribute('aria-label',`${t('myViews')}: ${social.views(label.dataset.viewLabel)}`);
  const likedCount = $('categories').querySelector('[data-category="liked"] .category-count');
  if (likedCount) likedCount.textContent = social.likedCount();
  const savedCount = $('categories').querySelector('[data-bookmark-total]');
  if (savedCount) savedCount.textContent = social.bookmarkedCount();
}
let viewObserver;
const visibleDishes = new Map();
const viewTimers = new Map();
function pauseViewTimers() {
  for (const timer of viewTimers.values()) clearTimeout(timer);
  viewTimers.clear();
}
function stopViewObservation() {
  pauseViewTimers();
  viewObserver?.disconnect();
  visibleDishes.clear();
}
function scheduleVisibleViews() {
  if (document.hidden || document.querySelector('dialog[open]')) return;
  for (const [id,photo] of visibleDishes) {
    if (viewTimers.has(id) || !photo.complete || !photo.naturalWidth) continue;
    viewTimers.set(id,setTimeout(() => {
      viewTimers.delete(id);
      if (visibleDishes.has(id) && !document.hidden && !document.querySelector('dialog[open]') && social.recordView(id)) refreshSocial();
    },1000));
  }
}
function observeVisibleDishes() {
  if (!('IntersectionObserver' in window)) return;
  viewObserver ??= new IntersectionObserver(entries => {
    for (const entry of entries) {
      const id = entry.target.closest('[data-dish]').dataset.dish;
      if (entry.isIntersecting && entry.intersectionRatio >= .6) {
        visibleDishes.set(id,entry.target);
        if (view === 'feed') {
          const meter = $('results').querySelector('[data-feed-progress]');
          if (meter) meter.textContent = `${displayedItems.findIndex(item => item.id === id) + 1} / ${displayedItems.length}`;
        }
      }
      else {visibleDishes.delete(id);clearTimeout(viewTimers.get(id));viewTimers.delete(id);}
    }
    scheduleVisibleViews();
  },{threshold:[0,.6]});
  for (const photo of $('results').querySelectorAll('.feature-open img')) {
    viewObserver.observe(photo);
    if (!photo.complete) photo.addEventListener('load',scheduleVisibleViews,{once:true});
  }
}
document.addEventListener('visibilitychange',() => document.hidden ? pauseViewTimers() : scheduleVisibleViews());
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('close',scheduleVisibleViews);

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
  if (collection !== 'all') {
    setCollection('all');
    renderDiscover();
  }
  if (category !== 'all' && category !== 'liked') {
    category = 'all';
    renderCategories();
  }
  renderMenu();
});
$('search-toggle').addEventListener('click', () => {
  if ($('search-box').hidden) {
    $('search-box').hidden = false;
    $('search-toggle').setAttribute('aria-expanded','true');
    $('search').focus({preventScroll:true});
  } else {
    closeSearch();
    renderMenu();
  }
});
$('search-clear').addEventListener('click', () => {
  $('search').value = '';
  renderMenu();
  $('search').focus({preventScroll:true});
});
$('search').addEventListener('keydown',event => {
  if (event.key === 'Escape') {
    closeSearch();
    renderMenu();
    $('search-toggle').focus({preventScroll:true});
  }
});
$('header-cart').addEventListener('click',openCart);
$('mobile-cart-button').addEventListener('click',openCart);
$('hero-cta').addEventListener('click',event => {
  event.preventDefault();
  category = 'all';
  setCollection('all');
  closeSearch();
  renderCategories();
  renderDiscover();
  renderMenu();
  showMenuStart();
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
  if (event.key === socialKey || event.key === null) {
    const tracksLikes = category === 'liked' || category === 'bookmarked' || collection === 'for-you';
    const before = tracksLikes ? menu.filter(item=>category === 'bookmarked' ? social.bookmarked(item.id) : social.liked(item.id)).map(item=>item.id).join('|') : '';
    social.refresh();
    refreshSocial();
    const after = tracksLikes ? menu.filter(item=>social.liked(item.id)).map(item=>item.id).join('|') : '';
    if (tracksLikes && before !== after) renderMenu();
  }
  if (event.key === basketKey || event.key === null) {
    basket = readBasket();
    basketSaved = true;
    appliedOffer = null;
    if (!count()) {
      cashierView = false;
    }
    renderCart();
  }
});
document.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  const data = button.dataset;
  if (pendingPhotoTap && !(data.item === pendingPhotoTap.id && button.classList.contains('feature-open'))) {
    clearTimeout(pendingPhotoTap.timer);
    pendingPhotoTap = null;
  }
  if (data.collection) {
    const next = collection === data.collection ? 'all' : data.collection;
    setCollection(next);
    category = 'all';
    closeSearch();
    renderCategories();
    renderDiscover();
    renderMenu();
    focusMenu();
    (collection === 'all' ? $('categories').querySelector('[data-category="all"]') : $('discover-next').disabled ? $('discover-clear') : $('discover-next')).focus({preventScroll:true});
  }
  if (data.category) {
    category = data.category;
    setCollection('all');
    renderDiscover();
    closeSearch();
    for (const chip of $('categories').querySelectorAll('button')) chip.setAttribute('aria-pressed',chip === button);
    renderMenu();
    focusMenu();
  }
  if (data.view) {
    view = data.view;
    const url = new URL(location.href);
    url.searchParams.set('view',view);
    history.replaceState(null,'',url);
    for (const option of $('menu-view').querySelectorAll('button')) option.setAttribute('aria-pressed',option === button);
    renderMenu();
    focusMenu();
  }
  if (data.like) {
    const result = social.toggleLike(data.like);
    if (result) {
      refreshSocial();
      if ((category === 'liked' || collection === 'for-you') && !result.liked) {
        renderMenu();
        if (!$('item-dialog').open) ($('results').querySelector(`[data-like="${data.like}"]`) ?? $('results').querySelector('[data-like]') ?? (collection === 'for-you' ? $('discover-clear') : $('categories').querySelector('[data-category="liked"]'))).focus({preventScroll:true});
      }
      notify(t(!result.saved ? 'localOnly' : result.liked ? 'likedAdded' : 'likedRemoved'));
    }
  }
  if (data.bookmark) {
    const result = social.toggleBookmark(data.bookmark);
    if (result) {
      refreshSocial();
      if (category === 'bookmarked' && !result.bookmarked) {
        renderMenu();
        ($('results').querySelector('[data-bookmark]') ?? $('categories').querySelector('[data-category="bookmarked"]'))?.focus({preventScroll:true});
      }
      notify(t(!result.persisted ? 'localOnly' : result.bookmarked ? 'bookmarkedAdded' : 'bookmarkedRemoved'));
    }
  }
  // Defer a pointer tap in the feed so a second tap can like without opening the item.
  // Keyboard activation remains immediate and the heart never toggles an existing like off.
  if (data.item && button.classList.contains('feature-open') && view === 'feed' && event.detail > 0) {
    const now = Date.now();
    if (pendingPhotoTap?.id === data.item && now - pendingPhotoTap.time < 320) {
      clearTimeout(pendingPhotoTap.timer);
      pendingPhotoTap = null;
      let persisted = true;
      if (!social.liked(data.item)) {
        persisted = social.toggleLike(data.item).saved;
        refreshSocial();
        const burst = document.createElement('span');
        burst.className = 'feed-heart-burst';
        burst.textContent = '♥';
        burst.setAttribute('aria-hidden','true');
        button.closest('.feature-media')?.append(burst);
        setTimeout(() => burst.remove(),650);
      }
      notify(t(persisted ? 'likedAdded' : 'localOnly'));
      return;
    }
    if (pendingPhotoTap) clearTimeout(pendingPhotoTap.timer);
    pendingPhotoTap = {id:data.item,time:now,timer:setTimeout(() => {
      pendingPhotoTap = null;
      openItem(data.item);
    },320)};
    return;
  }
  if (data.item) openItem(data.item);
  if (data.nutrition) openItem(data.nutrition,true);
  if (data.share) { pauseViewTimers(); openShare(byId.get(data.share),lang); }
  if (data.close) $(data.close).close();
  const isOffer = 'offer' in data;
  if (data.add && update(data.add,1,isOffer)) {
    if ('detail' in data) $('item-dialog').close();
    if (isOffer) $('cart-body').querySelector('[data-action="offer-undo"]')?.focus({preventScroll:true});
    notify(t('added'));
  }
  if (data.step && update(data.id, Number(data.step))) {
    const focus = $('cart-body').querySelector(`[data-id="${data.id}"][data-step="${data.step}"]:not(:disabled)`)
      ?? $('cart-body').querySelector('[data-step]') ?? $('cart-footer').querySelector('button');
    focus?.focus({preventScroll:true});
  }
  switch (data.action) {
    case 'kids-menu':
      category = 'kids';
      setCollection('all');
      closeSearch();
      renderCategories();
      renderDiscover();
      renderMenu();
      focusMenu();
      $('categories').querySelector('[data-category="kids"]').focus({preventScroll:true});
      break;
    case 'reset-menu':
      category = 'all';
      setCollection('all');
      closeSearch();
      renderCategories();
      renderDiscover();
      renderMenu();
      focusMenu();
      $('search-toggle').focus({preventScroll:true});
      break;
    case 'discover-more':
      collectionStep++;
      renderMenu();
      $('discover-live').textContent = `${t('discoverUpdated')}: ${displayedItems[0]?.name[lang] ?? ''}`;
      focusMenu();
      $('discover-next').focus({preventScroll:true});
      break;
    case 'discover-clear':
      category = 'all';
      setCollection('all');
      closeSearch();
      renderCategories();
      renderDiscover();
      renderMenu();
      focusMenu();
      $('categories').querySelector('[data-category="all"]').focus({preventScroll:true});
      break;
    case 'offer-undo': {
      refreshBasket();
      const undoId = appliedOffer;
      appliedOffer = null;
      if (undoId && update(undoId,-1)) ($('cart-body').querySelector('[data-offer]') ?? $('cart-footer').querySelector('button'))?.focus({preventScroll:true});
      else renderCart();
      break;
    }
    case 'menu': $('cart').close(); showMenuStart(); break;
    case 'cashier':
    case 'edit':
      cashierView = data.action === 'cashier';
      renderCart();
      $('cart-body').scrollTop = 0;
      $('cart').querySelector('.close').focus();
      break;
    case 'copy': await copyText(orderText(),$('cart-footer')); break;
    case 'share': if (itemOpen) openShare(itemOpen,lang); break;
  }
});

const daypartClock = createDaypartClock({choice:lightChoice,onChange(period) {
  activeDaypart = period;
  renderHero();
}});
$('daypart-select').addEventListener('change',() => {
  lightChoice = daypartChoice($('daypart-select').value);
  const url = new URL(location.href);
  if (lightChoice === 'auto') url.searchParams.delete('time');
  else url.searchParams.set('time',lightChoice);
  history.replaceState(null,'',url);
  daypartClock.select(lightChoice);
});
document.addEventListener('visibilitychange',() => { if (!document.hidden) daypartClock.refresh(); });
window.addEventListener('pageshow',() => daypartClock.refresh());
renderLanguage();
const updateLayout = () => document.documentElement.style.setProperty('--menu-stack', `${document.querySelector('.top').offsetHeight + $('menu-toolbar').offsetHeight}px`);
if ('ResizeObserver' in window) {
  const layoutObserver = new ResizeObserver(updateLayout);
  layoutObserver.observe(document.querySelector('.top'));
  layoutObserver.observe($('menu-toolbar'));
}
window.addEventListener('resize',updateLayout);
updateLayout();
const landing = new URL(location.href);
if (landing.searchParams.get('cart') === '1' && count()) {
  landing.searchParams.delete('cart');
  history.replaceState(null,'',landing);
  openCart();
} else showDishFromHash();
window.halkMenuReady = true;
window.dispatchEvent(new Event('halk:menu-ready'));
