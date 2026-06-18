import { useRef, useEffect } from "react";
import gsap from "gsap";

const TEXT = "Hello GSAP!";

export default function G26_TextTypewriter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
      tl.from(charRefs.current, {
        opacity: 0,
        y: 10,
        duration: 0.05,
        stagger: { each: 0.03 },
        ease: "power1.out",
      }).to(charRefs.current, {
        opacity: 0,
        y: -10,
        duration: 0.03,
        stagger: { each: 0.02 },
        delay: 1.5,
        ease: "power1.in",
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
      <div style={{ fontSize: 40, fontWeight: 700, color: "#1f2937" }}>
        {TEXT.split("").map((char, i) => (
          <span
            key={i}
            ref={(el) => { charRefs.current[i] = el; }}
            style={{ display: "inline-block", opacity: 0, minWidth: char === " " ? 12 : undefined }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    </div>
  );
}
