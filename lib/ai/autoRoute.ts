import { getModelInfo } from '@/lib/ai/models';
import { resolveProvider } from '@/lib/ai/provider';

// Internal policy; never serialize these rules to the model picker or a system prompt.
const FAST = ['deepseek/deepseek-v4.1-flash'] as const;
const FREE = ['meituan/LongCat-2.0:free', 'inclusionai/ling-3.0-flash-sante:free'] as const;

export function selectAutomaticModels(input: {
  hasImages: boolean; estimatedTokens: number; text: string; thinking: boolean;
}, available: (id: string) => boolean = (id) => resolveProvider(id).configured): string[] {
  const preferFast = input.hasImages || input.thinking || input.text.length > 600;
  const order = preferFast ? [...FAST, ...FREE] : [...FREE, ...FAST];
  return order.filter((id) => {
    const model = getModelInfo(id);
    return !!model && model.tools && (!input.hasImages || model.vision === true)
      && input.estimatedTokens < (model.contextK ?? 128) * 800 && available(id);
  });
}
