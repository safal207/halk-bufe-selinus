import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const folder=existsSync(new URL('../dist/discover.js',import.meta.url))?'../dist/':'../';
const {collections,collectionChoice,collectionItems,rotateItems}=await import(new URL(folder+'discover.js',import.meta.url));
const {menu}=await import(new URL(folder+'menu.js',import.meta.url));
const {copy}=await import(new URL(folder+'copy.js',import.meta.url));
const {createSocialStore}=await import(new URL(folder+'social.js',import.meta.url));
const ids=items=>items.map(item=>item.id);

test('curated collections use real, uniquely priced menu dishes and real cover photos',()=>{
  for(const collection of collections){
    assert.ok(existsSync(new URL(folder+'assets/'+collection.image+'.webp',import.meta.url)),collection.image);
    if(!collection.ids)continue;
    const items=collectionItems(menu,collection.id);
    assert.equal(items.length,collection.ids.length,collection.id);
    assert.equal(new Set(ids(items)).size,items.length,collection.id);
    assert.ok(items.every(item=>Number.isFinite(item.price)),collection.id);
  }
  const family=ids(collectionItems(menu,'family'));
  for(const id of ['tavuk-cocuk','kofte-cocuk','tavuk-sis'])assert.ok(family.includes(id));
  const tea=ids(collectionItems(menu,'tea'));
  assert.ok(tea.includes('cay'));assert.ok(tea.includes('kasarli'));
});

test('personal recommendations require a heart, match its categories and omit already liked or unpriced dishes',()=>{
  assert.deepEqual(collectionItems(menu,'for-you'),[]);
  const liked=new Set(['tavuk-cocuk','revani']);
  const result=collectionItems(menu,'for-you',id=>liked.has(id));
  assert.deepEqual(ids(result),['kofte-cocuk','kabak']);
  assert.ok(result.every(item=>!liked.has(item.id) && item.price!==null));
});

test('fully liked categories and unknown likes do not fabricate recommendations',()=>{
  const all=()=>true;
  assert.deepEqual(collectionItems(menu,'for-you',all),[]);
  assert.deepEqual(collectionItems(menu,'for-you',id=>id==='not-a-menu-item'),[]);
  const likedKids=new Set(['tavuk-cocuk','kofte-cocuk']);
  assert.deepEqual(collectionItems(menu,'for-you',id=>likedKids.has(id)),[]);
});

test('blocked browser storage still produces recommendations for this visit',()=>{
  const blocked={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};
  const social=createSocialStore(menu.map(item=>item.id),{local:blocked,session:blocked});
  assert.deepEqual(social.toggleLike('tavuk-cocuk'),{liked:true,saved:false});
  assert.deepEqual(ids(collectionItems(menu,'for-you',social.liked)),['kofte-cocuk']);
});

test('showing another dish rotates without mutating the list, adding items or repeating the first early',()=>{
  const input=collectionItems(menu,'family');const before=ids(input);
  const firsts=[];
  for(let step=0;step<input.length;step++){
    const shuffled=rotateItems(input,step);
    firsts.push(shuffled[0].id);
    assert.deepEqual([...ids(shuffled)].sort(),[...before].sort());
  }
  assert.equal(new Set(firsts).size,input.length);
  assert.deepEqual(ids(input),before);
  assert.deepEqual(rotateItems([],1),[]);
  assert.deepEqual(ids(rotateItems(input,-1)),[before.at(-1),...before.slice(0,-1)]);
});

test('URL values are limited to known choices and all four languages have complete accessible labels',()=>{
  for(const bad of [null,'','__proto__','../family','night'])assert.equal(collectionChoice(bad),'all');
  for(const item of collections){
    assert.equal(collectionChoice(item.id),item.id);
    for(const lang of ['tr','ru','en','de'])for(const key of [item.title,item.hint,'discoverTitle','discoverHint','discoverMore','discoverMoreAria','discoverClear','discoverCount','discoverBecause','discoverUpdated','discoverNoLikes','discoverNoMore'])assert.ok(copy[lang][key],`${lang}: ${key}`);
  }
  assert.equal(collectionItems(menu,'bad').length,menu.length);
});
