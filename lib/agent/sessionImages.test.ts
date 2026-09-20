import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collectMessageImages,
  mergeGeneratedImages,
  type AgentImageItem,
} from "@/lib/agent/sessionImages";
import type { ChatMessagePart } from "@/lib/types/chat";

function part(name: string, input: unknown, output: unknown): ChatMessagePart {
  return { type: `tool-${name}`, state: "output-available", input, output } as unknown as ChatMessagePart;
}

describe("collectMessageImages", () => {
  it("takes imageSearch media url over the page url and keeps the query", () => {
    const images = collectMessageImages([
      part("imageSearch", { query: "细胞膜结构" }, {
        sources: [
          { title: "细胞膜", url: "https://unsplash.com/photos/1", media: "https://img.example/1.jpg", snippet: "", alt: "cell membrane" },
        ],
      }),
    ]);
    assert.equal(images.length, 1);
    assert.equal(images[0].kind, "web");
    assert.equal(images[0].src, "https://img.example/1.jpg");
    assert.equal(images[0].href, "https://unsplash.com/photos/1");
    assert.equal(images[0].query, "细胞膜结构");
  });

  it("falls back to the page url when imageSearch has no media", () => {
    const images = collectMessageImages([
      part("imageSearch", { query: "x" }, { sources: [{ title: "t", url: "https://img.example/2.jpg", snippet: "" }] }),
    ]);
    assert.equal(images[0].src, "https://img.example/2.jpg");
  });

  it("collects note images with their note path", () => {
    const images = collectMessageImages([
      part("searchNoteImages", { query: "心肌" }, {
        images: [
          { src: "/images/anatomy/textbook/p1.png", alt: "心肌", caption: "心肌纵切", path: "anatomy/textbook/ch09", title: "心肌" },
        ],
      }),
    ]);
    assert.equal(images.length, 1);
    assert.equal(images[0].kind, "note");
    assert.equal(images[0].href, "anatomy/textbook/ch09");
    assert.equal(images[0].title, "心肌");
  });

  it("dedupes by src and ignores preliminary or unfinished parts", () => {
    const images = collectMessageImages([
      part("imageSearch", { query: "x" }, { sources: [{ title: "a", url: "https://img.example/same.jpg", snippet: "" }] }),
      part("imageSearch", { query: "y" }, { sources: [{ title: "b", url: "https://img.example/same.jpg", snippet: "" }] }),
      { type: "tool-imageSearch", state: "input-available", input: { query: "z" } } as unknown as ChatMessagePart,
      { type: "tool-imageSearch", state: "output-available", preliminary: true, input: {}, output: { sources: [{ title: "c", url: "https://img.example/pre.jpg", snippet: "" }] } } as unknown as ChatMessagePart,
    ]);
    assert.deepEqual(images.map((image) => image.src), ["https://img.example/same.jpg"]);
  });

  it("returns an empty list when there is no image tool at all", () => {
    assert.deepEqual(collectMessageImages([part("webSearch", { query: "x" }, { sources: [] })]), []);
  });
});

describe("mergeGeneratedImages", () => {
  const base: AgentImageItem[] = [];

  it("turns b64 images into data urls", () => {
    const merged = mergeGeneratedImages(base, [
      { imageGenId: "g1", title: "示意图", prompt: "画一个细胞", images: [{ b64_json: "AAA" }] },
    ]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].src, "data:image/png;base64,AAA");
    assert.equal(merged[0].kind, "generated");
    assert.equal(merged[0].title, "示意图");
  });

  it("prefers a real url and skips images without any payload", () => {
    const merged = mergeGeneratedImages(base, [
      { imageGenId: "g2", title: "", prompt: "prompt", images: [{ url: "https://img.example/g2.png", b64_json: "BBB" }, {}] },
    ]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].src, "https://img.example/g2.png");
    assert.equal(merged[0].title, "prompt");
  });

  it("keeps the images already collected from tools", () => {
    const existing: AgentImageItem[] = [
      { id: "web:1", kind: "web", src: "https://img.example/w.jpg", title: "w" },
    ];
    const merged = mergeGeneratedImages(existing, []);
    assert.deepEqual(merged, existing);
  });
});
