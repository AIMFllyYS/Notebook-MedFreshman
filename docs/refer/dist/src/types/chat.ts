export interface ToolCallBlock {
  index?: number;
  id: string;
  name: string;
  argumentsStr?: string;
  arguments: Record<string, any>;
  status: 'running' | 'success' | 'error';
  result?: string;
  executionTime?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  // Thinking/深度思考
  reasoningContent?: string;
  // 工具调用记录
  toolCalls?: ToolCallBlock[];
  // 作为工具结果的消息使用的ID
  toolCallId?: string;
  // 追问推荐
  followUpQuestions?: string[];
  // 元数据
  metadata?: {
    thinkingEnabled?: boolean;
    searchEnabled?: boolean;
    cacheHit?: boolean;
  };
}

export interface ChatConfig {
  apiUrl: string;
  model: string;
  apiKey: string;
}

export interface ChatContext {
  chapterId: number;
  sectionId: string;
  currentTopic: string;
}

export interface OpenAIRequest {
  model: string;
  messages: { role: string; content: string }[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAIStreamChunk {
  id: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
      reasoning_content?: string;
    };
    finish_reason: string | null;
  }[];
}

export interface ChatOptions {
  enableThinking?: boolean;
  enableSearch?: boolean;
  thinkingEffort?: 'low' | 'medium' | 'high' | 'max';
}
