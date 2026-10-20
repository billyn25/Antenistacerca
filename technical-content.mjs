import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {antennaModels,terrestrial,headends,satellite,satelliteTdt} from './content/technical-diagnostics.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash=s=>createHash('sha256').update(s).digest().readUInt32BE(0);
const pick=(bank,key,salt)=>bank[hash(`${salt}|${key}`)%bank.length];
export function plan(d){
 const key=`${d.provinciaSlug}/${d.slug}`;
 const tdt=pick(terrestrial,key,'captacion'),amp=pick(headends,key,'cabecera'),sat=pick(satellite,key,'satelite');
 const another=(bank,selected,salt)=>pick(bank.filter(x=>x.id!==selected.id),key,salt);
 return {tdt,amp,sat,model:pick(antennaModels,key,'modelo'),tdtSat:pick(satelliteTdt,key,'tdt-sat'),others:[another(terrestrial,tdt,'otro-exterior'),another(headends,amp,'otra-distribucion'),another(satellite,sat,'otro-satelite')]};
}
function section(h,id,transform){
 let count=0;
 const re=new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?<\\/section>`,'g');
 const after=h.replace(re,b=>{count++;return transform(b)});
 assert.equal(count,1,`Se esperaba un único destino #${id}`);return after;
}
function firstParagraph(block,a,b,title){
 assert.ok(/<p\b[^>]*>[\s\S]*?<\/p>/.test(block),'Falta párrafo de servicio');
 return block.replace(/<p\b[^>]*>[\s\S]*?<\/p>/,`${title?`<h3>${esc(title)}</h3>`:''}<p>${esc(a)}</p><p>${esc(b)}</p>`);
}
function cardSummary(h,id,summary){
 const re=new RegExp(`(<a class="card" href="#${id}">[\\s\\S]*?<p>)[\\s\\S]*?(<\\/p>[\\s\\S]*?<\\/a>)`);
 assert.ok(re.test(h),`Falta tarjeta ${id}`);return h.replace(re,(_,a,b)=>a+esc(summary)+b);
}
const protectedParts=h=>({
 canonical:h.match(/<link\b[^>]*rel="canonical"[^>]*>/)?.[0],
 robots:h.match(/<meta\b[^>]*name="robots"[^>]*>/)?.[0],
 title:h.match(/<title>[\s\S]*?<\/title>/)?.[0],h1:h.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)?.[0],
 images:[...h.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]),
 hero:h.match(/<section class="hero[^\"]*"[\s\S]*?<\/section>/)?.[0],
 header:h.match(/<header\b[\s\S]*?<\/header>/)?.[0],footer:h.match(/<footer\b[\s\S]*?<\/footer>/)?.[0],
 contacts:[...h.matchAll(/href="(?:tel:|https:\/\/wa.me\/)[^"]*"/g)].map(m=>m[0]).sort(),
 scripts:[...h.matchAll(/<script\b[\s\S]*?<\/script>/g)].map(m=>m[0]),
 ids:[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]).sort()
});
export function enrich(h,d){
 const before=protectedParts(h),p=plan(d),n=esc(d.localidad);
 assert.ok(!h.includes('data-technical-content="v1"'),'Contenido técnico ya aplicado');
 h=section(h,'tdt',b=>{
  b=firstParagraph(b,p.tdt.symptom,p.tdt.check,p.tdt.title);
  const model=`<div class="antenna-choice"><h3>${esc(p.model.name)}: identificación y revisión del equipo</h3><p>${esc(p.model.text)}</p></div>`;
  // El bloque entra en la columna de texto y conserva el aside y todas las fotos.
  const marker=/<\/div>\s*<aside\b/;
  assert.ok(marker.test(b),'TDT sin columna de contenido');return b.replace(marker,m=>model+m);
 });
 h=section(h,'reparacion',b=>firstParagraph(b,p.amp.symptom,p.amp.check,p.amp.title));
 h=section(h,'parabolicas',b=>firstParagraph(b,p.sat.symptom,p.sat.check,p.sat.title));
 h=section(h,'tdt-satelite',b=>firstParagraph(b,p.tdtSat.text,p.tdtSat.detail));
 h=cardSummary(h,'tdt',`${p.tdt.title}. Revisión del punto de captación, calidad y recorrido de señal.`);
 h=cardSummary(h,'reparacion',`${p.amp.title}. Medición antes de ajustar o sustituir equipos.`);
 h=cardSummary(h,'parabolicas',`${p.sat.title}. Comprobación de recepción y distribución de satélite.`);
 h=section(h,'problemas-frecuentes',old=>{const cta=old.match(/<div class="town-problems-cta">[\s\S]*?<\/div>/)?.[0];assert.ok(cta,'Falta contacto técnico');return `<section class="town-problems" id="problemas-frecuentes" data-technical-content="v1"><div class="wrap"><div class="kicker">Otros avisos de antenas y satélite</div><h2>Qué podemos comprobar en tu instalación de ${n}</h2><p class="lead">Describe qué sucede y si afecta a una toma, a varios televisores o a toda la comunidad. Estos son otros supuestos de diagnóstico; la revisión se adapta al equipo y al síntoma real.</p><div class="town-problems-grid">${p.others.map(c=>`<article class="town-problem" data-diagnostic="${c.id}"><strong>${esc(c.title)}</strong><p>${esc(c.symptom)}</p><p>${esc(c.check)}</p></article>`).join('')}</div>${cta}</div></section>`;});
 // FAQ vinculada a los tres servicios desarrollados, sin repetir las tres respuestas genéricas.
 h=section(h,'faq',()=>`<section class="faq wrap" id="faq"><h2>Consultas de recepción y averías en ${n}</h2>${[p.tdt,p.amp,p.sat].map(c=>`<details><summary>${esc(c.question)}</summary><p>${esc(c.answer)}</p></details>`).join('')}</section>`);
 // No se modifica un solo destino, contacto, recurso visual ni metadato SEO.
 assert.deepEqual(protectedParts(h),before,`Cambio fuera del contenido técnico: ${d.provinciaSlug}/${d.slug}`);
 return h;
}
export function apply(root='public'){
 const towns=JSON.parse(fs.readFileSync('src/localidades.json','utf8'));
 const counts={},profiles=new Set();let changed=0;
 for(const d of towns){
  const file=path.join(root,d.provinciaSlug,d.slug,'index.html');
  const h=fs.readFileSync(file,'utf8');const after=enrich(h,d);
  const p=plan(d);for(const c of [p.tdt,p.amp,p.sat,...p.others,p.model,p.tdtSat])counts[c.id]=(counts[c.id]||0)+1;
  profiles.add([p.tdt.id,p.amp.id,p.sat.id,p.model.id,p.tdtSat.id,...p.others.map(x=>x.id)].join('|'));
  fs.writeFileSync(file,after);changed++;
 }
 fs.mkdirSync('.cache',{recursive:true});fs.writeFileSync('.cache/technical-content-report.json',JSON.stringify({towns:changed,profiles:profiles.size,counts},null,2));
 console.log(`CONTENIDO TÉCNICO OK: ${changed} municipios; ${profiles.size} combinaciones de diagnósticos; fotos, cabecera, menús, teléfonos y SEO preservados.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)apply();
