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
const count=(s,re)=>(s.match(re)||[]).length;

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

  const ids=[...s.matchAll(/\sid="([^"]+)"/gi)].map(m=>m[1]);
  const duplicateIds=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
  if(duplicateIds.length)errors.push(`${rel}: IDs duplicados: ${duplicateIds.join(', ')}`);

  for(const m of s.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)["?#]/gi))localAssetRefs.add(m[1]);
  for(const m of s.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/gi))localAssetRefs.add(m[1]);

  const parts=rel.split(path.sep);
  if(parts.length===3&&parts[2]==='index.html'){
    const townSlug=parts[1],provinceSlug=parts[0];
    localPages.push({rel,set:words(s),chars:text.length});
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

    const porteros=(s.match(/<section class="band" id="porteros">([\s\S]*?)<\/section>/i)||[])[1]||'';
    if(!porteros.includes('class="doorphone-brands"'))errors.push(`${rel}: falta bloque visual de marcas de porteros`);
    if(!porteros.includes('Bticino')||!porteros.includes('Legrand'))errors.push(`${rel}: faltan Bticino/Legrand en porteros`);
    if(/class="brands-note"/.test(porteros))errors.push(`${rel}: sigue apareciendo el párrafo antiguo de marcas en porteros`);

    if(count(s,/class="old-doorphones"/g)!==1)errors.push(`${rel}: galería de porteros antiguos ausente o duplicada`);
    if(count(s,/class="amp-gallery"/g)!==1)errors.push(`${rel}: galería de amplificadores ausente o duplicada`);
    if(count(s,/class="town-trust"/g)!==1)errors.push(`${rel}: bloque de confianza ausente o duplicado`);
    if(!s.includes('/assets/amplificador-alcad-interior.jpg')||!s.includes('/assets/amplificador-alcad-mastil.jpg')||!s.includes('/assets/amplificador-televes.jpg')||!s.includes('/assets/amplificador-satelite-rover-ek.jpg'))errors.push(`${rel}: faltan imágenes aprobadas de amplificación`);
    if(!s.includes('FTE Maximal'))errors.push(`${rel}: falta marca FTE Maximal`);
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
const homeText=visibleText(home);
const hero=(home.match(/<section class="hero">([\s\S]*?)<\/section>/i)||[])[1]||'';
if(!hero)errors.push('index.html: hero principal ausente');
if(!hero.includes('<div class="kicker">Hoy estamos cerca de tu casa</div>'))errors.push('index.html: kicker aprobado del hero alterado');
if(!hero.includes('<h1>Antenista cerca de tu vivienda</h1>'))errors.push('index.html: H1 aprobado del hero alterado');
if(!hero.includes('<h2>Instalación, reparación y mantenimiento de antenas, porteros automáticos y videoporteros</h2>'))errors.push('index.html: H2 aprobado del hero alterado');
if((home.match(/id="servicios"/g)||[]).length!==1)errors.push('index.html: bloque servicios duplicado');
if((home.match(/class="extra-services"/g)||[]).length!==1)errors.push('index.html: servicios adicionales ausentes o duplicados');
if((home.match(/<li>Viviendas, comunidades y negocios<\/li>/g)||[]).length!==1)errors.push('index.html: lista del hero alterada');
if(!home.includes(`tel:${TEL}`)||!homeText.includes(PHONE.toLowerCase()))errors.push('index.html: teléfono fijo ausente');
if(!home.includes('WebSite')||!home.includes('#negocio'))errors.push('index.html: schema de sitio/negocio incompleto');
if(count(home,/id="home-polish"/g)!==1)errors.push('index.html: CSS home-polish ausente o duplicado');
if(count(home,/class="trust-home"/g)!==1)errors.push('index.html: bloque de confianza ausente o duplicado');
if(count(home,/class="home-brands"/g)!==1)errors.push('index.html: bloque de marcas ausente o duplicado');
if(/class="brands-strip"/.test(home))errors.push('index.html: sigue presente el bloque antiguo brands-strip');
if(/class="brand-list"/.test(home))errors.push('index.html: siguen presentes marcas duplicadas dentro de tarjetas');
if(!home.includes('FTE Maximal')||!home.includes('Alcad')||!home.includes('Bticino')||!home.includes('Legrand'))errors.push('index.html: faltan marcas aprobadas');
if(/class="home-brand">FTE<\/span>|class="home-brand">Maximal<\/span>/.test(home))errors.push('index.html: FTE Maximal aparece separada');
if(!home.includes('<strong>Atención sin intermediarios</strong>'))errors.push('index.html: bloque de atención directa alterado');

if(warnings.length){console.warn(`\nSEO AUDIT WARNINGS (${warnings.length})`);for(const w of warnings.slice(0,60))console.warn(`- ${w}`);if(warnings.length>60)console.warn(`- ... y ${warnings.length-60} avisos más`)}
if(errors.length){console.error(`\nSEO/STRUCTURE AUDIT FAILED (${errors.length})`);for(const e of errors.slice(0,100))console.error(`- ${e}`);if(errors.length>100)console.error(`- ... y ${errors.length-100} errores más`);process.exit(1)}
console.log(`SEO/STRUCTURE AUDIT OK: ${html.length} HTML, ${localPages.length} localidades, ${seenCanonical.size} canonicals únicos, ${localAssetRefs.size} assets, hero/index y bloques visuales críticos validados, teléfono ${PHONE} validado.`);