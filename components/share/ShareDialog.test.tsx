import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ShareDialog from "./ShareDialog";
import { translate } from "@/lib/i18n";

const zh = (key: string) => translate("zh", key);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ShareDialog", () => {
  it("asks for confirmation first and spells out what will be shared", () => {
    render(<ShareDialog onClose={() => {}} onConfirm={async () => "https://x/s/abc"} />);
    expect(screen.getByText(zh("share.dialog.intro"))).toBeVisible();
    expect(screen.getByText(zh("share.dialog.itemText"))).toBeVisible();
    expect(screen.getByText(zh("share.dialog.itemSources"))).toBeVisible();
    expect(screen.getByText(zh("share.dialog.itemArtifacts"))).toBeVisible();
    expect(screen.getByText(zh("share.dialog.warning"))).toBeVisible();
    // 确认之前不该出现链接。
    expect(screen.queryByTestId("share-link")).not.toBeInTheDocument();
  });

  it("does not create anything until the user confirms", () => {
    const onConfirm = vi.fn(async () => "https://x/s/abc");
    render(<ShareDialog onClose={() => {}} onConfirm={onConfirm} />);
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("share-dialog-confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows the link with a copy button once created, and reports 已复制", async () => {
    const writeText = vi.fn(async () => {});
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ShareDialog onClose={() => {}} onConfirm={async () => "https://x/s/abc"} />);
    fireEvent.click(screen.getByTestId("share-dialog-confirm"));
    const link = await screen.findByTestId("share-link");
    expect(link).toHaveTextContent("https://x/s/abc");
    fireEvent.click(screen.getByTestId("share-link-copy"));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("https://x/s/abc"));
    expect(await screen.findByText(zh("share.dialog.copied"))).toBeVisible();
  });

  it("returns to the confirm state with an error when creation fails", async () => {
    render(<ShareDialog onClose={() => {}} onConfirm={async () => { throw new Error("500"); }} />);
    fireEvent.click(screen.getByTestId("share-dialog-confirm"));
    expect(await screen.findByRole("alert")).toHaveTextContent(zh("share.failed"));
    // 还能再试一次，不是一次失败就把弹窗废掉。
    expect(screen.getByTestId("share-dialog-confirm")).toBeEnabled();
  });
});
