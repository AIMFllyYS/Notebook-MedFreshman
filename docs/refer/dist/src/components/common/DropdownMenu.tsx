import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isSeparator?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'left-start' | 'left-center' | 'left-end' | 'right-start' | 'right-center' | 'right-end';
  align?: 'start' | 'center' | 'end';
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  placement = 'bottom',
  align = 'start'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node) &&
        menuRef.current && 
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current && menuRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      // Calculate position based on placement and align
      switch (placement) {
        case 'top':
        case 'top-start':
        case 'top-center':
        case 'top-end':
          top = triggerRect.top - menuRect.height - 4;
          break;
        case 'bottom':
        case 'bottom-start':
        case 'bottom-center':
        case 'bottom-end':
          top = triggerRect.bottom + 4;
          break;
        case 'left':
        case 'left-start':
        case 'left-center':
        case 'left-end':
          left = triggerRect.left - menuRect.width - 4;
          break;
        case 'right':
        case 'right-start':
        case 'right-center':
        case 'right-end':
          left = triggerRect.right + 4;
          break;
      }

      // Calculate alignment
      switch (align) {
        case 'start':
          if (placement.includes('top') || placement.includes('bottom')) {
            left = triggerRect.left;
          } else {
            top = triggerRect.top;
          }
          break;
        case 'center':
          if (placement.includes('top') || placement.includes('bottom')) {
            left = triggerRect.left + (triggerRect.width - menuRect.width) / 2;
          } else {
            top = triggerRect.top + (triggerRect.height - menuRect.height) / 2;
          }
          break;
        case 'end':
          if (placement.includes('top') || placement.includes('bottom')) {
            left = triggerRect.right - menuRect.width;
          } else {
            top = triggerRect.bottom - menuRect.height;
          }
          break;
      }

      setMenuPosition({ top, left });
    }
  }, [isOpen, placement, align]);

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.disabled || item.isSeparator) return;
    item.onClick?.();
    setIsOpen(false);
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const menuContent = (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: menuPosition.top,
        left: menuPosition.left,
        backgroundColor: 'var(--md-sys-color-surface-container)',
        border: '1px solid var(--md-sys-color-outline-variant)',
        borderRadius: 'var(--md-sys-shape-corner-medium)',
        boxShadow: 'var(--md-sys-elevation-level3)',
        padding: '4px 0',
        minWidth: '160px',
        zIndex: 9999,
        animation: 'slideUp 0.2s var(--md-sys-motion-easing-emphasized-decelerate)'
      }}
    >
      {items.map((item) => {
        if (item.isSeparator) {
          return (
            <div
              key={item.id}
              style={{
                height: '1px',
                backgroundColor: 'var(--md-sys-color-outline-variant)',
                margin: '2px 0'
              }}
            />
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              backgroundColor: 'transparent',
              color: item.disabled ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-surface)',
              fontSize: '13px',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              opacity: item.disabled ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = 'rgba(103, 80, 164, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {item.icon && (
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={triggerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={handleTriggerClick}>
        {trigger}
      </div>
      {isOpen && createPortal(menuContent, document.body)}
    </div>
  );
};

export default DropdownMenu;
