import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const G5_SkewAppear: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    tl.from(box, {
      skewX: 60,
      skewY: 20,
      autoAlpha: 0,
      duration: 1.2,
      ease: 'power2.out',
    }).to(box, {
      skewX: -60,
      skewY: -20,
      autoAlpha: 0,
      duration: 1,
      ease: 'power2.in',
      delay: 0.5,
    });

    return () => {
      tl.kill();
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
          backgroundColor: '#8b5cf6',
          borderRadius: 12,
          visibility: 'hidden',
        }}
      />
    </div>
  );
};

export default G5_SkewAppear;
