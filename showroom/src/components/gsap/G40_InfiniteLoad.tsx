import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const G40_InfiniteLoad: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<number[]>(Array.from({ length: 12 }, (_, i) => i));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (sentinelRef.current) {
        ScrollTrigger.create({
          trigger: sentinelRef.current,
          start: "top bottom",
          onEnter: () => {
            if (loading) return;
            setLoading(true);
            setTimeout(() => {
              setItems((prev) => [
                ...prev,
                ...Array.from({ length: 8 }, (_, i) => prev.length + i),
              ]);
              setLoading(false);
              ScrollTrigger.refresh();
            }, 800);
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      const newCards = containerRef.current?.querySelectorAll<HTMLDivElement>(".card-new");
      if (newCards && newCards.length > 0) {
        gsap.fromTo(
          newCards,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
        );
        newCards.forEach((card) => card.classList.remove("card-new"));
      }
    }
  }, [items, loading]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        padding: "60px 20px",
      }}
    >
      <h2
        style={{
          color: "#ffffff",
          fontSize: "2rem",
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        Infinite Load
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1.5rem",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        {items.map((i) => (
          <div
            key={i}
            className="card-new"
            style={{
              height: 160,
              borderRadius: 16,
              backgroundColor: `hsl(${200 + (i % 20) * 10}, 60%, 35%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "1.2rem",
              fontWeight: 600,
            }}
          >
            Item {i + 1}
          </div>
        ))}
      </div>
      <div
        ref={sentinelRef}
        style={{
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "2rem",
        }}
      >
        {loading && (
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #334155",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default G40_InfiniteLoad;
