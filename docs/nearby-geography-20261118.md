# Localidades próximas verificadas

El bloque municipal de localidades próximas se calcula desde una copia versionada
de puntos de referencia municipal del Instituto Geográfico Nacional. Sustituye la
selección por hash de nombres que utilizaban los scripts de cierre provincial.

## Fuente y alcance

- Fuente primaria: [IGN, Información geográfica destacada: municipios](https://www.ign.es/resources/ane/Informacion_Geografica_Destacada/IGN_INFOGEO_MUNICIPIOS.html), basada en el NGMEP.
- [Excel oficial](https://www.ign.es/resources/ane/Informacion_Geografica_Destacada/IGN_INFOGEO_MUNICIPIOS.xlsx), descargado el 18/11/2026. Su ficha interior indica revisión del 20/10/2025; no se presenta como una revisión de 2026.
- Se extrae longitud/latitud del enlace «Ver en mapa». Son referencias aproximadas municipales, no distancias por carretera ni tiempos de desplazamiento.
- Las 3.549 rutas municipales tienen correspondencia por código INE. Se conserva la denominación que ya utiliza cada página; el nombre oficial de la fuente queda en los datos para trazabilidad.
- `content/municipal-coordinates.json` conserva la fuente, revisión, fecha de descarga y SHA-256 del Excel. Los builds no hacen solicitudes al IGN.

## Selección y conservación de contenido

`clean-nearby-links.mjs`, después de la combinación de localidades, selecciona hasta
cuatro municipios publicados de la misma provincia dentro de un radio de 35 km
entre los puntos de referencia. El orden se calcula mediante distancia geográfica
y se resuelve de forma estable cuando hay empates. Los municipios sin cuatro
candidatos mantienen una lista más corta; no se rellena con capitales lejanas.

La política es un filtro interno de enlaces. El sitio no muestra kilómetros,
tiempos de viaje, coordenadas ni explicaciones técnicas. Se conservan las URLs y
los enlaces provinciales y a capitales que genera la plantilla.

Una antigua enumeración de `zonaLocal` solo se sustituye cuando afirma cercanía,
coincide exactamente con la lista previa y contiene una localidad fuera del radio.
El resto de la frase y del contenido manual se conserva. Una antigua lista de
vecinos geográficamente válidos no se elimina por no coincidir con los cuatro
más próximos. La aplicación es idempotente.

## Actualización de la fuente

La importación es una tarea de mantenimiento independiente del build. Descargar
el Excel desde el enlace oficial, revisar su ficha y ejecutar:

```bash
python3 scripts/import-municipal-coordinates.py /ruta/IGN_INFOGEO_MUNICIPIOS.xlsx
node --test tests/nearby-links.test.mjs
```

El importador no usa la red y valida códigos INE, provincias, unicidad y presencia
de referencias. No unir fuentes por nombres: las denominaciones bilingües,
artículos y homónimos no son identificadores fiables. Una nueva ruta sin referencia
provoca un error explícito en lugar de asignarle municipios inventados.

## Casos de comprobación

| Página | Enlaces resultantes |
| --- | --- |
| Puebla de Sanabria | Robleda-Cervantes, Pedralba de la Pradería, Galende, Cobreros |
| Boca de Huérgano | Riaño, Prioro, Burón, Acebedo |
| Porto | Pías, Lubián, Cobreros, Requejo |
| Boñar | Vegaquemada, Valdepiélago, La Vecilla, La Ercina |
| Llanes | Peñamellera Alta, Cabrales, Peñamellera Baja, Ribadedeva |

El cálculo ofrece cuatro enlaces en 3.548 municipios y tres en Degaña. Esta
agrupación no presupone una carretera directa entre localidades ni una sede local
del negocio.
