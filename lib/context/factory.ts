import type { ContextMode, ContextManager } from './types';
import { FullContextManager } from './fullContext';
import { SemanticSearchManager } from './semanticSearch';

export function getContextManager(mode: ContextMode): ContextManager {
  return mode === 'semantic' ? new SemanticSearchManager() : new FullContextManager();
}
