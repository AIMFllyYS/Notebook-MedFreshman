import type { CustomApiGroup } from '@/lib/ai/models';
import type { ContextMode, ContextManager } from './types';
import { FullContextManager } from './fullContext';
import { SemanticSearchManager } from './semanticSearch';

export function getContextManager(
  mode: ContextMode,
  model?: string,
  customGroups: CustomApiGroup[] = [],
): ContextManager {
  return mode === 'semantic'
    ? new SemanticSearchManager(model, customGroups)
    : new FullContextManager(model, customGroups);
}
