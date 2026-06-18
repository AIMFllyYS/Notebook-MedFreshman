import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const G2_ElasticScale: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

    tl.from(box, {
      scale: 0,
      duration: 1.2,
      ease: 'elastic.out(1, 0.3)',
    }).to(box, {
      scale: 0,
      duration: 0.5,
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
          backgroundColor: '#10b981',
          borderRadius: 12,
        }}
      />
    </div>
  );
};

export default G2_ElasticScale;
