import fs from 'node:fs';
const path='src/localidades.json';
const rows=JSON.parse(fs.readFileSync(path,'utf8'));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const byProvince=new Map();
for(const row of rows){if(!byProvince.has(row.provinciaSlug))byProvince.set(row.provinciaSlug,new Map());byProvince.get(row.provinciaSlug).set(norm(row.localidad),row);}
let removed=0,empty=0;
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
 if(!clean.length)empty++;
 row.cercanas=clean;
}
fs.writeFileSync(path,JSON.stringify(rows,null,2)+'\n');
console.log(`Enlaces locales depurados: ${removed} referencias inválidas retiradas; ${empty} localidades sin enlaces cercanos verificables. No se inventan relaciones geográficas.`);
