import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const G37_ScrollZoomReveal: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { scale: 0.6 },
          {
            scale: 1.2,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 1 },
          {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "center center",
              scrub: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "300vh",
        backgroundColor: "#0f172a",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          ref={imageRef}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage:
              "radial-gradient(circle at 50% 50%, #3b82f6 0%, #1e1b4b 60%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#0f172a",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 3,
            color: "#ffffff",
            fontSize: "3rem",
            fontWeight: 700,
            textAlign: "center",
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          Zoom Reveal
        </div>
      </div>
    </div>
  );
};

export default G37_ScrollZoomReveal;
