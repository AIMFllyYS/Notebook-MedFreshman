/**
 * 把学生/助教的自然语言问句收成更适合 BM25 / 向量检索的短语。
 * 「什么是核糖体」这种问句若原样送进中文 bigram BM25，会把权重浪费在「什么/是」上。
 */
const LEADING_POLITE = /^(请你?|麻烦你?|帮我|能不能|可以)?/;
const LEADING_VERB =
  /^(讲讲|讲解一下|讲解|解释一下|解释下|解释|介绍一下|介绍下|介绍|说说|谈一谈|描述一下|描述)/;
const LEADING_WHAT = /^(什么是|什么叫|啥是|何为)/;
const TRAILING_WHAT = /(是什么|是啥|指什么|怎么理解|如何理解)$/;
const TRAILING_PARTICLES = /[?？。.!！,，、\s]+$/;

export function normalizeSearchQuery(query: string): string {
  const original = query.trim();
  if (!original) return original;

  let q = original.replace(TRAILING_PARTICLES, "").trim();
  q = q.replace(LEADING_POLITE, "").trim();
  q = q.replace(LEADING_VERB, "").trim();
  q = q.replace(LEADING_WHAT, "").trim();
  q = q.replace(TRAILING_WHAT, "").trim();
  q = q.replace(TRAILING_PARTICLES, "").trim();

  return q || original;
}
