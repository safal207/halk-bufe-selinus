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
    return {shadow:css.boxShadow,ring:ring.boxShadow,pointer:ring.pointerEvents,rail:rail.backgroundColor,
      animation:css.animationName};
  });
  expect(styles.shadow).not.toBe('none');
  expect(styles.ring).not.toBe('none');
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
    try {
      new PerformanceObserver(list=>{
        for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__qaCls+=entry.value;
      }).observe({type:'layout-shift',buffered:true});
    }catch{/* LayoutShift not implemented in every engine */}
  });
  const start=Date.now();
  await openMenu(page);
  const load=Date.now()-start;
  expect(load,'local first-interaction budget').toBeLessThan(12000);
  expect(errors,'runtime JavaScript errors').toEqual([]);
  const cls=await page.evaluate(()=>window.__qaCls);
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
