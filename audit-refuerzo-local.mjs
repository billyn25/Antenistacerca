import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with {type:'json'};
const root='public';
const pairs=[['toledo','paredes-de-escalona'],['toledo','pelahustan'],['segovia','san-cristobal-de-cuellar'],['segovia','torreiglesias'],['navarra','castejon'],['navarra','tudela'],['la-rioja','brinas'],['la-rioja','pradillo'],['palencia','arconada'],['palencia','cevico-navero'],['palencia','capillas'],['leon','quintana-y-congosto'],['leon','villaobispo-de-otero'],['salamanca','la-pena'],['salamanca','mieza'],['soria','la-losilla'],['soria','san-felices'],['burgos','sotragero']];
const failures=[];
for(const [province,slug] of pairs){
 const d=localidades.find(x=>x.provinciaSlug===province&&x.slug===slug);
 const file=path.join(root,province,slug,'index.html');
 if(!d||!fs.existsSync(file)){failures.push(province+'/'+slug+': ausente');continue}
 const html=fs.readFileSync(file,'utf8');
 const section=html.match(/<section[^>]+id="orientacion-local-especifica"[\s\S]*?<\/section>/)?.[0]||'';
 if(!section.includes(d.localidad))failures.push(province+'/'+slug+': falta contexto municipal');
 if(!section.includes('Al solicitar la revisión'))failures.push(province+'/'+slug+': falta consejo práctico');
 if((html.match(/id="orientacion-local-especifica"/g)||[]).length!==1)failures.push(province+'/'+slug+': sección duplicada');
 if(!html.includes('https://antenistacerca.es/'+province+'/'+slug+'/'))failures.push(province+'/'+slug+': canonical esperado ausente');
 if(!/meta name="robots" content="index,follow/.test(html)&&process.argv.includes('production'))failures.push(province+'/'+slug+': robots incorrecto');
}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('AUDITORÍA REFUERZO LOCAL OK: 18 municipios con sección única, contexto local y URL canónica preservada.');
