import { useRef, useEffect } from "react";
import gsap from "gsap";

const items = Array.from({ length: 8 }, (_, i) => `Item ${i + 1}`);

export default function G21_ListStaggerFade() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.from(itemRefs.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      }).to(itemRefs.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        stagger: 0.05,
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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      {items.map((text, i) => (
        <div
          key={i}
          ref={(el) => { itemRefs.current[i] = el; }}
          style={{
            width: 200,
            padding: "12px 20px",
            background: "#3b82f6",
            color: "#fff",
            borderRadius: 8,
            textAlign: "center",
            fontWeight: 600,
            opacity: 0,
          }}
        >
          {text}
        </div>
      ))}
    </div>
  );
}
