const hash=s=>[...String(s)].reduce((a,c)=>(a*33+c.charCodeAt(0))>>>0,5381);
const pick=(arr,key,salt='')=>arr[hash(`${key}|${salt}`)%arr.length];

const desc=[
 n=>`Antenista en ${n} para reparación e instalación de antenas TDT, parabólicas, amplificación, porteros automáticos y videoporteros. 641 589 394.`,
 n=>`Técnico de antenas en ${n} para averías de TDT, antenas colectivas, parabólicas, amplificadores, porteros y videoporteros. 641 589 394.`,
 n=>`Técnico antenista en ${n} para reparar señal TDT, antenas individuales y colectivas, parabólicas, amplificación y videoporteros. 641 589 394.`,
 n=>`Antenista en ${n} para problemas de señal, TDT, parabólicas, cabeceras, amplificación, porteros automáticos y videoporteros. 641 589 394.`
];

const intros=[
 n=>`En ${n} revisamos averías de televisión en viviendas y comunidades, desde canales que desaparecen o señal TDT inestable hasta fallos de amplificación, distribución y cableado. También trabajamos con parabólicas y con sistemas de portero automático y videoportero.`,
 n=>`En ${n} atendemos instalaciones individuales y colectivas de antena, comprobando recepción TDT, amplificadores, repartidores, derivadores, cable coaxial y tomas. El servicio incluye además parabólicas, porteros automáticos y videoporteros.`,
 n=>`En ${n} realizamos diagnóstico, reparación e instalación de antenas TDT y parabólicas. Antes de sustituir equipos comprobamos señal, alimentación, amplificación y distribución, y también revisamos placas, telefonillos, monitores y cableado de porteros y videoporteros.`,
 n=>`En ${n} trabajamos sobre antenas individuales y colectivas para localizar pérdidas de señal, pixelaciones y problemas de reparto. Revisamos también cabeceras y amplificación, instalaciones de satélite y averías de portero automático o videoportero.`,
 n=>`En ${n} damos servicio técnico para TDT, antenas colectivas, parabólicas y amplificación. Seguimos la señal desde la recepción hasta las tomas para localizar el punto de fallo y atendemos igualmente reparación o renovación de porteros y videoporteros.`,
 n=>`En ${n} revisamos instalaciones de televisión y acceso en viviendas y comunidades. El diagnóstico puede incluir antena, cabecera, fuentes, amplificadores, distribución, cableado, parabólica, placa de calle, telefonillos y monitores de videoportero.`
];

const faq=[
 [n=>`¿Qué comprobáis si faltan canales o la TDT se corta en ${n}?`, `Medimos nivel y calidad de señal y revisamos recepción, amplificación, cableado, repartidores, derivadores y tomas para localizar dónde se degrada la instalación antes de sustituir equipos.`],
 [n=>`¿Reparáis antenas colectivas y cabeceras en comunidades de ${n}?`, `Sí. Comprobamos señal de entrada, fuentes, módulos o centrales, amplificación y distribución para saber si la avería afecta a toda la comunidad o solo a una parte.`],
 [n=>`¿Podéis revisar una parabólica con poca señal en ${n}?`, `Sí. Revisamos orientación, fijación, LNB, conectores y cableado y medimos la señal para decidir si basta con ajustar, reparar o sustituir algún elemento.`],
 [n=>`¿Revisáis amplificadores de antena antes de cambiarlos en ${n}?`, `Sí. Comprobamos alimentación, señal de entrada y salida, conexiones y red de distribución para confirmar si el amplificador es realmente el origen de la avería.`],
 [n=>`¿Atendéis porteros automáticos y videoporteros en ${n}?`, `Sí. Revisamos placa, pulsadores, fuente de alimentación, telefonillos o monitores y cableado para distinguir entre una avería reparable y una instalación que conviene renovar.`],
 [n=>`¿Qué hacéis si solo algunas viviendas tienen mala señal en ${n}?`, `Seguimos la distribución por ramas y comprobamos derivadores, repartidores, cableado y tomas. Así podemos separar un problema general de cabecera de una avería localizada.`],
 [n=>`¿Revisáis una instalación antigua antes de proponer una nueva en ${n}?`, `Sí. Primero medimos la señal y comprobamos antena, amplificación, fuentes, conectores y distribución. Si la instalación puede recuperarse con ajuste o reparación, no es necesario sustituirla completa.`],
 [n=>`¿Trabajáis tanto con antenas individuales como colectivas en ${n}?`, `Sí. Atendemos viviendas y comunidades y adaptamos el diagnóstico a cada instalación, desde recepción y orientación hasta amplificación, distribución y tomas finales.`]
];

export function buildGipuzkoaSeo(d){
  const n=d.localidad,c=d.comarca,near=d.cercanas||[],key=`${d.slug}|${c}`;
  const links=near.length>1?`${near.slice(0,-1).join(', ')} y ${near.at(-1)}`:(near[0]||c);
  const pair=pick(faq,key,'faq');
  const zonaVariants=[
    `${n} forma parte de ${c} y la página se enlaza con ${links}. Esta relación territorial ayuda a conectar búsquedas de servicio técnico entre municipios próximos sin introducir zonas que no correspondan al entorno local.`,
    `Dentro de ${c}, ${n} se relaciona principalmente con ${links}. El enlazado interno sigue esa proximidad geográfica para reforzar una estructura provincial clara y útil para usuarios y buscadores.`,
    `La cobertura de ${n} se organiza dentro de ${c} y mantiene enlaces con ${links}. Así cada página municipal conserva contexto propio y una red local coherente dentro de Gipuzkoa.`,
    `${n} queda integrada en la estructura de ${c}, conectada con ${links}. La navegación entre estas localidades refuerza la relevancia geográfica de la página sin recurrir a relaciones territoriales artificiales.`
  ];
  return {
    descripcion:pick(desc,key,'desc')(n),
    introLocal:pick(intros,key,'intro')(n),
    zonaLocal:pick(zonaVariants,key,'zona'),
    faqPregunta:pair[0](n),
    faqRespuesta:pair[1],
    seoOrigen:'gipuzkoa-local-v1'
  };
}
