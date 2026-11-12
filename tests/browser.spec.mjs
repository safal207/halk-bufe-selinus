import {test,expect} from '@playwright/test';

const url = '/?lang=ru&view=feed&theme=light&time=day';
const layoutCases = [
  {width:320,height:568},
  {width:360,height:640},
  {width:390,height:844},
  {width:414,height:896},
  {width:768,height:1024},
  {width:1440,height:900}
];
async function openMenu(page,query=url) {
  await page.goto(query,{waitUntil:'domcontentloaded'});
  await expect(page.locator('.menu-feed > .feature').first()).toBeVisible();
  await expect(page.locator('#launch-screen')).toHaveCount(0,{timeout:10000});
}

test('responsive: no horizontal clipping, one large centered card at six viewport sizes',async({page})=>{
  await openMenu(page);
  for(const size of layoutCases){
    await page.setViewportSize(size);
    const metrics=await page.evaluate(()=>{
      const feed=document.querySelector('.menu-feed');
      const card=feed?.querySelector(':scope > .feature');
      const box=feed?.getBoundingClientRect();
      const first=card?.getBoundingClientRect();
      return {
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        feedX:box?.x,feedRight:box?.right,feedHeight:box?.height,
        cardHeight:first?.height,
        cardWidth:first?.width,screenWidth:window.innerWidth,
        imageHeight:card?.querySelector('.feature-media')?.getBoundingClientRect().height
      };
    });
    expect(metrics.overflow,`document overflow ${JSON.stringify(size)}`).toBeLessThanOrEqual(3);
    expect(metrics.feedX,`feed X ${JSON.stringify(size)}`).toBeGreaterThanOrEqual(-2);
    expect(metrics.feedRight,`feed right ${JSON.stringify(size)}`).toBeLessThanOrEqual(size.width+2);
    expect(Math.abs(metrics.feedHeight-metrics.cardHeight),`full feed card ${JSON.stringify(size)}`).toBeLessThanOrEqual(3);
    expect(metrics.imageHeight,`photo visible ${JSON.stringify(size)}`).toBeGreaterThanOrEqual(160);
  }
});

test('premium mirror glow is warm, static, readable and does not obscure the social rail',async({page})=>{
  await openMenu(page);
  const card=page.locator('.menu-feed > .feature').first();
  const styles=await card.evaluate(el=>{
    const css=getComputedStyle(el),ring=getComputedStyle(el,'::after');
    const rail=getComputedStyle(el.querySelector('.social-rail'));
    const linked=[...document.querySelectorAll('link[rel="stylesheet"]')]
      .find(link=>link.href.includes('/mirror-glow.css'));
    const loaded=!!linked && [...document.styleSheets].some(sheet=>sheet.href===linked.href);
    const ambient=getComputedStyle(document.documentElement).getPropertyValue('--mirror-ambient').trim();
    return {shadow:css.boxShadow,ring:ring.boxShadow,ringContent:ring.content,
      pointer:ring.pointerEvents,rail:rail.backgroundColor,animation:css.animationName,
      glowLinked:!!linked,glowLoaded:loaded,ambient};
  });
  // A generic card shadow is insufficient: the separate LED stylesheet and its
  // actual painted pseudo-element must exist on the page in every browser.
  expect(styles.glowLinked).toBe(true);
  expect(styles.glowLoaded).toBe(true);
  expect(styles.ambient).toMatch(/rgba?\(/);
  expect(styles.shadow).not.toBe('none');
  expect(styles.ring).not.toBe('');
  expect(styles.ring).not.toBe('none');
  expect(styles.ring).toMatch(/rgb/);
  expect(styles.ringContent).toMatch(/^["']{2}$/);
  expect(styles.pointer).toBe('none');
  expect(styles.rail).toMatch(/transparent|rgba\(0,\s*0,\s*0,\s*0\)/);
  expect(styles.animation).toBe('none');
  const buttons=await card.locator('.social-rail button').evaluateAll(nodes=>nodes.map(node=>{
    const b=node.getBoundingClientRect();return {height:b.height,width:b.width};
  }));
  expect(buttons.length).toBeGreaterThanOrEqual(3);
  for(const size of buttons){
    expect(size.height).toBeGreaterThanOrEqual(43.5);
    expect(size.width).toBeGreaterThanOrEqual(43.5);
  }
  await page.goto('/?lang=ru&view=feed&theme=dark&time=day',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.menu-feed > .feature').first()).toBeVisible();
  expect(await page.locator('.menu-feed > .feature').first().evaluate(el=>getComputedStyle(el).boxShadow)).not.toBe('none');
});

test('ingredient mirror reveal: usable slider, explicit provenance and bounded mobile dialog',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await openMenu(page);
  await page.locator('.menu-feed > .feature').first().locator('.inside-trigger').click();
  const modal=page.locator('#inside-dialog');
  await expect(modal).toBeVisible();
  await expect(page.locator('#inside-note')).toContainText(/уточняйте|не подтверждён|схем/i);
  const slider=page.locator('#inside-slider');
  await expect(slider).toHaveAttribute('type','range');
  await slider.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  const split=await page.locator('#inside-stage').evaluate(el=>el.style.getPropertyValue('--inside-split'));
  expect(Number.parseFloat(split)).toBeGreaterThanOrEqual(13);
  const bounds=await modal.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds.x).toBeGreaterThanOrEqual(-2);
  expect(bounds.x+bounds.width).toBeLessThanOrEqual(322);
  expect(bounds.y).toBeGreaterThanOrEqual(-2);
  expect(bounds.y+bounds.height).toBeLessThanOrEqual(570);
  await page.locator('#inside-full').click();
  await expect(page.locator('#inside-dialog')).not.toBeVisible();
  await expect(page.locator('#item-dialog')).toBeVisible();
  await expect(page.locator('#item-body .nutrition-panel[open]')).toHaveCount(1);
});

test('social reactions, localized rich sharing and one-wheel-one-card behavior',async({page})=>{
  await openMenu(page);
  const card=page.locator('.menu-feed > .feature').first();
  const like=card.locator('[data-like]').first();
  await like.click();
  await expect(like).toHaveAttribute('aria-pressed','true');
  await card.locator('[data-share]').click();
  await expect(page.locator('#share-dialog')).toBeVisible();
  await expect(page.locator('#share-ingredients')).not.toBeEmpty();
  await expect(page.locator('#share-disclaimer')).not.toBeEmpty();
  await page.locator('#share-close').click();
  await expect(page.locator('#share-dialog')).not.toBeVisible();
  const feed=page.locator('.menu-feed');
  await feed.scrollIntoViewIfNeeded();
  const box=await feed.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x+box.width/2,box.y+Math.min(box.height/2,300));
  await page.mouse.wheel(0,180);
  await expect(page.locator('[data-feed-progress]')).toContainText('2 / 44');
  await page.mouse.wheel(0,180);
  await expect(page.locator('[data-feed-progress]')).toContainText('2 / 44');
});

test('non-functional: quick interactive startup, no JS exceptions, reduced-motion, zero decorative pointer interception',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
    window.__qaCls=0;
    window.__qaShiftLog=[];
    try {
      new PerformanceObserver(list=>{
        for(const entry of list.getEntries())if(!entry.hadRecentInput){
          window.__qaCls+=entry.value;
          window.__qaShiftLog.push({
            value:entry.value,
            time:Math.round(entry.startTime),
            sources:(entry.sources||[]).map(s=>({
              node:s.node?.tagName||'',
              id:s.node?.id||'',
              className:typeof s.node?.className==='string'?s.node.className.slice(0,90):'',
              before:s.previousRect?.toJSON?.()||null,
              after:s.currentRect?.toJSON?.()||null
            }))
          });
        }
      }).observe({type:'layout-shift',buffered:true});
    }catch{/* LayoutShift not implemented in every engine */}
  });
  const start=Date.now();
  await openMenu(page);
  const load=Date.now()-start;
  expect(load,'local first-interaction budget').toBeLessThan(12000);
  expect(errors,'runtime JavaScript errors').toEqual([]);
  const cls=await page.evaluate(()=>window.__qaCls);
  console.log('CLS TRACE',JSON.stringify(await page.evaluate(()=>window.__qaShiftLog)));

  expect(cls,'layout stability after menu rendered').toBeLessThanOrEqual(.25);
  await page.emulateMedia({reducedMotion:'reduce'});
  const animations=await page.locator('.menu-feed > .feature').first().evaluate(el=>({
    animation:getComputedStyle(el).animationName,
    transition:getComputedStyle(el).transitionDuration
  }));
  expect(animations.animation).toBe('none');
  expect(animations.transition).toBe('0s');
  console.log('NFR',JSON.stringify({browser:process.env.E2E_BROWSER,loadMs:load,cls}));
});

test('Microsoft/Chromium high-contrast mode keeps borders visible and removes decorative glow',async({page})=>{
  test.skip(!['chromium','msedge'].includes(process.env.E2E_BROWSER || 'chromium'),'Forced-colors smoke is scoped to Chromium/Edge');
  await page.emulateMedia({forcedColors:'active'});
  await openMenu(page);
  const result=await page.locator('.menu-feed > .feature').first().evaluate(el=>({
    shadow:getComputedStyle(el).boxShadow,
    border:getComputedStyle(el).borderTopWidth,
    deco:getComputedStyle(el,'::after').display
  }));
  expect(result.shadow).toBe('none');
  expect(Number.parseFloat(result.border)).toBeGreaterThanOrEqual(2);
  expect(result.deco).toBe('none');
});


test('quick guide: compelling arrow is clickable at 320px and opens the real 3-step chooser',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await openMenu(page);
  const cta=page.locator('#hero-guide');
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute('href','guide.html?lang=ru');
  await expect(page.locator('#hero-guide-note')).toHaveText(/3 шага/);
  const data=await cta.evaluate(el=>{
    const b=el.getBoundingClientRect(),arrow=el.querySelector('.hero-guide-arrow');
    const a=arrow.getBoundingClientRect(),style=getComputedStyle(arrow);
    return {width:b.width,height:b.height,right:b.right,left:b.left,arrowWidth:a.width,
      arrowFill:style.backgroundImage};
  });
  expect(data.height).toBeGreaterThanOrEqual(44);
  expect(data.left).toBeGreaterThanOrEqual(-2);
  expect(data.right).toBeLessThanOrEqual(322);
  expect(data.arrowWidth).toBeGreaterThanOrEqual(44);
  expect(data.arrowFill).toContain('gradient');
  await expect(page.locator('#menu-guide')).toHaveAttribute('href','guide.html?lang=ru');
  await cta.click();
  await expect(page).toHaveURL(/guide\.html\?lang=ru/);
  await expect(page.locator('#quest-content [data-route]')).toHaveCount(3);
  await page.locator('#quest-content [data-route="quick"]').click();
  await page.locator('[data-move="1"]').click();
  await expect(page.locator('#quest-content [data-dish]')).toHaveCount(3);
});

test('footer actions: unified guide and map align in dark mobile TR and every language',async({page})=>{
  const layouts=[
    {width:320,height:568,lang:'tr',theme:'dark'},
    {width:360,height:640,lang:'tr',theme:'dark'},
    {width:390,height:844,lang:'ru',theme:'light'},
    {width:414,height:896,lang:'de',theme:'dark'},
  ];
  for(const entry of layouts){
    await page.setViewportSize({width:entry.width,height:entry.height});
    await openMenu(page,`/?lang=${entry.lang}&view=feed&theme=${entry.theme}`);
    await page.locator('[data-category="bookmarked"]').click();
    const footer=page.locator('.footer-links');
    await footer.scrollIntoViewIfNeeded();
    const metrics=await footer.evaluate(parent=>{
      const guide=parent.querySelector('#guide-link');
      const map=parent.querySelector('#location');
      const a=guide.getBoundingClientRect(),b=map.getBoundingClientRect(),c=parent.getBoundingClientRect();
      const guideStyle=getComputedStyle(guide),mapStyle=getComputedStyle(map);
      return {
        a:{top:a.top,right:a.right,left:a.left,height:a.height,width:a.width},
        b:{top:b.top,right:b.right,left:b.left,height:b.height,width:b.width},
        c:{left:c.left,right:c.right},
        pageWidth:document.documentElement.clientWidth,
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        linkTextDecoration:guideStyle.textDecorationLine,
        guideDisplay:guideStyle.display,
        mapDisplay:mapStyle.display,
        guideParts:guide.querySelectorAll('.footer-action-label,.guide-footer-arrow').length,
        mapParts:map.querySelectorAll('.footer-action-label,.footer-map-icon').length
      };
    });
    expect(metrics.overflow,`horizontal overflow ${JSON.stringify(entry)}`).toBeLessThanOrEqual(3);
    expect(Math.abs(metrics.a.top-metrics.b.top),`top aligned ${JSON.stringify(entry)}`).toBeLessThanOrEqual(1);
    expect(Math.abs(metrics.a.height-metrics.b.height),`equal heights ${JSON.stringify(entry)}`).toBeLessThanOrEqual(1);
    expect(metrics.a.height,`tap height ${JSON.stringify(entry)}`).toBeGreaterThanOrEqual(44);
    expect(metrics.a.left,`CTA left ${JSON.stringify(entry)}`).toBeGreaterThanOrEqual(-2);
    expect(metrics.b.right,`map right ${JSON.stringify(entry)}`).toBeLessThanOrEqual(entry.width+2);
    expect(metrics.a.right).toBeLessThan(metrics.b.left);
    expect(metrics.linkTextDecoration).toBe('none');
    expect(metrics.guideDisplay).toBe('flex');
    expect(metrics.mapDisplay).toBe('flex');
    expect(metrics.guideParts).toBe(2);
    expect(metrics.mapParts).toBe(2);
    await expect(page.locator('#guide-link')).toHaveAttribute('href',`guide.html?lang=${entry.lang}`);
    await expect(page.locator('#location')).toHaveAttribute('target','_blank');
  }
  await page.goto('/?lang=tr&view=feed&theme=dark',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.menu-feed > .feature').first()).toBeVisible();
  await page.locator('#guide-link').click();
  await expect(page).toHaveURL(/guide\.html\?lang=tr/);
  await expect(page.locator('#quest-content [data-route]')).toHaveCount(3);
});


test('counter handoff: draft code is not a payment, persists until edited and changes with service mode',async({page})=>{
  await page.setViewportSize({width:360,height:640});
  await page.addInitScript(()=>{
    window.__funnelEvents=[];
    window.addEventListener('halk:funnel',event=>window.__funnelEvents.push(event.detail));
  });
  await openMenu(page,'/?lang=ru&view=feed&utm_source=qr&utm_medium=qr');
  await page.locator('.hero-order').click();
  await page.locator('#header-cart').click();
  await page.locator('.cart-checkout').click();
  const reference=page.locator('.draft-reference strong');
  await expect(reference).toHaveText(/^HB-[0-9A-F]{8}-[0-9A-F]{8}$/);
  await expect(page.locator('.draft-reference small')).toContainText('Не оплачено');
  const original=await reference.textContent();
  await page.locator('[data-action="edit"]').click();
  await page.locator('.cart-checkout').click();
  await expect(reference).toHaveText(original);
  await page.locator('[data-action="edit"]').click();
  await page.locator('input[name="mode"][value="takeaway"]').check();
  await page.locator('.cart-checkout').click();
  const revised=await reference.textContent();
  expect(revised).not.toBe(original);
  const events=await page.evaluate(()=>window.__funnelEvents);
  expect(events.some(event=>event.event==='menu_view'&&event.source==='qr')).toBe(true);
  expect(events.some(event=>event.event==='add_to_cart')).toBe(true);
  expect(events.some(event=>event.event==='begin_checkout')).toBe(true);
  expect(events.some(event=>event.event==='draft_ready'&&event.order_reference===revised)).toBe(true);
  expect(events.some(event=>event.event==='purchase'||event.event==='payment_confirmed')).toBe(false);
});

test('local owner workbench: valid POS upload calculates contribution without network or fake checkout',async({page})=>{
  await page.setViewportSize({width:360,height:640});
  await page.goto('/owner/?lang=ru',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#title')).toHaveText('Продажи и маржинальный доход');
  await expect(page.locator('#kpi-revenue')).toHaveText('—');
  await expect(page.locator('#privacy-title')).toContainText('не защищённый');
  const outbound=[];
  page.on('request',request=>{
    if(!request.url().startsWith('http://127.0.0.1:4173/'))outbound.push(request.url());
  });
  const costs='item_id,ingredients_try,packaging_try,other_variable_try\\nhamburger,80.00,3.00,2.00\\ncay,2.00,0.00,1.00\\n';
  const receipts='line_id,receipt_id,status,item_id,quantity,net_unit_revenue_try\\nL1,R1,paid,hamburger,2,250.00\\nL2,R1,paid,cay,1,10.00\\nL3,R1,refunded,hamburger,1,250.00\\nL4,R2,pending,cay,3,10.00\\n';
  await page.locator('#cost-file').setInputFiles({name:'private-cost.csv',mimeType:'text/csv',buffer:Buffer.from(costs)});
  await page.locator('#sales-file').setInputFiles({name:'private-receipts.csv',mimeType:'text/csv',buffer:Buffer.from(receipts)});
  await expect(page.locator('#kpi-orders')).toHaveText('1');
  await expect(page.locator('#kpi-revenue')).toContainText('260,00');
  await expect(page.locator('#kpi-contribution')).toContainText('172,00');
  await expect(page.locator('#sku-rows tr')).toHaveCount(2);
  expect(outbound).toEqual([]);
  for(const width of [320,360,390,768,1440]){
    await page.setViewportSize({width,height:720});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,'owner overflow at '+width).toBeLessThanOrEqual(2);
  }
  await page.locator('#language').selectOption('tr');
  await expect(page.locator('#title')).toHaveText('Satış ve katkı payı');
  await expect(page.locator('#kpi-contribution')).toContainText('172,00');
  await page.locator('#reset-data').click();
  await expect(page.locator('#kpi-orders')).toHaveText('—');
  await expect(page.locator('#sku-rows tr')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#kpi-revenue')).toHaveText('—');
});

test('owner profit guard: unknown item costs suppress overall profit and show warning',async({page})=>{
  await page.goto('/owner/?lang=en',{waitUntil:'domcontentloaded'});
  await page.locator('#cost-file').setInputFiles({name:'partial.csv',mimeType:'text/csv',buffer:Buffer.from(
    'item_id,ingredients_try,packaging_try,other_variable_try\\nhamburger,80.00,3.00,2.00\\n'
  )});
  await page.locator('#sales-file').setInputFiles({name:'paid.csv',mimeType:'text/csv',buffer:Buffer.from(
    'line_id,receipt_id,status,item_id,quantity,net_unit_revenue_try\\nL1,R1,paid,hamburger,1,250.00\\nL2,R1,paid,cay,1,10.00\\n'
  )});
  await expect(page.locator('#kpi-revenue')).toContainText('260,00');
  await expect(page.locator('#kpi-contribution')).toHaveText('—');
  await expect(page.locator('#warnings')).toBeVisible();
  await expect(page.locator('#warning-items')).toContainText('Missing verified costs for: cay');
  await expect(page.locator('#sku-rows tr')).toHaveCount(2);
});
