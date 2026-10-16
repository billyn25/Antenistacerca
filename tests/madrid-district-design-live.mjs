/** Production reads only; no calls, WhatsApp messages or form submissions. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {madridDistricts} from '../src/madrid-districts.mjs';
import {VERSION,assertDistrictDesign} from '../scripts/madrid-district-design.mjs';
import {auditHtml} from '../scripts/regional-contact.mjs';
import {LOGO} from '../header-brand.mjs';
import {HERO} from '../hero-full-width.js';
import services from '../content/madrid-services.json' with {type:'json'};
const origin='https://antenistacerca.es',out='.cache/district-design';
const result={origin,branch:'refactor-limpieza-segura',commit:process.env.GITHUB_SHA||null,version:VERSION,districts:[],controls:[],assets:[],browser:[],ok:false};
fs.mkdirSync(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function read(route){const r=await fetch(new URL(route,origin),{redirect:'manual',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});assert.equal(r.status,200,route+': HTTP '+r.status);return {r,text:await r.text()};}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
let browser;
try{
 let ready=false;
 for(let i=0;i<24;i++){
  try{const {text}=await read('/madrid/chamberi/');assert.ok(text.includes(`data-ac-district-design="${VERSION}"`));ready=true;break;}
  catch(e){result.lastObservation=e.message;if(i<23)await pause(5000);}
 }
 assert.ok(ready,'El nuevo diseño no se ha confirmado publicado');
 const {text:city}=await read('/madrid/madrid/');
 for(const d of madridDistricts){
  const {r,text}=await read(d.route);
  assertDistrictDesign(text,city,d.route);auditHtml(text,d.route);
  const expected=fs.readFileSync('public'+d.route+'index.html','utf8');
  for(const re of [/<title>[\s\S]*?<\/title>/,/<link rel="canonical"[^>]*>/,/<meta name="robots"[^>]*>/])assert.equal(text.match(re)?.[0],expected.match(re)?.[0],d.route+': metadatos publicados');
  assert.ok(!/noindex/i.test(r.headers.get('x-robots-tag')||''));
  assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(text));
  result.districts.push({url:origin+d.route,status:r.status,approvedLogo:true,municipalStyles:true,approvedHero:true,regionalContact:true,ok:true});
 }
 for(const route of ['/','/madrid/','/madrid/madrid/','/madrid/ajalvir/','/burgos/','/burgos/lerma/','/guadalajara/','/toledo/']){
  const {text}=await read(route);assert.ok(!text.includes('data-ac-district-design='));auditHtml(text,route);result.controls.push({url:origin+route,ok:true});
 }
 const localIndex=fs.readFileSync('public/sitemap.xml','utf8');
 const madridMap=[...localIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).find(url=>/\/sitemaps\/[^/]*madrid[^/]*\.xml$/.test(url));
 assert.ok(madridMap,'Sitemap Madrid no encontrado');
 const {text:map}=await read(madridMap);const urls=[...map.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.equal(urls.length,201+services.length);for(const d of madridDistricts)assert.ok(urls.includes(origin+d.route));
 result.sitemap={url:madridMap,urls:urls.length,districts:21,ok:true};
 for(const asset of [LOGO,HERO,'/assets/shared-ui.css','/assets/town-enhancements.css','/assets/header-brand-v1.css','/assets/hero-panorama-v3.css']){
  const r=await fetch(origin+asset,{signal:AbortSignal.timeout(20000)});assert.equal(r.status,200,asset);
  const bytes=Buffer.from(await r.arrayBuffer());assert.equal(hash(bytes),hash(fs.readFileSync('public'+asset)),asset+': recurso publicado distinto');result.assets.push({asset,sha256:hash(bytes),ok:true});
 }
 browser=await chromium.launch({headless:true});
 for(const [width,javascript] of [[320,true],[390,true],[768,true],[1440,true],[390,false]]){
  const context=await browser.newContext({viewport:{width,height:950},javaScriptEnabled:javascript});const page=await context.newPage();
  for(const slug of ['chamberi','fuencarral-el-pardo','san-blas-canillejas']){
   await page.goto(origin+'/madrid/'+slug+'/',{waitUntil:'load',timeout:45000});
   const logo=page.locator('header .ac-brand-logo img.brand-logo');assert.equal(await logo.count(),1);assert.ok(await logo.isVisible());
   await page.waitForFunction(()=>{const img=document.querySelector('header img.brand-logo');return img?.complete&&img.naturalWidth>0;});
   const hero=page.locator('.hero.ac-hero-full');assert.ok(await hero.isVisible());
   assert.ok((await hero.locator('img').getAttribute('src')).includes(HERO));
   const metrics=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,logo:getComputedStyle(document.querySelector('header .brand-logo')).width}));
   assert.ok(metrics.scroll<=metrics.width+1,slug+': desbordamiento a '+width);
   assert.equal(await page.locator('header .hcontact a.tel').getAttribute('href'),'tel:+34614789945');
   const footer=page.locator('footer .regional-contact');assert.equal(await footer.count(),1);
   result.browser.push({slug,width,javascript,approvedLogo:true,fullWidthHero:true,noOverflow:true,phoneCorrect:true});
   if(slug==='chamberi'&&javascript&&[390,1440].includes(width))await page.screenshot({path:out+`/antenistacerca-chamberi-${width}.png`});
  }
  await context.close();
 }
 result.ok=true;console.log('CERCA PUBLICADO OK: 21 distritos, 8 controles, 6 recursos, sitemap completo y 15 pruebas de navegador.');
}catch(error){result.error=error.message;process.exitCode=1;console.error(error);}
finally{if(browser)await browser.close();result.checkedAt=new Date().toISOString();fs.writeFileSync(out+'/published.json',JSON.stringify(result,null,2));}
