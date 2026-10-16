/** Read-only verification of the deployed Madrid upgrade; no contact submissions. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {VERSION,CITY,services,serviceRoute,CSS_PATH,CSS} from '../scripts/madrid-seo-boost.mjs';
import {madridDistricts} from '../src/madrid-districts.mjs';
const origin='https://antenistacerca.es',out='.cache/madrid-seo-live';
const report={origin,branch:'refactor-limpieza-segura',commit:process.env.GITHUB_SHA||null,version:VERSION,pages:[],browser:[],ok:false};
fs.mkdirSync(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function read(route){const r=await fetch(origin+route,{redirect:'manual',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});assert.equal(r.status,200,route+': HTTP '+r.status);return {r,html:await r.text()};}
let browser;
try{
 let ready=false;
 for(let attempt=0;attempt<36;attempt++){
  try{const {html}=await read(CITY);assert.ok(html.includes(`data-ac-madrid-seo="${VERSION}"`));assert.ok(html.includes(CSS_PATH));await read(serviceRoute(services[0]));ready=true;break;}
  catch(e){report.lastObservation=e.message;console.log('Esperando publicación Madrid:',attempt+1,e.message);if(attempt<35)await pause(5000);}
 }
 assert.ok(ready,'No se ha confirmado la versión de Madrid en producción');
 const list=['/','/madrid/',CITY,...madridDistricts.map(d=>d.route),...services.map(serviceRoute),'/madrid/ajalvir/','/madrid/alcala-de-henares/'];
 for(const route of list){
  const {r,html}=await read(route),local=fs.readFileSync('public'+route+'index.html','utf8');
  assert.ok(html.includes(`data-ac-madrid-seo="${VERSION}"`),route+': versión antigua');
  for(const re of [/<title>[\s\S]*?<\/title>/,/<meta name="description"[^>]*>/,/<link rel="canonical"[^>]*>/,/<meta name="robots"[^>]*>/])assert.equal(html.match(re)?.[0],local.match(re)?.[0],route+': metadata distinta');
  assert.ok(!/noindex/i.test(r.headers.get('x-robots-tag')||''));assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html));
  assert.equal((html.match(/<h1\b/g)||[]).length,1,route+': H1');
  if(route===CITY){for(const d of madridDistricts)assert.ok(html.includes(`href="${d.route}"`));}
  if(route!=='/'&&!route.includes('/servicios/'))for(const s of services)assert.ok(html.includes(`href="${serviceRoute(s)}"`));
  report.pages.push({url:origin+route,status:r.status,metadata:true,indexable:true,links:true,ok:true});
 }
 const {html:map}=await read('/sitemaps/sitemap-madrid.xml');
 const urls=[...map.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.equal(urls.length,207);assert.equal(new Set(urls).size,207);
 for(const s of services)assert.ok(urls.includes(origin+serviceRoute(s)));
 report.sitemap={url:origin+'/sitemaps/sitemap-madrid.xml',urls:207,existing:201,newServices:6};
 const {html:css}=await read(CSS_PATH);assert.equal(css,CSS,'CSS publicado diferente');
 browser=await chromium.launch({headless:true});
 for(const [width,javascript] of [[320,true],[390,true],[768,true],[1440,true],[390,false]]){
  const context=await browser.newContext({viewport:{width,height:1000},javaScriptEnabled:javascript}),page=await context.newPage();
  for(const route of [CITY,'/madrid/chamberi/',serviceRoute(services[0])]){
   await page.goto(origin+route,{waitUntil:'load',timeout:45000});
   const logo=page.locator('header .ac-brand-logo img');assert.equal(await logo.count(),1);assert.ok(await logo.isVisible());
   assert.equal(await page.locator('header .hcontact a.tel').getAttribute('href'),'tel:+34614789945');
   const dimensions=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.ok(dimensions.scroll<=dimensions.width+1,route+': desbordamiento '+width);
   if(route===CITY){const nav=page.locator('#madrid-distritos nav');await nav.scrollIntoViewIfNeeded();assert.ok(await nav.isVisible(),'Directorio debe verse sin JS y en móvil');assert.equal(await nav.locator('a').count(),21);}
   if(javascript&&route===CITY){
    const trackers=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name).filter(url=>/googletagmanager\.com|google-analytics\.com/.test(url)));
    assert.deepEqual(trackers,[],'No activar analítica antes del consentimiento');
   }
   report.browser.push({route,width,javascript,noOverflow:true,correctPhone:true,logoVisible:true});
   if(route===CITY&&javascript&&[390,1440].includes(width)){
    await page.locator('#madrid-capital-servicio').screenshot({path:out+`/madrid-contenido-${width}.png`});
    await page.locator('#madrid-distritos').screenshot({path:out+`/madrid-distritos-${width}.png`});
   }
  }
  await context.close();
 }
 report.ok=true;console.log('MADRID SEO PUBLICADO OK:',report.pages.length,'URLs comprobadas, sitemap 207 y',report.browser.length,'pruebas de navegador.');
}catch(e){report.error=e.message;process.exitCode=1;console.error(e);}
finally{if(browser)await browser.close();report.checkedAt=new Date().toISOString();fs.writeFileSync(out+'/published.json',JSON.stringify(report,null,2));}
