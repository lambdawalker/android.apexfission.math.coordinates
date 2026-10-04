# Apexfission Coordinates

Kotlin/JVM geometry library for pixel and normalized coordinates, image spaces, and directional transformations. Package names remain `com.apexfission.android.math`.

## Maven installation and releases

Read [IMPORT.md](IMPORT.md) for authoritative Maven coordinates, confirmed released
versions, and dependency examples. Humans and AI agents must use that file rather
than infer versions from source or tags. See the [release runbook](docs/releases.md)
for environment setup, manual publishing, and recovery. No release is performed
by committing or pushing source changes.

## Build and test

Use JDK 17 or newer to run Gradle. Library bytecode targets JVM 11; an Android SDK is not required.

```bash
./gradlew build
./gradlew test
```

On Windows, use `gradlew.bat`. The library JAR is written to `build/libs/`.
Compose runtime is a compile-only dependency for stability annotations.

## Use as a source module

Clone this repository into your project's `coordinates/` directory, or add it as a Git submodule. In the host project's `settings.gradle.kts`:

```kotlin
include(":coordinates")
```

The host version catalog must provide `libs.plugins.jetbrains.kotlin.jvm`, `libs.junit`, and `libs.androidx.compose.runtime`, matching this repository's `gradle/libs.versions.toml`. The host must configure Google and Maven Central repositories.

Then add `implementation(project(":coordinates"))` to consuming modules.
Maven publication is configured for standalone builds. Source-module consumers keep
their local project dependencies; publishing is managed in this repository.

## Documentation

- [Geometry guide](docs/guide.md)
- [Package map](docs/packages.md)
- [Testing](docs/testing.md)
- [License](LICENSE)

## Origin

Extracted without Kotlin source or test changes from the `coordinates` module of
[android.card_detection_lite](https://github.com/lambdawalker/android.card_detection_lite)
at commit `3c2700d2bea1171a044473a58f25153df928bf88`.
The original repository consumes this library as a pinned Git submodule.
