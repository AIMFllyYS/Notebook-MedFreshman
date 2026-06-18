import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const G9_DimensionExpand: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    tl.from(box, {
      width: 0,
      height: 0,
      duration: 1.2,
      ease: 'power2.inOut',
    }).to(box, {
      width: 0,
      height: 0,
      duration: 1,
      ease: 'power2.inOut',
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
          width: 160,
          height: 100,
          backgroundColor: '#6366f1',
          borderRadius: 12,
        }}
      />
    </div>
  );
};

export default G9_DimensionExpand;
