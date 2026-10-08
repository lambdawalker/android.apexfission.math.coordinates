# Referencia de la API pública

Paquete raíz: `com.apexfission.android.math`. Las firmas siguientes describen main. Las clases de datos de Kotlin también exponen métodos generados de igualdad, copia, desestructuración y representación como cadena. Lee siempre los [contratos de entrada](limitations.md) antes de usar salidas de modelos que no sean de confianza.

## Modelos

Importa desde `com.apexfission.android.math.models`.

```kotlin
data class ImagePoint(val x: UInt, val y: UInt)
fun ImagePoint(x: Int, y: Int): ImagePoint
data class NormImagePoint(val x: Float, val y: Float)
data class ImageBox(val x: UInt, val y: UInt, val x2: UInt, val y2: UInt, val width: UInt, val height: UInt)
data class NormImageBox(val x: Float, val y: Float, val x2: Float, val y2: Float, val width: Float, val height: Float)
```

| Tipo propietario | Miembros | Contrato |
| --- | --- | --- |
| ImageBox | `from2P(x1, y1, x2, y2)` con todos los argumentos UInt o todos Int | Ordena las esquinas; los negativos Int se limitan a cero. |
| ImageBox | `fromPS(x, y, width, height)` con todos los argumentos UInt o todos Int | Satura los extremos; los negativos Int se limitan a cero. |
| ImageBox | `offset(dx: Int, dy: Int): ImageBox` | Limita las esquinas desplazadas al intervalo de UInt. |
| ImageBox | `left`, `top`, `right`, `bottom`, `intWidth`, `intHeight`: Int; `isEmpty`: Boolean | Las conversiones a Int pueden desbordarse; vacío significa que la anchura o la altura es cero. |
| NormImageBox | `from2P(x1: Float, y1: Float, x2: Float, y2: Float)` | Ordena las esquinas sin validar el intervalo. |
| NormImageBox | `fromPS(x: Float, y: Float, width: Float, height: Float)` | Limita los tamaños negativos, no las posiciones. |
| NormImageBox | `operator fun invoke(x: Float, y: Float, x2: Float, y2: Float)` | La función de conveniencia de cuatro argumentos delega en from2P. |

Todas las funciones de creación de rectángulos devuelven el tipo de rectángulo al que pertenecen. Los constructores directos de seis campos no garantizan dimensiones coherentes. [Código de los modelos](../../src/main/java/com/apexfission/android/math/models/README.md).

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

Los nodos de cadena delegan `width`, `height`, `xOffset`, `yOffset` (UInt) y `xScale`, `yScale` (Float). `ImageSpaceChain.Empty` está disponible en el objeto companion. Las cadenas implementan List mediante delegación. Estas declaraciones resumen las firmas; sus cuerpos están en [ImageSpace.kt](../../src/main/java/com/apexfission/android/math/models/ImageSpace.kt). Consulta [conceptos](concepts.md) para conocer los desplazamientos locales, los desplazamientos conservados al escalar, la dirección de las cadenas y la propiedad de las listas.

## Operaciones de desnormalización

Importa desde `com.apexfission.android.math.operations`.

```kotlin
fun normBoxToBox(box: NormImageBox, localSpace: ImageSpace): ImageBox
fun NormImageBox.toBox(localSpace: ImageSpace): ImageBox
fun normPointToPoint(normPoint: NormImagePoint, localSpace: ImageSpace): ImagePoint
fun NormImagePoint.toPoint(localSpace: ImageSpace): ImagePoint
```

Solo se usan las dimensiones. Los puntos se truncan; los rectángulos redondean los empates al par. No se garantiza que la salida quepa en el marco si la entrada está fuera del intervalo. [Código de las operaciones](../../src/main/java/com/apexfission/android/math/operations/README.md).

## Transformaciones

Importa desde `com.apexfission.android.math.transformations`.

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

Usa argumentos de marco con nombre: la función de bajo nivel hacia el padre recibe el hijo antes que el padre, a diferencia de las funciones de extensión. Los fallos en los límites del padre y las traslaciones vacías lanzan IllegalArgumentException. Los límites son inclusivos; los resultados en el hijo se recortan. Las operaciones de rectángulos transforman ambas esquinas y reconstruyen el rectángulo. No hay sobrecargas de rectángulos normalizados hacia el hijo ni para cadenas: desnormaliza primero. Los alias de cadena respetan las direcciones explícitas; las sobrecargas de lista tienen un comportamiento diferente cuando están vacías. La función auxiliar de puntos normalizados hacia el hijo usa las dimensiones del hijo, como se documenta en [recetas](recipes.md). [Código de las transformaciones](../../src/main/java/com/apexfission/android/math/transformations/README.md).
