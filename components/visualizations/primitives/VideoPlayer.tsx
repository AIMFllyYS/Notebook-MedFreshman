'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pause,
  PictureInPicture,
  Play,
  PlayCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import type { SubjectId } from '@/lib/types/content';
import type { VideoEntry } from '@/lib/content/types';

export interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  /** 学科 id，默认 'probability'（概率论） */
  subjectId?: SubjectId;
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * VideoPlayer 原语：HTML5 <video> 播放器，含自定义控件与「小窗播放」按钮。
 * 点击「小窗播放」会构造 VideoEntry 并调用 useStore.openPip，
 * 由全局 PipPlayer 接管播放。
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  poster,
  subjectId = 'probability',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const openPip = useStore((s) => s.openPip);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrent(v.currentTime);
    const onDur = () => setDuration(v.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('durationchange', onDur);
    v.addEventListener('loadedmetadata', onDur);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('durationchange', onDur);
      v.removeEventListener('loadedmetadata', onDur);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Number(e.target.value);
    v.currentTime = t;
    setCurrent(t);
  };

  const handlePip = () => {
    const entry: VideoEntry = {
      id: `prim-${src}`,
      subjectId,
      chapterId: '',
      sectionId: '',
      title: title ?? '视频播放',
      src,
      poster,
    };
    openPip(entry);
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      style={{
        padding: '0.75rem',
        borderRadius: '10px',
        border: '1px solid var(--md-sys-color-outline-variant)',
        background: 'var(--md-sys-color-surface-container-high)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.4rem',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <PlayCircle size={15} style={{ color: 'var(--md-sys-color-primary)' }} />
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            {title ?? '视频播放'}
          </span>
        </div>
        <button
          onClick={handlePip}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.72rem',
            padding: '0.2rem 0.5rem',
            background: 'transparent',
            border: '1px solid var(--md-sys-color-outline-variant)',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
          title="在小窗中播放"
        >
          <PictureInPicture size={12} />
          <span>小窗播放</span>
        </button>
      </div>

      <div
        style={{
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#000',
          aspectRatio: '16 / 9',
          position: 'relative',
        }}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {/* 自定义控件 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.74rem',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}
      >
        <button
          onClick={togglePlay}
          title={playing ? '暂停' : '播放'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--md-sys-color-primary)',
            color: 'var(--md-sys-color-on-primary)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          onClick={toggleMute}
          title={muted ? '取消静音' : '静音'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: 'var(--md-sys-color-on-surface-variant)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        <span style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {formatTime(current)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={onSeek}
          style={{
            flex: 1,
            accentColor: 'var(--md-sys-color-primary)',
            cursor: 'pointer',
          }}
        />

        <span style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {formatTime(duration)}
        </span>
      </div>

      {/* 进度条视觉填充（与原生 range 配合） */}
      <div
        style={{
          height: '3px',
          borderRadius: '2px',
          background: 'var(--md-sys-color-surface-container)',
          overflow: 'hidden',
          marginTop: '-0.25rem',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'var(--md-sys-color-primary)',
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
