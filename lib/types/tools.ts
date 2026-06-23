// 工具相关类型定义。工具的"定义 + 执行"单一真相源在 `lib/ai/tools.ts`。

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required: string[];
    };
  };
}
