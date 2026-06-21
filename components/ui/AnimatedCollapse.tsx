"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef } from "react";
import { DURATION, EASE } from "@/lib/motion";

interface Props {
  /** 控制是否展开 */
  isOpen: boolean;
  children: React.ReactNode;
}

/**
 * 所有展开/收起场景的统一组件。
 * 始终挂载 DOM，用 useAnimationControls 手动驱动 height 动画。
 * 收起时先 set 锁定像素高度再 animate 到 0，消除 1 帧闪动。
 */
export default function AnimatedCollapse({ isOpen, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const isFirstRender = useRef(true);

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
      if (!el) return;
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
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
}
