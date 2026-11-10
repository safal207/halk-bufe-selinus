import {nutritionFor} from './nutrition.js?v=nutrition-20261105';
import {ingredients} from './nutrition-data.js?v=nutrition-20261105';

export const insideLabels = {
  tr:{trigger:'İçinde ne var?',heading:'İçinde ne var?',diagram:'Malzeme görünümü',slider:'Fotoğraf ile içerik görünümünü karşılaştır',
    full:'Tam içerik ve besin bilgisi',menu:'Menüde belirtilen malzemeler · Tam tarif ve alerjenler için kafeye danışın.',
    typical:'Temsili içerik şeması · Tarif varsayımsaldır; gerçek içeriği ve alerjenleri ekibe sorun.',
    unknown:'Malzeme bilgisi kesinleşmedi · Kafeden teyit edin.',more:'ve diğerleri',
    image:'Yemeğin görseli',interior:'Temsili malzemeler',note:'Fotoğraf ve malzemelerin görünümü şematiktir. Gerçek kesit veya doğrulanmış tarif değildir.'},
  ru:{trigger:'Что внутри?',heading:'Что внутри?',diagram:'Показать ингредиенты',slider:'Сдвиньте, чтобы сравнить фото и схему состава',
    full:'Полный состав и пищевая ценность',menu:'Основные ингредиенты из меню · Точный рецепт и аллергены уточняйте в кафе.',
    typical:'Схема примерного состава · Рецепт не подтверждён. Уточняйте состав и аллергены.',
    unknown:'Состав не подтверждён · Уточняйте в кафе.',more:'и другие',
    image:'Фото блюда',interior:'Схема состава',note:'Это визуальная схема, не настоящий разрез блюда и не подтверждённый рецепт.'},
  en:{trigger:"What's inside?",heading:"What's inside?",diagram:'Ingredient reveal',slider:'Slide to compare the dish photo and ingredient diagram',
    full:'Full ingredients and nutrition',menu:'Main ingredients from the menu · Confirm full recipe and allergens with staff.',
    typical:'Illustrative ingredient view · Recipe not confirmed; ask staff about ingredients and allergens.',
    unknown:'Ingredients unconfirmed · Ask staff for details.',more:'and more',
    image:'Dish photo',interior:'Ingredient diagram',note:'This is an illustration, not a real cross-section or verified recipe.'},
  de:{trigger:'Was ist drin?',heading:'Was ist drin?',diagram:'Zutaten zeigen',slider:'Schieben, um Foto und Zutatenansicht zu vergleichen',
    full:'Alle Zutaten und Nährwerte',menu:'Hauptzutaten laut Speisekarte · Rezeptur und Allergene bitte erfragen.',
    typical:'Beispielhafte Zutatenansicht · Rezeptur nicht bestätigt; Zutaten und Allergene bitte erfragen.',
    unknown:'Zutaten unbestätigt · Bitte im Café nachfragen.',more:'und weitere',
    image:'Gerichtfoto',interior:'Zutatenübersicht',note:'Dies ist eine schematische Ansicht, kein echter Anschnitt oder bestätigtes Rezept.'}
};
const escape = value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const language = lang=>Object.hasOwn(insideLabels,lang)?lang:'tr';

export function insideButton(item,lang='tr') {
  const t=insideLabels[language(lang)];
  return `<button class="inside-trigger" type="button" data-inside="${escape(item.id)}" aria-label="${escape(t.trigger)} · ${escape(item.name[language(lang)])}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 6 12 2l8 4v12l-8 4-8-4Z"/><path d="m4 6 8 4 8-4m-8 4v12"/><path d="m8 8 8 8"/></svg><span>${escape(t.trigger)}</span></button>`;
}
export function insideContent(item,lang='tr') {
  const resolved=language(lang),t=insideLabels[resolved],record=nutritionFor(item);
  const names=record.recipe?.map(([key])=>ingredients[key]?.labels?.[resolved]).filter(Boolean) || [];
  const unique=[...new Set(names)];
  const limit=5;
  const shown=unique.slice(0,limit);
  const more=unique.length>limit?`${t.more} ${unique.length-limit}`:'';
  const note=record.basis==='menu'?t.menu:record.basis==='typical'?t.typical:t.unknown;
  const list=shown.length?shown:[record.ingredients[resolved]];
  return {
    title:item.name[resolved],labels:t,
    ingredients:record.ingredients[resolved],
    note,visualNote:t.note,more,
    chips:list.map((value,i)=>`<li><span class="inside-chip-number">${i+1}</span><span>${escape(value)}</span></li>`).join(''),
    photo:`assets/${item.photo}.webp`,
    itemId:item.id
  };
}
export function openInside(item,lang='tr') {
  if(!item)return;
  const data=insideContent(item,lang);
  const dialog=document.getElementById('inside-dialog');
  const target=id=>document.getElementById(id);
  target('inside-title').textContent=`${data.labels.heading} · ${data.title}`;
  target('inside-visual-label').textContent=data.labels.interior;
  target('inside-image-label').textContent=data.labels.image;
  target('inside-slider-label').textContent=data.labels.slider;
  target('inside-photo').src=data.photo;
  target('inside-photo').alt=data.title;
  target('inside-chips').innerHTML=data.chips;
  target('inside-more').textContent=data.more;
  target('inside-description').textContent=data.ingredients;
  target('inside-note').textContent=`${data.note} ${data.visualNote}`;
  target('inside-full').textContent=data.labels.full;
  target('inside-full').dataset.nutrition=data.itemId;
  const slider=target('inside-slider');
  slider.setAttribute('aria-label',data.labels.slider);
  slider.value='50';
  target('inside-stage').style.setProperty('--inside-split','50%');
  if(!dialog.open)dialog.showModal();
  slider.focus({preventScroll:true});
}
export function setupInside() {
  const slider=document.getElementById('inside-slider'),stage=document.getElementById('inside-stage');
  slider.addEventListener('input',()=>{
    const value=Math.max(12,Math.min(88,Number(slider.value)||50));
    stage.style.setProperty('--inside-split',value+'%');
  });
}
