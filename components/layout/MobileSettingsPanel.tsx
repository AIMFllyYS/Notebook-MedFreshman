"use client";

import ChatSettings from "@/components/chat/ChatSettings";

/** 手机底栏「设置」：复用 Agent 设置工作区，全屏铺开，不是侧栏弹窗。 */
export default function MobileSettingsPanel() {
  return (
    <div className="mobile-settings-panel" data-testid="mobile-settings-panel">
      <ChatSettings showBack={false} />
    </div>
  );
}
