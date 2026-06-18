'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'error'
    | 'success'
    | 'warning';
}

const variantClasses: Record<string, string> = {
  default:
    'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]',
  primary:
    'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]',
  secondary:
    'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
  tertiary:
    'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]',
  error:
    'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]',
  success:
    'bg-[rgba(102,187,106,0.2)] text-[var(--color-success,#4caf50)]',
  warning:
    'bg-[rgba(255,167,38,0.2)] text-[var(--color-warning,#ffa726)]',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <span
      className={[
        'inline-flex items-center justify-center',
        'px-2 py-1 rounded-[var(--md-sys-shape-corner-small,4px)]',
        'text-[11px] font-medium leading-none',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
};
