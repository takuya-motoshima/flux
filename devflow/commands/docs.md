---
description: "Generate documentation with documenter agent"
disable-model-invocation: true
---

# DevFlow: Documentation

documenterエージェントを呼び出して、ドキュメントを生成してください。

documenterはREADME.md、API仕様書、アーキテクチャドキュメントを自動生成します。

## 実行手順

1. documenterエージェントに処理を移譲
2. プロジェクト情報を収集（package.json等）
3. コードベースを分析
4. ドキュメントを生成（README.md、docs/ARCHITECTURE.md、API仕様書）

@devflow:documenter
Please generate project documentation including README.md and architecture docs.
