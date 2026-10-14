import fs from 'node:fs';
import {madridDistricts} from './src/madrid-districts.mjs';

const DOMAIN='https://antenistacerca.es';
const provinces=['alava','asturias','bizkaia','burgos','cantabria','gipuzkoa','guadalajara','la-rioja','leon','madrid','navarra','palencia','salamanca','segovia','soria','toledo','valladolid','zamora'].sort();
const EXPECTED_INDEXABLE=3589;
const errors=[],checks=[];
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const check=async(name,fn)=>{try{await fn();checks.push(name);console.log('OK',name)}catch(e){errors.push({name,error:e.message});console.error('ERROR',name,e.message)}};
const request=async(url,redirect='manual')=>fetch(url,{redirect,signal:AbortSignal.timeout(15000),headers:{'user-agent':'AntenistaCerca-LiveSEO/1.0'}});
const locs=xml=>[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&'));
const read200=async url=>{const r=await request(url);assert(r.status===200,url+' HTTP '+r.status);assert(!/noindex/i.test(r.headers.get('x-robots-tag')||''),url+' X-Robots noindex');return r.text()};
await check('robots.txt',async()=>{const s=await read200(DOMAIN+'/robots.txt');assert(s.includes('Sitemap: '+DOMAIN+'/sitemap.xml'),'sitemap ausente');assert(!/^Disallow:\s*\/$/mi.test(s),'robots bloquea todo')});
const expectedChildren=[DOMAIN+'/sitemaps/sitemap-core.xml',...provinces.map(p=>DOMAIN+'/sitemaps/sitemap-'+p+'.xml')];
await check('índice sitemap',async()=>{const urls=locs(await read200(DOMAIN+'/sitemap.xml'));assert(urls.length===expectedChildren.length,'hijos '+urls.length+'/'+expectedChildren.length);for(const u of expectedChildren)assert(urls.includes(u),'falta '+u)});
let all=[];
for(const p of provinces)await check('sitemap '+p,async()=>{
 const urls=locs(await read200(DOMAIN+'/sitemaps/sitemap-'+p+'.xml'));
 assert(urls.length>1+(p==='madrid'?madridDistricts.length:0),'Sitemap provincial incompleto: '+urls.length);
 assert(urls.includes(DOMAIN+'/'+p+'/'),'falta hub');
 all.push(...urls);
});
await check('sitemap core',async()=>{const urls=locs(await read200(DOMAIN+'/sitemaps/sitemap-core.xml'));assert(urls.length===1&&urls[0]===DOMAIN+'/','core incorrecto');all.push(...urls)});
await check('cobertura y URLs únicas',async()=>{assert(all.length===EXPECTED_INDEXABLE,'total '+all.length+'/'+EXPECTED_INDEXABLE);assert(new Set(all).size===all.length,'duplicadas');assert(all.every(u=>u.startsWith(DOMAIN+'/')),'host erróneo')});
const samples=[DOMAIN+'/',...provinces.map(p=>DOMAIN+'/'+p+'/')];
for(const p of provinces){
 const urls=all.filter(u=>new URL(u).pathname.startsWith('/'+p+'/')&&new URL(u).pathname!=='/'+p+'/');
 for(const u of [urls[0],urls[Math.floor(urls.length/2)],urls.at(-1)].filter(Boolean))samples.push(u);
}
for(const d of [madridDistricts[0],madridDistricts.find(x=>x.slug==='vicalvaro'),madridDistricts.find(x=>x.slug==='san-blas-canillejas')].filter(Boolean))samples.push(DOMAIN+d.route);
for(const url of [...new Set(samples)])await check('canonical '+new URL(url).pathname,async()=>{
 const html=await read200(url);
 assert(/<meta\s+name=["']robots["']\s+content=["']index,follow/i.test(html),'meta robots noindex o ausente');
 const canon=[...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/gi)].map(x=>x[1]);
 assert(canon.length===1&&canon[0]===url,'canonical '+canon.join(','));
});
for(const url of ['https://www.antenistacerca.es/','http://antenistacerca.es/','https://antenistacerca.es/index.html'])await check('alias '+url,async()=>{
 const r=await request(url);assert([301,308].includes(r.status),'HTTP '+r.status);
 const dest=new URL(r.headers.get('location'),url);
 assert(dest.origin===DOMAIN,'destino fuera del host '+dest.href);
});
const report={timestamp:new Date().toISOString(),domain:DOMAIN,expectedIndexable:EXPECTED_INDEXABLE,passed:checks.length,failed:errors.length,errors};
fs.writeFileSync('antenistacerca-live-seo-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
