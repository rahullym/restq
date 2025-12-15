# Branch Protection Rules

This document defines the exact GitHub branch protection settings that must be configured for this repository. These rules are mandatory and non-negotiable.

## Setup Instructions

1. Navigate to: `Settings` → `Branches` → `Add rule`
2. Configure each branch as specified below
3. Save changes

## `main` Branch Protection

**Branch name pattern**: `main`

### Protection Settings

#### ✅ Require a pull request before merging
- **Required approving reviews**: `2`
- **Dismiss stale pull request approvals when new commits are pushed**: ✅ Enabled
- **Require review from Code Owners**: ✅ Enabled
- **Restrict who can dismiss pull request reviews**: ✅ Enabled (only repository admins)

#### ✅ Require status checks to pass before merging
- **Require branches to be up to date before merging**: ✅ Enabled
- **Required status checks**:
  - `lint`
  - `test`
  - `build`
- **Strict status checks**: ✅ Enabled (all checks must pass)

#### ✅ Require conversation resolution before merging
- ✅ Enabled

#### ✅ Require signed commits
- ✅ Enabled (if GPG signing is configured)

#### ✅ Require linear history
- ✅ Enabled (enforces squash merge or rebase)

#### ✅ Include administrators
- ✅ Enabled (admins must follow rules)

#### ✅ Restrict pushes that create matching branches
- ✅ Enabled

#### ✅ Do not allow bypassing the above settings
- ✅ Enabled

#### ✅ Allow force pushes
- ❌ **Disabled** (never allowed)

#### ✅ Allow deletions
- ❌ **Disabled** (never allowed)

### Merge Restrictions

- **Allowed merge methods**: 
  - ✅ Squash and merge (default)
  - ❌ Merge commit (disabled)
  - ❌ Rebase and merge (disabled)

**Exception**: Hotfix branches may use merge commit (see `MERGE_STRATEGY.md`)

## `develop` Branch Protection

**Branch name pattern**: `develop`

### Protection Settings

#### ✅ Require a pull request before merging
- **Required approving reviews**: `1`
- **Dismiss stale pull request approvals when new commits are pushed**: ✅ Enabled
- **Require review from Code Owners**: ✅ Enabled (for owned modules)
- **Restrict who can dismiss pull request reviews**: ✅ Enabled (only repository admins)

#### ✅ Require status checks to pass before merging
- **Require branches to be up to date before merging**: ✅ Enabled
- **Required status checks**:
  - `lint`
  - `test`
  - `build`
- **Strict status checks**: ✅ Enabled (all checks must pass)

#### ✅ Require conversation resolution before merging
- ✅ Enabled

#### ✅ Require signed commits
- ⚠️ Optional (recommended but not required)

#### ✅ Require linear history
- ✅ Enabled (enforces squash merge or rebase)

#### ✅ Include administrators
- ✅ Enabled (admins must follow rules)

#### ✅ Restrict pushes that create matching branches
- ✅ Enabled

#### ✅ Do not allow bypassing the above settings
- ✅ Enabled

#### ✅ Allow force pushes
- ❌ **Disabled** (never allowed)

#### ✅ Allow deletions
- ❌ **Disabled** (never allowed)

### Merge Restrictions

- **Allowed merge methods**: 
  - ✅ Squash and merge (default)
  - ❌ Merge commit (disabled)
  - ❌ Rebase and merge (disabled)

## Enforcement

- These rules are enforced by GitHub and cannot be bypassed
- Violations will block merge attempts
- All team members must follow these rules
- No exceptions without explicit repository admin approval

## Verification

To verify protection rules are active:

1. Attempt to push directly to `main` or `develop` → Should be rejected
2. Attempt to force push → Should be rejected
3. Attempt to delete branch → Should be rejected
4. Create PR without required checks → Should be blocked
5. Create PR without required approvals → Should be blocked

## Related Documentation

- `BRANCHING_STRATEGY.md`: Branch naming and merge targets
- `MERGE_STRATEGY.md`: Merge commit strategies
- `.github/workflows/ci.yml`: Status check definitions
