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

  it("renders figure directives and KaTeX together", () => {
    const { container } = render(
      <QuizMarkdown>
        {'速度公式为 $v=v_0+at$。\n\n::figure{src="/images/physics/svg/recording/rec-01/uniform-acceleration.svg" alt="匀加速速度图像" caption="速度-时间图像"}'}
      </QuizMarkdown>,
    );

    expect(container.querySelector(".katex")).not.toBeNull();
    const img = screen.getByAltText("匀加速速度图像") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/images/physics/svg/recording/rec-01/uniform-acceleration.svg");
    expect(screen.getByText("速度-时间图像")).toBeInTheDocument();
    expect(container.querySelector("figuremedia")).toBeNull();
  });
});
