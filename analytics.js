import fs from 'node:fs';
import path from 'node:path';
const ROOT='public';
const ID='G-W8L23NJLP6';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const gaLoader=`<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${ID}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ID}');</script>`;
const conversionScript=`<script id="antenistacerca-conversions">(()=>{const isWhatsApp=href=>/(?:^whatsapp:|wa\\.me|(?:api\\.|web\\.)?whatsapp\\.com)/i.test(href||'');const send=(name,href)=>{if(typeof window.gtag!=='function')return;window.gtag('event',name,{event_category:'contacto',link_url:href,page_location:location.href,transport_type:'beacon'});};document.addEventListener('click',function(e){const el=e.target instanceof Element?e.target:null;const a=el&&el.closest('a[href]');if(!a)return;const href=(a.getAttribute('href')||'').trim();if(/^tel:/i.test(href))send('click_llamada',href);else if(isWhatsApp(href))send('click_whatsapp',href);},true);})();</script>`;
const files=walk(ROOT).filter(f=>f.endsWith('.html'));let changed=0,whatsappLinks=0,phoneLinks=0;
for(const f of files){let h=fs.readFileSync(f,'utf8');if(!/<head[^>]*>/i.test(h))throw new Error(`Analytics: falta head en ${f}`);
  h=h.replace(/<!-- Google tag \(gtag\.js\) -->[\s\S]*?<script>window\.dataLayer[\s\S]*?<\/script>\s*/i,'');
  h=h.replace(/<script id=["']antenistacerca-conversions["']>[\s\S]*?<\/script>\s*/i,'');
  h=h.replace(/<head([^>]*)>/i,`<head$1>\n${gaLoader}\n${conversionScript}`);
  const hrefs=[...h.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
  for(const href of hrefs){if(/^tel:/i.test(href))phoneLinks++;if(/(?:^whatsapp:|wa\.me|(?:api\.|web\.)?whatsapp\.com)/i.test(href))whatsappLinks++;}
  fs.writeFileSync(f,h);changed++;
}
const cabrejas=path.join(ROOT,'soria','cabrejas-del-pinar','index.html');if(!fs.existsSync(cabrejas))throw new Error('Analytics: falta Cabrejas del Pinar');const cab=fs.readFileSync(cabrejas,'utf8');if(!cab.includes(ID)||!/(?:wa\.me|whatsapp\.com|whatsapp:)/i.test(cab))throw new Error('Analytics: Cabrejas del Pinar sin GA4 o WhatsApp');
if(!whatsappLinks)throw new Error('Analytics: no se encontraron enlaces de WhatsApp');
console.log(`GA4 ${ID} integrado en ${files.length} páginas; ${phoneLinks} enlaces de llamada y ${whatsappLinks} enlaces WhatsApp auditados. Eventos con beacon/capture activos.`);
