import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const G33_ProgressDrive: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (boxRef.current) {
        gsap.to(boxRef.current, {
          y: 400,
          rotation: 360,
          scale: 1.5,
          backgroundColor: "#8b5cf6",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: 1,
          },
        });
      }

      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: 1,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "300vh",
        backgroundColor: "#0f172a",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        <div
          style={{
            width: "80%",
            height: 8,
            backgroundColor: "#334155",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            ref={progressRef}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#3b82f6",
              transformOrigin: "left",
              transform: "scaleX(0)",
            }}
          />
        </div>
        <div
          ref={boxRef}
          style={{
            width: 100,
            height: 100,
            borderRadius: 16,
            backgroundColor: "#3b82f6",
          }}
        />
        <p style={{ color: "#94a3b8", fontSize: "1.2rem" }}>
          Scroll to drive the animation
        </p>
      </div>
    </div>
  );
};

export default G33_ProgressDrive;
