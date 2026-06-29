import type { CanvasDiagnostic } from '@/lib/canvas/types';

interface CanvasDiagnosticPanelProps {
  diagnostic?: CanvasDiagnostic | null;
}

export function CanvasDiagnosticPanel({ diagnostic }: CanvasDiagnosticPanelProps) {
  if (!diagnostic || diagnostic.ok) return null;

  return (
    <div className="canvas-diagnostic-panel" role="status">
      <div className="canvas-diagnostic-title">Canvas diagnostic</div>
      <div className="canvas-diagnostic-message">{diagnostic.message}</div>
      <div className="canvas-diagnostic-reason">{diagnostic.reason}</div>
    </div>
  );
}

export default CanvasDiagnosticPanel;
