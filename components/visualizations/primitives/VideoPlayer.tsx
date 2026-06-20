'use client';

import React, { useRef } from 'react';
import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import { useStore } from '@/lib/store';
import type { SubjectId } from '@/lib/types/content';
import type { VideoEntry } from '@/lib/content/types';

const zhTranslations = {
  Settings: '设置',
  Speed: '倍速',
  Normal: '正常',
  PIP: '画中画',
  Enter: '进入画中画',
  Exit: '退出画中画',
  Fullscreen: '全屏',
  EnterFullscreen: '进入全屏',
  ExitFullscreen: '退出全屏',
  Mute: '静音',
  Unmute: '取消静音',
  Captions: '字幕',
  'Captions off': '关闭字幕',
  Loop: '循环',
  Seek: '跳转',
  Play: '播放',
  Pause: '暂停',
  'Keyboard Shortcuts': '快捷键',
  Restart: '重新播放',
  Quality: '画质',
  Audio: '音量',
  Volume: '音量',
  Live: '直播',
  SeekBackward: '后退',
  SeekForward: '前进',
};

export interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  subjectId?: SubjectId;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  poster,
  subjectId = 'probability',
}) => {
  const ref = useRef<MediaPlayerInstance>(null);
  const openPip = useStore((s) => s.openPip);

  const handlePipRequest = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const player = ref.current;
    if (!player) return;
    const entry: VideoEntry = {
      id: `prim-${src}`,
      subjectId,
      chapterId: '',
      sectionId: '',
      title: title ?? '视频播放',
      src,
      poster,
    };
    openPip(entry, player.state.currentTime);
  };

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
          gap: '0.4rem',
          paddingBottom: '0.4rem',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--md-sys-color-on-surface)' }}>
          {title ?? '视频播放'}
        </span>
      </div>

      <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', background: '#000', aspectRatio: '16 / 9' }}>
        <MediaPlayer
          ref={ref}
          src={src}
          poster={poster || undefined}
          title={title ?? '视频播放'}
          playsInline
          keyTarget="player"
          onMediaEnterPipRequest={handlePipRequest}
          className="vs-player"
          style={{ width: '100%', height: '100%' }}
        >
          <MediaProvider />
          <DefaultVideoLayout
            icons={defaultLayoutIcons}
            colorScheme="dark"
            translations={zhTranslations}
          />
        </MediaPlayer>
      </div>
    </div>
  );
};

export default VideoPlayer;
