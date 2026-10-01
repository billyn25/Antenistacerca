import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

const root = 'public';
const towns = JSON.parse(fs.readFileSync('src/localidades.json', 'utf8'));
const read = route => fs.readFileSync(path.join(root, route), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const previousLinks = ['tdt', 'parabolicas', 'porteros', 'reparacion', 'telefonia-movil', 'reparaciones-electricas'];

test('portada conserva los siete servicios, incluida TDT por satélite HD', () => {
  const html = read('index.html');
  const section = html.match(/<section id="servicios"[\s\S]*?<\/section>/)?.[0] || '';
  assert.equal((section.match(/<article>/g) || []).length, 7);
  assert.equal((section.match(/<h3>TDT por satélite HD<\/h3>/g) || []).length, 1);
  assert.match(section, /antena parabólica y receptor compatible/);
  assert.match(html, /href="tel:\+34641589394"/);
});

test('cada municipio conserva los seis servicios anteriores y añade TDT-SAT con destino y Schema', () => {
  assert.ok(towns.length > 0);
  for (const town of towns) {
    const file = `${town.provinciaSlug}/${town.slug}/index.html`;
    const html = read(file);
    const section = html.match(/<section class="services wrap" id="servicios">[\s\S]*?<\/section>/)?.[0] || '';
    assert.equal((section.match(/class="card"/g) || []).length, 7, file);
    for (const id of [...previousLinks, 'tdt-satelite']) {
      assert.ok(section.includes(`href="#${id}"`), `${file}: enlace ${id}`);
      assert.equal([...html.matchAll(/\bid="([^"]+)"/g)].filter(m => m[1] === id).length, 1, `${file}: destino ${id}`);
    }
    assert.ok(html.includes(`<h2>Instalación de TDT por satélite en HD en ${escape(town.localidad)}</h2>`), file);
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    const graph = JSON.parse(json)['@graph'];
    assert.ok(graph.some(item => item['@type'] === 'Service' && item.serviceType.includes('TDT por satélite HD')), file);
    assert.ok(html.includes(`href="https://www.antenistacerca.es/${town.provinciaSlug}/${town.slug}/"`), file);
  }
});

test('se conservan las rutas del sitemap y el modo de publicación existente', () => {
  const expected = new Set(['https://www.antenistacerca.es/']);
  for (const town of towns) {
    expected.add(`https://www.antenistacerca.es/${town.provinciaSlug}/`);
    expected.add(`https://www.antenistacerca.es/${town.provinciaSlug}/${town.slug}/`);
  }
  const urls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.equal(urls.length, expected.size);
  assert.deepEqual(new Set(urls), expected);
  assert.match(read('index.html'), /content="noindex,nofollow"/);
  assert.match(read('robots.txt'), /Disallow: \//);
});
