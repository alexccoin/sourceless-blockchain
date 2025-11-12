# Platform Suite Version Control & Release Management

This document describes the recommended versioning, tagging, and release automation for the Sourceless platform suite (Enterprise, Light, Developer).

Goals
- Consistent semantic versioning across platform variants.
- Automated CI for tests, builds and release creation.
- Repeatable scripts for bumping versions and generating changelogs.

Versioning scheme
- Base semantic version: MAJOR.MINOR.PATCH (example: 1.2.3)
- Platform suffix: append a platform qualifier for builds/releases when needed, e.g.:
  - Enterprise: v1.2.3-enterprise.001
  - Light: v1.2.3-light.001
  - Developer: v1.2.3-dev.001
- Use annotated git tags for releases.

Release flow (recommended)
1. Ensure all tests pass on main branch.
2. Create or bump the changelog entry for the new release.
3. Decide release version (semver) and platform suffix if needed.
4. Run `scripts/bump-version.sh` to update package.json and create a commit.
5. Push commit and create an annotated tag (e.g. `git tag -a v1.2.3-enterprise.001 -m "Enterprise release v1.2.3"`).
6. Push tag to remote: `git push origin --tags` (this should trigger the Release CI workflow).

Minimal bump script (scripts/bump-version.sh)
- Purpose: increment package.json version and commit. Keep it simple and idempotent.

Changelog generation
- Use a conventional-changelog-style generator or a lightweight script that collates PR titles since last tag.
- Store changelog in `CHANGELOG.md` and include release notes in GitHub Releases.

CI / GitHub Actions
- Workflow triggers:
  - push to main (run tests and build artifacts)
  - push tags matching `v*` (run full release workflow: build, sign, create GitHub Release, publish images)
- Steps:
  1. Checkout code
  2. Install dependencies
  3. Run tests
  4. Build artifacts (docker images, electron builders, web bundles)
  5. If tag push: generate changelog, create GitHub Release and upload artifacts

Security & audit
- Include a security scan step (Snyk/Trivy/Others) for production/enterprise releases.
- For hardened enterprise releases, require manual approval or an approvals job in the workflow.

Notes & conventions
- Use `npm version` or the bump script to update `package.json`. The bump script here is intentionally minimal—teams may replace with more advanced tooling.
- Use signed tags for important production releases when possible.

Example tag names
- v1.2.3-enterprise.001
- v1.2.3-light.001
- v1.2.3-dev.001

Appendix: Next steps
- Add `scripts/bump-version.sh` and `scripts/generate-changelog.js` to `scripts/` (todo).
- Add `.github/workflows/release.yml` to perform test/build/release on tag push (todo).

