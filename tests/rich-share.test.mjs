import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const root = existsSync(new URL('../dist/index.html',import.meta.url))?'../dist/':'../';
const read = file=>readFileSync(new URL(root+file,import.meta.url),'utf8');
const dynamic = async file=>import('data:text/javascript;base64,'+Buffer.from(read(file)).toString('base64'));
const [menuModule,dataModule,copyModule,shareModule]=await Promise.all(
  ['menu.js','nutrition-data.js','copy.js','share-content.js'].map(dynamic)
);
const {menu}=menuModule,{nutritionData}=dataModule,{copy}=copyModule,{composeShare}=shareModule;
const locales=['tr','ru','en','de'];

test('four languages and all 44 dishes have honest full share messages',()=>{
  assert.equal(menu.length,44);
  for(const item of menu)for(const lang of locales){
    const rich=composeShare(item,lang,nutritionData[item.id],copy[lang].ask);
    assert.ok(rich.headline.includes(item.name[lang]));
    assert.ok(rich.details.includes(rich.ingredientsLine));
    assert.ok(rich.details.includes(rich.note));
    assert.ok(rich.details.includes(rich.cta));
    assert.ok(rich.details.includes(rich.price));
    assert.ok(rich.ingredientsLine.length > 10);
    if(nutritionData[item.id].basis!=='menu')assert.match(rich.note,/café|Café|cafe|кафе|kafe|kafeye|Rezept|пример|varsayım/i);
  }
});

test('176 static dish URLs include localized Open Graph and Twitter ingredient copy',()=>{
  const escape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let count=0;
  for(const item of menu)for(const lang of locales){
    const rich=composeShare(item,lang,nutritionData[item.id],copy[lang].ask);
    const html=read(`dish/${lang}/${item.id}/index.html`);
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.ok(html.includes(`<meta property="og:description" content="${escape(rich.preview)}">`));
    assert.ok(html.includes(`<meta name="twitter:description" content="${escape(rich.preview)}">`));
    assert.ok(html.includes(`dish/${lang}/${item.id}/?v=rich-20261110`));
    assert.ok(html.includes(`assets/share/${item.id}-`));
    assert.ok(html.includes(escape(rich.ingredientsLine)));
    assert.ok(html.includes(escape(rich.note)));
    assert.ok(html.includes(escape(rich.cta)));
    count++;
  }
  assert.equal(count,176);
});

test('share buttons transmit full details rather than price-only captions',()=>{
  const js=read('share.js'),html=read('index.html');
  assert.match(js,/text:details\.details,url:shareUrl\(item,lang\)/);
  assert.match(js,/const body=`\$\{current\.details\.details\}\\n\$\{url\}`/);
  assert.match(js,/composeShare\(item,lang,nutritionFor\(item\)/);
  assert.match(html,/id="share-ingredients"/);
  assert.match(html,/id="share-disclaimer"/);
  assert.match(html,/id="share-cta"/);
});

test('social rail has no panel background or glass over photography',()=>{
  const css=read('style.css');
  assert.match(css,/\.social-actions\.social-rail,\s*\.menu-feed \.social-actions\.social-rail\s*\{\s*background:\s*transparent;/);
  assert.match(css,/\.social-rail \.social-like \.icon,[^}]*drop-shadow/);
  assert.match(css,/\.social-rail button:focus-visible/);
});
