import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';

const folder=existsSync(new URL('../dist/inside.js',import.meta.url))?'../dist/':'../';
const read=p=>readFileSync(new URL(folder+p,import.meta.url),'utf8');
const {menu}=await import(new URL(folder+'menu.js',import.meta.url));
const {nutritionData}=await import(new URL(folder+'nutrition-data.js',import.meta.url));
const {insideContent,insideButton,insideLabels,openInside,setupInside}=await import(new URL(folder+'inside.js',import.meta.url));

test('every dish has a qualified ingredient diagram in all 4 languages',()=>{
  assert.equal(menu.length,44);
  for(const dish of menu)for(const lang of ['tr','ru','en','de']){
    const data=insideContent(dish,lang);
    assert.equal(data.itemId,dish.id);
    assert.equal(data.title,dish.name[lang]);
    assert.ok(data.chips.includes('<li>'));
    assert.equal(data.ingredients,nutritionData[dish.id].ingredients[lang]);
    assert.ok(data.note.includes(insideLabels[lang][nutritionData[dish.id].basis]));
    assert.ok(data.visualNote.length>25);
    assert.match(insideButton(dish,lang),/data-inside="/);
    assert.doesNotMatch(data.chips,/undefined|NaN|\[object Object\]/);
    if(nutritionData[dish.id].basis==='typical')
      assert.equal(data.note,insideLabels[lang].typical);
    if(nutritionData[dish.id].basis==='unknown')
      assert.equal(data.note,insideLabels[lang].unknown);
  }
});

test('reveal is wired to feed photo and detail without losing social actions',()=>{
  const app=read('app.js'),html=read('index.html'),css=read('style.css');
  assert.match(app,/insideButton\(item,lang\)/);
  assert.match(app,/data\.inside/);
  assert.match(app,/openInside\(byId\.get\(data\.inside\),lang\)/);
  assert.match(app,/setupInside\(\)/);
  assert.match(app,/socialBar\(item,true,inFeed,true\)/);
  assert.match(html,/id="inside-dialog"/);
  assert.match(html,/id="inside-slider"/);
  assert.match(html,/id="inside-full"/);
  assert.match(css,/\.inside-reveal\s*\{[^}]*clip-path:\s*inset\(0 0 0 var\(--inside-split\)\)/);
  assert.match(css,/\.feature-media \.inside-trigger/);
  assert.match(css,/\.featured \.feature-media \.inside-trigger span\s*\{\s*display:\s*none/);
  assert.match(html,/app\.js\?v=inside-reveal-20261110/);
  assert.match(html,/style\.css\?v=inside-reveal-20261110/);
});

test('slide control updates composition split and has a keyboard-accessible label',()=>{
  const previous=globalThis.document;
  const map=new Map();
  const ids=['inside-slider','inside-stage','inside-title','inside-photo','inside-visual-label','inside-image-label',
    'inside-slider-label','inside-chips','inside-more','inside-description','inside-note','inside-full','inside-dialog'];
  for(const id of ids)map.set(id,{style:{setProperty(k,v){this[k]=v;}},value:'50',
    setAttribute(k,v){this[k]=v;},focus(){this.focused=true;},addEventListener(k,fn){this['on'+k]=fn;}});
  const dialog=map.get('inside-dialog');dialog.open=false;dialog.showModal=()=>{dialog.open=true;};
  globalThis.document={getElementById:id=>map.get(id)};
  try{
    setupInside();
    openInside(menu[0],'ru');
    const slider=map.get('inside-slider'),stage=map.get('inside-stage');
    assert.equal(dialog.open,true);
    assert.equal(slider.focused,true);
    assert.match(slider['aria-label'],/Сдвиньте/);
    slider.value='72';slider.oninput();
    assert.equal(stage.style['--inside-split'],'72%');
    assert.equal(map.get('inside-description').textContent,nutritionData[menu[0].id].ingredients.ru);
    assert.equal(map.get('inside-full').dataset.nutrition,menu[0].id);
  }finally{globalThis.document=previous;}
});
