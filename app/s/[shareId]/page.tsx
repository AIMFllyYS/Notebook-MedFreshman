import type { Metadata } from "next";
import SharePage from "@/components/share/SharePage";
import { APP_NAME } from "@/lib/constants/app-mode";

interface PageProps {
  params: Promise<{ shareId: string }>;
}

/**
 * 公开分享页路由：/s/<shareId>。
 *
 * 只读页没有 per-id 的服务端数据可预渲染（快照在 Supabase，读它的是浏览器端的 anon RPC），
 * 所以这里只把 shareId 交给客户端组件，由它自己走加载 / 找不到 / 正常三态。
 * noindex：分享链接是「有链接就能看」，但它不该被搜索引擎收录、也不该被当成站点内容分发。
 */
export const metadata: Metadata = {
  title: `${APP_NAME} · 分享的对话`,
  robots: { index: false, follow: false },
};

export default async function SharedConversationRoute({ params }: PageProps) {
  const { shareId } = await params;
  return <SharePage shareId={shareId} />;
}
