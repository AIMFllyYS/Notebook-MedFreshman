import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const trailCount = 12;

const G49_MouseTrail: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);
  const xToRefs = useRef<gsap.QuickToFunc[]>([]);
  const yToRefs = useRef<gsap.QuickToFunc[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dots = dotsRef.current;

    dots.forEach((dot, i) => {
      const delay = i * 0.04;
      const xTo = gsap.quickTo(dot, "x", {
        duration: 0.4,
        ease: "power3.out",
        delay,
      });
      const yTo = gsap.quickTo(dot, "y", {
        duration: 0.4,
        ease: "power3.out",
        delay,
      });
      xToRefs.current[i] = xTo;
      yToRefs.current[i] = yTo;
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      xToRefs.current.forEach((xTo) => xTo(x));
      yToRefs.current.forEach((yTo) => yTo(y));
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      xToRefs.current.forEach((xTo) => xTo(x));
      yToRefs.current.forEach((yTo) => yTo(y));
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("touchmove", handleTouchMove);
      dotsRef.current.forEach((dot) => {
        if (dot) gsap.killTweensOf(dot);
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        position: "relative",
        overflow: "hidden",
        cursor: "crosshair",
      }}
    >
      <div
        style={{
          position: "absolute",
          color: "#475569",
          fontSize: 18,
          fontWeight: 600,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        移动鼠标或触摸屏幕
      </div>
      {Array.from({ length: trailCount }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) dotsRef.current[i] = el;
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 16 - i * 1,
            height: 16 - i * 1,
            borderRadius: "50%",
            background: `hsl(${320 + i * 8}, 80%, 60%)`,
            opacity: 1 - i * 0.07,
            pointerEvents: "none",
            willChange: "transform",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
};

export default G49_MouseTrail;
