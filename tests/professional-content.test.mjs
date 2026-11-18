import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import test from 'node:test';
import assert from 'node:assert/strict';
import {RF,TV,keyOf,plan,frequencies,updateSitemapDates} from '../professional-content.mjs';
import {families} from '../content/professional-services.mjs';
const towns=JSON.parse(fs.readFileSync('src/localidades.json','utf8'));
test('asignación TDT completa y única; las áreas cruzan límites provinciales',()=>{
 assert.equal(Object.keys(RF.municipalities).length,towns.length);
 assert.equal(new Set(Object.values(RF.municipalities).map(a=>a.ine)).size,towns.length);
 assert.equal(RF.municipalities['alava/amurrio'].area,'bizkaiaeste');
 for(const d of towns){const a=RF.municipalities[keyOf(d)];assert.ok(a);assert.ok(RF.areas[a.area]);}
 for(const a of Object.values(RF.areas))for(const ch of Object.values(a.channels))assert.ok(ch>=21&&ch<=48);
 assert.deepEqual(TV.muxes.MPE2.examples,['Antena 3 HD','laSexta HD','Neox HD','Nova HD','Atreseries HD']);
});

test('TDT actualizada: los traslados de noviembre no mantienen cadenas en el múltiple anterior',()=>{
 const expected={'Clan HD':'RGE1','Atreseries HD':'MPE2','Be Mad HD':'MPE3','DKISS HD':'MPE5','La Séptima HD':'MPE5'};
 for(const [channel,mux] of Object.entries(expected)){
  const matches=Object.entries(TV.muxes).filter(([,group])=>group.examples.includes(channel)).map(([key])=>key);
  assert.deepEqual(matches,[mux],channel);
 }
 assert.deepEqual(TV.muxes.RGE2.examples,['La 1 UHD','La 2 UHD','Antena 3 UHD','Telecinco UHD']);
 assert.doesNotMatch(JSON.stringify(TV),/antes de la reorganización|tiene anunciado|está(?:n)? previsto|2014-10-21_Configuracion/i);
});

test('TDT actualizada: las fichas muestran ayuda vigente y conservan los canales UHF de su área',()=>{
 const samples=[{provinciaSlug:'bizkaia',slug:'bilbao',localidad:'Bilbao'},{provinciaSlug:'gipuzkoa',slug:'deba',localidad:'Deba'}];
 const rendered=samples.map(d=>{
  const html=frequencies(d);
  const area=RF.areas[RF.municipalities[keyOf(d)].area];
  const cards=[...html.matchAll(/class="ac-pro-tag">(RGE[12]|MPE[1-5]) · UHF (\d+) · (\d+) MHz/g)];
  assert.equal(cards.length,2);
  for(const [,mux,uhf,mhz] of cards){assert.equal(Number(uhf),area.channels[mux]);assert.equal(Number(mhz),474+8*(area.channels[mux]-21));}
  assert.ok(html.includes(TV.reviewed.split('-').reverse().join('/')));
  assert.ok(html.includes(TV.sources.operators));
  assert.ok(html.includes(TV.sources.changes));
  assert.ok(html.includes(TV.sources.rtve_uhd));
  assert.match(html,/la reorganización no exige cambiar la antena/);
  assert.doesNotMatch(html,/antes de los cambios|movimientos anunciados para noviembre|undefined/i);
  return html;
 }).join('\n');
 assert.match(rendered,/DVB-T2 y vídeo UHD con HEVC\/H\.265/);
 assert.match(rendered,/DKISS HD, Real Madrid TV, TEN, La Séptima HD/);
});

test('TDT actualizada: lastmod distingue la edición de cadenas, conserva fechas posteriores y es idempotente',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'antenistacerca-tdt-'));
 const base='https://antenistacerca.es/';
 const town=base+keyOf(towns[0])+'/';
 const newerTown=base+keyOf(towns[1])+'/';
 const province=base+towns[0].provinciaSlug+'/';
 const url=(loc,date)=>`<url><loc>${loc}</loc>${date?'<lastmod>'+date+'</lastmod>':''}</url>`;
 const main=path.join(root,'sitemap.xml');
 const child=path.join(root,'sitemaps','sitemap-test.xml');
 try{
  fs.mkdirSync(path.dirname(child));
  fs.writeFileSync(main,'<urlset>'+url(base,'2026-10-21')+url(town)+url(base+'pagina-no-editada/','2026-10-01')+'</urlset>');
  fs.writeFileSync(child,'<urlset>'+url(province,'2026-10-21')+url(newerTown,'2026-11-20T09:00:00+01:00')+'</urlset>');
  updateSitemapDates(root);
  const firstMain=fs.readFileSync(main,'utf8');
  const firstChild=fs.readFileSync(child,'utf8');
  assert.ok(firstMain.includes(url(base,'2026-10-21')));
  assert.ok(firstMain.includes(url(town,TV.reviewed)));
  assert.ok(firstMain.includes(url(base+'pagina-no-editada/','2026-10-01')));
  assert.ok(firstChild.includes(url(province,TV.reviewed)));
  assert.ok(firstChild.includes(url(newerTown,'2026-11-20T09:00:00+01:00')));
  updateSitemapDates(root);
  assert.equal(fs.readFileSync(main,'utf8'),firstMain);
  assert.equal(fs.readFileSync(child,'utf8'),firstChild);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
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

test('sitemap con fecha editorial real para páginas ampliadas',()=>{const xml=fs.readFileSync(fs.existsSync('public/sitemaps/sitemap-bizkaia.xml')?'public/sitemaps/sitemap-bizkaia.xml':'public/sitemap.xml','utf8');assert.ok(xml.includes('<loc>https://antenistacerca.es/bizkaia/bilbao/</loc><lastmod>'+TV.reviewed+'</lastmod>'));});
