import React from 'react';
import { Mafs, Coordinates, Plot, useMovablePoint, Line } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';

interface NormalDistributionProps {
  title?: string;
}

const NormalDistribution: React.FC<NormalDistributionProps> = ({ title = "正态分布密度函数 N(μ, σ²)" }) => {
  // Draggable points to control mean (mu) and standard deviation (sigma)
  const muPoint = useMovablePoint([0, 0], { 
    constrain: "horizontal",
    color: "var(--primary)" 
  });
  
  // Sigma point controls the spread, bounded to be strictly positive
  const sigmaPoint = useMovablePoint([1, 0.2], {
    constrain: "horizontal",
    color: "var(--secondary)"
  });

  const mu = muPoint.x;
  // Make sure sigma is always positive and not too close to zero to prevent overflow
  const rawSigma = Math.abs(sigmaPoint.x - mu);
  const sigma = Math.max(0.1, rawSigma);

  // Normal distribution PDF formula: f(x) = (1 / (sigma * sqrt(2 * pi))) * exp(-0.5 * ((x - mu) / sigma)^2)
  const pdf = (x: number) => {
    const coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mu) / sigma, 2);
    return coeff * Math.exp(exponent);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(79, 195, 247, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(79, 195, 247, 0.3)' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>均值 μ (位置):</span>
          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{mu.toFixed(2)}</span>
        </div>
        <div style={{ background: 'rgba(171, 71, 188, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(171, 71, 188, 0.3)' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>标准差 σ (离散程度):</span>
          <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{sigma.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: '350px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
        <Mafs viewBox={{ x: [-5, 5], y: [-0.2, 1.2] }} preserveAspectRatio="contain">
          <Coordinates.Cartesian 
            xAxis={{ lines: 1, labels: (x) => (x % 1 === 0 ? x : '') }} 
            yAxis={{ lines: 0.2, labels: (y) => (y % 0.2 === 0 ? y.toFixed(1) : '') }} 
          />
          
          {/* Fill under curve roughly between mu-3sigma and mu+3sigma */}
          <Plot.Inequality
            x={{ '>=': () => -5, '<=': () => 5 }}
            y={{ '<=': pdf, '>=': () => 0 }}
            color="var(--primary)"
            fillOpacity={0.15}
          />
          
          <Plot.OfX y={pdf} color="var(--primary)" weight={3} />
          
          {/* Mean Line */}
          <Line.Segment
            point1={[mu, 0]}
            point2={[mu, pdf(mu)]}
            color="var(--primary)"
            style="dashed"
          />
          
          {/* Sigma lines */}
          <Line.Segment
            point1={[mu, pdf(mu + sigma)]}
            point2={[mu + sigma, pdf(mu + sigma)]}
            color="var(--secondary)"
            style="dashed"
          />
          <Line.Segment
            point1={[mu, pdf(mu - sigma)]}
            point2={[mu - sigma, pdf(mu - sigma)]}
            color="var(--secondary)"
            style="dashed"
          />

          {muPoint.element}
          {sigmaPoint.element}
        </Mafs>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <p style={{ margin: 0 }}>💡 <strong>交互提示：</strong> 拖动 <span style={{ color: 'var(--primary)' }}>蓝点</span> 改变均值 $\\mu$（平移曲线），拖动 <span style={{ color: 'var(--secondary)' }}>紫点</span> 改变标准差 $\\sigma$（改变曲线的胖瘦）。</p>
        <p style={{ margin: '0.5rem 0 0 0' }}>注意：正态分布曲线下的总面积永远恒为 1。因此当 $\\sigma$ 变小（曲线变瘦）时，峰值必然变高。</p>
      </div>
    </div>
  );
};

export default NormalDistribution;
