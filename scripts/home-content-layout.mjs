import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
export const solutions=`<section class="ac-pro ac-channel-solutions" id="soluciones-canales"><div class="wrap"><div class="kicker">Instalación y puesta en marcha</div><h2>Soluciones para ver los canales que te faltan</h2><p>Revisamos la recepción y dejamos preparada la solución adecuada para tu televisor, tu vivienda o la instalación de la comunidad.</p><div class="ac-pro-grid"><article class="ac-pro-card"><h3>Ver Castilla-La Mancha TV desde Madrid</h3><p>Si quieres seguir Castilla-La Mancha Media en tu casa de Madrid, revisamos si llega señal TDT aprovechable y si tu antena y la distribución permiten recibirla. Cuando la recepción terrestre no es viable, instalamos y configuramos el acceso oficial por internet en un equipo compatible.</p><p>Nos ocupamos de la conexión al televisor, la configuración y la prueba de reproducción. Si necesitas un dispositivo adicional, lo valoramos antes de montar.</p></article><article class="ac-pro-card"><h3>Ver Telemadrid desde Toledo o Guadalajara</h3><p>Comprobamos la recepción en tu dirección y revisamos orientación, antena y cabecera cuando existe señal terrestre utilizable. Si no llega con calidad suficiente, preparamos el acceso oficial de Telemadrid en una Smart TV o dispositivo compatible.</p><p>También revisamos los cortes de reproducción y la conexión de red para dejar una solución práctica en el televisor que utilizas.</p></article></div><details class="ac-rf-area"><summary>¿No tienes internet o buscas una solución por satélite?</summary><p>Estudiamos la instalación disponible y comprobamos si el canal concreto cuenta con una vía de recepción por satélite utilizable y autorizada para tu caso. Confirmamos emisión, equipo y condiciones antes de presupuestar una parabólica; no todos los canales autonómicos se reciben con el mismo sistema.</p></details><p><a class="ac-pro-link" href="#ac-consulta">Solicitar instalación: indica localidad y canal que quieres ver →</a></p><p class="ac-pro-note">La recepción TDT fuera de la comunidad de origen depende de la señal real en el inmueble. Los directos y contenidos por internet dependen de la disponibilidad y compatibilidad del servicio oficial. Referencias de las emisiones: <a href="https://www.cmmedia.es/play/en-directo">Castilla-La Mancha Media</a> · <a href="https://www.telemadrid.es/donde-ver-telemadrid/">Telemadrid</a>.</p></div></section>`;
export function sections(main){
 const result=[];let depth=0,start=-1;
 for(const m of main.matchAll(/<\/?section\b[^>]*>/gi)){
  if(/^<section/i.test(m[0])){if(depth++===0)start=m.index;}
  else if(--depth===0)result.push(main.slice(start,m.index+m[0].length));
 }
 assert.equal(depth,0,'Secciones desequilibradas');return result;
}
// Enlaces a las provincias ya presentes en el directorio; no crea nuevas zonas.
export const northProvinces = [
 ['bizkaia','Bizkaia'],['burgos','Burgos'],['cantabria','Cantabria'],
 ['alava','Álava'],['gipuzkoa','Gipuzkoa'],['navarra','Navarra'],
 ['asturias','Asturias'],['la-rioja','La Rioja'],['leon','León'],
 ['palencia','Palencia'],['valladolid','Valladolid'],['soria','Soria'],
 ['zamora','Zamora'],['salamanca','Salamanca'],['segovia','Segovia']
];
export function northNavigation(html){
 const links=northProvinces.filter(([slug])=>html.includes(`href="/${slug}/"`));
 assert.equal(links.length,northProvinces.length,'Faltan provincias del norte en el directorio de portada');
 return `<section class="section ac-north" id="provincias-norte" aria-labelledby="north-title"><div class="w"><h2 id="north-title">Antenistas en el norte y Castilla y León</h2><p>Elige tu provincia y después tu municipio para consultar el servicio de antenas TDT, parabólicas, porteros y videoporteros. Confirma disponibilidad y desplazamiento con el técnico.</p><div class="towns" role="navigation" aria-label="Provincias del norte y Castilla y León">${links.map(([slug,name])=>`<a href="/${slug}/">${name}</a>`).join('')}</div><p><a href="tel:+34641589394">Llamar al 641 589 394</a> · <a href="#ac-consulta">Preparar consulta por localidad</a></p></div></section>`;
}
export function layout(html){
 if(html.includes('data-ac-home-layout="v1"'))return html;
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);assert(main);
 const blocks=sections(main[1]);
 const find=re=>{const b=blocks.filter(x=>re.test(x));assert.equal(b.length,1,'Bloque de portada ambiguo: '+re);return b[0];};
 const hero=find(/^<section class="hero/),services=find(/^<section id="servicios"/),professional=find(/^<section[^>]*id="instalaciones-profesionales"/),zones=find(/^<section id="zonas"/),local=find(/^<section class="section"><div class="w local">/),trust=find(/^<section class="trust-home"/),stats=find(/^<section class="home-stats"/),contact=find(/^<section id="contacto"/);
 const madrid=find(/^<section[^>]*id="servicio-madrid"/);
 assert.equal(blocks.length,9,'Hay bloques nuevos: revisar su ubicación');
 const quick=html.match(/<section class="ac-quick-section"[\s\S]*?<\/section>/)?.[0];assert(quick,'Falta consulta regional');
 const about='<section class="ac-about" aria-label="Cómo trabajamos">'+local+trust+'</section>';
 const consultation=quick.replace('<div class="ac-quick-wrap">','<div class="ac-quick-wrap" id="contacto">');
 // El resumen estadístico repetía atención directa/24 horas y contaba nueve servicios de forma fija.
 let output=html.replace(quick,'').replace(main[0],'<main data-ac-home-layout="v1">'+hero+northNavigation(zones)+services+solutions+professional+about+consultation+madrid+zones+'</main>');
 for(const id of ['servicios','zonas','contacto','ac-consulta','instalaciones-profesionales','soluciones-canales'])assert.equal((output.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'Ancla duplicada o ausente: '+id);
 assert.equal(output.match(/<h1\b/g)?.length,1);
 for(const image of [...html.matchAll(/<img\b[^>]*>/g)].map(x=>x[0]))assert(output.includes(image),'Imagen eliminada');
 for(const re of [/<link\b[^>]*rel="canonical"[^>]*>/,/<meta\b[^>]*name="robots"[^>]*>/,/<header\b[\s\S]*?<\/header>/,/<div class="mobilebar"[\s\S]*?<\/div>/])assert.equal(output.match(re)?.[0],html.match(re)?.[0]);
 return output;
}
export function applyHomeLayout(root='public') {const file=path.join(root,'index.html');fs.writeFileSync(file,layout(fs.readFileSync(file,'utf8')));console.log('PORTADA OK: servicios, soluciones de canales, profesionales, atención, consulta y localidades agrupados.');}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)applyHomeLayout();
