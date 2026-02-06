[日本語版 README はこちら](README.ja.md)

# DevFlow

PM-like hearing and automated dev workflow with 6 specialized agents

## Features

- **PM-like Hearing**: orchestrator progressively deepens requirements through natural dialogue
- **Multi-language Support**: TypeScript/JavaScript, Python, Go, Rust
- **Auto-detection**: Automatically recognizes project structure, test frameworks, and coding standards
- **Parallel Execution**: coder × 2 + tester run in parallel for context efficiency
- **Security Checks**: Automatically detects XSS, SQL injection, command injection
- **Memory Management**: Persists knowledge in project scope

## Requirements

- Claude Code >= 1.0.0

## Installation

```bash
# Project scope (recommended: team shared, Git managed)
claude plugin install https://github.com/takuya-motoshima/devflow --scope project

# User scope (all projects)
claude plugin install https://github.com/takuya-motoshima/devflow --scope user

# Local scope (experimental, Git excluded)
claude plugin install https://github.com/takuya-motoshima/devflow --scope local
```

### Scope Usage

| Scope | Location | Git | Usage |
|-------|----------|-----|-------|
| **project** (recommended) | `.claude/` | ✓ | Team development shared |
| **user** | `~/.claude/` | - | Personal use across all projects |
| **local** | `.claude-local/` | × (auto-excluded) | Experimental use |

## Usage

### 1. Check Agent List

```bash
/agents
```

6 agents will be displayed:
- `orchestrator` - Project Manager (requirements hearing, dev flow management)
- `planner` - Designer (impact analysis, design doc creation)
- `coder` - Developer (multi-language implementation, standards compliance)
- `tester` - Tester (auto-detection, coverage measurement)
- `reviewer` - Reviewer (quality & security checks)
- `documenter` - Documenter (README, API specs, architecture)

### 2. Quick Execution with Custom Commands (Recommended)

```bash
# Start development (launch orchestrator)
/flow-dev

# Create design
/flow-design

# Code review
/flow-review

# Run tests
/flow-test

# Generate documentation
/flow-docs
```

### 3. Or, Specify Agent Directly

```
@orchestrator
I want to build a chat app using Gemini API
```

orchestrator automatically executes:
1. Auto-analyze project environment (for existing projects)
2. Hear requirements through dialogue
3. Create design with planner
4. **Parallel execution**: coder × 2 (UI + API) + tester (test specs)
5. Run tests with tester (fix with coder if failed)
6. Review with reviewer
7. Generate documentation with documenter (optional)

### 4. Background Execution

Press `Ctrl+B` during agent execution to run in background

### 5. Check Work Details

Press `Ctrl+O` after agent completion to see detailed work log

## Project Settings (Optional)

Create `.claude/project.yml` to customize project-specific settings:

```bash
cp .claude/project.yml.example .claude/project.yml
```

Configuration items:
- Languages and frameworks
- Test framework and coverage target
- Coding standards (max lines, type checking, etc.)
- Security check items
- Auto-documentation settings

## Hooks (Notification Feature)

Display notifications on agent start/stop:

```
[START] orchestrator is starting...
[DONE] orchestrator has finished
```

Customize `.claude/hooks/hooks.json` for Slack notifications or logging:

```json
{
  "hooks": {
    "SubagentStart": {
      "command": "curl -X POST https://hooks.slack.com/... -d '{\"text\": \"$SUBAGENT_NAME started\"}'",
      "description": "Slack notification"
    }
  }
}
```

## Execution Flow

```
[orchestrator] ← User gives instruction only once
    ↓
  Step 0: Auto-analyze project environment (for existing projects)
    ↓
  Step 1: Hearing (what to build? existing or new?)
    ↓
[planner] Design (sequential)
    ↓
  Parallel ─┬─ [coder] UI implementation
            ├─ [coder] API implementation
            └─ [tester] Test spec creation
    ↓
[tester] Test execution (sequential)
    ↓ (Fix with coder if tests fail, then loop back)
[reviewer] Review (sequential)
    ↓
[documenter] Documentation generation (optional)
```

## License

MIT

## Author

Takuya Motoshima
https://github.com/takuya-motoshima
