import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const G8_BorderRadiusMorph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });

    tl.to(box, {
      borderRadius: '50%',
      duration: 1,
      ease: 'power2.inOut',
    }).to(box, {
      borderRadius: 4,
      duration: 1,
      ease: 'power2.inOut',
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
          backgroundColor: '#ec4899',
          borderRadius: 4,
        }}
      />
    </div>
  );
};

export default G8_BorderRadiusMorph;
