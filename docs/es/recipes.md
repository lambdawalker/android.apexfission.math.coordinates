# Recetas y demostraciones ejecutables

Todos los escenarios numéricos siguientes se comprueban mediante aserciones en la [demostración de documentación](../../src/test/java/com/apexfission/android/math/examples/DocumentationExamplesTest.kt). Ejecuta `./gradlew runExamples`; `./gradlew test` también los ejecuta.

## Recortar una ventana por el centro

Consulta el [inicio rápido extraído del código fuente](quickstart.md). Origen 1920 × 1080 → recorte 1080 × 1080 en (420, 0). Rectángulo de origen (500, 100)–(1000, 600) → rectángulo del recorte (80, 100)–(580, 600). La cadena explícita Parent inversa restaura este ejemplo sin pérdida por recorte.

## Convertir la salida normalizada del detector a la imagen original

```kotlin
import com.apexfission.android.math.models.*
import com.apexfission.android.math.transformations.toParentSpace

val source = ImageSpace(1920u, 1080u)
val crop = source.cropAtCenter(1080u, 1080u)
val detection = NormImageBox.from2P(0.25f, 0.25f, 0.75f, 0.75f)
val sourceBox = detection.toParentSpace(parentSpace = source, childSpace = crop)
// (690, 270)–(1230, 810)
```

El rectángulo normalizado pertenece al marco hijo. Para un flujo de varios pasos, llama primero a `toBox(detectorSpace)` y después usa `translate` con una cadena explícita del detector al origen. Valida que los valores del modelo sean finitos y estén dentro del intervalo esperado antes de convertirlos.

<a id="normalize-relative-to-the-correct-source-frame"></a>

## Normalizar respecto al marco de origen correcto

Para un punto normalizado que pertenece al padre, desnormaliza explícitamente en el padre antes de trasladarlo:

```kotlin
import com.apexfission.android.math.models.*
import com.apexfission.android.math.operations.toPoint
import com.apexfission.android.math.transformations.toChildSpace

val parent = ImageSpace(200u, 100u)
val child = parent.crop(100u, 100u, 50u, 0u)
val normalized = NormImagePoint(0.5f, 0.5f)
val point = normalized.toPoint(parent).toChildSpace(parentSpace = parent, childSpace = child)
// (50, 50)
```

**Comportamiento conocido:** `normalized.toChildSpace(parent, child)` desnormaliza actualmente usando las dimensiones del hijo y después transforma ese punto como si fueran coordenadas del padre. En este ejemplo produce (0, 50). Usa la receta explícita de dos pasos anterior para entradas normalizadas respecto al padre.

## Tener en cuenta el redondeo

En un espacio de 3 × 3, el punto normalizado (0.5, 0.5) se convierte en el punto (1, 1), pero una esquina de rectángulo en (0.5, 0.5) se convierte en (2, 2). La conversión de puntos trunca; la conversión de rectángulos redondea los empates al par. No mezcles rutas de conversión cuando se requiera una alineación de píxeles idéntica.
