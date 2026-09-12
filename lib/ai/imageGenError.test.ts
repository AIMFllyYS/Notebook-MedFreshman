import assert from "node:assert/strict";
import { test } from "node:test";
import { formatImageGenError } from "./imageGenError.ts";

test("formatImageGenError：401 为未登录，与上游错误区分", () => {
  assert.equal(formatImageGenError(401, { error: "Unauthorized" }), "未登录，请先登录后再生成图片");
  assert.match(formatImageGenError(400, { code: "bad_endpoint", error: "生图端点不对" }), /端点不对/);
  assert.match(formatImageGenError(500, { code: "unconfigured", error: "生图 API 未配置" }), /未配置/);
  assert.match(formatImageGenError(502, { code: "upstream_auth", error: "上游拒绝" }), /上游拒绝/);
});
