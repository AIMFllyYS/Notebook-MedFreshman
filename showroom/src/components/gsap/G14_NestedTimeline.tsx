import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const G14_NestedTimeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const group1Ref = useRef<HTMLDivElement>(null);
  const group2Ref = useRef<HTMLDivElement>(null);
  const group3Ref = useRef<HTMLDivElement>(null);
  const masterRef = useRef<gsap.core.Timeline | null>(null);
  const [status, setStatus] = useState<string>('准备就绪');

  useEffect(() => {
    const g1 = group1Ref.current;
    const g2 = group2Ref.current;
    const g3 = group3Ref.current;
    if (!g1 || !g2 || !g3) return;

    const items1 = g1.querySelectorAll<HTMLDivElement>('.nest-item');
    const items2 = g2.querySelectorAll<HTMLDivElement>('.nest-item');
    const items3 = g3.querySelectorAll<HTMLDivElement>('.nest-item');

    gsap.set([...items1, ...items2, ...items3], { opacity: 0, scale: 0.5, y: 20 });

    const child1 = gsap.timeline();
    items1.forEach((el, i) => {
      child1.to(el, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }, i * 0.15);
    });

    const child2 = gsap.timeline();
    items2.forEach((el, i) => {
      child2.to(el, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }, i * 0.15);
    });

    const child3 = gsap.timeline();
    items3.forEach((el, i) => {
      child3.to(el, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }, i * 0.15);
    });

    const master = gsap.timeline({
      paused: true,
      onStart: () => setStatus('嵌套动画开始'),
      onComplete: () => setStatus('嵌套动画完成'),
    });

    // 嵌套时间轴：master.add(child, position)
    master.add(child1, 0).add(child2, 0.8).add(child3, 1.6);

    masterRef.current = master;

    return () => {
      master.kill();
      gsap.set([...items1, ...items2, ...items3], { clearProps: 'all' });
    };
  }, []);

  const handlePlay = (): void => {
    masterRef.current?.restart();
  };

  const handlePause = (): void => {
    masterRef.current?.pause();
    setStatus('已暂停');
  };

  const handleResume = (): void => {
    masterRef.current?.resume();
    setStatus('播放中');
  };

  const renderGroup = (
    ref: React.RefObject<HTMLDivElement | null>,
    color: string,
    label: string
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>{label}</div>
      <div ref={ref} style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="nest-item"
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: color,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  );

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
      <div style={{ fontSize: 18, fontWeight: 600 }}>嵌套时间轴（master.add(child, position)）</div>
      <div style={{ display: 'flex', gap: 32 }}>
        {renderGroup(group1Ref, '#3b82f6', '子时间轴 1')}
        {renderGroup(group2Ref, '#10b981', '子时间轴 2')}
        {renderGroup(group3Ref, '#f59e0b', '子时间轴 3')}
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

export default G14_NestedTimeline;
