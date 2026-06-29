import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RawSvgViewer } from './RawSvgViewer';

vi.mock('@/lib/hooks/useSettings', () => ({
  useSettings: Object.assign(
    (selector?: (state: { selectedModelId: string; customApiGroups: unknown[] }) => unknown) => {
      const state = { selectedModelId: 'mimo-v2.5', customApiGroups: [] };
      return selector ? selector(state) : state;
    },
    { getState: () => ({ selectedModelId: 'mimo-v2.5', customApiGroups: [] }) },
  ),
}));

describe('RawSvgViewer', () => {
  it('shows a recoverable fallback and AI repair button for invisible svg content', () => {
    render(<RawSvgViewer svg="<svg viewBox='0 0 100 100'></svg>" title="empty" />);

    expect(screen.getByText(/SVG diagram is not visible/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI repair SVG/i })).toBeInTheDocument();
  });

  it('renders the repair form inside the fallback card when svg content is invisible', () => {
    const { container } = render(<RawSvgViewer svg="<svg viewBox='0 0 100 100'></svg>" title="empty" />);

    fireEvent.click(screen.getByRole('button', { name: /AI repair SVG/i }));

    const textarea = screen.getByRole('textbox');
    expect(textarea.closest('.viz-error-card')).not.toBeNull();
    expect(container.querySelector('.svg-repair-popover')).toBeNull();
  });
});
