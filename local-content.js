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

function replaceFirstParagraph(sectionHtml,text){return sectionHtml.replace(/<p>([\s\S]*?)<\/p>/i,`<p>${esc(text)}</p>`);}
function rewriteSection(html,id,text){const re=new RegExp(`(<section\\b[^>]*id=["']${id}["'][^>]*>[\\s\\S]*?<\\/section>)`,'i');return html.replace(re,m=>replaceFirstParagraph(m,text));}
function setHeroSubtitle(html){return html.replace(/(<div class="(?:copy|hero-copy)">[\s\S]*?<h1>[\s\S]*?<\/h1>\s*<h2>)[\s\S]*?(<\/h2>)/i,`$1${HERO_SUBTITLE}$2`);}

const homeFile=path.join(ROOT,'index.html');
if(fs.existsSync(homeFile)){const home=setHeroSubtitle(fs.readFileSync(homeFile,'utf8'));fs.writeFileSync(homeFile,home);}
for(const d of localidades){const file=path.join(ROOT,d.provinciaSlug,d.slug,'index.html');if(!fs.existsSync(file))throw new Error(`Contenido local: falta ${file}`);let html=setHeroSubtitle(fs.readFileSync(file,'utf8'));const key=`${d.provinciaSlug}/${d.slug}`;html=rewriteSection(html,'reparacion',pick(copy.reparacion,key,'reparacion')(d.localidad));html=rewriteSection(html,'tdt',pick(copy.tdt,key,'tdt')(d.localidad));html=rewriteSection(html,'parabolicas',pick(copy.parabolicas,key,'parabolicas')(d.localidad));html=rewriteSection(html,'porteros',pick(copy.porteros,key,'porteros')(d.localidad));html=rewriteSection(html,'telefonia-movil',pick(copy.movil,key,'movil')(d.localidad));html=rewriteSection(html,'reparaciones-electricas',pick(copy.electricidad,key,'electricidad')(d.localidad));fs.writeFileSync(file,html);}
console.log(`Contenido SEO modular aplicado de forma determinista a ${localidades.length} localidades.`);
