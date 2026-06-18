import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const G4_RotateIn: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    tl.from(box, {
      rotation: -360,
      duration: 1.5,
      ease: 'back.out(1.7)',
    }).to(box, {
      rotation: 360,
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
          backgroundColor: '#ef4444',
          borderRadius: 12,
        }}
      />
    </div>
  );
};

export default G4_RotateIn;
