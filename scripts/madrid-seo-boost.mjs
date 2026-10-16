/** Madrid-only content and internal navigation. Existing canonicals remain fixed. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import services from '../content/madrid-services.json' with {type:'json'};
import {madridDistricts} from '../src/madrid-districts.mjs';
export {services};
export const VERSION='madrid-servicios-conectados-v1';
export const CITY='/madrid/madrid/';
export const PHONE='614 78 99 45',TEL='+34614789945',WA='34614789945';
export const serviceRoute=s=>`/madrid/servicios/${s.slug}/`;
const marker=`data-ac-madrid-seo="${VERSION}"`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const mainRE=/<main\b[^>]*>[\s\S]*?<\/main>/gi;
const schemaRE=/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const canonical=h=>h.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
const robots=h=>h.match(/<meta\b[^>]*name="robots"[^>]*content="([^"]+)"/)?.[1];
const fileFor=(root,route)=>path.join(root,route.replace(/^\//,''),'index.html');
const read=(root,route)=>fs.readFileSync(fileFor(root,route),'utf8');
const allFiles=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?allFiles(path.join(dir,e.name)):[path.join(dir,e.name)]);
const one=(html,re,label)=>{const matches=[...html.matchAll(re)];assert.equal(matches.length,1,label);return matches[0][0];};
export const CSS=`/* Only the new Madrid content blocks; existing header, hero and footer stay unchanged. */
.ac-madrid-boost{box-sizing:border-box;padding-top:28px;padding-bottom:28px;line-height:1.65;scroll-margin-top:100px}
.ac-madrid-boost h2{font-size:clamp(23px,3vw,30px);line-height:1.2;color:#0a3f73;margin:0 0 14px}
.ac-madrid-boost h3{font-size:18px;line-height:1.4;color:#0a3f73;margin:0 0 9px}
.ac-madrid-boost p{max-width:900px;margin:0 0 15px}.ac-madrid-boost .ac-madrid-lead{font-size:17px}
.ac-madrid-boost .ac-madrid-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:20px}
.ac-madrid-boost .ac-madrid-card{min-width:0;padding:19px;border:1px solid #dce5ec;border-top:3px solid #ff8700;border-radius:12px;background:#fff}
.ac-madrid-boost .ac-madrid-card p{font-size:14px;margin:0 0 12px}
.ac-madrid-boost a.ac-madrid-link,.ac-madrid-context a{color:#0a3f73!important;text-decoration:underline!important;text-underline-offset:3px;font-weight:700}
.ac-madrid-context{padding:12px 15px;border-left:3px solid #ff8700;background:#fff8ee;border-radius:5px;line-height:1.6;font-size:15px}
.ac-madrid-boost nav.ac-madrid-links{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:18px 0}
.ac-madrid-boost .ac-madrid-links a{display:flex;align-items:center;min-height:44px;box-sizing:border-box;padding:10px 13px;background:#f4f8fb;border:1px solid #dce5ec;border-radius:7px;color:#0a3f73;font-weight:700;line-height:1.4}
.ac-madrid-boost .ac-madrid-note{border-left:4px solid #ff8700;background:#fff2e3;padding:18px;border-radius:8px;margin:20px 0}
.ac-madrid-boost a:focus-visible,.ac-madrid-context a:focus-visible{outline:3px solid #ff8700;outline-offset:3px}
.ac-madrid-breadcrumb{font-size:14px;padding-top:14px;padding-bottom:14px;color:#0a3f73}.ac-madrid-breadcrumb a{text-decoration:underline}
.ac-madrid-guide .ac-madrid-boost{max-width:1040px}.ac-madrid-guide .ac-madrid-guide-body{max-width:840px}
.ac-madrid-boost details{padding:14px 16px;border:1px solid #dce5ec;border-radius:9px;margin:10px 0;background:#fff}
.ac-madrid-boost summary{cursor:pointer;font-weight:700;line-height:1.4}.ac-madrid-boost details p{margin:12px 0 0}
@media(max-width:800px){.ac-madrid-boost .ac-madrid-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ac-madrid-boost nav.ac-madrid-links{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:520px){.ac-madrid-boost .ac-madrid-grid{grid-template-columns:minmax(0,1fr)}.ac-madrid-boost{padding-top:23px;padding-bottom:23px}.ac-madrid-boost .ac-madrid-card{padding:17px}.ac-madrid-boost nav.ac-madrid-links{gap:7px}.ac-madrid-boost .ac-madrid-links a{font-size:14px;overflow-wrap:anywhere}}
`;
export const CSS_PATH='/assets/madrid-content-'+digest(CSS).slice(0,12)+'.css';
function tag(html){
 assert.ok(!html.includes(marker),'No volver a aplicar el refuerzo a una salida ya procesada');
 return html.replace(/<body\b/i,'<body '+marker).replace('</head>',`<link rel="stylesheet" href="${CSS_PATH}"></head>`);
}
export function sectionById(html,id){
 const start=new RegExp('<section\\b[^>]*\\bid="'+id+'"[^>]*>').exec(html);
 assert.ok(start,'Sección ausente: '+id);
 const tags=/<section\b[^>]*>|<\/section>/g;tags.lastIndex=start.index;let depth=0,m;
 while((m=tags.exec(html))){depth+=m[0].startsWith('</')?-1:1;if(!depth)return html.slice(start.index,tags.lastIndex);}
 throw Error('Sección incompleta: '+id);
}
const insertAfter=(html,block,added)=>{assert.ok(html.includes(block));return html.replace(block,()=>block+added);};
const link=(s,label)=>`<a class="ac-madrid-link" href="${serviceRoute(s)}">${esc(label||s.label)}</a>`;
const catalog=(exclude='')=>`<div class="ac-madrid-grid">${services.filter(s=>s.slug!==exclude).map(s=>`<article class="ac-madrid-card"><h3>${link(s)}</h3><p>${esc(s.intake)}</p></article>`).join('')}</div>`;
const cta=(subject)=>`<div class="actions"><a class="btn red" href="tel:${TEL}">Llamar ${PHONE}</a> <a class="btn green" href="https://wa.me/${WA}?text=${encodeURIComponent('Hola, necesito consultar '+subject+'.')}">Consultar por WhatsApp</a></div>`;
function breadcrumb(items){return `<p class="ac-madrid-breadcrumb wrap" aria-label="Ruta de navegación">${items.map((x,i)=>x.route?`<a href="${x.route}">${esc(x.name)}</a>`:`<span aria-current="page">${esc(x.name)}</span>`).join(' › ')}</p>`;}
function meta(html,key,value,property=false){
 const attr=property?'property':'name',re=new RegExp('<meta\\b(?=[^>]*\\b'+attr+'="'+key+'")[^>]*>','i');
 const tag=`<meta ${attr}="${key}" content="${esc(value)}">`;
 return re.test(html)?html.replace(re,()=>tag):html.replace('</head>',tag+'</head>');
}
export function metadata(html,title,description,{crumbs=null,origin=null}={}){
 html=html.replace(/<title>[\s\S]*?<\/title>/,()=>`<title>${esc(title)}</title>`);
 html=meta(meta(html,'description',description),'og:title',title,true);html=meta(html,'og:description',description,true);
 if(/name="twitter:title"/.test(html))html=meta(html,'twitter:title',title);
 if(/name="twitter:description"/.test(html))html=meta(html,'twitter:description',description);
 return html.replace(schemaRE,(script,payload)=>{
  const data=JSON.parse(payload),graph=data['@graph']||[data];
  for(const item of graph){
   if(['WebPage','CollectionPage'].includes(item['@type'])){item.name=title;item.description=description;}
   if(crumbs&&item['@type']==='BreadcrumbList')item.itemListElement=crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:origin+c.route}));
  }
  return script.replace(payload,JSON.stringify(data).replace(/</g,'\\u003c'));
 });
}
const districtCrumbs=d=>[{name:'Inicio',route:'/'},{name:'Comunidad de Madrid',route:'/madrid/'},{name:'Madrid capital',route:CITY},{name:d.name,route:d.route}];
function contextualGuides(html){
 const mapping=[['reparacion',['reparacion-antenas','amplificadores-antena']],['tdt',['antenas-tdt-colectivas']],['parabolicas',['antenas-parabolicas']],['porteros',['porteros-automaticos','videoporteros']]];
 for(const [id,slugs] of mapping){
  const block=sectionById(html,id);
  const paragraph=`<p class="ac-madrid-context" data-madrid-service-links="${id}">Consulta el detalle del servicio: ${slugs.map(slug=>link(services.find(s=>s.slug===slug))).join(' · ')}.</p>`;
  // Insert after an existing paragraph inside the content column, never outside the grid.
  const first=block.match(/<p\b[^>]*>[\s\S]*?<\/p>/)?.[0];assert.ok(first,id+': sin párrafo de inserción');
  html=html.replace(block,()=>insertAfter(block,first,paragraph));
 }
 return html;
}
function capitalIntro(){return `<section class="ac-madrid-boost wrap" id="madrid-capital-servicio"><h2>Antenas y porteros en Madrid: de la avería a la solución</h2><p class="ac-madrid-lead">Consulta reparación e instalación para una vivienda, una comunidad o un negocio de Madrid capital. La atención se organiza con la dirección y el tipo de instalación: no es lo mismo una toma de televisión que falla en casa que una cabecera común sin señal.</p><div class="ac-madrid-grid"><article class="ac-madrid-card"><h3>Televisión sin señal o con cortes</h3><p>Indica qué canales fallan, cuántos televisores están afectados y si ocurre a otros vecinos. Esa información orienta la revisión de recepción, amplificación y distribución.</p>${link(services[0],'Revisión y reparación de antenas')}</article><article class="ac-madrid-card"><h3>Antena colectiva de una comunidad</h3><p>Coordina el aviso con la persona que pueda autorizar el trabajo y facilitar acceso a la cabecera. Se diferencia el alcance común del cableado particular de una vivienda.</p>${link(services[1],'Servicio de antenas colectivas')}</article><article class="ac-madrid-card"><h3>Portero que no llama o no abre</h3><p>Describe por separado llamada, audio, imagen y apertura. Antes de renovar un terminal interesa identificar el sistema y comprobar su compatibilidad.</p>${link(services[4],'Reparación de porteros automáticos')}</article></div><div class="ac-madrid-note"><h3>Preparar el aviso en Madrid</h3><p>Facilita distrito, calle, tipo de inmueble y síntoma. Confirma disponibilidad, desplazamiento y alcance del presupuesto al contactar. Las urgencias se consultan en el ${PHONE}; no se fija un tiempo de llegada sin conocer la dirección y la carga de trabajo.</p><p>No subas a cubiertas ni manipules equipos alimentados para preparar la consulta. Las fotografías son útiles únicamente cuando pueden tomarse desde un lugar seguro.</p>${cta('un servicio de antenas en Madrid capital')}</div></section>`;}
function capitalDistricts(){return `<section class="ac-madrid-boost wrap" id="madrid-distritos"><h2>Antenista en los distritos de Madrid capital</h2><p>Elige el distrito de tu dirección. Cada ficha conserva su información de antenas y porteros y el contacto para preparar el aviso. Para otras localidades, utiliza el <a class="ac-madrid-link" href="/madrid/#localidades">directorio de municipios de la Comunidad de Madrid</a>.</p><nav class="ac-madrid-links" aria-label="Los 21 distritos de Madrid">${madridDistricts.map(d=>`<a href="${d.route}">${esc(d.name)}</a>`).join('')}</nav></section>`;}
function capitalFAQ(){return `<section class="faq wrap ac-madrid-boost" id="faq"><h2>Consultas sobre el servicio de antenista en Madrid</h2>${[
 ['¿Cómo se prepara una visita a una comunidad?','Indica quién coordina la consulta, cuántas viviendas están afectadas y quién facilita las llaves de los espacios comunes. La disponibilidad y el alcance se concretan antes de la intervención.'],
 ['¿Qué influye en el presupuesto de reparación?','El origen de la avería, el acceso, el desplazamiento y los materiales necesarios. Solicita que se diferencien diagnóstico, reparación y componentes para valorar la propuesta antes de autorizarla.'],
 ['¿El servicio incluye porteros y videoporteros?','Puedes consultar reparación, instalación y renovación de ambos sistemas. La compatibilidad de placa, alimentación, cableado y terminales se valora antes de recomendar una sustitución.'],
 ['¿Debo pedir el servicio por municipio o distrito?','Para una dirección dentro de Madrid capital, utiliza su distrito. Para otra localidad de la Comunidad de Madrid, abre la página de ese municipio. En ambos casos el teléfono de esta zona es el 614 78 99 45.'],
 ['¿Puedo confirmar una hora por la web?','La web prepara la consulta, pero no confirma una reserva ni una hora de llegada. El técnico acuerda disponibilidad y desplazamiento mediante teléfono o WhatsApp.']
 ].map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>`;}
function provinceBlock(){return `<section class="ac-madrid-boost" id="madrid-elegir-servicio"><h2>Madrid capital, distritos y municipios</h2><p>Para una dirección dentro de la ciudad, consulta el <a class="ac-madrid-link" href="${CITY}">servicio de antenista en Madrid capital</a> o elige uno de sus <a class="ac-madrid-link" href="#distritos-madrid">21 distritos</a>. Para otras localidades, el <a class="ac-madrid-link" href="#localidades">directorio municipal</a> mantiene los 179 municipios de la Comunidad de Madrid.</p><h3>Información antes de pedir una instalación o reparación</h3><p>Estas guías explican qué se revisa, qué datos conviene facilitar y qué condiciona la intervención. El teléfono para consultar el servicio en esta zona es el ${PHONE}.</p>${catalog()}${cta('un servicio en la Comunidad de Madrid')}</section>`;}
export function enrichExisting(html,{route,name,kind},origin){
 if(html.includes(marker))return html;
 const before=html;let result=html;
 if(kind==='home'){
  const block=`<section class="ac-madrid-boost w" id="servicio-madrid"><h2>Servicio de antenista en Madrid</h2><p>Consulta <a class="ac-madrid-link" href="${CITY}">instalación y reparación de antenas en Madrid capital</a>, elige tu <a class="ac-madrid-link" href="${CITY}#madrid-distritos">distrito de Madrid</a> o busca otro <a class="ac-madrid-link" href="/madrid/#localidades">municipio de la Comunidad de Madrid</a>. Las páginas de cada zona indican su contacto de atención.</p></section>`;
  result=insertAfter(result,sectionById(result,'servicios'),block);
 }else if(kind==='province'){
  result=metadata(result,'Antenistas en la Comunidad de Madrid | Municipios y distritos',`Directorio de antenistas en la Comunidad de Madrid: capital, 21 distritos y 179 municipios. Antenas, porteros y videoporteros. ${PHONE}.`);
  result=result.replace(/<h1>[^<]*<\/h1>/,'<h1>Antenistas en la Comunidad de Madrid</h1>');
  const start='<!-- PROVINCE-HUB-START -->';assert.ok(result.includes(start));result=result.replace(start,provinceBlock()+start);
 }else{
  result=contextualGuides(result);
  if(kind==='city'){
   result=metadata(result,`Antenista en Madrid | Antenas y porteros | ${PHONE}`,`Antenista en Madrid capital: reparación de antenas TDT, colectivas, parabólicas, porteros y videoporteros. Viviendas y comunidades. ${PHONE}.`);
   const hero=one(result,/<section\b[^>]*class="hero(?:\s[^"]*)?"[^>]*>[\s\S]*?<\/section>/gi,'Hero de capital');
   result=insertAfter(result,hero,capitalIntro());
   const contact=sectionById(result,'contacto');result=result.replace(contact,capitalDistricts()+contact);
   const oldFAQ=sectionById(result,'faq');result=result.replace(oldFAQ,capitalFAQ());
   // FAQPage is removed if an old generator supplied it; visible FAQs are not promised as rich results.
   result=result.replace(schemaRE,(script,payload)=>{const data=JSON.parse(payload);if(data['@graph'])data['@graph']=data['@graph'].filter(x=>x['@type']!=='FAQPage');return script.replace(payload,JSON.stringify(data).replace(/</g,'\\u003c'));});
  }else if(kind==='district'){
   const crumbs=districtCrumbs({name,route});
   result=metadata(result,`Antenista en ${name}, Madrid | ${PHONE}`,`Antenas y porteros en ${name}, Madrid capital. Consulta reparación de señal TDT, amplificación, parabólicas y videoporteros. ${PHONE}.`,{crumbs,origin});
   result=result.replace(/<h1>[^<]*<\/h1>/,()=>`<h1>Antenista en ${esc(name)}, Madrid</h1>`);
   result=result.replace(/(<main\b[^>]*>)/i,m=>m+breadcrumb([...crumbs.slice(0,-1),{name}]));
   const zone=sectionById(result,'zona');
   const nav=`<p class="ac-madrid-context">Esta dirección pertenece a un distrito de Madrid capital. Consulta el <a href="${CITY}">servicio de antenista en Madrid</a> o el <a href="${CITY}#madrid-distritos">listado completo de distritos</a>.</p>`;
   result=result.replace(zone,()=>zone.replace('</section>',nav+'</section>'));
  }
 }
 result=tag(result);
 assert.equal(canonical(result),canonical(before),'No cambiar canonical existente '+route);
 assert.equal(robots(result),robots(before),'No cambiar robots '+route);
 for(const re of [/<header\b[^>]*>[\s\S]*?<\/header>/gi,/<footer\b[^>]*>[\s\S]*?<\/footer>/gi,/<img\b[^>]*>/gi])assert.deepEqual([...result.matchAll(re)].map(x=>x[0]),[...before.matchAll(re)].map(x=>x[0]),'Cambio de diseño o fotos no solicitado '+route);
 const activeJS=h=>[...h.matchAll(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi)].map(x=>x[0]);assert.deepEqual(activeJS(result),activeJS(before),'No modificar cookies o JS '+route);
 return result;
}
export function servicePage(source,s,origin){
 const route=serviceRoute(s),url=origin+route;
 let html=source.replace(new RegExp('\\s'+marker,'g'),'').replace(/\sdata-ac-district-design="[^"]*"/g,'');
 const title=s.title+' | '+PHONE;
 html=metadata(html,title,s.description);
 html=html.replace(/<link rel="canonical" href="[^"]+">/,()=>`<link rel="canonical" href="${url}">`);
 html=meta(html,'og:url',url,true);
 const crumbs=[{name:'Inicio',route:'/'},{name:'Madrid capital',route:CITY},{name:s.label,route}];
 const graph={'@context':'https://schema.org','@graph':[
  {'@type':'Organization','@id':origin+'/#negocio',name:'Antenista Cerca',url:origin+'/',telephone:TEL},
  {'@type':'WebPage','@id':url+'#pagina',url,name:title,description:s.description,inLanguage:'es',mainEntity:{'@id':url+'#servicio'},isPartOf:{'@id':origin+'/#website'}},
  {'@type':'Service','@id':url+'#servicio',url,name:s.title,description:s.intro,serviceType:s.label,telephone:TEL,provider:{'@id':origin+'/#negocio'},areaServed:{'@type':'AdministrativeArea',name:'Comunidad de Madrid'}},
  {'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:origin+c.route}))}
 ]};
 assert.equal([...html.matchAll(schemaRE)].length,1,'La plantilla debe tener un JSON-LD único');
 html=html.replace(schemaRE,()=>'<script type="application/ld+json">'+JSON.stringify(graph).replace(/</g,'\\u003c')+'</script>');
 let hero=one(source,/<section\b[^>]*class="hero(?:\s[^"]*)?"[^>]*>[\s\S]*?<\/section>/gi,'Hero de plantilla');
 hero=hero.replace(/<h1>[^<]*<\/h1>/,()=>`<h1>${esc(s.title)}</h1>`).replace(/<h2>[^<]*<\/h2>/,'<h2>Consulta técnica para viviendas y comunidades</h2>');
 hero=hero.replace(/<ul class="checks">[\s\S]*?<\/ul>/,'<ul class="checks"><li>Revisión de la instalación existente</li><li>Alcance y presupuesto antes del trabajo</li><li>Contacto directo para preparar el aviso</li></ul>');
 const main=`<main class="ac-madrid-guide">${breadcrumb([...crumbs.slice(0,-1),{name:s.label}])}${hero}<section class="ac-madrid-boost wrap" id="servicios"><p class="ac-madrid-lead">${esc(s.intro)}</p><p>Atención por dirección en Madrid capital y municipios de la Comunidad de Madrid. Disponibilidad y desplazamiento se confirman al contactar.</p></section><div class="ac-madrid-guide-body wrap">${s.sections.map(([h,p],i)=>`<section class="ac-madrid-boost" id="detalle-${i+1}"><h2>${esc(h)}</h2><p>${esc(p)}</p></section>`).join('')}</div><section class="ac-madrid-boost wrap" id="faq"><h2>Preguntas sobre ${esc(s.label.toLowerCase())}</h2>${s.questions.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section><section class="ac-madrid-boost wrap" id="zona"><h2>Consulta desde tu dirección en Madrid</h2><p>Para la ciudad, abre <a class="ac-madrid-link" href="${CITY}">Antenista en Madrid capital</a> y su <a class="ac-madrid-link" href="${CITY}#madrid-distritos">directorio de distritos</a>. Para otra localidad, busca tu <a class="ac-madrid-link" href="/madrid/#localidades">municipio de la Comunidad de Madrid</a>.</p><h3>Servicios relacionados</h3><nav class="ac-madrid-links" aria-label="Servicios relacionados">${s.related.map(slug=>link(services.find(x=>x.slug===slug))).join('')}</nav></section><section class="ac-madrid-boost wrap" id="contacto"><h2>Preparar la consulta</h2><p>${esc(s.intake)}</p><p>Confirma desplazamiento, diagnóstico y materiales incluidos antes de autorizar el trabajo. No se requiere desmontar equipos ni acceder a zonas de riesgo para consultar.</p>${cta(s.title.toLowerCase())}</section></main>`;
 html=html.replace(mainRE,()=>main);html=tag(html);
 assert.equal(canonical(html),url);assert.equal(robots(html),robots(source),'Una guía hereda la protección de preview');
 return html;
}
function locs(xml){return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);}
export function extendSitemap(xml,newUrls){
 assert.ok(xml.includes('<urlset'),'Solo se amplía un urlset, nunca un índice');
 const old=locs(xml),missing=newUrls.filter(url=>!old.includes(url));
 assert.equal(new Set(old).size,old.length,'Sitemap anterior duplicado');
 const result=xml.replace('</urlset>',missing.map(url=>`<url><loc>${esc(url)}</loc></url>`).join('\n')+'\n</urlset>');
 for(const url of old)assert.ok(locs(result).includes(url),'No perder URL existente');
 assert.equal(locs(result).length,old.length+missing.length);
 return result;
}
export function applyBoost(root='public'){
 assert.equal(services.length,6);assert.equal(new Set(services.map(serviceRoute)).size,6);
 const sourceCity=read(root,CITY),origin=new URL(canonical(sourceCity)).origin;
 assert.equal(new URL(canonical(sourceCity)).pathname,CITY);
 
 const locals=JSON.parse(fs.readFileSync('src/localidades.json','utf8')).filter(d=>d.provinciaSlug==='madrid');
 assert.equal(locals.length,179,'Conservar los 179 municipios');
 const rows=[{route:'/',kind:'home'},{route:'/madrid/',kind:'province'},...locals.map(d=>({route:`/madrid/${d.slug}/`,name:d.localidad,kind:d.slug==='madrid'?'city':'town'})),...madridDistricts.map(d=>({route:d.route,name:d.name,kind:'district'}))];
 assert.equal(rows.length,202);assert.equal(new Set(rows.map(r=>r.route)).size,202);
 if(sourceCity.includes(marker))throw Error('Compilar desde una salida base limpia; el refuerzo ya está aplicado');
 const indexFile=path.join(root,'sitemap.xml'),index=fs.readFileSync(indexFile,'utf8');
 const sitemapFile=index.includes('<sitemapindex')?path.join(root,new URL(locs(index).find(url=>/\/sitemap-madrid\.xml$/.test(url))).pathname):indexFile;
 const beforeMap=fs.readFileSync(sitemapFile,'utf8');
 if(sitemapFile!==indexFile)assert.equal(locs(beforeMap).length,201,'Sitemap Madrid base de 201 URLs');
 const allowed=new Set([...rows.map(r=>fileFor(root,r.route)),sitemapFile,path.join(root,CSS_PATH)]);
 const controls=new Map(allFiles(root).filter(f=>!allowed.has(f)).map(f=>[f,digest(fs.readFileSync(f))]));
 const planned=rows.map(row=>{const before=read(root,row.route),after=enrichExisting(before,row,origin);return {...row,before,after,file:fileFor(root,row.route)};});
 const guides=services.map(s=>({route:serviceRoute(s),kind:'service',file:fileFor(root,serviceRoute(s)),after:servicePage(sourceCity,s,origin)}));
 for(const guide of guides)assert.ok(!fs.existsSync(guide.file),'No sobrescribir una guía existente '+guide.route);
 const afterMap=extendSitemap(beforeMap,guides.map(g=>origin+g.route));
 // Validate destinations and duplicate identifiers against the planned output before writing.
 const plannedHTML=new Map([...planned,...guides].map(p=>[p.route,p.after]));
 for(const [route,html] of plannedHTML){
  assert.equal((html.match(/<h1\b/g)||[]).length,1,route+': H1 único');
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1,route+': canonical único');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,route+': IDs duplicados');
  for(const m of html.matchAll(schemaRE))JSON.parse(m[1]);
  for(const [,href] of html.matchAll(/\bhref="([^"<>]+)"/g)){
   if(!href.startsWith('/')&&!href.startsWith('#'))continue;
   const url=new URL(href,origin+route),dest=url.pathname;
   if(dest.startsWith('/assets/')||dest.startsWith('/.netlify/'))continue;
   const existing=plannedHTML.get(dest)|| (fs.existsSync(fileFor(root,dest))?read(root,dest):null);
   assert.ok(existing,'Enlace interno roto: '+route+' -> '+href);
   if(url.hash)assert.ok(existing.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),'Ancla inexistente: '+route+' -> '+href);
  }
 }
 for(const p of [...planned,...guides]){fs.mkdirSync(path.dirname(p.file),{recursive:true});fs.writeFileSync(p.file,p.after);}
 fs.writeFileSync(sitemapFile,afterMap);fs.writeFileSync(path.join(root,CSS_PATH),CSS);
 for(const [file,hash] of controls)assert.equal(digest(fs.readFileSync(file)),hash,'Cambio fuera de Madrid: '+file);
 const report={version:VERSION,checkedAt:new Date().toISOString(),origin,existingMadridPages:201,newServicePages:6,homeUpdated:true,madridSitemapURLs:sitemapFile===indexFile?null:locs(afterMap).length,otherFilesUnchanged:controls.size,existingCanonicalAndRobotsUnchanged:true,css:CSS_PATH,pages:[...planned,...guides].map(({route,kind})=>({route,kind})),ok:true};
 fs.mkdirSync('.cache',{recursive:true});fs.writeFileSync('.cache/madrid-seo-build.json',JSON.stringify(report,null,2));
 console.log('MADRID REFORZADO:',JSON.stringify({...report,pages:report.pages.length}));return report;
}
export function auditBoost(root='public'){
 const report=JSON.parse(fs.readFileSync('.cache/madrid-seo-build.json','utf8'));
 assert.equal(report.pages.length,208);
 for(const p of report.pages){
  const html=read(root,p.route);assert.ok(html.includes(marker),p.route+': falta refuerzo');
  assert.equal(canonical(html),report.origin+p.route,p.route+': canonical');
  if(p.route.startsWith('/madrid/')){
   const body=html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi,'');
   assert.ok(!/(?:641\s*58\s*93\s*94|34641589394)/.test(body),p.route+': teléfono norte fuera del pie');
   assert.ok(body.includes('href="tel:'+TEL+'"'),p.route+': falta llamada de Madrid');
  }
  if(['city','district','town','province'].includes(p.kind))for(const s of services)assert.ok(html.includes(`href="${serviceRoute(s)}"`),p.route+': falta enlace a '+s.slug);
 }
 const city=read(root,CITY);for(const d of madridDistricts)assert.ok(city.includes(`href="${d.route}"`),'Capital sin distrito '+d.name);
 const urls=report.pages.filter(p=>p.kind==='service').map(p=>report.origin+p.route);
 const xml=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
 const sitemap=xml.includes('<sitemapindex')?fs.readFileSync(path.join(root,'sitemaps/sitemap-madrid.xml'),'utf8'):xml;
 for(const url of urls)assert.equal(locs(sitemap).filter(v=>v===url).length,1,'Guía fuera del sitemap '+url);
 const sitemapURLs=xml.includes('<sitemapindex')?locs(xml).flatMap(url=>locs(fs.readFileSync(path.join(root,new URL(url).pathname),'utf8'))):locs(xml);
 const htmlFiles=allFiles(root).filter(f=>f.endsWith('.html'));
 const canonicalURLs=htmlFiles.map(f=>canonical(fs.readFileSync(f,'utf8')));
 assert.equal(new Set(canonicalURLs).size,canonicalURLs.length,'Canonicals duplicados en la salida final');
 assert.equal(new Set(sitemapURLs).size,sitemapURLs.length,'Sitemap duplicado en la salida final');
 assert.deepEqual([...sitemapURLs].sort(),[...canonicalURLs].sort(),'El sitemap debe cubrir toda la salida final');
 const final={...report,totalHTML:htmlFiles.length,totalSitemapURLs:sitemapURLs.length,finalAudit:true};
 fs.writeFileSync('.cache/madrid-seo-build.json',JSON.stringify(final,null,2));
 console.log('AUDITORÍA FINAL MADRID OK: 201 páginas existentes + 6 guías + portada; '+htmlFiles.length+' HTML y URLs únicas en sitemap.');return true;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){if(process.argv.includes('--audit'))auditBoost();else applyBoost();}
