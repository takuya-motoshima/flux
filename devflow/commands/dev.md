---
description: "Start development workflow with orchestrator agent"
argument-hint: "[what to build]"
disable-model-invocation: true
---

# DevFlow: Development Start

orchestratorエージェントを呼び出して、開発フローを開始してください。

orchestratorはプロジェクトマネージャーのように対話で要件をヒアリングし、設計・実装・テスト・レビューのフロー全体を自動で進めます。

## 実行手順

1. orchestratorエージェントに処理を移譲
2. ユーザーとの対話で要件を段階的にヒアリング
3. 開発フロー全体（planner → coder × N + tester → reviewer → documenter）を自動実行

@devflow:orchestrator
Please start the development workflow with PM-like hearing.
