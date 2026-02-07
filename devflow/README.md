[日本語版はこちら](README.ja.md)

# DevFlow

PM-like hearing and automated dev workflow with 6 specialized agents.

Just tell DevFlow what you want to build. It handles design, implementation, testing, code review, and documentation — all automatically.

## Table of Contents

- [What happens when you run DevFlow](#what-happens-when-you-run-devflow)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Execution Flow](#execution-flow)
- [Hooks (Notifications)](#hooks-notifications)
- [Project Settings](#project-settings-optional)
- [Uninstall](#uninstall)
- [Update](#update)
- [Related Links](#related-links)

## What happens when you run DevFlow

```
You: /devflow:dev
     "I want to build a chat app using Gemini API"

DevFlow automatically:
  1. Asks a few questions to clarify requirements
  2. Creates a design document         → docs/DESIGN.md
  3. Implements code in parallel        → src/
  4. Generates and runs tests           → tests/
  5. Reviews code quality & security    → REVIEW.md
  6. Generates README & API specs       → README.md, docs/
```

One instruction. Six agents. Full development cycle — from design to documentation.

## Features

- **PM-like Hearing**: orchestrator progressively deepens requirements through natural dialogue
- **Multi-language Support**: TypeScript/JavaScript, Python, Go, Rust
- **Auto-detection**: Automatically recognizes project structure, test frameworks, and coding standards
- **Parallel Execution**: coder + tester run in parallel for context efficiency (number of coders determined dynamically per task)
- **Security Checks**: Automatically detects XSS, SQL injection, command injection
- **Memory Management**: Persists knowledge in project scope

## Requirements

- [Claude Code](https://claude.com/claude-code) >= 1.0.0

## Installation

```
/plugin marketplace add takuya-motoshima/flux
/plugin install devflow@flux
```

After installation, **restart Claude Code** to load the agents. Then verify with `/agents`.

:::note
If you get validation errors like `agents: Invalid input`, clear the plugin cache and retry:
```
rm -rf ~/.claude/plugins/cache/
/plugin install devflow@flux
```
:::

## Usage

### Quick Execution with Custom Commands (Recommended)

```bash
/devflow:dev       # Start development (launch orchestrator)
/devflow:design    # Create design
/devflow:review    # Code review
/devflow:test      # Run tests
/devflow:docs      # Generate documentation
```

### Or, Specify Agent Directly

```
@devflow:orchestrator
I want to build a chat app using Gemini API
```

You can also call individual agents directly:

```
@devflow:planner    # Design only
@devflow:coder      # Implementation only
@devflow:tester     # Testing only
@devflow:reviewer   # Review only
@devflow:documenter # Documentation only
```

### Agents

| Agent | Role | Output | Notes |
|-------|------|--------|-------|
| `orchestrator` | Project Manager: requirements hearing, dev flow management | - | Manages the entire workflow |
| `planner` | Designer: impact analysis, design creation | `docs/DESIGN.md` | |
| `coder` | Developer: multi-language implementation | Source code | Runs × N in parallel based on task structure |
| `tester` | Tester: framework auto-detection, test execution | Test code | Supports Vitest/Jest/pytest/Go testing/cargo test |
| `reviewer` | Reviewer: quality & security checks | `REVIEW.md` | Read-only (does not modify code) |
| `documenter` | Documenter: README, API specs, architecture | `README.md`, `docs/` | Docs only (does not modify source code) |

## Execution Flow

```
[orchestrator] <- User gives instruction only once
    |
  Step 0: Conversation language selection (first time only)
    |
  Step 1: Auto-analyze project environment (for existing projects)
    |
  Step 2: Hearing (what to build? existing or new?)
    |
[planner] Design (sequential) -> docs/DESIGN.md
    |
  Parallel --+-- [coder] × N (split by independent areas)
             +-- [tester] Test spec creation
    |
[tester] Test execution (sequential)
    | (Fix with coder if tests fail, then loop back)
[reviewer] Review (sequential) -> REVIEW.md
    |
[documenter] Documentation generation (optional)
```

## Hooks (Notifications)

DevFlow notifies you when agents start and stop via SubagentStart/Stop hooks.

Default: Displays a notification in the terminal. You can customize `hooks/hooks.json` to add Slack webhooks, logging, etc.

## Project Settings (Optional)

Create `project.yml` to customize project-specific settings:

```bash
cp project.yml.example project.yml
```

Configuration items:
- Languages and frameworks
- Test framework and coverage target
- Coding standards (max lines, type checking, etc.)
- Security check items
- Auto-documentation settings

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

Takuya Motoshima ([@takuya-motoshima](https://github.com/takuya-motoshima))
