import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with {type:'json'};

const targets={
 toledo:['paredes-de-escalona','pelahustan'],
 segovia:['san-cristobal-de-cuellar','torreiglesias'],
 navarra:['castejon','tudela'],
 'la-rioja':['brinas','pradillo'],
 palencia:['arconada','cevico-navero','capillas'],
 leon:['quintana-y-congosto','villaobispo-de-otero'],
 salamanca:['la-pena','mieza'],
 soria:['la-losilla','san-felices'],
 burgos:['sotragero']
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=s=>String(s||'').trim();
const diagnostics=[
 {title:'Cuando faltan canales TDT',question:'¿La pérdida de canales ocurre en todas las tomas o solo en una?',detail:'Si solo falla una toma, conviene revisar derivación, cableado y conexión interior; si afecta a varias viviendas, puede ser necesario comprobar la distribución común.'},
 {title:'Cuando salta o falla un amplificador',question:'¿La incidencia aparece en toda la comunidad o únicamente en una vivienda?',detail:'La respuesta permite distinguir la comprobación de cabecera, fuente y amplificación de la revisión de una derivación individual.'},
 {title:'Cuando el portero no abre',question:'¿Se oye la llamada, funciona el audio y falla únicamente la apertura?',detail:'Separar llamada, audio y cerradura ayuda a identificar si revisar placa, fuente, telefonillo, abrepuertas o conexiones.'},
 {title:'Cuando la parabólica pierde señal',question:'¿El fallo es constante o aparece con lluvia y viento?',detail:'Ese dato ayuda a orientar la comprobación de fijación, conectores, LNB, cable coaxial y calidad de recepción, sin subir a la cubierta por cuenta propia.'},
 {title:'Cuando se pixela la televisión',question:'¿Ocurre en todos los canales o solamente en algunos?',detail:'Antes de sustituir equipos conviene medir nivel y calidad por frecuencias y comprobar tomas, repartidores y amplificación.'}
];
let done=0;
for(const [province,slugs] of Object.entries(targets)){
 for(const slug of slugs){
  const d=localidades.find(x=>x.provinciaSlug===province&&x.slug===slug);
  if(!d)throw Error('Municipio objetivo no encontrado: '+province+'/'+slug);
  const file=path.join('public',province,slug,'index.html');
  if(!fs.existsSync(file))throw Error('HTML no generado: '+file);
  let html=fs.readFileSync(file,'utf8');
  if(html.includes('id="orientacion-local-especifica"'))throw Error('Sección duplicada '+file);
  const seed=[...slug].reduce((a,ch)=>a+ch.charCodeAt(0),0);
  const guide=diagnostics[seed%diagnostics.length];
  const nearby=(d.cercanas||[]).map(n=>localidades.find(x=>x.provinciaSlug===province&&x.localidad.toLowerCase()===n.toLowerCase())).filter(Boolean).filter(x=>x.slug!==slug).slice(0,4);
  const context=safe(d.zonaLocal);
  const intro=safe(d.introLocal);
  const htmlBlock=`<section class="section wrap" id="orientacion-local-especifica" aria-label="Orientación de averías en ${esc(d.localidad)}"><div class="kicker">Antes de pedir asistencia en ${esc(d.localidad)}</div><h2>${esc(guide.title)} en ${esc(d.localidad)}, ${esc(d.provincia)}</h2><p>${esc(intro)}</p><p>${esc(context)}</p><h3>${esc(guide.question)}</h3><p>${esc(guide.detail)}</p><p>Al solicitar la revisión, indica la dirección de ${esc(d.localidad)}, si se trata de vivienda o comunidad y el síntoma observado. La disponibilidad se confirma al contactar.</p>${nearby.length?`<nav aria-label="Municipios relacionados de ${esc(d.provincia)}"><strong>Otras localidades de la zona:</strong> ${nearby.map(x=>`<a href="/${province}/${x.slug}/">Antenista en ${esc(x.localidad)}</a>`).join(' · ')}</nav>`:''}</section>`;
  if(!html.includes('</main>'))throw Error('Sin main: '+file);
  html=html.replace('</main>',htmlBlock+'</main>');
  fs.writeFileSync(file,html);
  done++;
 }
}
console.log('REFUERZO LOCAL SELECTIVO OK: '+done+' páginas municipales; títulos y canónicas intactos; información local existente reutilizada.');
