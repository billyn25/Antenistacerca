import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with {type:'json'};
const home='public/index.html';
if(fs.existsSync(home)){
 let h=fs.readFileSync(home,'utf8');
 h=h.replace(/Reparamos amplificadores, cabeceras, centrales, fuentes y módulos monocanal cuando la instalación pierde nivel, calidad o canales\./g,'Instalamos, ampliamos y reparamos amplificadores, cabeceras, centrales, fuentes de alimentación y módulos monocanal para instalaciones individuales y colectivas.');
 fs.writeFileSync(home,h);
}
for(const d of localidades){
 const file=path.join('public',d.provinciaSlug,d.slug,'index.html');if(!fs.existsSync(file))continue;
 let h=fs.readFileSync(file,'utf8');
 h=h.replace('<h3>Reparación y amplificación</h3><p>Averías, amplificadores, cabeceras, monocanales y cableado.</p>','<h3>Amplificación y cabeceras</h3><p>Instalación, ampliación y reparación de amplificadores, cabeceras, monocanales y distribución.</p>');
 h=h.replace(/También reparamos amplificadores de antena, cabeceras y centrales de amplificación, módulos monocanal, fuentes de alimentación, cableado, repartidores, derivadores y tomas/g,'También instalamos, ampliamos y reparamos amplificadores de antena, cabeceras y centrales de amplificación, módulos monocanal, fuentes de alimentación, cableado, repartidores, derivadores y tomas');
 h=h.replace('<strong>Reparación y sustitución de amplificadores</strong><p>Reparamos amplificadores de interior y de mástil, fuentes de alimentación, centrales de amplificación y equipos de satélite. Revisamos primero la avería para sustituir únicamente lo necesario.</p>','<strong>Instalación, ampliación y reparación de amplificadores</strong><p>Instalamos equipos nuevos y ampliamos o reparamos amplificadores de interior y de mástil, fuentes de alimentación, centrales de amplificación, cabeceras y equipos de satélite. En averías revisamos primero la instalación para actuar únicamente donde sea necesario.</p>');
 fs.writeFileSync(file,h);
}
console.log(`Servicios de amplificación actualizados en portada y ${localidades.length} localidades.`);
