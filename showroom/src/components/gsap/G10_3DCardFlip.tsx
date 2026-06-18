import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const G10_3DCardFlip: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    tl.to(card, {
      rotationY: 180,
      duration: 1.2,
      ease: 'power2.inOut',
    }).to(card, {
      rotationY: 360,
      duration: 1.2,
      ease: 'power2.inOut',
      delay: 0.5,
    });

    return () => {
      tl.kill();
      gsap.set(card, { clearProps: 'all' });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        perspective: 800,
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: 140,
          height: 180,
          backgroundColor: '#14b8a6',
          borderRadius: 12,
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 600,
          backfaceVisibility: 'hidden',
        }}
      >
        Card
      </div>
    </div>
  );
};

export default G10_3DCardFlip;
