import fs from 'node:fs';
import { buildNavarraSeo } from './seo-navarra-auto.js';
const BASE='src/localidades.json';
const raw=JSON.parse(fs.readFileSync(BASE,'utf8'));
const batch1=JSON.parse(fs.readFileSync('src/localidades-navarra-1.json','utf8'));
const batch2=[
['Allo','allo','Tierra Estella',['Arróniz','Lerín','Dicastillo','Estella-Lizarra']],['Arróniz','arroniz','Tierra Estella',['Allo','Dicastillo','Lerín','Estella-Lizarra']],['Dicastillo','dicastillo','Tierra Estella',['Allo','Arróniz','Lerín','Estella-Lizarra']],['Lerín','lerin','Tierra Estella',['Allo','Arróniz','Dicastillo','Sesma']],['Sesma','sesma','Tierra Estella',['Lerín','Lodosa','Sartaguda','Allo']],['Aberin','aberin','Tierra Estella',['Estella-Lizarra','Villatuerta','Dicastillo','Allo']],['Abárzuza','abarzuza','Tierra Estella',['Estella-Lizarra','Lezaun','Valle de Yerri','Ayegui-Aiegi']],['Lezaun','lezaun','Tierra Estella',['Abárzuza','Valle de Yerri','Estella-Lizarra','Guesálaz']],['Valle de Yerri','valle-de-yerri','Tierra Estella',['Abárzuza','Lezaun','Estella-Lizarra','Guesálaz']],['Guesálaz','guesalaz','Tierra Estella',['Lezaun','Valle de Yerri','Estella-Lizarra','Puente la Reina-Gares']],['Aranarache-Aranaratxe','aranarache-aranaratxe','Tierra Estella',['Eulate','Larraona','Améscoa Baja','Allín']],['Eulate','eulate','Tierra Estella',['Aranarache-Aranaratxe','Larraona','Améscoa Baja','Allín']],['Larraona','larraona','Tierra Estella',['Eulate','Aranarache-Aranaratxe','Améscoa Baja','Allín']],['Améscoa Baja','amescoa-baja','Tierra Estella',['Eulate','Aranarache-Aranaratxe','Larraona','Allín']],['Allín','allin','Tierra Estella',['Améscoa Baja','Eulate','Estella-Lizarra','Ayegui-Aiegi']],['Arguedas','arguedas','Ribera de Navarra',['Valtierra','Tudela','Castejón','Cadreita']],['Valtierra','valtierra','Ribera de Navarra',['Arguedas','Tudela','Cadreita','Castejón']],['Cadreita','cadreita','Ribera de Navarra',['Valtierra','Villafranca','Milagro','Tudela']],['Villafranca','villafranca','Ribera de Navarra',['Cadreita','Milagro','Marcilla','Caparroso']],['Milagro','milagro','Ribera Alta',['Villafranca','Cadreita','Marcilla','Funes']],['Marcilla','marcilla','Ribera Alta',['Villafranca','Milagro','Funes','Peralta-Azkoien']],['Funes','funes','Ribera Alta',['Marcilla','Milagro','Peralta-Azkoien','Falces']],['Cabanillas','cabanillas','Ribera de Navarra',['Tudela','Fustiñana','Ribaforada','Fontellas']],['Fitero','fitero','Ribera de Navarra',['Cintruénigo','Corella','Cascante','Tudela']],['Monteagudo','monteagudo','Ribera de Navarra',['Cascante','Ablitas','Tudela','Murchante']],['Puente la Reina-Gares','puente-la-reina-gares','Valdizarbe',['Obanos','Mañeru','Artazu','Mendigorria']],['Obanos','obanos','Valdizarbe',['Puente la Reina-Gares','Mañeru','Artazu','Mendigorria']],['Mañeru','maneru','Valdizarbe',['Puente la Reina-Gares','Obanos','Artazu','Cirauqui-Zirauki']],['Artazu','artazu','Valdizarbe',['Puente la Reina-Gares','Obanos','Mañeru','Mendigorria']],['Cirauqui-Zirauki','cirauqui-zirauki','Valdizarbe',['Mañeru','Puente la Reina-Gares','Artazu','Estella-Lizarra']],['Berbinzana','berbinzana','Zona Media',['Larraga','Miranda de Arga','Artajona','Tafalla']],['Miranda de Arga','miranda-de-arga','Zona Media',['Berbinzana','Larraga','Falces','Tafalla']],['San Martín de Unx','san-martin-de-unx','Zona Media',['Olite-Erriberri','Tafalla','Ujué','Beire']],['Ujué','ujue','Zona Media',['San Martín de Unx','Olite-Erriberri','Beire','Tafalla']],['Beire','beire','Zona Media',['Olite-Erriberri','San Martín de Unx','Pitillas','Tafalla']],['Pitillas','pitillas','Zona Media',['Beire','Olite-Erriberri','Santacara','Tafalla']],['Santacara','santacara','Zona Media',['Pitillas','Mélida','Carcastillo','Caparroso']],['Mélida','melida','Zona Media',['Santacara','Carcastillo','Caparroso','Pitillas']],['Arakil','arakil','Sakana',['Irurtzun','Uharte Arakil','Lakuntza','Etxarri Aranatz']],['Uharte Arakil','uharte-arakil','Sakana',['Arakil','Irurtzun','Lakuntza','Etxarri Aranatz']]
].map(([localidad,slug,comarca,cercanas])=>({provincia:'Navarra',provinciaSlug:'navarra',localidad,slug,comarca,cercanas}));
const batch3=[
['Urdazubi-Urdax','urdazubi-urdax','Baztan-Bidasoa',['Baztan','Zugarramurdi','Bera','Etxalar']],
['Zugarramurdi','zugarramurdi','Baztan-Bidasoa',['Urdazubi-Urdax','Baztan','Bera','Etxalar']],
['Etxalar','etxalar','Bidasoa',['Bera','Lesaka','Igantzi','Arantza']],
['Igantzi','igantzi','Bidasoa',['Lesaka','Etxalar','Arantza','Bera']],
['Arantza','arantza','Bidasoa',['Igantzi','Etxalar','Lesaka','Sunbilla']],
['Goizueta','goizueta','Norte de Navarra',['Leitza','Arano','Areso','Ezkurra']],
['Sunbilla','sunbilla','Baztan-Bidasoa',['Doneztebe-Santesteban','Bertizarana','Arantza','Ituren']],
['Bertizarana','bertizarana','Baztan-Bidasoa',['Sunbilla','Doneztebe-Santesteban','Baztan','Ituren']],
['Ituren','ituren','Baztan-Bidasoa',['Doneztebe-Santesteban','Zubieta','Elgorriaga','Sunbilla']],
['Zubieta','zubieta','Baztan-Bidasoa',['Ituren','Doneztebe-Santesteban','Ezkurra','Eratsun']],
['Elgorriaga','elgorriaga','Baztan-Bidasoa',['Doneztebe-Santesteban','Ituren','Sunbilla','Bertizarana']],
['Eratsun','eratsun','Norte de Navarra',['Zubieta','Ezkurra','Labaien','Saldías']],
['Donamaria','donamaria','Baztan-Bidasoa',['Doneztebe-Santesteban','Oitz','Bertizarana','Ituren']],
['Oitz','oitz','Baztan-Bidasoa',['Donamaria','Doneztebe-Santesteban','Ituren','Elgorriaga']],
['Labaien','labaien','Norte de Navarra',['Saldías','Eratsun','Doneztebe-Santesteban','Ezkurra']],
['Saldías','saldias','Norte de Navarra',['Labaien','Eratsun','Ezkurra','Doneztebe-Santesteban']],
['Ezkurra','ezkurra','Norte de Navarra',['Leitza','Eratsun','Saldías','Areso']],
['Areso','areso','Norte de Navarra',['Leitza','Goizueta','Ezkurra','Lekunberri']],
['Araitz','araitz','Valles del Norte',['Betelu','Lekunberri','Larraun','Leitza']],
['Basaburua','basaburua','Valles del Norte',['Ultzama','Imotz','Lantz','Lekunberri']],
['Betelu','betelu','Valles del Norte',['Araitz','Lekunberri','Larraun','Leitza']],
['Lantz','lantz','Valles del Norte',['Ultzama','Anue','Basaburua','Pamplona-Iruña']],
['Ultzama','ultzama','Valles del Norte',['Basaburua','Lantz','Anue','Odieta']],
['Larraun','larraun','Valles del Norte',['Lekunberri','Betelu','Araitz','Basaburua']],
['Anue','anue','Valles del Norte',['Lantz','Ultzama','Esteribar','Pamplona-Iruña']],
['Imotz','imotz','Valles del Norte',['Basaburua','Irurtzun','Atez','Lekunberri']],
['Atez','atez','Valles del Norte',['Imotz','Odieta','Juslapeña','Pamplona-Iruña']],
['Odieta','odieta','Valles del Norte',['Atez','Ultzama','Ezcabarte','Pamplona-Iruña']],
['Esteribar','esteribar','Valles centrales',['Pamplona-Iruña','Anue','Erro','Valle de Egüés-Eguesibar']],
['Juslapeña','juslapena','Cuenca de Pamplona',['Pamplona-Iruña','Berrioplano','Iza','Atez']],
['Oláibar','olaibar','Cuenca de Pamplona',['Pamplona-Iruña','Ezcabarte','Odieta','Anue']],
['Ezcabarte','ezcabarte','Cuenca de Pamplona',['Pamplona-Iruña','Oláibar','Odieta','Berrioplano']],
['Iza','iza','Cuenca de Pamplona',['Pamplona-Iruña','Juslapeña','Berrioplano','Orkoien']],
['Goñi','goni','Valles centrales',['Ollo','Iza','Guesálaz','Pamplona-Iruña']],
['Ollo','ollo','Valles centrales',['Goñi','Iza','Irurtzun','Pamplona-Iruña']],
['Luzaide-Valcarlos','luzaide-valcarlos','Pirineo',['Orreaga-Roncesvalles','Auritz-Burguete','Erro','Pamplona-Iruña']],
['Orreaga-Roncesvalles','orreaga-roncesvalles','Pirineo',['Auritz-Burguete','Luzaide-Valcarlos','Erro','Garralda']],
['Auritz-Burguete','auritz-burguete','Pirineo',['Orreaga-Roncesvalles','Erro','Garralda','Orbaitzeta']],
['Erro','erro','Pirineo',['Auritz-Burguete','Orreaga-Roncesvalles','Esteribar','Garralda']],
['Garralda','garralda','Pirineo',['Aribe','Orbaitzeta','Auritz-Burguete','Erro']],
['Aribe','aribe','Pirineo',['Garralda','Aria','Garaioa','Orbara']],
['Aria','aria','Pirineo',['Aribe','Garaioa','Orbara','Orbaitzeta']],
['Garaioa','garaioa','Pirineo',['Aribe','Aria','Abaurregaina-Abaurrea Alta','Abaurrepea-Abaurrea Baja']],
['Abaurregaina-Abaurrea Alta','abaurregaina-abaurrea-alta','Pirineo',['Abaurrepea-Abaurrea Baja','Garaioa','Aribe','Jaurrieta']],
['Abaurrepea-Abaurrea Baja','abaurrepea-abaurrea-baja','Pirineo',['Abaurregaina-Abaurrea Alta','Garaioa','Aribe','Jaurrieta']],
['Orbara','orbara','Pirineo',['Orbaitzeta','Aribe','Aria','Garralda']],
['Orbaitzeta','orbaitzeta','Pirineo',['Orbara','Garralda','Aribe','Auritz-Burguete']],
['Oroz-Betelu','oroz-betelu','Pirineo',['Aribe','Garralda','Aoiz-Agoitz','Erro']],
['Ochagavía-Otsagabia','ochagavia-otsagabia','Pirineo',['Ezcároz-Ezkaroze','Jaurrieta','Izalzu-Itzaltzu','Esparza de Salazar-Espartza Zaraitzu']],
['Ezcároz-Ezkaroze','ezcaroz-ezkaroze','Pirineo',['Ochagavía-Otsagabia','Jaurrieta','Esparza de Salazar-Espartza Zaraitzu','Güesa-Gorza']],
['Jaurrieta','jaurrieta','Pirineo',['Ochagavía-Otsagabia','Ezcároz-Ezkaroze','Abaurregaina-Abaurrea Alta','Esparza de Salazar-Espartza Zaraitzu']],
['Izalzu-Itzaltzu','izalzu-itzaltzu','Pirineo',['Ochagavía-Otsagabia','Uztárroz-Uztarroze','Isaba-Izaba','Ezcároz-Ezkaroze']],
['Isaba-Izaba','isaba-izaba','Pirineo',['Uztárroz-Uztarroze','Urzainqui','Roncal-Erronkari','Izalzu-Itzaltzu']],
['Uztárroz-Uztarroze','uztarroz-uztarroze','Pirineo',['Isaba-Izaba','Urzainqui','Roncal-Erronkari','Izalzu-Itzaltzu']],
['Urzainqui','urzainqui','Pirineo',['Isaba-Izaba','Roncal-Erronkari','Uztárroz-Uztarroze','Vidángoz-Bidankoze']],
['Roncal-Erronkari','roncal-erronkari','Pirineo',['Urzainqui','Isaba-Izaba','Garde','Burgui-Burgi']],
['Vidángoz-Bidankoze','vidangoz-bidankoze','Pirineo',['Roncal-Erronkari','Burgui-Burgi','Garde','Urzainqui']],
['Burgui-Burgi','burgui-burgi','Pirineo',['Roncal-Erronkari','Vidángoz-Bidankoze','Garde','Sangüesa-Zangoza']],
['Garde','garde','Pirineo',['Roncal-Erronkari','Burgui-Burgi','Vidángoz-Bidankoze','Isaba-Izaba']],
['Esparza de Salazar-Espartza Zaraitzu','esparza-de-salazar-espartza-zaraitzu','Pirineo',['Ezcároz-Ezkaroze','Ochagavía-Otsagabia','Jaurrieta','Sangüesa-Zangoza']]
].map(([localidad,slug,comarca,cercanas])=>({provincia:'Navarra',provinciaSlug:'navarra',localidad,slug,comarca,cercanas}));
const batches=[batch1,batch2,batch3],existing=new Set(raw.map(d=>`${d.provinciaSlug||'bizkaia'}/${d.slug}`));let total=0,added=0;
for(const batch of batches){for(const d of batch){const key=`navarra/${d.slug}`;if(existing.has(key))continue;raw.push({...d,...buildNavarraSeo(d),seoOrigen:'navarra-local-v1'});existing.add(key);added++}total+=batch.length}
fs.writeFileSync(BASE,JSON.stringify(raw,null,2)+'\n');console.log(`Navarra: ${total} municipios en cobertura activa; ${added} añadidos en este build.`);
