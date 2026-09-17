import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChatInput from './ChatInput';
import { useSettings } from '@/lib/hooks/useSettings';
import { useSkills } from '@/lib/hooks/useSkills';
import { NOTEBOOK_FILE_MIME } from '@/lib/chat/composerIntent';

vi.mock('@/components/chat/TokenDashboard', () => ({ default: () => <div data-testid="token-dashboard" /> }));
vi.mock('@/components/chat/ModelMenu', () => ({ default: () => <div data-testid="model-menu" /> }));
vi.mock('@/lib/hooks/useChatUI', () => ({ useChatUI: () => ({ quotedText: null, clearQuotedText: vi.fn() }) }));
vi.mock('@/lib/hooks/useImageAttachments', () => ({ useImageAttachments: () => ({
  attachments: [], addFiles: vi.fn(), remove: vi.fn(), clear: vi.fn(), toChatFormat: () => [],
  handlePaste: vi.fn(), handleDrop: vi.fn(), handleDragOver: vi.fn(), handleDragEnter: vi.fn(), handleDragLeave: vi.fn(),
  isDragging: false, endDrag: vi.fn(), error: null,
}) }));

const context = { subjectId: 'probability', categoryId: 'detail', itemId: '1.4', currentTopic: '古典概型' };
const props = { onSend: vi.fn(), onStop: vi.fn(), isLoading: false, chatContext: context };

beforeEach(() => {
  vi.clearAllMocks();
  useSettings.setState({ selectedModelId: 'mimo-v2.5', customApiGroups: [], defaultThinking: false, defaultSearch: false });
  useSkills.setState({ skills: [{ id: 'sk1', name: '速记', description: '记公式', content: '步骤', pinned: false, createdAt: 1 }] });
});
afterEach(() => { cleanup(); });

describe('ChatInput composer slash / hash / drop', () => {
  it('hides the paperclip and puts a plus on the left of the textbox', () => {
    const { getByTestId, queryByTitle, getByRole } = render(<ChatInput {...props} />);
    expect(getByTestId('composer-plus')).toBeTruthy();
    expect(queryByTitle('上传图片或文档')).toBeNull();
    const plus = getByTestId('composer-plus');
    const textbox = getByRole('textbox');
    expect(plus.compareDocumentPosition(textbox) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('plus and / open the same command panel with plan, tools and imported skills', () => {
    const { getByTestId, getByRole } = render(<ChatInput {...props} />);
    fireEvent.click(getByTestId('composer-plus'));
    expect(getByTestId('composer-command-panel')).toHaveTextContent('计划模式');
    expect(getByTestId('composer-command-panel')).toHaveTextContent('压缩');
    expect(getByTestId('composer-command-panel')).toHaveTextContent('生成图片');
    expect(getByTestId('composer-command-panel')).toHaveTextContent('速记');
    expect(getByTestId('composer-command-panel').textContent).not.toMatch(/先输出|本轮必调|只读规划/);
    fireEvent.click(screen.getByRole('option', { name: /计划模式/ }));
    expect(getByTestId('composer-chip-plan')).toHaveTextContent('计划模式');
    expect(getByTestId('composer-chip-plan').querySelector('[data-composer-thumb="square"]')).toBeTruthy();
    fireEvent.change(getByRole('textbox'), { target: { value: '/' } });
    expect(getByTestId('composer-command-panel')).toBeTruthy();
  });

  it('hash lists nearby files and selecting one sends the detailed path', () => {
    const { getByRole, getByTestId } = render(<ChatInput {...props} />);
    fireEvent.change(getByRole('textbox'), { target: { value: '#' } });
    expect(getByTestId('file-mention-menu')).toHaveTextContent('当前页附近');
    expect(getByTestId('file-mention-menu')).toHaveTextContent('古典概型');
    fireEvent.click(screen.getByRole('option', { name: /古典概型/ }));
    expect(getByTestId('composer-chip-file')).toHaveTextContent('古典概型');
    fireEvent.change(getByRole('textbox'), { target: { value: '对比这一节' } });
    fireEvent.click(screen.getByTitle('发送'));
    expect(props.onSend).toHaveBeenCalledWith('对比这一节', expect.objectContaining({
      attachedFiles: [expect.objectContaining({ path: 'probability/detail/1.4', address: expect.stringContaining('详解') })],
    }));
  });

  it('tree drop becomes a file chip, clears the dashed overlay, and send includes attachedFiles', () => {
    const { container, getByTestId, getByRole, queryByTestId } = render(<ChatInput {...props} />);
    expect(getByRole('textbox')).toHaveAttribute('placeholder', '输入问题、引用笔记、计划或工具');
    const payload = JSON.stringify([{
      path: 'probability/detail/1.3', title: '频率与概率', kind: 'file',
      address: '概率论 › 详解 › 频率与概率', subjectId: 'probability', categoryId: 'detail', itemId: '1.3',
    }]);
    const dataTransfer = {
      getData: (type: string) => type === NOTEBOOK_FILE_MIME || type === 'text/plain' ? payload : '',
      types: [NOTEBOOK_FILE_MIME],
      dropEffect: 'copy',
    };
    const dock = container.querySelector('.chat-input-container')!;
    fireEvent.dragEnter(dock, { dataTransfer });
    fireEvent.dragOver(dock, { dataTransfer });
    expect(getByTestId('composer-drop-overlay')).toBeTruthy();
    fireEvent.drop(dock, { dataTransfer });
    expect(queryByTestId('composer-drop-overlay')).toBeNull();
    expect(getByTestId('composer-chip-file')).toHaveTextContent('频率与概率');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '讲解' } });
    fireEvent.click(screen.getByTitle('发送'));
    expect(props.onSend).toHaveBeenCalledWith('讲解', expect.objectContaining({
      attachedFiles: [expect.objectContaining({ path: 'probability/detail/1.3' })],
    }));
  });

  it('selecting a forced tool lights a chip and sends forcedTool', () => {
    const { getByTestId } = render(<ChatInput {...props} />);
    fireEvent.click(getByTestId('composer-plus'));
    fireEvent.click(screen.getByRole('option', { name: /生成图片/ }));
    expect(getByTestId('composer-chip-tool')).toHaveTextContent('生成图片');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '画细胞膜' } });
    fireEvent.click(screen.getByTitle('发送'));
    expect(props.onSend).toHaveBeenCalledWith('画细胞膜', expect.objectContaining({ forcedTool: 'generateImage' }));
  });
});
