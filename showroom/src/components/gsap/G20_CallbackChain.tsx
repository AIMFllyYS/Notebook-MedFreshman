import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const G20_CallbackChain: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('准备就绪');

  const addLog = (msg: string): void => {
    setLogs((prev) => {
      const next = [...prev, msg];
      return next.slice(-6);
    });
  };

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    gsap.set(box, { x: -100, opacity: 0, scale: 0.8 });

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        setStatus('onStart 触发');
        addLog('[onStart] 时间轴开始');
      },
      onUpdate: function () {
        if (Math.random() > 0.85) {
          addLog(`[onUpdate] 进度 ${(this.progress() * 100).toFixed(1)}%`);
        }
      },
      onComplete: () => {
        setStatus('onComplete 触发');
        addLog('[onComplete] 时间轴结束');
      },
    });

    tl.to(box, {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'power2.out',
      onStart: () => addLog('[step1 onStart] 第一步开始'),
      onComplete: () => addLog('[step1 onComplete] 第一步结束'),
    })
      .to(box, {
        x: 100,
        rotation: 180,
        duration: 0.8,
        ease: 'power2.inOut',
        onStart: () => addLog('[step2 onStart] 第二步开始'),
        onComplete: () => addLog('[step2 onComplete] 第二步结束'),
      })
      .to(box, {
        x: 0,
        rotation: 360,
        scale: 1.3,
        duration: 0.6,
        ease: 'back.out(1.7)',
        onStart: () => addLog('[step3 onStart] 第三步开始'),
        onComplete: () => addLog('[step3 onComplete] 第三步结束'),
      })
      .to(box, {
        scale: 1,
        rotation: 0,
        duration: 0.5,
        ease: 'power2.out',
        onStart: () => addLog('[step4 onStart] 第四步开始'),
        onComplete: () => addLog('[step4 onComplete] 第四步结束'),
      });

    timelineRef.current = tl;

    return () => {
      tl.kill();
      gsap.set(box, { clearProps: 'all' });
    };
  }, []);

  const handlePlay = (): void => {
    setLogs([]);
    timelineRef.current?.restart();
  };

  const handlePause = (): void => {
    timelineRef.current?.pause();
    setStatus('已暂停');
    addLog('[手动] 暂停');
  };

  const handleResume = (): void => {
    timelineRef.current?.resume();
    setStatus('播放中');
    addLog('[手动] 恢复');
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
        gap: 20,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600 }}>时间轴回调链（onStart + onComplete + onUpdate）</div>
      <div
        style={{
          width: 240,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          ref={boxRef}
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: '#3b82f6',
            position: 'absolute',
            left: 'calc(50% - 24px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      <div
        style={{
          width: 320,
          minHeight: 120,
          background: '#1e293b',
          borderRadius: 8,
          padding: 12,
          fontSize: 12,
          fontFamily: 'monospace',
          color: '#94a3b8',
          overflow: 'auto',
        }}
      >
        <div style={{ color: '#e2e8f0', marginBottom: 6, fontWeight: 600 }}>回调日志:</div>
        {logs.length === 0 && <div style={{ color: '#64748b' }}>暂无日志...</div>}
        {logs.map((log, i) => (
          <div key={i} style={{ lineHeight: 1.6 }}>
            {log}
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

export default G20_CallbackChain;
