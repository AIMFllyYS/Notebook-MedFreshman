import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const G32_PinSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pinRef.current && contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            scrollTrigger: {
              trigger: pinRef.current,
              start: "top top",
              end: "+=500",
              pin: true,
              pinSpacing: true,
              scrub: 1,
            },
          }
        );
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
      }}
    >
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: "1.5rem",
        }}
      >
        Scroll down to pin
      </div>
      <div
        ref={pinRef}
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1e293b",
        }}
      >
        <div
          ref={contentRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
            }}
          />
          <h2 style={{ color: "#ffffff", fontSize: "2.5rem", margin: 0 }}>
            Pinned Section
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "1.2rem", maxWidth: 500, textAlign: "center" }}>
            This section is pinned while content animates in.
          </p>
        </div>
      </div>
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: "1.5rem",
        }}
      >
        Scroll continues
      </div>
    </div>
  );
};

export default G32_PinSection;
