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

const imageFixCss = `
<style id="local-image-fix">
.localpic{min-height:0!important;aspect-ratio:16/10!important;overflow:hidden!important;border-radius:10px!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}
.localpic img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important}
@media(max-width:640px){.localpic{aspect-ratio:16/10!important;min-height:0!important}.localpic img{object-fit:cover!important;object-position:center!important}}
</style>`;

for (const d of localidades) {
  const file = path.join(OUT, d.provinciaSlug, d.slug, 'index.html');
  if (!fs.existsSync(file)) continue;

  let html = fs.readFileSync(file, 'utf8');

  html = html.replace(
    /(<div class="localpic">\s*<img\b)[^>]*(>)/i,
    `$1 src="${LOCAL_IMAGE}" alt="Vista de ${d.localidad}" loading="lazy" decoding="async"$2`
  );

  if (!html.includes('id="local-image-fix"')) {
    html = html.replace('</head>', `${imageFixCss}\n</head>`);
  }

  html = html.replace(
    /<aside class="sidebox">\s*<strong>\s*Todo en el mismo HTML\s*<\/strong>\s*<p>\s*Servicios, zona, preguntas y contacto funcionan mediante anclas internas, sin páginas separadas\.\s*<\/p>\s*<\/aside>/gi,
    `<aside class="sidebox"><strong>Instalación y reparación</strong><p>Revisamos la instalación completa para localizar la avería y ofrecer una solución adecuada en ${d.localidad}.</p></aside>`
  );

  html = html.replace(
    /<div class="sidebox">\s*<strong>\s*Antenista Cerca\s*<\/strong>\s*<p>\s*Una página completa para cada localidad, con su contenido local y pueblos cercanos enlazados\.\s*<\/p>\s*<\/div>/gi,
    `<div class="sidebox"><strong>Servicio en ${d.localidad}</strong><p>Atención para viviendas, comunidades y negocios, también en localidades próximas de ${d.provincia}.</p></div>`
  );

  html = html
    .replace(/<h2>Porteros y videoporteros en ([^<]+)<\/h2>/gi, '<h2>Reparación de porteros y videoporteros en $1</h2>')
    .replace(/Instalación y sustitución de porteros automáticos y videoporteros para viviendas y comunidades\./gi,
      `Reparación, instalación y sustitución de porteros automáticos y videoporteros para viviendas y comunidades de ${d.localidad}.`);

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
  if (!html.includes('id="local-image-fix"')) failures.push(`${file}: estilos de foto no aplicados`);
  if (!html.includes(`Reparación de porteros y videoporteros en ${d.localidad}`)) failures.push(`${file}: falta refuerzo de reparación de porteros/videoporteros`);
}

if (failures.length) {
  console.error('AUDITORÍA DE BUILD FALLIDA:\n' + failures.join('\n'));
  process.exit(1);
}

console.log(`Auditadas ${localidades.length} páginas locales: foto inferior corregida, textos de maqueta eliminados y reparación de porteros/videoporteros reforzada.`);
