import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CanvasFrame } from './CanvasFrame';

describe('CanvasFrame', () => {
  it('shows an AI revision button for healthy canvas content', () => {
    render(
      <CanvasFrame source="<svg><circle /></svg>">
        <div>canvas body</div>
      </CanvasFrame>,
    );

    expect(screen.getByRole('button', { name: /AI revise canvas/i })).toBeInTheDocument();
    expect(screen.getByText('canvas body')).toBeInTheDocument();
  });

  it('renders diagnostic details when the canvas is unhealthy', () => {
    render(
      <CanvasFrame
        diagnostic={{ ok: false, reason: 'empty', message: 'Canvas has no visible content.' }}
        source="<svg />"
      >
        <div />
      </CanvasFrame>,
    );

    expect(screen.getByText(/Canvas diagnostic/i)).toBeInTheDocument();
    expect(screen.getByText(/Canvas has no visible content/i)).toBeInTheDocument();
  });

  it('toggles the source panel', () => {
    render(
      <CanvasFrame source="<svg><line /></svg>">
        <div />
      </CanvasFrame>,
    );

    fireEvent.click(screen.getByRole('button', { name: /view source/i }));

    expect(screen.getByText('<svg><line /></svg>')).toBeInTheDocument();
  });

  it('keeps the revision form inside the canvas wrapper', () => {
    const onRevisionSubmit = vi.fn();
    const { container } = render(
      <CanvasFrame source="<svg />" onRevisionSubmit={onRevisionSubmit}>
        <div />
      </CanvasFrame>,
    );

    fireEvent.click(screen.getByRole('button', { name: /AI revise canvas/i }));
    const textbox = screen.getByRole('textbox');

    expect(textbox.closest('.svg-canvas-wrapper')).not.toBeNull();
    expect(container.querySelector('.canvas-revision-panel')).not.toBeNull();
  });
});
