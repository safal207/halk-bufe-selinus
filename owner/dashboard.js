import {menu} from '../menu.js?v=pasta-retouch-20261107';
import {analyzeMargin,formatTryCents} from '../owner-margin.js?v=owner-20261112';

const labels = {
tr:{
  language:'Dil',menu:'Menü',eyebrow:'YEREL KAR ANALİZİ',title:'Satış ve katkı payı',
  description:'POS kayıtları ve maliyetleri yalnızca bu tarayıcıda karşılaştırın.',
  privacyTitle:'Bu bir giriş korumalı yönetici paneli değildir.',
  privacyText:'Dosyalar sunucuya gönderilmez veya tarayıcıda kalıcı kaydedilmez. Yalnızca güvenilir bir cihazda kullanın. Sayfa yeniden yüklenince veriler silinir.',
  costTitle:'Ürün maliyeti',costHelp:'Her ürün için doğrulanmış değişken maliyetleri TRY cinsinden yükleyin.',costPicker:'Maliyet CSV dosyasını seç',
  salesTitle:'Kasadan doğrulanmış fişler',salesHelp:'Yalnızca gerçek POS kayıtları; hazırlanan sepetler satış değildir.',salesPicker:'POS CSV dosyasını seç',
  fileNone:'Dosya seçilmedi',loaded:'Yüklendi',template:'Boş CSV şablonunu indir',resultsEyebrow:'DOĞRULANABİLİR METRİKLER',
  resultsTitle:'Satış analizi',reset:'Verileri temizle',orders:'Net ödenmiş fişler',revenue:'Net satış (TRY)',contribution:'Katkı payı (TRY)',
  margin:'Katkı oranı',waiting:'Analiz için maliyet ve POS CSV dosyalarını ayrı ayrı seçin.',ready:'Yalnızca POS kayıtlarından hesaplandı. Ödemelerin doğruluğu kasaya bağlıdır.',
  partial:'Bazı kayıtlar hatalı veya maliyet eksik: toplam katkı payı hesaplanmıyor.',error:'Dosya yüklenemedi',warnings:'Kontrol gerektiren veriler',
  table:'Ürüne göre katkı payı',item:'Ürün',units:'Net adet',unknown:'Maliyet bilinmiyor',
  footer:'Katkı payı net kâr değildir; vergiler, sabit giderler ve belgelenmeyen maliyetler dahil değildir. Bu araç POS doğrulaması yapmaz.',
  noSale:'Bu dosyalarda geçerli ödenmiş fiş bulunamadı.'
},
ru:{
  language:'Язык',menu:'Меню',eyebrow:'ЛОКАЛЬНАЯ АНАЛИТИКА',title:'Продажи и маржинальный доход',
  description:'Сопоставьте выгрузки кассы и себестоимости прямо в браузере.',
  privacyTitle:'Это не защищённый авторизацией кабинет.',
  privacyText:'Файлы не отправляются на сервер и не сохраняются в браузере. Используйте только доверенное устройство. После обновления страницы данные очищаются.',
  costTitle:'Себестоимость по блюдам',costHelp:'Загрузите подтверждённые переменные затраты по каждой позиции в TRY.',costPicker:'Выбрать CSV себестоимости',
  salesTitle:'Подтверждённые чеки кассы',salesHelp:'Только настоящие POS-операции; собранные корзины не считаются продажами.',salesPicker:'Выбрать CSV кассы',
  fileNone:'Файл не выбран',loaded:'Загружено',template:'Скачать пустой шаблон CSV',resultsEyebrow:'ПОДТВЕРЖДАЕМЫЕ ПОКАЗАТЕЛИ',
  resultsTitle:'Анализ продаж',reset:'Очистить данные',orders:'Чеки с положительным нетто',revenue:'Чистая выручка (TRY)',contribution:'Маржинальный доход (TRY)',
  margin:'Маржинальность',waiting:'Для расчёта выберите оба CSV: себестоимость и реальные чеки.',ready:'Расчёт только по импортированным чекам. Их подлинность должна подтверждать касса.',
  partial:'Найдены ошибки или неизвестные затраты. Общий маржинальный доход скрыт.',error:'Не удалось прочитать файл',warnings:'Данные требуют проверки',
  table:'Маржинальный доход по позициям',item:'Позиция',units:'Нетто, шт.',unknown:'Нет подтверждённых затрат',
  footer:'Маржинальный доход — не чистая прибыль: налоги, постоянные расходы и другие затраты не учтены. Этот инструмент не проверяет подлинность POS-выгрузки.',
  noSale:'В файле нет действительных оплаченных чеков.'
},
en:{
  language:'Language',menu:'Menu',eyebrow:'LOCAL PROFIT ANALYSIS',title:'Sales and contribution',
  description:'Compare real POS exports with variable costs locally in your browser.',
  privacyTitle:'This is not an authenticated owner portal.',
  privacyText:'Files are not transmitted or permanently stored. Use a trusted device. Reloading clears all imported data.',
  costTitle:'Item costs',costHelp:'Upload verified variable costs per menu item, in TRY.',costPicker:'Choose costs CSV',
  salesTitle:'Verified POS receipts',salesHelp:'Real POS transactions only. Prepared baskets are not sales.',salesPicker:'Choose receipts CSV',
  fileNone:'No file selected',loaded:'Loaded',template:'Download blank CSV template',resultsEyebrow:'AUDITABLE METRICS',
  resultsTitle:'Sales analysis',reset:'Clear data',orders:'Net paid receipts',revenue:'Net revenue (TRY)',contribution:'Contribution (TRY)',
  margin:'Contribution margin',waiting:'Choose both the cost and POS CSV files to calculate.',ready:'Based on imported POS rows only; authenticity depends on the cashier system.',
  partial:'Missing cost data or errors detected. Overall contribution is withheld.',error:'File could not be read',warnings:'Data quality warnings',
  table:'Contribution by menu item',item:'Item',units:'Net units',unknown:'Cost unavailable',
  footer:'Contribution is not net profit; taxes, fixed overhead and other costs may not be included. This tool does not independently verify a POS export.',
  noSale:'No valid paid receipts in these files.'
},
de:{
  language:'Sprache',menu:'Speisekarte',eyebrow:'LOKALE MARGENANALYSE',title:'Umsatz und Deckungsbeitrag',
  description:'Kassenexporte und variable Kosten lokal im Browser vergleichen.',
  privacyTitle:'Dies ist kein zugangsgeschütztes Betreiberportal.',
  privacyText:'Dateien werden nicht übertragen oder dauerhaft gespeichert. Nur auf vertrauenswürdigen Geräten nutzen. Neuladen löscht die Daten.',
  costTitle:'Artikelkosten',costHelp:'Bestätigte variable Kosten pro Artikel in TRY importieren.',costPicker:'Kosten-CSV auswählen',
  salesTitle:'Bezahlte Kassenbelege',salesHelp:'Nur echte POS-Daten. Vorbereitete Warenkörbe sind keine Verkäufe.',salesPicker:'POS-CSV auswählen',
  fileNone:'Keine Datei ausgewählt',loaded:'Geladen',template:'Leere CSV-Vorlage laden',resultsEyebrow:'PRÜFBARE KENNZAHLEN',
  resultsTitle:'Umsatzanalyse',reset:'Daten löschen',orders:'Netto bezahlte Belege',revenue:'Nettoumsatz (TRY)',contribution:'Deckungsbeitrag (TRY)',
  margin:'Deckungsbeitragsquote',waiting:'Für die Berechnung Kosten- und POS-CSV auswählen.',ready:'Nur aus importierten Kassendaten berechnet; Echtheit muss die Kasse bestätigen.',
  partial:'Fehlende Kosten oder Datenfehler. Der Gesamtdeckungsbeitrag wird nicht ausgewiesen.',error:'Datei konnte nicht gelesen werden',warnings:'Datenprüfungen',
  table:'Deckungsbeitrag nach Artikel',item:'Artikel',units:'Netto-Stückzahl',unknown:'Keine Kosten',
  footer:'Deckungsbeitrag ist kein Nettogewinn; Steuern, Fixkosten und weitere Ausgaben können fehlen. Dieses Tool bestätigt keine POS-Echtheit.',
  noSale:'Keine gültigen bezahlten Belege in den Dateien.'
}
};
const $ = id => document.getElementById(id);
const params=new URLSearchParams(location.search);
let lang=Object.hasOwn(labels,params.get('lang'))?params.get('lang'):'tr';
let costCSV=null,salesCSV=null,readError='';
const t=key=>labels[lang][key];

const idMap={
 'language-label':'language','menu-link':'menu','eyebrow':'eyebrow','title':'title',
 'description':'description','privacy-title':'privacyTitle','privacy-text':'privacyText',
 'cost-title':'costTitle','cost-help':'costHelp','cost-picker':'costPicker',
 'sales-title':'salesTitle','sales-help':'salesHelp','sales-picker':'salesPicker',
 'cost-template':'template','sales-template':'template','results-eyebrow':'resultsEyebrow',
 'results-title':'resultsTitle','reset-data':'reset',
 'kpi-orders-label':'orders','kpi-revenue-label':'revenue',
 'kpi-contribution-label':'contribution','kpi-margin-label':'margin',
 'warnings-title':'warnings','table-caption':'table','th-item':'item',
 'th-units':'units','th-revenue':'revenue','th-contribution':'contribution',
 'th-margin':'margin','footer-note':'footer'
};

function translate() {
  document.documentElement.lang=lang;
  document.title='Halk Büfe · '+t('title');
  $('language').value=lang;
  $('menu-link').href='../?lang='+lang+'&view=feed';
  for(const [id,key] of Object.entries(idMap))$(id).textContent=t(key);
  $('cost-file-status').textContent=costCSV?t('loaded'):t('fileNone');
  $('sales-file-status').textContent=salesCSV?t('loaded'):t('fileNone');
  render();
}

function text(id,value){$(id).textContent=String(value);}
function clearTable(){ $('sku-rows').replaceChildren(); $('table-container').hidden=true; }
function render(){
  for(const name of ['orders','revenue','contribution','margin'])text('kpi-'+name,'—');
  $('warnings').hidden=true;
  $('warning-items').replaceChildren();
  clearTable();
  if(readError){text('result-note',t('error')+': '+readError);return;}
  if(costCSV===null||salesCSV===null){text('result-note',t('waiting'));return;}
  let report;
  try {report=analyzeMargin({menu,costCSV,receiptsCSV:salesCSV});}
  catch(error){text('result-note',t('error')+': '+error.message);return;}
  text('kpi-orders',report.paidReceipts);
  text('kpi-revenue',formatTryCents(report.revenueCents));
  if(report.contributionCents!==null){
    text('kpi-contribution',formatTryCents(report.contributionCents));
    text('kpi-margin',report.marginPct===null?'—':report.marginPct.toLocaleString(lang,{maximumFractionDigits:1})+'%');
  }
  text('result-note',report.contributionCents===null?t('partial'):report.paidReceipts?t('ready'):t('noSale'));
  if(report.problems.length) {
    $('warnings').hidden=false;
    for(const warning of report.problems.slice(0,75)){
      const li=document.createElement('li');
      li.textContent=warning; // Imported CSV strings are never interpreted as HTML.
      $('warning-items').append(li);
    }
  }
  if(report.rows.length){
    $('table-container').hidden=false;
    for(const item of report.rows){
      const tr=document.createElement('tr');
      const name=document.createElement('td');
      name.textContent=item.name[lang]||item.item_id;
      const small=document.createElement('small');
      small.className='item-id';
      small.textContent=item.item_id;
      name.append(small);tr.append(name);
      for(const value of [
        item.units,
        formatTryCents(item.revenueCents),
        item.contributionCents===null?t('unknown'):formatTryCents(item.contributionCents),
        item.marginPct===null?'—':item.marginPct.toLocaleString(lang,{maximumFractionDigits:1})+'%'
      ]){
        const td=document.createElement('td');td.textContent=String(value);tr.append(td);
      }
      $('sku-rows').append(tr);
    }
  }
}

async function load(input,type){
  const file=input.files?.[0];
  if(!file)return;
  if(file.size>1_500_000){
    readError='CSV exceeds 1.5 MB';
    input.value='';render();return;
  }
  try{
    const source=await file.text();
    if(type==='cost')costCSV=source;else salesCSV=source;
    readError='';
    translate();
  }catch(error){readError=error.message;render();}
}
function template(type) {
  const header=type==='cost'
    ?'item_id,ingredients_try,packaging_try,other_variable_try\n'+menu.map(item=>item.id+',,,\n').join('')
    :'line_id,receipt_id,status,item_id,quantity,net_unit_revenue_try\n';
  const blob=new Blob(['\uFEFF'+header],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=type==='cost'?'selinus-costs-blank.csv':'selinus-pos-receipts-blank.csv';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('language').addEventListener('change',()=>{
  lang=$('language').value;
  history.replaceState(null,'','?lang='+lang);
  translate();
});
$('cost-file').addEventListener('change',event=>load(event.target,'cost'));
$('sales-file').addEventListener('change',event=>load(event.target,'sales'));
$('cost-template').addEventListener('click',()=>template('cost'));
$('sales-template').addEventListener('click',()=>template('sales'));
$('reset-data').addEventListener('click',()=>{
  costCSV=null;salesCSV=null;readError='';
  $('cost-file').value='';$('sales-file').value='';
  translate();
});
translate();
