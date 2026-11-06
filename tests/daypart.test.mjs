import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const folder=existsSync(new URL('../dist/daypart.js',import.meta.url))?'../dist/':'../';
const {dayparts,daypartChoice,daypartFor,daypartPhoto,gazipasaHour,createDaypartClock}=await import(new URL(folder+'daypart.js',import.meta.url));
const {menu}=await import(new URL(folder+'menu.js',import.meta.url));
const {copy}=await import(new URL(folder+'copy.js',import.meta.url));

test('Gazipaşa boundaries select morning 05–11, day 11–17 and evening 17–05',()=>{
  const cases=[
    ['2026-11-06T01:59:59.999Z','evening'],['2026-11-06T02:00:00Z','morning'],
    ['2026-11-06T07:59:59.999Z','morning'],['2026-11-06T08:00:00Z','day'],
    ['2026-11-06T13:59:59.999Z','day'],['2026-11-06T14:00:00Z','evening'],
    ['2026-11-06T20:59:59.999Z','evening'],['2026-11-06T21:00:00Z','evening'],
  ];
  for(const [date,want]of cases)assert.equal(daypartFor(new Date(date)).id,want,date);
  assert.equal(gazipasaHour(new Date('2026-11-06T21:00:00Z')),0);
});

test('the venue clock depends on the instant and Istanbul time zone, with a safe invalid-date fallback',()=>{
  const a=new Date('2026-11-06T08:00:00Z'),b=new Date('2026-11-06T17:00:00+09:00');
  assert.equal(gazipasaHour(a),11);assert.equal(gazipasaHour(b),11);
  assert.equal(daypartFor(a),daypartFor(b));
  assert.equal(daypartFor(new Date(NaN)).id,'day');
});

test('preview choices are explicit and invalid URL values return to auto',()=>{
  const evening=new Date('2026-11-06T16:00:00Z');
  for(const key of Object.keys(dayparts))assert.equal(daypartFor(evening,key).id,key);
  for(const value of [null,'','night','__proto__','../morning']){
    assert.equal(daypartChoice(value),'auto');assert.equal(daypartFor(evening,value).id,'evening');
  }
  assert.equal(daypartPhoto({id:'../secret'}),'assets/daypart/day-1280.webp');
  assert.equal(daypartPhoto({id:'__proto__'}),'assets/daypart/day-1280.webp');
});

test('all three promotions point to priced dishes, real responsive assets and four-language copy',()=>{
  for(const period of Object.values(dayparts)){
    const meal=menu.find(item=>item.id===period.dishId);
    assert.ok(meal);assert.ok(Number.isFinite(meal.price));
    for(const width of [640,1280])assert.ok(existsSync(new URL(folder+daypartPhoto(period,width),import.meta.url)));
    for(const lang of ['tr','ru','en','de']){
      assert.ok(meal.name[lang]);
      for(const key of [period.title,period.light,period.id+'Choice','daypartLabel','daypartAuto','daypartPreview','singlePortion','morningDescription'])assert.ok(copy[lang][key],`${lang}: ${key}`);
    }
  }
  assert.equal(menu.find(item=>item.id===dayparts.morning.dishId).price,220);
  assert.equal(menu.find(item=>item.id===dayparts.day.dishId).price,290);
  assert.equal(menu.find(item=>item.id===dayparts.evening.dishId).price,320);
});

function clockAt(iso){
  let date=new Date(iso),id=0;const timers=new Map(),changes=[];
  const clock=createDaypartClock({onChange:p=>changes.push(p.id),now:()=>date,setTimer(fn,delay){const key=++id;timers.set(key,{fn,delay});return key;},clearTimer(key){timers.delete(key);}});
  return{clock,changes,timers,jump(iso){date=new Date(iso);},tick(){const [key,timer]=[...timers][0];timers.delete(key);date=new Date(date.getTime()+timer.delay);timer.fn();}};
}

test('the open page changes at the boundary and keeps one timer without re-rendering every minute',()=>{
  const s=clockAt('2026-11-06T07:59:59.500Z');
  assert.deepEqual(s.changes,['morning']);assert.equal([...s.timers.values()][0].delay,500);
  s.tick();assert.deepEqual(s.changes,['morning','day']);
  s.tick();assert.deepEqual(s.changes,['morning','day']);assert.equal(s.timers.size,1);
  s.clock.stop();assert.equal(s.timers.size,0);
});

test('tab restoration catches up immediately and manual preview returns to the current automatic scene',()=>{
  const s=clockAt('2026-11-06T06:00:00Z');
  s.jump('2026-11-06T16:10:00Z');s.clock.refresh();assert.equal(s.changes.at(-1),'evening');
  s.clock.select('morning');assert.equal(s.changes.at(-1),'morning');
  s.tick();assert.equal(s.changes.at(-1),'morning');
  s.clock.select('auto');assert.equal(s.changes.at(-1),'evening');assert.equal(s.timers.size,1);
  s.clock.stop();s.clock.refresh();assert.equal(s.timers.size,0);
});
