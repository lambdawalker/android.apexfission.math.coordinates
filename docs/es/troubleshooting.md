# Resolución de problemas

| Síntoma | Comprobación y solución |
| --- | --- |
| El rectángulo se desplaza dos veces por el desplazamiento del recorte | Conserva las relaciones locales; escala sobre un marco sin desplazamiento al añadir un nodo de escala separado. Consulta [conceptos](concepts.md). |
| Un punto normalizado hacia el hijo se recorta de forma inesperada | Usa `point.toPoint(parent).toChildSpace(parent, child)` para entradas normalizadas respecto al padre. Consulta [recetas](recipes.md). |
| Diferencia de un píxel entre punto y rectángulo | La conversión de puntos trunca; la conversión de rectángulos redondea los empates al par. |
| IllegalArgumentException al trasladar | Comprueba los límites de entrada en el padre, la dirección explícita de la cadena, las escalas y los límites resultantes en el padre. |
| Una cadena vacía lanza una excepción | Proporciona un marco inicial. La conversión de puntos con una lista de padres vacía es una excepción a esta regla. |
| Las dimensiones del rectángulo de una clase de datos no coinciden | Sustituye el constructor directo o copy por `from2P` o `fromPS`. |
| Las coordenadas encajan matemáticamente, pero la imagen difiere | Haz que coincidan con las operaciones reales de recorte, escalado, rotación y reflexión de la aplicación anfitriona. Esta biblioteca no procesa imágenes. |
| No se puede resolver la dependencia de Gradle | Usa las coordenadas del artefacto y los repositorios confirmados en [IMPORT.md](../../IMPORT.md); la compilación requiere JDK 17 y acceso de red a los repositorios de Gradle/Maven. |
| Los enlaces del sitio fallan en GitHub Pages | Conserva la base del proyecto configurada; ejecuta `cd sites && npm ci && npm run check`. Usa GitHub Actions como origen de Pages. |
