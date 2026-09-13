import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('src/localidades.json','utf8'));
const bad=[/\bred seo\b/i,/\bmalla territorial\b/i,/\barquitectura interna\b/i,/\benlazado (?:interno|local|territorial)\b/i,/\bp[aá]ginas? municipales?\b/i,/\bcontexto geogr[aá]fico\b/i,/\brelevancia geogr[aá]fica\b/i,/\bpara usuarios y buscadores\b/i,/\brespond(?:a|er) a b[uú]squedas locales\b/i,/\bmantiene cada url\b/i,/\bla url\b/i,/\bestructura provincial\b/i];
const fields=['descripcion','introLocal','zonaLocal','faqPregunta','faqRespuesta'];
const errors=[];
for(const d of data){for(const f of fields){const v=String(d[f]||'');for(const re of bad)if(re.test(v))errors.push(`${d.provinciaSlug}/${d.slug}: ${f} contiene jerga interna (${re})`)}}
if(errors.length){console.error(`CONTENIDO INTERNO FILTRADO (${errors.length})`);for(const e of errors.slice(0,200))console.error('- '+e);process.exit(1)}
console.log(`Contenido visible limpio: ${data.length} localidades sin jerga SEO interna.`);
