/**
 * lib/motion.ts
 * 统一的 framer-motion 数值常量 —— 映射 globals.css 中的 CSS token。
 * 所有需要 framer-motion 数值的组件从这里取值，不写魔法数字。
 */

import type { Variants, Transition } from "framer-motion";

// ── 时长（秒），对应 globals.css --duration-* ──────────────────────
export const DURATION = {
  instant: 0.05,   // --duration-instant: 50ms
  fast:    0.15,   // --duration-fast:   150ms
  normal:  0.25,   // --duration-normal: 250ms
  slow:    0.4,    // --duration-slow:   400ms
  sidebar: 0.45,   // 侧边栏文件夹展开  450ms
} as const;

// ── 缓动曲线，对应 globals.css --ease-* ──────────────────────────
export const EASE = {
  decelerate: [0.05, 0.7, 0.1, 1.0] as number[],   // MD3 emphasized-decelerate（展开：慢起步→快到位）
  accelerate: [0.3,  0.0, 0.8, 0.15] as number[],  // MD3 emphasized-accelerate（收起：快起步→慢合拢）
  standard:   [0.2,  0.0, 0.0, 1.0] as number[],   // MD3 standard
  spring:     [0.34, 1.56, 0.64, 1] as number[],   // --ease-spring
} as const;

// ── 私有工具 ────────────────────────────────────────────────────
function tr(duration: number, ease?: number[]): Transition {
  return { duration, ease: ease ?? EASE.decelerate };
}

// ── 预设 Variants ────────────────────────────────────────────────

/** 淡入 + 微向上滑入；用于 AI 消息、面板内容切换 */
export const fadeInUpVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: tr(DURATION.normal) },
  exit:    { opacity: 0, y: 4, transition: tr(DURATION.fast, EASE.standard) },
};

/** 缩放淡入；用于下拉菜单、Tooltip、弹窗 */
export const scaleInVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1,    transition: tr(DURATION.fast) },
  exit:    { opacity: 0, scale: 0.96, transition: tr(DURATION.fast, EASE.standard) },
};

/** 高度折叠；用于文件树节点、思考块、推导块等所有展开/收起 */
export const collapseVariants: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1, transition: { duration: DURATION.sidebar, ease: EASE.decelerate } },
  exit:    { height: 0,    opacity: 0, transition: { duration: DURATION.slow,    ease: EASE.accelerate } },
};

/**
 * 方向感 Tab 面板切换：根据新旧 Tab index 的差值决定滑入/滑出方向。
 * @param dir  1 = 向右切换（新 Tab 在右侧），-1 = 向左切换
 */
export function tabPanelVariants(dir: 1 | -1): Variants {
  return {
    initial: { opacity: 0, x: dir * 32 },
    animate: { opacity: 1, x: 0,         transition: { duration: 0.35, ease: EASE.decelerate } },
    exit:    { opacity: 0, x: dir * -24, transition: { duration: DURATION.normal, ease: EASE.standard } },
  };
}
