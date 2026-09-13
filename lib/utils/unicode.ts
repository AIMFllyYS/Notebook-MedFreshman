/** Replace only lone UTF-16 surrogates; valid emoji and all other characters stay unchanged. */
export function wellFormedText(text: string): string {
  // Unicode mode matches a valid surrogate pair as one code point, outside this range.
  return text.replace(/[\uD800-\uDFFF]/gu, '\uFFFD');
}

/** Count code points without allocating an array for the entire (potentially large) source. */
export function truncateText(text: string, maxCodePoints: number): string {
  const limit = Number.isFinite(maxCodePoints) ? Math.max(0, Math.floor(maxCodePoints)) : 0;
  let count = 0;
  let end = 0;
  for (const character of text) {
    if (count >= limit) break;
    end += character.length;
    count++;
  }
  return wellFormedText(text.slice(0, end));
}

/** Repair string values in acyclic JSON-like model input, without mutating stored data.
 * Preserve binary media, URLs and other class instances. Unchanged branches retain identity.
 * Do not apply to streaming deltas: a valid surrogate pair can arrive across two chunks.
 */
export function repairTextValues<T>(value: T): T {
  if (typeof value === 'string') return wellFormedText(value) as T;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    const next = value.map((item: unknown) => repairTextValues(item));
    return (next.some((item, index) => item !== value[index]) ? next : value) as T;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return value;
  let changed = false;
  const entries = Object.entries(value).map(([key, item]) => {
    const next = repairTextValues(item);
    if (next !== item) changed = true;
    return [key, next];
  });
  return changed ? Object.fromEntries(entries) as T : value;
}
