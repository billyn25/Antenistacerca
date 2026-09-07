import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const OUT = 'public';
const TEMPLATE = fs.readFileSync('src/template.html','utf8');
const DOMAIN = 'https://www.antenistacerca.es';
const PHONE = '641 589 394';
const PHONE_E164 = '34641589394';

const esc = (s='') => String(s).replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const slugify = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
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
const galdakao=localidades.find(x=>x.slug==='galdakao') || localidades[0];
fs.writeFileSync(path.join(OUT,'index.html'),renderTown(galdakao));
const urls=[`${DOMAIN}/`,...localidades.map(d=>`${DOMAIN}/${d.provinciaSlug}/${d.slug}/`),...groups.keys()].map(x=>typeof x==='string'&&x.startsWith('http')?x:`${DOMAIN}/${x}/`);
fs.writeFileSync(path.join(OUT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${u}</loc></url>`).join('')}</urlset>`);
fs.writeFileSync(path.join(OUT,'robots.txt'),`User-agent: *\nDisallow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);
console.log(`Generadas ${localidades.length} localidades + ${groups.size} provincia(s). Raíz: ${galdakao.localidad}.`);
