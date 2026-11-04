(() => {
  const root = document.documentElement;
  const key = 'halk-bufe-selinus:v1:theme';
  const valid = value => value === 'light' || value === 'dark';
  const labels = {tr:'Koyu tema', ru:'Тёмная тема', en:'Dark theme', de:'Dunkles Design'};
  const colors = {light:'#f8f5ed', dark:'#141d19'};
  const url = new URL(location.href);
  const requested = url.searchParams.get('theme');
  let theme = 'light';

  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) theme = saved;
  } catch {}

  if (valid(requested)) theme = requested;

  function apply(value) {
    theme = value;
    root.dataset.theme = value;
    document.querySelector('meta[name="theme-color"]').content = colors[value];
  }

  function save() {
    try { localStorage.setItem(key,theme); } catch {}
  }

  apply(theme);
  if (valid(requested)) save();

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('theme-toggle');
    function render() {
      const label = labels[root.lang] ?? labels.tr;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.title = label;
    }
    render();
    button.hidden = false;
    button.addEventListener('click', () => {
      apply(theme === 'dark' ? 'light' : 'dark');
      save();
      const current = new URL(location.href);
      if (current.searchParams.has('theme')) {
        current.searchParams.set('theme',theme);
        history.replaceState(null,'',current);
      }
      render();
    });
    new MutationObserver(render).observe(root,{attributes:true,attributeFilter:['lang']});
    window.addEventListener('storage', event => {
      if (event.key === key && !valid(new URL(location.href).searchParams.get('theme'))) {
        apply(valid(event.newValue) ? event.newValue : 'light');
        render();
      }
    });
  });
})();
