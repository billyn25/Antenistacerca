import fs from 'node:fs';
import assert from 'node:assert/strict';
const file='src/localidades.json';
const SOURCE='https://raw.githubusercontent.com/codeforspain/ds-organizacion-administrativa/1e9c99280ef4d7a12def33cafc3df59d9fc1f688/data/municipios.json';
const specs=[{code:'45',name:'Toledo',slug:'toledo',expected:204},{code:'19',name:'Guadalajara',slug:'guadalajara',expected:288}];
const rows=JSON.parse(fs.readFileSync(file,'utf8'));
const response=await fetch(SOURCE,{headers:{'user-agent':'AntenistaCerca-build/1.0'},signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error('No se pudo verificar el censo municipal: HTTP '+response.status);
const census=await response.json();
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
for(const p of specs){
 const names=census.filter(x=>x.provincia_id===p.code).map(x=>x.nombre.replaceAll('\\/','/'));
 assert.equal(names.length,p.expected,p.name+': el censo ha cambiado, revisar antes de publicar');
 const existing=new Map(rows.filter(x=>x.provinciaSlug===p.slug).map(x=>[x.slug,x]));
 const seen=new Set();
 for(const [i,name] of names.entries()){
  const key=slug(name);
  assert.ok(key&&!seen.has(key),p.name+': slug duplicado '+key);seen.add(key);
  if(existing.has(key))continue;
  const other=names.filter(x=>x!==name);
  const related=other.slice(Math.max(0,i-2),i+4).filter(x=>x!==name).slice(0,5);
  rows.push({
   provincia:p.name,provinciaSlug:p.slug,localidad:name,slug:key,comarca:p.name,
   descripcion:`Antenista en ${name}, ${p.name}. Reparación de antenas TDT, parabólicas, amplificadores, porteros automáticos y videoporteros. Teléfono 641 589 394.`,
   introLocal:`Para revisar una avería de antena en ${name}, conviene indicar si faltan todos los canales o solo algunos, si el fallo afecta a una toma o a varias y si se produce con lluvia. También puedes consultar incidencias de parabólicas, cabeceras de amplificación, porteros automáticos y videoporteros.`,
   zonaLocal:`Consulta la disponibilidad de asistencia en ${name}, provincia de ${p.name}, indicando el tipo de inmueble y los síntomas. La disponibilidad y el desplazamiento se confirman antes de concertar la visita; no se afirma disponer de sede física en este municipio.`,
   faqPregunta:i%2===0?`¿Qué comprobar si se pierde la señal TDT en ${name}?`:`¿Cómo explicar una avería de portero en ${name}?`,
   faqRespuesta:i%2===0?'Indica si falla un televisor, toda la vivienda o también otros vecinos. No manipules la instalación de cubierta.':'Indica si falla la llamada, el audio, la imagen o la apertura y si afecta a una vivienda o a toda la comunidad.',
   cercanas:related,seoOrigen:'censo-municipal-contrastado'
  });
 }
 for(const key of existing.keys())assert.ok(seen.has(key),p.name+': municipio anterior no encontrado en censo: '+key);
 assert.equal(rows.filter(x=>x.provinciaSlug===p.slug).length,p.expected,p.name+': cobertura incompleta');
}
fs.writeFileSync(file,JSON.stringify(rows,null,2)+'\n');
console.log('Toledo 204/204 y Guadalajara 288/288: municipios contrastados con censo fijado, sin duplicados.');
