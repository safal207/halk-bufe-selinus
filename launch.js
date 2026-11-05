(() => {
  const screen = document.getElementById('launch-screen');
  if (!screen) return;
  const labels = {
    tr: { title:'Birlikte daha lezzetli.',status:'Menü hazırlanıyor…',dish:'Tavuk şiş' },
    ru: { title:'Вместе вкуснее.',status:'Открываем меню…',dish:'Куриный шашлык' },
    en: { title:'Tastes better together.',status:'Opening the menu…',dish:'Chicken skewers' },
    de: { title:'Zusammen schmeckt’s besser.',status:'Die Speisekarte wird geöffnet…',dish:'Hähnchenspieße' },
  };
  let savedLanguage;
  try { savedLanguage = localStorage.getItem('halk-bufe-selinus:v1:lang'); } catch {}
  const lang = [new URLSearchParams(location.search).get('lang'),savedLanguage,document.documentElement.lang].find(value => Object.hasOwn(labels,value)) ?? 'tr';
  screen.lang = lang;
  for (const [id,key] of [['launch-title','title'],['launch-status','status'],['launch-dish-name','dish']]) document.getElementById(id).textContent = labels[lang][key];
  const hero = document.getElementById('hero-photo');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let appReady = window.halkMenuReady === true;
  let visualReady = !hero || hero.complete;
  let leaving = false;
  let fadeTimer;
  let deadline;
  function cleanup() {
    clearTimeout(deadline);
    clearTimeout(window.halkLaunchWatchdog);
    window.removeEventListener('halk:menu-ready',onReady);
    window.removeEventListener('pagehide',onPageHide);
    window.removeEventListener('pageshow',onPageShow);
    hero?.removeEventListener('load',onVisual);
    hero?.removeEventListener('error',onVisual);
  }
  function dismiss(immediate = false) {
    if (leaving) {
      if (immediate) { clearTimeout(fadeTimer); screen.remove(); }
      return;
    }
    leaving = true;
    cleanup();
    if (immediate || reducedMotion || document.hidden) screen.remove();
    else { screen.classList.add('is-leaving'); fadeTimer = setTimeout(() => screen.remove(),160); }
  }
  function maybeDismiss() { if (appReady && visualReady) dismiss(); }
  function onReady() { appReady = true; maybeDismiss(); }
  function onVisual() { visualReady = true; maybeDismiss(); }
  function onPageHide() { dismiss(true); }
  function onPageShow(event) { if (event.persisted) dismiss(true); }
  window.addEventListener('halk:menu-ready',onReady);
  window.addEventListener('pagehide',onPageHide);
  window.addEventListener('pageshow',onPageShow);
  hero?.addEventListener('load',onVisual);
  hero?.addEventListener('error',onVisual);
  // Always fail open, even when application scripts or an image cannot finish.
  deadline = setTimeout(() => dismiss(true),2600);
  maybeDismiss();
})();
