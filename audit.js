import fs from 'node:fs';
import path from 'node:path';

const root='public';
const DOMAIN='https://www.antenistacerca.es';
const PHONE='641 589 394';
const TEL='+34641589394';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const html=walk(root).filter(f=>f.endsWith('.html'));
const seenCanonical=new Map(),seenTitle=new Map(),seenDescription=new Map(),localAssetRefs=new Set();
const errors=[],warnings=[],localPages=[];

const visibleText=s=>s.replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z0-9#]+;/gi,' ').toLowerCase().replace(/\s+/g,' ').trim();
const words=s=>new Set(visibleText(s).split(/[^a-záéíóúüñ0-9]+/i).filter(w=>w.length>3));
const jaccard=(a,b)=>{let common=0;for(const x of a)if(b.has(x))common++;const union=a.size+b.size-common;return union?common/union:1};
const hasAny=(s,list)=>list.some(x=>s.includes(x));

for(const f of html){
  const s=fs.readFileSync(f,'utf8'),rel=path.relative(root,f),text=visibleText(s);
  const titles=[...s.matchAll(/<title>([^<]+)<\/title>/gi)].map(m=>m[1].trim());
  const descriptions=[...s.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/gi)].map(m=>m[1].trim());
  const canonicals=[...s.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)].map(m=>m[1].trim());
  const h1s=[...s.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>visibleText(m[1]));
  if(titles.length!==1)errors.push(`${rel}: title=${titles.length}`);
  if(descriptions.length!==1)errors.push(`${rel}: meta description=${descriptions.length}`);
  if(canonicals.length!==1)errors.push(`${rel}: canonical=${canonicals.length}`);
  if(h1s.length!==1)errors.push(`${rel}: h1=${h1s.length}`);
  if(s.includes('{{'))errors.push(`${rel}: quedan placeholders sin resolver`);
  if(!s.includes('noindex,nofollow'))errors.push(`${rel}: falta noindex durante fase de pruebas`);
  if(titles[0]&&titles[0].length>70)warnings.push(`${rel}: title largo (${titles[0].length})`);
  if(descriptions[0]&&(descriptions[0].length<90||descriptions[0].length>170))warnings.push(`${rel}: description ${descriptions[0].length<90?'corta':'larga'} (${descriptions[0].length})`);
  if(canonicals[0]&&!canonicals[0].startsWith(DOMAIN+'/'))errors.push(`${rel}: canonical fuera del dominio principal: ${canonicals[0]}`);
  if(canonicals[0]){if(seenCanonical.has(canonicals[0]))errors.push(`${rel}: canonical duplicado con ${seenCanonical.get(canonicals[0])}`);else seenCanonical.set(canonicals[0],rel)}
  if(titles[0]){if(seenTitle.has(titles[0]))errors.push(`${rel}: title duplicado con ${seenTitle.get(titles[0])}`);else seenTitle.set(titles[0],rel)}
  if(descriptions[0]){if(seenDescription.has(descriptions[0]))errors.push(`${rel}: description duplicada con ${seenDescription.get(descriptions[0])}`);else seenDescription.set(descriptions[0],rel)}
  for(const m of s.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)["?#]/gi))localAssetRefs.add(m[1]);
  for(const m of s.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/gi))localAssetRefs.add(m[1]);

  const parts=rel.split(path.sep);
  if(parts.length===3&&parts[2]==='index.html'){
    const slug=parts[1],townSlug=parts[0];
    localPages.push({rel,set:words(s),chars:text.length,bytes:Buffer.byteLength(s,'utf8')});
    if(!s.includes(`tel:${TEL}`))errors.push(`${rel}: falta enlace al teléfono fijo ${PHONE}`);
    if(!text.includes(PHONE.toLowerCase()))errors.push(`${rel}: teléfono no visible`);
    if(!hasAny(text,['antenista','técnico de antenas','tecnico de antenas']))errors.push(`${rel}: falta intención principal técnico/antenista`);
    if(!text.includes('antenas individuales')||!text.includes('colectivas'))errors.push(`${rel}: falta intención antenas individuales/colectivas`);
    if(!text.includes('porteros automáticos')||!text.includes('videoporteros'))errors.push(`${rel}: falta intención porteros/videoporteros`);
    if(!text.includes('repar'))warnings.push(`${rel}: poca señal semántica de reparación`);
    if(!text.includes('instala'))warnings.push(`${rel}: poca señal semántica de instalación`);
    if(!s.includes(`href="/${townSlug}/"`))warnings.push(`${rel}: no se detecta enlace de retorno a provincia`);
    if(!s.includes('BreadcrumbList'))errors.push(`${rel}: falta BreadcrumbList`);
    if(!s.includes('areaServed'))errors.push(`${rel}: falta areaServed`);
    if(!s.includes('Service'))errors.push(`${rel}: falta schema Service`);

    // La limpieza no puede volver a incrustar CSS compartido en cada pueblo.
    if(s.includes('id="shared-ui"'))errors.push(`${rel}: shared-ui sigue inline en vez de cacheado`);
    if(s.includes('id="town-trust-style"'))errors.push(`${rel}: estilos de mejoras siguen inline`);
    if(!s.includes('href="/assets/shared-ui.css"'))errors.push(`${rel}: falta shared-ui.css`);
    if(!s.includes('href="/assets/town-enhancements.css"'))errors.push(`${rel}: falta town-enhancements.css`);

    const porteros=(s.match(/<section class="band" id="porteros">([\s\S]*?)<\/section>/i)||[])[1]||'';
    if(!porteros.includes('class="doorphone-brands"'))errors.push(`${rel}: falta bloque visual de marcas de porteros`);
    if(!porteros.includes('Bticino')||!porteros.includes('Legrand'))errors.push(`${rel}: faltan Bticino/Legrand en porteros`);
    if(/class="brands-note"/.test(porteros))errors.push(`${rel}: sigue apareciendo el párrafo antiguo de marcas en porteros`);
  }
}

for(const asset of localAssetRefs){const p=path.join(root,asset.replace(/^\//,''));if(!fs.existsSync(p))errors.push(`asset ausente: ${asset}`)}

localPages.sort((a,b)=>a.rel.localeCompare(b.rel));
for(let i=0;i<localPages.length;i++){
  const a=localPages[i];
  if(a.chars<1800)warnings.push(`${a.rel}: poco contenido visible (${a.chars} caracteres)`);
  for(const j of [i+1,i+7,i+31]){
    if(j>=localPages.length)continue;
    const b=localPages[j],sim=jaccard(a.set,b.set);
    if(sim>=0.90)errors.push(`${a.rel} ~ ${b.rel}: similitud textual muy alta ${(sim*100).toFixed(1)}%`);
    else if(sim>=0.82)warnings.push(`${a.rel} ~ ${b.rel}: similitud textual alta ${(sim*100).toFixed(1)}%`);
  }
}

const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
if((home.match(/id="servicios"/g)||[]).length!==1)errors.push('index.html: bloque servicios duplicado');
if((home.match(/class="extra-services"/g)||[]).length!==1)errors.push('index.html: servicios adicionales ausentes o duplicados');
if((home.match(/<li>Viviendas, comunidades y negocios<\/li>/g)||[]).length!==1)errors.push('index.html: hero alterado');
if(!home.includes(`tel:${TEL}`)||!visibleText(home).includes(PHONE.toLowerCase()))errors.push('index.html: teléfono fijo ausente');
if(!home.includes('WebSite')||!home.includes('#negocio'))errors.push('index.html: schema de sitio/negocio incompleto');
if(!home.includes('Antenista cerca de tu vivienda'))errors.push('index.html: H1 aprobado ausente');
if(!home.includes('Instalación, reparación y mantenimiento de antenas, porteros automáticos y videoporteros'))errors.push('index.html: subtítulo hero aprobado ausente');
if(!home.includes('Hoy estamos cerca de tu casa'))errors.push('index.html: mensaje de proximidad aprobado ausente');
if(!home.includes('★★★★★'))errors.push('index.html: bloque de confianza con estrellas ausente');
if(!home.includes('FTE Maximal'))errors.push('index.html: marca FTE Maximal ausente');
if(home.includes('<span class="home-brand">FTE</span>')||home.includes('<span class="home-brand">Maximal</span>'))errors.push('index.html: FTE Maximal separada incorrectamente');

if(warnings.length){console.warn(`\nSEO AUDIT WARNINGS (${warnings.length})`);for(const w of warnings.slice(0,60))console.warn(`- ${w}`);if(warnings.length>60)console.warn(`- ... y ${warnings.length-60} avisos más`)}
if(errors.length){console.error(`\nSEO AUDIT FAILED (${errors.length})`);for(const e of errors.slice(0,80))console.error(`- ${e}`);if(errors.length>80)console.error(`- ... y ${errors.length-80} errores más`);process.exit(1)}
const totalTownBytes=localPages.reduce((a,x)=>a+x.bytes,0);
console.log(`SEO AUDIT OK: ${html.length} HTML, ${localPages.length} localidades, ${seenCanonical.size} canonicals únicos, ${localAssetRefs.size} assets comprobados, teléfono ${PHONE} validado.`);
console.log(`Peso HTML localidades: ${(totalTownBytes/1024).toFixed(1)} KB total, ${localPages.length?(totalTownBytes/localPages.length/1024).toFixed(1):'0.0'} KB de media.`);
