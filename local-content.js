import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const ROOT='public';
const HERO_SUBTITLE='Técnico en instalación, reparación y mantenimiento de antenas, porteros automáticos y videoporteros';
const hash=s=>[...s].reduce((a,c)=>(a*33+c.charCodeAt(0))>>>0,5381);
const pick=(arr,key,salt='')=>arr[hash(`${key}|${salt}`)%arr.length];
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const copy={
reparacion:[
l=>`Revisamos averías de antena en ${l} empezando por la señal y la distribución antes de cambiar equipos. Trabajamos con antenas individuales y colectivas, amplificadores, cabeceras, centrales, módulos monocanal, fuentes, cableado, repartidores, derivadores y tomas.`,
l=>`Para una avería de televisión en ${l} comprobamos antena, nivel y calidad de señal, amplificación y red de distribución. Reparamos instalaciones individuales y comunitarias y sustituimos únicamente los elementos que realmente están fallando.`,
l=>`En ${l} atendemos pérdida de canales, señal inestable y problemas de amplificación tanto en viviendas como en comunidades. El diagnóstico puede incluir antena, cabecera, amplificadores, fuentes, cableado, repartidores y tomas.`,
l=>`Una instalación de antena puede fallar por recepción, amplificación o distribución. En ${l} revisamos el sistema completo y actuamos sobre antenas individuales o colectivas, cabeceras, monocanales, amplificadores y cableado según el origen real de la avería.`,
l=>`Reparamos e instalamos sistemas de antena en ${l} para viviendas y comunidades. Antes de renovar una instalación comprobamos señal, amplificación, fuentes, cableado y distribución para evitar sustituciones innecesarias.`],
tdt:[
l=>`Instalamos, orientamos y reparamos antenas TDT en ${l}. Si faltan canales o aparecen cortes, medimos la señal y revisamos antena, amplificación, cableado, repartidores y tomas de la vivienda o comunidad.`,
l=>`Para problemas de TDT en ${l} comprobamos primero nivel y calidad de recepción. Ajustamos antenas individuales y colectivas y revisamos amplificadores y distribución cuando la señal llega débil o inestable a los televisores.`,
l=>`En ${l} realizamos instalación y mantenimiento de antenas TDT, además de diagnóstico de pixelaciones, canales que desaparecen y pérdidas de señal. Revisamos desde la antena hasta las tomas interiores.`,
l=>`Atendemos instalaciones TDT nuevas y averías en ${l}. Orientación, estado de antena, amplificación y red coaxial se comprueban como un conjunto para dejar una recepción estable.`,
l=>`Las averías TDT no siempre están en la antena. En ${l} revisamos también fuentes, amplificadores, repartidores, derivadores, cableado y tomas antes de decidir qué componente conviene reparar o sustituir.`],
parabolicas:[
l=>`Instalamos y ajustamos antenas parabólicas en ${l}, revisando orientación, fijaciones, LNB, conectores y cableado. También diagnosticamos pérdidas de señal y problemas de distribución de satélite.`,
l=>`En ${l} realizamos montaje, orientación y reparación de parabólicas para instalaciones individuales y colectivas. Comprobamos señal, LNB y conexiones para localizar la causa de cortes o falta de recepción.`,
l=>`Si una parabólica ha perdido señal en ${l}, revisamos su orientación y estado mecánico además del LNB, conectores y cableado. Cuando procede, reajustamos la instalación sin sustituir más material del necesario.`,
l=>`Trabajamos con antenas parabólicas en ${l} para nuevas instalaciones, mantenimiento y averías. El ajuste se realiza comprobando recepción y distribución para conseguir una señal estable.`,
l=>`La instalación de satélite en ${l} puede requerir desde orientar la parabólica hasta revisar LNB, conectores o cableado. Comprobamos cada elemento antes de plantear una renovación completa.`],
porteros:[
l=>`En ${l} instalamos, reparamos y renovamos porteros automáticos y videoporteros. Revisamos placa de calle, pulsadores, telefonillos, monitores, alimentación y cableado, y mantenemos equipos antiguos cuando todavía es razonable repararlos.`,
l=>`Atendemos averías de porteros y videoporteros en ${l} tanto en viviendas como en comunidades. Comprobamos llamada, audio, apertura, vídeo, fuentes y cableado antes de decidir entre reparación y renovación.`,
l=>`Para un portero automático que ha dejado de funcionar en ${l}, revisamos primero alimentación, placa, pulsadores, telefonillos y cableado. También instalamos videoporteros y renovamos sistemas antiguos cuando compensa actualizar la instalación.`,
l=>`En ${l} trabajamos sobre instalaciones de portero existentes y sobre equipos nuevos. Reparamos fallos de llamada, audio, apertura o imagen y podemos sustituir sistemas obsoletos por porteros o videoporteros actuales.`,
l=>`Porteros automáticos y videoporteros en ${l}: diagnóstico de averías, reparación de componentes y renovación completa cuando el sistema está obsoleto. El objetivo es identificar primero dónde está el fallo.`],
movil:[
l=>`Para viviendas de ${l} con cobertura móvil débil estudiamos la señal disponible antes de instalar una antena exterior. La ubicación, orientación y cableado se adaptan a la recepción real que existe en el inmueble.`,
l=>`En ${l} podemos valorar soluciones de antena exterior cuando dentro de la vivienda llega poca señal de telefonía móvil. Primero comprobamos la cobertura disponible para saber si la instalación puede aportar una mejora útil.`,
l=>`Las soluciones de cobertura móvil en ${l} se plantean a partir de una comprobación previa de señal. Cuando es viable, instalamos antena exterior y definimos orientación y cableado según la vivienda.`,
l=>`Si la señal móvil es pobre dentro de una vivienda de ${l}, revisamos qué recepción existe en el exterior antes de recomendar una instalación. Evitamos montar equipos sin comprobar previamente que la solución sea adecuada.`,
l=>`Atendemos consultas de cobertura móvil en viviendas de ${l}. La solución puede incluir antena exterior, orientación y cableado, siempre después de comprobar la señal disponible en la zona concreta.`],
electricidad:[
l=>`También atendemos pequeñas averías eléctricas domésticas en ${l}: apagones, cortocircuitos, derivaciones, enchufes, interruptores, iluminación y elementos del cuadro eléctrico.`,
l=>`En viviendas de ${l} podemos intervenir en reparaciones eléctricas domésticas como fallos de enchufes, interruptores, puntos de luz, protecciones y pequeños problemas de cuadro.`,
l=>`Nuestro servicio en ${l} incluye determinadas averías eléctricas del hogar, desde puntos de luz y mecanismos hasta protecciones del cuadro, siempre dentro del ámbito de una instalación doméstica.`,
l=>`Para pequeñas reparaciones eléctricas en ${l} localizamos primero el origen del fallo y actuamos sobre enchufes, interruptores, iluminación, automáticos o magnetotérmicos cuando corresponde.`,
l=>`Además de antenas y porteros, en ${l} atendemos ciertas averías eléctricas de vivienda: cortes, mecanismos, iluminación y elementos de protección del cuadro doméstico.`]
};


const usefulVariants=[
(d)=>`Si el aviso es en ${d.localidad}, cuéntanos si la incidencia afecta a una sola vivienda, a varias viviendas o a toda la comunidad. Ese dato ayuda a decidir si conviene empezar por una toma interior, la distribución o la cabecera de antena.`,
(d)=>`Para preparar una revisión en ${d.localidad}, indica qué ha dejado de funcionar, desde cuándo ocurre y si el fallo es continuo o intermitente. En antenas y TDT también ayuda saber si faltan todos los canales o solo algunos.`,
(d)=>`Cuando nos contactes desde ${d.localidad}, dinos si se trata de una instalación individual o comunitaria y qué síntoma observas. En porteros y videoporteros conviene distinguir entre fallo de llamada, audio, imagen o apertura.`,
(d)=>`Si necesitas asistencia en ${d.localidad}, puedes adelantar qué equipo está afectado y si el problema aparece en un único punto o en varios. Así la revisión puede centrarse desde el principio en recepción, amplificación, cableado o distribución.`,
(d)=>`En una avería de ${d.localidad} es útil saber si otros vecinos tienen el mismo problema. Si solo falla una vivienda, la comprobación puede empezar por su derivación y tomas; si afecta a varias, se revisa la parte común de la instalación.`,
(d)=>`Para una instalación nueva en ${d.localidad}, indica cuántos puntos necesitas y qué instalación existe actualmente. Para una reparación, describe el síntoma y si ya se ha probado otro televisor, toma, telefonillo o monitor.`,
(d)=>`Antes de desplazarnos a ${d.localidad}, una descripción breve de la avería permite orientar mejor la revisión. Puedes indicar si hay cortes, pixelaciones, ausencia total de señal, problemas de apertura o fallos de audio e imagen.`,
(d)=>`Si el servicio es en ${d.localidad}, no hace falta saber qué componente está averiado. Basta con explicar qué ocurre y a cuántos puntos o viviendas afecta; el diagnóstico debe localizar el origen antes de sustituir equipos.`
];
const secondFaqVariants=[
(d)=>[`¿Qué información ayuda a revisar una avería de antena en ${d.localidad}?`,`Indica si el problema afecta a una vivienda o a varias, qué canales o servicios fallan y desde cuándo ocurre. Con esos datos se puede orientar la comprobación de antena, amplificación, cableado y tomas.`],
(d)=>[`¿Conviene cambiar la antena si falla la señal en ${d.localidad}?`,`No necesariamente. Una pérdida de señal también puede venir de amplificadores, fuentes, conexiones, repartidores, cableado o tomas. Lo razonable es comprobar la instalación antes de sustituir la antena.`],
(d)=>[`¿Revisáis averías comunitarias en ${d.localidad}?`,`Sí, el servicio contempla instalaciones individuales y colectivas. Si el fallo afecta a varias viviendas, se revisan los elementos comunes de recepción, amplificación y distribución para localizar el origen.`],
(d)=>[`¿Qué se comprueba si falla un portero o videoportero en ${d.localidad}?`,`Depende del síntoma. Se puede revisar llamada, audio, imagen, apertura, alimentación, placa, telefonillo o monitor y cableado antes de decidir si procede reparar o renovar el equipo.`],
(d)=>[`¿Podéis revisar una TDT que se corta en ${d.localidad}?`,`Sí. Los cortes y pixelaciones requieren comprobar nivel y calidad de señal y seguir la instalación desde recepción y amplificación hasta la distribución y las tomas afectadas.`],
(d)=>[`¿Atendéis antenas parabólicas en ${d.localidad}?`,`Sí. Se puede revisar orientación, fijaciones, LNB, conectores y cableado, además de la distribución interior cuando la señal de satélite no llega correctamente.`]
];
function usefulLocalBlock(d,key){
  const comarca=String(d.comarca||'').trim();
  const context=comarca?` en la zona de ${comarca}, ${d.provincia}`:` en ${d.provincia}`;
  const text=pick(usefulVariants,key,'util')(d);
  return `<section class="band local-value" id="preparar-aviso"><div class="wrap detail"><div><div class="kicker">Preparar la revisión</div><h2>Antes de pedir asistencia técnica en ${esc(d.localidad)}</h2><p>${esc(text)}</p><p>La página corresponde al servicio en ${esc(d.localidad)}${esc(context)}. El teléfono de contacto es <a href="tel:+34641589394">641 589 394</a>.</p></div><aside class="help"><strong>Información útil</strong><span>Localidad, tipo de instalación, síntoma y a cuántos puntos o viviendas afecta.</span><a href="tel:+34641589394">Llamar 641 589 394</a></aside></div></section>`;
}
function addSecondFaq(html,d,key){
  const pair=pick(secondFaqVariants,key,'faq2')(d);
  return html.replace(/(<section class="faq local-faq">[\s\S]*?<\/details>)([\s\S]*?<\/div><\/section>)/i,`$1<details><summary>${esc(pair[0])}</summary><p>${esc(pair[1])}</p></details>$2`);
}

function replaceFirstParagraph(sectionHtml,text){return sectionHtml.replace(/<p>([\s\S]*?)<\/p>/i,`<p>${esc(text)}</p>`);}
function rewriteSection(html,id,text){const re=new RegExp(`(<section\\b[^>]*id=["']${id}["'][^>]*>[\\s\\S]*?<\\/section>)`,'i');return html.replace(re,m=>replaceFirstParagraph(m,text));}
function setHeroSubtitle(html){return html.replace(/(<div class="(?:copy|hero-copy)">[\s\S]*?<h1>[\s\S]*?<\/h1>\s*<h2>)[\s\S]*?(<\/h2>)/i,`$1${HERO_SUBTITLE}$2`);}

const homeFile=path.join(ROOT,'index.html');
if(fs.existsSync(homeFile)){const home=setHeroSubtitle(fs.readFileSync(homeFile,'utf8'));fs.writeFileSync(homeFile,home);}
for(const d of localidades){const file=path.join(ROOT,d.provinciaSlug,d.slug,'index.html');if(!fs.existsSync(file))throw new Error(`Contenido local: falta ${file}`);let html=setHeroSubtitle(fs.readFileSync(file,'utf8'));const key=`${d.provinciaSlug}/${d.slug}`;html=rewriteSection(html,'reparacion',pick(copy.reparacion,key,'reparacion')(d.localidad));html=rewriteSection(html,'tdt',pick(copy.tdt,key,'tdt')(d.localidad));html=rewriteSection(html,'parabolicas',pick(copy.parabolicas,key,'parabolicas')(d.localidad));html=rewriteSection(html,'porteros',pick(copy.porteros,key,'porteros')(d.localidad));html=rewriteSection(html,'telefonia-movil',pick(copy.movil,key,'movil')(d.localidad));html=rewriteSection(html,'reparaciones-electricas',pick(copy.electricidad,key,'electricidad')(d.localidad));if(!html.includes('id="preparar-aviso"'))html=html.replace('<section class="faq local-faq">',usefulLocalBlock(d,key)+'<section class="faq local-faq">');html=addSecondFaq(html,d,key);fs.writeFileSync(file,html);}
console.log(`Contenido SEO modular aplicado de forma determinista a ${localidades.length} localidades.`);
