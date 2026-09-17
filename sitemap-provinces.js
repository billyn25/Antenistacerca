import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const ROOT='public';
const DOMAIN='https://antenistacerca.es';
const OLD_DOMAIN='https://www.antenistacerca.es';
const SITEMAP_DIR=path.join(ROOT,'sitemaps');

const escXml=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const urlset=urls=>`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${escXml(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
const sitemapIndex=urls=>`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <sitemap><loc>${escXml(url)}</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`;

if(!fs.existsSync(ROOT)) throw new Error('SITEMAPS: falta public/');
fs.rmSync(SITEMAP_DIR,{recursive:true,force:true});
fs.mkdirSync(SITEMAP_DIR,{recursive:true});

const groups=new Map();
for(const town of localidades){
  if(!groups.has(town.provinciaSlug)) groups.set(town.provinciaSlug,{name:town.provincia,towns:[]});
  groups.get(town.provinciaSlug).towns.push(town);
}

// Portada en un sitemap propio; cada provincia incluye su hub y todos sus municipios.
const coreName='sitemap-core.xml';
fs.writeFileSync(path.join(SITEMAP_DIR,coreName),urlset([`${DOMAIN}/`]));
const children=[`${DOMAIN}/sitemaps/${coreName}`];
let totalUrls=1;

for(const slug of [...groups.keys()].sort((a,b)=>a.localeCompare(b,'es'))){
  const group=groups.get(slug);
  const urls=[`${DOMAIN}/${slug}/`,...group.towns.map(t=>`${DOMAIN}/${slug}/${t.slug}/`)];
  const filename=`sitemap-${slug}.xml`;
  fs.writeFileSync(path.join(SITEMAP_DIR,filename),urlset(urls));
  children.push(`${DOMAIN}/sitemaps/${filename}`);
  totalUrls+=urls.length;
}

fs.writeFileSync(path.join(ROOT,'sitemap.xml'),sitemapIndex(children));
fs.writeFileSync(path.join(ROOT,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);

// Verificación inmediata del resultado final.
const expected=localidades.length+groups.size+1;
if(totalUrls!==expected) throw new Error(`SITEMAPS: ${totalUrls} URLs generadas; esperadas ${expected}`);
const rootXml=fs.readFileSync(path.join(ROOT,'sitemap.xml'),'utf8');
if(rootXml.includes(OLD_DOMAIN)||!rootXml.includes('<sitemapindex')) throw new Error('SITEMAPS: índice principal incorrecto');
if(children.length!==groups.size+1) throw new Error(`SITEMAPS: ${children.length} sitemaps hijos; esperados ${groups.size+1}`);

console.log(`SITEMAPS OK: índice principal + ${groups.size} provincias + portada; ${totalUrls} URLs indexables repartidas por provincia.`);
