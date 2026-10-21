import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {auditHtml,region} from './regional-contact.mjs';
const CSS=fs.readFileSync('src/assets/modern-footer.css','utf8');
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const withoutFooter=h=>h.replace(/<footer\b[\s\S]*?<\/footer>/,'').replace(/<style id="ac-modern-footer-css">[\s\S]*?<\/style>/,'');
export function modernFooter(html,route,province=''){
 if(html.includes('class="ac-modern-footer"'))return html;
 const old=html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];assert.ok(old,'Falta pie original');
 const legal=old.match(/<!-- AC-COOKIE-FOOTER-START -->[\s\S]*?<!-- AC-COOKIE-FOOTER-END -->/)?.[0]||'';
 const directory=old.match(/<details class="ac-contact-directory">[\s\S]*?<\/details>/)?.[0];assert.ok(directory,'Falta directorio regional plegado');
 const scripts=[...old.replace(legal,'').matchAll(/<script\b[\s\S]*?<\/script>/g)].map(m=>m[0]).join('');
 const slug=route.split('/').filter(Boolean)[0];const zone=region(route)?'Madrid · Guadalajara · Toledo':'Zona norte · Castilla y León';
 const localLink=province?`<a href="/${slug}/">Pueblos de ${e(province)}</a>`:'<a href="/#zonas">Busca tu localidad</a>';
 const next=`<footer class="ac-modern-footer"><div class="ac-foot-wrap"><div class="ac-foot-hero"><div><span class="ac-foot-eyebrow">Antenista Cerca · Trato directo</span><h2>Cuéntanos qué falla.<br>Vamos al detalle.</h2><p>Antenas, televisión y accesos. Prepara tu consulta con la ubicación y los síntomas para estudiar el siguiente paso.</p></div><a class="ac-foot-cta" href="#ac-consulta">Preparar mi consulta <span aria-hidden="true">↗</span></a></div><div class="ac-foot-grid"><div class="ac-foot-brand"><a href="/" aria-label="Antenista Cerca, inicio"><img src="/assets/logo-antenista-cerca-v1.webp" width="440" height="147" loading="lazy" decoding="async" alt="Antenista Cerca"></a><p>Instalación, reparación y mantenimiento para viviendas, comunidades y negocios. Disponibilidad y condiciones al contactar.</p><span class="ac-foot-location">${e(province||zone)}</span></div><nav aria-label="Servicios en el pie"><h3>Para tu instalación</h3><div class="ac-foot-links"><a href="/#servicios">Antenas y porteros</a><a href="/#television-hoteles">Televisión para alojamientos</a><a href="/#iptv-hoteles">IPTV y redes de televisión</a><a href="/#centrales-monocanal">Cabeceras y amplificación</a></div></nav><nav aria-label="Orientación y localidades"><h3>Encuentra lo que necesitas</h3><div class="ac-foot-links">${localLink}<a href="/#antenas-eventos">Instalaciones para eventos</a><a href="/#proyectos-ict">Proyectos de obra nueva ICT</a><a href="#ac-consulta">Preparar una consulta</a></div></nav></div>${directory}${legal}<div class="ac-foot-bottom"><span>ANTENISTA CERCA · Antenas, televisión y accesos</span><a href="/">Volver al inicio ↗</a></div></div>${scripts}</footer>`;
 const result=html.replace(old,next).replace('</head>',`<style id="ac-modern-footer-css">${CSS}</style></head>`);
 assert.equal(withoutFooter(result),withoutFooter(html),'El diseño del pie altera el resto de la página');
 if(legal)assert.ok(result.includes(legal),'Información legal alterada');
 auditHtml(result,route);return result;
}
export function applyModernFooter(root='public'){
 const towns=JSON.parse(fs.readFileSync('src/localidades.json','utf8'));const provinces=new Map(towns.map(t=>[t.provinciaSlug,t.provincia]));let count=0;
 const visit=dir=>{for(const x of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,x.name);if(x.isDirectory())visit(f);else if(x.name.endsWith('.html')){const h=fs.readFileSync(f,'utf8'),url=h.match(/rel="canonical"[^>]*href="([^"]+)"/)?.[1];if(!url)continue;const route=new URL(url).pathname;fs.writeFileSync(f,modernFooter(h,route,provinces.get(route.split('/')[1])||''));count++;}}};visit(root);console.log(`PIE MODERNO OK: ${count} páginas; información legal, contactos regionales y barra móvil conservados.`);return count;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)applyModernFooter();
