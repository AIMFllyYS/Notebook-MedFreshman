import React, { useRef, useState, useEffect } from 'react';
import { useVideoStore } from '../../store/useVideoStore';
import * as Icons from 'lucide-react';

const FloatingPlayer: React.FC = () => {
  const { floatingVideoSrc, floatingVideoTitle, isOpen, closeFloatingVideo } = useVideoStore();
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 280 });
  const [size] = useState({ width: 380, height: 214 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Position bottom right in viewport
      setPosition({
        x: window.innerWidth - size.width - 24,
        y: window.innerHeight - size.height - 80
      });
    }
  }, [isOpen, size]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left mouse button click
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    positionStart.current = { x: position.x, y: position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      let newX = positionStart.current.x + dx;
      let newY = positionStart.current.y + dy;
      
      const maxX = window.innerWidth - size.width - 10;
      const maxY = window.innerHeight - size.height - 10;
      
      newX = Math.max(10, Math.min(newX, maxX));
      newY = Math.max(10, Math.min(newY, maxY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, size]);

  const handleNativePiP = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.error('Failed to enter Picture-in-Picture mode:', err);
      }
    }
  };

  if (!isOpen || !floatingVideoSrc) return null;

  return (
    <div
      ref={containerRef}
      className="glass floating-window"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        zIndex: 9999,
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none'
      }}
    >
      {/* Header bar (Drag Handle) */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 0.75rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid var(--border-color)',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, overflow: 'hidden' }}>
          <Icons.PlayCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {floatingVideoTitle}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }} onMouseDown={(e) => e.stopPropagation()}>
          <button 
            onClick={handleNativePiP}
            className="btn" 
            style={{ padding: '0.25rem', display: 'flex', alignItems: 'center', background: 'transparent', border: 'none' }} 
            title="画中画播放"
          >
            <Icons.PictureInPicture size={12} style={{ color: 'var(--text-muted)' }} />
          </button>
          <button 
            onClick={closeFloatingVideo}
            className="btn" 
            style={{ padding: '0.25rem', display: 'flex', alignItems: 'center', background: 'transparent', border: 'none' }} 
            title="关闭"
          >
            <Icons.X size={12} style={{ color: 'var(--error)' }} />
          </button>
        </div>
      </div>

      {/* Video Content */}
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}>
        <video
          ref={videoRef}
          src={floatingVideoSrc}
          controls
          autoPlay
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default FloatingPlayer;
