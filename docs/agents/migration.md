# Version scope and migration

These guides track `main`. [IMPORT.md](../../IMPORT.md) and [release metadata](../release.json) identify the confirmed published version and immutable source commit. Inspect that source or its release tag when adopting a feature; main documentation alone does not establish release availability.

This documentation change does not change library runtime behavior or publish a Maven version. Existing package names remain `com.apexfission.android.math.*`. Existing Markdown guide URLs remain entry points.

Before upgrading, compare source/API changes, run your frame conversion tests, and check rounding, clipping, chain direction and normalized-point child mapping against your pipeline. There is no separately maintained per-release API availability matrix yet. Do not infer one from the repository name or a documentation deployment.

[Release process and recovery](../releases.md) remains manual and independent of site publication.
