import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FunctionPlot } from './FunctionPlot';

const baseProps = {
  xMin: -4,
  xMax: 4,
  yMin: -1,
  yMax: 1,
  plotLeft: 20,
  plotTop: 20,
  plotWidth: 300,
  plotHeight: 180,
};

describe('FunctionPlot', () => {
  it('renders a curve path for supported gaussian aliases', () => {
    const { container } = render(
      <svg>
        <FunctionPlot {...baseProps} fn="normal_pdf(x,0,1)" />
      </svg>,
    );

    const path = container.querySelector('path.svg-canvas-curve');
    expect(path?.getAttribute('d')).toMatch(/^M/);
  });

  it('does not render an empty path for unsupported expressions', () => {
    const { container } = render(
      <svg>
        <FunctionPlot {...baseProps} fn="\\frac{1}{x}" />
      </svg>,
    );

    expect(container.querySelector('path.svg-canvas-curve')).toBeNull();
    expect(container.querySelector('[data-testid="plot-diagnostic"]')).not.toBeNull();
  });
});
