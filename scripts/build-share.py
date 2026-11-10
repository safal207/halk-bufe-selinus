"""Rebuild public dish link previews after changing menu data or food photos.

Run: python3 scripts/build-share.py (requires Node.js and Pillow).
Each locale has an HTML URL; all share previews use a public GitHub Pages URL.
"""
from pathlib import Path
from html import escape
import hashlib
import json
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist' if (ROOT / 'dist/index.html').exists() else ROOT
PUBLIC = 'https://safal207.github.io/halk-bufe-selinus/'
source = """
import fs from 'node:fs';
const read=async name=>import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(name)).toString('base64'));
const {menu}=await read('menu.js'),{copy}=await read('copy.js');
const {nutritionData}=await read('nutrition-data.js'),{composeShare}=await read('share-content.js');
const rich={};
for(const item of menu) {
  rich[item.id]={};
  for(const lang of ['tr','ru','en','de'])
    rich[item.id][lang]=composeShare(item,lang,nutritionData[item.id],copy[lang].ask);
}
console.log(JSON.stringify({menu,copy,rich}));
"""
data = json.loads(subprocess.check_output(['node','--input-type=module','-e',source],cwd=DIST))
out = DIST / 'assets/share'
out.mkdir(parents=True,exist_ok=True)
font_root = Path('/usr/share/fonts/truetype/dejavu')
def font(size,bold=False):
    return ImageFont.truetype(str(font_root/('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')),size)
def lines(draw,text,f,width):
    result=[]
    for word in text.split():
        if result and draw.textlength(result[-1]+' '+word,font=f)<=width: result[-1]+=' '+word
        else: result.append(word)
    return result
locales={'tr':'tr_TR','ru':'ru_RU','en':'en_US','de':'de_DE'}
for item in data['menu']:
    photo = DIST / f"assets/{item['photo']}.webp"
    # Content version prevents stale price/photo previews when a dish changes.
    digest=hashlib.sha256(photo.read_bytes()+json.dumps(item,sort_keys=True,ensure_ascii=False).encode()+b'og-layout-1').hexdigest()[:10]
    image_path=f"assets/share/{item['id']}-{digest}.jpg"
    card=Image.new('RGB',(1200,630),'#fff6e5')
    card.paste(ImageOps.fit(Image.open(photo).convert('RGB'),(750,630),method=Image.Resampling.LANCZOS),(450,0))
    d=ImageDraw.Draw(card)
    d.text((42,42),'HALK BÜFE',font=font(43,True),fill='#183f35')
    d.text((44,99),'SELİNUS',font=font(25,True),fill='#a33429')
    size=42
    while len(lines(d,item['name']['tr'],font(size,True),360))>5: size-=2
    for i,line in enumerate(lines(d,item['name']['tr'],font(size,True),360)):
        d.text((42,188+i*(size+8)),line,font=font(size,True),fill='#183f35')
    price=f"{item['price']} ₺" if item['price'] is not None else data['copy']['tr']['ask']
    size=68 if item['price'] is not None else 31
    for i,line in enumerate(lines(d,price,font(size,True),360)):
        d.text((42,472+i*(size+5)),line,font=font(size,True),fill='#a33429')
    d.text((42,567),'SELİNUS · GAZİPAŞA',font=font(20,True),fill='#756852')
    d.text((42,601),'Yapay zekâ görseli',font=font(16),fill='#756852')
    card.save(DIST/image_path,'JPEG',quality=86,optimize=True)
    for lang,locale in locales.items():
        url=f"{PUBLIC}dish/{lang}/{item['id']}/?v=rich-20261110"
        target=f"{PUBLIC}?lang={lang}#dish-{item['id']}"
        price=f"{item['price']} ₺" if item['price'] is not None else data['copy'][lang]['ask']
        title=f"{item['name'][lang]} · {price} · Halk Büfe Selinus"
        rich=data['rich'][item['id']][lang]
        description=rich['preview']
        e=lambda value: escape(str(value),quote=True)
        html=f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(description)}">
<link rel="canonical" href="{url}"><meta property="og:type" content="website"><meta property="og:site_name" content="Halk Büfe Selinus">
<meta property="og:url" content="{url}"><meta property="og:locale" content="{locale}">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(description)}">
<meta property="og:image" content="{PUBLIC}{image_path}"><meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{e(item['name'][lang])}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}">
<meta name="twitter:description" content="{e(description)}"><meta name="twitter:image" content="{PUBLIC}{image_path}">
<style>body{{font:16px/1.5 system-ui;background:#fff6e5;color:#183f35;margin:24px}}main{{max-width:580px;margin:auto}}img{{width:100%;border-radius:20px}}h1{{line-height:1.15}}a{{display:inline-block;padding:14px 24px;background:#183f35;color:white;border-radius:14px}}</style></head>
<body><main><p>HALK BÜFE SELİNUS</p><img src="{PUBLIC}assets/{item['photo']}.webp" alt="{e(item['name'][lang])}">
<h1>{e(item['name'][lang])}</h1>
<p>{e(rich['description'])}</p><h3>{e(rich['ingredientsLine'].split(':')[0])}</h3><p>{e(rich['ingredientsLine'])}</p>
<p><small>{e(rich['note'])}</small></p><h2>{e(price)}</h2>
<p>{e(rich['cta'])}</p><p>{e(data['copy'][lang]['photoNote'])}</p>
<a href="{e(target)}">{e(data['copy'][lang]['heroCta'])}</a></main>
<script>location.replace({json.dumps(target)});</script></body></html>'''
        page=DIST/'dish'/lang/item['id']/'index.html'
        page.parent.mkdir(parents=True,exist_ok=True)
        page.write_text(html)
    if item['id']=='tavuk-sis':
        (out/'menu-preview.jpg').write_bytes((DIST/image_path).read_bytes())
print(f"Built {len(data['menu']) * len(locales)} localized dish pages and {len(data['menu'])} food previews.")
