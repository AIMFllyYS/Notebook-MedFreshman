import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import ModelMenu from './ModelMenu';
import { useSettings } from '@/lib/hooks/useSettings';

function openCategory(name: string) {
  fireEvent.click(screen.getByTestId('model-menu-button'));
  fireEvent.click(screen.getByRole('button', { name }));
}
describe('ModelMenu progressive selection', () => {
  beforeEach(() => useSettings.setState({ selectedModelId: 'Tongyi-MAI/Z-Image-Turbo', customApiGroups: [] }));
  afterEach(cleanup);
  it('orders builtin categories and selects automatic without displaying routing rules', () => {
    const onChange = vi.fn();
    render(<ModelMenu onChange={onChange} />);
    fireEvent.click(screen.getByTestId('model-menu-button'));
    const panel = screen.getByTestId('model-menu-panel');
    const names = within(panel).getAllByRole('button').map((b) => b.textContent);
    expect(names.slice(0, 5)).toEqual(['自动模型', '免费模型', '快速模型', '多模态模型', '旗舰模型']);
    expect(within(panel).queryByRole('button', { name: '内置模型' })).toBeNull();
    expect(panel.textContent).not.toMatch(/路由|白名单|候选/);
    fireEvent.click(screen.getByTestId('model-menu-item-auto'));
    expect(onChange).toHaveBeenCalledWith('auto');
    expect(screen.queryByTestId('model-menu-panel')).toBeNull();
  });
  it('keeps image selection and omits thinking controls for image models', () => {
    render(<ModelMenu />);
    openCategory('生图模型');
    fireEvent.click(screen.getByTestId('model-menu-item-Tongyi-MAI/Z-Image-Turbo'));
    expect(within(screen.getByTestId('model-submenu')).getByText('生图')).toBeTruthy();
    expect(screen.queryByTestId('model-thinking-submenu')).toBeNull();
  });
  it('keeps all three compact desktop columns visible together', () => {
    render(<ModelMenu />);
    openCategory('多模态模型');
    const row = screen.getByTestId('model-menu-item-z-ai/glm-5.3-flash');
    expect(within(row).queryByText('视觉')).toBeNull();
    fireEvent.click(row);
    expect(within(screen.getByTestId('model-submenu')).getByText('视觉')).toBeTruthy();
    expect(within(screen.getByTestId('model-submenu')).getByText('上下文 1M')).toBeTruthy();
    expect(screen.getByTestId('model-menu-panel').contains(screen.getByTestId('model-submenu'))).toBe(true);
    expect(screen.getByRole('region', { name: '模型系列' })).toBeTruthy();
    expect(screen.getByRole('region', { name: '具体模型' })).toBeTruthy();
    expect(screen.getByRole('region', { name: '模型详情' })).toBeTruthy();
    expect(screen.getByRole('region', { name: '模型系列' }).style.width).toBe('190px');
  });
  it('preserves vendor training disclosure in both row and details', () => {
    render(<ModelMenu />);
    openCategory('多模态模型');
    fireEvent.click(screen.getByTestId('model-menu-item-meta/muse-spark-1.3-contributor'));
    expect(screen.getAllByText('对话可能用于厂商训练').length).toBeGreaterThan(1);
  });
  it('selects thinking strength and respects required thinking', () => {
    const onChange = vi.fn(), onThinkingChange = vi.fn();
    render(<ModelMenu value="mimo-v2.5" onChange={onChange} onThinkingChange={onThinkingChange} />);
    openCategory('多模态模型');
    fireEvent.click(screen.getByTestId('model-menu-item-google/gemini-3.8-flash'));
    expect(screen.queryByTestId('model-thinking-option-off')).toBeNull();
    fireEvent.click(screen.getByTestId('model-thinking-option-low'));
    expect(onChange).toHaveBeenCalledWith('google/gemini-3.8-flash');
    expect(onThinkingChange).toHaveBeenCalledWith({ enabled: true, effort: 'low' });
  });
  it('retains future models and supports keyboard back/escape with focus restoration', () => {
    render(<ModelMenu />);
    openCategory('旗舰模型');
    expect(screen.getByTestId('model-menu-item-gpt-5.6-sol')).toBeTruthy();
    fireEvent.keyDown(screen.getByTestId('model-menu-panel'), { key: 'ArrowLeft' });
    fireEvent.click(screen.getByRole('button', { name: '快速模型' }));
    expect(screen.getByTestId('model-menu-item-Qwen/Qwen3.7-Flash')).toBeTruthy();
    fireEvent.keyDown(screen.getByTestId('model-menu-panel'), { key: 'Escape' });
    expect(screen.queryByTestId('model-menu-panel')).toBeNull();
    expect(document.activeElement).toBe(screen.getByTestId('model-menu-button'));
  });
  it('preserves user API groups and scoped model identity', () => {
    useSettings.setState({ customApiGroups: [{ id: 'mine', name: '我的 API', baseUrl: 'https://custom.invalid/v1', apiKey: '', models: [{ id: 'deepseek-chat', label: '我的 DeepSeek', thinking: true, thinkingRequestStyle: 'deepseek-thinking' }] }] });
    const onChange = vi.fn();
    render(<ModelMenu onChange={onChange} />);
    fireEvent.click(screen.getByTestId('model-menu-button'));
    fireEvent.click(screen.getByRole('button', { name: '我的 API' }));
    fireEvent.click(screen.getByTestId('model-menu-item-custom:mine:deepseek-chat'));
    fireEvent.click(screen.getByTestId('model-submenu-use'));
    expect(onChange).toHaveBeenCalledWith('custom:mine:deepseek-chat');
  });
  it('desktop hover traverses categories and models without hiding their parents', () => {
    render(<ModelMenu />);
    fireEvent.click(screen.getByTestId('model-menu-button'));
    fireEvent.mouseEnter(screen.getByRole('button', { name: '多模态模型' }));
    fireEvent.mouseEnter(screen.getByTestId('model-menu-item-mimo-v2.5'));
    expect(screen.getByRole('region', { name: '模型详情' })).toBeTruthy();
    fireEvent.mouseEnter(screen.getByRole('button', { name: '免费模型' }));
    expect(screen.getByTestId('model-menu-item-poolside/laguna-s-2.1-free')).toBeTruthy();
    expect(screen.queryByRole('region', { name: '模型详情' })).toBeNull();
  });
  it('left-opening branch arrows precede both series and model labels', () => {
    const rectangle = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 900, right: 1000, top: 600, bottom: 630, width: 100, height: 30, x: 900, y: 600, toJSON() {} });
    try {
      render(<ModelMenu />);
      openCategory('旗舰模型');
      const series = screen.getByRole('button', { name: '旗舰模型' });
      expect(series.firstElementChild?.getAttribute('data-branch-side')).toBe('left');
      const row = screen.getByTestId('model-menu-item-kimi-k3');
      expect(row.firstElementChild?.getAttribute('data-branch-side')).toBe('left');
      fireEvent.click(row);
      expect(screen.queryByTestId('model-thinking-submenu')).toBeNull();
    } finally { rectangle.mockRestore(); }
  });
  it('submenu follows its owning row when moving between equal-sized series', () => {
    const rectangle = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const text = this.textContent;
      const top = this.tagName === 'BUTTON' && text === '快速模型' ? 260
        : this.tagName === 'BUTTON' && text === '免费模型' ? 220 : 100;
      return { left: 800, right: 990, top, bottom: top + 32, height: 32, width: 190, x: 800, y: top, toJSON() {} };
    });
    try {
      render(<ModelMenu />);
      openCategory('快速模型');
      const menu = screen.getByRole('region', { name: '具体模型' });
      expect(menu.style.top).toBe('160px');
      fireEvent.mouseEnter(screen.getByRole('button', { name: '免费模型' }));
      expect(menu.style.top).toBe('120px');
    } finally { rectangle.mockRestore(); }
  });
  it('shows meaningful icons and MiMo effort options', () => {
    render(<ModelMenu />);
    openCategory('多模态模型');
    expect(screen.getByTestId('model-menu-item-auto').querySelector('.lucide-compass')).toBeTruthy();
    expect(screen.getByRole('button', { name: '快速模型' }).querySelector('.lucide-zap')).toBeTruthy();
    fireEvent.click(screen.getByTestId('model-menu-item-mimo-v2.5'));
    expect(screen.getByTestId('model-thinking-option-low')).toBeTruthy();
    expect(screen.getByTestId('model-thinking-option-medium')).toBeTruthy();
    expect(screen.getByTestId('model-thinking-option-high')).toBeTruthy();
  });
  it('mobile uses one panel, starts at series, and returns without an extra builtin entry', () => {
    const width = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    try {
      render(<ModelMenu />);
      openCategory('快速模型');
      expect(screen.getByTestId('model-menu-panel').dataset.layout).toBe('drilldown');
      expect(screen.queryByRole('region', { name: '模型系列' })).toBeNull();
      fireEvent.click(screen.getByTestId('model-menu-item-deepseek/deepseek-v4.1-flash'));
      expect(screen.getByRole('region', { name: '具体模型' }).contains(screen.getByTestId('model-submenu'))).toBe(true);
      fireEvent.click(screen.getByRole('button', { name: '返回模型系列' }));
      expect(screen.getByTestId('model-menu-item-auto')).toBeTruthy();
    } finally { Object.defineProperty(window, 'innerWidth', { configurable: true, value: width }); }
  });
});
