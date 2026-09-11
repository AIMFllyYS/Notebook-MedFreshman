import assert from "node:assert/strict";
import path from "node:path";
import { describe, test } from "node:test";
import {
  contentIo,
  isResolvedPathInside,
  isSafeContentRef,
  isSafeContentSegment,
} from "@/lib/content/contentPathGuard";
import { readContentMarkdown, readSectionMarkdown } from "@/lib/content/loader";

test("isSafeContentSegment：合法笔记 id 通过", () => {
  for (const id of ["probability", "detail", "1.1", "ch02-1", "rec-05", "ppt-15.1", "01", "kaoqian-moni"]) {
    assert.equal(isSafeContentSegment(id), true, id);
  }
  assert.equal(isSafeContentRef("probability", "detail", "1.1"), true);
});

test("isSafeContentSegment：拒绝穿越与非法标识符", () => {
  for (const id of ["", "..", "../etc", "..\\etc", "foo/bar", "foo\\bar", "foo..bar", ".hidden", "foo.", "a/../b"]) {
    assert.equal(isSafeContentSegment(id), false, id);
  }
  assert.equal(isSafeContentRef("probability", "detail", "../1.1"), false);
  assert.equal(isSafeContentRef("..", "detail", "1.1"), false);
});

test("isResolvedPathInside：拒绝跳出 root", () => {
  const root = path.join(process.cwd(), "tmp", "content-guard-root");
  assert.equal(isResolvedPathInside(path.join(root, "a.md"), root), true);
  assert.equal(isResolvedPathInside(path.join(root, "..", "secret.md"), root), false);
  assert.equal(isResolvedPathInside(path.join(root, "sub", "..", "..", "secret.md"), root), false);
});

describe("readContentMarkdown 读盘前守卫", { concurrency: false }, () => {
  test("内容树之外拒绝且不读盘", (t) => {
    const spy = t.mock.method(contentIo, "readFileSync", () => {
      throw new Error("should not read disk");
    });
    assert.equal(readContentMarkdown("not-a-subject", "detail", "1.1"), null);
    assert.equal(readContentMarkdown("probability", "detail", "999.9"), null);
    assert.equal(spy.mock.callCount(), 0);
  });

  test("包含 .. 的路径拒绝且不读盘", (t) => {
    const spy = t.mock.method(contentIo, "readFileSync", () => {
      throw new Error("should not read disk");
    });
    assert.equal(readContentMarkdown("probability", "detail", "../1.1"), null);
    assert.equal(readContentMarkdown("..", "detail", "1.1"), null);
    assert.equal(readContentMarkdown("probability", "..", "1.1"), null);
    assert.equal(readSectionMarkdown("../etc", "passwd"), null);
    assert.equal(readSectionMarkdown("ch01", "../../etc/passwd"), null);
    assert.equal(spy.mock.callCount(), 0);
  });

  test("合法笔记路径仍可读（mock 正文，不碰 content/**）", (t) => {
    const spy = t.mock.method(contentIo, "readFileSync", () => "# fixture section");
    const content = readContentMarkdown("probability", "detail", "1.1");
    assert.equal(content, "# fixture section");
    assert.equal(spy.mock.callCount(), 1);
    const fileArg = String(spy.mock.calls[0]?.arguments[0] ?? "");
    assert.match(fileArg.replace(/\\/g, "/"), /1\.1\.md$/);
  });
});
