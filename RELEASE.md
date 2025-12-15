# Release & Tagging Process

This document defines the mandatory release and tagging process. All releases must follow these rules.

## Semantic Versioning

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes that require migration or significant updates
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes and minor improvements that are backward compatible

### Version Number Rules

- Start at `1.0.0` for first production release
- Increment based on changes:
  - Breaking change → increment MAJOR
  - New feature → increment MINOR
  - Bug fix → increment PATCH

### Examples

- `1.0.0` → `1.0.1` (bug fix)
- `1.0.1` → `1.1.0` (new feature)
- `1.1.0` → `2.0.0` (breaking change)
- `2.0.0` → `2.0.1` (bug fix)

## Tag Naming Format

**Format**: `v{MAJOR}.{MINOR}.{PATCH}`

**Examples**:
- `v1.0.0`
- `v1.2.3`
- `v2.0.0`

### Tag Rules

- Tags must start with lowercase `v`
- Tags must follow semantic versioning
- Tags must be created from `main` branch only
- Tags must be annotated (include message)
- Tags must be pushed to remote repository

## Standard Release Process

### 1. Prepare Release

1. Ensure `develop` branch is stable and tested
2. Merge `develop` → `main` via pull request
3. Wait for all CI checks to pass
4. Obtain required approvals (2 for `main`)

### 2. Create Release Tag

After merge to `main`:

```bash
# Ensure you're on main and up-to-date
git checkout main
git pull origin main

# Create annotated tag
git tag -a v1.2.3 -m "Release v1.2.3: Add queue analytics feature"

# Push tag to remote
git push origin v1.2.3
```

### 3. Create GitHub Release (Optional but Recommended)

1. Navigate to: `Releases` → `Draft a new release`
2. Select tag: `v1.2.3`
3. Title: `Release v1.2.3`
4. Description: Include changelog and notable changes
5. Mark as "Latest release" if this is the newest version
6. Publish release

### 4. Update Version in Code

Update `package.json` version field to match tag:

```json
{
  "version": "1.2.3"
}
```

Commit and push:
```bash
git add package.json
git commit -m "chore(config): bump version to 1.2.3"
git push origin main
```

## Hotfix Release Process

### 1. Create Hotfix Branch

```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug main
```

### 2. Develop and Test Fix

1. Implement fix
2. Write tests
3. Test locally
4. Commit following Conventional Commits

### 3. Merge to Main

1. Create pull request: `hotfix/*` → `main`
2. Expedited review (same day if possible)
3. Use merge commit (not squash) - see `MERGE_STRATEGY.md`
4. After merge, tag release immediately

### 4. Tag Hotfix Release

```bash
git checkout main
git pull origin main

# Increment PATCH version
git tag -a v1.2.4 -m "Hotfix v1.2.4: Fix critical authentication bug"

git push origin v1.2.4
```

### 5. Merge to Develop

1. Create pull request: `hotfix/*` → `develop`
2. Use squash merge
3. Ensure fix is included in `develop` for next release

### 6. Delete Hotfix Branch

After both merges complete, delete the hotfix branch.

## Release Checklist

Before creating a release tag:

- [ ] All tests pass
- [ ] Code is merged to `main`
- [ ] Version number determined (MAJOR.MINOR.PATCH)
- [ ] Tag name follows format `v{version}`
- [ ] Tag message is descriptive
- [ ] `package.json` version updated (if applicable)
- [ ] Changelog updated (if maintained)
- [ ] Release notes prepared (if creating GitHub release)

## Tag Management

### List Tags

```bash
git tag -l
git tag -l "v1.*"
```

### View Tag Details

```bash
git show v1.2.3
```

### Delete Tag (if mistake)

```bash
# Delete local tag
git tag -d v1.2.3

# Delete remote tag
git push origin --delete v1.2.3
```

**Warning**: Only delete tags if absolutely necessary. Prefer creating a new patch version instead.

### Tag Rollback Release

If a release needs to be rolled back:

1. Revert the merge commit (see `MERGE_STRATEGY.md`)
2. Create new patch version tag:
   ```bash
   git tag -a v1.2.5 -m "Rollback: Revert v1.2.4"
   git push origin v1.2.5
   ```

## Version Bumping Rules

### When to Bump MAJOR

- Breaking API changes
- Database schema migrations that require manual steps
- Changes that break backward compatibility
- Major architectural changes

### When to Bump MINOR

- New features
- New API endpoints (non-breaking)
- New configuration options
- Performance improvements
- New dependencies (non-breaking)

### When to Bump PATCH

- Bug fixes
- Security patches
- Documentation updates
- Dependency updates (patch versions)
- Minor refactoring

## Release Frequency

- **Standard releases**: As needed, typically weekly or bi-weekly
- **Hotfix releases**: Immediately when critical issues are found
- **Major releases**: Quarterly or as needed for breaking changes

## Enforcement

- Tags can only be created from `main` branch
- Branch protection prevents direct commits to `main`
- All releases must go through PR process
- Version numbers must follow semantic versioning

## Related Documentation

- `BRANCHING_STRATEGY.md`: Branch types and merge targets
- `MERGE_STRATEGY.md`: Merge commit strategies
- `BRANCH_PROTECTION.md`: Branch protection rules
- `CONTRIBUTING.md`: Contribution guidelines
