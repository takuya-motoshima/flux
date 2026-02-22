# DevFlow v2.0 改善計画

## Context

HANDOVER.md に基づき、Anthropic公式の feature-dev プラグインの設計思想を取り入れて devflow を強化する。

主な改善点:
- コードベース探索フェーズの追加（新規 explorer エージェント）
- planner に複数アーキテクチャ案の提示機能を追加
- reviewer に信頼度スコアリングを導入
- 言語選択機能の廃止（Claude はユーザーの入力言語に自然に合わせる）
- 全ソースコードを日本語から英語に変換（トークン効率・指示追従の向上）
- ユーザー選択を AskUserQuestion ツールに統一（番号入力 → クリック選択）
- 出力ファイルの整理（`.devflow/` にセッション状態を集約）
- セッション永続化の強化（決定事項・分析結果をファイルに永続化）
- セッション履歴の保存（完了セッションを `.devflow/history/` にアーカイブ）

---

## 出力ファイル構成

### ユーザー向けプロジェクトドキュメント（`docs/` + ルート）

```
プロジェクトルート/
  README.md                          ← documenter
  docs/
    DESIGN.md                        ← planner
    TEST_SPEC.md                     ← tester
    TEST_REPORT.md                   ← tester
    REVIEW.md                        ← reviewer
    ARCHITECTURE.md                  ← documenter（条件付き）
    API.md                           ← documenter（条件付き）
```

### devflow 内部状態（`.devflow/`）

```
.devflow/
  session.md                         ← PM（セッション状態 + 全決定事項）
  research.md                        ← PM（explorer 分析結果を集約）
  history/
    YYYY-MM-DD-HHmm-{要約タイトル}/
      session.md                       ← session.md のコピー
      design.md                        ← docs/DESIGN.md のコピー
```

- `.claude/memory/dev-session.md` → `.devflow/session.md` に移動
- `.claude/memory/user-preferences.md` → 廃止
- `.devflow/` を `.gitignore` に追加するかはユーザー判断

### `.devflow/session.md` の構成（強化版）

```markdown
# Dev Session

## Development Mode
- Mode: [1/2/3/4]
- Testing: [enabled/disabled]
- Review: [enabled/disabled]

## Project
- Type: [CLI/Web App/Library/API Server/Other]
- Language: [Node.js/Python/Go/Rust]
- Scope: [new/existing]

## Requirements
- Goal: [詳細な目標]
- Features: [機能リスト]
- Tech Stack: [技術スタック]
- Constraints: [制約事項]
- Context: [背景・動機]

## Decisions
- [質問]: [ユーザーの回答]
- ...
- Architecture: [選択した候補と理由]
- Review Response: [fix now / fix later / proceed as-is]（Phase 7 完了後）

## Parallel Plan
（planner 完了後に記入）

## Expected Outputs
- [ ] docs/DESIGN.md (planner)
- [ ] docs/TEST_SPEC.md (tester)
- [ ] ...

## Progress
- [ ] Phase 2: Codebase Exploration
- [ ] Phase 3: Clarifying Questions
- [ ] Phase 4: Architecture Design
- [ ] Phase 5: Implementation — [自由記述: 各 coder の進捗]
- [ ] Phase 6: Testing — [attempt N / PASSED / FAILED]
- [ ] Phase 7: Quality Review
- [ ] Phase 8: Documentation
- [ ] Phase 9: Summary
```

### 各フェーズでの session.md 更新タイミング

| フェーズ | 更新するセクション |
|---|---|
| Phase 1 完了後 | Development Mode, Project, Requirements, Expected Outputs, Progress 初期化 |
| Phase 2 完了後 | Progress（+ research.md を別途作成） |
| Phase 3 完了後 | Decisions（Q&A を記録） |
| Phase 4 完了後 | Decisions（Architecture）, Parallel Plan, Progress |
| Phase 5 進行中/完了後 | Progress（各 coder の進捗を自由記述で追記） |
| Phase 6 各テスト実行後 | Progress（attempt N, PASSED/FAILED を記録） |
| Phase 7 完了後 | Decisions（Review Response）, Progress |
| Phase 8 完了後 | Progress |
| Phase 9 完了後 | Progress |

### `.devflow/research.md` について

- **書き手**: PM（explorer エージェントは Read/Glob/Grep のみで Write 不可）
- Phase 2 完了後、PM が explorer の分析結果を集約して `.devflow/research.md` に書き出す
- `/devflow:explore` 単独実行時も PM が書き出す
- `/devflow:dev` の Phase 2 で既存の research.md がある場合: 読み込んで活用し、追加探索が必要か判断する（無条件上書きしない）

---

## 変更一覧（10ファイル）

### 1. 書き直し: `devflow/agents/explorer.md`

**目的**: feature-dev の code-explorer 相当。読み取り専用のコードベース分析エージェント。

- tools: `Read, Glob, Grep`（Write/Edit なし）
- model: sonnet / color: yellow
- 役割:
  - エントリポイントの特定（file:line 参照付き）
  - 実行フローのトレース
  - アーキテクチャ層のマッピング
  - 設計パターン・規約の抽出
  - 必読ファイルリスト（5-10件）の提示

> **注**: 既に日本語で作成済み。英語で書き直す。

---

### 2. 書き直し: `devflow/agents/planner.md`

**目的**: 複数アーキテクチャ案の生成、explorer 結果の活用、英語化。

変更箇所:
- **削除**: 会話言語の確認セクション
- **英語化**: 全コンテンツを英語に変換
- **出力先変更**: `docs/DESIGN.md`（変更なし。planner はユーザー向けドキュメントを出力）
- DESIGN.md テンプレートに `## Architecture Candidates` セクションを追加:
  - Option 1: Minimal Changes（既存コード最大活用）
  - Option 2: Clean Architecture（保守性重視）
  - Option 3: Pragmatic Balance（速度+品質）
  - 各候補に Pros/Cons
  - Recommendation（推奨案と理由）
- explorer の分析結果（`.devflow/research.md`）を入力として活用する指示を追加
- `Architecture Candidates` を許可 H2 セクションに追加
- file:line 参照による具体的な記述を推奨

---

### 3. 書き直し: `devflow/agents/reviewer.md`

**目的**: 信頼度スコアリングの導入、英語化。

変更箇所:
- **削除**: 会話言語の確認セクション
- **英語化**: 全コンテンツを英語に変換
- **パス変更**: `.claude/memory/dev-session.md` → `.devflow/session.md`
- レビュー観点の後に `## Confidence Scoring` セクションを新設:
  - 0: 誤検出の可能性大
  - 25: 不確実、規約に明記なし
  - 50: 実際の問題だが軽微
  - 75: 高確信度、実用上の影響あり
  - 100: 確実に問題
  - **報告閾値: >= 75 のみ報告**
- REVIEW.md テンプレートの指摘事項に `[Confidence: XX]` と `file:line` 参照を必須化
- 具体的な修正提案を必須化

---

### 4. 書き直し: `devflow/agents/coder.md`

**変更**: 会話言語セクション削除、全コンテンツ英語化。機能変更なし。

---

### 5. 書き直し: `devflow/agents/tester.md`

**変更**: 会話言語セクション削除、全コンテンツ英語化。出力先は `docs/` のまま。パス変更: `.claude/memory/dev-session.md` → `.devflow/session.md`。

---

### 6. 書き直し: `devflow/agents/documenter.md`

**変更**: 会話言語セクション削除、全コンテンツ英語化。パス変更: `.claude/memory/dev-session.md` → `.devflow/session.md`。

---

### 7. 書き直し: `devflow/commands/dev.md`

**目的**: 3ステップ → 9フェーズのワークフローに刷新。言語選択廃止。英語化。セッション永続化強化。

Phase 0（言語確認）を廃止し、`user-preferences.md` 関連ロジックをすべて削除。
セッション状態の保存先を `.claude/memory/dev-session.md` → `.devflow/session.md` に変更。

**セッション継続判定（Phase 1 の前に実行）**:
1. `.devflow/session.md` の存在を確認
2. 存在し、Progress に未完了のフェーズがある場合:
   - AskUserQuestion で「前回のセッションを継続 / 新しいセッションを開始」を選択させる
   - 継続 → session.md を読み込み、最後に完了したフェーズの次から再開
   - 新規 → session.md と research.md を削除して Phase 1 から開始
3. 存在しない、または全 Progress が完了 → research.md を削除して Phase 1 から開始

```
Phase 1: Discovery（要件ヒアリング）
Phase 2: Codebase Exploration ★新規★
Phase 3: Clarifying Questions ★新規★
Phase 4: Architecture Design ★強化★
Phase 5: Implementation
Phase 6: Testing
Phase 7: Quality Review ★強化★
Phase 8: Documentation
Phase 9: Summary ★新規★
```

各フェーズの詳細:

- **Phase 1**: 既存のヒアリングロジックを維持（段階的質問、1回2問まで）。言語確認は削除。**開発モード選択は AskUserQuestion ツールを使用**。完了後 `.devflow/session.md` を作成（Development Mode, Project, Requirements セクション）
- **Phase 2** (新規): explorer エージェントを 2-3 個並列起動
  - 各エージェントに異なる観点を指定（類似機能トレース、アーキテクチャマッピング、既存実装分析）
  - 返された必読ファイルリストを PM が読み込む
  - **PM が分析結果を `.devflow/research.md` に書き出す**
  - 既存の `.devflow/research.md` がある場合: 読み込んで活用し、追加探索が必要か判断
  - 新規作成の場合はスキップ
  - 完了後 session.md の Progress を更新
- **Phase 3** (新規): Phase 2 の分析結果を踏まえた質問
  - エッジケース、エラーハンドリング、統合ポイント、後方互換性、パフォーマンス要件を網羅
  - ユーザーの回答を待ってから Phase 4 へ
  - **完了後 session.md の Decisions セクションに Q&A を記録**
  - **スキップ禁止**
- **Phase 4** (強化): planner に複数アーキテクチャ案を生成させる
  - planner に `.devflow/research.md` を参照させる
  - PM がトレードオフを比較し推奨案を提示
  - **AskUserQuestion ツールでユーザーにアーキテクチャを選択させる**
  - **完了後 session.md の Decisions（Architecture）と Parallel Plan を更新**
- **Phase 5**: 既存の coder 実行ロジック（並列実行判断含む）を維持。**各 coder の進捗を session.md Progress に自由記述で追記**（例: `coder-1 (frontend) done, coder-2 (backend) in progress`）
- **Phase 6**: 既存の tester 実行ロジック（Phase 1/Phase 2、リトライ3回）を維持。開発モードに応じてスキップ。**各テスト実行後に session.md Progress を更新**（例: `attempt 1 - FAILED`, `attempt 2 - PASSED`）。コンパクション後もリトライ回数を復帰可能
- **Phase 7** (強化): reviewer が信頼度スコア付きで報告。**AskUserQuestion ツールでユーザーに対応を選択させる**（今すぐ修正 / 後で修正 / そのまま進む）。**ユーザーの選択を session.md Decisions に記録**（例: `Review Response: fix now (fixing issue #2 and #3)`）。完了後 Progress 更新
- **Phase 8**: 既存の documenter 実行ロジックを維持。完了後 Progress 更新
- **Phase 9** (新規): 完了報告 + セッションアーカイブ
  - 実装内容、決定事項、変更ファイル、次のステップを報告
  - `.devflow/history/YYYY-MM-DD-HHmm-{要約タイトル}/` ディレクトリを作成してアーカイブ:
    - `session.md` ← `.devflow/session.md` のコピー（要件・決定事項・進捗）
    - `design.md` ← `docs/DESIGN.md` のコピー（Architecture Candidates の詳細な Pros/Cons）
  - 要約タイトルは Requirements の Goal から自動生成（例: `2026-02-23-1430-user-auth/`）
  - session.md 自体はそのまま残す（次回のセッション継続判定で使用）
  - これにより「この機能なんで作ったんだっけ」→ `history/*/session.md`、「なんでこの設計にした？」→ `history/*/design.md` で確認可能

維持する既存機能:
- 4つの開発モード
- セッション永続化（`.devflow/session.md` に移動）
- コンパクション復帰（`.devflow/session.md` + `.devflow/research.md` + `docs/DESIGN.md` で全文脈を復帰）
- 並列実行の判断基準
- 実行の鉄則（異なるフェーズの並列禁止）

削除する既存機能:
- Phase 0（言語確認）
- `user-preferences.md` の読み書き
- 言語設定に関するすべての参照
- `.claude/memory/dev-session.md`（`.devflow/session.md` に移動）

---

### 8. 新規: `devflow/commands/explore.md`

**目的**: explorer エージェントを単独で呼び出せるコマンド `/devflow:explore`。

- `$ARGUMENTS` で分析対象を受け取る
- explorer エージェントを 1-3 個並列起動
- **PM が分析結果を `.devflow/research.md` に書き出す**
- 分析結果をユーザーに報告

---

### 9. 新規: `devflow/commands/history.md`

**目的**: 過去のセッション履歴を検索・参照するコマンド `/devflow:history`。

- `$ARGUMENTS` で検索キーワードを受け取る（省略時は全一覧）
- `.devflow/history/*/session.md` を Glob で取得
- 各 session.md を Read して要約を表示
- キーワード指定時はファイル名・内容で絞り込み
- 専用エージェント不要（`disable-model-invocation: true` でコマンドのみ）

使用例:
```
/devflow:history             → 全セッション一覧を表示
/devflow:history auth        → "auth" を含むセッションを検索
/devflow:history 2026-02     → 2026年2月のセッションを絞り込み
```

---

### 10. 編集: `devflow/.claude-plugin/plugin.json`

変更箇所:
- `agents` 配列に `"./agents/explorer.md"` を追加
- `commands` 配列に `"./commands/explore.md"` を追加
- `commands` 配列に `"./commands/history.md"` を追加
- `description` を更新（6 specialized agents）
- `version` を `"2.0.0"` に更新

---

## 実装順序

1. `devflow/agents/explorer.md` — 英語で書き直し（既に日本語で作成済み）
2. `devflow/agents/planner.md` — 英語化 + アーキテクチャ候補セクション追加
3. `devflow/agents/reviewer.md` — 英語化 + 信頼度スコアリング追加
4. `devflow/agents/coder.md` — 英語化のみ
5. `devflow/agents/tester.md` — 英語化のみ
6. `devflow/agents/documenter.md` — 英語化のみ
7. `devflow/commands/explore.md` — 新規作成（英語）
8. `devflow/commands/history.md` — 新規作成（英語）
9. `devflow/commands/dev.md` — 英語化 + 9フェーズに書き換え（最大の変更）
10. `devflow/.claude-plugin/plugin.json` — エントリ追加

---

## ファイル削除

- `HANDOVER.md` — 内容は PLAN.md に吸収済みのため削除

---

## 対象外（変更なし）

以下のファイルは既に英語なので変更不要:
- `devflow/commands/design.md`
- `devflow/commands/review.md`
- `devflow/commands/test.md`
- `devflow/commands/docs.md`

---

## 検証方法

- 各ファイルの frontmatter が正しいYAML形式であることを確認
- plugin.json が有効なJSONであることを確認
- 既存コマンド（/devflow:design, /devflow:review, /devflow:test, /devflow:docs）に影響がないことを確認
- 全エージェントから「会話言語の確認」セクションが削除されていることを確認
- 全エージェント・コマンドのソースが英語であることを確認
- `.devflow/session.md` のテンプレートが正しく機能するか確認
- コンパクション復帰シナリオ: session.md + research.md + DESIGN.md で文脈を復帰できるか確認
