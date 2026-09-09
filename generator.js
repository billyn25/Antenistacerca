import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const OUT='public';
const TEMPLATE=fs.readFileSync('src/template.html','utf8');
const DOMAIN='https://www.antenistacerca.es';
const PHONE='641 589 394';
const TEL='+34641589394';
const WA='34641589394';
const HERO='/assets/hero-antennista.png';
const TDT='/assets/antena.jpeg';
const PARABOLICA='/assets/parabolica.jpeg';
const PORTERO='/assets/portero.jpeg';
const PORTERO_TEGUI='/assets/portero-tegui.jpeg';
const MONOCANAL='/assets/monocanales-cabecera.jpeg';
const MOBILE='/assets/cobertura-movil.png';
const ELECTRIC='https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1200';
const TOWN='/assets/pueblo.jpg';

const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const byName=new Map(localidades.map(x=>[x.localidad.toLowerCase(),x]));
const groups=new Map();
for(const d of localidades){
  if(!groups.has(d.provinciaSlug)) groups.set(d.provinciaSlug,{provincia:d.provincia,items:[]});
  groups.get(d.provinciaSlug).items.push(d);
}

const porteroVariants=[
  'Trabajamos con equipos y renovaciones de Fermax, Tegui, Golmar y Comelit, además de sistemas compatibles y modelos antiguos.',
  'Revisamos y renovamos instalaciones de portero y videoportero de marcas como Tegui, Fermax, Comelit y Golmar.',
  'Atendemos averías y sustituciones en sistemas Fermax, Golmar, Tegui y Comelit, incluidos equipos antiguos y renovaciones a sistemas actuales.',
  'Experiencia con porteros automáticos y videoporteros Fermax, Tegui, Golmar, Comelit y otros fabricantes habituales, incluidos Fringe y Galak.'
];
const antennaVariants=[
  'Revisamos instalaciones y equipos de antena, TDT y amplificación de marcas habituales como Televés, Ikusi, Fagor, Rover, EK y Fringe.',
  'Trabajamos sobre antenas, amplificadores, cabeceras y módulos monocanal Televés, Ikusi, Fagor, Rover, EK y otros fabricantes habituales.',
  'Servicio sobre equipos de recepción y amplificación de fabricantes como Ikusi, Televés, Rover, Fagor, EK y Fringe.',
  'Reparamos y ajustamos instalaciones con antenas, centrales y amplificadores de marcas como Televés, Ikusi, Fagor, Rover, EK y Fringe.'
];
const hash=s=>[...s].reduce((a,c)=>(a+c.charCodeAt(0))%997,0);

function nearby(d){
  const links=d.cercanas.map(n=>{
    const t=byName.get(n.toLowerCase());
    return t?`<a href="/${t.provinciaSlug}/${t.slug}/">${esc(n)}</a>`:`<span>${esc(n)}</span>`;
  }).join('');
  return `<div class="nearby-links">${links}</div><p><a class="more" href="/${d.provinciaSlug}/">Ver todos los municipios de ${esc(d.provincia)} →</a></p>`;
}

function schema(d){
  return JSON.stringify({'@context':'https://schema.org','@graph':[
    {'@type':'WebPage',url:`${DOMAIN}/${d.provinciaSlug}/${d.slug}/`,name:`Antenista en ${d.localidad}`,description:d.descripcion},
    {'@type':'Service',name:`Servicio de antenista en ${d.localidad}`,serviceType:[
      'Instalación y reparación de antenas individuales y colectivas','Antenas TDT','Antenas parabólicas',
      'Reparación de antenas y amplificadores de antena','Cabeceras y módulos monocanal',
      'Instalación, reparación y renovación de porteros automáticos y videoporteros',
      'Antenas de telefonía móvil','Reparaciones eléctricas en el hogar','Urgencias 24 horas'
    ],areaServed:{'@type':'AdministrativeArea',name:d.localidad}},
    {'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'Inicio',item:`${DOMAIN}/`},
      {'@type':'ListItem',position:2,name:d.provincia,item:`${DOMAIN}/${d.provinciaSlug}/`},
      {'@type':'ListItem',position:3,name:d.localidad,item:`${DOMAIN}/${d.provinciaSlug}/${d.slug}/`}
    ]}
  ]});
}

function localSeoBlock(d){
  return `<section class="band local-seo"><div class="wrap detail"><div><div class="kicker">Servicio de proximidad</div><h2>Técnico de antenas en ${esc(d.localidad)} y zona cercana</h2><p>${esc(d.introLocal)}</p><p>${esc(d.zonaLocal)}</p><p class="direct-tech"><strong>Trato directo con el técnico:</strong> te atiende una persona que conoce el trabajo y puede orientarte desde el primer contacto, sin centralitas ni intermediarios.</p></div><aside class="help"><strong>Urgencias 24 horas</strong><span>Cuéntanos qué ocurre y trataremos de atenderte lo antes posible.</span><a href="tel:${TEL}">Llamar ${PHONE}</a></aside></div></section>`;
}

function localFaqBlock(d){
  return `<section class="faq local-faq"><div class="wrap"><h2>Información útil para ${esc(d.localidad)}</h2><details><summary>${esc(d.faqPregunta)}</summary><p>${esc(d.faqRespuesta)}</p></details></div></section>`;
}

function removeServiceSection(h,phrase){
  return h.replace(/<section\b[\s\S]*?<\/section>/gi,s=>s.includes(phrase)?'':s);
}

function townCards(d){
  const loc=esc(d.localidad);
  return `<a class="card" href="#tdt"><img src="${TDT}" alt="Antena TDT para instalación y reparación en ${loc}"><h3>Antenas TDT</h3><p>Instalación, orientación, amplificación y reparación de señal.</p></a><a class="card" href="#parabolicas"><img src="${PARABOLICA}" alt="Antena parabólica para instalación y reparación en ${loc}"><h3>Parabólicas</h3><p>Montaje, ajuste, mantenimiento y resolución de averías.</p></a><a class="card" href="#porteros"><div class="portero-pair"><img src="${PORTERO}" alt="Placa de portero automático Fermax"><img src="${PORTERO_TEGUI}" alt="Placa de portero automático Tegui"></div><h3>Porteros automáticos y videoporteros</h3><p>Instalación, sustitución, reparación y renovación de equipos.</p></a><a class="card" href="#reparacion"><img src="${MONOCANAL}" alt="Cabecera y amplificación monocanal para antena TDT en ${loc}"><h3>Reparación y amplificación</h3><p>Averías, amplificadores, cabeceras, monocanales y cableado.</p></a><a class="card" href="#telefonia-movil"><img src="${MOBILE}" alt="Solución de cobertura móvil para vivienda en ${loc}"><h3>Cobertura móvil</h3><p>Antenas de telefonía móvil para viviendas con señal débil.</p></a><a class="card" href="#reparaciones-electricas"><img src="${ELECTRIC}" alt="Reparación eléctrica doméstica en ${loc}"><h3>Reparaciones eléctricas</h3><p>Averías, cuadros, enchufes, interruptores e iluminación doméstica.</p></a>`;
}

function town(d){
  const variant=hash(`${d.provinciaSlug}/${d.slug}`)%porteroVariants.length;
  let h=TEMPLATE
    .replaceAll('{{LOCALIDAD}}',esc(d.localidad))
    .replaceAll('{{PROVINCIA}}',esc(d.provincia))
    .replaceAll('{{CANONICAL}}',`${DOMAIN}/${d.provinciaSlug}/${d.slug}/`)
    .replaceAll('{{DESCRIPTION}}',esc(d.descripcion))
    .replaceAll('{{PUEBLOS_CERCANOS}}',nearby(d))
    .replaceAll('{{LOCAL_SEO}}',localSeoBlock(d))
    .replaceAll('{{LOCAL_FAQ}}',localFaqBlock(d))
    .replaceAll('{{SCHEMA}}',schema(d));

  h=h.replace(/<div class="hero-photo"><img src="[^"]+"/i,`<div class="hero-photo"><img src="${HERO}"`);
  h=h.replace(/<div class="localpic"><img src="[^"]+"/i,`<div class="localpic"><img src="${TOWN}"`);
  h=h.replace(/(<section class="services wrap" id="servicios">[\s\S]*?<div class="cards">)[\s\S]*?(<\/div><\/section>)/i,`$1${townCards(d)}$2`);

  h=h.replace(/<section class="band" id="reparacion">[\s\S]*?<\/section>/i,`<section class="band" id="reparacion"><div class="detail wrap"><div><div class="kicker">Averías y amplificación</div><h2>Instalación y reparación de antenas individuales y colectivas en ${esc(d.localidad)}</h2><p>Instalamos y reparamos antenas individuales y colectivas en viviendas y comunidades. También reparamos amplificadores de antena, cabeceras y centrales de amplificación, módulos monocanal, fuentes de alimentación, cableado, repartidores, derivadores y tomas para recuperar una distribución de señal correcta.</p><p class="brands-note">${antennaVariants[variant]}</p></div><aside class="help"><strong>Urgencias 24 horas</strong><span>Cuéntanos qué ocurre y te orientamos.</span><a href="tel:${TEL}">Llamar ${PHONE}</a></aside></div></section>`);

  h=h.replace(/<section class="twocol wrap" id="tdt">[\s\S]*?<\/section>/i,`<section class="twocol wrap" id="tdt"><div><div class="kicker">Televisión terrestre</div><h2>Instalación y reparación de antenas TDT en ${esc(d.localidad)}</h2><p>Instalamos, orientamos, mantenemos y reparamos antenas de televisión TDT individuales y colectivas. Comprobamos nivel y calidad de señal, amplificación, cableado y tomas cuando faltan canales, aparecen cortes o la recepción es inestable.</p></div><aside class="sidebox"><strong>Señal y distribución TDT</strong><p>Revisamos la antena y toda la distribución antes de sustituir equipos, incluyendo amplificadores y sistemas de amplificación monocanal cuando forman parte de la instalación.</p></aside></section>`);

  h=h.replace(/<section class="twocol wrap" id="parabolicas">[\s\S]*?<\/section>/i,`<section class="twocol wrap" id="parabolicas"><div><div class="kicker">Satélite</div><h2>Instalación y reparación de antenas parabólicas en ${esc(d.localidad)}</h2><p>Instalamos, orientamos y reparamos antenas parabólicas para recepción por satélite. Realizamos ajuste de señal, revisión de fijaciones, LNB, conectores, cableado y distribución en instalaciones individuales y colectivas.</p></div><aside class="sidebox"><strong>Orientación y ajuste de señal</strong><p>Comprobamos orientación, nivel de señal y elementos de recepción para corregir pérdidas y dejar la instalación correctamente ajustada.</p></aside></section>`);

  h=h.replace(/<section class="band" id="porteros">[\s\S]*?<\/section>/i,`<section class="band" id="porteros"><div class="detail wrap"><div><div class="kicker">Accesos</div><h2>Instalación, reparación y renovación de porteros automáticos y videoporteros en ${esc(d.localidad)}</h2><p>Instalamos, reparamos y renovamos porteros automáticos y videoporteros en viviendas y comunidades. Sustituimos equipos antiguos y revisamos placas de calle, telefonillos, monitores, alimentación, cableado, pulsadores y elementos de llamada para localizar averías y modernizar la instalación cuando sea necesario.</p><p class="brands-note">${porteroVariants[variant]}</p></div><aside class="sidebox"><strong>Instalación, reparación y renovación</strong><p>Trabajamos sobre sistemas existentes y renovaciones completas cuando el equipo está obsoleto o ya no compensa reparar.</p></aside></div></section>`);

  h=removeServiceSection(h,'Antenas de telefonía móvil en ');
  h=removeServiceSection(h,'Reparaciones eléctricas en el hogar en ');

  const mobileBlock=`<section class="twocol wrap" id="telefonia-movil"><div><div class="kicker">Cobertura móvil</div><h2>Antenas de telefonía móvil en ${esc(d.localidad)}</h2><p>Instalamos antenas exteriores y soluciones de recepción para mejorar la cobertura de telefonía móvil en viviendas unifamiliares con señal débil o zonas interiores con poca cobertura. Primero comprobamos la señal disponible para recomendar una solución adecuada.</p></div><aside class="sidebox"><strong>Mejor señal en casa</strong><p>Orientación, cableado y ubicación de la antena adaptados a la vivienda y a la cobertura disponible en la zona.</p></aside></section>`;
  const electricBlock=`<section class="twocol wrap" id="reparaciones-electricas"><div><div class="kicker">Electricidad en el hogar</div><h2>Reparaciones eléctricas en el hogar en ${esc(d.localidad)}</h2><p>Atendemos apagones de luz urgentes en viviendas, cortocircuitos y derivaciones eléctricas, reparación y sustitución de interruptores y enchufes, e instalación y reparación de iluminación. También revisamos y sustituimos automáticos, magnetotérmicos y otros elementos del cuadro eléctrico doméstico.</p></div><aside class="sidebox"><strong>Averías eléctricas en vivienda</strong><p>Localizamos el origen de la avería antes de sustituir componentes y actuamos sobre cuadros, protecciones, enchufes, interruptores y puntos de luz cuando la intervención corresponde a una instalación doméstica.</p></aside></section>`;
  h=h.replace('<section class="band" id="porteros">',mobileBlock+'<section class="band" id="porteros">');
  h=h.replace('<section class="zone wrap" id="zona">',electricBlock+'<section class="zone wrap" id="zona">');

  h=h.replace('</head>',`<style>.portero-pair{display:grid;grid-template-columns:1fr 1fr;height:175px;background:#eef3f6}.portero-pair img{width:100%;height:175px;object-fit:cover;min-width:0}.portero-pair img+img{border-left:2px solid #fff}.brands-note{margin-top:12px;color:#536373;font-size:15px;line-height:1.6}.direct-tech{margin-top:14px;padding-top:13px;border-top:1px solid #dce5ec;color:#394b5d}.direct-tech strong{color:#0a3f73}.localpic img{filter:grayscale(100%);opacity:.88}@media(min-width:1000px){.wrap{width:min(1280px,calc(100% - 48px));max-width:1280px}.cards{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.card img{height:175px}}@media(max-width:900px){.cards{grid-template-columns:repeat(2,minmax(0,1fr));}.twocol{grid-template-columns:1fr!important;gap:14px}.twocol .sidebox{width:100%;margin-top:0}}@media(max-width:640px){.cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.card>img,.portero-pair,.portero-pair img{height:116px}.twocol{grid-template-columns:1fr!important;gap:12px;padding:26px 0}.twocol .sidebox{width:100%;margin-top:4px;padding:16px}.twocol .sidebox strong{font-size:18px}.brands-note,.direct-tech{font-size:13px}}</style></head>`);

  h=h.replaceAll('Porteros y videoporteros','Porteros automáticos y videoporteros')
     .replaceAll('Reparación de porteros y videoporteros','Reparación de porteros automáticos y videoporteros')
     .replaceAll('porteros y videoporteros','porteros automáticos y videoporteros');

  const cards=(h.match(/class="card"/g)||[]).length;
  const mobileCount=(h.match(/id="telefonia-movil"/g)||[]).length;
  if(!h.includes('<header')||cards!==6||mobileCount!==1) throw new Error(`Página ${d.localidad} inválida: header=${h.includes('<header')} cards=${cards} mobile=${mobileCount}`);
  return h;
}

function province(p,slug,items){
  const links=[...items].sort((a,b)=>a.localidad.localeCompare(b.localidad,'es')).map(x=>`<a href="/${slug}/${x.slug}/">${esc(x.localidad)}</a>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Antenistas en ${esc(p)} | Antenista Cerca</title><meta name="description" content="Técnicos de antenas en municipios de ${esc(p)} para TDT, parabólicas, amplificación, porteros automáticos, cobertura móvil y reparaciones eléctricas."><link rel="canonical" href="${DOMAIN}/${slug}/"><style>:root{--b:#0a3f73;--l:#dce5ec}*{box-sizing:border-box}body{font:16px Arial;margin:0;color:#10243a}.w{max-width:1180px;margin:auto;padding:34px 20px}a{color:var(--b);text-decoration:none}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:11px;margin-top:22px}.grid a{padding:13px 14px;border:1px solid var(--l);border-radius:10px;font-weight:700}h1{color:var(--b);font-size:40px}.lead{color:#536373;max-width:920px;line-height:1.65}</style></head><body><main class="w"><p><a href="/">← Inicio</a></p><h1>Técnicos de antenas en ${esc(p)}</h1><p class="lead">Técnico de antenas y antenista para reparación e instalación de antenas de TV y TDT, amplificadores y cabeceras, porteros automáticos y videoporteros, soluciones de cobertura móvil y reparaciones eléctricas del hogar. Trato directo con el técnico desde el primer contacto. Consulta a continuación los municipios en los que prestamos servicio.</p><div class="grid">${links}</div></main></body></html>`;
}

function homeServiceBlock(){
  return `<section id="servicios" class="section service-detail"><div class="w"><div class="kicker">SERVICIO TÉCNICO</div><h2>Servicios técnicos para viviendas y comunidades</h2><p class="service-lead">Instalación, reparación y mantenimiento de antenas de TV y TDT, parabólicas, amplificación, porteros automáticos y videoporteros, cobertura móvil y pequeñas reparaciones eléctricas del hogar.</p><div class="service-grid"><article><img src="${TDT}" alt="Antena TDT moderna para instalación y reparación"><div><h3>Antenas TDT</h3><p>Instalamos, orientamos y reparamos antenas TDT individuales y colectivas. Revisamos falta de señal, canales que se cortan, cableado, tomas y distribución.</p></div></article><article><img src="${PARABOLICA}" alt="Antena parabólica para instalación, orientación y reparación"><div><h3>Antenas parabólicas</h3><p>Montaje, orientación y reparación de parabólicas. Ajustamos señal y revisamos LNB, conectores, cableado y distribución de satélite.</p></div></article><article><img src="${MONOCANAL}" alt="Cabecera profesional de amplificación TDT con módulos monocanal"><div><h3>Cabeceras y amplificación monocanal</h3><p>Reparamos amplificadores, cabeceras, centrales, fuentes y módulos monocanal cuando la instalación pierde nivel, calidad o canales.</p><p class="brand-list">Televés · Ikusi · Fagor · Rover · EK · Fringe</p></div></article><article><div class="portero-pair home-pair"><img src="${PORTERO}" alt="Placa de portero automático Fermax"><img src="${PORTERO_TEGUI}" alt="Placa de portero automático Tegui"></div><div><h3>Porteros automáticos y videoporteros</h3><p>Instalación, reparación y renovación de equipos. Revisamos placas de calle, telefonillos, monitores, fuentes, pulsadores y cableado.</p><p class="brand-list">Fermax · Tegui · Golmar · Comelit · Fringe · Galak</p></div></article><article><img src="${MOBILE}" alt="Antena y solución de cobertura móvil para vivienda"><div><h3>Cobertura móvil</h3><p>Soluciones para viviendas con poca señal móvil mediante antenas exteriores, estudio de cobertura, orientación y cableado adecuados.</p></div></article><article><img src="${ELECTRIC}" alt="Reparación de cuadro eléctrico en vivienda"><div><h3>Reparaciones eléctricas</h3><p>Atendemos apagones, cortocircuitos, derivaciones, enchufes, interruptores, iluminación y averías en cuadros eléctricos domésticos.</p></div></article></div><div class="brands-strip"><strong>Marcas habituales</strong><span>Porteros: Fermax · Tegui · Golmar · Comelit · Fringe · Galak</span><span>Antenas y amplificación: Televés · Ikusi · Fagor · Rover · EK · Fringe</span></div><div class="extra-services"><strong>También realizamos</strong><p>Antenas colectivas e individuales · reparación de amplificadores · cabeceras y módulos monocanal · nuevas tomas de TV y SAT · cableado coaxial · repartidores y derivadores · orientación de parabólicas y sustitución de LNB · renovación de porteros antiguos · placas de calle, telefonillos y monitores · averías eléctricas domésticas.</p></div></div></section>`;
}

function home(){
  const areas=[...groups.entries()].map(([slug,g])=>`<section class="area"><div class="areahead"><h3>${esc(g.provincia)}</h3><a href="/${slug}/">Ver todos →</a></div><div class="towns">${[...g.items].sort((a,b)=>a.localidad.localeCompare(b.localidad,'es')).slice(0,12).map(d=>`<a href="/${slug}/${d.slug}/">${esc(d.localidad)}</a>`).join('')}</div></section>`).join('');
  const services=homeServiceBlock();
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>Antenista Cerca | Técnico de antenas y urgencias 24 horas</title><meta name="description" content="Técnico de antenas cerca de ti: TDT, parabólicas, amplificación, porteros automáticos, cobertura móvil, reparaciones eléctricas y urgencias 24 horas."><link rel="canonical" href="${DOMAIN}/"><style>:root{--b:#0a3f73;--d:#082b4d;--r:#d92128;--g:#10ad3e;--l:#dce5ec;--s:#f4f8fb;--sh:0 12px 30px rgba(16,45,72,.10)}*{box-sizing:border-box}body{margin:0;font:16px Arial;color:#10243a;line-height:1.55}a{text-decoration:none;color:inherit}.w{width:min(1280px,calc(100% - 48px));margin:auto}.top{background:var(--d);color:#fff;font-size:13px;padding:7px 0}.top .w{display:flex;justify-content:space-between}.head{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:22px;padding:12px 0}.brand{display:flex;align-items:center;gap:10px}.ico{font-size:34px}.brand b{font-size:27px;color:var(--b)}.brand b span{color:#888}.brand small{display:block;font:italic 14px Georgia;color:var(--b)}nav{display:flex;gap:20px;font-weight:700;font-size:14px}.tel{font-size:24px;color:var(--r);font-weight:800}.hero{background:linear-gradient(90deg,#fbfdff,#dceef9)}.hg{display:grid;grid-template-columns:1fr 1.03fr;min-height:420px}.copy{align-self:center;padding:38px 28px 34px 0}.kicker{font-size:12px;font-weight:800;letter-spacing:.12em;color:var(--b);text-transform:uppercase}.urgent{display:inline-flex;margin:10px 0 2px;padding:7px 10px;border-radius:999px;background:#fff3f3;color:#b81319;font-size:13px;font-weight:800;border:1px solid #ffd7d9}.copy h1{font-size:52px;line-height:1;margin:10px 0 12px;color:#0b3765}.copy h2{font-size:23px}.checks{list-style:none;padding:0}.checks li{margin:7px 0}.checks li:before{content:'✓';color:var(--g);font-weight:bold;margin-right:9px}.actions{display:flex;gap:12px;flex-wrap:wrap}.btn{padding:13px 18px;border-radius:9px;color:#fff;font-weight:800}.red{background:var(--r)}.green{background:var(--g)}.heroimg{overflow:hidden}.heroimg img{width:100%;height:100%;object-fit:cover}.section{padding:38px 0}.section h2{font-size:30px;color:var(--b)}.service-lead{max-width:940px;color:#536373}.service-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:22px}.service-grid article{border:1px solid #e3ebf1;border-radius:15px;overflow:hidden;background:#fff;box-shadow:var(--sh)}.service-grid>article>img{width:100%;height:190px;object-fit:cover;background:#eef3f6}.home-pair{height:190px}.home-pair img{height:190px}.service-grid article>div:not(.portero-pair){padding:16px}.service-grid h3{margin:0 0 7px;color:var(--b);font-size:20px}.service-grid p{margin:0;color:#536373}.brand-list{margin-top:10px!important;color:var(--b)!important;font-size:13px;font-weight:800}.brands-strip{margin-top:22px;padding:15px 17px;border:1px solid var(--l);border-radius:12px;background:#f7fafc;display:flex;flex-wrap:wrap;gap:7px 18px;color:#536373;font-size:14px}.brands-strip strong{color:var(--b)}.extra-services{margin-top:20px;padding-top:18px;border-top:1px solid var(--l);color:#536373;line-height:1.7}.extra-services strong{display:block;color:var(--b);font-size:18px;margin-bottom:4px}.extra-services p{margin:0}.portero-pair{display:grid;grid-template-columns:1fr 1fr;background:#eef3f6}.portero-pair img{width:100%;object-fit:cover;min-width:0}.portero-pair img+img{border-left:2px solid #fff}.zones{background:var(--s)}.area{margin:20px 0}.areahead{display:flex;justify-content:space-between;align-items:center}.areahead h3{color:var(--b)}.towns{display:grid;grid-template-columns:repeat(4,1fr);gap:10px 12px}.towns a{background:#fff;border:1px solid var(--l);padding:11px 12px;border-radius:9px;color:var(--b);font-weight:700}.local{display:grid;grid-template-columns:.92fr 1.08fr;gap:30px;align-items:center}.local img{width:100%;height:300px;object-fit:cover;border-radius:14px;box-shadow:var(--sh);filter:grayscale(100%);opacity:.88}.direct-home{margin-top:12px;font-weight:700;color:var(--b)}.cta{background:var(--b);color:#fff;padding:26px;border-radius:12px}.cta h2{color:#fff}footer{background:var(--d);color:#fff;padding:24px 0;margin-top:34px}@media(max-width:850px){nav{display:none}.head{grid-template-columns:1fr auto}.hg,.local{grid-template-columns:1fr}.copy{padding:28px 0 20px}.heroimg{height:300px}.service-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.towns{grid-template-columns:1fr 1fr}}@media(max-width:520px){.w{width:min(100% - 22px,1280px)}.top{display:none}.brand b{font-size:18px}.ico{font-size:28px}.tel{font-size:16px}.copy h1{font-size:40px}.service-grid{gap:10px}.service-grid>article>img,.home-pair,.home-pair img{height:125px}.service-grid article>div:not(.portero-pair){padding:12px}.service-grid h3{font-size:16px}.service-grid p{font-size:12px}.brand-list{font-size:11px}.brands-strip{display:block}.brands-strip span{display:block;margin-top:5px}.extra-services{font-size:13px}.extra-services strong{font-size:16px}}</style></head><body><div class="top"><div class="w"><span>Antenas TDT · Parabólicas · Porteros automáticos · Cobertura móvil</span><span>Urgencias 24 horas</span></div></div><header><div class="w head"><a class="brand" href="/"><span class="ico">📡</span><span><b>ANTENISTA <span>CERCA</span></b><small>Tu antenista de confianza</small></span></a><nav><a href="#servicios">Servicios</a><a href="#zonas">Zonas</a><a href="#contacto">Contacto</a></nav><a class="tel" href="tel:${TEL}">☎ ${PHONE}</a></div></header><main><section class="hero"><div class="w hg"><div class="copy"><div class="kicker">Técnico de antenas cerca de ti</div><div class="urgent">Urgencias 24 horas</div><h1>Antenista cerca de ti</h1><h2>Instalación, reparación y mantenimiento de antenas</h2><ul class="checks"><li>Averías y falta de señal</li><li>Antenas TDT y parabólicas</li><li>Porteros automáticos y videoporteros</li><li>Viviendas, comunidades y negocios</li></ul><div class="actions"><a class="btn red" href="tel:${TEL}">☎ ${PHONE}</a><a class="btn green" href="https://wa.me/${WA}">WhatsApp</a></div></div><div class="heroimg"><img src="${HERO}" alt="Técnico de antenas trabajando"></div></div></section>${services}<section id="zonas" class="section zones"><div class="w"><h2>Encuentra un técnico de antenas en tu municipio</h2><p>Elige tu municipio para consultar el servicio disponible y las localidades próximas.</p>${areas}</div></section><section class="section"><div class="w local"><img src="${TOWN}" alt="Zona de servicio"><div><h2>Un antenista cerca cuando lo necesitas</h2><p>Atendemos averías de señal, instalaciones TDT y parabólicas, amplificación, porteros automáticos y videoporteros, cobertura móvil y pequeñas reparaciones eléctricas.</p><p class="direct-home">Trato directo con el técnico desde el primer contacto, sin centralitas ni intermediarios.</p></div></div></section><section id="contacto" class="section"><div class="w cta"><h2>¿Necesitas un técnico?</h2><p>Urgencias 24 horas. Cuéntanos la avería o instalación que necesitas.</p><div class="actions"><a class="btn red" href="tel:${TEL}">Llamar ${PHONE}</a><a class="btn green" href="https://wa.me/${WA}">WhatsApp</a></div></div></section></main><footer><div class="w"><strong>Antenista Cerca</strong> · ${PHONE}</div></footer></body></html>`;
}

fs.rmSync(OUT,{recursive:true,force:true});
fs.mkdirSync(OUT,{recursive:true});
for(const d of localidades){
  const dir=path.join(OUT,d.provinciaSlug,d.slug);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),town(d));
}
for(const [slug,g] of groups){
  const dir=path.join(OUT,slug);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),province(g.provincia,slug,g.items));
}
fs.writeFileSync(path.join(OUT,'index.html'),home());
const urls=[`${DOMAIN}/`,...[...groups.keys()].map(s=>`${DOMAIN}/${s}/`),...localidades.map(d=>`${DOMAIN}/${d.provinciaSlug}/${d.slug}/`)];
fs.writeFileSync(path.join(OUT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${u}</loc></url>`).join('')}</urlset>`);
fs.writeFileSync(path.join(OUT,'robots.txt'),`User-agent: *\nDisallow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);
console.log(`Generadas ${localidades.length} localidades, ${groups.size} provincias y portada desde un único generador.`);