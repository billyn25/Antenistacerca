import fs from 'node:fs';
const BASE='src/localidades.json';
const SOURCE='https://raw.githubusercontent.com/codeforspain/ds-organizacion-administrativa/master/data/municipios.csv';
const EXPECTED=211;
const deaccent=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const slugify=s=>deaccent(s.toLowerCase()).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const reorder=n=>{const m=n.match(/^(.+),\s+(El|La|Los|Las)$/i);return m?`${m[2]} ${m[1]}`:n;};
function parseCsvLine(line){let out=[],cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(c===','&&!q){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out;}
const anchors=['León','Ponferrada','San Andrés del Rabanedo','Villaquilambre','Astorga','La Bañeza','Villablino','Bembibre','Valencia de Don Juan','Cacabelos','Fabero','Santa María del Páramo'];
function nearby(name){const a=anchors.filter(x=>x.toLowerCase()!==name.toLowerCase());let h=[...name].reduce((n,c)=>(n*33+c.charCodeAt(0))>>>0,5381);const out=[];for(let i=0;i<a.length&&out.length<4;i++){const x=a[(h+i*5)%a.length];if(!out.includes(x))out.push(x);}return out;}
const r=await fetch(SOURCE);if(!r.ok)throw new Error(`No se pudo cargar padrón León: HTTP ${r.status}`);const text=await r.text();
const official=[];for(const line of text.split(/\r?\n/).slice(1)){if(!line)continue;const cols=parseCsvLine(line);if(Number(cols[1])!==24)continue;official.push(reorder(cols[4].trim()));}
if(official.length!==EXPECTED)throw new Error(`Fuente municipal inesperada para León: ${official.length}/${EXPECTED}`);
let raw=JSON.parse(fs.readFileSync(BASE,'utf8'));const officialSlugs=new Set(official.map(slugify));const removed=raw.filter(d=>d.provinciaSlug==='leon'&&!officialSlugs.has(d.slug));if(removed.length)console.log('León: se retiran variantes no municipales:',removed.map(d=>`${d.localidad} [${d.slug}]`).join(', '));
raw=raw.filter(d=>d.provinciaSlug!=='leon'||officialSlugs.has(d.slug));const seen=new Set(raw.map(d=>`${d.provinciaSlug}/${d.slug}`));let added=0;
for(const localidad of official){const slug=slugify(localidad),key=`leon/${slug}`;if(seen.has(key))continue;raw.push({provincia:'León',provinciaSlug:'leon',localidad,slug,comarca:'Provincia de León',cercanas:nearby(localidad)});seen.add(key);added++;}
const leon=raw.filter(d=>d.provinciaSlug==='leon'),unique=new Set(leon.map(d=>d.slug));if(leon.length!==EXPECTED||unique.size!==EXPECTED)throw new Error(`León incompleta tras cierre: ${leon.length} registros, ${unique.size} slugs únicos / ${EXPECTED}`);
fs.writeFileSync(BASE,JSON.stringify(raw,null,2)+'\n');console.log(`León cerrada: ${EXPECTED}/${EXPECTED} municipios; ${added} añadidos en este build.`);
