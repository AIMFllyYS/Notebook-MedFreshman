'use client';

import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: 'w-[26px] h-[26px]',
  md: 'w-[32px] h-[32px]',
  lg: 'w-[38px] h-[38px]',
};

const variantBase: Record<string, string> = {
  default:
    'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-none',
  ghost:
    'bg-transparent text-[var(--md-sys-color-on-surface-variant)] border-none',
  outline:
    'bg-transparent text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline)]',
};

const variantActive: Record<string, string> = {
  default:
    'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]',
  ghost:
    'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)]',
  outline:
    'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)]',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  isActive = false,
  className = '',
  disabled,
  title,
  ...props
}) => {
  const variantClass = isActive ? variantActive[variant] : variantBase[variant];

  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-full shrink-0',
        'transition-all duration-200',
        sizeClasses[size],
        variantClass,
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:brightness-110 active:brightness-90',
        className,
      ].join(' ')}
      disabled={disabled}
      title={title}
      {...props}
    >
      {icon}
    </button>
  );
};
