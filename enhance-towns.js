import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const PHONE='641 589 394';
const TEL='+34641589394';
const WA='34641589394';
const SHARED_CSS='<link rel="stylesheet" href="/assets/shared-ui.css">';
const TOWN_CSS='<link rel="stylesheet" href="/assets/town-enhancements.css">';
const hash=s=>[...s].reduce((a,c)=>(a+c.charCodeAt(0))%997,0);

const headings=[
  l=>`Servicio técnico de antenas en ${l} y alrededores`,
  l=>`Técnico de antenas en ${l}: atención directa`,
  l=>`Antenista en ${l} para instalación y reparación`,
  l=>`Atención técnica de antenas en ${l}`
];
const intros=[
  'Atención para viviendas y comunidades, con contacto directo para explicar la avería o instalación que necesitas.',
  'Servicio de proximidad para averías e instalaciones de antena, con atención directa desde el primer contacto.',
  'Soluciones para recepción de TV, instalaciones colectivas y sistemas de acceso en viviendas y comunidades.',
  'Cuéntanos el problema y recibe atención directa para valorar la reparación o instalación necesaria.'
];

function ensureStyles(h){
  h=h.replace(/<style id="shared-ui">[\s\S]*?<\/style>/i,SHARED_CSS);
  if(!h.includes('/assets/shared-ui.css')) h=h.replace('</head>',SHARED_CSS+'</head>');
  if(!h.includes('/assets/town-enhancements.css')) h=h.replace('</head>',TOWN_CSS+'</head>');
  return h;
}

function doorphoneGallery(d){
  return `<div class="old-doorphones"><div class="old-doorphones-grid"><figure><img src="/assets/portero-antiguo-1.jpg" loading="lazy" alt="Placa de portero automático antigua para reparar o renovar en ${d.localidad}"></figure><figure><img src="/assets/portero-antiguo-2.jpg" loading="lazy" alt="Portero automático Fermax antiguo para reparación o sustitución en ${d.localidad}"></figure><figure><img src="/assets/portero-antiguo-3.jpg" loading="lazy" alt="Placa de portero Tegui antigua para reparar o cambiar por videoportero en ${d.localidad}"></figure></div><div class="old-doorphones-copy"><strong>¿Tienes un portero antiguo?</strong><p>Reparamos placas de calle, telefonillos, pulsadores, fuentes y cableado. Si el sistema está obsoleto, también podemos renovarlo o sustituirlo por un portero o videoportero actual.</p></div></div>`;
}

const doorphoneBrands=`<div class="doorphone-brands" aria-label="Marcas habituales de porteros automáticos"><span class="doorphone-brands-label">Trabajamos con:</span><span class="doorphone-brand">Fermax</span><span class="doorphone-brand">Tegui</span><span class="doorphone-brand">Golmar</span><span class="doorphone-brand">Comelit</span><span class="doorphone-brand">Bticino</span><span class="doorphone-brand">Legrand</span><span class="doorphone-brand">Fringe</span><span class="doorphone-brand">Galak</span></div>`;

function amplifierGallery(d){
  return `<div class="amp-gallery"><div class="amp-grid"><figure><img src="/assets/amplificador-alcad-interior.jpg" loading="lazy" alt="Amplificador de interior Alcad para antena en ${d.localidad}"></figure><figure><img src="/assets/amplificador-alcad-mastil.jpg" loading="lazy" alt="Amplificador de mástil Alcad para antena TDT en ${d.localidad}"></figure><figure><img src="/assets/amplificador-televes.jpg" loading="lazy" alt="Amplificador Televés para reparación de antena en ${d.localidad}"></figure><figure><img src="/assets/amplificador-satelite-rover-ek.jpg" loading="lazy" alt="Amplificador y equipo de satélite Rover EK en ${d.localidad}"></figure></div><div class="amp-copy"><strong>Reparación y sustitución de amplificadores</strong><p>Reparamos amplificadores de interior y de mástil, fuentes de alimentación, centrales de amplificación y equipos de satélite. Revisamos primero la avería para sustituir únicamente lo necesario.</p></div></div>`;
}

const antennaBrands=`<div class="doorphone-brands" aria-label="Marcas habituales de antenas y amplificación"><span class="doorphone-brands-label">Trabajamos con:</span><span class="doorphone-brand">Televés</span><span class="doorphone-brand">Alcad</span><span class="doorphone-brand">Ikusi</span><span class="doorphone-brand">Fagor</span><span class="doorphone-brand">Rover</span><span class="doorphone-brand">EK</span><span class="doorphone-brand">FTE Maximal</span><span class="doorphone-brand">Fringe</span></div>`;
const helpBox=`<aside class="help"><strong>¿Tienes una avería?</strong><span>Habla directamente con el técnico.</span><span class="help-services">Antenas · Porteros · Videoporteros · Amplificación</span><a href="tel:${TEL}">☎ ${PHONE}</a></aside>`;

function trustBlock(d,v){
  return `<section class="town-trust" aria-label="Servicio técnico en ${d.localidad}"><div class="wrap"><div class="town-trust-card"><div class="town-trust-stars" aria-hidden="true">★★★★★</div><h2>${headings[v](d.localidad)}</h2><p class="town-trust-lead">${intros[v]}</p><div class="town-trust-points"><span>✓ Antenas individuales y colectivas</span><span>✓ Instalación y reparación TDT</span><span>✓ Porteros automáticos y videoporteros</span><span>✓ Averías y falta de señal</span></div><div class="town-trust-actions"><a class="town-trust-phone" href="tel:${TEL}">☎ ${PHONE}</a><a class="btn green" href="https://wa.me/${WA}">WhatsApp</a></div></div></div></section>`;
}

function enhanceTown(d){
  const file=path.join('public',d.provinciaSlug,d.slug,'index.html');
  let h=fs.readFileSync(file,'utf8');
  const v=hash(`${d.provinciaSlug}/${d.slug}`)%headings.length;

  h=ensureStyles(h);
  h=h.replace(`<div class="kicker">Técnico de antenas en ${d.localidad}</div>`,'<div class="kicker">Hoy estamos cerca de tu casa</div>');

  if(!h.includes('class="old-doorphones"')){
    h=h.replace(/(<section class="band" id="porteros">[\s\S]*?<h2>Instalación, reparación y renovación de porteros automáticos y videoporteros en [^<]+<\/h2>[\s\S]*?<p>[^<]*<\/p>)/i,`$1${doorphoneGallery(d)}`);
  }
  h=h.replace(/(<section class="band" id="porteros">[\s\S]*?)<p class="brands-note">[\s\S]*?<\/p>/i,`$1${doorphoneBrands}`);
  h=h.replace(/(<section class="band" id="reparacion">[\s\S]*?)<p class="brands-note">[\s\S]*?<\/p>/i,`$1${amplifierGallery(d)}${antennaBrands}`);
  h=h.replace(/(<section class="band" id="reparacion">[\s\S]*?)<aside class="help">[\s\S]*?<\/aside>/i,`$1${helpBox}`);

  if(!h.includes('class="town-trust"')){
    const block=trustBlock(d,v);
    if(h.includes('<section class="contact"')) h=h.replace('<section class="contact"',block+'<section class="contact"');
    else if(h.includes('<footer')) h=h.replace('<footer',block+'<footer');
    else h=h.replace('</main>',block+'</main>');
  }

  fs.writeFileSync(file,h);
}

for(const d of localidades) enhanceTown(d);
console.log(`Localidades afinadas con CSS compartido y cacheable: ${localidades.length}.`);
