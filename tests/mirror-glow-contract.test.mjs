import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const root=existsSync(new URL('../dist/index.html',import.meta.url))?'../dist/':'../';
const read=name=>readFileSync(new URL(root+name,import.meta.url),'utf8');

test('mirror LED stylesheet is linked after card styles and is not silently missing',()=>{
  const html=read('index.html'),glow=read('mirror-glow.css');
  assert.match(html,/href="mirror-glow\.css\?v=warm-mirror-20261110"/);
  assert.ok(html.indexOf('style.css')<html.indexOf('mirror-glow.css'),'LED stylesheet must override base card styles');
  assert.match(glow,/\.feature\s*\{[^}]*box-shadow\s*:/);
  assert.match(glow,/\.feature::after\s*\{[^}]*content:\s*""/);
  assert.match(glow,/\.feature::after\s*\{[^}]*pointer-events:\s*none/);
  assert.match(glow,/\.feature::after\s*\{[^}]*box-shadow\s*:/);
  assert.match(glow,/@media\s*\(forced-colors:\s*active\)/);
  assert.match(glow,/\.feature::after\s*\{\s*display:\s*none/);
  assert.match(glow,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
test('regression guard checks computed pseudo-element and actual CSS load in real engines',()=>{
  const browser=read('tests/browser.spec.mjs');
  assert.match(browser,/glowLinked:\s*!!linked/);
  assert.match(browser,/glowLoaded:\s*loaded/);
  assert.match(browser,/expect\(styles\.glowLoaded\)\.toBe\(true\)/);
  assert.match(browser,/expect\(styles\.ringContent\)/);
  assert.match(browser,/expect\(styles\.ring\)\.not\.toBe\(''\)/);
});
