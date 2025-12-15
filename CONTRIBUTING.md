# Contributing Guidelines

This document defines mandatory contribution rules. All contributors must follow these guidelines.

## Prerequisites

- Read and understand `BRANCHING_STRATEGY.md`
- Read and understand `MERGE_STRATEGY.md`
- Read and understand `RELEASE.md`
- Have write access to repository (or fork and submit PR)

## Branch Workflow

### 1. Create Branch

**Always branch from the correct base:**

```bash
# For features
git checkout develop
git pull origin develop
git checkout -b feature/my-feature-name

# For fixes
git checkout develop  # or main if production bug
git pull origin develop
git checkout -b fix/my-fix-name

# For hotfixes
git checkout main
git pull origin main
git checkout -b hotfix/my-hotfix-name
```

**Branch naming rules:**
- Use lowercase only
- Use kebab-case (hyphens)
- Start with type prefix (`feature/`, `fix/`, `hotfix/`)
- Be descriptive

### 2. Develop Changes

- Write code following project style
- Write tests for new functionality
- Update documentation if needed
- Commit frequently with clear messages

### 3. Commit Messages

**All commits must follow Conventional Commits format:**

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Allowed types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test changes
- `chore`: Maintenance tasks

**Required scope** (choose one):
- `api`: API routes
- `admin`: Admin interface
- `auth`: Authentication
- `db`: Database
- `ui`: User interface
- `queue`: Queue logic
- `infra`: Infrastructure
- `deps`: Dependencies
- `docs`: Documentation
- `config`: Configuration
- `ci`: CI/CD

**Examples:**

```
feat(queue): add real-time position updates
fix(auth): resolve session expiration bug
refactor(api): simplify queue entry creation
perf(db): optimize queue position queries
test(queue): add unit tests for wait time calculator
chore(deps): update next.js to 14.2.0
```

**Invalid examples:**

```
Added new feature  # Missing type and scope
fix: bug fix  # Missing scope
feat: new feature  # Missing scope
FEAT(API): New Feature  # Wrong case
```

### 4. Create Pull Request

1. Push branch to remote:
   ```bash
   git push origin feature/my-feature-name
   ```

2. Create pull request on GitHub:
   - Target branch: `develop` (or `main` for hotfixes)
   - Fill out PR template completely
   - Link related issues
   - Request reviews from CODEOWNERS

3. Ensure PR meets requirements:
   - All required checks pass
   - PR size ≤ 500 lines changed (exceptions require approval)
   - PR description is complete
   - Commit messages follow conventions

### 5. Address Review Feedback

- Respond to all comments
- Make requested changes
- Push updates to same branch
- Re-request review when ready

### 6. After Merge

- Delete local branch:
  ```bash
  git checkout develop
  git pull origin develop
  git branch -d feature/my-feature-name
  ```
- Remote branch is deleted automatically after merge

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define types explicitly
- Avoid `any` type

### Testing

- Write tests for all new features
- Write tests for bug fixes
- Ensure test coverage does not decrease
- Run tests before committing: `npm test`

### Linting

- Fix all linting errors before committing
- Run linter before committing: `npm run lint`
- Do not disable linting rules without approval

### Documentation

- Document complex logic
- Update README if needed
- Update API docs if endpoints change
- Keep comments up-to-date

## Pull Request Requirements

### Size Limits

- **Maximum**: 500 lines changed per PR
- **Exceptions**: Require explicit approval from repository admins
- **Reason**: Large PRs are difficult to review and increase risk

### Required Information

All PRs must include:

1. **What Changed**: Clear description of changes
2. **Why It Was Needed**: Problem statement or feature request
3. **How It Was Tested**: Testing approach and results
4. **Risk Assessment**: Impact and potential side effects

### Review Requirements

- Minimum 1 approval required for `develop`
- Minimum 2 approvals required for `main`
- CODEOWNERS approval required for owned modules
- All status checks must pass

## Prohibited Practices

### ❌ Direct Commits to Protected Branches

Never commit directly to `main` or `develop`. Always use pull requests.

### ❌ Force Push

Never force push to any branch. This rewrites history and breaks collaboration.

### ❌ Skipping Tests

Never skip tests or disable test failures. All tests must pass.

### ❌ Ignoring Linter Errors

Never ignore or disable linter errors. Fix them or get approval to disable specific rules.

### ❌ Incomplete PR Descriptions

Never submit PRs with incomplete descriptions. Use the PR template.

### ❌ Large PRs Without Approval

Never submit PRs > 500 lines without explicit approval.

## Getting Help

- Read existing documentation first
- Check existing issues and PRs
- Ask questions in PR comments
- Contact repository admins for exceptions

## Enforcement

- Branch protection rules enforce merge requirements
- GitHub Actions validate commits and PRs
- CODEOWNERS enforce review requirements
- Violations block merge until corrected

## Related Documentation

- `BRANCHING_STRATEGY.md`: Branch types and naming
- `MERGE_STRATEGY.md`: Merge commit strategies
- `RELEASE.md`: Release process
- `BRANCH_PROTECTION.md`: Branch protection rules
- `commitlint.config.js`: Commit message conventions
