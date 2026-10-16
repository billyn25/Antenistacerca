import test from 'node:test';
import assert from 'node:assert/strict';
import {services,serviceRoute,enrichExisting,servicePage,metadata,extendSitemap,CITY,VERSION,PHONE} from '../scripts/madrid-seo-boost.mjs';
import {madridDistricts} from '../src/madrid-districts.mjs';
const origin='https://antenistacerca.es';
function fixture(route=CITY,mode='index,follow'){
 const p='Descripción de partida';
 const graph={'@context':'https://schema.org','@graph':[{'@type':'WebPage',url:origin+route,name:'Antiguo',description:p},{'@type':'BreadcrumbList',itemListElement:[]}]};
 return `<!doctype html><html lang="es"><head><title>Antiguo</title><meta name="description" content="${p}"><meta name="robots" content="${mode}"><meta property="og:title" content="Antiguo"><meta property="og:url" content="${origin+route}"><link rel="canonical" href="${origin+route}"><link rel="stylesheet" href="/assets/shared-ui.css"><script type="application/ld+json">${JSON.stringify(graph)}</script><script src="/assets/cookies.js" defer></script></head><body><header><a class="brand ac-brand-logo" href="/"><img class="brand-logo" src="/assets/logo-antenista-cerca-v1.webp" alt="Antenista Cerca"></a><a href="tel:+34641589394">641 589 394</a></header><main><section class="hero ac-hero-full"><div class="hero-copy"><h1>Antenista en Madrid</h1><h2>Subtítulo</h2><ul class="checks"><li>Uno</li></ul><a href="tel:+34641589394">Llamar</a></div><img src="/assets/hero-antenista-panorama.webp" alt="Principal"></section>${['servicios','reparacion','tdt','parabolicas','porteros','zona','faq','contacto'].map(id=>`<section id="${id}"><div><h2>${id}</h2><p>Contenido que se conserva: ${id}.</p><a href="tel:+34641589394">Llamar</a></div></section>`).join('')}</main><footer><a href="tel:+34641589394">Norte</a><a href="tel:+34614789945">Centro</a><a href="#politica">Cookies</a></footer><aside id="politica">Información de cookies</aside><script>window.existingConsent='untouched';</script></body></html>`;
}
const get=(html,re)=>html.match(re)?.[0];
const graph=html=>JSON.parse(html.match(/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const ids=html=>[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
test('six distinct useful services, no invented reviews or mass service-town combinations',()=>{
 assert.equal(services.length,6);assert.equal(new Set(services.map(serviceRoute)).size,6);
 assert.equal(new Set(services.map(s=>s.title)).size,6);
 for(const s of services){assert.ok(s.sections.length>=5);assert.ok(s.questions.length>=3);assert.match(s.description,/614 78 99 45/);for(const r of s.related)assert.ok(services.some(x=>x.slug===r));assert.doesNotMatch(JSON.stringify(s),/cinco estrellas|llegamos en \d|oficina en|clientes satisfechos/i);}
});
test('capital preserves canonical robots photos header footer and consent scripts',()=>{
 const before=fixture(),after=enrichExisting(before,{route:CITY,name:'Madrid',kind:'city'},origin);
 for(const re of [/<link rel="canonical"[^>]*>/,/<meta name="robots"[^>]*>/,/<header>[\s\S]*?<\/header>/,/<footer>[\s\S]*?<\/footer>/,/<script>window[\s\S]*?<\/script>/])assert.equal(get(after,re),get(before,re));
 assert.deepEqual([...after.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]),[...before.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]));
 assert.equal((after.match(/<h1>/g)||[]).length,1);
 assert.equal(ids(after).length,new Set(ids(after)).size);
 assert.match(after,/Antenista en Madrid \| Antenas y porteros/);
 for(const d of madridDistricts)assert.ok(after.includes(`href="${d.route}"`));
 for(const s of services)assert.ok(after.includes(`href="${serviceRoute(s)}"`));
 assert.equal(enrichExisting(after,{route:CITY,kind:'city'},origin),after);
});
test('all district pages have capital breadcrumbs without replacing their local page',()=>{
 for(const d of madridDistricts){const before=fixture(d.route),after=enrichExisting(before,{route:d.route,name:d.name,kind:'district'},origin);
 assert.ok(after.includes(`<h1>Antenista en ${d.name}, Madrid</h1>`));
 assert.ok(after.includes('href="'+CITY+'"'));
 const crumb=graph(after).find(n=>n['@type']==='BreadcrumbList');assert.equal(crumb.itemListElement.length,4);assert.equal(crumb.itemListElement[3].item,origin+d.route);
 assert.equal(get(after,/<link rel="canonical"[^>]*>/),get(before,/<link rel="canonical"[^>]*>/));assert.equal(ids(after).length,new Set(ids(after)).size);}
});
test('municipal enrichment is limited to useful service links, not new fake local paragraphs',()=>{
 const before=fixture('/madrid/ajalvir/'),after=enrichExisting(before,{route:'/madrid/ajalvir/',name:'Ajalvir',kind:'town'},origin);
 assert.equal(get(after,/<title>[\s\S]*?<\/title>/),get(before,/<title>[\s\S]*?<\/title>/));
 assert.equal((after.match(/data-madrid-service-links=/g)||[]).length,4);
 for(const s of services)assert.ok(after.includes(`href="${serviceRoute(s)}"`));
});
test('province and capital are distinguished; province retains its complete directory',()=>{
 const before=fixture('/madrid/').replace('<main>','<main><!-- PROVINCE-HUB-START -->');
 const after=enrichExisting(before,{route:'/madrid/',kind:'province'},origin);
 assert.ok(after.includes('<h1>Antenistas en la Comunidad de Madrid</h1>'));assert.ok(after.includes('href="'+CITY+'"'));assert.ok(after.includes('href="tel:+34614789945"'));assert.ok(after.includes('<!-- PROVINCE-HUB-START -->'));
});
test('home gets useful Madrid paths without changing the north telephone or other regions',()=>{
 const before=fixture('/'),after=enrichExisting(before,{route:'/',kind:'home'},origin);
 assert.equal(get(after,/<header>[\s\S]*?<\/header>/),get(before,/<header>[\s\S]*?<\/header>/));
 assert.ok(after.includes('id="servicio-madrid"'));assert.equal((after.match(/<h1>/g)||[]).length,1);
});
test('metadata stays synchronized in title OG and JSON-LD',()=>{
 const after=metadata(fixture(),'Título & servicio','Descripción & detalle');
 assert.ok(after.includes('<title>Título &amp; servicio</title>'));
 const item=graph(after).find(n=>n['@type']==='WebPage');assert.equal(item.name,'Título & servicio');assert.equal(item.description,'Descripción & detalle');
});
test('six guide pages have correct distinct canonicals schema and no inherited capital FAQ',()=>{
 for(const s of services){const result=servicePage(fixture(),s,origin),url=origin+serviceRoute(s);
 assert.ok(result.includes(`<link rel="canonical" href="${url}">`));assert.ok(result.includes(`<h1>${s.title}</h1>`));
 assert.equal(ids(result).length,new Set(ids(result)).size);assert.equal((result.match(/<h1>/g)||[]).length,1);
 const service=graph(result).find(n=>n['@type']==='Service');assert.equal(service.url,url);assert.equal(service.telephone,'+34614789945');assert.equal(service.name,s.title);
 assert.ok(!JSON.stringify(graph(result)).includes('AggregateRating'));assert.ok(!JSON.stringify(graph(result)).includes('streetAddress'));
 for(const id of ['servicios','zona','faq','contacto'])assert.ok(ids(result).includes(id));
 assert.equal(get(result,/<footer>[\s\S]*?<\/footer>/),get(fixture(),/<footer>[\s\S]*?<\/footer>/));
 }
});
test('previews keep noindex, and contact content never enables tracking',()=>{
 for(const s of services){const result=servicePage(fixture(CITY,'noindex,follow'),s,origin);assert.ok(result.includes('<meta name="robots" content="noindex,follow">'));assert.ok(result.includes("window.existingConsent='untouched';"));}
});
test('only six new sitemap URLs, existing URLs remain and indices cannot be overwritten',()=>{
 const old=origin+CITY,xml=`<urlset><url><loc>${old}</loc></url></urlset>`,urls=services.map(s=>origin+serviceRoute(s));
 const next=extendSitemap(xml,urls);assert.equal((next.match(/<loc>/g)||[]).length,7);assert.ok(next.includes(`<loc>${old}</loc>`));assert.equal((extendSitemap(next,urls).match(/<loc>/g)||[]).length,7);
 assert.throws(()=>extendSitemap('<sitemapindex></sitemapindex>',urls));assert.throws(()=>extendSitemap(xml.replace('</urlset>',`<url><loc>${old}</loc></url></urlset>`),urls));
});
test('unexpected templates fail before producing incomplete service navigation',()=>{
 assert.throws(()=>enrichExisting(fixture().replace('id="parabolicas"','id="other"'),{route:CITY,kind:'city'},origin));
 assert.throws(()=>servicePage(fixture().replace('<section class="hero ac-hero-full">','<section class="wrong">'),services[0],origin));
});
