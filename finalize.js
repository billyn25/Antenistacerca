import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'public';
const TOWN_IMAGE = 'https://images.unsplash.com/photo-1541698265912-0a5606dcf0f8?auto=format&fit=crop&fm=jpg&q=82&w=1600';
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

  const mobileBlock = `<section class="twocol wrap" id="telefonia-movil"><div><div class="kicker">Cobertura móvil</div><h2>Antenas de telefonía móvil en ${town}</h2><p>Instalamos soluciones de antena para mejorar la cobertura de telefonía móvil en viviendas unifamiliares con señal débil o sin cobertura en determinadas zonas de la vivienda.</p></div><aside class="sidebox"><strong>Mejora de cobertura</strong><p>Estudiamos la señal disponible y la instalación necesaria antes de proponer una solución, sin prometer resultados que no puedan comprobarse.</p></aside></section>`;

  if (!h.includes('id="telefonia-movil"')) {
    const marker = '<section class="band" id="porteros">';
    h = h.replace(marker, mobileBlock + marker);
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
    (all,a,list,c) => list.includes('Antenas de telefonía móvil') ? all : `${a}${list},"Antenas de telefonía móvil","Porteros automáticos"${c}`
  );

  fs.writeFileSync(file, h);
  townCount++;
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

console.log(`Audited ${townCount} town pages: local SEO and service coverage updated.`);
