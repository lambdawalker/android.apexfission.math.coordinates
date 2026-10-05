<!-- GENERATED FILE. Edit docs/templates/IMPORT.md.template.
Regenerate: ./gradlew generateImportDocs
Released metadata: docs/release.json (written only after public verification).
-->
# Install Apexfission Coordinates

Confirmed release: **0.1.0** · Maven coordinates: `com.apexfission.android.math:coordinates:0.1.0`.

This is the authoritative installation, Maven coordinate, and released-version
reference for humans and AI agents. Read this file instead of guessing a version.

## Gradle Kotlin DSL

Add `mavenCentral()` to your settings repositories, then:

```kotlin
dependencies {
    implementation("com.apexfission.android.math:coordinates:0.1.0")
}
```

## Gradle Groovy DSL

```groovy
dependencies {
    implementation 'com.apexfission.android.math:coordinates:0.1.0'
}
```

## Version catalog

```toml
[versions]
apexfission-coordinates = "0.1.0"

[libraries]
apexfission-coordinates = { module = "com.apexfission.android.math:coordinates", version.ref = "apexfission-coordinates" }
```

```kotlin
implementation(libs.apexfission.coordinates)
```

## Maven

```xml
<dependency>
    <groupId>com.apexfission.android.math</groupId>
    <artifactId>coordinates</artifactId>
    <version>0.1.0</version>
</dependency>
```

Built from source commit [`4af3c2e6e2c3bddc66552e0bcf5b3d65e9cb8415`](https://github.com/lambdawalker/android.apexfission.math.coordinates/commit/4af3c2e6e2c3bddc66552e0bcf5b3d65e9cb8415).

This is a Kotlin/JVM JAR targeting JVM 11, suitable for Android and JVM projects.
It has no Android SDK, CameraX, bitmap, or TFLite dependency. Kotlin standard
library is transitive; Compose runtime is compile-only for stability annotations
and is not a transitive runtime requirement. Kotlin consumers need a compiler
compatible with the published Kotlin metadata (currently built using Kotlin 2.4.20).

See the [geometry guide](docs/guide.md) for usage and
[release runbook](docs/releases.md) for publishing and recovery.
