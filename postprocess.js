import fs from 'node:fs';
import path from 'node:path';

const root='public';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const html=walk(root).filter(f=>f.endsWith('.html'));

const serviceBlock=`<section class="section service-detail"><div class="w"><div class="kicker">SERVICIO TÉCNICO</div><h2>Servicios técnicos para viviendas y comunidades</h2><p class="service-lead">Técnico de antenas y antenista para instalación y reparación de antenas de TV y TDT, antenas individuales y colectivas, porteros automáticos y videoporteros, soluciones de cobertura móvil y reparaciones eléctricas del hogar.</p><div class="service-grid"><article><img src="/assets/monocanal.jpeg" alt="Reparación de antenas y amplificadores"><div><h3>Antenas y amplificación</h3><p>Instalación y reparación de antenas individuales y colectivas, TDT, parabólicas, amplificadores de antena, cabeceras, centrales de amplificación y módulos monocanal.</p></div></article><article><img src="/assets/portero.jpeg" alt="Portero automático y videoportero"><div><h3>Porteros automáticos y videoporteros</h3><p>Instalación, reparación y renovación de equipos. Revisión de placas de calle, telefonillos, monitores, alimentación y cableado.</p></div></article><article><img src="/assets/cobertura-movil.png" alt="Cobertura móvil en vivienda"><div><h3>Cobertura móvil y electricidad</h3><p>Soluciones de cobertura móvil y reparaciones eléctricas: apagones urgentes, cortocircuitos y derivaciones, interruptores, enchufes, iluminación y cuadros eléctricos.</p></div></article></div></div></section>`;

const css=`<style>.service-detail{background:#fff}.service-lead{max-width:940px;color:#536373}.service-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:22px}.service-grid article{border:1px solid #e3ebf1;border-radius:15px;overflow:hidden;background:#fff;box-shadow:0 12px 30px rgba(16,45,72,.10)}.service-grid img{width:100%;height:190px;object-fit:cover}.service-grid article div{padding:16px}.service-grid h3{margin:0 0 7px;color:#0a3f73;font-size:20px}.service-grid p{margin:0;color:#536373}.service-detail .kicker{font-size:12px;font-weight:800;letter-spacing:.12em;color:#0a3f73}@media(max-width:760px){.service-grid{grid-template-columns:1fr}.service-grid img{height:180px}}</style>`;

for(const f of html){let s=fs.readFileSync(f,'utf8');
  if(f===path.join(root,'index.html')){
    if(!s.includes('Servicios técnicos para viviendas y comunidades')) s=s.replace('<section id="zonas"',serviceBlock+'<section id="zonas"');
    if(!s.includes('.service-grid{')) s=s.replace('</head>',css+'</head>');
  }
  fs.writeFileSync(f,s);
}
console.log('Postprocesado de contenido y servicios completado.');