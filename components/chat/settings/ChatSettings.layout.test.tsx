import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ChatSettings from './ChatSettings';

vi.mock('./ModelSection', () => ({
  DefaultsSection: () => <div>默认对话</div>, RecordAssistantSection: () => <div>划词助手</div>,
  BuiltinModelsSection: () => <div>内置模型</div>,
}));
vi.mock('./AppearanceSection', () => ({ AppearanceSection: () => <div>全局外观</div> }));
vi.mock('./ApiGroupsSection', () => ({ ApiGroupsSection: () => <div>自定义 API</div> }));
vi.mock('./ImageSection', () => ({ ImageSection: () => <div>生图设置</div> }));
vi.mock('./CapabilityEndpointsSection', () => ({ CapabilityEndpointsSection: () => <div>能力端点</div> }));
vi.mock('./ToolsSection', () => ({ ToolsSection: () => <div>工具调用</div> }));
vi.mock('./ContextSection', () => ({ ContextSection: () => <div>补充上下文</div> }));
vi.mock('./DataSection', () => ({ BillingSection: () => <div>计费</div>, CloudSyncSection: () => <div>同步</div>, ExportSection: () => <div>导出</div>, RedemptionSection: () => <div>兑换</div> }));
vi.mock('./SkillsSection', () => ({ SkillsSection: () => <div>技能库内容</div> }));

afterEach(cleanup);

describe('Agent settings workspace', () => {
  it('isolates categories and returns to the existing conversation', () => {
    const onClose = vi.fn();
    const view = render(<ChatSettings onClose={onClose} />);
    expect(view.getByTestId('chat-settings-content-general')).toHaveTextContent('默认对话');
    expect(view.queryByText('自定义 API')).toBeNull();
    fireEvent.click(view.getByTestId('chat-settings-nav-models'));
    expect(view.getByTestId('chat-settings-content-models')).toHaveTextContent('自定义 API');
    expect(view.getByTestId('chat-settings-content-models')).toHaveTextContent('生图设置');
    expect(view.getByTestId('chat-settings-content-models')).toHaveTextContent('能力端点');
    expect(view.queryByText('默认对话')).toBeNull();
    fireEvent.click(view.getByTestId('chat-settings-nav-capabilities'));
    expect(view.getByTestId('chat-settings-content-capabilities')).toHaveTextContent('工具调用');
    expect(view.queryByText('生图设置')).toBeNull();
    fireEvent.click(view.getByRole('button', { name: '返回对话' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('hides the back control when embedded as the phone settings tab', () => {
    const view = render(<ChatSettings showBack={false} />);
    expect(view.queryByRole('button', { name: '返回对话' })).toBeNull();
    expect(view.getByTestId('chat-settings-workspace')).toBeInTheDocument();
  });
});
