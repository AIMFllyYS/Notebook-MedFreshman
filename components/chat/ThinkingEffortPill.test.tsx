import { describe, expect, it, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import ThinkingEffortPill from './ThinkingEffortPill';

describe('ThinkingEffortPill', () => {
  it('renders the current effort label', () => {
    const { getByTestId } = render(
      <ThinkingEffortPill value="medium" onChange={vi.fn()} />,
    );
    const pill = getByTestId('thinking-effort-pill');
    expect(pill.getAttribute('data-effort')).toBe('medium');
    expect(pill.textContent).toContain('Med');
  });

  it('opens menu on click and shows all four options', async () => {
    const { getByTestId, queryByTestId } = render(
      <ThinkingEffortPill value="low" onChange={vi.fn()} />,
    );
    const pill = getByTestId('thinking-effort-pill');
    await act(async () => {
      pill.click();
    });
    expect(queryByTestId('thinking-effort-option-low')).not.toBeNull();
    expect(queryByTestId('thinking-effort-option-medium')).not.toBeNull();
    expect(queryByTestId('thinking-effort-option-high')).not.toBeNull();
    expect(queryByTestId('thinking-effort-option-max')).not.toBeNull();
  });

  it('invokes onChange with picked value and closes menu', async () => {
    const onChange = vi.fn();
    const { getByTestId, queryByTestId } = render(
      <ThinkingEffortPill value="low" onChange={onChange} />,
    );
    const pill = getByTestId('thinking-effort-pill');
    await act(async () => {
      pill.click();
    });
    const highOpt = getByTestId('thinking-effort-option-high');
    await act(async () => {
      highOpt.click();
    });
    expect(onChange).toHaveBeenCalledWith('high');
    // 菜单关闭：选项应被卸载
    expect(queryByTestId('thinking-effort-option-high')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByTestId } = render(
      <ThinkingEffortPill value="medium" onChange={vi.fn()} disabled />,
    );
    const pill = getByTestId('thinking-effort-pill') as HTMLButtonElement;
    expect(pill.disabled).toBe(true);
  });
});
