import assert from "node:assert/strict";
import { test } from "node:test";
import { videoPoster, resolveVideoSrc } from "./poster.ts";

// ── videoPoster ────────────────────────────────────────────────

test("videoPoster：有 poster 字段时直接返回", () => {
  assert.equal(videoPoster({ src: "/media/videos/x.mp4", poster: "/custom.jpg" }), "/custom.jpg");
});

test("videoPoster：无 poster 时从 src 推导", () => {
  assert.equal(
    videoPoster({ src: "/media/videos/ch01/foo.mp4" }),
    "/media/posters/ch01/foo.jpg",
  );
});

test("videoPoster：非 mp4 src 返回空串", () => {
  assert.equal(videoPoster({ src: "/media/videos/ch01/foo.webm" }), "");
});

test("videoPoster：非 /media/videos/ 路径返回空串", () => {
  assert.equal(videoPoster({ src: "/other/foo.mp4" }), "");
});

test("videoPoster：无 poster 无 src 路径匹配返回空串", () => {
  assert.equal(videoPoster({ src: "" }), "");
});

// ── resolveVideoSrc ────────────────────────────────────────────
// 注意：VIDEO_CDN_BASE 在模块加载时从 env 读取，未设置时为 ""
// 这些测试在无 CDN 环境下运行，验证 passthrough 行为

test("resolveVideoSrc：无 CDN 时原样返回", () => {
  assert.equal(resolveVideoSrc("/media/videos/ch01/foo.mp4"), "/media/videos/ch01/foo.mp4");
});

test("resolveVideoSrc：非 /media/videos/ 路径原样返回", () => {
  assert.equal(resolveVideoSrc("/images/foo.png"), "/images/foo.png");
});
