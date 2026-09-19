import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AgentAssetDetail from "@/components/agent/AgentAssetDetail";
import { ASSET_KIND_LABELS, type AssetKind } from "@/lib/agent/assetCatalog";
import { parseAssetKind } from "@/lib/agent/assetHref";
import { APP_NAME } from "@/lib/constants/app-mode";

interface PageProps {
  params: Promise<{ kind: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kind } = await params;
  const parsed = parseAssetKind(kind);
  return { title: `${APP_NAME} · Agent · ${parsed ? ASSET_KIND_LABELS[parsed] : "资产"}` };
}

/** 资产详情：kind 非法直接 404；id 找不到由页面自己显示空态（跨设备可能还没同步下来）。 */
export default async function AgentAssetDetailRoute({ params }: PageProps) {
  const { kind, id } = await params;
  const parsed: AssetKind | null = parseAssetKind(kind);
  if (!parsed || !id) notFound();
  return <AgentAssetDetail kind={parsed} id={id} />;
}