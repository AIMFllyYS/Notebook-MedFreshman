import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ComposerCommandPanel, { listComposerCommands } from './ComposerCommandPanel';

afterEach(() => cleanup());

describe('ComposerCommandPanel', () => {
  it('lists plan, colored tools and imported skills in three blocks', () => {
    const onSelectPlan = vi.fn();
    const onSelectTool = vi.fn();
    const onSelectSkill = vi.fn();
    const { getByRole, getByTestId } = render(
      <ComposerCommandPanel
        planMode={false}
        planAllowed
        skills={[{ id: 's1', name: '错题分析', description: '复盘', content: 'x', pinned: false, createdAt: 1 }]}
        onSelectPlan={onSelectPlan}
        onSelectTool={onSelectTool}
        onSelectSkill={onSelectSkill}
      />,
    );
    const panel = getByTestId('composer-command-panel');
    expect(panel.textContent).toMatch(/计划模式[\s\S]*特定工具[\s\S]*已导入 Skills/);
    expect(getByRole('option', { name: /可交互 HTML/ }).querySelector('[data-composer-icon="renderInteractive"]')).toBeTruthy();
    fireEvent.click(getByRole('option', { name: /计划模式/ }));
    fireEvent.click(getByRole('option', { name: /长文/ }));
    fireEvent.click(getByRole('option', { name: /错题分析/ }));
    expect(onSelectPlan).toHaveBeenCalledOnce();
    expect(onSelectTool).toHaveBeenCalledWith('writeDocument');
    expect(onSelectSkill).toHaveBeenCalledWith(expect.objectContaining({ id: 's1' }));
    expect(listComposerCommands({ planAllowed: true, skills: [], query: '图片' }).map((item) => item.id)).toEqual(['generateImage']);
  });
});
