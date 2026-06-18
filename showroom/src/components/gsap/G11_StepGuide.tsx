import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const G11_StepGuide: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [status, setStatus] = useState<string>('准备就绪');

  useEffect(() => {
    const step1 = step1Ref.current;
    const step2 = step2Ref.current;
    const step3 = step3Ref.current;
    const step4 = step4Ref.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const line3 = line3Ref.current;
    if (!step1 || !step2 || !step3 || !step4 || !line1 || !line2 || !line3) return;

    gsap.set([step1, step2, step3, step4], { opacity: 0, scale: 0.5, y: 20 });
    gsap.set([line1, line2, line3], { scaleX: 0, transformOrigin: 'left center' });

    const tl = gsap.timeline({
      paused: true,
      onStart: () => setStatus('动画开始'),
      onComplete: () => setStatus('动画完成'),
    });

    // 绝对位置参数：在特定时间点触发动画
    tl.to(step1, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, 0)
      .to(line1, { scaleX: 1, duration: 0.4, ease: 'power2.inOut' }, 0.5)
      .to(step2, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, 0.9)
      .to(line2, { scaleX: 1, duration: 0.4, ease: 'power2.inOut' }, 1.4)
      .to(step3, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, 1.8)
      .to(line3, { scaleX: 1, duration: 0.4, ease: 'power2.inOut' }, 2.3)
      .to(step4, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, 2.7);

    timelineRef.current = tl;

    return () => {
      tl.kill();
      gsap.set([step1, step2, step3, step4, line1, line2, line3], { clearProps: 'all' });
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
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>分步引导动画（绝对位置参数）</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {[step1Ref, step2Ref, step3Ref, step4Ref].map((ref, i) => (
          <React.Fragment key={i}>
            <div
              ref={ref}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: `hsl(${200 + i * 40}, 70%, 50%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {i + 1}
            </div>
            {i < 3 && (
              <div
                ref={[line1Ref, line2Ref, line3Ref][i]}
                style={{
                  width: 40,
                  height: 4,
                  background: '#475569',
                  borderRadius: 2,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 8 }}>状态: {status}</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
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

export default G11_StepGuide;
