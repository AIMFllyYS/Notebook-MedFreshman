import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildMcpConfigSnippet,
  buildMcpServerConfig,
  filterMarketEntries,
  missingRequiredEnv,
  parseMarketManifest,
  pickL10n,
  type McpEntry,
} from "./market.ts";

const entry: McpEntry = {
  section: "mcp",
  id: "brave-search",
  name: "Brave Search",
  tagline: "搜索",
  desc: "…",
  source: "official",
  tags: ["search"],
  transport: "stdio",
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-brave-search"],
  env: [
    { name: "BRAVE_API_KEY", required: true, desc: "key", keyUrl: "https://brave.com" },
    { name: "OPTIONAL_FLAG", required: false, desc: "" },
  ],
};

const remoteEntry: McpEntry = {
  section: "mcp",
  id: "context7",
  name: "Context7",
  tagline: "库文档",
  desc: "…",
  source: "official",
  tags: ["docs"],
  transport: "http",
  url: "https://mcp.context7.com/mcp?key=${CONTEXT7_API_KEY}",
  env: [{ name: "CONTEXT7_API_KEY", required: false, desc: "" }],
};

test("parseMarketManifest：坏条目丢弃、坏分区回空数组、缺省字段兜底", () => {
  const m = parseMarketManifest({
    version: 1,
    mcp: [
      entry,
      { id: "broken" }, // 缺 name/tagline/desc → 丢
      "not-an-object",
    ],
    cli: "oops",
    skills: [{ id: "x", section: "skills", name: "X", tagline: "t", desc: "d", source: "official", tags: ["a"], path: "/skills/x/SKILL.md" }],
  });
  assert.equal(m.mcp.length, 1);
  assert.deepEqual(m.cli, []);
  assert.equal(m.skills.length, 1);
  assert.equal(m.skills[0].source, "official");
});

test("buildMcpServerConfig：stdio 输出 command/args/env，凭证缺失回落占位符", () => {
  const cfg = buildMcpServerConfig(entry, { BRAVE_API_KEY: "real-key" }) as {
    command: string;
    args: string[];
    env: Record<string, string>;
  };
  assert.equal(cfg.command, "npx");
  assert.deepEqual(cfg.args, ["-y", "@modelcontextprotocol/server-brave-search"]);
  assert.equal(cfg.env.BRAVE_API_KEY, "real-key");
  assert.equal(cfg.env.OPTIONAL_FLAG, "<YOUR_OPTIONAL_FLAG>");
});

test("buildMcpServerConfig：http 输出 type/url/headers，url 里的 ${ENV} 同样替换", () => {
  const cfg = buildMcpServerConfig(remoteEntry, { CONTEXT7_API_KEY: "ctx" }) as {
    type: string;
    url: string;
    headers: Record<string, string>;
  };
  assert.equal(cfg.type, "http");
  assert.equal(cfg.url, "https://mcp.context7.com/mcp?key=ctx");
  assert.equal(cfg.headers.CONTEXT7_API_KEY, "ctx");
});

test("buildMcpConfigSnippet：包成 mcpServers 字典并能被 JSON.parse 还原", () => {
  const parsed = JSON.parse(buildMcpConfigSnippet(entry, {})) as {
    mcpServers: Record<string, { command: string }>;
  };
  assert.equal(parsed.mcpServers["brave-search"].command, "npx");
});

test("missingRequiredEnv：只卡 required 且未填的项", () => {
  assert.deepEqual(missingRequiredEnv(entry, {}).map((e) => e.name), ["BRAVE_API_KEY"]);
  assert.deepEqual(missingRequiredEnv(entry, { BRAVE_API_KEY: "k" }), []);
});

test("pickL10n：英文环境优先取 *En，缺失回退中文；中文环境恒取中文", () => {
  const e = { ...entry, nameEn: "Brave", notesEn: "why" };
  assert.equal(pickL10n(e, "name", "en"), "Brave");
  assert.equal(pickL10n(e, "tagline", "en"), "搜索"); // taglineEn 缺失回退
  assert.equal(pickL10n(e, "name", "zh"), "Brave Search");
});

test("filterMarketEntries：命中名称/简介/标签，大小写不敏感", () => {
  const list = [entry, remoteEntry];
  assert.equal(filterMarketEntries(list, "BRAVE").length, 1);
  assert.equal(filterMarketEntries(list, "搜索").length, 1);
  assert.equal(filterMarketEntries(list, "  ").length, 2);
  assert.equal(filterMarketEntries(list, "zzz").length, 0);
});
