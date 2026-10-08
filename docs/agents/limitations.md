# Limitations and input contracts

- Numerical geometry only: no rendering, bitmap crop, CameraX adapters, detector inference, rotation, mirroring, perspective, or general affine matrices. Your host owns image processing and frame selection.
- Dimensions and pixel positions are UInt. Validate signed inputs before casting. Int point and box factory overloads clamp negatives to zero; direct `.toUInt()` is a different operation.
- Use box factories. Raw six-field constructors and data-class `copy` can create inconsistent corners and dimensions. Normalized factories sort corners or clamp negative sizes but do not constrain values to 0..1 or reject NaN/infinity.
- Validate finite normalized values, finite positive scales, and nonzero dimensions when your application requires a meaningful frame. ImageSpace does not enforce these constraints. Do not rely on runtime numeric conversions to sanitize invalid model output.
- `ImageBox.fromPS` saturates endpoints at UInt.MAX_VALUE. Offsets saturate each corner independently, so clipping may shrink a box. Int getters can overflow for values above Int.MAX_VALUE.
- Denormalization uses dimensions only, without offsets or scales. Point conversion truncates positive Float values. Box conversion uses round-to-even with Double arithmetic, clamps negative results to zero, but has no upper-bound validation; very large inputs can overflow through Long-to-UInt conversion.
- Translation accepts boundaries equal to width/height. Parent-to-child validates parent input then clips target output. Child-to-parent checks computed parent bounds and throws IllegalArgumentException if invalid. `InvalidCoordinatesError` in messages is not a custom exception type.
- Chaining can lose information through intermediate rounding and clipping. No guarantee of inverse round trips.
- The normalized-point child helper uses child dimensions; use the [explicit source-frame recipe](recipes.md#normalize-relative-to-the-correct-source-frame).
- Chain stability annotations do not freeze a caller-owned mutable list.

These are contracts observed in main, not promises of feature availability in every release. See [migration](migration.md).
