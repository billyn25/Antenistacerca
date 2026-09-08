import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const OUT = 'public';
const LOCAL_IMAGE = 'https://fotos.hoteles.net/articulos/ea-bizkaia-9291-1.jpg';
const forbidden = [
  'Una página completa para cada localidad',
  'Todo en el mismo HTML',
  'Servicios, zona, preguntas y contacto funcionan mediante anclas internas'
];

for (const d of localidades) {
  const file = path.join(OUT, d.provinciaSlug, d.slug, 'index.html');
  if (!fs.existsSync(file)) continue;

  let html = fs.readFileSync(file, 'utf8');

  // La foto inferior incluye un <span> dentro de .localpic; por eso el reemplazo anterior no coincidía.
  html = html.replace(
    /(<div class="localpic">\s*<img\b)[^>]*(>)/i,
    `$1 src="${LOCAL_IMAGE}" alt="Vista de ${d.localidad}" loading="lazy" decoding="async"$2`
  );

  // Sustituye los dos bloques de texto de maqueta por contenido útil visible.
  html = html.replace(
    /<aside class="sidebox">\s*<strong>\s*Todo en el mismo HTML\s*<\/strong>\s*<p>\s*Servicios, zona, preguntas y contacto funcionan mediante anclas internas, sin páginas separadas\.\s*<\/p>\s*<\/aside>/gi,
    `<aside class="sidebox"><strong>Instalación y reparación</strong><p>Revisamos la instalación completa para localizar la avería y ofrecer una solución adecuada en ${d.localidad}.</p></aside>`
  );

  html = html.replace(
    /<div class="sidebox">\s*<strong>\s*Antenista Cerca\s*<\/strong>\s*<p>\s*Una página completa para cada localidad, con su contenido local y pueblos cercanos enlazados\.\s*<\/p>\s*<\/div>/gi,
    `<div class="sidebox"><strong>Servicio en ${d.localidad}</strong><p>Atención para viviendas, comunidades y negocios, también en localidades próximas de ${d.provincia}.</p></div>`
  );

  fs.writeFileSync(file, html);
}

const failures = [];
for (const d of localidades) {
  const file = path.join(OUT, d.provinciaSlug, d.slug, 'index.html');
  if (!fs.existsSync(file)) {
    failures.push(`${file}: no generado`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  for (const text of forbidden) {
    if (html.includes(text)) failures.push(`${file}: sigue presente '${text}'`);
  }
  if (!html.includes(LOCAL_IMAGE)) failures.push(`${file}: foto inferior no sustituida`);
}

if (failures.length) {
  console.error('AUDITORÍA DE BUILD FALLIDA:\n' + failures.join('\n'));
  process.exit(1);
}

console.log(`Auditadas ${localidades.length} páginas locales: foto inferior actualizada y textos de maqueta eliminados.`);
