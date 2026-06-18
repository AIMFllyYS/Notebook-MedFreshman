import React, { useState } from 'react';
import ChatPanel from '../AI/ChatPanel';
import { useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import VennDiagram from '../Visualizations/VennDiagram';
import BinomialDistribution from '../Visualizations/BinomialDistribution';
import NormalDistribution from '../Visualizations/NormalDistribution';
import { ManimPlayer } from '../AI/ChatMessageVisualizations';
import { IconButton } from '../common/IconButton';

interface RightPanelProps {
  onClose: () => void;
}

const CHAPTER_VIDEOS = [
  { chapterId: '3', title: '二维随机变量函数的分布：卷积公式几何物理直观', src: '/videos/ch03/convolution.mp4' },
  { chapterId: '4', title: '期望与方差的物理几何直观意义', src: '/videos/ch04/expectation_gravity.mp4' },
  { chapterId: '5', title: '中心极限定理：任意分布之和向正态分布的演变动画', src: '/videos/ch05/clt_convergence.mp4' },
  { chapterId: '6', title: '三大抽样分布（卡方、t、F 分布）的几何构造物理意义', src: '/videos/ch06/t_distribution.mp4' },
  { chapterId: '7', title: '置信区间的几何直观与覆盖率模拟', src: '/videos/ch07/confidence_interval.mp4' },
  { chapterId: '8', title: '第一类与第二类错误（弃真与纳伪）的几何权衡动画', src: '/videos/ch08/hypothesis_errors.mp4' },
  { chapterId: '9', title: '最小二乘回归线的几何投影与方差分解物理意义', src: '/videos/ch09/regression_line.mp4' }
];

const RightPanel: React.FC<RightPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'viz' | 'ai' | 'video'>('ai');
  const { chapterId, sectionId } = useParams<{ chapterId: string; sectionId: string }>();
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; src: string } | null>(null);

  // Determine which visualization to show based on the current section
  const renderVisualization = () => {
    if (chapterId === '1') {
      return <VennDiagram />;
    }
    if (chapterId === '2') {
      if (sectionId === '2.2') return <BinomialDistribution />;
      if (sectionId === '2.4') return <NormalDistribution />;
      return <NormalDistribution />; // default for ch2
    }
    
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-on-surface-variant)', padding: '2rem', textAlign: 'center' }}>
        <p>第 {chapterId} 章 {sectionId} 节的交互式可视化图表正在开发中...</p>
      </div>
    );
  };

  // Get current chapter video
  const currentChapterVideo = CHAPTER_VIDEOS.find(v => v.chapterId === chapterId);
  const activeVideo = selectedVideo || currentChapterVideo || CHAPTER_VIDEOS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--md-sys-color-surface-container-low)' }}>
      {/* Header Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        padding: '0.25rem 0.25rem 0 0.25rem',
        alignItems: 'center'
      }}>
        <button 
          onClick={() => { setActiveTab('viz'); setSelectedVideo(null); }}
          style={{
            flex: 1,
            padding: '0.4rem 0.25rem',
            background: activeTab === 'viz' ? 'var(--md-sys-color-surface-container-high)' : 'transparent',
            borderStyle: 'solid',
            borderWidth: '0px 0px 2px 0px',
            borderColor: activeTab === 'viz' ? 'var(--md-sys-color-primary)' : 'transparent',
            color: activeTab === 'viz' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
            fontWeight: activeTab === 'viz' ? 600 : 500,
            borderTopLeftRadius: 'var(--md-sys-shape-corner-small)',
            borderTopRightRadius: 'var(--md-sys-shape-corner-small)',
            transition: 'all 0.2s var(--md-sys-motion-easing-emphasized-decelerate)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          <Icons.AreaChart size={13} />
          <span>可视化</span>
        </button>

        <button 
          onClick={() => { setActiveTab('video'); setSelectedVideo(null); }}
          style={{
            flex: 1,
            padding: '0.4rem 0.25rem',
            background: activeTab === 'video' ? 'var(--md-sys-color-surface-container-high)' : 'transparent',
            borderStyle: 'solid',
            borderWidth: '0px 0px 2px 0px',
            borderColor: activeTab === 'video' ? 'var(--md-sys-color-primary)' : 'transparent',
            color: activeTab === 'video' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
            fontWeight: activeTab === 'video' ? 600 : 500,
            borderTopLeftRadius: 'var(--md-sys-shape-corner-small)',
            borderTopRightRadius: 'var(--md-sys-shape-corner-small)',
            transition: 'all 0.2s var(--md-sys-motion-easing-emphasized-decelerate)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          <Icons.PlayCircle size={13} />
          <span>微课动画</span>
        </button>

        <button 
          onClick={() => { setActiveTab('ai'); setSelectedVideo(null); }}
          style={{
            flex: 1,
            padding: '0.4rem 0.25rem',
            background: activeTab === 'ai' ? 'var(--md-sys-color-surface-container-high)' : 'transparent',
            borderStyle: 'solid',
            borderWidth: '0px 0px 2px 0px',
            borderColor: activeTab === 'ai' ? 'var(--md-sys-color-primary)' : 'transparent',
            color: activeTab === 'ai' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
            fontWeight: activeTab === 'ai' ? 600 : 500,
            borderTopLeftRadius: 'var(--md-sys-shape-corner-small)',
            borderTopRightRadius: 'var(--md-sys-shape-corner-small)',
            transition: 'all 0.2s var(--md-sys-motion-easing-emphasized-decelerate)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          <Icons.Sparkles size={13} />
          <span>AI助教</span>
        </button>

        <IconButton 
          icon={<Icons.X size={14} />} 
          size="sm" 
          onClick={onClose} 
          title="关闭右侧面板"
          style={{ marginLeft: '0.25rem' }}
        />
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'viz' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflowY: 'auto' }}>
            {renderVisualization()}
          </div>
        )}
        
        {activeTab === 'video' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.5rem', overflowY: 'auto', gap: '0.5rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--md-sys-color-on-surface)', fontSize: '0.8rem', fontWeight: 600 }}>正在播放</h4>
              <ManimPlayer src={activeVideo.src} title={activeVideo.title} />
            </div>

            <div style={{ borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '0.5rem' }}>
              <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.75rem', fontWeight: 500 }}>精选 Manim 数学动画库</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {CHAPTER_VIDEOS.map((video) => (
                  <button
                    key={video.chapterId}
                    onClick={() => setSelectedVideo(video)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--md-sys-shape-corner-small)',
                      background: activeVideo.src === video.src ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container)',
                      border: '1px solid',
                      borderColor: activeVideo.src === video.src ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: activeVideo.src === video.src ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
                      fontSize: '11px',
                      transition: 'all 0.2s var(--md-sys-motion-easing-emphasized-decelerate)'
                    }}
                  >
                    <Icons.Play size={12} style={{ color: activeVideo.src === video.src ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)', flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>Ch {video.chapterId}</strong>: {video.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && <ChatPanel />}
      </div>
    </div>
  );
};

export default RightPanel;
