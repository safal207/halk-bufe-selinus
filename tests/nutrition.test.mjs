import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const folder=existsSync(new URL('../dist/menu.js',import.meta.url))?'../dist/':'../';
const {menu}=await import(new URL(folder+'menu.js',import.meta.url));
const {ingredients,nutritionData,vitaminProfiles,benefitProfiles}=await import(new URL(folder+'nutrition-data.js',import.meta.url));
const {recipeEnergy,nutritionFor,nutritionMarkup,nutritionLabels}=await import(new URL(folder+'nutrition.js',import.meta.url));
const languages=['tr','ru','en','de'];

test('all 44 dishes and drinks have four-language nutrition sections',()=>{
  assert.equal(menu.length,44);
  assert.deepEqual(Object.keys(nutritionData).sort(),menu.map(x=>x.id).sort());
  for(const item of menu){
    const data=nutritionData[item.id];
    assert.ok(['menu','typical','unknown'].includes(data.basis),item.id);
    assert.ok(benefitProfiles[data.benefit],item.id);
    for(const key of data.vitamins)assert.ok(vitaminProfiles[key],`${item.id} ${key}`);
    for(const lang of languages){
      assert.ok(data.ingredients[lang].length>15,`${item.id} ${lang} ingredients`);
      assert.ok(data.portion[lang].length>5,`${item.id} ${lang} portion`);
      const html=nutritionMarkup(item,lang);
      for(const key of ['ingredients','benefits','vitamins']) assert.ok(html.includes(nutritionLabels[lang][key]),`${item.id} ${lang} ${key}`);
      assert.doesNotMatch(html,/undefined|NaN|\[object Object\]/);
    }
  }
});

test('energy estimates enclose explicit ingredient calculations',()=>{
  for(const [id,data] of Object.entries(nutritionData)){
    if(!data.recipe)continue;
    let rawLow=0,rawHigh=0;
    for(const [key,low,high] of data.recipe){
      const ingredient=ingredients[key];assert.ok(ingredient,`${id}: ${key}`);
      assert.ok(Number.isFinite(low)&&Number.isFinite(high)&&low>=0&&high>=low);
      assert.ok(ingredient.kcal[0]>=0&&ingredient.kcal[1]>=ingredient.kcal[0]);
      rawLow+=ingredient.kcal[0]*low/100;rawHigh+=ingredient.kcal[1]*high/100;
      for(const lang of languages)assert.ok(ingredient.labels[lang],`${key}: ${lang}`);
    }
    const [low,high]=recipeEnergy(data.recipe);
    assert.ok(low<=rawLow+1e-8&&high>=rawHigh-1e-8,`${id}: ${low}–${high}`);
    assert.ok(low>=0&&high>=low,id);
    assert.deepEqual(nutritionFor(id).energy,[low,high]);
  }
  assert.throws(()=>recipeEnergy([['missing',10,20]]));
  assert.throws(()=>recipeEnergy([['egg',20,10]]));
  assert.throws(()=>recipeEnergy([['egg',-1,10]]));
});

test('unidentified or unquantified dishes do not acquire invented calories',()=>{
  assert.equal(recipeEnergy(null),null);
  for(const id of ['gunun-tatlisi','atistirma']){
    assert.equal(nutritionData[id].recipe,null);
    assert.equal(nutritionFor(id).energy,null);
    assert.deepEqual(nutritionData[id].vitamins,['unknown']);
  }
  assert.match(nutritionData.atistirma.ingredients.en,/chicken nuggets.*onion rings.*fries/);
});

test('confirmed chicken and kids sides are included, while adult köfte sides remain unknown',()=>{
  for(const id of ['tavuk-sis','tavuk-izgara','kori-tavuk','citir-tavuk','tavuk-cocuk','kofte-cocuk']){
    const keys=nutritionData[id].recipe.map(x=>x[0]);
    for(const key of ['rice','fries','cabbage'])assert.ok(keys.includes(key),`${id}: ${key}`);
  }
  for(const id of ['tavuk-cocuk','kofte-cocuk'])assert.ok(nutritionData[id].recipe.some(x=>x[0]==='cucumber'));
  for(const key of ['rice','fries','cabbage'])assert.ok(!nutritionData.kofte.recipe.some(x=>x[0]===key));
  assert.match(nutritionData.kofte.portion.en,/sides excluded/);
});

test('plain coffee and tea do not gain vitamin or sweetened-mix claims',()=>{
  for(const id of ['cay','bitki-cayi','turk-kahvesi','nescafe']){
    assert.deepEqual(nutritionData[id].vitamins,['none']);
    assert.ok(nutritionFor(id).energy[1]<=10,id);
    for(const lang of languages)assert.ok(nutritionMarkup(id,lang).includes(vitaminProfiles.none[lang]));
  }
  assert.match(nutritionData.nescafe.ingredients.en,/milk, sugar and sweetened premixes excluded/);
  assert.match(nutritionData['bitki-cayi'].ingredients.en,/herb blend unknown/);
});
