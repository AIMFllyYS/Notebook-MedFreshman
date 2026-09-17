import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChatSettings from "./ChatSettings";
import ToastHost from "@/components/shared/ToastHost";
import { SAVED_TOAST_MESSAGE, useToast } from "@/lib/stores/toast";
import { useSettings } from "@/lib/stores/settings";

vi.mock("./ModelSection", () => ({
  DefaultsSection: () => <div>默认对话</div>,
  RecordAssistantSection: () => <div>划词助手</div>,
  BuiltinModelsSection: () => <div>内置模型</div>,
}));
vi.mock("./AppearanceSection", () => ({ AppearanceSection: () => <div>全局外观</div> }));
vi.mock("./ApiGroupsSection", () => ({ ApiGroupsSection: () => <div>自定义 API</div> }));
vi.mock("./ImageSection", () => ({ ImageSection: () => <div>生图设置</div> }));
vi.mock("./CapabilityEndpointsSection", () => ({ CapabilityEndpointsSection: () => <div>能力端点</div> }));
vi.mock("./ToolsSection", () => ({ ToolsSection: () => <div>工具调用</div> }));
vi.mock("./DataSection", () => ({
  BillingSection: () => <div>计费</div>,
  CloudSyncSection: () => <div>同步</div>,
  ExportSection: () => <div>导出</div>,
  RedemptionSection: () => <div>兑换</div>,
}));
vi.mock("./SkillsSection", () => ({ SkillsSection: () => <div>技能库内容</div> }));

describe("ChatSettings save toast", () => {
  beforeEach(() => {
    useToast.getState().clear();
    useSettings.setState({ globalContext: "" });
  });

  afterEach(() => {
    cleanup();
    useToast.getState().clear();
  });

  it("通用上下文写完失焦后提示已成功保存，输入过程不弹", () => {
    render(
      <>
        <ChatSettings />
        <ToastHost />
      </>,
    );
    const field = screen.getByPlaceholderText(/请用简洁的中文回答/);
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "公式用 KaTeX" } });
    expect(screen.queryByTestId("app-toast")).toBeNull();
    fireEvent.blur(field);
    expect(screen.getByTestId("app-toast")).toHaveTextContent(SAVED_TOAST_MESSAGE);
  });
});
