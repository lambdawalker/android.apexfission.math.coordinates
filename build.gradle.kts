import com.vanniktech.maven.publish.JavadocJar
import com.vanniktech.maven.publish.KotlinJvm
import com.vanniktech.maven.publish.SourcesJar
import java.util.Properties

plugins {
    id("java-library")
    alias(libs.plugins.jetbrains.kotlin.jvm)
    id("com.vanniktech.maven.publish") version "0.37.0"
}

val releaseVersion = providers.gradleProperty("releaseVersion")
require(releaseVersion.orNull?.matches(Regex("(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)")) != false) {
    "releaseVersion must be a stable X.Y.Z version"
}
val publicationProperties = Properties().apply {
    layout.projectDirectory.file("gradle.properties").asFile.inputStream().use { load(it) }
}
val publicationGroup = publicationProperties.getProperty("GROUP")
val publicationArtifact = publicationProperties.getProperty("POM_ARTIFACT_ID")
val projectUrl = "https://github.com/lambdawalker/android.apexfission.math.coordinates"

java {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}
kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11
    }
}

dependencies {
    testImplementation(libs.junit)
    compileOnly(libs.androidx.compose.runtime)
}

mavenPublishing {
    // Set coordinates before creating publications, which finalizes these values.
    coordinates(publicationGroup, publicationArtifact, releaseVersion.orElse("0.0.0-SNAPSHOT").get())
    configure(KotlinJvm(javadocJar = JavadocJar.Empty(), sourcesJar = SourcesJar.Sources()))
    publishToMavenCentral()
    // Ordinary builds and the local verification repository never need secrets.
    if (providers.gradleProperty("signingInMemoryKey").isPresent) signAllPublications()
    pom {
        name.set("Apexfission Coordinates")
        description.set("Kotlin/JVM pixel and normalized geometry with directional image-space transformations.")
        inceptionYear.set("2026")
        url.set(projectUrl)
        licenses {
            license {
                name.set("The Apache License, Version 2.0")
                url.set("https://www.apache.org/licenses/LICENSE-2.0.txt")
                distribution.set("repo")
            }
        }
        developers {
            developer {
                id.set("lambdawalker")
                name.set("David Garcia")
                url.set("https://github.com/lambdawalker")
            }
        }
        scm {
            url.set(projectUrl)
            connection.set("scm:git:$projectUrl.git")
            developerConnection.set("scm:git:ssh://git@github.com/lambdawalker/android.apexfission.math.coordinates.git")
        }
    }
}

// Ship the maintained guides in the documentation classifier; do not pretend
// that Java's javadoc tool generates an API reference for Kotlin sources.
tasks.named<com.vanniktech.maven.publish.tasks.JavadocJar>("emptyJavadocJar") {
    from("README.md", "IMPORT.md", "LICENSE")
    from("docs") { into("docs") }
}
tasks.withType<org.gradle.jvm.tasks.Jar>().configureEach {
    isPreserveFileTimestamps = false
    isReproducibleFileOrder = true
}

publishing {
    repositories {
        maven {
            name = "verification"
            url = layout.buildDirectory.dir("verification-repository").get().asFile.toURI()
        }
    }
}

val verifyCentralReservation = tasks.register<Exec>("verifyCentralReservation") {
    group = "publishing"
    workingDir(projectDir)
    commandLine("python3", "scripts/release.py", "guard", "--version", releaseVersion.orElse("").get())
    doFirst {
        listOf("mavenCentralUsername", "mavenCentralPassword", "signingInMemoryKey").forEach {
            require(!providers.gradleProperty(it).orNull.isNullOrBlank()) { "Missing release credential: $it" }
        }
    }
}
// Guard upload and aggregate/close/release tasks, not just the final lifecycle task.
tasks.configureEach {
    if (name.contains("MavenCentral", ignoreCase = true)) dependsOn(verifyCentralReservation)
}

listOf("generateImportDocs" to "generate", "verifyImportDocs" to "verify").forEach { (taskName, command) ->
    tasks.register<Exec>(taskName) {
        group = "documentation"
        description = "${command.replaceFirstChar { it.uppercase() }} installation documentation from confirmed release metadata"
        workingDir(projectDir)
        commandLine("python3", "scripts/release.py", command)
    }
}

// Executable documentation uses the test classpath and never enters the published JAR.
tasks.register<JavaExec>("runExamples") {
    group = "verification"
    description = "Run and assert the coordinate documentation scenarios."
    dependsOn(tasks.named("testClasses"))
    classpath = sourceSets["test"].runtimeClasspath
    mainClass.set("com.apexfission.android.math.examples.DocumentationExamplesTestKt")
}
