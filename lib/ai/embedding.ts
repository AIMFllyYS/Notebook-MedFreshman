// SiliconFlow Embedding 客户端：封装 /v1/embeddings 调用，实现 EmbeddingProvider 接口。
import type { EmbeddingProvider } from '@/lib/context/semanticSearch';

const BATCH_SIZE = 32; // SiliconFlow 单次请求最多 32 个 input

interface EmbeddingResponse {
  data: Array<{ embedding: number[]; index: number }>;
  usage?: { prompt_tokens: number };
}

export class SiliconFlowEmbedding implements EmbeddingProvider {
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.AI_BASE_URL || 'https://api.siliconflow.cn/v1';
    this.apiKey = process.env.AI_API_KEY || '';
    this.model = process.env.AI_EMBEDDING_MODEL || 'BAAI/bge-m3';
  }

  get configured(): boolean {
    return !!(this.baseUrl && this.apiKey);
  }

  async embed(text: string): Promise<number[]> {
    const [result] = await this.embedBatch([text]);
    return result;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!texts.length) return [];

    const results: number[][] = new Array(texts.length);

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const resp = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ model: this.model, input: batch }),
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(
          `Embedding API error ${resp.status}: ${errText.slice(0, 200)}`,
        );
      }

      const json: EmbeddingResponse = await resp.json();
      for (const item of json.data) {
        results[i + item.index] = item.embedding;
      }
    }

    return results;
  }
}

// 智谱 Embedding 客户端：当 SiliconFlow 失败时作为容灾降级。
const ZHIPU_BATCH_SIZE = 64; // 智谱单次最多 64 条

export class ZhipuEmbedding implements EmbeddingProvider {
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
    this.apiKey = process.env.ZHIPU_API_KEY || '';
    this.model = process.env.ZHIPU_EMBEDDING_MODEL || 'embedding-3';
  }

  get configured(): boolean {
    return !!(this.baseUrl && this.apiKey);
  }

  async embed(text: string): Promise<number[]> {
    const [result] = await this.embedBatch([text]);
    return result;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!texts.length) return [];

    const results: number[][] = new Array(texts.length);

    for (let i = 0; i < texts.length; i += ZHIPU_BATCH_SIZE) {
      const batch = texts.slice(i, i + ZHIPU_BATCH_SIZE);
      const resp = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ model: this.model, input: batch }),
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(
          `Zhipu Embedding API error ${resp.status}: ${errText.slice(0, 200)}`,
        );
      }

      const json: EmbeddingResponse = await resp.json();
      for (const item of json.data) {
        results[i + item.index] = item.embedding;
      }
    }

    return results;
  }
}

// 容灾包装：先 SiliconFlow，失败再试智谱。
class FailoverEmbedding implements EmbeddingProvider {
  private primary: SiliconFlowEmbedding;
  private fallback: ZhipuEmbedding;

  constructor() {
    this.primary = new SiliconFlowEmbedding();
    this.fallback = new ZhipuEmbedding();
  }

  async embed(text: string): Promise<number[]> {
    const [result] = await this.embedBatch([text]);
    return result;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      return await this.primary.embedBatch(texts);
    } catch (err) {
      // 降级到智谱，仅当智谱已配置时
      if (this.fallback.configured) {
        return await this.fallback.embedBatch(texts);
      }
      throw err;
    }
  }
}

let _instance: FailoverEmbedding | null = null;

export function getEmbeddingClient(): FailoverEmbedding {
  if (!_instance) _instance = new FailoverEmbedding();
  return _instance;
}
