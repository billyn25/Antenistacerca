import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with {type:'json'};
const ROOT='public',errors=[],warnings=[];
const provinces=[...new Set(localidades.map(x=>x.provinciaSlug))];
const expected=new Set(['/',...provinces.map(x=>`/${x}/`),...localidades.map(x=>`/${x.provinciaSlug}/${x.slug}/`)]);
const fileFor=url=>url==='/'?path.join(ROOT,'index.html'):path.join(ROOT,url.slice(1),'index.html');
const normHref=(href,from)=>{if(!href||href.startsWith('#')||/^(?:https?:|tel:|mailto:|whatsapp:|javascript:)/i.test(href))return null;let p=href.split(/[?#]/)[0];if(!p)return null;if(!p.startsWith('/')){const base=from==='/'?'/':from;p=path.posix.resolve(base,p)}p=p.replace(/\/index\.html$/,'/');if(!p.endsWith('/'))p+='/';return p};
const links=new Map(),incoming=new Map([...expected].map(x=>[x,0]));
for(const url of expected){const f=fileFor(url);if(!fs.existsSync(f)){errors.push(`${url}: HTML ausente`);continue}const h=fs.readFileSync(f,'utf8');const out=new Set();for(const m of h.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)){const u=normHref(m[1],url);if(!u)continue;out.add(u);if(expected.has(u))incoming.set(u,(incoming.get(u)||0)+1);else if(!u.startsWith('/assets/'))warnings.push(`${url}: enlace interno no previsto ${u}`)}links.set(url,out)}
for(const p of provinces){const u=`/${p}/`;if(!links.get('/')?.has(u))errors.push(`Portada no enlaza provincia ${u}`);const towns=localidades.filter(x=>x.provinciaSlug===p);for(const t of towns){const tu=`/${p}/${t.slug}/`;if(!links.get(u)?.has(tu))errors.push(`${u}: no enlaza directamente ${tu}`);if(!links.get(tu)?.has(u))errors.push(`${tu}: no enlaza su provincia`)}}
for(const u of expected)if(u!=='/'&&(incoming.get(u)||0)===0)errors.push(`${u}: página huérfana`);
// Profundidad desde portada mediante BFS.
const depth=new Map([['/',0]]),q=['/'];while(q.length){const u=q.shift();for(const v of links.get(u)||[]){if(!expected.has(v)||depth.has(v))continue;depth.set(v,depth.get(u)+1);q.push(v)}}
for(const u of expected){if(!depth.has(u))errors.push(`${u}: no alcanzable desde portada`);else if(depth.get(u)>2)warnings.push(`${u}: profundidad ${depth.get(u)} (>2)`)}
const townUrls=localidades.map(x=>`/${x.provinciaSlug}/${x.slug}/`),townIncoming=townUrls.map(u=>incoming.get(u)||0);const min=Math.min(...townIncoming),max=Math.max(...townIncoming),avg=townIncoming.reduce((a,b)=>a+b,0)/townIncoming.length;
const E=[...new Set(errors)],W=[...new Set(warnings)];if(W.length){console.warn(`ENLACES AVISOS (${W.length})`);for(const w of W.slice(0,100))console.warn('- '+w)}if(E.length){console.error(`ENLACES FALLIDO (${E.length})`);for(const e of E.slice(0,200))console.error('- '+e);process.exit(2)}console.log(`ENLACES OK: ${expected.size} páginas alcanzables; provincias a 1 clic y localidades a <=2 clics desde portada. Enlaces entrantes por localidad min=${min}, media=${avg.toFixed(1)}, max=${max}.`);
