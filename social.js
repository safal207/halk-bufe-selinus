// Personal reactions only; these are not other visitors' counts.
export const socialKey = 'halk-bufe-selinus:v1:social';
export const seenKey = 'halk-bufe-selinus:v1:seen';
const maximumViews = 99999;
const browserStorage = name => { try { return globalThis[name]; } catch { return null; } };
export function createSocialStore(ids, options = {}) {
  const allowed = new Set(ids);
  const local = options.local === undefined ? browserStorage('localStorage') : options.local;
  const session = options.session === undefined ? browserStorage('sessionStorage') : options.session;
  let state = {likes:{}, views:{}};
  let volatile = false;
  const seen = new Set();
  function read(target, key) { try { return JSON.parse(target?.getItem(key) ?? 'null'); } catch { return null; } }
  function clean(value) {
    const result = {likes:{}, views:{}};
    if (!value || typeof value !== 'object') return result;
    for (const id of allowed) {
      if (value.likes?.[id] === true) result.likes[id] = true;
      const n = value.views?.[id];
      if (Number.isInteger(n) && n > 0 && n <= maximumViews) result.views[id] = n;
    }
    return result;
  }
  function refresh() { if (!volatile) state = clean(read(local,socialKey)); }
  function persist() {
    try {
      if (!local) throw new Error('Storage unavailable');
      local.setItem(socialKey,JSON.stringify(state));
      volatile = false;
      return true;
    } catch { volatile = true; return false; }
  }
  refresh();
  const previous = read(session,seenKey);
  if (Array.isArray(previous)) for (const id of previous) if (allowed.has(id)) seen.add(id);
  return {
    refresh,
    liked:id => state.likes[id] === true,
    views:id => state.views[id] ?? 0,
    likedCount:() => Object.keys(state.likes).length,
    toggleLike(id) {
      if (!allowed.has(id)) return null;
      refresh();
      if (state.likes[id]) delete state.likes[id]; else state.likes[id] = true;
      return {liked:!!state.likes[id],saved:persist()};
    },
    recordView(id) {
      if (!allowed.has(id) || seen.has(id)) return false;
      seen.add(id);
      try { session?.setItem(seenKey,JSON.stringify([...seen])); } catch {}
      refresh();
      state.views[id] = Math.min(maximumViews,(state.views[id] ?? 0) + 1);
      persist();
      return true;
    }
  };
}
