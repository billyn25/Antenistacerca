import fs from 'node:fs';
const BASE='src/localidades.json';
const SOURCE='https://raw.githubusercontent.com/codeforspain/ds-organizacion-administrativa/master/data/municipios.csv';
const EXPECTED=78;
const deaccent=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const slugify=s=>deaccent(s.toLowerCase()).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const reorder=n=>{const m=n.match(/^(.+),\s+(El|La|Los|Las)$/i);return m?`${m[2]} ${m[1]}`:n;};
function parseCsvLine(line){let out=[],cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(c===','&&!q){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out;}
const anchors=['Oviedo','Gijón','Avilés','Siero','Langreo','Mieres','Cangas del Narcea','Llanes','Villaviciosa','Cangas de Onís','Luarca','Ribadesella'];
function nearby(name){const a=anchors.filter(x=>x.toLowerCase()!==name.toLowerCase());let h=[...name].reduce((n,c)=>(n*33+c.charCodeAt(0))>>>0,5381);const out=[];for(let i=0;i<a.length&&out.length<4;i++){const x=a[(h+i*5)%a.length];if(!out.includes(x))out.push(x);}return out;}
const r=await fetch(SOURCE);if(!r.ok)throw new Error(`No se pudo cargar padrón Asturias: HTTP ${r.status}`);const text=await r.text();const official=[];
for(const line of text.split(/\r?\n/).slice(1)){if(!line)continue;const cols=parseCsvLine(line);if(Number(cols[1])!==33)continue;official.push(reorder(cols[4].trim()));}
if(official.length!==EXPECTED)throw new Error(`Fuente municipal inesperada para Asturias: ${official.length}/${EXPECTED}`);
let raw=JSON.parse(fs.readFileSync(BASE,'utf8'));const officialSlugs=new Set(official.map(slugify));raw=raw.filter(d=>d.provinciaSlug!=='asturias'||officialSlugs.has(d.slug));const seen=new Set(raw.map(d=>`${d.provinciaSlug}/${d.slug}`));let added=0;
for(const localidad of official){const slug=slugify(localidad),key=`asturias/${slug}`;if(seen.has(key))continue;raw.push({provincia:'Asturias',provinciaSlug:'asturias',localidad,slug,comarca:'Principado de Asturias',cercanas:nearby(localidad)});seen.add(key);added++;}
const rows=raw.filter(d=>d.provinciaSlug==='asturias'),unique=new Set(rows.map(d=>d.slug));if(rows.length!==EXPECTED||unique.size!==EXPECTED)throw new Error(`Asturias incompleta tras cierre: ${rows.length} registros, ${unique.size} slugs únicos / ${EXPECTED}`);
fs.writeFileSync(BASE,JSON.stringify(raw,null,2)+'\n');console.log(`Asturias cerrada: ${EXPECTED}/${EXPECTED} concejos; ${added} añadidos en este build.`);
