import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const root=existsSync(new URL('../dist/index.html',import.meta.url))?'../dist/':'../';
const read=file=>readFileSync(new URL(root+file,import.meta.url),'utf8');
const {copy}=await import('data:text/javascript;base64,'+Buffer.from(read('copy.js')).toString('base64'));

test('quick choice exists above the fold and beside menu; footer remains available',()=>{
 const html=read('index.html');
 const guideIndex=html.indexOf('id="hero-guide"');
 assert.ok(guideIndex>0 && guideIndex<html.indexOf('class="catalog"'), 'quick choice CTA should appear before the menu');
 assert.match(html,/id="hero-guide-title"/);
 assert.match(html,/id="hero-guide-note"/);
 assert.match(html,/id="menu-guide"/);
 assert.match(html,/id="guide-link"/);
 assert.match(html,/href="quick-guide.css\?v=footer-aligned-20261110"/);
});

test('all four languages tell the visitor about the genuine 3-step selection',()=>{
 const app=read('app.js');
 for(const language of ['tr','ru','en','de']){
   assert.ok(copy[language].guide,language+' missing guide title');
   assert.ok(copy[language].guideQuick,language+' missing quick-choice explanation');
   assert.match(copy[language].guideQuick,/3/);
 }
 assert.match(app,/\$\('hero-guide'\)\.href = `guide\.html\?lang=\$\{lang\}`/);
 assert.match(app,/\$\('menu-guide'\)\.href = `guide\.html\?lang=\$\{lang\}`/);
 assert.match(app,/\$\('guide-link'\)\.href = `guide\.html\?lang=\$\{lang\}`/);
});

test('directional arrows are prominent and accessible without looping animations',()=>{
 const style=read('quick-guide.css');
 assert.match(style,/\.hero-guide\s*\{[^}]*min-height:\s*68px/);
 assert.match(style,/\.hero-guide-arrow\s*\{[^}]*width:\s*46px/);
 assert.match(style,/\.menu-quick-guide\s*\{[^}]*min-height:\s*46px/);
 assert.match(style,/@media \(max-width:620px\)/);
 assert.match(style,/@media \(prefers-reduced-motion: reduce\)/);
 assert.match(style,/@media \(forced-colors: active\)/);
 assert.doesNotMatch(style,/@keyframes|animation:\s*infinite/);
});
