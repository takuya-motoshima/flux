[English README](README.md)

# DevFlow

PM-like hearing and automated dev workflow with 6 specialized agents

## 特徴

- **PM的なヒアリング**: orchestrator が段階的に要件を深掘り、自然な対話で開発を進める
- **多言語対応**: TypeScript/JavaScript、Python、Go、Rust をサポート
- **自動検出**: プロジェクト構造、テストフレームワーク、コーディング規約を自動認識
- **並列実行**: coder × 2 + tester を並列で実行してコンテキスト効率化
- **セキュリティチェック**: XSS、SQLインジェクション、コマンドインジェクションを自動検出
- **メモリ管理**: project スコープで知識を永続化

## 必要要件

- Claude Code >= 1.0.0

## インストール

```bash
# プロジェクトスコープ（推奨: チーム共有、Git管理）
claude plugin install https://github.com/takuya-motoshima/devflow --scope project

# ユーザースコープ（全プロジェクトで使用）
claude plugin install https://github.com/takuya-motoshima/devflow --scope user

# ローカルスコープ（個人実験用、Git除外）
claude plugin install https://github.com/takuya-motoshima/devflow --scope local
```

### スコープの使い分け

| スコープ | 配置場所 | Git管理 | 用途 |
|---------|---------|--------|------|
| **project** (推奨) | `.claude/` | ✓ | チーム開発で共有 |
| **user** | `~/.claude/` | - | 全プロジェクトで個人的に使用 |
| **local** | `.claude-local/` | × (自動除外) | 実験的に試す場合 |

## 使い方

### 1. エージェント一覧を確認

```bash
/agents
```

6つのエージェントが表示される:
- `orchestrator` - プロジェクトマネージャー（要件ヒアリング、開発フロー管理）
- `planner` - 設計担当（影響範囲分析、設計書作成）
- `coder` - 実装担当（多言語対応、規約準拠）
- `tester` - テスト担当（自動検出、カバレッジ測定）
- `reviewer` - レビュー担当（品質・セキュリティチェック）
- `documenter` - ドキュメント担当（README、API仕様書、アーキテクチャ）

### 2. カスタムコマンドで簡単実行（推奨）

```bash
# 開発開始（orchestrator起動）
/flow-dev

# 設計作成
/flow-design

# コードレビュー
/flow-review

# テスト実行
/flow-test

# ドキュメント生成
/flow-docs
```

### 3. または、エージェントを直接指定

```
@orchestrator
Gemini APIを使ったチャットアプリを作りたい
```

orchestrator が以下を自動実行:
1. プロジェクト環境を自動分析（既存改修の場合）
2. 対話で要件をヒアリング
3. planner で設計
4. **並列実行**: coder × 2（UI + API）+ tester（テスト仕様書）
5. tester でテスト実行（失敗時は coder で修正）
6. reviewer でレビュー
7. documenter でドキュメント生成（オプション）

### 4. バックグラウンド実行

エージェント実行中に `Ctrl+B` でバックグラウンド化可能

### 5. 作業内容確認

エージェント完了後に `Ctrl+O` で詳細な作業内容を確認

## プロジェクト設定（オプション）

`.claude/project.yml` を作成してプロジェクト固有の設定をカスタマイズ可能:

```bash
cp .claude/project.yml.example .claude/project.yml
```

設定項目:
- 使用言語・フレームワーク
- テストフレームワーク・カバレッジ目標
- コーディング規約（最大行数、型チェック等）
- セキュリティチェック項目
- ドキュメント自動生成設定

## Hooks（通知機能）

エージェントの開始・完了時に通知を表示:

```
[START] orchestrator is starting...
[DONE] orchestrator has finished
```

`.claude/hooks/hooks.json` をカスタマイズして Slack 通知やログ記録も可能:

```json
{
  "hooks": {
    "SubagentStart": {
      "command": "curl -X POST https://hooks.slack.com/... -d '{\"text\": \"$SUBAGENT_NAME started\"}'",
      "description": "Slack通知"
    }
  }
}
```

## 実行フロー

```
[orchestrator] ← ユーザーはここに1回指示するだけ
    ↓
  Step 0: プロジェクト環境の自動分析（既存改修の場合）
    ↓
  Step 1: ヒアリング（何を作る？既存改修？）
    ↓
[planner] 設計（順次）
    ↓
  並列実行 ─┬─ [coder] UI実装
            ├─ [coder] API実装
            └─ [tester] テスト仕様書作成
    ↓
[tester] テスト実行（順次）
    ↓（テスト失敗時は coder で修正してループ）
[reviewer] レビュー（順次）
    ↓
[documenter] ドキュメント生成（オプション）
```

## ライセンス

MIT

## 作者

Takuya Motoshima
https://github.com/takuya-motoshima
