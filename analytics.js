import fs from 'node:fs';
import path from 'node:path';
const ROOT='public';
const ID='G-W8L23NJLP6';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const tag=`<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${ID}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ID}');</script>\n<script id="antenistacerca-conversions">document.addEventListener('click',function(e){const a=e.target.closest('a[href]');if(!a||typeof gtag!=='function')return;const href=a.getAttribute('href')||'';if(href.startsWith('tel:'))gtag('event','click_llamada',{event_category:'contacto',link_url:href});else if(/(?:wa\.me|whatsapp\.com)/i.test(href))gtag('event','click_whatsapp',{event_category:'contacto',link_url:href});});</script>`;
const files=walk(ROOT).filter(f=>f.endsWith('.html'));let changed=0;
for(const f of files){let h=fs.readFileSync(f,'utf8');if(h.includes(ID))continue;if(!/<head[^>]*>/i.test(h))throw new Error(`Analytics: falta head en ${f}`);h=h.replace(/<head([^>]*)>/i,`<head$1>\n${tag}`);fs.writeFileSync(f,h);changed++;}
console.log(`GA4 ${ID} integrado en ${files.length} páginas (${changed} actualizadas); eventos click_llamada y click_whatsapp activos.`);
