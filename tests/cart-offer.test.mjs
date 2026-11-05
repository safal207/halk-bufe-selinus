import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const folder=existsSync(new URL('../dist/menu.js',import.meta.url))?'../dist/':'../';
const {menu}=await import(new URL(folder+'menu.js',import.meta.url));
const {recommendFor,includedSides}=await import(new URL(folder+'cart-offer.js',import.meta.url));
const {copy}=await import(new URL(folder+'copy.js',import.meta.url));
const lines=(...ids)=>ids.map(id=>({item:menu.find(item=>item.id===id),qty:1}));

test('a burger gets one optional fries pairing with the full resulting total',()=>{
  const offer=recommendFor(lines('hamburger'),menu);
  assert.equal(offer.item.id,'patates');
  assert.equal(offer.reason,'offerFries');
  assert.equal(offer.combinedTotal,370);
  assert.equal(recommendFor(lines('hamburger','patates'),menu).item.id,'cay');
});

test('confirmed chicken and kids meals never get duplicate fries, including mixed baskets',()=>{
  const meals=['tavuk-sis','tavuk-izgara','kori-tavuk','citir-tavuk','tavuk-cocuk','kofte-cocuk'];
  for(const id of meals){
    assert.ok(includedSides(lines(id)[0].item),id);
    assert.equal(recommendFor(lines(id),menu).item.id,'cay',id);
    assert.equal(recommendFor(lines(id,'hamburger'),menu).item.id,'cay',id);
    assert.equal(recommendFor(lines(id,'cay'),menu),null,id);
  }
  assert.equal(includedSides(lines('kofte')[0].item),null);
});

test('drinks get a real dessert; an already complete food and drink basket gets no upsell',()=>{
  assert.equal(recommendFor(lines('cay'),menu).item.id,'revani');
  assert.equal(recommendFor(lines('cay'),menu).combinedTotal,135);
  assert.equal(recommendFor(lines('cay','nescafe'),menu).combinedTotal,185);
  for(const id of ['revani','kasarli-tost','tavuk-sis'])assert.equal(recommendFor(lines(id,'cay'),menu),null);
});

test('projected totals use all quantities and never add the optional pairing automatically',()=>{
  const basket=lines('tavuk-sis','kofte-cocuk');
  basket[0].qty=2;basket[1].qty=3;
  const original=JSON.stringify(basket);
  assert.equal(recommendFor(basket,menu).combinedTotal,1340);
  assert.equal(JSON.stringify(basket),original);
  basket[0].qty=99;
  assert.equal(recommendFor(basket,menu).combinedTotal,29470);
});

test('empty, unpriced or invalid baskets and unavailable pairings produce no offer',()=>{
  assert.equal(recommendFor([],menu),null);
  assert.equal(recommendFor(lines('kremali-makarna'),menu),null);
  for(const qty of [0,-1,1.5,100,NaN]){
    const basket=lines('tavuk-sis');basket[0].qty=qty;
    assert.equal(recommendFor(basket,menu),null);
  }
  assert.equal(recommendFor(lines('tavuk-sis'),menu.filter(item=>item.id!=='cay')),null);
  assert.equal(recommendFor(lines('cay'),menu.map(item=>item.id==='revani'?{...item,price:null}:item)),null);
});

test('all pairings, included-side notes and checkout labels exist in all four languages',()=>{
  for(const lang of ['tr','ru','en','de']){
    for(const key of ['cartTitle','cartReadyKicker','cartChickenSides','cartKidsSides','offerTea','offerFries','offerDessert','offerTotal','offerInTotal','cashier','checkoutNote'])assert.ok(copy[lang][key]?.length>3,`${lang}: ${key}`);
    for(const id of ['hamburger','tavuk-sis','cay'])assert.ok(recommendFor(lines(id),menu).item.name[lang]);
  }
});
