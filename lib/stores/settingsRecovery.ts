import type { CustomApiGroup, CustomModelConfig } from '@/lib/ai/models';
import { API_SECRETS_LS_KEY, SETTINGS_LS_KEY, obfuscateSecret, deobfuscateSecret } from './apiSecrets';

export const SETTINGS_BACKUP_KEY = 'gailvlun-settings-last-good-v1';
const record = (value: unknown): Record<string, unknown> | null => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;

function models(value: unknown): CustomModelConfig[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const item = typeof entry === 'string' ? { id: entry } : record(entry);
    const id = item?.id ?? item?.modelId;
    if (!item || typeof id !== 'string' || !id.trim()) return [];
    return [{ ...item, id } as CustomModelConfig];
  });
}

/** Read both our original flat JSON and older Zustand {state,version} exports. Invalid optional fields cannot erase valid groups. */
export function normalizeStoredSettings(raw: string): Record<string, unknown> {
  const parsed = record(JSON.parse(raw));
  if (!parsed) throw new Error('设置不是有效对象');
  const data = { ...(record(parsed.state) ?? parsed) };
  for (const field of ['selectedModelId', 'defaultImageModelId', 'imageModeTextModel', 'imageModeTextModelFallback', 'recordModelId', 'floatingChatModelId', 'quizModelId', 'customBaseUrl', 'customApiKey', 'customModelId']) {
    if (typeof data[field] !== 'string' || !data[field]) delete data[field];
  }
  data.customModels = models(data.customModels);
  data.customApiGroups = Array.isArray(data.customApiGroups) ? data.customApiGroups.flatMap((entry, index) => {
    const group = record(entry);
    if (!group) return [];
    return [{
      ...group,
      id: typeof group.id === 'string' && group.id ? group.id : `recovered-${index}`,
      name: typeof group.name === 'string' && group.name ? group.name : `API 分组 ${index + 1}`,
      baseUrl: typeof group.baseUrl === 'string' ? group.baseUrl : '',
      apiKey: typeof group.apiKey === 'string' ? group.apiKey : '',
      models: models(group.models),
    }];
  }) : [];
  return data;
}

type LocalStorageAccess = Pick<Storage, 'getItem' | 'setItem'>;

/** A single recoverable snapshot; never add a new plaintext copy of legacy credentials. */
export function backupSettings(storage: LocalStorageAccess): void {
  try {
    const raw = storage.getItem(SETTINGS_LS_KEY);
    if (!raw) return;
    const data = normalizeStoredSettings(raw);
    if (!(data.customApiGroups as unknown[]).length && !(data.customModels as unknown[]).length && !data.customBaseUrl) return;
    const payload = JSON.stringify({ settings: raw, secrets: storage.getItem(API_SECRETS_LS_KEY) });
    storage.setItem(SETTINGS_BACKUP_KEY, obfuscateSecret(payload));
  } catch { /* Backup failure must not make a readable configuration disappear. */ }
}

export function readSettingsBackup(storage: Pick<Storage, 'getItem'>): { settings: string; secrets: string | null } | null {
  try {
    const raw = storage.getItem(SETTINGS_BACKUP_KEY);
    if (!raw) return null;
    const payload = record(JSON.parse(deobfuscateSecret(raw)));
    if (typeof payload?.settings !== 'string') return null;
    normalizeStoredSettings(payload.settings);
    return { settings: payload.settings, secrets: typeof payload.secrets === 'string' ? payload.secrets : null };
  } catch { return null; }
}

export function encodeApiBackup(groups: CustomApiGroup[], selectedModelId: string): string {
  return JSON.stringify({ format: 'studyreview-api-backup', version: 1, data: obfuscateSecret(JSON.stringify({ customApiGroups: groups, selectedModelId })) }, null, 2);
}

export function decodeApiBackup(raw: string): { groups: CustomApiGroup[]; selectedModelId?: string } {
  if (raw.length > 2_000_000) throw new Error('配置文件过大');
  const envelope = record(JSON.parse(raw));
  const data = normalizeStoredSettings(envelope?.format === 'studyreview-api-backup' && typeof envelope.data === 'string' ? deobfuscateSecret(envelope.data) : raw);
  let groups = data.customApiGroups as CustomApiGroup[];
  if (!groups.length && (data.customBaseUrl || (data.customModels as unknown[]).length || data.customModelId)) {
    groups = [{ id: 'migrated', name: '我的 API', baseUrl: String(data.customBaseUrl ?? ''), apiKey: String(data.customApiKey ?? ''), models: (data.customModels as CustomModelConfig[]).length ? data.customModels as CustomModelConfig[] : [{ id: String(data.customModelId) }] }];
  }
  if (!groups.length) throw new Error('文件中没有可恢复的 API 分组');
  return { groups, selectedModelId: typeof data.selectedModelId === 'string' ? data.selectedModelId : undefined };
}

/** Import adds missing data; never replace an existing model/key with an older backup. */
export function mergeApiGroups(current: CustomApiGroup[], incoming: CustomApiGroup[]): CustomApiGroup[] {
  const result = current.slice();
  for (const group of incoming) {
    const index = result.findIndex((item) => item.id === group.id);
    if (index < 0) { result.push(group); continue; }
    const existing = result[index];
    result[index] = { ...group, ...existing, baseUrl: existing.baseUrl || group.baseUrl, apiKey: existing.apiKey || group.apiKey,
      models: [...existing.models, ...group.models.filter((model) => !existing.models.some((item) => item.id === model.id))] };
  }
  return result;
}
