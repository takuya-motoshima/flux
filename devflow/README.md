[日本語版はこちら](README.ja.md)

# DevFlow

Just say what you want to build. Design, tests, README — done. You're welcome.

DevFlow is a Claude Code plugin. 5 specialized agents handle the full cycle — requirements hearing, design, implementation, testing, review, and documentation — automatically. No spec doc needed; it starts by asking the right questions.

## What happens when you run DevFlow?

```
You:     /devflow:dev
         "I want to build a chat app using Gemini API"

DevFlow: I'll proceed in English. Let me ask a few questions:
         - Do you need a Web UI or CLI?
         - Should conversation history be saved?
You:     Web UI. Session-only history is fine.

DevFlow: Got it! Which development mode?
         1. Full (design → code → test → review → docs) ← recommended
         4. No test, no review (speed mode)
You:     In a hurry, go with 4!

DevFlow: Speed mode it is.
         → planner creating design doc...
         → coder × 2 implementing in parallel...
         → documenter generating docs...
         ✓ Done!
```

One instruction, and the entire development cycle runs automatically.

## Features

- **Conversational requirements** — A few questions to clarify what you need. No spec doc required.
- **Multi-language** — TypeScript/JavaScript, Python, Go, and Rust supported.
- **Auto-detection** — Automatically recognizes project structure, test frameworks, and coding standards.
- **Parallel execution** — coder + tester run in parallel (number of coders scales dynamically per task).
- **Development modes** — Skip tests and reviews for rapid prototyping. Or go full pipeline for production.
- **Auto-fix loop** — Tests fail? coder automatically fixes the code and retests. Zero manual back-and-forth.
- **Existing project support** — Automatically analyzes impact scope of changes. Refactoring made safe.
- **Security checks** — Automatically detects XSS, SQL injection, command injection, and more.
- **Memory** — Agents record patterns. Gets faster the more you use it.

## Installation

[Claude Code](https://claude.com/claude-code) >= 1.0.0 required.

```
/plugin marketplace add takuya-motoshima/flux
/plugin install devflow@flux
```

After installation, **restart Claude Code** to load the agents. Verify with `/agents`.

> [!NOTE]
> If you get validation errors like `agents: Invalid input`, clear the plugin cache and retry:
> ```
> rm -rf ~/.claude/plugins/cache/
> /plugin install devflow@flux
> ```

## Usage

### Custom Commands (Recommended)

```bash
/devflow:dev       # Start development (PM workflow)
/devflow:design    # Create design
/devflow:review    # Code review
/devflow:test      # Run tests
/devflow:docs      # Generate documentation
```

### Or, call individual agents directly

```
@devflow:planner    # Design only
@devflow:coder      # Implementation only
@devflow:tester     # Testing only
@devflow:reviewer   # Review only
@devflow:documenter # Documentation only
```

## Execution Flow

```mermaid
flowchart TD
    A["/devflow:dev ← User gives instruction only once"] --> B["Step 0: Language selection (first time only)"]
    B --> C["Step 1: Project analysis (existing projects)"]
    C --> D["Step 2: Requirements hearing"]
    D --> E["planner → docs/DESIGN.md"]
    E --> F["coder × N"] & G["tester — spec creation"]
    F & G --> H["tester — execution (optional)"]
    H -. fail .-> F
    H --> I["reviewer (optional) → docs/REVIEW.md"]
    I --> J[documenter]
```

### Agents

| Agent | Role | Output |
|-------|------|--------|
| `planner` | Designer: impact analysis, design creation | `docs/DESIGN.md` |
| `coder` | Developer: multi-language implementation | Source code |
| `tester` | Tester: framework auto-detection, test execution | `docs/TEST_SPEC.md`, `docs/TEST_REPORT.md` |
| `reviewer` | Reviewer: quality & security checks | `docs/REVIEW.md` |
| `documenter` | Documenter: README, API specs | `README.md`, `docs/` |

## Workflow Details

### Step 0: Language Selection

On first run, DevFlow asks your preferred language (English, Japanese, etc.) and saves it to `.claude/memory/user-preferences.md`. All agents read this file, so every output — questions, design docs, reviews — uses the same language throughout.

### Step 1: Project Analysis

For existing projects only. DevFlow auto-detects:

- **Manifest**: language, frameworks, test tools, build system (from `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`)
- **Directory structure**: source files, test directories, docs
- **Coding conventions**: linter configs (`.eslintrc`, `.prettierrc`, `pyproject.toml`), editor settings

Skipped for new projects — proceeds directly to hearing.

### Step 2: Requirements Hearing

DevFlow asks questions following 7 principles:

1. **Max 2 questions per response** — never overwhelms you
2. **Start simple** — "What do you want to build?" first
3. **Drill down incrementally** — one follow-up at a time
4. **Understand context** — asks "why" alongside "what"
5. **Be flexible** — skips obvious questions, confirms instead
6. **Skip redundant questions** — won't ask what's already clear
7. **Accept "recommended"** — say "recommended" or "your call" and best practices are applied instantly

After hearing, you choose a development mode:

| Mode | Pipeline | Use case |
|------|----------|----------|
| 1. Full | Design → Code → Test → Review → Docs | Production-ready (recommended) |
| 2. No test | Design → Code → Review → Docs | When tests already exist |
| 3. No review | Design → Code → Test → Docs | Trusted internal code |
| 4. Speed | Design → Code → Docs | Prototypes, experiments |

### Step 3: Development Execution

Agents run in a strict pipeline — each step completes before the next begins:

1. **planner** creates `docs/DESIGN.md` and recommends parallelization groups
2. **coder × N** + **tester Phase 1** run in parallel (implementation + test spec writing)
3. **tester Phase 2** executes tests. On failure, coder auto-fixes (up to 3 retries)
4. **reviewer** analyzes code quality and security
5. **documenter** generates/updates documentation

Progress is tracked in `.claude/memory/dev-session.md`. If context compression occurs during a long session, DevFlow recovers state from this file automatically.

## Agents in Detail

### planner

Breaks requirements into implementation tasks and creates the design document.

- **Focus**: Task dependencies, impact analysis, parallelization grouping
- **Output**: `docs/DESIGN.md` with fixed structure — Overview, Impact Range, Tech Stack, File Structure
- **Key behavior**: Recommends which tasks can run in parallel so coder instances are optimally distributed

### coder

Implements assigned tasks following project conventions.

- **Focus**: Multi-language support (TypeScript/JavaScript, Python, Go, Rust), automatic convention detection
- **Standards**: Functions 20-30 lines max, type safety, linter compliance per language
- **Key behavior**: Reads existing code style (naming, indentation, patterns) before writing a single line. One task per instance — no scope creep

### tester

Designs test specs and executes tests in two phases.

- **Focus**: Framework auto-detection — Vitest, Jest, Mocha, pytest, Go testing, cargo test
- **Phase 1** (parallel with coder): Creates `docs/TEST_SPEC.md` with test categories (normal, abnormal, boundary)
- **Phase 2** (after coder): Implements test code, runs tests, creates `docs/TEST_REPORT.md` (summary, coverage, per-category results)
- **Key behavior**: Does NOT modify implementation code. Reports results; coder handles fixes

### reviewer

Reviews code quality and security. **Read-only** — cannot modify source code.

- **Focus**: Readability, maintainability, type safety, security, performance
- **Security checklist**: XSS, SQL injection, command injection, CSRF, secret key exposure, path traversal, plus language-specific checks (prototype pollution for JS, pickle deserialization for Python, race conditions for Go, unsafe blocks for Rust)
- **Output**: `docs/REVIEW.md` with score, Critical/Warning/Good findings, and security checklist
- **Key behavior**: Only reports issues with high confidence. Highlights good code, not just problems

### documenter

Generates and updates project documentation. **Cannot modify source code** — edits `.md` and `.yaml` files only.

- **Focus**: README auto-generation, conditional API specs and architecture docs
- **Conditional output**:
  - `docs/ARCHITECTURE.md` — only for multi-service or multi-layer projects
  - API spec (OpenAPI 3.0) — only when HTTP API endpoints exist
  - Skipped for CLI tools, libraries, single-module projects
- **Key behavior**: Avoids duplication between README and DESIGN.md. README covers usage; DESIGN.md covers architecture

## Example Output

### Requirements Hearing

```
You:     /devflow:dev
         "I want to build a REST API for task management"

DevFlow: Got it, a task management REST API. Two quick questions:
         - What language/framework? (Express, FastAPI, Gin, etc.)
         - Do you need user authentication?
You:     Express + TypeScript. Auth with JWT.

DevFlow: Understood. One more thing:
         - Do you need a database? If so, what kind?
You:     PostgreSQL with Prisma.

DevFlow: Here's my understanding:
         - Express + TypeScript REST API
         - JWT authentication (register/login)
         - PostgreSQL with Prisma ORM
         - CRUD operations for tasks

         Which development mode?
         1. Full (design → code → test → review → docs) ← recommended
         2. No testing
         3. No review
         4. No test + review
```

### docs/DESIGN.md

```markdown
## Overview
Task management REST API with JWT authentication.
Users can register, log in, and manage personal tasks through RESTful endpoints.

## Impact Range
- New: src/routes/, src/middleware/auth.ts, prisma/schema.prisma
- Modified: None (new project)

## Tech Stack
- Runtime: Node.js + TypeScript
- Framework: Express
- ORM: Prisma
- DB: PostgreSQL
- Auth: JWT (jsonwebtoken)

## File Structure
src/
├── routes/
│   ├── tasks.ts
│   └── auth.ts
├── middleware/
│   └── auth.ts
├── prisma/
│   └── schema.prisma
└── index.ts
```

### docs/REVIEW.md

```markdown
## Overall Assessment
Score: 8/10
Well-structured Express API with proper TypeScript types and consistent error handling.

## Issues
### Critical
- [src/middleware/auth.ts:15] JWT secret is hardcoded. Move to environment variable.

### Warning
- [src/routes/tasks.ts:42] Missing input validation on request body.
  Use zod or joi for schema validation.

### Good
- Consistent error handling pattern across all routes
- Proper use of Prisma types — no `any` usage

## Security Check
- [x] SQL injection: Prisma ORM prevents injection
- [x] CSRF: Token-based auth, no cookie sessions
- [ ] Environment variables: JWT secret hardcoded (see Critical above)
- [ ] Input validation: Missing on 2 endpoints
```

## When to Use

**Use DevFlow for:**
- Building a new project from scratch
- Adding features that touch multiple files
- Requirements that are vague — DevFlow clarifies through dialogue
- Refactoring existing projects (auto-analyzes impact scope)
- When you want design, tests, review, and docs in one shot

**Don't use DevFlow for:**
- One-line bug fixes or typo corrections
- Fully specified, simple tasks with clear implementation
- Urgent hotfixes where hearing steps would slow you down
- Single operations — use `/devflow:test`, `/devflow:review`, or `/devflow:docs` directly instead

## Best Practices

1. **Default to full mode** — Skipping tests and review saves time but costs quality. Use mode 4 only for prototypes or experiments
2. **Say "recommended" during hearing** — If you're unsure about tech choices, just say "recommended" and DevFlow picks best practices for you
3. **Be specific with existing projects** — "Add JWT auth with register/login endpoints" gets better results than "add authentication"
4. **Reviews compound over sessions** — Reviewer findings are saved to memory. Next time, coder avoids the same mistakes automatically
5. **Use individual commands** — For focused work, `/devflow:test` re-runs tests, `/devflow:review` checks code, `/devflow:docs` updates documentation — without the full pipeline

## Hooks

Agents notify you on start/stop via SubagentStart/Stop hooks.

By default, notifications are displayed in the terminal. Customize `hooks/hooks.json` to add Slack webhooks, logging, etc.

## Uninstall

```
/plugin uninstall devflow@flux
```

## Update

```
rm -rf ~/.claude/plugins/cache/
cd ~/.claude/plugins/marketplaces/flux && git pull
```

Restart Claude Code after updating.

## Related Links

- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- [Plugin Marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
- [Sub-agents](https://code.claude.com/docs/en/sub-agents)
- [Plugin Reference](https://code.claude.com/docs/en/plugins-reference)

## License

MIT

## Author

Takuya Motoshima ([@takuya-motoshima](https://github.com/takuya-motoshima)) / [X](https://x.com/takuya_motech)
