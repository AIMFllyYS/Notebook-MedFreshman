// 工具相关类型定义。工具的"定义 + 执行"单一真相源在 `lib/ai/tools.ts`
// （历史上这里另有一套 camelCase 定义、与 runTool 的 snake_case 不匹配，已统一删除）。

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

export interface ToolResult {
  success: boolean;
  data: unknown;
  error?: string;
  cacheHit?: boolean;
}
