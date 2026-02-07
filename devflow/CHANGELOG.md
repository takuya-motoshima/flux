# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Additional language support (Java, C#, etc.)
- Integration with external code review tools
- Performance profiling integration
- CI/CD pipeline generation

## [1.0.0] - 2026-02-07

### Added
- **orchestrator agent**: PM-like hearing with staged deepening questions
  - Step 0: Conversation language selection (first time only)
  - Step 1: Automatic project environment analysis (for existing projects)
  - Step 2: Requirements hearing with 5 principles
  - Step 3: Development execution with parallel task management
- **planner agent**: Design and impact analysis
- **coder agent**: Multi-language implementation support
  - TypeScript/JavaScript support
  - Python support
  - Go support
  - Rust support
  - Automatic coding convention detection
- **tester agent**: Test framework auto-detection and execution
  - Vitest/Jest/Mocha/Jasmine/Ava for JavaScript/TypeScript
  - pytest/unittest/nose for Python
  - testing/testify for Go
  - cargo test for Rust
  - Coverage measurement support
- **reviewer agent**: Code quality and security review
  - Security checklist (XSS, SQL injection, command injection, etc.)
  - Language-specific security checks
  - Review output to REVIEW.md
- **documenter agent**: Documentation generation
  - README.md auto-generation
  - OpenAPI/Swagger spec generation
  - Architecture documentation
- **Custom commands** (`/devflow:*`): Quick access to agents
  - `/devflow:dev`: Start development workflow (orchestrator)
  - `/devflow:design`: Create design document (planner)
  - `/devflow:review`: Run code review (reviewer)
  - `/devflow:test`: Execute tests (tester)
  - `/devflow:docs`: Generate documentation (documenter)
- **SubagentStart/Stop Hooks**: Notification on agent start/stop
- **project.yml.example**: Project configuration template
- **Plugin marketplace support**: Marketplace.json and plugin.json for distribution
- **Plugin name**: DevFlow (short and memorable)

### Features
- Dynamic parallel execution of coder × N + tester (number of coders based on task structure)
- Project memory scope for knowledge persistence
- Automatic test retry loop on failure
- Multi-language coding standards enforcement
- Source code protection: reviewer (read-only via `disallowedTools: Edit`), documenter (docs-only editing via prompt instructions)
- `maxTurns` on all agents to prevent runaway execution
- `disable-model-invocation` on all commands (user-triggered only)
- `argument-hint` on all commands for autocomplete UX
- Correct hooks.json format (official nested array structure)
- LICENSE file at plugin root
- Marketplace `category` and `tags` for discoverability
