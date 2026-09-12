import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const PHONE='641 589 394';
const TEL='+34641589394';
const WA='34641589394';
const SHARED_CSS='<link rel="stylesheet" href="/assets/shared-ui.css">';
const TOWN_CSS='<link rel="stylesheet" href="/assets/town-enhancements.css">';
const hash=s=>[...s].reduce((a,c)=>(a+c.charCodeAt(0))%997,0);
const SUBTITLE='Técnico para instalación, reparación y mantenimiento de antenas, porteros automáticos y videoporteros';

const townHeadings=[
  l=>`Servicio técnico de antenas en ${l} y alrededores`,
  l=>`Técnico de antenas en ${l}: atención directa`,
  l=>`Antenista en ${l} para instalación y reparación`,
  l=>`Atención técnica de antenas en ${l}`
];
const townIntros=[
  'Atención para viviendas y comunidades, con contacto directo para explicar la avería o instalación que necesitas.',
  'Servicio de proximidad para averías e instalaciones de antena, con atención directa desde el primer contacto.',
  'Soluciones para recepción de TV, instalaciones colectivas y sistemas de acceso en viviendas y comunidades.',
  'Cuéntanos el problema y recibe atención directa para valorar la reparación o instalación necesaria.'
];

function ensureTownStyles(h){
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
function townTrustBlock(d,v){
  return `<section class="town-trust" aria-label="Servicio técnico en ${d.localidad}"><div class="wrap"><div class="town-trust-card"><div class="town-trust-stars" aria-hidden="true">★★★★★</div><h2>${townHeadings[v](d.localidad)}</h2><p class="town-trust-lead">${townIntros[v]}</p><div class="town-trust-points"><span>✓ Antenas individuales y colectivas</span><span>✓ Instalación y reparación TDT</span><span>✓ Porteros automáticos y videoporteros</span><span>✓ Averías y falta de señal</span></div><div class="town-trust-actions"><a class="town-trust-phone" href="tel:${TEL}">☎ ${PHONE}</a><a class="btn green" href="https://wa.me/${WA}">WhatsApp</a></div></div></div></section>`;
}
function finalizeTown(d){
  const file=path.join('public',d.provinciaSlug,d.slug,'index.html');
  let h=fs.readFileSync(file,'utf8');
  const v=hash(`${d.provinciaSlug}/${d.slug}`)%townHeadings.length;
  h=ensureTownStyles(h);
  h=h.replace(`<div class="kicker">Técnico de antenas en ${d.localidad}</div>`,'<div class="kicker">Hoy estamos cerca de tu casa</div>');
  h=h.replace(/(<div class="copy">[\s\S]*?<h1>[\s\S]*?<\/h1>\s*<h2>)[\s\S]*?(<\/h2>)/i,`$1${SUBTITLE}$2`);
  if(!h.includes('class="old-doorphones"')){
    h=h.replace(/(<section class="band" id="porteros">[\s\S]*?<h2>Instalación, reparación y renovación de porteros automáticos y videoporteros en [^<]+<\/h2>[\s\S]*?<p>[^<]*<\/p>)/i,`$1${doorphoneGallery(d)}`);
  }
  h=h.replace(/(<section class="band" id="porteros">[\s\S]*?)<p class="brands-note">[\s\S]*?<\/p>/i,`$1${doorphoneBrands}`);
  h=h.replace(/(<section class="band" id="reparacion">[\s\S]*?)<p class="brands-note">[\s\S]*?<\/p>/i,`$1${amplifierGallery(d)}${antennaBrands}`);
  h=h.replace(/(<section class="band" id="reparacion">[\s\S]*?)<aside class="help">[\s\S]*?<\/aside>/i,`$1${helpBox}`);
  if(!h.includes('class="town-trust"')){
    const block=townTrustBlock(d,v);
    if(h.includes('<section class="contact"')) h=h.replace('<section class="contact"',block+'<section class="contact"');
    else if(h.includes('<footer')) h=h.replace('<footer',block+'<footer');
    else h=h.replace('</main>',block+'</main>');
  }
  fs.writeFileSync(file,h);
}

const homeFile='public/index.html';
const homeCss=`<style id="home-polish">
@media (hover:hover) and (pointer:fine){
.service-grid article,.area,.towns a,.direct-home,.btn,.areahead a,.home-brand{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,filter .18s ease,background-color .18s ease}
.service-grid article:hover{transform:translateY(-2px);box-shadow:0 15px 32px rgba(16,45,72,.13);border-color:#cbdde9}.towns a:hover{transform:translateY(-1px);background:#f1f7fb;border-color:#bfd4e3}.area:hover{box-shadow:0 8px 20px rgba(16,45,72,.08)}.btn:hover{filter:brightness(.96)}.direct-home:hover{box-shadow:0 8px 18px rgba(16,45,72,.09)}.areahead a:hover{transform:translateX(3px)}.home-brand:hover{transform:translateY(-1px);border-color:#bfd4e3;box-shadow:0 5px 12px rgba(16,45,72,.08)}}
.trust-home{padding:4px 0 38px}.trust-card{text-align:center;padding:31px 28px;border:1px solid #dce5ec;border-radius:16px;background:linear-gradient(135deg,#f8fbfd,#eef6fb);box-shadow:0 10px 26px rgba(16,45,72,.07)}.trust-stars{color:#e6a800;font-size:27px;letter-spacing:4px;line-height:1;margin-bottom:11px}.trust-card h2{margin:0 0 8px;color:#0a3f73;font-size:30px;line-height:1.15}.trust-card>p{max-width:780px;margin:0 auto;color:#536373}.trust-points{display:flex;justify-content:center;flex-wrap:wrap;gap:9px 12px;margin:19px auto 21px}.trust-points span{display:inline-flex;align-items:center;padding:8px 11px;border:1px solid #d7e4ed;border-radius:999px;background:#fff;color:#29465f;font-size:13px;font-weight:700}.trust-call{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}.trust-phone{font-size:25px;font-weight:900;color:#d92128!important}
.home-brands{position:relative;margin-top:24px;padding:28px 22px 24px;border:1px solid #dce5ec;border-radius:16px;background:linear-gradient(135deg,#fbfdff,#f1f7fb);text-align:center;box-shadow:0 8px 22px rgba(16,45,72,.06);overflow:hidden}.home-brands:before{content:'✦';position:absolute;right:18px;top:12px;color:#d7e7f2;font-size:36px;line-height:1}.home-brands-kicker{display:inline-flex;align-items:center;gap:7px;margin-bottom:5px;color:#6c8294;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.home-brands h3{margin:0;color:#0a3f73;font-size:24px;line-height:1.2}.home-brands-intro{max-width:720px;margin:7px auto 18px;color:#607282;font-size:14px}.home-brand-group{padding-top:3px}.home-brand-group+.home-brand-group{margin-top:17px;padding-top:17px;border-top:1px solid #e1e9ef}.home-brand-title{display:block;color:#0a3f73;font-size:14px;font-weight:900;margin-bottom:9px;text-align:center}.home-brand-list{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}.home-brand{display:inline-flex;align-items:center;padding:7px 11px;border:1px solid #d7e4ed;border-radius:999px;background:#fff;color:#0a3f73;font-size:13px;font-weight:800;line-height:1;box-shadow:0 2px 7px rgba(16,45,72,.04)}
@media(max-width:640px){.trust-home{padding:0 0 24px}.trust-card{padding:24px 14px;border-radius:13px}.trust-stars{font-size:23px;letter-spacing:3px}.trust-card h2{font-size:24px}.trust-card>p{font-size:14px}.trust-points{gap:7px;margin:16px 0 18px}.trust-points span{font-size:12px;padding:7px 9px}.trust-phone{font-size:22px}.home-brands{padding:22px 11px 19px;border-radius:13px}.home-brands:before{font-size:28px;right:10px;top:9px}.home-brands h3{font-size:21px}.home-brands-intro{font-size:12px;margin:6px auto 15px}.home-brand-title{font-size:13px}.home-brand-list{justify-content:center;gap:6px}.home-brand{font-size:12px;padding:6px 9px}.home-brand-group+.home-brand-group{margin-top:14px;padding-top:14px}}
@media(prefers-reduced-motion:reduce){.service-grid article,.area,.towns a,.direct-home,.btn,.areahead a,.home-brand{transition:none!important}}
</style>`;
const homeTrust=`<section class="trust-home" aria-labelledby="trust-title"><div class="w"><div class="trust-card"><div class="trust-stars" aria-hidden="true">★★★★★</div><h2 id="trust-title">Experiencia para reparar, renovar e instalar</h2><p>Trabajamos tanto con instalaciones antiguas como con equipos actuales, buscando una solución práctica antes de sustituir más de lo necesario.</p><div class="trust-points"><span>✓ Diagnóstico antes de cambiar</span><span>✓ Equipos antiguos y actuales</span><span>✓ Viviendas y comunidades</span><span>✓ Urgencias 24 horas</span></div><div class="trust-call"><a class="trust-phone" href="tel:+34641589394">☎ 641 589 394</a><a class="btn green" href="https://wa.me/34641589394">WhatsApp</a></div></div></div></section>`;
const homeBrands=`<div class="home-brands" aria-label="Marcas habituales"><div class="home-brands-kicker">Experiencia con equipos antiguos y actuales</div><h3>Marcas con las que trabajamos</h3><p class="home-brands-intro">Equipos habituales en instalaciones de antena, amplificación, porteros automáticos y videoporteros.</p><div class="home-brand-group"><span class="home-brand-title">Antenas y amplificación</span><div class="home-brand-list"><span class="home-brand">Televés</span><span class="home-brand">Alcad</span><span class="home-brand">Ikusi</span><span class="home-brand">Fagor</span><span class="home-brand">Rover</span><span class="home-brand">EK</span><span class="home-brand">FTE Maximal</span><span class="home-brand">Fringe</span></div></div><div class="home-brand-group"><span class="home-brand-title">Porteros y videoporteros</span><div class="home-brand-list"><span class="home-brand">Fermax</span><span class="home-brand">Tegui</span><span class="home-brand">Golmar</span><span class="home-brand">Comelit</span><span class="home-brand">Bticino</span><span class="home-brand">Legrand</span><span class="home-brand">Fringe</span><span class="home-brand">Galak</span></div></div></div>`;
function finalizeHome(){
  let h=fs.readFileSync(homeFile,'utf8');
  h=h.replace('<div class="kicker">Técnico de antenas cerca de ti</div>','<div class="kicker">Hoy estamos cerca de tu casa</div>');
  h=h.replace(/(<div class="copy">[\s\S]*?<h1>)[\s\S]*?(<\/h1>\s*<h2>)[\s\S]*?(<\/h2>)/i,`$1Antenista cerca de tu vivienda$2${SUBTITLE}$3`);
  h=h.replace('<strong>Trato directo con el técnico</strong>','<strong>Atención sin intermediarios</strong>');
  h=h.replace('Te atiende una persona que conoce el trabajo desde el primer contacto, sin centralitas ni intermediarios.','Hablas directamente con quien conoce el trabajo y puede orientarte desde el primer contacto.');
  h=h.replace(/<div class="brands-strip">[\s\S]*?<\/div>/i,homeBrands);
  h=h.replace(/<div class="home-brands"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i,homeBrands);
  h=h.replace(/<p class="brand-list">[\s\S]*?<\/p>/gi,'');
  if(!h.includes('id="home-polish"')) h=h.replace('</head>',homeCss+'</head>');
  if(!h.includes('class="trust-home"')) h=h.replace('<section id="contacto"',homeTrust+'<section id="contacto"');
  fs.writeFileSync(homeFile,h);
}

finalizeHome();
for(const d of localidades) finalizeTown(d);
console.log(`Acabado final consolidado: portada + ${localidades.length} localidades.`);
