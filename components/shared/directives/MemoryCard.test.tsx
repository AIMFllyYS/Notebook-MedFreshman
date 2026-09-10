import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuizMarkdown from "@/components/quiz/QuizMarkdown";
import { MemoryCard } from "./MemoryCard";

async function expandByLabel(label: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: new RegExp(label) }));
  return user;
}

describe("MemoryCard via QuizMarkdown pipeline", () => {
  it("mode=cloze + **…** 渲染挖空，点击后揭示答案", async () => {
    const { container } = render(
      <QuizMarkdown>
        {':::memory{label="氨基酸等电点" mode="cloze"}\n净电荷为零时的 **pH** 才叫等电点。\n:::'}
      </QuizMarkdown>,
    );

    const user = await expandByLabel("氨基酸等电点");
    const blank = container.querySelector(".memory-cloze-blank");
    expect(blank, "cloze 分支必须看到 **…** 才能挖空").not.toBeNull();
    expect(blank?.textContent).toContain("?");

    await user.click(blank!);
    expect(blank?.textContent).toContain("pH");
    expect(blank?.className).toMatch(/revealed/);
  });

  it("- [ ] 清单渲染可点击项，点击后显示要点", async () => {
    const { container } = render(
      <QuizMarkdown>
        {":::memory{label=\"三问\"}\n- [ ] 实事求是\n- [ ] 群众路线\n:::"}
      </QuizMarkdown>,
    );

    const user = await expandByLabel("三问");
    const items = container.querySelectorAll(".memory-checklist-item");
    expect(items.length, "清单语法必须保留才能识别 - [ ]").toBeGreaterThan(0);
    expect(items[0]?.textContent).toMatch(/点击显示要点/);

    await user.click(items[0]!);
    expect(items[0]?.textContent).toContain("实事求是");
    expect(items[0]?.className).toMatch(/revealed/);
  });

  it("卡内 $…$ 渲染出 .katex", async () => {
    const { container } = render(
      <QuizMarkdown>
        {':::memory{label="等电点公式"}\n兼性离子的 $\\mathrm{pI}$ 不是中性氨基酸的 $\\mathrm{pH}=7$。\n:::'}
      </QuizMarkdown>,
    );

    await expandByLabel("等电点公式");
    expect(container.querySelector(".katex"), "卡内公式必须来自原文 $…$ 而不是回抽").not.toBeNull();
    expect(container.querySelector(".memory-card-content")?.textContent).toMatch(/兼性离子/);
  });

  it("无 mode 且无清单项时正文原样渲染，不是空壳", async () => {
    const { container } = render(
      <QuizMarkdown>
        {':::memory{label="名解考场总清单"}\n净电荷为零时的 $\\mathrm{pI}$ 才叫等电点。\n:::'}
      </QuizMarkdown>,
    );

    await expandByLabel("名解考场总清单");
    const content = container.querySelector(".memory-card-content");
    expect(content?.textContent?.trim(), "无清单的默认卡不能展开成空壳").toMatch(/净电荷为零/);
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.querySelector(".chat-prose")).not.toBeNull();
  });
});

describe("MemoryCard extract() fallback", () => {
  it("没有 raw 时仍能从字符串 children 做 cloze", async () => {
    const { container } = render(
      <MemoryCard node={{ properties: { label: "兜底挖空", mode: "cloze" } }}>
        {"反对**帝国主义**的革命"}
      </MemoryCard>,
    );

    const user = await expandByLabel("兜底挖空");
    const blank = container.querySelector(".memory-cloze-blank");
    expect(blank).not.toBeNull();
    await user.click(blank!);
    expect(blank?.textContent).toContain("帝国主义");
  });
});
