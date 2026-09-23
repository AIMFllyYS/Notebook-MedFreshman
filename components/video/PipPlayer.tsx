"use client";

import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";

// 轻量门闸：PipPlayer 每页都渲染（AnimatePresence 内无条件挂载），静态 import
// @vidstack/react（~250KB+ 图标集）会随门闸一起进 eager 图。拆成「store 判定 +
// dynamic 内层」，只有真有画中画视频时才下载播放器代码。
const PipPlayerInner = dynamic(() => import("./PipPlayerInner"), { ssr: false });

export default function PipPlayer() {
  const video = useStore((s) => s.pipVideo);
  if (!video) return null;
  return <PipPlayerInner />;
}
