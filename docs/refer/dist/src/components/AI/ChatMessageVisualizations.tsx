import React, { useState } from 'react';
import { Mafs, Circle, Text as MafsText, Polygon, Coordinates, Plot, Line } from 'mafs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as Icons from 'lucide-react';
import 'mafs/core.css';
import 'mafs/font.css';

// ----------------------------------------------------
// 1. InlineVenn: 可调概率的维恩图
// ----------------------------------------------------
export const InlineVenn: React.FC<{ a?: number; b?: number; ab?: number }> = ({
  a = 0.6,
  b = 0.5,
  ab = 0.2
}) => {
  const [probA, setProbA] = useState(a);
  const [probB, setProbB] = useState(b);
  const [probAB, setProbAB] = useState(ab);

  // Auto constrain probabilities to be mathematically valid:
  // P(AB) <= min(P(A), P(B))
  // P(A) + P(B) - P(AB) <= 1
  const handleAChange = (newA: number) => {
    setProbA(newA);
    if (probAB > newA) setProbAB(newA);
    if (newA + probB - probAB > 1) {
      setProbB(Number((1 - newA + probAB).toFixed(2)));
    }
  };

  const handleBChange = (newB: number) => {
    setProbB(newB);
    if (probAB > newB) setProbAB(newB);
    if (probA + newB - probAB > 1) {
      setProbA(Number((1 - newB + probAB).toFixed(2)));
    }
  };

  const handleABChange = (newAB: number) => {
    // AB can't exceed A or B
    const maxAB = Math.min(probA, probB);
    const validAB = Math.min(newAB, maxAB);
    setProbAB(validAB);
  };

  // We can calculate other probabilities
  const union = Number((probA + probB - probAB).toFixed(2));
  const onlyA = Number((probA - probAB).toFixed(2));
  const onlyB = Number((probB - probAB).toFixed(2));
  const neither = Number((1 - union).toFixed(2));
  
  // Centers based on overlap
  // If probAB is large, circles are close together.
  // If probAB is 0, circles are far apart.
  // Let center A be at -x, center B at +x
  // Overlap area of two circles of radius R=1.5 separated by distance 2d:
  // We can approximate the separation distance based on probAB
  const radius = 1.5;
  const maxOverlapDistance = 0.4;
  const minOverlapDistance = 2.4;
  const t = probAB / Math.max(0.01, Math.min(probA, probB)); // overlap ratio
  const distance = minOverlapDistance - t * (minOverlapDistance - maxOverlapDistance);
  
  const centerA: [number, number] = [-distance / 2, 0];
  const centerB: [number, number] = [distance / 2, 0];

  return (
    <div className="glass" style={{ padding: '1.25rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <Icons.Sliders size={18} style={{ color: 'var(--primary)' }} />
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>事件概率调节面板 (维恩图)</span>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ width: '80px', color: 'var(--text-secondary)' }}>P(A) = {probA.toFixed(2)}</span>
          <input 
            type="range" min="0" max="1" step="0.05" value={probA} 
            onChange={(e) => handleAChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--primary)' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ width: '80px', color: 'var(--text-secondary)' }}>P(B) = {probB.toFixed(2)}</span>
          <input 
            type="range" min="0" max="1" step="0.05" value={probB} 
            onChange={(e) => handleBChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--secondary)' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ width: '80px', color: 'var(--text-secondary)' }}>P(A∩B) = {probAB.toFixed(2)}</span>
          <input 
            type="range" min="0" max="1" step="0.05" value={probAB} 
            onChange={(e) => handleABChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--formula)' }}
          />
        </div>
      </div>

      {/* Mafs Venn representation */}
      <div style={{ height: '180px', background: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <Mafs viewBox={{ x: [-3, 3], y: [-2, 2] }} pan={false} zoom={false}>
          {/* Universal set box */}
          <Polygon 
            points={[[-2.8, 1.8], [2.8, 1.8], [2.8, -1.8], [-2.8, -1.8]]} 
            color="var(--text-muted)"
            fillOpacity={0.02}
            strokeStyle="dashed"
          />
          <MafsText x={-2.5} y={1.5} color="var(--text-muted)">Ω ({neither.toFixed(2)})</MafsText>
          
          {/* Circle A */}
          <Circle center={centerA} radius={radius} color="var(--primary)" fillOpacity={0.25} />
          
          {/* Circle B */}
          <Circle center={centerB} radius={radius} color="var(--secondary)" fillOpacity={0.25} />
          
          {/* Texts */}
          <MafsText x={centerA[0] - 0.4} y={0} color="var(--text-primary)" svgTextProps={{ fontWeight: 'bold' }}>A ({onlyA})</MafsText>
          <MafsText x={centerB[0] + 0.4} y={0} color="var(--text-primary)" svgTextProps={{ fontWeight: 'bold' }}>B ({onlyB})</MafsText>
          {probAB > 0 && (
            <MafsText x={0} y={0} color="var(--formula)" svgTextProps={{ fontWeight: 'bold' }}>AB ({probAB.toFixed(2)})</MafsText>
          )}
        </Mafs>
      </div>

      {/* Probability calculation result list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
        <div>和事件 P(A∪B) = <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{union}</span></div>
        <div>差事件 P(A-B) = <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{onlyA}</span></div>
        <div>条件概率 P(A|B) = <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{probB > 0 ? (probAB / probB).toFixed(2) : '0.00'}</span></div>
        <div>条件概率 P(B|A) = <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{probA > 0 ? (probAB / probA).toFixed(2) : '0.00'}</span></div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 2. InlineDistribution: 离散/连续分布交互展示
// ----------------------------------------------------
export const InlineDistribution: React.FC<{
  type?: 'binomial' | 'normal' | 'poisson';
  n?: number;
  p?: number;
  mean?: number;
  stdDev?: number;
  lambda?: number;
}> = ({
  type = 'normal',
  n = 10,
  p = 0.5,
  mean = 0,
  stdDev = 1,
  lambda = 3
}) => {
  const [binomN, setBinomN] = useState(n);
  const [binomP, setBinomP] = useState(p);
  const [normMean, setNormMean] = useState(mean);
  const [normStd, setNormStd] = useState(stdDev);
  const [poissonLambda, setPoissonLambda] = useState(lambda);

  // Helper combinations
  const combinations = (n: number, k: number): number => {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    let res = 1;
    for (let i = 1; i <= k; i++) res = res * (n - i + 1) / i;
    return res;
  };

  // 渲染二项分布
  if (type === 'binomial') {
    const data = Array.from({ length: binomN + 1 }, (_, k) => {
      const prob = combinations(binomN, k) * Math.pow(binomP, k) * Math.pow(1 - binomP, binomN - k);
      return { k: k.toString(), probability: Number(prob.toFixed(4)) };
    });

    return (
      <div className="glass" style={{ padding: '1.25rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <Icons.BarChart2 size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>二项分布 B(n={binomN}, p={binomP.toFixed(2)}) 交互</span>
        </div>
        
        {/* Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ width: '80px', color: 'var(--text-secondary)' }}>n = {binomN}</span>
            <input type="range" min="2" max="30" step="1" value={binomN} onChange={(e) => setBinomN(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ width: '80px', color: 'var(--text-secondary)' }}>p = {binomP.toFixed(2)}</span>
            <input type="range" min="0.05" max="0.95" step="0.05" value={binomP} onChange={(e) => setBinomP(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--secondary)' }} />
          </div>
        </div>

        {/* Recharts Chart */}
        <div style={{ height: '160px', width: '100%', minWidth: 0, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="k" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}
                formatter={(val: any) => [`${(Number(val) * 100).toFixed(2)}%`, '概率']}
                labelFormatter={(label) => `成功 ${label} 次`}
              />
              <Bar dataKey="probability" radius={[3, 3, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Number(entry.k) === Math.round(binomN * binomP) ? 'var(--accent)' : 'var(--primary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '8px' }}>
          <div>期望 E(X) = {(binomN * binomP).toFixed(2)}</div>
          <div>方差 D(X) = {(binomN * binomP * (1 - binomP)).toFixed(2)}</div>
        </div>
      </div>
    );
  }

  // 渲染泊松分布
  if (type === 'poisson') {
    const data = Array.from({ length: Math.max(15, Math.ceil(poissonLambda * 3)) }, (_, k) => {
      // Poisson: P(X=k) = (lambda^k * e^-lambda) / k!
      let factorial = 1;
      for (let i = 1; i <= k; i++) factorial *= i;
      const prob = (Math.pow(poissonLambda, k) * Math.exp(-poissonLambda)) / factorial;
      return { k: k.toString(), probability: Number(prob.toFixed(4)) };
    });

    return (
      <div className="glass" style={{ padding: '1.25rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <Icons.BarChart2 size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>泊松分布 P(λ={poissonLambda.toFixed(1)}) 交互</span>
        </div>
        
        {/* Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ width: '80px', color: 'var(--text-secondary)' }}>λ (均率) = {poissonLambda.toFixed(1)}</span>
            <input type="range" min="0.5" max="10" step="0.5" value={poissonLambda} onChange={(e) => setPoissonLambda(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--primary)' }} />
          </div>
        </div>

        {/* Recharts Chart */}
        <div style={{ height: '160px', width: '100%', minWidth: 0, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="k" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}
                formatter={(val: any) => [`${(Number(val) * 100).toFixed(2)}%`, '概率']}
                labelFormatter={(label) => `事件发生 ${label} 次`}
              />
              <Bar dataKey="probability" radius={[3, 3, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Number(entry.k) === Math.round(poissonLambda) ? 'var(--accent)' : 'var(--primary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '8px' }}>
          <div>期望 E(X) = {poissonLambda.toFixed(1)}</div>
          <div>方差 D(X) = {poissonLambda.toFixed(1)}</div>
        </div>
      </div>
    );
  }

  // 渲染正态分布 density curve (continuous)
  const normPdf = (x: number) => {
    const coeff = 1 / (normStd * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - normMean) / normStd, 2);
    return coeff * Math.exp(exponent);
  };

  return (
    <div className="glass" style={{ padding: '1.25rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <Icons.TrendingUp size={18} style={{ color: 'var(--primary)' }} />
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>正态分布 N(μ={normMean.toFixed(1)}, σ²={(normStd * normStd).toFixed(2)})</span>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ width: '100px', color: 'var(--text-secondary)' }}>均值 μ = {normMean.toFixed(1)}</span>
          <input type="range" min="-3" max="3" step="0.2" value={normMean} onChange={(e) => setNormMean(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--primary)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ width: '100px', color: 'var(--text-secondary)' }}>标准差 σ = {normStd.toFixed(2)}</span>
          <input type="range" min="0.2" max="2" step="0.1" value={normStd} onChange={(e) => setNormStd(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--secondary)' }} />
        </div>
      </div>

      {/* Mafs Normal PDF */}
      <div style={{ height: '160px', background: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <Mafs viewBox={{ x: [-4, 4], y: [-0.1, 1.1] }} pan={false} zoom={false}>
          <Coordinates.Cartesian xAxis={{ lines: 1, labels: () => '' }} yAxis={{ lines: 0.5, labels: () => '' }} />
          
          <Plot.Inequality y={{ '<=': normPdf, '>=': () => 0 }} color="var(--primary)" fillOpacity={0.1} />
          <Plot.OfX y={normPdf} color="var(--primary)" weight={2.5} />
          
          {/* Mean line */}
          <Line.Segment point1={[normMean, 0]} point2={[normMean, normPdf(normMean)]} color="var(--primary)" style="dashed" />
        </Mafs>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
        正态分布下总面积恒等于 1。均值决定左右位置，标准差决定高矮胖瘦。
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. FormulaSteps: 交互式公式推导步骤器
// ----------------------------------------------------
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useVideoStore } from '../../store/useVideoStore';

const BlockMath: React.FC<{ math: string }> = ({ math }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        console.error(err);
        containerRef.current.textContent = math;
      }
    }
  }, [math]);

  return <div ref={containerRef} />;
};

export const FormulaSteps: React.FC<{ formula: string; title?: string; steps?: string[] }> = ({
  formula,
  title = "公式分步推导",
  steps = []
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Ensure steps has content
  const actualSteps = steps.length > 0 ? steps : ["加载推导第一步...", "加载推导第二步..."];

  return (
    <div className="glass" style={{ padding: '1.25rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icons.GitMerge size={16} style={{ color: 'var(--formula)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          步骤: {currentStep + 1} / {actualSteps.length}
        </div>
      </div>

      {/* Main formula container */}
      <div style={{ padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: '8px', overflowX: 'auto', marginBottom: '1rem' }}>
        <BlockMath math={formula} />
      </div>

      {/* Steps text */}
      <div style={{ minHeight: '60px', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--formula)' }}>
        <strong>第 {currentStep + 1} 步：</strong>
        <p style={{ marginTop: '0.25rem', margin: 0 }}>{actualSteps[currentStep]}</p>
      </div>

      {/* Step controls */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="btn btn-outline"
          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', opacity: currentStep === 0 ? 0.4 : 1 }}
        >
          上一步
        </button>
        <button
          onClick={() => setCurrentStep(prev => Math.min(actualSteps.length - 1, prev + 1))}
          disabled={currentStep === actualSteps.length - 1}
          className="btn btn-primary"
          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', opacity: currentStep === actualSteps.length - 1 ? 0.4 : 1 }}
        >
          下一步
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 4. ManimPlayer: HTML5 Manim MP4 动画播放器
// ----------------------------------------------------
export const ManimPlayer: React.FC<{ src: string; title?: string }> = ({
  src,
  title = "数学微课动画演示"
}) => {
  const setFloatingVideo = useVideoStore((state) => state.setFloatingVideo);
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const handleCanPlay = () => {
    // 视频可播放
  };

  return (
    <div style={{
      padding: '0.75rem',
      borderRadius: '10px',
      marginTop: '0.5rem',
      border: '1px solid var(--md-sys-color-outline-variant)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      // 白天模式：浅色背景 + 深色文字；黑夜模式：深色背景 + 浅色文字
      background: 'light-dark(var(--md-sys-color-surface-container-lowest), rgba(19, 19, 24, 0.75))',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        paddingBottom: '0.4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Icons.PlayCircle size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
          <span style={{
            fontWeight: 600,
            fontSize: '0.82rem',
            color: 'light-dark(var(--md-sys-color-on-surface), var(--text-primary))'
          }}>{title}</span>
        </div>
        {!hasError && (
          <button
            onClick={() => setFloatingVideo(src, title)}
            style={{
              fontSize: '0.7rem',
              padding: '0.15rem 0.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              background: 'transparent',
              border: '1px solid var(--md-sys-color-outline-variant)',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'light-dark(var(--md-sys-color-on-surface-variant), var(--text-secondary))'
            }}
          >
            <Icons.PictureInPicture size={11} />
            <span>小窗播放</span>
          </button>
        )}
      </div>

      <div style={{ width: '100%', borderRadius: '6px', overflow: 'hidden', background: '#000', border: '1px solid var(--md-sys-color-outline-variant)', aspectRatio: '16/9', position: 'relative' }}>
        {hasError ? (
          // 视频文件不存在时显示友好占位
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'light-dark(linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%), linear-gradient(135deg, #0f1115 0%, #1d2024 100%))',
            gap: '0.5rem', padding: '1rem'
          }}>
            <Icons.Film size={28} style={{ color: 'var(--md-sys-color-primary)', opacity: 0.6 }} />
            <span style={{
              fontSize: '0.75rem',
              color: 'light-dark(var(--md-sys-color-on-surface-variant), var(--text-muted))',
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              Manim 动画渲染文件<br/>
              <span style={{ color: 'var(--md-sys-color-primary)', fontWeight: 600 }}>开发中</span>，即将上线
            </span>
            <span style={{
              fontSize: '0.65rem',
              color: 'light-dark(var(--md-sys-color-outline), var(--text-muted))',
              opacity: 0.6,
              wordBreak: 'break-all',
              textAlign: 'center'
            }}>
              {src}
            </span>
          </div>
        ) : (
          <video
            src={src}
            controls
            style={{ width: '100%', height: '100%', display: 'block' }}
            onError={handleError}
            onCanPlay={handleCanPlay}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {!hasError && (
        <span style={{
          fontSize: '0.68rem',
          color: 'light-dark(var(--md-sys-color-on-surface-variant), var(--text-muted))'
        }}>
          * 基于 Manim 数学几何引擎编译生成。
        </span>
      )}
    </div>
  );
};
