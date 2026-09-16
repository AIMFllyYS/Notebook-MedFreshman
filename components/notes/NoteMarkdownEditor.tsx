"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  BookOpen,
  BookmarkCheck,
  Brain,
  Code,
  Columns2,
  Eye,
  Heading,
  Info,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pencil,
  Quote,
  Sigma,
  SquareRadical,
  Strikethrough,
  Table,
} from "lucide-react";
import NoteRenderer from "@/components/notes/NoteRenderer";
import NoteCitationPicker, { type CitationPickerKind } from "@/components/notes/NoteCitationPicker";
import {
  cycleHeading,
  indent,
  insertBlock,
  insertCodeBlock,
  insertContainer,
  insertLink,
  insertTable,
  toggleLinePrefix,
  toggleWrap,
  wrapMath,
  type EditResult,
  type TextSelection,
} from "@/lib/notes/markdownEditing";

/** 视图模式：只写 / 分栏 / 只读预览。 */
type ViewMode = "edit" | "split" | "preview";

const PREVIEW_DEBOUNCE_MS = 180;

export interface NoteMarkdownEditorProps {
  /** 笔记 id，用于在切换笔记时重置本地草稿。 */
  noteId: string;
  value: string;
  onChange: (next: string) => void;
  /** 限定引用选择器的科目范围。 */
  subjectId: string;
}

interface ToolSpec {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  /** 纯变换；undefined 表示这个按钮走自定义 handler。 */
  run?: (sel: TextSelection) => EditResult;
  shortcut?: string;
}

/**
 * 笔记 Markdown 编辑器：左源码右预览。
 *
 * 预览刻意复用 NoteRenderer —— 也就是课程讲义那条唯一渲染管线
 * （sharedRemarkPlugins / sharedRehypePlugins + noteComponents + .prose-notes）。
 * 因此用户在这里写的 $…$ / $$…$$ 公式、mhchem 化学式、:::callout / :::memory 指令、
 * ::noteref / ::cardref 引用，渲染结果与正式讲义逐像素一致，不存在「编辑器里长这样、
 * 讲义里长那样」的第二套语义。
 */
export default function NoteMarkdownEditor({
  noteId,
  value,
  onChange,
  subjectId,
}: NoteMarkdownEditorProps) {
  const [mode, setMode] = useState<ViewMode>("split");
  const [picker, setPicker] = useState<CitationPickerKind | null>(null);
  const [deferred, setDeferred] = useState(value);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // 预览去抖：每次按键都跑一遍 remark+rehype+KaTeX 在长笔记上会让输入发涩。
  useEffect(() => {
    const timer = setTimeout(() => setDeferred(value), PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  // 切换笔记时立刻同步，不要让上一篇的预览残留一帧。
  useEffect(() => {
    setDeferred(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在换笔记时强制同步
  }, [noteId]);

  /** 应用一个纯变换：写回受控值，并在下一帧恢复选区。 */
  const apply = useCallback(
    (transform: (sel: TextSelection) => EditResult) => {
      const area = areaRef.current;
      if (!area) return;
      const next = transform({
        value: area.value,
        start: area.selectionStart,
        end: area.selectionEnd,
      });
      onChange(next.value);
      requestAnimationFrame(() => {
        const el = areaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(next.start, next.end);
      });
    },
    [onChange],
  );

  /** 在光标处插入引用指令行（选择器回调）。 */
  const insertCitation = useCallback(
    (markdown: string) => {
      apply((sel) => insertBlock(sel, markdown));
    },
    [apply],
  );

  const tools = useMemo<ToolSpec[][]>(
    () => [
      [
        { id: "heading", label: "标题级别", icon: Heading, run: cycleHeading },
        { id: "bold", label: "加粗", icon: Bold, run: (s) => toggleWrap(s, "**"), shortcut: "⌘B" },
        { id: "italic", label: "斜体", icon: Italic, run: (s) => toggleWrap(s, "*"), shortcut: "⌘I" },
        { id: "strike", label: "删除线", icon: Strikethrough, run: (s) => toggleWrap(s, "~~") },
        { id: "code", label: "行内代码", icon: Code, run: (s) => toggleWrap(s, "`") },
      ],
      [
        { id: "ul", label: "无序列表", icon: List, run: (s) => toggleLinePrefix(s, "- ") },
        { id: "ol", label: "有序列表", icon: ListOrdered, run: (s) => toggleLinePrefix(s, "ordered") },
        { id: "task", label: "任务列表", icon: ListChecks, run: (s) => toggleLinePrefix(s, "- [ ] ") },
        { id: "quote", label: "引用块", icon: Quote, run: (s) => toggleLinePrefix(s, "> ") },
      ],
      [
        { id: "math", label: "行内公式 $…$", icon: Sigma, run: (s) => wrapMath(s, false) },
        { id: "mathblock", label: "块级公式 $$…$$", icon: SquareRadical, run: (s) => wrapMath(s, true) },
      ],
      [
        { id: "link", label: "链接", icon: LinkIcon, run: insertLink, shortcut: "⌘K" },
        { id: "table", label: "表格", icon: Table, run: insertTable },
        { id: "codeblock", label: "代码块", icon: Code, run: insertCodeBlock },
        { id: "rule", label: "分割线", icon: Minus, run: (s) => insertBlock(s, "---") },
      ],
      [
        {
          id: "callout",
          label: "提示框 :::note",
          icon: Info,
          run: (s) => insertContainer(s, ":::note{label=提示}"),
        },
        {
          id: "memory",
          label: "记忆卡 :::memory",
          icon: Brain,
          run: (s) => insertContainer(s, ":::memory{label=记忆卡}"),
        },
      ],
      [
        { id: "ref-note", label: "引用课程讲义", icon: BookOpen },
        { id: "ref-card", label: "引用复习闪卡", icon: BookmarkCheck },
      ],
    ],
    [],
  );

  function onToolClick(tool: ToolSpec) {
    if (tool.id === "ref-note") return setPicker("note");
    if (tool.id === "ref-card") return setPicker("card");
    if (tool.run) apply(tool.run);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = event.metaKey || event.ctrlKey;
    if (mod && !event.altKey) {
      const key = event.key.toLowerCase();
      if (key === "b") {
        event.preventDefault();
        return apply((s) => toggleWrap(s, "**"));
      }
      if (key === "i") {
        event.preventDefault();
        return apply((s) => toggleWrap(s, "*"));
      }
      if (key === "k") {
        event.preventDefault();
        return apply(insertLink);
      }
    }
    if (event.key === "Tab") {
      event.preventDefault();
      return apply((s) => indent(s, event.shiftKey));
    }
  }

  const showSource = mode !== "preview";
  const showPreview = mode !== "edit";

  return (
    <div className="notes-editor" data-mode={mode}>
      <div className="notes-editor-toolbar" role="toolbar" aria-label="笔记编辑工具">
        {tools.map((group, index) => (
          <div className="notes-editor-tool-group" key={index}>
            {group.map((tool) => (
              <button
                key={tool.id}
                type="button"
                className="notes-editor-tool"
                data-no-drag
                title={tool.shortcut ? `${tool.label}（${tool.shortcut}）` : tool.label}
                aria-label={tool.label}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onToolClick(tool)}
              >
                <tool.icon size={14} />
              </button>
            ))}
          </div>
        ))}

        <div className="notes-editor-tool-group notes-editor-modes">
          {(
            [
              { id: "edit", label: "只写", icon: Pencil },
              { id: "split", label: "分栏", icon: Columns2 },
              { id: "preview", label: "预览", icon: Eye },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              className="notes-editor-tool"
              data-no-drag
              data-active={mode === item.id ? "1" : undefined}
              aria-pressed={mode === item.id}
              title={`${item.label}模式`}
              aria-label={`${item.label}模式`}
              onClick={() => setMode(item.id)}
            >
              <item.icon size={14} />
            </button>
          ))}
        </div>
      </div>

      <div className="notes-editor-panes">
        {showSource ? (
          <textarea
            ref={areaRef}
            className="notes-editor-textarea scroll-y"
            data-no-drag
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            aria-label="笔记 Markdown 源码"
            placeholder={
              "支持完整 Markdown：# 标题、**加粗**、表格、代码块。\n\n公式用 $P(A\\mid B)$ 或独占一段的 $$…$$。\n化学式用 \\ce{H2O}。\n\n:::memory{label=记忆卡}\n- [ ] 点击逐条背诵\n:::\n\n工具栏最右两个按钮可以引用课程讲义和复习闪卡。"
            }
          />
        ) : null}

        {showPreview ? (
          <div className="notes-editor-preview scroll-y" aria-label="笔记预览">
            {deferred.trim() ? (
              <div className="prose-notes">
                <NoteRenderer content={deferred} />
              </div>
            ) : (
              <p className="notes-editor-preview-empty">左侧开始输入，这里会实时渲染公式与指令。</p>
            )}
          </div>
        ) : null}
      </div>

      {picker ? (
        <NoteCitationPicker
          kind={picker}
          subjectId={subjectId}
          onPick={insertCitation}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </div>
  );
}
