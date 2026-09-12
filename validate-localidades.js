import localidades from './src/localidades.json' with { type: 'json' };

const errors=[];
const warnings=[];
const required=['provincia','provinciaSlug','localidad','slug','comarca','descripcion','introLocal','zonaLocal','faqPregunta','faqRespuesta','cercanas'];
const slugRe=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const seenTown=new Map();
const seenPath=new Map();
const byName=new Map(localidades.map((d,i)=>[String(d.localidad||'').toLowerCase(),i]));

for(let i=0;i<localidades.length;i++){
  const d=localidades[i];
  const label=d.localidad||`fila ${i+1}`;
  for(const key of required){
    const v=d[key];
    if(v==null||(typeof v==='string'&&!v.trim())||(Array.isArray(v)&&!v.length)) errors.push(`${label}: falta ${key}`);
  }
  if(d.slug&&!slugRe.test(d.slug)) errors.push(`${label}: slug inválido (${d.slug})`);
  if(d.provinciaSlug&&!slugRe.test(d.provinciaSlug)) errors.push(`${label}: provinciaSlug inválido (${d.provinciaSlug})`);
  const townKey=String(d.localidad||'').trim().toLowerCase();
  if(townKey){
    if(seenTown.has(townKey)) errors.push(`${label}: localidad duplicada con ${seenTown.get(townKey)}`);
    else seenTown.set(townKey,label);
  }
  const pathKey=`${d.provinciaSlug||''}/${d.slug||''}`;
  if(seenPath.has(pathKey)) errors.push(`${label}: ruta duplicada con ${seenPath.get(pathKey)} (${pathKey})`);
  else seenPath.set(pathKey,label);
  if(!Array.isArray(d.cercanas)) errors.push(`${label}: cercanas debe ser un array`);
  else {
    const localSeen=new Set();
    for(const c of d.cercanas){
      const ck=String(c).trim().toLowerCase();
      if(!ck) errors.push(`${label}: cercana vacía`);
      if(ck===townKey) errors.push(`${label}: aparece como cercana de sí misma`);
      if(localSeen.has(ck)) errors.push(`${label}: cercana duplicada (${c})`);
      localSeen.add(ck);
      if(!byName.has(ck)) warnings.push(`${label}: cercana aún no generada (${c})`);
    }
  }
  if(String(d.descripcion||'').length<100) warnings.push(`${label}: descripción SEO corta`);
  if(String(d.introLocal||'').length<140) warnings.push(`${label}: introLocal corta`);
  if(String(d.zonaLocal||'').length<120) warnings.push(`${label}: zonaLocal corta`);
  if(String(d.faqRespuesta||'').length<100) warnings.push(`${label}: faqRespuesta corta`);
}

if(warnings.length){
  console.warn(`LOCALIDADES AVISOS (${warnings.length})`);
  for(const w of warnings) console.warn('- '+w);
}
if(errors.length){
  console.error(`LOCALIDADES FALLIDO (${errors.length})`);
  for(const e of errors) console.error('- '+e);
  process.exit(1);
}
console.log(`LOCALIDADES OK: ${localidades.length} registros válidos. Añadir nuevas localidades solo requiere editar src/localidades.json.`);
