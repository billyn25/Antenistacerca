import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'public';
const TOWN_IMAGE = 'https://images.unsplash.com/photo-1541698265912-0a5606dcf0f8?auto=format&fit=crop&fm=jpg&q=82&w=1600';
const MOBILE_IMAGE = 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200';
const ELECTRIC_IMAGE = 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1200';
const forbidden = [
  'Una página completa para cada localidad',
  'Todo en el mismo HTML',
  'Servicios, zona, preguntas y contacto funcionan mediante anclas internas'
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

const htmlFiles = walk(ROOT).filter(p => p.endsWith('.html'));
let townCount = 0;

for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file).split(path.sep);
  if (rel.length !== 3 || rel[2] !== 'index.html') continue;

  let h = fs.readFileSync(file, 'utf8');
  const m = h.match(/<h1>Antenista en ([^<]+)<\/h1>/i);
  if (!m) continue;
  const town = m[1].trim();

  h = h.replace(
    /<aside class="sidebox"><strong>Todo en el mismo HTML<\/strong><p>Servicios, zona, preguntas y contacto funcionan mediante anclas internas, sin páginas separadas\.<\/p><\/aside>/i,
    `<aside class="sidebox"><strong>Instalación y reparación</strong><p>Revisamos la instalación completa para localizar la avería y ofrecer una solución adecuada en ${town}.</p></aside>`
  );

  h = h.replace(
    /<div class="sidebox"><strong>Antenista Cerca<\/strong><p>Una página completa para cada localidad, con su contenido local y pueblos cercanos enlazados\.<\/p><\/div>/i,
    `<div class="sidebox"><strong>Servicio en ${town}</strong><p>Atención para viviendas, comunidades y negocios, también en localidades próximas.</p></div>`
  );

  h = h.replace(
    /(<div class="localpic"><img src=")[^"]+(" alt="[^"]+">)/i,
    `$1${TOWN_IMAGE}$2`
  );

  h = h.replaceAll('Porteros y videoporteros', 'Porteros automáticos y videoporteros');
  h = h.replaceAll('Reparación de porteros y videoporteros', 'Reparación de porteros automáticos y videoporteros');
  h = h.replaceAll('porteros y videoporteros', 'porteros automáticos y videoporteros');

  if (!h.includes('href="#telefonia-movil"')) {
    h = h.replace(
      '</div></section>\n<section class="local wrap">',
      `<a class="card" href="#telefonia-movil"><img src="${MOBILE_IMAGE}" alt="Antena para mejorar cobertura móvil"><h3>Cobertura móvil</h3><p>Antenas de telefonía móvil para viviendas con señal débil.</p></a><a class="card" href="#reparaciones-electricas"><img src="${ELECTRIC_IMAGE}" alt="Cuadro eléctrico de vivienda"><h3>Reparaciones eléctricas</h3><p>Instalación y reparación de automáticos en cuadros eléctricos de vivienda.</p></a></div></section>\n<section class="local wrap">`
    );
  } else if (!h.includes('href="#reparaciones-electricas"')) {
    h = h.replace(
      '</div></section>\n<section class="local wrap">',
      `<a class="card" href="#reparaciones-electricas"><img src="${ELECTRIC_IMAGE}" alt="Cuadro eléctrico de vivienda"><h3>Reparaciones eléctricas</h3><p>Instalación y reparación de automáticos en cuadros eléctricos de vivienda.</p></a></div></section>\n<section class="local wrap">`
    );
  }

  if (!h.includes('id="telefonia-movil"')) {
    const mobileBlock = `<section class="twocol wrap" id="telefonia-movil"><div><div class="kicker">Cobertura móvil</div><h2>Antenas de telefonía móvil en ${town}</h2><p>Instalamos antenas exteriores y soluciones de recepción para mejorar la cobertura de telefonía móvil en viviendas unifamiliares con señal débil o zonas interiores con poca cobertura. Primero comprobamos la señal disponible para recomendar una solución adecuada.</p></div><aside class="sidebox"><strong>Mejor señal en casa</strong><p>Orientación, cableado y ubicación de la antena adaptados a la vivienda y a la cobertura disponible en la zona.</p></aside></section>`;
    h = h.replace('<section class="band" id="porteros">', mobileBlock + '<section class="band" id="porteros">');
  }

  if (!h.includes('id="reparaciones-electricas"')) {
    const electricBlock = `<section class="twocol wrap" id="reparaciones-electricas"><div><div class="kicker">Electricidad en el hogar</div><h2>Reparaciones eléctricas en el hogar en ${town}</h2><p>Realizamos pequeñas reparaciones eléctricas en viviendas, incluida la instalación y sustitución de automáticos, magnetotérmicos y otros elementos del cuadro eléctrico doméstico.</p></div><aside class="sidebox"><strong>Cuadros eléctricos de vivienda</strong><p>Revisamos el problema antes de sustituir componentes y actuamos sobre protecciones y elementos del cuadro cuando la intervención corresponde a una instalación doméstica.</p></aside></section>`;
    h = h.replace('<section class="zone wrap" id="zona">', electricBlock + '<section class="zone wrap" id="zona">');
  }

  if (!h.includes('data-layout-services="6"')) {
    h = h.replace('</head>', `<style data-layout-services="6">@media (min-width:1000px){.wrap{width:min(1280px,calc(100% - 48px))}.cards{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.card img{height:175px}}@media (max-width:640px){.cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.card{min-width:0}.card h3{overflow-wrap:anywhere}}</style></head>`);
  }

  h = h.replace(
    /(<meta name="description" content=")([^"]*)(">)/i,
    (all,a,desc,c) => {
      const extra = ` Porteros automáticos, videoporteros y soluciones de cobertura móvil en ${town}.`;
      return desc.toLowerCase().includes('porteros automáticos') ? all : `${a}${desc.replace(/\.?$/, '.')}${extra}${c}`;
    }
  );

  h = h.replace(
    /("serviceType"\s*:\s*\[)([^\]]*)(\])/i,
    (all,a,list,c) => {
      let next = list;
      if (!next.includes('Antenas de telefonía móvil')) next += ',"Antenas de telefonía móvil"';
      if (!next.includes('Porteros automáticos')) next += ',"Porteros automáticos"';
      if (!next.includes('Reparaciones eléctricas en el hogar')) next += ',"Reparaciones eléctricas en el hogar"';
      return `${a}${next}${c}`;
    }
  );

  fs.writeFileSync(file, h);
  townCount++;
}

// Portada: sincronizar los mismos seis servicios y el mismo equilibrio visual.
const homeFile = path.join(ROOT, 'index.html');
if (fs.existsSync(homeFile)) {
  let h = fs.readFileSync(homeFile, 'utf8');

  h = h.replaceAll('Porteros y videoporteros', 'Porteros automáticos y videoporteros');

  h = h.replace(
    /<article class="card"><img src="[^"]+" alt="Reparación de antenas"><div><h3>Comunidades<\/h3><p>Instalaciones colectivas, amplificación y señal\.<\/p><\/div><\/article>/,
    `<article class="card"><img src="${MOBILE_IMAGE}" alt="Reparación de antenas"><div><h3>Reparación de antenas</h3><p>Averías, señal, amplificadores y cableado.</p></div></article>`
  );

  if (!h.includes('<h3>Cobertura móvil</h3>')) {
    const extraCards = `<article class="card"><img src="${MOBILE_IMAGE}" alt="Antena para mejorar cobertura móvil"><div><h3>Cobertura móvil</h3><p>Antenas para mejorar la señal de telefonía móvil en viviendas unifamiliares.</p></div></article><article class="card"><img src="${ELECTRIC_IMAGE}" alt="Cuadro eléctrico de vivienda"><div><h3>Reparaciones eléctricas</h3><p>Instalación y reparación de automáticos en cuadros eléctricos de vivienda.</p></div></article>`;
    h = h.replace(/(<\/div><\/div><\/section><section id="zonas")/, `${extraCards}$1`);
  }

  if (!h.includes('data-home-services="6"')) {
    h = h.replace('</head>', `<style data-home-services="6">@media (min-width:1000px){.w{width:min(1280px,calc(100% - 48px))}.cards{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}}@media (max-width:850px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}</style></head>`);
  }

  fs.writeFileSync(homeFile, h);
}

const failures = [];
for (const file of htmlFiles) {
  const h = fs.readFileSync(file, 'utf8');
  for (const text of forbidden) {
    if (h.includes(text)) failures.push(`${file}: ${text}`);
  }
}

if (failures.length) {
  console.error('Build audit failed:\n' + failures.join('\n'));
  process.exit(1);
}

console.log(`Audited ${townCount} town pages and synchronized six homepage services.`);
