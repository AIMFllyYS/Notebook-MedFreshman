import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { DEFAULT_SITE_ORIGIN, normalizeSiteOrigin, shareUrl, siteOrigin } from "./siteUrl.ts";

const ENV_KEY = "NEXT_PUBLIC_SITE_URL";
const originalEnv = process.env[ENV_KEY];
const sandbox = globalThis as unknown as Record<string, unknown>;

function setEnv(value: string | undefined): void {
  if (value === undefined) delete process.env[ENV_KEY];
  else process.env[ENV_KEY] = value;
}

function setWindowOrigin(origin: string | undefined): void {
  if (origin === undefined) delete sandbox.window;
  else sandbox.window = { location: { origin } };
}

afterEach(() => {
  setEnv(originalEnv);
  setWindowOrigin(undefined);
});

test("NEXT_PUBLIC_SITE_URL 优先，且末尾斜杠被去掉", () => {
  setWindowOrigin("http://localhost:35349");
  setEnv("https://study.example.com/");
  assert.equal(siteOrigin(), "https://study.example.com");
});

test("env 写了非法值就当没配，回落到浏览器 origin", () => {
  setWindowOrigin("http://192.168.1.9:35349");
  for (const bad of ["localhost:35349", "/s", "javascript:alert(1)", "   "]) {
    setEnv(bad);
    assert.equal(siteOrigin(), "http://192.168.1.9:35349", `应当忽略: ${bad}`);
  }
});

test("没有 env 时用浏览器 origin", () => {
  setEnv(undefined);
  setWindowOrigin("https://agent.study.example.com");
  assert.equal(siteOrigin(), "https://agent.study.example.com");
});

test("file:// / 沙箱里 origin 是字符串 null，回落到本机默认", () => {
  setEnv(undefined);
  setWindowOrigin("null");
  assert.equal(siteOrigin(), DEFAULT_SITE_ORIGIN);
});

test("SSR（没有 window）且没有 env 时用本机默认", () => {
  setEnv(undefined);
  setWindowOrigin(undefined);
  assert.equal(siteOrigin(), DEFAULT_SITE_ORIGIN);
  assert.equal(DEFAULT_SITE_ORIGIN, "http://localhost:35349");
});

test("normalizeSiteOrigin 只认绝对 http(s) URL", () => {
  assert.equal(normalizeSiteOrigin(" https://a.example/x/ "), "https://a.example/x");
  assert.equal(normalizeSiteOrigin("http://localhost:35349"), "http://localhost:35349");
  for (const bad of ["", "   ", "a.example", "ftp://a.example", "//a.example", "data:text/html,x", null, 42]) {
    assert.equal(normalizeSiteOrigin(bad), null, `应当拒绝: ${String(bad)}`);
  }
});

test("shareUrl 拼出 /s/<id>", () => {
  assert.equal(shareUrl("ABCDEFGHIJKL", "https://study.example.com"), "https://study.example.com/s/ABCDEFGHIJKL");
  setEnv(undefined);
  setWindowOrigin(undefined);
  assert.equal(shareUrl("ABCDEFGHIJKL"), `${DEFAULT_SITE_ORIGIN}/s/ABCDEFGHIJKL`);
});
