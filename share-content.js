/* Shared editorial copy for the share sheet and static social preview pages.
   Ingredient models are NOT confirmed café recipes; keep their provenance visible. */
export const shareLabels = {
  tr:{
    ingredientsMenu:'Menüdeki ana malzemeler',ingredientsTypical:'Olası içerik (örnek tarif)',ingredientsUnknown:'İçerik bilgisi',
    caveatMenu:'Tam tarif ve alerjenler için kafeye danışın.',
    caveatTypical:'Bu örnek bir tarif varsayımıdır; gerçek içerik ve alerjenleri kafeye danışın.',
    caveatUnknown:'İçeriği ve alerjenleri kafeye danışın.',
    cta:'Fotoğrafa bak, detayları gör ve menüden seç',
    price:'Fiyat',where:'Selinus Sahili · Gazipaşa'
  },
  ru:{
    ingredientsMenu:'Основные ингредиенты по меню',ingredientsTypical:'Предполагаемый состав (пример рецепта)',ingredientsUnknown:'Состав',
    caveatMenu:'Точный рецепт и аллергены уточняйте в кафе.',
    caveatTypical:'Это примерный состав, не подтверждённый рецепт кафе. Точный состав и аллергены уточняйте.',
    caveatUnknown:'Точный состав и аллергены уточняйте в кафе.',
    cta:'Посмотреть фото, состав и выбрать блюдо в меню',
    price:'Цена',where:'Пляж Селинус · Газипаша'
  },
  en:{
    ingredientsMenu:'Main ingredients listed on the menu',ingredientsTypical:'Possible ingredients (sample recipe)',ingredientsUnknown:'Ingredients',
    caveatMenu:'Confirm the exact recipe and allergens with the café.',
    caveatTypical:'This is a sample recipe, not a confirmed café recipe. Check ingredients and allergens with staff.',
    caveatUnknown:'Please confirm ingredients and allergens with staff.',
    cta:'See the photo, ingredients and choose from the menu',
    price:'Price',where:'Selinus Beach · Gazipaşa'
  },
  de:{
    ingredientsMenu:'Hauptzutaten laut Speisekarte',ingredientsTypical:'Mögliche Zutaten (Beispielrezept)',ingredientsUnknown:'Zutaten',
    caveatMenu:'Genaue Rezeptur und Allergene bitte im Café erfragen.',
    caveatTypical:'Dies ist ein Beispielrezept, keine bestätigte Café-Rezeptur. Zutaten und Allergene bitte erfragen.',
    caveatUnknown:'Zutaten und Allergene bitte im Café erfragen.',
    cta:'Foto, Zutaten ansehen und Gericht auswählen',
    price:'Preis',where:'Selinus-Strand · Gazipaşa'
  }
};
export function composeShare(item,language='tr',nutrition=null,ask='Ask for price') {
  const lang=Object.hasOwn(shareLabels,language)?language:'tr';
  const t=shareLabels[lang];
  const title=item.name[lang] || item.name.tr;
  const description=item.description?.[lang]?.trim() || '';
  const ingredients=nutrition?.ingredients?.[lang]?.trim() || '';
  const basis=nutrition?.basis || 'unknown';
  const sourceLabel=basis==='menu'?t.ingredientsMenu:basis==='typical'?t.ingredientsTypical:t.ingredientsUnknown;
  const ingredientsLine=ingredients?`${sourceLabel}: ${ingredients}`:'';
  const note=basis==='menu'?t.caveatMenu:basis==='typical'?t.caveatTypical:t.caveatUnknown;
  const price=item.price==null?ask:`${item.price} ₺`;
  const headline=`${title} · ${price}`;
  const summary=[description,ingredientsLine].filter(Boolean).join('\n');
  const details=[`Halk Büfe Selinus · ${t.where}`,headline,summary,`${t.price}: ${price}`,note,`${t.cta}:`].filter(Boolean).join('\n\n');
  const preview=[description,ingredientsLine,note,t.cta].filter(Boolean).join(' ');
  return {title,headline,description,ingredientsLine,note,price,cta:t.cta,details,preview};
}
