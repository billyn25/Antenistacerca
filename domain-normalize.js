import fs from 'node:fs';
import path from 'node:path';

const ROOT='public';
const FROM='https://www.antenistacerca.es';
const TO='https://antenistacerca.es';

const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
if(!fs.existsSync(ROOT))throw new Error('Domain normalize: falta public/');
const files=walk(ROOT).filter(f=>f.endsWith('.html')||f.endsWith('sitemap.xml')||f.endsWith('robots.txt'));
let changed=0;
for(const file of files){
  const before=fs.readFileSync(file,'utf8');
  const after=before.split(FROM).join(TO);
  if(after!==before){fs.writeFileSync(file,after);changed++;}
}
const sitemap=fs.readFileSync(path.join(ROOT,'sitemap.xml'),'utf8');
const robots=fs.readFileSync(path.join(ROOT,'robots.txt'),'utf8');
if(sitemap.includes(FROM)||robots.includes(FROM))throw new Error('Domain normalize: quedan referencias www en sitemap/robots');
if(!sitemap.includes(`${TO}/`))throw new Error('Domain normalize: sitemap no usa dominio principal');
if(!robots.includes(`Sitemap: ${TO}/sitemap.xml`))throw new Error('Domain normalize: robots no apunta al sitemap principal');
for(const f of walk(ROOT).filter(x=>x.endsWith('.html'))){const h=fs.readFileSync(f,'utf8');if(h.includes(FROM))throw new Error(`Domain normalize: queda www en ${f}`)}
console.log(`Dominio canónico normalizado a ${TO}: ${changed} archivos actualizados.`);
