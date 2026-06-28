"use client";

import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

// DeepSeek — 品牌主色：#4D6BFA（鲸鱼蓝）
export const DeepSeekIcon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} role="img" aria-label="DeepSeek">
    <path
      d="M12.6 2.3c-1.4 0-2.7.4-3.8 1.1-1.2.7-2.2 1.7-2.8 3-.6 1.3-.9 2.7-.7 4.1.1.9.4 1.8.8 2.6-.4.2-.7.6-.7 1.1 0 .5.3 1 .8 1.2-.3.4-.4.9-.2 1.3.2.5.7.8 1.2.8.2 0 .4 0 .5-.1.2 1.2.7 2.3 1.5 3.2.8.9 1.8 1.5 3 1.8.8.2 1.6.2 2.4.1 1.5-.3 2.8-1.1 3.7-2.2.9-1.1 1.4-2.6 1.3-4.1-.1-1.5-.7-2.9-1.7-4-.6-.6-1.3-1.1-2.1-1.4-.2-.1-.4-.1-.5-.3-.1-.2-.1-.4 0-.6.2-.3.5-.4.8-.3.6.1 1.1.3 1.6.6.3-1.3.2-2.7-.4-3.9-.6-1.2-1.6-2.2-2.8-2.8-.7-.3-1.4-.5-2.2-.5-.4 0-.8 0-1.2.1z"
      fill="#4D6BFA"
    />
  </svg>
);

// Qwen — 品牌主色：#FF6A00
export const QwenIcon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} role="img" aria-label="Qwen">
    <path
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.8 14.2c-.6.9-1.5 1.6-2.6 2l-.8 2.2h-2.8l.8-2.1c-2-.5-3.6-2.2-4.1-4.2h2.8c.4 1.1 1.4 1.9 2.7 1.9 1.5 0 2.8-1.2 2.8-2.8 0-1.5-1.2-2.8-2.8-2.8-1.2 0-2.2.7-2.6 1.8H6.9c.5-2.5 2.7-4.3 5.3-4.3 3 0 5.4 2.4 5.4 5.4 0 1.5-.6 2.9-1.6 3.9h1.8v2z"
      fill="#FF6A00"
    />
  </svg>
);

// Zhipu / GLM — 品牌主色：#6B4CFF（智谱紫）
export const ZhipuIcon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} role="img" aria-label="Zhipu">
    <path
      d="M4 6h5v2H6v3h3v2H6v5H4V6zm7 0h2v9h3v2h-5V6zm6 0h5v2h-3v3h3v2h-3v5h-2V6z"
      fill="#6B4CFF"
    />
  </svg>
);

// Kimi — 品牌主色：#FF4D6D
export const KimiIcon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} role="img" aria-label="Kimi">
    <path
      d="M12 2L4 6.5v11L12 22l8-4.5v-11L12 2zm-1 14.5V7.5l5.5 3.1-5.5 5.9z"
      fill="#FF4D6D"
    />
  </svg>
);

// MiniMax — 品牌主色：#00C6FF 到 #0072FF
export const MiniMaxIcon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} role="img" aria-label="MiniMax">
    <defs>
      <linearGradient id="minimaxGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#00C6FF" />
        <stop offset="100%" stopColor="#0072FF" />
      </linearGradient>
    </defs>
    <path
      d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L18.5 8 12 12 5.5 8 12 4.5zM5 9.5l6.5 4v6.5L5 16v-6.5zm14 0V16l-6.5 4v-6.5l6.5-4z"
      fill="url(#minimaxGradient)"
    />
  </svg>
);

// MiMo — 小米品牌主色：#FF6700
export const MiMoIcon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} role="img" aria-label="MiMo">
    <path
      d="M3 6h3.5c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5H3V6zm6.5 0h3c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-3c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5zM19.5 6c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5z"
      fill="#FF6700"
    />
  </svg>
);

// 默认图标 — 通用灰色
export const DefaultModelIcon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} role="img" aria-label="Model">
    <rect x="3" y="7" width="7" height="10" rx="1.5" fill="currentColor" fillOpacity="0.25" />
    <rect x="14" y="4" width="7" height="16" rx="1.5" fill="currentColor" fillOpacity="0.45" />
  </svg>
);

const ICON_MAP: Record<string, React.FC<IconProps>> = {
  deepseek: DeepSeekIcon,
  qwen: QwenIcon,
  zhipu: ZhipuIcon,
  kimi: KimiIcon,
  minimax: MiniMaxIcon,
  mimo: MiMoIcon,
};

export function ModelIcon({ brand, ...props }: { brand?: string } & IconProps): React.ReactElement {
  const Component = brand ? ICON_MAP[brand] ?? DefaultModelIcon : DefaultModelIcon;
  return <Component {...props} />;
}
