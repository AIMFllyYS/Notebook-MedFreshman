import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const G13_LabelJump: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxARef = useRef<HTMLDivElement>(null);
  const boxBRef = useRef<HTMLDivElement>(null);
  const boxCRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [activeLabel, setActiveLabel] = useState<string>('无');

  useEffect(() => {
    const boxA = boxARef.current;
    const boxB = boxBRef.current;
    const boxC = boxCRef.current;
    if (!boxA || !boxB || !boxC) return;

    gsap.set([boxA, boxB, boxC], { opacity: 0, x: -60, scale: 0.8 });

    const tl = gsap.timeline({ paused: true });

    tl.to(boxA, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'power3.out' })
      .addLabel('phaseB')
      .to(boxB, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'power3.out' })
      .addLabel('phaseC')
      .to(boxC, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'power3.out' })
      .addLabel('end');

    timelineRef.current = tl;

    return () => {
      tl.kill();
      gsap.set([boxA, boxB, boxC], { clearProps: 'all' });
    };
  }, []);

  const handlePlay = (): void => {
    setActiveLabel('从头播放');
    timelineRef.current?.restart();
  };

  const handleJumpToB = (): void => {
    setActiveLabel('phaseB');
    timelineRef.current?.play('phaseB');
  };

  const handleJumpToC = (): void => {
    setActiveLabel('phaseC');
    timelineRef.current?.play('phaseC');
  };

  const handleReset = (): void => {
    setActiveLabel('已重置');
    timelineRef.current?.pause(0);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#e2e8f0',
        gap: 24,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600 }}>标签跳转控制（addLabel + play("label")）</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 200 }}>
        {[
          { ref: boxARef, label: '阶段 A', color: '#3b82f6' },
          { ref: boxBRef, label: '阶段 B', color: '#8b5cf6' },
          { ref: boxCRef, label: '阶段 C', color: '#ec4899' },
        ].map((item, i) => (
          <div
            key={i}
            ref={item.ref}
            style={{
              padding: '16px 24px',
              borderRadius: 8,
              background: item.color,
              fontWeight: 700,
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8' }}>当前标签: {activeLabel}</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handlePlay}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          从头播放
        </button>
        <button
          onClick={handleJumpToB}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: 'none',
            background: '#8b5cf6',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          跳转到 phaseB
        </button>
        <button
          onClick={handleJumpToC}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: 'none',
            background: '#ec4899',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          跳转到 phaseC
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: 'none',
            background: '#475569',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          重置
        </button>
      </div>
    </div>
  );
};

export default G13_LabelJump;
