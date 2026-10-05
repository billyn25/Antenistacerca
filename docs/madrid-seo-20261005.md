# Madrid y revisión SEO — 5 de octubre de 2026

## Rama y alcance

Base: `billyn25/Antenistacerca`, `refactor-limpieza-segura`, commit `0f04e34b7dfec8818f2acf061a6c63ec42aad2ec`. No se modifica `main`, ni Antenas Rapid, Zallatel o Canalones.

Madrid añade 179 municipios: 3057 localidades en 16 provincias y 3074 HTML en total. Directorio `/madrid/`, una URL estable por municipio y sitemap `/sitemaps/sitemap-madrid.xml` con 180 URLs, incluido en el índice principal. La portada conserva 24 municipios visibles por provincia y el resto en un desplegable con enlaces HTML.

## Códigos postales

Datos copiados sin alteración del archivo contrastado de Antenas Rapid, commit `fc7ead70124156c46bda6c28acf5f475bf4d1978`, blob `b05578a496895112c691b66cd04119f4ab65165f`. Fuente: CartoCiudad (IGN/CNIG), API de direcciones https://api-features.idee.es/collections/address/items, filtro Madrid, consulta 2026-10-02. Obra derivada de CartoCiudad CC BY 4.0, SCNE.

Son 296 códigos distintos y 395 relaciones municipio/código. La lista refleja las direcciones de esa fuente, no certifica códigos especiales de Correos. No se publican domicilios individuales ni se inventan sedes comerciales. El JSON está guardado localmente; no hay consultas postales en cada build ni en el navegador.

El directorio admite nombre sin tildes y código postal. Los códigos compartidos muestran todos los municipios asociados. Cada página muestra sus códigos en HTML; las listas largas se despliegan sin scroll interno y sin crear páginas por código. La inserción preserva el contenedor FAQ completo.

## Mejoras para toda la web

- Subapartados visibles de reparación de porteros automáticos e instalación de videoporteros, dentro del servicio existente en todas las páginas municipales. Contenido práctico para distinguir llamada/audio/apertura, alcance de averías y compatibilidad al renovar equipos.
- Datos WebPage/CollectionPage sincronizados con título, descripción y canonical finales; identidad WebSite consistente. No se añaden valoraciones ni direcciones no acreditadas.
- Teléfono y WhatsApp separados mediante espacio real en HTML; la barra móvil usa `data-nosnippet` sin impedir indexación de las páginas.
- Enlaces relacionados resueltos dentro de la provincia para no confundir municipios homónimos. Los enlaces de Madrid se describen como otros municipios, no como proximidad física demostrada.
- Separación explícita de producción y deploy previews en Netlify. Producción sigue con `build:prod`, index/follow y robots abierto. Previews usan `build`, noindex/nofollow y robots cerrado; su auditoría ya valida el modo correcto.

## Comprobación de la web publicada antes del cambio

Consulta HTTP realizada desde GitHub Actions el 5 de octubre: portada, `/burgos/lerma/` y `/bizkaia/galdakao/` respondieron 200, sin cabecera X-Robots-Tag restrictiva y con `index,follow,max-image-preview:large`. Canonicals a https://antenistacerca.es, sin www. La portada con www redirige a la versión sin www. Robots permite rastreo y anuncia el sitemap, que responde como XML.

Esto descarta un bloqueo noindex en las páginas comprobadas; no demuestra que Google haya indexado todas las URLs ni explica por sí solo su posición. No se han consultado las métricas ni informes privados de Google Search Console. Una web nueva puede necesitar rastreo y evaluación, pero no se atribuye el rendimiento únicamente a la antigüedad. Parte del contenido sigue siendo común entre municipios; se recomienda incorporar pruebas y casos locales reales cuando estén disponibles, sin inventarlos ni prometer posiciones.

## Validación

Builds locales de producción y preview con las mismas fuentes CSV descargadas en la revisión de la rama; 26 pruebas ejecutadas por cada pipeline (10 consentimiento, 5 acentos de marca, 4 TDT-SAT, 7 Madrid/SEO). La comparación confirma conservación de las 2894 rutas HTML anteriores, títulos, H1, descripciones, canonicals, contactos, fotografías y 29 recursos existentes. Se añaden 180 HTML, solo de Madrid. Los sitemaps provinciales anteriores permanecen idénticos. La auditoría de enlaces confirma provincias a un clic y localidades a dos clics como máximo.

Renderizado local del HTML, CSS y JavaScript generados en Chromium a 320, 390, 768 y 1440: directorio, Coslada, municipio de nombre largo, Galdakao, portada, búsquedas por nombre/código compartido y ausencia de resultados, FAQ y lectura sin JavaScript. Para el render local se incorporan los recursos del build sin hacer llamadas externas. Se incluye `tests/madrid-seo.browser.py` para repetir comprobaciones en un servidor de prueba.

Ninguna prueba de construcción certifica por sí sola que Netlify haya publicado el commit o que Google haya actualizado su índice.
