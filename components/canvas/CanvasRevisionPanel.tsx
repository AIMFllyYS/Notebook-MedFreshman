import { useState } from 'react';

interface CanvasRevisionPanelProps {
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit?: (instruction: string) => void | Promise<void>;
}

export function CanvasRevisionPanel({
  busy = false,
  error,
  onCancel,
  onSubmit,
}: CanvasRevisionPanelProps) {
  const [instruction, setInstruction] = useState('');

  const submit = () => {
    const value = instruction.trim();
    if (!value || busy) return;
    void onSubmit?.(value);
  };

  return (
    <div className="canvas-revision-panel">
      <textarea
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        placeholder="Describe how to update this canvas"
        rows={3}
      />
      {error ? <div className="canvas-revision-error">{error}</div> : null}
      <div className="canvas-revision-actions">
        <button type="button" className="press" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="press canvas-revision-submit" onClick={submit} disabled={busy || !instruction.trim()}>
          {busy ? 'Updating...' : 'Update canvas'}
        </button>
      </div>
    </div>
  );
}

export default CanvasRevisionPanel;
