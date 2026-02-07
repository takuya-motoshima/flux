# DevFlow - 開発ガイド

> 最終更新: 2026-02-07

DevFlow の開発者および Claude Code セッション向けのコンテキスト情報

## プロジェクト概要

**DevFlow** は、6つの専門エージェントを使って開発ワークフローを自動化する Claude Code プラグイン。PM のように段階的に要件を深掘りし、開発タスクを並列実行して効率化する

**マーケットプレイス**: [Flux](https://github.com/takuya-motoshima/flux)

### 主要機能
- **PM的なヒアリング**: orchestrator が段階的な質問で要件を深掘り
- **多言語対応**: TypeScript/JavaScript、Python、Go、Rust をサポート
- **並列実行**: coder × N + tester を並列で実行（coder の数はタスクに応じて動的に決定）
- **自動検出**: プロジェクト構造、テストフレームワーク、コーディング規約を自動認識
- **セキュリティチェック**: XSS、SQLインジェクション、コマンドインジェクションを検出
- **メモリ管理**: プロジェクトスコープで知識を永続化

### インストール
```
/plugin marketplace add takuya-motoshima/flux
/plugin install devflow@flux

# 確認
/agents
/devflow:dev
```

## プロジェクト構造

```
flux/                                # マーケットプレイスリポジトリ
├── .claude-plugin/
│   └── marketplace.json             # マーケットプレイスカタログ (name: "flux")
├── devflow/                         # DevFlow プラグイン
│   ├── .claude-plugin/
│   │   └── plugin.json              # プラグインマニフェスト
│   ├── agents/                      # 6つの専門エージェント
│   │   ├── orchestrator.md          # PM役 - 要件ヒアリング、ワークフロー管理
│   │   ├── planner.md               # 設計担当 - 影響範囲分析、設計書作成
│   │   ├── coder.md                 # 実装担当 - 多言語対応実装
│   │   ├── tester.md                # テスト担当 - 自動検出、テスト実行
│   │   ├── reviewer.md              # レビュー担当 - 品質・セキュリティチェック
│   │   └── documenter.md            # ドキュメント担当 - README、API仕様書
│   ├── commands/                    # カスタムスラッシュコマンド
│   │   ├── dev.md                   # /devflow:dev - orchestrator 起動
│   │   ├── design.md                # /devflow:design - 設計作成
│   │   ├── review.md                # /devflow:review - コードレビュー
│   │   ├── test.md                  # /devflow:test - テスト実行
│   │   └── docs.md                  # /devflow:docs - ドキュメント生成
│   ├── hooks/
│   │   └── hooks.json               # SubagentStart/Stop 通知フック
│   ├── scripts/
│   │   └── notify.js                # エージェント開始・終了の通知スクリプト
│   ├── project.yml.example          # プロジェクト設定テンプレート
│   ├── CHANGELOG.md
│   ├── DEVELOPMENT.md               # このファイル
│   ├── LICENSE
│   ├── README.md                    # 英語ドキュメント
│   └── README.ja.md                 # 日本語ドキュメント
├── LICENSE
├── README.md                        # マーケットプレイス概要（EN）
└── README.ja.md                     # マーケットプレイス概要（JP）
```

**plugin.json について**: `agents`, `commands`, `hooks` のパスを明示的に記載。デフォルトディレクトリは自動検出も可能だが、何が含まれるか一目でわかるように明示する方針

## エージェントアーキテクチャ

### 実行フロー

```
orchestrator (PM役)
  ├── Step 0: 会話言語の確認 → .claude/memory/user-preferences.md に保存
  ├── Step 1: プロジェクト環境の自動分析
  ├── Step 2: 段階的な要件ヒアリング
  └── Step 3: サブエージェント起動
        │
        ├─ planner (設計) ─── docs/DESIGN.md 出力
        │
        ├─ [並列] coder × N + tester (テスト仕様書作成)
        │
        ├─ tester (テスト実行) ─── 失敗時は coder と連携して自動修正
        │
        ├─ reviewer (レビュー) ─── REVIEW.md 出力
        │
        └─ documenter (ドキュメント) ─── README.md, docs/ARCHITECTURE.md 出力
```

### 各エージェントの役割

| エージェント | 目的 | 成果物 | 備考 |
|---|---|---|---|
| **orchestrator** | 要件ヒアリング、ワークフロー管理 | — | 全エージェントを Task ツールで起動 |
| **planner** | 設計作成、影響範囲分析 | `docs/DESIGN.md` | 並列実行グループを含む |
| **coder** | 多言語対応の実装 | ソースコード | × N 並列実行可能 |
| **tester** | テスト自動検出・実行 | `docs/TEST_SPEC.md`、テストコード | Vitest/Jest/pytest/cargo test 等を自動検出 |
| **reviewer** | 品質・セキュリティレビュー | `REVIEW.md` | **読み取り専用**（disallowedTools: Edit） |
| **documenter** | ドキュメント生成・更新 | README, API仕様書 | **ソースコード変更不可**（.md, .yaml のみ編集） |

### 設計上の重要なポイント

- **会話言語**: orchestrator が最初に確認し、`.claude/memory/user-preferences.md` に保存。全エージェントが参照して会話・成果物の言語を統一する
- **並列実行**: 各サブエージェントは別コンテキストで動作。メイン会話は最終結果のみ受け取るため、コンテキストウィンドウを効率的に使える
- **読み取り専用エージェント**: reviewer と documenter はソースコードを変更しない設計。レビュー結果やドキュメントのみ出力する

## 開発ガイドライン

### 新機能を追加する場合

1. `agents/` のエージェントマークダウンファイルを修正
2. `CHANGELOG.md` の `[Unreleased]` セクションに追加
3. README.md と README.ja.md の両方を更新
4. `claude --plugin-dir ./devflow` でローカルテスト
5. セマンティックバージョニングに従ってバージョンアップ

### エージェントマークダウンの構造

```markdown
---
name: agent-name
description: エージェントの短い説明
tools: Read, Edit, Write, Bash, Glob, Grep
disallowedTools: Edit  # 必要に応じて
model: sonnet
memory: project
maxTurns: 50  # 役割に応じて調整
---
あなたは[役割]です。

## 会話言語の確認
[メモリから言語設定を読み取る]

## 役割
[このエージェントが行うこと]

## ワークフロー
[ステップバイステップのプロセス]

## 注意事項
[特別な考慮事項、制約]

## メモリ管理
[完了後にメモリに記録する内容]
```

### カスタムコマンド

`commands/` のコマンドはエージェントを直接呼び出す:
- 命名規則: `/devflow:*`
- エージェント呼び出し: `@devflow:agent-name`

### フック

`hooks.json` は SubagentStart/Stop イベントを定義:
- 公式フォーマット: `[{ hooks: [{ type, command }] }]`
- 通知スクリプト: `scripts/notify.js`（Node.js の `process.stdin` でクロスプラットフォーム対応）
- `${CLAUDE_PLUGIN_ROOT}` でプラグインルートを参照

## コミットガイドライン

- コミットは手動で行う（"Co-Authored-By: Claude" の記載なし）
- コミットメッセージは英語
- Conventional Commits に従う

## 今後の開発予定

`CHANGELOG.md` → `[Unreleased]` セクションを参照

## トラブルシューティング

### インストール時にバリデーションエラーが出る

`agents: Invalid input` や `commands: Invalid input` が出る場合、以下を順番に試す

1. **キャッシュクリア** — Claude Code のプラグインキャッシュは自動無効化されない既知バグがある（[#14061](https://github.com/anthropics/claude-code/issues/14061), [#16866](https://github.com/anthropics/claude-code/issues/16866)）
   ```bash
   rm -rf ~/.claude/plugins/cache/
   cd ~/.claude/plugins/marketplaces/flux && git pull
   /plugin install devflow@flux
   ```
2. **マーケットプレイスの名前衝突を確認** — 同名プラグインが別マーケットプレイスにあると、そちらが優先されることがある
   ```bash
   cat ~/.claude/plugins/known_marketplaces.json
   /plugin marketplace remove <古いマーケットプレイス名>
   ```
3. **マーケットプレイスの再登録**
   ```bash
   /plugin marketplace remove flux
   /plugin marketplace add takuya-motoshima/flux
   rm -rf ~/.claude/plugins/cache/
   /plugin install devflow@flux
   ```

## 関連リソース

- [プラグインドキュメント](https://code.claude.com/docs/ja/plugins)
- [プラグインリファレンス](https://code.claude.com/docs/ja/plugins-reference)
- [エージェントシステム](https://code.claude.com/docs/ja/agents)
- [マーケットプレイス](https://code.claude.com/docs/ja/plugin-marketplaces)

## 連絡先

- **著者**: Takuya Motoshima
- **GitHub**: https://github.com/takuya-motoshima
- **リポジトリ**: https://github.com/takuya-motoshima/flux
