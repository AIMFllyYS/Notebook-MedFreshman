"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * 左上角品牌徽标：在一组「透明底 · 单色描边（currentColor）」的图形之间
 * 每隔 intervalMs 通过淡入淡出 + 轻微缩放/旋转做渐变轮播。
 * 颜色由父级 color 决定（默认跟随品牌色 --accent），尊重 prefers-reduced-motion。
 */

type Mark = { key: string; node: React.ReactNode };

const MARKS: Mark[] = [
  {
    // 折角文档
    key: "doc",
    node: (
      <>
        <path d="M6.5 4.5 H13 L17.5 9 V19.5 H6.5 Z" />
        <path d="M13 4.5 V9 H17.5" />
        <line x1="9" y1="12.5" x2="15" y2="12.5" />
        <line x1="9" y1="15.5" x2="13.5" y2="15.5" />
      </>
    ),
  },
  {
    // 堆叠层级
    key: "layers",
    node: (
      <>
        <path d="M5 9 L12 5.6 L19 9 L12 12.4 Z" />
        <path d="M5 12.4 L12 15.8 L19 12.4" />
        <path d="M5 15.6 L12 19 L19 15.6" />
      </>
    ),
  },
  {
    // 学位帽
    key: "cap",
    node: (
      <>
        <path d="M4 9.3 L12 5.4 L20 9.3 L12 13.2 Z" />
        <path d="M7 11 V15.2 C7 15.2 9 17 12 17 C15 17 17 15.2 17 15.2 V11" />
        <path d="M20 9.3 V14" />
        <circle cx="20" cy="14.9" r="0.9" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    // 翻开的书
    key: "book",
    node: (
      <>
        <path d="M12 7.2 C10 5.8 6.8 5.6 4.5 6.3 V17 C6.8 16.3 10 16.5 12 17.9" />
        <path d="M12 7.2 C14 5.8 17.2 5.6 19.5 6.3 V17 C17.2 16.3 14 16.5 12 17.9" />
        <path d="M12 7.2 V17.9" />
      </>
    ),
  },
  {
    // 对勾（原水墨笔触 → 统一为描边风格）
    key: "check",
    node: <path d="M5.5 12.6 L10 17 L18.5 7" />,
  },
  {
    // 节点网络
    key: "network",
    node: (
      <>
        <line x1="7.3" y1="8.2" x2="11" y2="11" />
        <line x1="16.7" y1="7.8" x2="13" y2="11" />
        <line x1="11" y1="13" x2="8.3" y2="16.7" />
        <line x1="13" y1="13" x2="15.9" y2="16.4" />
        <circle cx="12" cy="12" r="2.1" />
        <circle cx="7" cy="8" r="1.4" />
        <circle cx="17" cy="7.6" r="1.4" />
        <circle cx="8" cy="17" r="1.4" />
        <circle cx="16.3" cy="16.6" r="1.4" />
      </>
    ),
  },
  {
    // 火花
    key: "spark",
    node: (
      <>
        <path d="M12 4.5 C12.5 8.2 13.4 9.1 17 9.6 C13.4 10.1 12.5 11 12 14.7 C11.5 11 10.6 10.1 7 9.6 C10.6 9.1 11.5 8.2 12 4.5 Z" />
        <path d="M17.4 14.3 l.5 1.4 1.4 .5 -1.4 .5 -.5 1.4 -.5 -1.4 -1.4 -.5 1.4 -.5 Z" />
      </>
    ),
  },
];

export default function BrandLogo({
  size = 24,
  intervalMs = 2600,
}: {
  size?: number;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(
      () => setIndex((prev) => (prev + 1) % MARKS.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [intervalMs]);

  const current = MARKS[index];

  return (
    <span
      className="relative inline-flex shrink-0"
      style={{ width: size, height: size, color: "#ff8a6b" }}
      aria-label="期末复习工作站"
      role="img"
    >
      <AnimatePresence initial={false}>
        <motion.svg
          key={current.key}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.78 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.78 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0 }}
        >
          {current.node}
        </motion.svg>
      </AnimatePresence>
    </span>
  );
}
