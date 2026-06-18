import { useRef, useEffect } from "react";
import gsap from "gsap";

const ROWS = 5;
const COLS = 5;
const items = Array.from({ length: ROWS * COLS }, (_, i) => i + 1);

export default function G25_GridWave() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.from(itemRefs.current, {
        scale: 0,
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: { grid: [COLS, ROWS], from: "center", axis: "y", amount: 0.6 },
        ease: "power2.out",
      }).to(itemRefs.current, {
        scale: 0,
        opacity: 0,
        y: -20,
        duration: 0.4,
        stagger: { grid: [COLS, ROWS], from: "center", axis: "y", amount: 0.4 },
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
          gridTemplateColumns: `repeat(${COLS}, 40px)`,
          gridTemplateRows: `repeat(${ROWS}, 40px)`,
          gap: 8,
        }}
      >
        {items.map((num, i) => (
          <div
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            style={{
              width: 40,
              height: 40,
              background: "#ec4899",
              color: "#fff",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
