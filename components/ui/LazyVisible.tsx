"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  rootMargin?: string;
  placeholder?: ReactNode;
}

/**
 * 视口懒加载容器：子组件仅在滚动到视口附近时才挂载。
 * 一旦可见就保持挂载（不会卸载），避免状态丢失。
 */
export default function LazyVisible({ children, rootMargin = "200px", placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? children : (placeholder ?? <div className="h-40" />)}
    </div>
  );
}
