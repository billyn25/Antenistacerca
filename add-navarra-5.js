import fs from 'node:fs';
import { buildNavarraSeo } from './seo-navarra-auto.js';
const BASE='src/localidades.json';
const raw=JSON.parse(fs.readFileSync(BASE,'utf8'));
const batch=[
['Abáigar','abaigar','Tierra Estella',['Murieta','Oco','Ancín-Antzin','Estella-Lizarra']],
['Aguilar de Codés','aguilar-de-codes','Tierra Estella',['Cabredo','Marañón','Genevilla','Lapoblación']],
['Aras','aras','Tierra Estella',['Viana','Bargota','Torres del Río','Lapoblación']],
['Arellano','arellano','Tierra Estella',['Dicastillo','Aberin','Arróniz','Estella-Lizarra']],
['Armañanzas','armananzas','Tierra Estella',['Los Arcos','Sansol','Torres del Río','Bargota']],
['Azuelo','azuelo','Tierra Estella',['Torralba del Río','Aguilar de Codés','Desojo','Espronceda']],
['Barbarin','barbarin','Tierra Estella',['Arróniz','Villamayor de Monjardín','Los Arcos','Estella-Lizarra']],
['Bargota','bargota','Tierra Estella',['Viana','Aras','Torres del Río','Armañanzas']],
['Barillas','barillas','Ribera de Navarra',['Ablitas','Cascante','Monteagudo','Tudela']],
['Cabredo','cabredo','Tierra Estella',['Genevilla','Marañón','Aguilar de Codés','Lapoblación']],
['Cárcar','carcar','Ribera Alta',['Andosilla','Lerín','Lodosa','San Adrián']],
['Castillonuevo','castillonuevo','Pirineo',['Navascués-Nabaskoze','Burgui-Burgi','Romanzado','Sangüesa-Zangoza']],
['Desojo','desojo','Tierra Estella',['Espronceda','Torralba del Río','Los Arcos','Sansol']],
['Echarri-Etxarri','echarri-etxarri','Cuenca de Pamplona',['Etxauri','Ciriza-Ziritza','Bidaurreta','Zabalza-Zabaltza']],
['Espronceda','espronceda','Tierra Estella',['Desojo','Torralba del Río','Sansol','Los Arcos']],
['Genevilla','genevilla','Tierra Estella',['Cabredo','Marañón','Aguilar de Codés','Lapoblación']],
['Igúzquiza','iguzquiza','Tierra Estella',['Estella-Lizarra','Ayegui-Aiegi','Villamayor de Monjardín','Los Arcos']],
['Lapoblación','lapoblacion','Tierra Estella',['Marañón','Cabredo','Aguilar de Codés','Genevilla']],
['Lazagurría','lazagurria','Tierra Estella',['Mendavia','Los Arcos','Viana','Sesma']],
['Marañón','maranon','Tierra Estella',['Cabredo','Genevilla','Lapoblación','Aguilar de Codés']],
['Metauten','metauten','Tierra Estella',['Estella-Lizarra','Allín','Ancín-Antzin','Murieta']],
['Mirafuentes','mirafuentes','Tierra Estella',['Mendaza','Nazar','Mues','Sorlada']],
['Mues','mues','Tierra Estella',['Nazar','Sorlada','Los Arcos','Mendaza']],
['Nazar','nazar','Tierra Estella',['Mirafuentes','Mues','Torralba del Río','Mendaza']],
['Olejua','olejua','Tierra Estella',['Etayo','Oco','Arellano','Dicastillo']],
['Piedramillera','piedramillera','Tierra Estella',['Sorlada','Mendaza','Oco','Mues']],
['Sansol','sansol','Tierra Estella',['Torres del Río','Desojo','Los Arcos','Espronceda']],
['Sorlada','sorlada','Tierra Estella',['Mues','Piedramillera','Mendaza','Nazar']],
['Torralba del Río','torralba-del-rio','Tierra Estella',['Azuelo','Espronceda','Nazar','Aguilar de Codés']],
['Torres del Río','torres-del-rio','Tierra Estella',['Sansol','Los Arcos','Armañanzas','Viana']],
['Villamayor de Monjardín','villamayor-de-monjardin','Tierra Estella',['Estella-Lizarra','Ayegui-Aiegi','Igúzquiza','Los Arcos']],
['Arruazu','arruazu','Sakana',['Lakuntza','Uharte Arakil','Arbizu','Etxarri Aranatz']],
['Bakaiku','bakaiku','Sakana',['Etxarri Aranatz','Iturmendi','Urdiain','Altsasu-Alsasua']],
['Ergoiena','ergoiena','Sakana',['Etxarri Aranatz','Arbizu','Bakaiku','Lakuntza']],
['Irañeta','iraneta','Sakana',['Uharte Arakil','Arakil','Irurtzun','Arruazu']],
['Iturmendi','iturmendi','Sakana',['Bakaiku','Urdiain','Altsasu-Alsasua','Etxarri Aranatz']],
['Olazti-Olazagutía','olazti-olazagutia','Sakana',['Altsasu-Alsasua','Ziordia','Urdiain','Iturmendi']],
['Urdiain','urdiain','Sakana',['Altsasu-Alsasua','Iturmendi','Bakaiku','Olazti-Olazagutía']],
['Ziordia','ziordia','Sakana',['Olazti-Olazagutía','Altsasu-Alsasua','Urdiain','Bakaiku']],
['Etxauri','etxauri','Cuenca de Pamplona',['Ciriza-Ziritza','Bidaurreta','Zabalza-Zabaltza','Cizur']],
['Ciriza-Ziritza','ciriza-ziritza','Cuenca de Pamplona',['Etxauri','Bidaurreta','Zabalza-Zabaltza','Puente la Reina-Gares']],
['Bidaurreta','bidaurreta','Cuenca de Pamplona',['Etxauri','Ciriza-Ziritza','Zabalza-Zabaltza','Puente la Reina-Gares']],
['Zabalza-Zabaltza','zabalza-zabaltza','Cuenca de Pamplona',['Etxauri','Ciriza-Ziritza','Bidaurreta','Puente la Reina-Gares']],
['Belascoáin','belascoain','Cuenca de Pamplona',['Etxauri','Cizur','Puente la Reina-Gares','Zizur Mayor-Zizur Nagusia']],
['Úcar','ucar','Valdizarbe',['Enériz','Añorbe','Puente la Reina-Gares','Tirapu']],
['Cendea de Olza-Oltza Zendea','cendea-de-olza-oltza-zendea','Cuenca de Pamplona',['Orkoien','Iza','Berrioplano','Pamplona-Iruña']],
['Arano','arano','Norte de Navarra',['Goizueta','Leitza','Areso','Ezkurra']],
['Urroz-Villa','urroz-villa','Prepirineo',['Aoiz-Agoitz','Lónguida-Longida','Unciti','Valle de Egüés-Eguesibar']],
['Murillo el Cuende','murillo-el-cuende','Zona Media',['Caparroso','Olite-Erriberri','Marcilla','Pitillas']],
['Murillo el Fruto','murillo-el-fruto','Zona Media',['Carcastillo','Santacara','Mélida','Caparroso']]
].map(([localidad,slug,comarca,cercanas])=>({provincia:'Navarra',provinciaSlug:'navarra',localidad,slug,comarca,cercanas}));
const existing=new Set(raw.map(d=>`${d.provinciaSlug||'bizkaia'}/${d.slug}`));
let added=0;
for(const d of batch){const key=`navarra/${d.slug}`;if(existing.has(key))continue;raw.push({...d,...buildNavarraSeo(d),seoOrigen:'navarra-local-v1'});existing.add(key);added++}
fs.writeFileSync(BASE,JSON.stringify(raw,null,2)+'\n');
console.log(`Navarra fase 5: ${added} municipios nuevos añadidos en este build.`);
