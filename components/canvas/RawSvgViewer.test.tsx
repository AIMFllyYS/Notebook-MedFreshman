import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RawSvgViewer } from './RawSvgViewer';

describe('RawSvgViewer', () => {
  it('shows a diagnostic and AI revision button for invisible svg content', () => {
    render(<RawSvgViewer svg="<svg viewBox='0 0 100 100'></svg>" title="empty" />);

    expect(screen.getByText(/Canvas diagnostic/i)).toBeInTheDocument();
    expect(screen.getByText(/Canvas has no visible SVG content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI revise canvas/i })).toBeInTheDocument();
  });

  it('renders the shared revision form inside the canvas frame', () => {
    const { container } = render(<RawSvgViewer svg="<svg viewBox='0 0 100 100'></svg>" title="empty" />);

    fireEvent.click(screen.getByRole('button', { name: /AI revise canvas/i }));

    const textarea = screen.getByRole('textbox');
    expect(textarea.closest('.canvas-frame')).not.toBeNull();
    expect(container.querySelector('.canvas-revision-panel')).not.toBeNull();
  });
});
