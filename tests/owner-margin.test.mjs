import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCSV,cents,analyzeMargin,formatTryCents} from '../owner-margin.js';
import {readFileSync} from 'node:fs';
import {menu} from '../menu.js';

const costs=`item_id,ingredients_try,packaging_try,other_variable_try
hamburger,80.00,3.00,2.00
cay,2.00,0.00,1.00
`;
const receipts=`line_id,receipt_id,status,item_id,quantity,net_unit_revenue_try
L1,R1,paid,hamburger,2,250.00
L2,R1,paid,cay,1,10.00
L3,R1,refunded,hamburger,1,250.00
L4,R2,pending,cay,3,10.00
L5,R3,void,cay,1,10.00
`;

test('CSV handles UTF-8 BOM, semicolon separators, multiline quoting, rejects mismatched columns',()=>{
  const input='\uFEFFname;value\r\n"A; B";"C""D"\r\n';
  const parsed=parseCSV(input);
  assert.deepEqual(parsed.headers,['name','value']);
  assert.deepEqual(parsed.data,[{name:'A; B',value:'C"D'}]);
  assert.throws(()=>parseCSV('x,y\na\n'),/Column count/);
  assert.throws(()=>parseCSV('x,x\na,b\n'),/Duplicate CSV column/);
  assert.throws(()=>parseCSV('a,b\n"unterminated'),/Unterminated/);
  assert.throws(()=>parseCSV('a'.repeat(1_500_001)),/1.5 MB/);
});

test('integer kuruş rejects negative, exotic/ambiguous currency formats and overflow',()=>{
  assert.equal(cents('250.95'),25095);
  assert.equal(cents('0.09'),9);
  assert.equal(cents('-1.00'),null);
  assert.equal(cents('1,000.00'),null);
  assert.equal(cents('1.234'),null);
  assert.equal(cents('1000001.00'),null);
  assert.match(formatTryCents(25095),/₺/);
});

test('only paid POS lines count, refunds subtract, pending and void are excluded',()=>{
  const result=analyzeMargin({menu,costCSV:costs,receiptsCSV:receipts});
  assert.equal(result.paidReceipts,1);
  assert.equal(result.netUnits,2);
  assert.equal(result.revenueCents,26000);
  assert.equal(result.contributionCents,17200);
  assert.ok(Math.abs(result.marginPct-(17200/26000*100))<0.00001);
  assert.equal(result.refundedLines,1);
  assert.equal(result.ignored,2);
  assert.equal(result.invalid,0);
  assert.equal(result.problems.length,0);
  assert.equal(result.rows.find(x=>x.item_id==='hamburger').contributionCents,16500);
  assert.equal(result.rows.find(x=>x.item_id==='cay').contributionCents,700);
});

test('unknown costs hide contribution; never invent margins, even when known items exist',()=>{
  const result=analyzeMargin({menu,costCSV:'item_id,ingredients_try,packaging_try,other_variable_try\nhamburger,80.00,3.00,2.00\n',receiptsCSV:receipts});
  assert.equal(result.revenueCents,26000);
  assert.equal(result.contributionCents,null);
  assert.equal(result.marginPct,null);
  assert.deepEqual(result.missingCosts,['cay']);
  assert.equal(result.rows.find(x=>x.item_id==='cay').contributionCents,null);
  assert.equal(result.rows.find(x=>x.item_id==='hamburger').contributionCents,16500);
});

test('duplicate line IDs invalidate a period even when gross revenue remains observable',()=>{
  const duplicated=receipts+'L1,R4,paid,cay,1,10.00\n';
  const result=analyzeMargin({menu,costCSV:costs,receiptsCSV:duplicated});
  assert.equal(result.invalid,1);
  assert.equal(result.contributionCents,null);
  assert.equal(result.marginPct,null);
  assert.ok(result.problems.some(x=>x.includes('duplicate line_id')));
});

test('duplicate cost rows fail closed, including a third occurrence',()=>{
  const duplicate=costs+'hamburger,75.00,3.00,2.00\nhamburger,70.00,3.00,2.00\n';
  const report=analyzeMargin({menu,costCSV:duplicate,receiptsCSV:receipts});
  assert.equal(report.contributionCents,null);
  assert.ok(report.missingCosts.includes('hamburger'));
});

test('refunds never produce phantom paid orders or negative units',()=>{
  const refundOnly='line_id,receipt_id,status,item_id,quantity,net_unit_revenue_try\nR,R0,refunded,hamburger,2,250.00\n';
  const report=analyzeMargin({menu,costCSV:costs,receiptsCSV:refundOnly});
  assert.equal(report.paidReceipts,0);
  assert.equal(report.revenueCents,0);
  assert.equal(report.contributionCents,null);
  assert.equal(report.badRefundGroups,1);
  assert.equal(report.marginPct,null);
});

test('owner workbench has no network, persistence, made-up sales or public menu entry',()=>{
  const source=readFileSync(new URL('../owner/dashboard.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../owner/index.html',import.meta.url),'utf8');
  const menuHtml=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/connect-src 'none'/);
  assert.match(html,/not an authenticated owner portal|Bu bir giriş korumalı yönetici paneli değildir/);
  assert.match(html,/type="file" id="sales-file"/);
  assert.match(html,/type="file" id="cost-file"/);
  assert.doesNotMatch(source,/fetch\(|sendBeacon|localStorage|sessionStorage|XMLHttpRequest/);
  assert.doesNotMatch(menuHtml,/owner\/index\.html/);
});
