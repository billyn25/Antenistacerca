import fs from 'node:fs';

const BASE='src/localidades.json';
const EXTRAS=[
  'src/localidades-mungialdea.json',
  'src/localidades-uribe-kosta.json',
  'src/localidades-durangaldea-extra.json',
  'src/localidades-enkarterri.json',
  'src/localidades-metro-bizkaia.json',
  'src/localidades-busturialdea.json',
  'src/localidades-lea-artibai.json'
];

const hash=s=>[...String(s)].reduce((a,c)=>(a*33+c.charCodeAt(0))>>>0,5381);
const pick=(arr,key)=>arr[hash(key)%arr.length];

function hydrate(d){
  if(d.descripcion&&d.introLocal&&d.zonaLocal&&d.faqPregunta&&d.faqRespuesta)return d;
  const n=d.localidad,c=d.comarca,near=d.cercanas||[];
  const nearText=near.length>1?`${near.slice(0,-1).join(', ')} y ${near.at(-1)}`:(near[0]||c);
  const desc=pick([
    `Antenista en ${n} para instalación y reparación de antenas TDT, parabólicas, amplificación, porteros automáticos y videoporteros. 641 589 394.`,
    `Técnico de antenas en ${n} para reparar e instalar TDT, parabólicas, amplificadores, porteros automáticos y videoporteros. 641 589 394.`,
    `Técnico antenista en ${n} para averías e instalaciones de antenas TDT y parabólicas, amplificación, porteros y videoporteros. 641 589 394.`
  ],`${d.slug}|desc`);
  const intro=pick([
    `En ${n} atendemos viviendas y comunidades para instalación y reparación de antenas, problemas de TDT y parabólicas, amplificación y sistemas de portero automático y videoportero.`,
    `En ${n} realizamos trabajos de antena para viviendas y comunidades, revisando recepción TDT, parabólicas, amplificación y averías de porteros automáticos y videoporteros.`,
    `En ${n} damos servicio técnico para averías e instalaciones de antena, TDT, parabólicas y amplificación, además de reparación y renovación de porteros y videoporteros.`,
    `En ${n} trabajamos sobre instalaciones individuales y colectivas, desde pérdidas de señal TDT hasta parabólicas, amplificación y sistemas de acceso mediante portero o videoportero.`
  ],`${d.slug}|intro`);
  const zone=pick([
    `${n} forma parte de ${c} y se coordina con ${nearText} para organizar los avisos por cercanía y mantener una zona de servicio coherente.`,
    `La atención en ${n}, dentro de ${c}, se organiza junto a ${nearText}, enlazando municipios próximos para facilitar los desplazamientos del servicio técnico.`,
    `Dentro de ${c}, ${n} comparte área de servicio con ${nearText}; estas relaciones se usan para ordenar los avisos y mostrar localidades próximas de forma útil.`
  ],`${d.slug}|zona`);
  const question=pick([
    `¿Atendéis reparación de antenas y porteros en ${n}?`,
    `¿Podéis revisar una instalación con problemas de señal en ${n}?`,
    `¿Trabajáis con antenas colectivas y videoporteros en ${n}?`,
    `¿Revisáis una antena antes de sustituir equipos en ${n}?`
  ],`${d.slug}|faq-q`);
  const answer=pick([
    'Sí. Revisamos recepción, amplificación, cableado, repartidores y tomas, y también diagnosticamos porteros y videoporteros antes de sustituir componentes.',
    'Sí. Medimos la señal y comprobamos antena, amplificadores, cableado y distribución para localizar el origen de la avería antes de decidir la reparación.',
    'Sí. Atendemos instalaciones individuales y comunitarias y comprobamos primero el sistema completo para ajustar, reparar o sustituir únicamente lo necesario.',
    'Sí. Primero verificamos la instalación y el nivel de señal; si el problema está en amplificación, distribución o cableado, actuamos sobre ese punto antes de proponer cambios mayores.'
  ],`${d.slug}|faq-a`);
  return {provincia:'Bizkaia',provinciaSlug:'bizkaia',...d,descripcion:desc,introLocal:intro,zonaLocal:zone,faqPregunta:question,faqRespuesta:answer};
}

const base=JSON.parse(fs.readFileSync(BASE,'utf8')).map(hydrate);
let merged=[...base];
const seen=new Set(base.map(d=>`${d.provinciaSlug}/${d.slug}`));

for(const file of EXTRAS){
  if(!fs.existsSync(file)) continue;
  const extra=JSON.parse(fs.readFileSync(file,'utf8')).map(hydrate);
  for(const d of extra){
    const key=`${d.provinciaSlug}/${d.slug}`;
    if(seen.has(key)) throw new Error(`Localidad duplicada al combinar: ${key}`);
    seen.add(key);
    merged.push(d);
  }
}

fs.writeFileSync(BASE,JSON.stringify(merged,null,2)+'\n');
console.log(`Localidades combinadas: ${merged.length} (${EXTRAS.length} archivo(s) extra, sin duplicados).`);
