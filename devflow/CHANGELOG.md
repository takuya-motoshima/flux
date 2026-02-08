# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **orchestrator agent**: PM-like hearing with staged deepening questions
  - Step 0: Conversation language selection (first time only)
  - Step 1: Automatic project environment analysis (for existing projects)
  - Step 2: Requirements hearing with 7 principles
  - Step 3: Development execution with parallel task management
- **planner agent**: Design and impact analysis
- **coder agent**: Multi-language implementation support (TypeScript/JavaScript, Python, Go, Rust)
  - Automatic coding convention detection
- **tester agent**: Test framework auto-detection and execution
  - Vitest/Jest/Mocha/Jasmine/Ava, pytest/unittest/nose, Go testing/testify, cargo test
  - Coverage measurement support
- **reviewer agent**: Code quality and security review
  - Security checklist (XSS, SQL injection, command injection, etc.)
  - Language-specific security checks
  - Review output to docs/REVIEW.md
- **documenter agent**: Documentation generation (README.md, OpenAPI spec, architecture docs)
- **Custom commands** (`/devflow:*`): `/devflow:dev`, `/devflow:design`, `/devflow:review`, `/devflow:test`, `/devflow:docs`
- **SubagentStart/Stop hooks**: Notification on agent start/stop
- **Development mode selection**: Choose from 4 modes during hearing (full, no-test, no-review, no-test-no-review)
- **Agent `color` field**: orchestrator(blue), planner(green), coder(yellow), tester(cyan), reviewer(red), documenter(magenta)
- Plugin marketplace support (marketplace.json and plugin.json)

### Features
- Dynamic parallel execution of coder × N + tester (number of coders based on task structure)
- Project memory scope for knowledge persistence
- Automatic test retry loop on failure
- Multi-language coding standards enforcement
- Source code protection: reviewer (read-only via `disallowedTools: Edit`), documenter (docs-only editing via prompt instructions)
- Agent heading structure: `##` with `**bold**` subsections (following official plugin pattern). `###` used only in orchestrator for sequential sub-steps
- Document output enforcement: Concrete H2 section names listed in agent prompts
- `maxTurns` on all agents to prevent runaway execution
- `disable-model-invocation` on all commands (user-triggered only)
- `argument-hint` on all commands for autocomplete UX

### Planned
- Additional language support (Java, C#, etc.)
- Integration with external code review tools
- Performance profiling integration
- CI/CD pipeline generation
