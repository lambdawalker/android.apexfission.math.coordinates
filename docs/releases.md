# Maven Central release runbook

## Publication and compatibility

This repository publishes one Kotlin/JVM artifact, configured by `GROUP` and
`POM_ARTIFACT_ID` in `gradle.properties`. It is a JAR, not an Android AAR; there
are no Android variants or application modules. The library retains its
`com.apexfission.android.math` Kotlin packages and JVM 11 bytecode.

Build tools: the existing Gradle 9.6.0 wrapper, Kotlin 2.4.20, JDK 17 to run
Gradle, and Python 3.12 for release tooling. No Android SDK is required. The
Vanniktech publishing plugin is pinned to 0.37.0. A publication includes the main
JAR, sources JAR, documentation JAR, POM, Gradle module metadata, and detached
ASCII-armored signatures. The documentation classifier contains the maintained
Markdown guides, not a generated Dokka API reference. Compile-only Compose
annotations do not become a transitive runtime dependency; Kotlin stdlib does.

Humans and agents must read [IMPORT.md](../IMPORT.md) for installation and the
last confirmed released coordinates. A development version is not a release.

## Owner setup (before running anything)

1. Create the **maven-central** GitHub environment in
   **lambdawalker/android.apexfission.math.coordinates**. An environment in the
   permissions repository does not apply here. Add any desired approvals and
   restrict deployment branches to `main`.
2. Verify ownership of the namespace covering `com.apexfission.android.math` in
   Central Portal. This spelling is intentional; the permissions repository's
   differently spelled Maven group was not copied. If your verified namespace
   differs, change `GROUP` before the first release.
3. Create a Central Portal user token. Add these environment secrets:

   | Secret | Value |
   | --- | --- |
   | `MAVEN_CENTRAL_USERNAME` | Portal token username, not interactive login |
   | `MAVEN_CENTRAL_PASSWORD` | Portal token password |
   | `SIGNING_IN_MEMORY_KEY` | Complete ASCII-armored private signing key |
   | `SIGNING_IN_MEMORY_KEY_PASSWORD` | Passphrase if the key is encrypted; otherwise omit |

   Publish the corresponding public key to a Central-supported keyserver. Keep
   private keys/tokens out of the repository and build caches. The release job
   disables Gradle caching and passes secrets only to the publication step.
4. Ensure repository rules permit the configured Actions bot to make the
   documentation commit and create/delete attempt tags and create stable tags.
   Do not add bypass credentials or weaken branch protection just to run this.
   If direct bot writes are forbidden, follow the protected-branch procedure below.
5. Decide the first stable version. No version has been assumed: supply
   `initial_version`, such as `0.1.0`, on the first release run.

## Validate without publishing

Run locally, or manually run **Verify release tooling (no publication)**. It
also runs on pull requests; there is intentionally no push trigger in this setup.
Neither workflow was dispatched while preparing this repository.

```bash
python3 -m unittest discover -s scripts/tests -v
python3 scripts/release.py verify
bash -n scripts/finalize-release.sh
./gradlew generateImportDocs verifyImportDocs build publishAllPublicationsToVerificationRepository -PreleaseVersion=9.8.7
python3 scripts/release.py check-local --version 9.8.7 --source "$(git rev-parse HEAD)"
```

The verification repository is a local directory under `build/`, not Central.
Use a clean tracked worktree: artifact validation checks the selected source SHA.
The sentinel version `9.8.7` above is only local test data. It does not change
installation documentation or reserve a release. On Windows use `gradlew.bat`;
release helper execution requires a `python3` executable (WSL is suitable).

## Ordinary release

After setup, manually run **Publish coordinates library** on **main**. For the
first release provide `initial_version`; thereafter leave both inputs empty.
The workflow checks out the dispatch event's immutable SHA, not a later moving
branch tip. It fetches full history/tags, verifies main ancestry, and allocates
the next stable patch with numeric semantic ordering (`0.1.10` follows `0.1.9`).

Prereleases and unrelated tags do not advance the stable stream. Major/minor
changes and prerelease publication are intentionally unsupported by this
workflow; introduce a reviewed policy change first. `initial_version` cannot
be used to skip versions once stable history exists.

All stable `vX.Y.Z` tags must appear in Central metadata. Central ahead of an
existing tagged stream stops allocation for provenance investigation. If there
are published versions but no stable tags, allocation starts from their latest
stable version without inventing historical tags. Only an actual HTTP 404 for
metadata means no registry history; network failures, invalid XML, wrong identity,
and empty malformed metadata stop the release.

Tests and a complete local publication run before a reservation. The validator
checks POM identity, license/developer/SCM metadata, dependency scopes, JVM class
files, Kotlin sources, docs, and Gradle module identity. It records SHA-256 hashes
of the entire intended unsigned publication set.

Before uploading, an annotated **release-pending/X.Y.Z** tag is durably pushed,
pointing to the exact source commit. Its JSON journal contains version, coordinates,
source, artifact suffixes/hashes, phase, and Actions run ID. The Gradle guard then
creates **release-uploading/X.Y.Z** before any Central task can upload. A second
upload attempt is rejected, including manual task invocations and workflow reruns.
The repository-wide concurrency group serializes normal runs; the remote tags
also guard against interrupted/manual attempts. Neither marker claims success.

The actual remote task is:

```bash
./gradlew publishAndReleaseToMavenCentral -PreleaseVersion=X.Y.Z
```

It requires credentials and the matching remote reservation; a bare invocation
is intentionally insufficient. Development builds default to `0.0.0-SNAPSHOT`
and cannot accidentally publish it. Use the workflow rather than bypassing its
reservation/verification steps or running generic Gradle publish tasks manually.

After the plugin returns, public confirmation polls for up to 40 minutes with
bounded network retries. It checks every artifact's content and reserved hash,
plus its detached signature file. Signature format/existence is checked locally;
Central performs signature validation during deployment. This independently
confirms public availability, not merely staging acceptance. Preserve the plugin
log (uploaded as an Actions artifact for 30 days) and locate its deployment ID,
when emitted, or find the version/run in Central Portal. Logs are not the durable
journal; the pending tag survives runner loss.

Only then are `docs/release.json` and `IMPORT.md` updated. The stable tag `vX.Y.Z`
points to the artifact source SHA, not the later docs commit. The final push
atomically advances main, creates the stable tag, and removes both attempt
markers. No force push or existing tag movement is used.

## Generated installation reference

Edit `docs/templates/IMPORT.md.template`; do not hand-maintain dependency versions
in README, guides, or agent instructions. `generateImportDocs` and
`verifyImportDocs` use `docs/release.json`, the last confirmed publication record.
Before the first release that record is `null`, and IMPORT.md explicitly says no
release is confirmed instead of offering an unpublished dependency.

A new `releaseVersion` does not rewrite IMPORT.md. `release.py confirm` verifies
the reserved public publication and writes the record before regeneration.
Without confirmation, local regeneration retains released coordinates even when
development coordinates change; verification flags that mismatch for review.
Rendering is deterministic and rejects unknown placeholders.

## Failure recovery

Do not blindly rerun a failed normal publication. Inspect Actions logs, the JSON
journal, both attempt markers, and Central Portal first:

```bash
git fetch origin main --tags
git show release-pending/X.Y.Z
git ls-remote --refs origin 'refs/tags/release-*'
```

| Outcome | Safe next action |
| --- | --- |
| Validation failed before reservation | Fix/test and start a new normal run; nothing was uploaded. |
| Reserved, but credentials/build failed before upload marker | Confirm no external deployment exists; follow the definitive-failure procedure below. |
| Upload marker exists; timeout, lost runner, or unknown result | Keep both tags; inspect Portal. An upload may have been accepted. Never re-upload. |
| Deployment is still processing | Wait for Portal to reach a terminal state; keep markers. |
| Some artifacts/signatures are public | Keep markers; reconcile the whole intended publication set with Portal/Sonatype. Public artifacts are immutable; there is no automatic rollback. |
| Published successfully, docs/tag push failed | Run with `resume_version=X.Y.Z`; leave `initial_version` empty. |
| Exact release already finalized | Repeating recovery for the currently recorded release verifies public artifacts and exits without uploads or new commits. |
| Existing stable tag points elsewhere | Stop and investigate; do not move it or invent provenance. |

Recovery resolves the original source from the annotated pending tag, skips tests,
rebuilds, reservation, and upload, then verifies the original hash-identified
artifact set. It retries docs and tag finalization only. Recovery never uses the
newest main source as a substitute for the published source.

For a **definitively failed/rejected attempt**, first confirm with Central Portal
that no deployment can still publish and that none of the intended artifacts are
public. If any uncertainty remains, keep the reservation. Only after that manual
investigation may a maintainer delete exactly that attempt's references:

```bash
# Replace X.Y.Z with the investigated failed version; never use a wildcard.
git push --atomic origin :refs/tags/release-pending/X.Y.Z :refs/tags/release-uploading/X.Y.Z
# Delete matching local tags too, if present, before retrying from this checkout.
```

If the uploading marker was never created, omit its deletion ref. Do not delete
stable release tags. A confirmed rejection can be retried via a fresh normal run
only after these exact markers are cleared; immutable published coordinates must
never be reused.

## Concurrent work and protected branches

Finalization fetches current main and preserves unrelated commits. It stops when
installation inputs, coordinates, version catalog, build files, or release tooling
changed in flight. Reconcile these changes explicitly; never force main back to
the source SHA. Fast-forward races and branch-protection rejection cause the
atomic push to fail, retaining the reservation and original released-version docs.

If branch protection requires PRs, after successful public confirmation create a
PR containing **only IMPORT.md and docs/release.json** generated from the original
journal (run `release.py confirm` at the recorded source). Review and merge through
the existing repository process. Then an authorized maintainer should verify the
merged files match the confirmed record/source and atomically create the stable
tag at that source and delete the two exact attempt markers, without updating main.
Do not upload again. Automated finalization deliberately stops on these manually
changed installation files; complete the final tag bookkeeping manually under the
repository's existing rules. A subsequent completed recovery verifies the result.

The independent [documentation workflow](documentation.md) deploys the human site and raw agent guides. It uses a trusted successful `workflow_run` to refresh installation docs after GITHUB_TOKEN release commits, which do not normally trigger push workflows. Maven publication remains manual.
No GitHub Release or demo APK is created; the release is the Maven artifact set
and its source tag.

## References checked for this setup

- [Vanniktech Central publishing, credentials, and publish-and-release task](https://vanniktech.github.io/gradle-maven-publish-plugin/central/)
- [Kotlin/JVM publication configuration](https://vanniktech.github.io/gradle-maven-publish-plugin/what/#kotlin-jvm-library)
- [Central requirements](https://central.sonatype.org/publish/requirements/)
- [Reference permissions release workflow](https://github.com/lambdawalker/android.apexfission.permissions/blob/main/.github/workflows/publish-permission.yml)
