# Refuerzo de Madrid en Antenista Cerca

Rama de producción: refactor-limpieza-segura. Base: 16c93863. Petición: reforzar Madrid sin rediseñar la web ni alterar las URLs existentes.

## Cambios

Madrid capital conserva /madrid/madrid/ y recibe un resumen de diagnóstico para viviendas y comunidades, preparación del aviso, preguntas específicas y enlaces a los 21 distritos. La provincia /madrid/ se identifica como Comunidad de Madrid y conserva los 179 municipios y el índice distrital. Los distritos conservan sus rutas y pasan a enlazar la capital mediante navegación visible y BreadcrumbList. No se crean sedes ni trabajos locales ficticios.

Se añaden seis guías, no combinaciones masivas servicio-pueblo: reparación de antenas, TDT/colectivas, amplificación, parabólicas, porteros y videoporteros. Se alojan en /madrid/servicios/<servicio>/, se enlazan en contexto desde las páginas existentes y vuelven a capital, distritos y directorio municipal. Incluyen alcance de revisión, criterios de reparación, preparación de presupuesto y preguntas. No incluyen precios, tiempos de llegada, reseñas ni acreditaciones inventados.

La portada incorpora un acceso contextual a Madrid sin cambiar sus contactos ni eliminar las demás provincias. Los nuevos servicios usan 614 78 99 45 y el pie regional mantiene ambos teléfonos. El sitemap madrileño pasa de 201 a 207 URLs; se conservan las 201 anteriores y los demás sitemaps. La salida completa pasa de 3589 a 3595 HTML.

## Validación

El módulo se integra en regional-contact-entry.mjs después del diseño distrital y antes del ajuste de teléfonos. Antes de escribir comprueba canonicals, robots, imágenes, cabeceras, pies y scripts intactos en páginas existentes; enlaces y anclas de toda la modificación; ausencia de identificadores duplicados. Se comprueban hashes de los archivos ajenos a la intervención. La auditoría final vuelve a verificar el inventario completo, sitemap, guías, contactos y enlaces. Las guías heredan el estado noindex del build de pruebas, sin abrir previews a Google.

Las pruebas unitarias cubren contenido, metadatos, rutas, aislamiento, guías, previews y fallos de plantilla. El workflow compila todo y verifica la publicación, los 21 distritos, todas las páginas de las tres provincias centrales y controles del norte, con pruebas de navegador para varias anchuras y sin JavaScript. Los resultados de publicación se encuentran en los artefactos del workflow: un build correcto no equivale por sí mismo a publicación verificada ni a indexación en Google.

## Medición pendiente

No se ha accedido al rendimiento privado de Search Console ni se afirma una mejora de puestos. La referencia de seguimiento son /madrid/madrid/, /madrid/, los 21 distritos y las seis guías. Comparar consultas, impresiones, clics y posición por página, separando capital, municipios y distritos. No confundir más URLs en sitemap con más tráfico.

Referencias de criterio: https://developers.google.com/search/docs/crawling-indexing/links-crawlable?hl=es y https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=es . Falta documentación de intervenciones reales aportada por el titular; no se sustituye por casos inventados.
