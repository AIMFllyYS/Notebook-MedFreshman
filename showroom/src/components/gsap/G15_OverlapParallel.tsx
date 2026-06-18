import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const G15_OverlapParallel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bar1Ref = useRef<HTMLDivElement>(null);
  const bar2Ref = useRef<HTMLDivElement>(null);
  const bar3Ref = useRef<HTMLDivElement>(null);
  const bar4Ref = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [status, setStatus] = useState<string>('准备就绪');

  useEffect(() => {
    const b1 = bar1Ref.current;
    const b2 = bar2Ref.current;
    const b3 = bar3Ref.current;
    const b4 = bar4Ref.current;
    if (!b1 || !b2 || !b3 || !b4) return;

    gsap.set([b1, b2, b3, b4], { scaleX: 0, transformOrigin: 'left center' });

    const tl = gsap.timeline({
      paused: true,
      onStart: () => setStatus('动画开始'),
      onComplete: () => setStatus('动画完成'),
    });

    // 使用位置参数 "<" 和 "<0.3" 实现重叠并行动画
    tl.to(b1, { scaleX: 1, duration: 1.2, ease: 'power2.out' })
      .to(b2, { scaleX: 1, duration: 1.0, ease: 'power2.out' }, '<')
      .to(b3, { scaleX: 1, duration: 1.0, ease: 'power2.out' }, '<0.3')
      .to(b4, { scaleX: 1, duration: 1.0, ease: 'power2.out' }, '<0.3');

    timelineRef.current = tl;

    return () => {
      tl.kill();
      gsap.set([b1, b2, b3, b4], { clearProps: 'all' });
    };
  }, []);

  const handlePlay = (): void => {
    timelineRef.current?.restart();
  };

  const handlePause = (): void => {
    timelineRef.current?.pause();
    setStatus('已暂停');
  };

  const handleResume = (): void => {
    timelineRef.current?.resume();
    setStatus('播放中');
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
      <div style={{ fontSize: 18, fontWeight: 600 }}>重叠并行动画（位置参数 "&lt;" 和 "&lt;0.3"）</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
        {[
          { ref: bar1Ref, color: '#3b82f6', label: 'Bar 1 (起点)' },
          { ref: bar2Ref, color: '#10b981', label: 'Bar 2 (< 同时)' },
          { ref: bar3Ref, color: '#f59e0b', label: 'Bar 3 (<0.3 重叠)' },
          { ref: bar4Ref, color: '#ef4444', label: 'Bar 4 (<0.3 重叠)' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.label}</div>
            <div
              ref={item.ref}
              style={{
                width: '100%',
                height: 24,
                borderRadius: 6,
                background: item.color,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8' }}>状态: {status}</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={handlePlay}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          播放 / 重启
        </button>
        <button
          onClick={handlePause}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#ef4444',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          暂停
        </button>
        <button
          onClick={handleResume}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#10b981',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          恢复
        </button>
      </div>
    </div>
  );
};

export default G15_OverlapParallel;
