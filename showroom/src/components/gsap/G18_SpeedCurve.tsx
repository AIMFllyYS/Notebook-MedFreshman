import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const G18_SpeedCurve: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const box1Ref = useRef<HTMLDivElement>(null);
  const box2Ref = useRef<HTMLDivElement>(null);
  const box3Ref = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [status, setStatus] = useState<string>('准备就绪');

  useEffect(() => {
    const b1 = box1Ref.current;
    const b2 = box2Ref.current;
    const b3 = box3Ref.current;
    if (!b1 || !b2 || !b3) return;

    gsap.set([b1, b2, b3], { x: -100, opacity: 0 });

    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 1.2, ease: 'power2.inOut' },
      onStart: () => setStatus('动画开始'),
      onComplete: () => setStatus('动画完成'),
    });

    // timeline.defaults 设置默认 ease，单独覆盖
    tl.to(b1, { x: 100, opacity: 1 })
      .to(b2, { x: 100, opacity: 1, ease: 'elastic.out(1, 0.4)' }, '-=0.6')
      .to(b3, { x: 100, opacity: 1, ease: 'back.out(1.7)' }, '-=0.6');

    timelineRef.current = tl;

    return () => {
      tl.kill();
      gsap.set([b1, b2, b3], { clearProps: 'all' });
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
      <div style={{ fontSize: 18, fontWeight: 600 }}>速度曲线变速（defaults + 单独覆盖 ease）</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 240 }}>
        {[
          { ref: box1Ref, color: '#3b82f6', label: '默认 power2.inOut' },
          { ref: box2Ref, color: '#10b981', label: '覆盖 elastic.out' },
          { ref: box3Ref, color: '#f59e0b', label: '覆盖 back.out' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.label}</div>
            <div
              style={{
                width: '100%',
                height: 40,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <div
                ref={item.ref}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: item.color,
                  position: 'absolute',
                  left: 'calc(50% - 20px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              />
            </div>
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

export default G18_SpeedCurve;
