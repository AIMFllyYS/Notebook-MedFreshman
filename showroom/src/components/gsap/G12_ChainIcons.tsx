import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const icons = ['★', '♦', '♠', '♥', '♣'];

const G12_ChainIcons: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [status, setStatus] = useState<string>('准备就绪');

  useEffect(() => {
    const targets = iconRefs.current.filter(Boolean) as HTMLDivElement[];
    if (targets.length === 0) return;

    gsap.set(targets, { opacity: 0, y: 40, scale: 0.5, rotation: -180 });

    const tl = gsap.timeline({
      paused: true,
      onStart: () => setStatus('链式动画开始'),
      onComplete: () => setStatus('链式动画完成'),
    });

    targets.forEach((el, i) => {
      // 使用相对位置 "+=0.2" 实现链式延迟
      tl.to(
        el,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
        },
        i === 0 ? 0 : '+=0.2'
      );
    });

    // 链式退出动画
    targets.forEach((el) => {
      tl.to(
        el,
        {
          opacity: 0,
          y: -30,
          scale: 0.6,
          rotation: 90,
          duration: 0.4,
          ease: 'power2.in',
        },
        '+=0.15'
      );
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
      <div style={{ fontSize: 18, fontWeight: 600 }}>链式图标动画（相对位置 +=0.2）</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {icons.map((icon, i) => (
          <div
            key={i}
            ref={(el) => { iconRefs.current[i] = el; }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: `hsl(${220 + i * 30}, 70%, 55%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {icon}
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

export default G12_ChainIcons;
