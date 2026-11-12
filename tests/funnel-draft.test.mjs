import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {basketSignature,randomReference,createDraftManager,draftStorageKey} from '../order-draft.js';
import {createFunnelEmitter,safeAttribution,allowedEvents} from '../funnel-events.js';
const root=existsSync(new URL('../dist/index.html',import.meta.url))?'../dist/':'../';
const read=name=>readFileSync(new URL(root+name,import.meta.url),'utf8');
const {menu}=await import(new URL(root+'menu.js',import.meta.url));
const {copy}=await import(new URL(root+'copy.js',import.meta.url));
const byId=new Map(menu.map(item=>[item.id,item]));
const lines=(...ids)=>ids.map(id=>({item:byId.get(id),qty:1}));
function fakeStorage() {
 const values=new Map();
 return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
}
function fakeCrypto() {
 let counter=0;
 return {getRandomValues:bytes=>{for(let i=0;i<bytes.length;i++)bytes[i]=(counter++*73+11)%256;return bytes;}};
}

test('the same basket and mode return a stable unpaid draft ID, not a receipt',()=>{
 const storage=fakeStorage(),cryptoSource=fakeCrypto();
 const manager=createDraftManager({storage,cryptoSource});
 const first=manager.prepare(lines('tavuk-sis','cay'),'here');
 assert.match(first.id,/^HB-[0-9A-F]{8}-[0-9A-F]{8}$/);
 assert.deepEqual(manager.prepare(lines('cay','tavuk-sis'),'here'),first);
 const another=createDraftManager({storage,cryptoSource});
 assert.deepEqual(another.prepare(lines('tavuk-sis','cay'),'here'),first);
 assert.ok(storage.getItem(draftStorageKey));
});

test('changing the items, quantity, mode or explicitly editing creates a new reference',()=>{
 const manager=createDraftManager({storage:fakeStorage(),cryptoSource:fakeCrypto()});
 const a=manager.prepare(lines('hamburger'),'here');
 const b=manager.prepare(lines('hamburger'),'takeaway');
 assert.notEqual(a.id,b.id);
 const bigger=lines('hamburger');bigger[0].qty=2;
 const c=manager.prepare(bigger,'takeaway');assert.notEqual(b.id,c.id);
 manager.invalidate();
 const d=manager.prepare(bigger,'takeaway');assert.notEqual(c.id,d.id);
 assert.equal(manager.prepare([], 'here'),null);
 assert.equal(manager.prepare([{item:byId.get('hamburger'),qty:100}], 'here'),null);
 assert.equal(manager.prepare([{item:byId.get('hamburger'),qty:1}], 'invalid'),null);
});

test('no weak random fallback and no hidden storage requirement',()=>{
 assert.equal(randomReference(null),null);
 assert.equal(createDraftManager({storage:null,cryptoSource:null}).prepare(lines('cay'),'here'),null);
 const inaccessible={getItem(){throw Error('disabled');},setItem(){throw Error('disabled');},removeItem(){throw Error('disabled');}};
 const m=createDraftManager({storage:inaccessible,cryptoSource:fakeCrypto()});
 const a=m.prepare(lines('cay'),'here');
 assert.equal(m.prepare(lines('cay'),'here').id,a.id);
});

test('UTM attribution only accepts explicit categories; arbitrary personal data never gets copied',()=>{
 assert.deepEqual(safeAttribution('https://cafe.example/?utm_source=instagram&utm_medium=social&utm_campaign=autumn'),
 {source:'instagram',medium:'social'});
 assert.deepEqual(safeAttribution('https://cafe.example/?utm_source=someone%40example.com&utm_medium=patient_123'),
 {source:'direct',medium:null});
 const events=[];
 const funnel=createFunnelEmitter({
   url:'https://cafe.example/?utm_source=qr&utm_medium=qr&utm_campaign=personal_email%40example.com',
   dispatch:data=>events.push(data)
 });
 assert.equal(funnel.emit('menu_view',{lang:'ru',view:'feed',customer:'Jane',email:'jane@example.com'}),true);
 assert.equal(funnel.emit('draft_ready',{order_reference:'HB-1234ABCD-ABCD5678',amount_try:350}),true);
 assert.equal(funnel.emit('purchase',{amount_try:350}),false);
 assert.equal(funnel.emit('payment_confirmed',{amount_try:350}),false);
 assert.deepEqual(Object.keys(events[0]).sort(),['event','lang','medium','source','view']);
 assert.equal(events[1].order_reference,'HB-1234ABCD-ABCD5678');
 assert.ok(!JSON.stringify(events).includes('jane@example.com'));
 assert.ok(!JSON.stringify(events).includes('personal_email'));
 assert.ok(!allowedEvents.includes('purchase'));
});

test('cashier UI has 4 truthful unpaid labels, QR/text reference and no false payment claim',()=>{
 for(const lang of ['tr','ru','en','de']){
   assert.ok(copy[lang].draftLabel);
   assert.ok(copy[lang].draftNotPaid);
   assert.ok(copy[lang].draftUnavailable);
 }
 const app=read('app.js'),html=read('index.html');
 assert.match(app,/drafts\.prepare\(getLines\(\),mode\)/);
 assert.match(app,/drafts\.invalidate\(\)/);
 assert.match(app,/Ödeme alınmadı \/ NOT PAID/);
 assert.match(app,/preparedDraft\.id/);
 assert.match(app,/funnel\.emit\('begin_checkout'/);
 assert.match(app,/funnel\.emit\('draft_ready'/);
 assert.match(html,/app\.js\?v=counter-funnel-20261112/);
 assert.match(html,/counter-draft\.css\?v=counter-funnel-20261112/);
});
