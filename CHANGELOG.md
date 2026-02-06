# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-07

### Added
- **orchestrator agent**: PM-like hearing with staged deepening questions
  - Step 0: Automatic project environment analysis (for existing projects)
  - Step 1: Requirements hearing with 5 principles
  - Step 2: Development execution with parallel task management
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
- **Custom commands** (`/flow-*`): Quick access to agents
  - `/flow-dev`: Start development workflow (orchestrator)
  - `/flow-design`: Create design document (planner)
  - `/flow-review`: Run code review (reviewer)
  - `/flow-test`: Execute tests (tester)
  - `/flow-docs`: Generate documentation (documenter)
- **SubagentStart/Stop Hooks**: Notification on agent start/stop
- **project.yml.example**: Project configuration template
- **Plugin marketplace support**: Marketplace.json and plugin.json for distribution
- **Plugin name**: DevFlow (short and memorable)

### Features
- Parallel execution of 3 agents (coder × 2 + tester)
- Project memory scope for knowledge persistence
- Automatic test retry loop on failure
- Multi-language coding standards enforcement
- Read-only agents using disallowedTools (reviewer, documenter)

## [Unreleased]

### Planned
- Additional language support (Java, C#, etc.)
- Integration with external code review tools
- Performance profiling integration
- CI/CD pipeline generation
