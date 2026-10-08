# Documentation maintenance and coverage

This standalone repository owns its geometry contracts, examples, site and agent guides. There is no central architecture repository dependency. Host projects should link here for coordinate contracts and keep image acquisition, rotation, inference and rendering architecture in their own documentation.

## Sources and commands

- `docs/agents/index.md` is the small task router. Focused guides are canonical for both humans and agents.
- `sites/` builds Astro/Starlight HTML and copies rewritten raw Markdown to `/agents/*.md`, plus `/IMPORT.md` and `/llms.txt` under the project base. Raw links stay raw; source links point back to GitHub.
- `docs/site-home.md` owns the landing page. `IMPORT.md` is generated exclusively by the confirmed-release tooling; site generation only reads it.
- Quickstart snippets come from marked Kotlin demo source. Run `cd sites && npm ci && npm run sync`, commit updated canonical Markdown, then `npm run check`. CI checks snippet drift before regenerating output.
- Run `./gradlew test runExamples verifyImportDocs` with JDK 17. Node 22.12+ is required for the site. No Android SDK.
- The site checker validates local HTML/raw Markdown links, anchors, images, required outputs and the GitHub Pages project base. It does not check external service availability. Review API signatures against source when changing public declarations.

## Coverage

Human pages and agent guides are generated from the same source below. All demos live in [DocumentationExamplesTest.kt](../src/test/java/com/apexfission/android/math/examples/DocumentationExamplesTest.kt).

| Feature | Human site route | Agent source | Executable coverage | Visual |
| --- | --- | --- | --- | --- |
| Installation | installation | [Quickstart](agents/quickstart.md), [IMPORT](../IMPORT.md) | Gradle test classpath | None |
| Pixel/normalized models and factories | reference | [API](agents/api.md) | rounding, box offset assertions; existing model tests | None |
| Crop and scale | concepts | [Concepts](agents/concepts.md) | viewport, crop, scale assertions | crop.svg |
| Parent/child chains | getting-started | [Quickstart](agents/quickstart.md) | forward/reverse crop assertions | crop.svg |
| Detector boxes | task-recipes | [Recipes](agents/recipes.md) | normalized detector assertion | None |
| Normalized point helper | task-recipes | [Recipes](agents/recipes.md) | explicit source conversion and current helper comparison | None |
| Clipping and rounding | limitations | [Limitations](agents/limitations.md) | rounding/clipping assertions and existing transformation tests | None |
| Build and release | releases | [Runbook](releases.md) | release tooling tests, CI Gradle build | None |

## Visual policy

This numerical library has no UI to capture. Do not add an emulator, browser screenshot pipeline, or fabricated application images. `sites/public/crop.svg` is an authored, dimensionally scaled diagram whose numeric claims are exercised by the demo. Keep its labels synchronized when the example changes.

For a future UI demo, capture real deterministic output during content authoring when visual behavior changes, inspect it, and commit selected images with provenance. CI should verify capture inputs and image freshness on relevant changes; optionally regenerate in a pinned environment. Publishing should consume reviewed assets, rather than capturing new unreviewed images or making a Maven release depend on screenshot infrastructure.

## Deployment

The documentation workflow tests Kotlin examples and builds/validates the site on pull requests and main pushes. Only main and successful main release workflows deploy. `workflow_run` rebuilds current main after release tooling's GITHUB_TOKEN documentation commit, which does not itself trigger a push workflow. It never executes pull-request artifacts or releases a library.

Set GitHub Pages source to **GitHub Actions** in repository settings. A manual documentation dispatch retries publication independently of Maven Central. Site deployment failures do not invalidate a confirmed package release. Preserved legacy HTML is development documentation. Version-scoped English and Spanish guides and exact installation pages are built from the complete confirmed catalog; IMPORT remains the latest confirmed installation record.

## Version and language authoring

Canonical English remains `docs/agents/`; Spanish prose lives in `docs/es/`. Review translations against the English contract and preserve code fences, then record that page's SHA-256 in `docs/es/translations.json`. Missing or stale Spanish pages display English from the same selected documentation revision with a Spanish notice. Heading aliases retain canonical deep links. Changing a hash alone is not translation review.

`npm run sync` expands the canonical quickstart from the executable Kotlin source before rendering. Historical pages read Git objects as data with the current renderer; historical scripts are never executed. Every build clears generated output and reconstructs all archived releases and both languages. Full Git history is required; missing objects fail instead of substituting current guides. Explicit slugs preserve dotted versions.

Routes are `/{en,es}/coordinates/{version}/{guide}/`, with matching `raw/{guide}.md`. Index raw files are `raw/index.md`. `versions.json` lists every scope; `/llms.txt` offers agent discovery. Existing routes remain valid development views. Selectors retain the guide; unavailable guides lead to the target index with a visible notice. Catalogs work without JavaScript. Source implementation links use release SHA; executable documentation links use documentation SHA.

## Archive boundary and corrections

The archive starts at confirmed Maven Central 0.1.0, source `4af3c2e6e2c3bddc66552e0bcf5b3d65e9cb8415`, immutable legacy tag `v0.1.0`. Focused manuals did not exist there. Its explicitly reviewed postrelease documentation revision is retained main commit `427c899c946199044a039737cc05ef19cef5c46b`. `git diff` between those commits for `src/main` and `gradle/libs.versions.toml` is empty. The latter revision added executable tests and the `runExamples` task, so run those commands from the documentation revision, not the release checkout. This does not claim the manuals existed on release day.

`scripts/documentation_history.py export` supplies exact destination coordinates and install blocks from `docs/releases/history/coordinates/*.json`. Finalization archives confirmed records before changing latest pointers. Never hand-edit generated IMPORT. A corrected `documentation_ref` must be retained immutable history and reviewed against the old API; do not use an unmerged commit or move a code tag. An optional `translation_tree` pins reviewed Spanish content independently; retain that exact tree in merged Git history, and preserve canonical hash checks. New docs or translations do not require republishing packages.

Focused site tests include synthetic Git archives, same-revision fallback, immutable translation trees, exact installs, explicit semver routes and legacy guide mapping. `npm run check` validates all generated HTML/raw links, selectors and anchors; it does not claim browser visual verification. The publication/recovery workflow trigger validates main, repository and success, checks out latest main with full history, and rejects stale builds. A manual documentation dispatch retries only documentation and cannot publish packages.
