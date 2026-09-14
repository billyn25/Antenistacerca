import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with {type:'json'};

const ROOT='public';
const DOMAIN='https://antenistacerca.es';
const OLD_DOMAIN='https://www.antenistacerca.es';
const GA='G-W8L23NJLP6';
const TEL='+34641589394';
const errors=[];
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const htmlFiles=walk(ROOT).filter(f=>f.endsWith('.html'));
const provinceSlugs=[...new Set(localidades.map(x=>x.provinciaSlug))];
const expectedCount=localidades.length+provinceSlugs.length+1;
if(htmlFiles.length!==expectedCount) errors.push(`HTML: ${htmlFiles.length}; esperados ${expectedCount}`);

for(const file of htmlFiles){
  const rel=path.relative(ROOT,file).split(path.sep).join('/');
  const h=fs.readFileSync(file,'utf8');
  const canon=[...h.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
  const gaIds=(h.match(new RegExp(GA.replace('-','\\-'),'g'))||[]).length;
  const convIds=(h.match(/id=["']antenistacerca-conversions["']/gi)||[]).length;
  const tels=[...h.matchAll(/<a\b[^>]*href=["'](tel:[^"']+)["']/gi)].map(m=>m[1]);
  const was=[...h.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map(m=>m[1]).filter(x=>/(?:^whatsapp:|wa\.me|(?:api\.|web\.)?whatsapp\.com)/i.test(x));
  if(canon.length!==1||!canon[0]?.startsWith(DOMAIN+'/')) errors.push(`${rel}: canonical final incorrecto`);
  if(h.includes(OLD_DOMAIN)) errors.push(`${rel}: queda dominio www antiguo`);
  if(gaIds<2) errors.push(`${rel}: GA4 ${GA} ausente/incompleto`);
  if(convIds!==1) errors.push(`${rel}: script conversiones != 1`);
  if(!h.includes("'click_llamada'")||!h.includes("'click_whatsapp'")) errors.push(`${rel}: eventos de contacto incompletos`);
  if(!tels.length||!tels.some(x=>x.includes(TEL))) errors.push(`${rel}: enlace de llamada ausente`);
  if(!was.length) errors.push(`${rel}: enlace WhatsApp ausente`);
}

// Las páginas provinciales deben conservar el hub SEO y el índice alfabético visible en el HTML final.
for(const slug of provinceSlugs){
  const file=path.join(ROOT,slug,'index.html');
  if(!fs.existsSync(file)){errors.push(`${slug}: página provincial ausente`);continue}
  const h=fs.readFileSync(file,'utf8');
  if(!h.includes('class="province-seo"')) errors.push(`${slug}: bloque SEO provincial ausente`);
  if(!h.includes('class="alpha-localities"')||!h.includes('class="alpha-nav"')) errors.push(`${slug}: índice alfabético provincial ausente`);
  const towns=localidades.filter(x=>x.provinciaSlug===slug);
  for(const d of towns){if(!h.includes(`href="/${slug}/${d.slug}/"`)) errors.push(`${slug}: falta enlace provincial a ${d.slug}`)}
}

const sitemapPath=path.join(ROOT,'sitemap.xml'),robotsPath=path.join(ROOT,'robots.txt');
if(!fs.existsSync(sitemapPath)) errors.push('sitemap.xml ausente');
else {
  const sm=fs.readFileSync(sitemapPath,'utf8');
  const urls=[...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  if(urls.length!==expectedCount) errors.push(`sitemap: ${urls.length} URLs; esperadas ${expectedCount}`);
  if(new Set(urls).size!==urls.length) errors.push('sitemap: URLs duplicadas');
  if(urls.some(x=>!x.startsWith(DOMAIN+'/'))) errors.push('sitemap: dominio final incorrecto');
  if(sm.includes(OLD_DOMAIN)) errors.push('sitemap: queda www antiguo');
}
if(!fs.existsSync(robotsPath)) errors.push('robots.txt ausente');
else {
  const r=fs.readFileSync(robotsPath,'utf8');
  if(!/^Allow:\s*\/$/mi.test(r)||/^Disallow:\s*\/$/mi.test(r)) errors.push('robots: producción bloqueada');
  if(!r.includes(`Sitemap: ${DOMAIN}/sitemap.xml`)) errors.push('robots: sitemap incorrecto');
  if(r.includes(OLD_DOMAIN)) errors.push('robots: queda www antiguo');
}

if(errors.length){console.error(`\nAUDITORÍA FINAL FALLIDA (${errors.length})`);for(const e of errors.slice(0,200))console.error('- '+e);process.exit(2)}
console.log(`AUDITORÍA FINAL OK: ${htmlFiles.length} páginas; dominio, canonical, sitemap, robots, GA4, llamadas, WhatsApp e índices provinciales validados sobre el HTML definitivo.`);
