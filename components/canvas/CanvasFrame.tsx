"use client";

import { useState } from 'react';
import type { CanvasDiagnostic } from '@/lib/canvas/types';
import PencilSparklesIcon from '@/components/icons/PencilSparklesIcon';
import { CanvasDiagnosticPanel } from './CanvasDiagnosticPanel';
import { CanvasRevisionPanel } from './CanvasRevisionPanel';

interface CanvasFrameProps {
  title?: string;
  source?: string;
  diagnostic?: CanvasDiagnostic | null;
  controls?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onPointerMove?: React.PointerEventHandler<HTMLDivElement>;
  onPointerUp?: React.PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: React.PointerEventHandler<HTMLDivElement>;
  onWheel?: React.WheelEventHandler<HTMLDivElement>;
  revisionBusy?: boolean;
  revisionError?: string | null;
  onRevisionSubmit?: (instruction: string) => void | Promise<void>;
}

export function CanvasFrame({
  title,
  source,
  diagnostic,
  controls,
  children,
  className,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onWheel,
  revisionBusy = false,
  revisionError,
  onRevisionSubmit,
}: CanvasFrameProps) {
  const [showRevision, setShowRevision] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const hasSource = Boolean(source?.trim());

  return (
    <div
      className={`svg-canvas-wrapper canvas-frame ${className ?? ''}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onWheel={onWheel}
    >
      <div className="svg-canvas-controls svg-canvas-controls-left">
        <button
          type="button"
          className="press"
          onClick={() => setShowRevision((value) => !value)}
          title="AI revise canvas"
          aria-label="AI revise canvas"
        >
          <PencilSparklesIcon size={11} />
        </button>
      </div>

      {controls}

      {title ? <div className="canvas-frame-title">{title}</div> : null}
      <div className="canvas-frame-body">{children}</div>

      <CanvasDiagnosticPanel diagnostic={diagnostic} />

      {showRevision ? (
        <CanvasRevisionPanel
          busy={revisionBusy}
          error={revisionError}
          onCancel={() => setShowRevision(false)}
          onSubmit={onRevisionSubmit}
        />
      ) : null}

      {hasSource ? (
        <div className="canvas-source-panel">
          <button type="button" className="viz-error-toggle press" onClick={() => setShowSource((value) => !value)}>
            {showSource ? 'Hide source' : 'View source'}
          </button>
          {showSource ? <pre className="viz-error-source">{source}</pre> : null}
        </div>
      ) : null}
    </div>
  );
}

export default CanvasFrame;
