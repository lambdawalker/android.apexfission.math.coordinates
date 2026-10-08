# Alcance de las versiones y migración

Estas guías siguen `main`. [IMPORT.md](../../IMPORT.md) y los [metadatos de publicación](../release.json) identifican la versión publicada confirmada y el commit inmutable del código fuente. Revisa ese código o su etiqueta de versión al adoptar una función; la documentación de main por sí sola no demuestra que esté disponible en una versión publicada.

Este cambio de documentación no modifica el comportamiento de la biblioteca en tiempo de ejecución ni publica una versión en Maven. Los nombres de paquete existentes siguen siendo `com.apexfission.android.math.*`. Las URL existentes de las guías Markdown siguen siendo puntos de entrada.

Antes de actualizar, compara los cambios del código y la API, ejecuta tus pruebas de conversión entre marcos y comprueba el redondeo, el recorte, la dirección de las cadenas y la transformación de puntos normalizados hacia el hijo en tu flujo de procesamiento. Todavía no se mantiene una matriz independiente de disponibilidad de la API por versión. No la deduzcas del nombre del repositorio ni de un despliegue de la documentación.

El [proceso de publicación y recuperación](../releases.md) sigue siendo manual e independiente de la publicación del sitio.
