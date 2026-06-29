"use client";

import { useCallback } from 'react';
import type { HtmlCanvasBlock } from '@/lib/canvas/types';
import { downloadHtmlFile } from '@/lib/utils/downloadHtml';
import { useCanvasFullscreen } from '@/lib/hooks/useCanvasFullscreen';
import { CanvasControls } from '../CanvasControls';
import { CanvasFrame } from '../CanvasFrame';
import { CanvasFullscreenPortal } from '../CanvasFullscreenPortal';

interface HtmlRendererProps {
  block: HtmlCanvasBlock;
  onRevisionSubmit?: (instruction: string) => void | Promise<void>;
}

export function HtmlRenderer({ block, onRevisionSubmit }: HtmlRendererProps) {
  const { fullscreen, toggle, exit } = useCanvasFullscreen();
  const title = block.title || 'HTML canvas';
  const height = block.height ?? 360;
  const openExternal = useCallback(() => {
    const url = URL.createObjectURL(new Blob([block.source], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, [block.source]);
  const download = useCallback(() => downloadHtmlFile(block.source, title), [block.source, title]);

  const controls = (
    <CanvasControls onDownload={download} onOpenExternal={openExternal} onMaximize={toggle} fullscreen={fullscreen} />
  );

  return (
    <CanvasFullscreenPortal open={fullscreen} onExit={exit}>
      <CanvasFrame title={block.title} source={block.source} controls={controls} className="html-canvas-layer" onRevisionSubmit={onRevisionSubmit}>
        <iframe
          title={title}
          srcDoc={block.source}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads"
          className="html-canvas-frame"
          style={{ height: fullscreen ? '100%' : height }}
        />
      </CanvasFrame>
    </CanvasFullscreenPortal>
  );
}

export default HtmlRenderer;
