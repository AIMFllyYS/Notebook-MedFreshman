import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const G50_CinematicIntro: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const logo = logoRef.current;
    const subtitle = subtitleRef.current;
    if (!container || !overlay || !line1 || !line2 || !logo || !subtitle) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tlRef.current = tl;

    // Reset states
    tl.set([line1, line2], { scaleX: 0, opacity: 1 })
      .set(logo, { scale: 0.5, opacity: 0, rotation: -10 })
      .set(subtitle, { y: 30, opacity: 0 })
      .set(overlay, { opacity: 1 });

    // Phase 1: Cinematic bars slide in
    tl.to(line1, {
      scaleX: 1,
      duration: 1,
      ease: "power4.inOut",
      transformOrigin: "left center",
    })
      .to(
        line2,
        {
          scaleX: 1,
          duration: 1,
          ease: "power4.inOut",
          transformOrigin: "right center",
        },
        "<"
      )
      // Phase 2: Logo reveal with rotation
      .to(
        logo,
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 1.2,
          ease: "back.out(1.7)",
        },
        "-=0.3"
      )
      // Phase 3: Subtitle fade up
      .to(
        subtitle,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.5"
      )
      // Phase 4: Hold
      .to({}, { duration: 1.5 })
      // Phase 5: Exit
      .to([logo, subtitle], {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power2.in",
      })
      .to(
        line1,
        {
          scaleX: 0,
          duration: 0.8,
          ease: "power4.inOut",
          transformOrigin: "right center",
        },
        "<"
      )
      .to(
        line2,
        {
          scaleX: 0,
          duration: 0.8,
          ease: "power4.inOut",
          transformOrigin: "left center",
        },
        "<"
      )
      .to(overlay, {
        opacity: 0,
        duration: 0.5,
      });

    return () => {
      tl.kill();
    };
  }, []);

  const handleReplay = () => {
    if (tlRef.current) {
      tlRef.current.restart();
    }
  };

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
        background: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Cinematic overlay */}
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top bar */}
      <div
        ref={line1Ref}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "15%",
          background: "#0f172a",
          transform: "scaleX(0)",
          zIndex: 2,
        }}
      />

      {/* Bottom bar */}
      <div
        ref={line2Ref}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "15%",
          background: "#0f172a",
          transform: "scaleX(0)",
          zIndex: 2,
        }}
      />

      {/* Logo */}
      <div
        ref={logoRef}
        style={{
          fontSize: "clamp(32px, 6vw, 64px)",
          fontWeight: 900,
          color: "#f8fafc",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          zIndex: 3,
          textShadow: "0 0 40px rgba(99, 102, 241, 0.5)",
        }}
      >
        CINEMA
      </div>

      {/* Subtitle */}
      <div
        ref={subtitleRef}
        style={{
          marginTop: 16,
          fontSize: "clamp(14px, 2vw, 20px)",
          fontWeight: 300,
          color: "#94a3b8",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          zIndex: 3,
        }}
      >
        A GSAP Production
      </div>

      <button
        onClick={handleReplay}
        style={{
          position: "absolute",
          bottom: "20%",
          padding: "8px 16px",
          borderRadius: 6,
          border: "1px solid #94a3b8",
          background: "transparent",
          color: "#94a3b8",
          cursor: "pointer",
          fontSize: 14,
          zIndex: 3,
        }}
      >
        重新播放
      </button>
    </div>
  );
};

export default G50_CinematicIntro;
