import {menu} from './menu.js';

export const byId = new Map(menu.map(item => [item.id,item]));
export const languages = ['tr','ru','en'];
const namespace = 'halk-bufe-selinus:v1';
export const basketKey = `${namespace}:basket`;

export function read(key) {
  try { return localStorage.getItem(`${namespace}:${key}`); } catch { return null; }
}
export function save(key,value) {
  try {
    localStorage.setItem(`${namespace}:${key}`,value);
    return true;
  } catch { return false; }
}
export function readBasket() {
  try {
    const entries = Object.entries(JSON.parse(read('basket')) ?? {});
    return Object.fromEntries(entries.filter(([id,qty]) =>
      byId.has(id) && byId.get(id).price !== null && Number.isInteger(qty) && qty > 0 && qty <= 99));
  } catch { return {}; }
}
export function getLanguage() {
  const urlLanguage = new URLSearchParams(location.search).get('lang');
  return [urlLanguage,read('lang')].find(value => languages.includes(value)) ?? 'tr';
}
