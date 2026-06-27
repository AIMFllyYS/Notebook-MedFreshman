import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatEmptyState from "./ChatEmptyState";

vi.mock("@/components/chat/FollowUpQuestions", () => ({
  FollowUpQuestions: ({ questions, onSelect, title }: { questions: string[]; onSelect: (q: string) => void; title: string }) => (
    <div data-testid="follow-up">
      <span>{title}</span>
      {questions.map((q, i) => (
        <button key={i} onClick={() => onSelect(q)}>{q}</button>
      ))}
    </div>
  ),
}));

describe("ChatEmptyState", () => {
  it("渲染助教标题和描述", () => {
    render(<ChatEmptyState topic="概率论" subjectName="概率论与数理统计" onFollowUpClick={() => {}} />);
    expect(screen.getByText(/概率论与数理统计助教/)).toBeInTheDocument();
    expect(screen.getByText(/遇到不懂的概念随时问我/)).toBeInTheDocument();
  });

  it("有 topic 时显示当前学习", () => {
    render(<ChatEmptyState topic="贝叶斯公式" subjectName="概率论" onFollowUpClick={() => {}} />);
    expect(screen.getByText(/贝叶斯公式/)).toBeInTheDocument();
  });

  it("无 topic 时不显示当前学习", () => {
    render(<ChatEmptyState topic="" subjectName="物理" onFollowUpClick={() => {}} />);
    expect(screen.queryByText(/当前学习/)).not.toBeInTheDocument();
  });

  it("渲染快捷提示按钮", () => {
    render(<ChatEmptyState topic="" subjectName="物理" onFollowUpClick={() => {}} />);
    expect(screen.getByTestId("follow-up")).toBeInTheDocument();
    expect(screen.getByText("试试这样问我")).toBeInTheDocument();
  });

  it("点击快捷提示触发 onFollowUpClick", () => {
    const onClick = vi.fn();
    render(<ChatEmptyState topic="" subjectName="物理" onFollowUpClick={onClick} />);
    const buttons = screen.getByTestId("follow-up").querySelectorAll("button");
    expect(buttons.length).toBe(3);
    buttons[0].click();
    expect(onClick).toHaveBeenCalledWith(expect.any(String));
  });
});
