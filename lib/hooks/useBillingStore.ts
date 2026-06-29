import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage, PERSIST_KEYS } from '@/lib/storage/idbStorage';
import { getModelInfo, CUSTOM_PREFIX, type CustomApiGroup, findCustomModelGroup } from '@/lib/ai/models';

export type BillingRecordType = 'chat' | 'image';

export interface BillingRecord {
  id: string;
  timestamp: number;
  modelId: string;
  modelLabel: string;
  providerCategory: string; // siliconflow | mimo | zhipu | custom:xxx
  type: BillingRecordType;
  
  // -- Token --
  promptTokens?: number;
  completionTokens?: number;
  cachedTokens?: number;
  totalTokens?: number;
  
  // -- Image --
  imageCount?: number;
  
  cost: number;
  sessionId: string;
}

const MAX_RECORDS = 50000;

interface BillingStore {
  records: BillingRecord[];
  addRecord: (record: BillingRecord) => void;
  clearAll: () => void;
  exportToCsv: (customGroups?: CustomApiGroup[]) => void;
}

function calcCost(
  prompt: number,
  completion: number,
  cached: number,
  pricing?: { input: number; cachedInput: number; output: number; cacheWrite?: number }
): number {
  if (!pricing) return 0;
  const uncached = Math.max(0, prompt - cached);
  return (uncached * pricing.input + cached * pricing.cachedInput + completion * pricing.output) / 1_000_000;
}

export function getProviderCategory(modelId: string, customGroups: CustomApiGroup[]): string {
  if (modelId.startsWith(CUSTOM_PREFIX)) {
    const found = findCustomModelGroup(customGroups, modelId);
    return found ? `custom:${found.group.id}` : 'custom:unknown';
  }
  const info = getModelInfo(modelId);
  if (!info || !info.endpoints.length) return 'siliconflow';
  return info.endpoints[0].provider;
}

export function getProviderCategoryName(category: string, customGroups: CustomApiGroup[]): string {
  if (category === 'siliconflow') return '硅基流动';
  if (category === 'mimo') return '小米 MiMo';
  if (category === 'zhipu') return '智谱 API';
  if (category.startsWith('custom:')) {
    const groupId = decodeURIComponent(category.slice(7));
    const group = customGroups.find(g => g.id === groupId);
    return group ? group.name : '自定义 API';
  }
  return category;
}

export function createBillingRecord(params: {
  type: BillingRecordType;
  modelId: string;
  sessionId: string;
  customGroups: CustomApiGroup[];
  usage?: { promptTokens: number; completionTokens: number; cachedTokens: number; totalTokens: number };
  imageCount?: number;
}): BillingRecord {
  const { type, modelId, sessionId, customGroups, usage, imageCount } = params;
  
  let modelLabel = modelId;
  let pricing = undefined;
  
  if (modelId.startsWith(CUSTOM_PREFIX)) {
    const found = findCustomModelGroup(customGroups, modelId);
    if (found) {
      modelLabel = found.model.label || found.model.id;
      if (found.model.pricing) {
        pricing = {
          input: found.model.pricing.input,
          cachedInput: found.model.pricing.cachedInput ?? found.model.pricing.input,
          output: found.model.pricing.output,
        };
      }
    }
  } else {
    const info = getModelInfo(modelId);
    if (info) {
      modelLabel = info.label;
      pricing = info.pricing;
    }
  }

  const providerCategory = getProviderCategory(modelId, customGroups);
  let cost = 0;

  if (type === 'chat' && usage) {
    cost = calcCost(usage.promptTokens, usage.completionTokens, usage.cachedTokens, pricing);
  } else if (type === 'image' && imageCount && pricing) {
    cost = imageCount * pricing.output;
  }

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    modelId,
    modelLabel,
    providerCategory,
    type,
    promptTokens: usage?.promptTokens,
    completionTokens: usage?.completionTokens,
    cachedTokens: usage?.cachedTokens,
    totalTokens: usage?.totalTokens,
    imageCount,
    cost,
    sessionId,
  };
}

export const useBillingStore = create<BillingStore>()(
  persist(
    (set, get) => ({
      records: [],
      addRecord: (record) => set((state) => {
        const next = [record, ...state.records];
        if (next.length > MAX_RECORDS) {
          next.length = MAX_RECORDS;
        }
        return { records: next };
      }),
      clearAll: () => set({ records: [] }),
      exportToCsv: (customGroups = []) => {
        const { records } = get();
        if (records.length === 0) return;

        const headers = ['ID', '时间', '模型名', '类型', '输入Token', '输出Token', '缓存Token', '图片数', '提供商分组', '费用(元)', '会话ID'];
        const rows = records.map(r => {
          const dt = new Date(r.timestamp).toLocaleString('zh-CN');
          const providerName = getProviderCategoryName(r.providerCategory, customGroups);
          return [
            r.id,
            dt,
            `"${r.modelLabel}"`,
            r.type === 'image' ? '生图' : '对话',
            r.promptTokens ?? 0,
            r.completionTokens ?? 0,
            r.cachedTokens ?? 0,
            r.imageCount ?? 0,
            `"${providerName}"`,
            r.cost.toFixed(6),
            r.sessionId
          ].join(',');
        });
        
        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `api_billing_history_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }),
    {
      name: PERSIST_KEYS.billingHistory,
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
