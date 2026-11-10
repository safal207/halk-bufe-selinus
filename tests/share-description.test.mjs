import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,existsSync(path.resolve(here,'../dist/index.html'))?'../dist':'..');
const read=name=>readFileSync(path.join(root,name),'utf8');
const mod=(name,expression)=>{
  const source=read(name).replaceAll('export const ','const ').replaceAll('export function ','function ');
  return new Function(source+';return '+expression+';')();
};
const menu=mod('menu.js','menu'),nutrition=mod('nutrition-data.js','nutritionData'),copy=mod('copy.js','copy');
const compose=mod('share-content.js','composeShare');
const langs=['tr','ru','en','de'];
const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('all 44 dishes have truthful rich localized share copy and social preview pages',()=>{
  assert.equal(menu.length,44);
  for(const item of menu)for(const lang of langs){
    const info=compose(item,lang,nutrition[item.id],copy[lang].ask);
    assert.ok(info.details.includes(item.name[lang]),item.id+' '+lang);
    assert.ok(info.details.includes(info.price),item.id+' price');
    assert.ok(info.details.includes(info.ingredientsLine),item.id+' ingredients');
    assert.ok(info.details.includes(info.note),item.id+' note');
    assert.ok(info.details.includes(info.cta),item.id+' CTA');
    if(nutrition[item.id].basis==='typical') assert.match(info.ingredientsLine,/Olası|Предполагаемый|Possible|Mögliche/);
    const page=read('dish/'+lang+'/'+item.id+'/index.html');
    assert.ok(page.includes('og:description'),item.id);
    assert.ok(page.includes('og:image'),item.id);
    assert.ok(page.includes(htmlEscape(info.preview)),item.id+' '+lang+' preview copy');
    assert.ok(page.includes('?v=rich-20261110'),item.id+' '+lang+' fresh link');
    assert.ok(page.includes('halk-bufe-selinus/?lang='+lang+'#dish-'+item.id),item.id+' '+lang+' destination');
  }
});
test('social sharing uses full details and link, not an image that can strip text',()=>{
  const source=read('share.js');
  assert.match(source,/navigator\.clipboard\.writeText\(body\)/);
  assert.match(source,/text:details\.details/);
  assert.match(source,/url:shareUrl\(item,lang\)/);
  assert.doesNotMatch(source,/data\.files\s*=/);
  assert.match(source,/rich-20261110/);
  for(const id of ['share-description','share-ingredients','share-disclaimer','share-cta'])
    assert.ok(read('index.html').includes('id="'+id+'"'));
});
test('social controls are really transparent but remain touch-friendly and legible',()=>{
  const css=read('style.css');
  const end=css.slice(css.lastIndexOf('/* Clean social controls'));
  assert.match(end,/\.social-actions\.social-rail,[\s\S]*?background:\s*transparent/);
  assert.match(end,/border:\s*0/);
  assert.match(end,/box-shadow:\s*none/);
  assert.match(end,/backdrop-filter:\s*none/);
  assert.match(end,/drop-shadow/);
  assert.match(end,/\.social-rail button:focus-visible/);
  assert.match(css,/height:\s*44px/);
});
