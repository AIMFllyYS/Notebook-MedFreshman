import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const barCount = 20;

const G48_AudioVisualizer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement[]>([]);
  const tweensRef = useRef<gsap.core.Tween[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const bars = barsRef.current;
    if (bars.length === 0) return;

    const animateBars = () => {
      bars.forEach((bar, i) => {
        const height = Math.random() * 160 + 20;
        const tween = gsap.to(bar, {
          height,
          duration: 0.3,
          ease: "power2.out",
          delay: i * 0.02,
        });
        tweensRef.current.push(tween);
      });
    };

    animateBars();
    intervalRef.current = setInterval(animateBars, 400);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      tweensRef.current.forEach((t) => t.kill());
      tweensRef.current = [];
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
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          height: 200,
        }}
      >
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) barsRef.current[i] = el;
            }}
            style={{
              width: 12,
              height: 20,
              borderRadius: 6,
              background: `hsl(${200 + (i / barCount) * 60}, 80%, 60%)`,
              willChange: "height",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default G48_AudioVisualizer;
