import test from 'node:test';
import assert from 'node:assert/strict';
import {transformHeader} from '../header-brand.mjs';
import {transformHero} from '../hero-full-width.js';
import {madridDistricts} from '../src/madrid-districts.mjs';
import {upgradeDistrict,assertDistrictDesign,styleTags} from '../scripts/madrid-district-design.mjs';
const fixture=(route,phone='641 589 394',tel='34641589394')=>`<!doctype html><html lang="es"><head><title>Distrito de Madrid | ${phone}</title><meta name="robots" content="noindex,follow"><link rel="canonical" href="https://antenistacerca.es${route}"><style>body{margin:0}</style><style id="shared-ui">.hero{display:block}</style><script type="application/ld+json">{"telephone":"+${tel}"}</script><script src="/assets/ac-cookie-consent-v1.js" defer></script></head><body class="original"><header><a class="brand" href="/"><span>📡</span><strong>ANTENISTA CERCA</strong><small>Tu antenista de confianza</small></a><a href="tel:+${tel}">${phone}</a></header><main><section class="hero"><div class="wrap hero-grid"><div class="hero-copy"><h1>Antenista en Chamberí</h1><p>Texto local conservado</p><a href="tel:+${tel}">Llamar</a></div><div class="hero-photo"><img src="/assets/old.png" alt="Antena en Chamberí"></div></div></section><section id="servicios"><h2>Servicios en Chamberí</h2><img src="/assets/antena.jpeg" alt="TDT"><a href="/madrid/">Madrid</a></section></main><footer><a href="tel:+${tel}">${phone}</a><a href="/cookies/">Cookies</a></footer><div class="mobilebar"><a href="https://wa.me/${tel}">WhatsApp</a></div></body></html>`;
const makeCity=()=>transformHero(transformHeader(fixture('/madrid/madrid/'))).replace(/<style id="shared-ui">[\s\S]*?<\/style>/,'<link rel="stylesheet" href="/assets/shared-ui.css"><link rel="stylesheet" href="/assets/town-enhancements.css">');
test('21 districts use municipal CSS and approved logo/hero without changing local content',()=>{
 const city=makeCity();
 for(const d of madridDistricts){
  const original=fixture(d.route),after=upgradeDistrict(original,city,d.route);
  assertDistrictDesign(after,city,d.route);
  assert.deepEqual(styleTags(after),styleTags(city));
  for(const re of [/<title>[\s\S]*?<\/title>/,/<link rel="canonical"[^>]*>/,/<meta name="robots"[^>]*>/,/<script type="application\/ld\+json">[\s\S]*?<\/script>/,/<footer>[\s\S]*?<\/footer>/,/<div class="mobilebar">[\s\S]*?<\/div>/])assert.equal(after.match(re)[0],original.match(re)[0]);
  assert.ok(after.includes('alt="Antena en Chamberí"'));
  assert.ok(after.includes('<img src="/assets/antena.jpeg" alt="TDT">'));
  assert.equal(upgradeDistrict(after,city,d.route),after,'Idempotent');
 }
});
test('existing regional phone remains 614 78 99 45; no cross-project assets',()=>{
 const original=fixture('/madrid/chamberi/','614 78 99 45','34614789945');
 const after=upgradeDistrict(original,makeCity(),'/madrid/chamberi/');
 assert.ok(after.includes('tel:+34614789945'));
 assert.ok(after.includes('wa.me/34614789945'));
 assert.ok(!after.includes('34641589394'));
 assert.ok(!after.includes('antenasrapid'));
});
test('non-district routes, missing municipal CSS or malformed district fail closed',()=>{
 const city=makeCity(),original=fixture('/madrid/chamberi/');
 for(const route of ['/','/madrid/','/madrid/madrid/','/burgos/chamberi/'])assert.throws(()=>upgradeDistrict(original,city,route));
 assert.throws(()=>upgradeDistrict(original,city.replace('/assets/town-enhancements.css','/assets/old.css'),'/madrid/chamberi/'));
 assert.throws(()=>upgradeDistrict(original.replace('<header>','<div>'),city,'/madrid/chamberi/'));
 assert.throws(()=>upgradeDistrict(original.replace('<section class="hero">','<section class="wrong">'),city,'/madrid/chamberi/'));
});
