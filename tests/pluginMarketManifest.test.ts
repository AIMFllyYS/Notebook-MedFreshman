import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";
import { parseMarketManifest } from "../lib/plugins/market.ts";
import { parseSkillMarkdown } from "../lib/utils/skillFrontmatter.ts";

const root = process.cwd();

const manifest = parseMarketManifest(
  JSON.parse(readFileSync(join(root, "public/plugins/market.json"), "utf8")),
);

test("插件市场 manifest：三板块非空、id 全局唯一、必填字段齐备", () => {
  assert.ok(manifest.mcp.length >= 8, "MCP 至少收录 8 个");
  assert.ok(manifest.cli.length >= 8, "CLI + Skills 至少收录 8 个");
  assert.ok(manifest.skills.length >= 2, "官方 skills 至少 2 个");

  const all = [...manifest.mcp, ...manifest.cli, ...manifest.skills];
  const ids = new Set(all.map((e) => e.id));
  assert.equal(ids.size, all.length, "id 不能重复");

  for (const entry of all) {
    assert.ok(entry.name && entry.tagline && entry.desc, `${entry.id} 缺名称/简介/描述`);
    assert.ok(entry.tags.length > 0, `${entry.id} 至少一个标签`);
    assert.ok(
      entry.homepage === undefined || /^https?:\/\//.test(entry.homepage),
      `${entry.id} homepage 必须是 http(s) 链接`,
    );
  }
});

test("MCP 条目：stdio 有 command+args，远端有 url；env 必填项带说明", () => {
  for (const entry of manifest.mcp) {
    if (entry.transport === "stdio") {
      assert.ok(entry.command, `${entry.id} stdio 缺 command`);
      assert.ok(entry.args && entry.args.length > 0, `${entry.id} stdio 缺 args`);
    } else {
      assert.ok(entry.url && /^https?:\/\//.test(entry.url), `${entry.id} 远端缺 url`);
    }
    for (const env of entry.env ?? []) {
      assert.ok(/^[A-Z][A-Z0-9_]*$/.test(env.name), `${entry.id} env 名 ${env.name} 需全大写`);
      if (env.required) assert.ok(env.desc, `${entry.id}.${env.name} 必填凭证要写用途说明`);
      if (env.keyUrl) assert.match(env.keyUrl, /^https?:\/\//);
    }
  }
});

test("官方 skills：manifest.path 指到仓库内真实存在的 SKILL.md，frontmatter 可解析", () => {
  for (const entry of manifest.skills) {
    assert.ok(entry.path.startsWith("/skills/"), `${entry.id} path 须挂在 /skills/ 下`);
    const file = join(root, "public", entry.path);
    assert.ok(existsSync(file), `${entry.id} 文件不存在：${entry.path}`);
    const parsed = parseSkillMarkdown(readFileSync(file, "utf8"), "SKILL.md");
    assert.ok(parsed.name.trim(), `${entry.id} frontmatter 缺 name`);
    assert.ok(parsed.description.trim(), `${entry.id} frontmatter 缺 description`);
    assert.ok(parsed.content.length > 200, `${entry.id} 正文过短`);
  }
});

test("CLI 条目：install 命令是单行 shell 可拷贝文本；skill-pack 带获取指引", () => {
  for (const entry of manifest.cli) {
    if (entry.install) {
      assert.ok(!entry.install.includes("\r"), `${entry.id} install 不含回车`);
    }
    if (entry.kind === "skill-pack") {
      assert.ok(entry.homepage?.includes("github.com") || entry.install, `${entry.id} skill-pack 要有仓库链接或获取命令`);
    }
  }
});
