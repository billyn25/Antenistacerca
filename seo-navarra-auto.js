const hash=s=>[...String(s)].reduce((a,c)=>(a*33+c.charCodeAt(0))>>>0,5381);
const pick=(a,k)=>a[hash(k)%a.length];

export function buildNavarraSeo(d){
  const n=d.localidad,c=d.comarca,near=d.cercanas||[];
  const nearText=near.length>1?`${near.slice(0,-1).join(', ')} y ${near.at(-1)}`:(near[0]||c);
  const k=`navarra/${d.slug}`;
  const focus=pick([
    'recepción TDT y pérdida de canales',
    'reparación de antenas individuales y colectivas',
    'instalación y ajuste de antenas TDT',
    'antenas colectivas, cabeceras y distribución',
    'parabólicas, LNB y cableado de satélite',
    'amplificadores, derivadores y tomas de televisión',
    'porteros automáticos y videoporteros',
    'diagnóstico de señal antes de sustituir equipos'
  ],`${k}|focus`);

  const descripcion=pick([
    `Antenista en ${n} para TDT, parabólicas, antenas colectivas, amplificación, porteros y videoporteros.`,
    `Técnico de antenas en ${n} para averías de TDT, antenas colectivas, parabólicas, amplificadores y porteros.`,
    `Reparación de antenas en ${n}: señal TDT, cabeceras, amplificación, parabólicas, porteros y videoporteros.`,
    `Instalación de antena TDT en ${n}, reparación de señal, parabólicas, antenas comunitarias y videoporteros.`,
    `Servicio de antenista en ${n} para antenas TDT, colectivas, parabólicas, amplificación y porteros automáticos.`,
    `Antenas colectivas en ${n}: diagnóstico, cabeceras, distribución, TDT, parabólicas y sistemas de portero.`,
    `Técnico antenista en ${n} para falta de señal, amplificadores, cableado, TDT, parabólicas y videoporteros.`,
    `Antenista en ${n} para instalación, mantenimiento y reparación de televisión, satélite y porteros.`
  ],`${k}|desc`);

  const introLocal=pick([
    `En ${n} atendemos instalaciones de televisión en viviendas y comunidades, con especial atención a ${focus}. Revisamos también parabólicas y sistemas de portero automático o videoportero cuando la incidencia afecta al acceso del edificio o vivienda.`,
    `Para una avería de antena en ${n} comprobamos recepción, amplificación, cableado, repartidores, derivadores y tomas antes de decidir qué componente necesita intervención. El servicio incluye ${focus}, parabólicas y porteros.`,
    `En ${n} trabajamos sobre antenas individuales y colectivas. Medimos la señal y seguimos la instalación por etapas para localizar fallos de TDT, amplificación o distribución; además atendemos ${focus} y videoporteros.`,
    `El servicio técnico en ${n} cubre instalación y reparación de antenas, TDT y parabólicas, junto con ${focus}. En comunidades comprobamos primero si la avería es general o pertenece a una rama concreta.`,
    `Cuando aparecen cortes, pixelaciones o pérdida de canales en ${n}, no damos por hecho que la antena sea la causa. Revisamos captación, amplificación y red coaxial y completamos el servicio con ${focus}.`,
    `En ${n} realizamos diagnóstico técnico de antenas y sistemas de acceso. La revisión puede incluir nivel y calidad de señal, cabecera, amplificadores, cable coaxial, tomas, ${focus} y porteros o videoporteros.`,
    `Si necesitas instalar una antena TDT en ${n}, revisamos primero la ubicación, la recepción disponible y la distribución interior. También resolvemos ${focus}, averías de parabólica y problemas de portero o videoportero.`,
    `Para reparar una antena en ${n} seguimos la señal desde la captación hasta las tomas. Así podemos distinguir un problema de antena, amplificación, cableado o distribución y actuar también sobre ${focus} cuando corresponde.`
  ],`${k}|intro`);

  const zonaLocal=pick([
    `Trabajamos en ${n}, dentro de ${c}, y atendemos también avisos en localidades próximas como ${nearText}. Esto permite cubrir viviendas, comunidades y pequeños negocios de la zona con el mismo servicio técnico.`,
    `En ${n} damos servicio dentro de ${c}, junto a municipios cercanos como ${nearText}. Atendemos averías de antena, TDT, parabólicas, amplificación y porteros tanto en viviendas como en comunidades.`,
    `La atención en ${n} se extiende a localidades próximas de ${c} como ${nearText}. Si el problema afecta a una antena, a la distribución de señal o a un portero, revisamos primero la instalación antes de proponer cambios.`,
    `En ${n} y su entorno de ${c}, con municipios próximos como ${nearText}, atendemos instalaciones nuevas y averías de televisión, parabólicas, amplificación, porteros automáticos y videoporteros.`,
    `Prestamos servicio en ${n} y localidades cercanas de ${c}, entre ellas ${nearText}. El trabajo se adapta tanto a instalaciones individuales como comunitarias y se centra en localizar la causa real de la avería.`,
    `Desde ${n} atendemos avisos de ${c} y poblaciones próximas como ${nearText}. Podemos intervenir en TDT, antenas colectivas, satélite, amplificación, cableado y sistemas de portero o videoportero.`
  ],`${k}|zona`);

  const faqPregunta=pick([
    `¿Qué revisáis si faltan canales o la señal TDT falla en ${n}?`,
    `¿Podéis revisar una antena colectiva antes de cambiar equipos en ${n}?`,
    `¿Reparáis amplificadores, cableado y distribución de antena en ${n}?`,
    `¿Atendéis parabólicas y problemas de satélite en ${n}?`,
    `¿Reparáis porteros automáticos y videoporteros en ${n}?`,
    `¿Cómo localizáis una avería de televisión en una vivienda de ${n}?`,
    `¿Instaláis antenas TDT nuevas en ${n}?`,
    `¿Podéis reparar una antena aunque solo fallen algunos canales en ${n}?`
  ],`${k}|q`);

  const faqRespuesta=pick([
    `Medimos nivel y calidad de señal y revisamos antena, amplificación, cableado, repartidores, derivadores y tomas para localizar dónde empieza la pérdida antes de sustituir componentes.`,
    `Sí. En una instalación comunitaria comprobamos recepción, cabecera, fuentes, amplificación y distribución para distinguir un fallo general de una incidencia limitada a una línea o vivienda.`,
    `Sí. Revisamos el sistema por etapas. Si la recepción es correcta, seguimos por amplificadores, conexiones y red coaxial hasta identificar el punto que degrada la señal.`,
    `Sí. En parabólicas comprobamos orientación, LNB, conectores y cableado; si el problema está en la distribución interior, se actúa sobre ese tramo en lugar de cambiar el conjunto completo.`,
    `Sí. En porteros y videoporteros revisamos placa, fuente de alimentación, telefonillos o monitores y cableado antes de valorar reparación, adaptación o renovación.`,
    `Primero se delimita si el problema está en captación, amplificación o distribución. Esa comprobación evita cambiar una antena cuando el fallo real se encuentra en otro elemento de la instalación.`,
    `Sí. Para una instalación nueva comprobamos recepción, ubicación, fijación, amplificación necesaria y recorrido del cableado antes de dejar ajustados los canales y las tomas.`,
    `Sí. Cuando solo fallan algunos canales medimos por frecuencias y revisamos la calidad de señal para saber si el problema está en captación, filtrado, amplificación o distribución.`
  ],`${k}|a`);

  return{descripcion,introLocal,zonaLocal,faqPregunta,faqRespuesta};
}
