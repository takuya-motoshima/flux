# DevFlow - 開発ガイド

> 最終更新: 2026-02-07

このドキュメントは、DevFlow の開発者および Claude Code セッション向けのコンテキスト情報を提供する

## プロジェクト概要

**DevFlow** は、6つの専門エージェントを使って開発ワークフローを自動化する Claude Code プラグイン。PM のように段階的に要件を深掘りし、開発タスクを並列実行して効率化する

### 主要機能
- **PM的なヒアリング**: orchestrator が段階的な質問で要件を深掘り
- **多言語対応**: TypeScript/JavaScript、Python、Go、Rust をサポート
- **並列実行**: coder × 2 + tester を並列で実行してコンテキスト効率化
- **自動検出**: プロジェクト構造、テストフレームワーク、コーディング規約を自動認識
- **セキュリティチェック**: XSS、SQLインジェクション、コマンドインジェクションを検出
- **メモリ管理**: プロジェクトスコープで知識を永続化

## 現在の状態

### バージョン: 1.0.0
- GitHub に初回リリース公開済み
- 6つのエージェント実装済み (orchestrator, planner, coder, tester, reviewer, documenter)
- カスタムコマンド (`/flow-*`) で簡単アクセス
- SubagentStart/Stop フックで通知機能
- 英語・日本語 README 完備
- MIT ライセンス
- 詳細な v1.0.0 の CHANGELOG

### リポジトリ
- **GitHub**: https://github.com/takuya-motoshima/devflow
- **インストール**: `claude plugin install https://github.com/takuya-motoshima/devflow --scope project`

## プロジェクト構造

```
devflow/
├── .claude/
│   ├── agents/                      # 6つの専門エージェント
│   │   ├── orchestrator.md         # PM役 - 要件ヒアリング、ワークフロー管理
│   │   ├── planner.md              # 設計担当 - 影響範囲分析、設計書作成
│   │   ├── coder.md                # 実装担当 - 多言語対応実装
│   │   ├── tester.md               # テスト担当 - 自動検出、テスト実行
│   │   ├── reviewer.md             # レビュー担当 - 品質・セキュリティチェック
│   │   └── documenter.md           # ドキュメント担当 - README、API仕様書、アーキテクチャ
│   ├── commands/                    # カスタムスラッシュコマンド
│   │   ├── flow-dev.md             # /flow-dev - orchestrator 起動
│   │   ├── flow-design.md          # /flow-design - 設計作成
│   │   ├── flow-review.md          # /flow-review - コードレビュー
│   │   ├── flow-test.md            # /flow-test - テスト実行
│   │   └── flow-docs.md            # /flow-docs - ドキュメント生成
│   └── hooks/
│       └── hooks.json              # SubagentStart/Stop 通知フック
├── .claude-plugin/
│   └── marketplace.json            # プラグインマーケットプレイスのメタデータ
├── .gitignore                      # Git除外設定 (.claude/memory/ を含む)
├── LICENSE                         # MIT ライセンス
├── README.md                       # 英語ドキュメント
├── README.ja.md                    # 日本語ドキュメント
└── CHANGELOG.md                    # バージョン履歴

```

## エージェントアーキテクチャ

### 1. orchestrator (PM役)
**目的**: 要件ヒアリングとワークフローの調整

**ワークフロー**:
- Step 1: 言語確認 (日本語/英語)
- Step 2: プロジェクト環境の自動分析 (既存改修の場合)
- Step 3: 5つの原則に基づいた段階的な要件ヒアリング
- Step 4: 他のエージェントを順次/並列で調整

**重要な設計判断**: 言語設定は `.claude/memory/user-preferences.md` に保存され、全エージェントで強制適用される

### 2. planner (設計担当)
**目的**: 設計作成と影響範囲分析

**成果物**:
- `DESIGN.md` - アーキテクチャと実装計画
- 既存プロジェクトの影響範囲分析
- ファイル構造の推奨案

### 3. coder (実装担当)
**目的**: 多言語対応の実装

**機能**:
- TypeScript/JavaScript、Python、Go、Rust をサポート
- 既存コードからコーディング規約を自動検出
- planner の設計に基づいて実装
- **2インスタンス並列実行可能** (UI + API の分離)

**重要**: すべてのコードとコメントはユーザーが選択した言語で記述される

### 4. tester (テスト担当)
**目的**: テストフレームワークの自動検出と実行

**機能**:
- 自動検出: Vitest/Jest/Mocha/Jasmine/Ava (JS/TS)、pytest/unittest/nose (Python)、testing/testify (Go)、cargo test (Rust)
- planner の仕様に基づいてテストコードを生成
- カバレッジ測定
- **自動リトライループ**: テスト失敗時は coder と連携して修正

### 5. reviewer (レビュー担当)
**目的**: コード品質とセキュリティのレビュー

**特徴**:
- **読み取り専用エージェント** (disallowedTools: Edit, Write, NotebookEdit)
- セキュリティチェックリスト (XSS, SQLインジェクション, コマンドインジェクション等)
- 言語固有のセキュリティチェック
- `REVIEW.md` に結果を出力

### 6. documenter (ドキュメント担当)
**目的**: ドキュメント生成

**特徴**:
- **読み取り専用エージェント** (disallowedTools: Edit, Write, NotebookEdit)
- README.md、OpenAPI/Swagger 仕様書、アーキテクチャドキュメントを生成
- すべてのドキュメントはユーザーが選択した言語で作成される

## 重要な設計判断

### 言語サポート
- **orchestrator の Step 1**: 必ず最初に言語設定を確認
- **永続化**: 言語設定は `.claude/memory/user-preferences.md` に保存
- **強制適用**: すべてのエージェントがメモリをチェックし、会話と成果物の両方で選択言語を使用

### 並列実行戦略
**なぜ並列?**
- コンテキストウィンドウの効率化
- 各サブエージェントは別コンテキストで作業
- メイン会話は最終結果のみを受け取る

**並列フェーズ** (Step 4):
- coder (UI 実装)
- coder (API 実装)
- tester (テスト仕様書作成)

**順次フェーズ**:
- planner (設計が最初に完了する必要がある)
- tester 実行 (コード作成後)
- reviewer (テスト成功後)
- documenter (最終ステップ)

### メモリスコープ
- **Project スコープ** (推奨): `.claude/` - チームで共有、Git管理
- **User スコープ**: `~/.claude/` - 全プロジェクトで個人設定
- **Local スコープ**: `.claude-local/` - 実験用、Git除外

### 読み取り専用エージェント
`reviewer` と `documenter` は読み取り専用（コード編集不可）。分析とドキュメント作成のみを行い、実装は変更しない

## 開発ガイドライン

### 新機能を追加する場合

1. **関連エージェントを更新**: `.claude/agents/` のエージェントマークダウンファイルを修正
2. **CHANGELOG.md を更新**: `[Unreleased]` セクションに追加
3. **README を更新**: README.md と README.ja.md の両方に追加
4. **ローカルテスト**: `claude --plugin-dir ./devflow` でテスト
5. **バージョンアップ**: セマンティックバージョニングに従う

### エージェントマークダウンの構造

各エージェントファイルはこの構造に従う:
```markdown
---
name: agent-name
description: Short description
memoryScope: project  # or user/local
---

# Agent Name

## Role
[エージェントの役割の明確な説明]

## Responsibilities
[このエージェントが行うこと]

## Workflow
[ステップバイステップのプロセス]

## Important Notes
[特別な考慮事項、制約]
```

### カスタムコマンド

`.claude/commands/` のカスタムコマンドはエージェントを直接呼び出す:
- 説明は短く明確に
- 一貫した命名規則: `/flow-*`
- エージェント呼び出しを含める: `@agent-name`

### フック

`hooks.json` は SubagentStart/Stop イベントを定義:
- デフォルト: ターミナルに通知を表示
- カスタマイズ可能: ユーザーは Slack webhook、ログ記録などを追加可能

## 今後の開発予定

`CHANGELOG.md` → `[Unreleased]` セクションで計画中の機能を確認:
- 追加言語サポート (Java, C# など)
- 外部コードレビューツールとの連携
- パフォーマンスプロファイリング連携
- CI/CD パイプライン生成

### 拡張案

1. **エージェントの専門化**: より専門的なエージェントを追加 (例: performance-optimizer, security-auditor)
2. **ワークフローのカスタマイズ**: `project.yml` でカスタムワークフローを定義可能に
3. **テンプレートライブラリ**: 一般的なプロジェクトタイプ向けのビルド済みテンプレート
4. **学習モード**: エージェントがユーザーのフィードバックから学習して改善
5. **統合プラグイン**: GitHub Actions、GitLab CI、Jenkins との連携

## 重要事項

### コミットガイドライン
- **著者の好み**: コミットは手動で行う、"Co-Authored-By: Claude" の記載なし
- **言語**: コミットメッセージは英語（著者は日本人だが）
- **フォーマット**: 可能な限り Conventional Commits に従う

### インストールテスト
```bash
# 別のプロジェクトから
claude plugin install https://github.com/takuya-motoshima/devflow --scope project

# 確認
/agents
/flow-dev
```

### 関連リソース
- **プラグインドキュメント**: https://code.claude.com/docs/ja/plugins
- **エージェントシステム**: https://code.claude.com/docs/ja/agents
- **マーケットプレイス**: https://code.claude.com/docs/ja/plugin-marketplaces

## 連絡先

- **著者**: Takuya Motoshima
- **GitHub**: https://github.com/takuya-motoshima
- **リポジトリ**: https://github.com/takuya-motoshima/devflow
