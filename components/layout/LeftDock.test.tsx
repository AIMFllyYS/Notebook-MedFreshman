import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LeftDock from "./LeftDock";
import { useUserProfile } from "@/lib/stores/userProfile";

describe("LeftDock", () => {
  beforeEach(() => {
    localStorage.clear();
    useUserProfile.setState({ avatars: {}, nicknames: {} });
  });

  it("shows avatar and 访客 when signed out", () => {
    const ref = { current: null } as React.RefObject<HTMLButtonElement | null>;
    render(<LeftDock buttonRef={ref} onToggle={() => {}} />);
    expect(screen.getByTestId("left-dock")).toHaveTextContent("访客");
    expect(screen.getByTestId("user-avatar")).toBeInTheDocument();
  });

  it("toggles the settings panel directly without an intermediate menu", () => {
    const ref = { current: null } as React.RefObject<HTMLButtonElement | null>;
    const onToggle = vi.fn();
    render(<LeftDock buttonRef={ref} onToggle={onToggle} />);
    const dock = screen.getByTestId("left-dock");
    expect(dock).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(dock);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("reflects the open settings panel via aria-expanded", () => {
    const ref = { current: null } as React.RefObject<HTMLButtonElement | null>;
    const onToggle = vi.fn();
    render(<LeftDock buttonRef={ref} onToggle={onToggle} settingsOpen />);
    expect(screen.getByTestId("left-dock")).toHaveAttribute("aria-expanded", "true");
  });
});
