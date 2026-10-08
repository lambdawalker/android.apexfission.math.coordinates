# Installation

Generated from confirmed destination records. JVM 11 compatible; no Android SDK is required.

## coordinates: coordinates

Confirmed version: **0.1.0**. Source: [4af3c2e6e2c3bddc66552e0bcf5b3d65e9cb8415](https://github.com/lambdawalker/android.apexfission.math.coordinates/commit/4af3c2e6e2c3bddc66552e0bcf5b3d65e9cb8415).

Choose **one** destination below and **one** dependency syntax. Each destination provides this same release; do not add duplicate dependencies.

### maven-central

Repository: **maven-central**.

#### Gradle Kotlin DSL

In `settings.gradle.kts`:

```kotlin
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```

In the project's `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.apexfission.android.math:coordinates:0.1.0")
}
```

#### Gradle Groovy DSL

In `settings.gradle`:

```groovy
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```

In the project's `build.gradle`:

```groovy
dependencies {
    implementation 'com.apexfission.android.math:coordinates:0.1.0'
}
```

#### Version catalog

Use the dependency repositories shown above. Add to `gradle/libs.versions.toml`:

```toml
[libraries]
coordinates = { module = "com.apexfission.android.math:coordinates", version = "0.1.0" }
```

Then use this instead of the direct dependency in the project's `build.gradle.kts`:

```kotlin
dependencies {
    implementation(libs.coordinates)
}
```

#### Maven

Add these repositories and dependency to `pom.xml`:

```xml
<repositories>
  <repository>
    <id>central</id>
    <url>https://repo.maven.apache.org/maven2</url>
  </repository>
</repositories>
<dependencies>
  <dependency>
    <groupId>com.apexfission.android.math</groupId>
    <artifactId>coordinates</artifactId>
    <version>0.1.0</version>
  </dependency>
</dependencies>
```
