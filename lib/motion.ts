/**
 * lib/motion.ts
 * 统一的 framer-motion 数值常量 —— 映射 globals.css 中的 CSS token。
 * 所有需要 framer-motion 数值的组件从这里取值，不写魔法数字。
 */

import type { MotionProps, Variants, Transition } from "framer-motion";

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
 * 网格 / 列表「重排」用的弹簧：切换标签时卡片互相挪位要丝滑，但不能拖尾晃动，
 * 所以刚度偏高（420）、阻尼足（36）、质量轻（0.7）。framer-motion 的 layout 动画读它。
 */
export const LAYOUT_REFLOW: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 36,
  mass: 0.7,
};

/**
 * 卡片进/出：只做「淡 + 微缩」，位移完全交给 layout 动画。
 * 两套位移一起上会互抢，看起来就是抖。
 */
export const cardSwapVariants: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: tr(DURATION.fast) },
  exit: { opacity: 0, scale: 0.98, transition: tr(DURATION.instant, EASE.standard) },
};

/**
 * 「重排 + popLayout」成员项的统一 props（最初在 AgentAssetsPage 的卡片网格上定的手感）：
 * - 外层配合 `<AnimatePresence initial={false} mode="popLayout">`；
 * - 每项 `layout` + `LAYOUT_REFLOW` 弹簧：集合变化时成员互相滑位，进出场只做淡+微缩；
 * - `reducedMotion` 时整套退化为静态（无 layout、无进出场），与 useUiReducedMotion 配套。
 */
export function reflowItemProps(reducedMotion: boolean): MotionProps {
  return reducedMotion
    ? { layout: false, initial: false, transition: LAYOUT_REFLOW }
    : {
        layout: true,
        variants: cardSwapVariants,
        initial: "initial",
        animate: "animate",
        exit: "exit",
        transition: LAYOUT_REFLOW,
      };
}

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
