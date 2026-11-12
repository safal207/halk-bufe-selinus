// A counter handoff reference, NOT a sale, a paid receipt or a POS confirmation.
// Stored only in this tab's sessionStorage; no network or customer identity.
export const draftStorageKey = 'halk-bufe-selinus:v1:prepared-draft';
const codePattern = /^HB-[0-9A-F]{8}-[0-9A-F]{8}$/;
const validModes = new Set(['here','takeaway']);

export function basketSignature(lines, mode) {
  if (!validModes.has(mode) || !Array.isArray(lines) || !lines.length) return null;
  const used = new Set();
  const items = [];
  for (const row of lines) {
    const {item,qty} = row ?? {};
    if (!item || typeof item.id !== 'string' || !/^[a-z0-9-]{1,60}$/.test(item.id) ||
        used.has(item.id) || !Number.isInteger(qty) || qty < 1 || qty > 99 ||
        !Number.isSafeInteger(item.price) || item.price < 0) return null;
    used.add(item.id);
    items.push([item.id,qty,item.price]);
  }
  return JSON.stringify({mode,items:items.sort((a,b)=>a[0].localeCompare(b[0]))});
}

export function randomReference(cryptoSource = globalThis.crypto) {
  if (!cryptoSource?.getRandomValues) return null;
  const bytes = new Uint8Array(8);
  cryptoSource.getRandomValues(bytes);
  const hex = Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('').toUpperCase();
  return `HB-${hex.slice(0,8)}-${hex.slice(8)}`;
}

export function createDraftManager({
  storage = (()=>{try{return globalThis.sessionStorage;}catch{return null;}})(),
  cryptoSource = globalThis.crypto
} = {}) {
  let active = null;
  function readStored() {
    try {
      const value = JSON.parse(storage?.getItem(draftStorageKey) ?? 'null');
      return value && codePattern.test(value.id) && typeof value.signature === 'string'
        ? {id:value.id,signature:value.signature} : null;
    } catch {return null;}
  }
  function prepare(lines, mode) {
    const signature=basketSignature(lines,mode);
    if (!signature) return null;
    if (active?.signature === signature) return active;
    const stored=readStored();
    if (stored?.signature === signature) {active=stored;return active;}
    const id=randomReference(cryptoSource);
    if (!id) return null; // Never pretend a weak or time-based ID is unique.
    active={id,signature};
    try {storage?.setItem(draftStorageKey,JSON.stringify(active));} catch {}
    return active;
  }
  function invalidate() {
    active=null;
    try {storage?.removeItem(draftStorageKey);} catch {}
  }
  return {prepare,invalidate};
}
