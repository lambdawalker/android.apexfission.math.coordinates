# First coordinate transformation

Follow [the confirmed installation instructions](../../IMPORT.md). These examples describe main. The library targets JVM 11; building this repository requires JDK 17. Compose annotations are compile-only; no UI or Android SDK is needed.

The following code is extracted from the executable documentation test. A 1920 × 1080 image is center-cropped to 1080 × 1080; the crop begins at x = 420. A box in the source frame moves 420 pixels left in the crop frame.

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

Run `./gradlew test runExamples` at the repository root. The runner asserts expected results for crop translation, normalized detector output, rounding, and the normalized-point child helper. [Full demo source](../../src/test/java/com/apexfission/android/math/examples/DocumentationExamplesTest.kt) includes all imports and assertions.

These operations transform coordinates only. Your application performs the actual image crop and supplies matching dimensions. Continue with [concepts](concepts.md) and [recipes](recipes.md).
