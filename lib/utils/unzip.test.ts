import assert from "node:assert/strict";
import { test } from "node:test";
import { strToU8, zipSync } from "fflate";
import { unzipWithinLimits, UnsafeArchiveError } from "./unzip.ts";

test("unzipWithinLimits：正常包全量解压", () => {
  const archive = zipSync({ "a.txt": strToU8("alpha"), "dir/b.txt": strToU8("beta") });
  const files = unzipWithinLimits(archive);
  assert.equal(Object.keys(files).length, 2);
});

test("unzipWithinLimits：超过 maxFileBytes 的条目被跳过不解压", () => {
  const big = strToU8("x".repeat(1024));
  const archive = zipSync({ "big.bin": big, "small.txt": strToU8("s") });
  const files = unzipWithinLimits(archive, { maxFileBytes: 512 });
  assert.deepEqual(Object.keys(files), ["small.txt"]);
});

test("unzipWithinLimits：合计解压量超过 maxTotalBytes 的条目被跳过", () => {
  const archive = zipSync({
    "1.bin": strToU8("x".repeat(600)),
    "2.bin": strToU8("y".repeat(600)),
    "3.bin": strToU8("z".repeat(600)),
  });
  const files = unzipWithinLimits(archive, { maxTotalBytes: 1000, maxFileBytes: 1024 });
  assert.equal(Object.keys(files).length, 1);
});

test("unzipWithinLimits：条目数上限生效", () => {
  const archive = zipSync({ "a": strToU8("1"), "b": strToU8("2"), "c": strToU8("3") });
  const files = unzipWithinLimits(archive, { maxEntries: 2 });
  assert.equal(Object.keys(files).length, 2);
});

test("unzipWithinLimits：include 只解压命中条目", () => {
  const archive = zipSync({
    "ppt/slides/slide1.xml": strToU8("<a:t>x</a:t>"),
    "ppt/media/image1.png": strToU8("fakepng"),
  });
  const files = unzipWithinLimits(archive, {
    include: (name) => /^ppt\/slides\//.test(name),
  });
  assert.deepEqual(Object.keys(files), ["ppt/slides/slide1.xml"]);
});

test("unzipWithinLimits：压缩包本体超限直接抛 UnsafeArchiveError", () => {
  const archive = zipSync({ "a.txt": strToU8("alpha") });
  assert.throws(() => unzipWithinLimits(archive, { maxInputBytes: 10 }), UnsafeArchiveError);
});
