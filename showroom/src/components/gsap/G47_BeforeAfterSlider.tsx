import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";

const G47_BeforeAfterSlider: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const xToRef = useRef<gsap.QuickToFunc | null>(null);
  const handleXToRef = useRef<gsap.QuickToFunc | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const after = afterRef.current;
    const handle = handleRef.current;
    const container = containerRef.current;
    if (!after || !handle || !container) return;

    const xTo = gsap.quickTo(after, "width", {
      duration: 0.3,
      ease: "power3.out",
    });
    const handleXTo = gsap.quickTo(handle, "x", {
      duration: 0.3,
      ease: "power3.out",
    });

    xToRef.current = xTo;
    handleXToRef.current = handleXTo;

    const updatePosition = (clientX: number) => {
      const rect = container.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      xTo(x);
      handleXTo(x);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      updatePosition(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
      gsap.killTweensOf(after);
      gsap.killTweensOf(handle);
    };
  }, [isDragging]);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    xToRef.current?.(x);
    handleXToRef.current?.(x);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

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
      <div
        style={{
          position: "relative",
          width: "80%",
          maxWidth: 600,
          height: 300,
          borderRadius: 12,
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Before */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #1e3a5f, #0f172a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          BEFORE
        </div>
        {/* After */}
        <div
          ref={afterRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "50%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: "100vw",
              maxWidth: 600,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            AFTER
          </div>
        </div>
        {/* Handle */}
        <div
          ref={handleRef}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 4,
            background: "#fff",
            transform: "translateX(-50%)",
            x: "50%",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ opacity: 0.6 }}
            >
              <path
                d="M5 4L2 8L5 12M11 4L14 8L11 12"
                stroke="#0f172a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default G47_BeforeAfterSlider;
