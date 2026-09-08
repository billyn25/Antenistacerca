import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const OUT = 'public';
const LOCAL_IMAGE = 'https://fotos.hoteles.net/articulos/ea-bizkaia-9291-1.jpg';

for (const d of localidades) {
  const file = path.join(OUT, d.provinciaSlug, d.slug, 'index.html');
  if (!fs.existsSync(file)) continue;

  let html = fs.readFileSync(file, 'utf8');

  // Sustituye solo la imagen panorámica inferior de la sección local.
  html = html.replace(
    /<div class="localpic">\s*<img\b[^>]*>\s*<\/div>/i,
    `<div class="localpic"><img src="${LOCAL_IMAGE}" alt="Vista de una localidad de Bizkaia" loading="lazy" decoding="async"></div>`
  );

  // Elimina de raíz cualquier texto de maqueta que hubiera quedado en la plantilla o en una versión anterior.
  html = html
    .replace(/<strong>\s*Antenista Cerca\s*<\/strong>\s*<p>\s*Una página completa para cada localidad[^<]*<\/p>/gi, '')
    .replace(/<p>\s*Una página completa para cada localidad[^<]*<\/p>/gi, '')
    .replace(/Una página completa para cada localidad,?\s*con su contenido local y pueblos cercanos enlazados\.?/gi, '');

  fs.writeFileSync(file, html);
}

console.log(`Postprocesadas ${localidades.length} páginas locales: foto inferior actualizada y texto de maqueta eliminado.`);
