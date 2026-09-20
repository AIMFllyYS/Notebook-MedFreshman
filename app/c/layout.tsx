import AgentShell from "@/components/layout/AgentShell";

/**
 * C 段布局（`/c/<sessionId>`）：与 `app/agent/layout.tsx` 一字不差地共用同一个外壳。
 *
 * 为什么不把 `/c/<id>` 塞进 `app/agent` 段：它是**分享出去的那条链接**，要短、要稳定，
 * 不能因为以后 `/agent` 段改名或挪位就失效。
 * 但「打开一条对话」在界面上和 `/agent` 是同一件事——左栏（新对话 / 我的资产 / 项目 / 最近）
 * 常驻、中央区随子路由切换，右侧工作区是顶层 AppShell 里与顶栏并列的一列——
 * 所以外壳必须复用 AgentShell，而不是另写一套只显示对话的窄壳（那会丢掉左栏与右栏）。
 */
export default function ChatDeepLinkLayout({ children }: { children: React.ReactNode }) {
  return <AgentShell>{children}</AgentShell>;
}
