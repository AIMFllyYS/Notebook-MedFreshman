import { useState, useCallback, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useToolExecutor } from './useToolExecutor';
import { useChatHistoryStore } from '../store/useChatHistoryStore';
import type { ChatMessage, ChatContext, ChatOptions, ToolCallBlock } from '../types/chat';
import type { ToolDefinition } from '../types/tools';
import { PAGE_CONTENT_TOOLS, WEB_SEARCH_TOOL } from '../types/tools';

interface StreamState {
  reasoningContent: string;
  content: string;
  toolCalls: ToolCallBlock[];
}

const SYSTEM_PROMPT_TEMPLATE = `你是概率论与数理统计的专业助教。使用苏格拉底式提问引导学生。
必须清晰解释概念，内容必须通俗易懂。如果使用生活类比，请贴近日常经验。

## 数学公式规范
- 行内公式: $...$
- 行间公式: $$...$$
- 使用Latex解释时必须一步一步非常清晰推理，禁止跳步！

## 响应格式
你可以使用以下XML标签组织特定内容（正常回答直接输出文本和Markdown即可）：
1. <ToolCall name="tool_name" args={{...}} /> - 声明需要调用的工具
2. <FollowUp>问题1|问题2|问题3</FollowUp> - 必须根据前文内容、用户当前提问以及未来可能问的问题，动态给出3个相关的追问预测或预设建议，用|分隔。不要给出固定不变的问题。

注意：工具调用只是声明，实际执行由系统处理。`;

export const useChat = () => {
  const { activeSessionId, getActiveSession, createSession, updateSession } = useChatHistoryStore();
  const activeSession = getActiveSession();
  const messages = activeSession?.messages || [];
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { aiApiUrl, aiModel, aiApiKey } = useSettingsStore();
  const { executeTool } = useToolExecutor();
  
  const streamStateRef = useRef<StreamState>({ reasoningContent: '', content: '', toolCalls: [] });

  const clearMessages = () => {
    createSession();
  };

  const buildSystemPrompt = (context?: ChatContext): string => {
    let prompt = SYSTEM_PROMPT_TEMPLATE;
    if (context) {
      prompt += `\n\n当前学习上下文：\n- 章节：第${context.chapterId}章\n- 小节：${context.sectionId}\n- 主题：${context.currentTopic}`;
    }
    return prompt;
  };

  const buildRequestBody = (
    apiMessages: any[],
    options?: ChatOptions
  ): any => {
    const tools: ToolDefinition[] = [];
    if (options?.enableSearch) {
      tools.push(WEB_SEARCH_TOOL);
    }
    tools.push(...PAGE_CONTENT_TOOLS);

    const body: any = {
      model: aiModel,
      messages: apiMessages,
      stream: true,
    };

    if (options?.enableThinking) {
      body.extra_body = {
        thinking: { type: 'enabled' },
        reasoning_effort: options.thinkingEffort || 'high'
      };
    }

    if (tools.length > 0) {
      body.tools = tools;
    }

    return body;
  };

  const sendMessage = useCallback(async (
    content: string,
    params?: Partial<ChatContext> & Partial<ChatOptions>
  ) => {
    if (!content.trim() || !aiApiKey) {
      if (!aiApiKey) setError('请先在配置中输入 API Key');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    let currentConversation = [...messages, userMessage];
    
    // Auto-generate title for the first message
    let newTitle = activeSession?.title;
    if (messages.length === 0) {
      newTitle = content.slice(0, 15) + (content.length > 15 ? '...' : '');
    }

    const context = params && params.chapterId ? {
      chapterId: params.chapterId,
      sectionId: params.sectionId || '',
      currentTopic: params.currentTopic || '',
    } as ChatContext : undefined;

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = createSession(context);
    }
    
    updateSession(sessionId, currentConversation, newTitle);
    
    setIsLoading(true);
    setError(null);
    
    const options: ChatOptions | undefined = params ? {
      enableThinking: params.enableThinking,
      enableSearch: params.enableSearch,
      thinkingEffort: params.thinkingEffort,
    } : undefined;

    const systemPrompt = buildSystemPrompt(context);

    const runChatTurn = async (conversation: ChatMessage[]) => {
      streamStateRef.current = { reasoningContent: '', content: '', toolCalls: [] };
      
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...conversation.map(m => {
          const base: any = { role: m.role, content: m.content || '' };
          if (m.reasoningContent) base.reasoning_content = m.reasoningContent;
          if (m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0) {
            base.tool_calls = m.toolCalls.map(tc => ({
              id: tc.id,
              type: 'function',
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
            }));
          }
          if (m.role === 'tool') {
            base.tool_call_id = m.toolCallId;
          }
          return base;
        })
      ];

      try {
        const requestBody = buildRequestBody(apiMessages, options);

        const response = await fetch(aiApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiApiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
        }

        const assistantId = (Date.now() + 1).toString();
        const newMessage: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          reasoningContent: '',
          toolCalls: [],
          metadata: {
            thinkingEnabled: options?.enableThinking,
            searchEnabled: options?.enableSearch,
          }
        };
        
        currentConversation = [...currentConversation, newMessage];
        if (sessionId) updateSession(sessionId, currentConversation);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');

        if (!reader) throw new Error('流读取失败');

        let done = false;
        let buffer = '';

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6));
                  const delta = data.choices[0]?.delta;

                  if (delta?.reasoning_content) {
                    streamStateRef.current.reasoningContent += delta.reasoning_content;
                  }

                  if (delta?.content) {
                    streamStateRef.current.content += delta.content;
                  }

                  if (delta?.tool_calls) {
                    for (const toolCall of delta.tool_calls) {
                      const existingCall = streamStateRef.current.toolCalls.find(t => t.index === toolCall.index);
                      if (existingCall) {
                        if (toolCall.function?.arguments) {
                          existingCall.argumentsStr += toolCall.function.arguments;
                        }
                      } else {
                        streamStateRef.current.toolCalls.push({
                          index: toolCall.index,
                          id: toolCall.id || '',
                          name: toolCall.function?.name || 'unknown',
                          argumentsStr: toolCall.function?.arguments || '',
                          arguments: {},
                          status: 'running'
                        });
                      }
                    }
                  }

                  currentConversation = currentConversation.map(msg => {
                    if (msg.id === assistantId) {
                      return {
                        ...msg,
                        content: streamStateRef.current.content,
                        reasoningContent: streamStateRef.current.reasoningContent,
                        toolCalls: streamStateRef.current.toolCalls,
                      };
                    }
                    return msg;
                  });
                  if (sessionId) updateSession(sessionId, currentConversation);
                } catch (e) {
                  console.error('Error parsing SSE:', e);
                }
              }
            }
          }
        }
        
        // 执行工具调用
        if (streamStateRef.current.toolCalls.length > 0) {
          const toolsToExecute = streamStateRef.current.toolCalls.map(tc => {
            try {
              if (tc.argumentsStr) {
                tc.arguments = JSON.parse(tc.argumentsStr);
              }
            } catch (e) {
              console.error('Failed to parse tool arguments:', tc.argumentsStr);
            }
            return tc;
          });
          const newToolMessages: ChatMessage[] = [];
          
          for (let i = 0; i < toolsToExecute.length; i++) {
            const toolCall = toolsToExecute[i];
            const result = await executeTool(toolCall);
            
            newToolMessages.push({
              id: Date.now().toString() + Math.random().toString(36).substring(7),
              role: 'tool',
              content: typeof result.data === 'string' ? result.data : JSON.stringify(result.data || result.error || '执行成功'),
              timestamp: Date.now(),
              toolCallId: toolCall.id,
            });
            
            // 更新工具执行状态
            currentConversation = currentConversation.map(msg => {
              if (msg.id === assistantId) {
                return {
                  ...msg,
                  toolCalls: msg.toolCalls?.map(tc => 
                    tc.id === toolCall.id ? { 
                      ...tc, 
                      status: result.success ? 'success' : 'error', 
                      result: typeof result.data === 'string' ? result.data : JSON.stringify(result.data || result.error) 
                    } : tc
                  )
                };
              }
              return msg;
            });
            if (sessionId) updateSession(sessionId, currentConversation);
          }
          
          currentConversation = [...currentConversation, ...newToolMessages];
          if (sessionId) updateSession(sessionId, currentConversation);
          
          // 工具调用完成后，发起新一轮请求，让大模型基于工具返回结果继续回答
          await runChatTurn(currentConversation);
        }

      } catch (err: any) {
        console.error(err);
        setError(err.message || '发生未知错误');
      }
    };

    try {
      await runChatTurn(currentConversation);
    } finally {
      setIsLoading(false);
    }
  }, [messages, aiApiUrl, aiModel, aiApiKey, executeTool, activeSessionId, activeSession?.title, createSession, updateSession]);

  return { messages, isLoading, error, sendMessage, clearMessages, activeSessionId };
};
