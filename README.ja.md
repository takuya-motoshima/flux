[English README](README.md)

# Flux

Claude Code プラグインマーケットプレイス - 開発ワークフローを強化するプラグイン集

## 利用可能なプラグイン

### [DevFlow](devflow/)

「何を作りたいか」を伝えるだけ — DevFlow が6つの専門エージェントで設計・実装・テスト・レビュー・ドキュメント生成まで自動で進める。

```
あなた: /devflow:dev 「Gemini APIを使ったチャットアプリを作りたい」

→ docs/DESIGN.md    設計書
→ src/              ソースコード（並列実装）
→ tests/            自動生成テスト
→ REVIEW.md         品質・セキュリティレビュー
→ README.md, docs/  ドキュメント
```

**特徴**: PM的なヒアリング、多言語対応（TS/JS, Python, Go, Rust）、並列実行、セキュリティチェック、プロジェクトメモリ

## インストール

### 1. マーケットプレイスを追加

```
/plugin marketplace add takuya-motoshima/flux
```

### 2. プラグインをインストール

```
/plugin install devflow@flux
```

スコープを選択:

| スコープ | 用途 |
|---------|------|
| **user** (デフォルト) | 全プロジェクトで使用 |
| **project** | チーム開発で共有（Git管理） |
| **local** | 個人用（Git除外） |

### 3. 再起動して確認

Claude Code を再起動してから実行:

```
/agents
```

## 必要要件

- Claude Code >= 1.0.0

## ライセンス

MIT

## 作者

Takuya Motoshima ([@takuya-motoshima](https://github.com/takuya-motoshima))
