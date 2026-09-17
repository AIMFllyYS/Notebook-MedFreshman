import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ComposerCommandPanel, { listComposerCommands } from './ComposerCommandPanel';

afterEach(() => cleanup());

const TOOL_THUMBS = [
  ['计划模式', 'plan'],
  ['生成图片', 'generateImage'],
  ['可交互网页', 'renderInteractive'],
  ['生成长文', 'writeDocument'],
  ['整理闪卡', 'flashcards'],
  ['整理笔记', 'notes'],
] as const;

describe('ComposerCommandPanel', () => {
  it('lists plan, square tool thumbs and imported skills in three blocks', () => {
    const onSelectPlan = vi.fn();
    const onSelectCompact = vi.fn();
    const onSelectTool = vi.fn();
    const onSelectSkill = vi.fn();
    const { getByRole, getByTestId } = render(
      <ComposerCommandPanel
        planMode={false}
        planAllowed
        skills={[{ id: 's1', name: '错题分析', description: '复盘', content: 'x', pinned: false, createdAt: 1 }]}
        onSelectPlan={onSelectPlan}
        onSelectCompact={onSelectCompact}
        onSelectTool={onSelectTool}
        onSelectSkill={onSelectSkill}
      />,
    );
    const panel = getByTestId('composer-command-panel');
    expect(panel.textContent).toMatch(/计划模式[\s\S]*压缩上下文[\s\S]*特定工具[\s\S]*已导入 Skills/);
    const compactThumb = getByRole('option', { name: '压缩上下文' }).querySelector('[data-composer-icon="compact"]');
    expect(compactThumb).toHaveAttribute('data-composer-thumb', 'square');
    fireEvent.click(getByRole('option', { name: /压缩上下文/ }));
    expect(onSelectCompact).toHaveBeenCalledOnce();
    expect(panel.textContent).not.toMatch(/先输出|本轮必调|只读规划/);
    for (const [label, icon] of TOOL_THUMBS) {
      const thumb = getByRole('option', { name: label }).querySelector(`[data-composer-icon="${icon}"]`);
      expect(thumb).toHaveAttribute('data-composer-thumb', 'square');
      expect(thumb).toHaveClass('composer-tool-thumb');
      expect(thumb?.querySelector('svg')).toBeTruthy();
      expect(thumb?.querySelector('.composer-tool-thumb-bar')).toBeTruthy();
    }
    const skill = getByRole('option', { name: '错题分析' }).querySelector('[data-composer-icon="skill"]');
    expect(skill).toHaveAttribute('data-composer-thumb', 'square');
    expect(skill?.querySelector('svg')).toBeNull();
    expect(skill?.querySelector('.composer-tool-thumb-bar')).toBeNull();
    fireEvent.click(getByRole('option', { name: /计划模式/ }));
    fireEvent.click(getByRole('option', { name: /生成长文/ }));
    fireEvent.click(getByRole('option', { name: /错题分析/ }));
    expect(onSelectPlan).toHaveBeenCalledOnce();
    expect(onSelectTool).toHaveBeenCalledWith('writeDocument');
    expect(onSelectSkill).toHaveBeenCalledWith(expect.objectContaining({ id: 's1' }));
    expect(listComposerCommands({ planAllowed: true, skills: [], query: '图片' }).map((item) => item.id)).toEqual(['generateImage']);
    expect(listComposerCommands({ planAllowed: true, skills: [], query: '' }).map((item) => item.id)[1]).toBe('compact');
  });
});
