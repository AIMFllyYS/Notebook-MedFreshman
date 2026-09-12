import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
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

  it('opens a details submenu without thinking options for models that have no effort levels', async () => {
    const { getByTestId, queryByTestId } = render(<ModelMenu />);
    await act(async () => {
      getByTestId('model-menu-button').click();
    });
    expect(queryByTestId('model-menu-panel')).not.toBeNull();
    fireEvent.mouseEnter(getByTestId('model-menu-item-Tongyi-MAI/Z-Image-Turbo'));
    expect(queryByTestId('model-submenu')).not.toBeNull();
    expect(queryByTestId('model-thinking-submenu')).toBeNull();
    expect(within(getByTestId('model-submenu')).getByText('生图')).toBeTruthy();
    expect(queryByTestId('model-thinking-option-low')).toBeNull();
  });

  it('keeps capability badges out of the primary row and shows them in the submenu', async () => {
    const { getByTestId, queryByTestId } = render(<ModelMenu />);
    await act(async () => {
      getByTestId('model-menu-button').click();
    });
    const row = getByTestId('model-menu-item-z-ai/glm-5.3-flash');
    expect(within(row).queryByText('视觉')).toBeNull();
    expect(within(row).queryByText('思考')).toBeNull();
    fireEvent.mouseEnter(row);
    const sub = getByTestId('model-submenu');
    expect(within(sub).getByText('视觉')).toBeTruthy();
    expect(within(sub).getByText('上下文 1M')).toBeTruthy();
    expect(queryByTestId('model-thinking-submenu')).not.toBeNull();
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

  it('does not list the desktop 自由中转 model', async () => {
    const { getByTestId, queryByTestId } = render(<ModelMenu />);
    await act(async () => {
      getByTestId('model-menu-button').click();
    });
    expect(queryByTestId('model-menu-item-custom-openai')).toBeNull();
    expect(getByTestId('model-menu-panel').textContent).not.toContain('自由中转');
  });

  it('shows custom-provider thinking levels in the flyout', async () => {
    useSettings.setState({
      selectedModelId: 'z-ai/glm-5.3-flash',
      customApiGroups: [
        {
          id: 'or',
          name: 'OpenRouter',
          baseUrl: 'https://openrouter.example/v1',
          apiKey: 'sk',
          models: [
            {
              id: 'gpt-think',
              label: 'GPT Think',
              thinking: true,
              thinkingLevels: ['low', 'max'],
            },
          ],
        },
      ],
    });
    const { getByTestId, queryByTestId } = render(<ModelMenu />);
    await act(async () => {
      getByTestId('model-menu-button').click();
    });
    expect(getByTestId('model-menu-panel').textContent).toContain('OpenRouter');
    fireEvent.mouseEnter(getByTestId('model-menu-item-custom:or:gpt-think'));
    expect(queryByTestId('model-thinking-submenu')).not.toBeNull();
    expect(queryByTestId('model-thinking-option-low')).not.toBeNull();
    expect(queryByTestId('model-thinking-option-max')).not.toBeNull();
    expect(queryByTestId('model-thinking-option-medium')).toBeNull();
    expect(queryByTestId('model-thinking-option-off')).not.toBeNull();
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
    fireEvent.mouseEnter(getByTestId('model-menu-item-google/gemini-3.8-flash'));
    await act(async () => {
      getByTestId('model-thinking-option-low').click();
    });
    expect(onChange).toHaveBeenCalledWith('google/gemini-3.8-flash');
    expect(onThinkingChange).toHaveBeenCalledWith({ enabled: true, effort: 'low' });
  });
});
