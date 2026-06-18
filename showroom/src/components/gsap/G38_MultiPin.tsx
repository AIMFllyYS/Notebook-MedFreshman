import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const G38_MultiPin: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      sectionsRef.current.forEach((section) => {
        if (section) {
          const content = section.querySelector<HTMLDivElement>(".pin-content");
          if (content) {
            gsap.fromTo(
              content,
              { opacity: 0, y: 50 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                scrollTrigger: {
                  trigger: section,
                  start: "top top",
                  end: "+=400",
                  pin: true,
                  pinSpacing: true,
                  scrub: 1,
                },
              }
            );
          }
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const colors = ["#1e3a5f", "#2d5a3d", "#5a3d2d", "#3d2d5a"];
  const titles = ["Section One", "Section Two", "Section Three", "Section Four"];

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "#0f172a",
      }}
    >
      {colors.map((color, i) => (
        <div
          key={i}
          ref={(el) => {
            sectionsRef.current[i] = el;
          }}
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: color,
          }}
        >
          <div
            className="pin-content"
            style={{
              textAlign: "center",
              color: "#ffffff",
            }}
          >
            <h2 style={{ fontSize: "3rem", margin: "0 0 1rem" }}>{titles[i]}</h2>
            <p style={{ fontSize: "1.2rem", color: "#cbd5e1" }}>
              Pinned section {i + 1} of 4
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default G38_MultiPin;
