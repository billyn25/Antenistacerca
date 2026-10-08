import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {validateMadrid} from './add-madrid.mjs';
const rows=JSON.parse(fs.readFileSync('src/localidades.json','utf8'));
const postal=validateMadrid(JSON.parse(fs.readFileSync('src/postal-codes-madrid.json','utf8')));
const madrid=rows.filter(t=>t.provinciaSlug==='madrid');assert.equal(madrid.length,179);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const files=walk('public').filter(f=>f.endsWith('.html'));
const home=fs.readFileSync('public/index.html','utf8'),directory=fs.readFileSync('public/madrid/index.html','utf8');
const isProd=home.includes('content="index,follow');
assert.equal(rows.length,3549,'Conservar 3057 localidades anteriores y 492 municipios de Toledo y Guadalajara');assert.equal(new Set(rows.map(r=>r.provinciaSlug)).size,18,'Deben conservarse las 18 provincias');assert.equal(rows.filter(r=>r.provinciaSlug==='toledo').length,204);assert.equal(rows.filter(r=>r.provinciaSlug==='guadalajara').length,288);assert.equal(files.length,3568);assert.ok(directory.includes('id="ac-madrid-query"'));
for(const file of files){
 const h=fs.readFileSync(file,'utf8'),rel=path.relative('public',file).split(path.sep).join('/');
 assert.equal((h.match(/<h1\b/g)||[]).length,1,rel+': H1');
 const canonical=h.match(/<link rel="canonical" href="([^"]*)"/)?.[1];assert.ok(canonical?.startsWith('https://antenistacerca.es/'),rel+': canonical');
 for(const raw of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
  const graph=JSON.parse(raw[1])['@graph']||[];
  for(const node of graph)if(['WebPage','CollectionPage'].includes(node['@type']))assert.equal(node.url,canonical,rel+': url schema');
 }
 if(rel.startsWith('madrid/'))assert.ok(!/"(?:streetAddress|postalCode)"\s*:/.test(h),rel+': no inventar sedes');
 const ids=[...h.matchAll(/\bid="([^"]*)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,rel+': IDs duplicados');
}
for(const t of rows){
 const h=fs.readFileSync(`public/${t.provinciaSlug}/${t.slug}/index.html`,'utf8');
 for(const id of ['tdt','parabolicas','tdt-satelite','porteros','reparacion','telefonia-movil','reparaciones-electricas','reparacion-porteros','instalacion-videoporteros'])assert.ok(h.includes(`id="${id}"`),t.slug+': '+id);
 assert.ok(h.includes('/assets/receptor-tdt-satelite-hd.webp'),t.slug+': foto TDT-SAT');
 if(t.provinciaSlug!=='madrid'){assert.ok(!h.includes('id="codigos-postales"'));continue;}
 const codes=[...h.matchAll(/class="ac-postal-code">(\d{5})<\/span>/g)].map(x=>x[1]);
 assert.deepEqual(codes,postal.municipalities.find(r=>r.id===t.municipioId).postalCodes,t.slug+': códigos');
 assert.equal((h.match(/class="faq local-faq"/g)||[]).length,1,t.slug+': FAQ');
 assert.ok(directory.includes(`href="/madrid/${t.slug}/"`));assert.ok(home.includes(`href="/madrid/${t.slug}/"`));
}
if(isProd){const xml=fs.readFileSync('public/sitemaps/sitemap-madrid.xml','utf8');assert.equal((xml.match(/<loc>/g)||[]).length,180);assert.ok(fs.readFileSync('public/sitemap.xml','utf8').includes('/sitemaps/sitemap-madrid.xml'));}
const report={passed:true,production:isProd,madrid:madrid.length,postalCodes:296,municipalities:rows.length,provinces:new Set(rows.map(r=>r.provinciaSlug)).size,html:files.length};
fs.writeFileSync('public/madrid-seo-audit.json',JSON.stringify(report,null,2));console.log('AUDITORÍA MADRID/SEO OK:',JSON.stringify(report));
