import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const ROOT = 'public';
const DOMAIN = 'https://www.antenistacerca.es';
const PHONE = '641 589 394';
const TEL = '+34641589394';
const MODE = (process.argv[2] || process.env.SEO_MODE || 'test').toLowerCase();
const PRODUCTION = MODE === 'production' || MODE === 'prod';
const EXPECTED_ROBOTS = PRODUCTION ? 'index,follow,max-image-preview:large' : 'noindex,nofollow';
const errors = [];
const warnings = [];

const townByFile = new Map(localidades.map((d) => [`${d.provinciaSlug}/${d.slug}/index.html`, d]));
const provinceByFile = new Map();
for (const d of localidades) provinceByFile.set(`${d.provinciaSlug}/index.html`, d.provincia);
const expectedFiles = new Set(['index.html', ...provinceByFile.keys(), ...townByFile.keys()]);

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const textOnly = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const normalizedWords = (html) => new Set(textOnly(html).toLowerCase().split(/[^a-záéíóúüñ0-9]+/i).filter((word) => word.length > 3));
const jaccard = (a, b) => {
  let common = 0;
  for (const value of a) if (b.has(value)) common += 1;
  const union = a.size + b.size - common;
  return union ? common / union : 1;
};
const all = (html, regex) => [...html.matchAll(regex)].map((match) => match[1]?.trim() ?? '');
const meta = (html, name, attribute = 'name') => {
  const safe = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+${attribute}=["']${safe}["']\\s+content=["']([^"']*)["'][^>]*>`, 'i');
  return html.match(regex)?.[1] ?? '';
};
const expectedTownDescription = (name) => `Antenista en ${name} para reparación e instalación de antenas TDT, parabólicas, amplificadores, porteros automáticos y videoporteros. ${PHONE}.`;
const expectedProvinceDescription = (name) => `Antenistas en municipios de ${name} para reparar e instalar antenas TDT, parabólicas, amplificadores, porteros automáticos y videoporteros. ${PHONE}.`;
const expectedMetadata = (rel) => {
  const town = townByFile.get(rel);
  if (town) return {
    title: `Reparación de antenas en ${town.localidad} | ${PHONE}`,
    description: expectedTownDescription(town.localidad),
    canonical: `${DOMAIN}/${town.provinciaSlug}/${town.slug}/`
  };
  const province = provinceByFile.get(rel);
  if (province) return {
    title: `Antenistas en ${province} | Reparación de antenas | ${PHONE}`,
    description: expectedProvinceDescription(province),
    canonical: `${DOMAIN}/${rel.split('/')[0]}/`
  };
  return {
    title: `Antenista Cerca | Reparación de antenas | ${PHONE}`,
    description: `Reparación e instalación de antenas TDT y parabólicas, amplificadores, porteros automáticos y videoporteros. Atención directa: ${PHONE}.`,
    canonical: `${DOMAIN}/`
  };
};

if (!fs.existsSync(ROOT)) throw new Error('SEO AUDIT: no existe public/.');
const htmlFiles = walk(ROOT).filter((file) => file.endsWith('.html'));
const actualFiles = new Set(htmlFiles.map((file) => path.relative(ROOT, file).split(path.sep).join('/')));
for (const rel of expectedFiles) if (!actualFiles.has(rel)) errors.push(`falta página esperada: ${rel}`);
for (const rel of actualFiles) if (!expectedFiles.has(rel)) warnings.push(`HTML no previsto: ${rel}`);

const seenTitles = new Map();
const seenDescriptions = new Map();
const seenCanonicals = new Map();
const canonicalList = [];
const localPages = [];
const assetRefs = new Set();

for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const html = fs.readFileSync(file, 'utf8');
  const visible = textOnly(html);
  const visibleLower = visible.toLowerCase();
  const expected = expectedMetadata(rel);
  const titles = all(html, /<title>([\s\S]*?)<\/title>/gi);
  const descriptions = all(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/gi);
  const canonicals = all(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/gi);
  const h1s = all(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map((heading) => textOnly(heading));
  const robots = meta(html, 'robots');

  if (titles.length !== 1) errors.push(`${rel}: debe haber un solo title`);
  if (descriptions.length !== 1) errors.push(`${rel}: debe haber una sola meta description`);
  if (canonicals.length !== 1) errors.push(`${rel}: debe haber un solo canonical`);
  if (h1s.length !== 1) errors.push(`${rel}: debe haber un solo H1`);
  if (html.includes('{{')) errors.push(`${rel}: quedan placeholders sin resolver`);
  if (/&quot(?!;)/.test(html)) errors.push(`${rel}: entidad &quot sin cerrar`);

  const title = titles[0] || '';
  const description = descriptions[0] || '';
  const canonical = canonicals[0] || '';
  if (title !== expected.title) errors.push(`${rel}: title fuera del patrón de intención local`);
  if (description !== expected.description) errors.push(`${rel}: meta description fuera del patrón aprobado`);
  if (canonical !== expected.canonical) errors.push(`${rel}: canonical incorrecto (${canonical})`);
  if (robots !== EXPECTED_ROBOTS) errors.push(`${rel}: robots debe ser ${EXPECTED_ROBOTS}`);
  if (title.length < 30 || title.length > 65) errors.push(`${rel}: title fuera de 30-65 caracteres (${title.length})`);
  if (description.length < 120 || description.length > 165) errors.push(`${rel}: description fuera de 120-165 caracteres (${description.length})`);
  if (seenTitles.has(title)) errors.push(`${rel}: title duplicado con ${seenTitles.get(title)}`); else seenTitles.set(title, rel);
  if (seenDescriptions.has(description)) errors.push(`${rel}: description duplicada con ${seenDescriptions.get(description)}`); else seenDescriptions.set(description, rel);
  if (seenCanonicals.has(canonical)) errors.push(`${rel}: canonical duplicado con ${seenCanonicals.get(canonical)}`); else seenCanonicals.set(canonical, rel);
  canonicalList.push(canonical);

  if (meta(html, 'og:title', 'property') !== title) errors.push(`${rel}: og:title no coincide con title`);
  if (meta(html, 'og:description', 'property') !== description) errors.push(`${rel}: og:description no coincide con description`);
  if (meta(html, 'og:url', 'property') !== canonical) errors.push(`${rel}: og:url no coincide con canonical`);
  if (meta(html, 'twitter:card') !== 'summary_large_image') errors.push(`${rel}: falta twitter:card`);

  const jsonLd = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  if (!jsonLd.length) errors.push(`${rel}: falta JSON-LD`);
  for (const item of jsonLd) {
    try { JSON.parse(item[1]); } catch { errors.push(`${rel}: JSON-LD inválido`); }
  }

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const seenIds = new Set();
  for (const id of ids) {
    if (seenIds.has(id)) errors.push(`${rel}: id duplicado #${id}`);
    seenIds.add(id);
  }
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']+["']/i.test(image[0])) errors.push(`${rel}: imagen sin alt descriptivo`);
    if (!/\bwidth=["']?\d+/i.test(image[0]) || !/\bheight=["']?\d+/i.test(image[0])) warnings.push(`${rel}: imágenes sin width/height explícitos`);
  }
  for (const ref of html.matchAll(/(?:src|href)=["'](\/assets\/[^"'?#]+)/gi)) assetRefs.add(ref[1]);

  const forbidden = [
    /hemos realizado\s+\d+\s+servicios/i,
    /llegamos[^.]{0,80}\d+\s+minutos/i,
    /direcci[oó]n aproximada/i,
    /reparamos (?:lavadoras|frigor[ií]ficos?)/i,
    /personas que viven en/i
  ];
  if (forbidden.some((regex) => regex.test(visible))) errors.push(`${rel}: contiene afirmaciones locales automáticas o no verificadas`);

  const town = townByFile.get(rel);
  if (town) {
    localPages.push({ rel, words: normalizedWords(html), chars: visible.length });
    const nameLower = town.localidad.toLowerCase();
    if (!title.toLowerCase().startsWith(`reparación de antenas en ${nameLower}`)) errors.push(`${rel}: la intención principal no abre el title`);
    if (!h1s[0]?.toLowerCase().includes(nameLower)) errors.push(`${rel}: H1 sin localidad`);
    if (!description.toLowerCase().includes(nameLower)) errors.push(`${rel}: description sin localidad`);
    if (!html.includes(`tel:${TEL}`) || !visible.includes(PHONE)) errors.push(`${rel}: teléfono ausente`);
    if (!visibleLower.includes('reparación') || !visibleLower.includes('instalación')) errors.push(`${rel}: faltan reparación/instalación`);
    if (!visibleLower.includes('antenas individuales') || !visibleLower.includes('colectivas')) errors.push(`${rel}: faltan antenas individuales/colectivas`);
    if (!visibleLower.includes('porteros automáticos') || !visibleLower.includes('videoporteros')) errors.push(`${rel}: falta intención de porteros/videoporteros`);
    if (!html.includes('BreadcrumbList') || !html.includes('areaServed') || !html.includes('Service')) errors.push(`${rel}: schema local incompleto`);
    if (!html.includes(`href="/${town.provinciaSlug}/"`)) warnings.push(`${rel}: falta retorno visible a provincia`);
    if (!html.includes('class="direct-tech"')) errors.push(`${rel}: falta bloque de trato directo`);
    if (!html.includes('class="old-doorphones"')) errors.push(`${rel}: falta galería de porteros antiguos`);
    if (!html.includes('class="amp-gallery"')) errors.push(`${rel}: falta galería de amplificadores`);
    if (!html.includes('class="town-trust"')) errors.push(`${rel}: falta bloque de confianza`);
    if ((html.match(/class="card"/g) || []).length !== 6) errors.push(`${rel}: deben existir 6 tarjetas de servicio`);
    if (!html.includes('/assets/shared-ui.css') || !html.includes('/assets/town-enhancements.css')) errors.push(`${rel}: CSS compartido incompleto`);
    if (visible.length < 2200) warnings.push(`${rel}: contenido visible escaso (${visible.length} caracteres)`);
  }
}

for (const asset of assetRefs) {
  if (!fs.existsSync(path.join(ROOT, asset.replace(/^\//, '')))) errors.push(`asset local ausente: ${asset}`);
}
for (let first = 0; first < localPages.length; first += 1) {
  for (let second = first + 1; second < localPages.length; second += 1) {
    const similarity = jaccard(localPages[first].words, localPages[second].words);
    if (similarity >= 0.97) errors.push(`${localPages[first].rel} y ${localPages[second].rel}: similitud extrema ${(similarity * 100).toFixed(1)}%`);
    else if (similarity >= 0.92) warnings.push(`${localPages[first].rel} y ${localPages[second].rel}: similitud alta ${(similarity * 100).toFixed(1)}%`);
  }
}

const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const required of ['Antenista cerca de tu vivienda', 'Instalación, reparación y mantenimiento de antenas, porteros automáticos y videoporteros', 'Hoy estamos cerca de tu casa', '★★★★★', 'FTE Maximal']) {
  if (!home.includes(required)) errors.push(`index.html: falta bloque aprobado: ${required}`);
}
if ((home.match(/id="servicios"/g) || []).length !== 1) errors.push('index.html: servicios duplicados');
if ((home.match(/class="extra-services"/g) || []).length !== 1) errors.push('index.html: servicios adicionales ausentes o duplicados');

const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) errors.push('falta sitemap.xml');
else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedUrls = new Set([...expectedFiles].map((rel) => rel === 'index.html' ? `${DOMAIN}/` : `${DOMAIN}/${rel.replace(/index\.html$/, '')}`));
  if (new Set(urls).size !== urls.length) errors.push('sitemap.xml: URLs duplicadas');
  for (const url of expectedUrls) if (!urls.includes(url)) errors.push(`sitemap.xml: falta ${url}`);
  for (const url of urls) if (!expectedUrls.has(url)) warnings.push(`sitemap.xml: URL inesperada ${url}`);
  for (const canonical of canonicalList) if (!urls.includes(canonical)) errors.push(`sitemap.xml: falta canonical ${canonical}`);
}

const robotsPath = path.join(ROOT, 'robots.txt');
if (!fs.existsSync(robotsPath)) errors.push('falta robots.txt');
else {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  if (PRODUCTION && !/^Allow:\s*\/$/mi.test(robots)) errors.push('robots.txt: producción no está abierta');
  if (PRODUCTION && /^Disallow:\s*\/$/mi.test(robots)) errors.push('robots.txt: producción bloquea todo');
  if (!PRODUCTION && !/^Disallow:\s*\/$/mi.test(robots)) errors.push('robots.txt: pruebas no bloquean todo');
  if (!robots.includes(`${DOMAIN}/sitemap.xml`)) errors.push('robots.txt: falta sitemap');
}

const uniqueWarnings = [...new Set(warnings)];
const uniqueErrors = [...new Set(errors)];
if (uniqueWarnings.length) {
  console.warn(`\nSEO AUDIT AVISOS (${uniqueWarnings.length})`);
  for (const warning of uniqueWarnings.slice(0, 80)) console.warn(`- ${warning}`);
}
if (uniqueErrors.length) {
  console.error(`\nSEO AUDIT FALLIDO (${uniqueErrors.length})`);
  for (const error of uniqueErrors.slice(0, 140)) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`SEO AUDIT PRO OK [${PRODUCTION ? 'PRODUCCIÓN' : 'PRUEBAS'}]: ${htmlFiles.length} páginas, ${localPages.length} localidades, ${seenCanonicals.size} canonicals únicos y ${assetRefs.size} assets locales comprobados.`);
