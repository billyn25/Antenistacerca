import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateMadrid,madridRows,addMadrid} from '../add-madrid.mjs';
import {enrichTown,postalBlock,improveServiceContent,syncMetadata,directory} from '../madrid-seo.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../src/postal-codes-madrid.json',import.meta.url),'utf8'));
const rows=madridRows(data);
test('179 municipios e identificadores únicos y 296 códigos contrastados',()=>{
 validateMadrid(data);assert.equal(rows.length,179);assert.equal(new Set(rows.flatMap(t=>t.postalCodes)).size,296);
 for(const t of rows){assert.ok(!t.cercanas.includes(t.localidad));for(const n of t.cercanas)assert.ok(rows.some(x=>x.localidad===n));}
});
test('adición idempotente, otras provincias intactas',()=>{
 const old=[{provinciaSlug:'bizkaia',slug:'galdakao',localidad:'Galdakao'}];const once=addMadrid(old,data);
 assert.deepEqual(addMadrid(once,data),once);assert.deepEqual(once[0],old[0]);assert.equal(once.length,180);
});
test('la inserción postal conserva FAQ y contactos en todos los municipios',()=>{
 for(const t of rows){
  const faq='<section class="faq local-faq"><div class="wrap"><h2>Preguntas</h2><details><summary>Duda</summary><p>Respuesta</p></details></div></section>';
  const h=`<html><head></head><body><main>${faq}<section id="contacto">641 589 394</section></main></body></html>`;
  const after=enrichTown(h,t,data);assert.equal(after.replace(postalBlock(t,data),''),h);
  for(const c of t.postalCodes)assert.ok(after.includes(`>${c}</span>`));
 }
});
test('no códigos fuera de Madrid ni doble inserción',()=>{
 const h='<section class="faq local-faq"></section>',t=rows[0];assert.equal(enrichTown(h,{provinciaSlug:'bizkaia'},data),h);
 assert.throws(()=>enrichTown(enrichTown(h,t,data),t,data),/insertado/);
});
test('servicios de porteros y videoporteros diferenciados',()=>{
 const h='<section id="porteros"><div class="old-doorphones"><p>Se conserva</p></div></section>';
 const after=improveServiceContent(h,{localidad:'Coslada',slug:'coslada'});
 for(const txt of ['Reparación de porteros automáticos en Coslada','Instalación de videoporteros en Coslada','<p>Se conserva</p>'])assert.ok(after.includes(txt));
});
test('sincronización de metadatos e identidad; botones sin texto pegado',()=>{
 const h='<head><title>Título &amp; prueba</title><meta name="description" content="Descripción"><link rel="canonical" href="https://antenistacerca.es/madrid/coslada/"><script type="application/ld+json">{"@graph":[{"@type":"WebPage","name":"Viejo"}]}</script></head><div class="mobilebar"><a href="tel:+34641589394">641 589 394</a><a href="https://wa.me/34641589394">WhatsApp</a></div>';
 const after=syncMetadata(h);const graph=JSON.parse(after.match(/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 assert.equal(graph[0].name,'Título & prueba');assert.equal(graph[0].description,'Descripción');assert.equal(graph[1].name,'Antenista Cerca');
 assert.ok(after.includes('data-nosnippet'));assert.ok(after.includes('</a> <a'));assert.ok(!after.includes('streetAddress'));assert.equal(syncMetadata(after),after);
});
test('producción y previews separados en Netlify',()=>{
 const toml=fs.readFileSync(new URL('../netlify.toml',import.meta.url),'utf8');
 assert.match(toml,/\[context.production\][\s\S]*?command = "npm run build:prod"/);
 for(const c of ['deploy-preview','branch-deploy'])assert.ok(toml.includes(`[context.${c}]\n  command = "npm run build"`));
});

test('Madrid conserva accesos rápidos y convierte solo los enlaces alfabéticos',()=>{
 const t={slug:'madrid',localidad:'Madrid',postalCodes:['28001']};
 const link='<a href="/madrid/madrid/">Antenista en Madrid</a>';
 const h='<html><head></head><body><nav class="province-quick">'+link+'</nav><nav class="alpha-nav">A</nav><section class="alpha-localities">'+link+'</section><!-- PROVINCE-HUB-END --></body></html>';
 const result=directory(h,[t],{checkedOn:'2026-10-02'});
 assert.equal((result.match(/class="ac-madrid-result"/g)||[]).length,1);
 assert.ok(result.includes('<nav class="province-quick">'+link+'</nav>'));
 assert.ok(result.includes('data-madrid-search="Madrid 28001"'));
 assert.ok(result.includes('Códigos postales: 28001'));
});
