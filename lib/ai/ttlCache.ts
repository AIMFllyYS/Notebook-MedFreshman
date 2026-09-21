/**
 * 进程内 LRU + TTL 结果缓存：搜索/重排这类「相同 query 反复打上游」的侧车用。
 * 命中时把条目挪到 Map 尾部刷新 LRU 位置；超容量驱逐最旧项。
 */
export interface TtlCache<V> {
  get(key: string): V | null;
  set(key: string, value: V): void;
}

export function createTtlCache<V>(opts: { ttlMs: number; maxEntries: number }): TtlCache<V> {
  const store = new Map<string, { value: V; ts: number }>();
  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() - entry.ts > opts.ttlMs) {
        store.delete(key);
        return null;
      }
      store.delete(key);
      store.set(key, entry);
      return entry.value;
    },
    set(key, value) {
      store.set(key, { value, ts: Date.now() });
      if (store.size > opts.maxEntries) {
        const oldest = store.keys().next().value;
        if (oldest !== undefined) store.delete(oldest);
      }
    },
  };
}
