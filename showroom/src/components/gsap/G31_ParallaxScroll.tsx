import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const G31_ParallaxScroll: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 50,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (textRef.current) {
        gsap.to(textRef.current, {
          yPercent: -30,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
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
        height: "200vh",
        overflow: "hidden",
        backgroundColor: "#0f172a",
      }}
    >
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          top: "-25%",
          left: 0,
          width: "100%",
          height: "150%",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #3b82f6 0%, transparent 40%), radial-gradient(circle at 80% 70%, #8b5cf6 0%, transparent 40%)",
          backgroundSize: "cover",
          zIndex: 1,
        }}
      />
      <div
        ref={textRef}
        style={{
          position: "sticky",
          top: "40%",
          textAlign: "center",
          zIndex: 2,
          color: "#ffffff",
          fontSize: "3rem",
          fontWeight: 700,
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        Parallax Scroll
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          color: "#94a3b8",
          fontSize: "1.2rem",
          zIndex: 2,
        }}
      >
        Scroll down to see the parallax effect
      </div>
    </div>
  );
};

export default G31_ParallaxScroll;
