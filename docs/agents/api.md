# Public API reference

Package root: `com.apexfission.android.math`. Signatures below describe main. Kotlin data classes also expose generated equality, copy, destructuring and string methods. Always read [input contracts](limitations.md) before using untrusted model output.

## Models

Import from `com.apexfission.android.math.models`.

```kotlin
data class ImagePoint(val x: UInt, val y: UInt)
fun ImagePoint(x: Int, y: Int): ImagePoint
data class NormImagePoint(val x: Float, val y: Float)
data class ImageBox(val x: UInt, val y: UInt, val x2: UInt, val y2: UInt, val width: UInt, val height: UInt)
data class NormImageBox(val x: Float, val y: Float, val x2: Float, val y2: Float, val width: Float, val height: Float)
```

| Owner | Members | Contract |
| --- | --- | --- |
| ImageBox | `from2P(x1, y1, x2, y2)` with all UInt or all Int | Sorts corners; Int negatives clamp to zero. |
| ImageBox | `fromPS(x, y, width, height)` with all UInt or all Int | Saturates endpoints; Int negatives clamp to zero. |
| ImageBox | `offset(dx: Int, dy: Int): ImageBox` | Clamps shifted corners into UInt range. |
| ImageBox | `left`, `top`, `right`, `bottom`, `intWidth`, `intHeight`: Int; `isEmpty`: Boolean | Int conversions may overflow; empty means width or height is zero. |
| NormImageBox | `from2P(x1: Float, y1: Float, x2: Float, y2: Float)` | Sorts corners without range validation. |
| NormImageBox | `fromPS(x: Float, y: Float, width: Float, height: Float)` | Clamps negative sizes, not positions. |
| NormImageBox | `operator fun invoke(x: Float, y: Float, x2: Float, y2: Float)` | Four-argument convenience delegates to from2P. |

All box factories return their owning box type. Raw six-field constructors do not enforce consistent dimensions. [Model sources](../../src/main/java/com/apexfission/android/math/models/README.md).

```kotlin
data class ImageSpace(
    val width: UInt, val height: UInt,
    val xScale: Float = 1.0F, val yScale: Float = 1.0F,
    val xOffset: UInt = 0U, val yOffset: UInt = 0U
)
fun ImageSpace.scale(x: Float, y: Float): ImageSpace
fun ImageSpace.scale(f: Float): ImageSpace
fun ImageSpace.crop(width: UInt, height: UInt, xOffset: UInt, yOffset: UInt): ImageSpace
fun ImageSpace.cropAtCenter(width: UInt, height: UInt): ImageSpace
enum class SpaceRelationship { Parent, Child }
data class ImageSpaceChainNode(val space: ImageSpace, val relationship: SpaceRelationship)
data class ImageSpaceChain(val nodes: List<ImageSpaceChainNode> = emptyList()) : List<ImageSpaceChainNode>
fun ImageSpace.chain(nextSpace: ImageSpace, relationship: SpaceRelationship = SpaceRelationship.Child): ImageSpaceChain
fun ImageSpaceChain.chain(nextSpace: ImageSpace, relationship: SpaceRelationship = SpaceRelationship.Child): ImageSpaceChain
fun List<ImageSpace>.toImageSpaceChain(): ImageSpaceChain
```

Chain nodes delegate `width`, `height`, `xOffset`, `yOffset` (UInt), and `xScale`, `yScale` (Float). `ImageSpaceChain.Empty` is available in the companion. Chains implement List by delegation. These declarations are signature summaries; their bodies are in [ImageSpace.kt](../../src/main/java/com/apexfission/android/math/models/ImageSpace.kt). See [concepts](concepts.md) for local offsets, retained scale offsets, chain direction and list ownership.

## Denormalization operations

Import from `com.apexfission.android.math.operations`.

```kotlin
fun normBoxToBox(box: NormImageBox, localSpace: ImageSpace): ImageBox
fun NormImageBox.toBox(localSpace: ImageSpace): ImageBox
fun normPointToPoint(normPoint: NormImagePoint, localSpace: ImageSpace): ImagePoint
fun NormImagePoint.toPoint(localSpace: ImageSpace): ImagePoint
```

Only dimensions are used. Points truncate; boxes round ties to even. Outputs are not guaranteed to fit the frame for out-of-range input. [Operation sources](../../src/main/java/com/apexfission/android/math/operations/README.md).

## Transformations

Import from `com.apexfission.android.math.transformations`.

```kotlin
fun pointToParentSpace(x: UInt, y: UInt, childSpace: ImageSpace, parentSpace: ImageSpace): ImagePoint
fun pointToChildSpace(x: UInt, y: UInt, parentSpace: ImageSpace, childSpace: ImageSpace): ImagePoint
fun ImagePoint.toParentSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImagePoint
fun ImagePoint.toChildSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImagePoint
fun ImagePoint.toParentSpace(spaces: List<ImageSpace>): ImagePoint
fun ImagePoint.toChildSpace(spaces: List<ImageSpace>): ImagePoint
fun ImagePoint.toParentSpace(chain: ImageSpaceChain): ImagePoint
fun ImagePoint.toChildSpace(chain: ImageSpaceChain): ImagePoint
fun ImagePoint.translate(chain: ImageSpaceChain): ImagePoint
fun ImageBox.toParentSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImageBox
fun ImageBox.toChildSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImageBox
fun ImageBox.translate(chain: ImageSpaceChain): ImageBox
fun normBoxToParentSpace(normImageBox: NormImageBox, parentSpace: ImageSpace, childSpace: ImageSpace): ImageBox
fun NormImageBox.toParentSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImageBox
fun NormImagePoint.toParentSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImagePoint
fun NormImagePoint.toChildSpace(parentSpace: ImageSpace, childSpace: ImageSpace): ImagePoint
```

Use named frame arguments: the low-level parent function has child-before-parent order, unlike extension functions. Parent bounds failures and empty translations throw IllegalArgumentException. Bounds are inclusive; child results clip. Box operations transform both corners and rebuild the box. There is no normalized-box child or chain overload: denormalize first. Chain aliases respect explicit directions; list overloads have different empty behavior. The normalized-point child helper uses child dimensions, as documented in [recipes](recipes.md). [Transformation sources](../../src/main/java/com/apexfission/android/math/transformations/README.md).
