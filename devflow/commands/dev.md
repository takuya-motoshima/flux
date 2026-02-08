---
description: "Start development workflow with orchestrator agent"
argument-hint: "[what to build]"
disable-model-invocation: true
---

# DevFlow: Development Start

Delegate to the orchestrator agent to start the development workflow.

The orchestrator acts as a project manager: it conducts requirements hearing through dialogue, selects a development mode, then automatically drives the development flow.

## Execution Steps

1. Delegate to the orchestrator agent
2. Progressively hear requirements through dialogue
3. Select development mode (full / no-test / no-review / no-test-no-review)
4. Run the development flow based on selected mode (planner → coder → documenter, with optional tester and reviewer)

@devflow:orchestrator
IMPORTANT: You MUST start with Step 0 (language check). Read .claude/memory/user-preferences.md first. If the file does not exist, show the bilingual language selection question and STOP. Do NOT proceed to any other step until the user has answered.
