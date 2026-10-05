# Madrid y SEO: integración en refactor-limpieza-segura

## Alcance

Base conservada: 0f04e34b7dfec8818f2acf061a6c63ec42aad2ec de refactor-limpieza-segura. No se modifica main ni otras webs. Madrid incorpora 179 municipios y su directorio: 3057 localidades en 16 provincias, 3074 HTML en total. El sitemap de Madrid contiene 180 URLs y está incluido en el índice principal. La portada muestra 24 municipios de Madrid y los otros 155 en el desplegable, con enlaces HTML.

El directorio permite buscar por nombre sin tildes o código postal, incluidos códigos compartidos. Los 296 códigos distintos y las 395 relaciones municipio/código proceden del mismo JSON contrastado de Antenas Rapid (commit fc7ead70124156c46bda6c28acf5f475bf4d1978, blob b05578a496895112c691b66cd04119f4ab65165f). Fuente: CartoCiudad, IGN/CNIG, consulta 2026-10-02. Obra derivada de CartoCiudad CC BY 4.0, SCNE. Son códigos asociados a direcciones de esa fuente, no una certificación de todos los códigos especiales de Correos. No se publican direcciones individuales ni se crean sedes o páginas por código postal. Los datos permanecen en el repositorio, sin consultas postales en cada build.

## Mejoras de contenido y técnica

Se diferencian reparación de porteros automáticos e instalación de videoporteros dentro del servicio existente de todas las páginas municipales, con información sobre síntomas y compatibilidad. Los metadatos WebPage/CollectionPage se sincronizan con título, descripción y canonical finales, y la identidad WebSite es consistente. Se añade separación textual real entre teléfono y WhatsApp y data-nosnippet a la barra móvil. Los enlaces relacionados se resuelven dentro de la provincia. Producción conserva build:prod e indexación abierta; deploy previews usan build y noindex. Se mantiene el diseño aprobado, todas las fotografías y servicios, incluido TDT por satélite HD.

## Verificación y limitaciones

La ejecución GitHub 37344555968 terminó correctamente los builds de preview y producción con esta configuración. Se canceló durante la prueba de navegador y no llegó a guardar los archivos modificados en el runner. La ejecución 37348868447 recuperó esos archivos en la rama de revisión; no demuestra por sí sola ninguna prueba adicional.

En el cierre local se reutilizó el mismo CSV descargado en la auditoría de referencia. Se generó la web y se ejecutaron las fases finales, 26 pruebas unitarias (10 consentimiento, 5 marca, 4 TDT-SAT, 7 Madrid), auditorías finales, enlaces, sitemaps y rastreabilidad. La auditoría completa audit.js ya había pasado en remoto; no se repitió hasta el final en el contenedor por el coste de su comparación de similitud entre todos los pares municipales.

Comparación local de los HTML: se conservan las 2894 rutas anteriores, títulos, H1, descripciones, canonicals, teléfonos, referencias de imágenes y robots; solo se añaden 180 rutas de Madrid. Los sitemaps provinciales anteriores son idénticos. Las mejoras de contenido y datos estructurados descritas arriba sí modifican el interior de las páginas existentes.

Prueba local de Chromium con el HTML, CSS, imágenes y JavaScript generados incorporados en memoria: 20 escenarios a 320, 390, 768 y 1440 píxeles, sobre directorio de Madrid, Coslada, nombre municipal largo, Galdakao y portada. Búsquedas, códigos compartidos, preguntas y desplegables correctos, sin desbordamiento horizontal. Esta prueba no es una comprobación HTTP del dominio. El test remoto se mantiene con límites por operación, salida de progreso y watchdog de 120 segundos; no se afirma haber diagnosticado la causa interna del bloqueo remoto.

En la comprobación HTTP de referencia, portada, Lerma y Galdakao respondían 200 con index,follow,max-image-preview:large y sin cabecera X-Robots-Tag restrictiva. Robots permitía rastreo y el sitemap respondía como XML. Esto no demuestra indexación ni posicionamiento en Google. No se consultaron informes privados de Search Console ni se garantizan posiciones. La incorporación a GitHub no certifica que Netlify haya publicado el commit.
