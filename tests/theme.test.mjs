import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const folder=existsSync(new URL('../dist/theme.js',import.meta.url))?'../dist/':'../';
const source=readFileSync(new URL(folder+'theme.js',import.meta.url),'utf8');
const key='halk-bufe-selinus:v1:theme';
function setup({saved=null,systemDark=false,query='',blocked=false}={}){
  const root={dataset:{},lang:'ru'},meta={},caption={},attrs=new Map(),events={},windowEvents={},values=new Map(saved?[[key,saved]]:[]);
  const media={matches:systemDark,addEventListener(_name,fn){this.change=fn;}};
  const location={href:'https://example.test/?lang=ru'+query};
  const button={dataset:{},hidden:true,setAttribute(k,v){attrs.set(k,v)},removeAttribute(k){attrs.delete(k)},querySelector(){return caption},addEventListener(k,v){events[k]=v}};
  const document={documentElement:root,querySelector(){return meta},getElementById(){return button},addEventListener(_name,fn){this.ready=fn}};
  const window={matchMedia(){return media},addEventListener(name,fn){windowEvents[name]=fn}};
  const localStorage={getItem(k){if(blocked)throw Error('blocked');return values.get(k)??null},setItem(k,v){if(blocked)throw Error('blocked');values.set(k,v)}};
  const history={replaceState(_s,_t,url){location.href=String(url)}};
  runInNewContext(source,{document,window,location,history,localStorage,URL,MutationObserver:class{observe(){}}});
  document.ready();
  return{root,meta,caption,attrs,button,values,location,click:()=>events.click(),system(value){media.matches=value;media.change()},storage(value){windowEvents.storage({key,newValue:value})}};
}
test('URL, saved choice and system preference have predictable priority',()=>{
  assert.equal(setup({systemDark:true}).root.dataset.theme,'dark');
  assert.equal(setup({saved:'light',systemDark:true}).root.dataset.theme,'light');
  assert.equal(setup({saved:'light',query:'&theme=dark'}).root.dataset.theme,'dark');
  assert.equal(setup({saved:'dark',query:'&theme=invalid'}).root.dataset.theme,'dark');
});
test('a manual toggle saves the choice, updates a theme URL and labels the next action',()=>{
  const state=setup({query:'&theme=light'});
  assert.equal(state.attrs.get('aria-label'),'Тёмная тема');
  state.click();
  assert.equal(state.root.dataset.theme,'dark');assert.equal(state.values.get(key),'dark');
  assert.equal(new URL(state.location.href).searchParams.get('theme'),'dark');
  assert.equal(state.attrs.get('aria-label'),'Светлая тема');assert.equal(state.meta.content,'#151e19');
  state.click();assert.equal(state.root.dataset.theme,'light');
});
test('system updates apply until a visitor chooses a theme',()=>{
  const state=setup();state.system(true);assert.equal(state.root.dataset.theme,'dark');
  state.click();assert.equal(state.root.dataset.theme,'light');
  state.system(true);assert.equal(state.root.dataset.theme,'light');
  const saved=setup({saved:'light'});saved.system(true);assert.equal(saved.root.dataset.theme,'light');
});
test('cross-tab updates follow stored choices but preserve an explicit URL theme',()=>{
  const state=setup({systemDark:true});state.storage('light');assert.equal(state.root.dataset.theme,'light');
  state.storage(null);assert.equal(state.root.dataset.theme,'dark');
  const explicit=setup({query:'&theme=light'});explicit.storage('dark');assert.equal(explicit.root.dataset.theme,'light');
});
test('blocked browser storage does not prevent changing the theme',()=>{
  const state=setup({blocked:true});state.click();assert.equal(state.root.dataset.theme,'dark');
  assert.equal(state.button.hidden,false);
});
