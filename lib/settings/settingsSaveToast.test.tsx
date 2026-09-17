import React, { useState } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { onSettingsFieldBlur, onSettingsFieldFocus } from "./settingsSaveToast";
import { useSettings } from "@/lib/stores/settings";
import { SAVED_TOAST_MESSAGE, useToast } from "@/lib/stores/toast";
import ToastHost from "@/components/shared/ToastHost";

function PersistField() {
  const value = useSettings((s) => s.globalContext);
  const setGlobalContext = useSettings((s) => s.setGlobalContext);
  return (
    <div onFocus={onSettingsFieldFocus} onBlur={onSettingsFieldBlur}>
      <textarea
        aria-label="全局补充上下文"
        value={value}
        onChange={(event) => setGlobalContext(event.target.value)}
      />
      <label>
        开关
        <input type="checkbox" />
      </label>
    </div>
  );
}

describe("settingsSaveToast", () => {
  beforeEach(() => {
    useToast.getState().clear();
    useSettings.setState({ globalContext: "" });
  });

  afterEach(() => {
    cleanup();
    useToast.getState().clear();
  });

  it("keystroke 不弹，blur 且 persist 成功后才提示已成功保存", () => {
    render(
      <>
        <PersistField />
        <ToastHost />
      </>,
    );
    const field = screen.getByLabelText("全局补充上下文");
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "用中文回答" } });
    expect(screen.queryByTestId("app-toast")).toBeNull();
    fireEvent.blur(field);
    expect(screen.getByTestId("app-toast")).toHaveTextContent(SAVED_TOAST_MESSAGE);
  });

  it("只聚焦再移开、值没 persist 时不提示", () => {
    render(
      <>
        <PersistField />
        <ToastHost />
      </>,
    );
    const field = screen.getByLabelText("全局补充上下文");
    fireEvent.focus(field);
    fireEvent.blur(field);
    expect(screen.queryByTestId("app-toast")).toBeNull();
  });

  it("复选框失焦不提示", () => {
    render(
      <>
        <PersistField />
        <ToastHost />
      </>,
    );
    const box = screen.getByLabelText("开关");
    fireEvent.focus(box);
    fireEvent.click(box);
    fireEvent.blur(box);
    expect(screen.queryByTestId("app-toast")).toBeNull();
  });
});

function LocalOnlyField() {
  const [value, setValue] = useState("");
  return (
    <div onFocus={onSettingsFieldFocus} onBlur={onSettingsFieldBlur}>
      <input aria-label="未落盘草稿" value={value} onChange={(event) => setValue(event.target.value)} />
    </div>
  );
}

describe("settingsSaveToast persist gate", () => {
  afterEach(() => {
    cleanup();
    useToast.getState().clear();
  });

  it("blur 时若 settings 未 persist 不提示", () => {
    render(
      <>
        <LocalOnlyField />
        <ToastHost />
      </>,
    );
    const field = screen.getByLabelText("未落盘草稿");
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "草稿" } });
    fireEvent.blur(field);
    expect(screen.queryByTestId("app-toast")).toBeNull();
  });
});
