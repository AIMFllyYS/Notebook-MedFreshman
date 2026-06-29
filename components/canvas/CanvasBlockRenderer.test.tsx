import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CanvasBlockRenderer } from './CanvasBlockRenderer';

vi.mock('@/lib/chemistry/rdkit', () => ({
  loadRDKit: () => Promise.resolve({
    get_mol: () => ({
      is_valid: () => true,
      get_svg: () => '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="20" /></svg>',
      delete: () => undefined,
    }),
  }),
}));

describe('CanvasBlockRenderer', () => {
  it('renders valid raw SVG with a shared AI revise button', () => {
    const { container } = render(
      <CanvasBlockRenderer
        block={{
          kind: 'raw-svg',
          source: '<svg viewBox="0 0 100 100"><line x1="0" y1="0" x2="100" y2="100" /></svg>',
        }}
      />,
    );

    expect(screen.getByRole('button', { name: /AI revise canvas/i })).toBeInTheDocument();
    expect(container.querySelector('.svg-raw-inner svg')).not.toBeNull();
  });

  it('shows diagnostics for empty raw SVG content', () => {
    render(
      <CanvasBlockRenderer
        block={{
          kind: 'raw-svg',
          source: '<svg viewBox="0 0 100 100"></svg>',
        }}
      />,
    );

    expect(screen.getByText(/Canvas diagnostic/i)).toBeInTheDocument();
  });

  it('does not silently render empty plot curves', () => {
    const { container } = render(
      <CanvasBlockRenderer
        block={{
          kind: 'plot',
          fn: '\\frac{1}{x}',
          attrs: { xmin: -1, xmax: 1 },
        }}
      />,
    );

    expect(container.querySelector('[data-testid="plot-diagnostic"]')).not.toBeNull();
  });

  it('renders HTML canvas content in an iframe', () => {
    render(
      <CanvasBlockRenderer
        block={{
          kind: 'html',
          source: '<!doctype html><html><body>hello</body></html>',
        }}
      />,
    );

    expect(screen.getByTitle('HTML canvas')).toBeInTheDocument();
  });

  it('renders molecule content through RDKit behind the shared frame', async () => {
    const { container } = render(
      <CanvasBlockRenderer
        block={{
          kind: 'molecule',
          source: 'O=[N+]([O-])c1ccccc1',
          title: 'nitrobenzene',
        }}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('.svg-raw-inner svg')).not.toBeNull();
    });
    expect(screen.getByRole('button', { name: /AI revise canvas/i })).toBeInTheDocument();
  });
});
