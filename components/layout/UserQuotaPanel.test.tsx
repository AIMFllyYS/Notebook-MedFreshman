import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UserQuotaPanel from "./UserQuotaPanel";

vi.mock("@/components/chat/AccountQuota", () => ({
  AccountQuota: () => <div>会员与额度</div>,
}));
vi.mock("@/components/chat/StorageQuota", () => ({
  StorageQuotaBlock: () => (
    <div>
      <div role="progressbar" aria-label="云端已用" />
      <div role="progressbar" aria-label="笔记额度池" />
    </div>
  ),
}));

describe("UserQuotaPanel", () => {
  it("shows membership, API quota and storage bars", () => {
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    render(<UserQuotaPanel anchorRef={{ current: anchor }} onClose={() => {}} />);
    expect(screen.getByRole("dialog", { name: "额度" })).toBeInTheDocument();
    expect(screen.getByText("会员与额度")).toBeInTheDocument();
    expect(screen.getByText("存储额度")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "云端已用" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "笔记额度池" })).toBeInTheDocument();
  });
});
