import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { InlineCiteMarker } from "./InlineCiteMarker";
import { useNoteCitations } from "@/lib/stores/noteCitations";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

afterEach(() => {
  cleanup();
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  useNoteCitations.getState().closeViewer();
});

const note = {
  index: 2,
  kind: "note" as const,
  title: "被覆上皮",
  path: "histology/textbook/ch02-1",
  snippet: "单层扁平上皮覆盖血管内膜。",
};

describe("InlineCiteMarker", () => {
  it("renders a numbered chip and opens the textbook viewer on click", () => {
    render(<InlineCiteMarker source={note} catalog={[note]} />);
    const chip = screen.getByTestId("inline-cite");
    expect(chip).toHaveTextContent("2");
    fireEvent.mouseEnter(chip);
    expect(screen.getByTestId("inline-cite-popover")).toHaveTextContent("被覆上皮");
    fireEvent.click(chip);
    expect(useNoteCitations.getState().activePath).toBe("histology/textbook/ch02-1");
  });

  it("opens a web preview for http sources", () => {
    const web = {
      index: 1,
      kind: "web" as const,
      title: "课程",
      url: "https://example.edu/a",
      snippet: "摘要",
    };
    render(<InlineCiteMarker source={web} catalog={[web]} />);
    fireEvent.click(screen.getByTestId("inline-cite"));
    expect(useWindowManager.getState().windows.some((win) => win.type === "source-preview")).toBe(true);
  });
});
