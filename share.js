import {copy} from './copy.js?v=simple-menu-1';
import {nutritionFor} from './nutrition.js?v=nutrition-20261105';
import {composeShare} from './share-content.js?v=full-description-20261110';

const publicMenu = 'https://safal207.github.io/halk-bufe-selinus/';
const words = {
  tr:{title:'Paylaş',loading:'Hikâye hazırlanıyor…',save:'Hikâyeyi kaydet',send:'Gönder',sendLink:'Bağlantıyı gönder',link:'Açıklama ve bağlantıyı kopyala',hint:'Instagram için görseli hikâyene ekle; bağlantıyı bağlantı çıkartmasıyla ekleyebilirsin.',failed:'Paylaşım açılamadı. Görseli kaydedebilir veya bağlantıyı kopyalayabilirsin.'},
  ru:{title:'Поделиться',loading:'Готовим сторис…',save:'Сохранить сторис',send:'Отправить',sendLink:'Отправить ссылку',link:'Копировать описание и ссылку',hint:'Для Instagram: добавьте сохранённую карточку в сторис, а ссылку — стикером.',failed:'Не удалось открыть отправку. Сохраните карточку или скопируйте ссылку.'},
  en:{title:'Share',loading:'Preparing your story…',save:'Save story',send:'Send',sendLink:'Send link',link:'Copy details and link',hint:'For Instagram: add the saved card to your story, then add the link with a link sticker.',failed:'Sharing could not open. Save the card or copy the link instead.'},
  de:{title:'Teilen',loading:'Story wird vorbereitet…',save:'Story speichern',send:'Senden',sendLink:'Link senden',link:'Beschreibung & Link kopieren',hint:'Für Instagram: Füge die gespeicherte Karte zur Story hinzu und den Link als Link-Sticker.',failed:'Teilen konnte nicht geöffnet werden. Speichere die Karte oder kopiere den Link.'}
};
const shapes = {
  send:'<path d="m21 3-7 18-4-7-7-4L21 3ZM10 14 21 3"/>',
  save:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 6v9m-3-3 3 3 3-3M10 19h4"/>',
  link:'<path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 10a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-1 1" transform="translate(1 0) scale(.9)"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
};
const svg = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name]}</svg>`;
const $ = id => document.getElementById(id);
let active = null;
let generation = 0;
let previewUrl = null;

export function shareUrl(item,lang) {
  return new URL(`dish/${lang}/${item.id}/`,publicMenu).href;
}
function linesFor(context,text,width) {
  const result = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > width) {result.push(line); line = word;}
    else line = next;
  }
  if (line) result.push(line);
  return result;
}
function textBlock(context,text,x,y,width,size,lineLimit,bold=false) {
  let lines;
  do {
    context.font = `${bold ? '800' : '500'} ${size}px system-ui, sans-serif`;
    lines = linesFor(context,text,width);
    if (lines.length <= lineLimit) break;
    size -= 2;
  } while (size > 22);
  for (const line of lines) {context.fillText(line,x,y,width); y += size * 1.18;}
  return y;
}
function roundRect(context,x,y,w,h,r,fill) {
  context.fillStyle = fill; context.beginPath(); context.roundRect(x,y,w,h,r); context.fill();
}
function imageLoad(src) {
  const image = new Image(); image.src = src;
  return image.decode().then(()=>image);
}
function storyQR(context,url,x,y) {
  const code = new window.SelinusQRCode(-1,1);
  code.addData(url); code.make();
  const count = code.getModuleCount(), unit = Math.floor(210 / (count+8)), size = (count+8)*unit;
  context.fillStyle='#fff'; context.fillRect(x,y,size,size);
  context.fillStyle='#173e34';
  for (let row=0;row<count;row++) for(let col=0;col<count;col++) if(code.isDark(row,col)) context.fillRect(x+(col+4)*unit,y+(row+4)*unit,unit,unit);
}
async function storyCard(item,lang) {
  const details=composeShare(item,lang,nutritionFor(item),copy[lang].ask);
  const photo = await imageLoad(`assets/${item.photo}.webp`);
  const brand = await imageLoad('assets/halk-bufe-logo.svg');
  const canvas = document.createElement('canvas'); canvas.width=1080; canvas.height=1920;
  const c = canvas.getContext('2d'); c.textBaseline='top';
  c.fillStyle='#fff6e5'; c.fillRect(0,0,1080,1920);
  c.drawImage(brand,64,94,420,140.5);
  c.fillStyle='#784b2e'; c.font='600 27px system-ui, sans-serif';
  c.fillText('SELİNUS · GAZİPAŞA',610,157,405);
  c.save(); c.beginPath(); c.roundRect(48,280,984,830,36); c.clip();
  c.fillStyle='#d56932'; c.fillRect(48,280,984,830);
  const scale = Math.min(984/photo.naturalWidth,830/photo.naturalHeight);
  const w=photo.naturalWidth*scale,h=photo.naturalHeight*scale;
  c.drawImage(photo,48+(984-w)/2,280+(830-h)/2,w,h); c.restore();
  c.fillStyle='#183f35';
  let y=textBlock(c,item.name[lang],64,1164,952,76,3,true);
  if(lang!=='tr') {c.fillStyle='#7a644e';y=textBlock(c,item.name.tr,64,y+12,952,31,2);}
  c.save();c.beginPath();c.rect(64,y+14,950,Math.max(0,1590-y));c.clip();
  if(details.description) {c.fillStyle='#5b6254';y=textBlock(c,details.description,64,y+17,952,30,2);}
  if(details.ingredientsLine) {c.fillStyle='#39594c';textBlock(c,details.ingredientsLine,64,y+12,952,27,3);}
  c.restore();
  const price = item.price===null ? copy[lang].ask : `${item.price} ₺`;
  roundRect(c,64,1650,620,120,32,'#9b3025');c.fillStyle='#fff9eb';
  textBlock(c,price,96,1672,555,item.price===null?36:74,2,true);
  storyQR(c,shareUrl(item,lang),804,1616);
  c.fillStyle='#183f35';c.font='700 23px system-ui, sans-serif';c.fillText('MENU',856,1834);
  c.fillStyle='#756852';textBlock(c,copy[lang].photoNote,64,1820,690,23,3);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.92));
  if(!blob) throw new Error('Story export unavailable');
  return new File([blob],`halk-bufe-${item.id}-${lang}-story.jpg`,{type:'image/jpeg'});
}
function clearPreview() {
  if(previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl=null; $('story-preview').removeAttribute('src');
}
function canSendFile(file) {
  try {return !!(file && navigator.canShare?.({files:[file]}));} catch {return false;}
}
export function openShare(item,lang) {
  if(!item) return;
  const token=++generation; clearPreview();
  const details=composeShare(item,lang,nutritionFor(item),copy[lang].ask);
  active={item,lang,file:null,details}; const labels=words[lang];
  $('share-title').textContent=labels.title;
  $('share-close').innerHTML=svg('close');$('share-close').setAttribute('aria-label',copy[lang].close);
  $('story-preview').hidden=true;$('story-preview').alt=`${item.name[lang]} · ${item.price===null?copy[lang].ask:`${item.price} ₺`}`;
  $('story-stage').setAttribute('aria-busy','true');
  $('story-loading').hidden=false;$('story-loading').textContent=labels.loading;
  $('share-dish-name').textContent=details.headline;
  $('share-description').textContent=details.description;
  $('share-description').hidden=!details.description;
  $('share-ingredients').textContent=details.ingredientsLine;
  $('share-ingredients').hidden=!details.ingredientsLine;
  $('share-disclaimer').textContent=details.note;
  $('share-cta').textContent=details.cta;
  $('share-send').hidden=!navigator.share;$('share-send').disabled=false;
  $('share-send').innerHTML=`<span>${svg('send')}</span>${labels.sendLink}`;
  $('share-save').disabled=true;$('share-save').innerHTML=`<span class="story-action">${svg('save')}</span>${labels.save}`;
  $('share-copy').innerHTML=`<span>${svg('link')}</span>${labels.link}`;
  $('share-hint').textContent=labels.hint;$('share-status').textContent='';
  document.querySelector('#share-dialog .copy-field')?.remove();
  if(!$('share-dialog').open) $('share-dialog').showModal();
  let timer;
  Promise.race([storyCard(item,lang),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Story timeout')),12000);})])
    .then(file=>{
      if(token!==generation) return;
      active.file=file;previewUrl=URL.createObjectURL(file);$('story-preview').src=previewUrl;$('story-preview').hidden=false;
      $('story-loading').hidden=true;$('share-save').disabled=false;
      // The share action sends rich text + URL; saving the image is a separate choice.
    }).catch(()=>{if(token===generation) {$('story-loading').textContent=copy[lang].sharePhotoUnavailable;}})
    .finally(()=>{clearTimeout(timer);if(token===generation) $('story-stage').setAttribute('aria-busy','false');});
}
$('share-close').addEventListener('click',()=>$('share-dialog').close());
$('share-dialog').addEventListener('click',event=>{if(event.target===$('share-dialog')) $('share-dialog').close();});
$('share-dialog').addEventListener('close',()=>{++generation;active=null;clearPreview();});
$('share-save').addEventListener('click',()=>{
  if(!active?.file || !previewUrl) return;
  const link=document.createElement('a');link.href=previewUrl;link.download=active.file.name;link.click();
});
$('share-copy').addEventListener('click',async()=>{
  if(!active) return;
  const current=active,url=shareUrl(current.item,current.lang);
  const body=`${current.details.details}\n${url}`;
  try {await navigator.clipboard.writeText(body);if(active===current) $('share-status').textContent=copy[current.lang].copied;}
  catch {
    if(active!==current) return;
    document.querySelector('#share-dialog .copy-field')?.remove();
    const field=document.createElement('textarea');field.className='copy-field';field.readOnly=true;field.value=body;
    field.setAttribute('aria-label',copy[current.lang].selectCopy);$('share-status').after(field);field.focus();field.select();
  }
});
$('share-send').addEventListener('click',async()=>{
  if(!active || !navigator.share) return;
  const current=active;const {item,lang,details}=current;
  const data={title:details.headline,text:details.details,url:shareUrl(item,lang)};
  $('share-send').disabled=true;
  try {await navigator.share(data);}catch(error){if(error.name!=='AbortError' && active===current) $('share-status').textContent=words[lang].failed;}
  finally{if(active===current) $('share-send').disabled=false;}
});
