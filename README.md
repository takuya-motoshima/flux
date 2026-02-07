[日本語版 README はこちら](README.ja.md)

# Flux

A Claude Code plugin marketplace for enhanced development workflows.

## Available Plugins

### [DevFlow](devflow/)

Just tell it what you want to build — DevFlow handles design, implementation, testing, code review, and documentation automatically with 6 specialized agents.

```
You: /devflow:dev "I want to build a chat app using Gemini API"

→ docs/DESIGN.md    Design document
→ src/              Source code (parallel implementation)
→ tests/            Auto-generated tests
→ REVIEW.md         Quality & security review
→ README.md, docs/  Documentation
```

**Features**: PM-like hearing, multi-language (TS/JS, Python, Go, Rust), parallel execution, security checks, project memory

## Installation

### 1. Add marketplace

```
/plugin marketplace add takuya-motoshima/flux
```

### 2. Install plugin

```
/plugin install devflow@flux
```

Choose your preferred scope:

| Scope | Usage |
|-------|-------|
| **user** (default) | Available across all projects |
| **project** | Shared with team via Git |
| **local** | Personal use, Git excluded |

### 3. Verify

```
/agents
```

## Requirements

- Claude Code >= 1.0.0

## License

MIT

## Author

Takuya Motoshima
https://github.com/takuya-motoshima
