import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

// Primer logo aprobado, adaptado al fondo blanco de la cabecera. No es un rediseño.
export const LOGO = '/assets/logo-antenista-cerca-v1.webp';
export const LOGO_SHA256 = 'a9ab2f077d8eaa0b8ffc101158627abe6373b7ac4610734ffb63b24835c3a326';
const CSS_PATH = '/assets/header-brand-v1.css';
export const CSS = `
/* Solo marca de cabecera. No afecta al hero, servicios, botones ni footer. */
header a.brand.ac-brand-logo{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:0;min-width:0;width:max-content;max-width:100%}
header a.brand.ac-brand-logo>img{display:block;width:198px;max-width:100%;height:auto;aspect-ratio:440/147;object-fit:contain;filter:none;opacity:1;margin:0;padding:0;border:0;border-radius:0;box-shadow:none;background:#fff}
header a.brand.ac-brand-logo>small{display:block;margin:0;font-size:11px;line-height:1.2;white-space:nowrap}
@media(max-width:1100px){header a.brand.ac-brand-logo>img{width:176px}}
@media(max-width:640px){header a.brand.ac-brand-logo>img{width:150px}header a.brand.ac-brand-logo>small{font-size:10px}}
@media(max-width:359px){header a.brand.ac-brand-logo>img{width:136px}}
`;

export function validateLogo(file) {
  const b = fs.readFileSync(file);
  if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP' || b.readUInt32LE(4) + 8 !== b.length) throw new Error('Logo: WebP incompleto o inválido');
  if (crypto.createHash('sha256').update(b).digest('hex') !== LOGO_SHA256) throw new Error('Logo: archivo diferente al aprobado');
  return b.length;
}

export function transformHeader(html) {
  const headers = [...html.matchAll(/<header\b[^>]*>[\s\S]*?<\/header>/gi)];
  if (headers.length !== 1) throw new Error(`Logo: esperada una cabecera, encontradas ${headers.length}`);
  const header = headers[0][0];
  const anchors = [...header.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)].filter(m => {
    const opening = m[0].match(/^<a\b[^>]*>/i)[0];
    const classes = opening.match(/\bclass\s*=\s*(["'])(.*?)\1/i)?.[2] || '';
    return classes.split(/\s+/).includes('brand');
  });
  if (anchors.length !== 1) throw new Error(`Logo: esperada una marca, encontradas ${anchors.length}`);
  const oldBrand = anchors[0][0];
  let opening = oldBrand.match(/^<a\b[^>]*>/i)[0];
  opening = opening.replace(/\bclass\s*=\s*(["'])(.*?)\1/i, (_, quote, value) => `class=${quote}${[...new Set([...value.split(/\s+/), 'ac-brand-logo'])].join(' ')}${quote}`);
  if (!/\baria-label\s*=/i.test(opening)) opening = opening.replace(/>$/, ' aria-label="Antenista Cerca, inicio">');
  const slogan = oldBrand.match(/<small\b[^>]*>[\s\S]*?<\/small>/i)?.[0] || '';
  const brand = `${opening}<img class="brand-logo" src="${LOGO}" width="440" height="147" loading="eager" decoding="async" alt="ANTENISTA CERCA">${slogan}</a>`;
  const nextHeader = header.replace(oldBrand, brand);
  const hrefs = h => [...h.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)].map(m => m[2]);
  if (JSON.stringify(hrefs(header)) !== JSON.stringify(hrefs(nextHeader))) throw new Error('Logo: se alterarían enlaces de cabecera');
  if (!/<\/head>/i.test(html)) throw new Error('Logo: falta cierre head');
  let result = html.replace(header, nextHeader);
  if (!result.includes(`href="${CSS_PATH}"`)) result = result.replace(/<\/head>/i, `<link rel="stylesheet" href="${CSS_PATH}"></head>`);
  return result;
}

export function main(root = 'public', dataPath = 'src/localidades.json') {
  const bytes = validateLogo(path.join(root, LOGO.slice(1)));
  const towns = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const targets = ['index.html', ...towns.map(d => `${d.provinciaSlug}/${d.slug}/index.html`)];
  if (new Set(targets).size !== targets.length) throw new Error('Logo: rutas duplicadas');
  // Validar todo antes de escribir. Las provincias no tienen esta cabecera.
  const changes = targets.map(relative => {
    const file = path.join(root, relative);
    return [file, transformHeader(fs.readFileSync(file, 'utf8'))];
  });
  fs.writeFileSync(path.join(root, CSS_PATH.slice(1)), CSS);
  for (const [file, html] of changes) fs.writeFileSync(file, html);
  console.log(`LOGO OK: ${changes.length} cabeceras; archivo completo (${bytes} bytes); hero y contactos conservados.`);
  return { pages: changes.length, bytes };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
