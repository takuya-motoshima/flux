---
description: "Run tests with tester agent"
argument-hint: "[test target or scope]"
disable-model-invocation: true
---

# DevFlow: Test

Delegate to the tester agent to run tests.

The tester auto-detects the test framework and generates/executes test code.

## Execution Steps

1. Delegate to the tester agent
2. Auto-detect test framework (Vitest/Jest/pytest/Go testing/cargo test)
3. Generate and execute test code
4. Report test results

@devflow:tester
Please run tests and report the results.
