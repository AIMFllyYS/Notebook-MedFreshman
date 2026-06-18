import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const G42_SVGShapeMorph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    const container = containerRef.current;
    if (!path || !container) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
    tlRef.current = tl;

    tl.to(path, {
      attr: {
        d: "M100,20 Q180,20 180,100 Q180,180 100,180 Q20,180 20,100 Q20,20 100,20 Z",
      },
      duration: 1.2,
      ease: "power2.inOut",
    })
      .to(path, {
        attr: {
          d: "M100,10 L120,80 L190,80 L135,125 L155,190 L100,150 L45,190 L65,125 L10,80 L80,80 Z",
        },
        duration: 1.2,
        ease: "power2.inOut",
      })
      .to(path, {
        attr: {
          d: "M100,20 L180,180 L20,180 Z",
        },
        duration: 1.2,
        ease: "power2.inOut",
      })
      .to(path, {
        attr: {
          d: "M100,20 Q180,20 180,100 Q180,180 100,180 Q20,180 20,100 Q20,20 100,20 Z",
        },
        duration: 1.2,
        ease: "power2.inOut",
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
        background: "#0f172a",
        position: "relative",
      }}
    >
      <svg width="220" height="220" viewBox="0 0 200 200">
        <path
          ref={pathRef}
          d="M100,20 Q180,20 180,100 Q180,180 100,180 Q20,180 20,100 Q20,20 100,20 Z"
          fill="#34d399"
          stroke="#10b981"
          strokeWidth="3"
        />
      </svg>
      <button
        onClick={handleReplay}
        style={{
          marginTop: 24,
          padding: "8px 16px",
          borderRadius: 6,
          border: "1px solid #34d399",
          background: "transparent",
          color: "#34d399",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        重新播放
      </button>
    </div>
  );
};

export default G42_SVGShapeMorph;
