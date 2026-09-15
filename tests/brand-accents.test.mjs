import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { applyAccents, STYLE_ID, main } from '../brand-accents.mjs';

const fixture = '<!doctype html><html lang="es"><head><title>Antenista en Amurrio</title><meta name="description" content="Instalación y reparación"><meta name="robots" content="index,follow"><link rel="canonical" href="https://antenistacerca.es/alava/amurrio/"></head><body><header><img src="/assets/logo-antenista-cerca-v1.webp" alt="ANTENISTA CERCA"></header><main><section class="hero ac-hero-full"><h1>Antenista en Amurrio</h1><ul class="checks"><li>Averías y falta de señal</li></ul><a class="btn red" href="tel:+34641589394">Llamar</a><a class="btn green" href="https://wa.me/34641589394">WhatsApp</a><img src="/assets/hero-antenista-panorama.webp" alt="Técnico de antenas" loading="eager" fetchpriority="high"></section><section id="servicios" class="services"><h2>Servicios</h2></section></main><script id="antenistacerca-conversions">window.GA="G-W8L23NJLP6";</script></body></html>';
const strip = h => h.replace(new RegExp(`<style id="${STYLE_ID}">[\\s\\S]*?<\\/style>`, 'g'), '');
test('único cambio: estilo; HTML, SEO, imágenes, enlaces y scripts idénticos', () => assert.equal(strip(applyAccents(fixture)), fixture));
test('idempotencia: nunca acumula estilos', () => {
 const once=applyAccents(fixture); assert.equal(applyAccents(once),once);
 assert.equal((once.match(new RegExp(`id="${STYLE_ID}"`,'g'))||[]).length,1);
});
test('rechaza HTML sin head', () => assert.throws(() => applyAccents('<body></body>'), /head/));
test('aplica a portada, pueblos y provincias; no modifica assets', () => {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'brand-accents-'));
 try {
  const paths=['index.html','alava/index.html','alava/amurrio/index.html'];
  for(const p of paths){fs.mkdirSync(path.dirname(path.join(dir,p)),{recursive:true});fs.writeFileSync(path.join(dir,p),fixture);}
  fs.mkdirSync(path.join(dir,'assets'));fs.writeFileSync(path.join(dir,'assets/photo.webp'),'untouched');
  assert.equal(main(dir),3);
  for(const p of paths)assert.equal(strip(fs.readFileSync(path.join(dir,p),'utf8')),fixture);
  assert.equal(fs.readFileSync(path.join(dir,'assets/photo.webp'),'utf8'),'untouched');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('no escribe ninguna página si hay otra inválida', () => {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'brand-accents-bad-'));
 try{fs.writeFileSync(path.join(dir,'a.html'),fixture);fs.writeFileSync(path.join(dir,'b.html'),'<body>Error</body>');assert.throws(()=>main(dir));assert.equal(fs.readFileSync(path.join(dir,'a.html'),'utf8'),fixture);}
 finally{fs.rmSync(dir,{recursive:true,force:true});}
});
