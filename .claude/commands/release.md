# Release Workflow

Creates a new release by triggering the GitHub Actions release-dispatch workflow.

## Arguments

- `$ARGUMENTS`: Version type or specific version (e.g., `minor`, `patch`, `major`, or `0.12.0`)

## Process

1. **Determine the new version**:

```bash
# Get current version from controller package
CURRENT_VERSION=$(jq -r '.version' packages/controller/package.json)
echo "Current version: $CURRENT_VERSION"
```

Based on the argument:
- `major`: Bump major version (e.g., 0.11.4 -> 1.0.0)
- `minor`: Bump minor version (e.g., 0.11.4 -> 0.12.0)
- `patch`: Bump patch version (e.g., 0.11.4 -> 0.11.5)
- Specific version (e.g., `0.12.0`): Use as-is

2. **Trigger the release workflow**:

```bash
# Trigger release-dispatch workflow
gh workflow run release-dispatch.yml \
  --field version=<NEW_VERSION> \
  --field tag=latest
```

For prerelease versions (containing `-alpha`, `-beta`, `-rc`):

```bash
gh workflow run release-dispatch.yml \
  --field version=<NEW_VERSION> \
  --field tag=prerelease
```

3. **Verify workflow started**:

```bash
# List recent workflow runs
gh run list --workflow=release-dispatch.yml --limit=3
```

4. **Provide next steps**:

After triggering, inform the user:
- A PR titled "Prepare release: X.Y.Z" will be created from branch `prepare-release`
- A draft GitHub release will be created with tag `vX.Y.Z`
- Once the PR is merged, packages will be published to npm automatically
- The draft release will be finalized with changelog notes

## Version calculation

Use semver rules to calculate the new version:
- Strip any prerelease suffix (e.g., `-alpha.1`) before bumping
- For `major`: Set to `<major+1>.0.0`
- For `minor`: Set to `<major>.<minor+1>.0`
- For `patch`: Set to `<major>.<minor>.<patch+1>`
