import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import ModelMenu from './ModelMenu';
import { useSettings } from '@/lib/hooks/useSettings';

describe('ModelMenu thinking submenu', () => {
  beforeEach(() => {
    useSettings.setState({
      selectedModelId: 'Tongyi-MAI/Z-Image-Turbo',
      customApiGroups: [],
    });
  });
  afterEach(() => cleanup());

  it('does not open thinking submenu for models without thinking levels', async () => {
    const { getByTestId, queryByTestId } = render(<ModelMenu />);
    await act(async () => {
      getByTestId('model-menu-button').click();
    });
    expect(queryByTestId('model-menu-panel')).not.toBeNull();
    fireEvent.mouseEnter(getByTestId('model-menu-item-Tongyi-MAI/Z-Image-Turbo'));
    expect(queryByTestId('model-thinking-submenu')).toBeNull();
  });

  it('opens thinking submenu on hover for models that support effort', async () => {
    const { getByTestId, queryByTestId } = render(<ModelMenu />);
    await act(async () => {
      getByTestId('model-menu-button').click();
    });
    fireEvent.mouseEnter(getByTestId('model-menu-item-z-ai/glm-5.3-flash'));
    expect(queryByTestId('model-thinking-submenu')).not.toBeNull();
    expect(queryByTestId('model-thinking-option-off')).toBeNull();
    expect(queryByTestId('model-thinking-option-low')).not.toBeNull();
    expect(queryByTestId('model-thinking-option-medium')).toBeNull();
    expect(queryByTestId('model-thinking-option-high')).not.toBeNull();
    expect(queryByTestId('model-thinking-option-max')).not.toBeNull();
  });

  it('selecting an effort picks the model and reports thinking change', async () => {
    const onChange = vi.fn();
    const onThinkingChange = vi.fn();
    const { getByTestId } = render(
      <ModelMenu value="mimo-v2.5" onChange={onChange} thinkingEnabled={false} thinkingEffort="medium" onThinkingChange={onThinkingChange} />,
    );
    await act(async () => {
      getByTestId('model-menu-button').click();
    });
    fireEvent.mouseEnter(getByTestId('model-menu-item-google/gemini-3.7-flash'));
    await act(async () => {
      getByTestId('model-thinking-option-low').click();
    });
    expect(onChange).toHaveBeenCalledWith('google/gemini-3.7-flash');
    expect(onThinkingChange).toHaveBeenCalledWith({ enabled: true, effort: 'low' });
  });
});
