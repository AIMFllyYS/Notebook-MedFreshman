import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const G34_ViewportTrigger: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      itemsRef.current.forEach((item) => {
        if (item) {
          gsap.fromTo(
            item,
            { opacity: 0, y: 80, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: item,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const items = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "300vh",
        backgroundColor: "#0f172a",
        padding: "100px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4rem",
      }}
    >
      <h2 style={{ color: "#ffffff", fontSize: "2rem", marginBottom: "2rem" }}>
        Viewport Trigger
      </h2>
      {items.map((i) => (
        <div
          key={i}
          ref={(el) => {
            itemsRef.current[i] = el;
          }}
          style={{
            width: "80%",
            maxWidth: 600,
            height: 200,
            borderRadius: 16,
            backgroundColor: `hsl(${210 + i * 20}, 70%, 50%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: "1.5rem",
            fontWeight: 600,
          }}
        >
          Card {i + 1}
        </div>
      ))}
    </div>
  );
};

export default G34_ViewportTrigger;
