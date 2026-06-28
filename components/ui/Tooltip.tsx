'use client';

import React, { useState } from 'react';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const placementClasses: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <div
        className={[
          'absolute z-[100] pointer-events-none',
          'px-2 py-1 rounded-[var(--md-sys-shape-corner-extra-small,4px)]',
          'text-[11px] font-medium leading-none',
          'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]',
          'border border-[var(--md-sys-color-outline)]',
          'shadow-[var(--md-sys-elevation-level2,0_2px_4px_rgba(0,0,0,0.12))]',
          'transition-opacity duration-200',
          placementClasses[placement],
          isVisible ? 'opacity-100 visible' : 'opacity-0 invisible',
        ].join(' ')}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  );
};
