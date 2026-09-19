import AgentShell from "@/components/layout/AgentShell";

/**
 * Agent 段布局：左栏（新对话 / 我的资产 / 定时任务 / 插件市场 + 项目 + 最近）常驻，
 * 中央区随子路由切换（对话 / 我的资产 / 资产详情 / 占位页）。
 * 右侧工作区不在这里：它是顶层 AppShell 里与顶栏并列的一列。
 */
export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <AgentShell>{children}</AgentShell>;
}
