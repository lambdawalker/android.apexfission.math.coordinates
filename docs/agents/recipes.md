# Recipes and executable demos

All numeric scenarios below are asserted in the [documentation demo](../../src/test/java/com/apexfission/android/math/examples/DocumentationExamplesTest.kt). Run `./gradlew runExamples`; `./gradlew test` also runs them.

## Center-crop a viewport

See the [source-extracted quickstart](quickstart.md). Source 1920 × 1080 → crop 1080 × 1080 at (420, 0). Source box (500, 100)–(1000, 600) → crop box (80, 100)–(580, 600). The reverse explicit Parent chain restores this unclipped example.

## Convert normalized detector output to the original image

```kotlin
import com.apexfission.android.math.models.*
import com.apexfission.android.math.transformations.toParentSpace

val source = ImageSpace(1920u, 1080u)
val crop = source.cropAtCenter(1080u, 1080u)
val detection = NormImageBox.from2P(0.25f, 0.25f, 0.75f, 0.75f)
val sourceBox = detection.toParentSpace(parentSpace = source, childSpace = crop)
// (690, 270)–(1230, 810)
```

The normalized box belongs to the child frame. For a multi-step pipeline, first call `toBox(detectorSpace)`, then `translate` an explicit chain from detector to source. Validate model values for finiteness and expected range before conversion.

## Normalize relative to the correct source frame

For a normalized point that belongs to the parent, explicitly denormalize in the parent before translating:

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

**Known behavior:** `normalized.toChildSpace(parent, child)` currently denormalizes using the child's dimensions, then maps that point as parent coordinates. In this example it yields (0, 50). Use the explicit two-step recipe above for parent-normalized input.

## Account for rounding

In a 3 × 3 space, normalized (0.5, 0.5) converts to point (1, 1), but a box corner at (0.5, 0.5) converts to (2, 2). Point conversion truncates; box conversion rounds ties to even. Do not mix conversion paths when identical pixel alignment is required.
