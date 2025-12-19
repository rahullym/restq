# Branching Strategy

This document defines the mandatory branching strategy for this repository. All branches must follow these rules.

## Branch Types

### `main`
**Purpose**: Production-ready code only. This branch represents the current production state.

**Rules**:
- Protected branch (see `BRANCH_PROTECTION.md` for protection rules)
- Only accepts merges from `develop` or `hotfix/*` branches
- Must never be force-pushed
- Must never be deleted
- All commits must be tagged with semantic versions (see `RELEASE.md`)

**Merge Targets**: `develop`, `hotfix/*`

### `develop`
**Purpose**: Integration branch for completed features and fixes. Represents the next release candidate.

**Rules**:
- Protected branch (see `BRANCH_PROTECTION.md` for protection rules)
- Only accepts merges from `feature/*`, `fix/*`, and `hotfix/*` branches
- Must never be force-pushed
- Must never be deleted
- All merges require pull request approval

**Merge Targets**: `feature/*`, `fix/*`, `hotfix/*`

### `feature/*`
**Purpose**: New features and enhancements.

**Naming Convention**: `feature/<feature-name>` (lowercase, kebab-case)

**Examples**:
- `feature/queue-analytics`
- `feature/admin-dashboard-improvements`
- `feature/customer-notifications`

**Rules**:
- Must branch from `develop`
- Must merge back to `develop` via pull request
- Must be deleted after successful merge
- Must follow commit message conventions (see `commitlint.config.js`)

**Merge Targets**: `develop` only

**Lifecycle**:
1. Create branch from `develop`: `git checkout -b feature/my-feature develop`
2. Develop feature, commit following conventions
3. Open pull request targeting `develop`
4. After merge approval and merge, delete branch

### `fix/*`
**Purpose**: Bug fixes for issues found in `develop` or `main`.

**Naming Convention**: `fix/<fix-description>` (lowercase, kebab-case)

**Examples**:
- `fix/auth-redirect`
- `fix/queue-position-calculation`
- `fix/admin-dashboard-loading`

**Rules**:
- Must branch from `develop` (for bugs in development) or `main` (for production bugs)
- Must merge back to `develop` via pull request
- If branched from `main`, also merge to `main` after `develop` merge
- Must be deleted after successful merge
- Must follow commit message conventions (see `commitlint.config.js`)

**Merge Targets**: `develop` (always), `main` (if fix addresses production issue)

**Lifecycle**:
1. Create branch from appropriate base: `git checkout -b fix/my-fix develop` or `git checkout -b fix/my-fix main`
2. Develop fix, commit following conventions
3. Open pull request targeting `develop`
4. After merge approval and merge, delete branch
5. If branched from `main`, create additional PR to merge fix to `main`

### `hotfix/*`
**Purpose**: Critical production fixes that cannot wait for the normal release cycle.

**Naming Convention**: `hotfix/<fix-description>` (lowercase, kebab-case)

**Examples**:
- `hotfix/critical-bug`
- `hotfix/security-patch`
- `hotfix/data-corruption-fix`

**Rules**:
- Must branch from `main`
- Must merge to both `main` and `develop` via pull requests
- Must be deleted after successful merges
- Must follow commit message conventions (see `commitlint.config.js`)
- Requires expedited review process

**Merge Targets**: `main` (primary), `develop` (secondary)

**Lifecycle**:
1. Create branch from `main`: `git checkout -b hotfix/my-hotfix main`
2. Develop fix, commit following conventions
3. Open pull request targeting `main` (expedited review)
4. After merge to `main`, create pull request targeting `develop`
5. After both merges, delete branch
6. Tag release from `main` (see `RELEASE.md`)

## Naming Conventions

All branch names must:
- Use lowercase letters only
- Use kebab-case (hyphens, not underscores or spaces)
- Be descriptive and specific
- Start with the branch type prefix (`feature/`, `fix/`, `hotfix/`)
- Not contain special characters except hyphens

**Valid Examples**:
- `feature/queue-analytics`
- `fix/auth-redirect-bug`
- `hotfix/critical-security-patch`

**Invalid Examples**:
- `Feature/QueueAnalytics` (uppercase)
- `feature/queue_analytics` (underscores)
- `feature/queue analytics` (spaces)
- `my-feature` (missing prefix)

## Branch Creation Rules

1. **Always branch from the correct base**:
   - `feature/*` → from `develop`
   - `fix/*` → from `develop` or `main` (depending on where bug exists)
   - `hotfix/*` → from `main` only

2. **Ensure base branch is up-to-date** before creating new branch:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

3. **One feature/fix per branch**: Do not combine multiple unrelated changes in a single branch.

## Branch Deletion Rules

1. **All `feature/*`, `fix/*`, and `hotfix/*` branches must be deleted after successful merge**.
2. **`main` and `develop` branches must never be deleted**.
3. **Deletion happens automatically** via GitHub settings or manually after merge verification.

## Merge Target Summary

| Branch Type | Allowed Merge Targets |
|------------|----------------------|
| `main` | `develop`, `hotfix/*` |
| `develop` | `feature/*`, `fix/*`, `hotfix/*` |
| `feature/*` | `develop` |
| `fix/*` | `develop` (always), `main` (if branched from `main`) |
| `hotfix/*` | `main` (primary), `develop` (secondary) |

## Enforcement

- Branch protection rules enforce merge targets (see `BRANCH_PROTECTION.md`)
- Pull request templates require correct target branch selection
- GitHub Actions validate branch naming conventions
- Violations block merge until corrected

## Related Documentation

- `BRANCH_PROTECTION.md`: Branch protection rules
- `MERGE_STRATEGY.md`: Merge commit strategies
- `RELEASE.md`: Release and tagging process
- `CONTRIBUTING.md`: Contribution guidelines
- `commitlint.config.js`: Commit message conventions



