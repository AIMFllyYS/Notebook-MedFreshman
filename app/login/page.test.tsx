import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LoginPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
    push.mockClear();
  });

  it("renders a centered StudySolo overlay without waiting for AppShell", () => {
    render(<LoginPage />);
    const dialog = screen.getByRole("dialog", { name: "登录 StudySolo" });
    expect(dialog).toHaveClass("login-dialog");
    expect(dialog.closest("[data-testid=login-overlay]")).toHaveClass("login-overlay");
    expect(screen.getByRole("heading", { name: "StudySolo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "忘记密码" })).toBeInTheDocument();
  });

  it("returns home when the backdrop is pressed", () => {
    render(<LoginPage />);
    fireEvent.mouseDown(screen.getByTestId("login-overlay"));
    expect(push).toHaveBeenCalledWith("/");
  });
});
