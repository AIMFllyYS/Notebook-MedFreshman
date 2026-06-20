"use client";

import { useRef } from "react";
import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import type { VideoEntry } from "@/lib/content/types";
import { videoPoster } from "@/lib/content/poster";

const zhTranslations = {
  Settings: "设置",
  Speed: "倍速",
  Normal: "正常",
  PIP: "画中画",
  Enter: "进入画中画",
  Exit: "退出画中画",
  Fullscreen: "全屏",
  EnterFullscreen: "进入全屏",
  ExitFullscreen: "退出全屏",
  Mute: "静音",
  Unmute: "取消静音",
  Captions: "字幕",
  "Captions off": "关闭字幕",
  Loop: "循环",
  Seek: "跳转",
  Play: "播放",
  Pause: "暂停",
  "Keyboard Shortcuts": "快捷键",
  Restart: "重新播放",
  Quality: "画质",
  Audio: "音量",
  Volume: "音量",
  Live: "直播",
  SeekBackward: "后退",
  SeekForward: "前进",
};

export interface InlinePlayerProps {
  video: VideoEntry;
  /** 切换到小窗播放时回调，传递当前播放位置 */
  onPip?: (currentTime: number) => void;
  /** 从小窗切回时的续播位置（秒） */
  startTime?: number;
}

export default function InlinePlayer({ video, onPip, startTime }: InlinePlayerProps) {
  const ref = useRef<MediaPlayerInstance>(null);
  const poster = videoPoster(video);

  const handlePipRequest = (event: { preventDefault: () => void }) => {
    if (!onPip) return;
    event.preventDefault();
    const player = ref.current;
    if (!player) return;
    onPip(player.state.currentTime);
  };

  return (
    <MediaPlayer
      ref={ref}
      src={video.src}
      poster={poster || undefined}
      title={video.title}
      playsInline
      keyTarget="player"
      onMediaEnterPipRequest={handlePipRequest}
      className="vs-player"
    >
      <MediaProvider />
      <DefaultVideoLayout
        icons={defaultLayoutIcons}
        colorScheme="dark"
        translations={zhTranslations}
      />
    </MediaPlayer>
  );
}
