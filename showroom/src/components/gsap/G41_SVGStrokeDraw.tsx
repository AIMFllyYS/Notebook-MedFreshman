import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const G41_SVGStrokeDraw: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    const container = containerRef.current;
    if (!path || !container) return;

    const length = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      fill: "transparent",
    });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
    tlRef.current = tl;

    tl.to(path, {
      strokeDashoffset: 0,
      duration: 2.5,
      ease: "power2.inOut",
    })
      .to(
        path,
        {
          fill: "#60a5fa",
          duration: 1,
          ease: "power2.out",
        },
        "-=0.5"
      )
      .to(
        path,
        {
          fill: "transparent",
          strokeDashoffset: length,
          duration: 1,
          ease: "power2.inOut",
        },
        "+=0.5"
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
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{ overflow: "visible" }}
      >
        <path
          ref={pathRef}
          d="M100,20 L180,180 L20,180 Z"
          stroke="#60a5fa"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="transparent"
        />
      </svg>
      <button
        onClick={handleReplay}
        style={{
          marginTop: 24,
          padding: "8px 16px",
          borderRadius: 6,
          border: "1px solid #60a5fa",
          background: "transparent",
          color: "#60a5fa",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        重新播放
      </button>
    </div>
  );
};

export default G41_SVGStrokeDraw;
