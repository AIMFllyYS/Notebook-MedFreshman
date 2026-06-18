import { useRef, useEffect } from "react";
import gsap from "gsap";

const items = Array.from({ length: 12 }, (_, i) => i + 1);

export default function G23_RandomOrder() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.from(itemRefs.current, {
        scale: 0,
        opacity: 0,
        rotation: -180,
        duration: 0.5,
        stagger: { from: "random", each: 0.05 },
        ease: "back.out(1.7)",
      }).to(itemRefs.current, {
        scale: 0,
        opacity: 0,
        rotation: 180,
        duration: 0.4,
        stagger: { from: "random", each: 0.04 },
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
          gridTemplateColumns: "repeat(4, 50px)",
          gridTemplateRows: "repeat(3, 50px)",
          gap: 10,
        }}
      >
        {items.map((num, i) => (
          <div
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            style={{
              width: 50,
              height: 50,
              background: "#f59e0b",
              color: "#fff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
