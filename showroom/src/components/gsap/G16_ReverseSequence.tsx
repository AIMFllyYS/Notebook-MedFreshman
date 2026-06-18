import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const G16_ReverseSequence: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [status, setStatus] = useState<string>('准备就绪');

  useEffect(() => {
    const targets = boxRefs.current.filter(Boolean) as HTMLDivElement[];
    if (targets.length === 0) return;

    gsap.set(targets, { opacity: 0, y: 40, rotation: -90 });

    const tl = gsap.timeline({
      paused: true,
      repeat: 2,
      yoyo: true,
      onStart: () => setStatus('Yoyo 动画开始'),
      onRepeat: () => setStatus((prev) => (prev.includes('反向') ? '正向播放' : '反向播放')),
      onComplete: () => setStatus('动画完成'),
    });

    targets.forEach((el, i) => {
      tl.to(el, { opacity: 1, y: 0, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }, i * 0.15);
    });

    timelineRef.current = tl;

    return () => {
      tl.kill();
      gsap.set(targets, { clearProps: 'all' });
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
      <div style={{ fontSize: 18, fontWeight: 600 }}>反向播放序列（yoyo + repeat）</div>
      <div style={{ display: 'flex', gap: 14 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { boxRefs.current[i] = el; }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 10,
              background: `hsl(${200 + i * 35}, 70%, 55%)`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          />
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

export default G16_ReverseSequence;
