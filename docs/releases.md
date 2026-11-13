# Coordinates release runbook

Coordinates is one root Kotlin/JVM library. It publishes a JAR with Java 11
bytecode; Gradle 9.6.0, Kotlin 2.4.20 and the existing dependency versions are
unchanged. CI uses JDK 17; no Android SDK or Android publication plugin is needed.

## Tooling and configuration

`setup.sh` / `setup.bat` install the pinned shared setup/release CLI. The current
pin is v0.1.27 plus the parser correction in
[CLI PR #45](https://github.com/lambdawalker/gradle.android-repo-setup/pull/45), at
`fe34dbd5b996d492c49786d08d3d7f2d1e73c5ab`. The released binary rejects the existing
`site.pages` documentation metadata; this source pin is temporary until a release
contains the correction. Source installation requires Rust. The independent docs
pin retains the Astro migration behavior; changing setup does not change it.

- `.project/setup/config.yaml` selects root module `coordinates`, JVM/JAR
  verification, tooling revision and workflow commands.
- `.project/setup/repositories.yml` enables exactly `maven-central` and `jitpack`.
  Its generated properties, module inventory and workflow manifest are managed by
  the CLI. Run `sh ./setup.sh workflows --overwrite` and
  `sh ./setup.sh publishing_config generate` after reviewing configuration edits.
- Gradle retains the JVM Maven publishing integration and POM metadata. The
  existing Android Gradle publication plugin is intentionally not applied here.
- `docs.sh` / `docs.bat` own installation generation, immutable history and the
  shared Astro site. Never hand-edit `IMPORT.md`.

There is no repository-local Python release engine or Python dependency install.
Release policy and its unit tests belong to the CLI. Consumer tests use the real
pinned CLI on isolated local JAR fixtures and never publish them.

## Validate without publishing

```sh
sh ./setup.sh --version
sh ./setup.sh bootstrap check
sh ./setup.sh workflows --check
sh ./setup.sh publishing_config check
sh ./setup.sh module_release verify
sh ./docs.sh bootstrap check
sh ./docs.sh history verify
node --test tests/*.test.mjs
./gradlew test runExamples verifyImportDocs --no-daemon
sh ./docs.sh build --check
node --test sites/tests/*.test.mjs
```

On Windows use `setup.bat` and `docs.bat` in place of the POSIX launchers.
To verify real local publication bytes, use a clean tracked checkout:

```sh
./gradlew publishAllPublicationsToVerificationRepository -PreleaseModule=coordinates -PreleaseVersion=9.8.7 --no-daemon
sh ./setup.sh module_release check-local --module coordinates --version 9.8.7 --source "$(git rev-parse HEAD)"
RELEASE_REPOSITORY=jitpack ./gradlew publishAllPublicationsToVerificationRepository -PjitpackBuild=true -PjitpackScopedTag=true -PreleaseModule=coordinates -PreleaseVersion=9.8.7 --no-daemon
RELEASE_REPOSITORY=jitpack sh ./setup.sh module_release check-local --module coordinates --version 9.8.7 --source "$(git rev-parse HEAD)"
```

These commands write only the local verification repository. `9.8.7` is test data;
no public version, reservation or tag is created. The contract verifies the
package prefix, bytecode/JVM 11 target, Kotlin standard library and absence of
compile-only Compose dependencies in POM/Gradle metadata. Documentation JARs retain
the existing Markdown-only inclusion under `docs/agents/` and LICENSE.

## Publish and recover

Use generated **Publish coordinates** with the destination and an optional plain
`X.Y.Z` version. It verifies the selected immutable source and local artifacts
before reserving or uploading. Central uses the existing **maven-central**
environment and secrets `MAVEN_CENTRAL_USERNAME`, `MAVEN_CENTRAL_PASSWORD`,
`SIGNING_IN_MEMORY_KEY` and optional `SIGNING_IN_MEMORY_KEY_PASSWORD`. JitPack uses
the **jitpack** environment without credentials. Keep the existing 15-minute wait
timer on **delayed-docs** for automatic Central finalization.

New releases use the CLI's shared `release-identity/coordinates/X.Y.Z` identity.
The source commit for that semantic version cannot conflict between providers.
Each destination still has independent pending/uploading journals, confirmed
metadata and consumer coordinates. Canonical source tags are
`coordinates/vX.Y.Z-maven-central` and `coordinates/vX.Y.Z-jitpack`; JitPack consumer
versions are `coordinates~vX.Y.Z-jitpack`. Existing tags/versions are not renamed.

For a known unfinished publication, use **SUB - Finalize Coordinates release**
with its original destination/version/source. Reconciliation handles proven
terminal failures and verified public artifacts; partial, active or uncertain
attempts retain their journals. Never delete an uncertain upload marker, re-upload
an immutable version, move a source tag or invent confirmation hashes. Branch
protection refusals preserve remote journals for reviewed recovery.

Generated publication/finalization workflows share the `android-repository-release`
lock. Retired workflows used `maven-central-coordinates`; let any old running
publication/finalizer finish before merging the migration, since GitHub does not
make different concurrency names share a lock. Old workflow files are removed so
future runs have one release engine and one Pages deployment path.

## Historical evidence and the existing pending JitPack attempt

The confirmed Central `0.1.0` at source
`4af3c2e6e2c3bddc66552e0bcf5b3d65e9cb8415` and `v0.1.0` tag remain intact.
`docs/release.json` is immutable legacy evidence; latest pointers and archives
remain under `docs/releases/`. Its reviewed later documentation revision remains
`427c899c946199044a039737cc05ef19cef5c46b`, with its retained translation tree.
Neither the CLI migration nor a docs build creates another package release.

The pre-migration JitPack journal
`release-pending/jitpack/coordinates/0.1.1` reserves original source
`bccbd95a01473cf7c582769dc7507798b2a7746c`, consumer version
`coordinates~v0.1.1`, and source tag `coordinates/v0.1.1`. It has original artifact
and source/document entry hashes but no verification snapshot/setup configuration.
The current CLI deliberately refuses to substitute today's verification contract.
This migration does not trigger that build or change any of those refs.

If recovery is needed, inspect the original Actions/JitPack outcome first. The
original Python verifier and its dependencies remain in Git at that immutable
source, even though the current checkout no longer needs Python. Use a separate
historical worktree and the original verifier to produce
`build/jitpack/confirmed-coordinates.json` only after verifying the original public
artifacts. Copy that exact confirmation record to the current checkout; the new
CLI finalizer can then validate it against the unchanged annotated journal and
finish the original attempt. Do not add a synthetic verification snapshot, change
its consumer version, allocate another version for recovery or bypass its hashes.
Running the original confirmation can trigger JitPack, so do this only as an
intentional recovery action. Original unscoped paired-release journals, if any,
retain their original recovery protocol.
