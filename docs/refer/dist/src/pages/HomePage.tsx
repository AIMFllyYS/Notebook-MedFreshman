import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { chapters } from '../content/chapters';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '4rem 0 3rem' }} className="animate-fade-in">
        <h1 style={{ marginBottom: '1rem' }} className="text-gradient">
          概率论与数理统计
        </h1>
        <p style={{ fontSize: 'var(--md-sys-typescale-title-medium-font)', color: 'var(--md-sys-color-on-surface-variant)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          基于 AI 的交互式自学平台，包含完整知识点、动态可视化与智能解题辅导。
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => navigate('/chapter/1/section/1.1')}
          >
            开始学习 Ch 1
          </Button>
          <Button variant="outline" size="lg">
            查看大纲
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginBottom: '4rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Icons.BookOpen size={28} style={{ color: 'var(--md-sys-color-primary)', marginBottom: '0.5rem' }} />
          <div><span style={{ fontSize: 'var(--md-sys-typescale-headline-small-font)', color: 'var(--md-sys-color-on-surface)', fontWeight: 600 }}>9</span> 章核心内容</div>
        </div>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Icons.Award size={28} style={{ color: 'var(--md-sys-color-tertiary)', marginBottom: '0.5rem' }} />
          <div><span style={{ fontSize: 'var(--md-sys-typescale-headline-small-font)', color: 'var(--md-sys-color-on-surface)', fontWeight: 600 }}>60+</span> 知识点</div>
        </div>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Icons.Activity size={28} style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }} />
          <div><span style={{ fontSize: 'var(--md-sys-typescale-headline-small-font)', color: 'var(--md-sys-color-on-surface)', fontWeight: 600 }}>20+</span> 交互动画</div>
        </div>
      </div>

      {/* Chapters Grid */}
      <h2 style={{ marginBottom: '2rem', borderBottom: 'none' }}>学习路线图</h2>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1.5rem' 
        }}
      >
        {chapters.map((chapter) => {
          const IconComponent = (Icons as any)[chapter.icon] || Icons.HelpCircle;

          return (
            <motion.div 
              key={chapter.id} 
              variants={itemVariants}
            >
              <Card 
                interactive 
                elevation={1}
                onClick={() => navigate(`/chapter/${chapter.id}`)}
                style={{ 
                  borderLeft: `4px solid ${chapter.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: 'var(--md-sys-shape-corner-small)', background: 'var(--md-sys-color-surface-container-high)', marginBottom: '0.75rem', color: chapter.color }}>
                      <IconComponent size={24} />
                    </span>
                    <h3 style={{ margin: 0, color: 'var(--md-sys-color-on-surface)' }}>
                      第 {chapter.id} 章 {chapter.title}
                    </h3>
                    <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: 'var(--md-sys-typescale-body-medium-font)', marginTop: '0.2rem' }}>
                      {chapter.subtitle}
                    </div>
                  </div>
                  <Badge variant={chapter.examWeight > 15 ? 'warning' : 'secondary'}>
                    考研: {chapter.examWeight}%
                  </Badge>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--md-sys-typescale-body-small-font)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>难度:</span>
                      {renderStars(chapter.difficulty)}
                    </div>
                    <span>约 {chapter.estimatedHours} 小时</span>
                  </div>
                  
                  {/* Progress Bar (Placeholder) */}
                  <div style={{ width: '100%', height: '4px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: '0%', height: '100%', background: chapter.color }}></div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default HomePage;
