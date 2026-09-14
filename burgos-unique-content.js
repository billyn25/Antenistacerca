import fs from 'node:fs';
import path from 'node:path';

const blocks={
  'condado-de-trevino':`<section class="town-unique-local"><div class="wrap"><div class="kicker">Servicio local en Condado de Treviño</div><h2>Revisión técnica de antenas, TDT y porteros en Condado de Treviño</h2><p>En Condado de Treviño atendemos instalaciones de televisión que necesitan una comprobación completa, tanto cuando faltan canales como cuando aparecen pixelaciones o diferencias de señal entre distintas tomas. Revisamos recepción, orientación de antena, amplificación, fuentes, repartidores, derivadores y cableado para separar un problema de captación de una avería interior. En comunidades también comprobamos la cabecera y la distribución antes de proponer sustituciones.</p><p>También instalamos y renovamos antenas TDT, parabólicas, amplificadores, cabeceras y equipos de portero automático o videoportero. Cuando el sistema existente todavía puede aprovecharse, priorizamos reparar la parte afectada; si la instalación está agotada u obsoleta, planteamos una renovación proporcionada. La misma revisión se aplica a fallos de llamada, audio, apertura, imagen, alimentación o cableado en porteros y videoporteros.</p></div></section>`,
  'fuentebureba':`<section class="town-unique-local"><div class="wrap"><div class="kicker">Servicio técnico en Fuentebureba</div><h2>Instalación y reparación de antenas y amplificación en Fuentebureba</h2><p>En Fuentebureba trabajamos sobre instalaciones individuales y colectivas de televisión, desde antenas TDT nuevas hasta averías en amplificadores, fuentes o redes coaxiales antiguas. Si la recepción es inestable, medimos nivel y calidad de señal y seguimos el recorrido hasta las tomas para localizar pérdidas en conectores, cableado, repartidores o derivadores. Así evitamos cambiar una antena cuando el origen real de la incidencia está en la amplificación o en la distribución interior.</p><p>Podemos instalar o sustituir amplificadores, cabeceras, centrales y módulos cuando la instalación lo requiere, además de orientar parabólicas y revisar LNB, conectores y cableado de satélite. Para porteros automáticos y videoporteros comprobamos placa de calle, alimentación, telefonillos, monitores y apertura antes de decidir si compensa reparar el equipo existente o renovar el sistema completo.</p></div></section>`
};

for(const [slug,block] of Object.entries(blocks)){
  const file=path.join('public','burgos',slug,'index.html');
  if(!fs.existsSync(file)) throw new Error(`Contenido único Burgos: falta ${file}`);
  let html=fs.readFileSync(file,'utf8');
  if(html.includes('town-unique-local')) continue;
  const marker='<section class="faq local-faq">';
  if(!html.includes(marker)) throw new Error(`Contenido único Burgos: no encuentro FAQ en ${slug}`);
  html=html.replace(marker,block+marker);
  fs.writeFileSync(file,html);
}
console.log('Contenido local reforzado en Condado de Treviño y Fuentebureba.');
