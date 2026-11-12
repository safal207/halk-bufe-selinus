import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const root = existsSync(new URL('../dist/app.js',import.meta.url))?'../dist/':'../';
const read = name => readFileSync(new URL(root+name,import.meta.url),'utf8');
const app = read('app.js'), css = read('style.css'), html = read('index.html');

test('the page itself never snaps; the feed uses one full-height card and snap stop',()=>{
 assert.doesNotMatch(css,/html\.feed-mode\s*\{\s*scroll-snap-type:/);
 assert.match(css,/\.menu-feed\s*\{[^}]*overflow-y:\s*auto/);
 assert.match(css,/\.menu-feed\s*\{[^}]*scroll-snap-type:\s*y mandatory/);
 assert.match(css,/\.menu-feed\s*>\s*\.feature\s*\{[^}]*scroll-snap-stop:\s*always/);
 assert.match(css,/\.menu-feed\s*>\s*\.feature\s*\{[^}]*flex:\s*0 0 100%/);
 assert.match(css,/100svh - var\(--menu-stack/);
 assert.match(css,/\.menu-feed \.feature-media,[^}]*flex:\s*1 1 0px/);
 assert.match(css,/object-fit:\s*contain/);
});
test('accessible feed navigation is scoped and asset URLs refreshed',()=>{
 assert.match(app,/function configureFeedNavigation\(\)/);
 assert.match(app,/if \(inFeed\) configureFeedNavigation\(\)/);
 assert.match(app,/scrollTo\(\{top: next\*stepSize\(\)/);
 assert.match(app,/blockedUntil = now \+ 850/);
 assert.match(app,/feed\.addEventListener\('wheel'/);
 assert.match(app,/feed\.addEventListener\('keydown'/);
 assert.match(app,/scrollTo\(\{top:/);
 assert.match(css,/scroll-snap-stop/);
 assert.match(app,/tabindex="0" role="region"/);
 assert.match(html,/app\.js\?v=counter-funnel-20261112/);
 assert.match(html,/style\.css\?v=inside-reveal-20261110/);
});
test('a wheel gesture steps once despite repeated wheel events, keyboard can step back',()=>{
 const start = app.indexOf('function configureFeedNavigation()');
 const end = app.indexOf('function renderLanguage()',start);
 assert.ok(start>=0 && end>start);
 const handlers={}, moves=[], progress={textContent:''};
 const cards=Array.from({length:4},()=>({getBoundingClientRect:()=>({height:600})}));
 const feed={clientHeight:600,scrollHeight:2430,scrollTop:0,
  querySelectorAll:()=>cards,
  addEventListener:(name,fn)=>handlers[name]=fn,
  scrollTo({top}){this.scrollTop=top; moves.push(top);}
 };
 const results={querySelector:selector=>selector==='.menu-feed'?feed:progress};
 const get = id=> id==='results'?results:null;
 const configure = new Function('$','window','getComputedStyle',
   app.slice(start,end)+'return configureFeedNavigation;')(
     get,{matchMedia:()=>({matches:true})},()=>({rowGap:'10px'}));
 configure();
 let prevented=0;
 const wheel = dy=>handlers.wheel({deltaY:dy,deltaMode:0,ctrlKey:false,preventDefault:()=>prevented++});
 wheel(120); wheel(120);
 assert.deepEqual(moves,[610]); // one card despite repeated impulses
 assert.equal(progress.textContent,'2 / 4');
 assert.equal(prevented,2);
 let keyPrevented=0;
 handlers.keydown({key:'ArrowUp',altKey:false,ctrlKey:false,metaKey:false,preventDefault:()=>keyPrevented++});
 assert.equal(moves.at(-1),0);
 assert.equal(keyPrevented,1);
 wheel(-90); // at first card, parent page may scroll back up
 assert.equal(prevented,2);
});
