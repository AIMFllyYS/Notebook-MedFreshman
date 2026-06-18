import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 8px',
    borderRadius: 'var(--md-sys-shape-corner-small)',
    fontSize: 'var(--md-sys-typescale-label-small-font)',
    fontWeight: 'var(--md-sys-typescale-label-small-weight)',
    lineHeight: '1',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--md-sys-color-primary-container)',
      color: 'var(--md-sys-color-on-primary-container)',
    },
    secondary: {
      backgroundColor: 'var(--md-sys-color-secondary-container)',
      color: 'var(--md-sys-color-on-secondary-container)',
    },
    error: {
      backgroundColor: 'var(--md-sys-color-error-container)',
      color: 'var(--md-sys-color-on-error-container)',
    },
    success: {
      backgroundColor: 'rgba(102, 187, 106, 0.2)', // using raw colors since no sys token for success container
      color: 'var(--color-success)',
    },
    warning: {
      backgroundColor: 'rgba(255, 167, 38, 0.2)',
      color: 'var(--color-warning)',
    },
    info: {
      backgroundColor: 'rgba(41, 182, 246, 0.2)',
      color: 'var(--color-info)',
    },
  };

  return (
    <span
      className={`common-badge ${className}`}
      style={{ ...baseStyle, ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </span>
  );
};
