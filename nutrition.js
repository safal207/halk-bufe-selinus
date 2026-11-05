import { ingredients, nutritionData, vitaminProfiles, benefitProfiles } from './nutrition-data.js?v=nutrition-20261105';

export const nutritionLabels = {
  tr: { title:'İçerik ve besin bilgisi', details:'İçerik', ingredients:'İçindekiler', benefits:'Beslenmeye katkısı', vitamins:'Malzemelerdeki vitaminler', estimate:'Tahmini enerji', unknown:'Tarif netleşince hesaplanabilir', basis:'Hesapta kullanılan örnek miktarlar', source:'Bilgi kaynakları', g:'g', ml:'ml', kcal:'kcal', menu:'Ana malzemeler menüden; tam tarifi ekibe sorun.', typical:'Tipik tarif varsayımı; gerçek tarifi ekibe sorun.', note:'Kafenin ölçülmüş besin değerleri değildir. Tarif ve porsiyon değişebilir; gerçek enerji bu aralığın dışında olabilir. Vitamin miktarları ölçülmemiştir. Sos, yağ, süt ve şeker sonucu değiştirir.' },
  ru: { title:'Состав и пищевая ценность', details:'Состав', ingredients:'Состав', benefits:'Что даёт организму', vitamins:'Витамины в ингредиентах', estimate:'Оценка', unknown:'Нужно уточнить рецепт', basis:'Примерные количества для расчёта', source:'Источники', g:'г', ml:'мл', kcal:'ккал', menu:'Основные ингредиенты — из меню. Полный рецепт уточните у команды.', typical:'Предполагаемый типовой рецепт. Состав в кафе может отличаться.', note:'Это оценка, а не измеренные данные кафе. Рецепт и порция могут отличаться; фактическая калорийность может выйти за указанный диапазон. Количество витаминов не измерено. Соус, масло, молоко и сахар меняют результат.' },
  en: { title:'Ingredients & nutrition', details:'Ingredients', ingredients:'Ingredients', benefits:'Nutritional contribution', vitamins:'Vitamins in the ingredients', estimate:'Estimated energy', unknown:'Confirm the recipe first', basis:'Assumed amounts used in the estimate', source:'References', g:'g', ml:'ml', kcal:'kcal', menu:'Main ingredients from the menu; confirm the full recipe with the team.', typical:'Assumed typical recipe; the café recipe may differ.', note:'These are not measured café nutrition values. Recipes and portions vary; actual energy can fall outside the range. Vitamin amounts have not been measured. Sauces, oil, milk and sugar change the result.' },
  de: { title:'Zutaten & Nährwerte', details:'Zutaten', ingredients:'Zutaten', benefits:'Beitrag zur Ernährung', vitamins:'Vitamine in den Zutaten', estimate:'Geschätzter Energiegehalt', unknown:'Rezept bitte zuerst erfragen', basis:'Angenommene Mengen für die Berechnung', source:'Quellen', g:'g', ml:'ml', kcal:'kcal', menu:'Hauptzutaten laut Speisekarte; das vollständige Rezept bitte beim Team erfragen.', typical:'Annahme eines üblichen Rezepts; die Zubereitung im Café kann abweichen.', note:'Keine gemessenen Nährwerte des Cafés. Rezept und Portion können abweichen; der tatsächliche Energiegehalt kann außerhalb der Spanne liegen. Vitaminmengen wurden nicht gemessen. Soßen, Öl, Milch und Zucker verändern das Ergebnis.' },
};
const unknownNotes = {
  tr:'Tam tarif ve porsiyon bilinmediği için enerji ve vitamin miktarı hesaplanmıyor. İçeriği ekibe sorun.',
  ru:'Без точного рецепта и порции калорийность и количество витаминов не рассчитаны. Состав уточните у команды.',
  en:'Energy and vitamin amounts have not been calculated without the exact recipe and serving. Confirm the ingredients with the team.',
  de:'Ohne genaues Rezept und Portionsgröße werden Energie- und Vitaminmengen nicht berechnet. Die Zutaten beim Team erfragen.',
};
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
export function recipeEnergy(recipe) {
  if (recipe === null) return null;
  if (!Array.isArray(recipe) || !recipe.length) throw new Error('Missing nutrition recipe');
  const sums = recipe.reduce((sum,[key,low,high]) => {
    const ref = ingredients[key];
    if (!ref || !ref.kcal.every(Number.isFinite) || !Number.isFinite(low) || !Number.isFinite(high) || low < 0 || high < low) throw new Error(`Invalid nutrition component: ${key}`);
    return [sum[0] + ref.kcal[0]*low/100,sum[1] + ref.kcal[1]*high/100];
  },[0,0]);
  const step = sums[1] <= 30 ? 5 : 10;
  return [Math.floor((sums[0]+1e-9)/step)*step,Math.ceil((sums[1]-1e-9)/step)*step];
}
export function nutritionFor(item) {
  const id = typeof item === 'string' ? item : item?.id;
  const data = nutritionData[id];
  if (!data) throw new Error(`Missing nutrition: ${id}`);
  return {...data,id,energy:recipeEnergy(data.recipe)};
}
export function nutritionSummary(item,lang='tr') {
  const {energy} = nutritionFor(item);
  const t = nutritionLabels[lang] ?? nutritionLabels.tr;
  return energy ? `≈ ${energy[0]}–${energy[1]} ${t.kcal}` : t.details;
}
export function nutritionSearchText(item) {
  return Object.values(nutritionFor(item).ingredients).join(' ');
}
export function nutritionMarkup(item,lang='tr',{open=false}={}) {
  const record = nutritionFor(item);
  const t = nutritionLabels[lang] ?? nutritionLabels.tr;
  const vitamins = record.vitamins.map(key => vitaminProfiles[key]?.[lang]).filter(Boolean).join(' ');
  const amounts = record.recipe?.map(([key,low,high]) => `${ingredients[key].labels[lang]} ${low === high ? low : `${low}–${high}`} ${t[ingredients[key].unit]}`).join(' · ');
  return `<details class="nutrition-panel"${open ? ' open' : ''}>
    <summary><span>${t.title}</span><span class="nutrition-energy">${record.energy ? `${t.estimate}: ${nutritionSummary(item,lang)}` : t.unknown}</span></summary>
    <div class="nutrition-content">
      <p class="nutrition-portion">${escape(record.portion[lang])}</p>
      <section><h3>${t.ingredients}</h3><p>${escape(record.ingredients[lang])}</p>${record.basis !== 'unknown' ? `<small class="nutrition-origin">${t[record.basis]}</small>` : ''}</section>
      <section><h3>${t.benefits}</h3><p>${escape(benefitProfiles[record.benefit][lang])}</p></section>
      <section><h3>${t.vitamins}</h3><p>${escape(vitamins)}</p></section>
      <p class="nutrition-note">${record.energy ? t.note : unknownNotes[lang]}</p>
      ${amounts ? `<details class="nutrition-basis"><summary>${t.basis}</summary><p>${escape(amounts)}</p></details>` : ''}
      <p class="nutrition-sources">${t.source}: <a href="https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data/nutrient-value-some-common-foods-2008.html" target="_blank" rel="noopener noreferrer">Health Canada</a> · <a href="https://www.nhs.uk/conditions/vitamins-and-minerals/" target="_blank" rel="noopener noreferrer">NHS</a></p>
    </div></details>`;
}
