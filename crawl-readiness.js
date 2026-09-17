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
const provinceSlugs=[...new Set(localidades.map(x=>x.provinciaSlug))].sort((a,b)=>a.localeCompare(b,'es'));
const expectedCount=localidades.length+provinceSlugs.length+1;

if(localidades.length<1000) errors.push(`dataset demasiado pequeño para producción: ${localidades.length} localidades`);
if(htmlFiles.length!==expectedCount) errors.push(`HTML=${htmlFiles.length}; esperados=${expectedCount}`);

const canonicals=[];
for(const file of htmlFiles){
  const rel=path.relative(ROOT,file).split(path.sep).join('/');
  const h=fs.readFileSync(file,'utf8');
  const robots=h.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["'][^>]*>/i)?.[1]||'';
  const canon=[...h.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
  if(!/\bindex\b/i.test(robots)||!/\bfollow\b/i.test(robots)||/noindex|nofollow/i.test(robots)) errors.push(`${rel}: robots HTML no indexable (${robots||'ausente'})`);
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

// El sitemap principal debe ser un índice: portada + un sitemap por provincia.
const sitemapFile=path.join(ROOT,'sitemap.xml');
const allSitemapUrls=[];
if(!fs.existsSync(sitemapFile)) errors.push('sitemap.xml ausente');
else {
  const xml=fs.readFileSync(sitemapFile,'utf8');
  if(!xml.includes('<sitemapindex')) errors.push('sitemap.xml no es un sitemap index');
  if(xml.includes(OLD_DOMAIN)) errors.push('sitemap index contiene www');
  const children=[...xml.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>\s*<\/sitemap>/g)].map(m=>m[1]);
  if(children.length!==provinceSlugs.length+1) errors.push(`sitemap index=${children.length} hijos; esperados=${provinceSlugs.length+1}`);
  if(new Set(children).size!==children.length) errors.push('sitemap index con hijos duplicados');

  const expectedChildren=new Set([`${DOMAIN}/sitemaps/sitemap-core.xml`,...provinceSlugs.map(slug=>`${DOMAIN}/sitemaps/sitemap-${slug}.xml`)]);
  for(const child of expectedChildren) if(!children.includes(child)) errors.push(`sitemap index: falta ${child}`);
  for(const child of children) if(!expectedChildren.has(child)) errors.push(`sitemap index: hijo inesperado ${child}`);

  for(const child of children){
    if(!child.startsWith(`${DOMAIN}/sitemaps/`)) { errors.push(`sitemap hijo fuera del dominio final: ${child}`); continue; }
    const rel=child.slice((DOMAIN+'/').length);
    const file=path.join(ROOT,rel);
    if(!fs.existsSync(file)){errors.push(`sitemap hijo ausente: ${rel}`);continue}
    const childXml=fs.readFileSync(file,'utf8');
    if(!childXml.includes('<urlset')) errors.push(`${rel}: no es urlset`);
    if(childXml.includes(OLD_DOMAIN)) errors.push(`${rel}: contiene www`);
    const urls=[...childXml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<\/url>/g)].map(m=>m[1]);
    if(new Set(urls).size!==urls.length) errors.push(`${rel}: URLs duplicadas`);
    if(urls.some(u=>!u.startsWith(DOMAIN+'/'))) errors.push(`${rel}: URL fuera del dominio final`);
    allSitemapUrls.push(...urls);
  }

  const coreFile=path.join(ROOT,'sitemaps','sitemap-core.xml');
  if(fs.existsSync(coreFile)){
    const core=fs.readFileSync(coreFile,'utf8');
    const urls=[...core.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
    if(urls.length!==1||urls[0]!==`${DOMAIN}/`) errors.push('sitemap-core.xml debe contener solo la portada');
  }

  for(const slug of provinceSlugs){
    const file=path.join(ROOT,'sitemaps',`sitemap-${slug}.xml`);
    if(!fs.existsSync(file)){errors.push(`falta sitemap provincial ${slug}`);continue}
    const xmlProvince=fs.readFileSync(file,'utf8');
    const urls=[...xmlProvince.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
    const towns=localidades.filter(x=>x.provinciaSlug===slug);
    const expected=new Set([`${DOMAIN}/${slug}/`,...towns.map(t=>`${DOMAIN}/${slug}/${t.slug}/`)]);
    if(urls.length!==expected.size) errors.push(`sitemap-${slug}: ${urls.length} URLs; esperadas ${expected.size}`);
    for(const url of expected) if(!urls.includes(url)) errors.push(`sitemap-${slug}: falta ${url}`);
    for(const url of urls) if(!expected.has(url)) errors.push(`sitemap-${slug}: URL inesperada ${url}`);
  }
}

if(allSitemapUrls.length!==expectedCount) errors.push(`sitemaps hijos=${allSitemapUrls.length} URLs; esperadas=${expectedCount}`);
if(new Set(allSitemapUrls).size!==allSitemapUrls.length) errors.push('URLs duplicadas entre sitemaps hijos');
const sitemapSet=new Set(allSitemapUrls);
for(const c of canonicals) if(!sitemapSet.has(c)) errors.push(`sitemaps no contienen canonical ${c}`);
for(const u of sitemapSet) if(!canonicals.includes(u)) errors.push(`sitemap contiene URL sin canonical HTML ${u}`);

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

console.log(`CRAWL READINESS OK: ${localidades.length} localidades, ${provinceSlugs.length} provincias, ${htmlFiles.length} HTML indexables, sitemap index + sitemaps provinciales completos, robots abierto, canonicals únicos y enlazado provincial completo.`);
