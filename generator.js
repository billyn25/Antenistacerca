import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const OUT = 'public';
const TEMPLATE = fs.readFileSync('src/template.html', 'utf8');
const DOMAIN = 'https://www.antenistacerca.es';
const PHONE = '641 589 394';
const TEL = '+34641589394';
const WA = '34641589394';

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const byName = new Map(localidades.map(x => [x.localidad.toLowerCase(), x]));
const images = [...TEMPLATE.matchAll(/data:image\/jpeg;base64,[^"')]+/g)].map(x => x[0]);
const groups = new Map();

for (const d of localidades) {
  if (!groups.has(d.provinciaSlug)) {
    groups.set(d.provinciaSlug, { provincia: d.provincia, items: [] });
  }
  groups.get(d.provinciaSlug).items.push(d);
}

function nearby(d) {
  const links = d.cercanas.map(n => {
    const t = byName.get(n.toLowerCase());
    return t
      ? `<a href="/${t.provinciaSlug}/${t.slug}/">${esc(n)}</a>`
      : `<span>${esc(n)}</span>`;
  }).join('');

  return `<div class="nearby-links">${links}</div><p><a class="more" href="/${d.provinciaSlug}/">Ver todos los municipios de ${esc(d.provincia)} →</a></p>`;
}

function schema(d) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        url: `${DOMAIN}/${d.provinciaSlug}/${d.slug}/`,
        name: `Antenista en ${d.localidad}`,
        description: d.descripcion
      },
      {
        '@type': 'Service',
        name: `Servicio de antenista en ${d.localidad}`,
        serviceType: ['Antenas TDT', 'Antenas parabólicas', 'Porteros y videoporteros'],
        areaServed: { '@type': 'AdministrativeArea', name: d.localidad }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${DOMAIN}/` },
          { '@type': 'ListItem', position: 2, name: d.provincia, item: `${DOMAIN}/${d.provinciaSlug}/` },
          { '@type': 'ListItem', position: 3, name: d.localidad, item: `${DOMAIN}/${d.provinciaSlug}/${d.slug}/` }
        ]
      }
    ]
  });
}

function localSeoBlock(d) {
  return `<section class="band local-seo"><div class="wrap detail"><div><div class="kicker">Servicio de proximidad</div><h2>Antenista en ${esc(d.localidad)} y zona cercana</h2><p>${esc(d.introLocal)}</p><p>${esc(d.zonaLocal)}</p></div><aside class="help"><strong>¿Tienes una avería?</strong><span>Cuéntanos qué ocurre y trataremos de atenderte lo antes posible.</span><a href="tel:${TEL}">Llamar ${PHONE}</a></aside></div></section>`;
}

function localFaqBlock(d) {
  return `<section class="faq local-faq"><div class="wrap"><h2>Información útil para ${esc(d.localidad)}</h2><details><summary>${esc(d.faqPregunta)}</summary><p>${esc(d.faqRespuesta)}</p></details></div></section>`;
}

function town(d) {
  let h = TEMPLATE
    .replaceAll('{{LOCALIDAD}}', esc(d.localidad))
    .replaceAll('{{PROVINCIA}}', esc(d.provincia))
    .replaceAll('{{CANONICAL}}', `${DOMAIN}/${d.provinciaSlug}/${d.slug}/`)
    .replaceAll('{{PUEBLOS_CERCANOS}}', nearby(d));

  h = h
    .replace('href="#inicio" class="brand"', 'href="/" class="brand"')
    .replace('<a href="#inicio">Inicio</a>', '<a href="/">Inicio</a>')
    .replace('<li>Viviendas, comunidades y negocios</li>', '<li>Viviendas, comunidades y negocios</li><li><strong>Servicio cercano para atenderte lo antes posible</strong></li>');

  h = h.replace(
    /<meta name="description" content="[^"]*">/i,
    `<meta name="description" content="${esc(d.descripcion)}">`
  );

  h = h.replace(
    /Todo en el mismo HTML[\s\S]*?(?=<\/p>|<\/div>)/i,
    esc(d.introLocal)
  );

  const localBlock = localSeoBlock(d);
  if (/<section[^>]*id="zona"/i.test(h)) {
    h = h.replace(/(<section[^>]*id="zona"[^>]*>)/i, `${localBlock}$1`);
  } else {
    h = h.replace(/(<section[^>]*class="[^"]*faq[^"]*"[^>]*>)/i, `${localBlock}$1`);
  }

  const faqBlock = localFaqBlock(d);
  if (/<section[^>]*id="contacto"/i.test(h)) {
    h = h.replace(/(<section[^>]*id="contacto"[^>]*>)/i, `${faqBlock}$1`);
  } else {
    h = h.replace('</main>', `${faqBlock}</main>`);
  }

  return h.replace(
    '</head>',
    `<meta property="og:title" content="Antenista en ${esc(d.localidad)} | Antenista Cerca"><meta property="og:description" content="${esc(d.descripcion)}"><meta property="og:url" content="${DOMAIN}/${d.provinciaSlug}/${d.slug}/"><script type="application/ld+json">${schema(d)}</script></head>`
  );
}

function province(p, slug, items) {
  const links = [...items]
    .sort((a, b) => a.localidad.localeCompare(b.localidad, 'es'))
    .map(x => `<a href="/${slug}/${x.slug}/">Antenista en ${esc(x.localidad)}</a>`)
    .join('');

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Antenistas en ${esc(p)} | Antenista Cerca</title><meta name="description" content="Servicio de antenista en municipios de ${esc(p)} para TDT, parabólicas, porteros y videoporteros."><link rel="canonical" href="${DOMAIN}/${slug}/"><style>body{font:16px Arial;margin:0;color:#10243a}.w{max-width:1100px;margin:auto;padding:35px 20px}a{color:#0a3f73;text-decoration:none}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.grid a{padding:13px;border:1px solid #dbe4eb;background:#f4f8fb;border-radius:6px;font-weight:700}</style></head><body><main class="w"><p><a href="/">← Inicio</a></p><h1>Antenistas en ${esc(p)}</h1><p>Encuentra servicio de antenista cerca de tu localidad para averías de señal, TDT, parabólicas, porteros y videoporteros. Selecciona tu municipio para consultar la información específica de esa zona.</p><div class="grid">${links}</div></main></body></html>`;
}

function home() {
  const areas = [...groups.entries()].map(([slug, g]) => `
    <section class="area">
      <div class="areahead"><h3>${esc(g.provincia)}</h3><a href="/${slug}/">Ver todos →</a></div>
      <div class="towns">${[...g.items]
        .sort((a, b) => a.localidad.localeCompare(b.localidad, 'es'))
        .slice(0, 12)
        .map(d => `<a href="/${slug}/${d.slug}/">${esc(d.localidad)}</a>`)
        .join('')}</div>
    </section>`).join('');

  const img = i => images[i] || images[0] || '';

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>Antenista Cerca | Reparación e instalación de antenas</title><meta name="description" content="Antenista cerca de ti para reparación de antenas TDT, parabólicas, porteros y videoporteros. Servicio cercano y atención directa."><link rel="canonical" href="${DOMAIN}/"><style>:root{--b:#0a3f73;--d:#082b4d;--r:#db2024;--g:#10ad3e;--l:#dbe4eb;--s:#f4f8fb}*{box-sizing:border-box}body{margin:0;font:16px Arial;color:#10243a}a{text-decoration:none;color:inherit}.w{width:min(1180px,calc(100% - 34px));margin:auto}.top{background:var(--d);color:#fff;font-size:13px;padding:7px 0}.top .w{display:flex;justify-content:space-between}.head{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:24px;padding:14px 0}.brand{display:flex;align-items:center;gap:12px}.ico{font-size:42px}.brand b{font-size:30px;color:var(--b)}.brand b span{color:#888}.brand small{display:block;font:italic 15px Georgia;color:var(--b)}nav{display:flex;gap:20px;font-weight:700;font-size:14px}.tel{font-size:25px;color:var(--r);font-weight:800}.hero{background:linear-gradient(90deg,#f9fcff,#d9edf9)}.hg{display:grid;grid-template-columns:1.18fr .82fr;min-height:440px}.copy{align-self:center;padding-right:28px}.copy h1{font-size:52px;line-height:1;white-space:nowrap;margin:8px 0 14px;color:#0b3765}.copy h2{font-size:24px}.checks{list-style:none;padding:0}.checks li{margin:9px 0}.checks li:before{content:'✓';color:var(--g);font-weight:bold;margin-right:9px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}.btn{padding:14px 18px;border-radius:7px;color:#fff;font-weight:800}.red{background:var(--r)}.green{background:var(--g)}.heroimg img{width:100%;height:100%;object-fit:cover}.section{padding:46px 0}.section h2{font-size:32px;color:var(--b);margin:0 0 8px}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:24px}.card{border:1px solid var(--l);border-radius:9px;overflow:hidden;box-shadow:0 5px 17px #102d4814}.card img{width:100%;height:135px;object-fit:cover}.card div{padding:15px}.card h3{color:var(--b);margin:0 0 7px}.zones{background:var(--s)}.area{margin:22px 0}.areahead{display:flex;align-items:center;justify-content:space-between}.areahead h3{font-size:22px;color:var(--b);margin:0}.areahead>a{font-weight:800;color:var(--b)}.towns{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:12px}.towns a{background:#fff;border:1px solid var(--l);padding:11px;border-radius:5px;color:var(--b);font-weight:700}.local{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:center}.local img{width:100%;height:310px;object-fit:cover;border-radius:9px}.local p{font-size:17px;line-height:1.65}.cta{background:var(--b);color:#fff;padding:30px;border-radius:10px}.cta h2{color:#fff!important}footer{background:var(--d);color:#fff;padding:28px 0;margin-top:46px}@media(max-width:850px){nav{display:none}.head{grid-template-columns:1fr auto}.hg,.local{grid-template-columns:1fr}.copy{padding:34px 0}.copy h1{white-space:normal}.heroimg{height:280px}.cards{grid-template-columns:1fr 1fr}.towns{grid-template-columns:1fr 1fr}}@media(max-width:520px){.top{display:none}.brand b{font-size:19px}.ico{font-size:30px}.brand small{font-size:12px}.tel{font-size:17px}.copy h1{font-size:43px}.cards{grid-template-columns:1fr 1fr}.card img{height:105px}}</style></head><body><div class="top"><div class="w"><span>Antenas TDT · Parabólicas · Porteros · Videoporteros</span><span>Servicio técnico de proximidad</span></div></div><header><div class="w head"><a class="brand" href="/"><span class="ico">📡</span><span><b>ANTENISTA <span>CERCA</span></b><small>Tu antenista de confianza</small></span></a><nav><a href="#servicios">Servicios</a><a href="#zonas">Zonas</a><a href="#contacto">Contacto</a></nav><a class="tel" href="tel:${TEL}">☎ ${PHONE}</a></div></header><main><section class="hero"><div class="w hg"><div class="copy"><div>ANTENISTA PROFESIONAL CERCA DE TI</div><h1>Antenista cerca de ti</h1><h2>Instalación, reparación y mantenimiento de antenas</h2><ul class="checks"><li>Averías y falta de señal</li><li>Antenas TDT y parabólicas</li><li>Porteros y videoporteros</li><li>Viviendas, comunidades y negocios</li><li><strong>Estamos cerca para poder atenderte lo antes posible</strong></li></ul><div class="actions"><a class="btn red" href="tel:${TEL}">☎ ${PHONE}</a><a class="btn green" href="https://wa.me/${WA}">WhatsApp</a></div></div><div class="heroimg"><img src="${img(0)}" alt="Técnico antenista trabajando"></div></div></section><section id="servicios" class="section"><div class="w"><h2>Servicios de antenista</h2><p>Reparamos problemas de señal y realizamos instalaciones para viviendas, comunidades y negocios. Trabajamos con antenas TDT, parabólicas, porteros y videoporteros, tanto en instalaciones nuevas como en equipos que necesitan revisión o reparación.</p><div class="cards"><article class="card"><img src="${img(1)}" alt="Antena TDT"><div><h3>Antenas TDT</h3><p>Instalación, orientación, amplificación y reparación de problemas de recepción.</p></div></article><article class="card"><img src="${img(2)}" alt="Antena parabólica"><div><h3>Parabólicas</h3><p>Montaje, ajuste de señal y solución de averías.</p></div></article><article class="card"><img src="${img(3)}" alt="Portero y videoportero"><div><h3>Porteros y videoporteros</h3><p>Instalación, sustitución y reparación de equipos.</p></div></article><article class="card"><img src="${img(4)}" alt="Instalación para comunidad"><div><h3>Comunidades</h3><p>Instalaciones colectivas, amplificación y problemas de señal.</p></div></article></div></div></section><section id="zonas" class="section zones"><div class="w"><h2>Encuentra un antenista en tu municipio</h2><p>Trabajamos por zonas para ofrecer un servicio cercano. Elige tu municipio y consulta directamente los servicios disponibles y las localidades próximas que atendemos.</p>${areas}</div></section><section class="section"><div class="w local"><img src="${img(5)}" alt="Servicio local de antenista"><div><h2>Un antenista cerca cuando lo necesitas</h2><p>Cuando falla la señal de televisión o una instalación deja de funcionar, interesa poder contactar con un técnico cercano. Atendemos averías, orientación de antenas, instalaciones TDT y parabólicas, porteros y videoporteros.</p><p>Nuestra organización por zonas nos permite estar cerca y atender cada aviso lo antes posible. Puedes llamar o escribir por WhatsApp y contarnos directamente qué ocurre.</p></div></div></section><section id="contacto" class="section"><div class="w cta"><h2>¿Necesitas un antenista?</h2><p>Cuéntanos la avería o instalación que necesitas y te atenderemos lo antes posible.</p><div class="actions"><a class="btn red" href="tel:${TEL}">Llamar ${PHONE}</a><a class="btn green" href="https://wa.me/${WA}">WhatsApp</a></div></div></section></main><footer><div class="w"><strong>Antenista Cerca</strong> · ${PHONE}</div></footer></body></html>`;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const d of localidades) {
  const dir = path.join(OUT, d.provinciaSlug, d.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), town(d));
}

for (const [slug, g] of groups) {
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), province(g.provincia, slug, g.items));
}

fs.writeFileSync(path.join(OUT, 'index.html'), home());

const urls = [
  `${DOMAIN}/`,
  ...[...groups.keys()].map(s => `${DOMAIN}/${s}/`),
  ...localidades.map(d => `${DOMAIN}/${d.provinciaSlug}/${d.slug}/`)
];

fs.writeFileSync(
  path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${u}</loc></url>`).join('')}</urlset>`
);

fs.writeFileSync(
  path.join(OUT, 'robots.txt'),
  `User-agent: *\nDisallow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`
);

console.log(`Generadas ${localidades.length} localidades, ${groups.size} provincias y portada.`);
