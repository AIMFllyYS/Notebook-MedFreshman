import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const G46_Cube3DRotate: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
    tlRef.current = tl;

    tl.to(cube, {
      rotationY: 360,
      rotationX: 360,
      duration: 4,
      ease: "power1.inOut",
    })
      .to(cube, {
        rotationY: 720,
        rotationX: 0,
        duration: 4,
        ease: "power1.inOut",
      })
      .to(cube, {
        rotationY: 1080,
        rotationX: 360,
        duration: 4,
        ease: "power1.inOut",
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

  const faceStyle: React.CSSProperties = {
    position: "absolute",
    width: 120,
    height: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
    border: "2px solid rgba(255,255,255,0.2)",
    backfaceVisibility: "visible",
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
        perspective: 800,
      }}
    >
      <div
        ref={cubeRef}
        style={{
          width: 120,
          height: 120,
          position: "relative",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <div
          style={{
            ...faceStyle,
            background: "rgba(239, 68, 68, 0.8)",
            transform: "translateZ(60px)",
          }}
        >
          前
        </div>
        <div
          style={{
            ...faceStyle,
            background: "rgba(59, 130, 246, 0.8)",
            transform: "rotateY(180deg) translateZ(60px)",
          }}
        >
          后
        </div>
        <div
          style={{
            ...faceStyle,
            background: "rgba(34, 197, 94, 0.8)",
            transform: "rotateY(90deg) translateZ(60px)",
          }}
        >
          右
        </div>
        <div
          style={{
            ...faceStyle,
            background: "rgba(234, 179, 8, 0.8)",
            transform: "rotateY(-90deg) translateZ(60px)",
          }}
        >
          左
        </div>
        <div
          style={{
            ...faceStyle,
            background: "rgba(168, 85, 247, 0.8)",
            transform: "rotateX(90deg) translateZ(60px)",
          }}
        >
          上
        </div>
        <div
          style={{
            ...faceStyle,
            background: "rgba(236, 72, 153, 0.8)",
            transform: "rotateX(-90deg) translateZ(60px)",
          }}
        >
          下
        </div>
      </div>
      <button
        onClick={handleReplay}
        style={{
          marginTop: 40,
          padding: "8px 16px",
          borderRadius: 6,
          border: "1px solid #a855f7",
          background: "transparent",
          color: "#a855f7",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        重新播放
      </button>
    </div>
  );
};

export default G46_Cube3DRotate;
