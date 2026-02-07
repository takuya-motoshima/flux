[English README](README.md)

# DevFlow

PM的なヒアリングと6つの専門エージェントによる自動開発ワークフロー

「何を作りたいか」を伝えるだけ。DevFlow が設計・実装・テスト・レビュー・ドキュメント生成まで自動で進める。

## DevFlow を使うとどうなる？

```
あなた: /devflow:dev
       「Gemini APIを使ったチャットアプリを作りたい」

DevFlow が自動で実行:
  1. 対話で要件を深掘り（数問の質問）
  2. 設計書を作成                     → docs/DESIGN.md
  3. コードを並列で実装                → src/
  4. テストを自動生成・実行            → tests/
  5. コード品質・セキュリティレビュー    → REVIEW.md
  6. README・API仕様書を生成          → README.md, docs/
```

1回の指示で、設計→実装→テスト→レビュー→ドキュメントの開発サイクルを自動化。

## 特徴

- **PM的なヒアリング**: orchestrator が段階的に要件を深掘り、自然な対話で開発を進める
- **多言語対応**: TypeScript/JavaScript、Python、Go、Rust をサポート
- **自動検出**: プロジェクト構造、テストフレームワーク、コーディング規約を自動認識
- **並列実行**: coder + tester を並列で実行してコンテキスト効率化（coder の数はタスクに応じて動的に決定）
- **セキュリティチェック**: XSS、SQLインジェクション、コマンドインジェクションを自動検出
- **メモリ管理**: project スコープで知識を永続化

## 必要要件

- [Claude Code](https://claude.com/claude-code) >= 1.0.0

## インストール

```
/plugin marketplace add takuya-motoshima/flux
/plugin install devflow@flux
```

## 使い方

### カスタムコマンドで簡単実行（推奨）

```bash
/devflow:dev       # 開発開始（orchestrator起動）
/devflow:design    # 設計作成
/devflow:review    # コードレビュー
/devflow:test      # テスト実行
/devflow:docs      # ドキュメント生成
```

### または、エージェントを直接指定

```
@devflow:orchestrator
Gemini APIを使ったチャットアプリを作りたい
```

個別のエージェントを直接呼び出すこともできる:

```
@devflow:planner    # 設計のみ
@devflow:coder      # 実装のみ
@devflow:tester     # テストのみ
@devflow:reviewer   # レビューのみ
@devflow:documenter # ドキュメント生成のみ
```

### エージェント一覧

| エージェント | 役割 | 出力 | 備考 |
|------------|------|------|------|
| `orchestrator` | PM: 要件ヒアリング、開発フロー管理 | - | ワークフロー全体を管理 |
| `planner` | 設計: 影響範囲分析、設計書作成 | `docs/DESIGN.md` | |
| `coder` | 実装: 多言語対応コーディング | ソースコード | タスク構造に応じて × N 並列実行 |
| `tester` | テスト: フレームワーク自動検出、テスト実行 | テストコード | Vitest/Jest/pytest/Go testing/cargo test 対応 |
| `reviewer` | レビュー: 品質・セキュリティチェック | `REVIEW.md` | 読み取り専用（コードを変更しない） |
| `documenter` | ドキュメント: README、API仕様書、アーキテクチャ | `README.md`, `docs/` | ドキュメントのみ（ソースコードは変更しない） |

## 実行フロー

```
[orchestrator] <- ユーザーはここに1回指示するだけ
    |
  Step 0: 会話言語の選択（初回のみ）
    |
  Step 1: プロジェクト環境の自動分析（既存改修の場合）
    |
  Step 2: ヒアリング（何を作る？既存改修？）
    |
[planner] 設計（順次） -> docs/DESIGN.md
    |
  並列実行 --+-- [coder] × N（独立した領域ごとに分担）
             +-- [tester] テスト仕様書作成
    |
[tester] テスト実行（順次）
    |（テスト失敗時は coder で修正してループ）
[reviewer] レビュー（順次） -> REVIEW.md
    |
[documenter] ドキュメント生成（オプション）
```

## Hooks（通知機能）

エージェントの開始・終了時に SubagentStart/Stop フックで通知される。

デフォルト: ターミナルに通知を表示。`hooks/hooks.json` をカスタマイズして Slack webhook やログ記録などを追加できる。

## プロジェクト設定（オプション）

`project.yml` を作成してプロジェクト固有の設定をカスタマイズ:

```bash
cp project.yml.example project.yml
```

設定項目:
- 使用言語・フレームワーク
- テストフレームワーク・カバレッジ目標
- コーディング規約（最大行数、型チェック等）
- セキュリティチェック項目
- ドキュメント自動生成設定

## ライセンス

MIT

## 著者

Takuya Motoshima ([@takuya-motoshima](https://github.com/takuya-motoshima))
