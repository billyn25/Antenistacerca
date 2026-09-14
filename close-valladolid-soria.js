import fs from 'node:fs';
const BASE='src/localidades.json';
const SOURCE='https://raw.githubusercontent.com/codeforspain/ds-organizacion-administrativa/master/data/municipios.csv';
const EXPECTED={valladolid:225,soria:183};
const PROV={47:['Valladolid','valladolid'],42:['Soria','soria']};
const anchors={
 valladolid:['Valladolid','Tordesillas','Medina del Campo','Peñafiel','Medina de Rioseco','Olmedo','Íscar','Villalón de Campos'],
 soria:['Soria','Almazán','San Esteban de Gormaz','El Burgo de Osma','Ágreda','Ólvega','San Leonardo de Yagüe','Medinaceli']
};
const deaccent=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const slugify=s=>deaccent(s.toLowerCase()).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const reorder=n=>{const m=n.match(/^(.+),\s+(El|La|Los|Las)$/i);return m?`${m[2]} ${m[1]}`:n;};
function parseCsvLine(line){let out=[],cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(c===','&&!q){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out;}
function nearby(slug,name){const a=anchors[slug].filter(x=>x.toLowerCase()!==name.toLowerCase());let h=[...name].reduce((n,c)=>(n*33+c.charCodeAt(0))>>>0,5381);const out=[];for(let i=0;i<a.length&&out.length<4;i++){const x=a[(h+i*3)%a.length];if(!out.includes(x))out.push(x);}return out;}
let text;try{const r=await fetch(SOURCE);if(!r.ok)throw new Error(`HTTP ${r.status}`);text=await r.text();}catch(e){throw new Error(`No se pudo cargar el padrón municipal de cierre: ${e.message}`)}
const official={valladolid:[],soria:[]};for(const line of text.split(/\r?\n/).slice(1)){if(!line)continue;const cols=parseCsvLine(line);const p=Number(cols[1]);if(!PROV[p])continue;const [,slug]=PROV[p];official[slug].push(reorder(cols[4].trim()));}
for(const [slug,n] of Object.entries(EXPECTED))if(official[slug].length!==n)throw new Error(`Fuente municipal inesperada para ${slug}: ${official[slug].length}/${n}`);
const raw=JSON.parse(fs.readFileSync(BASE,'utf8'));const seen=new Set(raw.map(d=>`${d.provinciaSlug}/${d.slug}`));const added={valladolid:0,soria:0};
for(const [slug,names] of Object.entries(official)){const provincia=slug==='valladolid'?'Valladolid':'Soria';for(const localidad of names){const s=slugify(localidad),key=`${slug}/${s}`;if(seen.has(key))continue;raw.push({provincia,provinciaSlug:slug,localidad,slug:s,comarca:`Provincia de ${provincia}`,cercanas:nearby(slug,localidad)});seen.add(key);added[slug]++;}}
for(const [slug,n] of Object.entries(EXPECTED)){const count=raw.filter(d=>d.provinciaSlug===slug).length;if(count!==n)throw new Error(`${slug} incompleta tras cierre: ${count}/${n}`)}
fs.writeFileSync(BASE,JSON.stringify(raw,null,2)+'\n');console.log(`Cierre Valladolid/Soria: Valladolid ${EXPECTED.valladolid}/${EXPECTED.valladolid} (+${added.valladolid}); Soria ${EXPECTED.soria}/${EXPECTED.soria} (+${added.soria}).`);
