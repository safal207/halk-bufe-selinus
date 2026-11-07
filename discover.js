// Curated selections contain menu IDs, so names and prices stay authoritative.
export const collections = Object.freeze([
  {id:'family',title:'discoverFamily',hint:'discoverFamilyHint',image:'campaign/tavuk-cocuk-meal',ids:['tavuk-cocuk','kofte-cocuk','tavuk-sis','kofte','mevsim-salata']},
  {id:'for-you',title:'discoverForYou',hint:'discoverForYouHint',image:'campaign/spinach-gozleme'},
  {id:'hearty',title:'discoverHearty',hint:'discoverHeartyHint',image:'campaign/tavuk-sis-meal',ids:['tavuk-sis','tavuk-izgara','kori-tavuk','kofte','hamburger','cheeseburger','tavuklu-makarna']},
  {id:'tea',title:'discoverTea',hint:'discoverTeaHint',image:'branding/turkish-tea',ids:['cay','bitki-cayi','sade-sepit','kasarli','lorlu','revani']},
  {id:'sweet',title:'discoverSweet',hint:'discoverSweetHint',image:'campaign/revani',ids:['revani','kabak']},
]);

export function collectionChoice(value) {
  return collections.some(item => item.id === value) ? value : 'all';
}

export function collectionItems(catalog,choice,isLiked = () => false) {
  const selected = collections.find(item => item.id === choice);
  if (!selected) return [...catalog];
  if (selected.id === 'for-you') {
    const categories = new Set(catalog.filter(item => isLiked(item.id)).map(item => item.category));
    return catalog.filter(item => categories.has(item.category) && !isLiked(item.id) && item.price !== null);
  }
  const byId = new Map(catalog.map(item => [item.id,item]));
  return selected.ids.map(id => byId.get(id)).filter(item => item && item.price !== null);
}

// Rotating is predictable, avoids duplicates, and always changes the first
// suggestion when at least two dishes match.
export function rotateItems(items,step = 0) {
  if (!items.length) return [];
  const n = Number.isSafeInteger(step) ? step : 0;
  const offset = ((n % items.length) + items.length) % items.length;
  return [...items.slice(offset),...items.slice(0,offset)];
}
