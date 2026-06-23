"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DURATION, EASE } from "@/lib/motion";

interface Props {
  /** 控制是否展开 */
  isOpen: boolean;
  children: React.ReactNode;
}

/**
 * 所有展开/收起场景的统一组件。
 * 用 useAnimationControls 手动驱动 height 动画；收起时先 set 锁定像素高度再 animate 到 0，消除 1 帧闪动。
 *
 * 性能：折叠态在「关闭动画结束后」卸载 children（shouldRender=false），不再「始终挂载 DOM」。
 * 这样未展开的学科/分类不会把整棵 FileTree 常驻在 DOM 与 framer-motion 的 layout 跟踪里，
 * 大幅降低侧栏的常驻节点数（默认仅当前学科展开）。开/关动画期间 children 始终在场，动画不破。
 */
export default function AnimatedCollapse({ isOpen, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const isFirstRender = useRef(true);
  // 展开时立即挂载；收起时保留到关闭动画结束再卸载。
  const [shouldRender, setShouldRender] = useState(isOpen);

  // 打开：先确保 children 已挂载，再由下方动画 effect 展开。
  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isOpen) {
      controls.start({
        height: "auto",
        opacity: 1,
        transition: { duration: DURATION.sidebar, ease: EASE.decelerate },
      });
    } else {
      const el = ref.current;
      if (!el) {
        setShouldRender(false);
        return;
      }
      controls.set({ height: el.scrollHeight, opacity: 1 });
      controls.start({
        height: 0,
        opacity: 0,
        transition: { duration: DURATION.slow, ease: EASE.accelerate },
      });
    }
  }, [isOpen, controls]);

  return (
    <motion.div
      ref={ref}
      initial={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
      animate={controls}
      onAnimationComplete={() => {
        // 关闭动画结束后卸载 children，释放 DOM/fiber 与 layout 跟踪。
        if (!isOpen) setShouldRender(false);
      }}
      layout="position"
      style={{ overflow: "hidden" }}
    >
      {shouldRender ? children : null}
    </motion.div>
  );
}
