import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const G36_HorizontalScroll: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (trackRef.current) {
        const scrollWidth = trackRef.current.scrollWidth - window.innerWidth;
        gsap.to(trackRef.current, {
          x: -scrollWidth,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: () => `+=${scrollWidth}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const panels = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#0f172a",
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          width: "fit-content",
          height: "100%",
        }}
      >
        {panels.map((i) => (
          <div
            key={i}
            style={{
              width: "100vw",
              height: "100%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `hsl(${210 + i * 15}, 60%, ${15 + i * 3}%)`,
            }}
          >
            <div
              style={{
                color: "#ffffff",
                fontSize: "3rem",
                fontWeight: 700,
              }}
            >
              Panel {i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default G36_HorizontalScroll;
