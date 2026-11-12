// Local-only, deterministic POS CSV analysis. No network or persistent storage.
// All currency math uses integer kuruş (1 TRY = 100 kuruş).
const idPattern=/^[a-z0-9-]{1,60}$/;
const statuses=new Set(['paid','refunded','void','pending']);
const maxRows=20000;

export function parseCSV(input) {
  if (typeof input!=='string' || input.length>1_500_000) throw Error('CSV file exceeds 1.5 MB limit');
  const source=input.replace(/^\uFEFF/,'');
  const firstLine=source.split(/\r?\n/,1)[0] || '';
  const delimiter=(firstLine.match(/;/g)||[]).length>(firstLine.match(/,/g)||[]).length?';':',';
  const rows=[]; let row=[],field='',quoted=false;
  for(let i=0;i<source.length;i++){
    const c=source[i];
    if(quoted) {
      if(c==='"' && source[i+1]==='"'){field+='"';i++;}
      else if(c==='"') quoted=false;
      else field+=c;
    } else if(c==='"'){
      if(field!=='') throw Error('Unexpected quote in CSV');
      quoted=true;
    } else if(c===delimiter){row.push(field.trim());field='';}
    else if(c==='\n'||c==='\r'){
      if(c==='\r'&&source[i+1]==='\n')i++;
      row.push(field.trim());field='';
      if(row.some(Boolean))rows.push(row);
      if(rows.length>maxRows+1)throw Error('Too many CSV rows');
      row=[];
    } else field+=c;
  }
  if(quoted)throw Error('Unterminated CSV quote');
  row.push(field.trim());if(row.some(Boolean))rows.push(row);
  if(!rows.length)throw Error('CSV is empty');
  const headers=rows.shift().map(x=>x.toLowerCase());
  if(headers.length!==new Set(headers).size)throw Error('Duplicate CSV column');
  const data=rows.map((cols,i)=>{
    if(cols.length!==headers.length)throw Error('Column count mismatch at row '+(i+2));
    return Object.fromEntries(headers.map((name,j)=>[name,cols[j]]));
  });
  return {headers,data};
}

function requireHeaders(parsed, columns) {
  for(const c of columns)if(!parsed.headers.includes(c))throw Error('Missing CSV column: '+c);
}
export function cents(value) {
  if(typeof value!=='string'||!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value))return null;
  const [whole,fraction='']=value.split('.');
  const n=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  return Number.isSafeInteger(n)?n:null;
}
function qty(value) {
  return /^[1-9]\d{0,3}$/.test(value)&&Number(value)<=999?Number(value):null;
}
export const formatTryCents=n=>(n/100).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';

export function analyzeMargin({menu,costCSV,receiptsCSV}) {
  if(!Array.isArray(menu)||!menu.length)throw Error('Menu required');
  const byId=new Map(menu.map(item=>[item.id,item]));
  const costs=parseCSV(costCSV),receipts=parseCSV(receiptsCSV);
  requireHeaders(costs,['item_id','ingredients_try','packaging_try','other_variable_try']);
  requireHeaders(receipts,['line_id','receipt_id','status','item_id','quantity','net_unit_revenue_try']);
  const problems=[],costMap=new Map(),usedIds=new Set(),groups=new Map();
  let ignored=0,invalid=0;

  for(const [idx,row] of costs.data.entries()){
    const id=row.item_id;
    if(!idPattern.test(id||'')||!byId.has(id)){problems.push('Costs row '+(idx+2)+': unknown item_id');continue;}
    if(costMap.has(id)){problems.push('Costs row '+(idx+2)+': duplicate item_id');costMap.delete(id);continue;}
    const values=['ingredients_try','packaging_try','other_variable_try'].map(key=>cents(row[key]));
    if(values.some(v=>v===null)){problems.push('Costs row '+(idx+2)+': invalid or missing nonnegative cost');continue;}
    costMap.set(id,values.reduce((a,b)=>a+b,0));
  }

  for(const [idx,row] of receipts.data.entries()){
    const {line_id,receipt_id,status,item_id}=row;
    const count=qty(row.quantity),unit=cents(row.net_unit_revenue_try);
    if(!line_id||line_id.length>90||!receipt_id||receipt_id.length>90||
       !statuses.has(status)||!byId.has(item_id)||count===null||unit===null||unit<=0){
      invalid++;problems.push('Receipts row '+(idx+2)+': invalid receipt line');continue;
    }
    if(usedIds.has(line_id)){
      invalid++;problems.push('Receipts row '+(idx+2)+': duplicate line_id');continue;
    }
    usedIds.add(line_id);
    if(status==='pending'||status==='void'){ignored++;continue;}
    const key=JSON.stringify([receipt_id,item_id]);
    const group=groups.get(key)||{receipt_id,item_id,paidQty:0,refundedQty:0,paidCents:0,refundCents:0};
    if(status==='paid'){
      group.paidQty+=count;group.paidCents+=unit*count;
    } else {
      group.refundedQty+=count;group.refundCents+=unit*count;
    }
    groups.set(key,group);
  }
  const perItem=new Map(),positiveReceipts=new Map();
  let revenueCents=0,contributionCents=0,coveredRevenueCents=0;
  let netUnits=0,refundedLines=0,missingCosts=new Set(),badRefundGroups=0;
  for(const g of groups.values()){
    if(g.refundedQty>g.paidQty||g.refundCents>g.paidCents){
      badRefundGroups++;
      problems.push('Receipt '+g.receipt_id+': refund exceeds paid quantity or net revenue for '+g.item_id);
      continue;
    }
    const amount=g.paidCents-g.refundCents,units=g.paidQty-g.refundedQty;
    revenueCents+=amount;netUnits+=units;
    refundedLines+=g.refundedQty>0?1:0;
    positiveReceipts.set(g.receipt_id,(positiveReceipts.get(g.receipt_id)||0)+amount);
    const item=perItem.get(g.item_id)||{item_id:g.item_id,units:0,revenueCents:0,contributionCents:0,costKnown:true};
    item.units+=units;item.revenueCents+=amount;
    if(!costMap.has(g.item_id)){
      item.costKnown=false;
      missingCosts.add(g.item_id);
    } else if(item.costKnown) {
      item.contributionCents+=amount-units*costMap.get(g.item_id);
    }
    perItem.set(g.item_id,item);
  }
  // Calculate contribution only on rows covered by complete cost data.
  for(const row of perItem.values()){
    if(row.costKnown){
      contributionCents+=row.contributionCents;
      coveredRevenueCents+=row.revenueCents;
    } else row.contributionCents=null;
  }
  if(missingCosts.size)problems.push('Missing verified costs for: '+[...missingCosts].join(', '));
  const paidReceipts=[...positiveReceipts.values()].filter(value=>value>0).length;
  const rows=[...perItem.values()].map(row=>({
    ...row,name:byId.get(row.item_id).name,
    marginPct:row.contributionCents===null||row.revenueCents<=0?null:row.contributionCents/row.revenueCents*100
  })).sort((a,b)=>(b.contributionCents??-Infinity)-(a.contributionCents??-Infinity));
  return {
    paidReceipts,netUnits,revenueCents,refundedLines,ignored,invalid,badRefundGroups,
    knownCostItems:costMap.size,missingCosts:[...missingCosts],problems,rows,
    coveredRevenueCents,
    contributionCents:missingCosts.size||invalid||badRefundGroups?null:contributionCents,
    marginPct:missingCosts.size||invalid||badRefundGroups||revenueCents<=0?null:contributionCents/revenueCents*100
  };
}
