import { describe, it, expect, beforeEach } from "vitest";
import { useChatUI } from "./useChatUI";

describe("useChatUI", () => {
  beforeEach(() => {
    useChatUI.getState().clearQuotedText();
  });

  it("初始状态 quotedText 为 null", () => {
    expect(useChatUI.getState().quotedText).toBeNull();
  });

  it("setQuotedText 设置引用文本", () => {
    useChatUI.getState().setQuotedText("这是一段引用");
    expect(useChatUI.getState().quotedText).toBe("这是一段引用");
  });

  it("clearQuotedText 清空引用文本", () => {
    useChatUI.getState().setQuotedText("测试引用");
    useChatUI.getState().clearQuotedText();
    expect(useChatUI.getState().quotedText).toBeNull();
  });

  it("setQuotedText 覆盖之前的值", () => {
    useChatUI.getState().setQuotedText("第一段");
    useChatUI.getState().setQuotedText("第二段");
    expect(useChatUI.getState().quotedText).toBe("第二段");
  });
});
