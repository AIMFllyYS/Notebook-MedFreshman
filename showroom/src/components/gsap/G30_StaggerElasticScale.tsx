import { useRef, useEffect } from "react";
import gsap from "gsap";

const items = Array.from({ length: 12 }, (_, i) => i + 1);

export default function G30_StaggerElasticScale() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.from(itemRefs.current, {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "back.out(2)",
      }).to(itemRefs.current, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        stagger: 0.03,
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
          gridTemplateColumns: "repeat(4, 55px)",
          gridTemplateRows: "repeat(3, 55px)",
          gap: 10,
        }}
      >
        {items.map((num, i) => (
          <div
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            style={{
              width: 55,
              height: 55,
              background: "#ef4444",
              color: "#fff",
              borderRadius: 10,
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
