import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const G7_OpacityPulse: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const tween = gsap.to(box, {
      opacity: 0.2,
      duration: 1,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
    });

    return () => {
      tween.kill();
      gsap.set(box, { clearProps: 'all' });
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
      }}
    >
      <div
        ref={boxRef}
        style={{
          width: 120,
          height: 120,
          backgroundColor: '#06b6d4',
          borderRadius: 12,
          opacity: 1,
        }}
      />
    </div>
  );
};

export default G7_OpacityPulse;
