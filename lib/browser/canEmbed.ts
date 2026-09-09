export interface EmbedVerdict {
  embeddable: boolean;
  reason?: string;
}

const embedCache = new Map<string, EmbedVerdict>();

export function getCachedEmbed(url: string): EmbedVerdict | undefined {
  return embedCache.get(url);
}

function setCachedEmbed(url: string, verdict: EmbedVerdict) {
  embedCache.set(url, verdict);
}

export function clearEmbedCache() {
  embedCache.clear();
}

export async function probeCanEmbed(url: string): Promise<EmbedVerdict> {
  const cached = embedCache.get(url);
  if (cached) return cached;
  try {
    const res = await fetch(`/api/can-embed?url=${encodeURIComponent(url)}`);
    const data = (await res.json()) as { embeddable?: boolean; reason?: string };
    const verdict: EmbedVerdict = {
      embeddable: data?.embeddable !== false,
      reason: data?.reason,
    };
    embedCache.set(url, verdict);
    return verdict;
  } catch {
    return { embeddable: true, reason: "probe-failed" };
  }
}
