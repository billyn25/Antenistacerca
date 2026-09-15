import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

// Foto ya aprobada. No se modifica su encuadre ni su color.
export const HERO = '/assets/hero-antenista-panorama.webp';
export const HERO_SHA256 = '33afa9a51475a68e7a6b200903deee3f474728f1f1f03618c5cb5a6176496cc4';
export const WIDTH = 1916;
export const HEIGHT = 821;
const CSS_PATH = '/assets/hero-panorama-v2.css';
const WIDTHS = [480, 640, 768, 960, 1280, 1600, WIDTH];
const imageUrl = w => `/.netlify/images?url=${HERO}&amp;w=${w}&amp;q=90`;

export const CSS = `
/* Solo el hero, a todo el ancho. Textos HTML originales, foto sin velos. */
.hero.ac-hero-full{width:100%;max-width:none;margin:0;padding:0;background:#fff}
.hero.ac-hero-full>.hg,.hero.ac-hero-full>.hero-grid{display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:none;min-height:0;margin:0;padding:0;gap:0;position:relative;isolation:isolate}
.hero.ac-hero-full .heroimg,.hero.ac-hero-full .hero-photo{grid-area:1/1;align-self:center;position:relative;inset:auto;width:100%;max-width:none;height:auto;min-height:0;aspect-ratio:auto;overflow:hidden;margin:0;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none;filter:none;opacity:1}
.hero.ac-hero-full .heroimg::before,.hero.ac-hero-full .heroimg::after,.hero.ac-hero-full .hero-photo::before,.hero.ac-hero-full .hero-photo::after{display:none!important;content:none!important}
.hero.ac-hero-full .heroimg img,.hero.ac-hero-full .hero-photo img{display:block;position:static;inset:auto;width:100%;max-width:none;height:auto;aspect-ratio:${WIDTH}/${HEIGHT};object-fit:contain;object-position:center;margin:0;border-radius:0;filter:none!important;opacity:1!important;mix-blend-mode:normal}
.hero.ac-hero-full .copy,.hero.ac-hero-full .hero-copy{grid-area:1/1;position:relative;z-index:1;align-self:center;justify-self:start;box-sizing:border-box;width:min(43%,560px);max-width:none;min-width:0;margin:20px clamp(24px,4vw,80px);padding:22px;background:#fff;border:1px solid #dce5ec;border-radius:14px;box-shadow:0 8px 24px rgba(8,43,77,.12);overflow-wrap:anywhere}
.hero.ac-hero-full .copy h1,.hero.ac-hero-full .hero-copy h1{font-size:clamp(36px,3.3vw,50px);line-height:1.04}
.hero.ac-hero-full.ac-hero-long .copy h1,.hero.ac-hero-full.ac-hero-long .hero-copy h1{font-size:clamp(30px,2.65vw,42px)}
.hero.ac-hero-full .copy h2,.hero.ac-hero-full .hero-copy h2{font-size:clamp(19px,1.65vw,23px);line-height:1.23}
.hero.ac-hero-full .actions{gap:10px}
.hero.ac-hero-full .actions .btn{box-sizing:border-box;min-width:0;flex:1 1 150px;font-size:18px}
@media(max-width:1100px){
.hero.ac-hero-full>.hg,.hero.ac-hero-full>.hero-grid{display:flex;flex-direction:column}
.hero.ac-hero-full .copy,.hero.ac-hero-full .hero-copy{width:100%;margin:0;padding:26px max(18px,calc((100% - 760px)/2));border:0;border-radius:0;box-shadow:none;background:#f7fbff}
.hero.ac-hero-full .heroimg,.hero.ac-hero-full .hero-photo{flex:none;align-self:stretch;width:100%}
.hero.ac-hero-full .copy h1,.hero.ac-hero-full .hero-copy h1,.hero.ac-hero-full.ac-hero-long .copy h1,.hero.ac-hero-full.ac-hero-long .hero-copy h1{font-size:clamp(32px,5vw,44px)}
}
@media(max-width:640px){
.hero.ac-hero-full .copy,.hero.ac-hero-full .hero-copy{padding:24px 16px 22px}
.hero.ac-hero-full .copy h1,.hero.ac-hero-full .hero-copy h1,.hero.ac-hero-full.ac-hero-long .copy h1,.hero.ac-hero-full.ac-hero-long .hero-copy h1{font-size:clamp(30px,8.7vw,40px)}
.hero.ac-hero-full .copy h2,.hero.ac-hero-full .hero-copy h2{font-size:19px}
.hero.ac-hero-full .actions .btn{font-size:16px;flex-basis:130px}
}
`;

function attr(tag, name, value) {
  const re = new RegExp(`\\s+${name}\\s*=\\s*(["'])[^"']*\\1`, 'i');
  return re.test(tag) ? tag.replace(re, ` ${name}="${value}"`) : tag.replace(/^<img\b/i, `<img ${name}="${value}"`);
}
const visible = h => h.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export function transformHero(html) {
  const matches = [...html.matchAll(/<section\b[^>]*\bclass="hero(?:\s[^"]*)?"[^>]*>[\s\S]*?<\/section>/gi)];
  if (matches.length !== 1) throw new Error(`Hero: esperada una sección, encontradas ${matches.length}`);
  const original = matches[0][0];
  const images = [...original.matchAll(/<img\b[^>]*>/gi)];
  if (images.length !== 1) throw new Error(`Hero: esperada una imagen, encontradas ${images.length}`);
  let tag = images[0][0];
  for (const [name, value] of Object.entries({
    src: imageUrl(1280), srcset: WIDTHS.map(w => `${imageUrl(w)} ${w}w`).join(', '),
    sizes: '100vw', width: String(WIDTH), height: String(HEIGHT),
    loading: 'eager', fetchpriority: 'high', decoding: 'async'
  })) tag = attr(tag, name, value);
  let replacement = original.replace(images[0][0], tag);
  const title = visible(original.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i)?.[0] || '');
  replacement = replacement.replace(/class="hero(?:\s[^"]*)?"/i, `class="hero ac-hero-full${title.length > 60 ? ' ac-hero-long' : ''}"`);
  if (visible(original) !== visible(replacement)) throw new Error('Hero: el cambio alteraría los textos');
  const hrefs = h => [...h.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  if (JSON.stringify(hrefs(original)) !== JSON.stringify(hrefs(replacement))) throw new Error('Hero: el cambio alteraría los enlaces');
  let output = html.replace(original, replacement);
  if (!/<\/head>/i.test(output)) throw new Error('Hero: falta el cierre head');
  if (!output.includes(`href="${CSS_PATH}"`)) output = output.replace(/<\/head>/i, `<link rel="stylesheet" href="${CSS_PATH}"></head>`);
  return output;
}

export function validateAsset(file) {
  const data = fs.readFileSync(file);
  if (data.length < 30 || data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WEBP') throw new Error('Hero: archivo no es WebP');
  if (data.readUInt32LE(4) + 8 !== data.length) throw new Error('Hero: archivo incompleto; no se publicará');
  if (crypto.createHash('sha256').update(data).digest('hex') !== HERO_SHA256) throw new Error('Hero: la imagen no coincide con el archivo aprobado; no se publicará');
  return data.length;
}

export function main(root = 'public', dataPath = 'src/localidades.json') {
  const asset = path.join(root, HERO.slice(1));
  if (!fs.existsSync(asset)) {
    console.log('HERO PENDIENTE: falta src/assets/hero-antenista-panorama.webp. Se conserva el hero anterior sin cambios.');
    return { status: 'pending', pages: 0 };
  }
  const bytes = validateAsset(asset);
  const towns = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const targets = ['index.html', ...towns.map(d => `${d.provinciaSlug}/${d.slug}/index.html`)];
  if (new Set(targets).size !== targets.length) throw new Error('Hero: rutas duplicadas');
  // Validación completa antes de escribir cualquier página.
  const results = targets.map(relative => {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) throw new Error(`Hero: falta ${relative}`);
    return [file, transformHero(fs.readFileSync(file, 'utf8'))];
  });
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(root, CSS_PATH.slice(1)), CSS);
  for (const [file, output] of results) fs.writeFileSync(file, output);
  console.log(`HERO OK: ${results.length} páginas; ${WIDTH}x${HEIGHT}; ${bytes} bytes; ancho completo; textos y enlaces intactos.`);
  return { status: 'active', pages: results.length, bytes };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
