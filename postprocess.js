import fs from 'node:fs';
import path from 'node:path';

const root='public';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const html=walk(root).filter(f=>f.endsWith('.html'));

const townCss=`<style>.portero-pair{display:grid!important;grid-template-columns:1fr 1fr;height:190px;padding:0!important;background:#eef3f6}.portero-pair img{width:100%;height:190px;object-fit:cover;min-width:0}.portero-pair img+img{border-left:2px solid #fff}.brands-note{margin-top:12px;color:#536373;font-size:15px;line-height:1.6}@media(max-width:760px){.portero-pair,.portero-pair img{height:125px}}@media(max-width:390px){.portero-pair{grid-template-columns:1fr 1fr}}</style>`;

const porteroVariants=[
  'Trabajamos con equipos y renovaciones de Fermax, Tegui, Golmar y Comelit, además de sistemas compatibles y modelos antiguos.',
  'Revisamos y renovamos instalaciones de portero y videoportero de marcas como Tegui, Fermax, Comelit y Golmar.',
  'Atendemos averías y sustituciones en sistemas Fermax, Golmar, Tegui y Comelit, incluidos equipos antiguos y renovaciones a sistemas actuales.',
  'Experiencia con porteros automáticos y videoporteros Fermax, Tegui, Golmar, Comelit y otros fabricantes habituales, incluidos Fringe y Galak.'
];
const antennaVariants=[
  'Revisamos instalaciones y equipos de antena, TDT y amplificación de marcas habituales como Televés, Ikusi, Fagor, Rover, EK y Fringe.',
  'Trabajamos sobre antenas, amplificadores, cabeceras y módulos monocanal Televés, Fagor, Ikusi, Rover, EK y otros fabricantes habituales.',
  'Servicio sobre equipos de recepción y amplificación de fabricantes como Ikusi, Televés, Rover, Fagor, EK y Fringe.',
  'Reparamos y ajustamos instalaciones con antenas, centrales y amplificadores de marcas como Televés, Ikusi, Fagor, Rover, EK y Fringe.'
];
const hash=s=>[...s].reduce((a,c)=>(a+c.charCodeAt(0))%997,0);

for(const f of html){
  if(f===path.join(root,'index.html')) continue;

  let s=fs.readFileSync(f,'utf8');
  const i=hash(f)%porteroVariants.length;

  if(!s.includes('brands-note antenna-brands')){
    s=s.replace(/(<section class="band" id="reparacion">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/i,`$1$2</p><p class="brands-note antenna-brands">${antennaVariants[i]}</p>`);
  }
  if(!s.includes('brands-note portero-brands')){
    s=s.replace(/(<section class="band" id="porteros">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/i,`$1$2</p><p class="brands-note portero-brands">${porteroVariants[i]}</p>`);
  }

  const locality=(s.match(/<h1>\s*Antenista en ([^<]+)<\/h1>/i)||[])[1]?.trim();
  if(locality){
    s=s.replace(/(<a class="card" href="#porteros">)[\s\S]*?(<h3>Porteros automáticos y videoporteros<\/h3>)/i,`$1<div class="portero-pair"><img src="/assets/portero.jpeg" alt="Placa de portero automático Fermax"><img src="/assets/portero-tegui.jpeg" alt="Placa de portero automático Tegui"></div>$2`);
    s=s.replace(/(<a class="card" href="#reparacion"><img src=")[^"]+("[^>]*alt=")[^"]+("[^>]*>)/i,`$1/assets/monocanales-cabecera.jpeg$2Cabecera y amplificación monocanal para antena TDT en ${locality}$3`);
    s=s.replace(/alt="Antena TDT"/g,`alt="Antena TDT para instalación y reparación en ${locality}"`)
      .replace(/alt="Antena parabólica"/g,`alt="Antena parabólica para instalación y reparación en ${locality}"`)
      .replace(/alt="Antena de telefonía móvil instalada en vivienda"/g,`alt="Solución de cobertura móvil para vivienda en ${locality}"`)
      .replace(/alt="Cuadro eléctrico de vivienda"/g,`alt="Reparación eléctrica doméstica en ${locality}"`);
  }

  if(!s.includes('.portero-pair{')) s=s.replace('</head>',townCss+'</head>');
  fs.writeFileSync(f,s);
}

const seenCanonical=new Map();
const seenTitle=new Map();
const seenDescription=new Map();
const errors=[];
const localAssetRefs=new Set();

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

if(errors.length){
  console.error('\nSEO AUDIT FAILED');
  for(const e of errors.slice(0,80)) console.error(`- ${e}`);
  if(errors.length>80) console.error(`- ... y ${errors.length-80} errores más`);
  process.exit(1);
}

console.log(`Postprocesado de pueblos y auditoría SEO OK: ${html.length} HTML, ${seenCanonical.size} canonicals únicos, ${localAssetRefs.size} assets locales comprobados.`);