import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with {type:'json'};

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const letter=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').charAt(0).toUpperCase();
const groups=new Map();
for(const d of localidades){
  if(!groups.has(d.provinciaSlug)) groups.set(d.provinciaSlug,{name:d.provincia,items:[]});
  groups.get(d.provinciaSlug).items.push(d);
}

const css=`<style id="province-hub-css">
.province-seo{padding:26px 0 8px}.province-seo h2{margin:0 0 8px}.province-seo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}.province-seo-card{border:1px solid #dce5ec;border-radius:12px;padding:17px;background:#fff}.province-seo-card strong{display:block;color:#0a3f73;margin-bottom:5px}.province-seo-card p{margin:0;color:#536373;font-size:14px}
.alpha-localities{padding:26px 0 34px}.alpha-localities h2{margin-bottom:8px}.alpha-intro{color:#536373;max-width:900px}.alpha-nav{display:flex;flex-wrap:wrap;gap:7px;margin:18px 0 25px}.alpha-nav a{display:grid;place-items:center;min-width:36px;height:36px;padding:0 9px;border:1px solid #ccdce7;border-radius:8px;background:#f7fbfd;color:#0a3f73;font-weight:900}.alpha-group{scroll-margin-top:90px;margin:0 0 24px}.alpha-group h3{color:#0a3f73;font-size:23px;margin:0 0 10px;padding-bottom:7px;border-bottom:2px solid #e5eef4}.alpha-links{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px 12px}.alpha-links a{padding:9px 10px;border:1px solid #e0e8ee;border-radius:8px;background:#fff;color:#174b76;font-weight:700;font-size:14px}.alpha-links a:hover{background:#f1f7fb}
@media(max-width:900px){.province-seo-grid{grid-template-columns:1fr}.alpha-links{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:520px){.alpha-localities{padding-top:20px}.alpha-nav{gap:5px}.alpha-nav a{min-width:33px;height:33px}.alpha-links{grid-template-columns:1fr}.alpha-group h3{font-size:21px}}
</style>`;

const practicalGuides=[
 {title:'¿La televisión pierde algunos canales TDT?',body:'Antes de cambiar la antena, conviene comprobar si el problema afecta a una sola toma, a todos los televisores o a otros vecinos. Una pérdida parcial puede deberse a distribución, conexiones o amplificación; el diagnóstico requiere revisar la instalación.'},
 {title:'¿El portero automático no llama o no abre?',body:'Es útil distinguir entre fallo de llamada, audio, vídeo y apertura. También importa si ocurre en una vivienda o en toda la comunidad. Esa información ayuda a localizar si la incidencia afecta al terminal, la placa, la alimentación o el cableado.'},
 {title:'¿La parabólica ha dejado de recibir señal?',body:'La falta de señal puede relacionarse con el ajuste, el cable coaxial, conectores, LNB o receptor. No se recomienda acceder al tejado ni mover una antena instalada en altura sin medios adecuados.'},
 {title:'¿Se corta la señal al llover?',body:'La lluvia puede poner de manifiesto problemas de estanqueidad, conectores deteriorados o un margen de señal insuficiente. Conviene comprobar los síntomas antes de sustituir equipos.'},
 {title:'¿Falla la antena colectiva de la comunidad?',body:'Si varios vecinos pierden los mismos canales, la revisión puede centrarse en cabecera, alimentación, amplificadores y distribución. Si solo falla una vivienda, también deben comprobarse sus tomas y derivaciones.'},
 {title:'¿Se puede recibir TDT por satélite HD?',body:'En determinadas zonas y circunstancias existe recepción de TDT por satélite mediante equipos autorizados. La viabilidad y requisitos deben comprobarse para cada instalación; no equivale a una recepción satelital libre de todos los canales.'}
];
function practicalSection(slug,p){
 const offset=[...slug].reduce((n,c)=>n+c.charCodeAt(0),0)%practicalGuides.length;
 const selected=[0,1,2].map(i=>practicalGuides[(offset+i)%practicalGuides.length]);
 return `<section class="province-practical" aria-label="Orientación técnica para averías en ${esc(p.name)}"><h2>Problemas habituales de antenas y porteros en ${esc(p.name)}</h2><p>Estas orientaciones ayudan a describir una avería antes de solicitar una revisión. No sustituyen una comprobación técnica ni implican que exista una sede en cada municipio.</p><div class="province-seo-grid">${selected.map(g=>`<div class="province-seo-card"><strong>${esc(g.title)}</strong><p>${esc(g.body)}</p></div>`).join('')}</div></section>`;
}
function hub(slug,p){
  const items=[...p.items].sort((a,b)=>a.localidad.localeCompare(b.localidad,'es',{sensitivity:'base'}));
  const by=new Map();
  for(const d of items){const l=letter(d.localidad)||'#';if(!by.has(l))by.set(l,[]);by.get(l).push(d)}
  const letters=[...by.keys()].sort((a,b)=>a.localeCompare(b,'es'));
  const nav=letters.map(l=>`<a href="#letra-${slug}-${l}" aria-label="Localidades de ${esc(p.name)} con ${l}">${l}</a>`).join('');
  const sections=letters.map(l=>`<section class="alpha-group" id="letra-${slug}-${l}"><h3>${l}</h3><div class="alpha-links">${by.get(l).map(d=>`<a href="/${d.provinciaSlug}/${d.slug}/">Antenista en ${esc(d.localidad)}</a>`).join('')}</div></section>`).join('');
  return `<!-- PROVINCE-HUB-START --><section class="province-seo"><div class="kicker">Servicio técnico en toda la provincia</div><h2>Antenistas en ${esc(p.name)}: instalación, reparación y mantenimiento</h2><p>Atendemos instalaciones y averías de antenas TDT y parabólicas, sistemas individuales y colectivos, amplificación y distribución de señal en localidades de ${esc(p.name)}. También trabajamos con porteros automáticos y videoporteros, revisando la instalación antes de sustituir equipos.</p><div class="province-seo-grid"><div class="province-seo-card"><strong>Antenas TDT y colectivas</strong><p>Orientación, falta de señal, cableado, tomas, repartidores y mantenimiento de instalaciones individuales y comunitarias.</p></div><div class="province-seo-card"><strong>Parabólicas y amplificación</strong><p>Instalación y ajuste de parabólicas, amplificadores, fuentes, cabeceras y módulos monocanal.</p></div><div class="province-seo-card"><strong>Porteros y videoporteros</strong><p>Reparación, renovación e instalación de telefonillos, placas de calle, porteros automáticos y videoporteros.</p></div></div></section>${practicalSection(slug,p)}<section class="alpha-localities" id="localidades"><div class="kicker">Encuentra tu localidad</div><h2>Localidades de ${esc(p.name)} por orden alfabético</h2><p class="alpha-intro">Selecciona la inicial de tu localidad para acceder directamente a la página del servicio técnico de antenista de tu zona.</p><nav class="alpha-nav" aria-label="Índice alfabético de localidades de ${esc(p.name)}">${nav}</nav>${sections}</section><!-- PROVINCE-HUB-END -->`;
}

let done=0;
for(const [slug,p] of groups){
  const file=path.join('public',slug,'index.html');
  if(!fs.existsSync(file)) throw new Error(`Province hubs: falta ${file}`);
  let h=fs.readFileSync(file,'utf8');
  h=h.replace(/<style id="province-hub-css">[\s\S]*?<\/style>/i,'');
  h=h.replace(/<!-- PROVINCE-HUB-START -->[\s\S]*?<!-- PROVINCE-HUB-END -->/i,'');
  // Sustituimos el listado plano original por el hub mejorado, para que sea visible donde ya estaba la lista.
  if(!/<div class="grid">[\s\S]*?<\/div>/i.test(h)) throw new Error(`Province hubs: no se encontró listado provincial en ${file}`);
  h=h.replace(/<div class="grid">[\s\S]*?<\/div>/i,hub(slug,p));
  if(!h.includes('</head>')) throw new Error(`Province hubs: sin head en ${file}`);
  h=h.replace('</head>',css+'</head>');
  // Verificación fuerte: todas las localidades deben aparecer como enlaces y el índice debe existir.
  if(!h.includes('class="alpha-nav"')||!h.includes('class="alpha-localities"')) throw new Error(`Province hubs: índice alfabético ausente en ${file}`);
  for(const d of p.items){if(!h.includes(`href="/${d.provinciaSlug}/${d.slug}/"`)) throw new Error(`Province hubs: falta enlace ${d.localidad} en ${file}`);if(!h.includes(`>Antenista en ${esc(d.localidad)}</a>`)) throw new Error(`Province hubs: anchor municipal débil ${d.localidad} en ${file}`)}
  fs.writeFileSync(file,h);done++;
}
console.log(`Hubs provinciales visibles: ${done}. Índice alfabético integrado en el listado original con ${localidades.length} enlaces locales.`);
