'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  gap?: number;
}

const PADDING = 8;

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  gap = 6,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const tr = triggerRef.current.getBoundingClientRect();
    const tt = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;
    switch (placement) {
      case 'top':
        top = tr.top - tt.height - gap;
        left = tr.left + tr.width / 2 - tt.width / 2;
        break;
      case 'bottom':
        top = tr.bottom + gap;
        left = tr.left + tr.width / 2 - tt.width / 2;
        break;
      case 'left':
        top = tr.top + tr.height / 2 - tt.height / 2;
        left = tr.left - tt.width - gap;
        break;
      case 'right':
        top = tr.top + tr.height / 2 - tt.height / 2;
        left = tr.right + gap;
        break;
    }

    // 确保不超出屏幕边界
    left = Math.max(PADDING, Math.min(left, window.innerWidth - tt.width - PADDING));
    top = Math.max(PADDING, Math.min(top, window.innerHeight - tt.height - PADDING));

    setStyle({ top, left });
  };

  useLayoutEffect(() => {
    if (!isVisible) return;
    updatePosition();
    const handle = () => updatePosition();
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
    };
  }, [isVisible, placement, gap]);

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          className={[
            'fixed z-[9999] pointer-events-none',
            'px-2 py-1 rounded-[var(--md-sys-shape-corner-extra-small,4px)]',
            'text-[11px] font-medium leading-none',
            'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]',
            'border border-[var(--md-sys-color-outline)]',
            'shadow-[var(--md-sys-elevation-level2,0_2px_4px_rgba(0,0,0,0.12))]',
            'transition-opacity duration-200',
            'whitespace-nowrap',
          ].join(' ')}
          style={style}
          role="tooltip"
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
};
