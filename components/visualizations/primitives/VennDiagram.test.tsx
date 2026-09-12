import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VennDiagram } from './VennDiagram';

describe('VennDiagram', () => {
  it('默认画 A/B；自定义标签出现在图上', () => {
    const { rerender } = render(<VennDiagram a={0.3} b={0.25} ab={0.1} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();

    rerender(
      <VennDiagram a={0.3} b={0.25} ab={0.1} aLabel="线粒体" bLabel="叶绿体" abLabel="内共生" />,
    );
    expect(screen.getByText('线粒体')).toBeInTheDocument();
    expect(screen.getByText('叶绿体')).toBeInTheDocument();
    expect(screen.getByText('内共生')).toBeInTheDocument();
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });
});
