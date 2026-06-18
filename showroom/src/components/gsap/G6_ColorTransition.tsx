import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const G6_ColorTransition: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });

    tl.to(box, {
      backgroundColor: '#ef4444',
      duration: 1,
      ease: 'power2.inOut',
    })
      .to(box, {
        backgroundColor: '#10b981',
        duration: 1,
        ease: 'power2.inOut',
      })
      .to(box, {
        backgroundColor: '#3b82f6',
        duration: 1,
        ease: 'power2.inOut',
      })
      .to(box, {
        backgroundColor: '#f59e0b',
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
          backgroundColor: '#3b82f6',
          borderRadius: 12,
        }}
      />
    </div>
  );
};

export default G6_ColorTransition;
