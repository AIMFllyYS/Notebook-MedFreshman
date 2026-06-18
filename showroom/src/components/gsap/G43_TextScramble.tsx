import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

const G43_TextScramble: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const targetText = "GSAP SCRAMBLE";

  const playScramble = () => {
    if (!textRef.current || isPlaying) return;
    setIsPlaying(true);

    const obj = { progress: 0 };
    const el = textRef.current;

    const tween = gsap.to(obj, {
      progress: 1,
      duration: 2.5,
      ease: "power2.out",
      onUpdate: () => {
        const progress = obj.progress;
        let result = "";
        for (let i = 0; i < targetText.length; i++) {
          if (targetText[i] === " ") {
            result += " ";
            continue;
          }
          const charProgress = (i + 1) / targetText.length;
          if (progress >= charProgress) {
            result += targetText[i];
          } else {
            result += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        el.textContent = result;
      },
      onComplete: () => {
        el.textContent = targetText;
        setIsPlaying(false);
      },
    });

    tweenRef.current = tween;
  };

  useEffect(() => {
    playScramble();

    const interval = setInterval(() => {
      playScramble();
    }, 5000);

    return () => {
      clearInterval(interval);
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
    };
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
        background: "#0f172a",
        position: "relative",
      }}
    >
      <span
        ref={textRef}
        style={{
          fontSize: "clamp(24px, 5vw, 48px)",
          fontWeight: 700,
          fontFamily: "monospace",
          color: "#f472b6",
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
        }}
      >
        GSAP SCRAMBLE
      </span>
      <button
        onClick={playScramble}
        disabled={isPlaying}
        style={{
          marginTop: 24,
          padding: "8px 16px",
          borderRadius: 6,
          border: "1px solid #f472b6",
          background: "transparent",
          color: "#f472b6",
          cursor: isPlaying ? "not-allowed" : "pointer",
          fontSize: 14,
          opacity: isPlaying ? 0.5 : 1,
        }}
      >
        重新播放
      </button>
    </div>
  );
};

export default G43_TextScramble;
