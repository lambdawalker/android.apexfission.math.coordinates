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

Set GitHub Pages source to **GitHub Actions** in repository settings. A manual documentation dispatch retries publication independently of Maven Central. Site deployment failures do not invalidate a confirmed package release. HTML is development documentation with an explicit version banner; IMPORT remains the confirmed installation record.
