import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
const root='public';
const towns=JSON.parse(fs.readFileSync('src/localidades.json','utf8'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const oldServices=['tdt','parabolicas','porteros','reparacion','telefonia-movil','reparaciones-electricas'];
test('portada conserva servicios y muestra TDT por satélite HD',()=>{
  const h=read('index.html');
  const section=h.match(/<section\b[^>]*id="servicios"[\s\S]*?<\/section>/)?.[0]||'';
  assert.equal((section.match(/<article\b/g)||[]).length,7);
  assert.equal((section.match(/<h3>TDT por satélite HD<\/h3>/g)||[]).length,1);
  assert.match(section,/antena parabólica y receptor compatible/);
  assert.match(h,/tel:\+34641589394/);
});
test('todas las localidades conservan los seis servicios y añaden TDT-SAT con destino y Schema',()=>{
  assert.ok(towns.length>0);
  for(const d of towns){
    const file=`${d.provinciaSlug}/${d.slug}/index.html`,h=read(file);
    const section=h.match(/<section\b[^>]*id="servicios"[\s\S]*?<\/section>/)?.[0]||'';
    const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    for(const id of [...oldServices,'tdt-satelite']){
      assert.ok(section.includes(`href="#${id}"`),`${file}: enlace ${id}`);
      assert.equal(ids.filter(x=>x===id).length,1,`${file}: destino ${id}`);
    }
    assert.ok(h.includes(`<h2>Instalación de TDT por satélite en HD en ${escape(d.localidad)}</h2>`),file);
    const graphs=[...h.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{const j=JSON.parse(m[1]);return j['@graph']||[j]});
    assert.ok(graphs.some(n=>n['@type']==='Service'&&n.serviceType?.includes('TDT por satélite HD')),`${file}: Schema`);
  }
});
test('respeta la configuracion SEO de la salida, sin forzar noindex',()=>{
  const home=read('index.html'),robots=read('robots.txt');
  const production=/<meta name="robots" content="index,follow/.test(home);
  assert.ok(production||home.includes('content="noindex,nofollow"'));
  if(production){assert.match(robots,/Allow: \//);assert.doesNotMatch(robots,/Disallow: \//)}
  else assert.match(robots,/Disallow: \//);
});

const satellitePhoto='/assets/receptor-tdt-satelite-hd.webp';
test('TDT-SAT tiene fotografía local propia, distinta de parabólicas, en portada y pueblos',()=>{
  const image=fs.readFileSync(path.join(root,satellitePhoto.slice(1)));
  assert.equal(image.toString('ascii',0,4),'RIFF');
  assert.equal(image.toString('ascii',8,12),'WEBP');
  assert.ok(image.length>1000&&image.length<100000);
  assert.notDeepEqual(image,fs.readFileSync(path.join(root,'assets/parabolica.jpeg')));
  const files=['index.html',...towns.map(d=>`${d.provinciaSlug}/${d.slug}/index.html`)];
  for(const file of files){
    const html=read(file);
    const card=file==='index.html'
      ? [...html.matchAll(/<article\b[\s\S]*?<\/article>/g)].map(m=>m[0]).find(s=>s.includes('<h3>TDT por satélite HD</h3>'))
      : html.match(/<a class="card" href="#tdt-satelite">[\s\S]*?<\/a>/)?.[0];
    assert.ok(card,`${file}: tarjeta TDT-SAT`);
    assert.ok(card.includes(`src="${satellitePhoto}"`),`${file}: foto del receptor`);
    assert.match(card,/width="640"/);
    assert.match(card,/height="360"/);
    assert.match(card,/alt="Receptor Televés ZAS HD COMBO/);
    assert.ok(!card.includes('parabolica.jpeg'),`${file}: imagen repetida`);
    assert.equal(html.split(`src="${satellitePhoto}"`).length-1,1,`${file}: una sola foto TDT-SAT`);
  }
});
