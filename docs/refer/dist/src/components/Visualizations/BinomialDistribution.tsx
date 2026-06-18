import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BinomialDistributionProps {
  title?: string;
}

const BinomialDistribution: React.FC<BinomialDistributionProps> = ({ title = "二项分布 B(n, p)" }) => {
  const [n, setN] = useState<number>(10);
  const [p, setP] = useState<number>(0.5);

  // Calculate combinations C(n, k)
  const combinations = (n: number, k: number): number => {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    let res = 1;
    for (let i = 1; i <= k; i++) {
      res = res * (n - i + 1) / i;
    }
    return res;
  };

  // Generate distribution data
  const data = Array.from({ length: n + 1 }, (_, k) => {
    const probability = combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    return {
      k: k.toString(),
      probability: Number(probability.toFixed(4)),
      isExpected: k === Math.round(n * p)
    };
  });

  const expectedValue = (n * p).toFixed(2);
  const variance = (n * p * (1 - p)).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
      
      {/* Controls */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ color: 'var(--text-muted)' }}>试验次数 $n$: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{n}</span></label>
          </div>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={n} 
            onChange={(e) => setN(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ color: 'var(--text-muted)' }}>成功概率 $p$: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{p.toFixed(2)}</span></label>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={p} 
            onChange={(e) => setP(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--secondary)' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
         <div style={{ color: 'var(--text-secondary)' }}>期望 $E(X) = np$: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{expectedValue}</span></div>
         <div style={{ color: 'var(--text-secondary)' }}>方差 $D(X) = np(1-p)$: <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{variance}</span></div>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: '300px', minWidth: 0, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis 
              dataKey="k" 
              stroke="var(--text-muted)" 
              tick={{ fill: 'var(--text-muted)' }}
              label={{ value: '成功次数 k', position: 'bottom', fill: 'var(--text-muted)', dy: 10 }} 
            />
            <YAxis 
              stroke="var(--text-muted)" 
              tick={{ fill: 'var(--text-muted)' }}
              label={{ value: '概率 P(X=k)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }} 
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              formatter={(value: any) => [`${(Number(value) * 100).toFixed(2)}%`, '概率']}
              labelFormatter={(label) => `成功 ${label} 次`}
            />
            <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isExpected ? 'var(--accent)' : 'var(--primary)'} 
                  fillOpacity={entry.isExpected ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        橘红色柱子表示最可能发生的次数（接近期望值）。
      </div>
    </div>
  );
};

export default BinomialDistribution;
