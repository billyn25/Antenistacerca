import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {transform,auditHtml,region} from '../scripts/regional-contact.mjs';
const fixture='<html><head><title>Servicio</title><link rel="canonical" href="https://antenistacerca.es/burgos/"><meta name="robots" content="index,follow"></head><body><main><h1>Servicio</h1></main><footer><a href="tel:+34641589394">Llamar</a><details id="ac-service-info"><summary>Información</summary><p>Teléfono: <a href="tel:+34641589394">641 589 394</a>.</p></details><details id="ac-privacy-info"><summary>Privacidad</summary><p>Contacto por <a href="https://wa.me/34641589394">WhatsApp</a>.</p></details></footer></body></html>';
test('contactos legales permanecen completos y corresponden a cada zona',()=>{
 for(const route of ['/burgos/','/bizkaia/bilbao/','/madrid/']){
  const result=transform(fixture,route);auditHtml(result,route);
  const phone=region(route)?'614 78 99 45':'641 589 394';
  assert(result.includes('>'+phone+'</a>.</p></details>'));
  assert(result.includes('>WhatsApp</a>.</p></details>'));
  assert.equal(transform(result,route),result);
 }
});
test('las imágenes compartidas no afirman estar tomadas en cada municipio',()=>{
 const template=fs.readFileSync('src/template.html','utf8');
 assert(!template.includes('Zona urbana de {{LOCALIDAD}}'));
 assert(!template.includes('Técnico trabajando en una antena en {{LOCALIDAD}}'));
});
