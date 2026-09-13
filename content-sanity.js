import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('src/localidades.json','utf8'));
const bad=[/\bseo\b/i,/\burl\b/i,/buscadores?/i,/arquitectura/i,/enlazad[oa]/i,/autoridad/i,/sem[aá]ntic/i,/\bmalla\b/i,/p[aá]gin(?:a|as)\b/i,/navegaci[oó]n/i,/relevancia (?:local|geogr[aá]fica)/i,/contexto geogr[aá]fico/i,/\bestructura\b/i,/reforzar b[uú]squedas/i,/\bb[uú]squedas?\b/i];
const fields=['descripcion','introLocal','zonaLocal','faqPregunta','faqRespuesta'];
const errors=[];
for(const d of data){for(const f of fields){const v=String(d[f]||'');for(const re of bad)if(re.test(v))errors.push(`${d.provinciaSlug}/${d.slug}: ${f} contiene jerga interna (${re})`)}}
if(errors.length){console.error(`CONTENIDO INTERNO FILTRADO (${errors.length})`);for(const e of errors.slice(0,200))console.error('- '+e);process.exit(1)}
console.log(`Contenido visible limpio: ${data.length} localidades sin jerga SEO interna.`);
