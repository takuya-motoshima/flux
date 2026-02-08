---
description: "Run code review with reviewer agent"
argument-hint: "[files or scope to review]"
disable-model-invocation: true
---

# DevFlow: Review

Delegate to the reviewer agent to run a code review.

The reviewer checks code quality and security, then outputs results to docs/REVIEW.md.

## Execution Steps

1. Delegate to the reviewer agent
2. Check code quality (readability, maintainability, type safety)
3. Detect security issues (XSS, SQL injection, command injection, etc.)
4. Output review results to docs/REVIEW.md

@devflow:reviewer
Please review the codebase and output the results to docs/REVIEW.md.
