import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const root=existsSync(new URL('../dist/index.html',import.meta.url))?'../dist/':'../';
const read=path=>readFileSync(new URL(root+path,import.meta.url),'utf8');

test('footer action pair uses unified links, never a disconnected arrow',()=>{
 const html=read('index.html'),app=read('app.js');
 assert.match(html,/class="footer-links"/);
 assert.match(html,/class="guide-link footer-action footer-action-primary" id="guide-link"/);
 assert.match(html,/id="location" class="footer-action footer-action-map"/);
 assert.match(app,/class="footer-action-label"/);
 assert.match(app,/class="guide-footer-arrow" aria-hidden="true"/);
 assert.match(app,/class="footer-map-icon" aria-hidden="true"/);
 assert.match(app,/\$\('guide-link'\)\.href = `guide\.html\?lang=\$\{lang\}`/);
 assert.match(html,/id="location"[^>]+target="_blank" rel="noopener noreferrer"/);
});

test('footer CTAs have aligned heights, balanced mobile columns, readable dark and forced-color alternatives',()=>{
 const css=read('quick-guide.css'),html=read('index.html');
 assert.match(css,/\.footer-links\s*\{[^}]*display:\s*grid;/);
 assert.match(css,/\.footer-links\s*\.footer-action\s*\{[^}]*display:\s*flex;/);
 assert.match(css,/\.footer-links\s*\.footer-action\s*\{[^}]*min-height:\s*52px;/);
 assert.match(css,/\.footer-links\s*\.footer-action\s*\{[^}]*text-decoration:\s*none;/);
 assert.match(css,/@media\s*\(max-width:\s*620px\)\s*\{\s*\.footer-links\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
 assert.match(css,/:root\[data-theme="dark"\]\s*\.footer-links\s*\.footer-action-primary/);
 assert.match(css,/@media\s*\(forced-colors:\s*active\)/);
 assert.match(html,/quick-guide\.css\?v=footer-aligned-20261110/);
});
