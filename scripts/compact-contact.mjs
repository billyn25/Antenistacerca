import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {auditHtml} from './regional-contact.mjs';
const STYLE='<style id="ac-compact-contact-style">.twocol>aside.sidebox,.detail>aside.help,.detail>aside.sidebox,.zone>aside.sidebox{align-self:start}footer .ac-contact-directory{max-width:1120px;width:calc(100% - 32px);margin:0 auto 20px;color:#fff}footer .ac-contact-directory>summary{padding:14px 0;min-height:44px;font-weight:700;cursor:pointer}footer .ac-contact-directory .regional-contact{width:100%;margin-bottom:0}</style>';
const important=h=>[h.match(/<header\b[\s\S]*?<\/header>/)?.[0],h.match(/<section class="hero[^\"]*"[\s\S]*?<\/section>/)?.[0],h.match(/<div class="mobilebar"[\s\S]*?<\/div>/)?.[0],...[...h.matchAll(/<link\b[^>]*rel="canonical"[^>]*>|<meta\b[^>]*name="robots"[^>]*>|<h1\b[\s\S]*?<\/h1>|<img\b[^>]*>|<script\b[\s\S]*?<\/script>/g)].map(m=>m[0])];
export function compact(html){
 if(html.includes('id="ac-compact-contact-style"'))return html;
 const before=important(html);
 html=html.replace(/<aside\b[^>]*class="help"[^>]*>[\s\S]*?<\/aside>/g,b=>b.replace(/<a\b[^>]*href="(?:tel:|https:\/\/wa\.me\/)[^"]*"[^>]*>[\s\S]*?<\/a>/g,''));
 html=html.replace(/ El teléfono de contacto es <a\b[^>]*href="tel:[^"]*"[^>]*>[^<]*<\/a>\./g,'');
 html=html.replace(/<div class="(?:town-problems-cta|town-trust-actions)">[\s\S]*?<\/div>/g,'');
 html=html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/g,footer=>footer.replace(/<section\b[^>]*data-regional-contact="v1"[^>]*>[\s\S]*?<\/section>/,panel=>'<details class="ac-contact-directory"><summary>Contactos por zona</summary>'+panel+'</details>'));
 html=html.replace('</head>',STYLE+'</head>');
 assert.deepEqual(important(html),before,'La limpieza no puede alterar cabecera, hero, barra móvil, fotos, scripts ni metadatos');
 return html;
}
export function applyCompactContacts(root='public'){
 let count=0;const visit=dir=>{for(const x of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,x.name);if(x.isDirectory())visit(f);else if(x.name.endsWith('.html')){const h=fs.readFileSync(f,'utf8');const route=h.match(/rel="canonical"[^>]*href="([^"]+)"/)?.[1];if(!route)continue;const after=compact(h);auditHtml(after,new URL(route).pathname);fs.writeFileSync(f,after);count++;}}};visit(root);console.log(`CONTACTO COMPACTO OK: ${count} páginas; llamadas intermedias retiradas, directorio de zonas plegado y barra móvil preservada.`);return count;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)applyCompactContacts();
