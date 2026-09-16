import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GlobalSearchResults from "./GlobalSearchResults";
import type { GlobalSearchHit } from "@/lib/search/globalSearch";

afterEach(() => {
  cleanup();
});

const chapter: GlobalSearchHit = {
  id: "probability:detail:1.2.1",
  kind: "chapter",
  title: "1.2.1 贝叶斯公式",
  snippet: "全概率公式与贝叶斯推断",
  breadcrumbs: "概率论 / 详解",
  href: "/probability/detail/1.2.1",
  score: 80,
};

const note: GlobalSearchHit = {
  id: "note:n1",
  kind: "note",
  title: "核糖体笔记",
  snippet: "核糖体是合成蛋白质的场所",
  breadcrumbs: "医学细胞生物学",
  noteId: "n1",
  score: 40,
};

const card: GlobalSearchHit = {
  id: "flashcard:c1",
  kind: "flashcard",
  title: "什么是泊松分布？",
  snippet: "描述单位时间稀有事件次数",
  breadcrumbs: "概率论 / 详解 / 2.3",
  cardId: "c1",
  score: 30,
};

describe("GlobalSearchResults", () => {
  it("按闪卡 / 笔记 / 正文分栏，加载中用骨架而不是转圈", () => {
    render(
      <GlobalSearchResults
        query="核糖体"
        noteHits={[note]}
        cardHits={[card]}
        bodyHits={[chapter]}
        notesLoading
        cardsLoading
        bodyLoading
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByRole("region", { name: "闪卡" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "笔记" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "正文" })).toBeInTheDocument();
    expect(screen.getByText("什么是泊松分布？")).toBeInTheDocument();
    expect(screen.getByText("核糖体笔记")).toBeInTheDocument();
    expect(screen.getByText("1.2.1 贝叶斯公式")).toBeInTheDocument();
    expect(document.querySelectorAll("[data-search-skeleton]").length).toBeGreaterThanOrEqual(2);
    expect(document.querySelector(".animate-spin")).toBeNull();
  });

  it("只有正文还在拉分片时也先出骨架", () => {
    render(
      <GlobalSearchResults
        query="由果溯因"
        noteHits={[]}
        cardHits={[]}
        bodyHits={[]}
        notesLoading={false}
        cardsLoading={false}
        bodyLoading
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByRole("region", { name: "正文" })).toBeInTheDocument();
    expect(document.querySelector("[data-search-skeleton]")).toBeTruthy();
    expect(screen.queryByText("没有匹配结果")).toBeNull();
  });
});
