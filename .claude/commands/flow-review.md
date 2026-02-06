---
description: "Run code review with reviewer agent"
---

# DevFlow: Review

reviewerエージェントを呼び出して、コードレビューを実行してください。

reviewerはコード品質とセキュリティをチェックし、レビュー結果を REVIEW.md に出力します。

## 実行手順

1. reviewerエージェントに処理を移譲
2. コード品質（可読性、保守性、型安全性）をチェック
3. セキュリティ問題（XSS、SQLインジェクション、コマンドインジェクション等）を自動検出
4. レビュー結果を REVIEW.md に出力

@reviewer
Please review the codebase and output the results to REVIEW.md.
