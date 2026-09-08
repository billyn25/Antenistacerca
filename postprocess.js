import fs from 'node:fs';
import path from 'node:path';

const root='public';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const html=walk(root).filter(f=>f.endsWith('.html'));

const serviceBlock=`<section class="section service-detail" id="servicios"><div class="w"><div class="kicker">SERVICIO TÉCNICO</div><h2>Servicios técnicos para viviendas y comunidades</h2><p class="service-lead">Instalación, reparación y mantenimiento de antenas de TV y TDT, parabólicas, amplificación, porteros automáticos y videoporteros, cobertura móvil y pequeñas reparaciones eléctricas del hogar.</p><div class="service-grid"><article><img src="/assets/antena.jpeg" alt="Antena TDT moderna para instalación y reparación"><div><h3>Antenas TDT</h3><p>Instalamos, orientamos y reparamos antenas TDT individuales y colectivas. Revisamos falta de señal, canales que se cortan, cableado, tomas y distribución.</p></div></article><article><img src="/assets/parabolica.jpeg" alt="Antena parabólica para instalación, orientación y reparación"><div><h3>Antenas parabólicas</h3><p>Montaje, orientación y reparación de parabólicas. Ajustamos señal y revisamos LNB, conectores, cableado y distribución de satélite.</p></div></article><article><img src="/assets/monocanales-cabecera.jpeg" alt="Cabecera profesional de amplificación TDT con módulos monocanal"><div><h3>Cabeceras y amplificación monocanal</h3><p>Reparamos amplificadores, cabeceras, centrales, fuentes y módulos monocanal cuando la instalación pierde nivel, calidad o canales.</p><p class="brand-list">Televés · Ikusi · Fagor · Rover · EK · Fringe</p></div></article><article><div class="portero-pair"><img src="/assets/portero.jpeg" alt="Placa de portero automático Fermax"><img src="/assets/portero-tegui.jpeg" alt="Placa de portero automático Tegui"></div><div><h3>Porteros automáticos y videoporteros</h3><p>Instalación, reparación y renovación de equipos. Revisamos placas de calle, telefonillos, monitores, fuentes, pulsadores y cableado.</p><p class="brand-list">Fermax · Tegui · Golmar · Comelit · Fringe · Galak</p></div></article><article><img src="/assets/cobertura-movil.png" alt="Antena y solución de cobertura móvil para vivienda"><div><h3>Cobertura móvil</h3><p>Soluciones para viviendas con poca señal móvil mediante antenas exteriores, estudio de cobertura, orientación y cableado adecuados.</p></div></article><article><img src="https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Reparación de cuadro eléctrico en vivienda"><div><h3>Reparaciones eléctricas</h3><p>Atendemos apagones, cortocircuitos, derivaciones, enchufes, interruptores, iluminación y averías en cuadros eléctricos domésticos.</p></div></article></div><div class="brands-strip"><strong>Marcas habituales</strong><span>Porteros: Fermax · Tegui · Golmar · Comelit · Fringe · Galak</span><span>Antenas y amplificación: Televés · Ikusi · Fagor · Rover · EK · Fringe</span></div></div></section>`;

const css=`<style>.service-detail{background:#fff;padding:40px 0}.service-detail .w{width:min(1180px,calc(100% - 34px));margin:auto}.service-lead{max-width:940px;color:#536373}.service-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:22px}.service-grid article{border:1px solid #e3ebf1;border-radius:15px;overflow:hidden;background:#fff;box-shadow:0 12px 30px rgba(16,45,72,.10)}.service-grid>article>img{width:100%;height:190px;object-fit:cover;background:#eef3f6}.portero-pair{display:grid!important;grid-template-columns:1fr 1fr;height:190px;padding:0!important;background:#eef3f6}.portero-pair img{width:100%;height:190px;object-fit:cover;min-width:0}.portero-pair img+img{border-left:2px solid #fff}.service-grid article>div:not(.portero-pair){padding:16px}.service-grid h3{margin:0 0 7px;color:#0a3f73;font-size:20px}.service-grid p{margin:0;color:#536373}.service-grid .brand-list{margin-top:10px;color:#0a3f73;font-size:13px;font-weight:800;line-height:1.45}.service-detail .kicker{font-size:12px;font-weight:800;letter-spacing:.12em;color:#0a3f73}.brands-strip{margin-top:22px;padding:15px 17px;border:1px solid #dce5ec;border-radius:12px;background:#f7fafc;display:flex;flex-wrap:wrap;gap:7px 18px;color:#536373;font-size:14px}.brands-strip strong{color:#0a3f73}.brands-note{margin-top:12px;color:#536373;font-size:15px;line-height:1.6}@media(max-width:760px){.service-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.service-grid>article>img,.portero-pair,.portero-pair img{height:125px}.service-grid article>div:not(.portero-pair){padding:12px}.service-grid h3{font-size:16px}.service-grid p{font-size:12px}.service-grid .brand-list{font-size:11px}.brands-strip{display:block}.brands-strip span{display:block;margin-top:5px}}@media(max-width:390px){.service-grid{grid-template-columns:1fr 1fr}}</style>`;

const porteroVariants=['Trabajamos con equipos y renovaciones de Fermax, Tegui, Golmar y Comelit, además de sistemas compatibles y modelos antiguos.','Revisamos y renovamos instalaciones de portero y videoportero de marcas como Tegui, Fermax, Comelit y Golmar.','Atendemos averías y sustituciones en sistemas Fermax, Golmar, Tegui y Comelit, incluidos equipos antiguos y renovaciones a sistemas actuales.','Experiencia con porteros automáticos y videoporteros Fermax, Tegui, Golmar, Comelit y otros fabricantes habituales, incluidos Fringe y Galak.'];
const antennaVariants=['Revisamos instalaciones y equipos de antena, TDT y amplificación de marcas habituales como Televés, Ikusi, Fagor, Rover, EK y Fringe.','Trabajamos sobre antenas, amplificadores, cabeceras y módulos monocanal Televés, Fagor, Ikusi, Rover, EK y otros fabricantes habituales.','Servicio sobre equipos de recepción y amplificación de fabricantes como Ikusi, Televés, Rover, Fagor, EK y Fringe.','Reparamos y ajustamos instalaciones con antenas, centrales y amplificadores de marcas como Televés, Ikusi, Fagor, Rover, EK y Fringe.'];
const hash=s=>[...s].reduce((a,c)=>(a+c.charCodeAt(0))%997,0);

for(const f of html){let s=fs.readFileSync(f,'utf8');
  if(f===path.join(root,'index.html')){
    s=s.replace(/<section class="section service-detail"[\s\S]*?<\/section>/gi,'');
    s=s.replace(/<section class="services wrap" id="servicios">[\s\S]*?<\/section>/i,serviceBlock);
    if(!s.includes('id="servicios"')) s=s.replace('<section id="zonas"',serviceBlock+'<section id="zonas"');
    if(!s.includes('.service-grid{')) s=s.replace('</head>',css+'</head>'); else s=s.replace(/<style>\.service-detail\{[\s\S]*?<\/style>/i,css);
    if(!s.includes('Amplificadores, porteros, cobertura móvil y pequeñas reparaciones eléctricas')){
      s=s.replace(/(<ul class="checks">[\s\S]*?<li>Viviendas, comunidades y negocios<\/li>)/i,'$1<li>Amplificadores, porteros, cobertura móvil y pequeñas reparaciones eléctricas</li>');
    }
  } else {
    const i=hash(f)%porteroVariants.length;
    if(!s.includes('brands-note antenna-brands')) s=s.replace(/(<section class="band" id="reparacion">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/i,`$1$2</p><p class="brands-note antenna-brands">${antennaVariants[i]}</p>`);
    if(!s.includes('brands-note portero-brands')) s=s.replace(/(<section class="band" id="porteros">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/i,`$1$2</p><p class="brands-note portero-brands">${porteroVariants[i]}</p>`);
    const locality=(s.match(/<h1>\s*Antenista en ([^<]+)<\/h1>/i)||[])[1]?.trim();
    if(locality){
      s=s.replace(/(<a class="card" href="#porteros">)[\s\S]*?(<h3>Porteros automáticos y videoporteros<\/h3>)/i,`$1<div class="portero-pair"><img src="/assets/portero.jpeg" alt="Placa de portero automático Fermax"><img src="/assets/portero-tegui.jpeg" alt="Placa de portero automático Tegui"></div>$2`);
      s=s.replace(/(<a class="card" href="#reparacion"><img src=")[^"]+("[^>]*alt=")[^"]+("[^>]*>)/i,`$1/assets/monocanales-cabecera.jpeg$2Cabecera y amplificación monocanal para antena TDT en ${locality}$3`);
      s=s.replace(/alt="Antena TDT"/g,`alt="Antena TDT para instalación y reparación en ${locality}"`).replace(/alt="Antena parabólica"/g,`alt="Antena parabólica para instalación y reparación en ${locality}"`).replace(/alt="Antena de telefonía móvil instalada en vivienda"/g,`alt="Solución de cobertura móvil para vivienda en ${locality}"`).replace(/alt="Cuadro eléctrico de vivienda"/g,`alt="Reparación eléctrica doméstica en ${locality}"`);
    }
    if(!s.includes('.portero-pair{')) s=s.replace('</head>',css+'</head>');
  }
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
    if(seenCanonical.has(canonicals[0])) errors.push(`${rel}: canonical duplicado con ${seenCanonical.get(canonicals[0])}`); else seenCanonical.set(canonicals[0],rel);
  }
  if(titles[0]){
    if(seenTitle.has(titles[0])) errors.push(`${rel}: title duplicado con ${seenTitle.get(titles[0])}`); else seenTitle.set(titles[0],rel);
  }
  if(descriptions[0]){
    if(seenDescription.has(descriptions[0])) errors.push(`${rel}: description duplicada con ${seenDescription.get(descriptions[0])}`); else seenDescription.set(descriptions[0],rel);
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
if((home.match(/Amplificadores, porteros, cobertura móvil y pequeñas reparaciones eléctricas/g)||[]).length!==1) errors.push('index.html: línea extra del hero ausente o duplicada');

if(errors.length){
  console.error('\nSEO AUDIT FAILED');
  for(const e of errors.slice(0,80)) console.error(`- ${e}`);
  if(errors.length>80) console.error(`- ... y ${errors.length-80} errores más`);
  process.exit(1);
}

console.log(`Postprocesado y auditoría SEO OK: ${html.length} HTML, ${seenCanonical.size} canonicals únicos, ${localAssetRefs.size} assets locales comprobados.`);