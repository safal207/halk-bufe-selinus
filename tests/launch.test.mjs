import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const folder=existsSync(new URL('../dist/launch.js',import.meta.url))?'../dist/':'../';
const source=readFileSync(new URL(folder+'launch.js',import.meta.url),'utf8');
function target(){const handlers=new Map();return{handlers,addEventListener(k,fn){handlers.set(k,fn)},removeEventListener(k,fn){if(handlers.get(k)===fn)handlers.delete(k)},emit(k,event={}){handlers.get(k)?.(event)}};}
function setup({cached=false,ready=false,reduced=false,query='?lang=ru',saved=null,blocked=false}={}){
  let now=0,next=0;const timers=new Map();
  const screen={removed:false,classList:{classes:new Set(),add(name){this.classes.add(name)}},remove(){this.removed=true}};
  const hero={...target(),complete:cached};
  const labels=Object.fromEntries(['launch-title','launch-status','launch-dish-name'].map(id=>[id,{textContent:''}]));
  const window={...target(),halkMenuReady:ready,matchMedia(){return{matches:reduced}}};
  const focus={id:'existing-focus'};
  const document={hidden:false,activeElement:focus,documentElement:{lang:'tr'},getElementById(id){return id==='launch-screen'?screen:id==='hero-photo'?hero:labels[id]}};
  const localStorage={getItem(){if(blocked)throw Error('denied');return saved}};
  runInNewContext(source,{window,document,localStorage,location:{search:query},URLSearchParams,setTimeout(fn,ms){const id=++next;timers.set(id,{at:now+ms,fn});return id},clearTimeout(id){timers.delete(id)}});
  return{screen,hero,window,document,focus,labels,timers,tick(ms){const end=now+ms;while(true){const entry=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!entry)break;const [id,timer]=entry;timers.delete(id);now=timer.at;timer.fn();}now=end;}};
}
test('brand exits as soon as menu and hero are ready, with no minimum wait or focus change',()=>{
  const s=setup();s.window.emit('halk:menu-ready');s.tick(200);assert.equal(s.screen.removed,false);
  s.hero.emit('load');assert.equal(s.screen.classList.classes.has('is-leaving'),true);
  s.tick(160);assert.equal(s.screen.removed,true);assert.equal(s.document.activeElement,s.focus);
  assert.equal(s.window.handlers.size,0);assert.equal(s.hero.handlers.size,0);assert.equal(s.timers.size,0);
});
test('a cached ready menu does not wait for an event that already happened',()=>{
  const s=setup({cached:true,ready:true});s.tick(160);assert.equal(s.screen.removed,true);
});
test('an image error releases the loader and reduced motion skips the fade',()=>{
  const s=setup({ready:true,reduced:true});s.hero.emit('error');assert.equal(s.screen.removed,true);assert.equal(s.timers.size,0);
});
test('a missing app-ready signal cannot leave the loading screen stuck',()=>{
  const s=setup();s.tick(2599);assert.equal(s.screen.removed,false);s.tick(1);assert.equal(s.screen.removed,true);assert.equal(s.timers.size,0);
});
test('back-forward restoration and page departure remove the screen immediately',()=>{
  const a=setup();a.window.emit('pageshow',{persisted:true});assert.equal(a.screen.removed,true);
  const b=setup();b.window.emit('pagehide');assert.equal(b.screen.removed,true);assert.equal(b.timers.size,0);
});
test('loading labels follow supported URL or saved language even when storage is blocked',()=>{
  const names={tr:'Tavuk şiş',ru:'Куриный шашлык',en:'Chicken skewers',de:'Hähnchenspieße'};
  for(const [lang,name]of Object.entries(names)){const s=setup({query:'?lang='+lang,blocked:true});assert.equal(s.screen.lang,lang);assert.equal(s.labels['launch-dish-name'].textContent,name);}
  assert.equal(setup({query:'?lang=bad',saved:'en'}).screen.lang,'en');
});
test('the inline watchdog removes the screen without loading the external controller',()=>{
  const html=readFileSync(new URL(folder+'index.html',import.meta.url),'utf8');
  const guard=html.match(/<script data-launch-watchdog>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(guard,'independent inline guard exists');
  let timer;const screen={removed:false,remove(){this.removed=true}};
  runInNewContext(guard,{window:{},document:{getElementById(){return screen}},setTimeout(fn,delay){assert.ok(delay<=2800);timer=fn;return 1}});
  timer();assert.equal(screen.removed,true);
});
