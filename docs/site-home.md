# Apexfission Coordinates

Move points and boxes between image frames with explicit crop offsets, scale factors, and direction. A small Kotlin/JVM library with unsigned pixel models and normalized detector coordinates. No Android SDK or image renderer required.

[Install the confirmed release](../IMPORT.md) · [Run your first transformation](agents/quickstart.md) · [API reference](agents/api.md)

## A crop changes the coordinate frame

![A 1920 by 1080 source frame contains a centered 1080 by 1080 crop starting at x 420. A source box from 500,100 to 1000,600 maps to 80,100 to 580,600 in the crop.](https://lambdawalker.github.io/android.apexfission.math.coordinates/crop.svg)

The diagram is a mathematical illustration, not a screenshot. Its numbers are asserted by the executable demo. Your application performs the image crop; this library maps coordinates to match it.

## Choose your path

| Need | Guide |
| --- | --- |
| Map a source box into a viewport | [Quickstart with runnable code](agents/quickstart.md) |
| Map normalized detector output back to the image | [Recipes and full demo](agents/recipes.md) |
| Understand direction, clipping and local offsets | [Coordinate spaces](agents/concepts.md) |
| Diagnose a one-pixel discrepancy | [Rounding and limitations](agents/limitations.md) |
| Integrate using an AI agent | [Focused Markdown entry point](agents/index.md) |

Source, tests, release tooling and this site are maintained together in the [GitHub repository](https://github.com/lambdawalker/android.apexfission.math.coordinates). The HTML guides and raw agent Markdown share canonical sources. Read [documentation maintenance](documentation.md) for coverage and generation commands.
