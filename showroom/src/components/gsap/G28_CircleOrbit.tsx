import { useRef, useEffect } from "react";
import gsap from "gsap";

const COUNT = 8;
const RADIUS = 80;

export default function G28_CircleOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.from(dotRefs.current, {
        x: 0,
        y: 0,
        opacity: 0,
        scale: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "back.out(1.7)",
      }).to(dotRefs.current, {
        x: (i) => Math.cos((i / COUNT) * Math.PI * 2) * RADIUS,
        y: (i) => Math.sin((i / COUNT) * Math.PI * 2) * RADIUS,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: "power2.out",
      }, "<").to(dotRefs.current, {
        x: 0,
        y: 0,
        opacity: 0,
        scale: 0,
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
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", width: RADIUS * 2, height: RADIUS * 2 }}>
        {Array.from({ length: COUNT }, (_, i) => (
          <div
            key={i}
            ref={(el) => { dotRefs.current[i] = el; }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
              background: "#06b6d4",
              borderRadius: "50%",
              opacity: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
