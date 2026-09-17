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

  it("opens a user menu with 额度 before 设置", () => {
    const ref = { current: null } as React.RefObject<HTMLButtonElement | null>;
    const onOpenQuota = vi.fn();
    const onToggle = vi.fn();
    render(<LeftDock buttonRef={ref} onToggle={onToggle} onOpenQuota={onOpenQuota} />);
    fireEvent.click(screen.getByTestId("left-dock"));
    expect(screen.getByTestId("user-menu-quota")).toHaveTextContent("额度");
    fireEvent.click(screen.getByTestId("user-menu-quota"));
    expect(onOpenQuota).toHaveBeenCalledOnce();
    expect(onToggle).not.toHaveBeenCalled();
  });
});
