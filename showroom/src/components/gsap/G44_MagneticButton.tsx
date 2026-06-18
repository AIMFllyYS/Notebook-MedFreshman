import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const G44_MagneticButton: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const xToRef = useRef<gsap.QuickToFunc | null>(null);
  const yToRef = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const container = containerRef.current;
    if (!button || !container) return;

    const xTo = gsap.quickTo(button, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(button, "y", { duration: 0.4, ease: "power3.out" });

    xToRef.current = xTo;
    yToRef.current = yTo;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      const magnetRange = 150;

      if (distance < magnetRange) {
        const strength = 1 - distance / magnetRange;
        xTo(distX * strength * 0.6);
        yTo(distY * strength * 0.6);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = touch.clientX - centerX;
      const distY = touch.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      const magnetRange = 150;

      if (distance < magnetRange) {
        const strength = 1 - distance / magnetRange;
        xTo(distX * strength * 0.6);
        yTo(distY * strength * 0.6);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleMouseLeave);
      gsap.killTweensOf(button);
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
      }}
    >
      <button
        ref={buttonRef}
        style={{
          padding: "16px 40px",
          borderRadius: 50,
          border: "none",
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          color: "#fff",
          fontSize: 18,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(99, 102, 241, 0.4)",
          willChange: "transform",
        }}
      >
        磁性按钮
      </button>
    </div>
  );
};

export default G44_MagneticButton;
