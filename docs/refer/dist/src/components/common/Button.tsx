import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    borderRadius: 'var(--md-sys-shape-corner-small)',
    fontWeight: 'var(--md-sys-typescale-label-large-weight)',
    transition: 'all 0.2s var(--md-sys-motion-easing-emphasized-decelerate)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'inherit',
    border: 'none',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
  };

  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { height: '26px', padding: '0 10px', fontSize: '11px' },
    md: { height: '32px', padding: '0 16px', fontSize: '13px' },
    lg: { height: '38px', padding: '0 24px', fontSize: '14px' },
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--md-sys-color-primary)',
      color: 'var(--md-sys-color-on-primary)',
    },
    secondary: {
      backgroundColor: 'var(--md-sys-color-secondary-container)',
      color: 'var(--md-sys-color-on-secondary-container)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--md-sys-color-primary)',
      border: '1px solid var(--md-sys-color-outline)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--md-sys-color-primary)',
    },
    danger: {
      backgroundColor: 'var(--md-sys-color-error)',
      color: 'var(--md-sys-color-on-error)',
    },
  };

  // Hover styles will be handled by a wrapper or standard classes if possible,
  // but for a fully inline-styled approach (to avoid relying too much on external CSS classes for primitives), 
  // we can use state or just rely on CSS variables with hover classes. 
  // Since inline hover is tricky without state, we will add standard classes for hover states 
  // or define them in index.css. For now, let's keep it simple and add hover classes.
  
  const mergedStyle = { ...baseStyle, ...sizeStyles[size], ...variantStyles[variant], ...style };

  return (
    <button
      className={`common-btn common-btn-${variant} ${className}`}
      style={mergedStyle}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="animate-spin" style={{ display: 'inline-block', width: '1em', height: '1em', border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%' }} />
      )}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
