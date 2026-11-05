(() => {
  const root = document.documentElement;
  const key = 'halk-bufe-selinus:v1:theme';
  const valid = value => value === 'light' || value === 'dark';
  const labels = {
    tr:{light:'Açık tema',dark:'Koyu tema'},
    ru:{light:'Светлая тема',dark:'Тёмная тема'},
    en:{light:'Light theme',dark:'Dark theme'},
    de:{light:'Helles Design',dark:'Dunkles Design'},
  };
  const colors = {light:'#faf7f0', dark:'#151e19'};
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const url = new URL(location.href);
  const requested = url.searchParams.get('theme');
  let theme = system.matches ? 'dark' : 'light';
  let followSystem = true;

  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) { theme = saved; followSystem = false; }
  } catch {}

  if (valid(requested)) { theme = requested; followSystem = false; }

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
      const text = labels[root.lang] ?? labels.tr;
      const label = text[theme === 'dark' ? 'light' : 'dark'];
      button.setAttribute('aria-label', label);
      button.removeAttribute('aria-pressed');
      button.dataset.theme = theme;
      const caption = button.querySelector('.theme-label');
      if (caption) caption.textContent = label;
      button.title = label;
    }
    render();
    button.hidden = false;
    button.addEventListener('click', () => {
      followSystem = false;
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
        followSystem = !valid(event.newValue);
        apply(valid(event.newValue) ? event.newValue : system.matches ? 'dark' : 'light');
        render();
      }
    });
    system.addEventListener('change', () => {
      if (followSystem) { apply(system.matches ? 'dark' : 'light'); render(); }
    });
  });
})();
