# Merge Strategy

This document defines the mandatory merge strategy for all branches. Violations block merges.

## Default Strategy: Squash Merge

**All branches must use squash merge by default.**

### What is Squash Merge?

Squash merge combines all commits from a feature branch into a single commit on the target branch. This maintains a clean, linear history.

### When to Use Squash Merge

- ✅ All `feature/*` branches → `develop`
- ✅ All `fix/*` branches → `develop`
- ✅ All `fix/*` branches → `main` (when applicable)
- ✅ All `hotfix/*` branches → `develop`

### Squash Merge Process

1. Create pull request from feature/fix branch to target branch
2. Ensure all required checks pass
3. Obtain required approvals
4. Select "Squash and merge" option
5. Edit commit message to follow Conventional Commits format
6. Complete merge
7. Delete source branch

### Commit Message Format for Squash Merge

When squashing, the commit message must follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Example**:
```
feat(queue): add real-time position updates

Implements WebSocket connection for live queue position updates.
Adds connection status indicator in UI.

Closes #123
```

## Exception: Merge Commit for Hotfixes to Main

**Hotfix branches merging to `main` may use merge commit instead of squash.**

### When to Use Merge Commit

- ✅ `hotfix/*` branches → `main` (only exception)

### Why Merge Commit for Hotfixes?

- Preserves context of the hotfix branch
- Allows easier identification of hotfix commits in history
- Maintains traceability for critical production fixes

### Merge Commit Process for Hotfixes

1. Create pull request from `hotfix/*` branch to `main`
2. Ensure all required checks pass
3. Obtain required approvals (expedited review)
4. Select "Create a merge commit" option
5. Use default merge commit message (includes PR title)
6. Complete merge
7. Tag release (see `RELEASE.md`)
8. Create PR to merge same hotfix to `develop` (use squash merge)
9. Delete hotfix branch after both merges

### Merge Commit Message Format

GitHub will generate merge commit message automatically:
```
Merge pull request #123 from owner/hotfix/critical-bug

fix(api): resolve critical authentication bug
```

## Prohibited Merge Strategies

### ❌ Rebase and Merge

**Never use rebase and merge.** This strategy is disabled in branch protection rules.

**Reason**: Rebase rewrites commit history, which can cause issues with:
- Shared branches
- CI/CD pipelines
- Code review tracking

### ❌ Direct Commits

**Never commit directly to `main` or `develop`.**

**Reason**: Bypasses code review and CI checks.

## Rollback Procedure

### Rollback a Squash Merge

1. Identify the merge commit SHA:
   ```bash
   git log --oneline
   ```

2. Create revert commit:
   ```bash
   git revert <merge-commit-sha>
   ```

3. Push revert commit:
   ```bash
   git push origin main
   ```

4. Create PR for revert (if required by branch protection)

### Rollback a Merge Commit (Hotfix)

1. Identify the merge commit SHA:
   ```bash
   git log --oneline --merges
   ```

2. Revert the merge commit:
   ```bash
   git revert -m 1 <merge-commit-sha>
   ```
   (`-m 1` specifies the mainline parent)

3. Push revert commit:
   ```bash
   git push origin main
   ```

4. Tag rollback version (see `RELEASE.md`)

### Rollback Tagging

After rollback, create a new patch version tag:
```bash
git tag -a v1.2.4 -m "Rollback: Revert v1.2.3"
git push origin v1.2.4
```

## Merge Checklist

Before merging any PR:

- [ ] All required status checks pass
- [ ] Required approvals obtained
- [ ] Branch is up-to-date with target
- [ ] Commit message follows Conventional Commits (for squash)
- [ ] PR description is complete
- [ ] No merge conflicts
- [ ] Tests pass locally

## Enforcement

- Branch protection rules enforce merge method selection
- GitHub Actions validate commit messages
- Violations block merge until corrected

## Related Documentation

- `BRANCHING_STRATEGY.md`: Branch types and merge targets
- `BRANCH_PROTECTION.md`: Branch protection rules
- `RELEASE.md`: Release and tagging process
- `commitlint.config.js`: Commit message conventions
