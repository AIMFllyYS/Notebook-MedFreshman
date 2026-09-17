import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
