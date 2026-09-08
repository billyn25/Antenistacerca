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
    /(<div class="localpic"><img src=")[^"]+(" alt="Vista de [^"]+">)/i,
    `$1${TOWN_IMAGE}$2`
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

console.log(`Audited ${townCount} town pages: filler removed and town image updated.`);
