# DevFlow - 開発ガイド

> 最終更新: 2026-02-08

DevFlow の開発者および Claude Code セッション向けのコンテキスト情報

## プロジェクト概要

**DevFlow** は、5つの専門エージェントと PM コマンドを使って開発ワークフローを自動化する Claude Code プラグイン。PM のように段階的に要件を深掘りし、開発タスクを並列実行して効率化する

**マーケットプレイス**: [Flux](https://github.com/takuya-motoshima/flux)

### 主要機能
- **PM的なヒアリング**: `/devflow:dev` コマンドが段階的な質問で要件を深掘り
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

## リポジトリ構成

DevFlow は2つのリポジトリで管理している:

| リポジトリ | 用途 | インストール |
|-----------|------|-------------|
| [flux](https://github.com/takuya-motoshima/flux) `/devflow/` | **正（ソースオブトゥルース）**。マーケットプレイス経由で配布 | `/plugin install devflow@flux` |
| [devflow](https://github.com/takuya-motoshima/devflow) | 公式 Claude Plugin Directory 提出用のスタンドアロンコピー | `/plugin install devflow@claude-plugin-directory` |

**なぜ2つあるのか**: Claude Plugin Directory はマーケットプレイスではなくスタンドアロンリポジトリを求めるため。開発は flux/devflow/ で行い、公式ディレクトリ用に devflow リポジトリへ同期する

### README の同期

`scripts/sync-to-devflow.js` で flux/devflow/ の README を projects/devflow/ にコピーし、インストールコマンドを公式ディレクトリ向けに自動置換する:

- `devflow@flux` → `devflow@claude-plugin-directory`
- マーケットプレイス追加コマンドの削除
- アップデート手順の簡略化

```bash
node scripts/sync-to-devflow.js [dest-path]
# デフォルト: ../devflow（= projects/devflow/）
```

README 以外のファイル（agents/, commands/, hooks/ 等）は両リポジトリで同一なので手動コピーで対応

## プロジェクト構造

```
flux/                                # マーケットプレイスリポジトリ
├── .claude-plugin/
│   └── marketplace.json             # マーケットプレイスカタログ (name: "flux")
├── devflow/                         # DevFlow プラグイン
│   ├── .claude-plugin/
│   │   └── plugin.json              # プラグインマニフェスト
│   ├── agents/                      # 5つの専門エージェント
│   │   ├── planner.md               # 設計担当 - 影響範囲分析、設計書作成
│   │   ├── coder.md                 # 実装担当 - 多言語対応実装
│   │   ├── tester.md                # テスト担当 - 自動検出、テスト実行
│   │   ├── reviewer.md              # レビュー担当 - 品質・セキュリティチェック
│   │   └── documenter.md            # ドキュメント担当 - README、API仕様書
│   ├── commands/                    # カスタムスラッシュコマンド
│   │   ├── dev.md                   # /devflow:dev - PM ワークフロー（ヒアリング→開発実行）
│   │   ├── design.md                # /devflow:design - 設計作成
│   │   ├── review.md                # /devflow:review - コードレビュー
│   │   ├── test.md                  # /devflow:test - テスト実行
│   │   └── docs.md                  # /devflow:docs - ドキュメント生成
│   ├── hooks/
│   │   └── hooks.json               # SubagentStart/Stop 通知フック
│   ├── scripts/
│   │   └── notify.js                # エージェント開始・終了の通知スクリプト
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
/devflow:dev (PM役 — メインコンテキストで実行)
  ├── Step 0: 会話言語の確認 → .claude/memory/user-preferences.md に保存
  ├── Step 1: プロジェクト環境の自動分析
  ├── Step 2: 段階的な要件ヒアリング
  └── Step 3: サブエージェント起動（Task ツール経由 — 全て1階層目）
        │
        ├─ planner (設計) ─── docs/DESIGN.md 出力
        │
        ├─ [並列] coder × N + tester (テスト仕様書作成) ─── docs/TEST_SPEC.md 出力【テストありの場合】
        │
        ├─ tester (テスト実行) ─── docs/TEST_REPORT.md 出力、失敗時は coder と連携して自動修正【オプション】
        │
        ├─ reviewer (レビュー) ─── docs/REVIEW.md 出力【オプション】
        │
        └─ documenter (ドキュメント) ─── README.md 出力（+ 条件付きで API仕様書, docs/ARCHITECTURE.md）
```

### 各エージェントの役割

| コンポーネント | 目的 | 成果物 | 備考 |
|---|---|---|---|
| **`/devflow:dev`** | 要件ヒアリング、ワークフロー管理 | — | メインコンテキストで実行。全エージェントを Task ツールで起動 |
| **planner** | 設計作成、影響範囲分析 | `docs/DESIGN.md` | 並列実行の推奨は返答テキストで直接伝達 |
| **coder** | 多言語対応の実装 | ソースコード | × N 並列実行可能 |
| **tester** | テスト自動検出・実行 | `docs/TEST_SPEC.md`、`docs/TEST_REPORT.md`、テストコード | Vitest/Jest/pytest/cargo test 等を自動検出 |
| **reviewer** | 品質・セキュリティレビュー | `docs/REVIEW.md` | **読み取り専用**（disallowedTools: Edit） |
| **documenter** | ドキュメント生成・更新 | README, API仕様書 | **ソースコード変更不可**（.md, .yaml のみ編集） |

### 設計上の重要なポイント

- **会話言語**: `/devflow:dev` が最初に確認し、`.claude/memory/user-preferences.md` に保存。全エージェントが参照して会話・成果物の言語を統一する
- **フラット階層**: `/devflow:dev` コマンドがメインコンテキストで直接ヒアリングし、Task ツールで全エージェントを起動する。全サブエージェントが1階層目になるため、SubagentStart/Stop フックが全て発火する（公式 feature-dev プラグインと同じパターン）
- **並列実行**: 各サブエージェントは別コンテキストで動作。メイン会話は最終結果のみ受け取るため、コンテキストウィンドウを効率的に使える
- **読み取り専用エージェント**: reviewer と documenter はソースコードを変更しない設計。レビュー結果やドキュメントのみ出力する
- **開発モード**: ヒアリング時に4つのモードから選択可能。テスト・レビューを個別にオプション化（documenter は常に実行）
- **コンパクション復帰**: `/devflow:dev` は長時間セッションでコンテキスト圧縮が発生する可能性がある。状態を `.claude/memory/` のファイルに保存し、圧縮後に再読み込みして復帰する設計
- **セッション契約書**: `/devflow:dev` が `.claude/memory/dev-session.md` に Project 情報、Expected Outputs、Requirements Summary（ヒアリング結果）、Parallel Plan（coder 分担）、Progress（進行状況）を記録。各サブエージェントはこのファイルに従って出力を制御し、コンパクション後の状態復帰にも使う

### 公式ドキュメントとの整合性（調査メモ）

[サブエージェント公式ドキュメント](https://code.claude.com/docs/en/sub-agents) と照合した結果:

- **使用中のフィールド**: `name`, `description`, `tools`, `disallowedTools`, `permissionMode`, `model`, `color`, `memory`, `maxTurns` — すべて公式仕様通り
- **`permissionMode`**: サブエージェント5つ（planner, coder, tester, reviewer, documenter）に `acceptEdits` を設定
- **`skills` フィールド**: スキルをサブエージェントに事前ロード可能。将来的にコーディング規約スキルを coder にプリロードする用途で検討
- **フラット階層の理由**: ネストされたサブエージェント（サブエージェントが Task で起動したサブエージェント）は SubagentStart/Stop フックが発火しない。コマンドから直接 Task で起動すれば全サブエージェントが1階層目となり、フックが正常に動作する。公式 [feature-dev プラグイン](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev) も同じパターンを採用
- **エージェントチーム**（[公式ドキュメント](https://code.claude.com/docs/en/agent-teams)）: 複数の Claude Code インスタンスがメッセージで直接会話・協調する仕組み。実験的機能（`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 必須）。DevFlow は現行のサブエージェント方式で十分なため v1 では不採用。理由: (1) 実験的で不安定 (2) ワークフローが直列でエージェント間通信不要 (3) トークンコストが大幅に増加 (4) セッション再開不可 (5) split pane が tmux/iTerm2 依存。安定化後に並列レビュー（セキュリティ/パフォーマンス/テスト）等で検討

## 開発ガイドライン

### 新機能を追加する場合

1. `agents/` のエージェントマークダウンファイルを修正
2. `CHANGELOG.md` の `[Unreleased]` セクションに追加
3. README.md と README.ja.md の両方を更新
4. `claude --plugin-dir ./devflow` でローカルテスト（下記チェックリスト参照）
5. セマンティックバージョニングに従ってバージョンアップ

### 動作確認チェックリスト

ローカルテスト時に以下を確認する。全項目を毎回チェックする必要はなく、変更に関連する項目を選んで確認する

#### ワークフロー
- [ ] モード1（フル開発）で planner → coder + tester(並列) → tester(実行) → reviewer → documenter が順に動くか
- [ ] モード4（テスト・レビューなし）で tester/reviewer がスキップされるか
- [ ] `.claude/memory/dev-session.md` にモードが正しく保存されるか
- [ ] `.claude/memory/dev-session.md` に Project、Expected Outputs、Requirements Summary、Parallel Plan、Progress が正しく書かれるか
- [ ] `.claude/memory/user-preferences.md` に言語設定が保存されるか

#### ドキュメント出力
- [ ] `docs/DESIGN.md` がアプリの設計情報のみで、エージェントのワークフロー情報を含まないか
- [ ] `docs/TEST_SPEC.md` が Phase 1 で生成されるか
- [ ] `docs/TEST_REPORT.md` が 100行以内か
- [ ] `docs/REVIEW.md` が 200行以内か
- [ ] README.md が会話言語で作成されるか
- [ ] README.md と DESIGN.md の内容が重複していないか
- [ ] CLI プロジェクトで API仕様書が生成されないか
- [ ] 単一モジュールのプロジェクトで ARCHITECTURE.md が生成されないか
- [ ] Expected Outputs に載っていないドキュメントが生成されないか

### エージェントマークダウンの構造

```markdown
---
name: agent-name
description: "エージェントの短い説明"
tools: Read, Edit, Write, Bash, Glob, Grep
disallowedTools: Edit  # 必要に応じて
permissionMode: acceptEdits  # サブエージェントのみ
model: sonnet
color: yellow  # blue/green/yellow/cyan/red/magenta
memory: project
maxTurns: 50  # 役割に応じて調整
---
あなたは[役割]です。

## 会話言語の確認
[メモリから言語設定を読み取る]

## 役割
[このエージェントが行うこと]

## ワークフロー
[ステップバイステップのプロセス。サブセクションは **太字** で区切る]

**Step 1**: ...
**Step 2**: ...

## 注意事項
[特別な考慮事項、制約]

## メモリ管理
[完了後にメモリに記録する内容]
```

**見出しルール**: `##` をメインの区切りに使用。`###` は長いエージェント（300行超）で順序ステップを示す場合のみ。短いエージェントでは `**太字**` でサブセクションを区切る

### カスタムコマンド

`commands/` のコマンドはエージェントを直接呼び出す:
- 命名規則: `/devflow:*`
- エージェント呼び出し: `@devflow:agent-name`
- 引数の受け渡し: `argument-hint` で引数をサポート。skill 本文に `$ARGUMENTS` がなくても、ユーザーの入力は末尾に `ARGUMENTS: <value>` として自動付与される（[公式ドキュメント](https://code.claude.com/docs/en/skills#pass-arguments-to-skills)）

### フック

`hooks.json` は SubagentStart/Stop イベントを定義:
- エージェントの開始・終了を `scripts/notify.js` で通知
- 公式フォーマット: `[{ hooks: [{ type, command }] }]`
- `${CLAUDE_PLUGIN_ROOT}` でプラグインルートを参照
- スクリプトは Node.js の `process.stdin` でクロスプラットフォーム対応

## コミットガイドライン

- コミットは手動で行う（"Co-Authored-By: Claude" の記載なし）
- コミットメッセージは英語
- Conventional Commits に従う

## 今後の開発予定

`CHANGELOG.md` → `[Unreleased]` セクションを参照

## トラブルシューティング

### インストール後に `/agents` にエージェントが表示されない

プラグインのホットリロードは未実装（[#18174](https://github.com/anthropics/claude-code/issues/18174), [#6497](https://github.com/anthropics/claude-code/issues/6497)）。インストール後は **Claude Code を再起動** する必要がある

```
/plugin install devflow@flux
→ Claude Code を終了して再起動
→ /agents で確認
```

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

## 掲載・提出状況

| 提出先 | 方法 | 状態 | URL |
|-------|------|------|-----|
| [Anthropic 公式ディレクトリ](https://github.com/anthropics/claude-plugins-official) | フォーム提出 | 審査待ち | フォーム経由のため追跡URLなし |
| [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) (23.3k stars) | Issue #662 | バリデーション待ち | [#662](https://github.com/hesreallyhim/awesome-claude-code/issues/662) |
| [awesome-claude-plugins](https://github.com/ComposioHQ/awesome-claude-plugins) (1.5k stars) | — | スキップ | プラグインコード全体のコピーが必要な構造のため対象外 |
| [awesome-claude-code-plugins](https://github.com/ccplugins/awesome-claude-code-plugins) (459 stars) | — | スキップ | 同上 |
| [ClaudePluginHub](https://www.claudepluginhub.com/) (11,000+ plugins) | 自動スキャン | 反映待ち | push 後 30 分以内に自動検出される想定 |

> **Note:** devflow スタンドアロンリポ（https://github.com/takuya-motoshima/devflow）は Anthropic 公式ディレクトリの審査完了後に削除予定。flux マーケットプレイスに一本化する

## 関連リソース

- [プラグインドキュメント](https://code.claude.com/docs/ja/plugins)
- [プラグインリファレンス](https://code.claude.com/docs/ja/plugins-reference)
- [サブエージェント](https://code.claude.com/docs/en/sub-agents)
- [エージェントシステム](https://code.claude.com/docs/ja/agents)
- [マーケットプレイス](https://code.claude.com/docs/ja/plugin-marketplaces)

## 連絡先

- **著者**: Takuya Motoshima
- **GitHub**: https://github.com/takuya-motoshima
- **X**: https://x.com/takuya_motech
- **リポジトリ**: https://github.com/takuya-motoshima/flux
