import fs from 'node:fs';
import path from 'node:path';

const OUT='public';
const HERO='/assets/hero-antennista.png';
const PUEBLO='https://images.pexels.com/photos/33057075/pexels-photo-33057075.jpeg?cs=srgb&fm=jpg';
const MOBILE='https://static.wixstatic.com/media/16d86f_06b7174cbb5048b89a864c018dfc65c8~mv2.jpg/v1/fill/w_924,h_842,al_c,q_85/16d86f_06b7174cbb5048b89a864c018dfc65c8~mv2.jpg';

function walk(dir){
  for(const name of fs.readdirSync(dir)){
    const p=path.join(dir,name);
    const st=fs.statSync(p);
    if(st.isDirectory()) walk(p);
    else if(name==='index.html') patch(p);
  }
}

function patch(file){
  let h=fs.readFileSync(file,'utf8');

  // Imágenes comunes
  h=h.replace(/(<div class="heroimg"><img src=")[^"]+("[^>]*>)/,`$1${HERO}$2`);
  h=h.replace(/(<div class="hero-photo"><img src=")[^"]+("[^>]*>)/,`$1${HERO}$2`);
  h=h.replace(/(<div class="localpic"><img src=")[^"]+("[^>]*>)/,`$1${PUEBLO}$2`);

  // Cinco tarjetas en escritorio; móvil conserva 2 columnas por sus media queries.
  h=h.replace(/grid-template-columns:repeat\(4,1fr\);gap:18px;margin-top:22px/g,'grid-template-columns:repeat(5,1fr);gap:16px;margin-top:22px');

  // Refuerzo de “porteros automáticos”.
  h=h.replace(/<h3>Porteros y videoporteros<\/h3>/g,'<h3>Porteros automáticos y videoporteros</h3>');
  h=h.replace(/Reparación de porteros y videoporteros/g,'Reparación de porteros automáticos y videoporteros');

  // Tarjeta nueva en páginas de localidad.
  if(!h.includes('href="#telefonia"')){
    h=h.replace(
      /(<a class="card" href="#reparacion">[\s\S]*?<\/a>)(<\/div><\/section>)/,
      `$1<a class="card" href="#telefonia"><img src="${MOBILE}" alt="Antena exterior para mejorar cobertura móvil"><h3>Cobertura móvil</h3><p>Antenas de telefonía para mejorar la señal en viviendas unifamiliares.</p></a>$2`
    );
  }

  // Tarjeta nueva en portada.
  if(!h.includes('alt="Antena exterior para cobertura móvil"')){
    h=h.replace(
      /(<article class="card"><img[^>]+alt="Reparación de antenas"[\s\S]*?<\/article>)(<\/div><\/div><\/section>)/,
      `$1<article class="card"><img src="${MOBILE}" alt="Antena exterior para cobertura móvil"><div><h3>Cobertura móvil</h3><p>Antenas de telefonía para mejorar la señal en viviendas unifamiliares.</p></div></article>$2`
    );
  }

  // Bloque SEO visible del servicio, una sola vez por página local.
  if(/<h1>Antenista en [^<]+<\/h1>/i.test(h) && !h.includes('id="telefonia"')){
    const town=(h.match(/<h1>Antenista en ([^<]+)<\/h1>/i)||[])[1]||'';
    const block=`<section class="twocol wrap" id="telefonia"><div><div class="kicker">Cobertura móvil</div><h2>Antenas de telefonía móvil en ${town}</h2><p>Instalamos antenas exteriores y soluciones de recepción para mejorar la cobertura de telefonía móvil en viviendas unifamiliares con señal débil o zonas interiores con poca cobertura. Primero comprobamos la señal disponible en el exterior para recomendar una solución adecuada.</p></div><aside class="sidebox"><strong>Mejor señal en casa</strong><p>Orientación, cableado y ubicación de la antena adaptados a la vivienda y a la cobertura disponible en la zona.</p></aside></section>`;
    h=h.replace(/(<section class="band" id="porteros">)/,`${block}$1`);
  }

  fs.writeFileSync(file,h);
}

walk(OUT);
console.log('Imágenes y servicio de cobertura móvil aplicados a portada y páginas locales.');
