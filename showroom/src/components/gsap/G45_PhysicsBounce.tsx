import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const G45_PhysicsBounce: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const ball = ballRef.current;
    const shadow = shadowRef.current;
    if (!ball || !shadow) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
    tlRef.current = tl;

    // Drop
    tl.fromTo(
      ball,
      { y: -200 },
      {
        y: 0,
        duration: 1,
        ease: "bounce.out",
      }
    )
      // Shadow scale
      .fromTo(
        shadow,
        { scale: 0.3, opacity: 0.2 },
        {
          scale: 1,
          opacity: 0.6,
          duration: 1,
          ease: "bounce.out",
        },
        "<"
      )
      // Squash on impact
      .to(ball, {
        scaleX: 1.3,
        scaleY: 0.7,
        duration: 0.1,
        ease: "power2.out",
      })
      .to(ball, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.3,
        ease: "elastic.out(1, 0.3)",
      })
      // Small bounces
      .to(ball, {
        y: -40,
        duration: 0.3,
        ease: "power2.out",
      })
      .to(ball, {
        y: 0,
        duration: 0.3,
        ease: "bounce.out",
      })
      .to(
        shadow,
        {
          scale: 0.8,
          opacity: 0.4,
          duration: 0.3,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        },
        "-=0.6"
      )
      // Settle
      .to(ball, {
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      })
      .to(
        shadow,
        {
          scale: 1,
          opacity: 0.6,
          duration: 0.5,
        },
        "<"
      );

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
        background: "#0f172a",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 120,
          height: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <div
          ref={ballRef}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #fbbf24, #d97706)",
            boxShadow: "0 4px 20px rgba(251, 191, 36, 0.4)",
            willChange: "transform",
            zIndex: 2,
          }}
        />
        <div
          ref={shadowRef}
          style={{
            width: 80,
            height: 16,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.5)",
            marginTop: 8,
            filter: "blur(4px)",
            willChange: "transform",
            zIndex: 1,
          }}
        />
      </div>
      <button
        onClick={handleReplay}
        style={{
          marginTop: 24,
          padding: "8px 16px",
          borderRadius: 6,
          border: "1px solid #fbbf24",
          background: "transparent",
          color: "#fbbf24",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        重新播放
      </button>
    </div>
  );
};

export default G45_PhysicsBounce;
