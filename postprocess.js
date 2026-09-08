import fs from 'node:fs';
import path from 'node:path';

const root='public';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const html=walk(root).filter(f=>f.endsWith('.html'));

const serviceBlock=`<section class="section service-detail"><div class="w"><div class="kicker">SERVICIO TÉCNICO</div><h2>Servicios técnicos para viviendas y comunidades</h2><p class="service-lead">Técnico de antenas y antenista para instalación y reparación de antenas de TV y TDT, antenas individuales y colectivas, porteros automáticos y videoporteros, soluciones de cobertura móvil y reparaciones eléctricas del hogar.</p><div class="service-grid"><article><img src="/assets/antena.jpeg" alt="Antena TDT moderna para instalación y reparación"><div><h3>Antenas TDT</h3><p>Instalación, orientación y reparación de antenas TDT individuales y colectivas, revisión de señal, cableado y tomas.</p></div></article><article><img src="/assets/parabolica.jpeg" alt="Antena parabólica para recepción por satélite"><div><h3>Antenas parabólicas</h3><p>Instalación, orientación, ajuste de señal y reparación de parabólicas, LNB, conectores y distribución.</p></div></article><article><img src="/assets/monocanal.jpeg" alt="Cabecera de amplificación y módulos monocanal"><div><h3>Antenas y amplificación</h3><p>Reparación de amplificadores de antena, cabeceras, centrales de amplificación, fuentes y módulos monocanal.</p></div></article><article><img src="/assets/portero.jpeg" alt="Placa de portero automático y videoportero"><div><h3>Porteros automáticos y videoporteros</h3><p>Instalación, reparación y renovación de equipos, placas de calle, telefonillos, monitores, alimentación y cableado.</p></div></article><article><img src="/assets/cobertura-movil.png" alt="Solución de cobertura móvil para vivienda"><div><h3>Cobertura móvil</h3><p>Soluciones para viviendas con señal móvil débil, con revisión de cobertura, antena exterior, orientación y cableado.</p></div></article><article class="electric-card"><div class="electric-ico" aria-hidden="true">⚡</div><div><h3>Reparaciones eléctricas</h3><p>Apagones, cortocircuitos, derivaciones, interruptores, enchufes, iluminación y cuadros eléctricos del hogar.</p></div></article></div><div class="brands-strip"><strong>Marcas habituales</strong><span>Porteros: Fermax · Tegui · Golmar · Comelit · Fringe · Galak</span><span>Antenas y amplificación: Televés · Ikusi · Fagor · Rover · EK · Fringe</span></div></div></section>`;

const css=`<style>.service-detail{background:#fff}.service-lead{max-width:940px;color:#536373}.service-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:22px}.service-grid article{border:1px solid #e3ebf1;border-radius:15px;overflow:hidden;background:#fff;box-shadow:0 12px 30px rgba(16,45,72,.10)}.service-grid img{width:100%;height:190px;object-fit:cover;background:#eef3f6}.service-grid article>div{padding:16px}.service-grid h3{margin:0 0 7px;color:#0a3f73;font-size:20px}.service-grid p{margin:0;color:#536373}.service-detail .kicker{font-size:12px;font-weight:800;letter-spacing:.12em;color:#0a3f73}.electric-card{display:flex;flex-direction:column}.electric-ico{height:190px!important;padding:0!important;display:grid;place-items:center;font-size:72px;background:linear-gradient(135deg,#eef5fa,#fff7df)}.brands-strip{margin-top:22px;padding:15px 17px;border:1px solid #dce5ec;border-radius:12px;background:#f7fafc;display:flex;flex-wrap:wrap;gap:7px 18px;color:#536373;font-size:14px}.brands-strip strong{color:#0a3f73}.brands-note{margin-top:12px;color:#536373;font-size:15px;line-height:1.6}@media(max-width:760px){.service-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.service-grid img,.electric-ico{height:125px!important}.service-grid article>div{padding:12px}.service-grid h3{font-size:16px}.service-grid p{font-size:12px}.brands-strip{display:block}.brands-strip span{display:block;margin-top:5px}}@media(max-width:390px){.service-grid{grid-template-columns:1fr 1fr}}</style>`;

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

for(const f of html){let s=fs.readFileSync(f,'utf8');
  if(f===path.join(root,'index.html')){
    s=s.replace(/<section class="section service-detail">[\s\S]*?<\/section>(?=<section id="zonas")/i,'');
    s=s.replace('<section id="zonas"',serviceBlock+'<section id="zonas"');
    if(!s.includes('.service-grid{')) s=s.replace('</head>',css+'</head>');
    else s=s.replace(/<style>\.service-detail\{[\s\S]*?<\/style>/i,css);
  } else {
    const i=hash(f)%porteroVariants.length;
    if(!s.includes('brands-note antenna-brands')) s=s.replace(/(<section class="band" id="reparacion">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/i,`$1$2</p><p class="brands-note antenna-brands">${antennaVariants[i]}</p>`);
    if(!s.includes('brands-note portero-brands')) s=s.replace(/(<section class="band" id="porteros">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/i,`$1$2</p><p class="brands-note portero-brands">${porteroVariants[i]}</p>`);
    if(!s.includes('.brands-note{')) s=s.replace('</head>',css+'</head>');
  }
  fs.writeFileSync(f,s);
}
console.log('Postprocesado de contenido, servicios, fotos y marcas completado.');