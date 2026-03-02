# Agent Workflow Guide

This guide explains how to use the Claude Code agent workflow system to build features using Test-Driven Development (TDD). The workflow uses six specialized agents that guide you from design through deployment.

---

## Quick Start

**New to the workflow?** Here's how to get started:

1. **Create a feature spec** in `documentation/your-feature.md`
2. **Run `/start`** to begin the TDD workflow
3. **Follow the prompts** - each agent guides you through its phase
4. **Approve outputs** at key checkpoints (stories, tests, PRs)

**Which agent should I use?**

| Starting Point | Use This Agent | Command |
|----------------|----------------|---------|
| New feature with UI | `design-wireframe-agent` | "Create wireframes for [feature]" |
| New feature (any) | `feature-planner` | `/start` or "Plan [feature]" |
| Stories already exist | `test-generator` | "Generate tests for [epic]" |
| Tests already exist | `developer` | "Implement [stories]" |
| Code ready for QA | `code-reviewer` | "Review the code changes" or `/quality-check` |

---

## The Agents

| Agent | Phase | Purpose | Key Output |
|-------|-------|---------|------------|
| **design-api-agent** | DESIGN | Generates OpenAPI spec from feature requirements | `generated-docs/specs/api-spec.yaml` |
| **design-style-agent** | DESIGN | Generates CSS design tokens and style reference guide | `generated-docs/specs/design-tokens.css`, `generated-docs/specs/design-tokens.md` |
| **design-wireframe-agent** | DESIGN | Creates ASCII wireframes for UI features | `generated-docs/specs/wireframes/*.md` |
| **feature-planner** | SCOPE/STORIES | Breaks specs into epics, stories, acceptance criteria | `generated-docs/stories/**/*.md` |
| **test-generator** | WRITE-TESTS | Generates failing tests before implementation | `web/src/__tests__/integration/*.test.ts(x)` |
| **developer** | IMPLEMENT | Makes tests pass | Passing tests + source code |
| **code-reviewer** | QA | Reviews code quality, runs quality gates, commits | Review findings + commit |

### Agent Details

**DESIGN agents** (Mandatory, multi-agent phase)
- The orchestrator reads the intake manifest and invokes up to three agents conditionally:
  - **design-api-agent** — generates OpenAPI spec (`api-spec.yaml`) when `apiSpec.generate == true`
  - **design-style-agent** — generates design tokens (`.css` + `.md`) when either token artifact needs generation
  - **design-wireframe-agent** — generates ASCII wireframes when `wireframes.generate == true`
- Agents run in order: API → Style → Wireframe. User-provided files are copied by the orchestrator when `generate == false`.
- Runs after INTAKE, before SCOPE

**feature-planner**
- Plans ONE epic at a time (never multiple)
- Pauses for approval at each stage (epics → stories → acceptance tests)
- Commits story files before handing off

**test-generator**
- Tests MUST fail initially (this is TDD)
- Imports components that don't exist yet
- Only mocks HTTP client, never code under test
- **Tests must verify user behavior, NOT implementation details** (see CLAUDE.md for guidelines)

**developer**
- Implements ONE story at a time
- Creates draft PR and STOPS for approval
- Does NOT write new tests—only makes existing tests pass

**code-reviewer**
- Handles the QA phase (combined review + quality gates)
- Qualitative code review (TypeScript, React, Next.js, security, accessibility)
- Runs automated quality gates via `quality-gates.js` script
- Prompts user for manual verification in the running web app
- Routes issues by severity: Critical → pause for user fix; High/Medium → fix epic via REALIGN
- Commits and pushes if all gates pass

---

## Workflow Diagram

```
┌────────────────────────────────────────┐   ┌───────────────┐   ┌─────────────┐   ┌───────────┐   ┌────────┐
│              DESIGN                    │ → │ SCOPE/STORIES │ → │ WRITE-TESTS │ → │ IMPLEMENT │ → │   QA   │
│ (mandatory, conditional per manifest)  │   │               │   │             │   │           │   │        │
│  API → Style → Wireframe              │   │               │   │             │   │           │   │        │
└────────────────────────────────────────┘   └───────────────┘   └─────────────┘   └───────────┘   └────────┘
     │                                              │                   │                │              │
     ▼                                              ▼                   ▼                ▼              ▼
 API spec,                                     Stories &           Failing          Passing       Review +
 Design tokens,                                Acceptance          Tests            Tests +       Quality Gates
 Wireframes                                    Criteria                             Code          + Commit
```

### The 5 Quality Gates

| Gate | Type | What It Checks |
|------|------|----------------|
| 1. Functional | Manual | Feature works per acceptance criteria |
| 2. Security | Automated | `npm audit`, no hardcoded secrets |
| 3. Code Quality | Automated | TypeScript, ESLint, Next.js build |
| 4. Testing | Automated | Tests pass, coverage threshold met |
| 5. Performance | Manual | Page loads < 3s, no UI freezing |

---

## Choosing Your Starting Point

**Start with `feature-planner` (most common):**
- New features from a spec
- Complex requirements needing breakdown
- When you want the full TDD workflow

**Start with `design-wireframe-agent`:**
- UI-heavy features needing visual planning
- When stakeholders need wireframe sign-off
- Multi-screen features with complex flows

**Start with `test-generator`:**
- Stories already exist in `generated-docs/stories/`
- Resuming after planning was completed earlier
- Migrating existing features to TDD

**Start with `developer`:**
- Failing tests already exist
- Resuming after test generation
- Quick fixes where tests are already written

**Start with `code-reviewer` (QA phase):**
- Implementation complete, ready for QA
- Want to review and run quality gates
- Run via `/quality-check`

---

## Example Workflows

### Example 1: Full Workflow (New Dashboard Widget)

**Scenario:** Building a portfolio value widget from scratch.

| Step | Agent | Action | Output |
|------|-------|--------|--------|
| 1 | design-wireframe-agent | Create wireframes for 4 states | 5 wireframe files |
| 2 | feature-planner | Break into 4 epics, plan Epic 1 stories | 4 story files |
| 3 | test-generator | Generate 14 failing tests | 1 test file |
| 4 | developer | Implement to make tests pass | 3 source files |
| 5 | code-reviewer | Review code, run quality gates, commit | All passed, committed |

[See full detailed walkthrough →](./examples/example-1-full-workflow.md)

---

### Example 2: Mid-Chain Entry (API Integration)

**Scenario:** Adding API integration to existing page with wireframes already done.

| Step | Agent | Action |
|------|-------|--------|
| 1 | feature-planner | "Plan API integration stories" (skip wireframes) |
| 2 | test-generator | Generate tests from stories |
| 3 | developer | Implement and create PR |
| 4+ | (continue as normal) | ... |

**Key:** Skip `design-wireframe-agent` when wireframes exist externally.

[See detailed example →](./examples/example-2-mid-chain-entry.md)

---

### Example 3: Bug Fix Workflow

**Scenario:** Fixing a formatting bug in existing component.

| Step | Action |
|------|--------|
| 1 | Write a failing regression test first |
| 2 | Fix the bug (minimal change) |
| 3 | Verify test passes |
| 4 | Run `/quality-check` |
| 5 | Create PR |

**Key:** Skip planning phases for isolated bug fixes.

[See detailed example →](./examples/example-3-bug-fix.md)

---

## Override Behavior

### Skipping Agents

Agents are suggestions, not requirements. You can skip any agent:

```
# Skip wireframes
"No wireframes needed, let's go straight to planning"

# Skip code review
"Tests pass, let's go directly to quality gates"
```

### Re-running Agents

You can re-run any agent at any time:

```
# Regenerate tests after story changes
"Regenerate tests for Epic 1"

# Get another code review after changes
"Review the updated code"
```

### Custom Workflow Paths

| Scenario | Recommended Path |
|----------|------------------|
| Small bug fix | test → implement → QA |
| Backend-only feature | scope/stories → write-tests → implement → QA |
| Prototype/spike | implement only (no tests) |
| Refactoring | write-tests (new tests) → implement → QA |

---

## Troubleshooting

### Common Issues

**Q: Tests pass immediately after generation**
- Tests should FAIL initially. If they pass, implementation already exists or tests don't assert anything meaningful.
- Regenerate tests or check that components don't exist yet.

**Q: Tests are failing but seem to test the wrong things**
- Tests should verify **user-observable behavior**, not implementation details.
- Bad signs: testing CSS classes, function call counts, internal state, DOM structure.
- Good signs: testing what users see, error messages, successful workflows.
- See CLAUDE.md "Acceptance Test Quality Checklist" for full guidelines.
- Regenerate tests if needed: "Regenerate tests focusing on user behavior, not implementation details"

**Q: Agent suggests next agent but I want to do something else**
- Agent suggestions are optional. Tell it what you want to do instead.

**Q: Workflow was interrupted mid-way**
- Context files in `generated-docs/context/` preserve state
- Resume by invoking the next agent in the chain
- Example: "Continue implementing Epic 1"

**Q: Want to change stories after tests were generated**
- Modify story files in `generated-docs/stories/`
- Regenerate tests: "Regenerate tests for Epic 1 with updated acceptance criteria"

**Q: Quality gate failed**
- Review the failure reason in the output
- Fix the issue and re-run `/quality-check`
- Don't skip gates—they catch real issues

### Edge Cases

**Multiple people working on same feature:**
- Each person should work on different epics
- Context files may conflict—coordinate or clear `generated-docs/context/`

**Existing tests in codebase:**
- test-generator creates NEW test files, doesn't modify existing
- Run full test suite to ensure no conflicts

**Agent seems stuck or confused:**
- Provide clearer context: "I'm at the IMPLEMENT phase with failing tests in portfolio-widget.test.tsx"
- Reference specific files: "Please implement the PortfolioValueWidget component to pass the tests"

---

## Additional Resources

- [Example 1: Full Workflow](./examples/example-1-full-workflow.md) - Complete step-by-step walkthrough
- [Example 2: Mid-Chain Entry](./examples/example-2-mid-chain-entry.md) - Starting from existing artifacts
- [Example 3: Bug Fix](./examples/example-3-bug-fix.md) - Alternative workflow for fixes
- [CLAUDE.md](../CLAUDE.md) - Project patterns and conventions
- [Agent configurations](../.claude/agents/) - Individual agent definitions
