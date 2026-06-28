import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormulaSteps } from './FormulaSteps';

describe('FormulaSteps', () => {
  it('复用 Markdown/KaTeX 渲染步骤内容，兼容裸 LaTeX 公式步骤', () => {
    const { container } = render(
      <FormulaSteps
        steps={[
          '**能量守恒**：$E = mc^2$',
          'g h + \\frac{1}{2}\\left(\\frac{S_B}{S_A} v_B\\right)^2 = \\frac{1}{2} v_B^2',
        ]}
      />,
    );

    expect(screen.getByText('能量守恒')).toBeInTheDocument();
    expect(screen.getByText('能量守恒').tagName.toLowerCase()).toBe('strong');
    expect(container.querySelectorAll('.katex').length).toBeGreaterThanOrEqual(2);
  });
});
