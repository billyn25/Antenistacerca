import fs from 'node:fs';
import path from 'node:path';

const blocks={
  'pina-de-campos':`<section class="town-unique-local"><div class="wrap"><div class="kicker">Servicio local en Piña de Campos</div><h2>Antenas y porteros en Piña de Campos con revisión de señal y distribución</h2><p>En Piña de Campos atendemos instalaciones de televisión en viviendas y comunidades donde la avería puede estar tanto en la recepción como en la red interior. Comprobamos antena TDT, orientación, nivel y calidad de señal, amplificadores, fuentes, repartidores, derivadores, cableado y tomas antes de decidir qué elemento conviene reparar o sustituir.</p><p>También realizamos nuevas instalaciones de antena, ajustes de parabólicas y trabajos sobre porteros automáticos y videoporteros. Si el problema afecta solo a una vivienda o a una rama de la instalación, seguimos ese recorrido para evitar cambios innecesarios en toda la comunidad. En porteros revisamos llamada, audio, apertura, alimentación y cableado antes de valorar una renovación completa.</p></div></section>`,
  'pomar-de-valdivia':`<section class="town-unique-local"><div class="wrap"><div class="kicker">Servicio técnico en Pomar de Valdivia</div><h2>Instalación y reparación de TDT, amplificación y videoporteros en Pomar de Valdivia</h2><p>En Pomar de Valdivia trabajamos con antenas individuales y colectivas, especialmente cuando hay señal débil, canales que desaparecen o diferencias entre distintas tomas. Medimos la recepción disponible y revisamos amplificación, fuentes, conectores y red coaxial para distinguir si la incidencia viene de la antena, de un equipo de cabecera o de la distribución interior.</p><p>Podemos instalar antenas TDT nuevas, sustituir amplificadores cuando realmente están averiados, orientar parabólicas y revisar sistemas de portero y videoportero. En estos últimos comprobamos placa de calle, telefonillos o monitores, fuente de alimentación y apertura de puerta, intentando conservar los elementos que siguen funcionando cuando la reparación resulta razonable.</p></div></section>`
};

for(const [slug,block] of Object.entries(blocks)){
  const file=path.join('public','palencia',slug,'index.html');
  if(!fs.existsSync(file)) throw new Error(`Contenido único Palencia: falta ${file}`);
  let html=fs.readFileSync(file,'utf8');
  if(html.includes('town-unique-local')) continue;
  const marker='<section class="faq local-faq">';
  if(!html.includes(marker)) throw new Error(`Contenido único Palencia: no encuentro FAQ en ${slug}`);
  html=html.replace(marker,block+marker);
  fs.writeFileSync(file,html);
}
console.log('Contenido local reforzado en Piña de Campos y Pomar de Valdivia.');
