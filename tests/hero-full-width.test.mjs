import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { transformHero, validateAsset, main, CSS, WIDTH, HEIGHT } from '../hero-full-width.js';

export const fixture = (town=false,name='Amurrio') => `<!doctype html><html lang="es"><head><title>${name}</title><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><link rel="canonical" href="https://antenistacerca.es/${town?'alava/amurrio/':''}"></head><body><header>ANTENISTA CERCA</header><main><section class="hero"><div class="${town?'wrap hero-grid':'w hg'}"><div class="${town?'hero-copy':'copy'}"><div class="kicker">Hoy estamos cerca de tu casa</div><div class="urgent">Urgencias 24 horas</div><h1>${town?`Antenista en ${name}`:'Antenista cerca de tu vivienda'}</h1><h2>Técnico en instalación, reparación y mantenimiento de antenas, porteros automáticos y videoporteros</h2><ul class="checks"><li>Averías y falta de señal</li><li>Antenas TDT y parabólicas</li><li>Porteros automáticos y videoporteros</li><li>Viviendas, comunidades y negocios</li></ul><div class="actions"><a class="btn red" href="tel:+34641589394">☎ 641 589 394<small>Llamar ahora</small></a><a class="btn green" href="https://wa.me/34641589394">WhatsApp<small>Escríbenos</small></a></div></div><div class="${town?'hero-photo':'heroimg'}"><img src="/.netlify/images?url=/assets/hero-antennista.png&amp;w=1280&amp;q=80" loading="eager" width="1226" height="1283" alt="Técnico de antenas trabajando"></div></div></section><section id="servicios"><h2>Servicios</h2><a href="/alava/">Álava</a></section></main><footer>641 589 394</footer><script id="antenistacerca-conversions">window.gaTest='G-W8L23NJLP6';</script></body></html>`;
const asset=new URL('../src/assets/hero-antenista-panorama.webp',import.meta.url);
const hasAsset=fs.existsSync(asset);

test('foto aprobada completa', {skip:!hasAsset},()=>assert.equal(validateAsset(asset),fs.statSync(asset).size));
test('portada: mantiene contenido exterior, metadata y un H1',()=>{
 const before=fixture(),after=transformHero(before);
 assert.ok(after.includes('class="hero ac-hero-full"'));assert.ok(after.includes('sizes="100vw"'));
 assert.ok(after.includes(`width="${WIDTH}"`));assert.ok(after.includes(`height="${HEIGHT}"`));
 assert.ok(!after.includes('hero-antennista.png'));
 assert.equal(after.split('<section id="servicios">')[1],before.split('<section id="servicios">')[1]);
 assert.ok(after.includes('<title>Amurrio</title>'));assert.equal((after.match(/<h1>/g)||[]).length,1);
});
test('localidad: conserva textos, teléfono, WhatsApp y prioridad',()=>{
 const after=transformHero(fixture(true));for(const text of ['Antenista en Amurrio','href="https://wa.me/34641589394"','href="tel:+34641589394"','loading="eager"','fetchpriority="high"'])assert.ok(after.includes(text));
});
test('idempotencia sin duplicar CSS',()=>{const once=transformHero(fixture());assert.equal(transformHero(once),once)});
test('localidad larga conserva el nombre exacto',()=>{
 const name='Villarcayo de Merindad de Castilla la Vieja';assert.ok(transformHero(fixture(true,name)).includes(`<h1>Antenista en ${name}</h1>`));
});
test('estructura inválida bloqueada',()=>assert.throws(()=>transformHero('<html><head></head><body></body></html>'),/una sección/));
test('imagen truncada bloqueada', {skip:!hasAsset},()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hero-corrupt-'));try{const p=path.join(dir,'broken.webp');fs.writeFileSync(p,fs.readFileSync(asset).subarray(0,7527));assert.throws(()=>validateAsset(p),/incompleto/)}finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('sin foto mantiene la web anterior intacta',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hero-pending-'));try{fs.writeFileSync(path.join(dir,'index.html'),fixture());assert.equal(main(dir).status,'pending');assert.equal(fs.readFileSync(path.join(dir,'index.html'),'utf8'),fixture())}finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('portada y pueblos actualizados; provincia intacta', {skip:!hasAsset},()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hero-active-'));try{
 fs.mkdirSync(path.join(dir,'assets'));fs.copyFileSync(asset,path.join(dir,'assets/hero-antenista-panorama.webp'));
 const data=[{provinciaSlug:'alava',slug:'amurrio'},{provinciaSlug:'alava',slug:'agurain'}];
 fs.writeFileSync(path.join(dir,'data.json'),JSON.stringify(data));fs.writeFileSync(path.join(dir,'index.html'),fixture());fs.mkdirSync(path.join(dir,'alava'));
 fs.writeFileSync(path.join(dir,'alava/index.html'),'PROVINCIA CON ABECEDARIO');
 for(const d of data){fs.mkdirSync(path.join(dir,'alava',d.slug));fs.writeFileSync(path.join(dir,'alava',d.slug,'index.html'),fixture(true))}
 assert.equal(main(dir,path.join(dir,'data.json')).pages,3);assert.equal(fs.readFileSync(path.join(dir,'alava/index.html'),'utf8'),'PROVINCIA CON ABECEDARIO');
 assert.equal(fs.readFileSync(path.join(dir,'assets/hero-panorama-v2.css'),'utf8'),CSS);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
