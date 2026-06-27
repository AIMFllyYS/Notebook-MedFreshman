import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import QuizMarkdown from "./QuizMarkdown";

describe("QuizMarkdown", () => {
  it("renders project directives without leaking custom DOM tags", () => {
    const { container } = render(
      <QuizMarkdown>
        {":::note{label=提醒}\n这里是重点。\n:::\n\n<FollowUp>继续问|换个例子</FollowUp>"}
      </QuizMarkdown>,
    );

    expect(screen.getByText("注 · 提醒")).toBeInTheDocument();
    expect(screen.getByText("这里是重点。")).toBeInTheDocument();
    expect(container.querySelector("callout")).toBeNull();
    expect(container.querySelector("followup")).toBeNull();
    expect(screen.queryByText(/继续问/)).not.toBeInTheDocument();
  });
});
