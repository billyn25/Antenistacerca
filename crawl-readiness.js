import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const ROOT='public';
const DOMAIN='https://antenistacerca.es';
const OLD_DOMAIN='https://www.antenistacerca.es';
const errors=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);

if(!fs.existsSync(ROOT)) throw new Error('CRAWL: falta public/');
const htmlFiles=walk(ROOT).filter(f=>f.endsWith('.html'));
const provinceSlugs=[...new Set(localidades.map(x=>x.provinciaSlug))];
const expectedCount=localidades.length+provinceSlugs.length+1;

if(localidades.length<1000) errors.push(`dataset demasiado pequeño para producción: ${localidades.length} localidades`);
if(htmlFiles.length!==expectedCount) errors.push(`HTML=${htmlFiles.length}; esperados=${expectedCount}`);

const canonicals=[];
for(const file of htmlFiles){
  const rel=path.relative(ROOT,file).split(path.sep).join('/');
  const h=fs.readFileSync(file,'utf8');
  const robots=h.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["'][^>]*>/i)?.[1]||'';
  const canon=[...h.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
  if(!/\bindex\b/i.test(robots)||! /\bfollow\b/i.test(robots)||/noindex|nofollow/i.test(robots)) errors.push(`${rel}: robots HTML no indexable (${robots||'ausente'})`);
  if(canon.length!==1) errors.push(`${rel}: canonical=${canon.length}`);
  else {
    canonicals.push(canon[0]);
    if(!canon[0].startsWith(DOMAIN+'/')) errors.push(`${rel}: canonical fuera del dominio final`);
    if(canon[0].startsWith(OLD_DOMAIN)) errors.push(`${rel}: canonical usa www`);
  }
  if(h.includes(OLD_DOMAIN)) errors.push(`${rel}: referencia al dominio www antiguo`);
  if(/<meta\s+http-equiv=["']refresh["']/i.test(h)) errors.push(`${rel}: meta refresh detectado`);
}

if(new Set(canonicals).size!==canonicals.length) errors.push('canonicals duplicados');

const sitemapFile=path.join(ROOT,'sitemap.xml');
if(!fs.existsSync(sitemapFile)) errors.push('sitemap.xml ausente');
else {
  const xml=fs.readFileSync(sitemapFile,'utf8');
  const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  if(urls.length!==expectedCount) errors.push(`sitemap=${urls.length}; esperadas=${expectedCount}`);
  if(new Set(urls).size!==urls.length) errors.push('sitemap con URLs duplicadas');
  if(urls.some(u=>!u.startsWith(DOMAIN+'/'))) errors.push('sitemap contiene URLs fuera del dominio final');
  if(urls.some(u=>u.startsWith(OLD_DOMAIN))) errors.push('sitemap contiene www');
  const set=new Set(urls);
  for(const c of canonicals) if(!set.has(c)) errors.push(`sitemap no contiene canonical ${c}`);
}

const robotsFile=path.join(ROOT,'robots.txt');
if(!fs.existsSync(robotsFile)) errors.push('robots.txt ausente');
else {
  const r=fs.readFileSync(robotsFile,'utf8');
  if(!/^User-agent:\s*\*$/mi.test(r)) errors.push('robots: falta User-agent *');
  if(!/^Allow:\s*\/$/mi.test(r)) errors.push('robots: falta Allow: /');
  if(/^Disallow:\s*\/$/mi.test(r)) errors.push('robots: rastreo bloqueado');
  if(!r.includes(`Sitemap: ${DOMAIN}/sitemap.xml`)) errors.push('robots: sitemap incorrecto');
  if(r.includes(OLD_DOMAIN)) errors.push('robots: usa www');
}

const home=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
for(const slug of provinceSlugs){
  if(!home.includes(`href="/${slug}/"`)) errors.push(`portada: falta enlace a /${slug}/`);
  const provinceFile=path.join(ROOT,slug,'index.html');
  if(!fs.existsSync(provinceFile)){errors.push(`${slug}: falta página provincial`);continue}
  const h=fs.readFileSync(provinceFile,'utf8');
  for(const town of localidades.filter(x=>x.provinciaSlug===slug)){
    if(!h.includes(`href="/${slug}/${town.slug}/"`)) errors.push(`${slug}: falta enlace a ${town.slug}`);
  }
}

if(errors.length){
  console.error(`\nCRAWL READINESS FALLIDO (${errors.length})`);
  for(const e of errors.slice(0,200)) console.error('- '+e);
  if(errors.length>200) console.error(`- ... y ${errors.length-200} errores más`);
  process.exit(1);
}

console.log(`CRAWL READINESS OK: ${localidades.length} localidades, ${provinceSlugs.length} provincias, ${htmlFiles.length} HTML indexables, sitemap completo, robots abierto, canonicals únicos y enlazado provincial completo.`);
