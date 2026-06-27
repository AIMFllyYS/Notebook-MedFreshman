import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSkillMarkdown } from "./skillFrontmatter.ts";

test("解析带 frontmatter 的技能 Markdown", () => {
  const raw = "---\nname: 测试技能\ndescription: 一个测试技能\n---\n正文内容";
  const result = parseSkillMarkdown(raw, "test.md");
  assert.equal(result.name, "测试技能");
  assert.equal(result.description, "一个测试技能");
  assert.equal(result.content, "正文内容");
});

test("frontmatter 值带引号时去引号", () => {
  const raw = '---\nname: "带引号"\ndescription: \'单引号描述\'\n---\nbody';
  const result = parseSkillMarkdown(raw, "test.md");
  assert.equal(result.name, "带引号");
  assert.equal(result.description, "单引号描述");
});

test("无 frontmatter 时 name 回退文件名、description 回退首段", () => {
  const raw = "# 标题\n\n这是第一段正文描述。";
  const result = parseSkillMarkdown(raw, "my-skill.md");
  assert.equal(result.name, "my-skill");
  assert.equal(result.description, "这是第一段正文描述。");
});

test("description 回退时跳过标题和分隔线", () => {
  const raw = "## 子标题\n\n---\n\n实际描述在这里";
  const result = parseSkillMarkdown(raw, "skill.md");
  assert.equal(result.description, "实际描述在这里");
});

test("description 回退时去除 markdown 标记", () => {
  const raw = "[链接文本](http://example.com) 和 **加粗**";
  const result = parseSkillMarkdown(raw, "skill.md");
  assert.equal(result.description, "链接文本 和 加粗");
});

test("无 frontmatter 且无正文时 name 回退文件名", () => {
  const result = parseSkillMarkdown("", "empty.md");
  assert.equal(result.name, "empty");
  assert.equal(result.description, "");
});

test("BOM 前缀被去除", () => {
  const raw = "\uFEFF---\nname: BOM测试\n---\n正文";
  const result = parseSkillMarkdown(raw, "test.md");
  assert.equal(result.name, "BOM测试");
});

test("description 截断至 200 字", () => {
  const longText = "字".repeat(250);
  const result = parseSkillMarkdown(longText, "skill.md");
  assert.equal(result.description.length, 200);
});

test("content 剥离 frontmatter 后 trim", () => {
  const raw = "---\nname: test\n---\n\n\n正文\n\n";
  const result = parseSkillMarkdown(raw, "test.md");
  assert.equal(result.content, "正文");
});
