import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const OUT = 'public';
const TEMPLATE = fs.readFileSync('src/template.html','utf8');
const DOMAIN = 'https://www.antenistacerca.es';
const PHONE = '641 589 394';
const PHONE_E164 = '34641589394';

const esc = (s='') => String(s).replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const byName = new Map(localidades.map(x=>[x.localidad.toLowerCase(),x]));

function nearbyLinks(d){
  return `<div class="nearby-links">${d.cercanas.map(name=>{
    const target=byName.get(name.toLowerCase());
    if(target) return `<a href="/${target.provinciaSlug}/${target.slug}/">${esc(name)}</a>`;
    return `<span>${esc(name)}</span>`;
  }).join('')}</div><p style="margin-top:14px"><a href="/${d.provinciaSlug}/"><strong>Ver localidades de ${esc(d.provincia)} →</strong></a></p>`;
}

function schema(d){
  return JSON.stringify({
    '@context':'https://schema.org',
    '@graph':[
      {
        '@type':'WebPage',
        '@id':`${DOMAIN}/${d.provinciaSlug}/${d.slug}/#webpage`,
        url:`${DOMAIN}/${d.provinciaSlug}/${d.slug}/`,
        name:`Antenista en ${d.localidad} | Reparación e Instalación de Antenas`,
        description:d.descripcion,
        inLanguage:'es-ES'
      },
      {
        '@type':'Service',
        '@id':`${DOMAIN}/${d.provinciaSlug}/${d.slug}/#service`,
        name:`Servicio de antenista en ${d.localidad}`,
        serviceType:['Reparación de antenas','Instalación de antenas TDT','Antenas parabólicas','Porteros y videoporteros'],
        areaServed:{'@type':'AdministrativeArea',name:d.localidad}
      },
      {
        '@type':'BreadcrumbList',
        itemListElement:[
          {'@type':'ListItem',position:1,name:'Inicio',item:`${DOMAIN}/`},
          {'@type':'ListItem',position:2,name:d.provincia,item:`${DOMAIN}/${d.provinciaSlug}/`},
          {'@type':'ListItem',position:3,name:d.localidad,item:`${DOMAIN}/${d.provinciaSlug}/${d.slug}/`}
        ]
      }
    ]
  }).replace(/</g,'\\u003c');
}

function renderTown(d){
  let html=TEMPLATE
    .replaceAll('{{LOCALIDAD}}', esc(d.localidad))
    .replaceAll('{{PROVINCIA}}', esc(d.provincia))
    .replaceAll('{{CANONICAL}}', `${DOMAIN}/${d.provinciaSlug}/${d.slug}/`)
    .replaceAll('{{PUEBLOS_CERCANOS}}', nearbyLinks(d));

  html=html.replace('</head>', `<meta property="og:locale" content="es_ES"><meta property="og:type" content="website"><meta property="og:title" content="Antenista en ${esc(d.localidad)} | Antenista Cerca"><meta property="og:description" content="${esc(d.descripcion)}"><meta property="og:url" content="${DOMAIN}/${d.provinciaSlug}/${d.slug}/"><meta name="twitter:card" content="summary"><script type="application/ld+json">${schema(d)}</script></head>`);
  return html;
}

function provincePage(provincia, slug, items){
  const links=items.sort((a,b)=>a.localidad.localeCompare(b.localidad,'es')).map(x=>`<li><a href="/${slug}/${x.slug}/">Antenista en ${esc(x.localidad)}</a></li>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Antenistas en ${esc(provincia)} | Antenista Cerca</title><meta name="description" content="Localidades con servicio de instalación y reparación de antenas, TDT, parabólicas, porteros y videoporteros en ${esc(provincia)}."><meta name="robots" content="noindex,nofollow"><link rel="canonical" href="${DOMAIN}/${slug}/"><style>body{font-family:Arial,sans-serif;margin:0;color:#10243a}main{max-width:980px;margin:auto;padding:48px 22px}a{color:#0a3f73;text-decoration:none}h1{font-size:42px;margin:0 0 10px}p{font-size:18px;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;padding:0;list-style:none}.grid a{display:block;padding:18px;border:1px solid #dbe4eb;border-radius:12px;font-weight:700;background:#f8fbfd}</style></head><body><main><p><a href="/">← Inicio</a></p><h1>Antenistas en ${esc(provincia)}</h1><p>Selecciona tu localidad. Cada municipio dispone de una página completa con servicios, contacto, preguntas frecuentes y enlaces a poblaciones próximas.</p><ul class="grid">${links}</ul></main></body></html>`;
}

function homePage(){
  const provinces=[...groups.entries()].map(([slug,g])=>`<a class="province" href="/${slug}/"><span>${esc(g.provincia)}</span><strong>Ver municipios →</strong></a>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Antenista Cerca | Instalación y reparación de antenas</title><meta name="description" content="Antenista Cerca: instalación y reparación de antenas TDT, parabólicas, porteros y videoporteros. Encuentra el servicio disponible en tu localidad."><meta name="robots" content="noindex,nofollow"><link rel="canonical" href="${DOMAIN}/"><style>*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#10243a;background:#fff}.wrap{width:min(1120px,calc(100% - 36px));margin:auto}header{background:#fff;border-bottom:1px solid #e4ebf1}.head{min-height:84px;display:flex;align-items:center;justify-content:space-between;gap:24px}.brand{font-weight:900;color:#082b4d;font-size:25px;letter-spacing:.2px}.tag{font-size:13px;color:#647487}.phone{display:inline-flex;align-items:center;gap:8px;background:#d73535;color:#fff;text-decoration:none;padding:13px 18px;border-radius:10px;font-weight:800}.hero{background:linear-gradient(135deg,#082b4d,#0a4679);color:#fff;padding:72px 0}.hero h1{font-size:clamp(40px,7vw,66px);line-height:1.02;margin:0 0 18px;max-width:820px}.hero p{font-size:20px;line-height:1.6;max-width:720px;color:#e5eff8}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.cta{display:inline-block;padding:14px 20px;border-radius:10px;font-weight:800;text-decoration:none}.call{background:#d73535;color:#fff}.wa{background:#25a65a;color:#fff}section{padding:62px 0}h2{font-size:36px;margin:0 0 14px}.lead{font-size:18px;line-height:1.6;color:#556879;max-width:760px}.services,.provinces{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:28px}.card,.province{border:1px solid #dbe4eb;border-radius:14px;padding:22px;background:#fff}.card strong{display:block;font-size:19px;margin-bottom:8px}.card span{color:#647487;line-height:1.5}.province{text-decoration:none;color:#0a3f73;display:flex;justify-content:space-between;gap:14px;align-items:center;font-weight:800;background:#f7fafc}.province span{font-size:21px}.province strong{font-size:14px}.contact{background:#f3f7fa}.contactbox{background:#082b4d;color:#fff;border-radius:18px;padding:34px}.contactbox p{color:#dce8f3;line-height:1.6}.contactbox h2{margin-bottom:10px}footer{background:#061d32;color:#c4d1dc;padding:28px 0}.foot{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}@media(max-width:640px){.tag{display:none}.head{min-height:72px}.brand{font-size:21px}.phone{padding:11px 13px}.hero{padding:52px 0}section{padding:46px 0}h2{font-size:31px}}</style></head><body><header><div class="wrap head"><div><div class="brand">📡 ANTENISTA CERCA</div><div class="tag">Tu antenista de confianza</div></div><a class="phone" href="tel:+34${PHONE_E164.slice(2)}">☎ ${PHONE}</a></div></header><main><section class="hero"><div class="wrap"><h1>Tu antenista cerca de casa</h1><p>Instalación y reparación de antenas TDT, parabólicas, porteros y videoporteros. Selecciona tu provincia y localidad para acceder al servicio de tu zona.</p><div class="actions"><a class="cta call" href="tel:+34${PHONE_E164.slice(2)}">Llamar ${PHONE}</a><a class="cta wa" href="https://wa.me/${PHONE_E164}">WhatsApp</a></div></div></section><section><div class="wrap"><h2>Servicios de antenista</h2><p class="lead">Servicio técnico para viviendas, comunidades y pequeños negocios.</p><div class="services"><div class="card"><strong>Antenas TDT</strong><span>Instalación, orientación y reparación de señal.</span></div><div class="card"><strong>Parabólicas</strong><span>Montaje, ajuste y resolución de averías.</span></div><div class="card"><strong>Porteros y videoporteros</strong><span>Instalación, sustitución y reparación.</span></div><div class="card"><strong>Reparación</strong><span>Diagnóstico de fallos de recepción y distribución.</span></div></div></div></section><section class="contact"><div class="wrap"><h2>Elige tu zona</h2><p class="lead">Cada municipio dispone de su propia página con servicios, contacto, preguntas frecuentes y localidades cercanas.</p><div class="provinces">${provinces}</div></div></section><section><div class="wrap contactbox"><h2>¿Necesitas un antenista?</h2><p>Contacta directamente por teléfono o WhatsApp.</p><div class="actions"><a class="cta call" href="tel:+34${PHONE_E164.slice(2)}">Llamar ${PHONE}</a><a class="cta wa" href="https://wa.me/${PHONE_E164}">WhatsApp</a></div></div></section></main><footer><div class="wrap foot"><strong>Antenista Cerca</strong><span>${PHONE}</span></div></footer></body></html>`;
}

fs.rmSync(OUT,{recursive:true,force:true});
fs.mkdirSync(OUT,{recursive:true});
const groups=new Map();
for(const d of localidades){
  const dir=path.join(OUT,d.provinciaSlug,d.slug);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),renderTown(d));
  if(!groups.has(d.provinciaSlug)) groups.set(d.provinciaSlug,{provincia:d.provincia,items:[]});
  groups.get(d.provinciaSlug).items.push(d);
}
for(const [slug,g] of groups){
  const dir=path.join(OUT,slug); fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),provincePage(g.provincia,slug,g.items));
}
fs.writeFileSync(path.join(OUT,'index.html'),homePage());
const urls=[`${DOMAIN}/`,...localidades.map(d=>`${DOMAIN}/${d.provinciaSlug}/${d.slug}/`),...[...groups.keys()].map(slug=>`${DOMAIN}/${slug}/`)];
fs.writeFileSync(path.join(OUT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${u}</loc></url>`).join('')}</urlset>`);
fs.writeFileSync(path.join(OUT,'robots.txt'),`User-agent: *\nDisallow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);
console.log(`Generadas ${localidades.length} localidades + ${groups.size} provincia(s) + portada general.`);
