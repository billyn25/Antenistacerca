import fs from 'node:fs';

function read(slug){const f=`public/zamora/${slug}/index.html`;if(!fs.existsSync(f))throw new Error(`Zamora SEO: falta ${f}`);return [f,fs.readFileSync(f,'utf8')];}
function write(f,h){fs.writeFileSync(f,h);}

{
  const [f,html0]=read('villaescusa');
  let h=html0;
  h=h.replace(/<title>[^<]*<\/title>/i,'<title>Antenista en Villaescusa, Zamora | Antenista Cerca</title>');
  h=h.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,'<meta name="description" content="Antenista en Villaescusa, Zamora. Instalación y reparación de antenas TDT, amplificadores, parabólicas, porteros y videoporteros en la zona." />');
  if(!h.includes('zamora-villaescusa-unique')){
    const marker='<section class="faq local-faq">';
    const block='<section class="zamora-villaescusa-unique"><div class="wrap"><h2>Servicio técnico de antenas en Villaescusa, Zamora</h2><p>En Villaescusa revisamos instalaciones de televisión cuando hay pérdida de canales, pixelaciones o diferencias de señal entre tomas. Comprobamos antena, orientación, amplificación, fuentes, repartidores, derivadores, conectores y cableado para localizar la avería antes de cambiar equipos.</p><p>También instalamos antenas TDT, amplificadores, parabólicas y equipos de portero o videoportero, valorando si conviene reparar la instalación existente o renovar únicamente los elementos que lo necesitan.</p></div></section>';
    if(!h.includes(marker))throw new Error('Zamora SEO: falta FAQ en villaescusa');
    h=h.replace(marker,block+marker);
  }
  write(f,h);
}

const blocks={
  'morales-de-valverde':'<section class="zamora-local-fix"><div class="wrap"><h2>Antenas y señal de televisión en Morales de Valverde</h2><p>En Morales de Valverde atendemos viviendas con problemas de recepción TDT, cortes intermitentes o señal insuficiente. Revisamos captación, orientación, amplificación y distribución interior para separar fallos de antena de pérdidas en cableado, conectores o repartidores.</p><p>Podemos instalar antenas nuevas, sustituir amplificadores, ajustar sistemas de satélite y revisar porteros y videoporteros, manteniendo los componentes que sigan funcionando correctamente.</p></div></section>',
  'tabara':'<section class="zamora-local-fix"><div class="wrap"><h2>Instalación y reparación de antenas en Tábara</h2><p>En Tábara trabajamos sobre instalaciones individuales y comunitarias de televisión. Cuando faltan canales o la imagen se corta, medimos nivel y calidad de señal y comprobamos antena, cabecera, amplificación y red coaxial para localizar el origen real de la incidencia.</p><p>También realizamos renovaciones de antena TDT, equipos de amplificación, parabólicas y sistemas de portero automático o videoportero, priorizando una reparación localizada cuando la instalación todavía es aprovechable.</p></div></section>'
};
for(const [slug,block] of Object.entries(blocks)){
  const [f,html0]=read(slug);let h=html0;
  if(h.includes('zamora-local-fix'))continue;
  const marker='<section class="faq local-faq">';
  if(!h.includes(marker))throw new Error(`Zamora SEO: falta FAQ en ${slug}`);
  h=h.replace(marker,block+marker);write(f,h);
}
console.log('SEO Zamora corregido: Villaescusa, Morales de Valverde y Tábara.');
