import { useRef, useEffect } from "react";
import gsap from "gsap";

const cards = ["A", "2", "3", "4", "5"];

export default function G27_CardFan() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.from(cardRefs.current, {
        x: 0,
        rotation: 0,
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
      }).to(cardRefs.current, {
        x: (i) => (i - Math.floor(cards.length / 2)) * 60,
        rotation: (i) => (i - Math.floor(cards.length / 2)) * 15,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      }, "<").to(cardRefs.current, {
        x: 0,
        rotation: 0,
        opacity: 0,
        scale: 0.8,
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
      <div style={{ position: "relative", width: 200, height: 120 }}>
        {cards.map((label, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 70,
              height: 100,
              marginLeft: -35,
              marginTop: -50,
              background: "#fff",
              border: "2px solid #1f2937",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              color: "#1f2937",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              opacity: 0,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
