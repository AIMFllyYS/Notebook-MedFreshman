import React, { useState } from 'react';

export interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
  };

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'top':
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' };
      case 'bottom':
        return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' };
      case 'left':
        return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' };
      case 'right':
        return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' };
      default:
        return {};
    }
  };

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'var(--md-sys-color-on-surface)',
    color: 'var(--md-sys-color-surface)',
    padding: '4px 8px',
    borderRadius: 'var(--md-sys-shape-corner-extra-small)',
    fontSize: 'var(--md-sys-typescale-label-small-font)',
    fontWeight: 'var(--md-sys-typescale-label-small-weight)',
    whiteSpace: 'nowrap',
    zIndex: 100,
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? 'visible' : 'hidden',
    transition: 'opacity 0.2s var(--md-sys-motion-easing-emphasized-decelerate)',
    pointerEvents: 'none',
    boxShadow: 'var(--md-sys-elevation-level2)',
    ...getPositionStyles(),
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <div style={tooltipStyle}>
        {content}
      </div>
    </div>
  );
};
