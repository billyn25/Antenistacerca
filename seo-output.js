import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type: 'json' };

const ROOT='public',DOMAIN='https://www.antenistacerca.es',PHONE='641 589 394';
const MODE=(process.argv[2]||process.env.SEO_MODE||'test').toLowerCase();
const PRODUCTION=MODE==='production'||MODE==='prod';
const ROBOTS=PRODUCTION?'index,follow,max-image-preview:large':'noindex,nofollow';
const OG_IMAGE=`${DOMAIN}/assets/hero-antennista.png`;
const townByFile=new Map(localidades.map(d=>[`${d.provinciaSlug}/${d.slug}/index.html`,d]));
const provinceByFile=new Map();for(const d of localidades)provinceByFile.set(`${d.provinciaSlug}/index.html`,d.provincia);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const townTitle=name=>{const full=`Antenista en ${name} | Instalación y reparación de antenas`;return full.length<=65?full:`Antenista en ${name} | Instalación y reparación`};
const townDescription=name=>`Antenista en ${name}: instalación y reparación de antenas TDT y parabólicas, amplificadores, porteros automáticos y videoporteros. ${PHONE}.`;
const provinceDescription=name=>`Antenistas en ${name} para instalación y reparación de antenas TDT y parabólicas, amplificadores, porteros automáticos y videoporteros. ${PHONE}.`;
function metadataFor(rel){const town=townByFile.get(rel);if(town)return{title:townTitle(town.localidad),description:townDescription(town.localidad),canonical:`${DOMAIN}/${town.provinciaSlug}/${town.slug}/`};const province=provinceByFile.get(rel);if(province){const slug=rel.split('/')[0];return{title:`Antenistas en ${province} | Instalación y reparación`,description:provinceDescription(province),canonical:`${DOMAIN}/${slug}/`}}if(rel==='index.html')return{title:'Antenista Cerca | Instalación y reparación de antenas',description:`Antenista Cerca: instalación, reparación y mantenimiento de antenas TDT y parabólicas, amplificación, porteros automáticos y videoporteros. ${PHONE}.`,canonical:`${DOMAIN}/`};throw new Error(`SEO: HTML no reconocido: ${rel}`)}
function setTitle(h,v){const tag=`<title>${esc(v)}</title>`;return/<title>[\s\S]*?<\/title>/i.test(h)?h.replace(/<title>[\s\S]*?<\/title>/i,tag):h.replace('</head>',tag+'</head>')}
function setMeta(h,key,value,attr='name'){const k=key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),re=new RegExp(`<meta\\s+${attr}=["']${k}["'][^>]*>`,'i'),tag=`<meta ${attr}="${esc(key)}" content="${esc(value)}">`;return re.test(h)?h.replace(re,tag):h.replace('</head>',tag+'</head>')}
function setCanonical(h,v){const tag=`<link rel="canonical" href="${esc(v)}">`;return/<link\s+rel=["']canonical["'][^>]*>/i.test(h)?h.replace(/<link\s+rel=["']canonical["'][^>]*>/i,tag):h.replace('</head>',tag+'</head>')}
function updateJsonLd(h,description){return h.replace(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi,(full,raw)=>{try{const data=JSON.parse(raw),nodes=Array.isArray(data?.['@graph'])?data['@graph']:[data];for(const node of nodes)if(node&&(node['@type']==='WebPage'||node['@type']==='CollectionPage'))node.description=description;return`<script type="application/ld+json">${JSON.stringify(data)}</script>`}catch{return full}})}
if(!fs.existsSync(ROOT))throw new Error('SEO: falta public/');const files=walk(ROOT).filter(f=>f.endsWith('.html'));for(const file of files){const rel=path.relative(ROOT,file).split(path.sep).join('/'),m=metadataFor(rel);let h=fs.readFileSync(file,'utf8');h=h.replace(/&quot(?!;)/g,'&quot;');h=setTitle(h,m.title);h=setMeta(h,'description',m.description);h=setMeta(h,'robots',ROBOTS);h=setCanonical(h,m.canonical);h=setMeta(h,'og:title',m.title,'property');h=setMeta(h,'og:description',m.description,'property');h=setMeta(h,'og:url',m.canonical,'property');h=setMeta(h,'og:type','website','property');h=setMeta(h,'og:locale','es_ES','property');h=setMeta(h,'og:image',OG_IMAGE,'property');h=setMeta(h,'twitter:card','summary_large_image');h=setMeta(h,'twitter:title',m.title);h=setMeta(h,'twitter:description',m.description);h=setMeta(h,'twitter:image',OG_IMAGE);h=updateJsonLd(h,m.description);fs.writeFileSync(file,h)}
fs.writeFileSync(path.join(ROOT,'robots.txt'),PRODUCTION?`User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`:`User-agent: *\nDisallow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);console.log(`SEO output ${PRODUCTION?'PRODUCCIÓN':'PRUEBAS'}: ${files.length} páginas.`);
