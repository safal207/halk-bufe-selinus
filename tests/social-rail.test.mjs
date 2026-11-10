import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const root = existsSync(new URL('../dist/app.js',import.meta.url)) ? '../dist/' : '../';
const read = path => readFileSync(new URL(root+path,import.meta.url),'utf8');
const app = read('app.js');
const css = read('style.css');
const html = read('index.html');
const copySource = read('copy.js');
const feature = app.slice(app.indexOf('function featureHtml('),app.indexOf('function renderCategories('));

test('every feed and photo-grid card renders a vertical rail directly on its image',()=>{
  assert.match(feature,/class="feature-media"/);
  assert.match(feature,/socialBar\(item,true,inFeed,true\)/);
  assert.ok(feature.indexOf('socialBar(item,true,inFeed,true)') < feature.indexOf('class="feature-info"'));
  assert.doesNotMatch(feature,/socialBar\(item,!inFeed,inFeed\)/);
  assert.match(css,/\.social-actions\.social-rail\s*\{\s*position:\s*absolute/);
  assert.match(css,/\.social-actions\.social-rail\s*\{[^}]*flex-direction:\s*column/);
});
test('photo rail exposes accessible like, view, save and share controls',()=>{
  assert.match(app,/role="group" aria-label=/);
  assert.match(app,/data-like=/);
  assert.match(app,/data-view-count=/);
  assert.match(app,/data-bookmark=/);
  assert.match(app,/data-share=/);
  assert.match(css,/\.social-rail button:focus-visible/);
  assert.match(css,/\.social-rail \.social-like/);
  assert.match(css,/\.social-rail \.social-views/);
  assert.match(css,/\.social-rail \.social-share/);
  assert.match(css,/\.social-rail \.social-bookmark/);
});
test('double-tap heart bursts on the photo and checkout remains independent',()=>{
  assert.match(app,/button\.closest\('\.feature-media'\)\?\.append\(burst\)/);
  assert.match(feature,/addButton\(item,inFeed\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});
test('four languages and cache-busted on-photo UI assets',()=>{
  for(const key of ['Ürün etkileşimleri','Действия с блюдом','Dish actions','Gerichtaktionen']) {
    assert.ok(copySource.includes(key));
  }
  assert.match(html,/style\.css\?v=inside-reveal-20261110/);
  assert.match(html,/app\.js\?v=inside-reveal-20261110/);
});
