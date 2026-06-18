import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { chapters } from '../../content/chapters';
import { IconButton } from '../common/IconButton';
import DropdownMenu from '../common/DropdownMenu';
import { useSettingsStore } from '../../store/useSettingsStore';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { chapterId, sectionId } = useParams<{ chapterId: string; sectionId: string }>();
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([Number(chapterId) || 1]));
  const { theme, toggleTheme } = useSettingsStore();

  const toggleChapter = (id: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedChapters(newExpanded);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sidebar Header */}
      <div style={{ 
        padding: '0.75rem 0.75rem', 
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center' }} className="text-gradient">
          <Icons.GraduationCap size={18} style={{ marginRight: '0.4rem', color: 'var(--md-sys-color-primary)' }} />
          概率学习平台
        </h1>
        <IconButton onClick={onClose} icon={<Icons.X size={16} />} size="sm" />
      </div>

      {/* Chapters List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {chapters.map((chapter) => {
          const isExpanded = expandedChapters.has(chapter.id);
          const isActiveChapter = Number(chapterId) === chapter.id;
          
          // Dynamically resolve icon component
          const IconComponent = (Icons as any)[chapter.icon] || Icons.HelpCircle;

          return (
            <div key={chapter.id} style={{ marginBottom: '0.15rem' }}>
              {/* Chapter Header */}
              <div 
                onClick={() => {
                  toggleChapter(chapter.id);
                  navigate(`/chapter/${chapter.id}`);
                }}
                style={{
                  padding: '0.4rem 0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  background: isActiveChapter ? 'var(--md-sys-color-secondary-container)' : 'transparent',
                  borderLeft: `3px solid ${isActiveChapter ? 'var(--md-sys-color-primary)' : 'transparent'}`,
                  transition: 'all 0.2s var(--md-sys-motion-easing-emphasized-decelerate)'
                }}
              >
                <span style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <IconComponent size={16} style={{ color: isActiveChapter ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)' }} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: isActiveChapter ? 600 : 500, fontSize: '0.85rem', color: isActiveChapter ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)' }}>
                    第 {chapter.id} 章 {chapter.title}
                  </div>
                </div>
                <span style={{ color: 'var(--md-sys-color-outline)', display: 'flex', alignItems: 'center' }}>
                  {isExpanded ? <Icons.ChevronDown size={14} /> : <Icons.ChevronRight size={14} />}
                </span>
              </div>

              {/* Sections (Expanded) */}
              {isExpanded && (
                <div style={{ padding: '0.15rem 0' }}>
                  {chapter.sections.map((section) => {
                    const isActiveSection = isActiveChapter && sectionId === section.id;
                    
                    return (
                      <div
                        key={section.id}
                        onClick={() => navigate(`/chapter/${chapter.id}/section/${section.id}`)}
                        style={{
                          padding: '0.35rem 0.75rem 0.35rem 2.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          color: isActiveSection ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
                          background: isActiveSection ? 'rgba(168, 199, 250, 0.08)' : 'transparent', // using hover state opacity on primary
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.2s'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActiveSection ? 600 : 400 }}>
                          {section.id} {section.title}
                        </span>
                        {section.isImportant && (
                          <span title="重点" style={{ display: 'inline-flex' }}>
                            <Icons.Star size={10} fill="var(--color-warning)" color="var(--color-warning)" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--md-sys-color-outline-variant)', fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>进度: 0%</span>
          <DropdownMenu
            trigger={
              <IconButton 
                icon={<Icons.Settings size={16} />} 
                size="sm" 
                title="设置" 
              />
            }
            placement="top-end"
            items={[
              {
                id: 'theme-toggle',
                label: theme === 'dark' ? '日间模式' : '夜间模式',
                icon: theme === 'dark' ? <Icons.Sun size={14} /> : <Icons.Moon size={14} />,
                onClick: toggleTheme
              },
              {
                id: 'separator',
                label: '',
                isSeparator: true
              },
              {
                id: 'theme-status',
                label: `当前: ${theme === 'dark' ? '夜间模式' : '日间模式'}`,
                icon: <Icons.Info size={14} />,
                disabled: true
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
