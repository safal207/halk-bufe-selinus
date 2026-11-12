// Zero-network event contract for future consented analytics / POS integration.
// All events are ephemeral CustomEvents. Nothing is stored, transmitted or paid.
// Do not send customer IDs, raw UTM strings, personal data or payment claims.
export const allowedEvents=Object.freeze([
  'menu_view','view_item','add_to_cart','remove_from_cart',
  'begin_checkout','draft_ready','offer_accept','guide_start'
]);
const allowedSources=new Set(['qr','instagram','facebook','google_maps','website','direct']);
const allowedMediums=new Set(['qr','social','organic','referral']);
const allowedViews=new Set(['feed','photos','list']);
const allowedLanguages=new Set(['tr','ru','en','de']);
const itemPattern=/^[a-z0-9-]{1,60}$/;
const draftPattern=/^HB-[0-9A-F]{8}-[0-9A-F]{8}$/;

export function safeAttribution(url) {
  let params;
  try {params=new URL(url).searchParams;} catch {return {source:'direct',medium:null};}
  const rawSource=(params.get('utm_source') ?? '').toLowerCase();
  const rawMedium=(params.get('utm_medium') ?? '').toLowerCase();
  // Explicit allowlists prevent free-text UTM strings from leaking user data.
  return {
    source:allowedSources.has(rawSource)?rawSource:'direct',
    medium:allowedMediums.has(rawMedium)?rawMedium:null
  };
}
export function createFunnelEmitter({url='https://example.invalid/',dispatch=(detail)=>{
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined')
    window.dispatchEvent(new CustomEvent('halk:funnel',{detail}));
}}={}) {
  const attribution=safeAttribution(url);
  function emit(event,data={}) {
    if (!allowedEvents.includes(event)) return false; // NEVER 'purchase' on a demo.
    const detail={event,...attribution};
    if (typeof data.item_id==='string' && itemPattern.test(data.item_id))
      detail.item_id=data.item_id;
    if (Number.isInteger(data.quantity) && data.quantity>0 && data.quantity<=99)
      detail.quantity=data.quantity;
    if (Number.isSafeInteger(data.amount_try) && data.amount_try>=0)
      detail.amount_try=data.amount_try;
    if (typeof data.view==='string' && allowedViews.has(data.view))
      detail.view=data.view;
    if (typeof data.lang==='string' && allowedLanguages.has(data.lang))
      detail.lang=data.lang;
    if (typeof data.order_reference==='string' && draftPattern.test(data.order_reference))
      detail.order_reference=data.order_reference;
    // No IP, fingerprint, cookies, raw referrer, emails or arbitrary UTM values.
    dispatch(Object.freeze(detail));
    return true;
  }
  return {emit,attribution};
}
