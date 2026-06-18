import { useRef, useEffect } from "react";
import gsap from "gsap";

const items = Array.from({ length: 15 }, (_, i) => i + 1);

export default function G29_WaterfallLoad() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.from(itemRefs.current, {
        y: -40,
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        stagger: { amount: 0.8, from: "start" },
        ease: "power2.out",
      }).to(itemRefs.current, {
        y: 40,
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        stagger: { amount: 0.5, from: "start" },
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
          gridTemplateColumns: "repeat(5, 50px)",
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
              background: "#6366f1",
              color: "#fff",
              borderRadius: 8,
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
