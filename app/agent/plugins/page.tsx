import type { Metadata } from "next";
import AgentPlaceholderPage from "@/components/agent/AgentPlaceholderPage";
import { AgentPluginsIcon } from "@/components/icons/AgentIcons";
import { APP_NAME } from "@/lib/constants/app-mode";

export const metadata: Metadata = {
  title: `${APP_NAME} · Agent · 插件市场`,
};

export default function AgentPluginsPage() {
  return (
    <AgentPlaceholderPage
      title="插件市场"
      description="把 Agent 的能力按需装上去：技能包、工具扩展、外部渠道，装完即用。"
      plans={[
        "技能包：把一整套做事流程（选题、整理、出题、成稿）装成一个可点用的技能。",
        "工具扩展：给 Agent 接上新的取数或操作能力，装完在对话里直接调用。",
        "渠道接入：把结果直接推到你在用的地方，而不是只留在本机。",
      ]}
      icon={<AgentPluginsIcon size={26} />}
    />
  );
}
