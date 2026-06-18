import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  isActive = false,
  className = '',
  style,
  disabled,
  ...props
}) => {
  const sizeMap = {
    sm: '26px',
    md: '32px',
    lg: '38px',
  };

  const dimension = sizeMap[size];

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: dimension,
    height: dimension,
    borderRadius: '50%', // Perfect circle
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s var(--md-sys-motion-easing-emphasized-decelerate)',
    opacity: disabled ? 0.5 : 1,
    flexShrink: 0,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--md-sys-color-primary)',
      color: 'var(--md-sys-color-on-primary)',
    },
    secondary: {
      backgroundColor: 'var(--md-sys-color-secondary-container)',
      color: 'var(--md-sys-color-on-secondary-container)',
    },
    ghost: {
      backgroundColor: isActive ? 'var(--md-sys-color-surface-container-highest)' : 'transparent',
      color: isActive ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
    },
  };

  const mergedStyle = { ...baseStyle, ...variantStyles[variant], ...style };

  return (
    <button
      className={`common-icon-btn common-icon-btn-${variant} ${className}`}
      style={mergedStyle}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  );
};
