# Documentation Update Mandate

## Purpose

Ensure documentation remains synchronized with code changes. AI agents MUST update relevant documentation whenever making changes to source files.

## Documentation Files

| File | Purpose |
|------|---------|
| `CHANGELOG.md` | Track all notable changes |
| `README.md` | Project overview, quick start, feature list |
| `CONTRIBUTING.md` | Development workflow, coding standards |
| `CODE_OF_CONDUCT.md` | Community guidelines |
| `AGENTS.md` | AI agent guidelines and commands |
| `docs/` | Detailed documentation (Diátaxis structure) |

## Update Requirements

### CHANGELOG.md - ALWAYS Required

Every code change MUST have a corresponding CHANGELOG entry:

1. Add entry under `## [Unreleased]` section
2. Use appropriate category: `Added`, `Changed`, `Fixed`, `Removed`, `Security`
3. Keep entries brief (1-2 sentences)
4. Commit hash is added at commit time

**Example:**

```markdown
## [Unreleased]

### Added

- Heart icon loading indicator replacing spinner (4780497)

### Fixed

- Unused imports in location component
```

### README.md - When Applicable

Update when changes affect:

- User-facing features or functionality
- Installation or setup process
- Available scripts in package.json
- Technology stack or dependencies
- Quick start instructions

### AGENTS.md - When Applicable

Update when changes affect:

- Build, lint, or test commands
- Project structure
- Code style guidelines
- Development workflow

### docs/ Directory - When Applicable

| Change Type | Document to Update |
|-------------|-------------------|
| API endpoints | `docs/reference/api.md` |
| Project structure | `docs/reference/project-structure.md` |
| Deployment process | `docs/how-to/deployment.md` |
| Testing approach | `docs/how-to/testing.md` |
| Personalized links | `docs/how-to/personalized-links.md` |
| Setup instructions | `docs/tutorials/getting-started.md` |
| Architecture decisions | `docs/explanation/architecture.md` |
| Security features | `docs/explanation/security.md` |

### CONTRIBUTING.md - When Applicable

Update when changes affect:

- Development workflow or setup
- Coding standards or conventions
- Pull request process
- Testing requirements

### CODE_OF_CONDUCT.md - Rarely

Only update when community guidelines change. This file is typically stable.

## Decision Matrix

Before committing, ask:

1. **Does this change add/remove/modify a feature?** → Update CHANGELOG.md, possibly README.md
2. **Does this change affect how developers work?** → Update CONTRIBUTING.md, AGENTS.md
3. **Does this change affect project structure?** → Update docs/reference/project-structure.md
4. **Does this change affect API?** → Update docs/reference/api.md
5. **Does this change affect deployment?** → Update docs/how-to/deployment.md
6. **Does this change affect testing?** → Update docs/how-to/testing.md

## Examples

### Example 1: Adding a new API endpoint

Files to update:

- `CHANGELOG.md` - Add entry under "Added"
- `docs/reference/api.md` - Document the new endpoint

### Example 2: Refactoring internal code

Files to update:

- `CHANGELOG.md` - Add entry under "Changed" (if notable) or skip if purely internal

### Example 3: Adding a new npm script

Files to update:

- `CHANGELOG.md` - Add entry
- `README.md` - Update Scripts section if user-facing
- `AGENTS.md` - Update if relevant to AI agents
- `docs/how-to/testing.md` - Update if test-related

### Example 4: Fixing a bug

Files to update:

- `CHANGELOG.md` - Add entry under "Fixed"

## Non-Requirements

Do NOT update documentation for:

- Whitespace-only changes
- Comment-only changes
- Dependency version bumps (unless breaking)
- Internal refactoring with no external impact
