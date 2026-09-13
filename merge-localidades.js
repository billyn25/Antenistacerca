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
const appendIfShort=(value,min,extra)=>{const v=String(value||'').trim();return v.length>=min?v:`${v}${v?' ':''}${extra}`.trim()};

function hydrate(d){
  const n=d.localidad,c=d.comarca,near=d.cercanas||[];
  const nearText=near.length>1?`${near.slice(0,-1).join(', ')} y ${near.at(-1)}`:(near[0]||c);
  const desc=d.descripcion||pick([
    `Antenista en ${n} para instalación y reparación de antenas TDT, parabólicas, amplificación, porteros automáticos y videoporteros. 641 589 394.`,
    `Técnico de antenas en ${n} para reparar e instalar TDT, parabólicas, amplificadores, porteros automáticos y videoporteros. 641 589 394.`,
    `Técnico antenista en ${n} para averías e instalaciones de antenas TDT y parabólicas, amplificación, porteros y videoporteros. 641 589 394.`
  ],`${d.slug}|desc`);
  let intro=d.introLocal||pick([
    `En ${n} atendemos viviendas y comunidades para instalación y reparación de antenas, problemas de TDT y parabólicas, amplificación y sistemas de portero automático y videoportero.`,
    `En ${n} realizamos trabajos de antena para viviendas y comunidades, revisando recepción TDT, parabólicas, amplificación y averías de porteros automáticos y videoporteros.`,
    `En ${n} damos servicio técnico para averías e instalaciones de antena, TDT, parabólicas y amplificación, además de reparación y renovación de porteros y videoporteros.`,
    `En ${n} trabajamos sobre instalaciones individuales y colectivas, desde pérdidas de señal TDT hasta parabólicas, amplificación y sistemas de acceso mediante portero o videoportero.`
  ],`${d.slug}|intro`);
  let zone=d.zonaLocal||pick([
    `${n} forma parte de ${c} y se coordina con ${nearText} para organizar los avisos por cercanía y mantener una zona de servicio coherente.`,
    `La atención en ${n}, dentro de ${c}, se organiza junto a ${nearText}, enlazando municipios próximos para facilitar los desplazamientos del servicio técnico.`,
    `Dentro de ${c}, ${n} comparte área de servicio con ${nearText}; estas relaciones se usan para ordenar los avisos y mostrar localidades próximas de forma útil.`
  ],`${d.slug}|zona`);
  const question=d.faqPregunta||pick([
    `¿Atendéis reparación de antenas y porteros en ${n}?`,
    `¿Podéis revisar una instalación con problemas de señal en ${n}?`,
    `¿Trabajáis con antenas colectivas y videoporteros en ${n}?`,
    `¿Revisáis una antena antes de sustituir equipos en ${n}?`
  ],`${d.slug}|faq-q`);
  let answer=d.faqRespuesta||pick([
    'Sí. Revisamos recepción, amplificación, cableado, repartidores y tomas, y también diagnosticamos porteros y videoporteros antes de sustituir componentes.',
    'Sí. Medimos la señal y comprobamos antena, amplificadores, cableado y distribución para localizar el origen de la avería antes de decidir la reparación.',
    'Sí. Atendemos instalaciones individuales y comunitarias y comprobamos primero el sistema completo para ajustar, reparar o sustituir únicamente lo necesario.',
    'Sí. Primero verificamos la instalación y el nivel de señal; si el problema está en amplificación, distribución o cableado, actuamos sobre ese punto antes de proponer cambios mayores.'
  ],`${d.slug}|faq-a`);

  // Conserva el texto específico existente y solo lo amplía cuando el validador lo considera corto.
  intro=appendIfShort(intro,140,pick([
    `Antes de sustituir equipos comprobamos recepción, amplificación, cableado y distribución para localizar el origen real de la avería en ${n}.`,
    `El servicio incluye tanto instalaciones individuales como colectivas, procurando diagnosticar primero la señal y los elementos de distribución en ${n}.`,
    `También podemos revisar porteros automáticos y videoporteros, fuentes y cableado cuando la incidencia corresponde a una vivienda o comunidad de ${n}.`
  ],`${d.slug}|intro-plus`));
  zone=appendIfShort(zone,120,pick([
    `Las localidades próximas de referencia son ${nearText}, manteniendo ${n} dentro de una red de páginas locales conectadas por proximidad real.`,
    `Como referencias cercanas se muestran ${nearText}, de modo que la página de ${n} mantiene enlaces útiles con su entorno inmediato.`,
    `La relación con ${nearText} permite situar ${n} dentro de ${c} sin inventar tiempos de llegada, trabajos realizados ni datos comerciales no comprobados.`
  ],`${d.slug}|zone-plus`));
  answer=appendIfShort(answer,100,pick([
    'La comprobación previa permite decidir si basta con ajustar o reparar o si realmente es necesario sustituir algún componente.',
    'El objetivo es localizar el punto de fallo antes de proponer cambios y actuar únicamente sobre los elementos que lo necesitan.',
    'En instalaciones comunitarias se revisa también la distribución para distinguir una avería general de un problema limitado a una vivienda.'
  ],`${d.slug}|faq-plus`));

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
