import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import UserDockMenu from "./UserDockMenu";

describe("UserDockMenu", () => {
  it("adds 额度 to the user menu and does not render account profile fields", () => {
    const onOpenQuota = vi.fn();
    const onOpenSettings = vi.fn();
    render(
      <UserDockMenu
        trigger={<span>账户</span>}
        onOpenQuota={onOpenQuota}
        onOpenSettings={onOpenSettings}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "用户菜单" }));
    expect(screen.getByTestId("user-menu-quota")).toHaveTextContent("额度");
    expect(screen.queryByText("昵称")).toBeNull();
    expect(screen.queryByText("密码")).toBeNull();
    fireEvent.click(screen.getByTestId("user-menu-quota"));
    expect(onOpenQuota).toHaveBeenCalledOnce();
  });
});
