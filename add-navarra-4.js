import fs from 'node:fs';
import { buildNavarraSeo } from './seo-navarra-auto.js';
const BASE='src/localidades.json';
const raw=JSON.parse(fs.readFileSync(BASE,'utf8'));
const batch1=JSON.parse(fs.readFileSync('src/localidades-navarra-1.json','utf8'));
const extra=[
['Aibar-Oibar','aibar-oibar','Comarca de Sangüesa',['Sangüesa-Zangoza','Cáseda','Lumbier','Leache']],
['Cáseda','caseda','Comarca de Sangüesa',['Sangüesa-Zangoza','Aibar-Oibar','Gallipienzo','Carcastillo']],
['Gallipienzo','gallipienzo','Comarca de Sangüesa',['Cáseda','Aibar-Oibar','Carcastillo','Sangüesa-Zangoza']],
['Leache','leache','Comarca de Sangüesa',['Aibar-Oibar','Sangüesa-Zangoza','Lumbier','Ezprogui']],
['Ezprogui','ezprogui','Comarca de Sangüesa',['Leache','Aibar-Oibar','Sangüesa-Zangoza','Lumbier']],
['Lumbier','lumbier','Comarca de Sangüesa',['Sangüesa-Zangoza','Aibar-Oibar','Liédena','Romanzado']],
['Liédena','liedena','Comarca de Sangüesa',['Lumbier','Sangüesa-Zangoza','Yesa','Javier']],
['Yesa','yesa','Comarca de Sangüesa',['Liédena','Javier','Sangüesa-Zangoza','Lumbier']],
['Javier','javier','Comarca de Sangüesa',['Yesa','Sangüesa-Zangoza','Liédena','Lumbier']],
['Romanzado','romanzado','Comarca de Sangüesa',['Lumbier','Navascués-Nabaskoze','Urraúl Bajo','Sangüesa-Zangoza']],
['Navascués-Nabaskoze','navascues-nabaskoze','Pirineo',['Romanzado','Burgui-Burgi','Lumbier','Urraúl Alto']],
['Urraúl Bajo','urraul-bajo','Comarca de Sangüesa',['Lumbier','Romanzado','Urraúl Alto','Aoiz-Agoitz']],
['Urraúl Alto','urraul-alto','Pirineo',['Urraúl Bajo','Navascués-Nabaskoze','Lumbier','Aoiz-Agoitz']],
['Lónguida-Longida','longuida-longida','Comarca de Sangüesa',['Aoiz-Agoitz','Lumbier','Urraúl Bajo','Valle de Egüés-Eguesibar']],
['Ibargoiti','ibargoiti','Comarca de Sangüesa',['Monreal-Elo','Unciti','Lumbier','Noáin-Valle de Elorz-Noain Elortzibar']],
['Monreal-Elo','monreal-elo','Comarca de Sangüesa',['Ibargoiti','Unciti','Noáin-Valle de Elorz-Noain Elortzibar','Tiebas-Muruarte de Reta']],
['Unciti','unciti','Comarca de Sangüesa',['Monreal-Elo','Ibargoiti','Valle de Egüés-Eguesibar','Aoiz-Agoitz']],
['Tiebas-Muruarte de Reta','tiebas-muruarte-de-reta','Cuenca de Pamplona',['Noáin-Valle de Elorz-Noain Elortzibar','Monreal-Elo','Biurrun-Olcoz','Galar']],
['Biurrun-Olcoz','biurrun-olcoz','Valdizarbe',['Tiebas-Muruarte de Reta','Galar','Puente la Reina-Gares','Mendigorria']],
['Legarda','legarda','Valdizarbe',['Puente la Reina-Gares','Uterga','Muruzábal','Obanos']],
['Uterga','uterga','Valdizarbe',['Legarda','Muruzábal','Obanos','Puente la Reina-Gares']],
['Muruzábal','muruzabal','Valdizarbe',['Obanos','Uterga','Puente la Reina-Gares','Legarda']],
['Adiós','adios','Valdizarbe',['Enériz','Obanos','Puente la Reina-Gares','Muruzábal']],
['Enériz','eneriz','Valdizarbe',['Adiós','Obanos','Puente la Reina-Gares','Muruzábal']],
['Guirguillano','guirguillano','Valdizarbe',['Puente la Reina-Gares','Mañeru','Guesálaz','Artazu']],
['Mendigorria','mendigorria','Zona Media',['Puente la Reina-Gares','Artajona','Larraga','Obanos']],
['Añorbe','anorbe','Zona Media',['Puente la Reina-Gares','Artajona','Tirapu','Enériz']],
['Tirapu','tirapu','Zona Media',['Añorbe','Artajona','Puente la Reina-Gares','Biurrun-Olcoz']],
['Orísoain','orisoain','Valdorba',['Barásoain','Olóriz','Garínoain','Leoz-Leotz']],
['Barásoain','barasoain','Valdorba',['Garínoain','Olóriz','Orísoain','Tafalla']],
['Garínoain','garinoain','Valdorba',['Barásoain','Olóriz','Orísoain','Tafalla']],
['Olóriz','oloriz','Valdorba',['Barásoain','Garínoain','Orísoain','Leoz-Leotz']],
['Leoz-Leotz','leoz-leotz','Valdorba',['Olóriz','Orísoain','Pueyo-Puiu','Tafalla']],
['Pueyo-Puiu','pueyo-puiu','Zona Media',['Tafalla','Olite-Erriberri','Leoz-Leotz','Barásoain']],
['Murieta','murieta','Tierra Estella',['Ancín-Antzin','Mendaza','Estella-Lizarra','Valle de Lana']],
['Mendaza','mendaza','Tierra Estella',['Ancín-Antzin','Murieta','Valle de Lana','Los Arcos']],
['Valle de Lana','valle-de-lana','Tierra Estella',['Mendaza','Ancín-Antzin','Murieta','Zúñiga']],
['Zúñiga','zuniga','Tierra Estella',['Valle de Lana','Mendaza','Ancín-Antzin','Los Arcos']],
['Oco','oco','Tierra Estella',['Etayo','Los Arcos','Mendaza','Ancín-Antzin']],
['Etayo','etayo','Tierra Estella',['Oco','Los Arcos','Mendaza','Ancín-Antzin']]
].map(([localidad,slug,comarca,cercanas])=>({provincia:'Navarra',provinciaSlug:'navarra',localidad,slug,comarca,cercanas}));
const existing=new Set(raw.map(d=>`${d.provinciaSlug||'bizkaia'}/${d.slug}`));
let added=0;
for(const d of [...batch1,...extra]){const key=`navarra/${d.slug}`;if(existing.has(key))continue;raw.push({...d,...buildNavarraSeo(d),seoOrigen:'navarra-local-v1'});existing.add(key);added++}
fs.writeFileSync(BASE,JSON.stringify(raw,null,2)+'\n');
console.log(`Navarra: ampliación activa; ${added} municipios nuevos añadidos en este build.`);
