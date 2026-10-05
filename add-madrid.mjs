import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
export const slugify = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function validateMadrid(data) {
  assert.equal(data.provinceId,'28');
  assert.equal(data.municipalities.length,179);
  assert.equal(new Set(data.municipalities.map(x=>x.id)).size,179);
  assert.equal(new Set(data.municipalities.map(x=>slugify(x.name))).size,179);
  for(const x of data.municipalities){
    assert.match(x.id,/^28\d{3}$/);
    assert.ok(x.name && x.postalCodes.length,`Madrid: faltan datos de ${x.name}`);
    assert.deepEqual(x.postalCodes,[...new Set(x.postalCodes)].sort());
    for(const code of x.postalCodes)assert.match(code,/^28\d{3}$/);
  }
  return data;
}
export function madridRows(data) {
  const all=validateMadrid(data).municipalities;
  const featured=['Madrid','Alcalá de Henares','Alcobendas','Alcorcón','Aranjuez','Arganda del Rey','Boadilla del Monte','Collado Villalba','Colmenar Viejo','Coslada','Fuenlabrada','Getafe','Leganés','Majadahonda','Móstoles','Pinto','Pozuelo de Alarcón','Rivas-Vaciamadrid','San Fernando de Henares','San Sebastián de los Reyes','Torrejón de Ardoz','Tres Cantos','Valdemoro','Villaviciosa de Odón'];
  const rank=n=>featured.includes(n)?featured.indexOf(n):featured.length;
  return [...all].sort((a,b)=>rank(a.name)-rank(b.name)||a.name.localeCompare(b.name,'es')).map((row,index,ordered)=>{
    const n=row.name,codes=row.postalCodes;
    // Related means shared postal area or alternative municipalities, not measured proximity.
    const shared=all.filter(x=>x.id!==row.id&&x.postalCodes.some(c=>codes.includes(c)));
    const alternatives=[...shared,...ordered.slice(index+1),...ordered.slice(0,index)];
    const names=[...new Set(alternatives.map(x=>x.name))].slice(0,4);
    const postal=codes.length===1?`el código postal ${codes[0]}`:`los códigos ${codes.slice(0,4).join(', ')}${codes.length>4?' y otros que figuran en el listado postal':''}`;
    return {
      provincia:'Madrid',provinciaSlug:'madrid',localidad:n,slug:slugify(n),comarca:'Comunidad de Madrid',municipioId:row.id,postalCodes:codes,
      descripcion:`Antenista en ${n}, Madrid. Instalación y reparación de antenas TDT, parabólicas, amplificación, porteros automáticos y videoporteros. 641 589 394.`,
      introLocal:`Para solicitar un antenista en ${n}, indica la calle y si la instalación es de una vivienda, una comunidad o un local. Revisamos señal TDT, parabólicas, amplificación y sistemas de portero o videoportero; antes de la visita se confirman disponibilidad, desplazamiento y condiciones.`,
      zonaLocal:`El aviso en ${n}, Comunidad de Madrid, se localiza con la dirección y ${postal}, asociados a direcciones municipales de CartoCiudad. El código postal no sustituye a la localidad: comprueba ambos datos al consultar la instalación o reparación.`,
      faqPregunta:`¿Cómo preparo una consulta de antena o portero en ${n}?`,
      faqRespuesta:`Indica ${n}, calle, código postal y el síntoma. Para televisión, comenta si fallan todos los canales o una sola toma; para porteros y videoporteros, si falla llamada, audio, imagen o apertura. Así se puede preparar la revisión y confirmar sus condiciones sin pedirte que desmontes equipos.`,
      cercanas:names,seoOrigen:'madrid-datos-postales-v1'
    };
  });
}
export function addMadrid(rows,data){
  const additions=madridRows(data),existing=rows.filter(d=>d.provinciaSlug!=='madrid');
  for(const row of rows.filter(d=>d.provinciaSlug==='madrid'))assert.ok(additions.some(x=>x.slug===row.slug),`Madrid: no se elimina una ruta desconocida ${row.slug}`);
  return [...existing,...additions];
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const rows=JSON.parse(fs.readFileSync('src/localidades.json','utf8'));
 const data=JSON.parse(fs.readFileSync('src/postal-codes-madrid.json','utf8'));
 fs.writeFileSync('src/localidades.json',JSON.stringify(addMadrid(rows,data),null,2)+'\n');
 console.log('MADRID: 179 municipios y datos postales locales; sin descargar datos nuevos en cada build.');
}
