import assert from "node:assert/strict";
import { test } from "node:test";
import { judge } from "@/app/api/can-embed/route";

test("judge：无 X-Frame-Options 和 CSP 时可嵌入", () => {
  const h = new Headers();
  assert.deepEqual(judge(h), { embeddable: true });
});

test("judge：X-Frame-Options DENY 不可嵌入", () => {
  const h = new Headers({ "x-frame-options": "DENY" });
  assert.equal(judge(h).embeddable, false);
  assert.ok(judge(h).reason?.includes("DENY"));
});

test("judge：X-Frame-Options SAMEORIGIN 不可嵌入", () => {
  const h = new Headers({ "x-frame-options": "SAMEORIGIN" });
  assert.equal(judge(h).embeddable, false);
});

test("judge：X-Frame-Options ALLOW-FROM 不可嵌入", () => {
  const h = new Headers({ "x-frame-options": "ALLOW-FROM https://example.com" });
  assert.equal(judge(h).embeddable, false);
});

test("judge：X-Frame-Options 大小写不敏感", () => {
  const h = new Headers({ "x-frame-options": "deny" });
  assert.equal(judge(h).embeddable, false);
});

test("judge：CSP frame-ancestors 'none' 不可嵌入", () => {
  const h = new Headers({
    "content-security-policy": "frame-ancestors 'none'",
  });
  assert.equal(judge(h).embeddable, false);
});

test("judge：CSP frame-ancestors * 可嵌入", () => {
  const h = new Headers({
    "content-security-policy": "frame-ancestors *",
  });
  assert.equal(judge(h).embeddable, true);
});

test("judge：CSP frame-ancestors 'self' 不可嵌入", () => {
  const h = new Headers({
    "content-security-policy": "frame-ancestors 'self'",
  });
  assert.equal(judge(h).embeddable, false);
});

test("judge：CSP 含其他指令但无 frame-ancestors 时可嵌入", () => {
  const h = new Headers({
    "content-security-policy": "default-src 'self'",
  });
  assert.equal(judge(h).embeddable, true);
});

test("judge：X-Frame-Options 优先于 CSP", () => {
  const h = new Headers({
    "x-frame-options": "DENY",
    "content-security-policy": "frame-ancestors *",
  });
  // XFO 先检查，返回不可嵌入
  assert.equal(judge(h).embeddable, false);
});

test("judge：CSP frame-ancestors 带多个域名时不可嵌入", () => {
  const h = new Headers({
    "content-security-policy": "frame-ancestors https://a.com https://b.com",
  });
  assert.equal(judge(h).embeddable, false);
});
