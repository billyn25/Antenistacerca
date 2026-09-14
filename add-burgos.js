import fs from 'node:fs';
const BASE='src/localidades.json';
const raw=JSON.parse(fs.readFileSync(BASE,'utf8'));
const rows=[
['Burgos','Burgos','burgos','Alfoz de Burgos',['Villagonzalo Pedernales','Cardeñadijo','Villalbilla de Burgos','Arcos de la Llana']],
['Burgos','Miranda de Ebro','miranda-de-ebro','Comarca del Ebro',['Pancorbo','La Puebla de Arganzón','Treviño','Briviesca']],
['Burgos','Aranda de Duero','aranda-de-duero','Ribera del Duero',['Roa','Peñaranda de Duero','Gumiel de Izán','La Horra']],
['Burgos','Briviesca','briviesca','La Bureba',['Oña','Pancorbo','Poza de la Sal','Burgos']],
['Burgos','Medina de Pomar','medina-de-pomar','Las Merindades',['Villarcayo','Trespaderne','Espinosa de los Monteros','Oña']],
['Burgos','Villarcayo de Merindad de Castilla la Vieja','villarcayo','Las Merindades',['Medina de Pomar','Espinosa de los Monteros','Trespaderne','Soncillo']],
['Burgos','Lerma','lerma','Arlanza',['Covarrubias','Santa María del Campo','Burgos','Quintanilla del Agua y Tordueles']],
['Burgos','Salas de los Infantes','salas-de-los-infantes','Sierra de la Demanda',['Quintanar de la Sierra','Castrillo de la Reina','Hacinas','Covarrubias']],
['Burgos','Roa','roa','Ribera del Duero',['Aranda de Duero','La Horra','Pedrosa de Duero','Gumiel de Mercado']],
['Burgos','Belorado','belorado','Montes de Oca',['Villafranca Montes de Oca','Pradoluengo','Briviesca','Burgos']],
['Burgos','Espinosa de los Monteros','espinosa-de-los-monteros','Las Merindades',['Medina de Pomar','Villarcayo','Merindad de Sotoscueva','Soncillo']],
['Burgos','Quintanar de la Sierra','quintanar-de-la-sierra','Sierra de la Demanda',['Salas de los Infantes','Canicosa de la Sierra','Regumiel de la Sierra','Neila']],
['Burgos','Melgar de Fernamental','melgar-de-fernamental','Odra-Pisuerga',['Castrojeriz','Villadiego','Sasamón','Burgos']],
['Burgos','Castrojeriz','castrojeriz','Odra-Pisuerga',['Melgar de Fernamental','Sasamón','Villadiego','Burgos']],
['Burgos','Pancorbo','pancorbo','La Bureba',['Miranda de Ebro','Briviesca','Oña','Santa Gadea del Cid']],
['Burgos','Oña','ona','La Bureba',['Briviesca','Trespaderne','Medina de Pomar','Poza de la Sal']],
['Burgos','Treviño','trevino','Condado de Treviño',['La Puebla de Arganzón','Miranda de Ebro','Burgos','Briviesca']],
['Burgos','La Puebla de Arganzón','la-puebla-de-arganzon','Condado de Treviño',['Treviño','Miranda de Ebro','Burgos','Briviesca']],
['Burgos','Villadiego','villadiego','Odra-Pisuerga',['Sasamón','Melgar de Fernamental','Castrojeriz','Burgos']],
['Burgos','Sasamón','sasamon','Odra-Pisuerga',['Villadiego','Castrojeriz','Melgar de Fernamental','Burgos']],
['Burgos','Poza de la Sal','poza-de-la-sal','La Bureba',['Briviesca','Oña','Burgos','Trespaderne']],
['Burgos','Trespaderne','trespaderne','Las Merindades',['Oña','Medina de Pomar','Villarcayo','Frías']],
['Burgos','Frías','frias','Las Merindades',['Trespaderne','Oña','Medina de Pomar','Valle de Tobalina']],
['Burgos','Covarrubias','covarrubias','Arlanza',['Lerma','Salas de los Infantes','Quintanilla del Agua y Tordueles','Burgos']],
['Burgos','Peñaranda de Duero','penaranda-de-duero','Ribera del Duero',['Aranda de Duero','Roa','Huerta de Rey','Gumiel de Izán']],
['Burgos','Gumiel de Izán','gumiel-de-izan','Ribera del Duero',['Aranda de Duero','Roa','Gumiel de Mercado','Peñaranda de Duero']],
['Burgos','La Horra','la-horra','Ribera del Duero',['Roa','Aranda de Duero','Pedrosa de Duero','Gumiel de Mercado']],
['Burgos','Huerta de Rey','huerta-de-rey','Sierra de la Demanda',['Peñaranda de Duero','Salas de los Infantes','Arauzo de Miel','Aranda de Duero']],
['Burgos','Pradoluengo','pradoluengo','Sierra de la Demanda',['Belorado','Villafranca Montes de Oca','Burgos','Briviesca']],
['Burgos','Villafranca Montes de Oca','villafranca-montes-de-oca','Montes de Oca',['Belorado','Pradoluengo','Burgos','Briviesca']],
['Burgos','Soncillo','soncillo','Las Merindades',['Espinosa de los Monteros','Villarcayo','Medina de Pomar','Merindad de Sotoscueva']],
['Burgos','Canicosa de la Sierra','canicosa-de-la-sierra','Sierra de la Demanda',['Quintanar de la Sierra','Regumiel de la Sierra','Salas de los Infantes','Neila']],
['Burgos','Regumiel de la Sierra','regumiel-de-la-sierra','Sierra de la Demanda',['Quintanar de la Sierra','Canicosa de la Sierra','Neila','Salas de los Infantes']],
['Burgos','Neila','neila','Sierra de la Demanda',['Quintanar de la Sierra','Canicosa de la Sierra','Regumiel de la Sierra','Salas de los Infantes']],
['Burgos','Arcos de la Llana','arcos-de-la-llana','Alfoz de Burgos',['Burgos','Villagonzalo Pedernales','Cardeñadijo','Villalbilla de Burgos']],
['Burgos','Cardeñadijo','cardenadijo','Alfoz de Burgos',['Burgos','Arcos de la Llana','Villalbilla de Burgos','Villagonzalo Pedernales']],
['Burgos','Villagonzalo Pedernales','villagonzalo-pedernales','Alfoz de Burgos',['Burgos','Villalbilla de Burgos','Cardeñadijo','Arcos de la Llana']],
['Burgos','Villalbilla de Burgos','villalbilla-de-burgos','Alfoz de Burgos',['Burgos','Villagonzalo Pedernales','Cardeñadijo','Arcos de la Llana']],
['Burgos','Santa María del Campo','santa-maria-del-campo','Arlanza',['Lerma','Burgos','Castrojeriz','Covarrubias']],
['Burgos','Gumiel de Mercado','gumiel-de-mercado','Ribera del Duero',['Aranda de Duero','Roa','Gumiel de Izán','La Horra']]
];
const existing=new Set(raw.map(d=>`${d.provinciaSlug}/${d.slug}`));let added=0;
for(const [provincia,localidad,slug,comarca,cercanas] of rows){const provinciaSlug='burgos';const key=`${provinciaSlug}/${slug}`;if(existing.has(key))continue;raw.push({provincia,provinciaSlug,localidad,slug,comarca,cercanas});existing.add(key);added++;}
fs.writeFileSync(BASE,JSON.stringify(raw,null,2)+'\n');
console.log(`Burgos: primera cobertura activa; ${added} municipios nuevos añadidos.`);
