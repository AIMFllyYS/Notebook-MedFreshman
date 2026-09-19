"use client";

import AgentDockHost from "@/components/window/AgentDockHost";
import RightPanel from "./RightPanel";
import { RIGHT_PANEL_ID } from "@/lib/constants/layout";

/**
 * Agent 右侧工作区整列。
 *
 * 它是顶层布局里与「顶栏 + 主区」并列的一列，因此**通到窗口最顶**（比顶栏高、与顶栏最上沿平齐），
 * 由顶栏最右侧的按钮控制展开/收起；展开时左边界向左移动（从左侧拉出）。
 * 内容只有 Agent 输出（ManagedWindow 文档/产物/网页），不再承载动画讲解/可交互/浏览器这些内置栏目。
 */
export default function AgentDockColumn() {
  return (
    <aside data-agent-slot="windows" className="flex h-full min-h-0 flex-col bg-[var(--bg-panel)]">
      <div className="sr-only">窗口</div>
      <div id={RIGHT_PANEL_ID} className="agent-dock-column relative min-h-0 flex-1">
        <AgentDockHost>
          <RightPanel hideAiTab hideBuiltinTabs showWindowDock />
        </AgentDockHost>
      </div>
    </aside>
  );
}
