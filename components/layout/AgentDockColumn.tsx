"use client";

import { useCallback } from "react";
import AgentDockHost from "@/components/window/AgentDockHost";
import RightPanel from "./RightPanel";
import { ChatSkeleton } from "@/components/shared/ResizeLoader";
import { RIGHT_PANEL_ID } from "@/lib/constants/layout";
import { useStore } from "@/lib/stores/ui";

/**
 * Agent 右侧工作区整列。
 *
 * 它是顶层布局里与「顶栏 + 主区」并列的一列，因此**通到窗口最顶**（比顶栏高、与顶栏最上沿平齐），
 * 由顶栏最右侧的按钮控制展开/收起；展开时左边界向左移动（从左侧拉出）。
 * 内容只有 Agent 输出（ManagedWindow 文档/产物/网页），不再承载动画讲解/可交互/浏览器这些内置栏目。
 *
 * `busy`（拖拽或收展过程中）时用骨架屏盖住整列：窄宽度下标签与正文会被响应式压成竖排单字，
 * 而且过渡期每帧都在重排正文，盖住既好看也省性能。
 */
export default function AgentDockColumn({ busy = false }: { busy?: boolean }) {
  const setAgentDockCollapsed = useStore((s) => s.setAgentDockCollapsed);
  const collapseDock = useCallback(() => setAgentDockCollapsed(true), [setAgentDockCollapsed]);

  return (
    <aside data-agent-slot="windows" className="flex h-full min-h-0 flex-col bg-[var(--bg-panel)]">
      <div className="sr-only">窗口</div>
      <div id={RIGHT_PANEL_ID} className="agent-dock-column relative min-h-0 flex-1">
        <AgentDockHost>
          <RightPanel hideBuiltinTabs showWindowDock onCollapse={collapseDock} />
        </AgentDockHost>
        {busy && <ChatSkeleton />}
      </div>
    </aside>
  );
}
