# Primera transformación de coordenadas

Sigue [las instrucciones de instalación confirmadas](../../IMPORT.md). Estos ejemplos describen main. La biblioteca está orientada a JVM 11; compilar este repositorio requiere JDK 17. Las anotaciones de Compose solo se necesitan durante la compilación; no se necesita una interfaz de usuario ni el SDK de Android.

El siguiente código se extrae de la prueba ejecutable de documentación. Una imagen de 1920 × 1080 se recorta por el centro a 1080 × 1080; el recorte comienza en x = 420. Un rectángulo en el marco de origen se mueve 420 píxeles a la izquierda en el marco del recorte.

<!-- example:start -->

```kotlin
import com.apexfission.android.math.models.*
import com.apexfission.android.math.transformations.translate

fun viewportExample(): ImageBox {
    val source = ImageSpace(1920u, 1080u)
    val viewport = source.cropAtCenter(1080u, 1080u)
    val sourceBox = ImageBox.from2P(500u, 100u, 1000u, 600u)
    return sourceBox.translate(source.chain(viewport))
    // ImageBox(x=80, y=100, x2=580, y2=600, width=500, height=500)
}
```

<!-- example:end -->

Ejecuta `./gradlew test runExamples` en la raíz del repositorio. El ejecutor comprueba los resultados esperados de la traslación del recorte, la salida normalizada del detector, el redondeo y la función auxiliar de puntos normalizados hacia el hijo. El [código completo de demostración](../../src/test/java/com/apexfission/android/math/examples/DocumentationExamplesTest.kt) incluye todas las importaciones y aserciones.

Estas operaciones solo transforman coordenadas. Tu aplicación realiza el recorte real de la imagen y proporciona dimensiones coincidentes. Continúa con [conceptos](concepts.md) y [recetas](recipes.md).
