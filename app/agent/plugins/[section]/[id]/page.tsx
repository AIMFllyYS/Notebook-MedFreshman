import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PluginDetail from "@/components/agent/plugins/PluginDetail";
import { parseMarketSection } from "@/lib/plugins/market-section";
import { APP_NAME } from "@/lib/constants/app-mode";

interface PageProps {
  params: Promise<{ section: string; id: string }>;
}

const SECTION_TITLE: Record<string, string> = {
  mcp: "MCP 插件",
  cli: "CLI + Skills",
  skills: "官方 Skills",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section } = await params;
  const parsed = parseMarketSection(section);
  return { title: `${APP_NAME} · 插件市场 · ${parsed ? SECTION_TITLE[parsed] : "详情"}` };
}

/** 市场条目详情：section 非法直接 404；id 不在清单里由页面自显示空态。 */
export default async function PluginDetailRoute({ params }: PageProps) {
  const { section, id } = await params;
  const parsed = parseMarketSection(section);
  if (!parsed || !id) notFound();
  return <PluginDetail section={parsed} id={id} />;
}
