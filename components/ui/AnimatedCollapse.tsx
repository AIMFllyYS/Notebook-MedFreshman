"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DURATION, EASE } from "@/lib/motion";

interface Props {
  /** 控制是否展开 */
  isOpen: boolean;
  children: React.ReactNode;
}

/** 展开与收起走同一条路径：都先量出真实内容高度，再动画到该像素值。 */
const OPEN_TRANSITION = { duration: DURATION.sidebar, ease: EASE.decelerate };
const CLOSE_TRANSITION = { duration: DURATION.slow, ease: EASE.accelerate };

/**
 * 取内容真实高度。用 scrollHeight（布局值）而不是元素边界矩形：
 * 祖先若有 transform: scale()，边界矩形是缩放后的视觉值，会被按比例算错。
 */
function contentHeight(el: HTMLElement | null) {
  return el ? el.scrollHeight : 0;
}

/** 高度差在 1px 内视为相同，避免亚像素抖动触发无意义的重新动画。 */
function sameHeight(a: number, b: number) {
  return Math.abs(a - b) < 1;
}

/**
 * 所有展开/收起场景的统一组件。
 *
 * 高度动画显式驱动到「实测像素高度」，**不使用 `height: "auto"` 作为动画目标**：
 * framer 解析 auto 时按元素边界矩形测量一次，且只在动画开始时测一次。这带来两个坑：
 *   1. 祖先 transform: scale() 会把测量值整体缩小，动画停在真实高度的 90%，末帧被 auto 拉回 → 抖动；
 *   2. 内容是异步的（接口/字体/图片）时，测量值会过期，末帧跳变可达数百像素。
 * 因此这里改为：动画目标 = scrollHeight（布局值，免疫 transform），
 * 并在展开期间用 ResizeObserver 跟随内容尺寸变化修正目标，动画收口时再交还给 auto。
 *
 * 收起时先 set 锁定像素高度再 animate 到 0，消除 1 帧闪动。
 *
 * 性能：折叠态在「关闭动画结束后」卸载 children（shouldRender=false），不再「始终挂载 DOM」。
 * 这样未展开的学科/分类不会把整棵 FileTree 常驻在 DOM 里，
 * 大幅降低侧栏的常驻节点数（默认仅当前学科展开）。开/关动画期间 children 始终在场，动画不破。
 *
 * ⚠️ 禁止给本组件加 layout / layoutId：AnimatedCollapse 嵌在 SubjectSidebar 的
 * AnimatePresence(mode="wait") 退场子树里，layout 投影节点会注册进 presence 完成追踪；
 * 侧栏树较大时（如大一下学期含默认展开的概率论）exit 永不判定完成，
 * mode="wait" 便永不挂载目录视图，侧栏内容区白屏（无任何报错的静默死锁）。
 * 兄弟行的位移动画由 height 动画本身逐帧推动，无需 layout 参与。
 */
export default function AnimatedCollapse({ isOpen, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // 单独包一层作为测量目标：motion.div 自身的高度在动画中变化，观察它会与动画互相触发。
  const contentRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const isFirstRender = useRef(true);
  // 当前动画目标高度；内容变化时用它判断是否需要修正目标。
  const targetRef = useRef(0);
  // 动画已收口并交还 height:auto —— 此后内容变化由 CSS 自然跟随，无需再介入。
  const settledRef = useRef(false);
  // 展开时立即挂载；收起时保留到关闭动画结束再卸载。
  const [shouldRender, setShouldRender] = useState(isOpen);

  // 打开：先确保 children 已挂载，再由下方动画 effect 展开。
  if (isOpen && !shouldRender) setShouldRender(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = ref.current;
    const height = contentHeight(el);
    settledRef.current = false;
    targetRef.current = height;
    if (isOpen) {
      controls.start({ height, opacity: 1, transition: OPEN_TRANSITION });
    } else {
      controls.set({ height, opacity: 1 });
      controls.start({ height: 0, opacity: 0, transition: CLOSE_TRANSITION });
    }
  }, [isOpen, controls]);

  // 展开期间内容尺寸可能变化（异步数据、字体、图片）。把动画目标同步到新的实测高度，
  // 否则动画收口时会被 height:auto 拉回真实高度而产生跳变。
  useEffect(() => {
    if (!isOpen || !shouldRender) return;
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (settledRef.current) return;
      const el = ref.current;
      if (!el) return;
      const height = contentHeight(el);
      if (sameHeight(height, targetRef.current)) return;
      targetRef.current = height;
      controls.start({ height, opacity: 1, transition: OPEN_TRANSITION });
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [isOpen, shouldRender, controls]);

  return (
    <motion.div
      ref={ref}
      initial={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
      animate={controls}
      onAnimationComplete={() => {
        // 关闭动画结束后卸载 children，释放 DOM/fiber。
        if (!isOpen) {
          setShouldRender(false);
          return;
        }
        // 内容仍在变化时先不收口，等 ResizeObserver 把目标追平。
        const el = ref.current;
        if (!el || !sameHeight(contentHeight(el), targetRef.current)) return;
        settledRef.current = true;
        controls.set({ height: "auto" });
      }}
      style={{ overflow: "hidden" }}
    >
      <div ref={contentRef}>{shouldRender ? children : null}</div>
    </motion.div>
  );
}
