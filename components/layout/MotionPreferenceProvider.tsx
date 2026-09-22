"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { useSettings } from "@/lib/stores/settings";

/**
 * 「减少动画」用户偏好的落地层：
 * - html[data-reduce-motion] → globals.css 的全局 kill-switch 把 CSS transition/animation 压成即时；
 * - MotionConfig reducedMotion="always" → framer-motion 的 transform/layout 动画整体降级（opacity 仍保留淡出淡入）。
 * 与系统 prefers-reduced-motion 是「或」的关系（"user" 档本来就跟随系统媒体查询）。
 * 组件内判断请用 useUiReducedMotion()，不要直读 framer 的 useReducedMotion。
 */
export default function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const userReduced = useSettings((s) => s.reduceMotion);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = userReduced ? "true" : "false";
  }, [userReduced]);

  return <MotionConfig reducedMotion={userReduced ? "always" : "user"}>{children}</MotionConfig>;
}
