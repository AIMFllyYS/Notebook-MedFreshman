import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: 1 | 2 | 3 | 4 | 5;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 1,
  interactive = false,
  className = '',
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    backgroundColor: 'var(--md-sys-color-surface)',
    borderRadius: 'var(--md-sys-shape-corner-medium)',
    border: '1px solid var(--md-sys-color-outline-variant)',
    boxShadow: `var(--md-sys-elevation-level${elevation})`,
    padding: '1.5rem',
    transition: 'all 0.2s var(--md-sys-motion-easing-emphasized-decelerate)',
    cursor: interactive ? 'pointer' : 'default',
  };

  return (
    <div
      className={`common-card ${interactive ? 'interactive' : ''} ${className}`}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};
