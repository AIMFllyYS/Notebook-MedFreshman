import { useRef, useEffect } from "react";
import gsap from "gsap";

const items = Array.from({ length: 9 }, (_, i) => i + 1);

export default function G22_CenterSpread() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.from(itemRefs.current, {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: { from: "center", amount: 0.5 },
        ease: "back.out(1.7)",
      }).to(itemRefs.current, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        stagger: { from: "center", amount: 0.3 },
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
          gridTemplateColumns: "repeat(3, 60px)",
          gridTemplateRows: "repeat(3, 60px)",
          gap: 12,
        }}
      >
        {items.map((num, i) => (
          <div
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            style={{
              width: 60,
              height: 60,
              background: "#8b5cf6",
              color: "#fff",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
