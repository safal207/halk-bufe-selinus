import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=existsSync(new URL('../dist/social.js',import.meta.url))?'../dist/':'../';
const source=readFileSync(new URL(root+'social.js',import.meta.url),'utf8');
const {createSocialStore,socialKey}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const ids=['tavuk-cocuk','kofte-cocuk'];
function storage(){const map=new Map();return{getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)}}
test('starts without fabricated engagement and preserves reversible likes',()=>{
 const local=storage(),session=storage();
 const first=createSocialStore(ids,{local,session});
 assert.equal(first.likedCount(),0);assert.equal(first.views(ids[0]),0);
 assert.deepEqual(first.toggleLike(ids[0]),{liked:true,saved:true});
 const restored=createSocialStore(ids,{local,session});
 assert.equal(restored.liked(ids[0]),true);
 assert.deepEqual(restored.toggleLike(ids[0]),{liked:false,saved:true});
 assert.equal(createSocialStore(ids,{local,session}).likedCount(),0);
});
test('counts a dish once per tab session, including after reload',()=>{
 const local=storage(),session=storage();
 const first=createSocialStore(ids,{local,session});
 assert.equal(first.recordView(ids[0]),true);assert.equal(first.recordView(ids[0]),false);
 const restored=createSocialStore(ids,{local,session});
 assert.equal(restored.recordView(ids[0]),false);assert.equal(restored.views(ids[0]),1);
 const next=createSocialStore(ids,{local,session:storage()});
 assert.equal(next.recordView(ids[0]),true);assert.equal(next.views(ids[0]),2);
});
test('rejects unknown dishes, corrupt JSON and invalid values',()=>{
 const local=storage();
 local.setItem(socialKey,JSON.stringify({likes:{'tavuk-cocuk':true,other:true,'kofte-cocuk':'true'},views:{'tavuk-cocuk':-1,'kofte-cocuk':1.5}}));
 const state=createSocialStore(ids,{local,session:storage()});
 assert.equal(state.likedCount(),1);assert.equal(state.views(ids[0]),0);
 assert.equal(state.views(ids[1]),0);assert.equal(state.toggleLike('other'),null);
 assert.equal(state.recordView('other'),false);
 local.setItem(socialKey,'{invalid');
 assert.equal(createSocialStore(ids,{local,session:storage()}).likedCount(),0);
});
test('blocked storage falls back to memory without losing current actions',()=>{
 const blocked={getItem(){throw new Error('denied')},setItem(){throw new Error('denied')}};
 const state=createSocialStore(ids,{local:blocked,session:blocked});
 assert.deepEqual(state.toggleLike(ids[0]),{liked:true,saved:false});
 assert.equal(state.liked(ids[0]),true);
 assert.equal(state.recordView(ids[0]),true);assert.equal(state.recordView(ids[0]),false);
 assert.equal(state.views(ids[0]),1);
});
test('two tabs preserve each others likes',()=>{
 const local=storage(),a=createSocialStore(ids,{local,session:storage()}),b=createSocialStore(ids,{local,session:storage()});
 a.toggleLike(ids[0]);b.toggleLike(ids[1]);a.refresh();
 assert.equal(a.likedCount(),2);
});

test('bookmarks stay separate from likes and survive a new tab',()=>{
 const local=storage(), session=storage();
 const first=createSocialStore(ids,{local,session});
 assert.equal(first.bookmarkedCount(),0);
 assert.equal(first.bookmarked(ids[0]),false);
 assert.deepEqual(first.toggleBookmark(ids[0]),{bookmarked:true,persisted:true});
 assert.equal(first.liked(ids[0]),false);
 const second=createSocialStore(ids,{local,session:storage()});
 assert.equal(second.bookmarked(ids[0]),true);
 assert.equal(second.bookmarkedCount(),1);
 assert.deepEqual(second.toggleBookmark(ids[0]),{bookmarked:false,persisted:true});
 assert.equal(createSocialStore(ids,{local,session:storage()}).bookmarkedCount(),0);
});
test('bookmarks reject invalid data and unknown dishes',()=>{
 const local=storage();
 local.setItem(socialKey,JSON.stringify({bookmarks:{'tavuk-cocuk':true,'kofte-cocuk':1,other:true}}));
 const store=createSocialStore(ids,{local,session:storage()});
 assert.equal(store.bookmarkedCount(),1);
 assert.equal(store.bookmarked(ids[1]),false);
 assert.equal(store.toggleBookmark('other'),null);
});
test('bookmarks are retained in memory if storage is blocked',()=>{
 const blocked={getItem(){throw new Error('denied')},setItem(){throw new Error('denied')}};
 const store=createSocialStore(ids,{local:blocked,session:blocked});
 assert.deepEqual(store.toggleBookmark(ids[0]),{bookmarked:true,persisted:false});
 assert.equal(store.bookmarked(ids[0]),true);
});
