import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { transformHero, validateAsset, main, CSS } from '../hero-full-width.js';

const fixture = (town = false, name = 'Amurrio') => `<!doctype html><html lang="es"><head><title>${name}</title><meta name="robots" content="index,follow"><link rel="canonical" href="https://antenistacerca.es/${town ? 'alava/amurrio/' : ''}"></head><body><header>ANTENISTA CERCA</header><main><section class="hero"><div class="${town ? 'wrap hero-grid' : 'w hg'}"><div class="${town ? 'hero-copy' : 'copy'}"><div class="kicker">Hoy estamos cerca de tu casa</div><div class="urgent">Urgencias 24 horas</div><h1>${town ? `Antenista en ${name}` : 'Antenista cerca de tu vivienda'}</h1><h2>Técnico en instalación, reparación y mantenimiento de antenas, porteros automáticos y videoporteros</h2><ul class="checks"><li>Averías y falta de señal</li><li>Antenas TDT y parabólicas</li><li>Porteros automáticos y videoporteros</li><li>Viviendas, comunidades y negocios</li></ul><div class="actions"><a class="btn red" href="tel:+34641589394">☎ 641 589 394<small>Llamar ahora</small></a><a class="btn green" href="https://wa.me/34641589394">WhatsApp<small>Escríbenos</small></a></div></div><div class="${town ? 'hero-photo' : 'heroimg'}"><img sizes="(max-width:900px) 100vw,52vw" src="/.netlify/images?url=/assets/hero-antennista.png&amp;w=1280&amp;q=80" srcset="/.netlify/images?url=/assets/hero-antennista.png&amp;w=480&amp;q=80 480w" loading="eager" fetchpriority="high" width="1226" height="1283" alt="Técnico de antenas trabajando"></div></div></section><section id="servicios"><h2>Servicios</h2><a href="/alava/">Álava</a></section></main><footer>641 589 394</footer><script id="antenistacerca-conversions">window.gaTest='G-W8L23NJLP6';</script></body></html>`;
export { fixture };
const asset = new URL('../src/assets/hero-antenista-panorama.webp', import.meta.url);

test('foto aprobada completa y verificada', () => assert.equal(validateAsset(asset), 340780));
test('portada: cambia únicamente hero y añade CSS', () => {
 const before=fixture(), after=transformHero(before);
 assert.ok(after.includes('class="hero ac-hero-full"'));
 assert.ok(after.includes('sizes="100vw"'));
 assert.ok(!after.includes('hero-antennista.png'));
 assert.equal(after.split('<section id="servicios">')[1], before.split('<section id="servicios">')[1]);
 assert.ok(after.includes('<title>Amurrio</title>'));
 assert.equal((after.match(/<h1>/g)||[]).length,1);
});
test('localidad: conserva textos, enlaces y contacto', () => {
 const after=transformHero(fixture(true));
 assert.ok(after.includes('Antenista en Amurrio'));
 assert.ok(after.includes('href="https://wa.me/34641589394"'));
 assert.ok(after.includes('href="tel:+34641589394"'));
 assert.ok(after.includes('loading="eager"'));
 assert.ok(after.includes('fetchpriority="high"'));
});
test('repetir no duplica recursos ni cambia el resultado', () => {
 const once=transformHero(fixture(true));
 assert.equal(transformHero(once),once);
});
test('nombre largo: adapta tipografía, conserva H1 exacto', () => {
 const name='Villarcayo de Merindad de Castilla la Vieja';
 const after=transformHero(fixture(true,name));
 assert.ok(after.includes(`<h1>Antenista en ${name}</h1>`));
});
test('no oculta errores de estructura', () => assert.throws(()=>transformHero('<html><head></head><body></body></html>'),/una sección/));
test('imagen truncada bloqueada antes de tocar páginas', () => {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hero-corrupt-'));
 try { const p=path.join(dir,'broken.webp');fs.writeFileSync(p,fs.readFileSync(asset).subarray(0,7527));assert.throws(()=>validateAsset(p),/incompleto/); }
 finally {fs.rmSync(dir,{recursive:true,force:true})}
});
test('preparación sin imagen deja la web anterior intacta', () => {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hero-pending-'));
 try {fs.writeFileSync(path.join(dir,'index.html'),fixture());assert.equal(main(dir).status,'pending');assert.equal(fs.readFileSync(path.join(dir,'index.html'),'utf8'),fixture());}
 finally {fs.rmSync(dir,{recursive:true,force:true})}
});
test('una portada + dos pueblos; provincias no se alteran', () => {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hero-active-'));
 try {
  fs.mkdirSync(path.join(dir,'assets'));fs.copyFileSync(asset,path.join(dir,'assets/hero-antenista-panorama.webp'));
  const data=[{provinciaSlug:'alava',slug:'amurrio'},{provinciaSlug:'alava',slug:'agurain'}];
  fs.writeFileSync(path.join(dir,'data.json'),JSON.stringify(data));fs.writeFileSync(path.join(dir,'index.html'),fixture());
  fs.mkdirSync(path.join(dir,'alava'));fs.writeFileSync(path.join(dir,'alava/index.html'),'PROVINCIA CON ABECEDARIO');
  for(const d of data){fs.mkdirSync(path.join(dir,'alava',d.slug));fs.writeFileSync(path.join(dir,'alava',d.slug,'index.html'),fixture(true));}
  const result=main(dir,path.join(dir,'data.json'));assert.equal(result.pages,3);
  assert.equal(fs.readFileSync(path.join(dir,'alava/index.html'),'utf8'),'PROVINCIA CON ABECEDARIO');
  assert.equal(fs.readFileSync(path.join(dir,'assets/hero-panorama-v1.css'),'utf8'),CSS);
 } finally {fs.rmSync(dir,{recursive:true,force:true})}
});
