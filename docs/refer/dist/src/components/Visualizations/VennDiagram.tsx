import React, { useState } from 'react';
import { Mafs, Circle, Text, Polygon } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';

interface VennDiagramProps {
  title?: string;
}

const VennDiagram: React.FC<VennDiagramProps> = ({ title = "事件关系与运算可视化" }) => {
  const [activeSet, setActiveSet] = useState<'A' | 'B' | 'AUB' | 'A^B' | 'A-B' | 'none'>('none');

  // Centers for the two circles
  const centerA: [number, number] = [-1, 0];
  const centerB: [number, number] = [1, 0];
  const radius = 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeSet === 'A' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSet('A')}
          style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
        >
          事件 A
        </button>
        <button 
          className={`btn ${activeSet === 'B' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSet('B')}
          style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
        >
          事件 B
        </button>
        <button 
          className={`btn ${activeSet === 'AUB' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSet('AUB')}
          style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
        >
          并集 A∪B
        </button>
        <button 
          className={`btn ${activeSet === 'A^B' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSet('A^B')}
          style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
        >
          交集 A∩B
        </button>
        <button 
          className={`btn ${activeSet === 'A-B' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSet('A-B')}
          style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
        >
          差集 A-B
        </button>
        <button 
          className={`btn btn-outline`}
          onClick={() => setActiveSet('none')}
          style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}
        >
          重置
        </button>
      </div>

      <div style={{ flex: 1, minHeight: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <Mafs 
          viewBox={{ x: [-4, 4], y: [-3, 3] }} 
          preserveAspectRatio="contain"
          pan={false}
          zoom={false}
        >
          {/* Universal Set Boundary */}
          <Polygon 
            points={[[-3.8, 2.8], [3.8, 2.8], [3.8, -2.8], [-3.8, -2.8]]} 
            color="var(--text-muted)"
            fillOpacity={0}
            strokeStyle="dashed"
          />
          <Text x={-3.5} y={2.5} color="var(--text-muted)">Ω</Text>

          {/* Conditional Highlights based on activeSet */}
          
          {/* Base Circles (unfilled) */}
          {(activeSet === 'none' || activeSet === 'A^B') && (
            <>
              <Circle center={centerA} radius={radius} color="var(--primary)" fillOpacity={activeSet === 'A^B' ? 0 : 0.1} />
              <Circle center={centerB} radius={radius} color="var(--secondary)" fillOpacity={activeSet === 'A^B' ? 0 : 0.1} />
            </>
          )}

          {/* A only */}
          {activeSet === 'A' && (
            <>
              <Circle center={centerA} radius={radius} color="var(--primary)" fillOpacity={0.4} />
              <Circle center={centerB} radius={radius} color="var(--secondary)" fillOpacity={0} />
            </>
          )}

          {/* B only */}
          {activeSet === 'B' && (
            <>
              <Circle center={centerA} radius={radius} color="var(--primary)" fillOpacity={0} />
              <Circle center={centerB} radius={radius} color="var(--secondary)" fillOpacity={0.4} />
            </>
          )}

          {/* Union A U B */}
          {activeSet === 'AUB' && (
            <>
              <Circle center={centerA} radius={radius} color="var(--success)" fillOpacity={0.4} />
              <Circle center={centerB} radius={radius} color="var(--success)" fillOpacity={0.4} />
            </>
          )}

          {/* Difference A - B (This is a bit tricky to draw perfectly with basic primitives, 
              so we layer: fill A, then overwrite B area with background color, then stroke B) */}
          {activeSet === 'A-B' && (
            <>
              <Circle center={centerA} radius={radius} color="var(--accent)" fillOpacity={0.5} />
              <Circle center={centerB} radius={radius} color="var(--bg-primary)" fillOpacity={1} strokeStyle="solid" />
              {/* Redraw the stroke of A that got hidden */}
              <Circle center={centerA} radius={radius} color="var(--primary)" fillOpacity={0} />
            </>
          )}

          {/* Intersection A ^ B */}
          {/* Draw a polygon for the lens intersection approximately */}
          {activeSet === 'A^B' && (
            <>
              {/* Simple approximation of the intersection region for visual purposes */}
              <Circle center={centerA} radius={radius} color="var(--primary)" fillOpacity={0} />
              <Circle center={centerB} radius={radius} color="var(--secondary)" fillOpacity={0} />
              
              {/* We can highlight the intersection using Mafs coordinates and a polygon approximation 
                  Or more simply by layering circles. But Mafs doesn't have clipping masks out of the box. 
                  Let's just use text to highlight it strongly */}
              <Circle center={[0,0]} radius={1.732-0.5} color="var(--formula)" fillOpacity={0.6} />
            </>
          )}

          {/* Labels */}
          <Text x={-2.5} y={0} color="var(--primary)" size={24}>A</Text>
          <Text x={2.5} y={0} color="var(--secondary)" size={24}>B</Text>
        </Mafs>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        {activeSet === 'none' && "点击上方按钮查看不同的事件运算。"}
        {activeSet === 'A' && "事件A发生的区域。"}
        {activeSet === 'B' && "事件B发生的区域。"}
        {activeSet === 'AUB' && "和事件 A∪B：事件A或事件B中至少有一个发生的区域。"}
        {activeSet === 'A^B' && "积事件 A∩B：事件A和事件B同时发生的区域。"}
        {activeSet === 'A-B' && "差事件 A-B：事件A发生且事件B不发生的区域。"}
      </div>
    </div>
  );
};

export default VennDiagram;
