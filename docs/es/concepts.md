# Espacios de coordenadas y dirección

`ImagePoint` e `ImageBox` usan coordenadas de píxel sin signo. `NormImagePoint` y `NormImageBox` usan valores Float que, por convención, son relativos a un marco; sus constructores no imponen el intervalo 0..1. Las esquinas de los rectángulos son límites: x = width e y = height son límites aceptados, pero no índices válidos de un array de píxeles.

Un `ImageSpace` describe la anchura y la altura, además de su relación con un padre inmediato. Para cada eje:

- De padre a hijo: `(coordinate - childOffset) * childScale`; después se trunca y se limita a la extensión del hijo.
- De hijo a padre: `coordinate / childScale + childOffset`; se valida que el resultado esté dentro de la extensión del padre y después se trunca.

La escala y el desplazamiento del hijo determinan cada paso. La escala y el desplazamiento propios del padre no se aplican en ese paso. La transformación de padre a hijo rechaza entradas que superen la extensión del padre, aunque recorte la salida. La transformación de hijo a padre valida el resultado calculado en el padre; no valida por separado la entrada contra las dimensiones del hijo.

## Construcción de espacios

`scale(f)` o `scale(x, y)` calcula las nuevas dimensiones mediante multiplicación Float y conversión a UInt. Sustituye los metadatos de escala y conserva los desplazamientos del receptor. `crop` limita los desplazamientos solicitados a las dimensiones de origen y los tamaños a las extensiones restantes; restablece la escala a 1 y almacena desplazamientos locales, sin acumular desplazamientos anteriores. `cropAtCenter` limita las dimensiones y usa división entera para calcular el desplazamiento del centro.

Estas funciones auxiliares no componen automáticamente una transformación completa. Conserva cada relación inmediata en una cadena. En particular, al escalar un espacio que ya tiene desplazamiento, se conserva ese desplazamiento: evita aplicarlo dos veces por accidente. Para separar los pasos de recorte y escalado, construye el nodo de escala a partir de un `ImageSpace(crop.width, crop.height)` sin desplazamiento.

## Cadenas

`source.chain(child)` usa Child de forma predeterminada. La propiedad `relationship` de un nodo añadido indica cómo pasar del nodo anterior a este nodo. Para recorrer la cadena en sentido inverso, empieza por el hijo y añade el padre con `SpaceRelationship.Parent`. La relación del primer nodo se ignora.

`translate` requiere al menos un nodo. Una cadena de un solo nodo devuelve el punto original (los rectángulos se reconstruyen a partir de sus esquinas). Cada paso trunca y puede recortar, por lo que un recorrido de ida y vuelta no suele ser reversible. Tanto `toParentSpace(chain)` como `toChildSpace(chain)` siguen las direcciones explícitas de la cadena; sus nombres no las anulan.

Una lista simple convertida con `toImageSpaceChain()` usa Child para cada nodo. En cambio, la sobrecarga de puntos `toParentSpace(List<ImageSpace>)` invierte una lista ordenada de raíz a hoja. Cuando la lista está vacía, devuelve el punto original, mientras que la sobrecarga de lista hacia el hijo lanza una excepción por la validación de cadena vacía.

Las cadenas delegan en la lista proporcionada. No modifiques una lista subyacente que hayas conservado; pasa una instantánea con `toList()` cuando la propiedad de la lista sea compartida. Las anotaciones de estabilidad no añaden validación ni inmutabilidad profunda.
