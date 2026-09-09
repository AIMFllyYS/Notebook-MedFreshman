import { visit, SKIP } from "unist-util-visit";
import { CALLOUTS } from "./calloutTypes";

/**
 * 把 remark-directive 解析出的容器/叶子指令，转换为渲染器可识别的自定义元素：
 *   :::definition / theorem / example / insight / pitfall / note / tip  -> <callout kind=...>
 *   :::callout{kind=note|insight|tip|... label=...}                    -> <callout kind=...>（SOP 08 试卷写法）
 *   :::derivation{title=...}                                       -> <derivation>
 *   :::timeline{period=...} / :::event{year=...} / :::concept{term=...} / :::compare{title=...}
 *   :::cause-effect{title=...} / :::keypoint{label=...}              -> 历史学科专用指令
 *   ::video{id=...} / ::interactive{id=...} / ::map{points=...}      -> <mediaembed/historymap>
 *
 * 用法（笔记作者）：
 *   :::theorem{label=全概率公式}
 *   设 $B_1,\dots,B_n$ 为样本空间的一个划分……
 *   :::
 *
 *   ::video{id=ch01-1.4-classical}
 *   ::interactive{id=ch01-1.2-venn}
 */

interface DirectiveNode {
  type: string;
  name: string;
  attributes?: Record<string, string | null | undefined>;
  data?: Record<string, unknown>;
  children?: unknown[];
  position?: {
    start?: { offset?: number };
    end?: { offset?: number };
  };
}

interface Positioned {
  position?: {
    start?: { offset?: number };
    end?: { offset?: number };
  };
}

/**
 * 记忆卡正文写入 hProperties.raw 的上限。
 * hProperties 会进入 hast → React props（笔记 SSR 还会进 RSC payload）。
 * 现网 711 张卡都是短背诵块；超过 8KB 更像误把整节讲义塞进 :::memory，
 * 再序列化一遍会白白撑大 HTML / 水合数据，故超限退回 MemoryCard.extract()。
 */
const MEMORY_RAW_MAX_CHARS = 8 * 1024;

function fileSource(file: unknown): string | undefined {
  if (!file || typeof file !== "object") return undefined;
  const value = (file as { value?: unknown }).value;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function sliceByOffsets(source: string, start: number, end: number): string | undefined {
  if (end < start || start < 0 || end > source.length) return undefined;
  const inner = source.slice(start, end);
  if (inner.length > MEMORY_RAW_MAX_CHARS) return undefined;
  return inner;
}

function extractMemoryRaw(source: string | undefined, node: DirectiveNode): string | undefined {
  if (!source) return undefined;

  const children = Array.isArray(node.children) ? node.children : [];
  if (children.length > 0) {
    const first = children[0] as Positioned;
    const last = children[children.length - 1] as Positioned;
    const start = first.position?.start?.offset;
    const end = last.position?.end?.offset;
    if (typeof start === "number" && typeof end === "number") {
      return sliceByOffsets(source, start, end);
    }
  }

  const start = node.position?.start?.offset;
  const end = node.position?.end?.offset;
  if (typeof start !== "number" || typeof end !== "number") return undefined;
  const block = source.slice(start, end);
  const firstNl = block.indexOf("\n");
  if (firstNl === -1) return "";
  const lastNl = block.lastIndexOf("\n");
  if (lastNl <= firstNl) return "";
  const inner = block.slice(firstNl + 1, lastNl);
  if (inner.length > MEMORY_RAW_MAX_CHARS) return undefined;
  return inner;
}

export default function remarkDirectives() {
  return (tree: unknown, file?: unknown) => {
    const source = fileSource(file);
    visit(
      tree as never,
      (node: DirectiveNode, index: number | undefined, parent: { children: unknown[] } | undefined) => {
      if (
        node.type !== "containerDirective" &&
        node.type !== "leafDirective" &&
        node.type !== "textDirective"
      ) {
        return;
      }
      const name = node.name;
      const attrs = node.attributes ?? {};
      const data = (node.data ??= {});

      // 记忆卡指令需要在 CALLOUTS 之前匹配，因为 memory 也在 CALLOUT_TYPES 中
      // 用于样式元数据，但渲染走独立组件。
      if (node.type === "containerDirective" && name === "memory") {
        data.hName = "memorycard";
        const hProperties: Record<string, string> = {
          kind: "memory",
          label: attrs.label ?? attrs.title ?? "记忆卡",
          mode: attrs.mode ?? "",
        };
        const raw = extractMemoryRaw(source, node);
        if (raw !== undefined) hProperties.raw = raw;
        data.hProperties = hProperties;
        return;
      }
      // SOP 08 试卷录入写法：:::callout{kind=note label="题目"}（kind 指定样式类型）
      if (node.type === "containerDirective" && name === "callout") {
        const kind = attrs.kind && CALLOUTS.has(attrs.kind) ? attrs.kind : "note";
        data.hName = "callout";
        data.hProperties = { kind, label: attrs.label ?? attrs.title ?? "" };
        return;
      }
      if (node.type === "containerDirective" && CALLOUTS.has(name)) {
        data.hName = "callout";
        data.hProperties = { kind: name, label: attrs.label ?? attrs.title ?? "" };
        return;
      }
      if (node.type === "containerDirective" && name === "derivation") {
        data.hName = "derivation";
        data.hProperties = { label: attrs.label ?? attrs.title ?? "推导过程" };
        return;
      }
      if (name === "video" || name === "interactive") {
        data.hName = "mediaembed";
        data.hProperties = { kind: name, eid: attrs.id ?? "" };
        return;
      }
      if (name === "figure") {
        data.hName = "figuremedia";
        data.hProperties = {
          src: attrs.src ?? "",
          alt: attrs.alt ?? "",
          caption: attrs.caption ?? attrs.label ?? "",
        };
        return;
      }
      if (name === "plot") {
        data.hName = "functionplot";
        data.hProperties = {
          fn: attrs.fn ?? "",
          xmin: attrs.xmin ?? "",
          xmax: attrs.xmax ?? "",
          ymin: attrs.ymin ?? "",
          ymax: attrs.ymax ?? "",
          color: attrs.color ?? "",
          label: attrs.label ?? "",
          xlabel: attrs.xlabel ?? "",
          ylabel: attrs.ylabel ?? "",
          width: attrs.width ?? "",
          height: attrs.height ?? "",
          samples: attrs.samples ?? "",
        };
        return;
      }
      if (node.type === "containerDirective" && name === "canvas") {
        data.hName = "svgcanvas";
        data.hProperties = {
          width: attrs.width ?? "",
          height: attrs.height ?? "",
          xmin: attrs.xmin ?? "",
          xmax: attrs.xmax ?? "",
          ymin: attrs.ymin ?? "",
          ymax: attrs.ymax ?? "",
          xlabel: attrs.xlabel ?? "",
          ylabel: attrs.ylabel ?? "",
          grid: attrs.grid ?? "",
          axes: attrs.axes ?? "",
        };
        return;
      }
      // 历史学科专用容器指令
      if (node.type === "containerDirective" && name === "timeline") {
        data.hName = "timeline";
        data.hProperties = { period: attrs.period ?? "" };
        return;
      }
      if (node.type === "containerDirective" && name === "event") {
        data.hName = "eventcard";
        data.hProperties = {
          year: attrs.year ?? "",
          title: attrs.title ?? attrs.label ?? "",
          location: attrs.location ?? "",
          people: attrs.people ?? "",
          result: attrs.result ?? "",
          impact: attrs.impact ?? "",
        };
        return;
      }
      if (node.type === "containerDirective" && name === "concept") {
        data.hName = "conceptcard";
        data.hProperties = { term: attrs.term ?? attrs.title ?? attrs.label ?? "" };
        return;
      }
      if (node.type === "containerDirective" && name === "compare") {
        data.hName = "comparetable";
        data.hProperties = { title: attrs.title ?? attrs.label ?? "" };
        return;
      }
      if (node.type === "containerDirective" && (name === "cause-effect" || name === "causeeffect")) {
        data.hName = "causeeffect";
        data.hProperties = { title: attrs.title ?? attrs.label ?? "" };
        return;
      }
      if (node.type === "containerDirective" && name === "keypoint") {
        data.hName = "keypoint";
        data.hProperties = { label: attrs.label ?? attrs.title ?? "核心要点" };
        return;
      }
      // 历史地图（叶子指令）
      if (name === "map") {
        data.hName = "historymap";
        data.hProperties = {
          title: attrs.title ?? attrs.label ?? "历史地图",
          points: attrs.points ?? "",
          caption: attrs.caption ?? "",
        };
        return;
      }

      // 兜底：未被任何处理器识别的「文本指令」(:name)。本项目不使用文本指令，
      // 而 remark-directive 会把散文里的「词:Word」(如 "Nd:YAG"、比值 "3:X") 误解析成
      // textDirective，未识别就会被 mdast-util-to-hast 静默丢弃 → 吞掉冒号后的文字。
      // 这里把它还原成字面文本 ":name"（保留其内联子节点，如有 [label]），既修复笔记，
      // 也兜底 AI 对话输出。容器/叶子指令为块级、与散文冲突概率低，暂不在此处理。
      if (node.type === "textDirective" && parent && typeof index === "number") {
        const tail = Array.isArray(node.children) ? node.children : [];
        parent.children.splice(index, 1, { type: "text", value: ":" + name }, ...tail);
        return [SKIP, index];
      }
    },
    );
  };
}
