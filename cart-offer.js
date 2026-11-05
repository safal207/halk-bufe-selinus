const platedChicken = new Set(['tavuk-sis','tavuk-izgara','kori-tavuk','citir-tavuk']);
const kidsMeals = new Set(['tavuk-cocuk','kofte-cocuk']);

export function includedSides(item) {
  if (kidsMeals.has(item.id)) return 'cartKidsSides';
  return platedChicken.has(item.id) ? 'cartChickenSides' : null;
}

// One optional pairing, using only priced menu items and the actual basket.
export function recommendFor(lines, catalog) {
  if (!lines.length || lines.some(({item,qty}) => !Number.isFinite(item.price) || item.price < 0 || !Number.isInteger(qty) || qty < 1 || qty > 99)) return null;
  const items = lines.map(({item}) => item);
  const has = category => items.some(item => item.category === category);
  let id, reason;
  if (has('burger') && !items.some(includedSides) && !items.some(item => item.id === 'patates') && items.some(item => item.category === 'burger' && item.id !== 'patates')) {
    id = 'patates'; reason = 'offerFries';
  } else if (!has('drinks') && items.some(item => item.category !== 'drinks')) {
    id = 'cay'; reason = 'offerTea';
  } else if (items.every(item => item.category === 'drinks')) {
    id = 'revani'; reason = 'offerDessert';
  }
  const item = catalog.find(row => row.id === id);
  if (!item || !Number.isFinite(item.price) || item.price < 0 || items.some(row => row.id === item.id)) return null;
  return {item,reason,combinedTotal:lines.reduce((sum,row) => sum + row.item.price * row.qty,0) + item.price};
}
