import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import * as Icons from 'lucide-react';
import 'katex/dist/katex.min.css';
import { getChapter } from '../content/chapters';
import { chapterContents, chapterExercises } from '../content/index';
import { useProgressStore } from '../store/useProgressStore';
import ExerciseCard from '../components/Exercises/ExerciseCard';
import { parseXmlTags } from '../utils/xmlParser';
import { InlineVenn, InlineDistribution, FormulaSteps, ManimPlayer } from '../components/AI/ChatMessageVisualizations';
import { ToolCallDashboard } from '../components/AI/ToolCallDashboard';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

const ChapterPage: React.FC = () => {
  const { chapterId, sectionId } = useParams<{ chapterId: string; sectionId: string }>();
  const navigate = useNavigate();
  const { markSectionComplete, completedSections } = useProgressStore();
  
  const id = Number(chapterId);
  const chapter = getChapter(id);
  
  if (!chapter) {
    return <div>章节不存在</div>;
  }

  // 默认显示第一小节
  const currentSectionId = sectionId || chapter.sections[0].id;
  const currentSection = chapter.sections.find(s => s.id === currentSectionId);
  
  // 从中心注册表动态加载章节内容
  const contentData = chapterContents[id]?.sections.find(s => s.id === currentSectionId);

  const handleNext = () => {
    markSectionComplete(currentSectionId);
    
    const currentIndex = chapter.sections.findIndex(s => s.id === currentSectionId);
    if (currentIndex < chapter.sections.length - 1) {
      const nextSection = chapter.sections[currentIndex + 1];
      navigate(`/chapter/${id}/section/${nextSection.id}`);
    } else {
      // 章节结束，导航回首页或显示完结面板
      navigate('/');
    }
  };

  const handlePrev = () => {
    const currentIndex = chapter.sections.findIndex(s => s.id === currentSectionId);
    if (currentIndex > 0) {
      const prevSection = chapter.sections[currentIndex - 1];
      navigate(`/chapter/${id}/section/${prevSection.id}`);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icons.Star
            key={star}
            size={14}
            fill={star <= rating ? 'var(--color-warning)' : 'none'}
            color={star <= rating ? 'var(--color-warning)' : 'var(--md-sys-color-outline-variant)'}
          />
        ))}
      </div>
    );
  };

  const ChapterIcon = (Icons as any)[chapter.icon] || Icons.HelpCircle;
  const hasPrev = chapter.sections.findIndex(s => s.id === currentSectionId) > 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Chapter Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '1.2rem', fontWeight: 700 }}>
          <span style={{ display: 'inline-flex', padding: '0.3rem', borderRadius: 'var(--md-sys-shape-corner-small)', background: 'var(--md-sys-color-surface-container-high)', color: chapter.color }}>
            <ChapterIcon size={20} />
          </span> 
          第 {chapter.id} 章 {chapter.title}
        </h1>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.75rem', alignItems: 'center' }}>
          <span>考研权重: {chapter.examWeight}%</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>难度:</span>
            {renderStars(chapter.difficulty)}
          </div>
          <span>预计学时: {chapter.estimatedHours}h</span>
        </div>
      </div>

      {/* Section Content */}
      {currentSection ? (
        <Card className="animate-fade-in" elevation={1}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--md-sys-color-outline-variant)', paddingBottom: '1rem' }}>
            <h2 style={{ margin: 0, border: 'none', padding: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
              {currentSection.id} {currentSection.title}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {currentSection.isImportant && (
                <Badge variant="warning">重点</Badge>
              )}
              {currentSection.isHard && (
                <Badge variant="error">难点</Badge>
              )}
            </div>
          </div>

          <div style={{ fontSize: 'var(--md-sys-typescale-body-large-font)', lineHeight: 'var(--md-sys-typescale-body-large-line-height)', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--md-sys-color-on-surface)' }}>
            {contentData ? (
              parseXmlTags(contentData.content).map((block, idx) => {
                if (block.type === 'markdown') {
                  return (
                    <ReactMarkdown
                      key={idx}
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        h3: ({node, ...props}) => <h3 style={{ marginTop: '2.5rem', marginBottom: '1.25rem', color: 'var(--md-sys-color-primary)', borderBottom: '1px solid var(--md-sys-color-outline-variant)', paddingBottom: '0.4rem' }} {...props} />,
                        p: ({node, ...props}) => <p style={{ marginBottom: '1.25rem' }} {...props} />,
                        blockquote: ({node, ...props}) => (
                          <blockquote style={{ 
                            borderLeft: '4px solid var(--md-sys-color-primary)', 
                            background: 'var(--md-sys-color-surface-container-high)', 
                            margin: '1.25rem 0', 
                            padding: '1.25rem', 
                            borderRadius: '0 var(--md-sys-shape-corner-small) var(--md-sys-shape-corner-small) 0',
                            fontSize: 'var(--md-sys-typescale-body-medium-font)',
                            color: 'var(--md-sys-color-on-surface-variant)'
                          }} {...props} />
                        ),
                      }}
                    >
                      {block.content || ''}
                    </ReactMarkdown>
                  );
                }

                const { tagName, props } = block;
                switch (tagName) {
                  case 'InteractiveVenn':
                    return <InlineVenn key={idx} {...(props as any)} />;
                  case 'InteractiveDistribution':
                    return <InlineDistribution key={idx} {...(props as any)} />;
                  case 'InteractiveFormulaDerivation':
                  case 'FormulaSteps':
                    return <FormulaSteps key={idx} formula={props?.formula || ''} {...(props as any)} />;
                  case 'ManimVideo':
                  case 'ManimAnimation':
                    return <ManimPlayer key={idx} src={props?.src || ''} {...(props as any)} />;
                  case 'ToolCall':
                    return <ToolCallDashboard key={idx} name={props?.name || ''} {...(props as any)} />;
                  default:
                    return (
                      <div key={idx} style={{ padding: '0.5rem', border: '1px dashed var(--md-sys-color-outline-variant)', color: 'var(--md-sys-color-outline)', fontSize: 'var(--md-sys-typescale-body-small-font)', borderRadius: 'var(--md-sys-shape-corner-small)', margin: '0.5rem 0' }}>
                        [&lt;{tagName} /&gt; 交互式内容正在加载或不可用]
                      </div>
                    );
                }
              })
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icons.FolderOpen size={48} style={{ color: 'var(--md-sys-color-outline)' }} />
                </div>
                <p>该章节的详细内容正在生成中...</p>
                <p>目前的关键知识点：</p>
                <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '1rem' }}>
                  {currentSection.keyPoints.map((kp, idx) => (
                    <li key={idx}>{kp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '1rem', marginBottom: '0.5rem' }}>
            <Button 
              variant="outline"
              onClick={handlePrev} 
              disabled={!hasPrev}
              leftIcon={<Icons.ArrowLeft size={16} />}
            >
              上一节
            </Button>
            <Button 
              variant="primary"
              onClick={handleNext}
              leftIcon={completedSections.has(currentSectionId) ? <Icons.CheckCircle size={16} /> : undefined}
              rightIcon={!completedSections.has(currentSectionId) ? <Icons.ArrowRight size={16} /> : undefined}
            >
              {completedSections.has(currentSectionId) ? '已学习，下一节' : '标记完成并继续'}
            </Button>
          </div>

          {/* Exercises Section */}
          {chapterExercises[id] && chapterExercises[id].filter(ex => ex.sectionId === currentSectionId).length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)', paddingBottom: '0.4rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--md-sys-color-on-surface)', fontSize: '0.9rem', fontWeight: 600 }}>
                <Icons.PenTool size={15} style={{ color: 'var(--md-sys-color-primary)' }} /> 随堂测验
              </h3>
              {chapterExercises[id]
                .filter(ex => ex.sectionId === currentSectionId)
                .map(exercise => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
            </div>
          )}
        </Card>
      ) : (
        <div>小节未找到</div>
      )}
    </div>
  );
};

export default ChapterPage;
