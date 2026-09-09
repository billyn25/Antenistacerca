import fs from 'node:fs';
import path from 'node:path';

const root='public';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const html=walk(root).filter(f=>f.endsWith('.html'));
const seenCanonical=new Map(),seenTitle=new Map(),seenDescription=new Map(),localAssetRefs=new Set();
const errors=[],warnings=[],localPages=[];

const visibleText=s=>s
  .replace(/<script\b[\s\S]*?<\/script>/gi,' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/&[a-z0-9#]+;/gi,' ')
  .toLowerCase().replace(/\s+/g,' ').trim();
const words=s=>new Set(visibleText(s).split(/[^a-záéíóúüñ0-9]+/i).filter(w=>w.length>3));
const jaccard=(a,b)=>{let common=0;for(const x of a)if(b.has(x))common++;const union=a.size+b.size-common;return union?common/union:1};

for(const f of html){
  const s=fs.readFileSync(f,'utf8'),rel=path.relative(root,f);
  const titles=[...s.matchAll(/<title>([^<]+)<\/title>/gi)].map(m=>m[1].trim());
  const descriptions=[...s.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/gi)].map(m=>m[1].trim());
  const canonicals=[...s.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)].map(m=>m[1].trim());
  const h1s=[...s.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>visibleText(m[1]));
  if(titles.length!==1) errors.push(`${rel}: title=${titles.length}`);
  if(descriptions.length!==1) errors.push(`${rel}: meta description=${descriptions.length}`);
  if(canonicals.length!==1) errors.push(`${rel}: canonical=${canonicals.length}`);
  if(h1s.length!==1) errors.push(`${rel}: h1=${h1s.length}`);
  if(s.includes('{{')) errors.push(`${rel}: quedan placeholders sin resolver`);
  if(!s.includes('noindex,nofollow')) errors.push(`${rel}: falta noindex durante fase de pruebas`);
  if(titles[0]&&titles[0].length>70) warnings.push(`${rel}: title largo (${titles[0].length})`);
  if(descriptions[0]&&(descriptions[0].length<90||descriptions[0].length>170)) warnings.push(`${rel}: description ${descriptions[0].length<90?'corta':'larga'} (${descriptions[0].length})`);
  if(canonicals[0]){if(seenCanonical.has(canonicals[0]))errors.push(`${rel}: canonical duplicado con ${seenCanonical.get(canonicals[0])}`);else seenCanonical.set(canonicals[0],rel)}
  if(titles[0]){if(seenTitle.has(titles[0]))errors.push(`${rel}: title duplicado con ${seenTitle.get(titles[0])}`);else seenTitle.set(titles[0],rel)}
  if(descriptions[0]){if(seenDescription.has(descriptions[0]))errors.push(`${rel}: description duplicada con ${seenDescription.get(descriptions[0])}`);else seenDescription.set(descriptions[0],rel)}
  for(const m of s.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)["?#]/gi))localAssetRefs.add(m[1]);
  for(const m of s.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/gi))localAssetRefs.add(m[1]);
  const parts=rel.split(path.sep);
  if(parts.length===3&&parts[2]==='index.html') localPages.push({rel,set:words(s),chars:visibleText(s).length});
}

for(const asset of localAssetRefs){const p=path.join(root,asset.replace(/^\//,''));if(!fs.existsSync(p))errors.push(`asset ausente: ${asset}`)}

// Muestreo escalable de similitud: compara vecinas en orden y una muestra separada.
localPages.sort((a,b)=>a.rel.localeCompare(b.rel));
for(let i=0;i<localPages.length;i++){
  const a=localPages[i];
  if(a.chars<1800) warnings.push(`${a.rel}: poco contenido visible (${a.chars} caracteres)`);
  for(const j of [i+1,i+7,i+31]){
    if(j>=localPages.length)continue;
    const b=localPages[j],sim=jaccard(a.set,b.set);
    if(sim>=0.90) errors.push(`${a.rel} ~ ${b.rel}: similitud textual muy alta ${(sim*100).toFixed(1)}%`);
    else if(sim>=0.82) warnings.push(`${a.rel} ~ ${b.rel}: similitud textual alta ${(sim*100).toFixed(1)}%`);
  }
}

const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
if((home.match(/id="servicios"/g)||[]).length!==1)errors.push('index.html: bloque servicios duplicado');
if((home.match(/class="extra-services"/g)||[]).length!==1)errors.push('index.html: servicios adicionales ausentes o duplicados');
if((home.match(/<li>Viviendas, comunidades y negocios<\/li>/g)||[]).length!==1)errors.push('index.html: hero alterado');

if(warnings.length){console.warn(`\nSEO AUDIT WARNINGS (${warnings.length})`);for(const w of warnings.slice(0,60))console.warn(`- ${w}`);if(warnings.length>60)console.warn(`- ... y ${warnings.length-60} avisos más`)}
if(errors.length){console.error(`\nSEO AUDIT FAILED (${errors.length})`);for(const e of errors.slice(0,80))console.error(`- ${e}`);if(errors.length>80)console.error(`- ... y ${errors.length-80} errores más`);process.exit(1)}
console.log(`SEO AUDIT OK: ${html.length} HTML, ${localPages.length} localidades, ${seenCanonical.size} canonicals únicos, ${localAssetRefs.size} assets comprobados.`);