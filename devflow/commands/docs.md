---
description: "Generate documentation with documenter agent"
argument-hint: "[documentation scope]"
disable-model-invocation: true
---

# DevFlow: Documentation

Delegate to the documenter agent to generate documentation.

The documenter auto-generates README.md, API specs, and architecture documents.

## Execution Steps

1. Delegate to the documenter agent
2. Collect project information (package.json, etc.)
3. Analyze the codebase
4. Generate documentation (README.md, docs/ARCHITECTURE.md, API specs)

@devflow:documenter
Please generate project documentation. Follow the generation conditions defined in your instructions for each document type.
