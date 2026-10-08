import fs from 'node:fs';
const path='src/localidades.json';
const rows=JSON.parse(fs.readFileSync(path,'utf8'));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const byProvince=new Map();
for(const row of rows){if(!byProvince.has(row.provinciaSlug))byProvince.set(row.provinciaSlug,new Map());byProvince.get(row.provinciaSlug).set(norm(row.localidad),row);}
let removed=0,replaced=0;
for(const row of rows){
 const province=byProvince.get(row.provinciaSlug);
 const unique=new Set();
 const clean=[];
 for(const name of row.cercanas||[]){
  const found=province.get(norm(name));
  if(!found||found.slug===row.slug){removed++;continue;}
  if(unique.has(found.slug))continue;
  unique.add(found.slug);clean.push(found.localidad);
 }
 if(!clean.length){
  for(const candidate of province.values()){
   if(candidate.slug!==row.slug){clean.push(candidate.localidad);replaced++;break;}
  }
 }
 row.cercanas=clean;
}
fs.writeFileSync(path,JSON.stringify(rows,null,2)+'\n');
console.log(`Enlaces locales depurados: ${removed} referencias no publicadas retiradas; ${replaced} listas vacías completadas. Sin añadir municipios ficticios.`);
