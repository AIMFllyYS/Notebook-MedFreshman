import React, { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import * as Icons from 'lucide-react';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import FloatingPlayer from '../AI/FloatingPlayer';
import { IconButton } from '../common/IconButton';
import { TextSelectionPopover } from '../common/TextSelectionPopover';
import { QuickExplainWindow } from '../AI/QuickExplainWindow';

const Layout: React.FC = () => {
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [rightPanelWidth, setRightPanelWidth] = useState(380);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const isResizingSidebar = useRef(false);
  const isResizingRightPanel = useRef(false);

  const startResizeSidebar = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only drag with left mouse button click
    e.preventDefault();
    isResizingSidebar.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const startResizeRightPanel = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only drag with left mouse button click
    e.preventDefault();
    isResizingRightPanel.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      if (isResizingSidebar.current) {
        const newWidth = e.clientX - containerRect.left;
        // Restrict bounds
        if (newWidth >= 160 && newWidth <= 320) {
          setSidebarWidth(newWidth);
        }
      }

      if (isResizingRightPanel.current) {
        const newWidth = containerRect.right - e.clientX;
        // Restrict bounds
        if (newWidth >= 300 && newWidth <= 600) {
          setRightPanelWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      isResizingRightPanel.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="app-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        '--sidebar-width': sidebarOpen ? `${sidebarWidth}px` : '0px',
        '--right-panel-width': rightPanelOpen ? `${rightPanelWidth}px` : '0px'
      } as React.CSSProperties}
    >
      {/* Main Layout Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div
          className={`sidebar ${sidebarOpen ? '' : 'closed'}`}
          style={{ width: sidebarOpen ? `${sidebarWidth}px` : '0px', flexShrink: 0 }}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Sidebar Splitter Resizer */}
        {sidebarOpen && (
          <div
            onMouseDown={startResizeSidebar}
            className="splitter-resizer"
            title="拖动调整大小"
          />
        )}

        {/* Main Content Area */}
        <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
          {/* Sidebar Expand Button (when closed) */}
          {!sidebarOpen && (
            <div style={{ position: 'absolute', left: '0.5rem', top: '0.5rem', zIndex: 30 }}>
              <IconButton
                icon={<Icons.Menu size={16} />}
                onClick={() => setSidebarOpen(true)}
                title="展开侧边栏"
              />
            </div>
          )}

          {/* Right Panel Expand Button (when closed) */}
          {!rightPanelOpen && (
            <div style={{ position: 'absolute', right: '0.5rem', top: '0.5rem', zIndex: 30 }}>
              <IconButton
                icon={<Icons.Sparkles size={16} />}
                onClick={() => setRightPanelOpen(true)}
                title="展开 AI 助教"
              />
            </div>
          )}

          <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
            <Outlet />
          </div>
        </div>

        {/* Right Panel Splitter Resizer */}
        {rightPanelOpen && (
          <div
            onMouseDown={startResizeRightPanel}
            className="splitter-resizer"
            title="拖动调整大小"
          />
        )}

        {/* Right Panel (AI & Viz & Video) */}
        <div
          className={`right-panel ${rightPanelOpen ? '' : 'closed'}`}
          style={{ width: rightPanelOpen ? `${rightPanelWidth}px` : '0px', flexShrink: 0 }}
        >
          <RightPanel onClose={() => setRightPanelOpen(false)} />
        </div>
      </div>

      {/* Floating Picture-in-Picture Video Player */}
      <FloatingPlayer />

      {/* Global Overlays */}
      <TextSelectionPopover />
      <QuickExplainWindow />
    </div>
  );
};

export default Layout;
