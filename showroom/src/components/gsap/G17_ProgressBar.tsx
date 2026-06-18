import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const G17_ProgressBar: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>('准备就绪');

  useEffect(() => {
    const target = targetRef.current;
    const progressBar = progressBarRef.current;
    const progressText = progressTextRef.current;
    if (!target || !progressBar || !progressText) return;

    gsap.set(target, { x: -120, opacity: 0 });
    gsap.set(progressBar, { scaleX: 0, transformOrigin: 'left center' });

    const tl = gsap.timeline({
      paused: true,
      onStart: () => setStatus('动画开始'),
      onUpdate: function () {
        const p = this.progress();
        setProgress(Math.round(p * 100));
        gsap.set(progressBar, { scaleX: p });
        if (progressText) {
          progressText.textContent = `${Math.round(p * 100)}%`;
        }
      },
      onComplete: () => setStatus('动画完成'),
    });

    tl.to(target, { x: 120, opacity: 1, duration: 2, ease: 'power2.inOut' })
      .to(target, { rotation: 360, duration: 1.5, ease: 'back.out(1.7)' }, '-=1')
      .to(target, { scale: 1.5, duration: 1, ease: 'elastic.out(1, 0.5)' }, '-=0.8')
      .to(target, { scale: 1, duration: 0.5, ease: 'power2.out' });

    timelineRef.current = tl;

    return () => {
      tl.kill();
      gsap.set([target, progressBar], { clearProps: 'all' });
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(e.target.value) / 100;
    setProgress(Math.round(value * 100));
    timelineRef.current?.pause(value);
    setStatus('手动跳转');
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
      <div style={{ fontSize: 18, fontWeight: 600 }}>时间轴进度条（progress + onUpdate）</div>
      <div
        style={{
          width: 280,
          height: 8,
          background: '#1e293b',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            width: '100%',
            height: '100%',
            background: '#3b82f6',
            borderRadius: 4,
          }}
        />
      </div>
      <div ref={progressTextRef} style={{ fontSize: 14, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
        0%
      </div>
      <div
        style={{
          width: 280,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          ref={targetRef}
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#10b981',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={progress}
        onChange={handleSeek}
        style={{ width: 280 }}
      />
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

export default G17_ProgressBar;
