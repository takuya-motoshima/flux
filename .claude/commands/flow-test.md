---
description: "Run tests with tester agent"
---

# DevFlow: Test

testerエージェントを呼び出して、テストを実行してください。

testerはテストフレームワークを自動検出し、テストコードの生成・実行を行います。

## 実行手順

1. testerエージェントに処理を移譲
2. テストフレームワークを自動検出（Vitest/Jest/pytest/Go testing/cargo test）
3. テストコードを生成・実行
4. テスト結果を報告

@tester
Please run tests and report the results.
