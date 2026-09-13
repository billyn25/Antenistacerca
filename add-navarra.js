import fs from 'node:fs';
import { buildNavarraSeo } from './seo-navarra-auto.js';
const BASE='src/localidades.json';
const BATCH='src/localidades-navarra-1.json';
const raw=JSON.parse(fs.readFileSync(BASE,'utf8'));
const batch=JSON.parse(fs.readFileSync(BATCH,'utf8'));
if(batch.length!==60) throw new Error(`Navarra fase 1 incompleta: esperados 60 municipios y hay ${batch.length}`);
const required=['provincia','provinciaSlug','localidad','slug','comarca','cercanas'];
const seenBatch=new Set();
for(const d of batch){for(const field of required)if(d[field]===undefined||d[field]===null||d[field]==='')throw new Error(`Navarra ${d.slug||d.localidad||'?'}: falta ${field}`);if(d.provinciaSlug!=='navarra')throw new Error(`Navarra ${d.slug}: provinciaSlug incorrecto`);const key=`navarra/${d.slug}`;if(seenBatch.has(key))throw new Error(`Navarra fase 1 duplicada: ${key}`);seenBatch.add(key)}
const existing=new Set(raw.map(d=>`${d.provinciaSlug||'bizkaia'}/${d.slug}`));let added=0;
for(const d of batch){const key=`navarra/${d.slug}`;if(existing.has(key))continue;raw.push({...d,...buildNavarraSeo(d),seoOrigen:'navarra-local-v1'});existing.add(key);added++}
fs.writeFileSync(BASE,JSON.stringify(raw,null,2)+'\n');console.log(`Navarra fase 1: ${batch.length} municipios preparados; ${added} añadidos al origen del build.`);
