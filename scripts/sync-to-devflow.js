#!/usr/bin/env node
// sync-to-devflow.js
// flux/devflow/ の README を projects/devflow/ にコピーし、
// インストール部分を公式ディレクトリ向けに置換する
//
// Usage: node scripts/sync-to-devflow.js [dest-path]
// Default dest: ../devflow (= projects/devflow/)

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "devflow");
const DEST = process.argv[2] || path.resolve(__dirname, "..", "..", "devflow");

const replacements = [
  // Install: flux のみ → 公式ディレクトリ（主）+ flux（副）
  {
    from: [
      "```",
      "/plugin marketplace add takuya-motoshima/flux",
      "/plugin install devflow@flux",
      "```",
    ].join("\n"),
    to: {
      en: [
        "```",
        "/plugin install devflow@claude-plugin-directory",
        "```",
        "",
        "Or, install from the [flux](https://github.com/takuya-motoshima/flux) marketplace:",
        "",
        "```",
        "/plugin marketplace add takuya-motoshima/flux",
        "/plugin install devflow@flux",
        "```",
      ].join("\n"),
      ja: [
        "```",
        "/plugin install devflow@claude-plugin-directory",
        "```",
        "",
        "または、[flux](https://github.com/takuya-motoshima/flux) マーケットプレイスからインストール:",
        "",
        "```",
        "/plugin marketplace add takuya-motoshima/flux",
        "/plugin install devflow@flux",
        "```",
      ].join("\n"),
    },
  },
  // NOTE: キャッシュクリア後の再インストールコマンド
  {
    from: "> /plugin install devflow@flux",
    to: "> /plugin install devflow@claude-plugin-directory",
  },
  // Uninstall
  {
    from: "/plugin uninstall devflow@flux",
    to: "/plugin uninstall devflow",
  },
  // Update
  {
    from: [
      "```",
      "rm -rf ~/.claude/plugins/cache/",
      "cd ~/.claude/plugins/marketplaces/flux && git pull",
      "```",
    ].join("\n"),
    to: ["```", "/plugin update devflow", "```"].join("\n"),
  },
];

function sync(filename) {
  const lang = filename.includes(".ja.") ? "ja" : "en";
  let content = fs.readFileSync(path.join(SRC, filename), "utf-8");

  for (const r of replacements) {
    const to = typeof r.to === "object" ? r.to[lang] : r.to;
    if (!content.includes(r.from)) {
      console.warn(`  WARN: pattern not found in ${filename}: "${r.from.slice(0, 50)}..."`);
      continue;
    }
    content = content.replace(r.from, to);
  }

  fs.writeFileSync(path.join(DEST, filename), content);
  console.log(`  OK: ${filename}`);
}

console.log(`Source: ${SRC}`);
console.log(`Dest:   ${DEST}`);
console.log();

sync("README.md");
sync("README.ja.md");

console.log();
console.log("Done. Review diffs before committing:");
console.log(`  cd ${DEST} && git diff`);
