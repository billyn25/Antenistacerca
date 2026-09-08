import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const OUT = 'public';
const TEMPLATE = fs.readFileSync('src/template.html', 'utf8');
const IMAGE_SOURCE = fs.readFileSync('src/image-source.html', 'utf8');
const DOMAIN = 'https://www.antenistacerca.es';
const PHONE = '641 589 394';
const TEL = '+34641589394';
const WA = '34641589394';

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const images = [...IMAGE_SOURCE.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(x => x[1]).filter(Boolean);
const byName = new Map(localidades.map(x => [x.localidad.toLowerCase(), x]));
const groups = new Map();

for (const d of localidades) {
  if (!groups.has(d.provinciaSlug)) groups.set(d.provinciaSlug, { provincia: d.provincia, items: [] });
  groups.get(d.provinciaSlug).items.push(d);
}

function nearby(d) {
  const links = d.cercanas.map(n => {
    const t = byName.get(n.toLowerCase());
    return t ? `<a href="/${t.provinciaSlug}/${t.slug}/">${esc(n)}</a>` : `<span>${esc(n)}</span>`;
  }).join('');
  return `<div class="nearby-links">${links}</div><p><a class="more" href="/${d.provinciaSlug}/">Ver todos los municipios de ${esc(d.provincia)} →</a></p>`;
}

function schema(d) {
  return JSON.stringify({
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'WebPage',url:`${DOMAIN}/${d.provinciaSlug}/${d.slug}/`,name:`Antenista en ${d.localidad}`,description:d.descripcion},
      {'@type':'Service',name:`Servicio de antenista en ${d.localidad}`,serviceType:['Antenas TDT','Antenas parabólicas','Reparación de porteros y videoporteros','Urgencias 24 horas'],areaServed:{'@type':'AdministrativeArea',name:d.localidad}},
      {'@type':'BreadcrumbList',itemListElement:[
        {'@type':'ListItem',position:1,name:'Inicio',item:`${DOMAIN}/`},
        {'@type':'ListItem',position:2,name:d.provincia,item:`${DOMAIN}/${d.provinciaSlug}/`},
        {'@type':'ListItem',position:3,name:d.localidad,item:`${DOMAIN}/${d.provinciaSlug}/${d.slug}/`}
      ]}
    ]
  });
}

function localSeoBlock(d) {
  return `<section class="band local-seo"><div class="wrap detail"><div><div class="kicker">Servicio de proximidad</div><h2>Técnico de antenas en ${esc(d.localidad)} y zona cercana</h2><p>${esc(d.introLocal)}</p><p>${esc(d.zonaLocal)}</p></div><aside class="help"><strong>Urgencias 24 horas</strong><span>Cuéntanos qué ocurre y trataremos de atenderte lo antes posible.</span><a href="tel:${TEL}">Llamar ${PHONE}</a></aside></div></section>`;
}

function localFaqBlock(d) {
  return `<section class="faq local-faq"><div class="wrap"><h2>Información útil para ${esc(d.localidad)}</h2><details><summary>${esc(d.faqPregunta)}</summary><p>${esc(d.faqRespuesta)}</p></details></div></section>`;
}

function town(d) {
  let h = TEMPLATE
    .replaceAll('{{LOCALIDAD}}', esc(d.localidad))
    .replaceAll('{{PROVINCIA}}', esc(d.provincia))
    .replaceAll('{{CANONICAL}}', `${DOMAIN}/${d.provinciaSlug}/${d.slug}/`)
    .replaceAll('{{DESCRIPTION}}', esc(d.descripcion))
    .replaceAll('{{PUEBLOS_CERCANOS}}', nearby(d))
    .replaceAll('{{LOCAL_SEO}}', localSeoBlock(d))
    .replaceAll('{{LOCAL_FAQ}}', localFaqBlock(d))
    .replaceAll('{{SCHEMA}}', schema(d));

  images.slice(0, 6).forEach((src, i) => { h = h.replaceAll(`{{IMG${i}}}`, src); });
  return h;
}

function province(p, slug, items) {
  const links = [...items].sort((a,b)=>a.localidad.localeCompare(b.localidad,'es')).map(x => `<a href="/${slug}/${x.slug}/">${esc(x.localidad)}</a>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Antenistas en ${esc(p)} | Antenista Cerca</title><meta name="description" content="Técnicos de antenas en municipios de ${esc(p)} para TDT, parabólicas, reparación de porteros y videoporteros y urgencias 24 horas."><link rel="canonical" href="${DOMAIN}/${slug}/"><style>:root{--b:#0a3f73;--d:#082b4d;--l:#dce5ec;--s:#f4f8fb}*{box-sizing:border-box}body{font:16px Arial;margin:0;color:#10243a;background:#fff}.w{max-width:1100px;margin:auto;padding:34px 20px}a{color:var(--b);text-decoration:none}.back{font-weight:700}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:11px;margin-top:22px}.grid a{padding:13px 14px;border:1px solid var(--l);background:#fff;border-radius:10px;font-weight:700;box-shadow:0 5px 16px rgba(16,45,72,.06)}h1{color:var(--b);font-size:40px;margin-bottom:10px}.lead{color:#536373;max-width:800px;line-height:1.6}</style></head><body><main class="w"><p><a class="back" href="/">← Inicio</a></p><h1>Técnicos de antenas en ${esc(p)}</h1><p class="lead">Servicio de antenista por municipios para averías de señal, TDT, parabólicas, reparación de porteros y videoporteros y urgencias 24 horas.</p><div class="grid">${links}</div></main></body></html>`;
}

function home() {
  const areas = [...groups.entries()].map(([slug,g]) => `<section class="area"><div class="areahead"><h3>${esc(g.provincia)}</h3><a href="/${slug}/">Ver todos →</a></div><div class="towns">${[...g.items].sort((a,b)=>a.localidad.localeCompare(b.localidad,'es')).slice(0,12).map(d=>`<a href="/${slug}/${d.slug}/">${esc(d.localidad)}</a>`).join('')}</div></section>`).join('');
  const img = i => images[i] || images[0] || '';

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>Antenista Cerca | Técnico de antenas y urgencias 24 horas</title><meta name="description" content="Técnico de antenas cerca de ti para reparación de TDT, parabólicas, porteros y videoporteros. Urgencias 24 horas y atención directa."><link rel="canonical" href="${DOMAIN}/"><style>:root{--b:#0a3f73;--d:#082b4d;--r:#d92128;--g:#10ad3e;--l:#dce5ec;--s:#f4f8fb;--sh:0 12px 30px rgba(16,45,72,.10)}*{box-sizing:border-box}body{margin:0;font:16px Arial;color:#10243a;line-height:1.55}a{text-decoration:none;color:inherit}.w{width:min(1160px,calc(100% - 34px));margin:auto}.top{background:var(--d);color:#fff;font-size:13px;padding:7px 0}.top .w{display:flex;justify-content:space-between;gap:20px}.head{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:22px;padding:12px 0}.brand{display:flex;align-items:center;gap:10px}.ico{font-size:34px}.brand b{font-size:27px;color:var(--b)}.brand b span{color:#888}.brand small{display:block;font:italic 14px Georgia;color:var(--b)}nav{display:flex;gap:20px;font-weight:700;font-size:14px}.tel{font-size:24px;color:var(--r);font-weight:800}.hero{background:linear-gradient(90deg,#fbfdff,#dceef9)}.hg{display:grid;grid-template-columns:1fr 1.03fr;min-height:420px}.copy{align-self:center;padding:38px 28px 34px 0}.kicker{font-size:12px;font-weight:800;letter-spacing:.12em;color:var(--b);text-transform:uppercase}.urgent{display:inline-flex;margin:10px 0 2px;padding:7px 10px;border-radius:999px;background:#fff3f3;color:#b81319;font-size:13px;font-weight:800;border:1px solid #ffd7d9}.copy h1{font-size:52px;line-height:1;margin:10px 0 12px;color:#0b3765}.copy h2{font-size:23px;margin:0 0 14px}.checks{list-style:none;padding:0;margin:0 0 19px}.checks li{margin:7px 0}.checks li:before{content:'✓';color:var(--g);font-weight:bold;margin-right:9px}.actions{display:flex;gap:12px;flex-wrap:wrap}.btn{padding:13px 18px;border-radius:9px;color:#fff;font-weight:800}.red{background:var(--r)}.green{background:var(--g)}.heroimg{overflow:hidden}.heroimg img{width:100%;height:100%;object-fit:cover}.section{padding:38px 0}.section h2{font-size:30px;color:var(--b);margin:0 0 8px}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:22px}.card{background:#fff;border:1px solid #e3ebf1;border-radius:15px;overflow:hidden;box-shadow:var(--sh)}.card img{width:100%;height:160px;object-fit:cover;display:block}.card div{padding:16px 16px 18px}.card h3{color:var(--b);font-size:19px;margin:0 0 7px}.card p{margin:0;color:#536373}.zones{background:var(--s)}.area{margin:20px 0}.areahead{display:flex;align-items:center;justify-content:space-between}.areahead h3{font-size:21px;color:var(--b);margin:0}.areahead>a{font-weight:800;color:var(--b)}.towns{display:grid;grid-template-columns:repeat(4,1fr);gap:10px 12px;margin-top:12px}.towns a{background:#fff;border:1px solid var(--l);padding:11px 12px;border-radius:9px;color:var(--b);font-weight:700;line-height:1.2}.local{display:grid;grid-template-columns:.92fr 1.08fr;gap:30px;align-items:center}.local img{width:100%;height:300px;object-fit:cover;border-radius:14px;box-shadow:var(--sh)}.local p{font-size:16px;line-height:1.65;color:#3b4d5e}.cta{background:var(--b);color:#fff;padding:26px;border-radius:12px}.cta h2{color:#fff!important}footer{background:var(--d);color:#fff;padding:24px 0;margin-top:34px}@media(max-width:850px){nav{display:none}.head{grid-template-columns:1fr auto}.hg,.local{grid-template-columns:1fr}.copy{padding:28px 0 20px}.heroimg{height:300px}.cards{grid-template-columns:1fr 1fr}.towns{grid-template-columns:1fr 1fr}}@media(max-width:520px){.top{display:none}.brand b{font-size:18px}.ico{font-size:28px}.brand small{font-size:11px}.tel{font-size:16px}.copy h1{font-size:40px}.cards{gap:10px}.card img{height:116px}.card div{padding:11px}.card h3{font-size:16px}.card p{font-size:12px}}</style></head><body><div class="top"><div class="w"><span>Antenas TDT · Parabólicas · Porteros · Videoporteros</span><span>Urgencias 24 horas</span></div></div><header><div class="w head"><a class="brand" href="/"><span class="ico">📡</span><span><b>ANTENISTA <span>CERCA</span></b><small>Tu antenista de confianza</small></span></a><nav><a href="#servicios">Servicios</a><a href="#zonas">Zonas</a><a href="#contacto">Contacto</a></nav><a class="tel" href="tel:${TEL}">☎ ${PHONE}</a></div></header><main><section class="hero"><div class="w hg"><div class="copy"><div class="kicker">Técnico de antenas cerca de ti</div><div class="urgent">Urgencias 24 horas</div><h1>Antenista cerca de ti</h1><h2>Instalación, reparación y mantenimiento de antenas</h2><ul class="checks"><li>Averías y falta de señal</li><li>Antenas TDT y parabólicas</li><li>Reparación de porteros y videoporteros</li><li>Viviendas, comunidades y negocios</li></ul><div class="actions"><a class="btn red" href="tel:${TEL}">☎ ${PHONE}</a><a class="btn green" href="https://wa.me/${WA}">WhatsApp</a></div></div><div class="heroimg"><img src="${img(0)}" alt="Técnico de antenas trabajando"></div></div></section><section id="servicios" class="section"><div class="w"><h2>Servicios de antenista</h2><p>Reparamos problemas de señal y realizamos instalaciones para viviendas, comunidades y negocios.</p><div class="cards"><article class="card"><img src="${img(1)}" alt="Antena TDT"><div><h3>Antenas TDT</h3><p>Instalación, orientación, amplificación y reparación.</p></div></article><article class="card"><img src="${img(2)}" alt="Antena parabólica"><div><h3>Parabólicas</h3><p>Montaje, ajuste de señal y solución de averías.</p></div></article><article class="card"><img src="${img(3)}" alt="Portero y videoportero"><div><h3>Porteros y videoporteros</h3><p>Instalación, sustitución y reparación de equipos.</p></div></article><article class="card"><img src="${img(4)}" alt="Reparación de antenas"><div><h3>Comunidades</h3><p>Instalaciones colectivas, amplificación y señal.</p></div></article></div></div></section><section id="zonas" class="section zones"><div class="w"><h2>Encuentra un técnico de antenas en tu municipio</h2><p>Elige tu municipio para consultar el servicio disponible y las localidades próximas.</p>${areas}</div></section><section class="section"><div class="w local"><img src="${img(5)}" alt="Zona de servicio"><div><h2>Un antenista cerca cuando lo necesitas</h2><p>Atendemos averías de señal, instalaciones TDT y parabólicas y reparación de porteros y videoporteros.</p><p>Urgencias 24 horas. Puedes llamar o escribir por WhatsApp y contarnos directamente qué ocurre.</p></div></div></section><section id="contacto" class="section"><div class="w cta"><h2>¿Necesitas un técnico de antenas?</h2><p>Urgencias 24 horas. Cuéntanos la avería o instalación que necesitas.</p><div class="actions"><a class="btn red" href="tel:${TEL}">Llamar ${PHONE}</a><a class="btn green" href="https://wa.me/${WA}">WhatsApp</a></div></div></section></main><footer><div class="w"><strong>Antenista Cerca</strong> · ${PHONE}</div></footer></body></html>`;
}

fs.rmSync(OUT,{recursive:true,force:true});
fs.mkdirSync(OUT,{recursive:true});

for (const d of localidades) {
  const dir = path.join(OUT,d.provinciaSlug,d.slug);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),town(d));
}

for (const [slug,g] of groups) {
  const dir = path.join(OUT,slug);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),province(g.provincia,slug,g.items));
}

fs.writeFileSync(path.join(OUT,'index.html'),home());

const urls=[`${DOMAIN}/`,...[...groups.keys()].map(s=>`${DOMAIN}/${s}/`),...localidades.map(d=>`${DOMAIN}/${d.provinciaSlug}/${d.slug}/`)];
fs.writeFileSync(path.join(OUT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${u}</loc></url>`).join('')}</urlset>`);
fs.writeFileSync(path.join(OUT,'robots.txt'),`User-agent: *\nDisallow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);
console.log(`Generadas ${localidades.length} localidades, ${groups.size} provincias y portada.`);