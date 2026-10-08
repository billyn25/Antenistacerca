import fs from 'node:fs';
import assert from 'node:assert/strict';
const file='src/localidades.json';
const rows=JSON.parse(fs.readFileSync(file,'utf8'));
const provinces=[
 ['Toledo','toledo',['Toledo','Talavera de la Reina','Illescas','Seseña','Torrijos','Ocaña','Consuegra','Sonseca','Madridejos','Yuncos']],
 ['Guadalajara','guadalajara',['Guadalajara','Azuqueca de Henares','Alovera','Cabanillas del Campo','Marchamalo','El Casar','Sigüenza','Molina de Aragón','Yunquera de Henares','Chiloeches']]
];
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
for(const [province,key,names] of provinces){
 const existing=rows.filter(x=>x.provinciaSlug===key);
 if(existing.length){for(const name of names)assert.ok(existing.some(x=>x.slug===slug(name)),`${province}: falta ${name}`);continue}
 for(const [i,name] of names.entries()){
  const related=names.filter(n=>n!==name).slice(0,5);
  rows.push({
   provincia:province,provinciaSlug:key,localidad:name,slug:slug(name),comarca:province,
   descripcion:`Antenista en ${name}, ${province}. Reparación de antenas TDT, parabólicas, amplificación, porteros automáticos y videoporteros. 641 589 394.`,
   introLocal:`Si necesitas revisar una antena en ${name}, indica si falla la señal TDT en una sola toma, en toda la vivienda o en una instalación colectiva. También se pueden consultar incidencias de parabólicas, amplificadores, porteros automáticos y videoporteros. El alcance de la reparación se confirma tras revisar el problema.`,
   zonaLocal:`La solicitud corresponde al municipio de ${name}, provincia de ${province}. Indica la dirección y el tipo de instalación para consultar disponibilidad y condiciones de desplazamiento. No se afirma disponer de una sede en esta localidad ni un tiempo de llegada fijo.`,
   faqPregunta:i%2===0?`¿Qué datos ayudan a revisar una antena en ${name}?`:`¿Qué debo indicar si falla un portero en ${name}?`,
   faqRespuesta:i%2===0?`Indica si faltan todos los canales o solo algunos, si ocurre en una toma o varias y si empeora con lluvia. Para una antena colectiva, comprueba si otros vecinos también notan el problema, sin acceder al tejado ni manipular equipos.`:`Indica si falla la llamada, el sonido, la imagen o la apertura de la puerta y si sucede en todas las viviendas o solo en una. Con esos síntomas se puede preparar la consulta sin desmontar el equipo.`,
   cercanas:related,seoOrigen:'toledo-guadalajara-inicial'
  });
 }
}
for(const [name,key,names] of provinces)assert.equal(rows.filter(x=>x.provinciaSlug===key).length,names.length,`${name}: inventario incompleto`);
fs.writeFileSync(file,JSON.stringify(rows,null,2)+'\n');
console.log('Toledo y Guadalajara: 20 municipios iniciales incorporados y validados.');
