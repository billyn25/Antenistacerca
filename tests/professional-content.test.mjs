import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {RF,TV,keyOf,plan} from '../professional-content.mjs';
import {families} from '../content/professional-services.mjs';
const towns=JSON.parse(fs.readFileSync('src/localidades.json','utf8'));
test('asignación TDT completa y única; las áreas cruzan límites provinciales',()=>{
 assert.equal(Object.keys(RF.municipalities).length,towns.length);
 assert.equal(new Set(Object.values(RF.municipalities).map(a=>a.ine)).size,towns.length);
 assert.equal(RF.municipalities['alava/amurrio'].area,'bizkaiaeste');
 for(const d of towns){const a=RF.municipalities[keyOf(d)];assert.ok(a);assert.ok(RF.areas[a.area]);}
 for(const a of Object.values(RF.areas))for(const ch of Object.values(a.channels))assert.ok(ch>=21&&ch<=48);
 assert.deepEqual(TV.muxes.MPE2.examples,['Antena 3 HD','laSexta HD','Neox HD','Nova HD']);
});
test('casos usados sin duplicar familias; salida después de los servicios y referencias correctas',()=>{
 const used=new Set();
 for(const d of towns){const p=plan(d);assert.equal(new Set(p.map(x=>x.family.id)).size,2);p.forEach(x=>used.add(x.case[0]));const h=fs.readFileSync(`public/${keyOf(d)}/index.html`,'utf8');assert.equal(h.split('data-professional="v1"').length-1,1,keyOf(d));assert.ok(h.indexOf('id="reparaciones-electricas"')<h.indexOf('id="soluciones-profesionales"'));assert.ok(h.indexOf('id="soluciones-profesionales"')<h.indexOf('id="canales-tdt"'));assert.ok(h.includes('data-rf-area="'+RF.municipalities[keyOf(d)].area+'"'));const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,keyOf(d));}
 for(const f of families)for(const c of f.cases)assert.ok(used.has(c[0]),c[0]);
});
test('obra nueva identifica competencia profesional y las fuentes existen en la portada',()=>{
 const h=fs.readFileSync('public/index.html','utf8');assert.ok(h.includes('titulado con competencias'));assert.ok(h.includes('honorarios antes del encargo'));for(const f of families)assert.ok(h.includes('id="'+f.id+'"'));
});

test('ilustración local disponible y sin dependencias de imágenes externas',()=>{const s=fs.readFileSync('public/assets/soluciones-profesionales.svg','utf8');assert.ok(s.includes('viewBox="0 0 640 320"'));assert.ok(!/https?:\/\/(?!www.w3.org)/.test(s));});

test('sitemap con fecha editorial real para páginas ampliadas',()=>{const xml=fs.readFileSync(fs.existsSync('public/sitemaps/sitemap-bizkaia.xml')?'public/sitemaps/sitemap-bizkaia.xml':'public/sitemap.xml','utf8');assert.ok(/<loc>https:\/\/antenistacerca.es\/bizkaia\/bilbao\/<\/loc><lastmod>2026-10-21<\/lastmod>/.test(xml));});
