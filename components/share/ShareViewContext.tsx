"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { SharedArtifact } from "@/lib/share/types";

/**
 * 公开分享页（/s/<shareId>）的只读渲染标记。
 *
 * 为什么不走 prop：分享页到真正画出图片 / 演示卡片的那一步中间隔着
 * ChatThread → ChatMessage → MessageContent → ChatImage（以及 ToolResultCards → ArtifactCard），
 * 这些全是全站共用组件。为了一个只读页面逐层加 prop，等于把「分享」这个概念漏进公共 API，
 * 还会让每次新增调用点都要记得透传。用 context 让最底层的渲染点自己决定降级方式：
 * 默认值 null / 空表 = 不在分享页 = 现行为一字不变。
 *
 * 只读纪律：这里携带的一切都是**快照里的数据**，消费方不得因为拿到它就写任何 store
 * （公开页不该产生写入，更不该把别人的 HTML upsert 进访客自己的账号）。
 */
interface ShareView {
  /** 图片占位文案；null = 不在分享页。 */
  imagePlaceholder: string | null;
  /** 快照带走的 HTML 演示，按 id 索引；供消息内卡片只读渲染。 */
  artifacts: ReadonlyMap<string, SharedArtifact>;
}

const EMPTY_ARTIFACTS: ReadonlyMap<string, SharedArtifact> = new Map();

const ShareViewContext = createContext<ShareView>({
  imagePlaceholder: null,
  artifacts: EMPTY_ARTIFACTS,
});

/** 分享页外壳：子树里的图片一律渲染成占位，演示卡片直接读快照，不再尝试访问本地产物表。 */
export function ShareViewProvider({
  imagePlaceholder,
  artifacts,
  children,
}: {
  imagePlaceholder: string;
  artifacts: SharedArtifact[];
  children: ReactNode;
}) {
  // 空串按「不在分享页」处理：占位文案缺失时宁可照常渲染，也不要画一堆空占位。
  const value = useMemo<ShareView>(
    () => ({
      imagePlaceholder: imagePlaceholder || null,
      artifacts: artifacts.length
        ? new Map(artifacts.map((artifact) => [artifact.id, artifact]))
        : EMPTY_ARTIFACTS,
    }),
    [artifacts, imagePlaceholder],
  );
  return <ShareViewContext.Provider value={value}>{children}</ShareViewContext.Provider>;
}

/** 当前子树的图片占位文案；不在分享页时返回 null。 */
export function useShareImagePlaceholder(): string | null {
  return useContext(ShareViewContext).imagePlaceholder;
}

/** 快照里这条 id 对应的 HTML 演示；不在分享页 / 不属于这条对话时返回 null。 */
export function useSharedArtifact(id: string): SharedArtifact | null {
  const { artifacts } = useContext(ShareViewContext);
  return artifacts.get(id) ?? null;
}
