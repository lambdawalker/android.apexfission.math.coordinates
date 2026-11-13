# Source declaration reference

Generated from the current development sources. See [API contracts](api.md) for supported entry points, ownership, and behavior. These excerpts are a source reference, not a binary compatibility report.

## `src/main/java/com/apexfission/android/math/models/ImageBox.kt`

[Source](../../src/main/java/com/apexfission/android/math/models/ImageBox.kt)

```kotlin
package com.apexfission.android.math.models

data class ImageBox(
    val x: UInt,
    val y: UInt,
    val x2: UInt,
    val y2: UInt,
    val width: UInt,
    val height: UInt
) {
    val left: Int
        get()
    val top: Int
        get()
    val right: Int
        get()
    val bottom: Int
        get()
    val intWidth: Int
        get()
    val intHeight: Int
        get()
    val isEmpty: Boolean
        get()
    fun offset(dx: Int, dy: Int): ImageBox
    companion object {
        fun from2P(x1: UInt, y1: UInt, x2: UInt, y2: UInt): ImageBox
        fun from2P(x1: Int, y1: Int, x2: Int, y2: Int): ImageBox
        fun fromPS(x: UInt, y: UInt, width: UInt, height: UInt): ImageBox
        fun fromPS(x: Int, y: Int, width: Int, height: Int): ImageBox
    }
}
```

## `src/main/java/com/apexfission/android/math/models/ImagePoint.kt`

[Source](../../src/main/java/com/apexfission/android/math/models/ImagePoint.kt)

```kotlin
package com.apexfission.android.math.models

data class ImagePoint(
    val x: UInt,
    val y: UInt
)
fun ImagePoint(x: Int, y: Int)
```

## `src/main/java/com/apexfission/android/math/models/ImageSpace.kt`

[Source](../../src/main/java/com/apexfission/android/math/models/ImageSpace.kt)

```kotlin
package com.apexfission.android.math.models
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.Stable

@Immutable
@Stable
data class ImageSpace(
    val width: UInt,
    val height: UInt,
    val xScale: Float = 1.0F,
    val yScale: Float = 1.0F,
    val xOffset: UInt = 0U,
    val yOffset: UInt = 0U
)
fun ImageSpace.scale(x: Float, y: Float): ImageSpace
fun ImageSpace.scale(f: Float): ImageSpace
fun ImageSpace.crop(width: UInt, height: UInt, xOffset: UInt, yOffset: UInt): ImageSpace
fun ImageSpace.cropAtCenter(width: UInt, height: UInt): ImageSpace
enum class SpaceRelationship {
    Parent,
    Child,
}
@Immutable
data class ImageSpaceChainNode(
    val space: ImageSpace,
    val relationship: SpaceRelationship
) {
    val width: UInt
        get()
    val height: UInt
        get()
    val xScale: Float
        get()
    val yScale: Float
        get()
    val xOffset: UInt
        get()
    val yOffset: UInt
        get()
}
@Immutable
data class ImageSpaceChain(
    val nodes: List<ImageSpaceChainNode> = emptyList()
) : List<ImageSpaceChainNode> by nodes {
    companion object {
        val Empty = ImageSpaceChain(emptyList())
    }
}
fun ImageSpace.chain(nextSpace: ImageSpace, relationship: SpaceRelationship = SpaceRelationship.Child): ImageSpaceChain
fun ImageSpaceChain.chain(nextSpace: ImageSpace, relationship: SpaceRelationship = SpaceRelationship.Child): ImageSpaceChain
fun List<ImageSpace>.toImageSpaceChain(): ImageSpaceChain
```

## `src/main/java/com/apexfission/android/math/models/NormImageBox.kt`

[Source](../../src/main/java/com/apexfission/android/math/models/NormImageBox.kt)

```kotlin
package com.apexfission.android.math.models

data class NormImageBox(
    val x: Float,
    val y: Float,
    val x2: Float,
    val y2: Float,
    val width: Float,
    val height: Float
) {
    companion object {
        fun from2P(x1: Float, y1: Float, x2: Float, y2: Float): NormImageBox
        fun fromPS(x: Float, y: Float, width: Float, height: Float): NormImageBox
        operator fun invoke(x: Float, y: Float, x2: Float, y2: Float): NormImageBox
    }
}
```

## `src/main/java/com/apexfission/android/math/models/NormImagePoint.kt`

[Source](../../src/main/java/com/apexfission/android/math/models/NormImagePoint.kt)

```kotlin
package com.apexfission.android.math.models

data class NormImagePoint(
    val x: Float,
    val y: Float
)
```

## `src/main/java/com/apexfission/android/math/operations/normBox.kt`

[Source](../../src/main/java/com/apexfission/android/math/operations/normBox.kt)

```kotlin
package com.apexfission.android.math.operations
import com.apexfission.android.math.models.ImageBox
import com.apexfission.android.math.models.ImageSpace
import com.apexfission.android.math.models.NormImageBox
import kotlin.math.round

fun normBoxToBox(box: NormImageBox, localSpace: ImageSpace): ImageBox
fun NormImageBox.toBox(localSpace: ImageSpace): ImageBox
```

## `src/main/java/com/apexfission/android/math/operations/normPoint.kt`

[Source](../../src/main/java/com/apexfission/android/math/operations/normPoint.kt)

```kotlin
package com.apexfission.android.math.operations
import com.apexfission.android.math.models.ImagePoint
import com.apexfission.android.math.models.ImageSpace
import com.apexfission.android.math.models.NormImagePoint

fun normPointToPoint(normPoint: NormImagePoint, localSpace: ImageSpace): ImagePoint
fun NormImagePoint.toPoint(localSpace: ImageSpace): ImagePoint
```

## `src/main/java/com/apexfission/android/math/transformations/box.kt`

[Source](../../src/main/java/com/apexfission/android/math/transformations/box.kt)

```kotlin
package com.apexfission.android.math.transformations
import com.apexfission.android.math.models.ImageBox
import com.apexfission.android.math.models.ImagePoint
import com.apexfission.android.math.models.ImageSpace
import com.apexfission.android.math.models.ImageSpaceChain

fun ImageBox.toParentSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImageBox
fun ImageBox.toChildSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImageBox
fun ImageBox.translate(chain: ImageSpaceChain): ImageBox
```

## `src/main/java/com/apexfission/android/math/transformations/normBox.kt`

[Source](../../src/main/java/com/apexfission/android/math/transformations/normBox.kt)

```kotlin
package com.apexfission.android.math.transformations
import com.apexfission.android.math.models.ImageBox
import com.apexfission.android.math.models.ImageSpace
import com.apexfission.android.math.models.NormImageBox
import com.apexfission.android.math.operations.toBox

fun normBoxToParentSpace(normImageBox: NormImageBox, parentSpace: ImageSpace, childSpace: ImageSpace): ImageBox
fun NormImageBox.toParentSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImageBox
```

## `src/main/java/com/apexfission/android/math/transformations/normPoint.kt`

[Source](../../src/main/java/com/apexfission/android/math/transformations/normPoint.kt)

```kotlin
package com.apexfission.android.math.transformations
import com.apexfission.android.math.models.ImagePoint
import com.apexfission.android.math.models.ImageSpace
import com.apexfission.android.math.models.NormImagePoint
import com.apexfission.android.math.operations.toPoint

fun NormImagePoint.toParentSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImagePoint
fun NormImagePoint.toChildSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImagePoint
```

## `src/main/java/com/apexfission/android/math/transformations/point.kt`

[Source](../../src/main/java/com/apexfission/android/math/transformations/point.kt)

```kotlin
package com.apexfission.android.math.transformations
import com.apexfission.android.math.models.ImagePoint
import com.apexfission.android.math.models.ImageSpace
import com.apexfission.android.math.models.ImageSpaceChain
import com.apexfission.android.math.models.SpaceRelationship
import com.apexfission.android.math.models.toImageSpaceChain

fun ImagePoint.toParentSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImagePoint
fun ImagePoint.toParentSpace(spaces: List<ImageSpace>): ImagePoint
fun ImagePoint.toParentSpace(chain: ImageSpaceChain): ImagePoint
fun ImagePoint.toChildSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImagePoint
fun ImagePoint.toChildSpace(spaces: List<ImageSpace>): ImagePoint
fun ImagePoint.toChildSpace(chain: ImageSpaceChain): ImagePoint
fun ImagePoint.translate(chain: ImageSpaceChain): ImagePoint
```

## `src/main/java/com/apexfission/android/math/transformations/src.kt`

[Source](../../src/main/java/com/apexfission/android/math/transformations/src.kt)

```kotlin
package com.apexfission.android.math.transformations
import com.apexfission.android.math.models.ImagePoint
import com.apexfission.android.math.models.ImageSpace

fun pointToParentSpace(x: UInt, y: UInt, childSpace: ImageSpace, parentSpace: ImageSpace): ImagePoint
fun pointToChildSpace(x: UInt, y: UInt, parentSpace: ImageSpace, childSpace: ImageSpace): ImagePoint
```
