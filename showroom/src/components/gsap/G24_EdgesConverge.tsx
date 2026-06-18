import { useRef, useEffect } from "react";
import gsap from "gsap";

const items = Array.from({ length: 9 }, (_, i) => i + 1);

export default function G24_EdgesConverge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.from(itemRefs.current, {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: { from: "edges", amount: 0.4 },
        ease: "power2.out",
      }).to(itemRefs.current, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        stagger: { from: "edges", amount: 0.3 },
        delay: 1,
        ease: "power2.in",
      });
    }, containerRef);

    return () => ctx.revert();
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
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 70px)",
          gridTemplateRows: "repeat(3, 70px)",
          gap: 14,
        }}
      >
        {items.map((num, i) => (
          <div
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            style={{
              width: 70,
              height: 70,
              background: "#10b981",
              color: "#fff",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
