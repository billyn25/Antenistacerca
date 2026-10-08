import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {validateMadrid} from './add-madrid.mjs';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const note=data=>`<p class="ac-postal-source">Códigos asociados a direcciones de <a href="https://www.cartociudad.es/web/portal/directorio-de-servicios/descarga" rel="noopener">CartoCiudad (IGN/CNIG)</a>, consulta ${esc(data.checkedOn)}. Obra derivada de CartoCiudad, CC BY 4.0 · SCNE. Confirma el código de la dirección concreta; no es una certificación de códigos de uso especial de Correos.</p>`;
export function postalBlock(t,data){
 const codes=t.postalCodes,chip=c=>`<span class="ac-postal-code">${c}</span>`;
 return `<section class="section ac-postal" id="codigos-postales"><div class="wrap"><div class="kicker">Localiza tu instalación</div><h2>Códigos postales de ${esc(t.localidad)}</h2><p>Indica la calle, el municipio y el código postal para preparar la visita de antenas, porteros o videoporteros.</p><div class="ac-postal-codes">${codes.slice(0,12).map(chip).join(' ')}</div>${codes.length>12?`<details class="ac-postal-more"><summary>Ver los ${codes.length-12} códigos restantes</summary><div class="ac-postal-codes">${codes.slice(12).map(chip).join(' ')}</div></details>`:''}<p>Un código puede corresponder a varios municipios. La disponibilidad, el desplazamiento y el presupuesto se confirman al contactar.</p>${note(data)}<a class="ac-directory-link" href="/madrid/#localidades">Buscar otro municipio o código postal de Madrid →</a></div></section>`;
}
export function enrichTown(h,t,data){
 if(t.provinciaSlug!=='madrid')return h;
 assert.ok(!h.includes('id="codigos-postales"'),'Bloque postal ya insertado');
 const marker='<section class="faq local-faq">';
 assert.equal(h.split(marker).length,2,'Madrid: falta contenedor FAQ');
 h=h.replace(marker,postalBlock(t,data)+marker);
 h=h.replace(`Servicio de antenas en ${esc(t.localidad)} y alrededores`,'Otros municipios de la Comunidad de Madrid')
    .replace('También atendemos localidades próximas:','También puedes consultar el servicio en estos municipios de Madrid:');
 return h;
}
export function improveServiceContent(h,t){
 // Reuse the existing service section; do not create thin pages per keyword.
 const marker='<div class="old-doorphones">';
 assert.equal(h.split(marker).length,2,`${t.slug}: falta bloque de porteros`);
 const n=esc(t.localidad);
 const cards=`<div class="ac-doorphone-intents"><article><h3 id="reparacion-porteros">Reparación de porteros automáticos en ${n}</h3><p>Describe si falla la llamada, el audio o la apertura y si ocurre en una vivienda o en todo el portal. La revisión distingue placa, telefonillo, alimentación, cableado y abrepuertas antes de proponer sustituciones.</p></article><article><h3 id="instalacion-videoporteros">Instalación de videoporteros en ${n}</h3><p>Para renovar el portero, indica el equipo actual y el número de viviendas o accesos. Se comprueba la compatibilidad de placa, monitor, alimentación y cableado antes de decidir qué elementos se pueden conservar.</p></article></div>`;
 return h.replace(marker,cards+marker);
}
export function syncMetadata(h){
 const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
 const title=decode(h.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'');
 const desc=decode(h.match(/<meta name="description" content="([^"]*)"/)?.[1]||'');
 const canonical=h.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
 assert.ok(title&&desc&&canonical,'Metadatos incompletos');
 h=h.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,raw)=>{
   const data=JSON.parse(raw),nodes=data['@graph']||[data];
   for(const node of nodes)if(['WebPage','CollectionPage'].includes(node['@type'])){
     node.name=title;node.description=desc;node.url=canonical;
     node.isPartOf={'@id':'https://antenistacerca.es/#website'};
   }
   if(data['@graph']&&!nodes.some(n=>n['@type']==='WebSite'))nodes.push({'@type':'WebSite','@id':'https://antenistacerca.es/#website',name:'Antenista Cerca',url:'https://antenistacerca.es/',inLanguage:'es'});
   return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`;
 });
 // UI buttons must not concatenate phone and WhatsApp when extracting plain text.
 return h.replace(/(<div class="mobilebar")>/g,'$1 data-nosnippet>')
   .replace(/<\/a><a([^>]+href="(?:tel:|https:\/\/wa\.me\/))/g,'</a> <a$1');
}
function directory(h,towns,data){
 const label='Buscar municipio o código postal';
 const marker='<nav class="alpha-nav"';
 assert.equal(h.split(marker).length,2,'Madrid: falta índice alfabético');
 const search=`<div class="ac-madrid-search"><label for="ac-madrid-query">${label}</label><input type="search" id="ac-madrid-query" placeholder="Ej.: Coslada o 28801" autocomplete="off" aria-describedby="ac-madrid-status"><p id="ac-madrid-status" role="status" aria-live="polite">179 municipios disponibles. Un código compartido muestra todas las localidades asociadas.</p></div>`;
 for(const t of towns){
  const link=`<a href="/madrid/${t.slug}/">Antenista en ${esc(t.localidad)}</a>`;
  // Los accesos rápidos pueden repetir el enlace; transformar solo el del listado alfabético.
  const alphaStart=h.indexOf('<nav class="alpha-nav"');
  assert.ok(alphaStart>=0,'Madrid: falta índice alfabético');
  const alphaLink=h.indexOf(link,alphaStart);
  assert.ok(alphaLink>=0,`Madrid: falta enlace alfabético ${t.slug}`);
  const codes=t.postalCodes;
  h=h.slice(0,alphaLink)+`<div class="ac-madrid-result" data-madrid-search="${esc(t.localidad)} ${codes.join(' ')}">${link}<a class="ac-madrid-codes-link" href="/madrid/${t.slug}/#codigos-postales">Códigos postales: ${codes.slice(0,4).join(' · ')}${codes.length>4?` · y ${codes.length-4} más`:''}</a></div>`+h.slice(alphaLink+link.length);
 }
 h=h.replace(marker,search+marker).replace('<!-- PROVINCE-HUB-END -->',note(data)+'<!-- PROVINCE-HUB-END -->');
 return h.replace('</body>','<script src="/assets/madrid-search.js" defer></script></body>');
}
function main(){
 const data=validateMadrid(JSON.parse(fs.readFileSync('src/postal-codes-madrid.json','utf8')));
 const towns=JSON.parse(fs.readFileSync('src/localidades.json','utf8'));
 const madrid=towns.filter(t=>t.provinciaSlug==='madrid');
 assert.equal(madrid.length,179);
 const byFile=new Map(towns.map(t=>[`${t.provinciaSlug}/${t.slug}/index.html`,t]));
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 const files=walk('public').filter(x=>x.endsWith('.html'));
 for(const file of files){
  const rel=path.relative('public',file).split(path.sep).join('/'),t=byFile.get(rel);
  let h=fs.readFileSync(file,'utf8');
  if(t)h=improveServiceContent(enrichTown(h,t,data),t);
  if(rel==='madrid/index.html')h=directory(h,madrid,data);
  if(rel==='index.html'){
   const marker='<h3>Madrid</h3>';
   assert.equal(h.split(marker).length,2,'Madrid debe figurar en portada');
   h=h.replace(marker,marker+'<a class="ac-directory-link" href="/madrid/#localidades">Buscar por municipio o código postal</a>');
  }
  h=syncMetadata(h).replace('</head>','<link rel="stylesheet" href="/assets/madrid-seo.css"></head>');
  fs.writeFileSync(file,h);
 }
 for(const f of ['madrid-search.js','madrid-seo.css'])fs.copyFileSync('src/assets/'+f,'public/assets/'+f);
 const report={municipalities:towns.length,madrid:madrid.length,provinces:new Set(towns.map(t=>t.provinciaSlug)).size,html:files.length,postalCodes:new Set(madrid.flatMap(t=>t.postalCodes)).size};
 fs.writeFileSync('public/madrid-seo-report.json',JSON.stringify(report,null,2));
 console.log('MADRID Y SEO:',JSON.stringify(report));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main();
