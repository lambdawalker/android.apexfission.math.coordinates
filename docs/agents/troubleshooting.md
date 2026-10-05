# Troubleshooting

| Symptom | Check and resolution |
| --- | --- |
| Box shifted by crop offset twice | Keep local relationships; scale on a zero-offset frame when appending a separate scale node. See [concepts](concepts.md). |
| Normalized child point unexpectedly clipped | Use `point.toPoint(parent).toChildSpace(parent, child)` for parent-normalized input. See [recipes](recipes.md). |
| One-pixel point/box disagreement | Point conversion truncates; box conversion rounds ties to even. |
| IllegalArgumentException translating | Check parent input bounds, explicit chain direction, scales, and resulting parent bounds. |
| Empty chain throws | Supply an initial frame. Empty parent-list point conversion is an exception to this rule. |
| Data-class box dimensions disagree | Replace raw constructor/copy with `from2P` or `fromPS`. |
| Coordinates fit mathematically but image differs | Match the host's actual crop, scaling, rotation and mirror operations. This library does not perform image processing. |
| Gradle dependency cannot resolve | Use the confirmed coordinates and repositories in [IMPORT.md](../../IMPORT.md); building needs JDK 17 and network access to Gradle/Maven repositories. |
| Site links break on GitHub Pages | Keep the configured project base; run `cd sites && npm ci && npm run check`. Use Pages source GitHub Actions. |
