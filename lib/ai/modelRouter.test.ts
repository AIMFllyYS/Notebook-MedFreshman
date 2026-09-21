import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ROUTER_ALIAS_TO_MODEL,
  buildRouterUserLine,
  parseRouterChoice,
  routerAliasForModel,
} from "./modelRouter.ts";

const ALLOWED = [
  "poolside/laguna-s-2.1-free",
  "inclusionai/ling-3.0-flash-sante:free",
  "deepseek/deepseek-v4.1-flash",
  "z-ai/glm-5.3-flash",
];

test("parseRouterChoice：认标准 JSON 输出", () => {
  assert.equal(parseRouterChoice('{"m":"ds"}', ALLOWED), "deepseek/deepseek-v4.1-flash");
  assert.equal(parseRouterChoice('{"m":"glm"}', ALLOWED), "z-ai/glm-5.3-flash");
  assert.equal(parseRouterChoice('  { "m" : "laguna" }  ', ALLOWED), "poolside/laguna-s-2.1-free");
});

test("parseRouterChoice：模型多吐几个字也能捞回来", () => {
  assert.equal(parseRouterChoice('好的，我选 {"m":"ds"} 这个模型', ALLOWED), "deepseek/deepseek-v4.1-flash");
  // 没有 JSON 时退化成"文本里出现哪个别名"。
  assert.equal(parseRouterChoice("我认为 ling 更合适", ALLOWED), "inclusionai/ling-3.0-flash-sante:free");
});

test("parseRouterChoice：不在候选里的别名一律不认", () => {
  assert.equal(parseRouterChoice('{"m":"ds"}', ["z-ai/glm-5.3-flash"]), null);
  assert.equal(parseRouterChoice('{"m":"gpt-5.6-sol"}', ALLOWED), null, "模型不能自选池外的模型");
  assert.equal(parseRouterChoice("", ALLOWED), null);
  assert.equal(parseRouterChoice("完全无法解析的输出", ALLOWED), null);
});

test("parseRouterChoice：多个别名同时出现时取最先出现的", () => {
  assert.equal(parseRouterChoice("laguna 或 ds 都行", ALLOWED), "poolside/laguna-s-2.1-free");
  assert.equal(parseRouterChoice("ds 或 laguna 都行", ALLOWED), "deepseek/deepseek-v4.1-flash");
});

test("别名映射与输入摘要：只发必要字段，不传整段聊天历史", () => {
  assert.equal(ROUTER_ALIAS_TO_MODEL.ds, "deepseek/deepseek-v4.1-flash");
  assert.equal(routerAliasForModel("z-ai/glm-5.3-flash"), "glm");
  assert.equal(routerAliasForModel("不存在的模型"), undefined);

  const line = buildRouterUserLine({ text: "  帮我   看看\n这道题  ", hasImages: true, thinking: false });
  assert.match(line, /带图片：是/);
  assert.match(line, /开启深度思考：否/);
  assert.match(line, /用户提问：帮我 看看 这道题/);

  // 长输入被截断：分类只需要判断性质，不需要全文。
  const long = buildRouterUserLine({ text: "x".repeat(5_000), hasImages: false, thinking: false });
  assert.ok(long.length < 500, `摘要应被截断，实际 ${long.length}`);
});
