import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock QuizMarkdown to avoid pulling in react-markdown/katex chain
vi.mock("@/components/quiz/QuizMarkdown", () => ({
  default: ({ children }: { children: string }) => <span>{children}</span>,
}));

import { FollowUpQuestions } from "./FollowUpQuestions";

describe("FollowUpQuestions", () => {
  it("空问题列表时不渲染", () => {
    const { container } = render(
      <FollowUpQuestions questions={[]} onSelect={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("undefined 问题列表时不渲染", () => {
    const { container } = render(
      <FollowUpQuestions questions={undefined as unknown as string[]} onSelect={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("渲染标题和所有问题按钮", () => {
    render(
      <FollowUpQuestions
        questions={["问题1", "问题2", "问题3"]}
        onSelect={() => {}}
        title="测试标题"
      />,
    );
    expect(screen.getByText("测试标题")).toBeInTheDocument();
    expect(screen.getByText("问题1")).toBeInTheDocument();
    expect(screen.getByText("问题2")).toBeInTheDocument();
    expect(screen.getByText("问题3")).toBeInTheDocument();
  });

  it("使用默认标题", () => {
    render(
      <FollowUpQuestions questions={["q"]} onSelect={() => {}} />,
    );
    expect(screen.getByText("你可能还想问")).toBeInTheDocument();
  });

  it("点击按钮调用 onSelect 并传入问题文本", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <FollowUpQuestions questions={["什么是概率？"]} onSelect={onSelect} />,
    );
    await user.click(screen.getByRole("button", { name: /什么是概率/ }));
    expect(onSelect).toHaveBeenCalledWith("什么是概率？");
  });

  it("每个按钮都是 type=button（非 submit）", () => {
    render(
      <FollowUpQuestions questions={["q1"]} onSelect={() => {}} />,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("type", "button");
  });
});
