import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const G35_ScrollTextColor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (textRef.current) {
        const chars = textRef.current.querySelectorAll<HTMLSpanElement>(".char");
        gsap.fromTo(
          chars,
          { color: "#475569" },
          {
            color: "#3b82f6",
            stagger: 0.05,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top center",
              end: "bottom center",
              scrub: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const text = "SCROLL TO CHANGE COLOR";

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
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 2rem",
        }}
      >
        <div
          ref={textRef}
          style={{
            fontSize: "clamp(2rem, 6vw, 5rem)",
            fontWeight: 800,
            lineHeight: 1.2,
            textAlign: "center",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.3em",
          }}
        >
          {text.split(" ").map((word, wi) => (
            <span key={wi} style={{ display: "flex", gap: "0.05em" }}>
              {word.split("").map((char, ci) => (
                <span key={ci} className="char" style={{ color: "#475569" }}>
                  {char}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default G35_ScrollTextColor;
