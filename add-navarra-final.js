import fs from 'node:fs';
import { buildNavarraSeo } from './seo-navarra-auto.js';

const BASE='src/localidades.json';
const CITY_EXTRA='src/localidades-ciudades-norte-1.json';
const raw=JSON.parse(fs.readFileSync(BASE,'utf8'));
const batch=[
['Urrotz','urrotz','Norte de Navarra',['Doneztebe-Santesteban','Donamaria','Oitz','Labaien']],
['Hiriberri-Villanueva de Aezkoa','hiriberri-villanueva-de-aezkoa','Pirineo',['Aribe','Garaioa','Aria','Abaurregaina-Abaurrea Alta']],
['Valle de Arce-Artzibar','valle-de-arce-artzibar','Pirineo',['Aoiz-Agoitz','Oroz-Betelu','Erro','Lónguida-Longida']],
['Oronz-Orontze','oronz-orontze','Pirineo',['Ezcároz-Ezkaroze','Esparza de Salazar-Espartza Zaraitzu','Güesa-Gorza','Ochagavía-Otsagabia']],
['Sarriés-Sartze','sarries-sartze','Pirineo',['Güesa-Gorza','Gallués-Galoze','Navascués-Nabaskoze','Esparza de Salazar-Espartza Zaraitzu']],
['Lizoain-Arriasgoiti-Lizoainibar-Arriasgoiti','lizoain-arriasgoiti-lizoainibar-arriasgoiti','Prepirineo',['Aoiz-Agoitz','Urroz-Villa','Valle de Egüés-Eguesibar','Lónguida-Longida']],
['Güesa-Gorza','guesa-gorza','Pirineo',['Gallués-Galoze','Sarriés-Sartze','Esparza de Salazar-Espartza Zaraitzu','Ezcároz-Ezkaroze']],
['Gallués-Galoze','gallues-galoze','Pirineo',['Güesa-Gorza','Sarriés-Sartze','Navascués-Nabaskoze','Esparza de Salazar-Espartza Zaraitzu']],
['Salinas de Oro-Jaitz','salinas-de-oro-jaitz','Valles centrales',['Guesálaz','Goñi','Etxauri','Abárzuza']],
['Izagaondoa','izagaondoa','Prepirineo',['Monreal-Elo','Unciti','Urroz-Villa','Aoiz-Agoitz']],
['Unzué-Untzue','unzue-untzue','Valdorba',['Olóriz','Barásoain','Leoz-Leotz','Garínoain']],
['Legaria','legaria','Tierra Estella',['Murieta','Ancín-Antzin','Mendaza','Oco']],
['Morentin','morentin','Tierra Estella',['Aberin','Dicastillo','Arellano','Allo']],
['Sada','sada','Zona Media',['Aibar-Oibar','Eslava','Lerga','Sangüesa-Zangoza']],
['Eslava','eslava','Zona Media',['Sada','Aibar-Oibar','Lerga','Sangüesa-Zangoza']],
['Lerga','lerga','Zona Media',['Sada','Eslava','Aibar-Oibar','San Martín de Unx']],
['Oteiza','oteiza','Tierra Estella',['Villatuerta','Larraga','Mendigorria','Estella-Lizarra']],
['El Busto','el-busto','Tierra Estella',['Los Arcos','Sansol','Torres del Río','Lazagurría']],
['Luquin','luquin','Tierra Estella',['Villamayor de Monjardín','Los Arcos','Igúzquiza','Estella-Lizarra']],
['Petilla de Aragón','petilla-de-aragon','Zona Media',['Sangüesa-Zangoza','Javier','Cáseda','Gallipienzo']],
['Tulebras','tulebras','Ribera de Navarra',['Cascante','Barillas','Monteagudo','Ablitas']],
['Berrioplano-Berriobeiti','berrioplano-berriobeiti','Cuenca de Pamplona',['Berriozar','Iza','Juslapeña','Pamplona-Iruña']],
['Ancín-Antzin','ancin-antzin','Tierra Estella',['Murieta','Legaria','Metauten','Mendaza']]
].map(([localidad,slug,comarca,cercanas])=>({provincia:'Navarra',provinciaSlug:'navarra',localidad,slug,comarca,cercanas}));

const existing=new Set(raw.map(d=>`${d.provinciaSlug||'bizkaia'}/${d.slug}`));
let added=0;
for(const d of batch){
  const key=`navarra/${d.slug}`;
  if(existing.has(key)) continue;
  raw.push({...d,...buildNavarraSeo(d),seoOrigen:'navarra-local-v1'});
  existing.add(key);
  added++;
}

const projected=new Set(raw.filter(d=>d.provinciaSlug==='navarra').map(d=>d.slug));
if(fs.existsSync(CITY_EXTRA)){
  for(const d of JSON.parse(fs.readFileSync(CITY_EXTRA,'utf8'))){
    if(d.provinciaSlug==='navarra') projected.add(d.slug);
  }
}
if(projected.size!==272) throw new Error(`Navarra incompleta tras cierre: ${projected.size}/272 municipios`);

fs.writeFileSync(BASE,JSON.stringify(raw,null,2)+'\n');
console.log(`Navarra cerrada: ${projected.size}/272 municipios previstos; ${added} añadidos en este build.`);
