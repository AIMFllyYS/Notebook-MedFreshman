import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import * as Icons from 'lucide-react';
import 'katex/dist/katex.min.css';
import type { Exercise } from '../../types/exercise';

interface ExerciseCardProps {
  exercise: Exercise;
  onAnswer?: (isCorrect: boolean) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isCorrect = selectedOption === exercise.answer;
  const hasAnswered = selectedOption !== null;

  const handleSelect = (opt: string) => {
    if (hasAnswered) return; // Prevent changing after answered
    setSelectedOption(opt);
    if (onAnswer) {
      onAnswer(opt === exercise.answer);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'basic': return 'var(--success)';
      case 'intermediate': return 'var(--primary)';
      case 'challenge': return 'var(--accent)';
      case 'exam': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  const getDifficultyText = (diff: string) => {
    switch(diff) {
      case 'basic': return '基础题';
      case 'intermediate': return '进阶题';
      case 'challenge': return '挑战题';
      case 'exam': return '真题';
      default: return diff;
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', borderLeft: `4px solid ${getDifficultyColor(exercise.difficulty)}` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ 
            background: `color-mix(in srgb, ${getDifficultyColor(exercise.difficulty)} 20%, transparent)`,
            color: getDifficultyColor(exercise.difficulty),
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            {getDifficultyText(exercise.difficulty)}
          </span>
          {exercise.tags.map(tag => (
            <span key={tag} style={{ 
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Question */}
      <div style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {exercise.question}
        </ReactMarkdown>
      </div>

      {/* Options */}
      {exercise.options && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {exercise.options.map((opt, idx) => {
            const prefix = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = selectedOption === prefix;
            const isCorrectOption = prefix === exercise.answer;
            
            let bgStyle = 'rgba(255,255,255,0.03)';
            let borderStyle = '1px solid var(--border-color)';
            
            if (hasAnswered) {
              if (isCorrectOption) {
                bgStyle = 'rgba(102, 187, 106, 0.1)'; // Success green
                borderStyle = '1px solid var(--success)';
              } else if (isSelected && !isCorrectOption) {
                bgStyle = 'rgba(239, 83, 80, 0.1)'; // Error red
                borderStyle = '1px solid var(--error)';
              }
            } else if (isSelected) {
              bgStyle = 'rgba(79, 195, 247, 0.1)';
              borderStyle = '1px solid var(--primary)';
            }

            return (
              <button
                key={prefix}
                onClick={() => handleSelect(prefix)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  background: bgStyle,
                  border: borderStyle,
                  borderRadius: '8px',
                  cursor: hasAnswered ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontWeight: 'bold', marginRight: '1rem', color: 'var(--primary)' }}>{prefix}.</span>
                <div style={{ flex: 1, pointerEvents: 'none' }}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {opt}
                  </ReactMarkdown>
                </div>
                {hasAnswered && isCorrectOption && <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center' }}><Icons.Check size={18} /></span>}
                {hasAnswered && isSelected && !isCorrectOption && <span style={{ color: 'var(--error)', display: 'flex', alignItems: 'center' }}><Icons.X size={18} /></span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Actions / Feedback */}
      {hasAnswered && (
        <div className="animate-slide-up" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ 
              color: isCorrect ? 'var(--success)' : 'var(--error)', 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {isCorrect ? (
                <>
                  <Icons.CheckCircle2 size={18} /> 回答正确！
                </>
              ) : (
                <>
                  <Icons.AlertCircle size={18} /> 回答错误，再看看解析吧。
                </>
              )}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setShowHint(!showHint)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <Icons.HelpCircle size={14} /> 提示
              </button>
              <button onClick={() => setShowSolution(!showSolution)} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <Icons.BookOpen size={14} /> 深度解析
              </button>
            </div>
          </div>

          {showHint && exercise.hints && exercise.hints.length > 0 && (
            <div style={{ padding: '1rem', background: 'rgba(255, 238, 88, 0.05)', borderLeft: '4px solid var(--formula)', marginBottom: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong style={{ color: 'var(--formula)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <Icons.Lightbulb size={16} /> 提示：
              </strong>
              <ul style={{ margin: '0.5rem 0 0 1.5rem', color: 'var(--text-secondary)' }}>
                {exercise.hints.map((hint, i) => (
                  <li key={i}><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{hint}</ReactMarkdown></li>
                ))}
              </ul>
            </div>
          )}

          {showSolution && (
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Icons.BookOpen size={18} /> 深度解析：
              </h4>
              <div style={{ color: 'var(--text-secondary)' }}>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {exercise.solution}
                </ReactMarkdown>
              </div>
              
              {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                  <strong style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    <Icons.AlertTriangle size={16} /> 易错点分析：
                  </strong>
                  <ul style={{ margin: '0.5rem 0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {exercise.commonMistakes.map((mistake, i) => (
                      <li key={i}><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{mistake}</ReactMarkdown></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;
