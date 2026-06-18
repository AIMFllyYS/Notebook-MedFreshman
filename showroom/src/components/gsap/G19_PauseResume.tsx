import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const G19_PauseResume: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [status, setStatus] = useState<string>('准备就绪');

  useEffect(() => {
    const ball = ballRef.current;
    const shadow = shadowRef.current;
    if (!ball || !shadow) return;

    gsap.set(ball, { y: -120, opacity: 0 });
    gsap.set(shadow, { scale: 0.3, opacity: 0 });

    const tl = gsap.timeline({
      paused: true,
      repeat: -1,
      yoyo: true,
      onStart: () => setStatus('动画开始'),
      onComplete: () => setStatus('动画完成'),
    });

    tl.to(ball, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.in' })
      .to(ball, { y: -120, duration: 0.8, ease: 'power2.out' }, '+=0.1')
      .to(shadow, { scale: 1, opacity: 0.4, duration: 0.8, ease: 'power2.in' }, 0)
      .to(shadow, { scale: 0.3, opacity: 0, duration: 0.8, ease: 'power2.out' }, '+=0.1');

    timelineRef.current = tl;

    return () => {
      tl.kill();
      gsap.set([ball, shadow], { clearProps: 'all' });
    };
  }, []);

  const handlePlay = (): void => {
    timelineRef.current?.restart();
    setStatus('播放中');
  };

  const handlePause = (): void => {
    timelineRef.current?.pause();
    setStatus('已暂停 (pause)');
  };

  const handleResume = (): void => {
    timelineRef.current?.resume();
    setStatus('已恢复 (resume)');
  };

  const handleKill = (): void => {
    timelineRef.current?.kill();
    setStatus('已销毁 (kill)');
  };

  const handleRebuild = (): void => {
    timelineRef.current?.kill();
    const ball = ballRef.current;
    const shadow = shadowRef.current;
    if (!ball || !shadow) return;

    gsap.set(ball, { y: -120, opacity: 0 });
    gsap.set(shadow, { scale: 0.3, opacity: 0 });

    const tl = gsap.timeline({
      paused: true,
      repeat: -1,
      yoyo: true,
      onStart: () => setStatus('动画开始'),
    });

    tl.to(ball, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.in' })
      .to(ball, { y: -120, duration: 0.8, ease: 'power2.out' }, '+=0.1')
      .to(shadow, { scale: 1, opacity: 0.4, duration: 0.8, ease: 'power2.in' }, 0)
      .to(shadow, { scale: 0.3, opacity: 0, duration: 0.8, ease: 'power2.out' }, '+=0.1');

    timelineRef.current = tl;
    tl.restart();
    setStatus('重建并播放');
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
      <div style={{ fontSize: 18, fontWeight: 600 }}>暂停恢复控制（pause / resume / kill）</div>
      <div
        style={{
          width: 200,
          height: 160,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'relative',
        }}
      >
        <div
          ref={ballRef}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#ec4899',
            position: 'absolute',
            bottom: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 2,
          }}
        />
        <div
          ref={shadowRef}
          style={{
            width: 48,
            height: 8,
            borderRadius: '50%',
            background: '#000',
            position: 'absolute',
            bottom: 8,
            opacity: 0,
            zIndex: 1,
          }}
        />
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8' }}>状态: {status}</div>
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
          播放
        </button>
        <button
          onClick={handlePause}
          style={{
            padding: '8px 14px',
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
            padding: '8px 14px',
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
        <button
          onClick={handleKill}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: 'none',
            background: '#f59e0b',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          销毁
        </button>
        <button
          onClick={handleRebuild}
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
          重建
        </button>
      </div>
    </div>
  );
};

export default G19_PauseResume;
