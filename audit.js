import fs from 'node:fs';
import path from 'node:path';

const root='public';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const html=walk(root).filter(f=>f.endsWith('.html'));
const seenCanonical=new Map();
const seenTitle=new Map();
const seenDescription=new Map();
const localAssetRefs=new Set();
const errors=[];

for(const f of html){
  const s=fs.readFileSync(f,'utf8');
  const rel=path.relative(root,f);
  const titles=[...s.matchAll(/<title>([^<]+)<\/title>/gi)].map(m=>m[1].trim());
  const descriptions=[...s.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/gi)].map(m=>m[1].trim());
  const canonicals=[...s.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)].map(m=>m[1].trim());
  const h1s=[...s.matchAll(/<h1\b[^>]*>/gi)];

  if(titles.length!==1) errors.push(`${rel}: title=${titles.length}`);
  if(descriptions.length!==1) errors.push(`${rel}: meta description=${descriptions.length}`);
  if(canonicals.length!==1) errors.push(`${rel}: canonical=${canonicals.length}`);
  if(h1s.length!==1) errors.push(`${rel}: h1=${h1s.length}`);
  if(s.includes('{{')) errors.push(`${rel}: quedan placeholders sin resolver`);
  if(!s.includes('noindex,nofollow')) errors.push(`${rel}: falta noindex durante fase de pruebas`);

  if(canonicals[0]){
    if(seenCanonical.has(canonicals[0])) errors.push(`${rel}: canonical duplicado con ${seenCanonical.get(canonicals[0])}`);
    else seenCanonical.set(canonicals[0],rel);
  }
  if(titles[0]){
    if(seenTitle.has(titles[0])) errors.push(`${rel}: title duplicado con ${seenTitle.get(titles[0])}`);
    else seenTitle.set(titles[0],rel);
  }
  if(descriptions[0]){
    if(seenDescription.has(descriptions[0])) errors.push(`${rel}: description duplicada con ${seenDescription.get(descriptions[0])}`);
    else seenDescription.set(descriptions[0],rel);
  }

  for(const m of s.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)["?#]/gi)) localAssetRefs.add(m[1]);
  for(const m of s.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/gi)) localAssetRefs.add(m[1]);
}

for(const asset of localAssetRefs){
  const p=path.join(root,asset.replace(/^\//,''));
  if(!fs.existsSync(p)) errors.push(`asset ausente: ${asset}`);
}

const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
if((home.match(/id="servicios"/g)||[]).length!==1) errors.push('index.html: bloque servicios duplicado');
if((home.match(/class="extra-services"/g)||[]).length!==1) errors.push('index.html: servicios adicionales ausentes o duplicados');
if((home.match(/<li>Viviendas, comunidades y negocios<\/li>/g)||[]).length!==1) errors.push('index.html: hero alterado');

if(errors.length){
  console.error('\nSEO AUDIT FAILED');
  for(const e of errors.slice(0,80)) console.error(`- ${e}`);
  if(errors.length>80) console.error(`- ... y ${errors.length-80} errores más`);
  process.exit(1);
}

console.log(`SEO AUDIT OK: ${html.length} HTML, ${seenCanonical.size} canonicals únicos, ${localAssetRefs.size} assets comprobados.`);