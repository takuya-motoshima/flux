[English README](README.md)

# Flux

Claude Code の開発ワークフローを加速するプラグイン集

## 利用可能なプラグイン

### [DevFlow](devflow/README.ja.md)

「こんなの作りたい」って伝えるだけ。あとは DevFlow が全部やっといてくれる。

```
あなた:  /devflow:dev
        「Gemini APIを使ったチャットアプリを作りたい」

DevFlow: Web UI？CLI？履歴の保存は？
あなた:  Web UIで。履歴はセッション中だけでOK。

→ あとは自動で 設計→実装→テスト→レビュー→ドキュメント
```

**特徴**: 対話で要件を固める、多言語対応（TS/JS, Python, Go, Rust）、並列実行、開発モード選択、セキュリティチェック

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
