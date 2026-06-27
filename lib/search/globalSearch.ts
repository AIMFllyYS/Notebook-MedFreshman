import type { ContentItem, ContentTree, SubjectId } from "@/lib/types/content";

export interface GlobalSearchEntry {
  id: string;
  subjectId: SubjectId;
  categoryId: string;
  itemId: string;
  title: string;
  summary: string;
  subjectName: string;
  categoryName: string;
  breadcrumbs: string;
  href: string;
  haystack: string;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function walkItems(
  items: ContentItem[],
  visitor: (item: ContentItem, parents: ContentItem[]) => void,
  parents: ContentItem[] = [],
) {
  for (const item of items) {
    visitor(item, parents);
    if (item.children?.length) walkItems(item.children, visitor, [...parents, item]);
  }
}

export function buildGlobalSearchIndex(tree: ContentTree): GlobalSearchEntry[] {
  const entries: GlobalSearchEntry[] = [];
  for (const subject of tree.subjects) {
    for (const category of subject.categories) {
      walkItems(category.items, (item, parents) => {
        const parentTrail = parents.map((parent) => parent.title).join(" / ");
        const breadcrumbs = [subject.name, category.name, parentTrail].filter(Boolean).join(" / ");
        const href = `/${subject.id}/${category.id}/${item.id}`;
        const haystack = normalize(
          [
            item.id,
            item.title,
            item.summary ?? "",
            subject.name,
            category.name,
            parentTrail,
            href,
          ].join(" "),
        );
        entries.push({
          id: `${subject.id}:${category.id}:${item.id}`,
          subjectId: subject.id,
          categoryId: category.id,
          itemId: item.id,
          title: item.title,
          summary: item.summary ?? "",
          subjectName: subject.name,
          categoryName: category.name,
          breadcrumbs,
          href,
          haystack,
        });
      });
    }
  }
  return entries;
}

function scoreEntry(entry: GlobalSearchEntry, query: string, terms: string[]) {
  let score = 0;
  const title = normalize(entry.title);
  const itemId = normalize(entry.itemId);

  if (title === query) score += 120;
  if (itemId === query) score += 100;
  if (title.includes(query)) score += 70;
  if (itemId.includes(query)) score += 56;
  if (normalize(entry.summary).includes(query)) score += 34;
  if (normalize(entry.breadcrumbs).includes(query)) score += 22;

  for (const term of terms) {
    if (!entry.haystack.includes(term)) return 0;
    if (title.includes(term)) score += 14;
    else if (itemId.includes(term)) score += 11;
    else score += 4;
  }

  return score;
}

export function searchGlobalIndex(index: GlobalSearchEntry[], rawQuery: string, limit = 24) {
  const query = normalize(rawQuery);
  if (!query) return [];
  const terms = query.split(/\s+/).filter(Boolean);

  return index
    .map((entry) => ({ entry, score: scoreEntry(entry, query, terms) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.href.localeCompare(b.entry.href))
    .slice(0, limit)
    .map((hit) => hit.entry);
}
