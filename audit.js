import fs from 'node:fs';
import path from 'node:path';

const root='public';
const DOMAIN='https://www.antenistacerca.es';
const PHONE='641 589 394';
const TEL='+34641589394';
const TEST_MODE=true;

const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const html=walk(root).filter(f=>f.endsWith('.html'));
const seenCanonical=new Map(),seenTitle=new Map(),seenDescription=new Map(),localAssetRefs=new Set();
const errors=[],warnings=[],localPages=[],canonicals=[];

const visibleText=s=>s.replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z0-9#]+;/gi,' ').toLowerCase().replace(/\s+/g,' ').trim();
const words=s=>new Set(visibleText(s).split(/[^a-záéíóúüñ0-9]+/i).filter(w=>w.length>3));
const jaccard=(a,b)=>{let common=0;for(const x of a)if(b.has(x))common++;const union=a.size+b.size-common;return union?common/union:1};
const hasAny=(s,list)=>list.some(x=>s.includes(x));
const count=(s,re)=>(s.match(re)||[]).length;
const hasCss=(s,name)=>new RegExp(`href=["']\\/assets\\/${name.replace('.', '\\.')}(?:\\?[^"']*)?["']`,'i').test(s);

for(const f of html){
  const s=fs.readFileSync(f,'utf8'),rel=path.relative(root,f),text=visibleText(s);
  const titles=[...s.matchAll(/<title>([^<]+)<\/title>/gi)].map(m=>m[1].trim());
  const descriptions=[...s.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/gi)].map(m=>m[1].trim());
  const canon=[...s.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)].map(m=>m[1].trim());
  const h1s=[...s.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>visibleText(m[1]));
  const robots=[...s.matchAll(/<meta\s+name="robots"\s+content="([^"]*)"/gi)].map(m=>m[1].toLowerCase());
  if(titles.length!==1)errors.push(`${rel}: title=${titles.length}`);
  if(descriptions.length!==1)errors.push(`${rel}: meta description=${descriptions.length}`);
  if(canon.length!==1)errors.push(`${rel}: canonical=${canon.length}`);
  if(h1s.length!==1)errors.push(`${rel}: h1=${h1s.length}`);
  if(robots.length!==1)errors.push(`${rel}: meta robots=${robots.length}`);
  if(s.includes('{{'))errors.push(`${rel}: quedan placeholders sin resolver`);
  if(TEST_MODE && !robots.some(x=>x.includes('noindex')))errors.push(`${rel}: falta noindex durante fase de pruebas`);
  if(!TEST_MODE && robots.some(x=>x.includes('noindex')))errors.push(`${rel}: noindex activo en producción`);
  if(titles[0]&&(titles[0].length<30||titles[0].length>65))warnings.push(`${rel}: title fuera de rango recomendado (${titles[0].length})`);
  if(descriptions[0]&&(descriptions[0].length<120||descriptions[0].length>165))warnings.push(`${rel}: description fuera de rango recomendado (${descriptions[0].length})`);
  if(canon[0]&&!canon[0].startsWith(DOMAIN+'/'))errors.push(`${rel}: canonical fuera del dominio principal: ${canon[0]}`);
  if(canon[0]&&(/[?#]/.test(canon[0])||canon[0].endsWith('.html')))warnings.push(`${rel}: canonical no limpio: ${canon[0]}`);
  if(canon[0]){canonicals.push(canon[0]);if(seenCanonical.has(canon[0]))errors.push(`${rel}: canonical duplicado con ${seenCanonical.get(canon[0])}`);else seenCanonical.set(canon[0],rel)}
  if(titles[0]){if(seenTitle.has(titles[0]))errors.push(`${rel}: title duplicado con ${seenTitle.get(titles[0])}`);else seenTitle.set(titles[0],rel)}
  if(descriptions[0]){if(seenDescription.has(descriptions[0]))errors.push(`${rel}: description duplicada con ${seenDescription.get(descriptions[0])}`);else seenDescription.set(descriptions[0],rel)}
  for(const m of s.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)["?#]/gi))localAssetRefs.add(m[1]);
  for(const m of s.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/gi))localAssetRefs.add(m[1]);
  for(const m of s.matchAll(/<img\b[^>]*>/gi))if(!/\balt="[^"]*"/i.test(m[0]))errors.push(`${rel}: imagen sin atributo alt`);
  for(const m of s.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)){try{JSON.parse(m[1])}catch{errors.push(`${rel}: JSON-LD inválido`)}}
  const ids=[...s.matchAll(/\bid="([^"]+)"/gi)].map(m=>m[1]);const seenIds=new Set();for(const id of ids){if(seenIds.has(id))errors.push(`${rel}: id duplicado #${id}`);seenIds.add(id)}
  const parts=rel.split(path.sep);
  if(parts.length===3&&parts[2]==='index.html'){
    const provinceSlug=parts[0],townSlug=parts[1];
    localPages.push({rel,set:words(s),chars:text.length,bytes:Buffer.byteLength(s,'utf8')});
    if(!s.includes(`tel:${TEL}`))errors.push(`${rel}: falta enlace al teléfono fijo ${PHONE}`);
    if(!text.includes(PHONE.toLowerCase()))errors.push(`${rel}: teléfono no visible`);
    if(!hasAny(text,['antenista','técnico de antenas','tecnico de antenas']))errors.push(`${rel}: falta intención principal técnico/antenista`);
    if(!text.includes('antenas individuales')||!text.includes('colectivas'))errors.push(`${rel}: falta intención antenas individuales/colectivas`);
    if(!text.includes('porteros automáticos')||!text.includes('videoporteros'))errors.push(`${rel}: falta intención porteros/videoporteros`);
    if(!text.includes('repar'))warnings.push(`${rel}: poca señal semántica de reparación`);
    if(!text.includes('instala'))warnings.push(`${rel}: poca señal semántica de instalación`);
    if(!s.includes(`href="/${provinceSlug}/"`))warnings.push(`${rel}: no se detecta enlace de retorno a provincia`);
    if(!s.includes('BreadcrumbList'))errors.push(`${rel}: falta BreadcrumbList`);
    if(!s.includes('areaServed'))errors.push(`${rel}: falta areaServed`);
    if(!s.includes('Service'))errors.push(`${rel}: falta schema Service`);
    if(titles[0]&&!titles[0].toLowerCase().includes(townSlug.split('-')[0]))warnings.push(`${rel}: revisar relación title/localidad`);
    if(s.includes('id="shared-ui"'))errors.push(`${rel}: shared-ui sigue inline en vez de cacheado`);
    if(s.includes('id="town-trust-style"'))errors.push(`${rel}: estilos de mejoras siguen inline`);
    if(!hasCss(s,'shared-ui.css'))errors.push(`${rel}: falta shared-ui.css`);
    if(!hasCss(s,'town-enhancements.css'))errors.push(`${rel}: falta town-enhancements.css`);
    const porteros=(s.match(/<section class="band" id="porteros">([\s\S]*?)<\/section>/i)||[])[1]||'';
    if(!porteros.includes('class="doorphone-brands"'))errors.push(`${rel}: falta bloque visual de marcas de porteros`);
    if(!porteros.includes('Bticino')||!porteros.includes('Legrand'))errors.push(`${rel}: faltan Bticino/Legrand en porteros`);
    if(/class="brands-note"/.test(porteros))errors.push(`${rel}: sigue apareciendo el párrafo antiguo de marcas en porteros`);
  }
}
for(const asset of localAssetRefs){const p=path.join(root,asset.replace(/^\//,''));if(!fs.existsSync(p))errors.push(`asset ausente: ${asset}`)}
localPages.sort((a,b)=>a.rel.localeCompare(b.rel));
for(let i=0;i<localPages.length;i++){const a=localPages[i];if(a.chars<1800)warnings.push(`${a.rel}: poco contenido visible (${a.chars} caracteres)`);for(const j of [i+1,i+7,i+31]){if(j>=localPages.length)continue;const b=localPages[j],sim=jaccard(a.set,b.set);if(sim>=0.90)errors.push(`${a.rel} ~ ${b.rel}: similitud textual muy alta ${(sim*100).toFixed(1)}%`);else if(sim>=0.82)warnings.push(`${a.rel} ~ ${b.rel}: similitud textual alta ${(sim*100).toFixed(1)}%`)}}
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(count(home,/id="servicios"/g)!==1)errors.push('index.html: bloque servicios duplicado');
if(count(home,/class="extra-services"/g)!==1)errors.push('index.html: servicios adicionales ausentes o duplicados');
if(count(home,/<li>Viviendas, comunidades y negocios<\/li>/g)!==1)errors.push('index.html: hero alterado');
if(!home.includes(`tel:${TEL}`)||!visibleText(home).includes(PHONE.toLowerCase()))errors.push('index.html: teléfono fijo ausente');
if(!home.includes('WebSite')||!home.includes('#negocio'))errors.push('index.html: schema de sitio/negocio incompleto');
if(!home.includes('Antenista cerca de tu vivienda'))errors.push('index.html: H1 aprobado ausente');
if(!home.includes('Instalación, reparación y mantenimiento de antenas, porteros automáticos y videoporteros'))errors.push('index.html: subtítulo hero aprobado ausente');
if(!home.includes('Hoy estamos cerca de tu casa'))errors.push('index.html: mensaje de proximidad aprobado ausente');
if(!home.includes('★★★★★'))errors.push('index.html: bloque de confianza con estrellas ausente');
if(!home.includes('FTE Maximal'))errors.push('index.html: marca FTE Maximal ausente');
if(home.includes('<span class="home-brand">FTE</span>')||home.includes('<span class="home-brand">Maximal</span>'))errors.push('index.html: FTE Maximal separada incorrectamente');
const sitemapPath=path.join(root,'sitemap.xml');
if(!fs.existsSync(sitemapPath))errors.push('sitemap.xml ausente');else{const sitemap=fs.readFileSync(sitemapPath,'utf8');const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);if(new Set(urls).size!==urls.length)errors.push('sitemap.xml: URLs duplicadas');for(const c of canonicals)if(!urls.includes(c))errors.push(`sitemap.xml: falta canonical ${c}`);for(const u of urls)if(!seenCanonical.has(u))warnings.push(`sitemap.xml: URL sin canonical HTML detectado ${u}`)}
const robotsPath=path.join(root,'robots.txt');
if(!fs.existsSync(robotsPath))errors.push('robots.txt ausente');else{const robots=fs.readFileSync(robotsPath,'utf8');if(TEST_MODE&&!/Disallow:\s*\//i.test(robots))errors.push('robots.txt: durante pruebas debe bloquear rastreo');if(!TEST_MODE&&/Disallow:\s*\/$/im.test(robots))errors.push('robots.txt: sigue bloqueando todo en producción');if(!robots.includes(`${DOMAIN}/sitemap.xml`))errors.push('robots.txt: falta referencia al sitemap')}
if(warnings.length){console.warn(`\nSEO AUDIT WARNINGS (${warnings.length})`);for(const w of warnings.slice(0,80))console.warn(`- ${w}`);if(warnings.length>80)console.warn(`- ... y ${warnings.length-80} avisos más`)}
if(errors.length){console.error(`\nSEO AUDIT FAILED (${errors.length})`);for(const e of errors.slice(0,120))console.error(`- ${e}`);if(errors.length>120)console.error(`- ... y ${errors.length-120} errores más`);process.exit(1)}
const totalTownBytes=localPages.reduce((a,x)=>a+x.bytes,0);
console.log(`SEO AUDIT OK: ${html.length} HTML, ${localPages.length} localidades, ${seenCanonical.size} canonicals únicos, ${localAssetRefs.size} assets comprobados, teléfono ${PHONE} validado.`);
console.log(`Peso HTML localidades: ${(totalTownBytes/1024).toFixed(1)} KB total, ${localPages.length?(totalTownBytes/localPages.length/1024).toFixed(1):'0.0'} KB de media.`);
console.log(`Sitemap, robots, JSON-LD, ALT, IDs, titles, descriptions, canonicals y duplicidad local validados.`);
