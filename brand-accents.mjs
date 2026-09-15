import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Detalles de marca exclusivamente visuales. No modifica textos, fotos ni enlaces.
export const STYLE_ID = 'ac-brand-accents-v1';
export const CSS = `
:root{--ac-orange:#ff8700;--ac-orange-soft:#fff2e3;--ac-accent-ink:#082b4d}
/* Los checks del hero coordinan con el logo; los botones conservan sus colores. */
.hero .checks li::before{background:var(--ac-orange);color:var(--ac-accent-ink)}
/* Rayita discreta solo en títulos de sección, nunca en H1, tarjetas o footer. */
.services>h2::after,#servicios>.w>h2::after,#zonas>.w>h2::after,.zone h2::after,.faq>h2::after,.faq>.wrap>h2::after,.province-seo>h2::after,.alpha-localities>h2::after{content:"";display:block;width:44px;max-width:100%;height:3px;margin:10px 0 12px;border-radius:2px;background:var(--ac-orange)}
/* El índice provincial no debe heredar la ocultación del menú móvil. */
.alpha-localities nav.alpha-nav{display:flex!important}
.alpha-localities .alpha-nav a:focus-visible,.alpha-localities .alpha-nav a:active{background:var(--ac-orange-soft);border-color:var(--ac-orange);color:var(--ac-accent-ink)}
.alpha-localities .alpha-nav a:focus-visible{outline:2px solid var(--ac-accent-ink);outline-offset:3px}
@media(hover:hover){.alpha-localities .alpha-nav a:hover{background:var(--ac-orange-soft);border-color:var(--ac-orange);color:var(--ac-accent-ink)}}
`;

export function applyAccents(html) {
  if (typeof html !== 'string' || !/<\/head>/i.test(html)) throw new Error('Marca naranja: falta cierre head');
  const block = `<style id="${STYLE_ID}">${CSS}</style>`;
  const previous = new RegExp(`<style\\b[^>]*\\bid=["']${STYLE_ID}["'][^>]*>[\\s\\S]*?<\\/style>`, 'gi');
  return html.replace(previous, '').replace(/<\/head>/i, block + '</head>');
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : entry.isFile() && file.endsWith('.html') ? [file] : [];
  });
}

export function main(root = 'public') {
  if (!fs.existsSync(root)) throw new Error('Marca naranja: falta public/');
  const files = walk(root);
  if (!files.length) throw new Error('Marca naranja: no hay páginas HTML');
  // Validar toda la salida antes de escribir. No añade recursos remotos ni JS al navegador.
  const changes = files.map(file => [file, applyAccents(fs.readFileSync(file, 'utf8'))]);
  for (const [file, html] of changes) fs.writeFileSync(file, html);
  console.log(`MARCA NARANJA OK: ${changes.length} páginas; checks, títulos e índice alfabético. Contenido, fotografías y contactos intactos.`);
  return changes.length;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
