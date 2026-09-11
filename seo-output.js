import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const ROOT = 'public';
const DOMAIN = 'https://www.antenistacerca.es';
const PHONE = '641 589 394';
const MODE = (process.argv[2] || process.env.SEO_MODE || 'test').toLowerCase();
const PRODUCTION = MODE === 'production' || MODE === 'prod';
const ROBOTS = PRODUCTION ? 'index,follow,max-image-preview:large' : 'noindex,nofollow';
const OG_IMAGE = `${DOMAIN}/assets/hero-antennista.png`;

const townByFile = new Map(
  localidades.map((d) => [`${d.provinciaSlug}/${d.slug}/index.html`, d])
);
const provinceByFile = new Map();
for (const d of localidades) {
  provinceByFile.set(`${d.provinciaSlug}/index.html`, d.provincia);
}

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function townDescription(name) {
  return `Antenista en ${name} para reparación e instalación de antenas TDT, parabólicas, amplificadores, porteros automáticos y videoporteros. ${PHONE}.`;
}
function provinceDescription(name) {
  return `Antenistas en municipios de ${name} para reparar e instalar antenas TDT, parabólicas, amplificadores, porteros automáticos y videoporteros. ${PHONE}.`;
}
function metadataFor(rel) {
  const town = townByFile.get(rel);
  if (town) {
    return {
      title: `Reparación de antenas en ${town.localidad} | ${PHONE}`,
      description: townDescription(town.localidad),
      canonical: `${DOMAIN}/${town.provinciaSlug}/${town.slug}/`
    };
  }
  const province = provinceByFile.get(rel);
  if (province) {
    const slug = rel.split('/')[0];
    return {
      title: `Antenistas en ${province} | Reparación de antenas | ${PHONE}`,
      description: provinceDescription(province),
      canonical: `${DOMAIN}/${slug}/`
    };
  }
  if (rel === 'index.html') {
    return {
      title: `Antenista Cerca | Reparación de antenas | ${PHONE}`,
      description: `Reparación e instalación de antenas TDT y parabólicas, amplificadores, porteros automáticos y videoporteros. Atención directa: ${PHONE}.`,
      canonical: `${DOMAIN}/`
    };
  }
  throw new Error(`SEO: HTML no reconocido: ${rel}`);
}

function setTitle(html, value) {
  const tag = `<title>${esc(value)}</title>`;
  return /<title>[\s\S]*?<\/title>/i.test(html)
    ? html.replace(/<title>[\s\S]*?<\/title>/i, tag)
    : html.replace('</head>', `${tag}</head>`);
}
function setMeta(html, key, value, attribute = 'name') {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<meta\\s+${attribute}=["']${escapedKey}["'][^>]*>`, 'i');
  const tag = `<meta ${attribute}="${esc(key)}" content="${esc(value)}">`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `${tag}</head>`);
}
function setCanonical(html, value) {
  const tag = `<link rel="canonical" href="${esc(value)}">`;
  return /<link\s+rel=["']canonical["'][^>]*>/i.test(html)
    ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, tag)
    : html.replace('</head>', `${tag}</head>`);
}
function updateJsonLd(html, description) {
  return html.replace(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi, (full, raw) => {
    try {
      const data = JSON.parse(raw);
      const nodes = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];
      for (const node of nodes) {
        if (node && (node['@type'] === 'WebPage' || node['@type'] === 'CollectionPage')) {
          node.description = description;
        }
      }
      return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
    } catch {
      return full;
    }
  });
}

if (!fs.existsSync(ROOT)) throw new Error('SEO: falta la carpeta public; ejecuta primero el generador.');
const files = walk(ROOT).filter((file) => file.endsWith('.html'));
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const meta = metadataFor(rel);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/&quot(?!;)/g, '&quot;');
  html = setTitle(html, meta.title);
  html = setMeta(html, 'description', meta.description);
  html = setMeta(html, 'robots', ROBOTS);
  html = setCanonical(html, meta.canonical);
  html = setMeta(html, 'og:title', meta.title, 'property');
  html = setMeta(html, 'og:description', meta.description, 'property');
  html = setMeta(html, 'og:url', meta.canonical, 'property');
  html = setMeta(html, 'og:type', 'website', 'property');
  html = setMeta(html, 'og:locale', 'es_ES', 'property');
  html = setMeta(html, 'og:image', OG_IMAGE, 'property');
  html = setMeta(html, 'twitter:card', 'summary_large_image');
  html = setMeta(html, 'twitter:title', meta.title);
  html = setMeta(html, 'twitter:description', meta.description);
  html = setMeta(html, 'twitter:image', OG_IMAGE);
  html = updateJsonLd(html, meta.description);
  fs.writeFileSync(file, html);
}

const robots = PRODUCTION
  ? `User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`
  : `User-agent: *\nDisallow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
console.log(`SEO output preparado en modo ${PRODUCTION ? 'PRODUCCIÓN' : 'PRUEBAS'} para ${files.length} páginas.`);
