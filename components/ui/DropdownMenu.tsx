'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOverlayRegistration } from '@/lib/keyboard/useOverlayRegistration';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isSeparator?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  placement = 'bottom-start',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useOverlayRegistration({ id: 'dropdown-menu', open: isOpen, onClose: close, priority: 40 });

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  // Position calculation
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const gap = 4;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'bottom-start':
        top = triggerRect.bottom + gap;
        left = triggerRect.left;
        break;
      case 'bottom-end':
        top = triggerRect.bottom + gap;
        left = triggerRect.right - menuRect.width;
        break;
      case 'top-start':
        top = triggerRect.top - menuRect.height - gap;
        left = triggerRect.left;
        break;
      case 'top-end':
        top = triggerRect.top - menuRect.height - gap;
        left = triggerRect.right - menuRect.width;
        break;
    }

    // Clamp to viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (left + menuRect.width > vw) left = vw - menuRect.width - 8;
    if (left < 8) left = 8;
    if (top + menuRect.height > vh) top = vh - menuRect.height - 8;
    if (top < 8) top = 8;

    setMenuPos({ top, left });
  }, [isOpen, placement]);

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.disabled || item.isSeparator) return;
    item.onClick?.();
    close();
  };

  const menuContent = (
    <div
      ref={menuRef}
      className={[
        'fixed min-w-[160px] z-[9999]',
        'bg-[var(--md-sys-color-surface-container)]',
        'border border-[var(--md-sys-color-outline-variant)]',
        'rounded-[var(--md-sys-shape-corner-medium,8px)]',
        'shadow-[var(--md-sys-elevation-level3,0_4px_8px_rgba(0,0,0,0.16))]',
        'py-1',
        'animate-[dropdown-in_0.15s_ease-out]',
      ].join(' ')}
      style={{ top: menuPos.top, left: menuPos.left }}
    >
      {items.map((item) => {
        if (item.isSeparator) {
          return (
            <div
              key={item.id}
              className="h-px bg-[var(--md-sys-color-outline-variant)] my-1"
            />
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={[
              'flex items-center gap-3 w-full px-3 py-2.5',
              'border-none bg-transparent text-left text-[13px]',
              'transition-colors duration-150',
              item.disabled
                ? 'text-[var(--md-sys-color-on-surface-variant)] opacity-50 cursor-not-allowed'
                : 'text-[var(--md-sys-color-on-surface)] cursor-pointer hover:bg-[var(--md-sys-color-surface-container-high)]',
            ].join(' ')}
          >
            {item.icon && (
              <span className="flex items-center shrink-0">{item.icon}</span>
            )}
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={triggerRef} className="relative inline-block">
      <div onClick={() => setIsOpen((prev) => !prev)}>{trigger}</div>
      {isOpen && createPortal(menuContent, document.body)}
    </div>
  );
};

export default DropdownMenu;
