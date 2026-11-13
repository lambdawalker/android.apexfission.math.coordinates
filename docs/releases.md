# Coordinates release runbook

Coordinates is one **root Kotlin/JVM library**, published as a JAR with JVM 11 bytecode. Keep the existing Gradle 9.6.0 wrapper, Kotlin 2.4.20 and JDK 17. No Android SDK, variants, demo APK, or Android publication tasks are involved. Kotlin stdlib is a public dependency; compile-only Compose runtime must not appear in the POM or Gradle dependencies.

## Owner setup

Reuse the repository's **maven-central** environment and existing `MAVEN_CENTRAL_USERNAME`, `MAVEN_CENTRAL_PASSWORD`, `SIGNING_IN_MEMORY_KEY`, and optional `SIGNING_IN_MEMORY_KEY_PASSWORD` secrets. The namespace is `com.apexfission.android.math`, artifact `coordinates`. Keep the signing public key available to Central. Public JitPack uses the **jitpack** environment with **no credentials**. Configure **delayed-docs** with a **15-minute environment wait timer**; YAML names this environment but cannot install its timer. The delay holds neither a runner nor the release lock.

The Actions identity must be permitted to create immutable tags, delete completed attempt markers, and advance main under existing branch rules. Do not introduce bypass credentials or weaken protection. The registry in `publishing/repositories.yml` enables exactly Central and JitPack; regenerate its dropdowns and public Gradle properties with `python3 scripts/publishing_config.py generate`. There is no generic/private Maven publishing path.

## Validate without publishing

```bash
python3 -m pip install -r scripts/requirements-publishing.txt
python3 -m unittest discover -s scripts/tests -v
python3 scripts/publishing_config.py check
python3 scripts/module_release.py verify
sh ./docs.sh history verify
./gradlew test runExamples verifyImportDocs build publishAllPublicationsToVerificationRepository -PreleaseVersion=9.8.7
python3 scripts/module_release.py check-local --module coordinates --version 9.8.7 --source "$(git rev-parse HEAD)"
RELEASE_REPOSITORY=jitpack ./gradlew publishAllPublicationsToVerificationRepository -PjitpackBuild=true -PreleaseVersion=9.8.7
RELEASE_REPOSITORY=jitpack python3 scripts/module_release.py check-local --module coordinates --version 9.8.7 --source "$(git rev-parse HEAD)"
(cd sites && npm ci && npm run check)
```

Use a clean tracked checkout for `check-local`. These tasks write a local build repository only; `9.8.7` is test data. The verifier checks JAR class headers and JVM 11 target, Kotlin sources, text documentation, POM metadata/dependencies, and both Gradle API/runtime variants, JVM target and dependencies. New documentation JARs contain only `docs/agents/**/*.md` and LICENSE, excluding mutable installation records, translated site pages and media. Historical artifact verification preserves the original byte hashes.

## Shared version identity

Run **Publish coordinates library** manually on main and select `maven-central` or `jitpack`. Leave version blank for automatic selection; an explicit stable X.Y.Z above the latest identity at the selected destination permits a major/minor/patch override. Prereleases are not supported. New repositories require an explicit initial version; this repository already has proven 0.1.0 history.

New tags use `coordinates/vX.Y.Z-DESTINATION`. It identifies source, not successful publication. History includes confirmed destination records, historical immutable source tags, and durable pending/uploading tags. Semantic versions sort numerically. Conflicting source SHAs, older source checkouts, malformed/network-failed registry reads, untracked public collisions and unexplained newer Central versions stop publication.

Unchanged inputs reuse the latest version at the selected destination **and original source commit**. A destination already confirming that identity exits without upload or mutation. Changed inputs on a descendant allocate the next destination patch. Fingerprints include root `src/main`, build/settings files, Gradle catalog/wrapper, gradle.properties, LICENSE, canonical packaged guides, JitPack configuration, scripts except tests, public publishing configuration and the shared publication workflow. Generated IMPORT, release records, history, translations and site-only edits are excluded. Build protocol changes count as inputs, so an old release without JitPack support is never rebuilt by overlaying new tooling under its historical version.

Central coordinates remain `com.apexfission.android.math:coordinates:X.Y.Z`. JitPack uses `com.github.lambdawalker:android.apexfission.math.coordinates:coordinates~vX.Y.Z-jitpack`, the provider's slash-tag consumer form. Its `jitpack.yml` validates the canonical tag and full commit SHA, then invokes the **root** `publishToMavenLocal` task with unsigned JitPack coordinates. Central credentials and signing are disabled in that mode.

## Journal, publication and confirmation

Tests, runnable examples, site checks and full local publication run before reservation. An atomic push reserves the canonical source tag (if absent) and annotated JSON journal `release-pending/coordinates/X.Y.Z` for Central or `release-pending/jitpack/coordinates/X.Y.Z` for JitPack. The journal records source, semantic/consumer versions, destination, coordinates and every artifact hash. Neither tag advertises availability.

Central's Gradle guard creates `release-uploading/coordinates/X.Y.Z` before any Central upload task; a second invocation is rejected. Use the workflow, never bypass the guard with a generic publication command. Upload logs are retained for 30 days. After the separate delay, finalization polls public bytes for up to 40 minutes and verifies every reserved hash plus detached signature presence. Central validates signature cryptography during deployment. JitPack requests the public artifact, polls up to 30 minutes, requires API success at the exact reserved commit, validates JAR/POM/source/docs and optional `.module`, and compares source/docs entry hashes with the candidate. Its provider-generated public hashes replace candidate byte hashes only after these checks.

Only successful provider confirmation writes `docs/releases/coordinates.json` or `docs/releases/jitpack/coordinates.json`, archives the version in `docs/releases/history/coordinates/`, and regenerates IMPORT.md. The latest installation page advertises only destinations confirming the latest confirmed release at each destination. Older archives keep their own confirmed destinations. A newer Central release does not imply JitPack availability or vice versa.

Finalization uses trusted current tooling, checks the journal's immutable source, preserves concurrent main changes, refuses same/newer destination metadata and protocol/renderer drift, then atomically pushes documentation and removes exact attempt tags. There is no force-push or tag movement. No release uploads occur in **Finalize coordinates release**.

## Recovery and legacy migration

Inspect the original provider outcome before any retry:

```bash
git fetch origin main --tags
git ls-remote --refs origin 'refs/tags/release-*'
git show release-pending/coordinates/X.Y.Z
```

| State | Action |
| --- | --- |
| Validation failed before reservation | Fix and run publication again. |
| Journal exists, outcome unknown/processing/partial | Keep every marker; inspect Central Portal or JitPack logs. Never re-upload. |
| Public artifacts complete, documentation push failed | Run **Finalize coordinates release** with the same destination/version. |
| Already completed identity | Finalize validates the source and confirmed record, then exits without mutation. |
| Provider definitively rejected and no artifact can become public | A maintainer may delete only that investigated pending/uploading pair. Preserve canonical source tags. |
| Branch protection rejects docs | Keep journals; confirm, review generated IMPORT, latest record and archive in a PR, then have an authorized maintainer reconcile exact tags atomically. Never upload again. |

Original `release-pending/X.Y.Z` and `release-uploading/X.Y.Z` markers block every new allocation. **Finalize coordinates release** on Central can read the original annotated journal, verify its exact bytes, normalize its identity without overwriting hashes, create/preserve its original `vX.Y.Z` source tag, archive it and atomically remove the legacy markers. Mixed legacy/scoped journals require investigation. An orphan upload marker is not proof of failure and must not be deleted automatically. The original `release.py` and shell recovery helper remain for regression coverage/historical recovery; new workflows exclusively use `module_release.py`.

`docs/release.json` remains the immutable legacy evidence for the confirmed 0.1.0 publication at `4af3c2e6e2c3bddc66552e0bcf5b3d65e9cb8415`, tagged `v0.1.0`. It is not the latest-release pointer. That proven record was migrated without republishing or inventing a source. Its archive's documentation_ref is the reviewed postrelease manual at `427c899c946199044a039737cc05ef19cef5c46b`: source under `src/main` and the dependency catalog match the release, while focused manuals were introduced later. The retained translation tree records reviewed Spanish guides separately; it does not claim Spanish pages shipped in the original JAR.

## Destination-scoped publishing and recovery

Enter plain `X.Y.Z` in the workflow. Maven Central reserves `coordinates/vX.Y.Z-maven-central` and keeps `X.Y.Z` in its dependency coordinates. JitPack reserves `coordinates/vX.Y.Z-jitpack` and publishes consumer version `coordinates~vX.Y.Z-jitpack`. The same semantic version can identify different commits on different destinations. Existing tags, journals, and published coordinates remain valid.

Leave **allow_pending_jitpack** off for normal releases. Enable it only to publish an explicit newer JitPack version while an older pending attempt remains unresolved. The workflow preserves the older tags and journals, checks their source provenance, and keeps upload-started markers and artifact verification enforced. Maven publishing does not use this checkbox.

Use the dedicated **Finalize** workflow from the current release branch for an already reserved version. It verifies the original artifact source and only then updates installation metadata. New archive entries are scoped to the destination, so two providers with the same semantic version can retain separate source and documentation revisions.
