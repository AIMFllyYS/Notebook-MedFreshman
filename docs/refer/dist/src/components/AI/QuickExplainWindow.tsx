import React, { useEffect, useState, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useChatUIStore } from '../../store/useChatUIStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import ChatMessageComponent from './ChatMessage';
import type { ChatMessage } from '../../types/chat';

export const QuickExplainWindow: React.FC = () => {
  const { quickExplainText, setQuickExplainText } = useChatUIStore();
  const { aiApiUrl, aiModel, aiApiKey } = useSettingsStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 500 });
  const [message, setMessage] = useState<ChatMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  useEffect(() => {
    if (!quickExplainText) {
      setMessage(null);
      setError(null);
      return;
    }

    const fetchExplanation = async () => {
      setIsLoading(true);
      setError(null);
      
      const assistantId = Date.now().toString();
      const initialMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      setMessage(initialMessage);

      try {
        const prompt = `请用最通俗易懂的语言，直接解释以下选中的文本段落（无需铺垫，即答即可）：\n\n<SelectedText>\n${quickExplainText}\n</SelectedText>`;
        
        const response = await fetch(aiApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiApiKey}`
          },
          body: JSON.stringify({
            model: aiModel,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          })
        });

        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        if (!reader) throw new Error('流读取失败');

        let done = false;
        let buffer = '';
        let currentContent = '';

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6));
                  const delta = data.choices[0]?.delta;
                  if (delta?.content) {
                    currentContent += delta.content;
                    setMessage({
                      ...initialMessage,
                      content: currentContent,
                    });
                  }
                } catch (e) {
                  // ignore parse error
                }
              }
            }
          }
        }
      } catch (err: any) {
        setError(err.message || '获取解释失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [quickExplainText, aiApiUrl, aiApiKey, aiModel]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  if (!quickExplainText) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        maxHeight: '450px',
        background: 'var(--md-sys-color-surface-container-lowest)',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px var(--md-sys-color-outline-variant)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'scale-up 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      {/* Header / Drag Handle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          padding: '10px 16px',
          background: 'var(--md-sys-color-surface-container-high)',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--md-sys-color-primary)' }}>
          <Icons.Sparkles size={16} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>AI 快捷解释</span>
        </div>
        <button
          onClick={() => setQuickExplainText(null)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--md-sys-color-on-surface-variant)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--md-sys-color-surface-variant)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icons.X size={16} />
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          padding: '12px',
          background: 'var(--md-sys-color-surface-variant)',
          borderRadius: '8px',
          borderLeft: '4px solid var(--md-sys-color-tertiary)',
          fontSize: '13px',
          color: 'var(--md-sys-color-on-surface-variant)',
          fontStyle: 'italic',
          lineHeight: '1.5'
        }}>
          "{quickExplainText}"
        </div>

        {error && (
          <div style={{ color: 'var(--md-sys-color-error)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ margin: '-8px' }}>
            {/* Reuse ChatMessageComponent without follow-up capabilities */}
            <ChatMessageComponent message={message} isStreaming={isLoading} />
          </div>
        )}

        {isLoading && !message?.content && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-primary)', fontSize: '13px' }}>
            <Icons.Loader size={14} className="animate-spin" />
            <span>AI 正在思考...</span>
          </div>
        )}
      </div>
    </div>
  );
};
