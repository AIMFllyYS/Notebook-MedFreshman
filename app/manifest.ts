import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "期末复习工作站 · 多学科辅助学习",
    short_name: "期末复习",
    description:
      "课堂录音驱动的深度学习助手：详尽原创笔记、AI 对话、Manim 动画讲解与可交互内容，覆盖概率论、有机化学、近现代史等多学科。",
    start_url: "/",
    display: "standalone",
    background_color: "#f4efe6",
    theme_color: "#d9542c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-256.png", sizes: "256x256", type: "image/png" },
    ],
  };
}
