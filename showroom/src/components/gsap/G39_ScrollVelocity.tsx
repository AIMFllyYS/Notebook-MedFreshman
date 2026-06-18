import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const G39_ScrollVelocity: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const velocityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      let currentVelocity = 0;

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          currentVelocity = self.getVelocity();
          const normalized = Math.min(Math.abs(currentVelocity) / 1000, 1);

          if (boxRef.current) {
            gsap.to(boxRef.current, {
              skewX: currentVelocity / 300,
              scale: 1 + normalized * 0.2,
              duration: 0.3,
              ease: "power2.out",
            });
          }

          if (velocityRef.current) {
            velocityRef.current.textContent = `Velocity: ${Math.round(
              currentVelocity
            )}`;
          }
        },
      });

      return () => {
        st.kill();
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "400vh",
        backgroundColor: "#0f172a",
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
          ref={boxRef}
          style={{
            width: 150,
            height: 150,
            borderRadius: 24,
            backgroundColor: "#3b82f6",
            willChange: "transform",
          }}
        />
        <div
          ref={velocityRef}
          style={{
            color: "#94a3b8",
            fontSize: "1.2rem",
            fontFamily: "monospace",
          }}
        >
          Velocity: 0
        </div>
        <p style={{ color: "#64748b", fontSize: "1rem" }}>
          Scroll fast to see the effect
        </p>
      </div>
    </div>
  );
};

export default G39_ScrollVelocity;
