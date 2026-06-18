import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface ToolCallDashboardProps {
  name: string;
  args?: string | Record<string, any>;
  status?: 'running' | 'success' | 'error';
  result?: string;
}

export const ToolCallDashboard: React.FC<ToolCallDashboardProps> = ({
  name,
  args = {},
  status = 'success',
  result = ''
}) => {
  const [expandArgs, setExpandArgs] = useState(false);
  const [expandResult, setExpandResult] = useState(false);

  // Format arguments into pretty string
  const formatArgs = () => {
    if (!args) return '{}';
    if (typeof args === 'string') {
      try {
        return JSON.stringify(JSON.parse(args), null, 2);
      } catch {
        return args;
      }
    }
    return JSON.stringify(args, null, 2);
  };

  // Get status details
  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          color: 'var(--primary)',
          icon: <Icons.Loader size={14} className="animate-spin" />,
          text: '正在运行...',
          bg: 'rgba(79, 195, 247, 0.05)',
          border: 'rgba(79, 195, 247, 0.2)'
        };
      case 'error':
        return {
          color: 'var(--error)',
          icon: <Icons.AlertTriangle size={14} />,
          text: '运行失败',
          bg: 'rgba(239, 83, 80, 0.05)',
          border: 'rgba(239, 83, 80, 0.2)'
        };
      case 'success':
      default:
        return {
          color: 'var(--success)',
          icon: <Icons.CheckCircle size={14} />,
          text: '运行成功',
          bg: 'rgba(102, 187, 106, 0.05)',
          border: 'rgba(102, 187, 106, 0.2)'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div 
      style={{
        margin: '1rem 0',
        padding: '0.85rem',
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '8px',
        fontSize: '0.8rem',
        fontFamily: 'monospace',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      {/* Title / Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
          <Icons.Cpu size={16} style={{ color: config.color }} />
          <span>API 内部工具调用:</span>
          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{name}()</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: config.color, fontWeight: 'bold' }}>
          {config.icon}
          <span>{config.text}</span>
        </div>
      </div>

      {/* Arguments Toggle */}
      <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
        <button 
          onClick={() => setExpandArgs(!expandArgs)} 
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.4rem 0.6rem',
            background: 'rgba(255,255,255,0.02)',
            color: 'var(--text-secondary)',
            textAlign: 'left',
            fontSize: '0.75rem'
          }}
        >
          <span>输入参数 (Arguments)</span>
          {expandArgs ? <Icons.ChevronUp size={12} /> : <Icons.ChevronDown size={12} />}
        </button>
        {expandArgs && (
          <pre style={{
            padding: '0.6rem',
            margin: 0,
            background: 'var(--bg-primary)',
            color: 'var(--text-muted)',
            overflowX: 'auto',
            fontSize: '0.75rem',
            lineHeight: '1.4'
          }}>{formatArgs()}</pre>
        )}
      </div>

      {/* Result Toggle */}
      {status !== 'running' && result && (
        <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
          <button 
            onClick={() => setExpandResult(!expandResult)} 
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.6rem',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text-secondary)',
              textAlign: 'left',
              fontSize: '0.75rem'
            }}
          >
            <span>返回结果 (Result)</span>
            {expandResult ? <Icons.ChevronUp size={12} /> : <Icons.ChevronDown size={12} />}
          </button>
          {expandResult && (
            <pre style={{
              padding: '0.6rem',
              margin: 0,
              background: 'var(--bg-primary)',
              color: 'var(--text-secondary)',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontSize: '0.75rem',
              lineHeight: '1.4',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>{result}</pre>
          )}
        </div>
      )}
    </div>
  );
};
