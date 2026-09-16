/** 分片扫描：大列表不一次扫完，每片之间把主线程让出去。 */

export const SEARCH_CHUNK_SIZE = 16;

export type YieldFn = () => Promise<void>;

export function yieldToMain(timeout = 32): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => resolve(), { timeout });
      return;
    }
    setTimeout(resolve, 0);
  });
}

export async function scanInChunks<T, R>(
  items: readonly T[],
  visit: (item: T) => R | null | undefined,
  options: {
    chunkSize?: number;
    signal?: AbortSignal;
    yieldFn?: YieldFn;
    onProgress?: (hits: R[]) => void;
  } = {},
): Promise<R[]> {
  const chunkSize = options.chunkSize ?? SEARCH_CHUNK_SIZE;
  const yieldFn = options.yieldFn ?? yieldToMain;
  const hits: R[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    if (options.signal?.aborted) break;
    const slice = items.slice(i, i + chunkSize);
    for (const item of slice) {
      const hit = visit(item);
      if (hit != null) hits.push(hit);
    }
    options.onProgress?.(hits.slice());
    if (i + chunkSize < items.length) await yieldFn();
  }

  return hits;
}
